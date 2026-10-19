# Ogólny plan rozwoju FieldSketch CAD

Ustalony z użytkownikiem 19 października 2026. Etapy realizujemy w poniższej kolejności.

1. **Testy technologii** — sprawdzenie działania prototypu oraz dokładności i powtarzalności pomiarów w terenie. Określenie docelowego zastosowania i kryteriów wystarczającej dokładności.
2. **Zaprojektowanie działania aplikacji i UI** — określenie użytkownika docelowego, zakresu pierwszej wersji, przebiegu pracy, ekranów oraz interakcji. Wstępny model zarabiania należy rozważyć przed projektowaniem UI; podział na funkcje darmowe i płatne może wpływać na działanie aplikacji.
3. **Wersja pre-release i publikacja jako test zamknięty** — przygotowanie wersji do testów, zebranie opinii i wykrycie problemów. Weryfikacja zarówno wyników pomiarów, jak i tego, czy użytkownicy potrafią samodzielnie wykonać cały pomiar.
4. **Dopracowanie modelu zarabiania** — wybór sposobu monetyzacji na podstawie opinii testerów i wartości, jaką daje aplikacja.
5. **Wersja release i publikacja** — przygotowanie i opublikowanie wersji produkcyjnej po usunięciu błędów blokujących oraz spełnieniu ustalonych kryteriów jakości.

Najważniejsza decyzja na etapie 1: czy pomiar kierunku telefonem i długości krokami daje dokładność wystarczającą do wybranego zastosowania. Wyniki tych testów wyznaczą dalszy zakres produktu.

19 października 2026 użytkownik potwierdził, że wykonane testy w trybie „względny” dają akceptowalny poziom dokładności. Etap 1 uznajemy za wystarczająco zweryfikowany dla dalszych prac opartych na tym trybie. Następny jest etap 2: projektowanie działania aplikacji i UI, poprzedzone rozważeniem wstępnego modelu zarabiania. Ocena nie obejmuje automatycznie trybu magnetycznego ani nie określa liczbowego progu błędu. Szczegółowy stan prac opisuje [MEMO.md](../MEMO.md).

## Postęp etapu 2

19 października 2026 zaakceptowano [wizard pomiaru i decyzje UI](technical/wizard-pomiaru.md): cykl Kierunek → Długość → Zapisz punkt, korekty, krokomierz Start/Stop, szkic na żywo i zakończenie. Jest to projekt do implementacji. Pozostają użytkownik docelowy, ostateczny zakres pierwszej wersji, wstępny model zarabiania i szczegółowy układ ekranów. Ustalenia UI przyjęto przed zakończeniem rozważań o monetyzacji; nie określają jeszcze podziału funkcji darmowych i płatnych.
