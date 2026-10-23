# Instrukcja MVP outlineGo

Free pozwala zapisać do 3 szkiców i zmierzyć do 8 punktów (z P1). Usunięcie szkicu zwalnia miejsce. Przy P8 dostępne są korekta, podsumowanie i zakończenie z automatycznym zamknięciem lub pozostawieniem obrysu otwartego. Istniejące większe szkice pozostają dostępne. PNG ma znak wodny pod rysunkiem, DXF wymaga Plus. Kod obsługuje zakup jednorazowy i przywracanie przez Google Play, z ceną pobieraną ze sklepu (docelowo 29,99 zł w Polsce). Produkt i klucz licencyjny są skonfigurowane; testy transakcji i potwierdzenie aktywacji pozostają otwarte. Nowy pakiet `com.bk.dev.mobile.outlinego` jest osobną instalacją. Szczegóły: [Free/Plus](free-plus.md), [konfiguracja zakupów](zakupy-google-play.md).

Aktualny układ pomiaru: instrukcja P1 bez miniatury; jej róg jest zapamiętywany globalnie (domyślnie prawy dolny). Celownik i formularz długości są przed pomocą; status pod kamerą nie przesuwa celownika. Domyślna metoda długości to krokomierz, potem ostatni jawny wybór użytkownika; istniejący formularz zachowuje swoje dane. W trybie sensorowym pytanie o kamer? poprzedza przygotowanie zgody krokomierza i sesji kierunku. Szczegóły: [opis](pierwszy-pomiar.md).

Bieżący stan: **22 października 2026**, źródła 6f9a305, TypeScript i 183 testy / 24 zestawy. Ostatni APK UI nie zawiera Sentry i ekranu akceptacji. [Kod, paczki i pozostałe próby](../stan-projektu.md).

Bieżący stan: **22 października 2026**, źródła 6f9a305, TypeScript i 183 testy / 24 zestawy. Ostatni APK UI nie zawiera Sentry i ekranu akceptacji. [Kod, paczki i pozostałe próby](../stan-projektu.md).

## Instalacja i aktualizacja

Plik: `artifacts/outlineGo-0.1.0.apk` w repozytorium. Przenieś go na telefon i otwórz, zezwalając na instalację z wybranego źródła, albo użyj komputera z debugowaniem USB. Dla jedynego podłączonego fizycznego telefonu:

```powershell
adb -d install -r artifacts/outlineGo-0.1.0.apk
adb -d shell am start -n com.bk.dev.mobile.outlinego/.MainActivity
```

APK zawiera JavaScript i działa bez Metro; pomiary i zapis szkiców nie wymagają internetu. Ostatni APK ma zweryfikowany podpis release; architektury arm64-v8a i x86_64, minimum Android 7. Aktualizacja z tym samym podpisem zachowuje dane. Odinstalowanie usuwa lokalne projekty i logi; kopia systemowa jest wyłączona. Rozmiar i hash aktualnego pliku są w [MEMO](../../MEMO.md).

## Pierwsze uruchomienie

W źródłach nowego wydania przed wejściem do aplikacji jest ekran „Zanim zaczniesz”. Przeczytaj informacje o orientacyjnych pomiarach, otwórz regulamin i politykę prywatności, a następnie zaznacz „Akceptuję regulamin i rozumiem ograniczenia pomiarów”. „Kontynuuj” działa po zaznaczeniu pola i zapisaniu potwierdzenia na telefonie. Zmiana istotnej wersji treści wymaga ponownej akceptacji. Potwierdzenie nie oznacza zgody na diagnostykę. [Zasady](pierwsze-uruchomienie.md).

## Strona główna i ustawienia

Wybierz dolny przycisk „Nowy szkic”, pozostaw domyślne „Mój pomiar” z ewentualnym numerem albo wpisz nazwę i wybierz „Utwórz szkic”. Free pozwala zapisać do 3 szkiców; usunięcie zwalnia miejsce. Lista początkowo pokazuje 3 pozycje: nazwę, datę i menu ⋮. Menu wiersza zawiera „Otwórz”, „Przypnij szkic” / „Odepnij szkic” i „Usuń”; usunięcie wymaga potwierdzenia. Przypięte szkice są pierwsze, a wewnątrz obu grup obowiązuje data ostatniej zmiany. Dotknięcie wiersza otwiera podsumowanie szkicu. „Więcej” pokazuje po 10 kolejnych pozycji.

