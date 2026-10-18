# Analiza dokumentacji biznesowej FieldSketch CAD

Data analizy: 18 października 2026. Źródło: [koncepcja biznesowa i prototyp wersja 1.0](../business/FieldSketch_CAD_dokumentacja_biznesowa_i_prototyp.docx).

## Wniosek

Dokument opisuje spójny proces od pomiaru terenowego do edytowalnego DXF. Najważniejsza hipoteza dotyczy użyteczności kierunku uzyskanego z telefonu. Dokładne długości nie usuną błędu azymutu. Zalecana kolejność to walidacja sensorów P0, następnie pełny proces pomiaru i edycji P1.

React Native z Expo jest wiążącym założeniem użytkownika. Natywny moduł Kotlin pozostaje zgodny z tym założeniem dzięki development build i Expo Modules API. Alternatywa Kotlin z Jetpack Compose opisana w źródle nie jest przyjętym kierunkiem realizacji.

## Wartość produktu

Produkt skraca drogę od notatek z miarki lub dalmierza do pliku CAD. Użytkownik otrzymuje szkic pomocniczy, który może poprawić na podstawie przekątnych, kątów i wiedzy o obiekcie. Nie jest to automatyczny skaner przestrzeni ani instrument geodezyjny.

Najbardziej konkretny scenariusz pierwszej wersji to poziomy obrys z 4–8 narożnikami. Telefon pomaga ustalić kierunek. Źródłowo długość pochodzi z miarki lub dalmierza; późniejszą decyzją użytkownika prototyp przyjmuje ręcznie podaną liczbę kroków i przelicza ją na centymetry przy założeniu 1 krok = 75 cm. Uzasadnienie przelicznika zawiera dokument techniczny. Każdy kolejny bok wymaga przejścia do jego początku i zachowania wspólnego odniesienia kierunków.

## Mocne strony koncepcji

- Wyraźne wyłączenia zakresu: brak chmury, LiDAR, obowiązkowego ARCore i pełnej rekonstrukcji 3D.
- Oddzielenie surowych obserwacji od skorygowanej geometrii umożliwia wyjaśnienie zmian i ponowne przeliczenie.
- Przekątne i dodatkowe wiązania są częścią podstawowego procesu.
- Akceptacja obejmuje otwarcie DXF w CAD, pracę bez sensorów i testy z użytkownikami.

## Ryzyka i luki

| Ryzyko | Konsekwencja | Zalecane działanie |
| --- | --- | --- |
| Zakłócenia magnetyczne i dryf | Niepoprawny kształt mimo dobrych długości | P0 w trzech otoczeniach, przekątne, tryb ręczny |
| Oszacowanie długości krokami | Indywidualny chód i teren zmieniają skalę oraz długości boków | Oznaczenie wyniku jako szacunkowego, zachowanie liczby kroków i przelicznika; kontrola taśmą lub dalmierzem w testach |
| Niewłaściwa oś lub pozycja celowania | Systematyczny błąd boków | Model osi kamery i instrukcja ustawienia nad punktem |
| Niejednoznaczna geometria | Same długości nie wyznaczają kształtu | Wykrywanie brakujących więzów i rozwiązań lustrzanych |
| Konflikty edycji | Nieoczekiwane przesunięcia punktów | Jawne operacje i brak cichego usuwania ograniczeń |
| Zamknięcie maskujące błędy | Pozornie poprawny wynik | Osobny pomiar domknięcia i prezentacja reszt |
| Błędna skala DXF | Nieprzydatny plik CAD | Jedna jednostka i test w dwóch programach |

Po P0 trzeba ustalić dopuszczalny błąd i warunki użycia. Przykład 10 cm w źródle jest celem badawczym, nie zatwierdzonym wymaganiem. Trzeba również wskazać urządzenia referencyjne, zakres Androida i limity projektu.

Edycja długości i kątów wymaga określenia nieruchomego punktu oraz pierwszeństwa ograniczeń. Projekt techniczny proponuje jawne operacje lokalne przed pełnym solverem. Samo połączenie ostatniego punktu z pierwszym nie daje niezależnej kontroli zamknięcia.

DXF nie zastępuje kopii projektu z obserwacjami. Zalecany jest dodatkowy, wersjonowany format JSON. Nie potwierdzono ceny, modelu sprzedaży, rynku ani gotowości do zapłaty; warianty komercjalizacji pozostają hipotezami.

## Zalecana kolejność

P0 powinien dać raport o powtarzalności, dryfie, wpływie otoczenia i zachowaniu po przejściu między stanowiskami. Wynik pozwoli wybrać domyślny tryb kierunku i określić konieczność pomiarów kontrolnych. Niepowodzenie automatycznego kierunku nie przekreśla wariantu z ręcznymi kątami i dodatkowymi długościami.

P1 powinien dostarczyć pełen proces dla 4–8 punktów, trwały zapis, podstawowe korekty, widoczne reszty i DXF. Pełny solver, Bluetooth, płatności i chmurę należy rozpatrywać po walidacji procesu podstawowego.

Mierniki pilotażu ze źródła to ukończenie pomiaru, mediana czasu do DXF, liczba korekt, poprawność eksportu i zrozumienie jakości wyniku. Porównanie z ręcznym szkicem i odrysowaniem powinno dotyczyć tego samego obiektu i równoważnego rezultatu.
