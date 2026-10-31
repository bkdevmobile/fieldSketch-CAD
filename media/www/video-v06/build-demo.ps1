$ErrorActionPreference = 'Stop'
$v06Root = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../../..'))
$v06Source = Join-Path $v06Root 'app/src/infrastructure/native.ts'
$v06Original = [IO.File]::ReadAllBytes($v06Source)
$v06OriginalHash = (Get-FileHash -LiteralPath $v06Source -Algorithm SHA256).Hash
[IO.File]::WriteAllBytes((Join-Path $v06Root 'artifacts/v06-native-original.ts'), $v06Original)
. (Join-Path $v06Root 'app/scripts/release-environment.ps1')
try {
  Initialize-OutlineGoSigning
  $env:ANDROID_HOME = Join-Path $env:LOCALAPPDATA 'Android/Sdk'
  if (-not $env:JAVA_HOME) { $env:JAVA_HOME = 'C:\Program Files\Android\Android Studio\jbr' }
  $env:NODE_ENV = 'production'
  $env:SENTRY_DISABLE_AUTO_UPLOAD = 'true'
  $v06Text = [Text.Encoding]::UTF8.GetString($v06Original)
  if (-not $v06Text.Contains('return module;')) { throw 'Unexpected native adapter source.' }
  $v06Text = $v06Text.Replace('return module;', 'return demoSensors;')
  $v06Adapter = [IO.File]::ReadAllText((Join-Path $v06Root 'media/www/video-v06/demo-sensors.ts.txt'))
  [IO.File]::WriteAllText($v06Source, $v06Text + "`n" + $v06Adapter, (New-Object Text.UTF8Encoding($false)))
  Push-Location (Join-Path $v06Root 'app/android')
  try {
    $ErrorActionPreference = 'Continue'
    & ./gradlew.bat :app:assembleRelease '-PreactNativeArchitectures=x86_64' '-Pandroid.enableMinifyInReleaseBuilds=false' '-Pandroid.enableShrinkResourcesInReleaseBuilds=false' '-Dorg.gradle.jvmargs=-Xmx3072m -XX:MaxMetaspaceSize=1024m' --console=plain --max-workers=2 --no-daemon *> (Join-Path $v06Root 'artifacts/v06-test-build.log')
    $v06Code = $LASTEXITCODE
    $ErrorActionPreference = 'Stop'
    if ($v06Code -ne 0) { throw 'Temporary sensor APK build failed; inspect build log.' }
    Copy-Item -LiteralPath 'app/build/outputs/apk/release/app-release.apk' -Destination (Join-Path $v06Root 'artifacts/v06-sensors-test.apk') -Force
  } finally { Pop-Location }
} finally {
  [IO.File]::WriteAllBytes($v06Source, $v06Original)
  Clear-OutlineGoSigning
  if ((Get-FileHash -LiteralPath $v06Source -Algorithm SHA256).Hash -ne $v06OriginalHash) { throw 'Source restoration failed.' }
  Write-Output 'Original native.ts restored byte for byte.'
}
