# Eksport DXF 2D

Wdrożono w kodzie 20 października 2026. Na podsumowaniu szkicu „Eksportuj DXF” zapisuje plik w cache i otwiera systemowe udostępnianie. Wybór celu zapisu lub aplikacji należy do użytkownika. Wymagany przynajmniej jeden bok; blokada podczas trwania operacji. Anulowanie udostępniania nie zmienia szkicu.

## Format i zawartość

- Tekstowy DXF AutoCAD 2000 (`AC1015`), lokalny układ XY, Z=0. P1 pozostaje w swoim początku; eksport nie stosuje transformacji podglądu ani nie odwraca osi Y.
- Jednostka z ustawień aplikacji: m (`$INSUNITS=6`) lub cm (`$INSUNITS=5`). Przeliczane są współrzędne, opisy i rozmiary tekstu. Geometria pozostaje z pełną precyzją liczb; opisy długości mają dwa miejsca po kropce.
- `OUTLINE`: jedna `LWPOLYLINE`, flaga zamknięcia zgodna ze szkicem. Zamknięcie nie dodaje kopii P1. Numerycznie pokrywający się końcowy punkt istniejącego zamkniętego szkicu pomijany jak w podglądzie/PNG; rzeczywista szczelina nie jest korygowana.
- `POINT_LABELS`: teksty P1, P2 itd.
- `LENGTHS`: teksty przy bokach z jednostką; `~` oznacza długość z kroków, `(auto)` geometrycznie wyliczony bok zamykający. Opisy są niezależnymi tekstami, bez asocjatywnego `DIMENSION`.
- `NOTES`: nazwa szkicu, układ i jednostka, objaśnienia kroków i zamknięcia. Przy niezależnym pomiarze zamknięcia uwaga, że nie koryguje on geometrii. Długa nazwa może być skrócona w opisie.
- Polskie znaki kodowane przez sekwencje DXF `\U+XXXX`; nowe linie i znaki sterujące w nazwie nie tworzą nowych rekordów pliku. Nazwa pliku używa identyfikatora i rewizji, np. `outlinego-ID-r3-cm.dxf`.

Generator: `app/src/domain/dxfExport.ts`. Zapis i udostępnianie: `app/src/infrastructure/shareDxf.ts`. Obie operacje pracują na przekazanej wersji szkicu, bez zmiany historii ani bazy. Nie dodano zależności produkcyjnych ani testowych.

## Free / Plus

Docelowo DXF wymaga Plus zgodnie z [zasadami](free-plus.md). W tej iteracji zakup i stan uprawnienia jeszcze nie istnieją; eksport jest dostępny do testowania bez blokady. Podłączenie do uprawnienia pozostaje pracą przed release. DXF nie jest kopią zapasową obserwacji ani plikiem DWG.

## Weryfikacja

TypeScript i 92 testy TS przeszły. Nowe testy obejmują otwartą i zamkniętą polilinię, trójkąt 3/4/5, m/cm, nieodwrócone osie, powrót do P1 bez zerowego boku, rzeczywistą szczelinę, korektę, historię, niepoprawne współrzędne, nazwy/uchwyty, zapis i udostępnienie.

Wygenerowano próbki otwarte/zamknięte w m/cm w `artifacts/dxf/`. Zainstalowany LibreCAD otworzył `triangle-closed-m.dxf`; po Auto Zoom sprawdzono obrys 3/4/5 m, etykiety P1–P3, warstwy oraz polskie znaki i objaśnienia. Dostępny lokalny kontrolny PDF z konwersji czterech próbek. Nie jest to potwierdzenie kontroli w drugim programie CAD. Dodatkowy parser npm został odrzucony przez automatyczną kontrolę uprawnień; nie instalowano nowych pakietów.

Pozostaje próba systemowego udostępniania na telefonie i importu w drugim CAD przed release. APK z DXF (`172ebe8`, SHA256 `9E8708ED…`, 85263751 bajtów) zbudowano i zainstalowano na Redmi 20 października 2026 z zachowaniem danych: instalacja Success, uruchomienie Status ok / COLD. Build `dxf-export-build.log`: BUILD SUCCESSFUL in 58s; testy Kotlin UP-TO-DATE. Zakończone wcześniejsze testy zamknięte nie obejmowały tej nowej funkcji.

## Próba z aktualnego APK

Scenariusz dla APK `9E8708ED…` na Redmi; poniższych prób nie oznaczono jako wykonane na podstawie samej instalacji:

- [ ] Otwarty szkic: Podsumowanie → Eksportuj DXF → wybierz dostępny cel zapisu/udostępnienia. Zapisany plik ma rozszerzenie `.dxf` i otwiera się poza aplikacją.
- [ ] Powtórz dla zamkniętego obrysu, w m i cm. Zamknięcie i skala odpowiadają ustawieniom; PNG nadal działa.
- [ ] Sprawdź numery punktów, długości z kroków, oznaczenie wyliczonego zamknięcia i polskie znaki.
- [ ] Anuluj udostępnianie: szkic, punkty i historia pozostają bez zmian, a eksport można ponowić.
- [ ] Otwórz plik w drugim programie CAD i sprawdź wymiary referencyjne oraz warstwy. Zapisz nazwę i wersję programu oraz wynik próby.

## Referencje formatu

[LWPOLYLINE](https://help.autodesk.com/cloudhelp/2020/ENU/AutoCAD-DXF/files/GUID-748FC305-F3F2-4F74-825A-61F04D757A50.htm), [TEXT](https://help.autodesk.com/cloudhelp/2018/ENU/AutoCAD-DXF/files/GUID-62E5383D-8A14-47B4-BFC4-35824CAE8363.htm), [INSUNITS](https://help.autodesk.com/cloudhelp/2025/ENU/AutoCAD-Core/files/GUID-A58A87BB-482B-4042-A00A-EEF55A2B4FD8.htm).
