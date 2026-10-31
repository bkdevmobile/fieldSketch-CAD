# Plan mediów WWW outlineGo

**Stan materiałów na 31.10.2026: V01–V06 gotowe lokalnie w PL i EN.** Filmy nie są jeszcze podłączone do WWW ani opublikowane. Statyczny etap 1 WWW został opublikowany 30.10.2026; produkcja filmów jest osobnym zakresem.

**Stała decyzja użytkownika: pomiar za pomocą czujników telefonu jest największym atutem outlineGo i głównym przekazem promocyjnym.** W materiałach WWW, Google Play, filmach, ilustracjach i tekstach pierwszeństwo ma celowanie kamerą → zapis kierunku z czujników orientacji → krokomierz Start → przejście → zatrzymanie → Stop → zapis punktu i szkic. Ręczne wpisywanie kierunków i wymiarów jest opcją uzupełniającą. Kamera jest celownikiem; odległość z kroków jest szacunkowa i zależy od długości kroku. Nie sugerować skanowania AR ani pomiaru odległości samą kamerą.

| Film — dokumentacja, podglądy i raporty | Długość PL/EN | Aktualna zawartość | Muzyka — Kevin MacLeod, CC BY 4.0 |
| --- | --- | --- | --- |
| [V01 — Od szkicu do CAD](../media/www/video-v01/README.md) | 60 s | Przegląd: bok → PNG → DXF → LibreCAD; poprawione kadrowanie CAD | Easy Lemon (60 second) |
| [V02 — Pierwszy szkic](../media/www/video-v02/README.md) | 224 s (3:44) | Ręczne wymiary, korekta 3,8 → 4 m, obrys 4 × 3 m, 14 m / 12 m² i PNG | Carefree |
| [V03 — Od pomiaru do szkicu](../media/www/video-v03/README.md) | 45 s | Ilustracja pomiaru ogrodu, rzeczywiste UI i PNG; płynne oddalenie bez ruchu na boki | Wallpaper |
| [V04 — Eksport DXF do CAD](../media/www/video-v04/README.md) | 144 s (2:24) | Eksport Plus, obrys 4 × 3 m w LibreCAD, jednostka Metr i obwód 14 m; bez okna plików | Life of Riley |
| [V05 — Szkic pokoju](../media/www/video-v05/README.md) | 72 s (1:12) | Ilustracja pomiaru pokoju oraz pełna instrukcja: 5 × 4 m, korekta 4,8 → 5 m, 18 m / 20 m² i PNG | Dream Culture |
| [V06 — Kamera i krokomierz](../media/www/video-v06/README.md) | 108 s (1:48) | Priorytet promocyjny: celownik, kierunek, Start/Stop, rosnący licznik, zapis boku i PNG | Montauk Point |

Ostatnie wykonane poprawki:

- **V01/V04 — prywatność:** usunięto okno wyboru pliku i wykadrowano CAD do potrzebnego rysunku, jednostek i odczytu długości. Lokalne pliki, ścieżki i historia nie pojawiają się w poprawionych filmach. Surowe nagrania są wyłącznie materiałem produkcyjnym; publikować pliki z katalogów `output`.
- **V03 — ruch ilustracji:** pierwsze 12 s ma delikatne oddalenie 1,035 → 1,000 ze stałym środkiem i łagodnym początkiem/końcem. Transformacja zmiennoprzecinkowa zastąpiła zoompan powodujący wrażenie skakania. PL/EN, miniatury i podglądy odtworzono.
- **V05 — ilustracja pokoju:** dodano 12 s otwarcia z takim samym spokojnym oddaleniem oraz obraz przy pierwszym wymiarze. Dotychczasowe 60 s instrukcji zachowano; aktualna długość to 72 s. Obrazy V03/V05 są wygenerowane, postacie nieruchome; nie dokumentują fizycznego pomiaru.
- **V06 — zrealizowana symulacja zaakceptowana przez użytkownika:** emulator nie ma detektora kroków. Tymczasowy adapter dostarczał kierunki i kroki 8 / 6 / 8; rzeczywiste UI, przelicznik 75 cm, SQLite, geometria i PNG dają 6 × 4,5 m, 21 m / 27 m². Wirtualna kamera otrzymała wygenerowany obraz ogrodu z pliku. Symulację ujawniono pod odtwarzaczem i w metadanych MP4. Oryginalny kod, APK, bazę i profil emulatora przywrócono; testowy APK i wyniki builda usunięto. Pochodzenie i potwierdzenie przywrócenia zapisano w dokumentacji oraz `sources/restoration.json` zestawu V06.

