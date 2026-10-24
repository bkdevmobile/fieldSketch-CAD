# Aktualny stan outlineGo

Aktualizacja: **24 października 2026**, kod APK: `8365dca`; nowy AAB z bazy `0aaa75c` i zwiększeniem versionCode. Wersja w konfiguracji: **1.0.0 / versionCode 4**, pakiet `com.bk.dev.mobile.outlinego`. Wersja 1.0.0 / v4 nie zostala jeszcze zbudowana; ostatni AAB to 0.1.0 / v3. Telefon nadal ma APK v2. Ten dokument opisuje bieżący stan; starsze wpisy w [MEMO](../MEMO.md) i opisach prób zachowują wyniki dla sprawdzonych wtedy wersji.

## Kod, paczki i publikacja

| Obszar | Potwierdzony stan |
| --- | --- |
| Bieżące źródła | UI z jednostkami imperialnymi i motywami, poprawki sterowania, Sentry za zgodą, pytanie po błędzie, ekran akceptacji regulaminu i ograniczeń oraz automatyczny zapis notatek |
| Weryfikacja źródeł | TypeScript i **183 testy w 24 zestawach** przeszły przed commitem 8365dca. 23.10 prebuild i release APK: BUILD SUCCESSFUL in 2m 35s. Zadania Kotlin UP-TO-DATE; raporty: 7 testów orientacji i 11 billing, bez błędów |
| Ostatni podpisany i zainstalowany APK | `artifacts/outlineGo-0.1.0.apk`, źródła `8365dca`, zainstalowany 23.10 na Redmi 23124RA7EO (`a20fa219`) przez `install -r`: Success; uruchomienie Status: ok. Zawiera Sentry, ekran akceptacji i automatyczny zapis notatek |
| SHA256 tego APK | `7efea90cf234609bab21801a570da260da33b233441e1b7356919741586b5170` |
| AAB | Podpisany `artifacts/outlineGo-0.1.0-v3.aab`, 0.1.0 / versionCode 3, zbudowany 24.10.2026. BUILD SUCCESSFUL in 2m 49s; podpis i certyfikat przesyłania zweryfikowane, klucz Play osadzony. SHA256 `4f5dd57a8cee41df4ca6b1d8495c6fa08153f1482fcf2a7ed47a2702264cfe6c`. TypeScript i 183 testy przeszły, Kotlin UP-TO-DATE. Paczki nie wysyłano do Console |
| Google Play | Według potwierdzenia użytkownika pierwsze wydanie jest w testach wewnętrznych. Brak potwierdzenia publikacji produkcyjnej i wykonanych transakcji testowych |
| WWW | [Strona EN w Firebase](https://outlinego-27ab5.web.app/) opublikowana; dokumenty prawne nadal oznaczone jako robocze |

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
