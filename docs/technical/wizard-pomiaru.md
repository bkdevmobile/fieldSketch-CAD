# Wizard pomiaru — zaakceptowany projekt UI

Aktualne preferencje: instrukcja P1 bez miniatury; zapamiętywany róg miniatury, domyślnie prawy dolny. Domyślna metoda długości to krokomierz, potem ostatni jawny wybór; formularz zachowuje swój przelicznik. Zgoda na krokomierz jest uzyskiwana przed sesją kierunku; odmowa wybiera ręczną długość. [Prowadzenie pierwszego pomiaru](pierwszy-pomiar.md).

Data: 21 października 2026. Aplikacja 0.1.0 (versionCode 2), wizard z korektą zapisanych boków, ponownym pomiarem i kontynuacją tego samego szkicu po zakupie Plus.

Aktualna weryfikacja źródeł: TypeScript i 163 testy TS (20 zestawów) przeszły. Moduł płatności ma 11 zaliczonych testów Kotlin; 7 testów orientacji przy ostatnim budowaniu było UP-TO-DATE. Podpisany APK 0.1.0 (versionCode 2) z zakupami i kluczem licencyjnym zainstalowano i uruchomiono na Redmi bez błędów ReactNativeJS/AndroidRuntime. Ten APK i AAB powstały przed ostatnią poprawką początkowego widoku DXF; poprawka jest w źródłach i wymaga nowego budowania. Testy transakcji Google Play, początkowego widoku w GUI CAD i fizycznego ponownego pomiaru sensorami pozostają otwarte. Historię, hashe i logi zawiera MEMO.md. [Artefakty i historia](../../MEMO.md).

Prowadzenie pierwszego pomiaru obejmuje instrukcję z ilustracją, automatyczny start sesji, blokadę niegotowego odczytu i podpowiedź po dotknięciu celownika. Szczegóły: [pierwszy pomiar](pierwszy-pomiar.md).

## Przebieg

1. Na początku użytkownik zapisuje pierwszy punkt P1, będący początkiem obrysu.
2. **Wskaż kierunek** — celowanie z początku boku, przechwycenie kierunku czujnikami i ewentualna korekta.
3. **Zmierz** — ręczne wpisanie m/cm albo „Start”, przejście do następnego punktu, „Stop” i korekta kroków.
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
- Po nowej sesji sensora przy istniejących bokach trzeba odtworzyć odniesienie. Domyślnie wybrany jest ostatni zapisany bok, z instrukcją konkretnych punktów. Po zapisie C w ABCD: stań w B, skieruj kamerę na C, ustaw odniesienie, wróć do C i wskaż D. Można świadomie wybrać inny znany bok.

Kąt przechwycony przez aparat jest od 21 października zaokrąglany do pełnego stopnia przed zapisem; ręczne pole dopuszcza maksymalnie 2 miejsca po przecinku. Długości obliczane i wpisywane mają maksymalnie 3 miejsca w bieżącej jednostce m/cm. Surowe odczyty pozostają w historii. [Precyzja wymiarów](precyzja-wymiarow.md).

## Długość i jednostki

- Automatyczny krokomierz działa tylko między „Start” i „Stop”.
- Pokazujemy liczbę kroków, użyty przelicznik i wynikową długość. Użytkownik może poprawić liczbę kroków albo wpisać długość bezpośrednio.
- Kontrolki krokomierza są w jednym rzędzie: **[−] [liczba kroków] [+] [Start/Stop]**. Start zmienia się w Stop w tym samym miejscu, po prawej stronie pola. Podczas liczenia pole i korekta ±1 są zablokowane, po zatrzymaniu dostępne. Nie ma osobnego Start pod polem ani Stop w dolnym pasku nawigacji. Brak detektora wyłącza Start, ale pozostawia ręczne wpisywanie i korektę kroków. Poprawiona liczba nie nadpisuje surowej liczby wykrytych kroków; nie schodzi poniżej zera. Nie odejmujemy automatycznie stałej liczby kroków.
- Domyślnie stosujemy metry, z możliwością wyboru cm. Pola akceptują polski przecinek dziesiętny.
- Długość kroku ustawiana jest dla użytkownika; początkowo 75 cm. Obserwacja zachowuje użyty przelicznik; zmiana ustawienia nie przelicza historii.
- W kroku „Zmierz” od razu dostępne są dwie niezależne możliwości: ręczne wpisanie długości w m/cm albo pomiar krokomierzem Start/Stop. Ręczne wpisanie nie wymaga uruchomienia ani wcześniejszego użycia krokomierza i pozwala bezpośrednio przejść do zapisania punktu. Ręcznie wpisana długość zastępuje ewentualny wynik z kroków. Źródło użytej wartości musi być jednoznaczne.
- Zapis boku wymaga kierunku oraz dodatniej, skończonej długości. Geometria nadal liczy w metrach.