Stałe zasady kolejnych filmów:

- Spokojne tempo, czytelne pauzy, bez przyspieszania kroków.
- Bez dolnych napisów dublujących opis po lewej i bez technicznych podpisów o tempie, pauzach, emulatorze, montażu czy kodach Vxx. W obrazie tylko treść pomocna widzowi.
- Bez prywatnych plików, folderów, ścieżek, historii, kont i zbędnych elementów pulpitu.
- Ilustracje: delikatne oddalenie ze stałym środkiem, bez przesuwania na boki i skakania.
- Cicha muzyka, inna melodia dla kolejnego filmu; kredyty i pochodzenie materiałów poza obrazem filmu. Zachować wersje bez dźwięku.
- Symulacje i ilustracje jasno opisywać pod filmem i w metadanych. Demonstracja emulatora nie potwierdza fizycznej dokładności sensorów.

Wszystkie wersje mają 1920 × 1080, 30 kl./s, H.264 i muzykę AAC stereo. Zaktualizowane zestawy przeszły kontrole obrazu, dźwięku, źródeł i geometrii; raporty oraz arkusze klatek znajdują się w katalogach filmów.

**Zapis w Git:** V02/V04 — `7293534`; V01 — `d41f643`; pierwotny V03 — `1d8c2e9`. V05, V06, późniejsze poprawki V01/V03/V04 i bieżące notatki pozostają bez nowego commita.

**Następne prace:** odbiór aktualnych filmów przez użytkownika; następnie osobna integracja z WWW i publikacja na jego polecenie, z pierwszeństwem V06 oraz przekazu o sensorach. Opcjonalne nagranie fizycznego pomiaru telefonem może uzupełnić demonstrację. Gotowość V05 nie oznacza realizacji podstrony pokoju z etapu 2.

Poniższe wpisy zachowują historię i wcześniejsze założenia; aktualny stan filmów podano powyżej.

Data: **29 października 2026**. Status: statyczne media pierwszego etapu przygotowane; integracja ze stroną i filmy do wykonania, bez publikacji nowych mediów.

Aktualizacja 29.10.2026: przygotowano ilustracje PL 01–04 w `media/www/illustrations-pl/` (preferowane CAD v2) oraz rzeczywiste zrzuty aplikacji 1.0.0/v4 w `media/www/app-screenshots/`: po 13 ekranów PL i EN. Dziewięć pokazuje Free, cztery kolejne eksport DXF, systemowe udostępnianie, komunikat gotowości i PNG bez znaku wodnego. Dodatkowe ekrany wykonano na wyraźne polecenie użytkownika z tymczasowym mockiem uprawnienia Plus; sam kod eksportu i UI pozostał bez zmian. Mock, jego APK i wyniki builda usunięto, kod i oryginalny APK emulatora przywrócono. Zachowano wygenerowane DXF PL/EN. Szczegóły pochodzenia, ograniczenia testu, arkusze kontaktowe i raport SHA256 są w katalogu zestawu. Pozostałe punkty tego dokumentu opisują plan; mediów nie opublikowano na WWW.

Aktualizacja CAD 29.10.2026: wykonano rzeczywiste zrzuty importu własnych plików DXF w LibreCAD 2.2.1.5. Zestaw `media/www/librecad-screenshots/` zawiera po trzy główne ujęcia PL i EN (cały obrys, detal, jednostki i warstwy) oraz dwa dodatkowe ujęcia EN dokumentujące pomiar 8.0000 m i wersję programu. Źródłowe DXF pozostały niezmienione; szczegóły i sumy kontrolne są w README i raporcie zestawu. Materiały nie zostały jeszcze opublikowane na WWW.

