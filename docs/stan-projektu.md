# Aktualny stan outlineGo

## Aktualizacja WWW — 30 października 2026

Zakres użytkownika: **tylko pierwszy etap — opublikowany**. Osiem stron PL/EN i sześć finalnych dokumentów prawnych działa na [Firebase Hosting](https://outlinego-27ab5.web.app/pl/). Commit strony i SEO: **`fdcc1f3`**; potwierdzenie wdrożenia: **`97e7e84`**. Wersja Hosting: `056f218e8640f749`. Szczegóły, adresy i polecenia: [WWW — etap 1](www-etap-1.md), [audyt SEO](seo-audyt-2026-10-30.md). Źródła i pochodzenie mediów w `media/www/`.

Odbiór desktop wykonano w podglądzie VS Code; użytkownik potwierdził poprawne działanie na telefonie. Poprawiono przełącznik języka, oficjalne badge Google Play PL/EN, numerację poradnika, łamanie jednostki i zamykanie powiększenia przez Escape. Podłączono ilustracje udostępniania z ikonami e-maila, wiadomości i pliku. Wdrożono lżejsze obrazy, precyzyjniejsze wstępy oraz JSON-LD WebSite/BreadcrumbList. Lokalna kontrola ośmiu stron, sześciu dokumentów, 392 odwołań, metadanych, mediów i HTTP przeszła. Po deployu 25 publicznych zasobów porównano SHA-256 z lokalnymi plikami: zgodne; potwierdzono 301 do /en/ i rzeczywiste 404. Filmy V02/V04/V01 to osobne zadanie; pokój i pomoc należą do etapu 2, poza bieżącym zakresem.

Użytkownik potwierdził własność w Search Console 29.10. Nowa mapa ośmiu stron i robots.txt są opublikowane i zgodne z lokalnymi plikami. Pozostaje ponownie sprawdzić przetworzenie mapy oraz indeksowanie w Search Console po wcześniejszym błędzie odczytu i limicie próśb; obecny stan panelu jest niepotwierdzony. Do wykonania także PageSpeed Insights/Core Web Vitals. W ramach tych prac nie zmieniano aplikacji, paczek ani telefonu.

Poniższy stan aplikacji i paczek zachowuje datę ostatniej weryfikacji; stan WWW i dokumentów zaktualizowano 30.10.2026.

Aktualizacja: **24 października 2026**. Wersja **1.0.0 / versionCode 4**, pakiet `com.bk.dev.mobile.outlinego`; podpisane AAB i APK z bazy `f14a274` oraz zmian R8. Telefon nadal ma APK v2; nowe wydanie sprawdzono na osobnym emulatorze. Ten dokument opisuje bieżący stan; starsze wpisy w [MEMO](../MEMO.md) zachowują wyniki historyczne.

## Kod, paczki i publikacja

| Obszar | Potwierdzony stan |
| --- | --- |
| Bieżące źródła | UI z jednostkami imperialnymi i motywami, poprawki sterowania, Sentry za zgodą, pytanie po błędzie, ekran akceptacji regulaminu i ograniczeń oraz automatyczny zapis notatek |
| Weryfikacja źródeł | TypeScript i **184 testy w 24 zestawach** przeszły. AAB R8: BUILD SUCCESSFUL in 5m 38s; APK: 47s. Testy Kotlin UP-TO-DATE (7 orientacji, 11 billing). Na emulatorze potwierdzono start, odczyt SQLite, kamerę i zapis kierunku, PNG/systemowe udostępnianie oraz ekran Plus; bez błędów AndroidRuntime/ReactNativeJS procesu aplikacji |
| APK na telefonie | `artifacts/outlineGo-0.1.0.apk`, źródła `8365dca`, zainstalowany 23.10 na Redmi 23124RA7EO (`a20fa219`) przez `install -r`: Success; uruchomienie Status: ok. Zawiera Sentry, ekran akceptacji i automatyczny zapis notatek |
| SHA256 APK na telefonie | `7efea90cf234609bab21801a570da260da33b233441e1b7356919741586b5170` |
| Nowy APK lokalny / emulator | `artifacts/outlineGo-1.0.0.apk`, 1.0.0 / v4, R8; podpis zweryfikowany, zainstalowany tylko na emulatorze. SHA256 `e383e3b4645dcd433b07fcce433102eb30a8a5cd3d6d3e5311a26c9398a8f0b6`. To samo mapowanie co AAB |
| AAB | Podpisany `artifacts/outlineGo-1.0.0.aab`, 1.0.0 / versionCode 4, R8 i usuwanie nieużywanych zasobów. 53 570 303 bajty; SHA256 `d628798e7f9d7e8abb7f1301c3d5107fdf983d59a995f0e5989fcf7df5a726d5`. Mapowanie osadzone w AAB i wyeksportowane jako `artifacts/outlineGo-1.0.0-mapping.txt`, identyczność SHA256 sprawdzona. Nie przesyłano do Console |
| Google Play | Według potwierdzenia użytkownika pierwsze wydanie jest w testach wewnętrznych. Brak potwierdzenia publikacji produkcyjnej i wykonanych transakcji testowych |
| WWW | Osiem stron PL/EN etapu 1 i sześć dokumentów prawnych opublikowane 30.10.2026; odbiór desktop/mobile zakończony. SEO i zgodność zasobów live sprawdzone; indeksowanie i Core Web Vitals do weryfikacji |

Nazwa pliku i niezmieniony versionCode nie identyfikują konkretnego przyrostu. Do porównania paczek używać hasha i commita źródeł. Lokalny raport ostatniego APK: `artifacts/outlineGo-0.1.0-apk-verification.json`. Podpis v2 release potwierdzony przez apksigner; certyfikat SHA256 `8b7dd20f60c62a205c5b66c4c155016b7b9e1b455afc5a6048a1806c622de076`. Log: `artifacts/build-apk-2026-10-23.log`. Instalacja i start nie potwierdzają działania zgód, wysyłania Sentry, zakupów ani sensorów.

## Zrzuty do Google Play

25.10.2026 dodano [wybrany wariant nr 2 po angielsku](../googlePlay/workflow-en/README.md): trzy kroki teren → eksport → komputer. Oryginalny zrzut aplikacji jest osadzony bez przerysowania. PNG dla telefonu 1080×1920, tabletu 7″ 1920×1080 i 10″ 2560×1440, każdy poniżej 8 MB; kopie w `googlePlay/en/screenshots/`. Sekcja WWW opublikowana. Przesłanie plików do Play Console pozostaje po stronie użytkownika.

24.10.2026 przygotowano [36 zrzutów aplikacji](../googlePlay/emulator-screenshots/README.md): po sześć ekranów PL i EN dla telefonu, tabletu 7″ oraz tabletu 10″. PNG 9:16, odpowiednio 1080×1920 i 1440×2560; każdy poniżej 8 MB. Podgląd kamery pokazuje wygenerowaną scenę ogrodu podaną do kamery emulatora, a interfejs pochodzi z APK v2. Materiały są lokalne i wymagają dodania do właściwych galerii Play Console.

## Zgody i prywatność

- [Pierwsze uruchomienie](technical/pierwsze-uruchomienie.md): niezaznaczone pole akceptacji regulaminu i potwierdzenia ograniczeń. Zapis bieżącej wersji treści `2026-10-22.1` i daty UTC w SQLite, odblokowanie ekranów dopiero po udanym zapisie. Istotna zmiana wersji treści wymaga ponownego potwierdzenia. Nie zmienia to ustawień diagnostyki.
- Dokumenty są dostępne przed akceptacją i później w Ustawienia → Dokumenty prawne. Treści ekranów są w PL/EN/DE/ES/FR, dokumenty WWW w PL/EN, z datą obowiązywania 30.10.2026. Temat redakcji dokumentów użytkownik zamknął.
- [Sentry](technical/sentry.md): domyślnie wyłączone; ustawienia albo osobne pytanie po pierwszym obsłużonym błędzie. Akceptacja pytania obejmuje bieżący błąd i przyszłe raporty; odmowa jest pamiętana. Bez wysyłki przed zapisaniem zgody.
- Raporty obejmują oczyszczone błędy JavaScript. Nie przesyłamy lokalnych logów pomiarowych ani danych szkiców. Natywne awarie Java/Kotlin/NDK, Replay, analityka użycia i tracing są wyłączone.
- DSN EU podłączony; serwer przyjął syntetyczne zdarzenie z testu na komputerze (HTTP 200). To nie potwierdza działania na telefonie, symbolikacji ani widoczności w panelu. Użytkownik potwierdził włączenie trzech filtrów organizacji Sentry: Data Scrubber, Default Scrubbers i Prevent Storing of IP Addresses oraz dostarczył podpisane DPA. Nie potwierdzono liczbowej retencji; na polecenie użytkownika pomijamy dalsze ustalanie tego okresu.
- Pomiar i zapis szkiców działają lokalnie bez internetu. Zakupy/przywracanie Google Play i dobrowolne raportowanie błędów wymagają połączenia. Wewnętrzne lokalne logi sesji istnieją, ale ekranów ich przeglądania i eksportu nie ma w aktualnym UI.

## Najbliższe kroki

1. Publiczny klucz Google Play w `_private/google-play-public-key.txt` jest poprawnym kluczem RSA; 23.10.2026 użytkownik potwierdził, że pochodzi z właściwej aplikacji. Wcześniejsza blokada walidacji jest rozwiązana. Nie zmieniano klucza ani nie omijano sprawdzenia.
2. APK z Sentry, ekranem akceptacji i automatycznym zapisem notatek zbudowano i zainstalowano. Aktualizacja nie odinstalowuje ani nie czyści danych; nie sprawdzano zawartości szkiców w UI. Wykonać test funkcjonalny: dostępność wcześniejszych szkiców, zapis notatek, linki, zapis/odtworzenie akceptacji, ponowienie po zmianie wersji, błąd zapisu i osobno nowa instalacja bez czyszczenia telefonu użytkownika.
3. Sprawdzić Sentry na urządzeniu: brak wysyłek przed zgodą, raport po zgodzie, odwołanie zgody i brak zaległych wysyłek. Potwierdzić upload sourcemap i czytelność stosów. Do uploadu potrzebny jest prywatny token w środowisku procesu/CI i slug projektu; DSN jest publiczną konfiguracją klienta. Ustawienia filtrów/IP i DPA są potwierdzone; dalsze ustalanie retencji pomijamy zgodnie z decyzją użytkownika.
4. Dokumenty WWW PL/EN są zamknięte i opublikowane. Przed kolejnym wydaniem aplikacji sprawdzić zgodność jej wersji akceptacji i linków z dokumentami obowiązującymi od 30.10.2026 oraz Google Play Data safety. Nie oznacza to ponownego otwierania redakcji dokumentów.
5. Wykonać transakcje i przywracanie Plus w Google Play, pozostałe próby pomiarów/eksportów oraz przygotować materiały sklepowe. Światowa dystrybucja jest zamiarem; potwierdzona wcześniej konfiguracja produktu dotyczyła Polski.

Po każdej zmianie aplikacji sprawdzać wpływ na dokumenty prawne, stronę i deklaracje sklepowe przed wydaniem. Szczegóły: [notatki prawne](legal/README.md), [plan rozwoju](plan-rozwoju.md).
