# Instrukcja MVP outlineGo

Stan na 20 października 2026: aplikacja 0.1.0, branding w `3d28bd5`, kolejne poprawki po próbie użytkownika opisane w MEMO. Numer commita, aktualny APK i stan instalacji podaje [MEMO](../../MEMO.md). Jest to pomocniczy szkic terenowy, z eksportem PNG; pełny edytor, DXF i solver pozostają poza tym MVP.

Stan kodu: `b00dd74` (ograniczenia przesuwania, animowany skokowy zoom i poluzowanie granic do środka podglądu). Telefon ma APK `E083C357…` z poluzowanymi granicami oraz skokowym zoomem; build i instalacja z zachowaniem danych zostały potwierdzone 20 października 2026. Ostatnia pełna kontrola: TypeScript i 60 testów TS; po poluzowaniu ponownie przeszły TypeScript oraz 10 testów podglądu. Po tej korekcie nie powtarzano wszystkich testów TS; pełny build zakończył się sukcesem, a testy Kotlin były aktualne (`UP-TO-DATE`).

## Instalacja i aktualizacja

Plik: `artifacts/outlineGo-0.1.0.apk` w repozytorium. Przenieś go na telefon i otwórz, zezwalając na instalację z wybranego źródła, albo użyj komputera z debugowaniem USB. Dla jedynego podłączonego fizycznego telefonu:

```powershell
adb -d install -r artifacts/outlineGo-0.1.0.apk
adb -d shell am start -n pl.fieldsketch.cad.prototype/.MainActivity
```

APK zawiera JavaScript i działa bez Metro oraz internetu. Podpis jest deweloperski, do testów; architektury arm64-v8a i x86_64, minimum Android 7. Aktualizacja z tym samym podpisem zachowuje dane. Odinstalowanie usuwa lokalne projekty i logi; kopia systemowa jest wyłączona. Rozmiar i hash aktualnego pliku są w [MEMO](../../MEMO.md).

## Strona główna i ustawienia

Wybierz „Nowy szkic”, wpisz nazwę i wybierz „Utwórz szkic”. Lista pokazuje 3 ostatnio zmienione szkice: w jednym wierszu nazwę, datę i menu ⋮. Dotknięcie nazwy lub daty otwiera szkic. Menu wiersza zawiera „Otwórz” i „Usuń”; usunięcie wymaga potwierdzenia. „Więcej” pokazuje po 10 kolejnych pozycji i znika po wyświetleniu wszystkich.

Menu ⋮ po prawej stronie nagłówka zawiera „Ustawienia” i „Logi pomiarowe”. W ustawieniach wybieramy:

- Domyślną jednostkę m/cm i długość jednego kroku, początkowo 75 cm. Historyczne pomiary i przywrócony formularz zachowują użyty przelicznik.
- Globalny tryb kierunku: względny (domyślnie), magnetyczny lub ręczny. Obowiązuje we wszystkich projektach przy następnych pomiarach. Zmiana zatrzymuje aktywną sesję i wymaga ponownego przechwycenia kierunku, a w trybie sensorowym także odtworzenia odniesienia na znanym boku. Zapisana geometria i wpisana długość nie są zmieniane. Gdy wybrany sensor jest niedostępny, aplikacja używa trybu ręcznego.
- Przyciąganie pola kąta: 90° (domyślnie), 10°, 5° lub wyłączone. Przy zatwierdzeniu pola zaokrągla tylko blisko celu: do 2° dla 90°/10°, do 1° dla 5°. Suwak ma niezależny skok i zaokrąglanie do pełnych 5°.

Po uwagach z testów zamkniętych dodano instrukcję z ilustracją, automatyczny start sesji, blokadę niegotowego odczytu i podpowiedź po dotknięciu celownika. Szczegóły i próba odbiorowa: [pierwszy pomiar](pierwszy-pomiar.md). Zmiana została sprawdzona na emulatorze oraz zainstalowana i uruchomiona na Redmi `a20fa219` 20 października 2026; próba użytkownika pozostaje do wykonania.

## Pomiar krok po kroku

