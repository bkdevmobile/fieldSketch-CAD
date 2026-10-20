# outlineGo — logo i zasoby aplikacji

Wybrany 20.10.2026 **pierwszy wariant**: otwarty czworokątny obrys, trzy pierścienie i pełny punkt końcowy. Nie jest to późniejszy wariant w kształcie G. Zachowano kolory Teren: zieleń `#1B684B`, tekst `#183A2C`, tło `#F5F4EE`, jasny znak `#FFFEFA`.

- `mark.json` — wspólna geometria wektora dla komponentu `Brand.tsx` i generatora zasobów.
- `logo-mark.svg` / `.png` — znak bez tła.
- `icon.svg` / `.png` — tradycyjna ikona 1024 × 1024, bez zaokrąglania maski w samym pliku.
- `adaptive-foreground.svg` / `.png` — jasny znak na przezroczystym tle, z marginesem dla masek Androida.
- `adaptive-monochrome.svg` / `.png` — monochromatyczny znak dla ikon tematycznych.
- `splash-mark.svg` / `.png` — znak 512 × 512 na przezroczystym tle do natywnego splash screenu.

Odtworzenie: `npm run assets:brand` w `app/`. Generator `scripts/generate-brand-assets.cjs` wykorzystuje przypięty `sharp` i działa również przy pełnym budowaniu APK. Pliki wynikowe są wersjonowane, a plansze koncepcyjne w `artifacts/` nie są potrzebne do kompilacji.

W UI i PNG używamy wektora, dzięki czemu znak pozostaje ostry w różnych rozmiarach. Napis ma dokładną pisownię **outlineGo**. Zasoby do Androida generowane są z tej samej geometrii, bez wycinania logo z planszy koncepcyjnej.
