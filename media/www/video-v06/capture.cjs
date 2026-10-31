const fs=require('node:fs'),path=require('node:path');
const c=require('./control.cjs');
const labels={
 pl:{new:'Nowy szkic',name:'Nazwa szkicu',create:'Utwórz szkic',p1:'Stoję w narożniku · zapisz P1',capture:'Zapisz kierunek do narożnika',next:'Kierunek gotowy · podaj długość',start:'Uruchom krokomierz',stop:'Zatrzymaj krokomierz',review:'Sprawdź bok',save:'Zapisz punkt',finish:'Zakończ',close:'Zamknij obrys',png:'Eksportuj PNG',share:'Udostępnij PNG'},
 en:{new:'New sketch',name:'Sketch name',create:'Create sketch',p1:'At the corner · save P1',capture:'Save direction to corner',next:'Direction ready · enter length',start:'Start step counter',stop:'Stop step counter',review:'Review side',save:'Save point',finish:'Finish',close:'Close outline',png:'Export PNG',share:'Share PNG'}
};
async function run(lang){const l=labels[lang],dir=path.join(__dirname,'sources',lang);fs.mkdirSync(dir,{recursive:true});
 c.sh('pm','grant',c.pkg,'android.permission.CAMERA');c.sh('pm','grant',c.pkg,'android.permission.ACTIVITY_RECOGNITION');
 await c.setup(lang);c.sh('settings','put','system','show_touches','1');c.sh('settings','put','global','sysui_demo_allowed','1');c.sh('am','broadcast','-a','com.android.systemui.demo','-e','command','clock','-e','hhmm','0941');
 const marks=[];let current='',started=0;
 const mark=(label)=>{marks.push({clip:current,label,t:(Date.now()-started)/1000});console.log(lang,label);};
 const tap=label=>{c.tap(label);mark(label);};
 async function clip(name,fn){current=name;await c.record(lang,name);started=Date.now()-1200;mark('start');try{await fn();await c.wait(1800);}finally{mark('end');await c.stop();fs.writeFileSync(path.join(dir,'marks.json'),JSON.stringify(marks,null,2));}}
 function shot(name){c.shot('sources/'+lang+'/'+name+'.png');}
 tap(l.new);c.input(l.name,lang==='pl'?'Teren':'Garden');tap(l.create);await c.wait(2500);tap(l.p1);await c.wait(3000);
 await clip('01-camera',async()=>{shot('01-camera');await c.wait(7000);});
 await clip('02-direction',async()=>{await c.wait(1800);tap(l.capture);await c.wait(1500);shot('02-direction');tap(l.next);await c.wait(1800);});
 await clip('03-steps',async()=>{await c.wait(800);tap(l.start);shot('03-steps-start');await c.wait(2000);shot('03-steps-progress-1');await c.wait(2000);shot('03-steps-progress-2');await c.wait(2800);shot('03-steps-running');tap(l.stop);await c.wait(1000);shot('03-steps-stopped');});
 await clip('04-save',async()=>{tap(l.review);await c.wait(1500);shot('04-review');tap(l.save);await c.wait(1600);});
 await clip('05-camera-next',async()=>{await c.wait(3000);shot('05-camera');tap(l.capture);await c.wait(1500);shot('05-direction');tap(l.next);await c.wait(1600);});
 await clip('06-steps-next',async()=>{tap(l.start);await c.wait(6000);shot('06-steps-running');tap(l.stop);await c.wait(800);tap(l.review);await c.wait(1200);shot('06-review');tap(l.save);await c.wait(1500);});
 await clip('07-third-side',async()=>{await c.wait(2800);tap(l.capture);await c.wait(1000);tap(l.next);await c.wait(1000);tap(l.start);await c.wait(7600);tap(l.stop);tap(l.review);await c.wait(1000);shot('07-review');tap(l.save);await c.wait(1500);});
 await clip('08-result',async()=>{tap(l.finish);tap(l.close);await c.wait(2800);shot('08-summary');await c.wait(2500);tap(l.png);await c.wait(2500);shot('08-preview');await c.wait(2500);});
 tap(l.share);await c.wait(2000);shot('09-share');c.sh('input','keyevent','KEYCODE_BACK');
 c.sh('am','force-stop',c.pkg);c.cmd('pull','/data/user/0/'+c.pkg+'/files/SQLite',path.join(dir,'after'));
 const {DatabaseSync}=require('node:sqlite'),db=new DatabaseSync(path.join(dir,'after/fieldsketch.db'),{readOnly:true});const rows=db.prepare('SELECT body FROM projects').all();db.close();if(rows.length!==1)throw Error('Unexpected projects');const p=JSON.parse(rows[0].body);fs.writeFileSync(path.join(dir,'project.json'),JSON.stringify(p,null,2));
 const png=`outlinego-${p.id}-r${p.geometryRevision}-free.png`;c.cmd('pull','/data/user/0/'+c.pkg+'/cache/'+png,path.join(dir,png));
 console.log('DONE '+lang+' '+p.id);
}
run(process.argv[2]||'pl').catch(async e=>{console.error(e);try{if(fs.existsSync(path.join(__dirname,'recording.json')))await c.stop();c.shot('sources/'+(process.argv[2]||'pl')+'/error.png');}catch{}process.exitCode=1;});
