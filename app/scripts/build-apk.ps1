param([string]$Architectures = 'arm64-v8a,x86_64')
$ErrorActionPreference = 'Stop'
$appDirectory = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$repoDirectory = [IO.Path]::GetFullPath((Join-Path $appDirectory '..'))
Push-Location $appDirectory
try {
  if (-not $env:ANDROID_HOME) { $env:ANDROID_HOME = Join-Path $env:LOCALAPPDATA 'Android/Sdk' }
  if (-not (Test-Path -LiteralPath $env:ANDROID_HOME)) { throw 'Ustaw ANDROID_HOME na katalog Android SDK.' }
  $nodePath = (Get-Command node -ErrorAction Stop).Source
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
    & ./gradlew.bat :fieldsketch-orientation:testReleaseUnitTest :app:assembleRelease "-PreactNativeArchitectures=$Architectures" '-Dorg.gradle.jvmargs=-Xmx3072m -XX:MaxMetaspaceSize=1024m' --console=plain --max-workers=2
    $nativeExitCode = $LASTEXITCODE
    $ErrorActionPreference = 'Stop'
    if ($nativeExitCode -ne 0) { throw 'Kompilacja APK nie powiodła się.' }
  } finally { Pop-Location }
  $outputDirectory = Join-Path $repoDirectory 'artifacts'
  New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null
  $outputPath = Join-Path $outputDirectory 'FieldSketch-CAD-0.1.0.apk'
  Copy-Item -LiteralPath 'android/app/build/outputs/apk/release/app-release.apk' -Destination $outputPath -Force
  Get-FileHash -Algorithm SHA256 -LiteralPath $outputPath
  Write-Output "APK: $outputPath"
} finally { Pop-Location }
