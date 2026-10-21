# Dot-source inside a try/finally; call Clear-OutlineGoSigning in finally.
function Initialize-OutlineGoSigning {
  $privateDirectory = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../../_private'))
  $credentials = Get-Content -Raw -LiteralPath (Join-Path $privateDirectory 'release-signing.json') | ConvertFrom-Json
  if ($credentials.storeType -ne 'PKCS12' -or [IO.Path]::GetFileName($credentials.storeFile) -ne $credentials.storeFile) { throw 'Nieprawidlowa konfiguracja podpisu.' }
  $keyPath = Join-Path $privateDirectory $credentials.storeFile
  if (-not (Test-Path -LiteralPath $keyPath) -or -not $credentials.storePassword -or -not $credentials.keyPassword -or -not $credentials.keyAlias) { throw 'Brak klucza lub danych podpisu.' }
  $env:OUTLINEGO_STORE_FILE = $keyPath
  $env:OUTLINEGO_STORE_PASSWORD = $credentials.storePassword
  $env:OUTLINEGO_KEY_ALIAS = $credentials.keyAlias
  $env:OUTLINEGO_KEY_PASSWORD = $credentials.keyPassword
}
function Clear-OutlineGoSigning {
  'OUTLINEGO_STORE_FILE','OUTLINEGO_STORE_PASSWORD','OUTLINEGO_KEY_ALIAS','OUTLINEGO_KEY_PASSWORD' | ForEach-Object { Remove-Item -LiteralPath "Env:\$_" -ErrorAction SilentlyContinue }
}
