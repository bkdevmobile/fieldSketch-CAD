const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'../../..'),sharp=require(path.join(root,'app/node_modules/sharp'));
const ffmpeg=process.env.V01_FFMPEG||'C:/ffmpeg/ffmpeg.exe',out=path.join(__dirname,'output'),work=path.join(__dirname,'rendered');
for(const dir of [out,work])fs.mkdirSync(dir,{recursive:true});
const durations=[8,12,10,10,12,8],play='https://play.google.com/store/apps/details?id=com.bk.dev.mobile.outlinego';
const musicSource='https://incompetech.com/music/royalty-free/index.html?Search=Search&isrc=USUAN1200077';
const credits='Music: "Easy Lemon (60 second)" by Kevin MacLeod (incompetech.com). Licensed under Creative Commons Attribution 4.0: https://creativecommons.org/licenses/by/4.0/. Source: '+musicSource+'. Changes: 60-second excerpt, quiet volume normalization, 2-second fade-in and 4-second fade-out, AAC encoding.';
const copy={
 pl:{tag:'OD SZKICU DO CAD',titles:[['Szkic na telefonie.','Dalsza praca w CAD.'],['Wpisz długość.','Zapisz bok.'],['Zachowaj szkic','jako obraz PNG.'],['Przenieś obrys','do pliku DXF.'],['Ten sam szkic. Kolejny etap pracy.'],['Twój kolejny szkic?','Zacznij w outlineGo.']],body:[['Taras 4 × 3 m. Obwód 14 m. Pole 12 m².','Od ręcznie wpisanych wymiarów do pliku.'],['Kierunek i długość wpisujesz ręcznie.','Sprawdź podgląd przed zapisaniem punktu.'],['PNG zapiszesz lub udostępnisz.','Wersja Free zachowuje znak wodny.'],['W podsumowaniu wybierz Eksportuj DXF.','Eksport DXF jest dostępny w Plus.'],['Otwórz wyeksportowany DXF w LibreCAD.','Sprawdź obrys, opisy i jednostkę rysunku.'],['Szkicuj, eksportuj i pracuj dalej.','Pobierz outlineGo z Google Play.']],steps:['Szkic','Zapis boku','Eksport PNG','Eksport DXF','Praca w CAD','Pobierz aplikację'],flow:['Szkic','PNG / DXF','CAD'],unit:'m',closure:'Bok zamykający jest wyliczony.'},
 en:{tag:'FROM SKETCH TO CAD',titles:[['Sketch on your phone.','Continue in CAD.'],['Enter the length.','Save the side.'],['Keep your sketch','as a PNG image.'],['Export the outline','as a DXF file.'],['The same sketch. Your next step.'],['Your next sketch?','Start with outlineGo.']],body:[['A 4 × 3 m patio. Perimeter 14 m. Area 12 m².','From manually entered lengths to a file.'],['Enter direction and length manually.','Review the side before saving the point.'],['Save or share your PNG.','The Free version keeps the watermark.'],['Choose Export DXF in the summary.','DXF export is available with Plus.'],['Open the exported DXF in LibreCAD.','Check the outline, labels and drawing unit.'],['Sketch, export and keep working.','Get outlineGo on Google Play.']],steps:['Sketch','Save a side','Export PNG','Export DXF','Continue in CAD','Get the app'],flow:['Sketch','PNG / DXF','CAD'],unit:'m',closure:'The closing side is calculated.'}
};
const sha=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
function run(args,log){const r=spawnSync(ffmpeg,['-hide_banner','-y',...args],{encoding:'utf8',windowsHide:true,maxBuffer:12e6});if(log)fs.writeFileSync(log,r.stderr||'');if(r.error||r.status!==0)throw Error(r.error||r.stderr);return r;}
function seconds(file){const r=spawnSync(ffmpeg,['-hide_banner','-i',file],{encoding:'utf8',windowsHide:true});const m=r.stderr.match(/Duration: (\d+):(\d+):([\d.]+)/);if(!m)throw Error('Cannot read '+file);return +m[1]*3600 + +m[2]*60 + +m[3];}
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;');
function txt(s,x,y,size=28,extra=''){return `<text x="${x}" y="${y}" font-family="${extra.includes('serif')?'Georgia':'Arial'}" font-size="${size}" ${extra.replace('serif','')}>${esc(s)}</text>`;}
function flow(c,i){return c.flow.map((s,j)=>`<rect x="${96+j*328}" y="600" width="288" height="120" rx="22" fill="${j===(i<=1?0:i===2||i===3?1:2)?'#dce8d8':'#e8eee4'}"/>${txt(s,120+j*328,672,34,'font-weight="700"')}${j<2?txt('→',396+j*328,672,28):''}`).join('');}
function bg(i,c){const cad=i===4;return `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080"><rect width="1920" height="1080" fill="#f6f5ef"/><g fill="#103d2e">${txt('outlineGo',96,88,42,'font-weight="700"')}${txt(c.tag,96,140,20,'letter-spacing="3" fill="#526959"')}${txt(c.steps[i].toUpperCase(),96,cad?192:240,22,'letter-spacing="2" fill="#1b684b"')}${c.titles[i].map((s,j)=>txt(s,96,(cad?260:330)+j*76,cad?52:62,'serif font-weight="700" letter-spacing="-1"')).join('')}${c.body[i].map((s,j)=>txt(s,96,(cad?307:490)+j*42,cad?27:29)).join('')}${cad?'':flow(c,i)}${i===0?txt(c.closure,96,810,25,'fill="#526959"'):''}${i===1?txt('4 m',96,835,88,'font-weight="700"'):''}${i===2?txt('PNG',96,835,72,'font-weight="700"'):''}${i===3?txt('DXF · Plus',96,835,72,'font-weight="700"'):''}${i===5?txt('outlineGo',96,835,66,'font-weight="700"'):''}</g>${cad?'':'<rect x="1244" y="32" width="588" height="1016" rx="34" fill="#173c2e"/>'}</svg>`;}
async function render(lang){const c=copy[lang],v02=path.resolve(__dirname,'../video-v02'),v04=path.resolve(__dirname,'../video-v04');
 const summary=path.join(v04,'sources',lang,'01-summary.png');
 const definitions=[
  {file:summary,still:true},
  {file:path.join(v02,'sources',lang,'02-first-side.mp4'),last:8,length:8},
  {file:path.join(v02,'sources',lang,'06-export.mp4'),length:6},
  {file:path.join(v04,'sources',lang,'01-export.mp4'),start:2,length:6},
  {file:path.join(v04,'sources',lang,'03-overview.mp4'),start:8,length:8},
  {file:summary,still:true}
 ];
 const segments=[],manifest=[];let offset=0;
 for(let i=0;i<6;i++){
  const d=definitions[i],duration=durations[i],background=path.join(work,`${lang}-${i}.png`);await sharp(Buffer.from(bg(i,c))).png().toFile(background);
  const start=d.last?Math.max(0,seconds(d.file)-d.last):d.start||0,hold=d.still?duration:duration-d.length;
  let filter=d.still?'fps=30':`trim=start=${start}:duration=${d.length},setpts=PTS-STARTPTS,fps=30,tpad=stop_mode=clone:stop_duration=${duration},trim=duration=${duration}`;
  if(i===4)filter+=',crop=1740:750:36:90,scale=1728:640:force_original_aspect_ratio=decrease:flags=lanczos,pad=1728:640:(ow-iw)/2:0:color=0xf6f5ef';
  else filter+=',scale=540:960:flags=lanczos';
  filter+=`,setsar=1[screen];[1:v][screen]overlay=${i===4?'96:395':'1268:60'}:shortest=1${i===3?'[base];[2:v]scale=540:960:flags=lanczos,setsar=1[share];[base][share]overlay=1268:60:enable=gte(t\\,4)':''},format=yuv420p[v]`;
  const segment=path.join(work,`${lang}-${i}.mp4`);
  const share=path.join(v04,'sources',lang,'02-share.png');
  run([...(d.still?['-loop','1','-framerate','30']:[]),'-i',d.file,'-loop','1','-framerate','30','-i',background,...(i===3?['-loop','1','-framerate','30','-i',share]:[]),'-filter_complex_threads','2','-filter_complex','[0:v]'+filter,'-map','[v]','-t',String(duration),'-an','-c:v','libx264','-preset','medium','-crf','19','-threads','4','-pix_fmt','yuv420p',segment],path.join(work,`${lang}-${i}.log`));
  segments.push(segment);manifest.push({source:path.relative(__dirname,d.file).replaceAll('\\','/'),sha256:sha(d.file),still:!!d.still,start,length:d.still?0:d.length,speed:1,hold,outputStart:offset,outputSeconds:duration,...(i===4?{privacy:'drawing-viewport-only',viewportCrop:{x:36,y:90,width:1740,height:750}}:{}),...(i===3?{endStill:{source:path.relative(__dirname,share).replaceAll('\\','/'),sha256:sha(share),from:4}}:{})});offset+=duration;console.log('Rendered '+lang+' '+i);
 }
 const list=path.join(work,lang+'-concat.txt');fs.writeFileSync(list,segments.map(p=>`file '${p.replaceAll('\\','/')}'`).join('\n'));
 const silent=path.join(out,`v01-overview-${lang}-silent.mp4`),film=path.join(out,`v01-overview-${lang}.mp4`);
 run(['-f','concat','-safe','0','-i',list,'-c','copy','-movflags','+faststart',silent]);
 run(['-i',silent,'-i',path.join(__dirname,'audio/Easy-Lemon-60-second.mp3'),'-map','0:v:0','-map','1:a:0','-c:v','copy','-af','atrim=0:60,asetpts=PTS-STARTPTS,loudnorm=I=-24:TP=-3:LRA=7,afade=t=in:st=0:d=2,afade=t=out:st=56:d=4','-t','60','-c:a','aac','-b:a','192k','-ar','48000','-ac','2','-metadata','title=outlineGo — '+c.tag,'-metadata','comment='+credits,'-movflags','+faststart',film],path.join(work,lang+'-music.log'));
 fs.writeFileSync(path.join(out,`edit-manifest-${lang}.json`),JSON.stringify({duration:60,width:1920,height:1080,fps:30,segments:manifest},null,2));
 run(['-ss','3','-i',film,'-frames:v','1',path.join(out,`poster-${lang}.png`)]);await sharp(path.join(out,`poster-${lang}.png`)).webp({quality:90}).toFile(path.join(out,`poster-${lang}.webp`));
 fs.copyFileSync(path.join(v02,'output',`first-sketch-${lang}-free.png`),path.join(out,`patio-${lang}-free.png`));
 fs.copyFileSync(path.join(v04,'output',`patio-${lang}.dxf`),path.join(out,`patio-${lang}.dxf`));
 fs.writeFileSync(path.join(out,`preview-${lang}.html`),`<!doctype html><html lang="${lang}"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>outlineGo — ${c.tag}</title><style>body{max-width:1200px;margin:40px auto;padding:0 24px;background:#f6f5ef;color:#103d2e;font:18px/1.6 system-ui}video{width:100%;border-radius:18px;background:#173c2e}a{color:inherit}li{margin:16px 0}</style><h1>outlineGo — ${c.tag}</h1><video controls preload="none" poster="poster-${lang}.webp"><source src="v01-overview-${lang}.mp4" type="video/mp4"></video><p><small>Music: <a href="${musicSource.replaceAll('&','&amp;')}">Easy Lemon (60 second) — Kevin MacLeod (incompetech.com)</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>. Excerpt, volume adjusted and faded. <a href="MUSIC-CREDITS.txt">Credits</a>.</small></p><ol>${c.steps.map((s,i)=>`<li><strong>${s}</strong><br>${c.body[i].join(' ')}</li>`).join('')}</ol><p><a href="v01-overview-${lang}.mp4">MP4</a> · <a href="patio-${lang}-free.png">PNG</a> · <a href="patio-${lang}.dxf">DXF</a> · <a href="${play}">Google Play</a></p></html>`);
 fs.writeFileSync(path.join(out,'MUSIC-CREDITS.txt'),credits+'\n\nInclude this attribution in the published video description.\n');
}
(async()=>{for(const lang of process.argv.slice(2).length?process.argv.slice(2):['pl','en'])await render(lang);})().catch(e=>{console.error(e);process.exitCode=1;});
