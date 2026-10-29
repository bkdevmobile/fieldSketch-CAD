# Rzeczywiste zrzuty aplikacji — WWW PL/EN

Sesja 29.10.2026. Podpisany APK outlineGo **1.0.0 / versionCode 4**, osobny emulator Android API 35 `emulator-5556`, ekran 1080 × 1920, gęstość 360 dpi, jasny motyw. Oryginalne PNG pobrane przez `adb shell screencap` i `adb pull`; interfejsu nie generowano, nie retuszowano i nie podmieniano. Zegar demonstracyjny 9:41 ustawiono w systemie emulatora.

## Pliki w katalogach `pl/` i `en/`

1. `01-new-sketch.png` — formularz rozpoczęcia nowego szkicu.
2. `02-direction.png` — celowanie i zapis kierunku przy kolejnym odcinku.
3. `03-angle.png` — zapisany kierunek przed przejściem do długości.
4. `04-length.png` — ręcznie wpisana długość 3 m.
5. `05-review.png` — sprawdzenie boku przed zapisem punktu.
6. `06-summary.png` — podsumowanie demonstracyjnego ogrodu, obwód 32 m, pole 55 m².
7. `07-sketch.png` — powiększony szkic ogrodu z wymiarami.
8. `08-dimensions.png` — wymiary i punkty.
9. `09-png-preview.png` — podgląd eksportu PNG w Free, ze znakiem wodnym aplikacji.

`contact-sheet-pl.png` i `contact-sheet-en.png` są pomniejszonymi arkuszami do kontroli wizualnej, nie oryginałami do publikacji. `verification.json` zawiera rozdzielczości, rozmiary i SHA256.

## Dane i ograniczenia

Użyto istniejących demonstracyjnych baz `artifacts/store-fixtures-{pl,en}.db`. Mają odrębny częściowy szkic „Pomiar ogrodu” do pokazywania kreatora i gotowy „Ogród przy tarasie” do wyniku. Boku z podglądu nie zapisano; kreator nie stanowi dokumentacji odtworzenia całego ukończonego obrysu. Dane i daty szkiców są demonstracyjne. Na telefonie użytkownika niczego nie zmieniano.

Scena ogrodu w kamerze jest wcześniej wygenerowaną ilustracją podaną emulatorowi jako źródło kamery. UI jest rzeczywisty, lecz zrzuty nie potwierdzają pomiaru fizycznego ogrodu ani działania sensorów w terenie.

Emulator nie ma sklepu Google Play i działa w Free. Próba DXF pokazuje ekran Plus z niedostępną ofertą. Dowody zapisano wyłącznie w `diagnostics/`; nie należy używać ich jako grafik udanego eksportu ani materiałów promocyjnych Plus. Nie dokonano zakupu, nie odblokowywano uprawnień obejściem i nie wysyłano plików do innych osób. **Właściwy eksport DXF i arkusz udostępniania DXF pozostają do przechwycenia na środowisku z aktywnym Plus.** Zrzuty programu CAD nie należą do tego zestawu.

## Odtworzenie

Z katalogu projektu, po uruchomieniu dedykowanego emulatora `emulator-5556` z dotychczasową sceną kamery i podpisanym APK v4:

```powershell
# Skrypt nadpisuje demonstracyjne dane wyłącznie dedykowanego emulatora.
./media/www/app-screenshots/capture.ps1 -Language pl
./media/www/app-screenshots/capture.ps1 -Language en
node media/www/app-screenshots/verify.cjs
```

Skrypt korzysta z `artifacts/store-screenshot-helper.ps1` i istniejących baz demonstracyjnych. Wymaga `adbd root` w testowym obrazie AOSP, rozdzielczości 1080 × 1920 i density 360. Nie uruchamiać na telefonie ani emulatorze zawierającym dane użytkownika. W tej sesji skrypt automatyczny posłużył do serii EN; seria PL została przechwycona tymi samymi operacjami krok po kroku.

Zrzuty są zapisane lokalnie; nie wdrażano ich w Firebase i nie wysyłano do Google Play.
