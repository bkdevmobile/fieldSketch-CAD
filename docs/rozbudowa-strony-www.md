# Rozbudowa strony WWW outlineGo

Stan po publikacji 30.10.2026: etap 1 WWW jest wdrożony na https://outlinego-27ab5.web.app/pl/ i /en/ — osiem stron marketingowych oraz sześć finalnych dokumentów prawnych PL/EN (obowiązują od 30.10.2026, temat redakcji zamknięty). Desktop sprawdzono w VS Code, telefon zaakceptował użytkownik. Wdrożono poprawki wizualne, oficjalne badge Google Play, aktualne ilustracje udostępniania, lżejsze obrazy, doprecyzowane leady i JSON-LD WebSite/BreadcrumbList. Commit SEO fdcc1f3; zapis wdrożenia 97e7e84; wersja Firebase 056f218e8640f749. Po publikacji 25 zasobów ma zgodne SHA-256 z plikami lokalnymi, 301 i 404 działają. Pozostają PageSpeed Insights/Core Web Vitals oraz kontrola przetworzenia mapy i indeksowania w Search Console; własna domena opcjonalnie. Nie zmieniano aplikacji ani APK/AAB. Filmy oraz etap 2 są poza zakończonym zakresem.

Data utworzenia: **28 października 2026**. Status: **etap 1 opublikowany 30.10.2026; pozostałe propozycje poniżej są planem lub historią**.

Aktualizacja **29 października 2026**: użytkownik potwierdził weryfikację własności w Search Console. Plik `public/google9be007feff638fa8.html` opublikowano bez zmiany zawartości. Dodano `public/robots.txt` umożliwiający skanowanie i wskazujący mapę oraz `public/sitemap.xml` zawierający stronę główną. Dokumenty prawne pozostają robocze i nie zostały dodane do mapy. Firebase Hosting `outlinego-27ab5`: deploy zakończony, wersja `e9a2b80991e8ad33`; wszystkie trzy pliki zwracają HTTP 200 i treść zgodną z lokalną. Ręczna prośba o indeksowanie napotkała komunikat dziennego limitu; przyczyna nieustalona. Użytkownik zgłosił mapę w panelu; Search Console pokazało błąd odczytu. Późniejszy test na żywo pokazał dozwolone skanowanie i udane pobranie sprawdzanego adresu. Przetworzenie mapy i faktyczne zaindeksowanie pozostają niepotwierdzone. Poniższe opisy pierwotnego stanu i lista zadań dokumentują plan z 28 października.

Cel: rozbudować stronę o aplikacji, ułatwić jej odnajdywanie w wyszukiwarkach i przygotować własną domenę. Dokument zapisuje ustalenia i zadania; nie oznacza wykonania wdrożenia ani zgłoszenia strony w Search Console.

## Obecny stan

