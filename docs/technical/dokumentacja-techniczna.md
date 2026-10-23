# Dokumentacja techniczna outlineGo

Data: **23 października 2026**. Aplikacja 0.1.0 / versionCode 2, kod APK 8365dca. APK zainstalowano i uruchomiono na Redmi; testy funkcjonalne pozostają otwarte. Bieżąca weryfikacja: TypeScript i 183 testy w 24 zestawach. [Stan źródeł i paczek](../stan-projektu.md); [historia instalacji](../../MEMO.md). Sekcje architektury docelowej poniżej nie oznaczają realizacji całego P0/P1.

## Aktualny zakres implementacji

Kod w `app/` realizuje wizard pomiaru, kamerę, trzy globalne tryby kierunku, ręczne m/cm/ft/in i natywny krokomierz Start/Stop, projekty i formularze SQLite v3, cofanie, korekty zapisanych boków z historią, zamknięcie, pole i obwód, PNG, DXF, notatki, przypinanie oraz wewnętrzny lokalny zapis sesji. Ekrany przeglądania i eksportu logów usunięto. Interfejs działa w PL/EN/DE/ES/FR. Wdrożono limity Free, bramkę DXF, zakup/przywracanie przez Google Play Billing oraz trwałe uprawnienie Plus offline. Testy transakcji pozostają otwarte. Przekątne kontrolne, edytor ograniczeń i solver sieci pozostają zakresem docelowym. [Instrukcja](prototyp.md), [Free/Plus](free-plus.md), [edycja szkicu](edycja-szkicu.md).

Pierwsza implementacja przechowuje migawki projektów, niezmienne obserwacje i operacje w SQLite, a próbki JSONL zapisuje natywnie. Dane surowe i skorygowane nie są jeszcze osobnymi edytowalnymi obrysami; prototyp nie wykonuje dopasowania. Metadane logów są w plikach towarzyszących. Sumy kontrolne i import kopii projektu opisane w architekturze docelowej nie należą do tego przyrostu.

## Wdrożony interfejs pomiaru

Wielojęzyczność wdrożono 20 października 2026: PL, EN, DE, ES i FR. Domyślnie język systemowy z angielskim jako rezerwowym; ręczny wybór w ustawieniach jest zapamiętywany. Lokalizacja obejmuje interfejs, dialogi, pomoc, błędy, dostępność i opisy eksportów oraz formatowanie liczb i dat. Jednostki, nazwy szkiców, notatki i geometria pozostają niezależne od języka. Android 13+ synchronizuje wybór z systemowym językiem aplikacji. Szczegóły i zakres weryfikacji: [wielojęzyczność](wielojezycznosc.md).

[Aktualny UI](ui-2026-10.md): stałe dolne akcje, szkic domyślnie w prawej kolumnie 40%, tryb pływający i pełny ekran, korekta kąta oraz krokomierz w dwóch rzędach. Jednostki m/cm/ft/in, długość kroku w cm, motywy light/dark/system i język są zapisane w ustawieniach. Lista początkowo pokazuje 3 szkice, przypięte najpierw, a następnie dodaje po 10; dotknięcie otwiera podsumowanie. Nie ma ekranów logów/diagnostyki.

Zmiana globalnego trybu zatrzymuje sesję i unieważnia roboczy kierunek/odniesienie; nie przepisuje historycznych obserwacji. Formularz zachowuje wpisy, ale wznowienie zaczyna się od kierunku. Tryb sensorowy przy istniejących bokach wymaga odtworzenia odniesienia. Długość ręczna ma jawne źródło, surowe i poprawione kroki są zachowane osobno; edycja tworzy nową obserwację z `supersedesId`.

Aktualna weryfikacja: TypeScript i 183 testy / 24 zestawy przeszły przed commitem 8365dca. 23.10.2026 prebuild i release APK zakończyły się powodzeniem; zadania testów Kotlin były UP-TO-DATE (raporty: 7 orientacji i 11 billing bez błędów). APK zainstalowano i uruchomiono na Redmi. Odbiór funkcjonalny Sentry, akceptacji i automatycznego zapisu notatek pozostaje otwarty. [Aktualne ograniczenia](../stan-projektu.md).

### Implementacja podglądu szkicu

`OutlineCanvas.tsx` renderuje SVG i obsługuje dotyk przez PanResponder. Czyste funkcje w `domain/sketchViewport.ts` obliczają dopasowanie, przesuwanie, skalowanie względem środka palców, poziomy i granice. Zoom 0,5–8× przechodzi po zakończeniu gestu do najbliższego poziomu (odległość logarytmiczna); ± wybierają poziomy sąsiednie. `Animated.timing` interpoluje skalę i przesunięcie przez 180 ms; nowe dotknięcie zatrzymuje animację. Granice są stosowane podczas gestu i każdej klatki animacji. Test odcinków chroni ukośny rysunek przed zniknięciem mimo nakładania się jego prostokąta granicznego z podglądem. Miniatura ma osobne sterowanie: przeciąganie zmienia jej róg, a gesty rysunku działają w dużym podglądzie.

### Implementacja korekt i metadanych

`Project` ma opcjonalne pola `note` i `pinned`; starsze szkice bez tych pól działają bez migracji tabel. `ProjectRepository.updateMetadata` w transakcji odczytuje aktualny szkic i zapisuje metadane, zachowując obserwacje, rewizję geometrii i roboczy formularz. Lista jest sortowana po przypięciu i dacie zmiany.

