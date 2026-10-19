# Wizard pomiaru — zaakceptowany projekt UI

Data: 19 października 2026. Status: wdrożony wizard MVP, poprawki po pierwszej próbie na telefonie.

Dokument opisuje pełny zaakceptowany interfejs. Zrealizowaną część rozróżnia sekcja Postęp implementacji — pierwszy przyrost. Funkcje są wdrażane przyrostowo; aktualny stan rozróżniają sekcje postępu poniżej. Testy trybu względnego dają według użytkownika akceptowalną dokładność; automatyczny krokomierz wymaga osobnej walidacji.

## Przebieg

1. Na początku użytkownik zapisuje pierwszy punkt P1, będący początkiem obrysu.
2. **Wskaż kierunek** — celowanie z początku boku, przechwycenie kierunku czujnikami i ewentualna korekta.
3. **Zmierz** — „Start”, przejście do następnego punktu, „Stop” i ewentualna korekta długości.
4. **Zapisz punkt** — zatwierdzenie kierunku, długości i punktu końcowego boku. Nowy punkt staje się początkiem następnego boku.

Kroki 2–4 powtarzają się. Bok i punkt końcowy pozostają robocze do zatwierdzenia. Szkic oraz „Zakończ” są stale dostępne. „Wstecz” zachowuje dane.

## Kierunek i korekta

- Pierwszy bok wyznacza 0° w układzie względnym projektu.
- Kolejne kąty pokazujemy jako skręt względem poprzedniego boku: lewo/prawo, 0–180°. 0° oznacza kontynuację prosto, 180° zawrócenie. Geometria wewnętrzna zachowuje kierunki w układzie projektu.
- Po przechwyceniu odczyt zostaje zamrożony; ruch telefonu nie zmienia wybranego kierunku.
- Suwak poprawia przechwycony kierunek o ±15°. Pole liczbowe pozwala ustawić dowolny kierunek przez kąt skrętu i wybór lewo/prawo. Pierwszy bok pozostaje odniesieniem 0°.
- Suwak porusza się skokowo co 5° i zawsze zaokrągla wynikowy skręt do najbliższej pełnej wielokrotności 5° (np. 88,3° → 90°, następny skok → 95°). Dotyczy również sterowania dostępności. Nie ogranicza dokładności pola ręcznego i nie zaokrągla samoczynnie przechwyconego odczytu przed użyciem suwaka.
- Korekta ma układ **[L] [pole kąta] [P]**, a bezpośrednio poniżej znajduje się suwak. L oznacza skręt w lewo, P w prawo; wybrany kierunek jest wyróżniony zielonym wypełnieniem. Ten sam rząd pola i przycisków stosujemy w trybie ręcznym oraz edycji ostatniego boku. Przyciski zachowują pełne etykiety dostępności „W lewo”/„W prawo”.
- W ustawieniach aplikacji wybieramy przyciąganie kąta: 90° (domyślnie), 10°, 5° albo wyłączone. Wyboru nie ma na ekranie pomiaru. Przyciąganie działa po zakończeniu ręcznej korekty pola: do najbliższej wielokrotności wybranego kąta, przy różnicy do 2° dla 90°/10° i do 1° dla 5°. Sam odczyt czujnika nie jest zaokrąglany. Reguła obejmuje również edycję ostatniego boku. Suwak ma niezależne, stałe zaokrąglanie do pełnych 5° opisane powyżej.
- „Zmierz ponownie” ponawia odczyt z czujników.
- Po nowej sesji sensora przy istniejących bokach nadal trzeba odtworzyć odniesienie na znanym boku.

## Długość i jednostki

