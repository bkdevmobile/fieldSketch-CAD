const fs = require('node:fs');
const path = require('node:path');
const {spawnSync,spawn} = require('node:child_process');
const root=path.resolve(__dirname,'../../..');
const adb=path.join(process.env.LOCALAPPDATA,'Android/Sdk/platform-tools/adb.exe');
const serial='emulator-5556', pkg='com.bk.dev.mobile.outlinego';
const wait=ms=>new Promise(r=>setTimeout(r,ms));
function cmd(...args){ const r=spawnSync(adb,['-s',serial,...args],{encoding:'utf8',windowsHide:true});if(r.status!==0)throw Error(r.stderr||r.stdout);return r.stdout.trim(); }
function sh(...args){return cmd('shell',...args);}
const decode=s=>s.replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
function ui(){sh('uiautomator','dump','/sdcard/v05-ui.xml');const xml=sh('cat','/sdcard/v05-ui.xml');fs.writeFileSync(path.join(__dirname,'last-ui.xml'),xml);return [...xml.matchAll(/<node\s+([^>]+)>?/g)].map(m=>Object.fromEntries([...m[1].matchAll(/([\w-]+)="([^"]*)"/g)].map(a=>[a[1],decode(a[2])])));}
function summary(){return ui().filter(n=>n.text||n['content-desc']).map(n=>({text:n.text,desc:n['content-desc'],bounds:n.bounds,enabled:n.enabled,focused:n.focused,class:n.class}));}
function find(label,last=false){const nodes=ui().filter(n=>(n.text===label||n['content-desc']===label)&&n.enabled==='true');if(!nodes.length)throw Error('Missing UI: '+label);return last?nodes.at(-1):nodes[0];}
function clickNode(n){const b=n.bounds.match(/\d+/g).map(Number);sh('input','tap',String(Math.round((b[0]+b[2])/2)),String(Math.round((b[1]+b[3])/2)));}
function tap(label,last=false){clickNode(find(label,last));}
function input(label,value){tap(label,true);let node=ui().find(n=>n.focused==='true'&&n.class==='android.widget.EditText');if(!node)throw Error('Input focus not verified');sh('input','keyevent','KEYCODE_MOVE_END');for(let i=0;i<(node.text||'').length;i++)sh('input','keyevent','KEYCODE_DEL');sh('input','text',value);sh('input','keyevent','KEYCODE_BACK');}
function shot(file){sh('screencap','-p','/sdcard/v05-screen.png');cmd('pull','/sdcard/v05-screen.png',path.resolve(__dirname,file));}
function route(route=''){sh('am','start','-W','-a','android.intent.action.VIEW','-d',route?'fieldsketch://'+route:'fieldsketch:///',pkg);}
async function setup(lang){
  const init=require(path.join(root,'app/node_modules/sql.js'));const SQL=await init();
  const db=new SQL.Database(fs.readFileSync(path.join(root,'media/www/video-v02/sources',lang,'initial.db')));
  for(const table of ['projects','observations','operations','survey_drafts'])db.run('DELETE FROM '+table);
  const settings=JSON.parse(db.exec('SELECT body FROM user_settings')[0].values[0][0]);
  Object.assign(settings,{directionMode:'manual',angleSnap:90,language:lang,lengthInput:'manual'});
  db.run('UPDATE user_settings SET body=?',[JSON.stringify(settings)]);
  const local=path.join(__dirname,'sources',lang,'initial.db');fs.writeFileSync(local,Buffer.from(db.export()));
  sh('am','force-stop',pkg);
  const dir='/data/user/0/'+pkg+'/files/SQLite';const uid=sh('stat','-c','%u',dir);
  cmd('pull',dir,path.join(__dirname,'sources',lang,'before'));
  sh('rm','-f',dir+'/fieldsketch.db-wal',dir+'/fieldsketch.db-shm');
  cmd('push',local,dir+'/fieldsketch.db');sh('chown',uid+':'+uid,dir+'/fieldsketch.db');sh('chmod','600',dir+'/fieldsketch.db');
  sh('cmd','locale','set-app-locales',pkg,'--locales',lang);route();await wait(1800);
}
async function record(lang,name){
 const stateFile=path.join(__dirname,'recording.json');if(fs.existsSync(stateFile))throw Error('Recording state exists');
 const remote='/sdcard/v05-'+lang+'-'+name+'.mp4';
 const log=fs.openSync(path.join(__dirname,'sources',lang,name+'-record.log'),'w');
 const p=spawn(adb,['-s',serial,'shell','screenrecord','--bit-rate','16000000','--time-limit','180',remote],{stdio:['ignore',log,log],windowsHide:true});
 fs.writeFileSync(stateFile,JSON.stringify({lang,name,remote,started:Date.now(),pid:p.pid}));p.unref();await wait(1200);
}
async function stop(){const sf=path.join(__dirname,'recording.json'),s=JSON.parse(fs.readFileSync(sf));let pid='';try{pid=sh('pidof','screenrecord');}catch{}if(pid)sh('kill','-2',pid);await wait(1200);cmd('pull',s.remote,path.join(__dirname,'sources',s.lang,s.name+'.mp4'));fs.writeFileSync(path.join(__dirname,'sources',s.lang,s.name+'-capture.json'),JSON.stringify({...s,ended:Date.now()},null,2));fs.unlinkSync(sf);}
module.exports={cmd,sh,ui,summary,tap,input,shot,route,wait,setup,record,stop,root,pkg};
if(require.main===module)(async()=>{const [action,...args]=process.argv.slice(2);if(action==='setup')await setup(...args);else if(action==='ui')console.log(JSON.stringify(summary(),null,2));else if(action==='tap')tap(args[0],args[1]==='last');else if(action==='input')input(...args);else if(action==='shot')shot(...args);else if(action==='route')route(...args);else if(action==='record')await record(...args);else if(action==='stop')await stop();else throw Error('Unknown action');})().catch(e=>{console.error(e);process.exitCode=1;});
