const fs=require('node:fs'),path=require('node:path');
const c=require('./control.cjs');
async function capture(lang){
 const init=require(path.join(c.root,'app/node_modules/sql.js'));const SQL=await init();
 const db=new SQL.Database(fs.readFileSync(path.resolve(__dirname,'../video-v02/sources',lang,'initial.db')));
 const project=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../video-v02/sources',lang,'project.json')));
 db.run('INSERT INTO projects (id,name,updated_at,body) VALUES (?,?,?,?)',[project.id,project.name,project.updatedAt,JSON.stringify(project)]);
 for(const o of project.observations)db.run('INSERT INTO observations(id,project_id,body) VALUES (?,?,?)',[o.id,project.id,JSON.stringify(o)]);
 const initial=path.join(__dirname,'sources',lang,'initial.db');fs.writeFileSync(initial,Buffer.from(db.export()));
 c.sh('am','force-stop',c.pkg);const dir='/data/user/0/'+c.pkg+'/files/SQLite';const uid=c.sh('stat','-c','%u',dir);
 c.cmd('pull',dir,path.join(__dirname,'sources',lang,'before'));
 c.sh('rm','-f',dir+'/fieldsketch.db-wal',dir+'/fieldsketch.db-shm');c.cmd('push',initial,dir+'/fieldsketch.db');c.sh('chown',uid+':'+uid,dir+'/fieldsketch.db');c.sh('chmod','600',dir+'/fieldsketch.db');
 c.sh('cmd','locale','set-app-locales',c.pkg,'--locales',lang);c.sh('settings','put','system','show_touches','1');
 c.sh('settings','put','global','sysui_demo_allowed','1');c.sh('am','broadcast','-a','com.android.systemui.demo','-e','command','clock','-e','hhmm','0941');
 c.route('outline?id='+project.id);await c.wait(2000);
 if(!c.ui().some(n=>n['content-desc']===(lang==='pl'?'Eksportuj DXF':'Export DXF')))throw Error('Plus export unavailable');
 await c.record(lang,'01-export');
 try{await c.wait(4500);c.shot('sources/'+lang+'/01-summary.png');c.tap(lang==='pl'?'Eksportuj DXF':'Export DXF');await c.wait(4500);c.shot('sources/'+lang+'/02-share.png');await c.wait(4000);}finally{await c.stop();}
 const file=`outlinego-${project.id}-r${project.geometryRevision}-m.dxf`;
 c.cmd('pull',`/data/user/0/${c.pkg}/cache/${file}`,path.join(__dirname,'sources',lang,'patio-'+lang+'.dxf'));
 fs.copyFileSync(path.join(__dirname,'sources',lang,'patio-'+lang+'.dxf'),path.join(__dirname,'output','patio-'+lang+'.dxf'));
 fs.writeFileSync(path.join(__dirname,'sources',lang,'project.json'),JSON.stringify(project,null,2));
 c.sh('input','keyevent','KEYCODE_BACK');await c.wait(500);
 console.log('Captured real DXF export and local transfer: '+lang);
}
capture(process.argv[2]||'pl').catch(e=>{console.error(e);process.exitCode=1;});
