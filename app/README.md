# Aplikacja outlineGo

Aktualizacja źródeł z 22 października 2026: przeniesiono ustalenia z preview UI — zadokowany podgląd szkicu 40%, overlay i pełny ekran, motywy, jednostki ft/in, numerowane domyślne nazwy oraz zmiany listy i pomiaru. Usunięto ekrany diagnostyki i logów z interfejsu. TypeScript i 168 testów (21 zestawów) przeszły, podobnie jak eksport bundla Android. Podpisany APK z tymi zmianami: `artifacts/outlineGo-0.1.0.apk`. AAB nie przebudowano. [Zakres i weryfikacja UI](../docs/technical/ui-2026-10.md).

Stan na 21 października 2026: aplikacja 0.1.0, versionCode 2. Aktualna weryfikacja źródeł: TypeScript i 163 testy TS (20 zestawów) przeszły. Moduł płatności ma 11 zaliczonych testów Kotlin; 7 testów orientacji przy ostatnim budowaniu było UP-TO-DATE. Podpisany APK 0.1.0 (versionCode 2) z zakupami i kluczem licencyjnym zainstalowano i uruchomiono na Redmi bez błędów ReactNativeJS/AndroidRuntime. Ten APK i AAB powstały przed ostatnią poprawką początkowego widoku DXF; poprawka jest w źródłach i wymaga nowego budowania. Testy transakcji Google Play, początkowego widoku w GUI CAD i fizycznego ponownego pomiaru sensorami pozostają otwarte. Historię, hashe i logi zawiera MEMO.md. [Artefakty i instalacje](../MEMO.md).

Wdrożono notatki (również w PNG/DXF), przypinanie, zbiorczą korektę długości i kątów, wybór boku do ponownego pomiaru oraz unikanie kolizji opisów. Edytor „Wymiary i punkty” jest dostępny w pomiarze i podsumowaniu. [Zasady korekt](../docs/technical/edycja-szkicu.md).

Interfejs PL/EN/DE/ES/FR, domyślnie język telefonu z angielskim jako rezerwowym. Free: 8 punktów / 3 szkice, PNG ze znakiem wodnym, DXF wymaga Plus. Zakup i przywracanie Plus za 29,99 zł jednorazowo są podłączone przez Google Play Billing 9.1.0, z weryfikacją podpisu i trwałym uprawnieniem offline. Pakiet: `com.bk.dev.mobile.outlinego`, produkt: `outlinego_plus`, opcja: `buy`, dostępność: Polska. Użytkownik potwierdził pierwsze wydanie w testach wewnętrznych i zapis produktu; publiczny klucz licencyjny jest osadzony. Do potwierdzenia pozostają aktywacja opcji, testerzy licencji i testy płatności/przywracania. Produkcji nie opublikowano. [Specyfikacja](../docs/technical/free-plus.md).

Prototyp Android w **React Native 0.85.3 + Expo SDK 56 + TypeScript**, z lokalnym modułem Kotlin. Wersje są przypięte w `package-lock.json`.

## Uruchomienie

W katalogu `app`, na Windows z Node 20.19.x, JDK i Android SDK 36:

```powershell
npm ci
npm run typecheck
npm test
npm run build:apk
```

Wynik: `../artifacts/outlineGo-0.1.0.apk`, z osadzonym JavaScript i podpisem release. Skrypty wymagają klucza `_private/outlinego-release.p12` i danych `_private/release-signing.json`; hasła są przekazywane przez środowisko. `npm run build:aab` tworzy podpisany AAB i wymaga publicznego klucza `_private/google-play-public-key.txt`. `_private` oraz artefakty są ignorowane przez Git. APK obsługuje arm64-v8a i x86_64, Android 7+. Pomiary działają bez Metro i internetu; zakup/przywracanie wymagają Google Play. [Instrukcja podpisu i Console](../docs/technical/zakupy-google-play.md).

## Marka i zasoby

Nazwa aplikacji: **outlineGo**. Użytkownik wybrał pierwszy wariant logo: otwarty obrys z trzema pierścieniami i jednym pełnym punktem. Geometria w `assets/brand/mark.json` jest wspólna dla komponentów SVG, eksportu PNG i zasobów startowych. `npm run assets:brand` odtwarza SVG/PNG przez przypięty developerski `sharp`; pełny build uruchamia generator automatycznie. Zasoby są zapisane w repozytorium, więc prebuild nie potrzebuje ignorowanych plansz koncepcyjnych.

