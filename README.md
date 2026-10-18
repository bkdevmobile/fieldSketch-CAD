# FieldSketch CAD

Mobilne narzędzie do tworzenia pomocniczych, wymiarowanych szkiców 2D w terenie. Eksport DXF jest planowany w kolejnym etapie.

Pierwsze założenie technologiczne: **React Native + Expo + TypeScript**. Pierwsza platforma: Android, zgodnie z dokumentacją biznesową. Praca offline, bez backendu w prototypie.

W prototypie użytkownik podaje długość w krokach. Aplikacja przelicza je na centymetry przy roboczym założeniu **1 krok = 75 cm**, pokazując wynik jako szacunkowy.

Prototyp zapisuje lokalnie trwałe logi do analizy dokładności pomiarów. Użytkownik może je przeglądać i kopiować ich treść z aplikacji.

## Struktura projektu

```text
docs/
  business/    dokumentacja biznesowa i materiały źródłowe
  technical/   analiza i dokumentacja techniczna
app/           katalog przeznaczony na aplikację Expo
```

- [Dokumentacja biznesowa](docs/business/FieldSketch_CAD_dokumentacja_biznesowa_i_prototyp.docx)
- [Analiza dokumentacji biznesowej](docs/technical/analiza-biznesowa.md)
- [Dokument techniczny](docs/technical/dokumentacja-techniczna.md)
- [Katalog aplikacji](app/README.md)
- [Uruchomienie i test terenowy prototypu](docs/technical/prototyp.md)

Kod pierwszego prototypu znajduje się w `app/`: kamera i sensory, ręczne kąty, kroki, prosty obrys, lokalne projekty i kopiowanie logów. Skrypt `npm run build:apk` tworzy samodzielny APK w `artifacts/`. Dokładność kierunku wymaga walidacji na fizycznym telefonie.
