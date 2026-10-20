# outlineGo — checklista próby terenowej

Przygotowana 20 października 2026 dla wersji 0.1.0, commit aplikacji `3d28bd5`. Testowany APK: SHA256 `F09DBCDC643CDC79944430B6879DCABF45ED182817C9376DED3DC5C3128D6F92`. Ścieżka `artifacts/outlineGo-0.1.0.apk` jest nadpisywana kolejnymi buildami; aktualny hash podaje MEMO. Dokładność dotychczasowych testów trybu względnego została zaakceptowana.

## Wynik zgłoszony przez użytkownika — 20 października 2026

Użytkownik potwierdził „checklista ok” i przekazał poniższe uwagi. Nie dostarczono wyników liczbowych serii K1–K8 ani plików logów; puste pola zachowano bez dopisywania wyników.

- Wznowienie prostokąta ABCD zgodnie z ruchem wskazówek zegara po zapisie C: odniesienie mierzone z B w stronę C dawało przesunięcie o 90° w lewo. Domyślnie aplikacja oczekiwała P1→P2; poprawka wybiera ostatni zapisany bok i podaje oba punkty w instrukcji.
- Krokomierz jest oceniony jako poprawny. Dodatkowe kroki użytkownik wiąże z poruszaniem telefonem; nie ma podstaw do automatycznego odejmowania kroków ani zmiany algorytmu w tej iteracji.
- Pierwszy wektor wykracza poza miniaturę; potrzebne dopasowanie po pojawieniu się podglądu.
- Powiększony szkic wymaga przesuwania i zmiany skali gestem.
- Zmierzenie całego obwodu z powrotem do P1, a potem „Zamknij obrys” daje fałszywe samoprzecięcie.
- Krótkie przyciski powinny mieć co najmniej kwadratowy rozmiar. Odrzucony odczyt przy ruchu/pionowym celowaniu powinien pokazywać instrukcję zamiast komunikatu `captureDirection has been rejected`.
- W interfejsie używamy nazwy „szkic” zamiast „projekt”.

Po instalacji poprawek powtórz przede wszystkim 2.5, 3.1–3.3 i 3.5–3.6 oraz sprawdź pełny powrót do P1, wygląd krótkich przycisków i odrzucony odczyt kierunku. Wznowienie: dla A=P1, B=P2, C=P3 domyślna instrukcja ma wskazać P2→P3; po kalibracji na BC i przejściu do C kierunek CD powinien dać skręt 90° w prawo.

Zaznacz pole po zaliczeniu. Dla niepowodzenia wpisz numer próby i opis w tabeli problemów. Próba pominięta pozostaje niezaznaczona z dopiskiem „pominięto” i powodem.

## Metryka

| Dane | Wpis testera |
| --- | --- |
| Data, operator | |
| Telefon / Android | 23124RA7EO / … |
| Nazwa projektu testowego | |
| Miejsce, podłoże, sposób trzymania telefonu | |
| Tryb / długość kroku | względny / … cm |
| Nazwy lub identyfikatory logów | |

## 1. Przygotowanie i start

- [ ] **1.1** Utwórz osobny projekt testowy; dotychczasowe projekty są nadal dostępne.
- [ ] **1.2** Sprawdź ikonę i nazwę outlineGo w launcherze. Zakończ proces aplikacji i uruchom ją ponownie: splash ma wybrane logo i przechodzi do strony głównej bez zawieszenia.
- [ ] **1.3** W ustawieniach wybierz tryb względny, jednostkę m i zapisz używaną długość kroku. Włącz tryb samolotowy na czas głównej próby.

## 2. Pełny pomiar i zapis

Wyznacz taśmą prostokąt, np. 2 × 3 m. W tej próbie wpisuj długości ręcznie, aby oddzielić działanie wizarda od krokomierza. Pierwszy bok 3 m, następne 2 m i 3 m; po trzech bokach zamknięcie powinno dodać bok 2 m.

- [ ] **2.1** Zapisz P1, przechwyć kierunek po zielonym statusie i wpisz 3 m bez uruchamiania krokomierza. Pierwszy bok ma kierunek 0°.
- [ ] **2.2** Przejdź do podsumowania roboczego, wróć do długości i ponownie przejdź dalej. Wpis pozostaje; bok zapisuje dopiero „Zapisz punkt”, jeden raz.
- [ ] **2.3** Dodaj kolejne dwa boki. Sprawdź `[L][kąt][P]`, suwak co 5° i zaokrąglenie do pełnych 5°. Dla kontrolnej geometrii ustaw skręty po 90° w tę samą stronę.
- [ ] **2.4** Zmień jednostkę przy polu: 2 m ↔ 200 cm; fizyczna długość pozostaje ta sama. Sprawdź też wpis z przecinkiem, np. 2,5 m, po czym przywróć planowaną długość.
- [ ] **2.5** Szkic pokazuje kierunek bez długości jako wektor, roboczy bok jako linię przerywaną, a zapisany jako ciągłą. Po zatwierdzeniu kierunku, długości i korekty dopasowuje widok.
- [ ] **2.6** Zakończ i zamknij obrys. Dla boków 3/2/3 m i dokładnych skrętów 90° wynik to obwód 10 m i pole 6 m². Zamykający bok jest opisany jako wyliczony; bez niezależnego pomiaru powrotnego nie pojawia się pozorny zerowy błąd zamknięcia.
- [ ] **2.7** Popraw ostatni zmierzony bok w podsumowaniu: szkic, wymiary i wynik przeliczają się. Przywróć wartość, jeśli chcesz zachować figurę kontrolną.
- [ ] **2.8** W osobnym krótkim projekcie zakończ z niezapisanym bokiem: sprawdź powrót, a następnie świadome odrzucenie i pozostawienie obrysu otwartego. Nie pojawia się dodatkowy zapisany bok ani pole powierzchni.

