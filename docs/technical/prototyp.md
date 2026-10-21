# Instrukcja MVP outlineGo

Free pozwala zapisać do 3 szkiców i zmierzyć do 8 punktów (z P1). Usunięcie szkicu zwalnia miejsce. Przy P8 dostępne są korekta, podsumowanie i zakończenie z automatycznym zamknięciem lub pozostawieniem obrysu otwartego. Istniejące większe szkice pozostają dostępne. PNG ma znak wodny pod rysunkiem, DXF wymaga Plus. Kod obsługuje zakup jednorazowy i przywracanie przez Google Play, z ceną pobieraną ze sklepu (docelowo 29,99 zł w Polsce). Produkt i klucz licencyjny są skonfigurowane; testy transakcji i potwierdzenie aktywacji pozostają otwarte. Nowy pakiet `com.bk.dev.mobile.outlinego` jest osobną instalacją. Szczegóły: [Free/Plus](free-plus.md), [konfiguracja zakupów](zakupy-google-play.md).

Aktualny układ pomiaru: instrukcja P1 bez miniatury; jej róg jest zapamiętywany globalnie (domyślnie prawy dolny). Celownik i formularz długości są przed pomocą; status pod kamerą nie przesuwa celownika. Domyślna metoda długości to krokomierz, potem ostatni jawny wybór użytkownika; istniejący formularz zachowuje swoje dane. Pierwsza zgoda na krokomierz jest przed uruchomieniem sesji kierunku. Szczegóły: [opis](pierwszy-pomiar.md).

Stan na 21 października 2026: aplikacja 0.1.0, versionCode 2, pakiet `com.bk.dev.mobile.outlinego`. APK release zainstalowany na Redmi; nowa poprawka widoku DXF jest na razie w źródłach. [Stan, logi i historia](../../MEMO.md). Solver sieci pozostaje poza bieżącym zakresem.

Aktualna weryfikacja źródeł: TypeScript i 163 testy TS (20 zestawów) przeszły. Moduł płatności ma 11 zaliczonych testów Kotlin; 7 testów orientacji przy ostatnim budowaniu było UP-TO-DATE. Podpisany APK 0.1.0 (versionCode 2) z zakupami i kluczem licencyjnym zainstalowano i uruchomiono na Redmi bez błędów ReactNativeJS/AndroidRuntime. Ten APK i AAB powstały przed ostatnią poprawką początkowego widoku DXF; poprawka jest w źródłach i wymaga nowego budowania. Testy transakcji Google Play, początkowego widoku w GUI CAD i fizycznego ponownego pomiaru sensorami pozostają otwarte. Historię, hashe i logi zawiera MEMO.md.

## Instalacja i aktualizacja

Plik: `artifacts/outlineGo-0.1.0.apk` w repozytorium. Przenieś go na telefon i otwórz, zezwalając na instalację z wybranego źródła, albo użyj komputera z debugowaniem USB. Dla jedynego podłączonego fizycznego telefonu:

```powershell
adb -d install -r artifacts/outlineGo-0.1.0.apk
adb -d shell am start -n com.bk.dev.mobile.outlinego/.MainActivity
```

APK zawiera JavaScript i działa bez Metro oraz internetu. Podpis jest deweloperski, do testów; architektury arm64-v8a i x86_64, minimum Android 7. Aktualizacja z tym samym podpisem zachowuje dane. Odinstalowanie usuwa lokalne projekty i logi; kopia systemowa jest wyłączona. Rozmiar i hash aktualnego pliku są w [MEMO](../../MEMO.md).

## Strona główna i ustawienia

Wybierz „Nowy szkic”, wpisz nazwę i wybierz „Utwórz szkic”. Free pozwala zapisać do 3 szkiców; usunięcie zwalnia miejsce. Lista początkowo pokazuje 3 pozycje: nazwę, datę i menu ⋮. Menu wiersza zawiera „Otwórz”, „Przypnij szkic” / „Odepnij szkic” i „Usuń”; usunięcie wymaga potwierdzenia. Przypięte szkice są pierwsze, a wewnątrz obu grup obowiązuje data ostatniej zmiany. Dotknięcie wiersza otwiera szkic. „Więcej” pokazuje po 10 kolejnych pozycji.

Menu ⋮ po prawej stronie nagłówka zawiera „Ustawienia”, „Logi pomiarowe” i ofertę „outlineGo Plus”. W ustawieniach wybieramy:

