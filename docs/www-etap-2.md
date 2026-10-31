# WWW — etap 2

Stan na **31 października 2026**: opublikowany w Firebase Hosting `outlinego-27ab5`, wersja `3f872ac19f672a6e`, około 19:53 Europe/Warsaw. Kod etapu 2: `3c3fc6e`; integracja wszystkich filmów: `4aa98e3`. Materiały filmowe: `88d89d7`. Bieżący zapis publikacji i skrypt kontroli live pozostają bez nowego commita.

## Zakres

- `/pl/plan-pokoju/` i `/en/room-plan/`: osobny przykład 5 × 4 m, rzeczywiste ekrany, korekta 4,8 → 5 m, wyliczone zamknięcie, obwód 18 m, pole 20 m², oryginalny PNG Free do pobrania oraz film V05 (72 s).
- `/pl/pomoc/` i `/en/help/`: instrukcja kamery i krokomierza, film V06 (108 s), długość kroku, dostępność sensorów i zgody, zapis/otwieranie, korekty, eksport oraz Free/Plus i przywrócenie zakupu. Pięć grup tematycznych z odnośnikami i rozwijanymi odpowiedziami.
- Wszystkie 12 stron marketingowych: wspólna nawigacja, pary językowe, breadcrumbs, unikalne metadane, canonical i mapa witryny.
- Strona główna: przekaz o pomiarze czujnikami już w leadzie i osobna sekcja zaraz po hero; odnośnik do kamery i krokomierza oraz prezentacja przykładu pokoju.

Treści pomocy zweryfikowano z `MeasurementHelp.tsx`, `settings.tsx`, `index.tsx`, `PlusOffer.tsx` i tłumaczeniami aplikacji. Nie deklarują pomiaru odległości kamerą ani skanowania AR. Instrukcja pomiaru sensorami ma pierwszeństwo; przykład pokoju zachowuje rzeczywiste ręczne dane źródłowe.

## Umieszczenie filmów — aktualne PL/EN

| Film | Podstrona PL | Podstrona EN |
| --- | --- | --- |
| V01 — przegląd | `/pl/` | `/en/` |
| V02 — pierwszy szkic | `/pl/jak-to-dziala/` | `/en/how-it-works/` |
| V03 — ogród | `/pl/szkic-ogrodu/` | `/en/garden-sketch/` |
| V04 — DXF | `/pl/eksport-dxf/` | `/en/dxf-export/` |
| V05 — pokój | `/pl/plan-pokoju/` | `/en/room-plan/` |
| V06 — kamera i krokomierz | `/pl/pomoc/` | `/en/help/` |

Każda strona ma jeden film w swoim języku. V01 jest bezpośrednio po sekcji o czujnikach na stronie głównej; V02–V04 przed sekcją powiązanych poradników. Podpisy odróżniają przykłady filmowe od ogrodu 32 m / 55 m² na stronach. Wszystkie odtwarzacze korzystają ze wspólnego szablonu `scripts/www-videos.cjs`, z opisem przebiegu i pełnymi kredytami z plików MUSIC-CREDITS.txt.

## Media i odtwarzanie

40 zasobów w `public/assets/stage2/`, źródła i sumy SHA-256 w [manifeście](../media/www/stage2/manifest.json). Obrazy UI przeskalowano do WebP bez przerysowywania. PNG i filmy skopiowano bez zmian. Dokumenty prawne i aplikacja pozostają bez zmian.

V03 ma wygenerowaną ilustrację ogrodu, V05 — wnętrza; V06 pokazuje symulowane odczyty i wirtualną kamerę. Objaśnienia są widoczne pod odtwarzaczami, wraz z rozwijanym opisem przebiegu i kredytami muzyki CC BY 4.0. Filmy mają natywne kontrolki, `playsinline`, `preload="none"`, miniatury i brak autoplay. Własny lokalny serwer obsługuje MIME MP4 oraz zakresy bajtów umożliwiające przewijanie. Firebase obsługuje pliki statyczne bez dodatkowego backendu.

## Odtworzenie i sprawdzenie

```powershell
node scripts/build-www.cjs
node scripts/verify-www.cjs --serve
node scripts/preview-www.cjs
```

Generator automatycznie przygotowuje zasoby etapu 2 przez `scripts/prepare-www-stage2.cjs`. Szablony nowych stron: `scripts/www-stage2.cjs`; style: `public/assets/stage2.css`.

Kontrola obejmuje 12 stron, dokumenty prawne, lokalne odwołania i kotwice, pary językowe, metadane, sitemap, integralność źródeł/eksportów, opis symulacji, ustawienia odtwarzaczy i kredyty. W trybie HTTP sprawdza kody 200/301/404, PNG/DXF oraz nagłówki, zakresy i integralność fragmentów wszystkich sześciu filmów w PL/EN. Kontrola po integracji V01–V04 przeszła: 12 stron, 630 lokalnych odwołań, 40 zasobów etapu 2, właściwe filmy/języki, zgodne SHA-256, MIME MP4 i odpowiedzi 206 dla zakresów wszystkich 12 plików MP4.

**Odbiór WWW w przeglądarce — zakończony:** 31.10.2026 użytkownik potwierdził: „testy w przeglądarce ok”. Punkt odbioru zamknięto na podstawie testów użytkownika. Wcześniejsza próba automatycznej kontroli była niedostępna z powodu braku hosta Browser Use i timeoutu computer-use; nie jest to otwarta blokada odbioru.

Publikacja na polecenie użytkownika zakończona: https://outlinego-27ab5.web.app/pl/ i /en/. Wszystkie 12 stron i 137 zasobów publicznych mają zgodne SHA-256 z plikami lokalnymi; wszystkie 12 MP4 obsługuje zakresy bajtów (206), przekierowania 301 i odpowiedź 404 są poprawne. Kontrola `node scripts/verify-www-live.cjs` przeszła. Log wdrożenia: `artifacts/firebase-www-stage2-deploy-2026-10-31.log`; raport: `artifacts/www-stage2-live-verification-2026-10-31.json`. Odbiór w przeglądarce potwierdzony przez użytkownika 31.10.2026. Pozostaje obserwacja indeksowania i pomiar wydajności.
