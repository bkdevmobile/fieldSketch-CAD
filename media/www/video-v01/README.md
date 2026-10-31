# V01 — Od szkicu do CAD

Film przeglądowy przygotowany lokalnie 30.10.2026 w PL i EN: **60 sekund**, 1920 × 1080, 30 kl./s, H.264 i AAC stereo 48 kHz. Bez publikacji i integracji z WWW.

Korekta prywatności 30.10.2026: ujęcie LibreCAD kadruje wyłącznie obszar rysunku (x=36, y=90, 1740 × 750), bez paneli z lokalnymi plikami i ścieżkami. Poprawiono obie wersje oraz arkusze podglądu; czas i muzyka bez zmian. Surowe nagrania CAD pozostają materiałem produkcyjnym, a nie wersją do publikacji. Odpowiednia kontrola kadrowania została dodana do `verify.cjs`.

Korekta prywatności 30.10.2026: ujęcie LibreCAD kadruje wyłącznie obszar rysunku (x=36, y=90, 1740 × 750), bez paneli z lokalnymi plikami i ścieżkami. Poprawiono obie wersje oraz arkusze podglądu; czas i muzyka bez zmian. Surowe nagrania CAD pozostają materiałem produkcyjnym, a nie wersją do publikacji. Odpowiednia kontrola kadrowania została dodana do `verify.cjs`.

- [Podgląd PL](output/preview-pl.html) · [MP4 PL](output/v01-overview-pl.mp4)
- [Podgląd EN](output/preview-en.html) · [MP4 EN](output/v01-overview-en.mp4)

Przebieg: gotowy szkic (0–8 s), ręczne wpisanie długości i zapis boku (8–20 s), PNG (20–30 s), DXF Plus (30–40 s), ten sam plik w LibreCAD (40–52 s), zaproszenie do pobrania aplikacji (52–60 s). Przykład: taras 4 × 3 m, obwód 14 m i pole 12 m²; zamykający bok jest wyliczony. To krótki przegląd procesu; szczegółowe instrukcje pozostają w V02 i V04.

Wykorzystano oryginalne nagrania i zrzuty `../video-v02/sources/` i `../video-v04/sources/`. Nie przerysowywano UI. Ujęcie DXF po czterech sekundach przechodzi do rzeczywistego zrzutu gotowego systemowego okna udostępniania z tej samej sesji. Nie wybrano odbiorcy. Źródłowe nagrania Android mają zmienną liczbę klatek; pauzy uzupełniają ich statyczne końcówki do ustalonego czasu sceny, bez przyspieszania interakcji. Każda scena ma co najmniej 4 s pauzy. Pochodzenie i SHA-256 źródeł zapisano w `output/edit-manifest-{pl,en}.json`.

Zgodnie z preferencjami użytkownika w obrazie są wyłącznie przydatne widzowi treści; nie ma technicznych podpisów, oznaczeń V01 ani dolnych napisów dublujących opis. Podglądy HTML zawierają transkrypt, linki MP4, oryginalne PNG Free i DXF oraz odnośnik Google Play. Znak wodny Free zachowano. Oryginalne pliki PNG i DXF skopiowano bez zmian.

Materiał dziedziczy ograniczenia źródeł: ręczny przykład demonstracyjny, bez testowania sensorów lub pomiaru w terenie; eksport V04 wykonano z tymczasowym lokalnym uprawnieniem Plus. Nie dokumentuje to zakupu. Kod i APK przywrócono po wcześniejszej sesji V04; przy tworzeniu V01 nie uruchamiano emulatora i nie modyfikowano aplikacji. Szczegóły w [V02](../video-v02/README.md) i [V04](../video-v04/README.md).

## Muzyka

Nowa melodia, różna od V02 i V04: **Easy Lemon (60 second) — Kevin MacLeod (incompetech.com)**. [Oficjalne źródło i licencja](https://incompetech.com/music/royalty-free/index.html?Search=Search&isrc=USUAN1200077), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Plik pobrano z `https://incompetech.com/music/royalty-free/mp3-royaltyfree/Easy%20Lemon%2060%20second.mp3`.

Wykorzystano 60 s z cichą normalizacją (około −24 LUFS), wejściem 2 s i wyjściem 4 s. Kredyty są pod odtwarzaczem, w metadanych MP4 i `output/MUSIC-CREDITS.txt`. Przy publikacji należy umieścić je w opisie filmu. Wersje `*-silent.mp4` są bez dźwięku.

## Odtworzenie i kontrola

`node media/www/video-v01/render.cjs` odtwarza oba filmy z istniejących źródeł V02/V04. Można podać `pl` lub `en`. Wymaga Node, `app/node_modules/sharp` i `C:/ffmpeg/ffmpeg.exe` (lub `V01_FFMPEG`). Pliki pośrednie w `rendered/` są pomijane przez Git.

`node media/www/video-v01/verify.cjs` dekoduje całe filmy, sprawdza 60 s i 1800 klatek, format, dźwięk i jego poziom, brak ścieżek napisów, zgodność obrazu z wersją bez dźwięku, brak przyspieszeń, pauzy, hashe źródeł, niezmienione PNG/DXF i lokalne odwołania podglądu. Wyniki: `output/verification.json`. Arkusze klatek do przeglądu: `output/contact-sheet-{pl,en}.png`.