- Język: systemowy (z angielskim jako rezerwowym) albo PL/EN/DE/ES/FR; wybór jest zapamiętywany.
- Domyślną jednostkę m/cm i długość jednego kroku, początkowo 75 cm. Historyczne pomiary i przywrócony formularz zachowują użyty przelicznik.
- Globalny tryb kierunku: względny (domyślnie), magnetyczny lub ręczny. Obowiązuje we wszystkich projektach przy następnych pomiarach. Zmiana zatrzymuje aktywną sesję i wymaga ponownego przechwycenia kierunku, a w trybie sensorowym także odtworzenia odniesienia na znanym boku. Zapisana geometria i wpisana długość nie są zmieniane. Gdy wybrany sensor jest niedostępny, aplikacja używa trybu ręcznego.
- Przyciąganie pola kąta: 90° (domyślnie), 10°, 5° lub wyłączone. Przy zatwierdzeniu pola zaokrągla tylko blisko celu: do 2° dla 90°/10°, do 1° dla 5°. Suwak ma niezależny skok i zaokrąglanie do pełnych 5°.

Prowadzenie pierwszego pomiaru obejmuje ilustrację, automatyczny start sesji, blokadę niegotowego odczytu i podpowiedź po dotknięciu celownika. Testy zamknięte wcześniejszego MVP zakończono decyzją użytkownika 20 października 2026. Nowe funkcje z 21 października wymagają odrębnej próby fizycznej. [Opis prowadzenia](pierwszy-pomiar.md).

## Pomiar krok po kroku

1. Stań w początku obrysu i wybierz „Stoję w narożniku · zapisz P1”. Pierwszy bok wyznacza kierunek 0° szkicu.
2. Wskaż kierunek do następnego narożnika. W trybie sensorowym udostępnij kamerę i celuj tylną kamerą wzdłuż boku, nie pionowo w ziemię. Trzymaj telefon nieruchomo przez około 2 sekundy. Sesja uruchamia się automatycznie. Po zielonym statusie i wycelowaniu w narożnik wybierz „Zapisz kierunek do narożnika”.
3. Ogólny status pokazuje stabilizowanie, gotowość lub problem. Przy dobrej jakości i gotowym oknie status jest zielony. Na ekranie pomiaru nie ma przycisku szczegółów ani parametrów liczbowych. Zielony status potwierdza gotowość odczytu, nie dokładność rzeczywistego kierunku. Niegotowy odczyt blokuje zapis kierunku. Jeśli jakość spadnie w chwili zapisu, ponów celowanie.
4. Przechwycony kierunek jest zamrożony. „Popraw kąt” rozwija rząd `[L] [kąt] [P]`, a pod nim suwak ±15°. L/P oznaczają skręt od poprzedniego boku, 0–180°; wybrany kierunek jest zielony. Suwak działa co 5° i zaokrągla wynikowy skręt do pełnych 5°. Pole pozwala wpisać dokładniejszy kąt, z uwzględnieniem ustawienia przyciągania. W trybie ręcznym pole i L/P są widoczne od razu; kierunek zatwierdza „Ustaw kierunek”. Pierwszy bok pozostaje 0°.
5. Wybierz „Kierunek gotowy · podaj długość”. „Wpisz długość” pozwala od razu podać m/cm bez uruchamiania krokomierza. Klikalna jednostka pod polem zmienia m/cm i przelicza wpisaną wartość, zachowując fizyczną długość. Pola obsługują polski przecinek.
6. Alternatywnie wybierz „Krokomierz”. Kontrolki są w rzędzie `[−] [liczba kroków] [+] [Start/Stop]`. Start rozpoczyna od zera, przejdź do celu i wybierz Stop w tym samym miejscu. Podczas liczenia pole i ±1 są zablokowane. Po Stop można poprawić liczbę kroków; surowa wykryta liczba pozostaje w historii. Gdy brak detektora lub zgody, nadal można podać kroki ręcznie, także ułamkowe. Długość kroku jest ustawiana globalnie; nie ma jej pola w ekranie pomiaru.
7. „Sprawdź bok” otwiera podsumowanie robocze. Sprawdź skręt, długość i źródło. „Zapisz punkt” dopiero zatwierdza bok i punkt końcowy. Powtarzaj od wskazania kierunku. „Wstecz” zachowuje wpisy.

