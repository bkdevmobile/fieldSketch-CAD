# Zakup outlineGo Plus i wydanie Android

Aktualizacja 23.10.2026: publiczny klucz Google Play przechodzi walidację RSA, a użytkownik potwierdził jego zgodność z aplikacją. Wcześniejsza blokada prebuilda jest rozwiązana. Zakup i przywracanie wymagają testów sklepowych. [Aktualny stan paczek i pozostałe prace](../stan-projektu.md).

## Konfiguracja produktu

- Pakiet sklepu: `com.bk.dev.mobile.outlinego`, nazwa outlineGo.
- Produkt jednorazowy, niezużywalny: `outlinego_plus`.
- Jedna zwykła opcja zakupu, bez ofert promocyjnych; produkt nie jest konsumowany.
- Cena w Polsce: 29,99 zł. Pierwsze wydanie aplikacji i produktu dostępne tylko w Polsce.
- Cena widoczna w aplikacji pochodzi z Google Play, nie ze stałej w kodzie.

Nowy pakiet jest osobną aplikacją względem `pl.fieldsketch.cad.prototype`. Nie aktualizować ani nie usuwać starej instalacji w celu testów zakupów. Automatyczna migracja szkiców między pakietami nie jest wdrożona.

## Google Play Console — pierwsza konfiguracja

1. Utworzyć aplikację outlineGo, Android, bezpłatną z zakupem w aplikacji, z pakietem `com.bk.dev.mobile.outlinego`. Uzupełnić wymagane dane dewelopera i konfigurację płatności sprzedawcy.
2. Włączyć Play App Signing. Google może utworzyć docelowy klucz podpisywania aplikacji; lokalny `_private/outlinego-release.p12` służy jako klucz przesyłania. Hasła są w `_private/release-signing.json`; oba pliki muszą mieć bezpieczną kopię poza komputerem i pozostają poza Git.
3. Jeśli Console wymaga pierwszego bundle do aktywacji konfiguracji zakupów, zbudować AAB poleceniem `npm run build:aab -- -AllowUnconfiguredBilling` w `app/`. Plik `artifacts/outlineGo-0.1.0-bootstrap.aab` ma prawidłowy podpis, ale zakup jest wyłączony. Nie publikować go produkcyjnie jako gotowej integracji płatności.
4. Dodać i aktywować produkt `outlinego_plus`, jedną opcję jednorazowego zakupu (np. `buy`), cenę 29,99 zł i dostępność w Polsce. Nie używać subskrypcji ani opcji wielokrotnego zakupu.
5. Pobrać **publiczny klucz licencyjny RSA aplikacji** z konfiguracji licencjonowania/zarabiania w Console. Zapisać sam tekst Base64 w `_private/google-play-public-key.txt`. Nie jest to klucz podpisu AAB ani certyfikat upload. Publiczny klucz zostanie osadzony w zasobach aplikacji.
6. Zwiększyć `android.versionCode` w konfiguracji Expo przed kolejnym przesłaniem. Uruchomić `npm run build:aab` i przesłać podpisany `artifacts/outlineGo-0.1.0.aab` do testów wewnętrznych.
7. Dodać konta do testerów licencji oraz testerów ścieżki wewnętrznej, zaakceptować zaproszenie i zainstalować wersję ze sklepu na koncie testera. Korzystać wyłącznie z testowych metod płatności; sama ścieżka testowa nie zwalnia zwykłych kont z opłat.
8. Wykonać scenariusze poniżej. Publikacja produkcyjna jest osobnym krokiem, po odbiorze testów i spełnieniu wymagań Console.

## Budowanie i podpis

`npm run build:aab` wykonuje prebuild Expo, testy obu lokalnych modułów Kotlin, budowanie bundle i weryfikację JAR podpisu. Bez klucza licencyjnego domyślnie kończy się błędem; przełącznik bootstrap jest jawnym wyjątkiem do konfiguracji sklepu. `npm run build:apk` również korzysta z prywatnego klucza release.

Hasła trafiają do procesu Gradle przez środowisko, bez wpisywania w argumenty lub pliki projektu Android. Skrypty usuwają zmienne po zakończeniu; Gradle działa bez trwałego demona. Plugin Expo odtwarza konfigurację podpisu po prebuild. Budowanie release bez danych podpisu jest blokowane i nie przechodzi na podpis debugowy.

Weryfikacja ręczna: `jarsigner -verify artifacts/outlineGo-0.1.0.aab` i `keytool -printcert -jarfile artifacts/outlineGo-0.1.0.aab`. Certyfikat ma odpowiadać kluczowi przesyłania. AAB nie jest plikiem do bezpośredniego instalowania przez ADB.

