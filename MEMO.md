# Stan prac nad FieldSketch CAD

Aktualizacja: 19 października 2026.

## Aktualny rezultat

Pierwszy działający prototyp Android jest zaimplementowany w `app/`, skompilowany do samodzielnego APK oraz zainstalowany i uruchomiony na fizycznym telefonie użytkownika, model `23124RA7EO`. ADB potwierdził instalację wersji 0.1.0 i uruchomienie MainActivity. Nie przeprowadzono jeszcze walidacji dokładności pomiarowej na tym telefonie.

APK: `artifacts/FieldSketch-CAD-0.1.0.apk`, 83 506 579 bajtów, około 80 MiB. SHA256: `2BC6549E7945A4EACEE0966B957694FF24E0B62CE18D312467D8896F3A28894D`.

APK zawiera JavaScript, działa offline i nie wymaga Metro. Podpis jest deweloperski, do testów. Obsługiwane architektury: arm64-v8a i x86_64; minimum Android 7, target SDK 36.

## Wiążące ustalenia z użytkownikiem

- React Native z Expo, TypeScript; Android jako pierwsza platforma, bez backendu i kont.
- Pierwszy prototyp obejmuje pomiar i prosty obrys. Pełny edytor, solver, przekątne i DXF są późniejszym zakresem.
- Użytkownik wpisuje liczbę kroków, także ułamkową z polskim przecinkiem. Roboczy przelicznik: 1 krok = 75 cm. Wynik w cm jest oszacowaniem; geometria liczy w metrach.
- Logi mają być trwale zapisywane w prywatnej pamięci aplikacji, dostępne po restarcie i możliwe do skopiowania z aplikacji.
- Dostarczamy samodzielny APK, nie tylko development build.

## Dostępne funkcje

- Tworzenie, otwieranie i usuwanie projektów SQLite; zapis zatwierdzonych boków.
- Tylna kamera i celownik; tryby magnetyczny, względny i ręczny.
- Natywny Kotlin SensorManager: rotation vector i game rotation vector. Kierunek wyznaczany z poziomego rzutu osi tylnej kamery.
- Próbkowanie zadane 25 Hz, okno około 2 s, próg rozrzutu 3°, minimalny poziomy rzut osi 0,2. Słaba stabilność lub accuracy wymagają świadomego zaakceptowania ostrzeżenia.
- W nowej sesji sensora przy istniejących bokach wymagane jest odtworzenie odniesienia na wybranym znanym boku. Zapobiega to mieszaniu układów po wznowieniu lub zmianie trybu.
- Obrys SVG: punkty, długości, przesuwanie, zoom i dopasowanie; cofnięcie ostatniego boku zachowuje obserwację źródłową.
- Osobne zamknięcie topologiczne i niezależny pomiar powrotu do P1. Bez pomiaru powrotnego nie pokazujemy błędu zamknięcia. Pole tylko dla zamkniętego obrysu bez samoprzecięć.
- JSONL zapisywany natywnie, bufor utrwalany co sekundę, przy przechwyceniu i zakończeniu. Po awarii zachowujemy pełne rekordy i oznaczamy sesję jako przerwaną.
- Logi zawierają metadane, surowe sensory, kierunek, jakość, kroki i przelicznik, geometrię, operacje oraz błędy. Tester może dopisać kontekst i niezależne odniesienie.
- Podgląd, kopiowanie, usuwanie logów i eksport JSONL/CSV. Migawka aktywnej sesji jest spójna. Części kopiowania do 128 KiB zachowują granice rekordów i UTF-8; duże logi mają ponumerowane części.
- Limit logów 100 MiB, ostrzeżenie przy 80 MiB; bez automatycznego usuwania starszych sesji. Odczyt dużych logów został przyspieszony buforowanym indeksowaniem.

## Weryfikacja