Na Androidzie 10+ zgoda na rozpoznawanie aktywności jest uzyskiwana przed uruchomieniem sesji kierunku, także przy wznowieniu bez wcześniejszej zgody. Odmowa wybiera ręczne podanie długości. Start krokomierza sprawdza zgodę i nie otwiera ponownie okna uprawnień. Kamera nie jest potrzebna w trybie ręcznym. Dane pomiarowe i logi pozostają na telefonie.

## Precyzja wymiarów

Kąt z aparatu jest zaokrąglany do pełnego stopnia. Ręcznie można wpisać maksymalnie 2 cyfry po przecinku. Długości obliczane i wpisywane ręcznie mają maksymalnie 3 miejsca w wybranej jednostce m/cm; dotyczy także korekt i opisów w eksportach. Zmiana jednostki zaokrągla roboczą wartość do 3 miejsc. Samo otwarcie starego szkicu nie przelicza jego danych. [Zasady i przykłady](precyzja-wymiarow.md).

## Szkic, korekty i wznowienie

Po zapisaniu P1 szkic jest pływającą miniaturą, domyślnie w prawym dolnym rogu, nad stałymi dolnymi akcjami. Można ją przeciągnąć do innego rogu. Dotknij, aby otworzyć wyśrodkowany dialog na pełną szerokość. Przesuwaj szkic jednym palcem w dowolnym kierunku; rozsuwaj dwa palce, aby powiększyć, i zbliżaj, aby pomniejszyć. Dostępne są także przyciski ± i „Dopasuj”. Powrót nie zmienia etapu. Miniatura zmniejsza się przy klawiaturze; formularz można przewinąć ponad nią.

Duży podgląd obsługuje przesuwanie jednym palcem w obu osiach oraz pinch dwoma palcami. Zoom jest ograniczony do 50–800% widoku dopasowanego (100%). Poziomy: 50, 75, 100, 150, 200, 300, 400, 600 i 800%. Podczas gestu skala płynnie śledzi palce; po puszczeniu przechodzi do najbliższego poziomu animacją 180 ms. Przyciski ± wybierają sąsiedni poziom z tą samą animacją i wyłączają się na granicach. Przyciąganie zachowuje punkt pod środkiem palców, o ile pozwalają ograniczenia przesuwania. „Dopasuj” przywraca widok całego rysunku i skalę 100%.

Granice przesuwania pozwalają skrajnej krawędzi szkicu dojść do środka podglądu w obu osiach. Dla małych, płaskich rysunków i pojedynczych punktów zachowujemy wcześniejszą swobodę ruchu. Rysunku nie można całkowicie odsunąć poza ekran; sprawdzenie obejmuje rzeczywiste odcinki, również ukośne.

Zapisane boki mają linię ciągłą, roboczy bok linię przerywaną i niezapisany punkt. Sam kierunek bez długości jest wektorem o umownej długości. Widok dopasowuje się po zatwierdzeniu kierunku, długości lub korekty oraz po Stop; podczas liczenia skala pozostaje stabilna.

Menu ⋮ w pomiarze zawiera „Wymiary i punkty”, pomoc, cofnięcie ostatniego boku/zamknięcia, ustawienia, diagnostykę oraz niezależny pomiar powrotu do P1, gdy roboczy pomiar jest kompletny i widoczne jest jego podsumowanie. Cofnięcie wymaga potwierdzenia odrzucenia bieżącego pomiaru. Zachowuje obserwację źródłową.

Po zamknięciu i ponownym otwarciu projektu przywracamy wpisy, lecz wracamy do kierunku. Przejście do tła zatrzymuje rejestrację i unieważnia robocze przechwycenie. W każdej nowej sesji sensorowej z istniejącymi bokami trzeba odtworzyć odniesienie: stań w początku wskazanego znanego boku, wyceluj w jego koniec i wybierz „Ustaw odniesienie”. Następnie wróć do aktualnego stanowiska i przechwyć kolejny kierunek. Dotyczy to obu trybów sensorowych i zapobiega mieszaniu układów po wznowieniu lub zmianie trybu.

## Notatka i poprawianie zapisanych boków

