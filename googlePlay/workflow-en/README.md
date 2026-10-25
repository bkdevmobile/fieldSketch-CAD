# From field to a finished plan — wariant EN

Wybrana propozycja nr 2, przygotowana 25.10.2026: **pomiar w terenie → eksport szkicu → dopracowanie na komputerze**.

## Pliki do Play Console

| Galeria | Plik | Wymiary | Proporcje |
| --- | --- | --- | --- |
| Telefon | `phone/03-from-field-to-plan.png` | 1080 × 1920 | 9:16 |
| Tablet 7″ | `tablet-7/03-from-field-to-plan.png` | 1920 × 1080 | 16:9 |
| Tablet 10″ | `tablet-10/03-from-field-to-plan.png` | 2560 × 1440 | 16:9 |

Identyczne kopie do przesłania są w odpowiednich folderach `googlePlay/en/screenshots/phone/`, `tablet-7/` i `tablet-10/`, obok wcześniejszych materiałów EN. Każdy plik jest PNG RGB poniżej 8 000 000 bajtów. Raporty: `verification.json` i `source-verification.json`.

## Prawdziwy zrzut i pochodzenie

Środkowy panel wykorzystuje oryginalny angielski ekran **Summary** z `googlePlay/emulator-screenshots/en/{phone,tablet-7,tablet-10}/03-summary.png`. Każdy profil otrzymuje własny zrzut emulatora. Kopie w `sources/app-*.png` są identyczne bajtowo ze źródłami, co potwierdzają sumy SHA256. Interfejs nie został wygenerowany ani przerysowany; obraz źródłowy jest wyświetlany w ramce z zachowaniem proporcji. To prawdziwy ekran aplikacji z przykładowymi danymi: obwód 32 m i pole 55 m². Szczegóły APK i emulatora: [opis zrzutów](../emulator-screenshots/README.md).

Sceny ogrodu i komputera w `sources/field.png` oraz `sources/cad.png` wygenerowano przez imagegen na podstawie wybranej propozycji. Telefon w scenie terenowej jest ustawiony pionowo i pokazuje tył urządzenia; nie zawiera fikcyjnego interfejsu. CAD przedstawia osobny program komputerowy, a jego widok jest ilustracją. Nie jest to desktopowa wersja outlineGo ani dokumentacja rzeczywistego importu. Materiały wskazują, że eksport DXF wymaga Plus.

Angielskie napisy: **From field to a finished plan.**, **Measure in the field**, **Export your sketch**, **Refine on your computer**. Układ pionowy telefonu mocniej eksponuje oryginalny ekran aplikacji; układy tabletowe zachowują trzy karty obok siebie.

## Odtworzenie

Z katalogu repozytorium:

```powershell
node googlePlay/workflow-en/prepare.cjs
node googlePlay/workflow-en/render.cjs
```

Wymagane są zależności aplikacji (`sharp`), Node z `fetch`/`WebSocket` i Microsoft Edge we wskazanej w skrypcie ścieżce. `prepare.cjs` kopiuje oryginalne zrzuty i przygotowuje lekkie zasoby WebP. `render.cjs` renderuje układ HTML/CSS w dokładnych wymiarach, zapisuje PNG i kontroluje rozmiary. Pliki `layout-*.html` są lokalnymi źródłami składu, a nie screenshotami do przesłania do sklepu.

## WWW

Sekcja `#workflow` na stronie głównej odtwarza ten sam scenariusz w trzech kartach. Zrzut `public/assets/workflow-app-screen.png` jest niezmienioną kopią źródła telefonu. Zdjęcia mają WebP 480/960 px i `srcset`; na małym ekranie karty układają się pionowo. Wdrożenie i weryfikacja publicznych zasobów są zapisane w MEMO.
