param(
  [Parameter(Mandatory = $true)]
  [string]$Group,

  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]]$ComposeArgs
)

$validGroups = @('core', 'product-flow', 'cart-flow', 'checkout-flow', 'full-stack')

if ($validGroups -notcontains $Group) {
  Write-Error "Unknown startup group '$Group'. Valid groups: $($validGroups -join ', ')"
  exit 1
}

if (-not $ComposeArgs -or $ComposeArgs.Count -eq 0) {
  $ComposeArgs = @('up', '--build')
}

$repoRoot = Split-Path -Parent $PSScriptRoot

Push-Location $repoRoot
try {
  $env:COMPOSE_PROFILES = $Group
  & docker compose @ComposeArgs
  exit $LASTEXITCODE
}
finally {
  Remove-Item Env:COMPOSE_PROFILES -ErrorAction SilentlyContinue
  Pop-Location
}