Aktualizacja domknięcia statycznych mediów etapu 1 (29.10.2026): katalog `media/www/stage1-completion/` zawiera cztery brakujące zrzuty PL/EN (niezapisana korekta istniejącego boku i aktywne pole notatki), schemat kroków w układzie szerokim i pionowym, schemat punktów ogrodu, montaże rzeczywistych ekranów aplikacji i CAD oraz warianty WebP do WWW. Zachowano oryginalne eksporty PNG Free i dokładne kopie sprawdzonych DXF do pobrania. Galeria, pochodzenie i manifest sum kontrolnych znajdują się w katalogu zestawu. Statyczne media są gotowe do integracji; filmy V02/V04/V01 pozostają do osobnej realizacji. Brak deployu; etap 2 poza zakresem.

Cel: pokazać przebieg pracy i jej wynik: szkic na telefonie → eksport → dalsza praca na komputerze. Pierwszy etap obejmuje stronę główną, pierwszy szkic, ogród i eksport DXF w PL oraz EN. Pokój i pomoc należą do drugiego etapu.

## Zasady wspólne

- Interfejs pokazujemy na rzeczywistych zrzutach i nagraniach aplikacji. Nie generujemy UI ani wyników eksportu.
- Jeden przykładowy ogród ma ten sam obrys, oznaczenia i wymiary w instrukcji, PNG, DXF i programie CAD. Obecny przykład 32 m / 55 m² może być bazą po sprawdzeniu danych źródłowych i eksportu.
- Rozróżniamy rzeczywisty pomiar terenowy od przykładu demonstracyjnego. Obecne zrzuty emulatora zawierają prawdziwy UI, ale ogród w kamerze jest wygenerowaną sceną i nie dokumentuje pomiaru w terenie.
- Zdjęcia ilustracyjne mogą budować kontekst. Dowód funkcji zapewniają rzeczywisty UI, plik eksportu i jego otwarcie w osobnym programie CAD.
- Napisy, numerację kroków i strzałki na WWW składamy w HTML lub SVG. Bazowe zdjęcia pozostają bez tekstu, wspólne dla PL i EN. UI przechwytujemy w obu językach.
- Pokazujemy aktualną wersję aplikacji. Starsze zrzuty z października wymagają porównania z wersją używaną przy publikacji.
- Materiały DXF oznaczamy jako funkcję Plus. Nie sugerujemy profesjonalnej dokładności ani eksportu DWG.

## Co już mamy

| Materiał | Lokalizacja | Decyzja |
| --- | --- | --- |
| Zdjęcie kontekstowe ogrodu | `public/assets/garden-measurement-*.webp` | Zachować jako kandydat do nagłówka; ilustracja, nie zapis testu terenowego. |
| Trzy kroki teren → eksport → komputer | `public/assets/workflow-*`, `googlePlay/workflow-en/` | Wykorzystać układ i zdjęcie terenowe. Panel CAD docelowo zastąpić prawdziwym importem własnego DXF. |
| Zrzuty PL/EN: pomiar, podsumowanie, szkic, wymiary, PNG | `googlePlay/emulator-screenshots/{pl,en}/phone/` | Wykorzystać po przeglądzie aktualności; przygotować wersje WWW. Lista szkiców przyda się do pomocy. |
| Kolaże „Plan your space” i „From field to CAD” | `public/assets/plan-your-space-*`, `field-to-cad-*` | Materiały uzupełniające; na stronach instruktażowych preferować osobne, czytelne ekrany i wyniki. |
| Film promocyjny EN, 15 s, pionowy | `googlePlay/promo-en/` | Opcjonalny teaser po kliknięciu. To animowany montaż ilustracji i zrzutu, nie nagranie obsługi. Na WWW wybrać wersję bez muzyki. |
| Logo i badge Google Play | `public/assets/` | Ponownie wykorzystać istniejące pliki. |

## Media według podstrony

### 1. Strona główna — `/pl/`, `/en/`

