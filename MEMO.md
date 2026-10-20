# Stan prac nad outlineGo (wcześniej FieldSketch CAD)

## Próba użytkownika i poprawki — 20 października 2026

Użytkownik potwierdził „checklista ok”. Krokomierz uznał za poprawny: dodatkowe zliczenia wynikają z ruchów telefonu. Nie zmieniamy detektora ani nie odejmujemy stałej liczby kroków. Wynik i zgłoszone problemy zapisano w [checkliście](docs/technical/checklista-proby-terenowej.md); nie otrzymano tabeli serii ani plików logów.

Commit poprawek po próbie obejmuje:

- Wznowienie domyślnie używa ostatniego zapisanego boku jako odniesienia. Dla ABC po przerwaniu w C: B→C, z instrukcją konkretnych numerów punktów. Wcześniej domyślne A→B przy faktycznym celowaniu B→C powodowało przesunięcie o 90°. Zachowano możliwość świadomego wyboru innego boku.
- Dopasowanie szkicu po pojawieniu się pierwszego roboczego wektora; przesuwanie palcem w obu osiach i zoom dwoma palcami wokół ich środka. Przyciski ± i Dopasuj pozostają dostępne.
- Powrót ostatnim zmierzonym bokiem do P1 nie tworzy fałszywego samoprzecięcia po „Zamknij obrys”. Geometria do obliczeń i rysowania pomija powtórzony końcowy wierzchołek, a historia i zapisane punkty pozostają nietknięte. Tolerancja wyłącznie numeryczna 0,0000001 m; rzeczywiste niedomknięcie nie jest automatycznie dociągane. PNG nie dodaje zerowego boku i rozpoznaje zmierzony powrót.
- Wspólne przyciski mają min. szerokość 52, a −/+ krokomierza 52 × min. 52. Przyciski menu/zamknięcia miały już minimum 44 × 44, L/P — 52 × 52.
- Odrzucony odczyt kierunku pokazuje polską instrukcję ponownego celowania bez technicznego opakowania Expo; surowy błąd trafia do loga. Ostrzeżenie o słabym odczycie również ma opis użytkowy.
- Nazwy widoczne w aplikacji zmieniono z „projekt” na „szkic”; identyfikatory, ścieżki i baza pozostają zgodne z dotychczasowymi danymi.

TypeScript i 56 testów TS (7 zestawów) przeszły. Testy obejmują wznowienie ABC→D w różnych układach sensora, pełny powrót do P1 i rzeczywiste przecięcia, PNG, przesuwanie/pinch oraz dopasowanie pierwszego wektora. Końcowy pełny build: `field-feedback-build-final.log`, `BUILD SUCCESSFUL in 1m 8s`, 847 zadań (36 wykonanych, 811 aktualnych); testy Kotlin `UP-TO-DATE`. APK zainstalowano przez `install -r` i uruchomiono na emulatorze z zachowaniem 6 szkiców. Potwierdzono nazewnictwo, kwadratowe menu, przesuwanie w obu osiach, zoom przyciskiem, dopasowanie i powrót z dialogu. Obejrzano zrzuty `artifacts/field-feedback-sketch-before.png`, `field-feedback-sketch-pan.png`, `field-feedback-sketch-zoom.png`; końcową listę potwierdza dump UI i `field-feedback-home-final.png`. Logcat bez wpisów AndroidRuntime:E/ReactNativeJS:E. Gest dwoma palcami potwierdzają testy obliczeń; próba dotykowa pinch i odniesienie na fizycznym sensorze pozostają do wykonania. Nowych poprawek nie instalowano na telefonie. Poprzedni commit repozytorium: `b2a496f` (checklista); bieżące poprawki, testy i dokumentację zapisano w kolejnym commicie po próbie terenowej.

