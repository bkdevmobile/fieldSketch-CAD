# Stan prac nad FieldSketch CAD

Aktualizacja: 19 października 2026.

Ogólny plan dalszych prac: [plan rozwoju](docs/plan-rozwoju.md). Kolejność: testy technologii → projekt działania aplikacji i UI → pre-release i test zamknięty → dopracowanie modelu zarabiania → release i publikacja. Wstępny model zarabiania rozważamy przed projektowaniem UI, a dopracowujemy po testach zamkniętych. Użytkownik potwierdził 19 października 2026, że wykonane testy w trybie „względny” dają akceptowalny poziom dokładności. Pozwala to przejść do projektowania działania aplikacji i UI.

## Aktualny rezultat

Pierwszy działający prototyp Android jest zaimplementowany w `app/`, skompilowany do samodzielnego APK oraz zainstalowany i uruchomiony na fizycznym telefonie użytkownika, model `23124RA7EO`. ADB potwierdził instalację wersji 0.1.0 i uruchomienie MainActivity. Według potwierdzenia użytkownika wykonane testy w trybie „względny” dają akceptowalny poziom dokładności; nie ustalono liczbowego progu błędu. Ocena ta dotyczy przetestowanego trybu i warunków próby.

APK: `artifacts/FieldSketch-CAD-0.1.0.apk`, 83578411 bajtów. SHA256: `84FB973DA5B92DEAA24571BC30452C0C1EA649ACB70C2A9B4A4FEC7F0FEB20EE`. Aktualny artefakt zawiera prostą listę projektów (3 najnowsze, Więcej +10, menu wiersza), menu ⋮ strony głównej z ustawieniami i logami, korektę kąta `[L] [input] [P]` z suwakiem poniżej (skok i zaokrąglanie do pełnych 5°), krokomierz `[−] [input] [+] [Start/Stop]`, ekran bez szczegółów i dodatkowych opcji, zielony status gotowości oraz globalny tryb kierunku. Na polecenie użytkownika 19 października 2026 ponownie wykonano pełny skrypt `build:apk` i zainstalowano ten build na telefonie `23124RA7EO` przez `adb install -r` (Success), z zachowaniem danych. MainActivity uruchomiła się: Status ok, LaunchState COLD. TypeScript, 44 testy TS i natywne zadanie 7 testów Kotlin bez błędów (UP-TO-DATE) oraz release build przeszły. Log: `artifacts/phone-install-build.log`.

Wcześniej 19 października 2026 zainstalowano na telefonie `23124RA7EO` build z uproszczonym ekranem (SHA256 `9D6F222AEBE69E6DC2CED8AB6D001A1ABAAAD0A04A856A8CB7A4A16332B5E202`) przez `adb install -r` (Success), bez czyszczenia danych. Uruchomienie MainActivity potwierdzono: Status ok, LaunchState COLD. Został on zastąpiony aktualnym buildem opisanym powyżej.

APK zawiera JavaScript, działa offline i nie wymaga Metro. Podpis jest deweloperski, do testów. Obsługiwane architektury: arm64-v8a i x86_64; minimum Android 7, target SDK 36.

## Wiążące ustalenia z użytkownikiem

- React Native z Expo, TypeScript; Android jako pierwsza platforma, bez backendu i kont.
- Pierwszy prototyp obejmuje pomiar i prosty obrys. Pełny edytor, solver, przekątne i DXF są późniejszym zakresem.
- Użytkownik wpisuje liczbę kroków, także ułamkową z polskim przecinkiem. Roboczy przelicznik: 1 krok = 75 cm. Wynik w cm jest oszacowaniem; geometria liczy w metrach.
- Logi mają być trwale zapisywane w prywatnej pamięci aplikacji, dostępne po restarcie i możliwe do skopiowania z aplikacji.
- Dostarczamy samodzielny APK, nie tylko development build.
- Testy w trybie „względny” dają akceptowalny poziom dokładności — ustalenie użytkownika z 19 października 2026. Nie przenosić tej oceny automatycznie na tryb magnetyczny.