## Szkic na żywo

Po zapisaniu P1 szkic jest widoczny jako pływająca miniatura, domyślnie w prawym dolnym rogu nad stałym paskiem akcji. Można ją przeciągać w obu osiach; po puszczeniu przyciąga się do najbliższego z czterech rogów obszaru nad nawigacją. Wybrany róg jest zachowany podczas zmiany etapu, rozmiaru okna i otwierania klawiatury. Przeciągnięcie nie otwiera podglądu. Dostępność udostępnia także akcję przeniesienia do następnego rogu.

Dotknięcie miniatury otwiera dialog na pełną szerokość, wyśrodkowany pionowo na przyciemnionym tle. Zawiera zoom, przesuwanie i dopasowanie. „Wróć do pomiaru”, krzyżyk, dotknięcie tła lub systemowe Wstecz zamyka go bez utraty etapu. Przy klawiaturze miniatura jest mniejsza; zmiana dostępnej wysokości ponownie umieszcza ją w wybranym rogu. Formularz można przewinąć ponad miniaturę.

| Stan | Prezentacja |
| --- | --- |
| Zapisany bok | Linia ciągła |
| Kierunek bez długości | Strzałka o umownej długości, bez sugerowania zmierzonej odległości |
| Kierunek i długość przed zapisem | Linia przerywana i wyróżniony niezapisany punkt końcowy |
| Pomiar w toku | Aktualizacja długości i położenia punktu roboczego na podstawie kroków |

Szkic dopasowuje się automatycznie po przechwyceniu kierunku, zakończeniu pomiaru długości, ręcznym wpisaniu długości oraz po korekcie kąta lub długości. Dopasowanie obejmuje cały zapisany obrys i element roboczy: wektor kierunku albo niezapisany bok z punktem końcowym. Podczas aktywnego liczenia kroków skala pozostaje stabilna; automatyczne dopasowanie następuje po „Stop”. Dla suwaka korekty dopasowanie następuje po zakończeniu gestu, a dla pola po zatwierdzeniu wartości. Przycisk „Dopasuj” pozostaje dostępny; można też ręcznie powiększyć podgląd.

Duży podgląd obsługuje przesuwanie jednym palcem w obu osiach oraz pinch dwoma palcami. Zoom jest ograniczony do 50–800% widoku dopasowanego (100%). Poziomy: 50, 75, 100, 150, 200, 300, 400, 600 i 800%. Podczas gestu skala płynnie śledzi palce; po puszczeniu przechodzi do najbliższego poziomu animacją 180 ms. Przyciski ± wybierają sąsiedni poziom z tą samą animacją i wyłączają się na granicach. Przyciąganie zachowuje punkt pod środkiem palców, o ile pozwalają ograniczenia przesuwania. „Dopasuj” przywraca widok całego rysunku i skalę 100%.

Granice przesuwania pozwalają skrajnej krawędzi szkicu dojść do środka podglądu w obu osiach. Dla małych, płaskich rysunków i pojedynczych punktów zachowujemy wcześniejszą swobodę ruchu. Rysunku nie można całkowicie odsunąć poza ekran; sprawdzenie obejmuje rzeczywiste odcinki, również ukośne.

## Zakończenie

„Zakończ” jest stale dostępne. Przy niezapisanym boku najpierw wybieramy: „Zapisz”, „Odrzuć” lub „Wróć do pomiaru”. Zapis wymaga kompletnych poprawnych danych. Następnie:

- **Zamknij obrys** — połącz ostatni zapisany punkt z P1 bez przesuwania punktów. Powstały bok oznacz jako wyliczony. Jeśli ostatni zmierzony bok już wrócił do P1 (zbieżność numeryczna do 0,0000001 m), pomiń powtórzony wierzchołek w obliczeniach i rysowaniu, bez zerowego boku i fałszywego samoprzecięcia. Historia pozostaje zachowana; rzeczywistego niedomknięcia nie dociągamy automatycznie.
- **Zostaw otwarty** — zakończ bez połączenia do P1.

