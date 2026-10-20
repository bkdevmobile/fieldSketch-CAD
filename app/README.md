# Aplikacja outlineGo

Aktualny kod: `b00dd74`. Krawędź szkicu może dojść do środka podglądu, przy ochronie przed całkowitym zniknięciem rysunku. Ta ostatnia korekta nie jest jeszcze w APK na telefonie (`256D426C…`); wymaga nowego buildu i instalacji. Po korekcie przeszły TypeScript i 10 testów podglądu.

Aktualizacja podglądu szkicu zainstalowana na telefonie 20 października 2026: ograniczone przesuwanie szkicu, zoom 50–800% widoku dopasowanego i poziomy 50/75/100/150/200/300/400/600/800%. Pinch płynnie śledzi palce, a po puszczeniu animuje przejście do najbliższego poziomu w 180 ms. Przyciski ± przełączają poziomy z tą samą animacją. TypeScript i 60 testów TS przeszły. Pełny build zakończył się sukcesem; APK zainstalowano przez `install -r` z zachowaniem danych i uruchomiono (`Success`, `Status: ok`, `LaunchState: COLD`). Kontrola dotykowa przez użytkownika pozostaje do wykonania.

Aktualizacja po próbie terenowej 20 października 2026, commit `6972028`: domyślne odniesienie na ostatnim zapisanym boku z instrukcją punktów, dopasowanie pierwszego wektora, pan w obu osiach i pinch w szkicu, poprawne zamknięcie obwodu wracającego do P1, szersze przyciski, komunikaty odczytu bez technicznego błędu Expo i nazewnictwo „szkic”. TypeScript i 56 testów TS przeszły. Użytkownik zaakceptował krokomierz; dodatkowe zliczenia wiąże z ruchem telefonu. Wynik i zakres ponownej próby: [checklista](../docs/technical/checklista-proby-terenowej.md). Pełny build i instalacja na emulatorze przeszły; poprawki zainstalowano 20 października 2026 na telefonie `a20fa219` przez `install -r` z zachowaniem danych (`Success`, uruchomienie `Status: ok`). Ponowna próba na telefonie, w tym gest dwoma palcami i wznowienie B→C, pozostaje do wykonania. Stan APK i instalacji: [MEMO](../MEMO.md).

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
- Projekty w prostych wierszach: nazwa, data ostatniej zmiany i menu ⋮ (Otwórz/Usuń). Dotknięcie wiersza otwiera projekt. Początkowo 3 najnowsze pozycje, „Więcej” pokazuje po 10 kolejnych.

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

Dostępne są podgląd i udostępnienie PNG, edycja ostatniego boku z zachowaniem historii oraz ustawienia jednostki i długości kroku. Krokomierz wymaga zgody na rozpoznawanie aktywności na Androidzie 10+; bez sensora lub zgody nadal można wpisać długość ręcznie. Brak DXF, solvera i rozbudowanego edytora w tej wersji. Expo Go nie obsługuje własnego modułu pomiarowego. Nowa sesja sensora przy istniejącym obrysie wymaga ponownego odniesienia na znanym boku.

[Instrukcja użytkowania i próby terenowej](../docs/technical/prototyp.md) opisuje procedurę i ograniczenia, w tym ostrzeżenie Expo Doctor o pamięci Hermes w SDK 56.

## Stan weryfikacji — 20 października 2026

Aktualizacja marki 20 października 2026: TypeScript, 47 testów TS, pełny release build i zadanie testów Kotlin przeszły. APK outlineGo zainstalowano na emulatorze z zachowaniem 5 projektów. Sprawdzono natywny splash, ikonę pod maską launchera, nazwę, nagłówki oraz logo w PNG. Ten sam APK zainstalowano 20 października 2026 na telefonie `23124RA7EO` (`a20fa219`) przez `install -r`, z zachowaniem danych; ADB potwierdził `Success` i uruchomienie `Status: ok`, `LaunchState: COLD`. Branding zapisano w commicie `3d28bd5` (`mvp_designed`). Aktualny plik i hash są w MEMO; poniższe akapity opisują wcześniejsze wydania.

Commit aplikacji: `91dd0fe`. TypeScript i 44 testy TS przeszły. Pełny skrypt budowania zakończył się sukcesem; zadanie 7 testów Kotlin było aktualne (`UP-TO-DATE`, zapisane wyniki bez błędów). APK zainstalowano przez `adb install -r` na telefonie `23124RA7EO`; ADB potwierdził uruchomienie. Emulator potwierdził listę 3 pozycji, „Więcej”, otwieranie z wiersza/menu oraz anulowanie usuwania. Fizycznej próby całego najnowszego UI jeszcze nie potwierdzono.

Następnie wdrożono wybrany styl Teren (`1a5acbe`). Ówczesny build obejmował pozostałe ekrany, rozwijane menu, własne dialogi oraz przeciąganie miniatury. TypeScript, 47 testów TS i pełny build przeszły. APK sprawdzono na emulatorze, a następnie zainstalowano 19 października 2026 na telefonie `23124RA7EO` przez `adb install -r`, zachowując dane. ADB potwierdził instalację i uruchomienie. Pełna próba nowego UI na telefonie pozostaje do wykonania. Hash i rozmiar aktualnego APK podaje MEMO.
