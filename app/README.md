# Aplikacja outlineGo

Stan na 21 października 2026: kod aplikacji `acf99a0`, wersja 0.1.0. TypeScript i 127 testów TS przeszły; APK zbudowano i sprawdzono na emulatorze, zachowując 10 szkiców. Najnowszy APK nie został zainstalowany na telefonie. Redmi ma wcześniejszy build DXF `9E8708ED…` z 20 października. Aktualny plik, pełny hash i historię wdrożeń opisuje [MEMO](../MEMO.md).

Wdrożono notatki (również w PNG/DXF), przypinanie, zbiorczą korektę długości i kątów, wybór boku do ponownego pomiaru oraz unikanie kolizji opisów. Edytor „Wymiary i punkty” jest dostępny w pomiarze i podsumowaniu. [Zasady korekt](../docs/technical/edycja-szkicu.md).

Interfejs PL/EN/DE/ES/FR, domyślnie język telefonu z angielskim jako rezerwowym. Free: 8 punktów / 3 szkice, PNG ze znakiem wodnym, DXF zablokowany. Zakup i przywracanie Plus (29,99 zł jednorazowo) pozostają do wdrożenia; obecny plan to Free. [Specyfikacja Free/Plus](../docs/technical/free-plus.md).

Prototyp Android w **React Native 0.85.3 + Expo SDK 56 + TypeScript**, z lokalnym modułem Kotlin. Wersje są przypięte w `package-lock.json`.

## Uruchomienie

W katalogu `app`, na Windows z Node 20.19.x, JDK i Android SDK 36:

```powershell
npm ci
npm run typecheck
npm test
npm run build:apk
```

Wynik: `../artifacts/outlineGo-0.1.0.apk`, z osadzonym JavaScript i podpisem deweloperskim do testów. APK obsługuje arm64-v8a i x86_64, Android 7 lub nowszy. Do pomiaru nie wymaga Metro ani internetu. Do pracy deweloperskiej: `npm run android`, potem `npm start`.

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

TypeScript i 127 testów TS przeszły. Pełny build: BUILD SUCCESSFUL in 10m 38s; zadanie testów Kotlin UP-TO-DATE. APK z kodu acf99a0 zainstalowano na emulatorze przez install -r z zachowaniem 10 szkiców. Potwierdzono przypięcie i notatkę po restarcie, korektę 200 → 250 cm oraz ręczny ponowny pomiar P1 → P2 do 300 cm z powrotem do edytora. Końcowy proces aplikacji bez wpisów logcat AndroidRuntime:E / ReactNativeJS:E. Obejrzano ekran edytora i trzy rendery PNG komponentu eksportu.

Najnowszego APK nie instalowano na telefonie. Ponowny pomiar z kierunkiem sensorowym i krokomierzem oraz nowy układ DXF wymagają odpowiednio próby fizycznej i kontroli w CAD. Wyniki wcześniejszych wdrożeń, hash i rozmiar APK są w [MEMO](../MEMO.md).
