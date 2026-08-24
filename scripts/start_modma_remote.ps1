$ErrorActionPreference = 'Stop'

$remoteCommand = 'IFS= read -r payload; printf %s "$payload" | /usr/bin/tmux load-buffer -; unset payload; /usr/bin/tmux paste-buffer -d -t modma-download; /usr/bin/tmux send-keys -t modma-download C-m'

function Send-ModmaPromptValue {
    param([Parameter(Mandatory = $true)][string]$Value)

    $Value | & ssh -o BatchMode=yes seawulf-milan $remoteCommand
    if ($LASTEXITCODE -ne 0) {
        throw "Unable to send the value to the private MODMA tmux session."
    }
}

Write-Host 'MODMA will download directly on SeaWulf. Credentials are not written to disk.' -ForegroundColor Cyan
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
& ssh -o BatchMode=yes seawulf-milan "/usr/bin/tmux capture-pane -p -S -12 -t modma-download"
Write-Host 'You can close this terminal; the remote tmux download continues.' -ForegroundColor Cyan