## Zaakceptowany projekt UI — do implementacji

19 października 2026 zaakceptowano [wizard pomiaru](docs/technical/wizard-pomiaru.md). Pierwszy punkt zapisujemy na początku; potem powtarzamy Kierunek → Długość → Zapisz punkt. Ustalono korektę kąta suwakiem ±15° i polem skrętu lewo/prawo 0–180°, automatyczny krokomierz Start/Stop z korektą kroków lub długości, metry/cm, indywidualną długość kroku (początkowo 75 cm), stały szkic na żywo, zapis roboczego etapu i edycję ostatniego boku. Zakończenie rozstrzyga niezapisany bok, a potem zamknięcie lub pozostawienie obrysu otwartego. Bok zamykający jest wyliczony; pomiar powrotny pozostaje osobny. Pełny projekt realizujemy etapami; wdrożoną część opisuje sekcja Implementacja wizarda — pierwszy przyrost. Automatyczny krokomierz wymaga implementacji i osobnej walidacji.

Ręczne wpisanie długości w m/cm jest niezależną ścieżką w kroku „Zmierz”, dostępną od razu, bez uruchamiania krokomierza. Po wpisaniu długości można zapisać punkt.

Szkic automatycznie dopasowuje widok po ustaleniu kierunku, zmierzeniu lub wpisaniu długości i zatwierdzeniu korekty pomiaru. Dopasowanie obejmuje zapisany obrys oraz element roboczy. Podczas aktywnego liczenia kroków skala pozostaje stabilna; dopasowanie następuje po zatrzymaniu pomiaru.

Udostępnianie szkicu w MVP: wystarczy PNG z wymiarami i oznaczeniem długości szacowanych z kroków. DXF i inne formaty wyniku są poza zakresem tej wersji. Eksport logów JSONL/CSV pozostaje diagnostyką. Eksport PNG jest wymaganiem do implementacji.

Wybrano pierwszy wariant makiety: Prowadzenie krok po kroku. Uwaga do realizacji: dolne przyciski zawsze poza scrollem, przyklejone do dołu ekranu; przewijana treść nie może być przez nie zasłaniana. Uwzględnić obszar systemowy i klawiaturę ekranową.

## Implementacja wizarda — pierwszy przyrost

Commit ustaleń przed implementacją: `a1278ca` na gałęzi `mvp`. Pierwszy przyrost kodu obejmuje: etapy P1 → kierunek → korekta → długość → sprawdzenie → zapis punktu; ręczne m/cm lub ręczna liczba kroków, skręt lewo/prawo i suwak ±15°, stały dolny panel ze szkicem i akcjami, zakończenie otwarte/zamknięte i podsumowanie. Pierwszy bok wyznacza 0°, nowe projekty preferują tryb względny.

Formularz roboczy jest zapisywany w SQLite; migracja bazy v1 → v2 zachowuje wcześniejsze dane. Po wznowieniu przywracane są wpisy, a kierunek wymaga ponownego przechwycenia. Obserwacje ręcznej długości mają jawne źródło i nie zawierają fikcyjnych kroków. Surowy odczyt i przechwycony kierunek pozostają zachowane po korekcie.

Weryfikacja: 35 testów TypeScript i 5 testów Kotlin bez błędów, TypeScript i release build przeszły. Na emulatorze sprawdzono aktualizację z zachowaniem wcześniejszego projektu, przywrócenie długości 4,5 m po force-stop, pomiar dwóch boków 4,5 m i 3 m ze skrętem 90°, zamknięcie z polem 6,75 m² oraz zmianę 2,5 m na 250 cm. Na Androidzie 16 potwierdzono widoczność wszystkich dolnych akcji nad klawiaturą, zmniejszenie szkicu podczas wpisywania i powrót paska na dół po schowaniu klawiatury.

