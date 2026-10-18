# FieldSketch CAD

Mobilne narzędzie do tworzenia pomocniczych, wymiarowanych szkiców 2D w terenie i eksportu do DXF.

Pierwsze założenie technologiczne: **React Native + Expo + TypeScript**. Pierwsza platforma: Android, zgodnie z dokumentacją biznesową. Praca offline, bez backendu w prototypie.

W prototypie użytkownik podaje długość w krokach. Aplikacja przelicza je na centymetry przy roboczym założeniu **1 krok = 75 cm**, pokazując wynik jako szacunkowy.

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

Obecny etap: analiza i projekt techniczny. Aplikacja nie została jeszcze zainicjalizowana. Następny etap to P0, czyli walidacja kierunku z czujników na rzeczywistych telefonach.