Ekran `dimensions.tsx` udostępnia tabelę długości, wybór boku do korekty kąta i ponownego pomiaru oraz podgląd przed zatwierdzeniem. `correctSides` przelicza kolejne wierzchołki z zachowaniem ich skrętów i identyfikatorów. Nowe obserwacje mają `supersedesId`; źródłowe pozostają niezmienne. Zmiana długości w tabeli oznacza źródło ręczne, sama zmiana kąta zachowuje dane kroków. Niezależny pomiar zamknięcia jest ponownie zakotwiczany w skorygowanym ostatnim punkcie. Korekta wyliczonej długości do P1 używa przecięcia dwóch okręgów i wybiera bliższe poprzedniemu położenie ostatniego narożnika; niewykonalne długości blokują zapis. Nie jest to wyrównanie całej sieci.

Ponowny pomiar korzysta z prefiksu punktów w istniejącym kreatorze; zapis zastępuje wybraną obserwację w pełnym szkicu. Nie dodaje punktu i działa przy limicie Free. Formularze są przypisane do rewizji, dla której je wczytano; korekta z innego ekranu nie przenosi starego formularza na nową geometrię. Zwykły zapis kolejnego boku zachowuje aktywne odniesienie sensorowe.

`domain/labelLayout.ts` rozmieszcza prostokąty tekstu z kontrolą kolizji z odcinkami, punktami i pozostałymi etykietami. Korzystają z niego podgląd, PNG i DXF. PNG dopasowuje obszar rysunku do etykiet, wymiary pozostają w tabeli; DXF ma poziome teksty na osobnych warstwach. Notatka jest dodawana do eksportów poza obrysem. [Szczegóły i ograniczenia](edycja-szkicu.md).

## Zgody i raportowanie błędów

[LegalNoticeGate](pierwsze-uruchomienie.md) działa po inicjalizacji SQLite i przed zamontowaniem nawigacji. Akceptacja bieżącej wersji dokumentów i informacja o ograniczeniach mają osobny zapis w user_settings; nie zmieniają zgody na diagnostykę. Starsze ustawienia bez akceptacji wymagają potwierdzenia; projekty pozostają bez zmian.

[Sentry](sentry.md) inicjalizuje się dopiero po osobnym opt-in zapisanym w SQLite. Pierwszy obsłużony błąd może uruchomić dialog zgody; odmowa jest zapamiętana. Filtr przed wysyłką stosuje listę dozwolonych pól, a transport sprawdza zgodę i blokuje stare żądania po jej odwołaniu. Brak natywnych awarii, replay, tracingu i uploadu lokalnych logów. DSN jest publiczny; token do sourcemap nie trafia do aplikacji.

## 1 Cel i status decyzji

Aplikacja umożliwi tworzenie pomocniczych obrysów 2D w terenie, korektę geometrii oraz eksport do DXF. **React Native z Expo jest pierwszym, wiążącym założeniem użytkownika.** Android, praca offline i podział na P0 oraz P1 wynikają z dokumentacji biznesowej.

Źródło wymagań: [dokumentacja biznesowa wersja 1.0](../business/FieldSketch_CAD_dokumentacja_biznesowa_i_prototyp.docx), szczególnie sekcje 3–10. [Analiza biznesowa](analiza-biznesowa.md) opisuje ryzyka i luki. Dalsze sekcje opisują architekturę docelową; dostarczony przyrost jest wskazany w sekcji Aktualny zakres implementacji. Opis architektury nie oznacza potwierdzonej dokładności urządzeń ani realizacji całego P1.

| Obszar | Ustalenie | Status |
| --- | --- | --- |
| Framework | React Native + Expo | Decyzja użytkownika |
| Długość w MVP | Ręczne m/cm/ft/in lub krokomierz/ręczne kroki; domyślnie 75 cm na krok, wartość zmieniana w ustawieniach | Wdrożona decyzja użytkownika |
| Platforma początkowa | Android | Wymaganie źródłowe |
| Dane | Offline, lokalnie, bez backendu i kont | Zakres źródłowy prototypu |
| Logi pomiarowe | Wewnętrzny zapis lokalny; ekrany podglądu i eksportu usunięte | Aktualizacja UI, 22.10.2026 |
| Języki | TypeScript oraz Kotlin dla sensorów | Propozycja techniczna |
| Uruchamianie | Expo development build z expo-dev-client | Propozycja dla własnego kodu natywnego |
| Dokładność | Testy trybu względnego dają akceptowalną dokładność; bez liczbowego progu i uogólnienia na inne tryby | Potwierdzenie użytkownika, 19 października 2026 |
| iOS i web | Brak zobowiązania w pierwszej wersji | Poza zakresem P0 i P1 |

## 2 Zakres i przyrosty

### P0 Walidacja kierunku

Minimalna aplikacja zawiera podgląd tylnej kamery z celownikiem, orientację telefonu, wykrywanie sensorów, rejestrację prób, trwałe logi lokalne z możliwością kopiowania treści oraz eksport diagnostyki CSV/JSON. Porównuje kierunek magnetyczny i względny, stabilizację, powrót po obrocie oraz zachowanie po zmianie stanowiska. Edytor CAD nie jest warunkiem ukończenia P0.

