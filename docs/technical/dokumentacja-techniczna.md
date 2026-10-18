# Dokumentacja techniczna FieldSketch CAD

Wersja 0.2. Data: 18 października 2026. Etap: projekt rozwiązania przed implementacją.

## 1 Cel i status decyzji

Aplikacja umożliwi tworzenie pomocniczych obrysów 2D w terenie, korektę geometrii oraz eksport do DXF. **React Native z Expo jest pierwszym, wiążącym założeniem użytkownika.** Android, praca offline i podział na P0 oraz P1 wynikają z dokumentacji biznesowej.

Źródło wymagań: [dokumentacja biznesowa wersja 1.0](../business/FieldSketch_CAD_dokumentacja_biznesowa_i_prototyp.docx), szczególnie sekcje 3–10. [Analiza biznesowa](analiza-biznesowa.md) opisuje ryzyka i luki. Dobór bibliotek, kontrakty i szczegółowe zasady poniżej są propozycją techniczną. Nie oznaczają wykonanej implementacji ani potwierdzonej dokładności urządzeń.

| Obszar | Ustalenie | Status |
| --- | --- | --- |
| Framework | React Native + Expo | Decyzja użytkownika |
| Długość w prototypie | Ręcznie podana liczba kroków, przeliczana na centymetry; 1 krok = 75 cm | Decyzja użytkownika o krokach; proponowany przelicznik |
| Platforma początkowa | Android | Wymaganie źródłowe |
| Dane | Offline, lokalnie, bez backendu i kont | Zakres źródłowy prototypu |
| Języki | TypeScript oraz Kotlin dla sensorów | Propozycja techniczna |
| Uruchamianie | Expo development build z expo-dev-client | Propozycja dla własnego kodu natywnego |
| Dokładność | Ustalana po P0 dla konkretnego scenariusza | Decyzja otwarta |
| iOS i web | Brak zobowiązania w pierwszej wersji | Poza zakresem P0 i P1 |

## 2 Zakres i przyrosty

### P0 Walidacja kierunku

Minimalna aplikacja zawiera podgląd tylnej kamery z celownikiem, orientację telefonu, wykrywanie sensorów, rejestrację prób i eksport diagnostyki CSV/JSON. Porównuje kierunek magnetyczny i względny, stabilizację, powrót po obrocie oraz zachowanie po zmianie stanowiska. Edytor CAD nie jest warunkiem ukończenia P0.

Wynikiem jest raport z opisem urządzeń, wersji aplikacji, procedury i rozkładu błędów. Przejście do P1 wymaga oceny użyteczności kierunku i wyboru warunków pomiaru.

### P1 Proces od pomiaru do DXF

P1 obejmuje projekty lokalne, punkty, ręczne wprowadzanie długości w krokach i kątów, podgląd XY, edycję, undo/redo, blokady, przekątne, zamknięcie, obwód, pole, diagnostykę i DXF. Automatyczne dopasowanie sieci jest SHOULD F11; zdjęcia COULD F12; Bluetooth i GPS LATER F13.

Decyzja użytkownika o krokach zastępuje w prototypie wejście długości w metrach opisane w źródle biznesowym, w tym F03. Docelowy wariant z miarką lub dalmierzem pozostaje możliwym rozszerzeniem. Źródłowy dokument Word zachowuje pierwotną treść.

Poza zakresem pozostają chmura, logowanie, płatności, LiDAR, obowiązkowe ARCore, automatyczna rekonstrukcja 3D i certyfikacja dokładności.

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
| Testy | Jest w konfiguracji zgodnej z Expo | Domena i integracje |

Dokładne wersje należy wybrać przy inicjalizacji. React Native musi odpowiadać wybranemu stabilnemu Expo SDK; zależności natywne instalować przez `npx expo install`, kontrolować przez Expo Doctor i utrzymywać jeden plik blokady zależności. Własny moduł natywny wymaga development build, zamiast polegania na Expo Go [T1, T2]. Skia jest alternatywą dla SVG, jeżeli pomiar wydajności uzasadni zmianę renderera.

