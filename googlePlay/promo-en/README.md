# outlineGo — film promocyjny EN

Gotowy plik: `outlineGo-promo-15s-1080x1920.mp4`.

Wersja z muzyką: **`outlineGo-promo-15s-with-music.mp4`**. Dodano pierwsze 15 sekund „Carefree” Kevina MacLeoda, normalizację do celu −16 LUFS, łagodne wejście 0,4 s i wyciszenie 1,3 s. Ścieżka AAC stereo 48 kHz / 192 kb/s. Autor, licencja CC BY 4.0 i informacja o modyfikacjach są na planszy końcowej i w metadanych. Tekst do opisu publikacji znajduje się w `MUSIC-CREDITS.txt`. Źródło: https://incompetech.com/music/royalty-free/mp3-royaltyfree/Carefree.mp3. Odtworzenie montażu: `node googlePlay/promo-en/add-music.cjs`. `music-validation.log` potwierdza pełne dekodowanie obrazu i dźwięku (15 s, 450 klatek); szczyt audio po kodowaniu −2,4 dBFS.

- 15 sekund, 1080 × 1920 px (9:16), 30 kl./s, 450 klatek.
- MP4, H.264, yuv420p, faststart; bez ścieżki dźwiękowej.
- Cztery sceny: pomiar w ogrodzie → eksport szkicu → osobny program CAD → Google Play.
- Angielskie napisy, stabilne plansze i płynne przenikanie scen. W korekcie v2 usunięto skokowe zbliżenia całego kadru.
- Oryginalny ekran aplikacji i poprawione zdjęcie z ekranem telefonu skierowanym do kobiety. Scena CAD jest ilustracyjna; eksport DXF wymaga Plus.

`storyboard.png` przedstawia plansze źródłowe. `video-preview.png` zawiera klatki wyciągnięte z gotowego filmu w sekundach 1,5 / 5,5 / 9,5 / 13,5. `validation.log` potwierdza pełne dekodowanie 450 klatek bez błędów.

Odtworzenie: `node googlePlay/promo-en/render.cjs` z katalogu projektu. Wymagane zależności aplikacji (`sharp`) i FFmpeg pod `C:/ffmpeg/ffmpeg.exe` lub wskazany zmienną `PROMO_FFMPEG`.

Przygotowano 26.10.2026. Film zapisano lokalnie; nie został opublikowany.
