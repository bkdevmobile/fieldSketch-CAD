# WWW — wdrożenie stron pierwszego etapu

Złożono 30.10.2026. Pliki są przygotowane lokalnie w `public/`; nie wykonano deployu.

Commit stron: **`d0682b6`** — `Build first-stage Polish and English website pages`. Media źródłowe zapisano wcześniej w `e6f27d3` i `91086bf`. Zakres obejmuje tylko etap 1; pokój, pomoc i nagrania wideo pozostają poza bieżącą realizacją.

| Strona | PL | EN |
| --- | --- | --- |
| Strona główna | `/pl/` | `/en/` |
| Pierwszy szkic | `/pl/jak-to-dziala/` | `/en/how-it-works/` |
| Ogród | `/pl/szkic-ogrodu/` | `/en/garden-sketch/` |
| DXF | `/pl/eksport-dxf/` | `/en/dxf-export/` |

Każda strona zawiera samodzielną treść HTML, przełącznik do odpowiednika językowego, wspólne menu, canonical, wzajemne hreflang, Open Graph i link do Google Play. Trzy poradniki mają okruszki i linki do kolejnego kroku. Mapa zawiera osiem docelowych adresów. Firebase przekieruje `/` i `/index.html` kodem 301 do `/en/`; lokalny `index.html` zawiera także prosty fallback. Dotychczasowe adresy dokumentów prawnych, weryfikacja Google i robots.txt zostały zachowane.

Źródło stron: `scripts/build-www.cjs`. Wspólny wygląd i powiększanie obrazów: `public/assets/www.css` i `www.js`. Do `public/assets/stage1/` kopiowane są tylko wykorzystane pliki z zestawu mediów. Zrzuty zachowują proporcje; warianty mają srcset i wymiary. Powiększenie działa w dialogu z obsługą Escape i przywróceniem fokusu; bez JS link otwiera obraz. FAQ wykorzystuje natywne details.

Treści odróżniają dane demonstracyjne od pomiaru terenowego, bok wyliczony od mierzonego, PNG Free od DXF Plus. Korekta 8 → 8,2 m jest opisana jako niezapisana. Notatka zapisuje się automatycznie zgodnie z aktualnym komponentem aplikacji. Udostępniono oryginalne PNG Free i sprawdzone DXF. Dokumenty prawne są linkowane w obecnej wersji EN. Nie dodano pustych stron pokoju, pomocy ani filmów.

Odtworzenie: `node scripts/build-www.cjs`.

Kontrola plików: `node scripts/verify-www.cjs`. Podgląd: `node scripts/preview-www.cjs`, adres `http://127.0.0.1:4173/pl/`. Kontrola HTTP przy działającym podglądzie: `node scripts/verify-www.cjs --http`. Podgląd stosuje przekierowania z konfiguracji Firebase i rzeczywiste 404. Nie uruchamia Firebase ani publikacji.

Wykonana kontrola `node scripts/verify-www.cjs --serve` przeszła: osiem stron, unikalne metadane, wzajemne pary językowe, 374 lokalne odwołania, 56 obrazów z alt i wymiarami oraz 71 użytych w HTML mediów zgodnych bajtowo z manifestem. Potwierdzono HTTP 200 stron, przekierowania 301, rzeczywiste 404 i integralność czterech pobieranych PNG/DXF. Opcja `--serve` sama uruchamia i zamyka serwer kontrolny.

Ograniczenie odbioru: kontrola wizualna w przeglądarce nie została ukończona. Narzędzie nie udostępniło przeglądarki sterowanej, a otwarcie natywnego Chrome zakończyło się komunikatem „Computer Use app approval timed out”. Kontrola szerokości i interakcji na rzeczywistym desktopie/telefonie wymaga dokończenia przed publikacją. Skrypty weryfikują strukturę, linki i pliki; nie zastępują renderowania responsywnego layoutu.

Do wznowienia: sprawdzić desktop i wąski ekran, menu, odpowiedniki językowe, powiększanie obrazów (Escape/fokus), FAQ oraz pobieranie PNG/DXF. Po poprawkach ponowić kontrolę skryptem, wykonać deploy do istniejącego Firebase `outlinego-27ab5`, a następnie sprawdzić nowe adresy, przekierowania, canonical/hreflang i mapę na produkcji. Dopiero wtedy sprawdzać przetworzenie nowej mapy w Search Console; indeksowanie pozostaje niepotwierdzone.
