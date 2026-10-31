const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'../../..'),sharp=require(path.join(root,'app/node_modules/sharp'));
const ffmpeg=process.env.V02_FFMPEG||'C:/ffmpeg/ffmpeg.exe';
const out=path.join(__dirname,'output'),work=path.join(__dirname,'rendered');fs.mkdirSync(work,{recursive:true});
const clips=['01-create','02-first-side','03-next-sides','04-correction','05-close','06-export'];
const durations=[22,40,80,30,28,24];
const holdSeconds=6;
// User preference: production details belong in documentation, never in the video image.
const copy={
pl:{tag:'PIERWSZY SZKIC',steps:['Nowy szkic','Pierwszy bok','Kolejne boki','Korekta','Zamknięcie','Eksport PNG'],titles:[['Zacznij od','własnego szkicu.'],['Kierunek. Długość.','Zapis punktu.'],['Dodaj kolejne','dwa boki.'],['Popraw wymiar.','Zapisz zmianę.'],['Zamknij obrys.','Sprawdź wynik.'],['Twój szkic','w pliku PNG.']],body:[['Tworzymy „Taras” w trybie ręcznym.','Przykład: prostokąt o wymiarach 4 × 3 m.'],['Zapisz P1 i ustaw pierwszy kierunek 0°.','Wpisz 4 m, sprawdź bok i zapisz P2.'],['Wpisuj skręt 90° w lewo.','Dodaj 3 m i 3,8 m, zapisując każdy punkt.'],['W podsumowaniu wybierz poprawę boku.','Zmień 3,8 m na 4 m i zapisz poprawki.'],['Kontynuuj pomiar → Zakończ → Zamknij obrys.','Bok do P1 jest wyliczony, a nie zmierzony.'],['Wybierz Eksportuj PNG → Udostępnij PNG.','Free zachowuje znak wodny outlineGo.']],note:['Kierunki i długości wpisujemy ręcznie.','Każdy bok przechodzi te same trzy etapy.','Po trzecim boku wybierz Zostaw otwarty.','Korekta zmienia zapisany wynik szkicu.','Obwód 14 m · pole 12 m².','Plik został utworzony; nie wysyłamy go odbiorcy.'],closure:'bok wyliczony',diagram:'Przykład obrysu',length:'4 m',result:'14 m / 12 m²'},
en:{tag:'YOUR FIRST SKETCH',steps:['New sketch','First side','Next sides','Correction','Close outline','Export PNG'],titles:[['Start with','your own sketch.'],['Direction. Length.','Save the point.'],['Add the next','two sides.'],['Correct a length.','Save the change.'],['Close the outline.','Check the result.'],['Your sketch,','saved as PNG.']],body:[['Create “Patio” in manual mode.','Example: a rectangle measuring 4 × 3 m.'],['Save P1 and set the first direction to 0°.','Enter 4 m, review the side and save P2.'],['Enter a 90° turn to the left.','Add 3 m and 3.8 m, saving each point.'],['Choose Edit last side in the summary.','Change 3.8 m to 4 m and save changes.'],['Continue → Finish → Close outline.','The side to P1 is calculated, not measured.'],['Choose Export PNG → Share PNG.','Free keeps the outlineGo watermark.']],note:['Directions and lengths are entered manually.','Follow the same three steps for each side.','After the third side, choose Leave open.','The correction updates the saved sketch.','Perimeter 14 m · area 12 m².','The file is created; no recipient is selected.'],closure:'calculated side',diagram:'Example outline',length:'4 m',result:'14 m / 12 m²'}
};
function run(args,log){const r=spawnSync(ffmpeg,['-hide_banner','-y',...args],{windowsHide:true,encoding:'utf8',maxBuffer:8e6});if(log)fs.writeFileSync(log,r.stderr||'');if(r.error||r.status!==0)throw Error(r.error||r.stderr);return r;}
function duration(file){const r=spawnSync(ffmpeg,['-hide_banner','-i',file],{encoding:'utf8',windowsHide:true});const m=r.stderr.match(/Duration: (\d+):(\d+):([\d.]+)/);if(!m)throw Error('Cannot read duration '+file);return +m[1]*3600 + +m[2]*60 + +m[3];}
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;');
function text(s,x,y,size=30,extra=''){return `<text x="${x}" y="${y}" ${extra.includes('font-family=')?'':'font-family="Arial"'} font-size="${size}" ${extra}>${esc(s)}</text>`;}
function diagram(i,c){
 const pts=[[160,840],[520,840],[520,600],[160,600]],count=i<2?1:3;
 let s=`<rect x="96" y="516" width="1010" height="406" rx="24" fill="#e8eee4"/>${text(c.diagram,130,560,22,'fill="#526959"')}`;
 for(let j=0;j<count;j++){let a=pts[j],b=pts[j+1];if(j===2&&i===2)b=[178,600];s+=`<path d="M${a} L${b}" stroke="#1b684b" stroke-width="5" fill="none"/>`;}
 if(i>=4)s+='<path d="M160 600 L160 840" stroke="#6a8776" stroke-width="4" stroke-dasharray="10 9"/>';
 const visible=i<2?2:4;
 for(let j=0;j<visible;j++){const [x,y]=pts[j];s+=`<circle cx="${x}" cy="${y}" r="8" fill="#1b684b"/>${text('P'+(j+1),x-12,y+(y>700?34:-20),22,'fill="#103d2e"')}`;}
 s+=text('4 m',320,888,25,'fill="#103d2e"');
 if(i>=2)s+=text('3 m',550,730,25,'fill="#103d2e"')+text(i===2?(c===copy.pl?'3,8 m':'3.8 m'):'4 m',320,625,25,'fill="#103d2e"');
 if(i>=4)s+=text(c.closure,650,705,25,'fill="#526959"')+text(c.result,650,770,43,'fill="#103d2e" font-weight="700"');
 else s+=text(i===3?(c===copy.pl?'3,8 → 4 m':'3.8 → 4 m'):'0° → 90°',670,765,43,'fill="#103d2e" font-weight="700"');
 return s;
}
function background(i,c,speed){return `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080"><rect width="1920" height="1080" fill="#f6f5ef"/><rect x="1244" y="32" width="588" height="1016" rx="34" fill="#173c2e"/><g fill="#103d2e">${text('outlineGo',96,92,40,'font-weight="700" letter-spacing="-1"')}${text(c.tag,96,145,20,'fill="#526959" letter-spacing="3"')}${text(String(i+1).padStart(2,'0')+' / 06',96,221,22,'fill="#1b684b" font-weight="700"')}${text(c.titles[i][0],96,303,65,'font-family="Georgia" font-weight="700" letter-spacing="-2"')}${text(c.titles[i][1],96,378,65,'font-family="Georgia" font-weight="700" letter-spacing="-2"')}<rect x="98" y="405" width="92" height="6" rx="3" fill="#e6b83b"/>${text(c.body[i][0],96,455,29)}${text(c.body[i][1],96,494,29)}${diagram(i,c)}${text(c.note[i],96,967,25,'fill="#345b47"')}${durations.map((_,j)=>`<rect x="${96+j*169}" y="181" width="153" height="4" rx="2" fill="${j<=i?'#1b684b':'#d8dfd3'}"/>`).join('')}</g></svg>`;}
copy.pl.note[5]='PNG gotowy do zapisania lub udostępnienia.';
copy.en.note[5]='Your PNG is ready to save or share.';
async function render(lang){const c=copy[lang],sources=path.join(__dirname,'sources',lang);const segments=[];let offset=0;const manifest=[];
 for(let i=0;i<clips.length;i++){
  const src=path.join(sources,clips[i]+'.mp4');const raw=duration(src),target=durations[i],speed=raw/(target-holdSeconds);
  const bg=path.join(work,lang+'-'+i+'.png');await sharp(Buffer.from(background(i,c,speed))).png().toFile(bg);
  const segment=path.join(work,lang+'-'+i+'.mp4');
  run(['-i',src,'-loop','1','-framerate','30','-i',bg,'-filter_complex_threads','2','-filter_complex',`[0:v]setpts=(PTS-STARTPTS)/${speed},scale=540:960:flags=lanczos,fps=30,tpad=stop_mode=clone:stop_duration=${holdSeconds},setsar=1[phone];[1:v][phone]overlay=1268:60:shortest=1,format=yuv420p[v]`,'-map','[v]','-t',String(target),'-an','-c:v','libx264','-preset','medium','-crf','19','-threads','4','-pix_fmt','yuv420p',segment],path.join(work,lang+'-'+i+'.log'));
  segments.push(segment);manifest.push({source:path.relative(__dirname,src).replaceAll('\\','/'),sourceSeconds:raw,outputStart:offset,outputSeconds:target,speed,holdSeconds});
  offset+=target;
  console.log('Rendered '+lang+' '+clips[i]);
 }
 const list=path.join(work,lang+'-concat.txt');fs.writeFileSync(list,segments.map(p=>`file '${p.replaceAll('\\','/')}'`).join('\n'));
 const dest=path.join(out,'v02-first-sketch-'+lang+'.mp4');
 run(['-f','concat','-safe','0','-i',list,'-c','copy','-movflags','+faststart','-metadata','title='+ (lang==='pl'?'outlineGo — pierwszy szkic':'outlineGo — your first sketch'),'-metadata','comment=Real Android emulator recording; slower playback with six-second holds; manual mode; Free.',dest],path.join(work,lang+'-concat.log'));
 fs.writeFileSync(path.join(out,'edit-manifest-'+lang+'.json'),JSON.stringify({duration:offset,width:1920,height:1080,fps:30,audio:false,segments:manifest},null,2));
 run(['-ss','197','-i',dest,'-frames:v','1',path.join(out,'poster-'+lang+'.png')]);
 await sharp(path.join(out,'poster-'+lang+'.png')).webp({quality:90}).toFile(path.join(out,'poster-'+lang+'.webp'));
 const html=`<!doctype html><html lang="${lang}"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>outlineGo · V02</title><style>body{margin:40px auto;padding:0 24px;max-width:1200px;background:#f6f5ef;color:#103d2e;font:18px/1.6 system-ui}video{width:100%;border-radius:18px;background:#173c2e}h1{line-height:1.2}li{margin:16px 0}a{color:inherit}</style><h1>outlineGo — ${lang==='pl'?'pierwszy szkic':'your first sketch'}</h1><video controls preload="none" poster="poster-${lang}.webp"><source src="v02-first-sketch-${lang}.mp4" type="video/mp4"></video><ol>${c.steps.map((step,i)=>`<li><strong>${step}</strong><br>${c.body[i].join(' ')} ${c.note[i]}</li>`).join('')}</ol><p><a href="first-sketch-${lang}-free.png">PNG</a> · <a href="v02-first-sketch-${lang}.mp4">MP4</a> ·</p></html>`;
 fs.writeFileSync(path.join(out,'preview-'+lang+'.html'),html);
}
(async()=>{for(const lang of process.argv.slice(2).length?process.argv.slice(2):['pl','en'])await render(lang);})().catch(e=>{console.error(e);process.exitCode=1;});