Zamknięcie topologiczne nie jest pomiarem ostatniego boku ani potwierdzeniem dokładności. Niezależny pomiar powrotny pozostaje osobną opcją. Bez niego nie pokazujemy zerowego błędu zamknięcia. Dotychczasowe reguły poprawności obrysu i obliczania pola nadal obowiązują.

## Poprawki i przerwanie pracy

- „Wstecz” zachowuje dane robocze.
- „Wymiary i punkty” w pomiarze, jego menu i podsumowaniu udostępnia tabelę wszystkich zmierzonych długości, wybór punktu i korektę kąta dochodzącego boku. Poprawki można zatwierdzić razem z podglądem przed zapisem.
- „Zmierz ten bok ponownie” uruchamia kreator dla wybranego zapisanego odcinka; zapis zastępuje pomiar, zachowuje historię i przelicza dalsze punkty. Nie dodaje punktów i działa w zamkniętym szkicu oraz przy limicie Free. W trybie sensorowym odniesienie jest odtwarzane zgodnie z instrukcją.
- Wyliczony bok do P1 ma osobne pole długości; jego zmiana dopasowuje ostatni narożnik, zachowując długość poprzedniego boku. Niewykonalne długości blokują zapis.
- Sekcja „Notatka do szkicu” ma osobny przycisk zapisu. Metadane zachowują roboczy formularz; zmiana geometrii z innego ekranu unieważnia formularz starej rewizji. [Pełne reguły korekt](edycja-szkicu.md).
- Punkty i roboczy etap zapisujemy automatycznie. Utrwalenie szkicu roboczego nie zatwierdza boku w geometrii.
- Po wznowieniu przywracamy wpisy i wracamy do etapu kierunku, który wymaga ponownego przechwycenia. W trybie sensorowym przy istniejących bokach odtwarzamy odniesienie na znanym boku. Przerwy nie zaliczamy do aktywnego pomiaru kroków.

## Zakres próby użytkowej

Sprawdzić cykl kilku boków, korekty kąta i długości, oba źródła długości, brak naliczania kroków poza pomiarem, zgodność szkicu z danymi, cofanie bez utraty danych, oba warianty zakończenia i odtworzenie po przerwaniu aplikacji. Osobno zweryfikować automatyczny krokomierz na telefonie.

## Udostępnienie wyniku w MVP

PNG zawiera obrys, numery punktów, tabelę wymiarów i źródeł długości, notatkę oraz oznaczenia wartości szacunkowych i wyliczonego zamknięcia. Free dodaje znak wodny poza treścią. DXF jest objęty bramką Plus. Kod zakupów i przywracania jest podłączony; uruchomienie sprzedaży wymaga konfiguracji Console i testów: [zakupy Google Play](zakupy-google-play.md). Opisy punktów i wymiarów omijają linie obrysu oraz inne etykiety w podglądzie i DXF; w PNG wymiary pozostają w tabeli. [DXF](eksport-dxf.md), [Free/Plus](free-plus.md). Eksporty JSONL/CSV służą diagnostyce.

## Wybrany wariant makiety i uwagi do układu

Użytkownik wybrał pierwszy wariant: **Prowadzenie krok po kroku**. Formularz aktualnego etapu ma pierwszeństwo w układzie. Po próbie na telefonie pełnoszeroki szkic pod formularzem zastąpiono pływającą miniaturą z powiększaniem.

### Wybrany styl wizualny: Teren

Marka aplikacji od 20 października 2026: **outlineGo**. Użytkownik wybrał pierwotny wariant logo z otwartym obrysem, trzema pierścieniami i pełnym punktem końcowym. Ten sam wektor występuje w nagłówkach, pomiarze, nowym projekcie, PNG oraz zasobach ikony i splash screenu. Ikona: jasny znak na leśnej zieleni, także adaptacyjna i monochromatyczna. Start: zielony znak na ciepłym tle; podczas inicjalizacji danych także nazwa i wskaźnik ładowania. Nie dodano sztucznego opóźnienia startu. Techniczny pakiet Android i lokalna baza pozostają bez zmian dla ciągłości instalacji.

Spośród propozycji Teren / Precyzja / Kontrast użytkownik wybrał **Teren**. Obowiązuje jasne ciepłe tło `#F5F4EE`, panele `#FFFEFA`, tekst `#183A2C`, leśna zieleń akcji `#1B684B`, delikatna zieleń `#E7EEE2` i obramowania `#DBE4D9`. Gotowość sensora ma osobny zielony akcent `#177043`; kolor jest połączony z ikoną i opisem stanu.

