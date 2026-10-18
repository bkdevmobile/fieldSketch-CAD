# Prototyp FieldSketch CAD

Wersja aplikacji 0.1.0. Pierwszy przyrost łączy walidację kierunku P0 z prostym obrysem. Nie realizuje całego P1 z dokumentacji koncepcyjnej.

## Instalacja

Plik wynikowy po kompilacji: `artifacts/FieldSketch-CAD-0.1.0.apk` w katalogu repozytorium. Przenieś go na telefon i otwórz, zezwalając na instalację z wybranego źródła. Alternatywnie użyj komputera z podłączonym telefonem i włączonym debugowaniem USB:

```powershell
adb install -r artifacts/FieldSketch-CAD-0.1.0.apk
```

APK jest samodzielny, zawiera JavaScript i nie łączy się z Metro. Podpis deweloperski służy testom. Wersja obejmuje arm64-v8a i x86_64, minimum Android 7. Aktualizacja z tym samym podpisem zachowuje dane. Odinstalowanie usuwa lokalne projekty i logi; kopia systemowa jest wyłączona.

## Pierwszy pomiar

1. Utwórz nazwany projekt. Wybierz tryb magnetyczny, względny lub ręczny.
2. Rozpocznij sesję pomiarową. Od tego momentu aplikacja zapisuje logi lokalnie.
3. Udostępnij kamerę, stań nad początkiem boku i wyceluj w następny punkt. Trzymaj telefon nieruchomo przez około 2 sekundy, następnie przechwyć kierunek. Kamera ma patrzeć wzdłuż boku, nie pionowo w ziemię.
4. Przejdź do celu, licząc pojedyncze kroki. Wpisz np. `10` albo `2,5`. Sprawdź przeliczenie przy 75 cm na krok i zatwierdź punkt.
5. Powtórz dla następnych boków. Obrys pokazuje punkty i długości; przyciski +/− zmieniają skalę, przeciągnięcie przesuwa widok, „Dopasuj” przywraca cały obiekt.
6. Możesz połączyć obrys z P1 bez pomiaru albo przechwycić kierunek i kroki ostatniego boku do P1 jako niezależny pomiar zamknięcia. Tylko drugi wariant dostarcza wektora błędu.
7. Zakończ sesję. Zatwierdzone pomiary są zapisane. Projekt można otworzyć po restarcie aplikacji.

W trybie ręcznym wpisujemy kąt od +X przeciwnie do ruchu wskazówek zegara: 0° w prawo, 90° w górę. Nie wymaga on kamery ani sensora. W projekcie rozpoczętym magnetycznie X odpowiada wschodowi, Y północy magnetycznej. Tryb względny ustala pierwszy bok jako +X. W każdej nowej sesji sensora, jeśli projekt zawiera już boki, trzeba odtworzyć odniesienie, celując od początku do końca wybranego istniejącego boku. Dotyczy to obu trybów sensorowych i zapobiega mieszaniu układów po zmianie trybu. Następnie wrócić do aktualnego stanowiska i przechwycić kolejny kierunek.

Przejście do tła kończy rejestrację i unieważnia niezapisane przechwycenie. Powrót wymaga nowej sesji; zatwierdzone boki pozostają. Cofanie usuwa bok z aktywnego obrysu, ale zachowuje źródłową obserwację. Zmiana długości kroku nie jest dostępna w tej wersji.

## Logi i kopiowanie

W ekranie „Logi pomiarowe” otwórz sesję. Przycisk „Kopiuj treść loga” umieszcza w schowku pełny mały log. Większy log jest dzielony na ponumerowane części na granicach rekordów. Skopiuj wszystkie części osobno albo udostępnij pełny JSONL/CSV. Polskie znaki i surowe wartości pozostają w treści.

Otwarcie aktywnego loga tworzy niezmienną migawkę. Aby dołączyć późniejsze próbki, otwórz ponownie sesję. Dane nie są automatycznie wysyłane. Usunięcie loga nie usuwa obrysu; usunięcie projektu usuwa również jego logi.

Log zawiera metadane telefonu, konfigurację, próbki rotation vector i macierze, czas monotoniczny, kierunek i pochylenie osi kamery, accuracy, rozrzut, kroki, przeliczenia, obserwacje boków, cofnięcia i niedomknięcie. Kontekst próby umożliwia wpisanie otoczenia i niezależnego pomiaru odniesienia. Sam rozrzut lub accuracy nie dowodzą rzeczywistej dokładności.