Zakres ten został wdrożony w drugim przyroście opisanym poniżej; fizyczna walidacja krokomierza pozostaje do wykonania. Pierwszy przyrost sprawdzono na emulatorze; późniejszą instalację aktualnego APK na telefonie opisano poniżej.

## Implementacja MVP — drugi przyrost

W katalogu roboczym dodano edycję ostatniego boku z zachowaniem źródłowych obserwacji (`supersedesId`), podgląd i systemowe udostępnianie PNG oraz ustawienia jednostki i indywidualnej długości kroku. SQLite migruje teraz do v3, zachowując projekty i formularze. Zmiana preferencji nie przelicza historycznych boków.

Krokomierz Start/Stop używa natywnego TYPE_STEP_DETECTOR, kontroluje identyfikator sesji i pomiaru, odrzuca stare i powtórzone zdarzenia oraz wyłącza się po Stop, przejściu do tła i zakończeniu sesji. Opuszczenie ekranu anuluje również uruchomienie będące w toku. Zgoda ACTIVITY_RECOGNITION jest pobierana na żądanie na Androidzie 10+. Brak sensora lub zgody pozostawia ręczne m/cm i ręcznie wpisane kroki. Zapisywana jest surowa wykryta liczba kroków, korekta i użyty przelicznik.

Weryfikacja: 41 testów TypeScript i 7 Kotlin, TypeScript i release build. Emulator Android 16: dotychczasowe projekty zachowane po aktualizacji; ustawienie 80 cm i jednostki cm, zachowane również po zimnym starcie aplikacji; 2,5 kroku = 200 cm; zapis otwartej trasy; korekta ostatniego boku 3 → 4 m zmienia pole 6,75 → 9 m²; podgląd PNG 1080 × 1228 px, zapis niepustego pliku oraz systemowy podgląd obrazu w oknie udostępniania. Nie wybrano odbiorcy ani usługi. Emulator nie udostępnia detektora kroków, więc sprawdzono ręczną ścieżkę zastępczą. Adbd tego emulatora nie pozwala na root; nie odczytywano prywatnego pliku PNG przez adb.

Najbliższy krok: test zaktualizowanego APK na fizycznym telefonie, szczególnie zgody na aktywność, liczenia kroków, ostatniego kroku przed Stop, ponownego Start i zatrzymania po przejściu do tła. Dokładność automatycznego krokomierza pozostaje niezweryfikowana; wcześniejsza akceptacja trybu względnego dotyczy kierunku. Aktualny APK zainstalowano później na telefonie użytkownika; szczegóły poniżej. Pierwszy i drugi przyrost zapisano razem w commicie implementacji MVP.

## Instalacja aktualnego MVP na telefonie

19 października 2026 na polecenie użytkownika zainstalowano drugi przyrost MVP na podłączonym fizycznym telefonie `23124RA7EO`. Użyto `adb install -r`, bez odinstalowania i czyszczenia danych. Instalacja zakończyła się `Success`, a uruchomienie MainActivity: `Status: ok`, `LaunchState: COLD`. Potwierdzono wersję 0.1.0 (versionCode 1). Zainstalowany artefakt ma SHA256 `AB464E1CC0169933F25D96760AF4A25E2E38FD3807C182E05A3699E44AD7BFB4`. Nie wykonano jeszcze fizycznej walidacji automatycznego krokomierza.

## Dostępne funkcje

### Poprawki po próbie na telefonie — 19 października 2026

Użytkownik ocenił krokomierz jako generalnie poprawny, ale często doliczający 1–2 kroki. Dodano szybką korektę „−1 krok” / „+1 krok” po zatrzymaniu pomiaru, z zachowaniem surowej wykrytej liczby. Przyczyna nadliczania pozostaje do diagnozy na fizycznym telefonie; nie wprowadzono automatycznego odejmowania kroków.

Przyciąganie ręcznej korekty kąta wybieramy wyłącznie w ustawieniach: 90° (domyślnie), 10°, 5° albo wyłączone. Tolerancja wynosi 2° dla 90°/10°, 1° dla 5°. Działa po zatwierdzeniu pola lub zakończeniu gestu suwaka, również w edycji ostatniego boku. Surowy odczyt nie jest zaokrąglany. Starsze ustawienia bez nowego pola dostają domyślne 90°.

