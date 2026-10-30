# WWW — wdrożenie stron pierwszego etapu

Odbiór mobilny 30.10.2026: użytkownik potwierdził poprawne działanie strony na telefonie i zlecił commit oraz publikację na Firebase Hosting w projekcie outlinego-27ab5.

SEO 30.10.2026: wdrożono punkty 1, 3 i 4 audytu. Zmniejszono warianty WWW dwóch najcięższych ekranów PL/EN, doprecyzowano lead strony głównej i dodano JSON-LD WebSite na obu stronach głównych oraz BreadcrumbList na sześciu poradnikach. WebSite ma jeden identyfikator i URL domeny; główny adres przekierowuje do EN. Kontrola JSON-LD porównuje pozycje, adresy i nazwy z widocznymi okruszkami. Kontrole mediów i stron po HTTP przeszły. Bez publikacji; pomiar wydajności na telefonie pozostaje osobnym krokiem.

Poprawki po odbiorze 30.10.2026: ujednolicono numerację poradnika ogrodu PL/EN do 01–04 i połączono niełamliwą spacją wartość 8,2/8.2 z jednostką m w poradniku korekty. Dodano obsługę Escape i zdarzenia cancel w powiększeniu obrazów. Po odświeżeniu podglądu VS Code potwierdzono zamknięcie klawiszem Escape i powrót fokusu do obrazu oraz poprawny podpis z nierozdzielonym „8,2 m”. Kontrola `node scripts/verify-www.cjs --http` i składnia JS przeszły. Pozostaje odbiór na telefonie; zmiany lokalne, bez publikacji.

Aktualizacja panelu udostępniania 30.10.2026: na uwagę użytkownika zastąpiono używany w poradnikach DXF surowy zrzut bez ikon przygotowanymi wcześniej ilustracjami v2 PL/EN z e-mailem, wiadomościami i zapisem pliku. Osobne warianty WebP zachowują źródła w manifeście, a podpisy nie określają już ilustracji jako oryginalnego panelu systemowego. Nie zmieniano aplikacji ani oryginalnych zrzutów. Bez deployu.

## Odbiór desktop w podglądzie VS Code — 30.10.2026

Po niedostępnym połączeniu z Chrome użytkownik wskazał otwarte okno VS Code. Przeprowadzono rzeczywisty przegląd zrzutów podglądu `http://127.0.0.1:4173/pl/` (obszar strony około 1270 × 875 px w oknie 2906 × 1392 px; nie jest to test telefonu). Obejrzano całą stronę główną PL, wszystkie kroki poradnika pierwszego szkicu PL i przykładu ogrodu PL oraz zasadnicze sekcje DXF EN. Dodatkowo otwarto pozostałe odpowiedniki: stronę główną EN, wstęp instrukcji EN, wstęp i wynik ogrodu EN oraz wstęp i pobieranie DXF PL. Nie oznacza to pełnego przeglądu każdej sekcji wszystkich ośmiu stron.

W obejrzanych widokach nie stwierdzono nakładania treści ani poziomego przepełnienia. Nagłówek, wyrównanie PL/EN, oficjalne przyciski sklepu, tabele, diagramy i sekcje CTA renderują się poprawnie. Potwierdzono nawigację z menu, powrót przez logo, przełączanie języka na właściwy odpowiednik, skoki do wyniku/pliku oraz rozwinięcie FAQ ogrodu. Powiększenie obrazu działa; zamknięcie przyciskiem przywraca widoczne obramowanie fokusu na oryginalnym linku obrazu. Escape nie zamknął dialogu w tej próbie w VS Code; nie przesądzono, czy przyczyną jest obsługa klawisza przez hosta. Wymaga osobnej próby w zwykłej przeglądarce, podobnie jak pełna obsługa klawiatury.

Znalezione drobiazgi do poprawy: powtórzona numeracja `01` w poradniku ogrodu (sekcja przygotowania i kolejny krok), jednostka `m` na osobnym wierszu w podpisie zrzutu korekty 8 → 8,2 m. Nie zmieniano treści ani stylów w ramach samego odbioru. `node scripts/verify-www.cjs --http` przeszedł: osiem stron, sześć dokumentów, struktura/metadane/linki i zasoby oraz HTTP 200/301/404 i integralność czterech plików PNG/DXF. Pobieranie zweryfikowano po HTTP, nie przez zapis pliku w GUI. Nie klikano Google Play ani nie sprawdzano dostępności oferty sklepu. Nie wykonano deployu.

Następnie: drobne poprawki, wąski ekran/telefon i próba Escape w zwykłej przeglądarce; dopiero po odbiorze publikacja i kontrola produkcji. Podgląd pozostawiono na polskiej stronie głównej. Starsze informacje poniżej o braku jakiegokolwiek odbioru wizualnego dotyczą poprzednich sesji.

Dokumenty prawne PL/EN zaktualizowano następnie według kodu aplikacji 1.0.0 / 4: dane lokalne i logi, cache eksportów, billing, jednostki, tryby i DXF. Szczegóły i potwierdzenia w [notatkach prawnych](legal/README.md). Nadal robocze, nieopublikowane; kontrola sześciu dokumentów i ośmiu stron przechodzi.

Aktualizacja lokalna 30.10.2026 po złożeniu etapu: poprawiono wyrównanie przełącznika języka, dodano oficjalne grafiki Google Play PL/EN oraz [polskie dokumenty prawne](legal/README.md) z odnośnikami na stronach PL i przełączaniem wersji dokumentów. Pozostają robocze i `noindex`, poza mapą. Kontrola `node scripts/verify-www.cjs` przechodzi także dla sześciu dokumentów. Nie wykonano deployu ani odbioru wizualnego tych zmian. Opis poniżej dokumentuje wcześniejszy stan etapu.

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