Menu ⋮ po prawej stronie nagłówka zawiera „Ustawienia” i ofertę „outlineGo Plus”. W ustawieniach wybieramy (zapis wraca do poprzedniego ekranu):

- Motyw: jasny, ciemny lub zgodny z systemem.
- Język: systemowy (z angielskim jako rezerwowym) albo PL/EN/DE/ES/FR; wybór jest zapamiętywany.
- Domyślną jednostkę m/cm/ft/in i długość jednego kroku, początkowo 75 cm. Historyczne pomiary i przywrócony formularz zachowują użyty przelicznik.
- Globalny tryb kierunku: względny (domyślnie), magnetyczny lub ręczny. Obowiązuje we wszystkich projektach przy następnych pomiarach. Zmiana zatrzymuje aktywną sesję i wymaga ponownego przechwycenia kierunku, a w trybie sensorowym także odtworzenia odniesienia na znanym boku. Zapisana geometria i wpisana długość nie są zmieniane. Gdy wybrany sensor jest niedostępny, aplikacja używa trybu ręcznego.
- Przyciąganie pola kąta: 90° (domyślnie), 10°, 5° lub wyłączone. Przy zatwierdzeniu pola zaokrągla tylko blisko celu: do 2° dla 90°/10°, do 1° dla 5°. Suwak ma niezależny skok i zaokrąglanie do pełnych 5°.

Prowadzenie pierwszego pomiaru obejmuje ilustrację, automatyczny start sesji, blokadę niegotowego odczytu i podpowiedź po dotknięciu celownika. Testy zamknięte wcześniejszego MVP zakończono decyzją użytkownika 20 października 2026. Nowe funkcje z 21 października wymagają odrębnej próby fizycznej. [Opis prowadzenia](pierwszy-pomiar.md).

## Pomiar krok po kroku

1. Stań w początku obrysu i wybierz „Stoję w narożniku · zapisz P1”. Pierwszy bok wyznacza kierunek 0° szkicu.
2. Wskaż kierunek do następnego narożnika. W trybie sensorowym udostępnij kamerę i celuj tylną kamerą wzdłuż boku, nie pionowo w ziemię. Trzymaj telefon nieruchomo przez około 2 sekundy. Sesja uruchamia się automatycznie. Po zielonym statusie i wycelowaniu w narożnik wybierz „Zapisz kierunek do narożnika”.
3. Ogólny status pokazuje stabilizowanie, gotowość lub problem. Przy dobrej jakości i gotowym oknie status jest zielony. Na ekranie pomiaru nie ma przycisku szczegółów ani parametrów liczbowych. Zielony status potwierdza gotowość odczytu, nie dokładność rzeczywistego kierunku. Niegotowy odczyt blokuje zapis kierunku. Jeśli jakość spadnie w chwili zapisu, ponów celowanie.
4. Przechwycony kierunek jest zamrożony. „Popraw kąt” rozwija rząd `[L] [kąt] [P]`, a pod nim suwak ±15°. L/P oznaczają skręt od poprzedniego boku, 0–180°; wybrany kierunek jest zielony. Suwak działa co 5° i zaokrągla wynikowy skręt do pełnych 5°. Pole pozwala wpisać dokładniejszy kąt, z uwzględnieniem ustawienia przyciągania. W trybie ręcznym pole i L/P są widoczne od razu; kierunek zatwierdza „Ustaw kierunek”. Pierwszy bok pozostaje 0°.
5. Wybierz „Kierunek gotowy · podaj długość”. „Wpisz długość” pozwala od razu podać m/cm/ft/in bez uruchamiania krokomierza. Klikalna jednostka pod polem zmienia jednostkę i przelicza wpisaną wartość, zachowując fizyczną długość. Pola obsługują polski przecinek.
6. Alternatywnie wybierz „Krokomierz”. Kontrolki mają dwa rzędy: `[−] [liczba kroków] [+]`, pod nim `[Start/Stop] [ikona kroków]`. Ikona pulsuje podczas liczenia. Start rozpoczyna od zera, przejdź do celu i wybierz Stop w tym samym miejscu. Podczas liczenia pole i ±1 są zablokowane. Po Stop można poprawić liczbę kroków; surowa wykryta liczba pozostaje w historii. Gdy brak detektora lub zgody, nadal można podać kroki ręcznie, także ułamkowe. Długość kroku jest ustawiana globalnie; nie ma jej pola w ekranie pomiaru.
7. „Sprawdź bok” otwiera podsumowanie robocze. Sprawdź skręt, długość i źródło. „Zapisz punkt” dopiero zatwierdza bok i punkt końcowy. Powtarzaj od wskazania kierunku. „Wstecz” zachowuje wpisy.

