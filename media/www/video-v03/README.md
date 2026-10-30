# V03 — Od pomiaru do szkicu

Wersja ilustracyjna, przygotowana lokalnie 30.10.2026: **45 sekund**, PL i EN, 1920 × 1080 / 30 kl./s, H.264 i AAC stereo 48 kHz. Bez publikacji.

- [Podgląd PL](output/preview-pl.html) · [MP4 PL](output/v03-garden-pl.mp4)
- [Podgląd EN](output/preview-en.html) · [MP4 EN](output/v03-garden-en.mp4)

## Obraz i montaż

Na polecenie użytkownika film wykorzystuje wygenerowany obraz: osoba mierząca bok tarasu taśmą i trzymająca telefon ekranem do siebie. Obraz utworzono wbudowanym narzędziem **ImageGen**. Źródło zapisano w `sources/garden-measurement.png`, pełny prompt w [sources/image-prompt.txt](sources/image-prompt.txt). Osoba jest fikcyjna.

Pierwsze 12 s to subtelne zbliżenie obrazu (1,000 → 1,035). **Postać pozostaje nieruchoma**: to animacja kadru, nie generatywne wideo z ruchem człowieka i nie dokumentacja rzeczywistego pomiaru terenowego. Nie uruchamiano płatnego generatora wideo Weave ani Runway.

12–29 s: rzeczywiste nagranie ręcznego wpisania długości i zapisu punktu z V02, obok wygenerowana scena. Bez przyspieszania; końcowa pauza co najmniej 9 s. 29–45 s: rzeczywiste podsumowanie tego samego przykładu z V04 oraz oryginalny PNG Free z V02. Przykład tarasu 4 × 3 m, 14 m / 12 m² jest demonstracyjny; zdjęcie nie stanowi dowodu zmierzenia tych wartości. Zamykający bok jest wyliczony. Zachowano znak wodny Free.

Ekrany aplikacji i PNG pochodzą z zachowanych źródeł `../video-v02/` i `../video-v04/`; nie generowano interfejsu. Pochodzenie, hashe i montaż w `output/edit-manifest-{pl,en}.json`. Podsumowanie z V04 dziedziczy opisane tam warunki tymczasowego testowego uprawnienia Plus; kod i APK przywrócono w tamtej sesji. Podczas przygotowania V03 nie zmieniano aplikacji, urządzeń ani tych źródeł.

W obrazie wyłącznie treści pomocne widzowi, bez technicznych napisów i dolnych ścieżek napisów. Informacja o ilustracyjnym pochodzeniu jest pod odtwarzaczem HTML, w metadanych MP4 i dokumentacji. Przy publikacji należy zachować ją w opisie filmu, wraz z kredytami muzycznymi.

## Muzyka

Inna melodia niż w V01/V02/V04: **Wallpaper — Kevin MacLeod (incompetech.com)**, [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), [oficjalne źródło](https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100843). Plik pobrano z `https://incompetech.com/music/royalty-free/mp3-royaltyfree/Wallpaper.mp3`.

Fragment 45 s, cichy podkład około −24 LUFS, wejście 2 s, wyjście 3 s, AAC stereo. Kredyty pod odtwarzaczem, w metadanych i `output/MUSIC-CREDITS.txt`. Zachowano wersje `*-silent.mp4` bez dźwięku.

## Odtworzenie i kontrola

`node media/www/video-v03/render.cjs` odtwarza obie wersje; można podać `pl` lub `en`. Wymaga Node, `app/node_modules/sharp` oraz `C:/ffmpeg/ffmpeg.exe` (lub `V03_FFMPEG`).

`node media/www/video-v03/verify.cjs` kontroluje pełne dekodowanie 1350 klatek każdego filmu, czas 45 s, 1080p/30, dźwięk i jego poziom, zgodność obrazu z wersją bez muzyki, oryginalne źródła i PNG, ruch kadru, brak ścieżek napisów oraz lokalne odwołania podglądu. Raport: `output/verification.json`; kadry do oceny: `output/contact-sheet-{pl,en}.png`. Pliki pośrednie w `rendered/` są pomijane przez Git.

Wcześniejszy [CONCEPT.md](CONCEPT.md) zachowuje historię próby pełnego generatywnego wideo, której nie wykonano. Niniejszy wariant z obrazem powstał po późniejszym poleceniu użytkownika.
