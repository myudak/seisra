"""Run a command on riset-01 with the saved local Windows credential."""

import argparse
import sys
import time

from campus_tunnel import connect


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", nargs="?", default="whoami && hostname")
    parser.add_argument("--timeout", type=float, default=120)
    args = parser.parse_args()
    with connect() as client:
        with client.get_transport().open_session(timeout=15) as channel:
            channel.exec_command(args.command)
            channel.shutdown_write()
            deadline = time.monotonic() + args.timeout
            while True:
                while channel.recv_ready():
                    sys.stdout.buffer.write(channel.recv(65536))
                    sys.stdout.buffer.flush()
                while channel.recv_stderr_ready():
                    sys.stderr.buffer.write(channel.recv_stderr(65536))
                    sys.stderr.buffer.flush()
                if channel.exit_status_ready() and not channel.recv_ready() and not channel.recv_stderr_ready():
                    return channel.recv_exit_status()
                if time.monotonic() > deadline:
                    raise TimeoutError("Remote command exceeded its timeout.")
                time.sleep(0.03)


if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        sys.exit(130)
    except Exception as error:
        # Authentication details and raw exception messages must not reach logs.
        print(f"SSH command failed ({type(error).__name__}).", file=sys.stderr)
        sys.exit(1)