- Adres strony: [outlinego-27ab5.web.app](https://outlinego-27ab5.web.app/).
- Statyczny landing page po angielsku znajduje się w `public/index.html`; Firebase Hosting publikuje katalog `public` zgodnie z `firebase.json`.
- Strona ma już tytuł, meta description, nagłówki, link do Google Play, opis Free/Plus i scenariusz „szkic w terenie → eksport → dalsza praca na komputerze”.
- W katalogu `public` są też strony dokumentów prawnych. Przy sprawdzeniu nie znaleziono `robots.txt` ani `sitemap.xml`.
- Konfiguracja Search Console i stan indeksowania nie zostały potwierdzone.

## 1. Własna domena

Własna domena ma zapewnić rozpoznawalny adres do materiałów promocyjnych i zachować ciągłość linków przy zmianie hostingu. Obecny adres `web.app` może służyć jako publiczny adres strony; zakup domeny nie jest warunkiem zgłoszenia jej do indeksowania.

### Porównanie rozszerzeń i cen

Standardowe ceny OVHcloud sprawdzone **28 października 2026**, brutto z polskim VAT:

| Domena | Pierwszy rok | Odnowienie roczne | Koszt 3 lat przy stałych cenach |
| --- | ---: | ---: | ---: |
| `outlinego.com` | 41,92 zł | 76,86 zł | 195,64 zł |
| `outlinego.app` | 45,01 zł | 107,00 zł | 259,01 zł |
| `outlinego.pl` | 20,53 zł | 72,56 zł | 165,65 zł |
| `outlinego.eu` | 43,65 zł | 50,05 zł | 143,75 zł |

Źródła cen: [OVHcloud .com](https://www.ovhcloud.com/pl/domains/tld/com/), [.app](https://www.ovhcloud.com/pl/domains/tld/app/), [.pl](https://www.ovhcloud.com/pl/domains/tld/pl/), [.eu](https://www.ovhcloud.com/pl/domains/tld/eu/). Ceny nie są ofertą dla konkretnej nazwy; przed zakupem potwierdzić dostępność, ewentualną wycenę premium i cenę odnowienia w koszyku.

- `.eu`: aktualnie preferowany kompromis dla wielojęzycznej aplikacji promowanej w Europie i niskiego kosztu utrzymania. Google traktuje `.eu` jako domenę ogólną, bez przypisania do jednego kraju: [dokumentacja Google](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites).
- `.com`: wariant przy promocji globalnej od początku.
- `.pl`: wariant przy koncentracji na polskich odbiorcach.
- `.app`: rozszerzenie pasujące do produktu, ale z wyższym kosztem odnowienia w porównanej ofercie.
- `.be`: domena krajowa Belgii; do rozważenia przy promocji skierowanej na ten rynek.

Publiczne zapytania RDAP z 28.10.2026 dla [outlinego.com](https://rdap.verisign.com/com/v1/domain/outlinego.com) i [outlinego.app](https://pubapi.registry.google/rdap/domain/outlinego.app) zwróciły HTTP 404, czyli brak rekordu rejestracji. Nazwy wyglądały na dostępne; nie jest to gwarancja możliwości zakupu. Dostępność `outlinego.pl`, `outlinego.eu` i `outlinego.be` pozostaje niepotwierdzona.

### Rejestrator i hosting

OVHcloud nie jest potwierdzonym najtańszym rejestratorem. W porównaniu dla `.eu` znaleziono także:

| Rejestrator | Pierwszy rok brutto | Odnowienie brutto | Koszt 3 lat przy stałych cenach |
| --- | ---: | ---: | ---: |
| [MonitorDomen.pl](https://monitordomen.pl/cennik) | 34,91 zł | 47,97 zł | 130,85 zł |
| [OVHcloud](https://www.ovhcloud.com/pl/domains/tld/eu/) | 43,65 zł | 50,05 zł | 143,75 zł |
| [Domena.pl](https://www.domena.pl/cennik-domen/) | 36,89 zł | 158,67 zł | 354,23 zł |

Różnica MonitorDomen względem OVHcloud wynosi 12,90 zł przez trzy lata. Wybierając rejestratora, porównać odnowienie i wygodę zarządzania DNS. Zestawienie nie obejmuje całego rynku.

Po zakupie podłączyć domenę do obecnego Firebase Hosting; nie trzeba budować strony ponownie ani kupować osobnego hostingu. Firebase zapewnia i odnawia certyfikat SSL dla podłączonej domeny: [instrukcja Firebase](https://firebase.google.com/docs/hosting/custom-domain). Koszt domeny i ewentualne opłaty za wykorzystanie hostingu rozpatrywać osobno.

Przy zmianie adresu ustalić jeden preferowany adres, skonfigurować odpowiednie przekierowania, zaktualizować linki, canonical i mapę witryny oraz zweryfikować nowy adres w Search Console. Sam zakup domeny nie gwarantuje lepszego SEO, rekomendacji AI ani wzrostu pobrań.

## 2. Google Search Console

1. Otworzyć [Google Search Console](https://search.google.com/search-console) i dodać usługę typu **Prefiks adresu URL**: `https://outlinego-27ab5.web.app/`.
2. Zweryfikować własność metodą pliku HTML: pobrać plik wygenerowany przez Google i umieścić go bez zmiany nazwy ani treści w `public/`.
3. Opublikować plik przez `firebase deploy --only hosting` z właściwego projektu Firebase. Sprawdzić, czy plik jest publicznie dostępny pod adresem wskazanym przez Google, i zakończyć weryfikację. Pozostawić plik również w kolejnych wdrożeniach.
4. W narzędziu **Sprawdzenie adresu URL** podać adres strony głównej, sprawdzić wynik i wybrać **Poproś o zaindeksowanie**. Raport **Indeksowanie → Strony** służy do obserwacji statusu i problemów.
5. W raporcie map witryn zgłosić `sitemap.xml` po jego opublikowaniu.

Zgłoszenie nie wymusza wizyty robota w określonym terminie i nie gwarantuje indeksowania. Przetworzenie może potrwać od kilku dni do kilku tygodni; wielokrotne wysyłanie tego samego adresu nie przyspiesza procesu. Dostęp do projektu Firebase nie zastępuje weryfikacji własności w Search Console.

Źródła: [weryfikacja własności](https://support.google.com/webmasters/answer/9008080?hl=en), [sprawdzanie adresu URL](https://support.google.com/webmasters/answer/9012289?hl=en), [prośba o ponowne przeskanowanie](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl).

## 3. Pliki sitemap.xml i robots.txt

- Dodać `public/robots.txt` z regułami umożliwiającymi skanowanie publicznej strony i adresem mapy witryny. `robots.txt` steruje skanowaniem; nie zapewnia indeksowania ani nie służy do ochrony prywatnych danych.
- Dodać `public/sitemap.xml` z pełnymi, preferowanymi adresami stron przeznaczonych do indeksowania. Uwzględnić stronę główną i świadomie wybrane podstrony; nie dodawać `404.html` ani fragmentów typu `#workflow` jako osobnych stron.
- Po wdrożeniu sprawdzić dostępność i poprawność obu plików oraz zgłosić mapę w Search Console.
- Po podłączeniu własnej domeny zaktualizować adresy w obu plikach.

Mapa witryny pomaga odkrywać adresy, ale nie gwarantuje indeksowania ani wyższych pozycji: [instrukcja Google](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).

## 4. Tytuł, opis i treść strony

Dopracować istniejące metadane tak, aby oprócz hasła „Walk it. Sketch it. Keep the outline.” wyjaśniały przeznaczenie aplikacji. Frazy o szkicach 2D, ogrodzie, pokoju, szacowaniu krokami i eksporcie DXF powinny występować naturalnie również w widocznej treści oraz nagłówkach.

Robocza propozycja dla wersji angielskiej:

```html
<title>outlineGo — 2D Field Sketching &amp; DXF Export</title>
<meta name="description" content="Create dimensioned 2D sketches of gardens, patios and rooms from approximate measurements. Work offline, estimate lengths by steps and export DXF with Plus.">
```

Treści muszą odpowiadać aktualnym funkcjom: PNG w Free, DXF w Plus, bez deklarowania eksportu DWG lub profesjonalnej dokładności pomiarów. Opis meta nie zastępuje przydatnej treści strony.

Przy kolejnych wersjach językowych przygotować osobne adresy, tytuły i opisy oraz odpowiednie oznaczenia języka i `hreflang`. Rozwijać przykłady zastosowań, rzeczywiste zrzuty ekranów i case study „z terenu do CAD”, zgodnie z [pomysłami promocyjnymi](promocja-aplikacji.md).

## 5. Koncepcja serwisu z kilkoma podstronami

Propozycja z **28 października 2026**. Status: **koncepcja do realizacji**. Rozbudować landing page w niewielki serwis produktowo-poradnikowy. Każda podstrona ma odpowiadać na inne pytanie i przedstawiać konkretny przykład działania aplikacji. Samo zwiększenie liczby adresów nie gwarantuje indeksowania ani wyższych pozycji.

### Proponowana struktura

Ścieżki są propozycją dla polskiej wersji, niezależną od ostatecznego wyboru domeny.

| Adres | Główne pytanie użytkownika / roboczy H1 | Własna treść i rola strony |
| --- | --- | --- |
| `/pl/` | outlineGo — szkice 2D z wymiarami na Androidzie | Krótkie przedstawienie aplikacji, rzeczywisty ekran, scenariusz teren → komputer, Free/Plus i odnośniki do zastosowań. |
| `/pl/jak-to-dziala/` | Jak zrobić pierwszy szkic w outlineGo? | Instrukcja kierunek → długość → zapis, ręczne wymiary i szacowanie krokami, korekty, zapis oraz przykład ukończonego szkicu. |
| `/pl/szkic-ogrodu/` | Jak zrobić orientacyjny szkic ogrodu z wymiarami? | Jeden rzeczywisty ogród: przygotowanie, zapis obrysu, notatki, sprawdzenie wymiarów i wynik gotowy do dalszego projektowania. |
| `/pl/plan-pokoju/` | Jak przygotować szkic pokoju z wymiarami na telefonie? | Osobny przykład wnętrza z ręcznie wpisanymi długościami, korektą obrysu i eksportem PNG. Opisać ograniczenia sensorów w budynku i kiedy użyć pomiaru ręcznego. |
| `/pl/eksport-dxf/` | Jak przenieść szkic z telefonu do CAD przez DXF? | Przebieg eksportu w Plus, jednostki, warstwy, otwarcie pliku na komputerze, przykładowy plik do pobrania i rzeczywisty zrzut z programu CAD. |
| `/pl/pomoc/` | Pomoc outlineGo — pomiary, zapis i eksport | Konkretne odpowiedzi: działanie offline, ograniczenia dokładności, Free/Plus, przechowywanie szkiców, przywracanie zakupu oraz kontakt. |

Frazy i nagłówki są hipotezami wynikającymi z zastosowań aplikacji, a nie wynikiem badania liczby wyszukiwań. Zweryfikować je później na podstawie zapytań w Search Console i informacji od użytkowników.

### Zakres każdej podstrony

1. Krótka odpowiedź na pytanie w tytule i jasne wskazanie, dla kogo jest dana funkcja.
2. Rzeczywisty przykład z własnymi zrzutami, zdjęciami lub krótkim filmem z opisem kroków w tekście.
3. Instrukcja prowadząca do wyniku, z podaniem sposobu uzyskania wymiarów i dostępności funkcji w Free/Plus.
4. Wynik do obejrzenia, a tam, gdzie ma to sens, przykładowy PNG lub DXF bez danych osobowych.
5. Ograniczenia właściwe dla danego scenariusza, odpowiedzi na najważniejsze pytania i link do następnego kroku.
6. Czytelny przycisk pobrania aplikacji w Google Play.

Nie ustalać sztucznego minimum słów. Strona jest gotowa, gdy pomaga wykonać zadanie i wnosi informacje inne niż pozostałe podstrony. Wspólne informacje o produkcie można skrócić i podlinkować.

### Nawigacja i powiązania

Menu: **Jak to działa · Zastosowania · Eksport DXF · Pomoc · Google Play**. Zastosowania obejmują ogród i pokój; na początku wystarczy proste menu bez osobnej strony zbiorczej.

Ze strony głównej prowadzić bezpośrednio do wszystkich głównych podstron. Z poradnika o ogrodzie linkować do pierwszego szkicu i eksportu DXF, a z poradnika o pokoju do ręcznych wymiarów, pomocy i eksportu. Stosować opisowe linki HTML, np. „Jak wyeksportować szkic do DXF”. Na podstronach dodać okruszki nawigacyjne i sekcję powiązanych materiałów.

Google zaleca logiczną strukturę, zwięzłe tytuły i nagłówki oraz linki do istotnych stron: [wskazówki dotyczące struktury i linków](https://developers.google.com/search/docs/appearance/sitelinks).

### Języki i adresy

- Zacząć od pełnych wersji **PL i EN**, ponieważ istnieje już angielski landing page, a pierwsze działania promocyjne można prowadzić w Polsce.
- Przykładowa para: `/pl/szkic-ogrodu/` i `/en/garden-sketch/`. Kolejne języki DE/FR/ES dodawać po przygotowaniu i sprawdzeniu całej treści danej podstrony.
- Każdy język ma własny adres i własny canonical. Między rzeczywiście przetłumaczonymi odpowiednikami dodać wzajemne `hreflang`; nie kierować wszystkich tłumaczeń przez canonical do wersji angielskiej.
- Zapewnić widoczny przełącznik języka; nie uzależniać dostępu do treści wyłącznie od języka przeglądarki ani automatycznego przekierowania.
- Ustalić rolę `/` przed wdrożeniem, np. pozostawić tam obecną stronę EN i przekierować ją trwale do `/en/` po migracji. Nie utrzymywać równolegle dwóch identycznych angielskich stron pod `/` i `/en/` bez ustalenia preferowanej wersji.
- Zachować działanie obecnych linków do dokumentów prawnych używanych przez aplikację. Zmiany tych adresów wymagają przekierowań i osobnego sprawdzenia.

Źródło: [wersje językowe i hreflang](https://developers.google.com/search/docs/specialty/international/localized-versions).

### Wymagania techniczne

- Pozostać przy statycznym HTML w Firebase Hosting. Każda podstrona może być osobnym plikiem `index.html` w katalogu odpowiadającym adresowi; nie jest potrzebny backend ani przebudowa strony w aplikację JavaScript.
- Każda strona musi działać po bezpośrednim otwarciu adresu i udostępniać zasadniczą treść oraz linki w HTML. Istniejące fragmenty `#how` czy `#workflow` nadal mogą służyć do nawigacji wewnątrz strony, ale nie zastępują adresów podstron.
- Zapewnić unikalne title, description, opisowy H1, prawidłowy język dokumentu i canonical. W mapie witryny umieszczać tylko docelowe, indeksowalne adresy zwracające HTTP 200.
- Nieistniejące adresy mają zwracać HTTP 404; nie przekierowywać wszystkich nieznanych ścieżek na landing page.
- Utrzymać szybkie ładowanie na telefonie: obrazy o dopasowanym rozmiarze, WebP, określone wymiary grafik i opóźnione ładowanie obrazów poza pierwszym ekranem. Filmy ładować oszczędnie, np. po kliknięciu miniatury.
- Sprawdzić działanie menu, zmianę języka, pobieranie przykładów i linki do Google Play na telefonie.

### Etapy rozbudowy

**Etap 1 — podstawa i główne zastosowanie:** strona główna, „Jak to działa”, „Szkic ogrodu” i „Eksport DXF” w PL i EN, wspólna nawigacja oraz SEO techniczne. Publikować tylko ukończone strony, bez pustych zapowiedzi.

**Etap 2 — odpowiedzi na kolejne potrzeby:** „Plan pokoju” i „Pomoc”, przygotowane na podstawie osobnego przykładu wnętrza i pytań użytkowników.

**Etap 3 — rozwój na podstawie danych:** kolejne języki i case studies. Osobny poradnik o szacowaniu długości krokami lub szkicu działki dodać dopiero, gdy można przedstawić odrębny, przydatny materiał. Nie tworzyć serii podobnych stron różniących się jedynie frazą, nazwą miasta lub typem obiektu.

Google wskazuje ryzyko stron tworzonych masowo pod podobne zapytania bez dodatkowej wartości: [zasady dotyczące doorway abuse i scaled content abuse](https://developers.google.com/search/docs/essentials/spam-policies).

### Ocena po publikacji

- Po wdrożeniu sprawdzić kody HTTP, canonical, wzajemne linki językowe i odczyt treści w narzędziu sprawdzania adresu URL w Search Console.
- Zapisać datę publikacji i zgłoszenia mapy. Pierwszy przegląd danych wykonać po około 4 tygodniach, kolejny po 8–12 tygodniach; to harmonogram analizy, nie obietnica indeksowania lub ruchu.
- Analizować indeksowanie, zapytania, wyświetlenia, kliknięcia i CTR osobno dla stron oraz języków. Mała liczba danych nie pozwala jeszcze ocenić skuteczności.
- Jeśli skonfigurowano odpowiedni pomiar, obserwować kliknięcia do Google Play. Odróżniać je od rzeczywistych instalacji, których przypisanie do strony wymaga osobnego sposobu atrybucji.
- Rozbudowywać materiały według rzeczywistych pytań i braków w treści; nie zwiększać liczby podstron wyłącznie dla liczby adresów.

## Kolejność działań i odbiór

- [ ] Wybrać domenę i rejestratora po ponownym sprawdzeniu dostępności i cen.
- [x] Dopracować treść, tytuł i opis strony.
- [x] Przygotować treści i przykłady dla etapu 1 serwisu z podstronami, zgodnie z koncepcją powyżej.
- [x] Przygotować pliki robots.txt, sitemap.xml i plik weryfikacyjny Google.
- [x] Sprawdzić przygotowane zmiany i opublikować je w Firebase Hosting.
- [ ] Zakończyć weryfikację w Search Console, zgłosić mapę i stronę główną.
- [ ] Po zakupie skonfigurować własną domenę, HTTPS i preferowany adres oraz zaktualizować konfigurację SEO i Search Console.
- [ ] Zapisywać daty wdrożeń oraz obserwować indeksowanie, wyświetlenia, kliknięcia i przejścia do Google Play w zakresie dostępnych danych.

Stan realizacji: etap 1 wdrożony i odebrany; własność Search Console potwierdzona wcześniej przez użytkownika. Pozostają kontrola indeksowania i przetworzenia aktualnej mapy, pomiar wydajności oraz opcjonalna własna domena. Historia i pierwotne założenia powyżej nie oznaczają otwartych zadań zakończonego etapu.
