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
10. `10-plus-dxf-export.png` — podsumowanie z aktywnym przyciskiem eksportu DXF, mock uprawnienia Plus.
11. `11-plus-dxf-share.png` — rzeczywisty systemowy arkusz udostępniania wygenerowanego pliku DXF, mock uprawnienia Plus.
12. `12-plus-dxf-ready.png` — komunikat przygotowania DXF po zamknięciu arkusza, bez wysyłania pliku.
13. `13-plus-png-preview.png` — rzeczywisty podgląd PNG bez znaku wodnego, mock uprawnienia Plus.

`contact-sheet-pl.png` i `contact-sheet-en.png` są pomniejszonymi arkuszami dziewięciu ekranów Free. `contact-sheet-plus-pl.png` i `contact-sheet-plus-en.png` pokazują cztery dodatkowe ekrany Plus. Są to arkusze do kontroli wizualnej, nie oryginały do publikacji. `verification.json` zawiera rozdzielczości, rozmiary i SHA256 oraz flagę `entitlementMock`. Pliki DXF zapisane przez aplikację zachowano w `exports/garden-{pl,en}.dxf`.

## Dane i ograniczenia

Użyto istniejących demonstracyjnych baz `artifacts/store-fixtures-{pl,en}.db`. Mają odrębny częściowy szkic „Pomiar ogrodu” do pokazywania kreatora i gotowy „Ogród przy tarasie” do wyniku. Boku z podglądu nie zapisano; kreator nie stanowi dokumentacji odtworzenia całego ukończonego obrysu. Dane i daty szkiców są demonstracyjne. Na telefonie użytkownika niczego nie zmieniano.

Scena ogrodu w kamerze jest wcześniej wygenerowaną ilustracją podaną emulatorowi jako źródło kamery. UI jest rzeczywisty, lecz zrzuty nie potwierdzają pomiaru fizycznego ogrodu ani działania sensorów w terenie.

Pierwsza seria powstała w Free na emulatorze bez Google Play; ekran niedostępnej oferty zachowano w `diagnostics/`. Następnie na wyraźne polecenie użytkownika zbudowano tymczasowy APK ze stałym planem `plus` wyłącznie w StoreProvider. Funkcji generowania DXF, eksportu PNG i natywnego udostępniania nie zmieniano. Ekrany 10–13 pokazują rzeczywisty interfejs i eksport, lecz uprawnienie było mockowane; nie potwierdzają zakupu, walidacji licencji ani przywracania Plus. W arkuszu Androida nagłówek „Udostępniam obraz” / „Sharing image” pochodzi z systemu obsługującego MIME `image/vnd.dxf`; zapisany plik jest DXF, nie bitmapą. Nie wybrano żadnego odbiorcy.

Po przechwyceniu przywrócono dokładne oryginalne bajty `store.tsx`, usunięto testowy APK, skrypty tworzące mock i katalog wyników builda aplikacji zawierający mock. W emulatorze ponownie zainstalowano oryginalny APK, SHA256 `e383e3b4645dcd433b07fcce433102eb30a8a5cd3d6d3e5311a26c9398a8f0b6`, i potwierdzono powrót przycisku `DXF · Plus`. Dowód: `diagnostics/en-free-restored-after-mock.png`. Produkcyjne APK/AAB w `artifacts/` nie zostały nadpisane, telefon bez zmian. Zrzuty programu CAD nie należą do tego zestawu.

## Odtworzenie

Z katalogu projektu, po uruchomieniu dedykowanego emulatora `emulator-5556` z dotychczasową sceną kamery i podpisanym APK v4:

```powershell
# Skrypt nadpisuje demonstracyjne dane wyłącznie dedykowanego emulatora.
./media/www/app-screenshots/capture.ps1 -Language pl
./media/www/app-screenshots/capture.ps1 -Language en
node media/www/app-screenshots/verify.cjs
```

Skrypt korzysta z `artifacts/store-screenshot-helper.ps1` i istniejących baz demonstracyjnych. Wymaga `adbd root` w testowym obrazie AOSP, rozdzielczości 1080 × 1920 i density 360. Nie uruchamiać na telefonie ani emulatorze zawierającym dane użytkownika. W tej sesji skrypt automatyczny posłużył do serii EN; seria PL została przechwycona tymi samymi operacjami krok po kroku.

`capture.ps1` odtwarza wyłącznie pierwotne dziewięć ekranów Free i diagnostykę niedostępnego Plus. Dodatkowe ekrany 10–13 powstały z usuniętym już mockiem. Do ponownego przechwycenia wymagają rzeczywistego uprawnienia Plus lub ponownie wyraźnie autoryzowanego mocka testowego. `verify.cjs` sprawdza pełny zachowany zestaw 26 ekranów i dwa DXF; nie odblokowuje żadnej funkcji.

Zrzuty są zapisane lokalnie; nie wdrażano ich w Firebase i nie wysyłano do Google Play.