Decyzja marki — 20 października 2026: użytkownik przyjął nazwę **outlineGo** (dokładna pisownia: małe „outline”, wielkie „G”, małe „o”) i wybrał **pierwszy, pierwotny wariant logo: otwarty obrys z trzema pierścieniami w narożnikach i jednym pełnym punktem końcowym**. Nie wybrano monogramu ani późniejszej korekty w kształcie G. Przegląd wykazał podobne motywy w ikonach innych aplikacji pomiarowych; użytkownik mimo to potwierdził wariant pierwszy. Nie przeprowadzono pełnego badania znaków towarowych i nie rejestrowano domen. Plansze i prompty: `artifacts/branding/outlinego/` (lokalne artefakty).

W kodzie wdrożono nazwę i logo outlineGo: nagłówek główny, mały znak w pozostałych nagłówkach, nagłówek pomiaru, nowy projekt i eksport PNG. Wektorowa geometria `app/assets/brand/mark.json` zasila komponent `Brand.tsx` oraz generator SVG/PNG `npm run assets:brand`. Ikona ma wersję tradycyjną, adaptacyjną i monochromatyczną, splash — ciepłe tło i zielony znak. `expo-splash-screen` 56.0.15 obsługuje start natywny; widok z logo i nazwą pozostaje podczas inicjalizacji danych, bez sztucznego opóźnienia. Nazwa pliku APK i nowo eksportowanych PNG/CSV używa outlineGo. Zachowano pakiet `pl.fieldsketch.cad.prototype`, schemat linków `fieldsketch`, slug i bazę `fieldsketch.db`, aby zachować ciągłość aktualizacji oraz dane. Zmiany marki zapisano w commicie wdrażającym branding outlineGo.

Aktualizacja: 20 października 2026. Gałąź `mvp_designed`; kod Teren zapisano w `1a5acbe`, późniejsze notatki w `02a5019`. Najnowszy commit aplikacji: `3d28bd5` — `feat: apply outlineGo branding, launcher icon and splash screen`. Obejmuje nazwę, logo w ekranach i PNG, zasoby ikony, splash, generator zasobów oraz dokumentację instalacji na telefonie. Po commicie katalog roboczy był czysty; notatki po wdrożeniu zapisano następnie w `b044778`. Checklistę próby terenowej zapisano w osobnym commicie dokumentacji. Nie wykonano pushowania.

## Aktualny rezultat

Działające MVP Android 0.1.0 jest w `app/`. Obejmuje pomiar i prosty obrys offline, bez kont i backendu, eksport PNG oraz trwałą diagnostykę. Najnowszy APK zawiera branding outlineGo, ekrany Teren i opisane powyżej poprawki po próbie terenowej. Release zbudowano pełnym skryptem. Telefon `23124RA7EO` (`a20fa219`) ma wcześniejszy build outlineGo `F09DBCDC643CDC79944430B6879DCABF45ED182817C9376DED3DC5C3128D6F92`, zainstalowany 20 października 2026 przez `install -r` z zachowaniem danych. Nowy APK po poprawkach sprawdzono na emulatorze; czeka na instalację na telefonie. Hash nowego APK podaje tabela poniżej.

| Artefakt | Wartość |
| --- | --- |
| Plik | `artifacts/outlineGo-0.1.0.apk` |
| Rozmiar | 85230895 bajtów |
| SHA256 | `1DB7A9EDB9134BA443599336348DD558133D3FCF6BC795804E4C40115D1C7FFE` |
| Platforma | Android 7+, target SDK 36, arm64-v8a i x86_64 |
| Uruchamianie | Osadzony JavaScript, bez Metro i internetu, podpis deweloperski |
| Log ostatniego budowania | `artifacts/field-feedback-build-final.log` |

## Obowiązujący interfejs

Pozostałe ekrany wdrożono według wizualizacji Teren: osobny formularz nowego projektu, sekcje i segmenty ustawień, podsumowanie z obwodem/polem oraz rozwijanymi współrzędnymi, korekta boku z suwakiem 5°, podgląd PNG, lista logów i osobny stan migawki ze stałymi dolnymi akcjami. Menu główne, menu wiersza projektu i menu pomiaru są kompaktowymi listami przy przycisku; Wstecz i tło je zamykają. Komunikaty i potwierdzenia aplikacji obsługuje `DialogProvider` w stylu Teren. Zgody Androida i udostępnianie pozostają systemowe.

