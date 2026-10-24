# Aktualny stan outlineGo

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
| WWW | [Strona EN w Firebase](https://outlinego-27ab5.web.app/) opublikowana; oficjalny badge Google Play z linkiem do sklepu, usunięte Coming soon. Widok desktop i mobilny oraz zasób live sprawdzone. Dokumenty prawne nadal oznaczone jako robocze |

Nazwa pliku i niezmieniony versionCode nie identyfikują konkretnego przyrostu. Do porównania paczek używać hasha i commita źródeł. Lokalny raport ostatniego APK: `artifacts/outlineGo-0.1.0-apk-verification.json`. Podpis v2 release potwierdzony przez apksigner; certyfikat SHA256 `8b7dd20f60c62a205c5b66c4c155016b7b9e1b455afc5a6048a1806c622de076`. Log: `artifacts/build-apk-2026-10-23.log`. Instalacja i start nie potwierdzają działania zgód, wysyłania Sentry, zakupów ani sensorów.

## Zrzuty do Google Play

24.10.2026 przygotowano [36 zrzutów aplikacji](../googlePlay/emulator-screenshots/README.md): po sześć ekranów PL i EN dla telefonu, tabletu 7″ oraz tabletu 10″. PNG 9:16, odpowiednio 1080×1920 i 1440×2560; każdy poniżej 8 MB. Podgląd kamery pokazuje wygenerowaną scenę ogrodu podaną do kamery emulatora, a interfejs pochodzi z APK v2. Materiały są lokalne i wymagają dodania do właściwych galerii Play Console.

## Zgody i prywatność

- [Pierwsze uruchomienie](technical/pierwsze-uruchomienie.md): niezaznaczone pole akceptacji regulaminu i potwierdzenia ograniczeń. Zapis bieżącej wersji treści `2026-10-22.1` i daty UTC w SQLite, odblokowanie ekranów dopiero po udanym zapisie. Istotna zmiana wersji treści wymaga ponownego potwierdzenia. Nie zmienia to ustawień diagnostyki.
- Dokumenty są dostępne przed akceptacją i później w Ustawienia → Dokumenty prawne. Treści ekranów są w PL/EN/DE/ES/FR, dokumenty WWW po angielsku.
- [Sentry](technical/sentry.md): domyślnie wyłączone; ustawienia albo osobne pytanie po pierwszym obsłużonym błędzie. Akceptacja pytania obejmuje bieżący błąd i przyszłe raporty; odmowa jest pamiętana. Bez wysyłki przed zapisaniem zgody.
- Raporty obejmują oczyszczone błędy JavaScript. Nie przesyłamy lokalnych logów pomiarowych ani danych szkiców. Natywne awarie Java/Kotlin/NDK, Replay, analityka użycia i tracing są wyłączone.
- DSN EU podłączony; serwer przyjął syntetyczne zdarzenie z testu na komputerze (HTTP 200). To nie potwierdza działania na telefonie, symbolikacji ani widoczności w panelu. Retencja do 30 dni i ustawienia IP pozostają do potwierdzenia na koncie Sentry.
- Pomiar i zapis szkiców działają lokalnie bez internetu. Zakupy/przywracanie Google Play i dobrowolne raportowanie błędów wymagają połączenia. Wewnętrzne lokalne logi sesji istnieją, ale ekranów ich przeglądania i eksportu nie ma w aktualnym UI.

## Najbliższe kroki

1. Publiczny klucz Google Play w `_private/google-play-public-key.txt` jest poprawnym kluczem RSA; 23.10.2026 użytkownik potwierdził, że pochodzi z właściwej aplikacji. Wcześniejsza blokada walidacji jest rozwiązana. Nie zmieniano klucza ani nie omijano sprawdzenia.
2. APK z Sentry, ekranem akceptacji i automatycznym zapisem notatek zbudowano i zainstalowano. Aktualizacja nie odinstalowuje ani nie czyści danych; nie sprawdzano zawartości szkiców w UI. Wykonać test funkcjonalny: dostępność wcześniejszych szkiców, zapis notatek, linki, zapis/odtworzenie akceptacji, ponowienie po zmianie wersji, błąd zapisu i osobno nowa instalacja bez czyszczenia telefonu użytkownika.
3. Sprawdzić Sentry na urządzeniu: brak wysyłek przed zgodą, raport po zgodzie, odwołanie zgody i brak zaległych wysyłek. Potwierdzić retencję/IP oraz upload sourcemap i czytelność stosów. Do uploadu potrzebny jest prywatny token w środowisku procesu/CI i slug projektu; DSN jest publiczną konfiguracją klienta.
4. Zatwierdzić dokumenty prawne i ich daty obowiązywania. Przed wydaniem z raportowaniem scalić [przygotowany opis Sentry](legal/sentry-privacy-addendum.en.md) oraz zaktualizować Google Play Data safety. Opublikowana polityka opisuje dotychczasowy build bez Sentry; lokalne źródła strony mogą wyprzedzać ostatni deploy.
5. Wykonać transakcje i przywracanie Plus w Google Play, pozostałe próby pomiarów/eksportów oraz przygotować materiały sklepowe. Światowa dystrybucja jest zamiarem; potwierdzona wcześniej konfiguracja produktu dotyczyła Polski.

Po każdej zmianie aplikacji sprawdzać wpływ na dokumenty prawne, stronę i deklaracje sklepowe przed wydaniem. Szczegóły: [notatki prawne](legal/README.md), [plan rozwoju](plan-rozwoju.md).
