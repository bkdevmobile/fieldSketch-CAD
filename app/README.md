# Aplikacja outlineGo

Stan źródeł: **24 października 2026**, kod APK **8365dca** (v2); konfiguracja: wersja 1.0.0 / versionCode 4 (jeszcze bez nowego buildu); ostatni AAB: 0.1.0 / versionCode 3, baza źródeł 0aaa75c i zwiększenie versionCode. Pakiet com.bk.dev.mobile.outlinego. TypeScript i **183 testy w 24 zestawach** przechodzą. [Stan kodu, APK/AAB i publikacji](../docs/stan-projektu.md).

React Native 0.85.3, Expo SDK 56, TypeScript i lokalne moduły Expo/Kotlin do sensorów oraz Google Play Billing. Zależności i ich wersje rozwiązuje package-lock.json. Expo Go nie obsługuje pełnej aplikacji z tymi modułami.

## Uruchomienie i budowanie

W katalogu app na Windows, z Node zgodnym z Expo SDK 56 (ostatnio używany Node 22.23.4), JDK i Android SDK:

```powershell
npm ci
npm run typecheck
npm test
npm run build:apk
```

Build wymaga plików _private/outlinego-release.p12, _private/release-signing.json i prawidłowego publicznego klucza licencyjnego _private/google-play-public-key.txt. Dane podpisu są przekazywane przez środowisko procesu, nie w argumentach. **23.10.2026 klucz przeszedł walidację RSA DER/base64, a użytkownik potwierdził jego zgodność z aplikacją w Play Console.** Nie zastępować podpisu release kluczem debug ani nie pomijać walidacji.

APK jest kopiowany do artifacts/outlineGo-0.1.0.apk w katalogu repozytorium; zawiera JavaScript i działa bez Metro. Domyślne architektury: arm64-v8a i x86_64. npm run build:aab tworzy paczkę do Google Play. Pliki _private, wygenerowany Android i artefakty są ignorowane przez Git. [Zakupy, Console i podpisywanie](../docs/technical/zakupy-google-play.md).

APK z 8365dca zbudowano 23.10.2026 (BUILD SUCCESSFUL in 2m 35s), zweryfikowano podpis release, zainstalowano na Redmi przez `install -r` i uruchomiono (Success / Status: ok). Zawiera Sentry, ekran akceptacji i automatyczny zapis notatek. Zadania testów Kotlin były UP-TO-DATE; raporty obejmują 7 testów orientacji i 11 billing bez błędów. Instalacja nie zastępuje testu funkcjonalnego. Log: `artifacts/build-apk-2026-10-23.log`.

24.10.2026 zbudowano podpisany AAB v3: `artifacts/outlineGo-0.1.0-v3.aab` (również standardowa nazwa `outlineGo-0.1.0.aab`). BUILD SUCCESSFUL in 2m 49s; TypeScript i 183 testy przeszły, Kotlin UP-TO-DATE. Skrypt zweryfikował podpis i zgodność certyfikatu z kluczem przesyłania; potwierdzono obecność publicznego klucza Play w paczce. Log: `artifacts/build-aab-2026-10-24.log`, raport: `artifacts/outlineGo-0.1.0-v3-aab-verification.json`. Nie wysyłano do Google Play; nowego APK nie budowano ani nie instalowano.

## Aktualne funkcje

