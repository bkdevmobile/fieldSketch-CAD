# Stan prac nad FieldSketch CAD

Aktualizacja: 19 października 2026. Stan kodu: commit `91dd0fe` na gałęzi `mvp`.

## Aktualny rezultat

Działające MVP Android 0.1.0 jest w `app/`. Obejmuje pomiar i prosty obrys offline, bez kont i backendu, eksport PNG oraz trwałą diagnostykę. Najnowszy APK zbudowano pełnym skryptem i zainstalowano na telefonie użytkownika `23124RA7EO` przez `adb install -r`, z zachowaniem danych. Instalacja: `Success`; uruchomienie MainActivity: `Status: ok`, `LaunchState: COLD`.

| Artefakt | Wartość |
| --- | --- |
| Plik | `artifacts/FieldSketch-CAD-0.1.0.apk` |
| Rozmiar | 83578411 bajtów |
| SHA256 | `84FB973DA5B92DEAA24571BC30452C0C1EA649ACB70C2A9B4A4FEC7F0FEB20EE` |
| Platforma | Android 7+, target SDK 36, arm64-v8a i x86_64 |
| Uruchamianie | Osadzony JavaScript, bez Metro i internetu, podpis deweloperski |
| Log ostatniego budowania | `artifacts/phone-install-build.log` |

## Obowiązujący interfejs

- Strona główna: nowy projekt i lista wierszy z nazwą, datą ostatniej zmiany oraz menu ⋮ (Otwórz/Usuń). Dotknięcie wiersza otwiera projekt; usunięcie wymaga potwierdzenia. Początkowo 3 najnowsze, „Więcej” dodaje po 10. Limit dotyczy wyświetlania; magazyn nadal pobiera pełną listę z SQLite.
- Menu nagłówka strony głównej: Ustawienia i Logi pomiarowe.
- Wizard: P1 → kierunek → korekta → długość → podsumowanie robocze → zapis punktu. „Dalej · zapisz punkt” nie zatwierdza jeszcze boku. Dolna nawigacja jest poza scrollem, także przy klawiaturze.
- Kierunek: względny (domyślnie), magnetyczny lub ręczny. Wybór wyłącznie w globalnych ustawieniach i dla wszystkich projektów. Zmiana zatrzymuje sesję, unieważnia roboczy kierunek/odniesienie, ale zachowuje wpisaną długość i historyczne obserwacje. Niedostępny sensor oznacza użycie trybu ręcznego.
- Podgląd sensora: tylko ogólny status. „Gotowy do przechwycenia” jest zielony przy aktywnej sesji, gotowym oknie, rzucie poziomym ≥ 0,2, jakości ≥ 2/3 i rozrzucie ≤ 3°. Bez przycisku szczegółów i bez „Więcej opcji”.
- „Popraw kąt” rozwija `[L] [kąt] [P]`, poniżej suwak ±15° ze skokiem 5°. Wynikowy skręt jest zaokrąglany do pełnych 5°. Pole ręczne pozwala wpisać dokładniejszy kąt; w trybie ręcznym pola są widoczne od razu. Pierwszy bok wyznacza 0°.
- Przyciąganie pola ręcznego w ustawieniach: 90° (domyślnie), 10°, 5° lub wyłączone; tolerancja 2° dla 90°/10°, 1° dla 5°. Suwak ma niezależne zaokrąglanie. Sam przechwycony odczyt nie jest zaokrąglany przed korektą.
- Długość: niezależne „Wpisz długość” w m/cm lub „Krokomierz”. Jednostka przy polu pozwala przeliczyć wartość bez zmiany fizycznej długości.
- Krokomierz: `[−] [liczba kroków] [+] [Start/Stop]`. Start i Stop są w tym samym miejscu. Podczas liczenia pole i ±1 są zablokowane. Brak sensora/zgody pozostawia ręczne długości i kroki. Domyślna długość kroku 75 cm jest zmieniana w ustawieniach; historia i przywrócony formularz zachowują użyty przelicznik. Surowa wykryta liczba nie jest nadpisywana korektą.
- Szkic: pływająca miniatura w prawym dolnym rogu nad akcjami, mniejsza przy klawiaturze. Dotknięcie otwiera duży podgląd. Zapisane boki są ciągłe; roboczy bok przerywany, a kierunek bez długości jest wektorem. Automatyczne dopasowanie po zatwierdzeniu kierunku, długości lub korekty; podczas liczenia skala jest stabilna.
- Menu projektu w pomiarze: cofnięcie boku/zamknięcia, niezależny pomiar powrotu do P1 przy kompletnym podsumowaniu, diagnostyka i ustawienia. Cofnięcie wymaga potwierdzenia odrzucenia roboczego pomiaru.
- Zakończenie: rozstrzygnięcie niezapisanego boku, następnie obrys otwarty lub zamknięty. Zamykający bok jest wyliczony; niezależny pomiar powrotny pozostaje osobny. Bez niego nie ma wartości błędu zamknięcia. Pole tylko dla poprawnego zamkniętego obrysu.
- Podsumowanie: edycja ostatniego boku z historią `supersedesId`, podgląd i systemowe udostępnianie PNG z wymiarami oraz oznaczeniem długości szacunkowych.
- SQLite v3 zachowuje projekty, niezmienne obserwacje, formularz i ustawienia. Wznowienie przywraca wpisy, ale wraca do kierunku; w trybie sensorowym z istniejącymi bokami trzeba odtworzyć odniesienie.