Pełnoszeroki szkic zastąpiono pływającą miniaturą w prawym dolnym rogu nad stałymi przyciskami. Dotknięcie otwiera duży podgląd z zoomem i dopasowaniem. Formularz można przewinąć ponad miniaturę. „Sprawdź punkt” zastąpiono „Dalej · zapisz punkt”; zapis nadal wymaga zatwierdzenia na kolejnym ekranie.

Weryfikacja poprawek: kontrola TypeScript, 43 testy TypeScript i release build przeszły. Na emulatorze sprawdzono miniaturę i duży podgląd z powrotem do etapu, ustawienie 10° zachowane po restarcie i korektę 48,5° → 50°, szybkie 3 → 2 kroki = 160 cm przy przeliczniku 80 cm oraz nowe podpisy przycisków. Kod Kotlin pozostaje bez zmian (7 testów przeszło w poprzednim przyroście). Ten build nie został jeszcze zainstalowany na telefonie.

### Uproszczenie ekranu pomiaru — 19 października 2026

Wdrożono zaakceptowany podział: domyślne jednostki, długość kroku, przyciąganie i tryb nowych projektów w ustawieniach; lokalne rozwinięcia „Więcej opcji” dla trybu kierunku projektu lub przelicznika konkretnego boku. Zmiana domyślnego trybu nie modyfikuje zapisanych projektów; starsze preferencje otrzymują domyślne `directionMode: relative`. Przy braku wybranego sensora nowy projekt używa trybu ręcznego.

Po przechwyceniu kąta korekta jest zwinięta pod „Popraw kąt” (w trybie ręcznym pola widoczne). Zamiast stale pokazywanych parametrów czujnika jest prosty status i zwinięte szczegóły liczbowe. Przy długości kompaktowa jednostka otwiera wybór m/cm z przeliczeniem wartości. Przelicznik zmieniony lokalnie dotyczy jednego boku; po zapisie wraca domyślna długość kroku.

Menu projektu ⋮ zawiera cofanie z potwierdzeniem, niezależny pomiar powrotu do P1 przy kompletnym podsumowaniu, diagnostykę i ustawienia. Osobny ekran diagnostyki zawiera uwagi testera, pomiar odniesienia, logi i ręczne zatrzymanie sesji. Podstawowy formularz nie zawiera narzędzi testowych. Dolne akcje i pływający szkic pozostają dostępne. TypeScript, 43 testy i release build przeszły.

Emulator: aktualizacja APK zachowała projekty; sprawdzono menu ⋮, osobną diagnostykę (również aktywną sesję) i powrót z ustawień do kroku długości, konwersję 200 cm → 2 m, lokalny przelicznik 90 cm i zapis 2 kroków = 1,8 m oraz powrót kolejnego boku do domyślnych 80 cm. W trybie względnym podstawowy ekran pokazuje prosty status, szczegóły są zwinięte, a wymagane odtworzenie odniesienia nadal pojawia się automatycznie.

Potwierdzono również zwiniętą korektę po przechwyceniu czujnikowym (surowe 49,27° nie zostało automatycznie zaokrąglone), rozwinięcie pola i suwaka oraz cofnięcie boku po zatrzymaniu sesji przez diagnostykę: aplikacja otworzyła sesję logowania i przeszła z P3 do P2 bez błędu. Emulator testowy został zamknięty po weryfikacji. Nowy APK następnie zainstalowano i uruchomiono na fizycznym telefonie na polecenie użytkownika; testy użytkowe tego builda na telefonie pozostają do wykonania.

### Pozostałe funkcje

