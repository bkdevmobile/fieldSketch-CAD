# Materiały Google Play — outlineGo

Rzeczywiste zrzuty aplikacji PL/EN z emulatora (24.10.2026), po sześć ekranów telefonu, tabletu 7″ i tabletu 10″: [emulator-screenshots/README.md](emulator-screenshots/README.md). Podgląd kamery korzysta z wygenerowanej sceny ogrodu; interfejs pochodzi z uruchomionego APK.

Wybrane przez użytkownika grafiki PL, przygotowane 23.10.2026:

- **01 — Z terenu do CAD**: zielony kolaż ogrodu, szkicu i CAD.
- **02 — Zaplanuj przestrzeń**: pomiar przy tarasie i przykładowy szkic.

## Pliki do Play Console

Gotowe zestawy według sekcji formularza wskazanych przez użytkownika:

| Sekcja Play Console | Folder | Zawartość |
| --- | --- | --- |
| Telefon | `screenshots/phone/` | 2 PNG, po 1080 × 1920 px, 9:16 |
| Tablet 7-calowy | `screenshots/tablet-7/` | 2 PNG, po 1080 × 1920 px, 9:16 |
| Tablet 10-calowy | `screenshots/tablet-10/` | 2 PNG, po 1080 × 1920 px, 9:16 |

1080 × 1920 spełnia podane przedziały wszystkich trzech sekcji: 320–3840 px dla telefonu i tabletu 7″ oraz 1080–7680 px dla tabletu 10″. Wszystkie pliki są mniejsze niż 8 000 000 bajtów. Zachowano te same wybrane kompozycje, bez skalowania w górę. To formatowanie wybranych grafik marketingowych; nie powstały nowe zrzuty interfejsu uruchomionego na tabletach. Raport kontroli każdej kopii: `device-screenshots-validation.json`. Odtworzenie: `node googlePlay/prepare-device-screenshots.cjs`.

Pozostałe pliki i alternatywne formaty:

| Folder | Wymiary | Zastosowanie |
| --- | --- | --- |
| `screenshots/portrait/` | 1080 × 1920 | Dwie wybrane grafiki pionowe do galerii telefonu; kompozycje zachowane |
| `screenshots/landscape/` | 1920 × 1080 | Dodatkowe poziome wersje tych grafik do galerii telefonu; nie są obowiązkowe |
| `feature-graphic/` | 1024 × 500 | Dwa alternatywne warianty wymaganej grafiki promocyjnej; wgrać jeden wybrany |
| `icon/` | 512 × 512 | Istniejąca ikona outlineGo, dopasowana do formatu sklepu |

Grafiki galerii i promocyjne: PNG RGB 24-bit, bez przezroczystości. Ikona: PNG RGBA 32-bit, poniżej 1024 KB. Format i wymiary sprawdzono automatycznie; wyniki w `validation.json`. Wszystkie materiały mają polskie teksty.

Google nie wymaga jednej sztywnej rozdzielczości każdego screenshota telefonu: akceptuje 320–3840 px, z proporcją dłuższego boku do krótszego najwyżej 2:1. Powyższe formaty 9:16 i 16:9 spełniają także zalecane wymiary dla wybranych formatów rekomendacji. Do nich Google wymaga przynajmniej czterech screenshotów; pozostałe zrzuty użytkownik przygotowuje sam.

Zestaw dotyczy obecnej aplikacji Android na telefon. Dodatkowe grafiki TV, Wear OS, Automotive i XR mają osobne zasady i są potrzebne przy dystrybucji na te platformy. Kolaże telefonu nie zastępują rzeczywistych ekranów aplikacji na innych typach urządzeń.

## Źródła i odtworzenie

`sources/` zawiera wybrane pionowe oryginały i poziome adaptacje. Pionowe kompozycje zachowano; poziome przeprojektowano przez wbudowane image_gen. Drobny tekst karty szkicu ograniczono w wersji promocyjnej, aby był czytelny w małym rozmiarze. Widoki aplikacji i CAD pozostają wygenerowanymi wizualizacjami z wybranych koncepcji; nie są zrzutami piksel w piksel. Materiały opisują DXF jako funkcję Plus.

Pełne prompty adaptacji: `prompts.json`. Eksport techniczny i walidacja: `node googlePlay/prepare-assets.cjs` z katalogu projektu, z zależnościami aplikacji. `prepare-assets.cjs` wykonuje wyłącznie skalowanie proporcjonalne, normalizację kolorów i zapis do formatów sklepu; nie rozciąga ani nie ucina treści.

Źródło wymagań, sprawdzone 23.10.2026: https://support.google.com/googleplay/android-developer/answer/9866151?hl=pl

## Proponowane teksty alternatywne

- 01: Ogród, szkic w outlineGo i poglądowy widok pliku DXF w CAD. Eksport DXF dostępny w Plus.
- 02: Użytkownik z telefonem przy tarasie oraz przykładowy szkic czterech punktów z obwodem i polem.
- Ikona: Zielony znak outlineGo przedstawiający szkic obrysu z punktami.