## Działanie uprawnienia

Osobny moduł Expo `outlinego-billing` używa Billing Library 9.1.0. Po stronie TypeScript oferuje inicjalizację lokalną, odświeżenie, przywrócenie i zakup oraz zdarzenie `billingChanged` ze stanem planu, oferty i operacji. Store udostępnia uprawnienie wszystkim bramkom produktu.

Przed odblokowaniem sprawdzane są podpis oryginalnego JSON zakupu, produkt, pakiet, zakończony stan i token. Oryginalny zakup i podpis są zapisywane w prywatnych preferencjach Android, oddzielnie od SQLite szkiców. Przy starcie zapis jest weryfikowany ponownie bez sieci. Po trwałym zapisie wywoływane jest `acknowledgePurchase`, bez konsumowania produktu. Nieudane potwierdzenie wraca przy następnej synchronizacji; duplikaty zdarzeń nie uruchamiają równoległego potwierdzania tego samego tokenu.

Stan `PENDING` nie daje Plus. Błąd sklepu lub brak sieci nie usuwa poprzedniego uprawnienia. Dopiero udane pełne zapytanie bez zakupu Plus cofa plan do Free; szkice pozostają dostępne. Nieprawidłowo podpisana odpowiedź nie zastępuje poprawnego zapisu lokalnego. Zakup wymaga połączenia, a przywrócenie po reinstalacji lub zmianie telefonu tego samego konta Google Play; przywrócenie nie przenosi szkiców.

Zakup nie dodaje punktu ani nie eksportuje automatycznie. Przed otwarciem płatności sesja pomiarowa jest zatrzymywana. Kontynuacja korzysta z istniejącego odtwarzania odniesienia. Bez backendu i powiadomień serwerowych cofnięcie zakupu może być wykryte dopiero przy synchronizacji; lokalna weryfikacja nie daje ochrony serwerowej przed modyfikacją aplikacji.

## Odbiór

- Lokalne testy: podpis prawidłowy/zmieniony, obcy produkt i pakiet, stan oczekujący, pusty token, restart offline, zapis przed potwierdzeniem, błąd zapisu, duplikaty, ponowienie potwierdzenia i odebranie po potwierdzonym braku zakupu.
- Regresja: ten sam szkic P8 odblokowany do kontynuacji, czwarty szkic, PNG bez znaku wodnego, istniejące testy bramki DXF, kompletność pięciu języków.
- W Google Play: testowa płatność zaakceptowana, odrzucona i anulowana; płatność opóźniona zaakceptowana i odrzucona; zamknięcie procesu podczas zakupu; ponowne uruchomienie i odzyskanie zakupu; reinstalacja/nowe urządzenie; refundacja z odebraniem uprawnienia; zachowanie offline.
- Testów sklepowych nie zastępują testy jednostkowe ani uruchomienie wersji bez skonfigurowanego produktu.

Źródła: [integracja Billing](https://developer.android.com/google/play/billing/integrate), [testy zakupów](https://developer.android.com/google/play/billing/test), [ochrona zakupów](https://developer.android.com/google/play/billing/security), [wersje Billing](https://developer.android.com/google/play/billing/release-notes).

Aktualny stan: użytkownik potwierdził opublikowanie pierwszego bundle jako testu wewnętrznego oraz zapis produktu `outlinego_plus` z opcją `buy`, dostępną tylko w Polsce. Publiczny klucz licencyjny jest zapisany lokalnie; sprawdzono format RSA 2048 i osadzenie w zasobach Android. Kolejna paczka ma versionCode 2 i versionName 0.1.0. Aktywację produktu/opcji i konfigurację testerów licencji trzeba potwierdzić przed testami. Zakupów sklepowych jeszcze nie wykonano.

Ostatni podpisany APK 0.1.0 / versionCode 2 zainstalowano na Redmi i uruchomiono bez błędów. AAB v2 z kluczem licencyjnym jest gotowy do przesłania; brak potwierdzenia jego publikacji. Nowsza poprawka początkowego widoku DXF jest w źródłach, jeszcze bez przebudowanych artefaktów. Ikona produktu: `app/assets/store/plus-product-icon.png` (512 × 512, RGBA), źródło SVG obok. Nazwa: outlineGo Plus. Opis: „Odblokuj dowolną liczbę szkiców i punktów, eksport PNG bez znaku wodnego oraz pliki DXF do CAD. Jednorazowy zakup, bez abonamentu.”
