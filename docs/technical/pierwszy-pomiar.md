# Pierwszy pomiar — prowadzenie użytkownika

Decyzja po uwagach użytkownika z testów zamkniętych, 20 października 2026. Testerzy przechodzili dalej przed wykonaniem czynności i próbowali przesuwać celownik palcem. Zmiana dotyczy zrozumiałości pomiaru; nie zmienia geometrii ani przelicznika kroków.

## Przebieg

1. Ekran pierwszego punktu pokazuje instrukcję z ilustracją telefonu: stań w narożniku, skieruj tylną kamerę na następny narożnik przez obrót telefonu, trzymaj nieruchomo, zapisz kierunek, a dopiero potem mierz długość. Główna akcja: „Stoję w narożniku · zapisz P1”. W trybie ręcznym instrukcja opisuje wpisanie skrętu i nie wymaga kamery.
2. Na etapie kierunku sesja uruchamia się automatycznie, gdy ekran jest aktywny, aplikacja na pierwszym planie i udzielono zgody na kamerę (tryb ręczny nie wymaga tej zgody). Po niepowodzeniu dostępne jest „Ponów przygotowanie odczytu”; brak automatycznej pętli ponowień. Stan początkowy i otwarta instrukcja nie rozpoczynają sesji.
3. Kamera z celownikiem jest pierwsza, a instrukcja obrotu telefonu, informacja o nieruchomym celowniku i przycisk pomocy są pod nią. Status odczytu ma krótsze komunikaty i zarezerwowane miejsce (min. 64); znajduje się pod kamerą, więc zmiana liczby linii nie przesuwa celownika. Dotknięcie lub próba przesunięcia po obrazie pokazuje tekst „Celuj telefonem — celownik się nie przesuwa” pod kamerą. Ruch palcem nie zmienia kierunku. Na etapie długości najpierw jest wybór metody i formularz, pod nimi instrukcja, także dla krokomierza.
4. Zielony status oznacza „Telefon stabilny — możesz zapisać kierunek”. Akcja „Zapisz kierunek do narożnika” jest dostępna tylko dla gotowego odczytu w bieżącej sesji: okno około 2 s, rzut poziomy ≥ 0,2, jakość ≥ 2/3 i rozrzut ≤ 3°. Gotowość nie potwierdza, że użytkownik wskazuje właściwy narożnik. Przy wznowieniu pozostaje osobny zapis odniesienia na znanym boku.
5. Po zapisie kierunku przycisk „Kierunek gotowy · podaj długość” prowadzi do niezależnego wpisania długości albo krokomierza. Krokomierz wyjaśnia kolejność Start → przejście do wskazanego narożnika → zatrzymanie → Stop. Podczas liczenia przejście do podsumowania jest zablokowane.
6. „Sprawdź bok” otwiera podsumowanie. Dopiero „Zapisz punkt” zatwierdza bok i końcowy punkt. Nie ma ogólnego przycisku „Dalej”.

Instrukcję można ponownie otworzyć przez „Jak wykonać pomiar?” na etapie kierunku lub w menu szkicu. Zamknięcie instrukcji zachowuje formularz. W razie ruchu lub spadku jakości między statusem a przechwyceniem odczyt nie jest przyjmowany — należy ponowić celowanie. Surowe dane i odrzucenie trafiają do logów. Status natywny uwzględnia najgorszy rzut i jakość całego okna, tak jak przechwycenie.

## Próba odbiorowa bez pomocy prowadzącego

- [ ] Nowa osoba rozumie, gdzie stanąć i że celuje przez obracanie telefonu.
- [ ] Próba przesunięcia celownika daje czytelną podpowiedź.
- [ ] Bez zgody na kamerę, przed gotowością oraz przy ruchu telefonu nie można zapisać kierunku. Tryb ręczny pozwala kontynuować bez kamery.
- [ ] Po zgodzie sesja startuje bez osobnego przycisku; błąd startu pozwala ponowić próbę.
- [ ] Podczas chodzenia użytkownik nie przechodzi do zapisu przed Stop.
- [ ] Tester zapisuje pierwszy i drugi bok bez ustnego wyjaśnienia. Odnotuj pomyłki i użycie pomocy.
- [ ] Wstecz, ponowne otwarcie instrukcji, tło/wznowienie i zmiana trybu nie gubią roboczej długości ani nie uruchamiają sesji w tle.

