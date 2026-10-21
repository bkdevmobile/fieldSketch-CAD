# Precyzja kątów i długości

Decyzja użytkownika i wdrożenie: 21 października 2026.

| Wartość | Reguła |
| --- | --- |
| Kąt przechwycony przez aparat i sensory | Zaokrąglenie do pełnego stopnia przed użyciem w geometrii, np. 88,65° → 89° |
| Kąt wpisany ręcznie | Maksymalnie 2 cyfry po separatorze, np. 88,65° |
| Długość obliczona z kroków | Zaokrąglenie do maksymalnie 3 miejsc w aktualnej jednostce m lub cm |
| Długość wpisana ręcznie | Maksymalnie 3 cyfry po separatorze w aktualnej jednostce |
| Opisy długości w podglądzie, podsumowaniu, PNG i DXF | Maksymalnie 3 miejsca, bez dopisywania końcowych zer |

Pola akceptują przecinek i kropkę. Dalsze cyfry po limicie nie są przyjmowane do pola; dotyczy również wklejania. Pola kątów nadal wymagają zakresu 0–180°, a długości wartości dodatniej. Wynik obliczenia lub zmiany jednostki zaokrąglający się do zera jest odrzucany. Pole powierzchni pozostaje prezentowane z dotychczasową precyzją dwóch miejsc — ta zmiana dotyczy kątów i długości.

Przy zmianie m/cm wartość w jednostce docelowej jest zaokrąglana do 3 miejsc, np. 123,456 cm → 1,235 m. Takie przełączenie może zmienić długość roboczą o wynik zaokrąglenia. Ustawienie długości kroku i jego ręczna korekta również mają limit 3 miejsc w cm; liczba kroków jest osobną wielkością i zachowuje dotychczasowe zasady.

Zaokrąglony kąt sensorowy jest stosowany w geometrii nowego pomiaru. Surowy odczyt sensora, kierunek źródłowy, wykryte kroki i przelicznik pozostają w historii. Ręczne przyciąganie kąta i krok suwaka 5° działają jak wcześniej.

Otwarcie starego szkicu i zaokrąglenie pól do wyświetlenia nie zmienia zapisanej geometrii. Edytor zbiorczy stosuje wartości wyłącznie dla zmienionych pól i przenosi wpływ korekty na dalsze punkty. Sama korekta kąta zachowuje dokładną istniejącą długość oraz źródłowe dane kroków. Współrzędne i obliczenia geometryczne nie są masowo zaokrąglane; DXF zachowuje precyzję współrzędnych, a limit 3 miejsc dotyczy opisów długości.

## Weryfikacja

TypeScript i 144 testy TS przeszły, w tym zaokrąglenia graniczne (1,005 → 1,01 i 1,2345 → 1,235), ograniczanie ręcznych wpisów, całkowite kąty sensorowe, zachowanie surowego odczytu, przeliczenia kroków w m/cm, odrzucenie wyniku zerowego, zachowanie wcześniejszych długości przy korekcie kąta oraz opisy DXF bez zmiany współrzędnych. Po końcowej korekcie zachowania danych historycznych ponowiono 41 testów precyzji, edycji i pomiaru — przeszły.

Końcowy APK zbudowano w 57 s i zainstalowano na Redmi przez install -r z zachowaniem danych: Success, uruchomienie Status ok. Zawiera też poprawkę skakania listy. Fizyczna próba aparatu i pól na telefonie pozostaje do wykonania przez użytkownika; pełny hash i zapis instalacji są w [MEMO](../../MEMO.md).
