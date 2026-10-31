# V04 — Od szkicu do CAD

Gotowe lokalnie 30.10.2026: wersje PL i EN, po 144 s (2:24), 1920 × 1080, 30 kl./s, AAC stereo. Bez publikacji na WWW.

Korekta prywatności 30.10.2026: z obu wersji usunięto całe okno wyboru pliku z komputera. Etap otwierania pokazuje kartę przykładowego DXF i rzeczywisty widok już otwartego rysunku. W pozostałych ujęciach CAD pokazano wyłącznie obszar rysunku (crop x=36, y=90, 1740 × 750), osobny fragment preferencji jednostek i fragment odczytu długości. Panele z historią, listami plików oraz lokalnymi ścieżkami nie trafiają do filmu. Ta sama poprawka objęła V01, który korzysta z tych nagrań. Długość, geometria i muzyka pozostały bez zmian.

Surowe nagrania w `sources` zachowują lokalny materiał produkcyjny i nie są wersją do publikacji. W szczególności `02-open.mp4` jest wyłączony z montażu. Publikować wyłącznie poprawione filmy z `output`; skrypt weryfikacji sprawdza wykluczenie tego źródła i kadry CAD. Miniatury i arkusze klatek odtworzono z poprawionych filmów.

Korekta prywatności 30.10.2026: z obu wersji usunięto całe okno wyboru pliku z komputera. Etap otwierania pokazuje kartę przykładowego DXF i rzeczywisty widok już otwartego rysunku. W pozostałych ujęciach CAD pokazano wyłącznie obszar rysunku (crop x=36, y=90, 1740 × 750), osobny fragment preferencji jednostek i fragment odczytu długości. Panele z historią, listami plików oraz lokalnymi ścieżkami nie trafiają do filmu. Ta sama poprawka objęła V01, który korzysta z tych nagrań. Długość, geometria i muzyka pozostały bez zmian.

Surowe nagrania w `sources` zachowują lokalny materiał produkcyjny i nie są wersją do publikacji. W szczególności `02-open.mp4` jest wyłączony z montażu. Publikować wyłącznie poprawione filmy z `output`; skrypt weryfikacji sprawdza wykluczenie tego źródła i kadry CAD. Miniatury i arkusze klatek odtworzono z poprawionych filmów.

- [Podgląd PL](output/preview-pl.html) · [MP4 PL](output/v04-dxf-to-cad-pl.mp4)
- [Podgląd EN](output/preview-en.html) · [MP4 EN](output/v04-dxf-to-cad-en.mp4)
- Oryginalne eksporty: [DXF PL](output/patio-pl.dxf), [DXF EN](output/patio-en.dxf).

Film pokazuje eksport DXF w outlineGo, otwarcie pliku w LibreCAD, cały obrys, jednostkę Metr i kontrolę skali przez zaznaczenie obrysu oraz odczyt całkowitej długości 14 m. To ten sam przykład tarasu 4 × 3 m co w V02. Zamykający bok jest wyliczony. Opisy długości w DXF są tekstem, a nie natywnymi wymiarami CAD.

Zgodnie z życzeniem użytkownika nie dodano dolnych napisów dublujących instrukcje ani technicznych podpisów o produkcji, tempie lub emulatorze. Pozostają instrukcje przydatne widzowi. Fragmenty nie są przyspieszane, a końcowe pauzy trwają co najmniej 6 s. Nagrania aplikacji i programu CAD są rzeczywiste; montaż wykorzystuje pięć kolejnych etapów. Ostatni etap powiększa rzeczywisty pasek stanu CAD, aby ułatwić odczyt 14 m.

## Muzyka

Nowy utwór, inny niż w V02: **Life of Riley — Kevin MacLeod (incompetech.com)**, [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). [Oficjalne źródło](https://remote.incompetech.com/music/royalty-free/index.html?Search=Search&isrc=USUAN1400054).

Wykorzystano 144-sekundowy fragment, cichy poziom około −24 LUFS, wejście 2 s i wyjście 4 s. Kredyty są pod odtwarzaczem, w metadanych MP4 i `output/MUSIC-CREDITS.txt`; przy publikacji należy umieścić je także w opisie filmu. Wersje `*-silent.mp4` zachowano bez dźwięku.

## Pochodzenie i przywrócenie aplikacji

Źródła znajdują się w `sources/{pl,en}/`. Eksport wykonano w dedykowanym emulatorze Android z demonstracyjną bazą, korzystając z rzeczywistego kodu eksportu. Funkcja wymaga Plus; do nagrania zastosowano tymczasowe lokalne uprawnienie testowe. Materiał nie dokumentuje zakupu, sensorów ani fizycznego pomiaru terenowego. Pliki przeniesiono lokalnie przez ADB i otwarto w zainstalowanym LibreCAD; nie wysyłano ich do zewnętrznych odbiorców. Nagrywano okna programu i dialogów.

Po nagraniu przywrócono oryginalny kod StoreProvider i oryginalny APK emulatora. Produkcyjny `artifacts/outlineGo-1.0.0.apk` pozostał niezmieniony. Tymczasowe APK i skrypt budowania usunięto. Raport sum kontrolnych: `sources/restoration.json`. Pozostałości natywnego cache Gradle nie są dystrybucyjnym APK. Eksporty DXF w `output` są identyczne z oryginałami w `sources`; nie zapisano nad nimi zmian z CAD.

## Odtworzenie i kontrola

`node media/www/video-v04/render.cjs` odtwarza oba filmy. Wymaga Node, `app/node_modules/sharp` oraz `C:/ffmpeg/ffmpeg.exe` (lub `V04_FFMPEG`).

`node media/www/video-v04/verify.cjs` sprawdza oryginalne DXF, jednostkę metryczną, cztery wierzchołki, zamknięcie i obwód 14 m, pełne dekodowanie 4320 klatek każdego filmu, dźwięk, zgodność obrazu wersji muzycznej i bez dźwięku, brak ścieżek napisów, tempo i pauzy. Wynik: `output/verification.json`. Arkusze `output/contact-sheet-{pl,en}.png` sprawdzono wizualnie. Szczegółowy montaż: `output/edit-manifest-{pl,en}.json`.

`capture-app.cjs` jest przeznaczony wyłącznie do dedykowanego emulatora `emulator-5556`: zastępuje demonstracyjną bazę po wykonaniu kopii. Nie uruchamiać na urządzeniu z prywatnymi danymi. `record-cad.cjs` rejestruje wskazane okno za pomocą FFmpeg.