## 3. Wygoda i wznowienie

Po instalacji APK zawierającego `b00dd74` sprawdź dodatkowo:

- [ ] **3.2a** Przesuń szkic we wszystkie strony: krawędź może dojść do środka podglądu, ale cały rysunek nie znika. Sprawdź też linię ukośną, poziomą i mały szkic.
- [ ] **3.2b** Zmień skalę gestem i przyciskami ±: zakres 50–800%, poziomy 50/75/100/150/200/300/400/600/800%. Po puszczeniu palców następuje animowane dojście do poziomu (180 ms). Przyciski na granicach są wyłączone; „Dopasuj” wraca do 100% i pokazuje cały szkic. Nowy gest przerywa animację bez skoku.

- [ ] **3.1** Przeciągnij miniaturę do czterech rogów: przyciąga się i samo przeciągnięcie nie otwiera podglądu.
- [ ] **3.2** Dotknij miniatury: podgląd jest dialogiem na pełną szerokość, wyśrodkowanym w pionie. Sprawdź zoom, przesuwanie i dopasowanie. Zamknij przez Wstecz oraz ponownie przez krzyżyk; formularz zachowuje dane.
- [ ] **3.3** Otwórz klawiaturę w polu kąta i długości: pole można odsłonić, miniatura nie blokuje edycji, dolne akcje pozostają poza przewijaną treścią i są dostępne.
- [ ] **3.4** Menu strony głównej, wiersza projektu i pomiaru są małymi listami przy przycisku. Wstecz je zamyka. Anuluj usunięcie projektu we własnym dialogu: projekt pozostaje.
- [ ] **3.5** Zostaw roboczą długość, przejdź do tła, wróć, a następnie zakończ proces i ponownie otwórz projekt. Zapisane boki i robocze wpisy pozostają. Pomiar wraca do kierunku; przy istniejących bokach wymaga odtworzenia odniesienia na wskazanym znanym boku.
- [ ] **3.6** Wznów zgodnie z instrukcją odniesienia i dodaj bok. Kontynuacja nie obraca wcześniej zapisanej części szkicu.

## 4. Krokomierz — diagnoza +1/+2

Wykonaj po dwie serie 10, 20 i 50 kroków, licząc je samodzielnie. Start naciśnij stojąc, odczekaj 2 s, przejdź ustaloną liczbę kroków, zatrzymaj się i po 2 s naciśnij Stop. Zanotuj wynik **przed ręczną korektą**. Każdy Start rozpoczyna liczenie od zera. Zachowaj logi; nie odejmuj z góry stałej liczby kroków.

| Próba | Rzeczywiste kroki | Odczyt przed korektą | Różnica (odczyt − rzeczywiste) | Trzymanie / uwagi / log |
| --- | ---: | ---: | ---: | --- |
| K1 | 10 | | | |
| K2 | 10 | | | |
| K3 | 20 | | | |
| K4 | 20 | | | |
| K5 | 50 | | | |
| K6 | 50 | | | |
| K7: nieruchomo przez 10 s | 0 | | | |
| K8: zmiana chwytu bez chodzenia | 0 | | | |

- [ ] **4.1** Wykonano serie i zapisano surowe wyniki oraz logi. Jeśli nadliczanie wystąpi, opisz moment zmiany licznika: przy Start, marszu, zatrzymaniu, zmianie chwytu lub Stop.
- [ ] **4.2** Po Stop przyciski −/+ i pole poprawiają wynik oraz długość zgodnie z ustawionym krokiem. Podczas liczenia pole i −/+ są zablokowane.
- [ ] **4.3** Ponowny Start zeruje licznik. Przejście do tła zatrzymuje liczenie; po powrocie nie dopisuje kroków z tła do zakończonego pomiaru.

Ta próba sprawdza liczenie zdarzeń. Zgodność przebytej odległości z taśmą zależy także od długości kroku; zapisuj te dwie obserwacje osobno.

## 5. Wynik i logi

- [ ] **5.1** Otwórz PNG i zapisz je przez dostępny systemowy cel udostępniania. Otwórz zapisany plik poza aplikacją: logo outlineGo, szkic i wymiary są czytelne i nieucięte.
- [ ] **5.2** Dla projektu zawierającego bok z kroków PNG oznacza szacunkowe długości; wyliczone zamknięcie jest rozpoznawalne.
- [ ] **5.3** Z Logów pomiarowych wyeksportuj JSONL/CSV z prób krokomierza i zapisz pliki do analizy. Powiąż je z K1–K8 oraz tabelą problemów. Powrót z migawki loga prowadzi do listy.

## Wynik próby

| Nr punktu / serii | Co się stało i jak powtórzyć | Oczekiwany wynik | Zrzut / plik loga | Blokuje pomiar? |
| --- | --- | --- | --- | --- |
| | | | | |
| | | | | |
| | | | | |

Ocena testera: …

Proponowane warunki przejścia do testu zamkniętego: pełny pomiar offline, zapis/wznowienie i PNG przechodzą bez utraty danych; interfejs pozwala ukończyć pomiar; poprawki zgłoszonych problemów przechodzą ponowną próbę na telefonie. Krokomierz został zaakceptowany przez użytkownika z ręczną korektą ruchów telefonu. Nie ustalamy tutaj nowego progu dokładności sensorów.

Opis działania: [instrukcja MVP](prototyp.md). Aktualny build i granice potwierdzenia: [MEMO](../../MEMO.md).