Wynikiem jest raport z opisem urządzeń, wersji aplikacji, procedury i rozkładu błędów. Przejście do P1 wymaga oceny użyteczności kierunku i wyboru warunków pomiaru.

### P1 Proces od pomiaru do DXF

P1 obejmuje projekty lokalne, punkty, ręczne wprowadzanie długości w krokach i kątów, podgląd XY, edycję, undo/redo, blokady, przekątne, zamknięcie, obwód, pole, diagnostykę i DXF. Automatyczne dopasowanie sieci jest SHOULD F11; zdjęcia COULD F12; Bluetooth i GPS LATER F13.

Aktualne MVP przyjmuje zarówno ręczne długości w m/cm (np. odczytane z miarki), jak i szacowanie krokami. Bezpośrednia integracja z dalmierzem pozostaje dalszym zakresem. Źródłowy dokument Word zachowuje pierwotną treść.

Chmura, logowanie, LiDAR, obowiązkowe ARCore, automatyczna rekonstrukcja 3D i certyfikacja dokładności pozostają poza bieżącym zakresem. W bieżącym kodzie zakup i przywracanie Plus są już wdrożone bez własnego backendu; testy Google Play pozostają otwarte.

## 3 Architektura i technologie

```text
SensorManager -> lokalny moduł Expo Kotlin -> rejestracja obserwacji
Kamera i celownik ------------------------> ekran pomiaru
Ekrany -> operacje aplikacyjne -> silnik geometrii TypeScript
                             -> repozytorium SQLite i pliki logów
Silnik geometrii -> podgląd 2D i raport jakości
Migawka projektu -> generator DXF lub JSON -> plik -> udostępnienie
```

Silnik geometrii nie importuje React Native, Expo, bazy ani sensorów. Repozytorium obsługuje transakcje i migracje. Ekrany wywołują operacje domenowe zamiast bezpośrednio zmieniać współrzędne w bazie.

| Warstwa | Propozycja | Cel |
| --- | --- | --- |
| UI i nawigacja | React Native, TypeScript strict, Expo Router | Ekrany i trasy |
| Kamera | expo-camera, CameraView | Podgląd i celownik |
| Sensory | Lokalny moduł Expo w Kotlin, SensorManager | Typ sensora, czas, orientacja i jakość |
| Rysunek 2D | react-native-svg, react-native-gesture-handler | Obrys, etykiety, zoom i przesuwanie |
| Dane | expo-sqlite | Zapis lokalny i migracje |
| Pliki | expo-file-system, expo-sharing | Diagnostyka, kopia projektu i eksport |
| Schowek | expo-clipboard | Kopiowanie tekstowej treści loga przez użytkownika |
| Testy | Jest w konfiguracji zgodnej z Expo | Domena i integracje |

Dokładne wersje należy wybrać przy inicjalizacji. React Native musi odpowiadać wybranemu stabilnemu Expo SDK; zależności natywne instalować przez `npx expo install`, kontrolować przez Expo Doctor i utrzymywać jeden plik blokady zależności. Własny moduł natywny wymaga development build, zamiast polegania na Expo Go [T1, T2]. Skia jest alternatywą dla SVG, jeżeli pomiar wydajności uzasadni zmianę renderera.

expo-camera jest proponowanym uproszczeniem względem bezpośredniej integracji CameraX w źródle. P0 nie analizuje klatek. Jeśli testy wykażą potrzebę synchronizacji z klatkami lub brakujących parametrów kamery, należy rozszerzyć moduł natywny o widok CameraX. Nie uruchamiać dwóch konkurencyjnych podglądów kamery.

## 4 Struktura kodu

Repozytorium przechowuje dokumenty w `docs/business` i `docs/technical`, aplikację w `app`. W pierwszym przyroście ekrany są w `src/app`, model i geometria w `src/domain`, adaptery w `src/infrastructure`, moduł Kotlin w `modules`. Poniższy podział na features i podmoduły domeny pozostaje strukturą docelową:

```text
app/
  src/
    app/                  trasy Expo Router
    features/
      projects/           projekty i ustawienia
      survey/             rejestracja pomiaru
      editor/             podgląd i edycja
      diagnostics/        jakość i raporty P0
      export/             przebieg eksportu
    domain/
      geometry/           XY i walidacja
      measurements/       obserwacje i odniesienia
      constraints/        więzy i reszty
      history/            operacje undo/redo
    infrastructure/
      database/           migracje i repozytoria
      sensors/            adapter modułu Expo
      files/              zapis i odczyt
      dxf/                generator DXF
    shared/               wspólne UI i formatowanie
  modules/fieldsketch-orientation/   lokalny moduł Expo Kotlin
  tests/fixtures/         dane i pliki referencyjne
  app.config.ts
  package.json
```

Zewnętrzny `app/` jest katalogiem projektu, a `app/src/app/` katalogiem wdrożonych tras. Logika domenowa pozostaje poza trasami.

## 5 Ekrany i rejestracja pomiaru

Lista szkiców pokazuje jednoliniowe nazwy, daty ostatniej zmiany, ikonę przypięcia i menu Otwórz/Przypnij lub Odepnij/Usuń. Początkowo widoczne są 3 pozycje, następnie po 10, w kolejności przypięte → pozostałe i według daty zmiany w każdej grupie. Kliknięcie wiersza otwiera szkic. Ustawienia, logi i oferta Plus są w menu nagłówka. Ustawienia zawierają język, globalny tryb kierunku, domyślne m/cm i długość kroku oraz przyciąganie pola kąta. Jednostka wewnętrzna to metr.

