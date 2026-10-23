# Pomysły na rozwój outlineGo

Dokument zbiera pomysły użytkownika do późniejszego dopracowania. Wpis nie oznacza rozpoczęcia wdrożenia ani ustalonego terminu realizacji.

## 1. Eksport i import listy szkiców

Data dodania: 22 października 2026. Status: pomysł do dopracowania.

**Cel:** umożliwić zapisanie szkiców do pliku i ponowne wczytanie ich w aplikacji, np. jako kopii zapasowej lub przy przenoszeniu na inny telefon.

Proponowany zakres:

- Eksport listy szkiców wraz z danymi potrzebnymi do dalszej edycji, w tym geometrią, pomiarami, nazwami i notatkami.
- Import wcześniej wyeksportowanego pliku do listy szkiców w aplikacji.
- Zachowanie możliwości otwierania, edycji i kontynuowania zaimportowanych szkiców.

Do ustalenia przed wdrożeniem:

- Eksport całej listy czy również wybranych szkiców.
- Format pliku i zgodność między wersjami aplikacji.
- Zachowanie przy duplikatach: pomijanie, dodawanie kopii lub zastępowanie.
- Zasady importu przy limitach Free oraz dostępność funkcji w Free/Plus.

Stan: zapisane w dokumentacji; bez zmian w aplikacji i preview.

## 2. Strona WWW, dokumenty prawne i informacja startowa

Data dodania: 22 października 2026. Status: strona EN opublikowana w Firebase z roboczymi dokumentami; linki i wersjonowany ekran akceptacji wdrożone w źródłach aplikacji. Pozostają zatwierdzenie dokumentów i próba nowego buildu.

Zakres:

- Wykonać stronę WWW z informacjami o aplikacji, jej funkcjach i przeznaczeniu.
- Opublikować na stronie dokumenty prawne; ich dokładny zestaw i treść ustalić przed wdrożeniem, np. politykę prywatności i warunki korzystania.
- Dodać w aplikacji stale dostępne linki do dokumentów prawnych, np. w ustawieniach.
- Przy pierwszym uruchomieniu pokazać informację wymagającą świadomej akceptacji: ograniczona dokładność pomiarów, szacunkowa długość wyznaczana krokami, wpływ warunków i czujników oraz pomocniczy charakter szkiców.

Pierwotne kwestie do ustalenia (obecny stan poniżej):

- Domena, hosting, języki strony i dokumentów oraz miejsce odnośników w aplikacji.
- Dokładne brzmienie informacji startowej i sposób potwierdzenia jej przeczytania.
- Zachowanie bez akceptacji oraz zapis daty i wersji zaakceptowanej informacji.
- Kiedy po zmianie treści wymagać ponownej akceptacji i jak udostępniać informację ponownie po zakończeniu pierwszego uruchomienia.

Obecny stan: domena outlinego-27ab5.web.app, Firebase Hosting, WWW i dokumenty EN; linki na pierwszym ekranie i w ustawieniach. Akceptacja zapisuje wersję treści i datę UTC, a istotna zmiana wersji ponawia pytanie. Diagnostyka jest osobna. [Stan i pozostałe prace](stan-projektu.md), [pierwsze uruchomienie](technical/pierwsze-uruchomienie.md), [dokumenty prawne](legal/README.md).

## 3. Orientacja pozioma (landscape)

Data dodania: 23 października 2026. Status: do wdrożenia.

Dodać obsługę orientacji poziomej (landscape) i dostosować układ ekranów do obrotu telefonu. Zachować stan pomiaru i edycji szkicu przy zmianie orientacji.

## 4. Ustawienia warstw DXF

Data dodania: 23 października 2026. Status: do wdrożenia.

Dodać ustawienia eksportu DXF umożliwiające użytkownikowi zmianę nazw i kolorów warstw. Eksportowany plik powinien uwzględniać wybrane nazwy i kolory.
