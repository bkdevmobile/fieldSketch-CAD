# Sentry — raportowanie błędów

Stan: 23.10.2026. **DSN EU podłączony; serwer przyjął syntetyczne zdarzenie testowe (HTTP 200).** Organizacja: `bartosz-kaminski`, projekt ID: `4512301597851728`. Kod onboardingowy nie jest DSN ani tokenem API i nie jest zapisywany w repozytorium. Nie potwierdzono jeszcze działania w nowym buildzie na telefonie ani widoczności zdarzenia w panelu.

## Działanie

- Oficjalny SDK `@sentry/react-native` 7.11.0, wersja dobrana przez Expo SDK 56.
- Ustawienia → Raportowanie błędów: osobna opcja, domyślnie wyłączona. Włączenie i wycofanie zgody działają po zapisaniu ustawień. Zgoda jest przechowywana lokalnie w SQLite; stare instalacje mają `false`.
- Po pierwszym błędzie obsłużonym w `store.run`, przy braku wcześniejszej decyzji, pojawia się pytanie „Pomóc naprawić błąd?”. Trafia do wspólnej kolejki dialogów po komunikacie o błędzie. „Włącz i wyślij” zapisuje zgodę w SQLite, uruchamia raportowanie i wysyła ten błąd po filtracji. Tekst jawnie obejmuje także przyszłe raporty. „Nie wysyłaj”, zamknięcie okna i przycisk Wstecz zapisują odmowę. Decyzja jest pamiętana po restarcie (`errorReportingAsked`); ustawienia pozwalają ją zmienić. Sam zapis innych ustawień bez zmiany zgody nie oznacza podjęcia decyzji.
- W oczekiwaniu na odpowiedź przechowywany jest najwyżej jeden wyjątek wyłącznie w pamięci procesu, bez pliku i bez wysyłki. Kolejne błędy nie tworzą kolejki pytań ani raportów. Awaria zapisu zgody blokuje wysłanie tego raportu. Limity Free/Plus nie wywołują pytania. Błędy przed przygotowaniem bazy i awarie kończące proces nie uruchamiają tego dialogu.
- Brak poprawnego publicznego DSN EU oznacza brak inicjalizacji SDK oraz niedostępny przełącznik. Domyślny DSN znajduje się w `app/sentry.config.cjs` (publiczna konfiguracja klienta, nie sekret). Można go zastąpić przez `EXPO_PUBLIC_SENTRY_DSN`; pusta wartość jawnie wyłącza dostępność raportowania w buildzie. `.env.example` zawiera wzór, `.env.local` jest ignorowany przez Git.
- Obsługiwane: błędy JavaScript przechwycone w `store.run`, nieobsłużone wyjątki i odrzucenia Promise w Hermes. Limity Free/Plus nie są raportowane.
- **Brak raportowania natywnych awarii Java/Kotlin/NDK.** `enableNative=false` i plugin manifestu `io.sentry.auto-init=false` zapobiegają natywnej inicjalizacji. Filtr JS nie obejmuje raportów natywnych, dlatego nie włączono ich bez niezależnego filtra i obsługi zgody.
- Przed wysyłką odbudowujemy zdarzenie z listy dozwolonych pól: typ błędu, stały opis zamiast oryginalnego komunikatu, pozycje w bundlu bez nazw funkcji i fragmentów kodu, wersja aplikacji/builda i Androida, czas/identyfikator zdarzenia oraz zweryfikowany UUID mapy kodu. Brak nazw/ID szkiców, notatek, wymiarów, lokalnych logów, zdjęć, tokenów zakupowych i identyfikatorów użytkownika/urządzenia.
- Wyłączone: domyślne integracje, breadcrumbs, logi konsoli, sesje, tracing, profiling, Replay, screenshoty, załączanie hierarchii widoków i raporty klienta. Pozostaje tylko integracja obsługi błędów RN. `sendDefaultPii=false` ustawia w SDK `infer_ip=never`; odbiorca sieciowy nadal widzi IP połączenia. Ustawienia usługi wymagają sprawdzenia.
- Transport Fetch nie zapisuje raportów na dysku i nie odtwarza błędów offline po restarcie. Cofnięcie zgody przerywa aktywne żądania i blokuje kolejkę poprzedniej generacji także po ponownym włączeniu. Już otrzymane zdarzenia nie są automatycznie usuwane z serwera przez wyłączenie opcji.
- Błąd inicjalizacji monitoringu nie blokuje zapisu ustawień ani działania aplikacji.

## Dokończenie konfiguracji

