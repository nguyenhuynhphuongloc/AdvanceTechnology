param(
  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]]$ComposeArgs
)

if (-not $ComposeArgs -or $ComposeArgs.Count -eq 0) {
  $ComposeArgs = @('up', '-d', '--build')
}

$repoRoot = Split-Path -Parent $PSScriptRoot

Push-Location $repoRoot
try {
  & docker compose @ComposeArgs
  exit $LASTEXITCODE
}
finally {
  Pop-Location
}
