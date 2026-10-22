# Ogólny plan rozwoju outlineGo

Stan na **21 października 2026**: aplikacja 0.1.0, versionCode 2. Pierwsze wydanie w testach wewnętrznych Google Play potwierdził użytkownik. Źródła obejmują dodatkowo poprawkę początkowego widoku DXF, jeszcze bez nowego APK/AAB. Testy zamknięte wcześniejszego MVP zakończono 20 października; produkcji nie opublikowano. [Historia](../MEMO.md).

## Etapy

1. **Testy technologii** — wykonane próby trybu względnego mają zaakceptowaną przez użytkownika dokładność. Krokomierz zaakceptowano; dodatkowe kroki użytkownik wiąże z ruchem telefonu. Nie określono liczbowego progu dokładności i nie rozszerzono odbioru automatycznie na tryb magnetyczny.
2. **Działanie i UI** — wdrożone: wizard Kierunek → Długość → Zapis, ręczne m/cm, krokomierz Start/Stop, pływający szkic, korekty, zapis i wznowienie, pomoc pierwszego pomiaru, branding i styl Teren. Ostatni przyrost dodaje notatki, przypinanie, zbiorczą edycję wymiarów, nawigację po punktach i ponowny pomiar oraz unikanie kolizji opisów.
3. **Wersja pre-release i testy zamknięte** — wcześniejszy etap MVP zamknięty decyzją użytkownika. Nowe funkcje mają własne wyniki i pozostałe próby, opisane poniżej.
4. **Model zarabiania** — zasady Free/Plus i cena w PLN zaakceptowane. Limity, oferta i kod zakupów są wdrożone; konfiguracja i testy Google Play pozostają do wykonania.
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

Zakup i przywracanie Plus za 29,99 zł jednorazowo są podłączone przez Google Play Billing 9.1.0, z weryfikacją podpisu i trwałym uprawnieniem offline. Pakiet: `com.bk.dev.mobile.outlinego`, produkt: `outlinego_plus`, opcja: `buy`, dostępność: Polska. Użytkownik potwierdził pierwsze wydanie w testach wewnętrznych i zapis produktu; publiczny klucz licencyjny jest osadzony. Do potwierdzenia pozostają aktywacja opcji, testerzy licencji i testy płatności/przywracania. Produkcji nie opublikowano. Istniejące szkice pozostają dostępne po utracie Plus; przy P8 dostępne są korekty i zakończenie obrysu. [Specyfikacja](technical/free-plus.md), [konfiguracja zakupów](technical/zakupy-google-play.md).

## Prace przed release

- Przygotować materiały do prezentacji aplikacji w Google Play: nazwę, krótki i pełny opis, zrzuty ekranów, grafikę promocyjną oraz wersje językowe. Sprawdzić spójność materiałów z aktualnymi funkcjami i zasadami Free/Plus.
- Strona WWW EN i robocze dokumenty prawne przygotowane lokalnie w `public/` (22.10.2026); przejrzeć dane wydawcy i treści, następnie opublikować w istniejącym projekcie Firebase. [Status i kwestie do sprawdzenia](legal/README.md).
- Dodać opcjonalne raportowanie błędów Sentry: EU, osobna zgoda, minimalny zakres bez danych szkiców, docelowo retencja do 30 dni. Integracja jeszcze nie istnieje. [Decyzje i warunki wdrożenia](legal/sentry-plan.md).
- Podlinkować dokumenty prawne w aplikacji, w stale dostępnym miejscu, np. w ustawieniach.
- Po każdej zmianie aplikacji przeglądać i odpowiednio aktualizować dokumenty prawne, informacje na stronie oraz Data safety Google Play przed wydaniem. [Zasada aktualizacji](legal/README.md#aktualizacja-po-zmianach-aplikacji).
- Przy pierwszym uruchomieniu wyświetlić do akceptacji informacje o ograniczonej dokładności pomiarów, szacunkowym charakterze pomiaru krokami i pomocniczym przeznaczeniu szkiców. Doprecyzować treść oraz zasady zapisu i ponawiania akceptacji. [Zakres pomysłu](pomysly-na-rozwoj.md#2-strona-www-dokumenty-prawne-i-informacja-startowa).
- Potwierdzić aktywność opcji buy i konta testerów licencji; wykonać transakcje i przywracanie w Google Play. Produkt, klucz licencyjny i podpisywanie są skonfigurowane.
- Doprecyzować użytkownika docelowego, ofertę i ceny dla pozostałych rynków.
- Wykonać fizyczną próbę ponownego pomiaru wcześniejszego boku: odniesienie sensorowe, długość z krokomierza, przeliczenie dalszych punktów i kontynuacja rysowania. Sprawdzić także zamknięte szkice oraz limit Free.
- Sprawdzić nowy DXF z notatkami i odsuniętymi opisami w CAD oraz udostępnianie na telefonie; drugi program CAD pozostaje otwartą próbą.
- Dopracować wygląd w stylu Teren, czytelność na różnych ekranach i po tłumaczeniu. Zachować stałe dolne akcje i stabilne położenie celownika. Nowe etykiety mają kontrolę kolizji; pełny przegląd wizualny nadal pozostaje.
- Przeprowadzić korektę językową tłumaczeń i przegląd ich układu. Dodatkowa próba powrotu do języka systemowego i natywnego PNG z iteracji lokalizacji pozostaje do powtórzenia.
- Przygotować listę wymagań publikacji, materiały sklepowe i kryteria wydania; dopiero potem opublikować wersję produkcyjną.

Solver sieci, przekątne kontrolne, edytor ograniczeń i migracja SDK pozostają poza bieżącym przyrostem.

## Potwierdzony stan i instalacje

Aktualna weryfikacja źródeł: TypeScript i 163 testy TS (20 zestawów) przeszły. Moduł płatności ma 11 zaliczonych testów Kotlin; 7 testów orientacji przy ostatnim budowaniu było UP-TO-DATE. Podpisany APK 0.1.0 (versionCode 2) z zakupami i kluczem licencyjnym zainstalowano i uruchomiono na Redmi bez błędów ReactNativeJS/AndroidRuntime. Ten APK i AAB powstały przed ostatnią poprawką początkowego widoku DXF; poprawka jest w źródłach i wymaga nowego budowania. Testy transakcji Google Play, początkowego widoku w GUI CAD i fizycznego ponownego pomiaru sensorami pozostają otwarte. Historię, hashe i logi zawiera MEMO.md.

Podpisany APK `artifacts/outlineGo-0.1.0.apk`, wersja 0.1.0 / versionCode 2, zainstalowano na Redmi. Pierwszy bundle jest w testach wewnętrznych według potwierdzenia użytkownika; gotowy AAB v2: `artifacts/outlineGo-0.1.0.aab`. Oba artefakty nie zawierają jeszcze ostatniej poprawki początkowego widoku DXF. Nie opublikowano produkcji. Szczegóły i pełne hashe: MEMO.md.
