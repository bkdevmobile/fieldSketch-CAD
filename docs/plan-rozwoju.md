# Ogólny plan rozwoju outlineGo

Stan na **21 października 2026**, kod aplikacji **acf99a0**, wersja 0.1.0. Kierunek prac ustalono z użytkownikiem 19 października. Testy zamknięte wcześniejszego MVP zakończono decyzją użytkownika 20 października dla kodu 9a54555 i APK 30CB381F…; nie oznacza to publikacji produkcyjnej ani zaliczenia każdej późniejszej funkcji. Szczegóły: [MEMO](../MEMO.md).

## Etapy

1. **Testy technologii** — wykonane próby trybu względnego mają zaakceptowaną przez użytkownika dokładność. Krokomierz zaakceptowano; dodatkowe kroki użytkownik wiąże z ruchem telefonu. Nie określono liczbowego progu dokładności i nie rozszerzono odbioru automatycznie na tryb magnetyczny.
2. **Działanie i UI** — wdrożone: wizard Kierunek → Długość → Zapis, ręczne m/cm, krokomierz Start/Stop, pływający szkic, korekty, zapis i wznowienie, pomoc pierwszego pomiaru, branding i styl Teren. Ostatni przyrost dodaje notatki, przypinanie, zbiorczą edycję wymiarów, nawigację po punktach i ponowny pomiar oraz unikanie kolizji opisów.
3. **Wersja pre-release i testy zamknięte** — wcześniejszy etap MVP zamknięty decyzją użytkownika. Nowe funkcje mają własne wyniki i pozostałe próby, opisane poniżej.
4. **Model zarabiania** — zasady Free/Plus i cena w PLN zaakceptowane. Limity i oferta są wdrożone; integracja zakupów pozostaje do wykonania.
5. **Release i publikacja** — w przygotowaniu. Wielojęzyczność jest wdrożona; produkcji nie opublikowano.

## Wdrożone po zakończeniu testów zamkniętych

- [DXF 2D](technical/eksport-dxf.md): lokalne XY, R2000, m/cm, obrys i opisy na osobnych warstwach. Pierwszą wersję sprawdzono w LibreCAD; nowy układ etykiet i notatki wymaga ponownej kontroli w CAD.
- [Free/Plus](technical/free-plus.md): Free do 8 punktów i 3 szkiców, PNG ze znakiem wodnym, bramka DXF. Istniejące większe szkice pozostają dostępne; korekty nie wymagają Plus.
- [Wielojęzyczność](technical/wielojezycznosc.md): PL/EN/DE/ES/FR, domyślnie język telefonu z angielskim jako rezerwowym, ręczny wybór w ustawieniach i synchronizacja Android 13+.
- [Edycja szkiców](technical/edycja-szkicu.md): notatka, przypinanie, tabela wymiarów, korekta kąta wybranego boku, ponowny pomiar i lokalna korekta długości zamknięcia. Obserwacje źródłowe pozostają w historii.

## Model Free / Plus

**outlineGo Plus: 29,99 zł jednorazowo**, bez własnego backendu i konta outlineGo. Ceny innych rynków pozostają do ustalenia.

| Funkcja | Free | Docelowy Plus |
| --- | --- | --- |
| Punkty w szkicu | Do 8, z P1 | Bez limitu produktu |
| Zapisane szkice | Do 3 | Bez limitu produktu |
| PNG | Ze znakiem wodnym | Bez znaku wodnego |
| DXF | Niedostępny | Dostępny |
| Notatka, przypinanie, korekty i ponowny pomiar istniejącego boku | Dostępne | Dostępne |

Zakup i przywracanie nie są podłączone. Obecny plan jest Free; nie można jeszcze kupić Plus ani odblokować DXF. Istniejące szkice ponad limity można przeglądać i poprawiać. Przy P8 można automatycznie zamknąć obrys lub zostawić go otwartym; nie ma wyjątku dla dodatkowego pomiaru powrotu. Zakup ma umożliwiać kontynuację tego samego szkicu, a potwierdzone Plus działać offline. Pełne reguły: [specyfikacja](technical/free-plus.md).

## Prace przed release

- Podłączyć Google Play Billing, zakup i przywracanie Plus, trwałe uprawnienie offline oraz obsługę zakupów oczekujących, anulowania i przerwania aplikacji.
- Doprecyzować użytkownika docelowego, ofertę i ceny dla pozostałych rynków.
- Wykonać fizyczną próbę ponownego pomiaru wcześniejszego boku: odniesienie sensorowe, długość z krokomierza, przeliczenie dalszych punktów i kontynuacja rysowania. Sprawdzić także zamknięte szkice oraz limit Free.
- Sprawdzić nowy DXF z notatkami i odsuniętymi opisami w CAD oraz udostępnianie na telefonie; drugi program CAD pozostaje otwartą próbą.
- Dopracować wygląd w stylu Teren, czytelność na różnych ekranach i po tłumaczeniu. Zachować stałe dolne akcje i stabilne położenie celownika. Nowe etykiety mają kontrolę kolizji; pełny przegląd wizualny nadal pozostaje.
- Przeprowadzić korektę językową tłumaczeń i przegląd ich układu. Dodatkowa próba powrotu do języka systemowego i natywnego PNG z iteracji lokalizacji pozostaje do powtórzenia.
- Przygotować listę wymagań publikacji, materiały sklepowe i kryteria wydania; dopiero potem opublikować wersję produkcyjną.

Solver sieci, przekątne kontrolne, edytor ograniczeń i migracja SDK pozostają poza bieżącym przyrostem.

## Potwierdzony stan i instalacje

TypeScript i 127 testów TS przeszły. Pełny build APK zakończył się sukcesem w 10m 38s; testy Kotlin UP-TO-DATE. Na emulatorze zachowano 10 szkiców, sprawdzono notatkę i przypięcie po restarcie, korektę 200 → 250 cm oraz ręczny ponowny pomiar P1 → P2 do 300 cm. Obejrzano edytor i trzy rendery PNG. Te wyniki nie potwierdzają dokładności fizycznych sensorów.

Najnowszy APK D16ED88C… jest zainstalowany wyłącznie na emulatorze. Redmi nadal ma build DXF 9E8708ED… z 20 października, bez późniejszych limitów i wielojęzyczności. Pełny hash i historia: [MEMO](../MEMO.md).