Rozwiń „Notatka do szkicu” w pomiarze albo podsumowaniu. Wpisz tekst i wybierz „Zapisz notatkę”; poczekaj na zakończenie zapisu przed zamknięciem aplikacji. Notatka jest przechowywana razem ze szkicem, a zapis zachowuje niedokończony formularz pomiaru. Pojawi się też w PNG i DXF.

„Wymiary i punkty” otwiera tabelę długości w jednostce z ustawień. Możesz poprawić kilka wymiarów, sprawdzić podgląd i zatwierdzić je jednym „Zapisz poprawki”. „Anuluj” odrzuca niezapisane zmiany. Funkcja działa podczas rysowania, po zakończeniu i po otwarciu zapisanego szkicu.

Wybierz wiersz punktu lub użyj „Poprzedni punkt” / „Następny punkt”, aby wybrać dochodzący do niego bok. Możesz poprawić kąt skrętu. P1 pozostaje początkiem układu, a pierwszy bok zachowuje kierunek odniesienia. Zmiana wcześniejszego boku przelicza dalsze punkty, zachowując ich długości i skręty. Oryginalne obserwacje pozostają w historii.

„Zmierz ten bok ponownie” otwiera kreator dla wybranego odcinka. Najpierw zapisz lub anuluj zmiany w tabeli. Stań przy wskazanym początku boku, odtwórz odniesienie zgodnie z instrukcją trybu sensorowego, zmierz kierunek i długość, sprawdź wynik i zapisz punkt. Kreator wróci do edytora z nową wartością. „Anuluj ponowny pomiar” zachowuje dotychczasową geometrię. Ponowny pomiar zastępuje bok i nie zwiększa liczby punktów, również w Free.

W zamkniętym szkicu pole długości wyliczonego boku do P1 pozwala dopasować ostatni narożnik przy zachowaniu długości poprzedniego boku. Jeśli długości nie pozwalają zamknąć obrysu, zapis zostanie zablokowany — popraw sąsiedni wymiar. [Pełne zasady korekt](edycja-szkicu.md).

## Zakończenie i PNG

„Zakończ” rozstrzyga niezapisany bok (Zapisz/Odrzuć/Wróć), a potem pozwala zamknąć obrys lub zostawić go otwartym. Zamknięcie dodaje wyliczone połączenie do P1 bez przesuwania punktów. Jest osobne od niezależnego pomiaru powrotnego; bez takiego pomiaru nie pokazujemy zerowego błędu zamknięcia.

W podsumowaniu dostępne są notatka, „Wymiary i punkty”, dotychczasowa korekta ostatniego boku i eksporty. PNG zawiera szkic, tabelę wymiarów i źródeł długości, notatkę, oznaczenia wartości szacunkowych oraz wyliczonego zamknięcia; w Free także znak wodny pod treścią. Opisy punktów są odsuwane od obrysu i innych etykiet. „DXF · Plus” pokazuje ofertę; rzeczywisty eksport wymaga potwierdzonego Plus. Skonfigurowany zakup lub przywrócenie odblokowuje DXF oraz PNG bez znaku wodnego dla istniejących szkiców. Generator DXF zachowuje obrys, numery punktów, długości i notatkę na osobnych warstwach; jednostka m/cm pochodzi z ustawień. JSONL/CSV służy diagnostyce.

PNG dopasowuje wysokość obrazu do proporcji szkicu i zawartości. Rysunek wykorzystuje dostępną szerokość z zachowaniem proporcji, a tabela i notatka znajdują się bezpośrednio pod nim. Płaski szkic nie dostaje zbędnej wysokiej planszy. [Układ i weryfikacja PNG](eksport-png.md).

## Diagnostyka i logi

Z menu pomiaru otwórz „Diagnostyka projektu” albo wejdź w Diagnostykę przez ustawienia. Ekran zawiera kontekst próby, niezależne odniesienie, logi i ręczne zatrzymanie sesji czujników. Dopisanie kontekstu wymaga aktywnej sesji danego projektu. Zatrzymanie oznacza konieczność ponownego przechwycenia kierunku po powrocie.

W „Logach pomiarowych” otwórz sesję. Mały log można skopiować w całości, duży ma ponumerowane części na granicach rekordów; skopiuj wszystkie albo udostępnij pełny JSONL/CSV. Migawka aktywnego loga nie zmienia się; aby uwzględnić późniejsze próbki, otwórz sesję ponownie. Usunięcie loga nie usuwa obrysu, a usunięcie projektu usuwa jego logi. Pliki nie są wysyłane automatycznie.