Ekran pomiaru pokazuje celownik i ogólny status gotowości, bez szczegółów liczbowych. Użytkownik zamraża kierunek, opcjonalnie poprawia skręt, podaje długość ręcznie lub mierzy ją krokomierzem, następnie sprawdza i zapisuje punkt. Kierunek pozostaje przypisany do punktu początkowego. Roboczy bok jest widoczny w pływającym szkicu; nawigacja pozostaje poza scrollem.

Szczegóły aktualnych kontrolek i reguł określa [wizard pomiaru](wizard-pomiaru.md); instrukcję obsługi zawiera [prototyp.md](prototyp.md).

### Długość w krokach w prototypie

Przyjmujemy **1 krok = 75 cm** jako przybliżoną, roboczą długość pojedynczego kroku dorosłego mężczyzny przy zwykłym chodzie. Jeden krok oznacza przejście od podparcia jednej stopy do podparcia drugiej, a nie pełny cykl dwóch kroków. To wartość początkowa ustawienia długości kroku, nie uniwersalna średnia dla wszystkich użytkowników. Jako punkt odniesienia badanie zwykłego chodu 11 młodych dorosłych mężczyzn podaje dla prawego kroku średnią 74 cm; 75 cm jest jej praktycznym zaokrągleniem [T9].

```text
DEFAULT_STEP_LENGTH_CM = 75
lengthCm = stepCount * stepLengthCm
lengthM = lengthCm / 100
Przykład: 10 kroków -> 750 cm -> 7,5 m
Przykład: 2,5 kroku -> 187,5 cm -> 1,875 m
```

Formularz „Liczba kroków” dopuszcza dodatnie wartości ułamkowe, np. 2,5, aby można było oszacować niepełny krok. Pokazujemy użyty przelicznik i długość w wybranych m/cm. Geometria liczy w metrach. W eksporcie DXF jednostka odpowiada ustawieniom m/cm; przekątne kontrolne pozostają dalszym zakresem.

Liczbę kroków i użyty przelicznik zachowujemy razem z obserwacją. Ustawienia pozwalają zmienić domyślną długość kroku bez przeliczania historii i przywróconego formularza. Surową liczbę z detektora zachowujemy obok liczby poprawionej. Automatyczny proces kalibracji nie jest wdrożony. Wynik w centymetrach jest jednostką prezentacji oszacowania, nie deklaracją centymetrowej dokładności.

Proponowane stany: `ready -> stabilizing -> directionCaptured -> lengthEntered -> review -> committed`. Powrót z tła wymaga ponownego sprawdzenia odniesienia i unieważnienia niezapisanej próbki, jeśli utracono jego ciągłość.

W architekturze docelowej edytor ma pokazywać także ograniczenia i przełączany obrys surowy, a ekran jakości rozdzielać obserwacje, wyniki i reszty. Te rozszerzenia nie należą do aktualnego MVP. W MVP tryb ręczny w ustawieniach pozwala pracować bez sensora i kamery, bez ARCore.

## 6 Moduł orientacji Androida

### Kontrakt i cykl życia

Proponowane API: `getCapabilities()`, `startSession(options)`, `captureDirection()`, `stopSession()` oraz zdarzenia `orientationSample` i `sensorStatusChanged`. Każda sesja ma identyfikator i jawne odniesienie. Brak sensora jest obsługiwanym stanem.

Próbka zawiera oryginalne wartości zdarzenia, typ sensora, orientację z opisaną kolejnością składowych, monotoniczny czas zdarzenia, czas rejestracji UTC, accuracy, obrót ekranu i kierunek poziomy osi celowania. Nagłówek sesji przechowuje model telefonu, wersje Androida i aplikacji, producenta i nazwę sensora oraz parametry próbkowania i algorytmu.

Odczyt i buforowanie odbywają się natywnie. Do UI trafiają ograniczone podsumowania, a diagnostyka zachowuje próbki w partiach. Nie odświeżać całego drzewa React dla każdej próbki. Początkowe parametry badawcze to 20–50 Hz oraz okno 1–2 s; rzeczywiste odstępy i utracone próbki należy logować. Przejście do tła zatrzymuje sensory i kamerę. Nie zakładać ciągłości kierunku względnego przez restart sesji.

### Kierunek i odniesienie

- Magnetyczny: `TYPE_ROTATION_VECTOR`, odniesienie do północy magnetycznej, bez obietnicy północy geograficznej.
- Względny: `TYPE_GAME_ROTATION_VECTOR`, bez odniesienia do północy, z bazą wybraną przez użytkownika; możliwy dryf [T4].
- Ręczny: kąt w układzie projektu, niezależny od sensora.

Każda obserwacja wskazuje `referenceFrameId`. Kierunków z różnych odniesień nie wolno mieszać bez jawnej transformacji. Ponowne odniesienie do znanego boku zapisuje obrót i powiązanie sesji, zachowując wcześniejsze obserwacje.

