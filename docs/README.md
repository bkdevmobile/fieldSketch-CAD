# Dokumentacja outlineGo

Ogólną kolejność etapów opisuje [plan rozwoju](plan-rozwoju.md). Zaakceptowany przebieg i decyzje UI opisuje [wizard pomiaru](technical/wizard-pomiaru.md).

Stan dokumentacji: 20 października 2026. Stan kodu: `b00dd74` (ograniczenia przesuwania, animowany skokowy zoom i poluzowanie granic do środka podglądu). Telefon ma APK `E083C357…` z poluzowanymi granicami oraz skokowym zoomem; build i instalacja z zachowaniem danych zostały potwierdzone 20 października 2026. Ostatnia pełna kontrola: TypeScript i 60 testów TS; po poluzowaniu ponownie przeszły TypeScript oraz 10 testów podglądu. Po tej korekcie nie powtarzano wszystkich testów TS; pełny build zakończył się sukcesem, a testy Kotlin były aktualne (`UP-TO-DATE`).

- [Instrukcja użytkowania, instalacji i testów](technical/prototyp.md) opisuje aktualny interfejs.
- [Checklista i wynik próby terenowej](technical/checklista-proby-terenowej.md) zawiera zgłoszenia użytkownika i zakres ponownej kontroli podglądu.
- [Stan prac i znane ograniczenia](../MEMO.md) podaje commit, artefakt i najbliższe zadania.
- [Dokument techniczny](technical/dokumentacja-techniczna.md) oddziela wdrożone MVP od architektury docelowej.

- `business/` przechowuje dokumenty biznesowe i materiały źródłowe. Dostarczony plik Word został skopiowany bez zmian.
- `technical/` przechowuje analizę oraz projekt techniczny w Markdown, wersjonowany razem z kodem.

Wymagania źródłowe, decyzje użytkownika, propozycje techniczne i decyzje otwarte są rozróżnione w dokumentacji technicznej. Aktualizacja projektu technicznego nie zmienia automatycznie wymagań biznesowych.
