# Strona i dokumenty prawne outlineGo

Stan po publikacji 30.10.2026: etap 1 WWW jest wdrożony na https://outlinego-27ab5.web.app/pl/ i /en/ — osiem stron marketingowych oraz sześć finalnych dokumentów prawnych PL/EN (obowiązują od 30.10.2026, temat redakcji zamknięty). Desktop sprawdzono w VS Code, telefon zaakceptował użytkownik. Wdrożono poprawki wizualne, oficjalne badge Google Play, aktualne ilustracje udostępniania, lżejsze obrazy, doprecyzowane leady i JSON-LD WebSite/BreadcrumbList. Commit SEO fdcc1f3; zapis wdrożenia 97e7e84; wersja Firebase 056f218e8640f749. Po publikacji 25 zasobów ma zgodne SHA-256 z plikami lokalnymi, 301 i 404 działają. Pozostają PageSpeed Insights/Core Web Vitals oraz kontrola przetworzenia mapy i indeksowania w Search Console; własna domena opcjonalnie. Nie zmieniano aplikacji ani APK/AAB. Filmy oraz etap 2 są poza zakończonym zakresem. Publiczne dokumenty zachowują celowy noindex. Nie zmieniano wersji akceptacji w aplikacji ani deklaracji Data safety. Nie wracamy do pominiętego telefonu i ustalania liczbowej retencji Sentry.

## Czysta redakcja PL/EN — obowiązywanie od 30 października 2026

Użytkownik wybrał datę obowiązywania **30.10.2026**. Wszystkie sześć dokumentów ma tę datę oraz datę ostatniej aktualizacji. Usunięto publiczne oznaczenia wersji roboczej, instrukcje do potwierdzenia konfiguracji, nazwę pakietu i numer kompilacji. Zachowano informacje istotne dla użytkownika: zakres działania, ograniczenia pomiarów, dane lokalne i logi, eksporty, dobrowolność raportowania oraz prawa konsumenta.

Użytkownik polecił pominąć dalsze ustalanie liczbowej retencji Sentry. Nie oznacza to jej potwierdzenia. W polityce pozostawiono ogólny opis zasad używanego planu, celu przechowywania raportów oraz usuwania i procedur kopii zapasowych dostawcy, bez obietnicy 30/90 dni. Brak konkretnego okresu lub wystarczająco precyzyjnych kryteriów nadal wymaga oceny pod kątem obowiązku informacyjnego; nie przedstawiać tej redakcji jako dowodu pełnej zgodności RODO. Numer telefonu nadal pominięty zgodnie z wyraźną decyzją użytkownika; wcześniejsze ustalenia o ryzyku informacyjnym pozostają aktualne, nie prosić ponownie o numer.

