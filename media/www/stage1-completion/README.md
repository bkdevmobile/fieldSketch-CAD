# Media do pierwszego etapu WWW

Przygotowano 29.10.2026. Zestaw uzupełnia `../app-screenshots/` i `../librecad-screenshots/`. Bez deployu i zmian kodu aplikacji.

## Zawartość

- `screenshots/{pl,en}/14-edit-length.png`: rzeczywisty edytor istniejącego boku P1–P2, wpisana korekta 8 → 8,2 m przed zapisem. Korektę anulowano; pozostałe wyniki nadal przedstawiają bazowy ogród 32 m / 55 m². W instrukcji podpisywać jako niezapisaną propozycję korekty, a nie zapisany wynik tego ogrodu.
- `screenshots/{pl,en}/15-edit-note.png`: rozwinięte i aktywowane pole edycji istniejącej notatki. Klawiaturę schowano dla czytelności; tekst pozostał bez zmian. Notatka zapisuje się automatycznie, bez osobnego przycisku zapisu.
- `svg/{pl,en}/direction-length-point.svg`: trzy kroki kierunek → długość → zapis punktu; `*-mobile.svg` to układ pionowy. Wektory są autorskie, bez imitowania UI aplikacji.
- `svg/{pl,en}/garden-points.svg`: plan zgodny z geometrią wyeksportowanego DXF: P1 (0,0), P2 (8,0), P3 (8,5), P4 (5,5), P5 (5,8), P6 (0,8). Bok zamykający P6–P1 jest wyliczony i oznaczony linią przerywaną. Pole 55 m², obwód 32 m. Schemat jest samodzielny: nie sugeruje, że wygenerowane zdjęcie ogrodu ma te same rzeczywiste proporcje.
- `graphics/{pl,en}/workflow.png` oraz `same-outline.png`: montaże rzeczywistych zrzutów, z lokalnymi podpisami; ekranów nie retuszowano. Zestaw pokazuje eksport w Plus, choć do samego widoku obrysu wykorzystano ekran dostępny też w Free. Te grafiki zastępują ilustracyjne widoki CAD jako dowód importu. Na telefonie preferować osobne obrazy aplikacji i CAD, aby drobny tekst pozostał czytelny.
- `web/`: gotowe warianty WebP wszystkich 15 ekranów aplikacji na język (480/960 px), trzech głównych ekranów CAD na język (960/1440 px), czterech montaży (720/1440 px) i dwóch istniejących scen kontekstowych. UI kompresowany bezstratnie; kadry i proporcje oryginałów zachowane. Rzeczywiste wymiary i rozmiary są w `manifest.json`.
- `downloads/garden-{pl,en}-free.png`: oryginalne PNG rzeczywiście wygenerowane przez aplikację, ze znakiem wodnym Free. Są to pliki eksportu, nie zrzuty podglądu. Pozyskano je z pamięci podręcznej aplikacji po uruchomieniu udostępniania; nie wybrano odbiorcy.
- `downloads/garden-{pl,en}.dxf`: dokładne kopie istniejących, sprawdzonych w LibreCAD eksportów Plus. Jednostka: metr. Pochodzenie testowego uprawnienia Plus opisano w `../app-screenshots/README.md`; przy tej sesji nie włączano mocka i nie zmieniano uprawnienia. Oryginalny PNG Plus nie jest konieczny do publikacji: pliki do pobrania jawnie pokazują wariant Free, a DXF oznaczamy Plus.
- `gallery.html`: lokalna galeria wariantów WWW; `contact-sheet-{pl,en}.png`: szybki przegląd nowych zrzutów; `previews/`: renderowane podglądy SVG do kontroli wizualnej.

## Przechwycenie i ograniczenia

Podpisany outlineGo 1.0.0 / versionCode 4, dedykowany emulator Android API 35 `emulator-5556`, 1080 × 1920. PNG ekranu pobrano przez `adb shell screencap -p` i `adb pull`. Zmiany wykonywano wyłącznie na danych demonstracyjnych emulatora, bez ingerowania w telefon użytkownika. Do załadowania istniejących danych PL/EN użyto `artifacts/store-screenshot-helper.ps1`. Przy ostatnim przechwyceniu pozostawiono aplikację w EN i Free.

Zrzuty są rzeczywiste, lecz sceny kamery i dane są demonstracyjne. Nie potwierdzają terenowej dokładności sensorów. Zasady pochodzenia starszych ekranów, mocka Plus i wygenerowanych scen nadal obowiązują. Surowy ekran udostępniania Androida zachowano; marketingowe warianty z ikonami są osobnymi mockupami w `../share-mockups/`, nie surowymi zrzutami. Nie oparto nowych instrukcji na tych mockupach.

## Odtworzenie grafik

Z katalogu repozytorium: `node media/www/stage1-completion/build.cjs`, następnie `node media/www/stage1-completion/verify.cjs`. Wymaga istniejących oryginałów ekranów i eksportów PNG oraz lokalnego `app/node_modules/sharp`. Buduje grafiki, warianty WWW, arkusze, galerię i raport SHA256; nie steruje aplikacją ani nie odtwarza brakujących oryginałów. Weryfikacja sprawdza także zgodność punktów schematu z DXF, jednostkę, obwód i pole.

`capture.ps1` odtwarza cztery nowe zrzuty i dwa PNG Free, nadpisując demonstracyjne dane wyłącznie dedykowanego emulatora, tak jak wcześniejszy skrypt zrzutów. Uruchamiać z katalogu repozytorium przez Windows PowerShell po sprawdzeniu urządzenia `emulator-5556`; nie uruchamiać na urządzeniu z prywatnymi danymi. Nie odtwarza mocka Plus i nie wykonuje zakupu ani wysyłania pliku. Po ponownym przechwyceniu uruchomić build i verify.

Przy wdrażaniu skopiować tylko używane warianty do `public/assets/`, przypisać właściwe podpisy i alt oraz ustawić `width`, `height` i `srcset` z manifestu. SVG mają tytuły dostępności. Wersje szeroka i pionowa schematu kroków powinny być przełączane przez `picture` lub HTML/CSS. Źródła i pliki dowodowe nie wymagają publikacji.

## Zakres zamknięty i dalsze prace

Statyczne media etapu 1 są przygotowane. Nie wykonywano mediów pokoju, zakupu/przywracania Plus ani pomocy z etapu 2. Filmy V02/V04/V01, ich miniatury, napisy i transkrypcje pozostają osobnym zadaniem i nie blokują publikacji instrukcji tekstowych ze zrzutami. Ten zestaw nie zawiera nagrań wideo.
