# Ogólny plan rozwoju outlineGo

Stan po publikacji 30.10.2026: etap 1 WWW jest wdrożony na https://outlinego-27ab5.web.app/pl/ i /en/ — osiem stron marketingowych oraz sześć finalnych dokumentów prawnych PL/EN (obowiązują od 30.10.2026, temat redakcji zamknięty). Desktop sprawdzono w VS Code, telefon zaakceptował użytkownik. Wdrożono poprawki wizualne, oficjalne badge Google Play, aktualne ilustracje udostępniania, lżejsze obrazy, doprecyzowane leady i JSON-LD WebSite/BreadcrumbList. Commit SEO fdcc1f3; zapis wdrożenia 97e7e84; wersja Firebase 056f218e8640f749. Po publikacji 25 zasobów ma zgodne SHA-256 z plikami lokalnymi, 301 i 404 działają. Pozostają PageSpeed Insights/Core Web Vitals oraz kontrola przetworzenia mapy i indeksowania w Search Console; własna domena opcjonalnie. Nie zmieniano aplikacji ani APK/AAB. Filmy oraz etap 2 są poza zakończonym zakresem.

Historyczny stan aplikacji na **23 października 2026** (bieżące potwierdzenia paczek: stan-projektu.md): aplikacja 0.1.0 / versionCode 2, kod APK 8365dca. TypeScript i 183 testy w 24 zestawach przeszły. APK z Sentry, ekranem akceptacji i automatycznym zapisem notatek zbudowano, zainstalowano i uruchomiono na Redmi; pozostał odbiór funkcjonalny. AAB jest starszy. WWW opublikowane, dokumenty robocze; brak potwierdzenia produkcji w Google Play. [Aktualny stan](stan-projektu.md), [historia](../MEMO.md).

## Główny sposób korzystania z aplikacji

Ustalenie z **25 października 2026**: użytkownik wykonuje **szybki szkic w terenie na telefonie**, a następnie eksportuje go i **dopracowuje na komputerze**. Ten scenariusz stanowi punkt odniesienia przy planowaniu dalszego rozwoju aplikacji.

## Etapy

1. **Testy technologii** — wykonane próby trybu względnego mają zaakceptowaną przez użytkownika dokładność. Krokomierz zaakceptowano; dodatkowe kroki użytkownik wiąże z ruchem telefonu. Nie określono liczbowego progu dokładności i nie rozszerzono odbioru automatycznie na tryb magnetyczny.
2. **Działanie i UI** — wdrożone: wizard Kierunek → Długość → Zapis, ręczne m/cm/ft/in, krokomierz Start/Stop, dokowany i pływający szkic, korekty, zapis i wznowienie, pomoc pierwszego pomiaru, branding i styl Teren. Ostatni przyrost dodaje notatki, przypinanie, zbiorczą edycję wymiarów, nawigację po punktach i ponowny pomiar oraz unikanie kolizji opisów.
3. **Wersja pre-release i testy zamknięte** — wcześniejszy etap MVP zamknięty decyzją użytkownika. Nowe funkcje mają własne wyniki i pozostałe próby, opisane poniżej.
4. **Model zarabiania** — zasady Free/Plus i cena w PLN zaakceptowane. Limity, oferta i kod zakupów są wdrożone; konfiguracja i testy Google Play pozostają do wykonania.
5. **Release i publikacja** — w przygotowaniu. Wielojęzyczność jest wdrożona; produkcji nie opublikowano.

## Wdrożone po zakończeniu testów zamkniętych

- [DXF 2D](technical/eksport-dxf.md): lokalne XY, R2000, m/cm/ft/in, obrys i opisy na osobnych warstwach. Pierwszą wersję sprawdzono w LibreCAD; nowy układ etykiet i notatki wymaga ponownej kontroli w CAD.
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

Zakup i przywracanie Plus za 29,99 zł jednorazowo są podłączone przez Google Play Billing 9.1.0, z weryfikacją podpisu i trwałym uprawnieniem offline. Pakiet: `com.bk.dev.mobile.outlinego`, produkt: `outlinego_plus`, opcja: `buy`, dostępność: Polska. Użytkownik potwierdził pierwsze wydanie w testach wewnętrznych i zapis produktu; publiczny klucz licencyjny jest osadzony. Do potwierdzenia pozostają aktywacja opcji, testerzy licencji i testy płatności/przywracania. Produkcji nie opublikowano. Istniejące szkice pozostają dostępne po utracie Plus; przy P8 dostępne są korekty i zakończenie obrysu. [Specyfikacja](technical/free-plus.md), [konfiguracja zakupów](technical/zakupy-google-play.md).

## Prace przed release

