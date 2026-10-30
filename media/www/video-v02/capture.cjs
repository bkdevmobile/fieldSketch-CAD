const fs=require('node:fs'),path=require('node:path');
const c=require('./control.cjs');
const translations={pl:{new:'Nowy szkic',name:'Nazwa szkicu',create:'Utwórz szkic',p1:'Stoję w narożniku · zapisz P1',direction:'Ustaw kierunek',next:'Kierunek gotowy · podaj długość',length:'Długość boku (m)',review:'Sprawdź bok',save:'Zapisz punkt',turn:'Kąt skrętu od poprzedniego boku (°)',finish:'Zakończ',open:'Zostaw otwarty',edit:'Popraw ostatni bok',changes:'Zapisz poprawki',continue:'Kontynuuj pomiar',close:'Zamknij obrys',png:'Eksportuj PNG',share:'Udostępnij PNG'},en:{new:'New sketch',name:'Sketch name',create:'Create sketch',p1:'At the corner · save P1',direction:'Set direction',next:'Direction ready · enter length',length:'Side length (m)',review:'Review side',save:'Save point',turn:'Turn from previous side (°)',finish:'Finish',open:'Leave open',edit:'Edit last side',changes:'Save changes',continue:'Continue measurement',close:'Close outline',png:'Export PNG',share:'Share PNG'}};
async function run(lang){
 const l=translations[lang];await c.setup(lang);
 // Demo-only system clock and touch indicators. No production app code changes.
 c.sh('settings','put','global','sysui_demo_allowed','1');c.sh('am','broadcast','-a','com.android.systemui.demo','-e','command','clock','-e','hhmm','0941');
 const marks=[];let clipStart;
 const mark=label=>{marks.push({label,clip:current,t:(Date.now()-clipStart)/1000});console.log(lang,label);};let current;
 async function clip(name,fn){current=name;await c.record(lang,name);clipStart=Date.now()-1200;mark('start');try{await fn();await c.wait(1800);mark('end');}finally{await c.stop();fs.writeFileSync(path.join(__dirname,'sources',lang,'marks.json'),JSON.stringify(marks,null,2));}}
 function tap(label){c.tap(label);mark(label);}
 function input(label,value){c.input(label,value);mark(label+'='+value);}
 await clip('01-create',async()=>{await c.wait(1000);tap(l.new);input(l.name,lang==='pl'?'Taras':'Patio');tap(l.create);c.sh('uiautomator','dump','/sdcard/v02-ready.xml');c.shot('sources/'+lang+'/01-start.png');});
 await clip('02-first-side',async()=>{tap(l.p1);tap(l.direction);tap(l.next);input(l.length,'4');tap(l.review);c.shot('sources/'+lang+'/02-review.png');tap(l.save);});
 await clip('03-next-sides',async()=>{
  for(const length of ['3','3.8']){input(l.turn,'90');tap(l.direction);tap(l.next);input(l.length,length);tap(l.review);tap(l.save);}
  tap(l.finish);tap(l.open);c.shot('sources/'+lang+'/03-open.png');
 });
 await clip('04-correction',async()=>{
  // Scroll only to reveal the actual Edit last side button, then locate it again.
  c.sh('input','swipe','530','1400','530','650','450');
  tap(l.edit);input(l.length,'4');c.shot('sources/'+lang+'/04-correction.png');tap(l.changes);
 });
 await clip('05-close',async()=>{tap(l.continue);tap(l.finish);tap(l.close);c.shot('sources/'+lang+'/05-summary.png');});
 await clip('06-export',async()=>{tap(l.png);c.shot('sources/'+lang+'/06-preview.png');tap(l.share);c.shot('sources/'+lang+'/07-share.png');});
 // Preserve the original generated PNG and geometry for reproducibility.
 const files=c.sh('ls','/data/user/0/'+c.pkg+'/cache').split(/\s+/).filter(f=>/^outlinego-.*-free\.png$/.test(f));
 for(const f of files)c.cmd('pull','/data/user/0/'+c.pkg+'/cache/'+f,path.join(__dirname,'sources',lang,f));
 c.sh('input','keyevent','KEYCODE_BACK');
 c.sh('am','force-stop',c.pkg);c.cmd('pull','/data/user/0/'+c.pkg+'/files/SQLite',path.join(__dirname,'sources',lang,'after'));
 console.log('DONE '+lang);
}
run(process.argv[2]||'pl').catch(async e=>{console.error(e);try{c.shot('sources/'+(process.argv[2]||'pl')+'/error.png');}catch{}process.exitCode=1;});
