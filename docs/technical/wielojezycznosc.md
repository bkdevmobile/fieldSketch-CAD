# Wielojęzyczność outlineGo

Wdrożenie: 20 października 2026. Obsługiwane języki: polski, angielski, niemiecki, hiszpański i francuski.

W Ustawieniach dostępne są: Systemowy, Polski, English, Deutsch, Español i Français. Domyślne ustawienie Systemowy wybiera pierwszy obsługiwany język z preferencji telefonu; przy braku obsługi używa angielskiego. Wybór ręczny działa po zapisaniu ustawień i pozostaje po ponownym uruchomieniu. Nazwy języków są zawsze zapisane w ich własnym języku.

Na Androidzie 13+ wybór jest synchronizowany z systemowym językiem aplikacji przez LocaleManager. Zmiana w ustawieniach Androida jest odczytywana po powrocie do aplikacji i przy jej starcie. Starszy Android korzysta z preferencji zapisanej lokalnie w SQLite. Konfigurację pięciu języków generuje plugin Expo `app/scripts/with-languages.cjs`; zmiana języka nie wymaga odtwarzania Activity.

## Zakres

- Ekrany, menu, własne dialogi, instrukcje pomiaru, statusy, komunikaty błędów i etykiety dostępności.
- Oferta i limity Free/Plus oraz znak wodny i objaśnienia w PNG; objaśnienia i błędy eksportu DXF.
- Daty i liczby prezentowane zgodnie z aktywnym językiem. Formularze nadal przyjmują przecinek i kropkę jako separator dziesiętny.
- Jednostki są niezależnym ustawieniem. Zmiana języka nie przelicza geometrii, kroków ani zapisanych obserwacji; zachowuje szkice, roboczy formularz oraz preferencje miniatury i metody długości.

Nazwy szkiców i notatki użytkownika nie są tłumaczone. Identyfikatory punktów P1… oraz techniczne nazwy warstw DXF i pola JSONL/CSV pozostają stałe. Liczby wewnątrz DXF nadal używają kropki wymaganej przez format. Surowe błędy natywne pozostają w logach; znane komunikaty są tłumaczone przy prezentacji użytkownikowi.

Cena Plus pozostaje ofertą w PLN: 29,99 zł / 29.99 PLN. Lokalizacja nie wprowadza cen w EUR ani przeliczania walut. Integracja płatności i cen ze sklepu pozostaje osobnym zadaniem.

## Utrzymanie

Słownik `app/src/i18n/messages.ts` przechowuje wiersze PL/EN/DE/ES/FR; polski tekst jest kluczem. `t()` podstawia parametry `{0}`, `{1}` bez tłumaczenia ich wartości. Brak tłumaczenia korzysta z angielskiej wersji; nieznany klucz pozostaje widoczny diagnostycznie. Nowy tekst należy dodać do wszystkich pięciu kolumn i wywoływać przez `t()` przy renderowaniu, nie raz przy ładowaniu modułu.

Testy sprawdzają kompletność słowników, unikalność kluczy, parametry, pokrycie dosłownych wywołań `t()`, wybór języka, synchronizację z Androidem, trwałość w SQLite i niezmienność danych eksportu. Przed publikacją pozostaje korekta językowa przez rodzimych użytkowników i przegląd na innych rozmiarach ekranów.
