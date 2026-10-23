# Aktualny stan outlineGo

Aktualizacja: **22 października 2026**, kod funkcjonalny: `6f9a305`. Wersja w konfiguracji: **0.1.0 / versionCode 2**, pakiet `com.bk.dev.mobile.outlinego`. Ten dokument opisuje bieżący stan; starsze wpisy w [MEMO](../MEMO.md) i opisach prób zachowują wyniki dla sprawdzonych wtedy wersji.

## Kod, paczki i publikacja

| Obszar | Potwierdzony stan |
| --- | --- |
| Bieżące źródła | UI z jednostkami imperialnymi i motywami, poprawki sterowania, Sentry za zgodą, pytanie po błędzie, ekran akceptacji regulaminu i ograniczeń |
| Weryfikacja źródeł | TypeScript i **183 testy w 24 zestawach** przeszły; po ostatnich zmianach nie wykonywano nowego prebuilda ani testów natywnych |
| Ostatni podpisany i zainstalowany APK | `artifacts/outlineGo-0.1.0.apk`, źródła `0b39f9f`, zainstalowany na Redmi; zawiera poprawki UI, nie zawiera Sentry ani ekranu akceptacji |
| SHA256 tego APK | `65c1532bb2063ab0bbc0d3cc31c077ec618b12dca3e8f0bbdbdd7902624ba55f` |
| AAB | Nie przebudowano po zmianach UI, Sentry i pierwszego uruchomienia; wcześniejszy AAB v2 nie reprezentuje obecnych źródeł |
| Google Play | Według potwierdzenia użytkownika pierwsze wydanie jest w testach wewnętrznych. Brak potwierdzenia publikacji produkcyjnej i wykonanych transakcji testowych |
| WWW | [Strona EN w Firebase](https://outlinego-27ab5.web.app/) opublikowana; dokumenty prawne nadal oznaczone jako robocze |

Nazwa pliku i niezmieniony versionCode nie identyfikują konkretnego przyrostu. Do porównania paczek używać hasha i commita źródeł. Lokalny raport ostatniego APK: `artifacts/outlineGo-0.1.0-apk-verification.json`.

## Zgody i prywatność

- [Pierwsze uruchomienie](technical/pierwsze-uruchomienie.md): niezaznaczone pole akceptacji regulaminu i potwierdzenia ograniczeń. Zapis bieżącej wersji treści `2026-10-22.1` i daty UTC w SQLite, odblokowanie ekranów dopiero po udanym zapisie. Istotna zmiana wersji treści wymaga ponownego potwierdzenia. Nie zmienia to ustawień diagnostyki.
- Dokumenty są dostępne przed akceptacją i później w Ustawienia → Dokumenty prawne. Treści ekranów są w PL/EN/DE/ES/FR, dokumenty WWW po angielsku.
- [Sentry](technical/sentry.md): domyślnie wyłączone; ustawienia albo osobne pytanie po pierwszym obsłużonym błędzie. Akceptacja pytania obejmuje bieżący błąd i przyszłe raporty; odmowa jest pamiętana. Bez wysyłki przed zapisaniem zgody.
- Raporty obejmują oczyszczone błędy JavaScript. Nie przesyłamy lokalnych logów pomiarowych ani danych szkiców. Natywne awarie Java/Kotlin/NDK, Replay, analityka użycia i tracing są wyłączone.
- DSN EU podłączony; serwer przyjął syntetyczne zdarzenie z testu na komputerze (HTTP 200). To nie potwierdza działania na telefonie, symbolikacji ani widoczności w panelu. Retencja do 30 dni i ustawienia IP pozostają do potwierdzenia na koncie Sentry.
- Pomiar i zapis szkiców działają lokalnie bez internetu. Zakupy/przywracanie Google Play i dobrowolne raportowanie błędów wymagają połączenia. Wewnętrzne lokalne logi sesji istnieją, ale ekranów ich przeglądania i eksportu nie ma w aktualnym UI.

## Najbliższe kroki

1. Przywrócić prawidłowy publiczny klucz licencyjny Google Play w `_private/google-play-public-key.txt`. Podczas ostatniego sprawdzenia nie przechodził walidacji RSA DER/base64, co blokuje ewaluację konfiguracji/prebuild. Nie omijano tego sprawdzenia.
2. Zbudować i zainstalować nowe APK z Sentry oraz ekranem akceptacji. Zweryfikować nową instalację, aktualizację z zachowaniem szkiców, linki, zapis/odtworzenie akceptacji, ponowienie po zmianie wersji i błąd zapisu.
3. Sprawdzić Sentry na urządzeniu: brak wysyłek przed zgodą, raport po zgodzie, odwołanie zgody i brak zaległych wysyłek. Potwierdzić retencję/IP oraz upload sourcemap i czytelność stosów. Do uploadu potrzebny jest prywatny token w środowisku procesu/CI i slug projektu; DSN jest publiczną konfiguracją klienta.
4. Zatwierdzić dokumenty prawne i ich daty obowiązywania. Przed wydaniem z raportowaniem scalić [przygotowany opis Sentry](legal/sentry-privacy-addendum.en.md) oraz zaktualizować Google Play Data safety. Opublikowana polityka opisuje dotychczasowy build bez Sentry; lokalne źródła strony mogą wyprzedzać ostatni deploy.
5. Wykonać transakcje i przywracanie Plus w Google Play, pozostałe próby pomiarów/eksportów oraz przygotować materiały sklepowe. Światowa dystrybucja jest zamiarem; potwierdzona wcześniej konfiguracja produktu dotyczyła Polski.

Po każdej zmianie aplikacji sprawdzać wpływ na dokumenty prawne, stronę i deklaracje sklepowe przed wydaniem. Szczegóły: [notatki prawne](legal/README.md), [plan rozwoju](plan-rozwoju.md).