Najnowsza lista projektów: pojedyncze wiersze z nazwą, datą ostatniej zmiany i osobnym menu ⋮ (Otwórz/Usuń). Nazwy są jednoliniowe z wielokropkiem; data i przycisk pozostają widoczne. Kliknięcie nazwy/daty otwiera projekt, menu nie propaguje otwarcia. Usunięcie nadal wymaga potwierdzenia. Początkowy limit wynosi 3 projekty, przycisk „Więcej” zwiększa go o 10 i znika po pokazaniu wszystkich. Kolejność z repozytorium: `updated_at DESC`. Współdzielony magazyn nadal przechowuje wszystkie projekty, limit dotyczy renderowania strony głównej. TypeScript i release build przeszły.

Weryfikacja listy na emulatorze: 3 z 5 zachowanych projektów widoczne początkowo, po „Więcej” wszystkie 5 i brak przycisku kolejnych pozycji. Sprawdzono jednoliniowy układ na zrzucie, menu wybranego projektu bez wejścia w pomiar, potwierdzenie usunięcia i anulowanie bez utraty projektu, otwarcie przez wiersz oraz przez „Otwórz” w menu. Powrót z pomiaru zachowuje już rozwiniętą listę. Nie powtarzano testów domeny dla zmiany prezentacji listy.

Najnowsza zmiana strony głównej: po prawej stronie nagłówka znajduje się menu ⋮ z Ustawieniami i Logami pomiarowymi. Usunięto ich wcześniejsze przyciski spod listy projektów. Menu zamyka się przy przejściu do wybranego ekranu, przez „Wróć” lub systemowe Wstecz; zachowuje nazwę wpisaną w formularzu nowego projektu. TypeScript przeszedł; nie powtarzano testów domeny dla przeniesienia nawigacji.

Najnowszy układ korekty kąta: wspólny komponent `AngleControls` ustawia `[L] [pole kąta] [P]` w jednym rzędzie; w korekcie odczytu sensorowego suwak jest bezpośrednio poniżej. Rząd jest używany także w trybie ręcznym i edycji ostatniego boku. Wybrany kierunek ma zielone wypełnienie i stan dostępności `selected`; etykiety czytnika pozostają „W lewo”/„W prawo”. TypeScript przeszedł. Zmiana dotyczy prezentacji; nie powtarzano testów fizycznych ani pełnego zestawu testów.

Najnowsza zmiana korekty kąta: suwak ±15° ma skok 5° dla dotyku i dostępności; wynikowy skręt zawsze zaokrągla do pełnej wielokrotności 5° (88,3° → 90°, kolejny skok → 95°). Zaokrąglanie wyniku jest niezależne od ustawienia przyciągania pola ręcznego. Surowy odczyt nie zmienia się przed użyciem suwaka. Pole ręczne zachowuje dotychczasową dokładność i ustawienie przyciągania. TypeScript i 44 testy przeszły, w tym niepełny odczyt, oba kierunki, granice 0/180° i przejście przez ±180°. Nie wykonywano nowej próby UI na telefonie ani emulatorze.

Najnowszy układ krokomierza: komponent `StepControls` układa `[−] [liczba kroków] [+] [Start/Stop]` w jednym rzędzie. Pole elastycznie zajmuje wolne miejsce, przyciski mają obszary dotyku co najmniej 44 px. Podczas liczenia pole i ±1 są zablokowane; Stop jest po prawej w miejscu Start. Usunięto osobny Start poniżej pola i Stop z dolnego paska nawigacji. Brak detektora blokuje Start, pozostawiając ręczne pole i korektę; minus nie pozwala zejść poniżej zera, plus przy pustym polu ustawia 1. Surowe kroki pozostają zachowane. TypeScript i diff przeszły; nie zmieniano natywnego mechanizmu liczenia i nie powtarzano testów fizycznych dla tej zmiany układu.

