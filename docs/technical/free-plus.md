# outlineGo — zasady Free / Plus

Status: zasady zaakceptowane przez użytkownika 20 października 2026. W kodzie są limity Free, znak wodny PNG, bramka DXF oraz integracja zakupu, przywracania i trwałego uprawnienia Plus. Uruchomienie sprzedaży wymaga konfiguracji Play Console i testów sklepowych. [Konfiguracja i odbiór zakupów](zakupy-google-play.md).

Aktualizacja 21 października 2026, kod `acf99a0`: notatki, przypinanie, zbiorcza korekta wymiarów i ponowny pomiar istniejącego boku są dostępne w Free. Nie zwiększają limitu punktów ani szkiców; korekty działają także na istniejących danych ponad limit. Notatka trafia do PNG ze znakiem wodnym; eksport DXF z notatką nadal wymaga Plus. [Zasady edycji](edycja-szkicu.md).

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

Wdrożono: wspólną politykę `domain/access.ts`, sprawdzanie limitów w UI i transakcji SQLite, komunikaty limitów, ofertę Plus w dialogu i osobnym ekranie dostępnym z menu głównego, dodatkowy pasek PNG oraz blokadę udostępniania DXF w Free. Istniejące szkice ponad limit pozostają dostępne; korekty, undo i wyliczone zamknięcie nie wymagają Plus. Przy P8 nie jest uruchamiany kolejny odczyt kierunku, a zakończenie z automatycznym zamknięciem działa bez kalibracji.

Plan jest odczytywany centralnie ze store, z lokalnie zweryfikowanego zakupu Google Play. Nie ma ręcznego przełącznika ani udawanego zakupu. Oferta pokazuje cenę sklepu, zakup i przywracanie; bez konfiguracji klucza licencyjnego lub dostępnego produktu zakup pozostaje wyłączony. Potwierdzony zakup odblokowuje wszystkie istniejące bramki Plus bez zmiany danych szkicu.

Zakup i przywracanie Plus za 29,99 zł jednorazowo są podłączone przez Google Play Billing 9.1.0, z weryfikacją podpisu i trwałym uprawnieniem offline. Pakiet: `com.bk.dev.mobile.outlinego`, produkt: `outlinego_plus`, opcja: `buy`, dostępność: Polska. Użytkownik potwierdził pierwsze wydanie w testach wewnętrznych i zapis produktu; publiczny klucz licencyjny jest osadzony. Do potwierdzenia pozostają aktywacja opcji, testerzy licencji i testy płatności/przywracania. Produkcji nie opublikowano. [Konfiguracja i odbiór](zakupy-google-play.md).

Weryfikacja aktualnych źródeł: TypeScript i 163 testy TS przeszły; 11 testów Kotlin modułu zakupów zaliczono. Testy nie zastępują transakcji w Google Play. Poniższa próba limitów pochodzi z iteracji Free/Plus z 20 października, dla której przeszło 99 testów TS. Testy obejmują P7→P8/P8→P9, wyliczone zamknięcie i blokadę wyjątku powrotu przy P8, czwarty szkic, zwolnienie miejsca po usunięciu, większe archiwum i korektę po utracie Plus, pasek PNG bez zmiany rysunku/oznaczeń szacunkowych oraz odmowę zapisu DXF bez Plus. W SQLite sprawdzono też brak utraty danych po odrzuconym zapisie.

Próba na emulatorze Pixel 8 API 36: aktualizacja zachowała 10 istniejących szkiców. Potwierdzono komunikat limitu tworzenia, ofertę 29,99 zł z informacją o niedostępnym zakupie, bramkę DXF, podgląd PNG z osobnym paskiem i wygenerowanie obrazu do systemowego arkusza udostępniania (bez wysyłania). Testowy szkic Mode9 doprowadzono od P2 do P8; dalszy pomiar zastąpił panel limitu. Po restarcie aplikacji wyliczone zamknięcie przy P8 przeszło bez przechwycenia kierunku i otworzyło podsumowanie. Po próbie ukryto niepasujący komunikat wznowienia o ponownym celowaniu na ekranie limitu. Logcat AndroidRuntime:E / ReactNativeJS:E bez wpisów. Emulator zamknięto, danych nie czyszczono.

Obejrzano zrzuty `artifacts/free-plus-offer.png` i `artifacts/free-png-preview.png`; zrzuty limitów: `free-project-limit.png`, `free-point-limit-final.png`. Plus i utrata uprawnienia były sprawdzane testami polityki i bazy, bez zakupu Google Play. Wdrożenia na fizycznym telefonie w tej iteracji nie wykonano.


Historyczny APK iteracji Free/Plus: SHA256 B86BAD59E48C12945617EE5764B3F6FFC3B0C7A5C8DE5E33914D57D92FD1162B, 85272803 bajtów; BUILD SUCCESSFUL in 1m. Log artifacts/free-plus-build-final.log; testy Kotlin UP-TO-DATE. Nie instalowano tej iteracji na telefonie.

Aktualny APK z edycją szkiców (D16ED88C…) zbudowano i sprawdzono na emulatorze 21 października, zachowując 10 szkiców. Telefon pozostaje na wcześniejszym buildzie DXF bez limitów. Pełne dane artefaktu i stan wdrożenia: [MEMO](../../MEMO.md).