Miniaturę można przeciągać w dwóch osiach, z przyciąganiem do najbliższego z czterech rogów obszaru nad akcjami. Po zmianie etapu, rozmiaru okna lub klawiatury zachowuje róg. Dostępność pozwala przejść do następnego rogu. Przeciągnięcie nie otwiera podglądu. Dotknięcie otwiera wyśrodkowany pionowo dialog na pełną szerokość, zamykany przez Wstecz, tło, krzyżyk lub przycisk powrotu, bez utraty formularza.

Wybrany styl: **Teren** (spośród Teren / Precyzja / Kontrast). Ciepłe tło `#F5F4EE`, jasne panele `#FFFEFA`, tekst `#183A2C`, leśna zieleń `#1B684B`, delikatne wypełnienia `#E7EEE2`. Ikony konturowe `lucide-react-native` 1.59.0, przypięte w package.json/lock; korzystają z istniejącego SVG, bez dodatkowej zgody telefonu. Pomiar ma nagłówek ze znakiem outlineGo, nazwą i odcinkiem oraz nieinteraktywny wskaźnik Kierunek/Długość/Zapis. Panele robocze są zaokrąglone, pola i wyniki większe, a akcje Zakończ i Zmierz ponownie wizualnie lżejsze. Wspólne kontrolki i nagłówki korzystają z nowej palety także na innych ekranach. Nie dodano wyboru stylu w ustawieniach.

Kontrola wyglądu na emulatorze ujawniła zasłanianie przycisków pola przez miniaturę przy klawiaturze. Page przewija teraz aktywne pole nad obszar miniatury po zmianie wysokości viewportu/otwarciu klawiatury. Nawigacja nadal jest poza scrollem. Dopracowano wspólną wysokość pól/przycisków i wyrównanie ponowienia odczytu do lewej, z dala od miniatury.