expo-camera jest proponowanym uproszczeniem względem bezpośredniej integracji CameraX w źródle. P0 nie analizuje klatek. Jeśli testy wykażą potrzebę synchronizacji z klatkami lub brakujących parametrów kamery, należy rozszerzyć moduł natywny o widok CameraX. Nie uruchamiać dwóch konkurencyjnych podglądów kamery.

## 4 Struktura kodu

Repozytorium przechowuje dokumenty w `docs/business` i `docs/technical`, aplikację w `app`. Obecnie w `app` znajduje się opis przeznaczenia katalogu. Planowana struktura po inicjalizacji, jeszcze niewygenerowana:

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

Zewnętrzny `app/` jest katalogiem projektu, a `app/src/app/` przyszłym katalogiem tras. Logika domenowa pozostaje poza trasami.

## 5 Ekrany i rejestracja pomiaru

Lista projektów umożliwia tworzenie, otwieranie i usuwanie z potwierdzeniem. Ustawienia zawierają nazwę, typ obiektu i tryb kierunku. Jednostka wewnętrzna to metr.

Ekran pomiaru pokazuje celownik, tryb, stabilność i jakość sensora. Użytkownik zamraża kierunek z początku boku, przechodzi odcinek, licząc kroki, wpisuje ich liczbę, sprawdza przeliczenie na centymetry i podgląd, a następnie zatwierdza obserwację. Kierunek pozostaje przypisany do punktu początkowego; anulowanie nie tworzy częściowego odcinka. Liczba kroków jest podawana ręcznie, bez automatycznego krokomierza.

### Długość w krokach w prototypie

Przyjmujemy **1 krok = 75 cm** jako przybliżoną, roboczą długość pojedynczego kroku dorosłego mężczyzny przy zwykłym chodzie. Jeden krok oznacza przejście od podparcia jednej stopy do podparcia drugiej, a nie pełny cykl dwóch kroków. To stała prototypu, nie uniwersalna średnia dla wszystkich mężczyzn. Jako punkt odniesienia badanie zwykłego chodu 11 młodych dorosłych mężczyzn podaje dla prawego kroku średnią 74 cm; 75 cm jest jej praktycznym zaokrągleniem [T9].

```text
DEFAULT_STEP_LENGTH_CM = 75
lengthCm = stepCount * stepLengthCm
lengthM = lengthCm / 100
Przykład: 10 kroków -> 750 cm -> 7,5 m
Przykład: 2,5 kroku -> 187,5 cm -> 1,875 m
```

Formularz „Liczba kroków” dopuszcza dodatnie wartości ułamkowe, np. 2,5, aby można było oszacować niepełny krok. Obok pokazuje „Szacowana długość” w cm oraz użyty przelicznik. Geometria nadal liczy w metrach, a DXF eksportuje w milimetrach. Ta sama konwersja dotyczy boków, przekątnych i pomiaru powrotnego.

Liczbę kroków i użyty przelicznik zachowujemy razem z obserwacją. Przyszła zmiana domyślnej długości kroku nie przelicza historycznych pomiarów automatycznie. Kalibracja indywidualna może powstać później; prototyp używa 75 cm. Wynik w centymetrach jest jednostką prezentacji oszacowania, nie deklaracją centymetrowej dokładności.

Proponowane stany: `ready -> stabilizing -> directionCaptured -> lengthEntered -> review -> committed`. Powrót z tła wymaga ponownego sprawdzenia odniesienia i unieważnienia niezapisanej próbki, jeśli utracono jego ciągłość.

Edytor pokazuje punkty, długości, ograniczenia i przełączany obrys surowy. Ekran jakości rozdziela obserwacje, wyniki i reszty. Eksport podaje jednostkę oraz rewizję. Brak sensora albo zgody na kamerę udostępnia tryb ręczny, umożliwiający cały proces bez ARCore.

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

Propozycja: tekstowy DXF R2000, współrzędne 2D z Z=0. Jednostka P1: **milimetr**, `$INSUNITS=4`. Współrzędne, wysokości tekstów i przesunięcia opisów przeliczamy z metrów przez mnożnik 1000. Sam nagłówek nie skaluje wartości [T8]. Liczby mają kropkę bez separatorów tysięcy.

