# V02 — pierwszy szkic / your first sketch

Przygotowano lokalnie 30.10.2026. Rzeczywiste nagrania aplikacji w dedykowanym emulatorze Androida, z opisami kroków i schematem obrysu. Bez publikacji.

Zasada użytkownika: w filmach nie umieszczać technicznych napisów o produkcji, tempie, pauzach, emulatorze czy montażu ani wewnętrznych kodów V02. Aktualne wersje zawierają wyłącznie opisy przydatne do obsługi aplikacji; informacje o pochodzeniu pozostają w dokumentacji.

Korekta tempa po uwadze użytkownika: aktualne filmy trwają **3 min 44 s**. Usunięto przyspieszenia, zwolniono obsługę i dodano po 6 s zatrzymania końcowego ekranu każdego etapu. Poprzednie wersje 80 s zachowano w `archive-80s/`.

## Gotowe materiały

- [Podgląd PL i transkrypt](output/preview-pl.html), [film PL z muzyką](output/v02-first-sketch-pl-with-music.mp4).
- [Podgląd EN i transkrypt](output/preview-en.html), [film EN z muzyką](output/v02-first-sketch-en-with-music.mp4).
- Każdy film: 224 s, 1920 × 1080, 30 kl./s, H.264 / MP4, yuv420p, faststart. Wersje `with-music` zawierają cichy podkład AAC stereo 48 kHz / 192 kb/s. Oryginalne pliki bez tego przyrostka pozostają bez dźwięku.
- Miniatury PNG/WebP, arkusze przeglądowe, oryginalne PNG Free i raport `output/verification.json`.
- Instrukcje są widoczne po lewej stronie obrazu. Dolne napisy odtwarzacza usunięto na życzenie użytkownika. Odtwarzanie po kliknięciu.

## Muzyka

Na życzenie użytkownika dodano lokalny utwór „Carefree” Kevina MacLeoda (incompetech.com), CC BY 4.0. Licencję potwierdzono na [stronie utworu](https://remote.incompetech.com/music/royalty-free/index.html?Search=Search&isrc=USUAN1400037). Fragmenty połączono przenikaniem 2,5 s do długości 224 s; cel głośności −24 LUFS, wejście 2 s i wyciszenie 4 s. Autor i licencja są w metadanych MP4, pod odtwarzaczami oraz w `output/MUSIC-CREDITS.txt` (tekst do opisu publikacji). Nie dodawano napisów do obrazu.

`node media/www/video-v02/add-music.cjs` po renderowaniu tworzy obie wersje muzyczne i aktualizuje podglądy. Zachowuje strumień obrazu bajt w bajt. Sprawdza pełne dekodowanie 6720 klatek, obecność AAC i zgodność skrótu strumienia wideo z oryginałem. Raport: `output/music-verification.json`, pomiar głośności: `audio/loudness.log`.

## Przebieg

| Czas | Czynność |
| --- | --- |
| 0–22 s | Nowy szkic „Taras” / „Patio”, tryb ręczny. |
| 22–62 s | P1, pierwszy kierunek 0°, długość 4 m, sprawdzenie i zapis P2. |
| 62–142 s | Dwa skręty 90° w lewo, boki 3 m i 3,8 m; każdy punkt zapisany. Zakończenie z otwartym obrysem. |
| 142–172 s | Poprawienie ostatniego boku 3,8 → 4 m i zapis zmiany. |
| 172–200 s | Kontynuacja, zakończenie i zamknięcie obrysu wyliczonym bokiem do P1. Wynik 14 m / 12 m². |
| 200–224 s | Podgląd PNG i rzeczywiste przygotowanie pliku przez systemowy arkusz udostępniania. Bez wybrania odbiorcy. |

## Pochodzenie i ograniczenia

outlineGo 1.0.0 / versionCode 4, oryginalny zainstalowany APK. Android API 35, `emulator-5556`, 1080 × 1920, density 360. Zastosowano Free; nie odblokowywano Plus, nie zmieniano kodu aplikacji ani APK/AAB. Nie używano telefonu użytkownika. Interakcje wykonano przez ADB i rzeczywiste kontrolki aplikacji, a obraz zarejestrowano przez Android `screenrecord`.

Przed każdą sesją przygotowano pustą demonstracyjną bazę z ustawieniami trybu ręcznego. Cały szkic, jego korekta, zamknięcie i PNG następnie powstały przez UI. `sources/{pl,en}/before/` przechowuje kopię poprzedniej demonstracyjnej bazy; `after/` zawiera końcową bazę wraz z WAL. `project.json` zachowuje dane końcowe i historię obserwacji. Poprzednie zrzuty ogrodu nie posłużyły do imitowania nagrania.

To demonstracja ręcznego wprowadzania kierunków i długości, nie test sensorów lub pomiaru terenowego. Bok P4–P1 jest wyliczony. Znak wodny Free pozostał w oryginalnym PNG. Schemat po lewej stronie jest objaśnieniem poza UI, nie jego częścią.

Każdy z sześciu fragmentów zachowuje kolejność interakcji; między fragmentami zastosowano montaż. Informacje o montażu i tempie zapisano wyłącznie w dokumentacji, zgodnie z życzeniem użytkownika. Dokładne źródła, tempa i czasy podaje `output/edit-manifest-{pl,en}.json`. Źródłowe nagrania są w `sources/{pl,en}/`.

## Kontrola i odtworzenie

`node media/www/video-v02/render.cjs` odtwarza oba filmy z zachowanych nagrań. Wymaga `app/node_modules/sharp` oraz `C:/ffmpeg/ffmpeg.exe` lub zmiennej `V02_FFMPEG`.

`node media/www/video-v02/verify.cjs` sprawdza geometrię i zapisaną korektę w SQLite, kopiuje oryginalny PNG, dekoduje całe filmy (6720 klatek każdy), kontroluje format i czas 224 s, brak przyspieszeń i pauzy 6 s, wyciąga klatki do przeglądu oraz zapisuje SHA-256. Wymaga Node z `node:sqlite` (użyto Node 22.23.4).

`node media/www/video-v02/capture.cjs pl` i odpowiednio `en` ponownie nagrywają sesję. Skrypt jest wyłącznie do dedykowanego, uruchomionego emulatora `emulator-5556` z root ADB; nadpisuje jego demonstracyjną bazę po wykonaniu kopii. Nie uruchamiać na urządzeniu z prywatnymi danymi. Nie wysyła plików, nie wykonuje zakupów ani nie zmienia aplikacji.
