# Aplikacja FieldSketch CAD

Prototyp Android w **React Native 0.85.3 + Expo SDK 56 + TypeScript**, z lokalnym modułem Kotlin. Wersje są przypięte w `package-lock.json`.

## Uruchomienie

W katalogu `app`, na Windows z Node 20.19.x, JDK i Android SDK 36:

```powershell
npm ci
npm run typecheck
npm test
npm run build:apk
```

Wynik: `../artifacts/FieldSketch-CAD-0.1.0.apk`, z osadzonym JavaScript i podpisem deweloperskim do testów. APK obsługuje arm64-v8a i x86_64, Android 7 lub nowszy. Do pomiaru nie wymaga Metro ani internetu. Do pracy deweloperskiej: `npm run android`, potem `npm start`.

## Dostępne funkcje

- Menu ⋮ po prawej stronie nagłówka strony głównej zawiera Ustawienia i Logi pomiarowe. Usunięto te przyciski spod listy projektów.
- Projekty w prostych wierszach: nazwa, data ostatniej zmiany i menu ⋮ (Otwórz/Usuń). Dotknięcie wiersza otwiera projekt. Początkowo 3 najnowsze pozycje, „Więcej” pokazuje po 10 kolejnych.

- Projekty SQLite i automatyczny zapis zatwierdzonych boków.
- Tylna kamera i celownik; kierunek magnetyczny, względny lub ręczny.
- Wizard: pierwszy punkt → kierunek → korekta kąta → długość → zapis punktu. Nowe projekty domyślnie używają trybu względnego, jeśli jest dostępny.
- Długość wpisywana bezpośrednio w m/cm albo liczba kroków (także ułamkowa; domyślnie 1 krok = 75 cm, przelicznik w ustawieniach). Krokomierz Start/Stop korzysta z natywnego detektora kroków, jeśli telefon go udostępnia. Użytkownik zgłosił częste nadliczanie 1–2 kroków; przyczyna pozostaje do diagnozy.
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

Dostępne są podgląd i udostępnienie PNG, edycja ostatniego boku z zachowaniem historii oraz ustawienia jednostki i długości kroku. Krokomierz wymaga zgody na rozpoznawanie aktywności na Androidzie 10+; bez sensora lub zgody nadal można wpisać długość ręcznie. Brak DXF, solvera i rozbudowanego edytora w tej wersji. Expo Go nie obsługuje własnego modułu pomiarowego. Nowa sesja sensora przy istniejącym obrysie wymaga ponownego odniesienia na znanym boku.

[Instrukcja użytkowania i próby terenowej](../docs/technical/prototyp.md) opisuje procedurę i ograniczenia, w tym ostrzeżenie Expo Doctor o pamięci Hermes w SDK 56.

## Stan weryfikacji — 19 października 2026

Commit aplikacji: `91dd0fe`. TypeScript i 44 testy TS przeszły. Pełny skrypt budowania zakończył się sukcesem; zadanie 7 testów Kotlin było aktualne (`UP-TO-DATE`, zapisane wyniki bez błędów). APK zainstalowano przez `adb install -r` na telefonie `23124RA7EO`; ADB potwierdził uruchomienie. Emulator potwierdził listę 3 pozycji, „Więcej”, otwieranie z wiersza/menu oraz anulowanie usuwania. Fizycznej próby całego najnowszego UI jeszcze nie potwierdzono.