Najnowsze uproszczenie: całkowicie usunięto „Więcej opcji” i lokalne przełączanie trybu/przelicznika z ekranu pomiaru. `settings.directionMode` jest teraz globalnym wyborem dla wszystkich projektów, nie tylko domyślną wartością nowych projektów. Zmiana w ustawieniach zatrzymuje aktywną sesję; ekran unieważnia przechwycony kierunek i odniesienie oraz wraca do etapu kierunku. Wpisana długość pozostaje zachowana. `project.mode` i `Observation.mode` nadal przechowują historię bez przepisywania starszych obserwacji. Przy braku sensora ekran używa trybu ręcznego. Przelicznik kroków pozostaje w ustawieniach; istniejące formularze i obserwacje zachowują użyty przelicznik. Kontrola TypeScript, 43 testy i diff przeszły. Nie wykonywano nowej próby tej zmiany na emulatorze ani telefonie.

Najnowsza uwaga użytkownika: usunięto całkowicie przycisk „Szczegóły odczytu” oraz liczbowy rozrzut/jakość z ekranu pomiaru. Pozostał ogólny status. „Gotowy do przechwycenia” jest zielony i pogrubiony tylko przy aktywnej sesji, gotowym oknie próbek, rzucie poziomym ≥ 0,2, jakości ≥ 2 i rozrzucie ≤ 3°. W innych stanach tekst pozostaje neutralny i opisuje stabilizowanie lub problem. Osobna diagnostyka i dane logów pozostają dostępne. Kontrola TypeScript i sprawdzenie diff przeszły; nie powtarzano pełnych testów dla tej niewielkiej zmiany prezentacji.

- Tworzenie, otwieranie i usuwanie projektów SQLite; zapis zatwierdzonych boków.
- Tylna kamera i celownik; tryby magnetyczny, względny i ręczny.
- Natywny Kotlin SensorManager: rotation vector i game rotation vector. Kierunek wyznaczany z poziomego rzutu osi tylnej kamery.
- Próbkowanie zadane 25 Hz, okno około 2 s, próg rozrzutu 3°, minimalny poziomy rzut osi 0,2. Słaba stabilność lub accuracy wymagają świadomego zaakceptowania ostrzeżenia.
- W nowej sesji sensora przy istniejących bokach wymagane jest odtworzenie odniesienia na wybranym znanym boku. Zapobiega to mieszaniu układów po wznowieniu lub zmianie trybu.
- Obrys SVG: punkty, długości, przesuwanie, zoom i dopasowanie; cofnięcie ostatniego boku zachowuje obserwację źródłową.
- Osobne zamknięcie topologiczne i niezależny pomiar powrotu do P1. Bez pomiaru powrotnego nie pokazujemy błędu zamknięcia. Pole tylko dla zamkniętego obrysu bez samoprzecięć.
- JSONL zapisywany natywnie, bufor utrwalany co sekundę, przy przechwyceniu i zakończeniu. Po awarii zachowujemy pełne rekordy i oznaczamy sesję jako przerwaną.
- Logi zawierają metadane, surowe sensory, kierunek, jakość, kroki i przelicznik, geometrię, operacje oraz błędy. Tester może dopisać kontekst i niezależne odniesienie.
- Podgląd, kopiowanie, usuwanie logów i eksport JSONL/CSV. Migawka aktywnej sesji jest spójna. Części kopiowania do 128 KiB zachowują granice rekordów i UTF-8; duże logi mają ponumerowane części.
- Limit logów 100 MiB, ostrzeżenie przy 80 MiB; bez automatycznego usuwania starszych sesji. Odczyt dużych logów został przyspieszony buforowanym indeksowaniem.

## Weryfikacja