Kierunek należy wyprowadzić z osi optycznej tylnej kamery przez transformację do świata i rzut poziomy. Azymut górnej krawędzi telefonu nie jest automatycznie kierunkiem celownika. P0 sprawdza znaki osi, obrót ekranu i zgodność celowania na rzeczywistym telefonie.

Przy niemal pionowym celowaniu poziomy rzut osi jest zbyt krótki: aplikacja żąda zmiany pochylenia. Próg ustala P0. Dla kierunków stosować średnią kołową i rozrzut poprawny przy 359°/0°. Stabilność odczytu nie dowodzi poprawności przy zakłóceniach magnetycznych; accuracy jest informacją pomocniczą.

Operator powinien znajdować się nad początkiem boku. Offset telefonu nie jest automatycznie kompensowany. Długość ma dotyczyć poziomego rzutu odcinka; pomiar po skosie wymaga dodatkowych danych, poza pierwszym modelem 2D.

## 7 Model danych i trwałość

| Encja | Najważniejsze pola |
| --- | --- |
| Project | id, schemaVersion, name, createdAt, updatedAt, units=m, coordinateConvention, surveyMode, geometryRevision, algorithmVersion, exportSettings |
| Point | id, projectId, order, xRawM, yRawM, xAdjustedM, yAdjustedM, locked, sourceKind |
| Observation | id, projectId, kind=traverse/control/closure, fromPointId, toPointId, lengthSource=steps, stepCount, stepLengthCm, lengthCm, lengthM, headingRad lub null, headingType, referenceFrameId, timestampUtc, quality, sampleWindowId, supersedesId |
| Constraint | id, projectId, type, pointIds, target, weight, hard, enabled |
| SensorSession | id, projectId, sensorType, deviceMetadata, referenceFrameId, transformToProject, samplingConfig, algorithmVersion |
| DiagnosticChunk | id, sessionId, filePath, checksum, sampleCount, droppedCount, timeRange |
| EditOperation | id, projectId, sequence, type, before, after, geometryRevision |

Obserwacje są niezmienne po zatwierdzeniu. Poprawka tworzy nowy zapis powiązany przez `supersedesId`. Edycja geometrii nie usuwa źródła pomiaru. Usunięcie punktu z obrysu zachowuje jego identyfikator w historii; usunięcie całego projektu usuwa także obserwacje i pliki po potwierdzeniu użytkownika.

Surowe współrzędne są wynikiem obserwacji, nie ich zamiennikiem. Punkt dodany ręcznie może mieć współrzędne raw równe null. Number przechowuje pełną precyzję obliczeń; zaokrąglenie dotyczy prezentacji i eksportu. Przeliczanie wymaga zapisanej wersji algorytmu i kolejności operacji.

Proponowane tabele SQLite odpowiadają encjom. Zatwierdzenie obserwacji, punktów, rewizji i operacji edycji jest jedną transakcją. Diagnostyka trafia do porcjowanych plików JSONL; CSV służy eksportowi. Baza przechowuje metadane i sumy kontrolne plików. Start aplikacji rozpoznaje niedokończone zapisy i zgłasza braki logów bez uszkadzania geometrii.

Migracje mają numery i testy na poprzedniej wersji. Nie usuwać bazy po błędzie migracji. Zatwierdzone kroki zapisują się automatycznie. Historia undo/redo obejmuje operacje użytkownika, nie próbki sensorów. Nowa operacja po undo usuwa gałąź redo, zachowując obserwacje źródłowe.

Proponowana kopia projektu JSON zawiera wersję schematu, metadane, obserwacje, ograniczenia i geometrię; import weryfikuje odwołania i wersję. Zdjęcia i diagnostyka wymagają osobnego dołączenia lub jawnej informacji o ich braku. DXF nie jest kopią projektu.

### Lokalne logi do analizy dokładności

Wymaganie użytkownika: prototyp automatycznie zapisuje logi pomiarowe w trwałej pamięci wewnętrznej aplikacji. Zapis nie może ograniczać się do RAM, konsoli deweloperskiej ani katalogu cache. Logi są dostępne offline po zamknięciu i ponownym uruchomieniu aplikacji. P0 prowadzi samodzielne sesje diagnostyczne, a P1 wiąże sesje z projektem i obserwacjami.

Każdy rekord ma `logSchemaVersion`, numer kolejny, typ zdarzenia, czas UTC i czas monotoniczny oraz identyfikatory sesji, obserwacji i rewizji, jeśli istnieją. Rejestrujemy:

- Nagłówek sesji: urządzenie, Android, wersja aplikacji i algorytmu, dostępne sensory, aktywny tryb, parametry próbkowania, układ odniesienia i transformacja osi kamery.
- Próbki orientacji: oryginalne wartości zdarzeń, kwaternion lub macierz z opisaną konwencją, kierunek poziomy, pochylenie, obrót ekranu, accuracy, rzeczywiste odstępy i liczba utraconych próbek.
- Przechwycenie kierunku: zakres próbek, średnia kołowa, rozrzut, czas stabilizacji, aktywne progi, ostrzeżenia, powtórzenie lub odrzucenie próby.
- Dane długości: wpisana liczba kroków, użyte 75 cm na krok, wynik w cm i m oraz poprawki wejścia.
- Geometria: punkty i współrzędne surowe oraz skorygowane, zastosowane więzy, operacje edycji, reszty, wektor i norma niedomknięcia. Zapis obejmuje wartości przed i po korekcie.
- Przerwania i błędy: tło, restart sesji, zmiana odniesienia, brak sensora, błąd pliku i przerwy w rejestracji; bez maskowania brakujących danych.
- Kontekst próby wpisany przez testera: obiekt, otoczenie, oznaczenie operatora i opcjonalne niezależne długości lub kierunki odniesienia wraz z metodą ich uzyskania. Te wartości służą diagnostyce i nie zastępują wejścia w krokach.

