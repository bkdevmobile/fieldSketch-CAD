# V06 — Kamera i krokomierz

Przygotowano lokalnie **31.10.2026**, PL i EN: **108 sekund (1:48)**, 1920 × 1080 / 30 kl./s, H.264 i AAC stereo 48 kHz. Bez publikacji i bez integracji z WWW.

- [Podgląd PL z opisem symulacji](output/preview-pl.html) · [MP4 PL](output/v06-camera-steps-pl.mp4) · [PNG PL](output/camera-steps-pl-free.png)
- [Podgląd EN z opisem symulacji](output/preview-en.html) · [MP4 EN](output/v06-camera-steps-en.mp4) · [PNG EN](output/camera-steps-en-free.png)

## Co pokazuje film

1. Podgląd tylnej kamery z celownikiem i gotowość odczytu.
2. Zapis kierunku w trybie względnym, bez ręcznego wpisywania kąta.
3. Start krokomierza, automatycznie rosnący licznik, Stop i wynik długości.
4. Sprawdzenie boku i zapis punktu.
5. Celowanie na kolejny narożnik i zapis następnego kierunku.
6. Kolejny pomiar krokami i rozbudowa obrysu.
7. Zamknięcie szkicu oraz rzeczywisty podgląd i eksport PNG Free.

Pełne nagrania znajdują się w `sources/{pl,en}/`, w tym trzeci bok niewłączony w całości do skrótu. Montaż ma siedem etapów o długości 10, 14, 26, 10, 18, 16 i 14 s. Bez przyspieszania; pauzy mają co najmniej 4 s. Końcowe pauzy kierunków, kroków i PNG wykorzystują rzeczywiste zrzuty z tej samej sesji, aby odczyt był stabilny i czytelny. Dokładne źródła, czasy i SHA-256 są w `output/edit-manifest-{pl,en}.json`.

## Jawna symulacja

Użytkownik wybrał nagranie w emulatorze z symulacją czujników ujawnioną w opisie filmu. Dostępny emulator nie ma detektora kroków; przygotowano tymczasowy testowy adapter [demo-sensors.ts.txt](demo-sensors.ts.txt), który dostarcza aplikacji symulowane kierunki i zdarzenia kroków.

**Symulowane:** gotowość i odczyty kierunku oraz zdarzenia detektora kroków. Kolejne pomiary mają 8, 6 i 8 kroków, a kolejne kierunki zmieniają się o 90°. Podgląd kamery otrzymuje wcześniej wygenerowany obraz ogrodu z [sources/camera-input.png](sources/camera-input.png), skopiowany bez zmian z `googlePlay/emulator-screenshots/sources/garden-camera.png`. Obraz jest podany przez obsługiwaną przez emulator opcję `-camera-back imagefile:...`; nie podmieniano UI. Nie używano fizycznej kamery komputera.

**Rzeczywiste:** aplikacja, jej `CameraView`, celownik, statusy, przyciski Start/Stop, aktualizacja licznika po zdarzeniach, przeliczanie kroków na długość, kontrola i zapis punktów, SQLite, geometria, wyliczone zamknięcie oraz eksport PNG. Liczb kroków ani kątów nie wpisywano ręcznie. W bazie zapisano `lengthSource: steps`, `detectedSteps`, użyty przelicznik 75 cm, identyfikatory pomiarów `demo-...` i przechwycone odczyty kierunku. Sesje noszą nazwy Teren / Garden.

Przykład daje boki 6 m, 4,5 m i 6 m oraz wyliczone zamknięcie 4,5 m: obwód 21 m, pole 27 m². **To wynik danych demonstracyjnych, nie pomiar fizycznego ogrodu i nie test dokładności czujników.** Długość z kroków jest szacunkowa. Kamera służy do celowania; nie wyznacza sama odległości i nie wykonuje skanowania AR. Obraz ogrodu nie dokumentuje tych wymiarów.