- Strona główna: nowy projekt i lista wierszy z nazwą, datą ostatniej zmiany oraz menu ⋮ (Otwórz/Usuń). Dotknięcie wiersza otwiera projekt; usunięcie wymaga potwierdzenia. Początkowo 3 najnowsze, „Więcej” dodaje po 10. Limit dotyczy wyświetlania; magazyn nadal pobiera pełną listę z SQLite.
- Menu nagłówka strony głównej: Ustawienia i Logi pomiarowe.
- Wizard: P1 → kierunek → korekta → długość → podsumowanie robocze → zapis punktu. „Dalej · zapisz punkt” nie zatwierdza jeszcze boku. Dolna nawigacja jest poza scrollem, także przy klawiaturze.
- Kierunek: względny (domyślnie), magnetyczny lub ręczny. Wybór wyłącznie w globalnych ustawieniach i dla wszystkich projektów. Zmiana zatrzymuje sesję, unieważnia roboczy kierunek/odniesienie, ale zachowuje wpisaną długość i historyczne obserwacje. Niedostępny sensor oznacza użycie trybu ręcznego.
- Podgląd sensora: tylko ogólny status. „Gotowy do przechwycenia” jest zielony przy aktywnej sesji, gotowym oknie, rzucie poziomym ≥ 0,2, jakości ≥ 2/3 i rozrzucie ≤ 3°. Bez przycisku szczegółów i bez „Więcej opcji”.
- „Popraw kąt” rozwija `[L] [kąt] [P]`, poniżej suwak ±15° ze skokiem 5°. Wynikowy skręt jest zaokrąglany do pełnych 5°. Pole ręczne pozwala wpisać dokładniejszy kąt; w trybie ręcznym pola są widoczne od razu. Pierwszy bok wyznacza 0°.
- Przyciąganie pola ręcznego w ustawieniach: 90° (domyślnie), 10°, 5° lub wyłączone; tolerancja 2° dla 90°/10°, 1° dla 5°. Suwak ma niezależne zaokrąglanie. Sam przechwycony odczyt nie jest zaokrąglany przed korektą.
- Długość: niezależne „Wpisz długość” w m/cm lub „Krokomierz”. Jednostka przy polu pozwala przeliczyć wartość bez zmiany fizycznej długości.
- Krokomierz: `[−] [liczba kroków] [+] [Start/Stop]`. Start i Stop są w tym samym miejscu. Podczas liczenia pole i ±1 są zablokowane. Brak sensora/zgody pozostawia ręczne długości i kroki. Domyślna długość kroku 75 cm jest zmieniana w ustawieniach; historia i przywrócony formularz zachowują użyty przelicznik. Surowa wykryta liczba nie jest nadpisywana korektą.
- Szkic: przeciągana miniatura nad akcjami, początkowo w prawym dolnym rogu, z przyciąganiem do czterech rogów i mniejszym rozmiarem przy klawiaturze. Dotknięcie otwiera wyśrodkowany dialog na pełną szerokość. Zapisane boki są ciągłe; roboczy bok przerywany, a kierunek bez długości jest wektorem. Automatyczne dopasowanie po zatwierdzeniu kierunku, długości lub korekty; podczas liczenia skala jest stabilna.
- Menu projektu w pomiarze: cofnięcie boku/zamknięcia, niezależny pomiar powrotu do P1 przy kompletnym podsumowaniu, diagnostyka i ustawienia. Cofnięcie wymaga potwierdzenia odrzucenia roboczego pomiaru.
- Zakończenie: rozstrzygnięcie niezapisanego boku, następnie obrys otwarty lub zamknięty. Zamykający bok jest wyliczony; niezależny pomiar powrotny pozostaje osobny. Bez niego nie ma wartości błędu zamknięcia. Pole tylko dla poprawnego zamkniętego obrysu.
- Podsumowanie: edycja ostatniego boku z historią `supersedesId`, podgląd i systemowe udostępnianie PNG z wymiarami oraz oznaczeniem długości szacunkowych.
- SQLite v3 zachowuje projekty, niezmienne obserwacje, formularz i ustawienia. Wznowienie przywraca wpisy, ale wraca do kierunku; w trybie sensorowym z istniejącymi bokami trzeba odtworzyć odniesienie.

## Technologia i diagnostyka

Expo 56.0.23, React Native 0.85.3, React 19.2.3, TypeScript i własny moduł Kotlin SensorManager. Rotation vector i game rotation vector wyznaczają kierunek z poziomego rzutu osi tylnej kamery. Próbkowanie zadane 25 Hz, okno około 2 s. Expo Go nie obsługuje modułu.

Krokomierz używa `TYPE_STEP_DETECTOR`, okna Start/Stop oraz identyfikatorów sesji i pomiaru. Odrzuca stare i zduplikowane zdarzenia. Stop, tło i zakończenie sesji wyłączają liczenie. Android 10+ wymaga zgody ACTIVITY_RECOGNITION pobieranej na żądanie.

Osobna Diagnostyka zawiera uwagi testera, niezależne odniesienie, logi i ręczne zatrzymanie sesji. JSONL zawiera surowe sensory, odczyty, kroki, przelicznik, geometrię, operacje i błędy. Bufor jest utrwalany co sekundę, przy przechwyceniu i zakończeniu. Po awarii zachowujemy pełne rekordy i oznaczamy przerwaną sesję. Podgląd/kopiowanie porcjami do 128 KiB oraz eksport JSONL/CSV; duże logi mają ponumerowane części. Limit 100 MiB, ostrzeżenie przy 80 MiB, bez automatycznego kasowania. Migawka aktywnego loga jest niezmienna.

## Weryfikacja i granice potwierdzenia

