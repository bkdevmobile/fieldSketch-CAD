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
  $mappingSource = 'android/app/build/outputs/mapping/release/mapping.txt'
  if (-not (Test-Path -LiteralPath $mappingSource) -or (Get-Item -LiteralPath $mappingSource).Length -eq 0) { throw 'Brak mapowania R8 dla tego wydania.' }
  $mappingPath = Join-Path $outputDirectory (([IO.Path]::GetFileNameWithoutExtension($name)) + '-mapping.txt')
  Copy-Item -LiteralPath $mappingSource -Destination $mappingPath -Force
  Add-Type -AssemblyName System.IO.Compression.FileSystem
  $archive = [IO.Compression.ZipFile]::OpenRead($outputPath)
  try {
    $entry = $archive.GetEntry('BUNDLE-METADATA/com.android.tools.build.obfuscation/proguard.map')
    if (-not $entry) { throw 'AAB nie zawiera mapowania R8 dla Google Play.' }
    $mappingStream = $entry.Open()
    $sha256 = [Security.Cryptography.SHA256]::Create()
    try { $embeddedHash = [BitConverter]::ToString($sha256.ComputeHash($mappingStream)).Replace('-', '') }
    finally { $mappingStream.Dispose(); $sha256.Dispose() }
    if ($embeddedHash -ne (Get-FileHash -Algorithm SHA256 -LiteralPath $mappingPath).Hash) { throw 'Mapowanie AAB nie odpowiada plikowi mapping.txt.' }
  } finally { $archive.Dispose() }
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
  Write-Output "R8 mapping (also embedded in AAB): $mappingPath"
  Get-FileHash -Algorithm SHA256 -LiteralPath $mappingPath
} finally { Clear-OutlineGoSigning; Pop-Location }