Opis symulacji jest wyraźnie umieszczony bezpośrednio pod odtwarzaczem w obu podglądach oraz w metadanych MP4. Należy zachować go w opisie publikowanego filmu. Zgodnie z życzeniem użytkownika nie ma technicznych podpisów w samym obrazie, wewnętrznych oznaczeń V06 ani dolnych napisów dublujących instrukcje. Nagrania obejmują wyłącznie demonstracyjny UI aplikacji, bez plików i ścieżek z komputera.

## Wersja testowa i przywrócenie

Adapter zmienił wyłącznie plik `app/src/infrastructure/native.ts` podczas budowania osobnego APK. UI, kamera, logika przeliczania, geometria, repozytorium i Free/Plus nie były modyfikowane. Skrypt [build-demo.ps1](build-demo.ps1) zachowuje oryginalne bajty pliku i przywraca je w `finally`, zanim rozpoczną się nagrania. Produkcyjny APK w `artifacts` nie jest nadpisywany.

Po nagraniu obu języków uruchomiono `restore.cjs`: zainstalowano oryginalny APK, potwierdzono niezmieniony kod oraz SHA-256 APK, przywrócono demonstracyjną bazę sprzed sesji PL wraz z WAL/SHM, ustawiono EN, wyłączono wskaźniki dotknięć i zegar demonstracyjny. Tymczasowy APK, kopię kodu i wyniki builda usunięto. Dowody przywrócenia: `sources/restoration.json`. W repozytorium pozostaje jedynie jawny adapter testowy jako plik tekstowy; aplikacja go nie importuje.

Emulator przy nagraniu: dedykowany Android API 35 `emulator-5556`, 1080 × 1920, gęstość 360 dpi. Wcześniejsze uruchomienie nie miało kamery i wymagało restartu z wirtualnym wejściem. Do filmu włączono dopiero poprawną sesję z działającym podglądem.

## Muzyka

Inna melodia niż w V01–V05: **Montauk Point — Kevin MacLeod (incompetech.com)**, [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), [oficjalne źródło](https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1400013). MP3 pobrano z `https://incompetech.com/music/royalty-free/mp3-royaltyfree/Montauk%20Point.mp3`.

Fragment 108 s, cichy podkład około −24 LUFS, wejście 2 s i wyjście 4 s. Kredyty są pod odtwarzaczem, w metadanych i `output/MUSIC-CREDITS.txt`. Zachowano wersje `*-silent.mp4` bez dźwięku. Przy publikacji zachować kredyty wraz z opisem symulacji.

## Odtworzenie i kontrola

`node media/www/video-v06/prepare.cjs` sprawdza zapisane dane projektu bezpośrednio w SQLite oraz zgodność `project.json`, tryb względny, odczyty, kroki i geometrię; kopiuje oryginalny PNG do `output`.

`node media/www/video-v06/render.cjs` odtwarza oba filmy; można podać `pl` albo `en`. Wymaga Node, `app/node_modules/sharp` i `C:/ffmpeg/ffmpeg.exe` (lub `V06_FFMPEG`).

`node media/www/video-v06/verify.cjs` sprawdza SQLite, dane sensorowe, 108 s i pełne dekodowanie 3240 klatek na język, dźwięk, jego poziom, zgodność obrazu z wersją bez muzyki, źródłowe hashe, pauzy, brak ścieżek napisów, opis symulacji w HTML i MP4, akcje Start/Stop, lokalne odwołania oraz przywrócenie oryginalnej aplikacji. Raport: `output/verification.json`. Arkusze klatek: `output/contact-sheet-{pl,en}.png`. Osobno oceniono kadry pokazujące narastanie licznika.

Ponowne nagranie wymaga nowego, autoryzowanego uruchomienia wersji testowej na dedykowanym emulatorze: `build-demo.ps1`, instalacja testowego APK, wirtualna kamera, następnie `capture.cjs pl` / `en` i `restore.cjs`. Skrypty nadpisują wyłącznie bazę demonstracyjnego emulatora po wykonaniu kopii; nie uruchamiać na urządzeniu z prywatnymi danymi. Samo odtworzenie montażu korzysta z zachowanych źródeł i nie wymaga testowego APK.