## Technologia i diagnostyka

Expo 56.0.23, React Native 0.85.3, React 19.2.3, TypeScript i własny moduł Kotlin SensorManager. Rotation vector i game rotation vector wyznaczają kierunek z poziomego rzutu osi tylnej kamery. Próbkowanie zadane 25 Hz, okno około 2 s. Expo Go nie obsługuje modułu.

Krokomierz używa `TYPE_STEP_DETECTOR`, okna Start/Stop oraz identyfikatorów sesji i pomiaru. Odrzuca stare i zduplikowane zdarzenia. Stop, tło i zakończenie sesji wyłączają liczenie. Android 10+ wymaga zgody ACTIVITY_RECOGNITION pobieranej na żądanie.

Osobna Diagnostyka zawiera uwagi testera, niezależne odniesienie, logi i ręczne zatrzymanie sesji. JSONL zawiera surowe sensory, odczyty, kroki, przelicznik, geometrię, operacje i błędy. Bufor jest utrwalany co sekundę, przy przechwyceniu i zakończeniu. Po awarii zachowujemy pełne rekordy i oznaczamy przerwaną sesję. Podgląd/kopiowanie porcjami do 128 KiB oraz eksport JSONL/CSV; duże logi mają ponumerowane części. Limit 100 MiB, ostrzeżenie przy 80 MiB, bez automatycznego kasowania. Migawka aktywnego loga jest niezmienna.

## Weryfikacja i granice potwierdzenia

- Ostatni pełny przebieg: TypeScript, 44 testy TS, release build i zadanie 7 testów Kotlin bez błędów. Zadanie Kotlin było `UP-TO-DATE`; zapisane raporty zawierają 7 testów, 0 błędów i 0 niepowodzeń.
- Emulator Pixel 8 API 36: zachowanie projektów po aktualizacji, ręczne m/cm i kroki, odtworzenie formularza, korekta boku, geometria i pole, PNG, menu, lista 3 z 5 projektów → wszystkie 5 po „Więcej”, otwarcie z wiersza/menu i anulowanie usuwania. Zrzut listy sprawdzono wizualnie. Emulator nie ma detektora kroków; nie potwierdza fizycznego liczenia. Został zamknięty po testach.
- Wcześniejsze próby: offline w trybie samolotowym, zachowanie po force-stop, duży log około 1,54 MiB w 13 częściach oraz systemowe udostępnianie CSV/PNG. Nie wysłano plików do odbiorców. Automatyzacja odczytu wklejenia pokazała tylko 5000 znaków, więc kompletność kopiowania potwierdzają testy podziału rekordów, a nie ten odczyt UI.
- Użytkownik zaakceptował dokładność wykonanych testów trybu względnego. Brak liczbowego progu i podstaw do uogólnienia na tryb magnetyczny.
- Użytkownik ocenił krokomierz jako generalnie poprawny, lecz często doliczający 1–2 kroki. Dodano ręczną korektę; przyczyna nie jest naprawiona. Nie odejmujemy automatycznie stałej liczby kroków.
- Instalacja i uruchomienie najnowszego APK na telefonie są potwierdzone. Pełna próba użytkowa całego ostatniego układu nie jest jeszcze potwierdzona; nie każdy nowy element ma osobną weryfikację UI na emulatorze.
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
adb -d install -r artifacts/FieldSketch-CAD-0.1.0.apk
adb -d shell am start -n pl.fieldsketch.cad.prototype/.MainActivity
```

Git w tej sesji wymaga jawnych `--git-dir=C:/projects/fieldSketch-CAD/.git --work-tree=C:/projects/fieldSketch-CAD` z powodu wykrywania właściciela; nie zmieniano globalnego safe.directory. Nie wykonywano pushowania. Bazowy commit MVP: `4818fdb`; uproszczenie UI i nawigacji: `91dd0fe`. Aktualizację dokumentacji zapisano w osobnym commicie `docs: align documentation with current Android MVP`.

## Najbliższe prace i zakres

Sprawdzić najnowszy UI na telefonie i zdiagnozować nadliczanie kroków przy znanej liczbie kroków, z logiem, szczególnie przy Start/Stop i zmianie sposobu trzymania telefonu. Następnie ustalić kryteria gotowości do testu zamkniętego. Docelowy użytkownik i monetyzacja pozostają do doprecyzowania. Nie opublikowano testu zamkniętego ani release. DXF, solver, pełny edytor i migracja SDK są poza bieżącym zakresem.

Dokumenty: [instrukcja](docs/technical/prototyp.md), [UI](docs/technical/wizard-pomiaru.md), [architektura](docs/technical/dokumentacja-techniczna.md), [plan](docs/plan-rozwoju.md). Źródłowy dokument biznesowy Word pozostaje bez zmian.
