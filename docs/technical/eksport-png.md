# Eksport PNG — dopasowanie obrazu

Aktualizacja z 21 października 2026. Obraz ma szerokość 1080 px, a wysokość zależy od proporcji szkicu i ilości treści. Nie ma stałej wysokiej planszy ani stałego pola rysunku 952 × 500 px.

Obszar rysunku obejmuje rzeczywiste granice obrysu i etykiet z marginesem. Jest skalowany proporcjonalnie do dostępnej szerokości, z limitem wysokości rysunku 1280 px. Szkic kwadratowy zajmuje dużą część obrazu; płaski daje niższy PNG, pionowy wyższy obszar rysowania. Zachowujemy proporcje i całość opisów, bez rozciągania geometrii.

Pod rysunkiem znajdują się kolejno obwód i pole, tabela wymiarów, opcjonalna notatka oraz objaśnienia. Ich położenie jest wyliczane z wysokości poprzednich sekcji. Notatki i objaśnienia są zawijane, a obraz kończy się po treści z dolnym marginesem. Free dodaje osobny pasek znaku wodnego, bez zmiany skali i danych rysunku; Plus pomija pasek.

Renderer używa jednego głównego SVG i transformacji grupy rysunku. Podgląd i natywne generowanie PNG korzystają z tego samego układu. Wymiary długości mają maksymalnie trzy miejsca po przecinku, pole dwa; eksport PNG nadal opisuje długości w metrach. Powiększenie i przesunięcie podglądu roboczego nie zmienia eksportu.

## Weryfikacja

TypeScript i 153 testy TS przeszły. Testy obejmują wykorzystanie szerokości przez szkic kwadratowy, zróżnicowanie wysokości dla linii poziomej i pionowej, zachowanie proporcji, obecność wszystkich etykiet, brak obcięcia, układ długiej notatki i stopki oraz pasek Free niezależny od geometrii.

Obejrzano rendery ExportSketch dla kwadratu (1080 × 1627 px), szerokiego prostokąta z notatką (1080 × 937 px), pionowego prostokąta (1080 × 1925 px) i długiej notatki (1080 × 1914 px). Kontrolny renderer zastępuje natywne elementy odpowiednikami SVG i pomija znak graficzny marki.

Na emulatorze sprawdzono rzeczywisty podgląd Androida i wygenerowano PNG dla istniejącego szkicu Mode9: 1080 × 862 px. Obejrzano jego miniaturę w systemowym arkuszu udostępniania — dopasowanie zgodne z podglądem, bez rozległej pustej planszy. Arkusz zamknięto bez wysyłania pliku. Zrzuty: artifacts/png-fit-native-preview.png i artifacts/png-fit-native-share.png. Bezpośredniego pliku z prywatnego cache nie kopiowano; ocenę natywnego PNG wykonano na jego miniaturze.

Pełny hash APK, build i instalacje: [MEMO](../../MEMO.md).