Nagłówek pomiaru zawiera ikonę mapy, nazwę projektu, bieżący odcinek i tryb. Pasek Kierunek → Długość → Zapis wyróżnia bieżący etap i oznacza ukończone; jest wskaźnikiem, bez dodatkowej nawigacji. Tytuł etapu znajduje się nad panelem roboczym. Pola liczbowe i wyniki mają wyraźną hierarchię, panele zaokrąglenie 20, a przyciski 12–14 jednostek układu RN. Dolne akcje są na ciepłym jasnym tle; Zakończ i ponowienie odczytu mają mniejszy nacisk wizualny.

Ikony konturowe Lucide towarzyszą akcjom, statusowi i etapom. Ikony dekoracyjne nie powielają etykiet czytnika; przyciski zachowują opisy. Układy `[L] [kąt] [P]` i `[−] [kroki] [+] [Start/Stop]`, krok suwaka 5°, globalne ustawienia oraz reguły zapisu pozostają bez zmian. Miniatura szkicu jest mniejsza, z ikoną powiększania i delikatnym cieniem. Wspólna paleta i podstawowe kontrolki są stosowane także na pozostałych ekranach dla spójności.

**Uwaga do realizacji:** dolne przyciski nawigacji i zatwierdzania muszą zawsze znajdować się poza przewijaną treścią, przyklejone do dołu ekranu. Przewija się zawartość powyżej stałego paska akcji. Treść nie może być zasłaniana przez pasek; trzeba uwzględnić dolny obszar systemowy oraz klawiaturę ekranową, tak aby działania pozostały dostępne podczas edycji pól.

## Stan implementacji i weryfikacji

Aktualny kod: `b00dd74`, aplikacja 0.1.0. Wdrożono opisany wizard, ręczne m/cm, natywny krokomierz `TYPE_STEP_DETECTOR`, SQLite v3 z formularzem i ustawieniami, edycję ostatniego boku z historią `supersedesId`, PNG oraz osobną diagnostykę. Stop, tło i zakończenie sesji wyłączają liczenie; zdarzenia kroków mają identyfikatory sesji i pomiaru. Android 10+ wymaga zgody ACTIVITY_RECOGNITION pobieranej przy Start.

Aktualna weryfikacja źródeł: TypeScript i 163 testy TS (20 zestawów) przeszły. Moduł płatności ma 11 zaliczonych testów Kotlin; 7 testów orientacji przy ostatnim budowaniu było UP-TO-DATE. Podpisany APK 0.1.0 (versionCode 2) z zakupami i kluczem licencyjnym zainstalowano i uruchomiono na Redmi bez błędów ReactNativeJS/AndroidRuntime. Ten APK i AAB powstały przed ostatnią poprawką początkowego widoku DXF; poprawka jest w źródłach i wymaga nowego budowania. Testy transakcji Google Play, początkowego widoku w GUI CAD i fizycznego ponownego pomiaru sensorami pozostają otwarte. Historię, hashe i logi zawiera MEMO.md.

Po próbie użytkownik zaakceptował działanie krokomierza; dodatkowe zliczenia wiąże z ruchami telefonu. Korekta ręczna pozostaje dostępna. Nie wprowadzono automatycznego odejmowania kroków ani zmiany algorytmu.

## Obowiązujące uproszczenia interfejsu

### Nawigacja i ekran pomiaru

Na stronie głównej przycisk menu ⋮ znajduje się po prawej stronie nagłówka i otwiera kompaktową listę Ustawienia / Logi pomiarowe / outlineGo Plus przy przycisku. Menu projektu na liście oraz menu w pomiarze używają tego samego rozwijanego komponentu. Dotknięcie tła i systemowe Wstecz zamykają menu. Nowy projekt ma osobny formularz z nazwą, podsumowaniem globalnych ustawień i stałym przyciskiem utworzenia.

Potwierdzenia usuwania, cofnięcia, ostrzeżeń odczytu, zakończenia, niezapisanego boku, wyboru jednostki i komunikaty aplikacji są własnymi dialogami Teren: ciepłe jasne tło, zielone akcje, wyróżniona akcja destrukcyjna i spokojne anulowanie. Systemowe zgody Androida i systemowe udostępnianie plików nadal obsługuje system operacyjny.

Pozostałe ekrany używają tego samego stylu: ustawienia w trzech sekcjach z wyborem segmentowym; podsumowanie ze szkicem, obwodem/polem i rozwijanymi współrzędnymi; edycja ostatniego boku z L/pole/P, suwakiem co 5° i źródłem długości; podgląd PNG bez kontrolek w samym obrazie. Lista logów i treść migawki są osobnymi stanami; kopiowanie i eksport są w stałym dolnym pasku. Diagnostyka zachowuje dane techniczne i kontekst próby poza pomiarem.