Na Androidzie 10+ zgoda na rozpoznawanie aktywności jest uzyskiwana przed uruchomieniem sesji kierunku, także przy wznowieniu bez wcześniejszej zgody. Odmowa wybiera ręczne podanie długości. Start krokomierza sprawdza zgodę i nie otwiera ponownie okna uprawnień. Kamera nie jest potrzebna w trybie ręcznym. Dane pomiarowe i logi pozostają na telefonie.

## Precyzja wymiarów

Kąt z aparatu jest zaokrąglany do pełnego stopnia. Ręcznie można wpisać maksymalnie 2 cyfry po przecinku. Długości obliczane i wpisywane ręcznie mają maksymalnie 3 miejsca w wybranej jednostce m/cm/ft/in; dotyczy także korekt i opisów w eksportach. Zmiana jednostki zaokrągla roboczą wartość do 3 miejsc. Samo otwarcie starego szkicu nie przelicza jego danych. [Zasady i przykłady](precyzja-wymiarow.md).

## Szkic, korekty i wznowienie

Po zapisaniu P1 szkic jest domyślnie zadokowany w prawej kolumnie 40% obok formularza. Można go oddokować jako miniaturę w zapamiętanym rogu i otworzyć na pełnym ekranie. Pełny ekran udostępnia dokowanie, lupy −/+ i ikonę dopasowania; zamknięcie zachowuje etap i dane. [Aktualny układ](ui-2026-10.md).

Duży podgląd obsługuje przesuwanie jednym palcem w obu osiach oraz pinch dwoma palcami. Zoom jest ograniczony do 50–800% widoku dopasowanego (100%). Poziomy: 50, 75, 100, 150, 200, 300, 400, 600 i 800%. Podczas gestu skala płynnie śledzi palce; po puszczeniu przechodzi do najbliższego poziomu animacją 180 ms. Przyciski ± wybierają sąsiedni poziom z tą samą animacją i wyłączają się na granicach. Przyciąganie zachowuje punkt pod środkiem palców, o ile pozwalają ograniczenia przesuwania. „Dopasuj” przywraca widok całego rysunku i skalę 100%.

Granice przesuwania pozwalają skrajnej krawędzi szkicu dojść do środka podglądu w obu osiach. Dla małych, płaskich rysunków i pojedynczych punktów zachowujemy wcześniejszą swobodę ruchu. Rysunku nie można całkowicie odsunąć poza ekran; sprawdzenie obejmuje rzeczywiste odcinki, również ukośne.

Zapisane boki mają linię ciągłą, roboczy bok linię przerywaną i niezapisany punkt. Sam kierunek bez długości jest wektorem o umownej długości. Widok dopasowuje się po zatwierdzeniu kierunku, długości lub korekty oraz po Stop; podczas liczenia skala pozostaje stabilna.

Menu ⋮ w pomiarze zawiera „Wymiary i punkty”, pomoc, cofnięcie ostatniego boku/zamknięcia, ustawienia oraz niezależny pomiar powrotu do P1, gdy roboczy pomiar jest kompletny i widoczne jest jego podsumowanie. Cofnięcie wymaga potwierdzenia odrzucenia bieżącego pomiaru. Zachowuje obserwację źródłową.

