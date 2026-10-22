# Podgląd UI outlineGo

Otwórz `ui-preview.html` bezpośrednio w przeglądarce. Plik działa offline i zawiera 34 widoki: 9 tras docelowego UI, etapy pomiaru, główne dialogi i menu. Zakres podglądu uwzględnia bieżące uwagi użytkownika.

- Galeria: wszystkie widoki obok siebie, każdy telefon przewijany osobno.
- Wyszukiwarka: filtruje po nazwie ekranu lub trasie.
- Lista ekranów lub kliknięcie trasy: pojedynczy telefon.
- Przyciski prowadzą do powiązanych widoków; formularze i segmenty można edytować.
- W widoku pojedynczym strzałki lewo/prawo przełączają ekrany, Escape przywraca galerię.
- Fragment adresu, np. `ui-preview.html#settings`, otwiera konkretny widok.
- Eksperyment pomiaru: szkic domyślnie w treści, w prawej kolumnie 40%. Przyciski przy szkicu pozwalają oddokować/zadokować podgląd oraz otworzyć pełny ekran telefonu. Zamknięcie lub Escape przywraca wcześniejszy tryb podglądu.

To ręcznie odtworzony podgląd HTML obecnego UI React Native, przeznaczony do przeglądu wyglądu. Kolory i podstawowe wymiary pochodzą z `app/src/components/ui.tsx`. Treści i układy oparto na trasach w `app/src/app/` oraz komponentach. Ikony są uproszczone; dane, obraz kamery, cena i odczyty sensorów są przykładowe. Edycja nie przelicza geometrii. Akcje nie zapisują danych, nie eksportują plików i nie uruchamiają zakupów. Podgląd nie zastępuje weryfikacji na Androidzie.

Ponowne wygenerowanie z katalogu `app`: `npm run preview:ui`.

Generator: `app/scripts/generate-ui-preview.cjs`. Po zmianach UI trzeba uaktualnić jego szablony i ponownie wygenerować HTML.
