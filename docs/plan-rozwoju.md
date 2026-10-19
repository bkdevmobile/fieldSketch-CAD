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

19 października 2026 zaakceptowano i wdrożono [wizard pomiaru i decyzje UI](technical/wizard-pomiaru.md): cykl Kierunek → Długość → Zapisz punkt, korekty, krokomierz Start/Stop, szkic na żywo i zakończenie. Pozostają użytkownik docelowy, ostateczne kryteria odbioru pierwszej wersji i wstępny model zarabiania. Ustalenia UI nie określają podziału funkcji darmowych i płatnych.

Wdrożono ręczne m/cm, natywny krokomierz, edycję ostatniego boku z historią, PNG oraz zapis roboczego formularza. Po próbie telefonu uproszczono UI: globalny tryb kierunku w ustawieniach, zielony status gotowości bez szczegółów, korekta `[L] [kąt] [P]` i suwak co 5°, krokomierz `[−] [kroki] [+] [Start/Stop]`, pływający szkic, menu nagłówka i prosta lista projektów 3/+10. Kod zapisano w `91dd0fe`, APK 0.1.0 zainstalowano na telefonie. Nie opublikowano testu zamkniętego ani wersji produkcyjnej.

Najbliższe prace: sprawdzić aktualny układ na telefonie, zdiagnozować zgłoszone nadliczanie 1–2 kroków na podstawie logów i znanej liczby kroków oraz ustalić kryteria gotowości do testu zamkniętego. Przejście 44 testów TS i 7 Kotlin nie potwierdza dokładności pomiaru w terenie. DXF, solver i migracja SDK pozostają poza bieżącym zakresem.
