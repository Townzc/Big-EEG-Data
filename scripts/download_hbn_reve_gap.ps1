[CmdletBinding()]
param(
    [Parameter()]
    [string]$OutputRoot = (Join-Path $PSScriptRoot '..\downloads\reve_hbn_gap'),

    [Parameter()]
    [ValidateSet('ds005506', 'ds005507', 'ds005508', 'ds005509', 'ds005510', 'ds005511', 'ds005512', 'ds005514')]
    [string[]]$DatasetIds = @(
        'ds005506',
        'ds005507',
        'ds005508',
        'ds005509',
        'ds005510',
        'ds005511',
        'ds005512',
        'ds005514'
    ),

    [Parameter()]
    [switch]$MetadataOnly,

    [Parameter()]
    [switch]$PlanOnly
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$resolvedOutputRoot = [System.IO.Path]::GetFullPath($OutputRoot)

if ($PlanOnly) {
    $DatasetIds | ForEach-Object {
        [pscustomobject]@{
            Dataset = $_
            Destination = Join-Path $resolvedOutputRoot $_
            MetadataOnly = [bool]$MetadataOnly
        }
    }
    return
}

$openNeuroCommand = Get-Command openneuro -ErrorAction SilentlyContinue
if (-not $openNeuroCommand) {
    throw 'OpenNeuro CLI not found. Install it with: deno install -A --global jsr:@openneuro/cli -n openneuro'
}

if (-not $MetadataOnly) {
    $dataLadCommand = Get-Command datalad -ErrorAction SilentlyContinue
    if (-not $dataLadCommand) {
        throw 'DataLad not found. Install DataLad and git-annex, or rerun with -MetadataOnly.'
    }
}

New-Item -ItemType Directory -Path $resolvedOutputRoot -Force | Out-Null

foreach ($datasetId in $DatasetIds) {
    $destination = Join-Path $resolvedOutputRoot $datasetId

    if (Test-Path -LiteralPath $destination) {
        $gitDirectory = Join-Path $destination '.git'
        if (-not (Test-Path -LiteralPath $gitDirectory)) {
            throw "Refusing to use existing non-DataLad directory: $destination"
        }
        Write-Host "Existing DataLad dataset found: $destination"
    }
    else {
        Write-Host "Downloading OpenNeuro metadata for $datasetId"
        & $openNeuroCommand.Source download $datasetId $destination
        if ($LASTEXITCODE -ne 0) {
            throw "OpenNeuro download failed for $datasetId with exit code $LASTEXITCODE"
        }
    }

    if (-not $MetadataOnly) {
        Write-Host "Retrieving annexed files for $datasetId"
        Push-Location -LiteralPath $destination
        try {
            & $dataLadCommand.Source get -r .
            if ($LASTEXITCODE -ne 0) {
                throw "DataLad get failed for $datasetId with exit code $LASTEXITCODE"
            }
        }
        finally {
            Pop-Location
        }
    }
}

Write-Host "Completed requested datasets under: $resolvedOutputRoot"