- Ostatni pełny przebieg: TypeScript, 47 testów TS (w tym 3 testy pozycjonowania miniatury), release build i zadanie 7 testów Kotlin bez błędów. Zadanie Kotlin było `UP-TO-DATE`; zapisane raporty zawierają 7 testów, 0 błędów i 0 niepowodzeń.
- Branding outlineGo: pełny build `outlinego-brand-build.log` zakończył się w 2 min 7 s; TypeScript i 47 testów przeszły. Zweryfikowano PNG 1024 × 1024 (tradycyjna ikona nieprzezroczysta; adaptacyjna i monochromatyczna z kanałem alfa) oraz splash 512 × 512. Nowy release zainstalowano przez `install -r` na emulatorze: zachowało się 5 projektów. Obejrzano natywny splash, nową ikonę pod maską launchera i nazwę outlineGo, stronę główną, znak w nagłówku pomiaru i logo w podglądzie PNG. Zrzuty: `artifacts/outlinego-launch-1.png`, `outlinego-launcher.png`, `outlinego-home.png`, `outlinego-measurement.png`, `outlinego-export.png`, `outlinego-new-project.png`. Nowy branding zainstalowano również na fizycznym telefonie 20 października 2026; ADB potwierdził instalację i uruchomienie. Pełny test użytkownika na telefonie pozostaje do wykonania.
- Bieżący build na emulatorze: menu główne i projektu jako rozwijane listy; anulowanie usunięcia we własnym dialogu; przeciągnięcie miniatury do wszystkich czterech rogów bez otwarcia; powiększenie jako dialog pełnej szerokości i powrót przez Wstecz; klawiatura z polem kroków nad miniaturą i stałymi akcjami; własne dialogi niezapisanego boku, zakończenia i kopiowania; Wstecz z migawki do listy logów. Obejrzano zrzuty ustawień, podsumowania, korekty, menu, potwierdzenia, powiększenia i klawiatury. Zrzuty tej iteracji: `artifacts/terrain-screens-*.png`. Pomiaru sensorem i liczenia kroków na telefonie w tej iteracji nie testowano.
- Teren: końcowy build zainstalowano i uruchomiono na emulatorze. Sprawdzono wizualnie nagłówek/etapy, ikonografię, korektę L–kąt–P z suwakiem i rząd krokomierza. Przy otwartej klawiaturze pole i przyciski znalazły się ponad miniaturą, a dolne akcje nad klawiaturą. Ponowienie odczytu nie jest już zasłaniane przez miniaturę. Zrzuty: `artifacts/terrain-angle-final.png`, `artifacts/terrain-keyboard-final.png`. Emulator nadal nie ma detektora; nie potwierdza to fizycznego liczenia kroków.
- Emulator Pixel 8 API 36: zachowanie projektów po aktualizacji, ręczne m/cm i kroki, odtworzenie formularza, korekta boku, geometria i pole, PNG, menu, lista 3 z 5 projektów → wszystkie 5 po „Więcej”, otwarcie z wiersza/menu i anulowanie usuwania. Zrzut listy sprawdzono wizualnie. Emulator nie ma detektora kroków; nie potwierdza fizycznego liczenia. Został zamknięty po testach.
- Wcześniejsze próby: offline w trybie samolotowym, zachowanie po force-stop, duży log około 1,54 MiB w 13 częściach oraz systemowe udostępnianie CSV/PNG. Nie wysłano plików do odbiorców. Automatyzacja odczytu wklejenia pokazała tylko 5000 znaków, więc kompletność kopiowania potwierdzają testy podziału rekordów, a nie ten odczyt UI.
- Użytkownik zaakceptował dokładność wykonanych testów trybu względnego. Brak liczbowego progu i podstaw do uogólnienia na tryb magnetyczny.
- Po próbie użytkownik potwierdził poprawne liczenie kroków; wcześniejsze dodatkowe 1–2 zliczenia wiąże z poruszaniem telefonem. Ręczna korekta pozostaje dostępna, bez zmiany algorytmu i bez automatycznego odejmowania kroków.
- Telefon ma build outlineGo `F09DBCDC…` z logo, ikoną i splash screenem. ADB potwierdził instalację przez `install -r` z zachowaniem danych oraz uruchomienie 20 października 2026 (`Status: ok`, `LaunchState: COLD`). Nowy build `1DB7A9ED…` po poprawkach czeka na instalację.
- Ostatni wynik Expo Doctor: 21/22, znane ostrzeżenie pamięci Hermes w SDK 56. Migracji SDK nie wykonano. To zapis wcześniejszego sprawdzenia, nie nowa kontrola przy aktualizacji dokumentacji.