Cel: w kilka sekund wyjaśnić, co użytkownik zrobi i co otrzyma.

- **Grafika główna:** istniejące zdjęcie ogrodu oraz osobny, czytelny ekran ukończonego szkicu. Układ responsywny, bez utrwalania dwóch elementów w jednym szerokim obrazie.
- **Trzy kroki:** zdjęcie pracy z telefonem → rzeczywisty podgląd szkicu/eksportu → rzeczywisty widok tego samego pliku w CAD. Podpisy poza obrazami.
- **Dwa podglądy zastosowań:** ogród w etapie 1, pokój po przygotowaniu etapu 2. Każdy prowadzi do poradnika; bez pustych zapowiedzi.
- **Film przeglądowy V01:** gotowy, 60 s, „Od szkicu do CAD”, uruchamiany przyciskiem. Montaż V02/V04 z instrukcjami i ekranami w odpowiednim języku, bez technicznych podpisów i dolnych napisów.
- **Miniatura filmu:** gotowy szkic i jego odpowiednik na komputerze; przycisk odtwarzania jako element strony.

### 2. Jak to działa — `/pl/jak-to-dziala/`, `/en/how-it-works/`

Cel: umożliwić wykonanie pierwszego szkicu.

- **Sekwencja pięciu ekranów:** rozpoczęcie szkicu → zapis kierunku i długości → dodanie kolejnego odcinka → korekta wymiaru → podsumowanie i PNG.
- Dwa lub trzy ekrany można oprzeć na obecnych materiałach. Brakujące stany trzeba przechwycić. Każdy krok pokazuje jedną czynność, z tekstem instrukcji obok.
- **Prosty schemat SVG/HTML:** kierunek → długość → zapis punktu. Bez generowanego obrazu rastrowego.
- **Film V02:** gotowy, 224 s; pierwsze wykonanie małego szkicu z ręcznie wpisywanymi długościami, korektą i eksportem PNG. Widoczne dotknięcia, bez ekranów logowania i danych prywatnych.
- **Wynik do pobrania:** rzeczywisty PNG użytego przykładu. Widoczny wariant Free/Plus musi odpowiadać nagraniu.

### 3. Szkic ogrodu — `/pl/szkic-ogrodu/`, `/en/garden-sketch/`

Cel: pokazać kompletny przykład od przestrzeni do szkicu.

- **Zdjęcie kontekstowe:** cały przykładowy ogród, możliwie czytelny obrys i punkty odniesienia. Jeśli nie wykonamy rzeczywistej sesji terenowej, przykład opisujemy jako demonstrację, z ilustracją zamiast deklaracji prawdziwego pomiaru.
- **Schemat punktów:** oznaczenia P1–Pn odpowiadające szkicowi; nakładka SVG na zdjęciu lub osobny plan poglądowy. Nie wymyślamy zgodności wymiarów wygenerowanego zdjęcia z planem.
- **Trzy ekrany:** szkic w trakcie → korekta/notatki → ukończony obrys z wymiarami.
- **Wynik:** PNG i opcjonalnie ten sam DXF wykorzystany na stronie eksportu. Pliki bez danych osobowych.
- **Film V03:** gotowy lokalnie, 45 s, ilustracja pomiaru ogrodu z płynnym oddaleniem, rzeczywiste UI i PNG. Film V06 (108 s) przedstawia kamerę i krokomierz z ujawnioną symulacją odczytów. Rzeczywista sesja terenowa pozostaje opcjonalnym uzupełnieniem.

### 4. Eksport DXF — `/pl/eksport-dxf/`, `/en/dxf-export/`

Cel: wykazać rzeczywisty transfer do osobnego programu CAD.

