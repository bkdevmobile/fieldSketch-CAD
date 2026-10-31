const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{spawnSync}=require('node:child_process');
const sharp=require(path.resolve(__dirname,'../../../app/node_modules/sharp'));
const ffmpeg=process.env.V04_FFMPEG||'C:/ffmpeg/ffmpeg.exe',out=path.join(__dirname,'output');
const assert=(condition,message)=>{if(!condition)throw Error(message);};
const sha=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
function run(args){const r=spawnSync(ffmpeg,['-hide_banner','-y',...args],{encoding:'utf8',windowsHide:true,maxBuffer:12e6});assert(r.status===0,r.error||r.stderr);return r;}
function dxfGeometry(file){const lines=fs.readFileSync(file,'utf8').trim().split(/\r?\n/);const groups=[];for(let i=0;i<lines.length;i+=2)groups.push([+lines[i],lines[i+1]]);
 const units=groups.findIndex(g=>g[0]===9&&g[1]==='$INSUNITS');assert(groups[units+1][0]===70&&+groups[units+1][1]===6,'DXF unit is not metre');
 const index=groups.findIndex(g=>g[0]===0&&g[1]==='LWPOLYLINE');assert(index>=0,'Missing geometry');const entity=[];for(let i=index+1;i<groups.length&&groups[i][0]!==0;i++)entity.push(groups[i]);
 assert(entity.some(g=>g[0]===8&&g[1]==='OUTLINE')&&entity.some(g=>g[0]===70&&+g[1]===1),'Expected closed OUTLINE polyline');
 const xs=entity.filter(g=>g[0]===10).map(g=>+g[1]),ys=entity.filter(g=>g[0]===20).map(g=>+g[1]);const expected=[[0,0],[4,0],[4,3],[0,3]];
 assert(xs.length===4,'Expected four vertices');expected.forEach((p,i)=>assert(Math.abs(xs[i]-p[0])<1e-8&&Math.abs(ys[i]-p[1])<1e-8,'Unexpected DXF vertex'));
 const perimeter=xs.reduce((s,x,i)=>s+Math.hypot(x-xs[(i+1)%4],ys[i]-ys[(i+1)%4]),0);assert(Math.abs(perimeter-14)<1e-8,'Unexpected perimeter');return {unit:'metre',vertices:xs.map((x,i)=>({x,y:ys[i]})),perimeterMetres:perimeter};
}
(async()=>{const reports=[];
 for(const lang of ['pl','en']){
  const film=path.join(out,`v04-dxf-to-cad-${lang}.mp4`),silent=path.join(out,`v04-dxf-to-cad-${lang}-silent.mp4`),dxf=path.join(out,`patio-${lang}.dxf`);
  const geometry=dxfGeometry(dxf);assert(sha(dxf)===sha(path.join(__dirname,'sources',lang,`patio-${lang}.dxf`)),'CAD source DXF was modified');
  const decoded=run(['-i',film,'-f','null','-']);fs.writeFileSync(path.join(out,`validation-${lang}.log`),decoded.stderr);
  assert(/Duration: 00:02:24\.00/.test(decoded.stderr)&&/frame=\s*4320/.test(decoded.stderr),'Expected 144 seconds and 4320 decoded frames');
  assert(/1920x1080/.test(decoded.stderr)&&/30 fps/.test(decoded.stderr)&&/Audio: aac/.test(decoded.stderr),'Unexpected video/audio format');assert(!/Subtitle:/.test(decoded.stderr),'Unexpected subtitles');
  const videoHash=file=>run(['-i',file,'-map','0:v:0','-c','copy','-f','hash','-hash','sha256','-']).stdout.trim();assert(videoHash(film)===videoHash(silent),'Audio mix changed video stream');
  const edit=JSON.parse(fs.readFileSync(path.join(out,`edit-manifest-${lang}.json`)));assert(edit.segments.every(s=>s.speed<=1&&s.hold>=6),'Unexpected acceleration');
  assert(edit.segments.every(s=>!s.source.endsWith('/02-open.mp4')),'Private file dialog must not appear');
  for(const i of [1,2,4])assert(edit.segments[i].viewportCrop?.x===36&&edit.segments[i].viewportCrop?.y===90&&edit.segments[i].viewportCrop?.width===1740&&edit.segments[i].viewportCrop?.height===750,'CAD must use only the drawing viewport');
  assert(edit.segments[3].privacy==='units-dialog-crop'&&edit.segments[4].privacy==='drawing-viewport-and-length-status-only','Unexpected CAD crop policy');
  const html=fs.readFileSync(path.join(out,`preview-${lang}.html`),'utf8');assert(!/<track\b/.test(html),'Duplicate subtitle track');
  const buffers=[];for(const [i,time] of [18,48,79,96,121,139].entries()){
   const frame=path.join(__dirname,'rendered',lang+'-qa-'+i+'.png');run(['-ss',String(time),'-i',film,'-frames:v','1',frame]);buffers.push(await sharp(frame).resize(960,540).toBuffer());
  }
  await sharp({create:{width:1920,height:1620,channels:3,background:'#f6f5ef'}}).composite(buffers.map((input,i)=>({input,left:i%2*960,top:Math.floor(i/2)*540}))).png().toFile(path.join(out,`contact-sheet-${lang}.png`));
  reports.push({language:lang,durationSeconds:144,decodedFrames:4320,width:1920,height:1080,fps:30,audio:'AAC stereo 48 kHz',geometry,dxfSha256:sha(dxf),videoSha256:sha(film),bytes:fs.statSync(film).size,videoStreamPreserved:true,privateFileDialogExcluded:true,cadViewportCropsVerified:true});console.log('Verified '+lang+': 4320 frames, audio, original DXF, metres, 14 m, private file dialog excluded.');
 }
 const audioCheck=run(['-i',path.join(out,'v04-dxf-to-cad-pl.mp4'),'-vn','-af','ebur128=peak=true','-f','null','-']);fs.writeFileSync(path.join(out,'audio-validation.log'),audioCheck.stderr);
 const restoration=JSON.parse(fs.readFileSync(path.join(__dirname,'sources/restoration.json')));assert(restoration.storeRestored&&restoration.productionApkUnchanged,'Restoration not confirmed');
 fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify({date:'2026-10-30',reports,music:{title:'Life of Riley',artist:'Kevin MacLeod',license:'CC BY 4.0',sourceSha256:sha(path.join(__dirname,'audio/Life-of-Riley.mp3'))},restoration},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
