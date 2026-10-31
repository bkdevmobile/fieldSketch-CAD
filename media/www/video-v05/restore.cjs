const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),c=require('./control.cjs');
const sha=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const baseline=path.join(__dirname,'sources/pl/before'),remote='/data/user/0/'+c.pkg+'/files/SQLite';
if(!fs.existsSync(path.join(baseline,'fieldsketch.db')))throw Error('Missing pre-session demonstration backup');
if(fs.existsSync(path.join(__dirname,'recording.json')))throw Error('Recording is still active');
c.sh('am','force-stop',c.pkg);const uid=c.sh('stat','-c','%u',remote);if(!/^\d+$/.test(uid))throw Error('Unexpected UID');
c.sh('rm','-f',remote+'/fieldsketch.db-wal',remote+'/fieldsketch.db-shm');
const restored=[];
for(const name of ['fieldsketch.db','fieldsketch.db-wal','fieldsketch.db-shm']){
 const local=path.join(baseline,name);if(!fs.existsSync(local))continue;
 c.cmd('push',local,remote+'/'+name);c.sh('chown',uid+':'+uid,remote+'/'+name);c.sh('chmod','600',remote+'/'+name);
 const expected=sha(local),actual=c.sh('sha256sum',remote+'/'+name).split(/\s+/)[0];if(actual!==expected)throw Error('Backup restoration mismatch');restored.push({file:name,sha256:expected});
}
c.sh('cmd','locale','set-app-locales',c.pkg,'--locales','en');c.sh('settings','put','system','show_touches','0');
c.sh('am','broadcast','-a','com.android.systemui.demo','-e','command','exit');
const productionApk=path.join(c.root,'artifacts/outlineGo-1.0.0.apk'),expectedApk=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../video-v04/sources/restoration.json'),'utf8')).originalApkSha256;
const actualApk=sha(productionApk);if(actualApk!==expectedApk)throw Error('Production APK differs from pre-session reference');
fs.writeFileSync(path.join(__dirname,'sources/restoration.json'),JSON.stringify({demonstrationDatabaseRestored:true,restoredFiles:restored,locale:'en',touchIndicatorsOff:true,demoClockExited:true,productionApkUnchanged:true,productionApkSha256:actualApk,appCodeModified:false,plusMockUsed:false},null,2));
console.log('Restored demonstration database; original APK unchanged; demo clock exited.');
