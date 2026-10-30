# Ilustracje WWW 01–04 — PL

## Aktualizacja CAD v2

Na prośbę użytkownika przygotowano `03-eksport-dxf-v2.png` i `04-ten-sam-obrys-v2.png`: czarne pole robocze, jasny obrys oraz klasyczne szare paski narzędzi inspirowane dostarczoną referencją CAD. Są to preferowane wersje 03/04 do dalszych prac. Wcześniejsze pliki zachowano. Widoki programu pozostają ilustracyjne; nie są zrzutami rzeczywistego importu w LibreCAD. Prompty korekty zapisano w `prompts-cad-v2.json`. Wykonano kontrolę wizualną obrysu i kompozycji. Nie wdrażano na WWW.

Przygotowano 29.10.2026 narzędziem image_gen. Cztery oddzielne PNG 1536 × 1024, do dalszego wykorzystania przy budowie serwisu. Nie opublikowano ich w Firebase ani nie podłączono do obecnego landing page.

- `01-pierwszy-szkic.png`: telefon z przykładem szkicu i trzy kroki. Usunięto błędnie dopisany przez generator opis wyboru kierunku przesuwaniem palca.
- `02-ogrod-i-punkty.png`: wygenerowany ogród z poglądowym obrysem L, punkty P1–P6. Nie jest dokumentacją rzeczywistego pomiaru. Proporcje na zdjęciu są ilustracyjne.
- `03-eksport-dxf.png`: ilustracja przepływu telefon → DXF → komputer, oznaczenie Plus. Oba ekrany są ilustracjami. Przy wykorzystaniu na stronie dodać podpis „Ilustracja przepływu pracy; widok CAD jest poglądowy”.
- `04-ten-sam-obrys.png`: porównanie szkicu telefonu i poglądowego widoku komputerowego z oznaczeniem Plus i podpisem o ilustracyjnym charakterze CAD.

Źródłem referencyjnym ekranów w 01 i 04 jest `googlePlay/emulator-screenshots/pl/phone/04-sketch.png`. Generator przetworzył ekran, więc wynikowych grafik nie należy opisywać jako niezmienione rzeczywiste zrzuty aplikacji. Osobne instrukcje funkcjonalne powinny używać oryginalnych PNG. Nie przedstawiać 03/04 jako dowodu zweryfikowanego importu pliku w konkretnym programie CAD.

Pełne prompty produkcyjne i korekta 01: `prompts.json`. Generowanie bez nadpisywania istniejących materiałów. Pliki są ilustracjami PL; napisy są częścią bitmap. Wersje EN oraz responsywne eksporty WWW należy przygotować przy ustalaniu układu stron.