- **Trzy ujęcia:** akcja eksportu w aplikacji → wybór udostępnienia/zapisu → plik otwarty w wybranym programie CAD.
- **Porównanie obok siebie:** ten sam obrys w outlineGo i po imporcie, spójna orientacja oraz czytelne wymiary. Nazwę programu CAD podajemy w podpisie.
- **Detal techniczny:** ekran jednostek i warstw, jeżeli są istotne dla użytego procesu. Własne adnotacje poza oryginalnym zrzutem.
- **Film V04:** gotowy, 144 s; eksport Plus → przeniesienie pliku → otwarcie w LibreCAD → kontrola jednostki Metr i obwodu 14 m. Bez przyspieszania; informacje o montażu i pochodzeniu wyłącznie w dokumentacji.
- **Przykładowy plik DXF:** rzeczywisty eksport aplikacji, sprawdzony w pokazanym programie. Obok podgląd PNG, jednostki, wersja aplikacji i krótka instrukcja otwarcia.
- Dostęp do działającego eksportu Plus i programu CAD trzeba potwierdzić przed produkcją. Nie zastępujemy ich ilustracją funkcji.

### 5. Pokój — etap 2

- Zdjęcie rzeczywistego wnętrza lub jawnie ilustracyjna scena.
- Osobny przykład z ręcznymi wymiarami: szkic początkowy, korekta i ukończony PNG.
- Film V05 gotowy lokalnie w PL/EN, 72 s: ilustracja pomiaru pokoju oraz rzeczywisty szkic 5 × 4 m z ręcznie wpisanymi długościami, korektą i eksportem PNG. To demonstracja wpisywania wymiarów, nie test sensorów ani fizyczny pomiar wnętrza.

### 6. Pomoc — etap 2

- Małe, celowane zrzuty: zapis/otwarcie szkicu, eksport, ekran Plus i przywrócenie zakupu.
- Krótkie nagrania 10–20 s dopiero dla czynności, których nie wyjaśnia tekst i jeden zrzut. Bez obowiązkowego filmu w każdym pytaniu.

## Scenariusze filmów pierwszego etapu

| Film | Przebieg | Źródło |
| --- | --- | --- |
| V01 — przegląd, gotowy | 0–8 s: gotowy szkic; 8–20 s: zapis boku; 20–30 s: PNG; 30–40 s: DXF; 40–52 s: ten sam obrys w CAD; 52–60 s: pobranie aplikacji | Montaż rzeczywistych nagrań i zrzutów V02/V04; PL/EN, bez osobnej sesji emulatora. |
| V02 — pierwszy szkic | Start → kierunek/długość → kolejne odcinki → korekta → zapis i PNG | Rzeczywiste nagranie UI, PL/EN; emulator; pochodzenie demonstracji opisane w dokumentacji. |
| V04 — do CAD | Gotowy szkic → eksport DXF Plus → zapis/przeniesienie → otwarcie w CAD → kontrola jednostek/wymiaru | Rzeczywiste nagranie aplikacji i pulpitu, działający eksport Plus. |

Lektor nie jest wymagany. Filmy mają być zrozumiałe bez dźwięku, z krótkimi podpisami i tekstowym opisem kroków na stronie. Wersje językowe montujemy z tego samego scenariusza, nie nagrywamy dwóch różnych przykładów.

## Parametry produkcyjne i dostarczenie

To założenia projektu, do sprawdzenia po pierwszym eksporcie i przeglądzie na telefonie.