Lista szkiców ma nazwę, datę ostatniej zmiany, ikonę przypięcia i menu ⋮: Otwórz / Przypnij lub Odepnij / Usuń. Dotknięcie wiersza otwiera szkic; usunięcie wymaga potwierdzenia. Początkowo widoczne są 3 pozycje, „Więcej” dodaje po 10. Przypięte szkice są pierwsze, wewnątrz obu grup według daty ostatniej zmiany malejąco. SQLite dostarcza pełną listę; limit widoku nie ukrywa trwale istniejących danych.

- Ustawienia obejmują domyślne m/cm, długość kroku, przyciąganie oraz globalny tryb kierunku (domyślnie względny). Tryb obowiązuje we wszystkich projektach przy kolejnych pomiarach. Zmiana zatrzymuje aktywną sesję i unieważnia roboczy kierunek oraz odniesienie; długość robocza i zapisane obserwacje pozostają zachowane. Brak wybranego sensora na urządzeniu oznacza użycie trybu ręcznego.
- Po przechwyceniu pokazujemy kąt. „Popraw kąt” rozwija pole, lewo/prawo i suwak; domyślnie są schowane. W trybie ręcznym pola są widoczne od razu. Błędna korekta odsłania pole z komunikatem.
- Przy kierunku pokazujemy wyłącznie prosty status: stabilizowanie, gotowy lub ostrzeżenie. Przycisk „Szczegóły odczytu” i szczegóły liczbowe usunięto z ekranu pomiaru na życzenie użytkownika. Status „Telefon stabilny — możesz zapisać kierunek” jest zielony przy aktywnej sesji, gotowym oknie próbek, rzucie poziomym co najmniej 0,2, jakości co najmniej 2/3 i rozrzucie do 3°. Odtworzenie odniesienia i ostrzeżenia pozostają widoczne automatycznie.
- W kroku długości pozostają „Wpisz długość” i „Krokomierz”. Zamiast dwóch przycisków m/cm jest kompaktowa, klikalna jednostka. Zmiana przelicza wartość, zachowując fizyczną długość.
- Na polecenie użytkownika usunięto całkowicie „Więcej opcji” i jego zawartość z ekranu pomiaru. Tryb kierunku oraz długość kroku ustawiamy globalnie w ustawieniach. Dotychczasowe pomiary i przywrócony formularz zachowują użyty przelicznik; następny bok otrzymuje wartość z ustawień. Korekta liczby kroków nadal jest dostępna.
- Menu projektu ⋮ zawiera „Wymiary i punkty”, pomoc, cofnięcie boku/zamknięcia, dostępny przy kompletnym podsumowaniu niezależny pomiar powrotu do P1, diagnostykę i ustawienia. Cofnięcie wymaga potwierdzenia odrzucenia bieżącego niezapisanego pomiaru; jeśli potrzebna jest sesja do logowania, otwieramy ją automatycznie.
- Osobny ekran „Diagnostyka” zawiera kontekst próby, niezależną wartość odniesienia, logi i ręczne zatrzymanie sesji czujników. Dostęp z ustawień oraz menu projektu. Powrót zachowuje etap i formularz, o ile nie zatrzymano sesji; zatrzymanie wymaga ponownego przechwycenia.
- Stałe dolne akcje i pływająca miniatura szkicu pozostają dostępne. Nie ma globalnego przełącznika pokazywania zaawansowanych opcji.

Poprawki po próbie na telefonie: przyciąganie kąta konfigurowane wyłącznie w ustawieniach, pływający szkic oraz przycisk „Sprawdź bok” zamiast enigmatycznego „Sprawdź punkt”. Przycisk prowadzi do podsumowania roboczego punktu; dopiero „Zapisz punkt” zatwierdza bok.

## Decyzje otwarte

Testy zamknięte wcześniejszego MVP zakończono. Zasady Free/Plus zaakceptowano; limity, oferta i znak wodny są wdrożone. Pozostają konfiguracja i testy zakupów w Google Play, doprecyzowanie użytkownika docelowego, przegląd tłumaczeń i wyglądu, fizyczna próba nowych korekt oraz kontrola DXF w CAD i przygotowanie publikacji. Solver sieci i migracja SDK pozostają poza bieżącym zakresem. [Aktualny plan](../plan-rozwoju.md).