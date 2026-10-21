# outlineGo (wcześniej FieldSketch CAD)

Mobilne narzędzie Android do tworzenia pomocniczych, wymiarowanych szkiców 2D w terenie. Pracuje offline, bez kont i własnego backendu. Technologia: **React Native + Expo + TypeScript**, natywne sensory w Kotlin.

Długości można wpisać w m/cm albo oszacować krokomierzem Start/Stop; domyślna długość kroku to 75 cm, zmieniana w ustawieniach. Kierunek może być względny, magnetyczny lub ręczny. Użytkownik zaakceptował wykonane próby trybu względnego i działanie krokomierza; nie określono liczbowej gwarancji dokładności.

Szkice są zapisywane lokalnie. Dostępne są notatki, przypinanie na liście, zbiorcza korekta wymiarów, wybór boku do ponownego pomiaru, pole i obwód oraz eksport PNG i DXF. Opisy omijają linie obrysu i inne etykiety. [Zasady korekt i historia pomiarów](docs/technical/edycja-szkicu.md).

Interfejs obsługuje PL/EN/DE/ES/FR. Domyślnie wybiera język telefonu, z angielskim jako rezerwowym; język można zmienić w ustawieniach. [Wielojęzyczność](docs/technical/wielojezycznosc.md).

Free: do 8 punktów (z P1), do 3 szkiców i PNG ze znakiem wodnym. Planowany Plus za 29,99 zł jednorazowo usuwa te limity i znak wodny oraz odblokowuje DXF. Limity i bramka DXF są wdrożone, ale zakup i przywracanie Plus pozostają do podłączenia; obecny plan jest Free. Korekty i dostęp do istniejących szkiców działają także ponad limit. [Free/Plus](docs/technical/free-plus.md).

## Stan projektu

21 października 2026: kod aplikacji **acf99a0**, APK 0.1.0 zbudowany i sprawdzony na emulatorze. TypeScript i **127 testów TS** przeszły; zadanie testów Kotlin było UP-TO-DATE. Potwierdzono notatkę i przypięcie po restarcie, korektę wymiaru i pełny ręczny ponowny pomiar. Fizyczna próba nowych korekt z kierunkiem sensorowym i krokomierzem pozostaje do wykonania.

Najnowszy APK: [artifacts/outlineGo-0.1.0.apk](artifacts/outlineGo-0.1.0.apk), zainstalowany wyłącznie na emulatorze. Redmi nadal ma wcześniejszą wersję z DXF. Testy zamknięte wcześniejszego MVP zakończono decyzją użytkownika 20 października; wersja produkcyjna nie została opublikowana. Szczegóły artefaktów i instalacji: [MEMO](MEMO.md).

## Dokumentacja i uruchomienie

- [Indeks dokumentacji](docs/README.md)
- [Instrukcja użytkowania i instalacji](docs/technical/prototyp.md)
- [Opis aplikacji, budowanie i testy](app/README.md)
- [Dokumentacja techniczna](docs/technical/dokumentacja-techniczna.md)
- [Plan rozwoju i pozostałe prace](docs/plan-rozwoju.md)
- [Źródłowa dokumentacja biznesowa](docs/business/FieldSketch_CAD_dokumentacja_biznesowa_i_prototyp.docx)

Kod znajduje się w `app/`, dokumentacja w `docs/`. W katalogu `app`: `npm run typecheck`, `npm test`, `npm run build:apk`. APK zawiera JavaScript i działa bez Metro. Logi diagnostyczne pozostają lokalne; można je przeglądać, kopiować i eksportować do JSONL/CSV.