- Zdjęcia: źródła zachować w pełnej rozdzielczości; WWW w WebP, warianty szerokości 480/960/1440 px według miejsca użycia. Kadrowanie 4:3 dla scen i 16:9 dla miniatur filmów.
- UI: oryginalne PNG jako pliki wzorcowe; na WWW wersje PNG/WebP dobrane po porównaniu czytelności. Zrzuty telefonu pionowe, bez rozciągania; drobnego tekstu nie wciskać w szeroką miniaturę.
- Wyniki i schematy: zachować oryginalny PNG eksportu; adnotacje i schematy jako SVG/HTML. Nie usuwać znaku wodnego Free z materiałów.
- Filmy instruktażowe: master 1920 × 1080, 30 kl./s, MP4 H.264; pionowy ekran aplikacji umieścić obok krótkiego opisu lub detalu. Nie ucinać ważnych kontrolek dla wypełnienia kadru. Na telefonie zapewnić pełny ekran i czytelny powiększony detal.
- Wariant pionowy 1080 × 1920 jest dodatkowym eksportem promocyjnym, nie warunkiem uruchomienia serwisu.
- Każdy film: miniatura WebP, krótki transkrypt/opis w HTML, instrukcje PL/EN w obrazie. Bez dolnych ścieżek napisów dublujących instrukcje. Cichy podkład muzyczny, inna melodia dla kolejnego filmu; kredyty zgodne z licencją poza obrazem. Wersje bez dźwięku zachować.
- Filmy uruchamiane po kliknięciu, bez autoplay z dźwiękiem; `preload="none"`, miniatura zamiast pobierania filmu przy wejściu na stronę. Wybrać hosting plików po ustaleniu rzeczywistych rozmiarów i przewidywanego transferu.
- Roboczy budżet zdjęcia: 80–200 KB, większy obraz główny do około 250 KB; czytelność UI ma pierwszeństwo przed limitem. Cel dla filmu: około 8–20 MB/min, do oceny na rzeczywistym materiale.
- Źródła poza `public/`, np. `media/www/sources/`; do `public/assets/` trafiają wyłącznie używane wersje WWW. Nazwy: `garden-summary-pl-960.webp`, `first-sketch-en.mp4`, `dxf-export-pl.mp4`.

## Kolejność produkcji i minimum do publikacji

1. Ustalić jeden demonstracyjny ogród; sprawdzić zgodność punktów, wymiarów, jednostek i wyniku w aplikacji. Przygotować osobny scenariusz pierwszego, prostego szkicu.
2. Potwierdzić działający eksport Plus i możliwość otwarcia własnego DXF w wybranym programie CAD.
3. W jednej sesji przechwycić brakujące ekrany PL/EN i nagrania V02/V04. Z tych nagrań wybrać dodatkowe klatki do instrukcji.
4. Przygotować podgląd prawdziwego importu CAD, PNG/DXF do pobrania i wersje WWW istniejących zdjęć.
5. Opublikować cztery kompletne podstrony PL/EN z obrazami i plikami wynikowymi. Filmy nie blokują publikacji, jeśli instrukcja tekstowa i zrzuty wystarczają do wykonania czynności.
6. V01–V06 są gotowe lokalnie w PL/EN. Odbiór, integracja filmów i publikacja pozostają osobnym zadaniem. W prezentacji funkcji pierwszeństwo ma V06 o kamerze i krokomierzu; V05 jest materiałem do przyszłej podstrony pokoju.

**Minimalny zestaw etapu 1:** istniejące zdjęcia kontekstowe, zestaw pięciu kroków pierwszego szkicu w PL/EN, trzy stany przykładu ogrodu w PL/EN, rzeczywisty eksport/udostępnienie DXF w PL/EN, jeden widok CAD i jego czytelny detal, gotowe PNG/DXF oraz miniatury użytych filmów. Część ekranów można współdzielić między stronami, jeśli opisuje tę samą czynność. Gotowe filmy: V01–V06; w promocji pierwszeństwo ma V06. Dodatkowe nagranie fizycznego pomiaru w terenie jest opcjonalne.

## Odbiór

- [ ] UI odpowiada publikowanej wersji i właściwemu językowi.
- [ ] Szkic, PNG i DXF przedstawiają ten sam przykład; jednostki i kontrolny wymiar po imporcie są poprawne.
- [ ] Oznaczenia Free/Plus i znaki wodne odpowiadają rzeczywistemu stanowi.
- [ ] Sceny ilustracyjne i dane demonstracyjne są opisane zgodnie z pochodzeniem.
- [ ] Brak prywatnych danych, kont, powiadomień i zbędnych elementów pulpitu.
- [ ] Tekst na obrazach i nagraniach jest czytelny na telefonie; napisy PL/EN pasują do obrazu.
- [ ] Obrazy mają opisy alternatywne i określone wymiary; filmy mają miniatury i nie pobierają się automatycznie.
- [ ] Zapisano źródła, datę przechwycenia, wersję aplikacji oraz program CAD użyty do weryfikacji.