Regulamin rozdziela obsługę płatności/wniosków o zwrot przez Google Play od pomocy twórcy dotyczącej działania aplikacji i uprawnienia Plus. Google Play nie jest wyłącznym kanałem reklamacji. Dodano zgłoszenia e-mailem lub pocztą, niewymagane informacje pomocnicze, brak obowiązkowego formularza, odpowiedź na reklamację konsumenta w 14 dni z uwzględnieniem właściwych przepisów, trwały nośnik, brak automatycznego przedłużenia terminu przez prośbę o dane, ustawowe środki z tytułu niezgodności treści/usługi cyfrowej oraz informację o pomocy konsumenckiej i postępowaniach pozasądowych. Źródła sprawdzone 30.10: [Google Play — zwroty i kontakt z deweloperem](https://support.google.com/googleplay/answer/2479637?hl=pl), [ustawa o prawach konsumenta](https://eli.gov.pl/api/acts/DU/2024/1796/text.html), [UOKiK — treści i usługi cyfrowe](https://uokik.gov.pl/Download/96).

Weryfikator sprawdza teraz daty i brak wewnętrznych uwag zamiast roboczego statusu. Zachowano `noindex` jako wybór niewłączania dokumentów do wyników wyszukiwania, nie jako oznaczenie roboczości. Mapa nadal obejmuje osiem stron serwisu. Nie wykonano publikacji, zmian APK/AAB, `LEGAL_NOTICE_VERSION` ani deklaracji Google Play. Przed wdrożeniem skoordynować wersję akceptacji w aplikacji i Data safety; samo wpisanie daty w lokalne HTML nie aktualizuje akceptacji na urządzeniach. Odbiór wizualny pozostaje otwarty. Starsze wpisy niżej opisują historię.

## Podpisane DPA Sentry — 30 października 2026

Użytkownik dostarczył `C:/Users/barte/Downloads/Complete_with_DocuSign_Data_Processing_Adden (1).pdf`. Odczytano 16 stron: DPA Functional Software, Inc. (Revision May 2024), klient Bartosz Kamiński, strona podpisów 6 zawiera podpisy Virginia Badenhope i Bartosza Kamińskiego oraz daty 10/30/2026. Sprawdzono także render strony podpisów. Dokument zawiera załączniki 1–4. Envelope ID: `478E9204-A543-8993-8193-2665CAA21B50`; SHA256: `82eb57178242210e4fc84c70c29c0ef7ffd035d676b83318248695647676dd5c`.

PDF ma pole podpisu cyfrowego DocuSign z datą `2026-10-30 10:45:36 UTC`; nie przeprowadzono kryptograficznej walidacji podpisu ani łańcucha certyfikatów. W pliku nie ma osobnego certyfikatu ukończenia (Certificate of Completion). Nie publikowano prywatnej umowy w `public/` ani nie modyfikowano źródłowego PDF.

Załącznik 1 (strony 7–8) opisuje zakres danych zależny od konfiguracji klienta oraz ogólny czas przetwarzania na czas umowy i do usunięcia danych. Załącznik 3 (strony 14–15) przewiduje DPF i warunkowo SCC jako mechanizmy transferu; samo DPA nie dowodzi faktycznej lokalizacji konta ani aktualnego statusu certyfikacji dostawcy. Nie zawiera liczbowego okresu retencji zdarzeń błędów. Wzmianka o 30 dniach w załączniku 2 dotyczy raportów Codecov, nie naszych błędów aplikacji — nie używać jej jako potwierdzenia retencji Sentry.

Polityka prywatności PL/EN wskazuje teraz podpisane DPA i nie wymienia zawarcia umowy jako niepotwierdzonego. W zakresie punktu Sentry nadal otwarte są liczbowa retencja podczas trialu i po jego zakończeniu oraz test nowego raportu po zmianie filtrów. Certyfikat ukończenia warto zachować z podpisanym PDF. Kontrola `node scripts/verify-www.cjs` przeszła. Bez deployu.

## Adres korespondencyjny — potwierdzenie 30 października 2026

Użytkownik wskazał brak stałego miejsca wykonywania działalności w danych firmy i potwierdził, że `ul. Miodowa 11, 05-870 Bieniewice` jest adresem do doręczeń, pod którym może odbierać korespondencję dotyczącą aplikacji. W polityce prywatności i regulaminie PL/EN oznaczono go jako **adres do korespondencji i reklamacji** / **correspondence and complaints address**. Nie jest przedstawiany jako biuro ani stałe miejsce wykonywania działalności. Bez zmian w aplikacji i bez publikacji.

## Kanały kontaktu — decyzja użytkownika 30 października 2026

Użytkownik zdecydował, że nie publikujemy numeru telefonu. Publiczne dokumenty pozostawiają potwierdzony adres firmy i e-mail `bk.dev.mobile@gmail.com` jako kanały kontaktu. Nie prosić ponownie o numer jako brakującą informację redakcyjną. Starsze wzmianki o uzupełnieniu telefonu nie są aktualnym zadaniem. Decyzja o niepublikowaniu numeru nie stanowi potwierdzenia spełnienia wszystkich obowiązków informacyjnych przy sprzedaży konsumenckiej; tę kwestię oceniać odrębnie przy końcowym przeglądzie regulaminu.

## Potwierdzenie ustawień Sentry — 30 października 2026

Na zrzutach przekazanych przez użytkownika potwierdzono plan **Developer** oraz aktywny **Business Plan Trial (5 dni do końca)**. Kolejny zrzut ustawień organizacji pokazuje wszystkie trzy opcje włączone: **Require Data Scrubber**, **Require Using Default Scrubbers**, **Prevent Storing of IP Addresses**. To potwierdzenie widocznego stanu panelu; nie wykonano osobnego odczytu API ani testu nowego zdarzenia po zmianie.

Zaktualizowano politykę prywatności PL/EN: opisano wymuszanie filtrów serwerowych i blokowanie zapisu IP w nowych zdarzeniach we wszystkich projektach. Odróżniono to od odbierania IP połączenia, przetwarzania danych pochodnych i historycznych raportów. Nie deklarujemy braku wszelkiego przetwarzania IP, pełnej anonimizacji ani usunięcia geolokalizacji. Usunięto wcześniejszą uwagę, że włączenie tych trzech opcji nie zostało potwierdzone, i planowaną obietnicę 30 dni.

Do domknięcia: rzeczywista retencja błędów podczas trialu i po nim (standardowy Developer: 30 dni, Team/Business: 90 dni według dokumentacji Sentry), warunki powierzenia/transferów właściwe dla konta oraz test nowego raportu bez IP i kontrola pól geograficznych. Potem ustalić datę obowiązywania, uzupełnić kontakt telefoniczny przedsiębiorcy i dopracować procedurę reklamacji, przenieść uwagi robocze poza publiczne HTML, skoordynować wersję akceptacji aplikacji i Google Play Data safety, a następnie opublikować i sprawdzić wersje PL/EN. Nie zmieniano ustawień Sentry narzędziami, aplikacji ani hostingu.

Źródła zakresu filtrów: [domyślne pola filtrowane przez Sentry](https://sentry.io/changelog/default-event-pii-fields-scrubbed/), [ograniczenie dotyczące danych geograficznych](https://github.com/getsentry/sentry/issues/92201), [retencja zdarzeń według planu](https://www.sentry.help/en/articles/13964336-why-does-the-event-count-in-my-issue-not-match-up-with-the-count-in-the-all-events-tab-of-the-issue). Starsze wpisy poniżej są historyczne; blokada zapisu IP w nowych zdarzeniach jest już potwierdzona zrzutem.

## Potwierdzenie wydawcy — 30 października 2026

Użytkownik potwierdził aktualność adresu `ul. Miodowa 11, 05-870 Bieniewice` i e-maila `bk.dev.mobile@gmail.com`, a następnie podał formę działalności: JDG pod firmą **Bartosz Kamiński**, **NIP 1181466003**. Dodano te dane do regulaminu i polityki prywatności w PL/EN. Potwierdzenie pochodzi od użytkownika; nie wykonywano weryfikacji wpisu CEIDG. Wcześniejsze uwagi o nieznanej nazwie i NIP są historyczne. Nie podano numeru telefonu; jego uzupełnienie pozostaje otwarte. Ustalenia Sentry i data obowiązywania nadal wymagają domknięcia. Zmiany lokalne, bez deployu.

## Aktualizacja do aplikacji 1.0.0 / 4 — 30 października 2026

Zaktualizowano sześć dokumentów WWW (politykę prywatności, regulamin i ograniczenia pomiarów w PL i EN) według bieżących źródeł, nie według starszego APK na telefonie. Każdy wskazuje 1.0.0 / versionCode 4, pakiet `com.bk.dev.mobile.outlinego` i datę aktualizacji 30.10.2026. Wersje PL są już wspólnie aktualizowane z EN, a nie wyłącznie tłumaczeniem stanu z 23.10.

| Zakres | Potwierdzenie w kodzie i zmiana treści |
| --- | --- |
| Wersja i backup | `app/app.config.js`, `app/package.json`: 1.0.0 / 4, `allowBackup: false`; brak własnego backupu i transferu projektów |
| Funkcje | `domain/model.ts`, `domain/units.ts`, `app/settings.tsx`, `i18n/index.ts`: względny/magnetyczny/ręczny kierunek, m/cm/ft/in, pięć języków i motywy; język nie zmienia jednostek |
| Dane lokalne | `infrastructure/repository.ts`, `components/SketchNote.tsx`: SQLite, robocze wpisy, ustawienia i automatyczny zapis notatek |
| Logi sesji | `infrastructure/store.tsx`, natywne `FieldSketchOrientationModule.kt` i `DiagnosticStore.kt`: odczyty, kroki, operacje, nazwy/ID projektów, model telefonu i Android; osobne pliki prywatne, brak UI usuwania, brak automatycznej retencji czasowej. Usunięcie projektu w SQLite nie usuwa logów |
| Eksport i usuwanie | `app/export.tsx`, `infrastructure/shareDxf.ts`: pliki PNG/DXF powstają w cache przed udostępnieniem. Rozdzielono usuwanie szkicu, czyszczenie cache i czyszczenie wszystkich danych |
| Zakupy | `domain/access.ts`, `infrastructure/billing.ts`, natywne `OutlineGoBillingModule.kt` i `Entitlements.kt`: Free 3/8, jednorazowy Plus, podpisany zapis zakupu w prywatnych preferencjach, odświeżanie przy powrocie do aplikacji, oczekujące transakcje, zachowanie uprawnienia przy błędzie sklepu, możliwość powrotu do Free po autorytatywnym wyniku bez zakupu |
| DXF i dokładność | `domain/dxfExport.ts`: AC1015, lokalny XY, wybrana jednostka, osobne warstwy i teksty zamiast asocjatywnych wymiarów; wyliczone zamknięcie i niezależny pomiar powrotu nie są automatycznym wyrównaniem obrysu |
| Diagnostyka | `infrastructure/errorReporting.ts`, `errorReportingPrompt.ts`: ponownie sprawdzono zakres filtrowania, zapis osobnej zgody, wysyłkę JS, brak natywnego SDK/replay/tracing/kolejki dyskowej i anulowanie wysyłek przy cofnięciu zgody. Opis z poprzednich dokumentów nadal odpowiada kodowi |

Zachowano roboczy status i `noindex`; nie wykonano deployu ani zmian aplikacji. Retencja/IP i ustalenia przetwarzania na koncie Sentry, dane wydawcy wymagane przy sprzedaży oraz data obowiązywania nadal nie są potwierdzone. Nie przedstawiono planowanych 30 dni retencji jako faktycznego ustawienia. `LEGAL_NOTICE_VERSION` w aplikacji nadal wynosi `2026-10-22.1`; przed wprowadzeniem zatwierdzonych dokumentów w życie ocenić potrzebę nowej wersji akceptacji i spójnego wydania aplikacji. Obecna aktualizacja opisuje istniejące działanie i nie uruchamia ponownej akceptacji na urządzeniach.

Sprawdzono źródła usług 30.10.2026: [prywatność Firebase](https://firebase.google.com/support/privacy), [zwroty Google Play w EOG i UK](https://support.google.com/googleplay/answer/15576634?hl=en), [lokalizacje przetwarzania Sentry](https://www.sentry.help/en/articles/13965013-where-are-your-data-servers-located). Dokumentacja dostawców nie potwierdza ustawień naszego konta.

Weryfikacja: `node scripts/verify-www.cjs` przechodzi dla ośmiu stron serwisu i sześciu dokumentów prawnych (struktura sekcji i akapitów PL/EN, języki, przełączniki, lokalne linki i kotwice, status roboczy). Osobna kontrola porównała wszystkie sześć dokumentów z wersją i pakietem w `app.config.js`, potwierdziła usunięcie 0.1.0 i dawnych dat aktualizacji oraz poprawny UTF-8. Przegląd wizualny pozostaje otwarty. Starsze wpisy poniżej zachowują historię prac.

## Wersje PL — 30 października 2026

Dodano lokalne tłumaczenia pełnych dokumentów EN z 23.10.2026:

- [Polityka prywatności](../../public/pl/prywatnosc/index.html) — `/pl/prywatnosc/`.
- [Regulamin](../../public/pl/regulamin/index.html) — `/pl/regulamin/`.
- [Ograniczenia pomiarów](../../public/pl/ograniczenia-pomiarow/index.html) — `/pl/ograniczenia-pomiarow/`.

Polskie strony serwisu odsyłają do wersji PL; dokumenty mają wzajemne przełączniki PL/EN i powrót do strony głównej we właściwym języku. Dotychczasowe adresy EN pozostają dostępne dla istniejących linków aplikacji. Nie zmieniano linków ani ekranu akceptacji w aplikacji. Źródłem dokumentów nadal są bezpośrednio pliki HTML; `scripts/build-www.cjs` odtwarza odnośniki serwisu i nie nadpisuje dokumentów.

Tłumaczenia zachowują status roboczy, `noindex`, zakres treści źródłowej i otwarte kwestie konfiguracji Sentry. Osobno podano datę tłumaczenia; nie ustalono daty obowiązywania. Nie dodano dokumentów do mapy ani nie wykonano publikacji. To tłumaczenie istniejących projektów, bez nowej oceny zgodności prawnej. Starsze zapisy poniżej opisują historię prac.

Kontrola `node scripts/verify-www.cjs` przeszła dla ośmiu stron serwisu oraz sześciu dokumentów prawnych: sprawdzono kompletność struktury tłumaczeń (nagłówki, akapity, listy i dane kontaktowe), języki, wzajemne przełączniki, `noindex` oraz lokalne linki i kotwice. Kontrola wizualna w przeglądarce pozostaje do odbioru.

**Pełny deploy 24.10.2026:** po wdrożeniu grafiki użytkownik zlecił publikację całego aktualnego `public`. Firebase potwierdził powodzenie. Polityka z opisem Sentry, regulamin i ograniczenia pomiarów są już opublikowane, nadal jako dokumenty robocze bez daty obowiązywania. Poniższe wcześniejsze zapisy o oczekiwaniu na deploy opisują stan sprzed tej publikacji. Retencja/IP Sentry i zatwierdzenie treści pozostają otwarte.

[Aktualny stan kodu, paczek i publikacji](../stan-projektu.md). Potwierdzenie regulaminu w kodzie nie zmienia roboczego statusu dokumentów WWW.

Stan: 23 października 2026. Stronę opublikowano w istniejącym projekcie Firebase. Dokumenty są robocze. W źródłach aplikacji podłączono opcjonalne raportowanie błędów JS do DSN EU; serwer przyjął syntetyczne zdarzenie z testu na komputerze. APK z Sentry zainstalowano i uruchomiono na Redmi 23.10.2026; działanie zgód i raportowania oraz retencja nadal wymagają sprawdzenia. Publiczna polityka opisuje wcześniejszy build bez Sentry; tekst do jej aktualizacji przed wydaniem znajduje się poniżej.

- [Strona About](../../public/index.html) — EN, aktualne Free/Plus, Google Play oznaczony jako coming soon.
- Grafiki WWW z 24.10.2026: zdjęcie w nagłówku i sekcja „In the field”, lokalne responsywne WebP bez zewnętrznych skryptów, fontów ani trackerów. Zmianę wizualną opublikowano w Firebase, zachowując dotychczasowe dokumenty prawne live; lokalne projekty prawne nadal czekają na zatwierdzenie i osobny deploy. Zweryfikowano odpowiedzi HTTP i zasoby; nie wykonano kontroli wizualnej w przeglądarce.
- [Polityka prywatności](../../public/privacy.html) — lokalny projekt z 23.10.2026 uwzględnia Sentry za zgodą, odbiorców, transfery, retencję i prawa użytkownika. Retencja do 30 dni oraz serwerowa obsługa IP wymagają potwierdzenia; projekt nie deklaruje ich jako sprawdzonych ustawień.
- [Regulamin](../../public/terms.html) — roboczy.
- [Ograniczenia pomiarów](../../public/measurement-notice.html) — także propozycja potwierdzenia na start aplikacji.
- [Plan Sentry](sentry-plan.md) i [stan integracji](../technical/sentry.md).
- [Wcześniejszy projekt sekcji Sentry](sentry-privacy-addendum.en.md) — wykorzystany przy aktualizacji lokalnego `public/privacy.html`; nie zastępuje pełnej polityki ani potwierdzenia konfiguracji usługi.

Aktualizacja lokalnych dokumentów 23.10.2026: w `public/privacy.html` opisano zgodę, jednorazowe pytanie po błędzie, zakres i filtrowanie raportów, odwołanie zgody, brak kolejki dyskowej, obsługę IP oraz odbiorców i transfery. `public/terms.html` rozdziela regionalną dostępność aplikacji i Plus, lokalne szkice i przywracanie zakupu oraz akceptację ograniczeń i prawa konsumenta. `public/measurement-notice.html` doprecyzowuje kroki, wyliczony bok zamknięcia, CAD i bezpieczeństwo. Zachowano Draft i noindex; daty obowiązywania, niepotwierdzonych danych wydawcy i konfiguracji usług nie wymyślano. Nie wykonano deployu Firebase. Status strony opublikowanej i lokalnych źródeł trzeba odróżniać.

Źródłem treści opublikowanych dokumentów są pliki HTML. Hosting zachowuje istniejące `firebase.json`, katalog `public` i projekt `outlinego-27ab5`. Usunięto skrypty Firebase z domyślnej strony; statyczna strona nie wymaga SDK ani analityki. Logo pochodzi z aplikacji. Dane wydawcy występują w dokumentach prawnych, nie w treści marketingowej strony głównej. W polityce dane administratora przeniesiono na koniec, z odnośnikiem na początku.

## Aktualizacja po zmianach aplikacji

Po każdej zmianie w aplikacji sprawdzić jej wpływ na dokumenty prawne i zaktualizować je przed wydaniem zmienionej wersji. Dotyczy to szczególnie funkcji i ograniczeń pomiarów, uprawnień, przechowywania i udostępniania danych, integracji SDK (w tym Sentry), zakupów oraz zakresu Free/Plus. Utrzymywać spójność polityki prywatności, regulaminu, informacji startowej, treści strony WWW i deklaracji Data safety w Google Play. Przy istotnych zmianach zaktualizować datę lub wersję dokumentów oraz sprawdzić potrzebę powiadomienia użytkowników lub ponownego uzyskania zgody.

## Przed publikacją

1. Zweryfikować identyfikację przedsiębiorcy: czy Bartosz Kamiński to pełne oznaczenie firmy oraz jakie dane rejestrowe i kontaktowe dodatkowo podać przy sprzedaży konsumenckiej, w tym numer telefonu. Nie wymyślono NIP, REGON ani telefonu. Uwzględnić rolę Google Play w zawieraniu umowy.
2. Przejrzeć dokumenty dla dystrybucji światowej: obowiązki konsumenckie, reklamacje, transfery danych i wymagania poszczególnych rynków. To szkice, nie potwierdzenie zgodności we wszystkich krajach.
3. Potwierdzić ustawienia Firebase, skrzynki wsparcia i retencję. Opis IP Hosting opiera się na dokumentacji Google; dodatkowych eksportów Cloud Logging nie zadeklarowano jako włączonych.
4. Ustalić datę wejścia w życie, usunąć Draft i `noindex` z zatwierdzonych dokumentów. Następnie opublikować istniejący projekt Firebase.
5. W źródłach wdrożono [ekran pierwszego uruchomienia](../technical/pierwsze-uruchomienie.md) i stałe linki do dokumentów w ustawieniach. Sprawdzić w nowym APK zapis wersji i daty, ponawianie potwierdzenia po istotnej zmianie oraz dostęp do dokumentów przed akceptacją. Potwierdzenie nie jest zgodą na diagnostykę ani zrzeczeniem się praw. Przed publicznym wydaniem zatwierdzić dokumenty robocze, które ten ekran udostępnia.
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
