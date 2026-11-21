param([switch]$OpenBrowser)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$stateDir = Join-Path $projectRoot '.local-dev'
$frontend = Join-Path $projectRoot 'web'
$python = Join-Path $stateDir 'venv\Scripts\python.exe'
$stateFile = Join-Path $stateDir 'processes.json'
$started = @()

function Test-LocalPort($port) {
    $socket = [System.Net.Sockets.TcpClient]::new()
    try {
        $connection = $socket.ConnectAsync('127.0.0.1', $port)
        return ($connection.Wait(1000) -and $socket.Connected)
    } catch { return $false }
    finally { $socket.Dispose() }
}

function Start-DevProcess($executable, $arguments, $label, $workingDirectory = $projectRoot) {
    $process = Start-Process -FilePath $executable -ArgumentList $arguments `
        -WorkingDirectory $workingDirectory -WindowStyle Hidden -PassThru `
        -RedirectStandardOutput (Join-Path $stateDir "$label.out.log") `
        -RedirectStandardError (Join-Path $stateDir "$label.err.log")
    return $process
}

function Wait-LocalPort($port, $process, $seconds) {
    $deadline = [DateTime]::UtcNow.AddSeconds($seconds)
    while ([DateTime]::UtcNow -lt $deadline) {
        $process.Refresh()
        if ($process.HasExited) { throw "A local development process exited. See $stateDir\*.log" }
        # A Windows venv launcher can delegate to a child python.exe which owns
        # the listener. Probe sockets directly, including on virtual networks.
        if (Test-LocalPort $port) { return }
        Start-Sleep -Milliseconds 500
    }
    throw "Timed out waiting for local port $port. See $stateDir\*.log"
}

New-Item -ItemType Directory -Path $stateDir -Force | Out-Null
if (Test-Path -LiteralPath $stateFile) {
    throw 'A previous session is recorded. Run scripts\Stop-LocalUI.ps1 before restarting.'
}
if (-not (Test-Path -LiteralPath (Join-Path $env:USERPROFILE '.ssh\riset-01.credential.xml'))) {
    throw 'Save the encrypted riset-01 credential first; see LOCAL_DEVELOPMENT.md.'
}
foreach ($port in @(5173,43801,43803,43804,43805)) {
    if (Test-LocalPort $port) {
        throw "Local port $port is already occupied. No development processes have been started."
    }
}
if (-not (Test-Path -LiteralPath $python)) {
    python -m venv (Join-Path $stateDir 'venv')
    if ($LASTEXITCODE -ne 0) { throw 'Could not create the local Python environment.' }
}
& $python -m pip install --disable-pip-version-check --quiet -r (Join-Path $PSScriptRoot 'local\requirements.txt')
if ($LASTEXITCODE -ne 0) { throw 'Could not install the SSH forwarding dependency.' }
if (-not (Test-Path -LiteralPath (Join-Path $frontend 'node_modules\vite\bin\vite.js'))) {
    Push-Location $frontend
    try {
        $env:HUSKY = '0'
        npm.cmd ci --no-audit --no-fund
        if ($LASTEXITCODE -ne 0) { throw 'Frontend dependency installation failed.' }
    } finally { Pop-Location }
}
$localEnv = Join-Path $frontend '.env.campus.local'
if (-not (Test-Path -LiteralPath $localEnv)) {
    Copy-Item -LiteralPath (Join-Path $frontend '.env.campus.example') -Destination $localEnv
}

try {
    $tunnel = Start-DevProcess $python @('-u', ('"{0}"' -f (Join-Path $PSScriptRoot 'local\campus_tunnel.py'))) 'tunnel'
    $started += $tunnel
    Wait-LocalPort 43803 $tunnel 45
    $deadline = [DateTime]::UtcNow.AddSeconds(45)
    while (-not (Select-String -LiteralPath (Join-Path $stateDir 'tunnel.out.log') -SimpleMatch 'forwards are ready.' -Quiet)) {
        $tunnel.Refresh()
        if ($tunnel.HasExited -or [DateTime]::UtcNow -gt $deadline) {
            throw "SSH authentication did not complete. See $stateDir\tunnel.*.log"
        }
        Start-Sleep -Milliseconds 500
    }
    $vite = Join-Path $frontend 'node_modules\vite\bin\vite.js'
    $node = (Get-Command node.exe -ErrorAction Stop).Source
    $ui = Start-DevProcess $node @(('"{0}"' -f $vite), '--mode', 'campus') 'frontend' $frontend
    $started += $ui
    Wait-LocalPort 5173 $ui 45
    $processRecords = @($started | ForEach-Object {
        @{ id = $_.Id; startTime = $_.StartTime.ToUniversalTime().ToString('o'); path = $_.Path }
    })
    @{ processes = $processRecords; url = 'http://127.0.0.1:5173' } |
        ConvertTo-Json -Depth 4 | Set-Content -LiteralPath $stateFile -Encoding UTF8
    Write-Output 'Frontend ready: http://127.0.0.1:5173'
    Write-Output 'API/WebSocket: existing campus backend via SSH. Login with your application account.'
    Write-Output 'Stop: .\scripts\Stop-LocalUI.ps1'
    if ($OpenBrowser) { Start-Process 'http://127.0.0.1:5173' }
} catch {
    foreach ($process in $started) {
        $process.Refresh()
        if (-not $process.HasExited) {
            & taskkill.exe /PID $process.Id /T /F | Out-Null
        }
    }
    throw
}
