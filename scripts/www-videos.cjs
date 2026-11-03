const fs = require('node:fs');
const path = require('node:path');

const films = [
  { id:'01', name:'overview', duration:'1:00',
    title:['Od szkicu na telefonie do CAD','From a phone sketch to CAD'],
    disclosure:['Rzeczywiste ekrany aplikacji i LibreCAD z danymi demonstracyjnymi. Film pokazuje ręczne wprowadzanie wymiarów; eksport własnych szkiców do DXF wymaga Plus.','Actual app and LibreCAD screens with demonstration data. This video uses manually entered dimensions; exporting your own sketches to DXF requires Plus.'],
    transcript:['Zapis boku → podgląd obrysu → PNG → eksport DXF Plus → ten sam obrys w LibreCAD. Przykład: prostokąt 4 × 3 m, obwód 14 m i pole 12 m².','Save a side → review the outline → PNG → Plus DXF export → the same outline in LibreCAD. Example: a 4 × 3 m rectangle, 14 m perimeter and 12 m² area.'] },
  { id:'02', name:'first-sketch', duration:'3:44',
    title:['Pierwszy szkic krok po kroku','Your first sketch, step by step'],
    disclosure:['Rzeczywisty interfejs, ręcznie wpisane dane demonstracyjne. Film przedstawia osobny przykład 4 × 3 m, a nie ogród z sześcioma punktami z instrukcji na stronie.','Actual interface with manually entered demonstration data. The video uses a separate 4 × 3 m example, rather than the six-point garden shown in this page’s guide.'],
    transcript:['Utwórz szkic → zapisz kierunek i długość → dodaj kolejne punkty → popraw 3,8 m na 4 m → zamknij obrys → sprawdź 14 m i 12 m² → eksportuj PNG Free. Bok zamykający jest wyliczony.','Create a sketch → save direction and length → add points → correct 3.8 m to 4 m → close the outline → check 14 m and 12 m² → export a Free PNG. The closing side is calculated.'] },
  { id:'03', name:'garden', duration:'0:45',
    title:['Od wymiarów ogrodu do szkicu','From garden dimensions to a sketch'],
    disclosure:['Scena osoby mierzącej ogród jest wygenerowaną ilustracją z delikatnym oddaleniem. Ekrany i PNG są rzeczywiste, dane wpisano ręcznie. Film nie dokumentuje fizycznego pomiaru ani wymiarów ogrodu w kształcie L opisanego na stronie.','The person measuring the garden is a generated illustration with a gentle zoom out. App screens and PNG are real, with manually entered data. This video does not document a physical measurement or the dimensions of the L-shaped garden described on this page.'],
    transcript:['Ilustracja pomiaru ogrodu → ręczne wpisanie długości w aplikacji → podsumowanie → oryginalny PNG. Ilustracja i rzeczywisty interfejs pokazują ideę przejścia od wymiarów do szkicu.','Garden measurement illustration → enter a length manually in the app → summary → original PNG. The illustration and actual interface show the idea of turning dimensions into a sketch.'] },
  { id:'04', name:'dxf-to-cad', duration:'2:24',
    title:['Eksport DXF z telefonu do LibreCAD','Export DXF from your phone to LibreCAD'],
    disclosure:['Rzeczywisty eksport i interfejs CAD, z testowym uprawnieniem Plus na czas nagrania. Film pokazuje osobny prostokąt 4 × 3 m, a nie ogród 32 m / 55 m² z przykładu do pobrania. Materiał nie dokumentuje zakupu Plus.','Actual export and CAD interface, recorded with a temporary test Plus entitlement. The video uses a separate 4 × 3 m rectangle, not the 32 m / 55 m² downloadable garden example. This is not a Plus purchase demonstration.'],
    transcript:['Eksportuj DXF → otwórz plik w LibreCAD → sprawdź jednostkę Metr → porównaj obrys → zmierz obwód 14 m. Eksport własnych szkiców do DXF wymaga Plus. LibreCAD jest osobnym programem.','Export DXF → open the file in LibreCAD → check the metre unit → compare the outline → measure the 14 m perimeter. Exporting your own sketches to DXF requires Plus. LibreCAD is separate software.'] },
  { id:'05', name:'room', duration:'1:12',
    title:['Szkic pokoju krok po kroku','A room sketch, step by step'],
    disclosure:['Ilustracja osoby mierzącej pokój została wygenerowana. Ekrany aplikacji i eksport PNG są rzeczywiste; wymiary przykładu wpisano ręcznie.','The illustration of a person measuring a room was generated. App screens and the PNG export are actual captures; the example dimensions were entered manually.'],
    transcript:['Ilustracja pomiaru pokoju → nowy szkic Salon → bok 5 m → boki 4 m i 4,8 m → korekta 4,8 na 5 m → wyliczone zamknięcie → obwód 18 m, pole 20 m² → eksport PNG.','Room measurement illustration → new Room sketch → 5 m side → 4 m and 4.8 m sides → correct 4.8 to 5 m → calculated closure → 18 m perimeter, 20 m² area → PNG export.'] },
  { id:'06', name:'camera-steps', duration:'1:48',
    title:['Kamera i krokomierz w praktyce','Camera and step counter in action'],
    disclosure:['Demonstracja w emulatorze: kierunki i odczyty kroków są symulowane, a obraz ogrodu w wirtualnej kamerze pochodzi z wygenerowanej ilustracji. Interfejs, przeliczanie długości, zapis i PNG są rzeczywiste. Film nie dokumentuje fizycznego pomiaru.','Emulator demonstration: directions and step readings are simulated, and the virtual camera garden scene comes from a generated illustration. The interface, length calculation, saving and PNG export are real. This is not a recording of a physical measurement.'],
    transcript:['Celowanie tylną kamerą → zapis kierunku → Start → rosnący licznik kroków → zatrzymanie i Stop → sprawdzenie długości → zapis punktu → kolejne boki → zamknięcie i PNG. Przy długości kroku 75 cm odczyty 8, 6 i 8 kroków dają boki 6 m, 4,5 m i 6 m; zamknięcie 4,5 m jest wyliczone. Wynik: 21 m i 27 m².','Aim with the rear camera → capture direction → Start → increasing step count → stand still and Stop → check the length → save a point → next sides → close and export PNG. With a 75 cm step length, counts of 8, 6 and 8 give sides of 6 m, 4.5 m and 6 m; the 4.5 m closure is calculated. Result: 21 m and 27 m².'] }
];

