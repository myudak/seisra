param(
    [Parameter(Position = 0)]
    [string]$Command = 'whoami && hostname',
    [ValidateRange(1, 86400)]
    [int]$TimeoutSeconds = 120
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$python = Join-Path $projectRoot '.local-dev\venv\Scripts\python.exe'
if (-not (Test-Path -LiteralPath $python)) {
    python -m venv (Join-Path $projectRoot '.local-dev\venv')
    if ($LASTEXITCODE -ne 0) { throw 'Could not create the local Python environment.' }
    & $python -m pip install --disable-pip-version-check --quiet -r (Join-Path $PSScriptRoot 'local\requirements.txt')
    if ($LASTEXITCODE -ne 0) { throw 'Could not install the SSH dependency.' }
}
& $python (Join-Path $PSScriptRoot 'local\ssh_command.py') '--timeout' $TimeoutSeconds '--' $Command
exit $LASTEXITCODE