1. Stań w początku obrysu i wybierz „Zapisz punkt P1”. Pierwszy bok wyznacza kierunek 0° szkicu.
2. Wskaż kierunek do następnego narożnika. W trybie sensorowym udostępnij kamerę i celuj tylną kamerą wzdłuż boku, nie pionowo w ziemię. Trzymaj telefon nieruchomo przez około 2 sekundy. Sesja uruchamia się automatycznie. Po zielonym statusie i wycelowaniu w narożnik wybierz „Zapisz kierunek do narożnika”.
3. Ogólny status pokazuje stabilizowanie, gotowość lub problem. Przy dobrej jakości i gotowym oknie status jest zielony. Na ekranie pomiaru nie ma przycisku szczegółów ani parametrów liczbowych. Zielony status potwierdza gotowość odczytu, nie dokładność rzeczywistego kierunku. Niegotowy odczyt blokuje zapis kierunku. Jeśli jakość spadnie w chwili zapisu, ponów celowanie.
4. Przechwycony kierunek jest zamrożony. „Popraw kąt” rozwija rząd `[L] [kąt] [P]`, a pod nim suwak ±15°. L/P oznaczają skręt od poprzedniego boku, 0–180°; wybrany kierunek jest zielony. Suwak działa co 5° i zaokrągla wynikowy skręt do pełnych 5°. Pole pozwala wpisać dokładniejszy kąt, z uwzględnieniem ustawienia przyciągania. W trybie ręcznym pole i L/P są widoczne od razu; kierunek zatwierdza „Ustaw kierunek”. Pierwszy bok pozostaje 0°.
5. Wybierz „Kierunek gotowy · podaj długość”. „Wpisz długość” pozwala od razu podać m/cm bez uruchamiania krokomierza. Klikalna jednostka pod polem zmienia m/cm i przelicza wpisaną wartość, zachowując fizyczną długość. Pola obsługują polski przecinek.
6. Alternatywnie wybierz „Krokomierz”. Kontrolki są w rzędzie `[−] [liczba kroków] [+] [Start/Stop]`. Start rozpoczyna od zera, przejdź do celu i wybierz Stop w tym samym miejscu. Podczas liczenia pole i ±1 są zablokowane. Po Stop można poprawić liczbę kroków; surowa wykryta liczba pozostaje w historii. Gdy brak detektora lub zgody, nadal można podać kroki ręcznie, także ułamkowe. Długość kroku jest ustawiana globalnie; nie ma jej pola w ekranie pomiaru.
7. „Sprawdź bok” otwiera podsumowanie robocze. Sprawdź skręt, długość i źródło. „Zapisz punkt” dopiero zatwierdza bok i punkt końcowy. Powtarzaj od wskazania kierunku. „Wstecz” zachowuje wpisy.

Android 10+ pyta o zgodę na rozpoznawanie aktywności przy uruchomieniu krokomierza. Kamera nie jest potrzebna w trybie ręcznym. Dane pomiarowe i logi pozostają na telefonie.

## Szkic, korekty i wznowienie

Szkic jest pływającą miniaturą w prawym dolnym rogu, nad stałymi dolnymi akcjami. Można ją przeciągnąć do innego rogu. Dotknij, aby otworzyć wyśrodkowany dialog na pełną szerokość. Przesuwaj szkic jednym palcem w dowolnym kierunku; rozsuwaj dwa palce, aby powiększyć, i zbliżaj, aby pomniejszyć. Dostępne są także przyciski ± i „Dopasuj”. Powrót nie zmienia etapu. Miniatura zmniejsza się przy klawiaturze; formularz można przewinąć ponad nią.

Duży podgląd obsługuje przesuwanie jednym palcem w obu osiach oraz pinch dwoma palcami. Zoom jest ograniczony do 50–800% widoku dopasowanego (100%). Poziomy: 50, 75, 100, 150, 200, 300, 400, 600 i 800%. Podczas gestu skala płynnie śledzi palce; po puszczeniu przechodzi do najbliższego poziomu animacją 180 ms. Przyciski ± wybierają sąsiedni poziom z tą samą animacją i wyłączają się na granicach. Przyciąganie zachowuje punkt pod środkiem palców, o ile pozwalają ograniczenia przesuwania. „Dopasuj” przywraca widok całego rysunku i skalę 100%.

Granice przesuwania pozwalają skrajnej krawędzi szkicu dojść do środka podglądu w obu osiach. Dla małych, płaskich rysunków i pojedynczych punktów zachowujemy wcześniejszą swobodę ruchu. Rysunku nie można całkowicie odsunąć poza ekran; sprawdzenie obejmuje rzeczywiste odcinki, również ukośne.

Zapisane boki mają linię ciągłą, roboczy bok linię przerywaną i niezapisany punkt. Sam kierunek bez długości jest wektorem o umownej długości. Widok dopasowuje się po zatwierdzeniu kierunku, długości lub korekty oraz po Stop; podczas liczenia skala pozostaje stabilna.