Bez niezależnego odniesienia log pozwala analizować powtarzalność, stabilność i spójność, lecz nie wyznacza samodzielnie rzeczywistego błędu pomiaru. Wartość nieznana jest oznaczona jako brak danych, zamiast zera. Próby z referencją pozwalają oddzielnie porównać kierunek i przeliczenie kroków.

Zdarzenia i próbki zapisujemy w porcjach JSONL z metadanymi w SQLite. Zatwierdzenie obserwacji wymusza utrwalenie powiązanej partii; przy przejściu do tła opróżniamy bufor. Po awarii zachowujemy kompletne rekordy, a niedokończony ogon oznaczamy jako przerwę. Proponowany limit logów prototypu to 100 MiB: przed jego osiągnięciem aplikacja ostrzega, a po osiągnięciu zatrzymuje rejestrację z widocznym komunikatem. Nie usuwa wcześniejszych sesji automatycznie. Użytkownik może usunąć wybraną sesję po potwierdzeniu; nie usuwa to geometrii projektu.

### Podgląd i kopiowanie loga

Ekran „Logi pomiarowe” pokazuje listę sesji z datą, projektem lub oznaczeniem próby, rozmiarem i statusem kompletności. Szczegóły udostępniają przewijany tekst oraz przycisk **„Kopiuj treść loga”**. Akcja kopiuje pełną treść wybranej sesji z nagłówkiem i danymi, a nie tylko podsumowanie lub widoczny fragment. Log diagnostyczny nie jest automatycznie wysyłany.

Kopiowanie aktywnej sesji najpierw utrwala bufor i ustala migawkę do wskazanego numeru rekordu. Podgląd może być stronicowany, ale kopiowanie nie może po cichu obcinać tekstu. Przy dużym logu aplikacja udostępnia ponumerowane części do osobnego skopiowania; każda zawiera identyfikator sesji, numer części, liczbę części i zakres rekordów. Granicę rozmiaru pojedynczej operacji należy zweryfikować na urządzeniach; eksport pliku pozostaje dodatkową możliwością.

Do zapisu tekstu w schowku używamy `Clipboard.setStringAsync` z expo-clipboard [T10]. Komunikat „Skopiowano log” pojawia się po potwierdzonym sukcesie; błąd pozostawia log i umożliwia ponowienie lub kopiowanie częściami. Kopiowanie nie wymaga odczytywania wcześniejszej zawartości schowka.

## 8 Geometria i edycja

Wewnątrz systemu stosujemy metry i radiany. P1=(0,0), X rośnie w prawo, Y do góry. Kąt theta jest liczony od +X przeciwnie do ruchu wskazówek zegara. Odwrócenie Y następuje wyłącznie podczas rysowania na ekranie.

```text
xNext = xCurrent + lengthM * cos(theta)
yNext = yCurrent + lengthM * sin(theta)
theta = normalize(pi/2 - magneticAzimuth + frameRotation)
```

`frameRotation` jest jawną transformacją do układu projektu. Tryb względny wymaga własnej bazy, zamiast traktowania jego kierunku jako absolutnego azymutu. Eksport zachowuje XY bez ekranowego odwracania Y.

Liczba kroków i długość kroku muszą być dodatnie i skończone, a wynik konwersji również skończony. Formularz akceptuje polski przecinek dziesiętny, odrzuca zero, liczby ujemne, NaN i nieskończoność oraz pokazuje wejście w krokach i wynik w cm. Granice i tolerancje są parametrami do ustalenia, a nie deklaracją dokładności pomiaru. Długość używana w geometrii pochodzi z konwersji, bez wcześniejszego zaokrąglania.

### Zamknięcie i jakość

Zamknięcie topologiczne łączy ostatni punkt z P1. Błąd zamknięcia wymaga niezależnego pomiaru ostatniego boku wracającego do P1. Przewidywany koniec tego boku jest wynikiem obserwacji, bez dodawania drugiego wierzchołka P1 do polilinii.

Wektor niedomknięcia to suma mierzonych wektorów całego obiegu, jego norma to błąd liniowy. Bez pomiaru powrotnego UI podaje „brak pomiaru zamknięcia”, a nie zero. Raport rozdziela wynik surowy i skorygowany.

Reszta długości: `distance(adjustedA, adjustedB) - measuredLengthM`. Resztę kierunku normalizować do [-pi, pi). Obwód sumuje boki zamkniętego obrysu, pole liczymy wzorem Gaussa. Dla obrysu otwartego pole jest niedostępne; dla samoprzecięcia pokazać konflikt zamiast zwykłej powierzchni użytkowej.

### Operacje i ograniczenia

P1 zaczyna od jawnych korekt lokalnych. Zmiana długości utrzymuje wskazany punkt bazowy i kierunek, przesuwając drugi punkt; zmiana kąta utrzymuje bazę i długość. Skutki dla sąsiednich boków pokazują reszty. Prostopadłość i równoległość odnoszą wybrany bok do wskazanego boku lub osi.