- 41 testów TypeScript i 7 testów Kotlin przeszło, łącznie 48 (drugi przyrost MVP).
- TypeScript, release build, lintVital i weryfikacja podpisu APK przeszły.
- Expo Doctor: 21/22. Pozostało znane ostrzeżenie regresji pamięci Hermes V1 w SDK 56; nie zostało ukryte ani rozwiązane. Oficjalna poprawka wymaga późniejszej migracji SDK/RN, opisanej w instrukcji.
- Emulator Pixel 8 API 36: kamera, próbki sensora, przechwycenie, 2,5 kroku = 187,5 cm, zapis i powrót po wymuszonym zamknięciu, zachowanie danych po aktualizacji APK.
- Sprawdzono offline ręczne kąty, obrys czteropunktowy, pole, obwód i niezależny pomiar zamknięcia.
- Sprawdzono log około 1,54 MiB w 13 częściach, przechodzenie między częściami, sukces kopiowania i otwarcie systemowego udostępniania CSV. Nic nie wysłano do osób ani usług.
- Odczyt wklejonego tekstu przez automatyzację UI pokazał tylko 5000 znaków; nie stanowi to potwierdzenia kompletności całego wklejenia. Zachowanie pełnych rekordów i UTF-8 sprawdzają testy podziału logów.
- Emulator uruchomiony do testów został zamknięty; tryb samolotowy testowego emulatora wyłączono po próbie.

## Pliki i odtwarzanie środowiska

- [Instrukcja instalacji i testów](docs/technical/prototyp.md)
- [Dokument techniczny](docs/technical/dokumentacja-techniczna.md)
- [Analiza biznesowa](docs/technical/analiza-biznesowa.md)
- Źródłowy Word pozostaje bez zmian w `docs/business/`.
- Ekrany: `app/src/app/`; model i geometria: `app/src/domain/`; SQLite i adaptery: `app/src/infrastructure/`.
- Własny moduł: `app/modules/fieldsketch-orientation/`; natywny projekt `app/android/` jest generowany i ignorowany przez Git.
- Stos: Expo 56.0.23, React Native 0.85.3, React 19.2.3; zależności przypięte w package-lock.json. Expo Go nie obsługuje tego modułu.
- Windows: Node 20.19.6, Android SDK 36, NDK 27.1.12297006. Skrypt PowerShell ma UTF-8 z BOM i obsługuje ostrzeżenia narzędzi natywnych bez traktowania ich jako nieudanego builda.

W katalogu `app/`:

```powershell
npm ci
npm run typecheck
npm test
npm run build:apk
```

Skrypt budowania przypina szablon SDK 56, uruchamia testy natywne, buduje release z JavaScript i kopiuje APK do `artifacts/`. Artefakty, zależności oraz wyniki kompilacji są ignorowane przez Git.

Instalacja na jedynym podłączonym fizycznym urządzeniu:

```powershell
adb -d install -r artifacts/FieldSketch-CAD-0.1.0.apk
adb -d shell am start -n pl.fieldsketch.cad.prototype/.MainActivity
```

Przy pierwszym pomiarze kamerą użytkownik udziela zgody na kamerę. APK nie wymaga mikrofonu ani szerokiego dostępu do pamięci zewnętrznej.

## Git i następny krok

Gałąź: `mvp`. Commit ustaleń przed implementacją: `a1278ca`. Bazowy commit MVP: `4818fdb` — `feat: implement guided survey MVP with pedometer and PNG export`. Poprawki po próbie telefonu, uproszczenie interfejsu i aktualizację dokumentacji zapisano na polecenie użytkownika w commicie `feat: simplify survey controls and project navigation`. Wcześniejsze commity dokumentacji: `12efd45` i `25c97e3`. Nie wykonywano pushowania.

W tej sesji Git wymagał jawnego `--git-dir=C:/projects/fieldSketch-CAD/.git --work-tree=C:/projects/fieldSketch-CAD`, ponieważ zwykłe polecenia zgłaszały właściciela repozytorium. Nie zmieniano globalnego safe.directory. Zapis metadanych Git oraz niektóre uruchomienia npm/Androida wymagały eskalacji sandboxa.

Najbliższy krok to próba nowego APK na fizycznym telefonie oraz diagnoza częstego nadliczania 1–2 kroków z logiem i znaną liczbą kroków. Użytkownik docelowy, ostateczny zakres MVP i monetyzacja nadal wymagają doprecyzowania. Nie rozszerzać samoczynnie zakresu o DXF, solver lub migrację SDK bez nowego zadania.
