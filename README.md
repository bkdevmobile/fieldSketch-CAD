# outlineGo

Aplikacja Android do orientacyjnych, nieprofesjonalnych pomiarów i wymiarowanych szkiców 2D. React Native 0.85.3, Expo SDK 56 i TypeScript, natywne sensory w Kotlin. Szkice są przechowywane lokalnie, bez konta outlineGo i synchronizacji z chmurą.

Długości można wpisać w m/cm/ft/in albo oszacować krokami. Kierunek jest względny, magnetyczny lub ręczny. Dostępne są korekty, notatki, przypinanie, obwód i pole oraz eksport PNG i DXF. Podgląd może być zadokowany, pływający lub pełnoekranowy. Interfejs obsługuje PL/EN/DE/ES/FR i motyw jasny, ciemny lub systemowy. Nie deklarujemy liczbowej gwarancji dokładności.

Free: do 3 szkiców i 8 punktów z P1, PNG ze znakiem wodnym. Jednorazowy Plus przez Google Play usuwa te limity i znak wodny oraz odblokowuje DXF. Cena i dostępność zależą od konfiguracji sklepu; testy transakcji pozostają otwarte.

## Stan na 22 października 2026

Kod funkcjonalny: **6f9a305**. TypeScript i **183 testy w 24 zestawach** przeszły. W źródłach są opcjonalne Sentry, pytanie o zgodę po błędzie i ekran pierwszego uruchomienia z akceptacją regulaminu oraz ograniczeń pomiarów. Te funkcje wymagają nowego buildu i próby na telefonie.

Ostatni podpisany APK z UI, zainstalowany na Redmi, pochodzi z **0b39f9f** i nie zawiera Sentry ani ekranu akceptacji. Nowy prebuild blokuje obecnie nieprawidłowy lokalny publiczny klucz licencyjny Google Play. AAB jest starszy od obecnych źródeł. [Aktualny stan, hash APK i pozostałe prace](docs/stan-projektu.md).

Pomiar działa offline. Zakupy i przywracanie korzystają z Google Play, a dobrowolne raportowanie błędów JS z Sentry. Raportowanie jest domyślnie wyłączone, wymaga osobnej zgody i nie obejmuje treści szkiców ani lokalnych logów pomiarowych. Potwierdzenie regulaminu nie udziela zgody na diagnostykę. Ekrany przeglądania i eksportu logów usunięto.

Strona EN: [outlinego-27ab5.web.app](https://outlinego-27ab5.web.app/). Dokumenty prawne są nadal robocze; ich zatwierdzenie i aktualizacja dla Sentry pozostają warunkiem wydania. Brak potwierdzenia publikacji produkcyjnej w Google Play.

## Dokumentacja i uruchomienie

- [Indeks dokumentacji](docs/README.md)
- [Budowanie i testy](app/README.md)
- [Pierwsze uruchomienie i akceptacja warunków](docs/technical/pierwsze-uruchomienie.md)
- [Sentry, zgody i konfiguracja](docs/technical/sentry.md)
- [Strona i dokumenty prawne](docs/legal/README.md)
- [Architektura](docs/technical/dokumentacja-techniczna.md)
- [Plan rozwoju](docs/plan-rozwoju.md) i [historia prac](MEMO.md)

Kod jest w katalogu app. Podstawowe polecenia: npm ci, npm run typecheck, npm test, npm run build:apk. Szczegóły narzędzi, kluczy i budowania zawiera README aplikacji. Po zmianach funkcji, danych, uprawnień, SDK lub zakupów aktualizować dokumenty prawne i deklaracje sklepowe przed wydaniem.
