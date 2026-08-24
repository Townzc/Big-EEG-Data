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
$sshArgs = @('-i', $identityFile, '-o', 'BatchMode=yes', $remoteHost)
$remoteStartCommand = @'
/usr/bin/tmux kill-session -t modma-download 2>/dev/null || true
/usr/bin/tmux new-session -d -s modma-download "export PYTHONPATH=/gpfs/projects/ChenyuYouGroup/EEG-dataset-collection/tools/modma-download/lib/python3.9/site-packages; exec /usr/bin/python3 /gpfs/projects/ChenyuYouGroup/EEG-dataset-collection/scripts/current/download_modma_authenticated.py"
sleep 1
'@
$remotePasteCommand = 'IFS= read -r payload; printf %s "$payload" | /usr/bin/tmux load-buffer -; unset payload; /usr/bin/tmux paste-buffer -d -t modma-download; /usr/bin/tmux send-keys -t modma-download C-m'

function Send-ModmaPromptValue {
    param([Parameter(Mandatory = $true)][string]$Value)

    $Value | & $sshExe @sshArgs $remotePasteCommand
    if ($LASTEXITCODE -ne 0) {
        throw "Unable to send the value to the private MODMA tmux session."
    }
}

Write-Host 'MODMA will download directly on SeaWulf. Credentials are not written to disk.' -ForegroundColor Cyan
& $sshExe @sshArgs $remoteStartCommand
if ($LASTEXITCODE -ne 0) {
    throw 'Unable to start the private MODMA download session on the pinned login node.'
}
$username = Read-Host 'MODMA account/email'
if ([string]::IsNullOrWhiteSpace($username)) {
    throw 'MODMA account/email is required.'
}
Send-ModmaPromptValue -Value $username

$securePassword = Read-Host 'MODMA password' -AsSecureString
$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
try {
    $plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
    if ([string]::IsNullOrEmpty($plainPassword)) {
        throw 'MODMA password is required.'
    }
    Send-ModmaPromptValue -Value $plainPassword
    $plainPassword = $null
}
finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
}

Start-Sleep -Seconds 2
Write-Host 'Authentication values sent. Current remote status:' -ForegroundColor Green
& $sshExe @sshArgs "/usr/bin/tmux capture-pane -p -S -12 -t modma-download"
Write-Host 'You can close this terminal; the remote tmux download continues.' -ForegroundColor Cyan
