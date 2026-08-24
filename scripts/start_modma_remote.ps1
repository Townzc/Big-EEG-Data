$ErrorActionPreference = 'Stop'

$remoteHost = 'seawulf-milan2'
$sshExe = 'C:\Windows\System32\OpenSSH\ssh.exe'
if (-not (Test-Path -LiteralPath $sshExe)) {
    throw "Windows OpenSSH client not found: $sshExe"
}
$identityFile = Join-Path $env:USERPROFILE '.ssh\codex_seawulf_duration_20260731'
if (-not (Test-Path -LiteralPath $identityFile)) {
    throw "SeaWulf SSH identity file not found: $identityFile"
}
# Use one SSH connection from authentication through download. SeaWulf cleans
# up detached processes, isolates tmux between login sessions, and rejects PTY
# allocation, so credentials are collected locally and supplied over this
# connection's standard input. They are never included in process arguments.
$sshArgs = @('-i', $identityFile, '-o', 'BatchMode=yes', $remoteHost)
$remoteCommand = @'
MODMA_SITEPACKAGES=/gpfs/projects/ChenyuYouGroup/EEG-dataset-collection/tools/modma-download/lib/python3.9/site-packages
PYTHONPATH="$MODMA_SITEPACKAGES" /usr/bin/python3 -c 'import requests' || exit 21
exec /usr/bin/env PYTHONPATH="$MODMA_SITEPACKAGES" /usr/bin/python3 /gpfs/projects/ChenyuYouGroup/EEG-dataset-collection/scripts/current/download_modma_authenticated.py
'@

Write-Host 'MODMA will download directly on SeaWulf.' -ForegroundColor Cyan
Write-Host 'Credentials are collected locally with hidden password input and are not written to disk.' -ForegroundColor Cyan
Write-Host 'Keep this PowerShell window open until all three downloads finish. If the VPN or SSH connection drops, run this script again to resume the .part files.' -ForegroundColor Yellow

$username = Read-Host 'MODMA account/email'
if ([string]::IsNullOrWhiteSpace($username)) {
    throw 'MODMA account/email is required.'
}
$securePassword = Read-Host 'MODMA password' -AsSecureString

$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
try {
    $plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
    if ([string]::IsNullOrEmpty($plainPassword)) {
        throw 'MODMA password is required.'
    }

    # The newline-delimited payload goes only to SSH standard input. The remote
    # downloader consumes it immediately before making the authenticated request.
    $credentialPayload = $username.Trim() + "`n" + $plainPassword + "`n"
    $credentialPayload | & $sshExe @sshArgs $remoteCommand
    $remoteExitCode = $LASTEXITCODE
}
finally {
    $credentialPayload = $null
    $plainPassword = $null
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
}

if ($remoteExitCode -ne 0) {
    throw "MODMA downloader exited with code $remoteExitCode. Any partial .part files were retained; rerun this script to resume."
}

Write-Host 'All requested MODMA downloads completed and passed their checks.' -ForegroundColor Green