const watchUrl = (lang, name) => `/${lang}/${lang === 'pl' ? 'filmy' : 'videos'}/${name}/`;

module.exports = function ({ esc, pick, sectionHead }) {
  function video(lang, name, { watch = false } = {}) {
    const film = films.find(item => item.name === name);
    if (!film) throw Error('Unknown WWW film: ' + name);
    const i = lang === 'pl' ? 0 : 1;
    const base = `/assets/stage2/${lang}/${film.name}`;
    const credits = fs.readFileSync(path.resolve(__dirname, `../media/www/video-v${film.id}/output/MUSIC-CREDITS.txt`), 'utf8').split(/\r?\n\r?\n/)[0].trim();
    const linkedCredits = esc(credits).replace('Creative Commons Attribution 4.0', 'Creative Commons Attribution 4.0 (CC BY 4.0)').replace(/https?:\/\/[^\s]+/g, raw => {
      const link = raw.replace(/\.$/, '');
      return `<a href="${link}">${link}</a>${raw.endsWith('.') ? '.' : ''}`;
    });
    return `<figure class="video-card"><video controls playsinline preload="${watch ? 'metadata' : 'none'}" width="1920" height="1080" poster="${base}-poster.webp" aria-label="${esc(film.title[i])}"><source src="${base}.mp4" type="video/mp4"><a href="${base}.mp4">${pick(lang,'Otwórz film MP4','Open the MP4 video')}</a></video><figcaption><strong>${esc(film.title[i])} · ${film.duration}</strong><p>${esc(film.disclosure[i])}</p>${watch ? '' : `<p><a href="${watchUrl(lang,name)}">${pick(lang,'Oglądaj na stronie filmu','Watch on the video page')} →</a></p>`}<details${watch ? ' open' : ''}><summary>${pick(lang,'Opis filmu i muzyka','Video description and music')}</summary><p>${esc(film.transcript[i])}</p><p>${linkedCredits}</p></details></figcaption></figure>`;
  }
  function filmSection(lang, page) {
    const film = films[page];
    if (!film || page > 3) throw Error('Film section is for pages 0–3');
    return `<section id="film">${sectionHead(pick(lang,`Zobacz film / ${film.duration}`,`Watch the video / ${film.duration}`),film.title[lang==='pl'?0:1])}${video(lang,film.name)}</section>`;
  }
  return { video, filmSection };
};
module.exports.films = films;
module.exports.watchUrl = watchUrl;