- Automatyczny krokomierz działa tylko między „Start” i „Stop”.
- Pokazujemy liczbę kroków, użyty przelicznik i wynikową długość. Użytkownik może poprawić liczbę kroków albo wpisać długość bezpośrednio.
- Kontrolki krokomierza są w jednym rzędzie: **[−] [liczba kroków] [+] [Start/Stop]**. Start zmienia się w Stop w tym samym miejscu, po prawej stronie pola. Podczas liczenia pole i korekta ±1 są zablokowane, po zatrzymaniu dostępne. Nie ma osobnego Start pod polem ani Stop w dolnym pasku nawigacji. Brak detektora wyłącza Start, ale pozostawia ręczne wpisywanie i korektę kroków. Poprawiona liczba nie nadpisuje surowej liczby wykrytych kroków; nie schodzi poniżej zera. Nie odejmujemy automatycznie stałej liczby kroków.
- Domyślnie stosujemy metry, z możliwością wyboru cm. Pola akceptują polski przecinek dziesiętny.
- Długość kroku ustawiana jest dla użytkownika; początkowo 75 cm. Obserwacja zachowuje użyty przelicznik; zmiana ustawienia nie przelicza historii.
- W kroku „Zmierz” od razu dostępne są dwie niezależne możliwości: ręczne wpisanie długości w m/cm albo pomiar krokomierzem Start/Stop. Ręczne wpisanie nie wymaga uruchomienia ani wcześniejszego użycia krokomierza i pozwala bezpośrednio przejść do zapisania punktu. Ręcznie wpisana długość zastępuje ewentualny wynik z kroków. Źródło użytej wartości musi być jednoznaczne.
- Zapis boku wymaga kierunku oraz dodatniej, skończonej długości. Geometria nadal liczy w metrach.

## Szkic na żywo

Szkic jest stale widoczny jako pływająca miniatura w prawym dolnym rogu, nad stałym paskiem akcji. Dotknięcie otwiera duży podgląd z zoomem, przesuwaniem i dopasowaniem; „Wróć do pomiaru” lub systemowe Wstecz zamyka podgląd bez utraty etapu. Przy klawiaturze miniatura jest mniejsza. Formularz można przewinąć ponad miniaturę.

| Stan | Prezentacja |
| --- | --- |
| Zapisany bok | Linia ciągła |
| Kierunek bez długości | Strzałka o umownej długości, bez sugerowania zmierzonej odległości |
| Kierunek i długość przed zapisem | Linia przerywana i wyróżniony niezapisany punkt końcowy |
| Pomiar w toku | Aktualizacja długości i położenia punktu roboczego na podstawie kroków |

Szkic dopasowuje się automatycznie po przechwyceniu kierunku, zakończeniu pomiaru długości, ręcznym wpisaniu długości oraz po korekcie kąta lub długości. Dopasowanie obejmuje cały zapisany obrys i element roboczy: wektor kierunku albo niezapisany bok z punktem końcowym. Podczas aktywnego liczenia kroków skala pozostaje stabilna; automatyczne dopasowanie następuje po „Stop”. Dla suwaka korekty dopasowanie następuje po zakończeniu gestu, a dla pola po zatwierdzeniu wartości. Przycisk „Dopasuj” pozostaje dostępny; można też ręcznie powiększyć podgląd.

## Zakończenie

„Zakończ” jest stale dostępne. Przy niezapisanym boku najpierw wybieramy: „Zapisz”, „Odrzuć” lub „Wróć do pomiaru”. Zapis wymaga kompletnych poprawnych danych. Następnie:

- **Zamknij obrys** — połącz ostatni zapisany punkt z P1 bez przesuwania punktów. Powstały bok oznacz jako wyliczony.
- **Zostaw otwarty** — zakończ bez połączenia do P1.

Zamknięcie topologiczne nie jest pomiarem ostatniego boku ani potwierdzeniem dokładności. Niezależny pomiar powrotny pozostaje osobną opcją. Bez niego nie pokazujemy zerowego błędu zamknięcia. Dotychczasowe reguły poprawności obrysu i obliczania pola nadal obowiązują.

## Poprawki i przerwanie pracy