| Warstwa | Zawartość |
| --- | --- |
| OBRYS_KORYGOWANY | LWPOLYLINE, flaga closed po świadomym zamknięciu |
| PUNKTY_SUROWE | POINT dla dostępnych surowych współrzędnych |
| WYMIARY | LINE i TEXT z długościami, bez asocjatywnego DIMENSION |
| ODNIESIENIA | LINE dla pomiarów kontrolnych |
| OPISY | TEXT z identyfikatorami i jednostkami |

Generator obsługuje deklaracje warstw, liczbę wierzchołków, sekcje wybranej wersji DXF i EOF. Zamknięta polilinia nie duplikuje pierwszego wierzchołka. Minimalny eksport używa prostych etykiet ASCII, np. P1; obsługa polskich opisów wymaga osobnego sprawdzenia kodowania. Pełna nazwa projektu pozostaje w JSON.

Eksport używa niezmiennej migawki `geometryRevision`. Najpierw zapisuje plik tymczasowy, następnie udostępnia ukończony wynik. Anulowanie udostępnienia nie usuwa projektu. Użytkownik wybiera warstwy pomocnicze i widzi konflikty przed eksportem.

Test referencyjny: prostokąt 2 × 3 m daje 2000 × 3000 jednostek DXF, obwód 10000 i pole 6000000 jednostek kwadratowych. Plik musi otworzyć się z właściwą skalą i stanem polilinii w minimum dwóch dostępnych programach, np. LibreCAD i QCAD. AutoCAD jest dodatkowym testem, jeśli dostępny.

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

Testy konwersji obejmują 1 krok = 75 cm, 10 kroków = 750 cm = 7,5 m = 7500 mm w DXF, 2,5 kroku = 187,5 cm, polski przecinek, błędne wartości i zachowanie przelicznika historycznej obserwacji. Testy terenowe rozdzielają błąd kierunku i błąd oszacowania odległości krokami. Pomiary referencyjne taśmą lub dalmierzem nadal służą jako niezależna kontrola.

Testy integracyjne obejmują transakcje, migracje, ponowne otwarcie, korektę bez utraty obserwacji, kopię JSON i niezależne parsowanie DXF. Testy telefonu obejmują tło, obrót ekranu, brak kamery lub magnetometru i zgodność celownika. Emulator służy do UI; nie potwierdza dokładności sensorów.

Bramki źródłowe P1: obrys 4–8 punktów i powrót do projektu; jawne reszty; DXF w minimum dwóch CAD; brak awarii w 20 pełnych sesjach na urządzeniu docelowym; tryb ręczny; rozkład błędu z minimum trzech otoczeń; co najmniej pięciu testerów kończących proces i rozpoznających wątpliwe wyniki.

Plan terenowy obejmuje prostokąty 2 × 3 m i 5 × 8 m oraz obrys nieregularny z minimum sześcioma narożnikami. Pomiary odniesienia obejmują wszystkie boki, minimum dwie przekątne i dodatkowe wiązania. Powtórzyć próby różnymi operatorami i orientacjami telefonu. Kierunek badać przez 10 wskazań jednego celu, odczekanie 0/30/120 s, obrót i powrót oraz zmianę stanowiska. Otoczenia: teren otwarty, ściana, samochód lub metalowe ogrodzenie.

Raportować błąd punktów po wyrównaniu układów wyłącznie translacją i obrotem, bez skalowania, błędy długości i kątów, niedomknięcie, czas i liczbę korekt. Podać liczebność prób, średnią i percentyl 95 oraz metodę odniesienia. Porównać obrys surowy, po jednej przekątnej, po większej liczbie więzów i po ręcznych kątach. Dokładność akceptowalną ustalić po P0, bez traktowania przykładu 10 cm jako obietnicy.

## 12 Kolejność realizacji i decyzje otwarte

1. Zainicjalizować Expo w `app/`, przypiąć wersje, przygotować development build i moduł orientacji.
2. Dostarczyć P0 z kamerą, diagnostyką i eksportem, następnie wykonać próby terenowe.
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