Potwierdzona weryfikacja i stan APK: [MEMO](../../MEMO.md). Lista nie stanowi potwierdzenia wykonania nowej próby z testerem.


Podczas próby na emulatorze wystąpił błąd NativeDatabase.prepareAsync / NullPointerException, który ustąpił po ponownym uruchomieniu aplikacji. Store otwiera teraz osobne połączenie przez `useNewConnection: true`, zachowując ten sam plik bazy. To zabezpieczenie przed starym uchwytem natywnym; nie potwierdzono jeszcze przyczyny błędu w tej aplikacji. Podobną sygnaturę i obejście opisuje [zgłoszenie Expo](https://github.com/expo/expo/issues/48999). Ponowne próby formularza i wznowienia są wymagane na urządzeniu.


## Doprecyzowanie po odbiorze instrukcji

Użytkownik zaakceptował pomoc. Na ekranie zapisu P1 z instrukcją miniatura jest ukryta, a treść nie rezerwuje miejsca na nakładkę. Od kroku kierunku miniatura jest widoczna: domyślnie w prawym dolnym rogu (przywrócono na życzenie użytkownika). Wybrany przez przeciągnięcie lub akcję dostępności róg zapisuje się globalnie w SQLite i przetrwa restart oraz zmianę szkicu. Zmiana domyślnej pozycji nie nadpisuje wcześniej zapisanego rogu.

Pierwsza metoda długości to krokomierz. Jawny wybór Wpisz długość/Krokomierz zapisuje się globalnie i jest używany w nowych pomiarach. Przywrócenie konkretnego formularza zachowuje jego zapisaną metodę i wartości. Preferencje są opcjonalnymi polami istniejących ustawień: sketchCorner oraz lengthInput; starsze dane otrzymują wartości domyślne bez migracji schematu. Zapis preferencji jest kolejkowany, aby wybory nie nadpisywały się wzajemnie.

Po próbie użytkownika zmieniono moment zgody ACTIVITY_RECOGNITION: na telefonie z detektorem kroków aplikacja pyta na początku pomiaru, przed uruchomieniem sesji kierunku (także przy wznowieniu szkicu). Czeka na zamknięcie okna Androida i powrót na pierwszy plan, dopiero potem uruchamia czujniki. Wcześniejsza zgoda nie otwiera okna; po odmowie aplikacja wybiera ręczną długość i nie ponawia monitu w tej samej instancji ekranu. Start krokomierza jedynie sprawdza uprawnienie; nie otwiera okna ani celowo nie restartuje sesji. Zgodę po odmowie można włączyć w ustawieniach aplikacji w telefonie. Zwykłe przejście do tła nadal zatrzymuje krokomierz i unieważnia roboczy odczyt. Po rzeczywistym restarcie czujników względnych odniesienie na znanym boku nadal jest wymagane; zapis pierwszego odczytu nie odtwarza nowego zera sensora.

Weryfikacja tej zmiany: TypeScript oraz 80 testów TS przeszły, w tym sprawdzenie pierwszej zgody, odmowy, wcześniejszej zgody, oczekiwania na wznowienie i braku monitu przy sprawdzaniu zgody na etapie długości. Wymagana próba na telefonie z detektorem: pierwsza zgoda → pierwszy bok → zapis punktu → kolejny kierunek bez dodatkowego odniesienia; osobno odmowa → ręczna długość. APK `30CB381F…` zbudowano i zainstalowano na Redmi 20 października 2026 z zachowaniem danych; instalacja Success, uruchomienie Status ok. Fizyczna próba zmian pozostaje otwarta.