Po zamknięciu i ponownym otwarciu projektu przywracamy wpisy, lecz wracamy do kierunku. Przejście do tła zatrzymuje rejestrację i unieważnia robocze przechwycenie. W każdej nowej sesji sensorowej z istniejącymi bokami trzeba odtworzyć odniesienie: stań w początku wskazanego znanego boku, wyceluj w jego koniec i wybierz „Ustaw odniesienie”. Następnie wróć do aktualnego stanowiska i przechwyć kolejny kierunek. Dotyczy to obu trybów sensorowych i zapobiega mieszaniu układów po wznowieniu lub zmianie trybu.

## Notatka i poprawianie zapisanych boków

Rozwiń „Notatka do szkicu” w pomiarze albo podsumowaniu. Wpisz tekst i wybierz „Zapisz notatkę”; poczekaj na zakończenie zapisu przed zamknięciem aplikacji. Notatka jest przechowywana razem ze szkicem, a zapis zachowuje niedokończony formularz pomiaru. Pojawi się też w PNG i DXF.

„Wymiary i punkty” otwiera tabelę długości w jednostce z ustawień. Możesz poprawić kilka wymiarów, sprawdzić podgląd i zatwierdzić je jednym „Zapisz poprawki”. „Anuluj” odrzuca niezapisane zmiany. Funkcja działa podczas rysowania, po zakończeniu i po otwarciu zapisanego szkicu.

Wybierz wiersz punktu lub użyj „Poprzedni punkt” / „Następny punkt”, aby wybrać dochodzący do niego bok. Możesz poprawić kąt skrętu. P1 pozostaje początkiem układu, a pierwszy bok zachowuje kierunek odniesienia. Zmiana wcześniejszego boku przelicza dalsze punkty, zachowując ich długości i skręty. Oryginalne obserwacje pozostają w historii.

„Zmierz ten bok ponownie” otwiera kreator dla wybranego odcinka. Najpierw zapisz lub anuluj zmiany w tabeli. Stań przy wskazanym początku boku, odtwórz odniesienie zgodnie z instrukcją trybu sensorowego, zmierz kierunek i długość, sprawdź wynik i zapisz punkt. Kreator wróci do edytora z nową wartością. „Anuluj ponowny pomiar” zachowuje dotychczasową geometrię. Ponowny pomiar zastępuje bok i nie zwiększa liczby punktów, również w Free.

W zamkniętym szkicu pole długości wyliczonego boku do P1 pozwala dopasować ostatni narożnik przy zachowaniu długości poprzedniego boku. Jeśli długości nie pozwalają zamknąć obrysu, zapis zostanie zablokowany — popraw sąsiedni wymiar. [Pełne zasady korekt](edycja-szkicu.md).

## Zakończenie i PNG

„Zakończ” rozstrzyga niezapisany bok (Zapisz/Odrzuć/Wróć), a potem pozwala zamknąć obrys lub zostawić go otwartym. Zamknięcie dodaje wyliczone połączenie do P1 bez przesuwania punktów. Jest osobne od niezależnego pomiaru powrotnego; bez takiego pomiaru nie pokazujemy zerowego błędu zamknięcia.

W podsumowaniu dostępne są notatka, „Wymiary i punkty”, dotychczasowa korekta ostatniego boku i eksporty. PNG zawiera szkic, tabelę wymiarów i źródeł długości, notatkę, oznaczenia wartości szacunkowych oraz wyliczonego zamknięcia; w Free także znak wodny pod treścią. Opisy punktów są odsuwane od obrysu i innych etykiet. „DXF · Plus” pokazuje ofertę; rzeczywisty eksport wymaga potwierdzonego Plus. Skonfigurowany zakup lub przywrócenie odblokowuje DXF oraz PNG bez znaku wodnego dla istniejących szkiców. Generator DXF zachowuje obrys, numery punktów, długości i notatkę na osobnych warstwach; jednostka m/cm/ft/in pochodzi z ustawień. Ekranów przeglądania i eksportu lokalnych logów nie ma w bieżącym UI.

PNG dopasowuje wysokość obrazu do proporcji szkicu i zawartości. Rysunek wykorzystuje dostępną szerokość z zachowaniem proporcji, a tabela i notatka znajdują się bezpośrednio pod nim. Płaski szkic nie dostaje zbędnej wysokiej planszy. [Układ i weryfikacja PNG](eksport-png.md).

## Dobrowolne raportowanie błędów

