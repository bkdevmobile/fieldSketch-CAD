# Ogólny plan rozwoju outlineGo

Stan na **23 października 2026**: aplikacja 0.1.0 / versionCode 2, kod APK 8365dca. TypeScript i 183 testy w 24 zestawach przeszły. APK z Sentry, ekranem akceptacji i automatycznym zapisem notatek zbudowano, zainstalowano i uruchomiono na Redmi; pozostał odbiór funkcjonalny. AAB jest starszy. WWW opublikowane, dokumenty robocze; brak potwierdzenia produkcji w Google Play. [Aktualny stan](stan-projektu.md), [historia](../MEMO.md).

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

- Zweryfikować w Play Console dostęp do produkcji i ewentualny wymóg testu zamkniętego dla konta osobistego utworzonego po 13.11.2023: minimum 12 testerów zapisanych nieprzerwanie przez 14 dni oraz wniosek o dostęp do produkcji. Sam test wewnętrzny nie spełnia tego wymogu. Status konta nie został potwierdzony. [Wymagania Google](https://support.google.com/googleplay/android-developer/answer/14151465).
- Domknąć formularze Play Console: Data safety zgodne z wydaniem i Sentry, klasyfikacja wiekowa, grupa docelowa, deklaracja reklam, dostęp dla recenzentów, kraje dystrybucji i dostępność/ceny Plus. Przygotować aktualny podpisany AAB z numerem wersji akceptowanym przez Console i przejrzeć raport testów przedpremierowych.
- Przygotować materiały do prezentacji aplikacji w Google Play: nazwę, krótki i pełny opis, zrzuty ekranów, grafikę promocyjną oraz wersje językowe. Sprawdzić spójność materiałów z aktualnymi funkcjami i zasadami Free/Plus.
- Strona WWW EN i robocze dokumenty prawne opublikowane w istniejącym projekcie Firebase. Przejrzeć dane wydawcy, zatwierdzić treści i daty oraz przed wydaniem z Sentry opublikować odpowiednią aktualizację. [Status i kwestie do sprawdzenia](legal/README.md).
- Dokończyć weryfikację opcjonalnego raportowania błędów Sentry: DSN EU podłączony, serwer przyjął zdarzenie testowe z komputera (HTTP 200); pozostały test nowego buildu na telefonie, symbolikacja i potwierdzenie ustawień IP/retencji do 30 dni. Natywne awarie wyłączone. [Stan wdrożenia](technical/sentry.md), [decyzje](legal/sentry-plan.md).
- Dokumenty prawne podlinkowane w źródłach: ekran pierwszego uruchomienia i Ustawienia → Dokumenty prawne. Sprawdzić linki na telefonie w nowym buildzie.
- Po każdej zmianie aplikacji przeglądać i odpowiednio aktualizować dokumenty prawne, informacje na stronie oraz Data safety Google Play przed wydaniem. [Zasada aktualizacji](legal/README.md#aktualizacja-po-zmianach-aplikacji).
- Ekran pierwszego uruchomienia z akceptacją regulaminu i ograniczeń pomiarów wdrożony w źródłach: niezaznaczone pole, lokalny zapis wersji i daty, ponowna akceptacja po istotnej zmianie wersji treści. Diagnostyka pozostaje osobna. Przed wydaniem zatwierdzić robocze dokumenty i wykonać kontrolę na telefonie. [Opis wdrożenia](technical/pierwsze-uruchomienie.md).
- Potwierdzić aktywność opcji buy i konta testerów licencji; wykonać transakcje i przywracanie w Google Play. Produkt, klucz licencyjny i podpisywanie są skonfigurowane.
- Doprecyzować użytkownika docelowego, ofertę i ceny dla pozostałych rynków.
- Wykonać fizyczną próbę ponownego pomiaru wcześniejszego boku: odniesienie sensorowe, długość z krokomierza, przeliczenie dalszych punktów i kontynuacja rysowania. Sprawdzić także zamknięte szkice oraz limit Free.
- Sprawdzić nowy DXF z notatkami i odsuniętymi opisami w CAD oraz udostępnianie na telefonie; drugi program CAD pozostaje otwartą próbą.
- Dopracować wygląd w stylu Teren, czytelność na różnych ekranach i po tłumaczeniu. Zachować stałe dolne akcje i stabilne położenie celownika. Nowe etykiety mają kontrolę kolizji; pełny przegląd wizualny nadal pozostaje.
- Przeprowadzić korektę językową tłumaczeń i przegląd ich układu. Dodatkowa próba powrotu do języka systemowego i natywnego PNG z iteracji lokalizacji pozostaje do powtórzenia.
- Przygotować listę wymagań publikacji, materiały sklepowe i kryteria wydania; dopiero potem opublikować wersję produkcyjną.

Solver sieci, przekątne kontrolne, edytor ograniczeń i migracja SDK pozostają poza bieżącym przyrostem.

## Potwierdzony stan i instalacje

[Stan projektu](stan-projektu.md) rozdziela bieżące źródła od ostatniego APK/AAB i publikacji WWW. APK z Sentry i akceptacją warunków zainstalowano i uruchomiono 23.10; próby funkcjonalne na urządzeniu pozostają otwarte. Wcześniejsze wyniki testów natywnych i instalacji opisuje [MEMO](../MEMO.md).
