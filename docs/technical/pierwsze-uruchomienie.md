# Pierwsze uruchomienie — warunki i ograniczenia pomiarów

Wdrożone w źródłach 22.10.2026. Nowy APK i kontrola na telefonie pozostają do wykonania; nie publikowano nowej wersji aplikacji ani dokumentów WWW w ramach tego przyrostu.

Po załadowaniu ustawień, przed pokazaniem nawigacji i ekranów pomiarów, aplikacja sprawdza lokalny zapis `legalAcceptance`. Jeśli nie ma poprawnego potwierdzenia bieżącej wersji, pokazuje „Zanim zaczniesz”. Dotyczy to nowych instalacji oraz istniejących instalacji bez wcześniejszego potwierdzenia.

Ekran przedstawia orientacyjny i nieprofesjonalny charakter pomiarów, możliwe błędy sensorów, kroków i ręcznych danych, konieczność sprawdzania ważnych wymiarów, ograniczenia zastosowań oraz lokalny zapis i możliwość utraty szkiców. Nie deklaruje liczbowej dokładności ani wyłączenia ustawowych praw konsumenta.

- Pole „Akceptuję regulamin i rozumiem ograniczenia pomiarów” początkowo niezaznaczone.
- „Kontynuuj” jest nieaktywne bez zaznaczenia, podczas zapisu i gdy baza jest niedostępna.
- Akceptacja jest zapisywana w SQLite: wersja `2026-10-22.1` oraz data/czas UTC w ISO 8601 z zegara urządzenia. To lokalny zapis, nie niezależny dowód serwerowy.
- Nawigacja odblokowuje się dopiero po udanym zapisie. Błąd zapisu pozostawia użytkownika na ekranie z komunikatem i możliwością ponowienia.
- Regulamin, polityka prywatności i informacja o ograniczeniach są dostępne przed potwierdzeniem oraz później w Ustawienia → Dokumenty prawne. Otwarcie linku nie oznacza akceptacji. Dokumenty WWW są po angielsku; informacja w aplikacji ma PL/EN/DE/ES/FR.
- Zapis nie zmienia szkiców, jednostek, motywu ani zgody na Sentry. Pytanie o diagnostykę pozostaje osobne; nie jest częścią ekranu akceptacji.

## Aktualizacja treści

Stała `LEGAL_NOTICE_VERSION` w `app/src/domain/legal.ts` identyfikuje wspólną wersję regulaminu i informacji o ograniczeniach przedstawioną w tym kroku. Zwiększać ją przy istotnej zmianie wymagającej nowej akceptacji, po uzgodnieniu treści aplikacji z dokumentami WWW. Korekta kosmetyczna lub nowy build nie powinny automatycznie wymuszać ponownego potwierdzenia. Sama zmiana języka również go nie wymusza.

Starszy wpis jest zachowywany do czasu potwierdzenia nowej wersji; nowa akceptacja zastępuje poprzednią. Nie wprowadzono kont, synchronizacji ani wysyłania akceptacji na serwer.

## Przed wydaniem

Dokumenty opublikowane na stronie są nadal robocze. Przed publicznym wydaniem aplikacji trzeba zatwierdzić regulamin i pozostałe dokumenty, nadać datę obowiązywania i usunąć oznaczenia Draft. Ekran przygotowany w kodzie nie zmienia samodzielnie statusu tych dokumentów.

Sprawdzić na telefonie: nowa instalacja, aktualizacja z istniejącymi szkicami, otwieranie dokumentów i powrót z przeglądarki, restart po akceptacji, zwiększenie wersji, odmowa zaznaczenia, błąd zapisu, duży tekst i oba motywy. Testy jednostkowe obejmują wymóg jawnego potwierdzenia, wersję/datę oraz zachowanie po odtworzeniu SQLite.
