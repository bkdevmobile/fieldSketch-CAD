# Run only against the dedicated, disposable screenshot emulator.
param([ValidateSet('all','pl','en')][string]$Language='all')
$ErrorActionPreference='Stop'
. artifacts/store-screenshot-helper.ps1
foreach($language in $(if($Language -eq 'all'){@('pl','en')}else{@($Language)})) {
  $labels=if($language -eq 'pl'){@{
    home='Twoje szkice';dimensions='Wymiary i punkty';cancel='Anuluj';summary='Podsumowanie';note='Notatka do szkicu';share='Udostępnij PNG'
  }}else{@{
    home='Your sketches';dimensions='Dimensions and points';cancel='Cancel';summary='Summary';note='Sketch note';share='Share PNG'
  }}
  Load-StoreLanguage $language
  Wait-StoreUi $labels.home
  Open-StorePage 'dimensions?id=store-garden'
  Wait-StoreUi $labels.dimensions
  Tap-StoreUi '8'
  & $storeAdb -s $storeSerial shell input keyevent 123
  & $storeAdb -s $storeSerial shell input keyevent 67
  & $storeAdb -s $storeSerial shell input text 8.2
  & $storeAdb -s $storeSerial shell input keyevent 4
  Read-StoreUi | Out-Null
  Capture-StoreScreen "media/www/stage1-completion/screenshots/$language/14-edit-length.png"
  Tap-StoreUi $labels.cancel
  Open-StorePage 'outline?id=store-garden'
  Wait-StoreUi $labels.summary
  Read-StoreUi | Out-Null
  & $storeAdb -s $storeSerial shell input swipe 530 1460 530 600 450
  Read-StoreUi | Out-Null
  Tap-StoreUi $labels.note
  Read-StoreUi | Out-Null
  Tap-StoreUi $labels.note -Last
  Read-StoreUi | Out-Null
  & $storeAdb -s $storeSerial shell input keyevent 4
  Read-StoreUi | Out-Null
  & $storeAdb -s $storeSerial shell input swipe 530 650 530 900 450
  Read-StoreUi | Out-Null
  Capture-StoreScreen "media/www/stage1-completion/screenshots/$language/15-edit-note.png"
  Open-StorePage 'export?id=store-garden'
  Wait-StoreUi $labels.share
  Tap-StoreUi $labels.share
  Read-StoreUi | Out-Null
  & $storeAdb -s $storeSerial pull "/data/user/0/$storePackage/cache/outlinego-store-garden-r6-free.png" "media/www/stage1-completion/downloads/garden-$language-free.png"
  & $storeAdb -s $storeSerial shell input keyevent 4
  $afterShare=Read-StoreUi
  if($afterShare.SelectNodes('//node') | Where-Object {$_.text -eq 'OK'}) { Tap-StoreUi 'OK' }
  Open-StorePage 'outline?id=store-garden'
  Read-StoreUi | Out-Null
}
Write-Output 'Captured requested real screenshots and original Free PNG exports. Geometry correction cancelled; no file sent.'
