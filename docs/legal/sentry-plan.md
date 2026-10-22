# Plan raportowania błędów Sentry

Decyzje: 22 października 2026. Użytkownik potwierdził, że Sentry dopiero będzie dodane, i powierzył dobór ustawień. **Integracja nie została wykonana.**

## Wybrane ustawienia

- Organizacja w regionie **EU**, wybranym przy jej tworzeniu. Według [Sentry EU FAQ](https://www.sentry.help/en/articles/13964378-sentry-s-eu-region-faq) zdarzenia pozostają w wybranym regionie, ale część metadanych konta i organizacji może być w USA. Nie obiecywać przetwarzania całości danych wyłącznie w UE.
- **Tylko błędy i awarie**: typ błędu, oczyszczony stack trace, wersja/build aplikacji, wersja Androida, model urządzenia, czas zdarzenia. Bez analityki użycia, transakcji, profilowania, Session Replay, zrzutów ekranu i załączników.
- Bez nazw i identyfikatorów szkiców, notatek, punktów, wymiarów, danych kamery, surowych sensorów, lokalnych logów sesji, paragonów, tokenów zakupowych, emaili i trwałych identyfikatorów użytkownika lub urządzenia.
- Domyślnie **wyłączone**. Osobna dobrowolna zgoda w ustawieniach, niezależna od potwierdzenia ograniczeń pomiarów i zakupu Plus. Wycofanie bez utraty funkcji.
- Docelowa retencja: **maksymalnie 30 dni**. Przed uruchomieniem potwierdzić egzekwowanie tego okresu na wybranym planie; w razie potrzeby zapewnić automatyczne usuwanie lub krótszą retencję. To nie jest już skonfigurowane ustawienie.

## Warunki wdrożenia

1. Utworzyć projekt EU, sprawdzić DPA, podwykonawców i podstawy transferów. Wybrać plan obsługujący przyjętą retencję.
2. Nie inicjalizować SDK przed zgodą. Sprawdzić też natywne awarie i raporty z poprzedniego uruchomienia. Po wycofaniu zatrzymać wysyłki i usunąć lokalną kolejkę, aby nie wysłać jej po późniejszym włączeniu.
3. Wyłączyć domyślne breadcrumbs, przechwytywanie konsoli i integracje dodające kontekst aplikacji. Stosować listę dozwolonych pól i filtrowanie również raportów natywnych. Komunikaty wyjątków i stack trace też mogą zawierać dane i wymagają oczyszczania.
4. Nie wysyłać lokalnych logów aplikacji. Wyłączyć domyślne PII i minimalizować IP. Samo połączenie ujawnia IP odbiorcy niezależnie od pól zdarzenia — sprawdzić anonimizację po stronie usługi.
5. Zweryfikować faktyczny ruch: brak wysyłek przed zgodą; po zgodzie tylko dozwolone pola; po wycofaniu brak wysyłek i zaległych raportów. Sprawdzić także błędy eksportów i zakupów pod kątem nazw plików i tokenów.
6. Przed wydaniem zaktualizować politykę, ujawnienie w aplikacji i Data safety Google Play: odbiorca, faktyczny zakres, podstawa zgody, transfery, retencja i wycofanie. Zweryfikować usuwanie danych i obsługę żądań bez dodawania zbędnego identyfikatora użytkownika.

Obecna polityka opisuje wersję bez Sentry. Ten plik jest planem, nie opisem działającej usługi.
