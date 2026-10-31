# V05 — Szkic pokoju

Nowy przykład w rzeczywistym interfejsie outlineGo: **Salon / Room, 5 × 4 m**, ręczne kierunki i długości, zapisana korekta 4,8 → 5 m, wyliczone zamknięcie, obwód 18 m i pole 20 m², oryginalny eksport PNG Free. Dwie wersje językowe po **72 sekundy (1:12)**, 1920 × 1080 / 30 kl./s, H.264 i AAC stereo. Pierwotne nagrania z 30.10.2026; wersja z ilustracją zaktualizowana 31.10.2026. Bez publikacji.

- [Podgląd PL](output/preview-pl.html) · [MP4 PL](output/v05-room-pl.mp4) · [PNG PL](output/room-pl-free.png)
- [Podgląd EN](output/preview-en.html) · [MP4 EN](output/v05-room-en.mp4) · [PNG EN](output/room-en-free.png)

## Przebieg i pochodzenie

Na polecenie użytkownika dodano 12-sekundowe otwarcie z ilustracją osoby mierzącej pokój taśmą i zapisującej wymiar w telefonie, analogicznie do V03. Obraz wygenerowano wbudowanym **ImageGen**: [źródło](sources/room-measurement.png), [pełny prompt](sources/image-prompt.txt). Ilustracja pojawia się ponownie obok wpisywania pierwszego wymiaru. Postać jest fikcyjna, pozostaje nieruchoma; obraz delikatnie się oddala (1,035 → 1,000) względem stałego środka, bez przesuwania na boki, z łagodnym początkiem i końcem. Zastosowano zmiennoprzecinkową transformację i interpolację cubic, jak w poprawionym V03.

Scena jest ilustracyjna i nie dokumentuje pomiaru pokoju 5 × 4 m ani automatycznego mierzenia telefonem. UI i eksport pozostają rzeczywiste. Pochodzenie ilustracji jest pod odtwarzaczem oraz w metadanych MP4, bez technicznych podpisów w obrazie. Zachować ten opis przy publikacji. Pełne 60 s dotychczasowej instrukcji pozostawiono po nowym otwarciu, dzięki czemu tempo czynności nie wzrosło.

Sześć etapów po 10 s: utworzenie szkicu, pierwszy bok 5 m, kolejne boki 4 m i 4,8 m ze skrętami 90°, korekta ostatniego boku do 5 m, zamknięcie i wynik, eksport PNG. To zmontowany przegląd: zachowano fragmenty ważnych czynności, bez przyspieszania, z co najmniej 4 s pauzy w każdej scenie. Pełne nagrania i zrzuty wszystkich etapów są w `sources/{pl,en}/`; dokładne fragmenty i hashe w `output/edit-manifest-{pl,en}.json`.

Końcowa pauza sceny zamknięcia pokazuje stabilną klatkę podsumowania wyciętą z 0,3 s kolejnego oryginalnego nagrania eksportu z tej samej sesji. Pozwala to uniknąć zatrzymania na animacji przejścia między ekranami. Obrazu UI nie przerysowywano.

Ekrany i wyniki pochodzą z nowej sesji w dedykowanym emulatorze `emulator-5556`, nie z przemianowania tarasu. Baza danych potwierdza nazwę pokoju, jego geometrię i historię zapisanej korekty. Zachowano źródłowy PNG bez zmian, wraz ze znakiem wodnym Free. Schemat obok telefonu jest objaśnieniem wykonanym w SVG, poza UI.

Przykład demonstracyjny z ręcznie wprowadzonymi wymiarami nie dokumentuje rzeczywistego pomiaru wnętrza ani dokładności sensorów. Kierunki są wpisane ręcznie; bok zamykający jest wyliczony, nie zmierzony. Telefon nie zastępuje przyrządu pomiarowego. Nie zmieniano kodu aplikacji ani APK i nie używano testowego uprawnienia Plus.

Zgodnie z preferencjami użytkownika brak technicznych podpisów i dolnych ścieżek napisów dublujących opis. W obrazie pozostają instrukcje przydatne widzowi. Szczegóły produkcji są wyłącznie w dokumentacji; kredyty muzyczne pod odtwarzaczem i w metadanych.

## Muzyka

Nowy utwór: **Dream Culture — Kevin MacLeod (incompetech.com)**, [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), [oficjalne źródło](https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1300046). MP3 pobrano z `https://incompetech.com/music/royalty-free/mp3-royaltyfree/Dream%20Culture.mp3`.

Fragment 72 s, cichy poziom około −24 LUFS, wejście 2 s i wyjście 4 s. Kredyty w `output/MUSIC-CREDITS.txt` należy zachować w opisie publikowanego filmu. Wersje `*-silent.mp4` zachowano bez dźwięku.

## Odtworzenie i kontrola

`node media/www/video-v05/prepare.cjs` sprawdza geometrię i korektę w źródłowej bazie SQLite, zapisuje `project.json` i kopiuje oryginalny PNG do `output`.

`node media/www/video-v05/render.cjs` odtwarza oba filmy; można podać `pl` albo `en`. Wymaga Node, `app/node_modules/sharp` oraz `C:/ffmpeg/ffmpeg.exe` (lub `V05_FFMPEG`).

`node media/www/video-v05/verify.cjs` sprawdza geometrię, zapis korekty, oryginalny PNG, 72 s i pełne dekodowanie 2160 klatek na język, dźwięk i jego poziom, zgodność obrazu z wersją bez muzyki, źródłowe hashe, pauzy, brak ścieżek napisów, odwołania podglądu, oddalenie bez przesunięć oraz opis ilustracji w HTML i MP4. Raport w `output/verification.json`, kadry w `output/contact-sheet-{pl,en}.png`.

`node media/www/video-v05/capture.cjs pl` i odpowiednio `en` odtwarzają sesję nagrania wyłącznie na dedykowanym emulatorze z root ADB. Skrypt wykonuje kopię bazy, następnie zastępuje ją pustą bazą demonstracyjną. Nie uruchamiać na urządzeniu z prywatnymi danymi. Wykorzystuje pusty wzorzec z `../video-v02/sources/{pl,en}/initial.db` i zainstalowany oryginalny APK.

Po nagraniu obu języków uruchomiono `restore.cjs`: przywrócono demonstracyjną bazę sprzed sesji PL (wraz z WAL/SHM i zgodnymi SHA-256), ustawiono język EN, wyłączono wskaźniki dotknięć i zegar demonstracyjny. Produkcyjny APK ma tę samą sumę co przed sesją. Raport: `sources/restoration.json`. Skrypt przywracania jest przeznaczony wyłącznie do tego samego emulatora i jego zachowanej kopii demonstracyjnej.