- „Wstecz” zachowuje dane robocze.
- Wybranie ostatniego zapisanego boku umożliwia poprawienie kierunku i długości albo cofnięcie zapisu. Nie oznacza to pełnego edytora wszystkich boków.
- Punkty i roboczy etap zapisujemy automatycznie. Utrwalenie szkicu roboczego nie zatwierdza boku w geometrii.
- Po wznowieniu odtwarzamy etap i dane. Przy utracie ciągłości odniesienia wymagamy odtworzenia go na znanym boku przed dalszym pomiarem. Przerwy nie zaliczamy do aktywnego pomiaru kroków.

## Weryfikacja przyszłej implementacji

Sprawdzić cykl kilku boków, korekty kąta i długości, oba źródła długości, brak naliczania kroków poza pomiarem, zgodność szkicu z danymi, cofanie bez utraty danych, oba warianty zakończenia i odtworzenie po przerwaniu aplikacji. Osobno zweryfikować automatyczny krokomierz na telefonie.

## Udostępnienie wyniku w MVP

W tej wersji wystarczy eksport szkicu do PNG: czytelny obraz z wymiarami i oznaczeniem, że długości pochodzące z kroków są szacunkowe. PNG jest jedynym wymaganym formatem udostępniania szkicu w MVP; DXF i inne formaty wyniku pozostają poza tym zakresem. Ustalenie nie zmienia dostępnego eksportu logów diagnostycznych JSONL/CSV.

## Wybrany wariant makiety i uwagi do układu

Użytkownik wybrał pierwszy wariant: **Prowadzenie krok po kroku**. Formularz aktualnego etapu ma pierwszeństwo w układzie. Po próbie na telefonie pełnoszeroki szkic pod formularzem zastąpiono pływającą miniaturą z powiększaniem.

**Uwaga do realizacji:** dolne przyciski nawigacji i zatwierdzania muszą zawsze znajdować się poza przewijaną treścią, przyklejone do dołu ekranu. Przewija się zawartość powyżej stałego paska akcji. Treść nie może być zasłaniana przez pasek; trzeba uwzględnić dolny obszar systemowy oraz klawiaturę ekranową, tak aby działania pozostały dostępne podczas edycji pól.

## Postęp implementacji — pierwszy przyrost

Rozpoczęto wdrażanie wariantu Prowadzenie krok po kroku. Kod obejmuje etapy pierwszego punktu, przechwycenia kierunku, korekty skrętu i suwaka ±15°, ręcznej długości m/cm lub ręcznej liczby kroków, sprawdzenia i zapisu punktu. Nowe projekty preferują tryb względny. Szkic i dolne przyciski są poza przewijaną treścią; szkic pokazuje wektor bez długości lub przerywany bok i dopasowuje widok po zatwierdzeniu zmiany.

Formularz roboczy zapisuje się w osobnej tabeli SQLite. Migracja bazy v1 → v2 zachowuje stare projekty i obserwacje. Po restarcie przywracamy wpisy, ale wymagamy ponownego przechwycenia kierunku i, dla istniejących boków w trybie sensorowym, odtworzenia odniesienia. Ręczna długość ma jawne źródło, bez fikcyjnej liczby kroków. Korekta zachowuje przechwycony kierunek i oryginalny odczyt czujnika.

Obsługiwane jest rozstrzygnięcie niezapisanego boku przy zakończeniu, obrys otwarty lub zamknięty oraz podsumowanie. Dotychczasowy niezależny pomiar powrotny i diagnostyka pozostają dostępne.

Zakres pierwszego przyrostu został rozszerzony w drugim przyroście opisanym poniżej.

Weryfikacja pierwszego przyrostu: TypeScript, 35 testów TS i 5 Kotlin, release APK oraz testy emulatora Android 16. Sprawdzono zapis ręcznych długości i skrętu, pole 6,75 m² po zamknięciu, zachowanie starego projektu po aktualizacji, przywrócenie formularza po force-stop, konwersję m/cm oraz widoczność całego dolnego panelu akcji nad klawiaturą i jego powrót po jej schowaniu.

## Postęp implementacji — drugi przyrost

Dodano:

- **Edycję ostatniego boku** z podsumowania: kąt skrętu, długość w m/cm lub liczba kroków i przelicznik. Punkt początkowy i wcześniejsze punkty pozostają bez zmian; bok zamykający obrys topologicznie przelicza się z nowego końca. Nowa obserwacja wskazuje `supersedesId`; źródłowa obserwacja i surowy odczyt pozostają w historii. Przy aktywnym niezależnym pomiarze zamknięcia trzeba go najpierw cofnąć.
- **Eksport PNG**: osobny podgląd obrazu, pełny obrys, oznaczenia punktów, tabela wymiarów boków z ich źródłem, obwód/trasa, pole i informacja o szacowaniu krokami. Wyliczony bok zamykający jest oznaczony. Obraz jest tworzony z niezmiennej migawki rewizji i udostępniany systemowym oknem; nie zawiera elementów interfejsu aplikacji.
- **Ustawienia użytkownika**: domyślne m/cm i długość jednego kroku (początkowo 75 cm). SQLite v3 przechowuje preferencje; migracja zachowuje projekty i formularze robocze. Historyczne obserwacje zachowują swój przelicznik. W kroku długości można poprawić przelicznik konkretnego pomiaru.
- **Krokomierz Start/Stop** na natywnym `TYPE_STEP_DETECTOR`. Rejestracja trwa tylko w oknie pomiaru; zdarzenia mają monotoniczny czas i identyfikator pomiaru. Stare zdarzenia i duplikaty są odrzucane. Stop, tło, zakończenie sesji i zniszczenie modułu wyłączają liczenie. Surowa wykryta liczba kroków pozostaje obok ręcznie poprawionej liczby i użytego przelicznika.

