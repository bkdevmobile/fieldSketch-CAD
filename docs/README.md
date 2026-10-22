# Dokumentacja outlineGo

Stan dokumentacji: **21 października 2026**, wersja 0.1.0. Kod integruje zakup i przywracanie Plus przez Google Play, uprawnienie offline oraz podpisywanie AAB nowym kluczem release. Pakiet sklepowy: `com.bk.dev.mobile.outlinego`; produkt: `outlinego_plus`, 29,99 zł jednorazowo, początkowo Polska. Pierwszy bundle jest w testach wewnętrznych według potwierdzenia użytkownika; produkt i opcja zakupu są zapisane dla Polski, a klucz licencyjny jest podłączony. AAB i APK v2 są zbudowane, a APK zainstalowano na Redmi; oba artefakty poprzedzają najnowszą poprawkę widoku DXF. Testy transakcji pozostają do wykonania. Wcześniej wdrożono DXF, pięć języków, notatki, przypinanie, korekty wymiarów i poprawki podglądu/PNG. Nie opublikowano produkcji. Szczegóły najnowszych testów i artefaktów: [MEMO](../MEMO.md).

## Obsługa i funkcje

- [Instrukcja użytkowania, instalacji i testów](technical/prototyp.md)
- [Wizard pomiaru i decyzje UI](technical/wizard-pomiaru.md)
- [Aktualne zmiany UI: zadokowany szkic, motywy i jednostki imperialne](technical/ui-2026-10.md)
- [Prowadzenie pierwszego pomiaru](technical/pierwszy-pomiar.md)
- [Notatki, przypinanie, edycja wymiarów i ponowny pomiar](technical/edycja-szkicu.md)
- [Precyzja kątów i długości](technical/precyzja-wymiarow.md)
- [Eksport PNG i dopasowanie obrazu](technical/eksport-png.md)
- [Eksport DXF](technical/eksport-dxf.md)
- [Zasady Free/Plus i stan integracji zakupów](technical/free-plus.md)
- [Zakupy Google Play, podpisywanie AAB i konfiguracja Console](technical/zakupy-google-play.md)
- [Wielojęzyczność PL/EN/DE/ES/FR](technical/wielojezycznosc.md)

## Stan prac i materiały techniczne

- [Plan rozwoju i prace przed release](plan-rozwoju.md)
- [Pomysły na rozwój](pomysly-na-rozwoj.md)
- [Stan prac, artefakty i historia wdrożeń](../MEMO.md)
- [Dokument techniczny: implementacja i architektura docelowa](technical/dokumentacja-techniczna.md)
- [Budowanie i testowanie aplikacji](../app/README.md)
- [Historia próby terenowej i dodatkowe scenariusze nowych funkcji](technical/checklista-proby-terenowej.md)
- [Analiza biznesowa](technical/analiza-biznesowa.md)

Katalog `business/` zawiera źródłowe materiały biznesowe; dostarczony dokument Word pozostaje bez zmian. Katalog `technical/` zawiera dokumentację Markdown wersjonowaną razem z kodem. Opis architektury docelowej nie oznacza wdrożenia wszystkich proponowanych funkcji ani potwierdzenia dokładności sensorów. Wyniki wcześniejszych prób pozostają przypisane do sprawdzonych wersji.
