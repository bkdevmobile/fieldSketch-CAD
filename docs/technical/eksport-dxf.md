# Eksport DXF 2D

Pierwszą wersję wdrożono 20 października 2026. Stan aktualny: `acf99a0` z 21 października — dodano notatkę szkicu i rozmieszczanie etykiet z kontrolą kolizji. Generator zapisuje plik w cache i otwiera systemowe udostępnianie. Wybór celu należy do użytkownika. Wymagany co najmniej jeden bok i uprawnienie Plus; operacja jest blokowana podczas innego zapisu. Anulowanie udostępniania nie zmienia szkicu. Obecny build ma plan Free bez podłączonego zakupu, dlatego nie można w nim jeszcze odblokować DXF.

## Format i zawartość

- Tekstowy DXF AutoCAD 2000 (`AC1015`), lokalny układ XY, Z=0. P1 pozostaje w swoim początku; eksport nie stosuje transformacji podglądu ani nie odwraca osi Y.
- Jednostka z ustawień aplikacji: m (`$INSUNITS=6`) lub cm (`$INSUNITS=5`). Przeliczane są współrzędne, opisy i rozmiary tekstu. Geometria pozostaje z pełną precyzją liczb; opisy długości mają maksymalnie trzy miejsca po kropce, bez końcowych zer. [Zasady precyzji](precyzja-wymiarow.md).
- `OUTLINE`: jedna `LWPOLYLINE`, flaga zamknięcia zgodna ze szkicem. Zamknięcie nie dodaje kopii P1. Numerycznie pokrywający się końcowy punkt istniejącego zamkniętego szkicu pomijany jak w podglądzie/PNG; rzeczywista szczelina nie jest korygowana.
- `POINT_LABELS`: poziome teksty P1, P2 itd., odsuwane od boków, punktów i pozostałych etykiet.
- `LENGTHS`: poziome teksty przy bokach z jednostką, z kontrolą kolizji; `~` oznacza długość z kroków, `(auto)` geometrycznie wyliczony bok zamykający. Opisy są niezależnymi tekstami, bez asocjatywnego `DIMENSION`.
- `NOTES`: nazwa szkicu, układ i jednostka, objaśnienia kroków i zamknięcia oraz notatka użytkownika. Teksty są układane poniżej geometrii i etykiet; wielowierszowa notatka jest dzielona na osobne rekordy TEXT. Przy niezależnym pomiarze zamknięcia uwaga, że nie koryguje on geometrii. Długa nazwa może być skrócona w opisie.
- Polskie znaki kodowane przez sekwencje DXF `\U+XXXX`; nowe linie i znaki sterujące w nazwie nie tworzą nowych rekordów pliku. Nazwa pliku używa identyfikatora i rewizji, np. `outlinego-ID-r3-cm.dxf`.

Generator: `app/src/domain/dxfExport.ts`; wspólne rozmieszczanie etykiet: `app/src/domain/labelLayout.ts`. Zapis i udostępnianie: `app/src/infrastructure/shareDxf.ts`. Obie operacje pracują na przekazanej wersji szkicu, bez zmiany historii ani bazy. Nie dodano zależności produkcyjnych ani testowych.

## Free / Plus

DXF wymaga Plus zgodnie z [zasadami](free-plus.md). W iteracji limitów Free dodano oznaczenie „DXF · Plus”, ofertę oraz blokadę w funkcji udostępniania. Centralny plan obecnie ma wartość Free, a zakup i trwałe uprawnienie pozostają do podłączenia; w tej wersji nie można jeszcze kupić ani odblokować DXF. Poprzedni APK `9E8708ED…` zainstalowany na Redmi nadal ma eksport bez blokady. DXF nie jest kopią zapasową obserwacji ani plikiem DWG.

## Weryfikacja

Aktualny kod `acf99a0`: TypeScript i 127 testów TS przeszły, w tym generowanie DXF po korektach, obecność notatek i unikanie kolizji etykiet w trudnych układach. Najnowszy APK zbudowano i sprawdzono na emulatorze, ale nie wykonano nowego wizualnego importu DXF w CAD. Próby eksportu generatora nie oznaczają dostępności zakupu Plus.