Menu ⋮ w pomiarze zawiera cofnięcie ostatniego boku/zamknięcia, ustawienia, diagnostykę oraz niezależny pomiar powrotu do P1, gdy roboczy pomiar jest kompletny i widoczne jest jego podsumowanie. Cofnięcie wymaga potwierdzenia odrzucenia bieżącego pomiaru. Zachowuje obserwację źródłową.

Po zamknięciu i ponownym otwarciu projektu przywracamy wpisy, lecz wracamy do kierunku. Przejście do tła zatrzymuje rejestrację i unieważnia robocze przechwycenie. W każdej nowej sesji sensorowej z istniejącymi bokami trzeba odtworzyć odniesienie: stań w początku wskazanego znanego boku, wyceluj w jego koniec i wybierz „Ustaw odniesienie”. Następnie wróć do aktualnego stanowiska i przechwyć kolejny kierunek. Dotyczy to obu trybów sensorowych i zapobiega mieszaniu układów po wznowieniu lub zmianie trybu.

## Zakończenie i PNG

„Zakończ” rozstrzyga niezapisany bok (Zapisz/Odrzuć/Wróć), a potem pozwala zamknąć obrys lub zostawić go otwartym. Zamknięcie dodaje wyliczone połączenie do P1 bez przesuwania punktów. Jest osobne od niezależnego pomiaru powrotnego; bez takiego pomiaru nie pokazujemy zerowego błędu zamknięcia.

W podsumowaniu można poprawić ostatni bok z zachowaniem historii, obejrzeć PNG i otworzyć systemowe udostępnianie. PNG zawiera szkic, wymiary, źródła długości i oznaczenie wartości szacunkowych oraz wyliczonego zamknięcia. DXF nie jest wymagany w tej wersji. Eksport JSONL/CSV służy diagnostyce.

## Diagnostyka i logi

Z menu pomiaru otwórz „Diagnostyka projektu” albo wejdź w Diagnostykę przez ustawienia. Ekran zawiera kontekst próby, niezależne odniesienie, logi i ręczne zatrzymanie sesji czujników. Dopisanie kontekstu wymaga aktywnej sesji danego projektu. Zatrzymanie oznacza konieczność ponownego przechwycenia kierunku po powrocie.

W „Logach pomiarowych” otwórz sesję. Mały log można skopiować w całości, duży ma ponumerowane części na granicach rekordów; skopiuj wszystkie albo udostępnij pełny JSONL/CSV. Migawka aktywnego loga nie zmienia się; aby uwzględnić późniejsze próbki, otwórz sesję ponownie. Usunięcie loga nie usuwa obrysu, a usunięcie projektu usuwa jego logi. Pliki nie są wysyłane automatycznie.

Log obejmuje metadane, surowe sensory i macierze, kierunek, jakość, rozrzut, kroki surowe i poprawione, przeliczniki, geometrię i operacje. Bufor jest utrwalany co sekundę, przy przechwyceniu i zakończeniu. Awaria może utracić nieutrwalony ogon; ponowne uruchomienie zachowuje pełne rekordy i oznacza przerwaną sesję. Limit to 100 MiB, ostrzeżenie przy 80 MiB, bez automatycznego kasowania starszych sesji.

## Próba terenowa i znany problem

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

Ostatnia pełna kontrola APK: TypeScript i 60 testów TS przeszły, pełny release build zakończył się sukcesem. Po ostatnim poluzowaniu granic przesuwania przeszły TypeScript oraz 10 testów podglądu; tę korektę następnie zbudowano i zainstalowano na telefonie. Zadanie 7 testów Kotlin było `UP-TO-DATE`, raporty bez błędów. Emulator potwierdził m.in. geometrię, zapis, wznowienie, PNG oraz nową listę 3/+10, otwarcie wiersza/menu i anulowanie usuwania. Nie ma detektora kroków. Telefon potwierdził instalację i uruchomienie; pełnej próby całego najnowszego UI jeszcze nie potwierdzono. Nie deklarujemy, że każdy nowy element był osobno sprawdzony wizualnie.

Ostatni wcześniejszy wynik Expo Doctor: 21/22, ostrzeżenie dotyczące pamięci Hermes w SDK 56. Nie wykonano migracji SDK ani nowej kontroli Doctor przy tej aktualizacji dokumentacji. Kontekst wcześniejszego sprawdzenia: [informacje Expo SDK 56](https://expo.dev/changelog/sdk-56). Szczegóły artefaktu, historii i ograniczeń: [MEMO](../../MEMO.md).
