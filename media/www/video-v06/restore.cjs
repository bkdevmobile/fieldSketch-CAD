const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),c=require('./control.cjs');
const sha=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const baseline=path.join(__dirname,'sources/pl/before'),remote='/data/user/0/'+c.pkg+'/files/SQLite';
const reportFile=path.join(__dirname,'sources/restoration.json'),previous=fs.existsSync(reportFile)?JSON.parse(fs.readFileSync(reportFile,'utf8')):{};
if(fs.existsSync(path.join(__dirname,'recording.json')))throw Error('Recording still active');
const source=path.join(c.root,'app/src/infrastructure/native.ts'),sourceBackup=path.join(c.root,'artifacts/v06-native-original.ts');
if(sha(source)!==(fs.existsSync(sourceBackup)?sha(sourceBackup):previous.sourceSha256))throw Error('Original native.ts not restored');
const productionApk=path.join(c.root,'artifacts/outlineGo-1.0.0.apk'),reference=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../video-v04/sources/restoration.json'),'utf8')).originalApkSha256;
if(sha(productionApk)!==reference)throw Error('Production APK changed');
const testApk=path.join(c.root,'artifacts/v06-sensors-test.apk'),testApkSha256=fs.existsSync(testApk)?sha(testApk):previous.testApkSha256;
c.sh('am','force-stop',c.pkg);c.cmd('install','-r',productionApk);c.sh('am','force-stop',c.pkg);
const uid=c.sh('stat','-c','%u',remote);if(!/^\d+$/.test(uid))throw Error('Unexpected UID');
c.sh('rm','-f',remote+'/fieldsketch.db-wal',remote+'/fieldsketch.db-shm');const files=[];
for(const name of ['fieldsketch.db','fieldsketch.db-wal','fieldsketch.db-shm']){const file=path.join(baseline,name);if(!fs.existsSync(file))continue;c.cmd('push',file,remote+'/'+name);c.sh('chown',uid+':'+uid,remote+'/'+name);c.sh('chmod','600',remote+'/'+name);const actual=c.sh('sha256sum',remote+'/'+name).split(/\s+/)[0];if(actual!==sha(file))throw Error('Restoration mismatch');files.push({file:name,sha256:actual});}
c.sh('cmd','locale','set-app-locales',c.pkg,'--locales','en');c.sh('settings','put','system','show_touches','0');c.sh('am','broadcast','-a','com.android.systemui.demo','-e','command','exit');
fs.writeFileSync(reportFile,JSON.stringify({...previous,date:'2026-10-31',sourceRestored:true,sourceSha256:sha(source),originalApkReinstalled:true,productionApkUnchanged:true,productionApkSha256:reference,testApkSha256,demonstrationDatabaseRestored:true,restoredFiles:files,locale:'en',touchIndicatorsOff:true,demoClockExited:true,hostWebcamUsed:false,simulation:'temporary JavaScript adapter for orientation and step events; virtual camera image file; original app UI and geometry'},null,2));
console.log('Original APK reinstalled, native.ts unchanged, demonstration database restored.');
