param([switch]$AllowUnconfiguredBilling)
$ErrorActionPreference = 'Stop'
$appDirectory = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$repoDirectory = [IO.Path]::GetFullPath((Join-Path $appDirectory '..'))
Push-Location $appDirectory
try {
  $appVersion = & node -p "require('./app.config.js').version"
  if ($LASTEXITCODE -ne 0 -or -not $appVersion) { throw 'Nie odczytano wersji aplikacji.' }
  . (Join-Path $PSScriptRoot 'release-environment.ps1')
  Initialize-OutlineGoSigning
  if (-not $env:ANDROID_HOME) { $env:ANDROID_HOME = Join-Path $env:LOCALAPPDATA 'Android/Sdk' }
  $licenseKey = Join-Path $repoDirectory '_private/google-play-public-key.txt'
  if (-not $AllowUnconfiguredBilling -and (-not (Test-Path -LiteralPath $licenseKey) -or -not (Get-Content -Raw -LiteralPath $licenseKey).Trim())) {
    throw 'Brak publicznego klucza Google Play. Pierwszy AAB do konfiguracji Console: -AllowUnconfiguredBilling.'
  }
  $env:NODE_ENV = 'production'
  & node scripts/generate-brand-assets.cjs
  if ($LASTEXITCODE -ne 0) { throw 'Generowanie zasobow nie powiodlo sie.' }
  & node node_modules/expo/bin/cli prebuild --platform android --no-install --template expo-template-bare-minimum@56.0.37
  if ($LASTEXITCODE -ne 0) { throw 'Expo prebuild failed.' }
  Push-Location android
  try {
    & ./gradlew.bat :outlinego-billing:testReleaseUnitTest :fieldsketch-orientation:testReleaseUnitTest :app:bundleRelease '-PreactNativeArchitectures=arm64-v8a,x86_64' '-Dorg.gradle.jvmargs=-Xmx3072m -XX:MaxMetaspaceSize=1024m' --console=plain --max-workers=2 --no-daemon
    if ($LASTEXITCODE -ne 0) { throw 'Budowanie AAB nie powiodlo sie.' }
  } finally { Pop-Location }
  $outputDirectory = Join-Path $repoDirectory 'artifacts'
  New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null
  $name = if ($AllowUnconfiguredBilling) { "outlineGo-$appVersion-bootstrap.aab" } else { "outlineGo-$appVersion.aab" }
  $outputPath = Join-Path $outputDirectory $name
  Copy-Item -LiteralPath 'android/app/build/outputs/bundle/release/app-release.aab' -Destination $outputPath -Force
  & jarsigner -verify $outputPath
  if ($LASTEXITCODE -ne 0) { throw 'Weryfikacja podpisu AAB nie powiodla sie.' }
  $expectedCertificate = & keytool -list -v -keystore $env:OUTLINEGO_STORE_FILE -storetype PKCS12 -alias $env:OUTLINEGO_KEY_ALIAS -storepass:env OUTLINEGO_STORE_PASSWORD 2>&1
  if ($LASTEXITCODE -ne 0) { throw 'Nie odczytano certyfikatu klucza przesylania.' }
  $actualCertificate = & keytool -printcert -jarfile $outputPath 2>&1
  if ($LASTEXITCODE -ne 0) { throw 'Nie odczytano certyfikatu AAB.' }
  $expectedFingerprint = [regex]::Match(($expectedCertificate -join "`n"), 'SHA256:\s*([A-Fa-f0-9:]+)').Groups[1].Value
  $actualFingerprint = [regex]::Match(($actualCertificate -join "`n"), 'SHA256:\s*([A-Fa-f0-9:]+)').Groups[1].Value
  if (-not $expectedFingerprint -or $actualFingerprint -ne $expectedFingerprint) { throw 'Certyfikat AAB nie odpowiada kluczowi przesylania.' }
  Write-Output "Upload certificate SHA256: $actualFingerprint"
  Get-FileHash -Algorithm SHA256 -LiteralPath $outputPath
  Write-Output "AAB: $outputPath"
} finally { Clear-OutlineGoSigning; Pop-Location }
