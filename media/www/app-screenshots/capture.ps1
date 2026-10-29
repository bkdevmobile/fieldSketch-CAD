param([ValidateSet('pl','en')][string]$Language='en')
$ErrorActionPreference='Stop'
. artifacts/store-screenshot-helper.ps1
$labels=if($Language -eq 'pl'){@{
  home='Twoje szkice';new='Nowy szkic';reference='Zapisz odniesienie';referenceSet='Odniesienie ustawione';ready='Telefon stabilny — możesz zapisać kierunek.';
  direction='Zapisz kierunek do narożnika';angle='Kierunek gotowy · podaj długość';length='Długość boku (m)';review='Sprawdź bok';save='Zapisz punkt';
  summary='Podsumowanie';zoom='Pomniejsz szkic';expand='Powiększ szkic';sketch='Szkic';dimensions='Wymiary i punkty';share='Udostępnij PNG';back='Wróć do szkicu'
}}else{@{
  home='Your sketches';new='New sketch';reference='Save reference';referenceSet='Reference set';ready='Phone steady — ready to save direction.';
  direction='Save direction to corner';angle='Direction ready · enter length';length='Side length (m)';review='Review side';save='Save point';
  summary='Summary';zoom='Zoom out sketch';expand='Expand sketch';sketch='Sketch';dimensions='Dimensions and points';share='Share PNG';back='Back to sketch'
}}
$destination="media/www/app-screenshots/$Language"
Load-StoreLanguage $Language
Wait-StoreUi $labels.home
Open-StorePage 'new-project'
Wait-StoreUi $labels.new
Capture-StoreScreen "$destination/01-new-sketch.png"
Open-StorePage 'project?id=store-measurement'
Wait-StoreUi $labels.reference
Tap-StoreUi $labels.reference
Wait-StoreUi $labels.referenceSet
Tap-StoreUi 'OK'
Wait-StoreUi $labels.ready
Capture-StoreScreen "$destination/02-direction.png"
Tap-StoreUi $labels.direction
Wait-StoreUi $labels.angle
Capture-StoreScreen "$destination/03-angle.png"
Tap-StoreUi $labels.angle
Wait-StoreUi $labels.length
Tap-StoreUi $labels.length -Last
& $storeAdb -s $storeSerial shell input text 3
& $storeAdb -s $storeSerial shell input keyevent 4
Capture-StoreScreen "$destination/04-length.png"
Tap-StoreUi $labels.review
Wait-StoreUi $labels.save
Capture-StoreScreen "$destination/05-review.png"
Open-StorePage 'outline?id=store-garden'
Wait-StoreUi $labels.summary
Read-StoreUi | Out-Null
Tap-StoreUi $labels.zoom
Read-StoreUi | Out-Null
Capture-StoreScreen "$destination/06-summary.png"
Tap-StoreUi $labels.expand -Last
Wait-StoreUi $labels.sketch
Read-StoreUi | Out-Null
Tap-StoreUi $labels.zoom
Read-StoreUi | Out-Null
Capture-StoreScreen "$destination/07-sketch.png"
& $storeAdb -s $storeSerial shell input keyevent 4
Open-StorePage 'dimensions?id=store-garden'
Wait-StoreUi $labels.dimensions
Read-StoreUi | Out-Null
Tap-StoreUi $labels.zoom
Read-StoreUi | Out-Null
Capture-StoreScreen "$destination/08-dimensions.png"
Open-StorePage 'export?id=store-garden'
Wait-StoreUi $labels.share
Capture-StoreScreen "$destination/09-png-preview.png"
Open-StorePage 'outline?id=store-garden'
Wait-StoreUi $labels.summary
Tap-StoreUi 'DXF · Plus'
Wait-StoreUi 'outlineGo Plus'
Capture-StoreScreen "media/www/app-screenshots/diagnostics/$Language-dxf-plus-unavailable.png"
Tap-StoreUi $labels.back -Last
Write-Output "Captured 9 $Language app screens and DXF availability diagnostic. No point saved, no purchase, no file sent."