- Lista szkiców: stały dolny przycisk tworzenia, domyślna nazwa „Mój pomiar” z numeracją, przypinanie i menu pozycji. Dotknięcie szkicu otwiera podsumowanie.
- Pomiar: kierunek względny, magnetyczny lub ręczny; kamera jako celownik. Prośba o kamerę poprzedza prośbę o uprawnienie krokomierza. Długości m/cm/ft/in lub szacowanie krokami, długość kroku w cm.
- Krokomierz: pierwszy rząd [−] [liczba kroków] [+], drugi [Start/Stop] [pulsująca ikona kroków]. Przyciski plus/minus są ikonami.
- Szkic w prawej kolumnie 40%, pływający overlay albo pełny ekran. Pełny ekran zachowuje dokowanie; zoom ma ikony lupy +/− i ikonę dopasowania. Notatka na dole przewijanej treści; edycja wymiarów z menu.
- SQLite: projekty, robocze formularze, ustawienia i akceptacja dokumentów. Wznowienie pomiaru wymaga ponownego przechwycenia kierunku.
- Korekty zapisanych boków, notatki, pole i obwód. Obserwacje źródłowe pozostają w historii. Opisy omijają obrys i pozostałe etykiety.
- PNG i DXF z uwzględnieniem jednostek i Free/Plus; komunikaty po przygotowaniu pliku oraz po błędzie. Udostępnianie pliku obsługuje Android; przygotowanie pliku nie potwierdza doręczenia go odbiorcy.
- PL/EN/DE/ES/FR, motyw jasny/ciemny/systemowy. Zapis ustawień wraca do poprzedniego ekranu także po zmianie języka. Format liczb zależy od języka, jednostki są osobnym wyborem.
- Free: 3 szkice, 8 punktów z P1, PNG ze znakiem wodnym. Plus: brak limitów produktu i znaku wodnego, DXF; jednorazowy zakup i przywracanie przez Google Play. Testy sklepu pozostają do wykonania.

Nie ma ekranów diagnostyki, przeglądania ani eksportu logów. Wewnętrzne pliki sesji nadal istnieją lokalnie i nie są wysyłane do Sentry. Eksport PNG/DXF nie jest kopią odtwarzającą edytowalne szkice. Solver, przekątne kontrolne i import/eksport listy szkiców pozostają planem.

## Pierwsze uruchomienie i Sentry

Przed wejściem do ekranów aplikacji użytkownik akceptuje regulamin i potwierdza orientacyjny charakter pomiarów. Pole początkowo niezaznaczone; zapis w SQLite obejmuje wersję treści i datę UTC. Dokumenty można czytać przed potwierdzeniem i w ustawieniach. [Szczegóły i wersjonowanie](../docs/technical/pierwsze-uruchomienie.md).

Raportowanie błędów JS przez Sentry 7.11.0 jest osobne i domyślnie wyłączone. Włączenie w ustawieniach działa po zapisaniu. Po pierwszym obsłużonym błędzie można również zaakceptować wysyłkę tego i przyszłych raportów. Odmowa jest pamiętana. Przed zgodą nic nie jest wysyłane; błędy są oczyszczane z danych użytkownika. Natywne awarie, Replay, tracing i analityka pozostają wyłączone.

Publiczny DSN EU jest w sentry.config.cjs; opcjonalne EXPO_PUBLIC_SENTRY_DSN może go zastąpić, a pusta wartość wyłącza dostępność raportowania w buildzie. Prywatny SENTRY_AUTH_TOKEN służy do uploadu sourcemap, nie do wysyłania błędów; wymaga też SENTRY_PROJECT i pozostaje wyłącznie w środowisku procesu/CI. Nie umieszczać go w EXPO_PUBLIC_* ani konfiguracji aplikacji. [Konfiguracja, test HTTP 200 i ograniczenia](../docs/technical/sentry.md).

Przed wydaniem trzeba potwierdzić retencję/IP Sentry, czytelność stosów i zachowanie na telefonie oraz zatwierdzić robocze dokumenty prawne i Data safety. [Notatki prawne](../docs/legal/README.md).

## Marka i dokumentacja

Wybrany styl Teren korzysta z leśnej zieleni, ciepłego tła i ikon Lucide; palety obsługują oba motywy. Geometria logo jest w assets/brand/mark.json. npm run assets:brand odtwarza zasoby przez sharp; build robi to automatycznie. Techniczne nazwy FieldSketch w bazie i modułach pozostają dla zgodności danych.

[Instrukcja](../docs/technical/prototyp.md), [UI](../docs/technical/ui-2026-10.md), [architektura](../docs/technical/dokumentacja-techniczna.md), [stan projektu](../docs/stan-projektu.md).
