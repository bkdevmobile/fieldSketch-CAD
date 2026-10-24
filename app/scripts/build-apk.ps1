param([string]$Architectures = 'arm64-v8a,x86_64')
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
  if (-not (Test-Path -LiteralPath $env:ANDROID_HOME)) { throw 'Ustaw ANDROID_HOME na katalog Android SDK.' }
  $nodePath = (Get-Command node -ErrorAction Stop).Source
  & $nodePath scripts/generate-brand-assets.cjs
  if ($LASTEXITCODE -ne 0) { throw 'Generowanie zasobów marki nie powiodło się.' }
  if (-not (Test-Path -LiteralPath 'node_modules/expo/bin/cli')) { throw 'Najpierw uruchom npm ci w app.' }
  $env:NODE_ENV = 'production'
  $ErrorActionPreference = 'Continue'
  & $nodePath node_modules/expo/bin/cli prebuild --platform android --no-install --template expo-template-bare-minimum@56.0.37
  $nativeExitCode = $LASTEXITCODE
  $ErrorActionPreference = 'Stop'
  if ($nativeExitCode -ne 0) { throw 'Generowanie projektu Android nie powiodło się.' }
  Push-Location android
  try {
    $ErrorActionPreference = 'Continue'
    & ./gradlew.bat :fieldsketch-orientation:testReleaseUnitTest :outlinego-billing:testReleaseUnitTest :app:assembleRelease "-PreactNativeArchitectures=$Architectures" '-Dorg.gradle.jvmargs=-Xmx3072m -XX:MaxMetaspaceSize=1024m' --console=plain --max-workers=2 --no-daemon
    $nativeExitCode = $LASTEXITCODE
    $ErrorActionPreference = 'Stop'
    if ($nativeExitCode -ne 0) { throw 'Kompilacja APK nie powiodła się.' }
  } finally { Pop-Location }
  $outputDirectory = Join-Path $repoDirectory 'artifacts'
  New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null
  $outputPath = Join-Path $outputDirectory "outlineGo-$appVersion.apk"
  Copy-Item -LiteralPath 'android/app/build/outputs/apk/release/app-release.apk' -Destination $outputPath -Force
  $mappingSource = 'android/app/build/outputs/mapping/release/mapping.txt'
  if (-not (Test-Path -LiteralPath $mappingSource) -or (Get-Item -LiteralPath $mappingSource).Length -eq 0) { throw 'Brak mapowania R8 dla tego wydania.' }
  $mappingPath = Join-Path $outputDirectory "outlineGo-$appVersion-apk-mapping.txt"
  $bundleMappingPath = Join-Path $outputDirectory "outlineGo-$appVersion-mapping.txt"
  if ((Test-Path -LiteralPath $bundleMappingPath) -and
      (Get-FileHash -Algorithm SHA256 -LiteralPath $mappingSource).Hash -eq (Get-FileHash -Algorithm SHA256 -LiteralPath $bundleMappingPath).Hash) {
    $mappingPath = $bundleMappingPath
  } else {
    Copy-Item -LiteralPath $mappingSource -Destination $mappingPath -Force
  }
  Get-FileHash -Algorithm SHA256 -LiteralPath $outputPath
  Write-Output "APK: $outputPath"
  Write-Output "R8 mapping: $mappingPath"
} finally { Clear-OutlineGoSigning; Pop-Location }