## Odtworzenie pracy

W `app/`, na Windows z Node 20.19.x, JDK, Android SDK 36 i NDK 27.1.12297006:

```powershell
npm ci
npm run typecheck
npm test
npm run build:apk
```

Skrypt generuje natywny Android z przypiętego szablonu, uruchamia testy Kotlin, buduje release i kopiuje APK do `artifacts/`. Android i artefakty są generowane/ignorowane przez Git. Zależności są przypięte w package-lock.json. Instalacja na jedynym podłączonym telefonie:

```powershell
adb -d install -r artifacts/outlineGo-0.1.0.apk
adb -d shell am start -n pl.fieldsketch.cad.prototype/.MainActivity
```

Git w tej sesji wymaga jawnych `--git-dir=C:/projects/fieldSketch-CAD/.git --work-tree=C:/projects/fieldSketch-CAD` z powodu wykrywania właściciela; nie zmieniano globalnego safe.directory. Nie wykonywano pushowania. Bazowy commit MVP: `4818fdb`; uproszczenie UI i nawigacji: `91dd0fe`; dokumentacja: `bf28653`; styl Teren i nowe interakcje: `1a5acbe`; notatki Teren: `02a5019`; branding outlineGo: `3d28bd5`. Po zapisaniu `3d28bd5` katalog roboczy był czysty. Najnowsza instalacja telefonu używa APK o hashu z tabeli; zmiany w notatkach po kompilacji nie zmieniają tego APK.

Makiety i zrzuty są lokalnymi artefaktami ignorowanymi przez Git. Wizualizacja 10 pozostałych ekranów: `artifacts/visualizations/terrain-screens.html`; lokalny preview uruchamia `node artifacts/visualizations/terrain-preview-server.cjs` pod `http://127.0.0.1:4176`. Wcześniejsze warianty pomiaru: `artifacts/visualizations/survey-styles.html`. Nie są publikacją aplikacji. Emulator zamknięto po testach; nie trzeba go uruchamiać do instalacji gotowego APK na telefonie.

## Najbliższe prace i zakres

1. Instalacja poprawek i ponowna próba użytkownika: odniesienie B→C i kontynuacja CD, pierwszy wektor, pan/pinch, pełny powrót do P1, krótkie przyciski i odrzucenie odczytu przy ruchu telefonu. Szczegóły w [checkliście](docs/technical/checklista-proby-terenowej.md).
2. Odbiór poprawek na telefonie i zapisanie wyników ponownej próby.
3. Ustalenie gotowości do testu zamkniętego po odbiorze poprawek. Krokomierz nie jest już traktowany jako otwarty błąd algorytmu na podstawie ostatniej oceny użytkownika.

Docelowy użytkownik i monetyzacja pozostają do doprecyzowania. Nie opublikowano testu zamkniętego ani release. DXF, solver, pełny edytor i migracja SDK są poza bieżącym zakresem. Bieżąca iteracja obejmuje poprawki, testy, build i próbę na emulatorze; instalacja poprawek na telefonie pozostaje osobnym krokiem.

Dokumenty: [instrukcja](docs/technical/prototyp.md), [UI](docs/technical/wizard-pomiaru.md), [architektura](docs/technical/dokumentacja-techniczna.md), [plan](docs/plan-rozwoju.md). Źródłowy dokument biznesowy Word pozostaje bez zmian.
