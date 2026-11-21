"""Loopback-only SSH forwards for the local GEMPA frontend (Windows)."""

import json
from pathlib import Path
import select
import socketserver
import subprocess
import threading
import time

import paramiko


# local port -> existing service port on riset-01
FORWARDS = {43801: 38001, 43803: 38003, 43804: 38004, 43805: 38005}


def load_credential():
    script = r"""
$ErrorActionPreference = 'Stop'
$c = Import-Clixml -LiteralPath (Join-Path $env:USERPROFILE '.ssh\riset-01.credential.xml')
if ($c -isnot [System.Management.Automation.PSCredential]) { throw 'Invalid credential.' }
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
[Console]::Write((@{ username = $c.UserName; password = $c.GetNetworkCredential().Password } | ConvertTo-Json -Compress))
"""
    result = subprocess.run(
        ["powershell.exe", "-NoLogo", "-NoProfile", "-NonInteractive", "-Command", script],
        capture_output=True, timeout=20, creationflags=subprocess.CREATE_NO_WINDOW,
    )
    if result.returncode:
        raise RuntimeError("Cannot load the saved Windows credential.")
    credential = json.loads(result.stdout.decode("utf-8-sig"))
    if credential.get("username") != "bmkg":
        raise RuntimeError("Expected the saved credential for bmkg.")
    return credential


def connect():
    client = paramiko.SSHClient()
    standard = Path.home() / ".ssh" / "known_hosts"
    pinned = Path.home() / ".ssh" / "known_hosts.riset-01"
    if standard.exists():
        client.load_system_host_keys(str(standard))
    if pinned.exists():
        client.load_host_keys(str(pinned))
    # Unknown or changed host keys are rejected before password authentication.
    credential = load_credential()
    try:
        client.connect(
            "152.118.31.54", port=22, username="bmkg", password=credential["password"],
            look_for_keys=False, allow_agent=False, timeout=15, banner_timeout=20, auth_timeout=20,
        )
    except BaseException:
        client.close()
        raise
    finally:
        credential.clear()
    client.get_transport().set_keepalive(20)
    return client


class ForwardServer(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


class ForwardHandler(socketserver.BaseRequestHandler):
    def handle(self):
        client = self.server.ssh_client
        if client is None or not client.get_transport().is_active():
            return
        try:
            with client.get_transport().open_channel(
                "direct-tcpip", ("127.0.0.1", self.server.remote_port),
                self.request.getpeername(), timeout=15,
            ) as channel:
                while True:
                    readable, _, _ = select.select([self.request, channel], [], [], 2)
                    if self.request in readable:
                        data = self.request.recv(65536)
                        if not data:
                            break
                        channel.sendall(data)
                    if channel in readable:
                        data = channel.recv(65536)
                        if not data:
                            break
                        self.request.sendall(data)
        except (OSError, EOFError, paramiko.SSHException):
            # Never log request bodies, authorization headers, or credentials.
            return


def main():
    servers = []
    client = None
    try:
        # Reserve all loopback ports before attempting authentication.
        for local_port, remote_port in FORWARDS.items():
            server = ForwardServer(("127.0.0.1", local_port), ForwardHandler)
            server.remote_port = remote_port
            server.ssh_client = None
            servers.append(server)
        client = connect()
        for server in servers:
            server.ssh_client = client
            threading.Thread(target=server.serve_forever, daemon=True).start()
        print("SSH connected; local API and WebSocket forwards are ready.", flush=True)
        while True:
            time.sleep(2)
            if client.get_transport().is_active():
                continue
            for server in servers:
                server.ssh_client = None
            client.close()
            print("SSH disconnected; reconnecting.", flush=True)
            delay = 5
            while True:
                time.sleep(delay)
                try:
                    client = connect()
                    break
                except (paramiko.AuthenticationException, paramiko.BadHostKeyException):
                    raise
                except (OSError, EOFError, paramiko.SSHException):
                    delay = min(delay * 2, 30)
            for server in servers:
                server.ssh_client = client
            print("SSH reconnected.", flush=True)
    finally:
        # server_close is safe even when serve_forever has not started.
        for server in servers:
            server.server_close()
        if client is not None:
            client.close()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        pass
    except Exception as error:
        print(f"Tunnel stopped ({type(error).__name__}). Check credentials, host key, network, and local ports.", flush=True)
        raise SystemExit(1)