Blokada punktu uniemożliwia jego przesunięcie. Konflikt z blokadą lub twardym więzem odrzuca zmianę z wyjaśnieniem, bez cichego usuwania ograniczeń. Dodanie lub usunięcie punktu wymaga walidacji zależności. Przekątne można zapisywać i oceniać bez solvera.

Późniejszy solver F11 może minimalizować ważone reszty długości i kierunków z normalizacją jednostek. Wagi wymagają uzasadnionej niepewności. Trzeba ustalić początek i orientację oraz wykrywać niedookreślenie, sprzeczności i odbicia lustrzane. Brak zbieżności nie nadpisuje ostatniej poprawnej geometrii.

## 9 Eksport DXF

Implementacja z 20 października 2026: tekstowy DXF R2000, współrzędne 2D z Z=0. Jednostka z ustawień: metry (`$INSUNITS=6`) lub centymetry (`$INSUNITS=5`); zastępuje wcześniejszą propozycję milimetrów. Współrzędne, wysokości tekstów i przesunięcia opisów są przeliczane razem. Sam nagłówek nie skaluje wartości [T8]. Liczby mają kropkę bez separatorów tysięcy. [Zakres implementacji i stan weryfikacji](eksport-dxf.md).

| Warstwa | Zawartość |
| --- | --- |
| OUTLINE | LWPOLYLINE, flaga closed zgodna ze szkicem |
| POINT_LABELS | TEXT z numerami punktów |
| LENGTHS | TEXT z długościami i jednostkami, bez asocjatywnego DIMENSION |
| NOTES | TEXT z nazwą szkicu i objaśnieniami |

Generator obsługuje deklaracje warstw, liczbę wierzchołków, sekcje wybranej wersji DXF i EOF. Zamknięta polilinia nie duplikuje pierwszego wierzchołka. Etykiety punktów mają postać P1, a polskie opisy kodowanie DXF Unicode; sprawdzono je w LibreCAD. Długa nazwa może być skrócona w opisie eksportu, pełna pozostaje w szkicu.

Eksport używa przekazanej wersji szkicu i `geometryRevision`. Najpierw zapisuje cały plik w cache, następnie udostępnia ukończony wynik. Anulowanie udostępnienia nie usuwa szkicu. Wszystkie warstwy pomocnicze są eksportowane; ich widoczność można zmienić w CAD.

Test referencyjny: prostokąt 2 × 3 m daje 2 × 3 jednostki przy m albo 200 × 300 przy cm. Przed release wymagane sprawdzenie właściwej skali i stanu polilinii w dwóch programach CAD. W tej iteracji sprawdzono import wizualny w LibreCAD i testy generatora; drugi CAD oraz próba udostępniania na telefonie pozostają otwarte.

## 10 Uprawnienia i błędy

Kamera jest potrzebna wyłącznie do celownika i opcjonalnych zdjęć. Odmowa nie blokuje ręcznej edycji. Prototyp nie wymaga lokalizacji, kontaktów, mikrofonu ani sieci w procesie pomiaru. Konfigurację kamery sprawdzić pod kątem zbędnego uprawnienia audio.

Dane znajdują się w prywatnym obszarze aplikacji. Wyjście pliku poza aplikację jest działaniem użytkownika. Diagnostyka nie jest automatycznie wysyłana. Usunięcie projektu obejmuje załączniki i logi. Przed wydaniem trzeba ustalić retencję logów i konfigurację kopii systemowej Androida oraz wyjaśnić użytkownikowi skutki odinstalowania dla danych lokalnych.

Obsłużyć brak pamięci, błąd zapisu, przerwany eksport, cofnięte uprawnienie i utratę odniesienia. Nie oznaczać kroku jako utrwalonego po błędzie zapisu.

## 11 Weryfikacja i akceptacja

| Wymagania | Sprawdzenie |
| --- | --- |
| F01 | Tworzenie, ponowne otwarcie po restarcie, usunięcie projektu i plików |
| F02, F03, F10 | Kamera, kierunek, liczba kroków i konwersja do cm, logi i utrata sensora; F03 zmienione decyzją użytkownika |
| F04, F06 | XY, numeracja, obwód, pole i niezależne zamknięcie |
| F05, F07 | Edycja punktów, długości i kątów, blokady, undo/redo |
| F08 | Przekątna między dowolnymi punktami i jej reszta |
| F09 | DXF, skala i polilinia w dwóch CAD |
| F11 | Opcjonalny solver w osobnym przyroście |

Testy jednostkowe obejmują kąty, średnią kołową 359°/1°, układy odniesienia, oś kamery, pole i obwód, samoprzecięcia, niedomknięcie, reszty, blokady i odtwarzanie projektu. Przypadki wynikają z ręcznie policzonych figur i danych P0.

Testy konwersji obejmują 1 krok = 75 cm, 10 kroków = 750 cm = 7,5 m = 750 cm w DXF (zależnie od wybranej jednostki), 2,5 kroku = 187,5 cm, polski przecinek, błędne wartości i zachowanie przelicznika historycznej obserwacji. Testy terenowe rozdzielają błąd kierunku i błąd oszacowania odległości krokami. Pomiary referencyjne taśmą lub dalmierzem nadal służą jako niezależna kontrola.