1. DSN przekazany przez użytkownika jest już ustawiony w `app/sentry.config.cjs`. Prywatny Auth/Security token nie jest potrzebny do samego wysyłania zdarzeń i nie należy przekazywać go w czacie.
2. APK z 8365dca zbudowano, zainstalowano i uruchomiono na Redmi 23.10.2026; odbiór raportowania na telefonie pozostaje otwarty. DSN jest osadzany w buildzie; zmiana konfiguracji nie zmienia zainstalowanego APK. Obsługiwany format: `https://<public-key>@o<org-id>.ingest.de.sentry.io/<project-id>`.
3. Potwierdzić w Sentry faktyczny region, ustawienia IP i retencję **do 30 dni**. Nie skonfigurowano ich z tego środowiska. Przyjęta retencja jest wymaganiem do spełnienia przed wydaniem, nie stanem konta potwierdzonym przez kod.
4. Zmapować build: Metro dodaje debug ID. Jeśli przy prebuildzie są ustawione `SENTRY_AUTH_TOKEN` i `SENTRY_PROJECT` (slug rzeczywistego projektu), oficjalny plugin Expo przygotowuje upload sourcemap w Gradle dla organizacji `bartosz-kaminski`. Token wyłącznie w środowisku procesu/CI, nigdy w `extra`, DSN, `EXPO_PUBLIC_*` ani repozytorium. Bez tych zmiennych upload nie jest włączany; samo wysyłanie błędów może działać, lecz czytelność stosów wymaga weryfikacji.
5. Build testowy jest zainstalowany na Redmi. Przed zgodą potwierdzić brak ruchu Sentry. Po zgodzie wywołać kontrolowany wyjątek bez danych użytkownika i potwierdzić zdarzenie oraz czytelny stos w panelu. Sprawdzić cofnięcie zgody przy trwającej wysyłce i restart aplikacji. Nie zostawiać przycisku generowania błędów w produkcyjnym UI.
6. Przed publikacją zaktualizować politykę z [przygotowanym tekstem](../legal/sentry-privacy-addendum.en.md), deklarację Data safety i dane procesora/DPA. Na stronie publicznej nadal obowiązuje opis obecnego builda bez Sentry.

## Weryfikacja i ograniczenia

Testy obejmują brak inicjalizacji przed zgodą, odrzucanie DSN poza EU, filtrowanie danych, przerwanie żądań i starej kolejki po cofnięciu zgody, awarię inicjalizacji oraz zapis/wycofanie zgody w SQLite. Scenariusze pytania sprawdzają brak wysyłki przed zapisaniem zgody, jednorazowe wysłanie po akceptacji, pamiętanie odmowy po restarcie, brak ponownego pytania po wycofaniu zgody, ochronę przed wielokrotnym kliknięciem i brak wysyłki przy błędzie zapisu decyzji. Po dodaniu ekranu pierwszego uruchomienia TypeScript i 183 testy (24 zestawy) przechodzą.

Test sieciowy: 22.10.2026 o 21:54 czasu polskiego. Serwer przyjął zdarzenie `d9b4915fa9e24bc180e49047ce3e4a20`, środowisko `development`, HTTP 200 z potwierdzeniem tego samego ID. Raport lokalny: `artifacts/sentry-connection-check.json`. Test wykonał faktyczny moduł filtrowania i transportu aplikacji z klientem Sentry JavaScript w Node, z zastępczym kontekstem urządzenia oznaczonym jako testowy. To weryfikacja połączenia i przyjęcia danych przez serwer, **nie test środowiska React Native/telefonu, symbolikacji stosu ani widoczności w panelu Sentry**. Nie wysyłano danych użytkownika.

Historycznie ewaluację konfiguracji blokował lokalny klucz Google Play. 23.10.2026 klucz przeszedł walidację RSA, użytkownik potwierdził zgodność z aplikacją, a prebuild i build APK zakończyły się poprawnie. Nie zmieniano klucza ani nie omijano walidacji. Testy pluginu używają własnego klucza testowego w pamięci.

23.10.2026 wykonano prebuild i podpisany APK z 8365dca oraz aktualizację i start na Redmi. To nie potwierdza wysyłania raportów, poprawności zgód ani symbolikacji. Nie zmieniano konfiguracji konta Sentry ani formularza Google Play. Test serwera nie potwierdza retencji ani ustawień przetwarzania IP.

Źródła: [Expo](https://docs.expo.dev/guides/using-sentry/), [Sentry Expo](https://docs.sentry.io/platforms/react-native/guides/expo/), [zakres danych](https://docs.sentry.io/platforms/react-native/data-management/data-collected/), [filtrowanie raportów natywnych](https://sentry.zendesk.com/hc/en-us/articles/26323481356443-How-to-filter-native-events-in-React-Native-SDK).
