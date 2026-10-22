# Strona i dokumenty prawne outlineGo

Stan: 22 października 2026. Przygotowane lokalnie, bez publikacji i bez zmian w aplikacji.

- [Strona About](../../public/index.html) — EN, aktualne Free/Plus, Google Play oznaczony jako coming soon.
- [Polityka prywatności](../../public/privacy.html) — robocza, dla obecnego kodu bez Sentry.
- [Regulamin](../../public/terms.html) — roboczy.
- [Ograniczenia pomiarów](../../public/measurement-notice.html) — także propozycja potwierdzenia na start aplikacji.
- [Plan Sentry](sentry-plan.md) — przyszła integracja.

Źródłem treści dokumentów są pliki HTML. Hosting zachowuje istniejące `firebase.json`, katalog `public` i projekt `outlinego-27ab5`. Bez deploya. Usunięto skrypty Firebase z domyślnej strony; statyczna strona nie wymaga SDK ani analityki. Logo pochodzi z aplikacji. Dane wydawcy występują w dokumentach prawnych, nie w treści marketingowej strony głównej.

## Aktualizacja po zmianach aplikacji

Po każdej zmianie w aplikacji sprawdzić jej wpływ na dokumenty prawne i zaktualizować je przed wydaniem zmienionej wersji. Dotyczy to szczególnie funkcji i ograniczeń pomiarów, uprawnień, przechowywania i udostępniania danych, integracji SDK (w tym Sentry), zakupów oraz zakresu Free/Plus. Utrzymywać spójność polityki prywatności, regulaminu, informacji startowej, treści strony WWW i deklaracji Data safety w Google Play. Przy istotnych zmianach zaktualizować datę lub wersję dokumentów oraz sprawdzić potrzebę powiadomienia użytkowników lub ponownego uzyskania zgody.

## Przed publikacją

1. Zweryfikować identyfikację przedsiębiorcy: czy Bartosz Kamiński to pełne oznaczenie firmy oraz jakie dane rejestrowe i kontaktowe dodatkowo podać przy sprzedaży konsumenckiej, w tym numer telefonu. Nie wymyślono NIP, REGON ani telefonu. Uwzględnić rolę Google Play w zawieraniu umowy.
2. Przejrzeć dokumenty dla dystrybucji światowej: obowiązki konsumenckie, reklamacje, transfery danych i wymagania poszczególnych rynków. To szkice, nie potwierdzenie zgodności we wszystkich krajach.
3. Potwierdzić ustawienia Firebase, skrzynki wsparcia i retencję. Opis IP Hosting opiera się na dokumentacji Google; dodatkowych eksportów Cloud Logging nie zadeklarowano jako włączonych.
4. Ustalić datę wejścia w życie, usunąć Draft i `noindex` z zatwierdzonych dokumentów. Następnie opublikować istniejący projekt Firebase.
5. Podlinkować dokumenty w aplikacji; wdrożyć wersjonowane potwierdzenie ograniczeń przy pierwszym uruchomieniu. Odmowa nie powinna blokować dostępu do dokumentów. Potwierdzenie nie jest zgodą na diagnostykę ani zrzeczeniem się praw.
6. Uzgodnić Data safety Google Play z konkretnym wydaniem i SDK. Przed włączeniem Sentry zaktualizować politykę i formularz zgodnie z faktycznymi danymi.
7. Potwierdzić dostępność aplikacji, Plus i kraje sprzedaży. Cena na stronie odsyła do Google Play; nie obiecano dostępności światowej ani jednej ceny we wszystkich walutach.

Nie dodano banera cookies: przygotowany kod nie ustawia cookies i nie ładuje narzędzi śledzących. Hosting nadal przetwarza dane połączenia. Zmiana integracji wymaga ponownego przeglądu.

## Źródła

Kod: `app/src/domain/access.ts` (3 szkice, 8 punktów z pierwszym, PNG Free ze znakiem wodnym, DXF Plus), lokalny zapis projektów, natywny Billing i manifest z `allowBackup=false`.

- [Google Play User Data](https://support.google.com/googleplay/android-developer/answer/10144311?hl=en) i [Data safety](https://support.google.com/googleplay/android-developer/answer/10787469?hl=en).
- [Firebase privacy](https://firebase.google.com/support/privacy) i [warunki przetwarzania](https://firebase.google.com/terms/data-processing-terms).
- [Google Play refunds](https://support.google.com/googleplay/answer/2479637?hl=en).
- [RODO](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32016R0679).
- [Dyrektywa o prawach konsumentów](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A02011L0083-20220528) — dane przedsiębiorcy i informacje przed zakupem.
- [UODO — skargi](https://uodo.gov.pl/en/681).

Przegląd źródeł: 22.10.2026. Do dokumentów nie dodano obietnicy liczbowej dokładności ani wyłączenia ustawowych praw konsumenta.

Weryfikacja lokalna: 5 stron HTML ma język EN, tytuły i pojedynczy nagłówek H1; wszystkie lokalne odnośniki, zasoby i kotwice istnieją. Brak skryptów i danych kontaktowych wydawcy na stronie głównej. Nie wykonano kontroli wizualnej w przeglądarce — brak dostępnej powierzchni podglądu w tej sesji.
