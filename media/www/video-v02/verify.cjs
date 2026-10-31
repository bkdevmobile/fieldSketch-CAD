const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{spawnSync}=require('node:child_process');
const {DatabaseSync}=require('node:sqlite');
const sharp=require(path.resolve(__dirname,'../../../app/node_modules/sharp'));
const ffmpeg=process.env.V02_FFMPEG||'C:/ffmpeg/ffmpeg.exe';
const output=path.join(__dirname,'output');
const assert=(value,message)=>{if(!value)throw Error(message);};
const sha=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
(async()=>{const reports=[];
 for(const lang of process.argv.slice(2).length?process.argv.slice(2):['pl','en']){
  const sources=path.join(__dirname,'sources',lang),db=new DatabaseSync(path.join(sources,'after/fieldsketch.db'),{readOnly:true});
  const rows=db.prepare('SELECT body FROM projects').all();assert(rows.length===1,'Expected only the recorded sketch');
  const p=JSON.parse(rows[0].body);assert(p.closed&&p.mode==='manual'&&p.closureObservationId===null,'Expected manual outline with calculated closure');
  const expected=[[0,0],[4,0],[4,3],[0,3]];assert(p.points.length===4,'Expected four points');
  p.points.forEach((q,i)=>assert(Math.abs(q.x-expected[i][0])<1e-9&&Math.abs(q.y-expected[i][1])<1e-9,'Unexpected point geometry'));
  const active=p.activeObservationIds.map(id=>p.observations.find(o=>o.id===id));
  assert(active.every(o=>o.lengthSource==='manual'),'Expected manually entered lengths');
  assert(p.observations.some(o=>o.lengthM===3.8)&&active.at(-1).lengthM===4&&active.at(-1).supersedesId,'Missing saved 3.8 → 4 correction');
  const original=path.join(sources,`outlinego-${p.id}-r${p.geometryRevision}-free.png`);assert(fs.existsSync(original),'Missing original Free PNG');
  const png=path.join(output,`first-sketch-${lang}-free.png`);fs.copyFileSync(original,png);
  fs.writeFileSync(path.join(sources,'project.json'),JSON.stringify(p,null,2));
  const film=path.join(output,`v02-first-sketch-${lang}.mp4`);
  const decoded=spawnSync(ffmpeg,['-hide_banner','-v','info','-i',film,'-f','null','-'],{encoding:'utf8',windowsHide:true,maxBuffer:8e6});
  fs.writeFileSync(path.join(output,`validation-${lang}.log`),decoded.stderr||'');
  assert(decoded.status===0,'Video failed full decode');assert(/1920x1080/.test(decoded.stderr)&&/30 fps/.test(decoded.stderr),'Unexpected video format');
  assert(/Duration: 00:03:44\.00/.test(decoded.stderr),'Expected exact 224 seconds');
  assert(!/Audio:/.test(decoded.stderr),'Expected silent video');assert(/frame=\s*6720/.test(decoded.stderr),'Expected 6720 decoded frames');
  const edit=JSON.parse(fs.readFileSync(path.join(output,`edit-manifest-${lang}.json`)));
  assert(edit.segments.every(s=>s.speed<=1&&s.holdSeconds===6),'Expected no speedups and six-second holds');
  const buffers=[];for(const [i,time] of [12,43,102,160,196,215].entries()){
   const frame=path.join(__dirname,'rendered',`${lang}-qa-${i}.png`);
   const r=spawnSync(ffmpeg,['-hide_banner','-y','-ss',String(time),'-i',film,'-frames:v','1',frame],{windowsHide:true,encoding:'utf8'});assert(r.status===0,'Frame extraction failed');
   buffers.push(await sharp(frame).resize(960,540).toBuffer());
  }
  await sharp({create:{width:1920,height:1620,channels:3,background:'#f6f5ef'}}).composite(buffers.map((input,i)=>({input,left:i%2*960,top:Math.floor(i/2)*540}))).png().toFile(path.join(output,`contact-sheet-${lang}.png`));
  const pngMeta=await sharp(png).metadata();reports.push({language:lang,projectId:p.id,mode:p.mode,closed:p.closed,points:p.points.map(({x,y})=>({x,y})),perimeterMetres:14,areaSquareMetres:12,closure:'calculated',savedCorrection:'3.8 -> 4 m',durationSeconds:224,decodedFrames:6720,width:1920,height:1080,fps:30,audio:false,png:{file:path.basename(png),width:pngMeta.width,height:pngMeta.height,sha256:sha(png)},video:{file:path.basename(film),bytes:fs.statSync(film).size,sha256:sha(film)}});
  db.close();console.log('Verified '+lang+': real geometry, saved correction, original PNG, 6720 decoded frames.');
 }
 fs.writeFileSync(path.join(output,'verification.json'),JSON.stringify({date:'2026-10-30',app:'outlineGo 1.0.0 / versionCode 4',emulator:'Android API 35 / emulator-5556 / 1080×1920 / density 360',reports},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
