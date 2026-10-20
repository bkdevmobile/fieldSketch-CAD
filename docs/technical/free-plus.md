# outlineGo — zasady Free / Plus

Status: zasady zaakceptowane przez użytkownika 20 października 2026. Punkt ustaleń zamknięty; implementacja pozostaje do wykonania. Specyfikacja dotyczy przygotowania release i nie zmienia obecnego APK.

## Oferta

**Plus: 29,99 zł jednorazowo**, zakup niezużywalny przez Google Play Billing, bez własnego backendu i bez konta outlineGo. Ceny dla pozostałych rynków pozostają do ustalenia.

| Funkcja | Free | Plus |
| --- | --- | --- |
| Punkty w szkicu | Do 8, łącznie z P1 | Bez limitu produktu |
| Zapisane szkice | Do 3 | Bez limitu produktu |
| PNG | Ze znakiem wodnym | Bez znaku wodnego |
| DXF | Niedostępny | Dostępny |
| Pomiar, korekty i podgląd | Pełne w granicach limitów | Pełne |

## Limit punktów i zakończenie

- P1 wlicza się do limitu 8 narożników. Automatyczne zamknięcie łączy ostatni punkt z istniejącym P1 i nie zużywa kolejnego punktu.
- Po zapisaniu P8 użytkownik może poprawić szkic, automatycznie zamknąć obrys, zostawić otwarty, zapisać i wyeksportować PNG.
- Próbę rozpoczęcia kolejnego mierzonego boku poprzedza oferta Plus. Nie wolno czekać z blokadą do końca pomiaru tego boku.
- Przy limicie nie ma osobnego wyjątku ani akcji pomiaru powrotu do P1. Zmierzony powrót mógłby nie trafić w P1 i wymagałby dodatkowej obsługi niedomknięcia. Wybrano automatyczne zamknięcie.

## Limit szkiców

- Do limitu wliczają się wszystkie szkice na liście, również rozpoczęte.
- Usunięcie szkicu zwalnia miejsce. Nowy szkic można utworzyć w Free, gdy zapisanych jest mniej niż 3.
- Próba utworzenia czwartego szkicu pokazuje „Masz już 3 szkice” z akcjami: „Odblokuj Plus”, „Przejdź do szkiców”, „Anuluj”.

## Eksport i znak wodny

- Free: napis „Utworzono w outlineGo · Free” w dodatkowym pasku pod rysunkiem PNG, bez zasłaniania wymiarów i geometrii. Tekst podlega lokalizacji na release.
- Plus: bez powyższego znaku wodnego; logo marki pozostaje częścią eksportu.
- DXF jest widoczny w Free z oznaczeniem Plus. Wybranie tej opcji pokazuje korzyści i cenę zakupu.
- Po zakupie można ponownie wyeksportować istniejący szkic do PNG bez znaku wodnego oraz do DXF.
- Oznaczenia długości szacunkowych pozostają niezależne od wersji płatnej.

## Zakup i kontynuowanie pomiaru

- Potwierdzony zakup odblokowuje również istniejące szkice. Użytkownik kontynuuje ten sam szkic od P9, bez tworzenia nowego i bez utraty zapisanych pomiarów.
- Anulowanie lub niepowodzenie zakupu zachowuje szkic i jego dane.
- Jeśli okno zakupu zakończy sesję czujników, przed dalszym pomiarem względnym należy odtworzyć odniesienie. Zakup nie odtwarza układu sensora po jego restarcie.

## Offline, przywracanie i utrata uprawnienia

- Potwierdzone uprawnienie Plus jest zapamiętywane lokalnie i działa offline. Brak połączenia lub błąd sprawdzania zakupu sam w sobie nie odbiera Plus.
- Zakup i przywracanie zakupu wymagają połączenia z Google Play. Po reinstalacji lub zmianie telefonu Plus można przywrócić na tym samym koncie sklepu.
- Przywracanie zakupu przywraca uprawnienie; nie przywraca szkiców przechowywanych lokalnie na innym telefonie.
- Po potwierdzonej utracie Plus wszystkie istniejące szkice pozostają widoczne, także gdy jest ich więcej niż 3 lub mają ponad 8 punktów. Można je przeglądać, poprawiać, usuwać i eksportować do PNG ze znakiem wodnym. Nie usuwa się ani nie ukrywa danych.
- Przekroczenie limitów blokuje tworzenie nowych szkiców lub dodawanie punktów, bez blokowania korekt. Nowy szkic wymaga Plus albo zmniejszenia liczby zapisanych szkiców do mniej niż 3. DXF wymaga aktywnego Plus.
- Przy pracy bez backendu aplikacja nie wykryje cofnięcia uprawnienia bez aktualizacji stanu ze sklepu; przyjęto ten kompromis dla obecnego modelu jednorazowego zakupu.

## Zakres wdrożenia

Do wykonania: obsługa zakupu i przywracania, trwały stan uprawnienia, limity i komunikaty oraz znak wodny. Wymagana obsługa zakupu oczekującego, anulowania, przerwania aplikacji i ponownego otrzymania tego samego zakupu bez podwójnego przetwarzania. Eksport DXF 2D zaimplementowano w kodzie 20 października 2026; [zakres i weryfikacja](eksport-dxf.md). Przed release należy podłączyć go do uprawnienia Plus. Obecna implementacja nie realizuje jeszcze ograniczeń ani zakupów, więc DXF jest dostępny do testowania bez blokady.
