# Zrzuty aplikacji outlineGo do Google Play

Przygotowano 24.10.2026. Zestaw zawiera 36 rzeczywistych zrzutów interfejsu Android: po 6 ekranów w języku polskim i angielskim dla trzech profili wyświetlacza emulatora.

## Pliki do przesłania

| Sekcja Google Play | Polski | Angielski | Rozdzielczość |
| --- | --- | --- | --- |
| Telefon | `pl/phone/` | `en/phone/` | 1080 × 1920 |
| Tablet 7″ | `pl/tablet-7/` | `en/tablet-7/` | 1080 × 1920 |
| Tablet 10″ | `pl/tablet-10/` | `en/tablet-10/` | 1440 × 2560 |

Każdy folder zawiera:

1. `01-sketches.png` — lista zapisanych szkiców.
2. `02-field-measurement.png` — pomiar terenowy, celownik i szkic roboczy.
3. `03-summary.png` — podsumowanie ogrodu: obwód 32 m, pole 55 m².
4. `04-sketch.png` — powiększony szkic z długościami boków.
5. `05-dimensions.png` — edycja długości boków.
6. `06-png-preview.png` — podgląd eksportowanego szkicu PNG.

Do odpowiedniej sekcji sklepu wgrywać sześć plików PNG z jednego folderu języka i urządzenia. Źródło obrazu kamery i raport kontroli nie są materiałami do wgrania do galerii. Wcześniejsze kolaże marketingowe pozostają w pozostałych folderach `googlePlay`.

Wszystkie zrzuty mają proporcje 9:16, format PNG RGB i rozmiar poniżej 8 MB. Wymiary, rozmiary plików i sumy SHA256 zapisano w `verification.json`.

## Sposób wykonania

- Android Emulator 36.6.11, Android 15 / API 35, obraz AOSP x86_64; port ADB `emulator-5556`.
- Zainstalowany podpisany APK `artifacts/outlineGo-0.1.0.apk`, wersja 0.1.0 / versionCode 2, źródła `8365dca`, SHA256 `7efea90cf234609bab21801a570da260da33b233441e1b7356919741586b5170`. Aktualny AAB v3 zawiera ten sam interfejs; późniejsze zmiany dotyczą strony WWW, dokumentacji i numeru wydania.
- Profile: telefon 1080×1920 / 360 dpi, tablet 7″ 1080×1920 / 315 dpi, tablet 10″ 1440×2560 / 294 dpi. Profil tabletu oznacza konfigurację wyświetlacza emulatora; nie jest zdjęciem fizycznego urządzenia.
- Przykładowe szkice i notatki utworzono za pomocą modelu domenowego aplikacji i zapisano w lokalnej bazie testowego emulatora. Pomiar otwarty zawiera punkty P1–P3. Dane telefonu użytkownika nie były zmieniane.
- Wygenerowany ogród z `sources/garden-camera.png` podano emulatorowi jako źródło tylnej kamery przez `-camera-back imagefile:...`. Aplikacja sama wyświetla obraz, celownik, szkic i status gotowości. Obraz jest symulacją sceny terenowej; zrzuty nie dokumentują rzeczywistego pomiaru ogrodu.
- Interfejs, teksty i wyniki pochodzą z aplikacji. Nie podmieniano elementów interfejsu w plikach zrzutów. Po przechwyceniu wykonano wyłącznie bezstratny zapis PNG RGB. Ustawiono jasny motyw, metry oraz systemowy zegar demonstracyjny 9:41.
- Użyto wersji Free; zachowano rzeczywiste oznaczenia Plus i ograniczenia aplikacji. Nie wykonywano zakupów.

Lokalne skrypty przygotowania i kontroli: `artifacts/create-store-fixtures.cjs`, `artifacts/start-store-emulator.ps1`, `artifacts/store-screenshot-helper.ps1`, `artifacts/capture-store-set.ps1`, `artifacts/verify-store-screenshots.cjs`. Arkusze kontaktowe do przeglądu: `artifacts/store-contact-sheets/`.
