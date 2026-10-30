# Plan mediów WWW outlineGo

Stan filmów na 30.10.2026: **V02 i V04 gotowe lokalnie w PL i EN; V01 pozostaje do montażu.** Filmy nie zostały opublikowane ani podłączone do strony WWW.

- **V02 „Pierwszy szkic”** — 224 s (3:44), 1920 × 1080 / 30 kl./s; ręczne wprowadzanie boków, korekta 3,8 → 4 m, wyliczone zamknięcie, 14 m / 12 m² i eksport PNG. Muzyka: „Carefree” — Kevin MacLeod, CC BY 4.0. Aktualne filmy: `media/www/video-v02/output/v02-first-sketch-{pl,en}-with-music.mp4`.
- **V04 „Od szkicu do CAD”** — 144 s (2:24), 1920 × 1080 / 30 kl./s; rzeczywisty eksport DXF tego samego tarasu 4 × 3 m, otwarcie w LibreCAD, jednostka Metr i kontrola obwodu 14 m. Inna melodia: „Life of Riley” — Kevin MacLeod, CC BY 4.0. Aktualne filmy: `media/www/video-v04/output/v04-dxf-to-cad-{pl,en}.mp4`.
- **Zasady użytkownika:** spokojne tempo i pauzy; bez dolnych napisów dublujących opis oraz bez technicznych podpisów o produkcji, tempie, pauzach, emulatorze, montażu czy kodach V02/V04. W obrazie tylko instrukcje pomocne widzowi. Kredyty muzyczne pod odtwarzaczem, w metadanych i opisie publikacji; szczegóły produkcji w dokumentacji.
- Obie wersje V04 przeszły pełne dekodowanie 4320 klatek, kontrolę dźwięku, geometrii, oryginalnych DXF i zgodności obrazu z wersją bez dźwięku. Zapisano miniatury, podglądy, transkrypty i źródła. Po nagraniu z tymczasowym testowym uprawnieniem Plus przywrócono kod i oryginalny APK; materiał nie potwierdza zakupu ani fizycznego pomiaru. Raporty: `media/www/video-v04/output/verification.json` i `sources/restoration.json`.

Następne prace: montaż V01 z istniejących materiałów V02/V04 oraz osobna integracja filmów ze stroną i publikacja na polecenie użytkownika. V03/V05 pozostają opcjonalnymi zadaniami dalszych etapów.

Podglądy, źródła i raporty: [V02](../media/www/video-v02/README.md), [V04](../media/www/video-v04/README.md). Poniższe aktualizacje z 29 października są historią; dalsze założenia filmów uwzględniają korekty użytkownika.

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
- **Film główny V01:** 45–60 s, „Od szkicu do CAD”, uruchamiany przyciskiem. Montaż V02/V04 z instrukcjami i ekranami w odpowiednim języku, bez technicznych podpisów i dolnych napisów.
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
- **Film V03, opcjonalny:** 45–75 s, rzeczywista praca w terenie i wynik. Nagranie telefonem lub osobną kamerą wymaga sesji terenowej; emulator nie potwierdzi działania fizycznych sensorów.

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
- Film V05, 45–60 s, opcjonalny: szkic pokoju z ręcznie wpisanymi długościami. Przykład różni się od ogrodu, także opisem ograniczeń pomiaru wewnątrz budynku.

### 6. Pomoc — etap 2

- Małe, celowane zrzuty: zapis/otwarcie szkicu, eksport, ekran Plus i przywrócenie zakupu.
- Krótkie nagrania 10–20 s dopiero dla czynności, których nie wyjaśnia tekst i jeden zrzut. Bez obowiązkowego filmu w każdym pytaniu.

## Scenariusze filmów pierwszego etapu

| Film | Przebieg | Źródło |
| --- | --- | --- |
| V01 — przegląd | 0–5 s: potrzeba i przestrzeń; 5–20 s: szkic; 20–30 s: PNG/DXF; 30–50 s: prawdziwy import i dalsza praca; 50–60 s: wynik i pobranie aplikacji | Montaż materiałów V02/V04, zdjęcie kontekstowe, bez konieczności osobnej sesji. |
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
6. V02/V04 są gotowe lokalnie. Złożyć V01 z tych materiałów; integracja filmów i publikacja pozostają osobnym zadaniem. V03 i V05 dopiero przy realizacji osobnych sesji/przykładów.

**Minimalny zestaw etapu 1:** istniejące zdjęcia kontekstowe, zestaw pięciu kroków pierwszego szkicu w PL/EN, trzy stany przykładu ogrodu w PL/EN, rzeczywisty eksport/udostępnienie DXF w PL/EN, jeden widok CAD i jego czytelny detal, gotowe PNG/DXF oraz miniatury użytych filmów. Część ekranów można współdzielić między stronami, jeśli opisuje tę samą czynność. Docelowe filmy: V02, V04 i montaż V01; terenowy V03 jest opcjonalny.

## Odbiór

- [ ] UI odpowiada publikowanej wersji i właściwemu językowi.
- [ ] Szkic, PNG i DXF przedstawiają ten sam przykład; jednostki i kontrolny wymiar po imporcie są poprawne.
- [ ] Oznaczenia Free/Plus i znaki wodne odpowiadają rzeczywistemu stanowi.
- [ ] Sceny ilustracyjne i dane demonstracyjne są opisane zgodnie z pochodzeniem.
- [ ] Brak prywatnych danych, kont, powiadomień i zbędnych elementów pulpitu.
- [ ] Tekst na obrazach i nagraniach jest czytelny na telefonie; napisy PL/EN pasują do obrazu.
- [ ] Obrazy mają opisy alternatywne i określone wymiary; filmy mają miniatury i nie pobierają się automatycznie.
- [ ] Zapisano źródła, datę przechwycenia, wersję aplikacji oraz program CAD użyty do weryfikacji.
