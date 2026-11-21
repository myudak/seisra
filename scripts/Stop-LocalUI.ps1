$ErrorActionPreference = 'Stop'
$stateFile = Join-Path (Split-Path -Parent $PSScriptRoot) '.local-dev\processes.json'
if (-not (Test-Path -LiteralPath $stateFile)) {
    Write-Output 'No local UI session is recorded.'
    return
}
$state = Get-Content -LiteralPath $stateFile -Raw | ConvertFrom-Json
foreach ($record in $state.processes) {
    $process = Get-Process -Id $record.id -ErrorAction SilentlyContinue
    if ($null -eq $process) { continue }
    # Avoid stopping an unrelated process after Windows has reused an old PID.
    if ($process.Path -eq $record.path -and
        $process.StartTime.ToUniversalTime().ToString('o') -eq $record.startTime) {
        # Include the child python.exe used by Windows virtualenv launchers.
        & taskkill.exe /PID $process.Id /T /F | Out-Null
    } else {
        Write-Warning "Process $($record.id) no longer matches this session; left running."
    }
}
Remove-Item -LiteralPath $stateFile
Write-Output 'Local frontend and SSH tunnel stopped.'
