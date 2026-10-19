# FieldSketch CAD

Mobilne narzędzie do tworzenia pomocniczych, wymiarowanych szkiców 2D w terenie. Eksport DXF jest planowany w kolejnym etapie.

Pierwsze założenie technologiczne: **React Native + Expo + TypeScript**. Pierwsza platforma: Android, zgodnie z dokumentacją biznesową. Praca offline, bez backendu w prototypie.

Długość można wpisać bezpośrednio w m/cm albo zmierzyć krokomierzem Start/Stop i skorygować liczbę kroków. Domyślna długość kroku to **75 cm**, zmieniana w ustawieniach. Długości z kroków są szacunkowe. Wynik można udostępnić jako PNG.

Prototyp zapisuje lokalnie trwałe logi do analizy dokładności pomiarów. Użytkownik może je przeglądać i kopiować ich treść z aplikacji.

## Struktura projektu

```text
docs/
  business/    dokumentacja biznesowa i materiały źródłowe
  technical/   analiza i dokumentacja techniczna
app/           aplikacja Expo i natywny moduł Kotlin
```

- [Dokumentacja biznesowa](docs/business/FieldSketch_CAD_dokumentacja_biznesowa_i_prototyp.docx)
- [Analiza dokumentacji biznesowej](docs/technical/analiza-biznesowa.md)
- [Dokument techniczny](docs/technical/dokumentacja-techniczna.md)
- [Katalog aplikacji](app/README.md)
- [Uruchomienie i test terenowy prototypu](docs/technical/prototyp.md)

Kod MVP znajduje się w `app/`. Wdrożono [wizard pomiaru](docs/technical/wizard-pomiaru.md), pływającą miniaturę szkicu, stałe dolne akcje, edycję ostatniego boku, eksport PNG, ustawienia globalne i osobną diagnostykę. Strona główna pokazuje 3 najnowsze projekty w prostych wierszach; „Więcej” dodaje po 10. Ustawienia i logi są w menu nagłówka.

Stan na 19 października 2026: kod w commicie `91dd0fe`, APK 0.1.0 zbudowany i zainstalowany na telefonie użytkownika z zachowaniem danych. Kontrola TypeScript, 44 testy TS oraz zadanie 7 testów Kotlin i build zakończyły się bez błędów. Szczegóły artefaktu i ograniczenia opisuje [MEMO](MEMO.md).

Użytkownik zaakceptował dokładność wykonanych testów trybu względnego. Krokomierz działa, ale według próby użytkownika często dolicza 1–2 kroki; przyczyna pozostaje do diagnozy. Skrypt `npm run build:apk` tworzy samodzielny APK w `artifacts/`.