Ikona: białe logo na leśnej zieleni, wariant tradycyjny, adaptacyjny i monochromatyczny. Splash natywny (`expo-splash-screen` 56.0.15): zielony znak na tle Teren; podczas inicjalizacji danych aplikacja pokazuje także nazwę i wskaźnik ładowania. Błąd inicjalizacji kończy widok startowy i jest prezentowany w aplikacji. Nie dodano minimalnego czasu wyświetlania. Logo występuje w nagłówkach, pomiarze, nowym projekcie i eksporcie PNG.

Dotychczasowy pakiet Android, slug, schemat linków, baza i pliki logów zachowują techniczne nazwy FieldSketch dla aktualizacji bez utraty danych. Nowe nazwy widoczne dla użytkownika i nowo tworzone PNG/CSV używają outlineGo.

## Dostępne funkcje

- Wybrany styl **Teren**: ciepłe jasne tło, leśna zieleń, łagodne panele i ikony Lucide. Pomiar ma nagłówek projektu i wskaźnik etapów, wyraźne pola liczbowe oraz lżejsze akcje drugorzędne. `lucide-react-native` jest przypięty w zależnościach; ikony korzystają z istniejącego `react-native-svg`.
- Pozostałe ekrany kontynuują Teren: osobny formularz nowego projektu, segmenty ustawień, podsumowanie ze zwijanymi współrzędnymi, korekta boku, PNG i oddzielny stan migawki loga. Menu są rozwijanymi listami przy przycisku. Potwierdzenia i komunikaty aplikacji korzystają ze wspólnego `DialogProvider`; zgody i udostępnianie pozostają systemowe.
- Miniatura szkicu jest przeciągana i przyciągana do najbliższego rogu obszaru nad dolną nawigacją. Dotknięcie otwiera wyśrodkowany pionowo dialog na pełną szerokość. Wstecz, tło i krzyżyk zamykają go bez utraty formularza; dostępność ma akcję przełączania rogu.

- Menu ⋮ po prawej stronie nagłówka strony głównej zawiera Ustawienia i Logi pomiarowe. Usunięto te przyciski spod listy projektów.
- Projekty w prostych wierszach: nazwa, data ostatniej zmiany i menu ⋮ (Otwórz/Przypnij lub Odepnij/Usuń). Przypięte szkice są pierwsze, wewnątrz obu grup kolejność ostatniej zmiany. Początkowo 3 pozycje, „Więcej” dodaje po 10.
- Notatka z osobnym zapisem w pomiarze i podsumowaniu; zapis metadanych zachowuje roboczy formularz.
- „Wymiary i punkty”: zbiorcza edycja długości, korekta kąta wybranego boku, nawigacja po punktach i ponowny pomiar przez kreator. Korekty zachowują historię i przeliczają dalsze punkty; działają także w zamkniętym szkicu i przy limicie Free.
- Opisy podglądu, PNG i DXF omijają boki, punkty i pozostałe etykiety. Notatka jest dołączana do eksportów.

