# WWW — etap 2

Stan na **31 października 2026**: zaimplementowany lokalnie, bez publikacji i bez commita.

## Zakres

- `/pl/plan-pokoju/` i `/en/room-plan/`: osobny przykład 5 × 4 m, rzeczywiste ekrany, korekta 4,8 → 5 m, wyliczone zamknięcie, obwód 18 m, pole 20 m², oryginalny PNG Free do pobrania oraz film V05 (72 s).
- `/pl/pomoc/` i `/en/help/`: instrukcja kamery i krokomierza, film V06 (108 s), długość kroku, dostępność sensorów i zgody, zapis/otwieranie, korekty, eksport oraz Free/Plus i przywrócenie zakupu. Pięć grup tematycznych z odnośnikami i rozwijanymi odpowiedziami.
- Wszystkie 12 stron marketingowych: wspólna nawigacja, pary językowe, breadcrumbs, unikalne metadane, canonical i mapa witryny.
- Strona główna: przekaz o pomiarze czujnikami już w leadzie i osobna sekcja zaraz po hero; odnośnik do kamery i krokomierza oraz prezentacja przykładu pokoju.

Treści pomocy zweryfikowano z `MeasurementHelp.tsx`, `settings.tsx`, `index.tsx`, `PlusOffer.tsx` i tłumaczeniami aplikacji. Nie deklarują pomiaru odległości kamerą ani skanowania AR. Instrukcja pomiaru sensorami ma pierwszeństwo; przykład pokoju zachowuje rzeczywiste ręczne dane źródłowe.

## Media i odtwarzanie

24 zasoby w `public/assets/stage2/`, źródła i sumy SHA-256 w [manifeście](../media/www/stage2/manifest.json). Obrazy UI przeskalowano do WebP bez przerysowywania. PNG i filmy skopiowano bez zmian. Dokumenty prawne i aplikacja pozostają bez zmian.

V05 ma wygenerowaną ilustrację wnętrza; V06 pokazuje symulowane odczyty i wirtualną kamerę. Objaśnienia są widoczne pod odtwarzaczami, wraz z rozwijanym opisem przebiegu i kredytami muzyki CC BY 4.0. Filmy mają natywne kontrolki, `playsinline`, `preload="none"`, miniatury i brak autoplay. Własny lokalny serwer obsługuje MIME MP4 oraz zakresy bajtów umożliwiające przewijanie. Firebase obsługuje pliki statyczne bez dodatkowego backendu.

## Odtworzenie i sprawdzenie

```powershell
node scripts/build-www.cjs
node scripts/verify-www.cjs --serve
node scripts/preview-www.cjs
```

Generator automatycznie przygotowuje zasoby etapu 2 przez `scripts/prepare-www-stage2.cjs`. Szablony nowych stron: `scripts/www-stage2.cjs`; style: `public/assets/stage2.css`.

Kontrola obejmuje 12 stron, dokumenty prawne, lokalne odwołania i kotwice, pary językowe, metadane, sitemap, integralność źródeł/eksportów, opis symulacji, ustawienia odtwarzaczy i kredyty. W trybie HTTP sprawdza kody 200/301/404, PNG/DXF oraz nagłówki, zakresy i integralność fragmentów obu filmów w PL/EN.

**Odbiór wizualny i interakcje w przeglądarce pozostają do potwierdzenia:** brak hosta Browser Use, a próba otwarcia natywnego Chrome przez computer-use zakończyła się `Computer Use app approval timed out`. Nie potwierdzono odtwarzania w przeglądarce ani wyglądu desktop/mobile. Źródłowe obrazy można przeglądać lokalnie; kontrola HTTP nie zastępuje odbioru wizualnego.

Do publikacji pozostają odbiór lokalnego podglądu, osobne polecenie wdrożenia i kontrola live. Nowe strony nie są jeszcze dostępne w publicznym serwisie.