- Dodać do karty aplikacji Google Play rzeczywiste screenshoty z aplikacji, przygotowane przez użytkownika. Mają uzupełnić dwie wybrane grafiki marketingowe z `googlePlay/`. Przypomnienie zapisane 24.10.2026; zadanie pozostaje otwarte.
- Zweryfikować w Play Console dostęp do produkcji i ewentualny wymóg testu zamkniętego dla konta osobistego utworzonego po 13.11.2023: minimum 12 testerów zapisanych nieprzerwanie przez 14 dni oraz wniosek o dostęp do produkcji. Sam test wewnętrzny nie spełnia tego wymogu. Status konta nie został potwierdzony. [Wymagania Google](https://support.google.com/googleplay/android-developer/answer/14151465).
- Domknąć formularze Play Console: Data safety zgodne z wydaniem i Sentry, klasyfikacja wiekowa, grupa docelowa, deklaracja reklam, dostęp dla recenzentów, kraje dystrybucji i dostępność/ceny Plus. Przygotować aktualny podpisany AAB z numerem wersji akceptowanym przez Console i przejrzeć raport testów przedpremierowych.
- Przygotować materiały do prezentacji aplikacji w Google Play: nazwę, krótki i pełny opis, zrzuty ekranów, grafikę promocyjną oraz wersje językowe. Sprawdzić spójność materiałów z aktualnymi funkcjami i zasadami Free/Plus.
- Strona WWW PL/EN etapu 1 i finalne dokumenty prawne są opublikowane. Pozostaje kontrola indeksowania w Search Console oraz pomiar PageSpeed Insights/Core Web Vitals. [Stan publikacji](www-etap-1.md), [audyt SEO](seo-audyt-2026-10-30.md).
- Dokończyć weryfikację opcjonalnego raportowania błędów Sentry: DSN EU podłączony, serwer przyjął zdarzenie testowe z komputera (HTTP 200); pozostały test nowego buildu na telefonie i symbolikacja. Filtry organizacji i zapobieganie zapisowi IP potwierdzono 30.10; podpisane DPA dostarczono. Dalsze ustalanie liczbowej retencji pomijamy zgodnie z decyzją użytkownika. Natywne awarie wyłączone. [Stan wdrożenia](technical/sentry.md), [decyzje](legal/sentry-plan.md).
- Dokumenty prawne podlinkowane w źródłach: ekran pierwszego uruchomienia i Ustawienia → Dokumenty prawne. Sprawdzić linki na telefonie w nowym buildzie.
- Po każdej zmianie aplikacji przeglądać i odpowiednio aktualizować dokumenty prawne, informacje na stronie oraz Data safety Google Play przed wydaniem. [Zasada aktualizacji](legal/README.md#aktualizacja-po-zmianach-aplikacji).
- Ekran pierwszego uruchomienia z akceptacją regulaminu i ograniczeń pomiarów wdrożony w źródłach: niezaznaczone pole, lokalny zapis wersji i daty, ponowna akceptacja po istotnej zmianie wersji treści. Diagnostyka pozostaje osobna. Dokumenty PL/EN zamknięto i opublikowano z datą 30.10.2026. Przed kolejnym wydaniem aplikacji sprawdzić jej wersję akceptacji, linki i działanie na telefonie; nie jest to ponowny odbiór strony WWW. [Opis wdrożenia](technical/pierwsze-uruchomienie.md).
- Potwierdzić aktywność opcji buy i konta testerów licencji; wykonać transakcje i przywracanie w Google Play. Produkt, klucz licencyjny i podpisywanie są skonfigurowane.
- Doprecyzować użytkownika docelowego, ofertę i ceny dla pozostałych rynków.
- Wykonać fizyczną próbę ponownego pomiaru wcześniejszego boku: odniesienie sensorowe, długość z krokomierza, przeliczenie dalszych punktów i kontynuacja rysowania. Sprawdzić także zamknięte szkice oraz limit Free.
- Sprawdzić nowy DXF z notatkami i odsuniętymi opisami w CAD oraz udostępnianie na telefonie; drugi program CAD pozostaje otwartą próbą.
- Dopracować wygląd w stylu Teren, czytelność na różnych ekranach i po tłumaczeniu. Zachować stałe dolne akcje i stabilne położenie celownika. Nowe etykiety mają kontrolę kolizji; pełny przegląd wizualny nadal pozostaje.
- Przeprowadzić korektę językową tłumaczeń i przegląd ich układu. Dodatkowa próba powrotu do języka systemowego i natywnego PNG z iteracji lokalizacji pozostaje do powtórzenia.
- Przygotować listę wymagań publikacji, materiały sklepowe i kryteria wydania; dopiero potem opublikować wersję produkcyjną.

Solver sieci, przekątne kontrolne, edytor ograniczeń i migracja SDK pozostają poza bieżącym przyrostem.

## Pomysły na dalszy rozwój

Dodane **25 października 2026**:

1. **Kilka obiektów w jednym szkicu** — możliwość pomiaru i zapisania kilku niezależnych obiektów lub obrysów w ramach jednego szkicu.
2. **Rysowanie i opisy na eksportowanym szkicu** — możliwość dorysowania linii, dodania napisów oraz swobodnego rysowania odręcznego. Dodane elementy mają być widoczne w wyeksportowanym szkicu.
3. **Intuicyjny help wprowadzający** - opisy wraz z rysunkiem pokazujące jak realizować poszczególne kroki pomiaru. Pomoc w postaci okna dialogowego, chckebox "nie pokazuj pomocy"- możliwość przywrócenia w ustawieniach. Zawsze jest możliwość otworzenia okna dotyczącego danego kroku przez przycisk.

## Potwierdzony stan i instalacje

[Stan projektu](stan-projektu.md) rozdziela bieżące źródła od ostatniego APK/AAB i publikacji WWW. APK z Sentry i akceptacją warunków zainstalowano i uruchomiono 23.10; próby funkcjonalne na urządzeniu pozostają otwarte. Wcześniejsze wyniki testów natywnych i instalacji opisuje [MEMO](../MEMO.md).
