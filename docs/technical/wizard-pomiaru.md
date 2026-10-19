# Wizard pomiaru — zaakceptowany projekt UI

Data: 19 października 2026. Status: decyzje zaakceptowane przez użytkownika, do implementacji.

Dokument opisuje następny interfejs, a nie funkcje obecnego APK 0.1.0. Automatyczny krokomierz, korekty w wizardzie i zapis etapu roboczego wymagają implementacji. Testy trybu względnego dają według użytkownika akceptowalną dokładność; automatyczny krokomierz wymaga osobnej walidacji.

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
- „Zmierz ponownie” ponawia odczyt z czujników.
- Po nowej sesji sensora przy istniejących bokach nadal trzeba odtworzyć odniesienie na znanym boku.

## Długość i jednostki

- Automatyczny krokomierz działa tylko między „Start” i „Stop”.
- Pokazujemy liczbę kroków, użyty przelicznik i wynikową długość. Użytkownik może poprawić liczbę kroków albo wpisać długość bezpośrednio.
- Domyślnie stosujemy metry, z możliwością wyboru cm. Pola akceptują polski przecinek dziesiętny.
- Długość kroku ustawiana jest dla użytkownika; początkowo 75 cm. Obserwacja zachowuje użyty przelicznik; zmiana ustawienia nie przelicza historii.
- W kroku „Zmierz” od razu dostępne są dwie niezależne możliwości: ręczne wpisanie długości w m/cm albo pomiar krokomierzem Start/Stop. Ręczne wpisanie nie wymaga uruchomienia ani wcześniejszego użycia krokomierza i pozwala bezpośrednio przejść do zapisania punktu. Ręcznie wpisana długość zastępuje ewentualny wynik z kroków. Źródło użytej wartości musi być jednoznaczne.
- Zapis boku wymaga kierunku oraz dodatniej, skończonej długości. Geometria nadal liczy w metrach.

## Szkic na żywo

Szkic jest stale widoczny na dole ekranu.

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

Użytkownik wybrał pierwszy wariant: **Prowadzenie krok po kroku**. Formularz aktualnego etapu ma pierwszeństwo w układzie, a szkic pozostaje poniżej.

**Uwaga do realizacji:** dolne przyciski nawigacji i zatwierdzania muszą zawsze znajdować się poza przewijaną treścią, przyklejone do dołu ekranu. Przewija się zawartość powyżej stałego paska akcji. Treść nie może być zasłaniana przez pasek; trzeba uwzględnić dolny obszar systemowy oraz klawiaturę ekranową, tak aby działania pozostały dostępne podczas edycji pól.

## Dalsze projektowanie

Przebieg pomiaru i pierwszy wariant makiety (Prowadzenie krok po kroku) zostały zaakceptowane. Szczegółowy układ należy dopracować zgodnie z uwagą o stałym dolnym pasku akcji. Użytkownik docelowy, ostateczny zakres pierwszej wersji i wstępny model zarabiania pozostają do opracowania. Ustalenie nie obejmuje DXF, solvera ani migracji SDK.
