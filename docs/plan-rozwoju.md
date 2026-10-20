# Ogólny plan rozwoju outlineGo

Ustalony z użytkownikiem 19 października 2026. Etapy realizujemy w poniższej kolejności.

Stan na 20 października 2026: użytkownik uznał testy zamknięte za zakończone. Etap 3 zamknięty dla MVP 0.1.0, kod aplikacji `9a54555`, APK `30CB381F…`. Następny jest etap 4 — dopracowanie modelu zarabiania — oraz przygotowanie wymagań release. Decyzja o zakończeniu testów nie oznacza publikacji produkcyjnej ani dopisania szczegółowych wyników liczbowych do checklist.

1. **Testy technologii** — sprawdzenie działania prototypu oraz dokładności i powtarzalności pomiarów w terenie. Określenie docelowego zastosowania i kryteriów wystarczającej dokładności.
2. **Zaprojektowanie działania aplikacji i UI** — określenie użytkownika docelowego, zakresu pierwszej wersji, przebiegu pracy, ekranów oraz interakcji. Wstępny model zarabiania należy rozważyć przed projektowaniem UI; podział na funkcje darmowe i płatne może wpływać na działanie aplikacji.
3. **Wersja pre-release i publikacja jako test zamknięty** — przygotowanie wersji do testów, zebranie opinii i wykrycie problemów. Weryfikacja zarówno wyników pomiarów, jak i tego, czy użytkownicy potrafią samodzielnie wykonać cały pomiar.
4. **Dopracowanie modelu zarabiania** — wybór sposobu monetyzacji na podstawie opinii testerów i wartości, jaką daje aplikacja.
5. **Wersja release i publikacja** — dopracowanie wizualizacji aplikacji, przygotowanie i opublikowanie wersji produkcyjnej po usunięciu błędów blokujących oraz spełnieniu ustalonych kryteriów jakości. Wersja release musi być wielojęzyczna (multilanguage).

Decyzja użytkownika z 20 października 2026: wielojęzyczność jest wymaganiem wersji produkcyjnej. Obecne MVP ma interfejs po polsku; obsługa wielu języków pozostaje do wdrożenia przed release. Lista języków, język domyślny oraz sposób wyboru języka wymagają osobnego ustalenia.

Najważniejsza decyzja na etapie 1: czy pomiar kierunku telefonem i długości krokami daje dokładność wystarczającą do wybranego zastosowania. Wyniki tych testów wyznaczą dalszy zakres produktu.

19 października 2026 użytkownik potwierdził, że wykonane testy w trybie „względny” dają akceptowalny poziom dokładności. Etap 1 uznajemy za wystarczająco zweryfikowany dla dalszych prac opartych na tym trybie. Następny jest etap 2: projektowanie działania aplikacji i UI, poprzedzone rozważeniem wstępnego modelu zarabiania. Ocena nie obejmuje automatycznie trybu magnetycznego ani nie określa liczbowego progu błędu. Szczegółowy stan prac opisuje [MEMO.md](../MEMO.md).

## Postęp etapu 2

19 października 2026 zaakceptowano i wdrożono [wizard pomiaru i decyzje UI](technical/wizard-pomiaru.md): cykl Kierunek → Długość → Zapisz punkt, korekty, krokomierz Start/Stop, szkic na żywo i zakończenie. Pozostają użytkownik docelowy, ostateczne kryteria odbioru pierwszej wersji i wstępny model zarabiania. Ustalenia UI nie określają podziału funkcji darmowych i płatnych.

Wdrożono ręczne m/cm, natywny krokomierz, edycję ostatniego boku z historią, PNG oraz zapis roboczego formularza. Po próbie telefonu uproszczono UI: globalny tryb kierunku w ustawieniach, zielony status gotowości bez szczegółów, korekta `[L] [kąt] [P]` i suwak co 5°, krokomierz `[−] [kroki] [+] [Start/Stop]`, pływający szkic, menu nagłówka i prosta lista projektów 3/+10. Późniejsze iteracje wdrożyły branding outlineGo, prowadzenie pierwszego pomiaru, poprawki wznowienia i szkicu, preferencje oraz zgodę krokomierza przed kierunkiem. Aktualny kod to `172ebe8` z eksportem DXF; APK `9E8708ED…` zainstalowano na Redmi. Wcześniejsze testy zamknięte zakończono decyzją użytkownika; nowy DXF wymaga odrębnej próby udostępniania na telefonie i importu w drugim CAD. Wersji produkcyjnej nie opublikowano.

Najbliższe prace: doprecyzować użytkownika docelowego oraz wdrożyć zatwierdzone limity Free, znak wodny PNG, zakup i przywracanie Plus oraz podłączyć gotowy eksport DXF do uprawnienia. Następnie ustalić języki oraz sposób wyboru języka i wdrożyć wielojęzyczność przed release. Przygotować listę prac do publikacji produkcyjnej. Krokomierz zaakceptowano; dodatkowe kroki użytkownik wiąże z ruchem telefonu, więc nie pozostają otwartym błędem algorytmu. Ostatnia weryfikacja: TypeScript i 92 testy TS, wizualny import DXF w LibreCAD, pełny build w 58 s z zadaniem testów Kotlin UP-TO-DATE oraz instalacja i uruchomienie na Redmi. Solver i migracja SDK pozostają poza bieżącym zakresem.

## Dopracowanie wizualizacji przed release

Dodane na życzenie użytkownika 20 października 2026. Dopracować wygląd ekranów w przyjętym stylu Teren: spójność kolorystyki, typografii, ikon, odstępów, przycisków, menu i dialogów. Uwzględnić ekran pomiaru, szkic, pomoc oraz planowane elementy Free/Plus i eksportu. Sprawdzić czytelność na różnych rozmiarach ekranów oraz po tłumaczeniu interfejsu. Zachować dolne akcje poza scrollem i stabilne położenie celownika. Punkt jest zaplanowany, bez nowych zmian wizualnych w kodzie.

## Model Free / Plus

Ustalenia z 20 października 2026: darmowa wersja z ograniczeniami oraz **outlineGo Plus za 29,99 zł jednorazowo**. Cena dotyczy oferty w PLN; ceny dla pozostałych rynków nie zostały ustalone.

| Funkcja | Free | Plus |
| --- | --- | --- |
| Punkty w szkicu | Do 8 | Bez limitu produktu |
| Zapisane szkice | Do 3 | Bez limitu produktu |
| Eksport bitmapy PNG | Ze znakiem wodnym | Bez znaku wodnego |
| Eksport CAD DXF | Niedostępny | Dostępny |

DXF przechodzi z funkcji poza MVP do planowanego zakresu Plus na release. Pierwsza wersja eksportu DXF 2D jest zaimplementowana w kodzie; [zakres i weryfikacja](technical/eksport-dxf.md). Płatności, limity i znak wodny nie są jeszcze zaimplementowane; DXF wymaga podłączenia do Plus przed release. APK z DXF (`9E8708ED…`) zbudowano i zainstalowano na Redmi 20 października 2026 z zachowaniem danych; próbę udostępniania i drugi CAD należy jeszcze wykonać. Zasady Free/Plus zaakceptowano 20 października 2026: zakup bez własnego backendu, Plus offline, automatyczne zamknięcie przy limicie 8 punktów bez osobnego pomiaru powrotu oraz znak wodny pod rysunkiem. Punkt ustaleń zamknięty. Pełna [specyfikacja Free/Plus](technical/free-plus.md) obejmuje również kontynuację szkicu po zakupie i dostęp do wszystkich danych po utracie Plus.