Na Androidzie 10+ zgoda ACTIVITY_RECOGNITION jest pobierana przy uruchomieniu krokomierza. Brak sensora lub zgody pozostawia ręczną długość i ręcznie wpisywane kroki. Użyto detektora pojedynczych kroków zamiast kumulacyjnego licznika od restartu telefonu; dokumentacja Androida opisuje większe opóźnienie licznika: [czujniki ruchu Android](https://developer.android.com/develop/sensors-and-location/sensors/sensors_motion).

Weryfikacja drugiego przyrostu: 41 testów TypeScript i 7 Kotlin, kontrola TypeScript, release APK i instalacja na emulatorze. Sprawdzono korektę boku 3 → 4 m z polem 6,75 → 9 m², przelicznik 80 cm i 2,5 kroku = 200 cm, otwartą trasę, ustawienia po zimnym starcie oraz podgląd i systemowe udostępnianie niepustego PNG 1080 × 1228 px. Nie wybrano odbiorcy ani usługi. Emulator nie udostępnia detektora kroków; potwierdzono na nim ręczną ścieżkę zastępczą.

Weryfikacja programowa nie potwierdza dokładności krokomierza na telefonie użytkownika. Wymaga on osobnego testu fizycznego; wcześniejsza akceptacja dokładności trybu względnego dotyczy pomiaru kierunku. Należy sprawdzić również ostatni krok tuż przed Stop i różne sposoby trzymania telefonu.

## Dalsze projektowanie

### Uproszczenie ekranu pomiaru

Na stronie głównej przycisk menu ⋮ znajduje się po prawej stronie nagłówka i otwiera Ustawienia oraz Logi pomiarowe. Te działania usunięto z przewijanej listy projektów. Zamknięcie menu przez „Wróć” lub systemowe Wstecz zachowuje wpisaną nazwę nowego projektu.

Lista projektów jest prosta: w każdym wierszu nazwa (jedna linia, długie nazwy skracane wielokropkiem), data ostatniej zmiany oraz przycisk ⋮. Dotknięcie nazwy/daty otwiera projekt. Menu danego projektu zawiera „Otwórz” i „Usuń”; usunięcie wymaga dotychczasowego potwierdzenia. Menu jest osobnym przyciskiem i nie otwiera równocześnie pomiaru. Na początku widoczne są 3 ostatnio zmienione projekty. „Więcej” dopisuje do widoku po 10 następnych i znika po wyświetleniu wszystkich. Kolejność: data ostatniej zmiany malejąco. SQLite nadal dostarcza pełną listę do współdzielonego magazynu; limit dotyczy pozycji pokazywanych na stronie głównej.

- Ustawienia obejmują domyślne m/cm, długość kroku, przyciąganie oraz globalny tryb kierunku (domyślnie względny). Tryb obowiązuje we wszystkich projektach przy kolejnych pomiarach. Zmiana zatrzymuje aktywną sesję i unieważnia roboczy kierunek oraz odniesienie; długość robocza i zapisane obserwacje pozostają zachowane. Brak wybranego sensora na urządzeniu oznacza użycie trybu ręcznego.
- Po przechwyceniu pokazujemy kąt. „Popraw kąt” rozwija pole, lewo/prawo i suwak; domyślnie są schowane. W trybie ręcznym pola są widoczne od razu. Błędna korekta odsłania pole z komunikatem.
- Przy kierunku pokazujemy wyłącznie prosty status: stabilizowanie, gotowy lub ostrzeżenie. Przycisk „Szczegóły odczytu” i szczegóły liczbowe usunięto z ekranu pomiaru na życzenie użytkownika. Status „Gotowy do przechwycenia” jest zielony przy aktywnej sesji, gotowym oknie próbek, rzucie poziomym co najmniej 0,2, jakości co najmniej 2/3 i rozrzucie do 3°. Odtworzenie odniesienia i ostrzeżenia pozostają widoczne automatycznie.
- W kroku długości pozostają „Wpisz długość” i „Krokomierz”. Zamiast dwóch przycisków m/cm jest kompaktowa, klikalna jednostka. Zmiana przelicza wartość, zachowując fizyczną długość.
- Na polecenie użytkownika usunięto całkowicie „Więcej opcji” i jego zawartość z ekranu pomiaru. Tryb kierunku oraz długość kroku ustawiamy globalnie w ustawieniach. Dotychczasowe pomiary i przywrócony formularz zachowują użyty przelicznik; następny bok otrzymuje wartość z ustawień. Korekta liczby kroków nadal jest dostępna.
- Menu projektu ⋮ zawiera cofnięcie boku/zamknięcia, dostępny przy kompletnym podsumowaniu niezależny pomiar powrotu do P1, diagnostykę i ustawienia. Cofnięcie wymaga potwierdzenia odrzucenia bieżącego niezapisanego pomiaru; jeśli potrzebna jest sesja do logowania, otwieramy ją automatycznie.
- Osobny ekran „Diagnostyka” zawiera kontekst próby, niezależną wartość odniesienia, logi i ręczne zatrzymanie sesji czujników. Dostęp z ustawień oraz menu projektu. Powrót zachowuje etap i formularz, o ile nie zatrzymano sesji; zatrzymanie wymaga ponownego przechwycenia.
- Stałe dolne akcje i pływająca miniatura szkicu pozostają dostępne. Nie ma globalnego przełącznika pokazywania zaawansowanych opcji.

Poprawki po próbie na telefonie: przyciąganie kąta konfigurowane wyłącznie w ustawieniach, pływający szkic oraz przycisk „Dalej · zapisz punkt” zamiast enigmatycznego „Sprawdź punkt”. Przycisk prowadzi do podsumowania roboczego punktu; dopiero „Zapisz punkt” zatwierdza bok.

Użytkownik ocenił krokomierz jako ogólnie działający poprawnie, ale często doliczający 1–2 kroki. Dodano szybką ręczną korektę; przyczyna nadliczania pozostaje do sprawdzenia na telefonie z logiem i znaną liczbą kroków. Nie traktujemy tej uwagi jako pełnej akceptacji dokładności krokomierza.

Przebieg pomiaru i pierwszy wariant makiety (Prowadzenie krok po kroku) zostały zaakceptowane. Szczegółowy układ należy dopracować zgodnie z uwagą o stałym dolnym pasku akcji. Użytkownik docelowy, ostateczny zakres pierwszej wersji i wstępny model zarabiania pozostają do opracowania. Ustalenie nie obejmuje DXF, solvera ani migracji SDK.