Log obejmuje metadane, surowe sensory i macierze, kierunek, jakość, rozrzut, kroki surowe i poprawione, przeliczniki, geometrię i operacje. Bufor jest utrwalany co sekundę, przy przechwyceniu i zakończeniu. Awaria może utracić nieutrwalony ogon; ponowne uruchomienie zachowuje pełne rekordy i oznacza przerwaną sesję. Limit to 100 MiB, ostrzeżenie przy 80 MiB, bez automatycznego kasowania starszych sesji.

## Próba terenowa i ograniczenia

Do wykonania na aktualnym buildzie outlineGo: [checklista z miejscem na wyniki i logi](checklista-proby-terenowej.md).

Użytkownik zaakceptował dokładność wykonanych prób trybu względnego oraz potwierdził poprawne liczenie kroków; dodatkowe zliczenia wiąże z ruchem telefonu. Ręczna korekta pozostaje dostępna.

Wznowienie domyślnie wskazuje ostatni zapisany bok. Po zapisie C w prostokącie ABCD należy stanąć w B i skierować kamerę na C (P2→P3), ustawić odniesienie, następnie wrócić do C i wskazać D. Przy wyborze innego boku należy wykonać odniesienie dokładnie między punktami pokazanymi w instrukcji.

Jeśli ostatni zmierzony bok już wrócił do P1, „Zamknij obrys” rozpoznaje wspólny koniec bez dodatkowego zerowego boku i fałszywego samoprzecięcia. Rozpoznanie dotyczy zbieżności numerycznej; aplikacja nie dociąga automatycznie rzeczywistego niedomknięcia.

- Sprawdź krokomierz dla znanej liczby kroków, szczególnie pierwszy i ostatni krok przy Start/Stop, ponowny Start, przejście do tła i różne sposoby trzymania telefonu. Zachowaj log oraz ręcznie policzoną wartość odniesienia.
- Wykonaj prostokąt o znanych wymiarach, np. 2 × 3 m. Porównaj boki i przekątne z taśmą, oddzielnie sprawdzając kierunek i szacowanie z kroków.
- Zapisz kontekst operatora i otoczenia. Powtórz nieruchomy cel, pełny obrót oraz próby przy ścianie i metalu. Porównaj rzeczywisty pomiar powrotu z wyliczonym zamknięciem.
- Sprawdź najnowszy układ na telefonie: kontrolki w rzędach, suwak 5°, Start/Stop, miniaturę, klawiaturę, zmianę globalnego trybu oraz PNG.

## Budowanie i potwierdzona weryfikacja

W `app/`: `npm ci`, `npm run typecheck`, `npm test`, `npm run build:apk`. Wymagane Windows, Node 20.19.x, JDK, Android SDK 36 i NDK 27.1.12297006; sieć przy pierwszym pobieraniu zależności. `ANDROID_HOME` można wskazać jawnie. Projekt Android jest generowany; źródła modułu Kotlin są w `app/modules/fieldsketch-orientation`.

Aktualna weryfikacja źródeł: TypeScript i 163 testy TS (20 zestawów) przeszły. Moduł płatności ma 11 zaliczonych testów Kotlin; 7 testów orientacji przy ostatnim budowaniu było UP-TO-DATE. Podpisany APK 0.1.0 (versionCode 2) z zakupami i kluczem licencyjnym zainstalowano i uruchomiono na Redmi bez błędów ReactNativeJS/AndroidRuntime. Ten APK i AAB powstały przed ostatnią poprawką początkowego widoku DXF; poprawka jest w źródłach i wymaga nowego budowania. Testy transakcji Google Play, początkowego widoku w GUI CAD i fizycznego ponownego pomiaru sensorami pozostają otwarte. Historię, hashe i logi zawiera MEMO.md.

Ostatni wcześniejszy wynik Expo Doctor: 21/22, ostrzeżenie dotyczące pamięci Hermes w SDK 56. Nie wykonano migracji SDK ani nowej kontroli Doctor przy tej aktualizacji dokumentacji. Kontekst wcześniejszego sprawdzenia: [informacje Expo SDK 56](https://expo.dev/changelog/sdk-56). Szczegóły artefaktu, historii i ograniczeń: [MEMO](../../MEMO.md).