Próbki są zapisywane co sekundę, przy przechwyceniu i zakończeniu sesji. Nagłe zabicie procesu może utracić nieutrwalony ogon. Ponowne uruchomienie zachowuje pełne rekordy i oznacza sesję jako przerwaną. Limit logów to 100 MiB, ostrzeżenie przy 80 MiB; wcześniejsze sesje nie są automatycznie kasowane.

## Próba terenowa

- Zacznij od prostokąta o znanych wymiarach, np. 2 × 3 m. Zmierz boki i przekątne taśmą jako niezależne odniesienie.
- Zapisz w kontekście obiekt, operatora, otoczenie i wartości referencyjne. Oddzielnie porównaj kroki z taśmą i kierunek telefonu z odniesieniem.
- Wykonaj 10 wskazań jednego nieruchomego celu. Sprawdź powrót po pełnym obrocie i odczekaniu 30 oraz 120 sekund.
- Powtórz w otwartym terenie, przy ścianie i przy metalu lub samochodzie. Zachowaj osobną sesję dla każdej próby.
- Sprawdź niedomknięcie po rzeczywistym pomiarze powrotu. Skopiuj lub wyeksportuj logi do analizy.

## Budowanie i ograniczenia

W `app/` uruchom `npm ci`, `npm run typecheck`, `npm test`, następnie `npm run build:apk`. Skrypt wymaga Windows, Node 20.19.x, JDK, Android SDK 36 z NDK 27.1.12297006 i sieci przy pierwszym pobieraniu zależności. `ANDROID_HOME` można wskazać jawnie. Projekt natywny jest generowany; kod Kotlin jest w `app/modules/fieldsketch-orientation`.

Projekt używa Expo SDK 56 zgodnie z planem. Expo Doctor zgłasza znaną regresję pamięci Hermes V1 250829098.0.10, szczególnie z worklets/reanimated. Oficjalna poprawka wymaga migracji do SDK 57 i nowszego React Native. Pozostaje to ograniczeniem prototypu; nie deklarujemy przejścia wszystkich sprawdzeń Doctor. Źródło: [informacje Expo SDK 56](https://expo.dev/changelog/sdk-56).

Dokładność i obsługa konkretnych telefonów nie są potwierdzone kompilacją ani testem w emulatorze. Prototyp nie zawiera DXF, solvera, przekątnych kontrolnych, kalibracji kroków ani pełnego edytora.


## Wyniki weryfikacji tej wersji

- 29 testów TypeScript: kroki, geometria, logi oraz rzeczywista baza SQLite przez sql.js. Wszystkie przeszły.
- 5 testów Kotlin: oś tylnej kamery, średnia kołowa i stabilizacja oraz zachowanie granic rekordów, bajtów UTF-8 i błędnych logów. Wszystkie przeszły.
- TypeScript bez błędów, kompilacja release i Android lintVital zakończone sukcesem. Podpis APK zweryfikowany apksigner; potwierdzono osadzony `assets/index.android.bundle` oraz arm64-v8a i x86_64.
- Emulator Pixel 8 API 36: utworzenie projektu, zgoda na kamerę, podgląd, próbki sensora, przechwycenie kierunku i 2,5 kroku = 187,5 cm.
- Zachowanie punktów po wymuszonym zamknięciu procesu, odtworzenie przerwanej sesji oraz zachowanie projektu po aktualizacji APK.
- Praca w trybie samolotowym: ręczne kąty, kolejne boki, niezależny pomiar zamknięcia, pole, obwód i widok obrysu.
- Duży log około 1,54 MiB otwarty w 13 częściach, przełączanie części, kopiowanie do schowka z potwierdzeniem oraz utworzenie pełnego CSV i systemowy ekran udostępniania. Żaden plik nie został wysłany do innej osoby lub usługi.
- Expo Doctor: 21 z 22 sprawdzeń; pozostało opisane wyżej ostrzeżenie Hermes. Brak walidacji dokładności na fizycznym telefonie.

Plik instalacyjny ma rozmiar około 80 MiB. Jest przeznaczony do testów prototypu. Zrzuty ekranów i raporty kompilacji w `artifacts/` są materiałami kontroli lokalnej; nie są wymagane do instalacji.