Testy integracyjne obejmują transakcje, migracje, ponowne otwarcie, korektę bez utraty obserwacji, kopię JSON i niezależne parsowanie DXF. Testy telefonu obejmują tło, obrót ekranu, brak kamery lub magnetometru i zgodność celownika. Emulator służy do UI; nie potwierdza dokładności sensorów.

Akceptacja logów od P0: sesja jest dostępna po restarcie i bez sieci; zawiera metadane, próbki i powiązanie z przechwyconym kierunkiem; tekst można skopiować i wkleić do innej aplikacji bez utraty rekordów i polskich znaków. Dla dużej sesji sprawdzić kompletność ponumerowanych części, dla aktywnej sesji spójność migawki, a dla przerwanej sesji oznaczenie braków. W P1 dodatkowo weryfikować zapis kroków, przelicznika, korekt i błędu zamknięcia. Błąd zapisu lub schowka nie może wyświetlać komunikatu sukcesu.

Bramki źródłowe P1: obrys 4–8 punktów i powrót do projektu; jawne reszty; DXF w minimum dwóch CAD; brak awarii w 20 pełnych sesjach na urządzeniu docelowym; tryb ręczny; rozkład błędu z minimum trzech otoczeń; co najmniej pięciu testerów kończących proces i rozpoznających wątpliwe wyniki.

Plan terenowy obejmuje prostokąty 2 × 3 m i 5 × 8 m oraz obrys nieregularny z minimum sześcioma narożnikami. Pomiary odniesienia obejmują wszystkie boki, minimum dwie przekątne i dodatkowe wiązania. Powtórzyć próby różnymi operatorami i orientacjami telefonu. Kierunek badać przez 10 wskazań jednego celu, odczekanie 0/30/120 s, obrót i powrót oraz zmianę stanowiska. Otoczenia: teren otwarty, ściana, samochód lub metalowe ogrodzenie.

Raportować błąd punktów po wyrównaniu układów wyłącznie translacją i obrotem, bez skalowania, błędy długości i kątów, niedomknięcie, czas i liczbę korekt. Podać liczebność prób, średnią i percentyl 95 oraz metodę odniesienia. Porównać obrys surowy, po jednej przekątnej, po większej liczbie więzów i po ręcznych kątach. Dokładność akceptowalną ustalić po P0, bez traktowania przykładu 10 cm jako obietnicy.

## 12 Kolejność realizacji i decyzje otwarte

1. Zainicjalizować Expo w `app/`, przypiąć wersje, przygotować development build i moduł orientacji.
2. Dostarczyć P0 z kamerą, trwałymi logami, podglądem i kopiowaniem treści oraz eksportem, następnie wykonać próby terenowe.
3. Wybrać domyślny kierunek, progi stabilności i obsługiwane warunki na podstawie raportu.
4. Wdrożyć model projektu, trwałość, geometrię, tryb ręczny i podgląd 2D.
5. Dodać edycję, przekątne, ograniczenia, jakość i DXF.
6. Zweryfikować P1 i zdecydować o solverze oraz dalszym produkcie.

Orientacyjne sprinty ze źródła pozostają szacunkiem, nie deklaracją terminu. P0 może zmienić zakres P1.

Otwarte decyzje: urządzenia referencyjne i minimum Androida; orientacja ekranu w pomiarze; progi jakości i dokładności; limity punktów i logów; obsługa niejednoznacznych rozwiązań; potrzeba CameraX; termin solvera; retencja i kopie danych; ewentualne iOS. Nie blokują przygotowania P0, ale wymagają zamknięcia przed deklaracją obsługi produktu.

## 13 Źródła techniczne

Sprawdzone 18 października 2026. Adresy `latest` są zmienne; przy inicjalizacji należy zapisać wybrane wersje SDK i bibliotek.

- T1 [Expo development builds](https://docs.expo.dev/develop/development-builds/introduction/) — własny kod natywny i przebudowa aplikacji.
- T2 [Expo Modules API](https://docs.expo.dev/modules/get-started/) — lokalne moduły natywne.
- T3 [Expo Camera](https://docs.expo.dev/versions/latest/sdk/camera/) — podgląd i uprawnienia.
- T4 [Android position sensors](https://developer.android.com/develop/sensors-and-location/sensors/sensors_position) — rotation vector i game rotation vector.
- T5 [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/) — trwały zapis lokalny.
- T6 [Expo FileSystem](https://docs.expo.dev/versions/latest/sdk/filesystem/) — pliki aplikacji.
- T7 [Expo Sharing](https://docs.expo.dev/versions/latest/sdk/sharing/) — udostępnianie plików.
- T8 [ezdxf DXF units](https://ezdxf.readthedocs.io/en/stable/concepts/units.html) — INSUNITS i skalowanie współrzędnych.
- T9 [Szpala i in. 2022, parametry zwykłego chodu i Nordic Walking](https://onlinelibrary.wiley.com/doi/10.1155/2022/7905120) — tabela 2, długość prawego kroku podczas zwykłego chodu u 11 mężczyzn: 74,00 ± 8,68 cm; punkt odniesienia dla roboczego zaokrąglenia do 75 cm, nie średnia całej populacji.
- T10 [Expo Clipboard](https://docs.expo.dev/versions/latest/sdk/clipboard/) — zapis tekstu do schowka przez setStringAsync.