- 29 testów TypeScript i 5 testów Kotlin przeszło, łącznie 34.
- TypeScript, release build, lintVital i weryfikacja podpisu APK przeszły.
- Expo Doctor: 21/22. Pozostało znane ostrzeżenie regresji pamięci Hermes V1 w SDK 56; nie zostało ukryte ani rozwiązane. Oficjalna poprawka wymaga późniejszej migracji SDK/RN, opisanej w instrukcji.
- Emulator Pixel 8 API 36: kamera, próbki sensora, przechwycenie, 2,5 kroku = 187,5 cm, zapis i powrót po wymuszonym zamknięciu, zachowanie danych po aktualizacji APK.
- Sprawdzono offline ręczne kąty, obrys czteropunktowy, pole, obwód i niezależny pomiar zamknięcia.
- Sprawdzono log około 1,54 MiB w 13 częściach, przechodzenie między częściami, sukces kopiowania i otwarcie systemowego udostępniania CSV. Nic nie wysłano do osób ani usług.
- Odczyt wklejonego tekstu przez automatyzację UI pokazał tylko 5000 znaków; nie stanowi to potwierdzenia kompletności całego wklejenia. Zachowanie pełnych rekordów i UTF-8 sprawdzają testy podziału logów.
- Emulator uruchomiony do testów został zamknięty; tryb samolotowy testowego emulatora wyłączono po próbie.

## Pliki i odtwarzanie środowiska

- [Instrukcja instalacji i testów](docs/technical/prototyp.md)
- [Dokument techniczny](docs/technical/dokumentacja-techniczna.md)
- [Analiza biznesowa](docs/technical/analiza-biznesowa.md)
- Źródłowy Word pozostaje bez zmian w `docs/business/`.
- Ekrany: `app/src/app/`; model i geometria: `app/src/domain/`; SQLite i adaptery: `app/src/infrastructure/`.
- Własny moduł: `app/modules/fieldsketch-orientation/`; natywny projekt `app/android/` jest generowany i ignorowany przez Git.
- Stos: Expo 56.0.23, React Native 0.85.3, React 19.2.3; zależności przypięte w package-lock.json. Expo Go nie obsługuje tego modułu.
- Windows: Node 20.19.6, Android SDK 36, NDK 27.1.12297006. Skrypt PowerShell ma UTF-8 z BOM i obsługuje ostrzeżenia narzędzi natywnych bez traktowania ich jako nieudanego builda.

W katalogu `app/`:

```powershell
npm ci
npm run typecheck
npm test
npm run build:apk
```

Skrypt budowania przypina szablon SDK 56, uruchamia testy natywne, buduje release z JavaScript i kopiuje APK do `artifacts/`. Artefakty, zależności oraz wyniki kompilacji są ignorowane przez Git.

Instalacja na jedynym podłączonym fizycznym urządzeniu:

```powershell
adb -d install -r artifacts/FieldSketch-CAD-0.1.0.apk
adb -d shell am start -n pl.fieldsketch.cad.prototype/.MainActivity
```

Przy pierwszym pomiarze kamerą użytkownik udziela zgody na kamerę. APK nie wymaga mikrofonu ani szerokiego dostępu do pamięci zewnętrznej.

## Git i następny krok

Gałąź: `prototype`. Ostatni commit kodu: `029ede4` — `feat: implement offline Android survey prototype with persistent logs`. Wcześniejsze commity dokumentacji: `12efd45` i `25c97e3`. Nie wykonywano pushowania. Przed utworzeniem tego memo katalog roboczy był czysty; samo memo nie zostało automatycznie commitowane.

W tej sesji Git wymagał jawnego `--git-dir=C:/projects/fieldSketch-CAD/.git --work-tree=C:/projects/fieldSketch-CAD`, ponieważ zwykłe polecenia zgłaszały właściciela repozytorium. Nie zmieniano globalnego safe.directory. Zapis metadanych Git oraz niektóre uruchomienia npm/Androida wymagały eskalacji sandboxa.

Najbliższy krok to test na telefonie użytkownika i analiza skopiowanych logów: poprawność osi celownika, stabilność kierunku, dryf, odtwarzanie odniesienia oraz wpływ kroków na długości i niedomknięcie. Brak danych terenowych nie pozwala deklarować dokładności. Nie rozszerzać samoczynnie zakresu o DXF, solver lub migrację SDK bez nowego zadania.
