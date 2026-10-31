# V06 — Kamera i krokomierz

Aktualizacja 31.10.2026: użytkownik wybrał demonstrację w emulatorze z jawną w opisie symulacją odczytów. Powstał film PL/EN po 108 s, z rzeczywistym UI, wirtualnym obrazem kamery, symulowanymi kierunkami i krokami oraz rzeczywistą geometrią i PNG. [Gotowy zestaw, szczegóły symulacji i przywrócenie aplikacji](README.md). Poniższy scenariusz zachowuje pierwotny plan; sposób realizacji został już wybrany.

Priorytet po uwadze użytkownika z 30.10.2026: wcześniejsze filmy pokazują głównie ręczne wpisywanie kierunków i długości. Brakuje materiału prezentującego celowanie kamerą i automatyczne liczenie kroków, wskazanych przez użytkownika jako najciekawsze funkcje aplikacji. Ten film powinien być główną demonstracją pomiaru. Nie został jeszcze nagrany.

## Scenariusz do realizacji

Wersje PL i EN, spokojne tempo, nowa melodia. Roboczo 75–90 s, aby pozostawić czas na celowanie i przejście boku. W obrazie wyłącznie przydatne widzowi instrukcje, bez technicznych podpisów i dolnych napisów dublujących opis. Bez prywatnych plików i ścieżek komputera.

1. Stań w pierwszym narożniku i zapisz P1. Telefon trzymaj tak, aby tylna kamera wskazywała kolejny narożnik.
2. Pokaż rzeczywisty podgląd kamery z nieruchomym celownikiem, obrót telefonu i gotowość odczytu kierunku. Zapisz kierunek; nie wpisuj kąta ręcznie. Kamera jest celownikiem, a kierunek pochodzi z sensorów orientacji.
3. Wybierz Krokomierz. Pokaż używaną długość kroku w centymetrach. Stojąc w początku boku, naciśnij Start.
4. Pokaż przejście do wskazanego narożnika i automatycznie rosnącą liczbę kroków. Po zatrzymaniu naciśnij Stop. Nie zastępuj tego ręcznym wpisaniem liczby kroków.
5. Pokaż liczbę kroków i wynikowe oszacowanie długości, sprawdź bok i zapisz P2. Konkretne wartości wynikają z sesji, nie są z góry deklaracją pomiaru.
6. Pokaż kolejny kierunek wyznaczany celowaniem na następny narożnik, drugi bok i przyrost obrysu. Zakończ wynikiem szkicu lub oryginalnym PNG.

Kamera nie mierzy sama odległości ani nie wykonuje skanowania AR. Długość z kroków jest szacunkowa i zależy od ustawionej długości kroku. Nie przedstawiać wyniku jako pomiaru o profesjonalnej dokładności. Rzeczywisty zapis ekranów ma pokazać gotowość sensora, Start/Stop i automatyczny licznik, nie tylko ilustrację człowieka z telefonem.

## Ustalona dostępność materiałów

30.10.2026: ADB widzi tylko dedykowany `emulator-5556`. Lista jego sensorów zawiera sensory orientacji, lecz nie zawiera detektora kroków `android.sensor.step_detector`. Kod aplikacji wymaga Android `Sensor.TYPE_STEP_DETECTOR` do automatycznego liczenia i wyłącza Start przy braku tej funkcji. Kamera jest rzeczywistym `CameraView` na etapie kierunku w trybie sensorowym.

Źródła ustaleń: `app/src/app/project.tsx`, `app/src/infrastructure/usePedometer.ts`, `app/modules/fieldsketch-orientation/android/src/main/java/pl/fieldsketch/orientation/FieldSketchOrientationModule.kt`, lokalny odczyt `adb devices` i `dumpsys sensorservice`. W istniejących materiałach projektu nie znaleziono dodatkowego filmu z fizycznym marszem i automatycznym licznikiem.

## Sposób nagrania — do wyboru użytkownika

- Rzeczywisty telefon z obsługiwanymi sensorami: zapis ekranu podczas celowania i przejścia boku, opcjonalnie zewnętrzne ujęcie pokazujące ruch telefonu i marsz. Wtedy materiał dokumentuje rzeczywiste użycie funkcji.
- Demonstracja w emulatorze z symulowanymi odczytami: wymaga przygotowania osobnego mechanizmu testowego po wyborze użytkownika. Interfejs i logika przeliczania powinny pozostać rzeczywiste. Pochodzenie i symulację ujawnić w dokumentacji oraz opisie pod filmem, bez technicznych napisów w obrazie. Nie przedstawiać tego jako fizycznego pomiaru i nie podmieniać produkcyjnego APK bez przywrócenia.

Użytkownikowi przedstawiono wybór; nie rozpoczęto symulacji czujników ani zmian aplikacji. Odbiór i integracja istniejących filmów pozostają osobnymi pracami, a produkcja zestawu nie jest zamknięta, dopóki nie ma demonstracji kamery i krokomierza.
