const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const sharp = require('../../../app/node_modules/sharp');
const root = __dirname;
const www = path.dirname(root);
const hash = b => crypto.createHash('sha256').update(b).digest('hex');
const xml = s => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;');
const write = (file, data) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, data); };
const labels = {
  pl: { direction: 'Zapisz kierunek', length: 'Wpisz długość', point: 'Zapisz punkt', garden: 'Ogród przy tarasie', demo: 'Przykład demonstracyjny · jednostka: m', perimeter: 'Obwód: 32 m', area: 'Pole: 55 m²', closure: 'Bok P6–P1 jest wyliczony', flow: 'Od szkicu do CAD', compare: 'Ten sam obrys w aplikacji i CAD', phone: 'outlineGo · eksport DXF w Plus', cad: 'DXF otwarty w LibreCAD 2.2.1.5', caption: 'Rzeczywiste zrzuty interfejsu · dane demonstracyjne', export: 'Eksport DXF · Plus' },
  en: { direction: 'Save direction', length: 'Enter length', point: 'Save point', garden: 'Garden by the patio', demo: 'Demonstration example · unit: m', perimeter: 'Perimeter: 32 m', area: 'Area: 55 m²', closure: 'Side P6–P1 is calculated', flow: 'From sketch to CAD', compare: 'The same outline in the app and CAD', phone: 'outlineGo · DXF export in Plus', cad: 'DXF opened in LibreCAD 2.2.1.5', caption: 'Actual interface screenshots · demonstration data', export: 'DXF export · Plus' }
};
function svg(w,h,title,body) { return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="title"><title id="title">${xml(title)}</title><style>text{font-family:Arial,sans-serif;fill:#19372c}.muted{fill:#56665e}.line{stroke:#1b684b;stroke-width:5;fill:none;stroke-linecap:round;stroke-linejoin:round}</style>${body}</svg>`; }
function steps(l, vertical) {
  const names = [l.direction,l.length,l.point];
  const cards = names.map((name,i) => {
    const x=vertical?24:24+i*336, y=vertical?24+i*240:24;
    const icon = i===0?'<path class="line" d="M142 126V72m-22 22 22-22 22 22"/>':i===1?'<path class="line" d="M92 92h100v40H92zM112 92v17m20-17v25m20-25v17m20-17v25"/>':'<circle cx="142" cy="104" r="34" fill="#1b684b"/><path d="m125 104 12 12 25-27" stroke="white" stroke-width="5" fill="none"/>';
    return `<g transform="translate(${x} ${y})"><rect width="288" height="208" rx="24" fill="#fffdf6" stroke="#d6ddd3"/><text x="24" y="37" font-size="18" font-weight="bold">0${i+1}</text>${icon}<text x="144" y="179" text-anchor="middle" font-size="23" font-weight="bold">${xml(name)}</text></g>` + (i<2?(vertical?`<path class="line" d="M168 ${y+218}v16m-7-7 7 7 7-7"/>`:`<path class="line" d="M${x+300} 128h22m-8-8 8 8-8 8"/>`):'');
  }).join('');
  return svg(vertical?336:1008,vertical?736:256,names.join(' → '),cards);
}
function garden(l) {
  const points=[[0,0],[8,0],[8,5],[5,5],[5,8],[0,8]];
  const p=points.map(([x,y])=>[190+x*60,660-y*60]);
  const poly=p.map(v=>v.join(',')).join(' ');
  let b=`<rect width="960" height="880" rx="24" fill="#f5f4ee"/><text x="56" y="62" font-size="32" font-weight="bold">${l.garden}</text><text x="56" y="102" font-size="20" class="muted">${l.demo}</text><polygon points="${poly}" fill="#e7ecdf"/><path d="M${p.slice(0,6).map(v=>v.join(' ')).join('L')}" class="line"/><path d="M190 180V660" class="line" stroke-dasharray="10 9"/>`;
  const offsets=[[-28,34],[22,34],[26,3],[25,-19],[22,-20],[-36,-20]];
  p.forEach(([x,y],i)=>b+=`<circle cx="${x}" cy="${y}" r="8" fill="#1b684b" stroke="white" stroke-width="3"/><text x="${x+offsets[i][0]}" y="${y+offsets[i][1]}" font-size="23" font-weight="bold">P${i+1}</text>`);
  [[430,706,'8 m'],[716,520,'5 m'],[580,399,'3 m'],[522,280,'3 m'],[340,157,'5 m'],[83,430,'8 m*']].forEach(([x,y,t])=>b+=`<text x="${x}" y="${y}" font-size="24" text-anchor="middle">${t}</text>`);
  b+=`<text x="56" y="781" font-size="25" font-weight="bold">${l.perimeter}</text><text x="500" y="781" font-size="25" font-weight="bold">${l.area}</text><text x="56" y="831" font-size="20" class="muted">* ${l.closure}</text>`;
  return svg(960,880,`${l.garden}. P1 (0,0), P2 (8,0), P3 (8,5), P4 (5,5), P5 (5,8), P6 (0,8). ${l.perimeter}. ${l.area}. ${l.closure}.`,b);
}
async function main(){
  const report={date:'2026-10-29',scope:'Stage 1 static media; no video, deployment or Plus entitlement changes',files:[],sources:[]};
  const assets=[];
  async function record(file,source,alt,kind){
    const bytes=fs.readFileSync(file), m=await sharp(bytes).metadata();
    report.files.push({file:path.relative(root,file).replaceAll('\\','/'),width:m.width,height:m.height,bytes:bytes.length,sha256:hash(bytes),source,alt,kind});
  }
  async function variants(input,stem,widths,alt,kind){
    const source=path.relative(root,input).replaceAll('\\','/');
    report.sources.push({file:source,sha256:hash(fs.readFileSync(input))});
    for(const width of widths){
      const file=path.join(root,'web',`${stem}-${width}.webp`);
      fs.mkdirSync(path.dirname(file),{recursive:true});
      // Compress the camera scene and sharing illustrations for the web;
      // original PNGs and other interface screenshots remain unchanged.
      const optimized=kind==='edited-share-mockup'||stem.endsWith('/02-direction');
      await sharp(input).resize({width,withoutEnlargement:true}).webp({lossless:!optimized&&(kind==='screenshot'||kind==='edited-share-mockup'),quality:optimized?90:88,effort:5}).toFile(file);
      await record(file,source,alt,kind);
      assets.push({file:path.relative(root,file).replaceAll('\\','/'),alt,kind});
    }
  }
  const screenNames={ '01-new-sketch':'New sketch / Nowy szkic','02-direction':'Save direction / Zapis kierunku','03-angle':'Direction ready / Zapisany kierunek','04-length':'Enter side length / Wpisywanie długości','05-review':'Review side / Sprawdzenie boku','06-summary':'Garden summary / Podsumowanie ogrodu','07-sketch':'Garden outline / Obrys ogrodu','08-dimensions':'Dimensions and points / Wymiary i punkty','09-png-preview':'PNG preview, Free watermark / Podgląd PNG ze znakiem wodnym Free','10-plus-dxf-export':'DXF export in Plus / Eksport DXF w Plus','11-plus-dxf-share':'Android DXF share sheet / Udostępnianie DXF w Androidzie','12-plus-dxf-ready':'DXF prepared / Przygotowany DXF','13-plus-png-preview':'PNG preview in Plus / Podgląd PNG w Plus' };
  for(const lang of ['pl','en']){
    const l=labels[lang];
    for(const [name,alt] of Object.entries(screenNames))await variants(path.join(www,'app-screenshots',lang,name+'.png'),`${lang}/app/${name}`,[480,960],alt.split(' / ')[lang==='pl'?1:0],'screenshot');
    await variants(path.join(www,'share-mockups',`11-plus-dxf-share-${lang}-v2.png`),`${lang}/illustrations/11-plus-dxf-share-v2`,[480,960],lang==='pl'?'Ilustracja panelu udostępniania DXF z ikonami e-maila, wiadomości i zapisu pliku':'Illustration of DXF sharing with email, messages and save-file icons','edited-share-mockup');
    for(const [name,alt] of [['14-edit-length',lang==='pl'?'Niezapisana korekta boku P1–P2 z 8 do 8,2 m':'Unsaved correction of side P1–P2 from 8 to 8.2 m'],['15-edit-note',lang==='pl'?'Pole edycji notatki do szkicu ogrodu':'Editable garden sketch note']]){
      const input=path.join(root,'screenshots',lang,name+'.png');
      const m=await sharp(input).metadata();if(m.width!==1080||m.height!==1920)throw Error('Unexpected screenshot dimensions');
      await record(input,'Android emulator-5556; original adb screencap',alt,'original-screenshot');
      await variants(input,`${lang}/app/${name}`,[480,960],alt,'screenshot');
    }
    for(const name of ['01-import-overview','02-dimension-detail','03-units-and-layers'])await variants(path.join(www,'librecad-screenshots',lang,name+'.jpg'),`${lang}/cad/${name}`,[960,1440],`${lang==='pl'?'Rzeczywisty import DXF w LibreCAD':'Actual DXF import in LibreCAD'}: ${name}`,'screenshot');
    const diagrams=[['direction-length-point',steps(l,false)],['direction-length-point-mobile',steps(l,true)],['garden-points',garden(l)]];
    for(const [name,data] of diagrams){
      const file=path.join(root,'svg',lang,name+'.svg');write(file,data);await record(file,'Authored SVG; garden coordinates match verified DXF',lang==='pl'?'Schemat: '+name:'Diagram: '+name,'svg');
      const preview=path.join(root,'previews',lang,name+'.png');fs.mkdirSync(path.dirname(preview),{recursive:true});await sharp(Buffer.from(data)).png().toFile(preview);
    }
    const sourceDxf=path.join(www,'app-screenshots/exports',`garden-${lang}.dxf`), dxf=fs.readFileSync(sourceDxf);
    write(path.join(root,'downloads',`garden-${lang}.dxf`),dxf);
    const png=path.join(root,'downloads',`garden-${lang}-free.png`);
    await record(png,'Real app Free export; existing watermark preserved',lang==='pl'?'Ogród: oryginalny eksport PNG Free':'Garden: original Free PNG export','download');
    report.files.push({file:`downloads/garden-${lang}.dxf`,bytes:dxf.length,sha256:hash(dxf),source:`../app-screenshots/exports/garden-${lang}.dxf`,kind:'download',unit:'m'});
    for(const type of ['workflow','same-outline']){
      const frame=svg(1600,1000,l[type==='workflow'?'flow':'compare'],`<rect width="1600" height="1000" rx="32" fill="#f5f4ee"/><text x="56" y="76" font-size="42" font-weight="bold">${l[type==='workflow'?'flow':'compare']}</text><text x="56" y="121" font-size="22" class="muted">${l.caption}</text><rect x="40" y="150" width="416" height="764" rx="24" fill="white" stroke="#d6ddd3"/><rect x="510" y="230" width="1050" height="600" rx="24" fill="white" stroke="#d6ddd3"/><text x="540" y="202" font-size="24" font-weight="bold">${l.cad}</text><text x="56" y="952" font-size="23">${l.phone}</text>${type==='workflow'?`<text x="830" y="888" font-size="28" font-weight="bold">${l.export}</text><path d="M470 530h28m-10-10 10 10-10 10" class="line"/>`:''}`);
      const phone=await sharp(path.join(www,'app-screenshots',lang,'07-sketch.png')).resize({height:740}).toBuffer();
      const cad=await sharp(path.join(www,'librecad-screenshots',lang,'01-import-overview.jpg')).resize({width:1020}).toBuffer();
      const master=path.join(root,'graphics',lang,type+'.png');fs.mkdirSync(path.dirname(master),{recursive:true});
      await sharp(Buffer.from(frame)).composite([{input:phone,left:40,top:162},{input:cad,left:525,top:256}]).png().toFile(master);
      await record(master,'Composition of unchanged real app and LibreCAD screenshots',l[type==='workflow'?'flow':'compare'],'composite');
      await variants(master,`${lang}/${type}`,[720,1440],l[type==='workflow'?'flow':'compare'],'composite');
    }
    const shots=[];
    for(const [i,name] of ['14-edit-length','15-edit-note'].entries())shots.push({input:await sharp(path.join(root,'screenshots',lang,name+'.png')).resize(270,480).png().toBuffer(),left:i*278+4,top:4});
    await sharp({create:{width:556,height:488,channels:3,background:'#d8ddd8'}}).composite(shots).png().toFile(path.join(root,`contact-sheet-${lang}.png`));
  }
  await variants(path.resolve(www,'../../public/assets/garden-measurement-1280.webp'),'shared/garden-context',[480,960,1280],'Illustrative garden scene / Ilustracyjna scena ogrodu','illustration');
  await variants(path.resolve(www,'../../public/assets/workflow-field-960.webp'),'shared/field-context',[480,960],'Illustrative use of a phone outdoors / Ilustracja pracy z telefonem w terenie','illustration');
  write(path.join(root,'manifest.json'),JSON.stringify(report,null,2)+'\n');
  const imgs=assets.map(a=>`<figure><a href="${a.file}"><img loading="lazy" src="${a.file}" alt="${xml(a.alt)}"/></a><figcaption>${a.file}</figcaption></figure>`).join('');
  const links=['pl','en'].map(lang=>`<p>${lang.toUpperCase()}: <a href="contact-sheet-${lang}.png">Nowe zrzuty</a> · <a href="svg/${lang}/direction-length-point.svg">Kroki SVG</a> · <a href="svg/${lang}/direction-length-point-mobile.svg">Kroki na telefon</a> · <a href="svg/${lang}/garden-points.svg">Punkty ogrodu SVG</a> · <a href="downloads/garden-${lang}-free.png">Oryginalny PNG Free</a> · <a href="downloads/garden-${lang}.dxf">DXF Plus</a></p>`).join('');
  write(path.join(root,'gallery.html'),`<!doctype html><html lang="pl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Media WWW — etap 1</title><style>body{font:16px Arial;background:#f5f4ee;color:#19372c;margin:32px}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px}figure{margin:0;padding:16px;background:white;border:1px solid #d6ddd3;border-radius:16px}img{width:100%;height:330px;object-fit:contain}figcaption{overflow-wrap:anywhere;margin-top:12px}a{color:inherit}</style><h1>Media WWW — etap 1</h1><p>Podgląd lokalny. Pochodzenie i ograniczenia: <a href="README.md">README.md</a>.</p>${links}<main>${imgs}</main></html>`);
  console.log(`Prepared ${report.files.length} media files; source hashes and dimensions in manifest.json.`);
}
main().catch(e=>{console.error(e);process.exitCode=1;});