Sentry jest domyślnie wyłączone. Możesz włączyć je w Ustawienia → Raportowanie błędów i zapisać ustawienia albo zaakceptować osobne pytanie po pierwszym obsłużonym błędzie. „Włącz i wyślij” obejmuje ten i przyszłe raporty. „Nie wysyłaj” lub zamknięcie pytania zapamiętuje odmowę; decyzję można zmienić w ustawieniach. Bez zapisanej zgody nic nie jest wysyłane.

Raporty zawierają oczyszczone błędy JavaScript, bez treści szkiców i nagrań sesji. Nie przesyłają lokalnych logów pomiarowych. Natywne awarie nie są objęte tą integracją. Dokumenty prawne są stale dostępne w ustawieniach. Funkcje te są nowsze od ostatniego zainstalowanego APK. [Szczegóły i stan weryfikacji](sentry.md).

## Próba terenowa i ograniczenia

Do wykonania na aktualnym buildzie outlineGo: [checklista z miejscem na wyniki i logi](checklista-proby-terenowej.md).

Użytkownik zaakceptował dokładność wykonanych prób trybu względnego oraz potwierdził poprawne liczenie kroków; dodatkowe zliczenia wiąże z ruchem telefonu. Ręczna korekta pozostaje dostępna.

Wznowienie domyślnie wskazuje ostatni zapisany bok. Po zapisie C w prostokącie ABCD należy stanąć w B i skierować kamerę na C (P2→P3), ustawić odniesienie, następnie wrócić do C i wskazać D. Przy wyborze innego boku należy wykonać odniesienie dokładnie między punktami pokazanymi w instrukcji.

Jeśli ostatni zmierzony bok już wrócił do P1, „Zamknij obrys” rozpoznaje wspólny koniec bez dodatkowego zerowego boku i fałszywego samoprzecięcia. Rozpoznanie dotyczy zbieżności numerycznej; aplikacja nie dociąga automatycznie rzeczywistego niedomknięcia.

- Sprawdź krokomierz dla znanej liczby kroków, szczególnie pierwszy i ostatni krok przy Start/Stop, ponowny Start, przejście do tła i różne sposoby trzymania telefonu. Zapisz ręcznie policzoną wartość odniesienia i wynik aplikacji; bieżący UI nie udostępnia eksportu logów.
- Wykonaj prostokąt o znanych wymiarach, np. 2 × 3 m. Porównaj boki i przekątne z taśmą, oddzielnie sprawdzając kierunek i szacowanie z kroków.
- Zapisz kontekst operatora i otoczenia. Powtórz nieruchomy cel, pełny obrót oraz próby przy ścianie i metalu. Porównaj rzeczywisty pomiar powrotu z wyliczonym zamknięciem.
- Sprawdź najnowszy układ na telefonie: kontrolki w rzędach, suwak 5°, Start/Stop, miniaturę, klawiaturę, zmianę globalnego trybu oraz PNG.

## Budowanie i potwierdzona weryfikacja

W `app/`: `npm ci`, `npm run typecheck`, `npm test`, `npm run build:apk`. Wymagane Windows, Node zgodny z Expo SDK 56 (ostatnio 22.23.4), JDK i Android SDK/NDK zgodne z projektem generowanym przez Expo; sieć przy pierwszym pobieraniu zależności. `ANDROID_HOME` można wskazać jawnie. Projekt Android jest generowany; źródła modułu Kotlin są w `app/modules/fieldsketch-orientation`.

Bieżący stan: **22 października 2026**, źródła 6f9a305, TypeScript i 183 testy / 24 zestawy. Ostatni APK UI nie zawiera Sentry i ekranu akceptacji. [Kod, paczki i pozostałe próby](../stan-projektu.md).

Ostatni wcześniejszy wynik Expo Doctor: 21/22, ostrzeżenie dotyczące pamięci Hermes w SDK 56. Nie wykonano migracji SDK ani nowej kontroli Doctor przy tej aktualizacji dokumentacji. Kontekst wcześniejszego sprawdzenia: [informacje Expo SDK 56](https://expo.dev/changelog/sdk-56). Szczegóły artefaktu, historii i ograniczeń: [MEMO](../../MEMO.md).
