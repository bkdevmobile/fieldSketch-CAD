# LibreCAD — rzeczywiste zrzuty importu DXF, PL i EN

Sesja **29.10.2026**, LibreCAD **2.2.1.5** na Windows, Qt 5.15.2 (wersję potwierdzono w oknie About). Własne pliki DXF wyeksportowane wcześniej z outlineGo 1.0.0/v4 otwarto w rzeczywistym LibreCAD. Nie używano generatora obrazów i nie przerysowywano interfejsu ani obrysu.

## Materiały do strony

W obu katalogach `pl/` i `en/`:

- `01-import-overview.jpg` — pełny obrys ogrodu z punktami P1–P6, opisami długości, notatką i listą warstw.
- `02-dimension-detail.jpg` — powiększony fragment z bokiem P1–P2 opisanym jako 8 m. Kadrowanie uzyskano powiększeniem w programie, nie obróbką bitmapy.
- `03-units-and-layers.jpg` — preferencje rysunku z jednostką Metr / Meter oraz listą warstw w tle.

Dodatkowe dowody w `en/`:

- `04-distance-check.jpg` — kontrola odległości P1–P2 narzędziem Distance Point to Point z wyłącznym przyciąganiem do końców: wynik **8.0000**, ΔX **8.0000**, ΔY **0.0000**. W historii widać również wcześniejszy odczyt 8.0007 bez skutecznego przyciągania; miarodajny jest późniejszy pomiar punktów końcowych, nie pierwszy odczyt kursora.
- `05-librecad-version.jpg` — informacja o wersji programu.

## Pochodzenie i sprawdzenie

Źródła: `../app-screenshots/exports/garden-pl.dxf` i `garden-en.dxf`. SHA256 po sesji jest zgodne z raportem eksportu:

- PL: `84e0917d42e2d30ae6376fd4ba6518682ccb79bbe013d3ca66640ae52d79dcd4`.
- EN: `076a5b68d640620a1bb538cd09d5d0e49cc8022d86d583865085731bc37e079b`.

LibreCAD poprawnie pokazał obrys L i warstwy `OUTLINE`, `LENGTHS`, `POINT_LABELS`, `NOTES`. Warstwa `0` także jest widoczna. Długości w eksporcie są obiektami tekstowymi, nie natywnymi encjami wymiarowymi CAD. Sam napis „8 m” nie był podstawą kontroli skali — wykonano dodatkowy pomiar końców geometrii. W obu plikach jednostkę rysunku odczytano jako metr.

Zrzuty są oryginalnymi JPEG udostępnionymi przez `@oai/sky.get_window_state`, zapisanymi bez kolejnego kodowania. Wymiary i SHA256 każdego pliku zawiera `verification.json`; `capture-manifest.json` dokumentuje przechwycenia. Arkusze `contact-sheet-{pl,en}.jpg` służą do przeglądu, nie zastępują oryginałów. W tym zestawie nie ma zrzutów pulpitu ani cudzych rysunków.

Zoom i odczyt ustawień mogą oznaczać dokument gwiazdką i uruchomić autosave LibreCAD (`#garden-*.dxf`), ale nie zapisano ich nad źródłowym eksportem. Źródła pozostały zgodne bajtowo. Interfejs PL uruchomiono w osobnym oknie po ustawieniu polskiego języka GUI; angielskie okno pozostawiono otwarte. Preferencja GUI pozostaje ustawiona na PL; język poleceń jest angielski.

Przy publikacji podpisywać np. „Szkic wyeksportowany z outlineGo, otwarty w LibreCAD 2.2.1.5”. To dokumentacja działania osobnego programu, bez deklaracji partnerstwa. Pochodzenie uprawnienia Plus przy tworzeniu DXF opisano w `../app-screenshots/README.md`: tymczasowy mock został już usunięty. Zrzuty CAD nie stanowią testu zakupu/licencji ani dokładności pomiarów fizycznych.

Nie podłączano jeszcze materiałów do strony i nie wykonywano deployu.
