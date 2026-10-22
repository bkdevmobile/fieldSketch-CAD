# outlineGo (wcześniej FieldSketch CAD)

Mobilne narzędzie Android do tworzenia pomocniczych, wymiarowanych szkiców 2D w terenie. Pracuje offline, bez kont i własnego backendu. Technologia: **React Native + Expo + TypeScript**, natywne sensory w Kotlin.

Długości można wpisać w m/cm albo oszacować krokomierzem Start/Stop; domyślna długość kroku to 75 cm, zmieniana w ustawieniach. Kierunek może być względny, magnetyczny lub ręczny. Użytkownik zaakceptował wykonane próby trybu względnego i działanie krokomierza; nie określono liczbowej gwarancji dokładności.

Szkice są zapisywane lokalnie. Dostępne są notatki, przypinanie na liście, zbiorcza korekta wymiarów, wybór boku do ponownego pomiaru, pole i obwód oraz eksport PNG i DXF. Opisy omijają linie obrysu i inne etykiety. [Zasady korekt i historia pomiarów](docs/technical/edycja-szkicu.md).

Interfejs obsługuje PL/EN/DE/ES/FR. Domyślnie wybiera język telefonu, z angielskim jako rezerwowym; język można zmienić w ustawieniach. [Wielojęzyczność](docs/technical/wielojezycznosc.md).

Free: do 8 punktów (z P1), do 3 szkiców i PNG ze znakiem wodnym. Plus usuwa limity i znak wodny oraz odblokowuje DXF. Zakup i przywracanie Plus za 29,99 zł jednorazowo są podłączone przez Google Play Billing 9.1.0, z weryfikacją podpisu i trwałym uprawnieniem offline. Pakiet: `com.bk.dev.mobile.outlinego`, produkt: `outlinego_plus`, opcja: `buy`, dostępność: Polska. Użytkownik potwierdził pierwsze wydanie w testach wewnętrznych i zapis produktu; publiczny klucz licencyjny jest osadzony. Do potwierdzenia pozostają aktywacja opcji, testerzy licencji i testy płatności/przywracania. Produkcji nie opublikowano. [Free/Plus](docs/technical/free-plus.md), [zakupy i podpisywanie](docs/technical/zakupy-google-play.md).

## Stan projektu

Aktualizacja UI z 22 października 2026 jest w źródłach: zadokowany szkic 40% z overlayem i pełnym ekranem, motywy jasny/ciemny/systemowy, jednostki ft/in, domyślne nazwy „Mój pomiar” i zmiany układu listy oraz pomiaru. Ekrany diagnostyki i logów usunięto z interfejsu. TypeScript, 168 testów w 21 zestawach i eksport bundla Android przeszły. Podpisany APK z tymi zmianami jest w `artifacts/outlineGo-0.1.0.apk`; AAB nie przebudowano. [Zakres i weryfikacja UI](docs/technical/ui-2026-10.md).

Aktualna weryfikacja źródeł: TypeScript i 163 testy TS (20 zestawów) przeszły. Moduł płatności ma 11 zaliczonych testów Kotlin; 7 testów orientacji przy ostatnim budowaniu było UP-TO-DATE. Podpisany APK 0.1.0 (versionCode 2) z zakupami i kluczem licencyjnym zainstalowano i uruchomiono na Redmi bez błędów ReactNativeJS/AndroidRuntime. Ten APK i AAB powstały przed ostatnią poprawką początkowego widoku DXF; poprawka jest w źródłach i wymaga nowego budowania. Testy transakcji Google Play, początkowego widoku w GUI CAD i fizycznego ponownego pomiaru sensorami pozostają otwarte. Historię, hashe i logi zawiera MEMO.md.

Podpisany APK `artifacts/outlineGo-0.1.0.apk`, wersja 0.1.0 / versionCode 2, zainstalowano na Redmi. Pierwszy bundle jest w testach wewnętrznych według potwierdzenia użytkownika; gotowy AAB v2: `artifacts/outlineGo-0.1.0.aab`. Oba artefakty nie zawierają jeszcze ostatniej poprawki początkowego widoku DXF. Nie opublikowano produkcji. Szczegóły i pełne hashe: MEMO.md.

## Dokumentacja i uruchomienie

- [Indeks dokumentacji](docs/README.md)
- [Instrukcja użytkowania i instalacji](docs/technical/prototyp.md)
- [Opis aplikacji, budowanie i testy](app/README.md)
- [Dokumentacja techniczna](docs/technical/dokumentacja-techniczna.md)
- [Plan rozwoju i pozostałe prace](docs/plan-rozwoju.md)
- [Źródłowa dokumentacja biznesowa](docs/business/FieldSketch_CAD_dokumentacja_biznesowa_i_prototyp.docx)

Kod znajduje się w `app/`, dokumentacja w `docs/`. W katalogu `app`: `npm run typecheck`, `npm test`, `npm run build:apk`. APK zawiera JavaScript i działa bez Metro. Logi diagnostyczne pozostają lokalne; można je przeglądać, kopiować i eksportować do JSONL/CSV.