Pierwsza iteracja DXF (20 października): TypeScript i 92 testy TS przeszły. Nowe testy obejmują otwartą i zamkniętą polilinię, trójkąt 3/4/5, m/cm, nieodwrócone osie, powrót do P1 bez zerowego boku, rzeczywistą szczelinę, korektę, historię, niepoprawne współrzędne, nazwy/uchwyty, zapis i udostępnienie.

Wygenerowano próbki otwarte/zamknięte w m/cm w `artifacts/dxf/`. Zainstalowany LibreCAD otworzył `triangle-closed-m.dxf`; po Auto Zoom sprawdzono obrys 3/4/5 m, etykiety P1–P3, warstwy oraz polskie znaki i objaśnienia. Dostępny lokalny kontrolny PDF z konwersji czterech próbek. Nie jest to potwierdzenie kontroli w drugim programie CAD. Dodatkowy parser npm został odrzucony przez automatyczną kontrolę uprawnień; nie instalowano nowych pakietów.

Pozostaje próba systemowego udostępniania na telefonie i importu w drugim CAD przed release. APK z DXF (`172ebe8`, SHA256 `9E8708ED…`, 85263751 bajtów) zbudowano i zainstalowano na Redmi 20 października 2026 z zachowaniem danych: instalacja Success, uruchomienie Status ok / COLD. Build `dxf-export-build.log`: BUILD SUCCESSFUL in 58s; testy Kotlin UP-TO-DATE. Zakończone wcześniejsze testy zamknięte nie obejmowały tej nowej funkcji.

## Pozostałe próby eksportu

Poniższe próby pozostają otwarte. Na Redmi APK `9E8708ED…` pozwala sprawdzić wcześniejszy eksport bez bramki, ale nie zawiera notatek i nowego układu etykiet. Aktualny generator należy sprawdzić osobno w CAD; próba pełnego eksportu w aktualnej aplikacji wymaga podłączenia uprawnienia Plus. Nie oznaczamy tych scenariuszy jako wykonanych na podstawie instalacji APK.

- [ ] Otwarty szkic: Podsumowanie → Eksportuj DXF → wybierz dostępny cel zapisu/udostępnienia. Zapisany plik ma rozszerzenie `.dxf` i otwiera się poza aplikacją.
- [ ] Powtórz dla zamkniętego obrysu, w m i cm. Zamknięcie i skala odpowiadają ustawieniom; PNG nadal działa.
- [ ] Sprawdź numery punktów, długości z kroków, oznaczenie wyliczonego zamknięcia i polskie znaki.
- [ ] Po korekcie kilku wymiarów sprawdź, czy eksport ma aktualne współrzędne, opisy i jednostkę.
- [ ] Wyeksportuj wielowierszową notatkę z polskimi znakami; sprawdź warstwę NOTES i odsunięcie od obrysu.
- [ ] Wąskie, ukośne i wklęsłe obrysy: sprawdź, czy opisy nie przecinają boków i siebie nawzajem oraz czy da się przypisać je do właściwych punktów/boków.
- [ ] Anuluj udostępnianie: szkic, punkty i historia pozostają bez zmian, a eksport można ponowić.
- [ ] Otwórz plik w drugim programie CAD i sprawdź wymiary referencyjne oraz warstwy. Zapisz nazwę i wersję programu oraz wynik próby.

## Referencje formatu

[LWPOLYLINE](https://help.autodesk.com/cloudhelp/2020/ENU/AutoCAD-DXF/files/GUID-748FC305-F3F2-4F74-825A-61F04D757A50.htm), [TEXT](https://help.autodesk.com/cloudhelp/2018/ENU/AutoCAD-DXF/files/GUID-62E5383D-8A14-47B4-BFC4-35824CAE8363.htm), [INSUNITS](https://help.autodesk.com/cloudhelp/2025/ENU/AutoCAD-Core/files/GUID-A58A87BB-482B-4042-A00A-EEF55A2B4FD8.htm).