- Projekty SQLite i automatyczny zapis zatwierdzonych boków.
- Tylna kamera i celownik; kierunek magnetyczny, względny lub ręczny.
- Wizard: pierwszy punkt → kierunek → korekta kąta → długość → zapis punktu. Nowe projekty domyślnie używają trybu względnego, jeśli jest dostępny.
- Długość wpisywana bezpośrednio w m/cm albo liczba kroków (także ułamkowa; domyślnie 1 krok = 75 cm, przelicznik w ustawieniach). Krokomierz Start/Stop korzysta z natywnego detektora kroków, jeśli telefon go udostępnia. Po próbie użytkownik potwierdził poprawne liczenie; dodatkowe zliczenia wiąże z ruchami telefonu. Ręczna korekta pozostaje dostępna.
- Zatrzymany kierunek, korekta skrętu lewo/prawo 0–180° oraz suwak ±15° odczytu sensorowego. Pierwszy bok wyznacza 0°.
- Suwak ma skok 5° i zaokrągla wynikowy kąt do pełnych 5°, również przy niepełnym odczycie czujnika. Pole liczbowe zachowuje możliwość dokładniejszego wpisu.
- Układ korekty kąta: `[L] [pole kąta] [P]`, poniżej suwak; wybrany kierunek zaznaczony na zielono. Ten sam rząd pola i przycisków w edycji ostatniego boku.
- Korekta czujnikowego kąta rozwijana przez „Popraw kąt”; tryb ręczny pokazuje pola od razu. Na ekranie pomiaru wyłącznie ogólny status odczytu, zielony przy gotowości i dobrej jakości; bez przycisku szczegółów i parametrów liczbowych.
- Bez „Więcej opcji” na ekranie pomiaru. Tryb kierunku jest globalny i wybierany w ustawieniach; jego zmiana zatrzymuje sesję i wymaga ponownego przechwycenia kierunku. Zapisane obserwacje zachowują wcześniejszy tryb. Jednostka przy polu pozwala przeliczyć bieżącą długość.
- Menu projektu ⋮ z cofaniem, pomiarem powrotu do P1, ustawieniami i osobnym ekranem diagnostyki. Długość kroku ustawiana globalnie, bez dodatkowego pola w formularzu pomiaru.
- Pływająca miniatura szkicu w rogu z powiększaniem; przyciski pozostają przyklejone do dołu poza przewijaną treścią. Roboczy wektor/bok i automatyczne dopasowanie po zatwierdzeniu zmian.
- Przyciąganie ręcznej korekty kąta ustawiane w ustawieniach: 90° (domyślnie), 10°, 5° lub wyłączone. Tolerancja 2° dla 90°/10°, 1° dla 5°; surowe odczyty pozostają bez zmian.
- Przyciski −/+ zmieniają liczbę kroków o jeden, z zachowaniem surowej liczby wykrytej przez telefon.
- Jeden rząd krokomierza: `[−] [liczba kroków] [+] [Start/Stop]`. Pole i ±1 są zablokowane podczas liczenia; Start/Stop jest zawsze po prawej stronie pola.
- Automatyczny zapis formularza w SQLite; po restarcie przywracamy dane i wymagamy ponownego przechwycenia kierunku.
- Obrys SVG, przesuwanie, zoom, cofnięcie ostatniego boku, pole i obwód.
- Osobne zamknięcie topologiczne i niezależny pomiar niedomknięcia.
- Trwałe logi JSONL, podgląd, kopiowanie częściami i eksport JSONL/CSV.

Dostępne są podgląd i udostępnienie PNG oraz eksport DXF wymagający Plus. Korekty zapisanych boków zachowują historię źródłową. Krokomierz wymaga zgody na rozpoznawanie aktywności na Androidzie 10+; bez sensora lub zgody można wpisać długość ręcznie. Nowa sesja sensorowa przy istniejących bokach wymaga odniesienia na znanym boku. Solver sieci, przekątne i rozbudowany edytor ograniczeń pozostają poza aktualnym zakresem. Expo Go nie obsługuje modułu natywnego.

[Instrukcja użytkowania i próby terenowej](../docs/technical/prototyp.md) opisuje procedurę i ograniczenia, w tym ostrzeżenie Expo Doctor o pamięci Hermes w SDK 56.

## Weryfikacja — 21 października 2026

Aktualna weryfikacja źródeł: TypeScript i 163 testy TS (20 zestawów) przeszły. Moduł płatności ma 11 zaliczonych testów Kotlin; 7 testów orientacji przy ostatnim budowaniu było UP-TO-DATE. Podpisany APK 0.1.0 (versionCode 2) z zakupami i kluczem licencyjnym zainstalowano i uruchomiono na Redmi bez błędów ReactNativeJS/AndroidRuntime. Ten APK i AAB powstały przed ostatnią poprawką początkowego widoku DXF; poprawka jest w źródłach i wymaga nowego budowania. Testy transakcji Google Play, początkowego widoku w GUI CAD i fizycznego ponownego pomiaru sensorami pozostają otwarte. Historię, hashe i logi zawiera MEMO.md.

Podpisany APK v2 zainstalowano na Redmi. Poprawka początkowego widoku DXF jest nowsza od tej paczki i wymaga kolejnego budowania. Testy płatności, ponownego pomiaru sensorami oraz początkowego widoku DXF w CAD pozostają otwarte. [Wyniki, hashe i rozmiary artefaktów](../MEMO.md).
