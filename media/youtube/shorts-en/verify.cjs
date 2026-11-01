const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const assert=require('node:assert/strict'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'../../..'),sharp=require(path.join(root,'app/node_modules/sharp'));
const output=path.join(__dirname,'output'),work=path.join(__dirname,'rendered');
const ffmpeg=process.env.SHORTS_FFMPEG||'C:/ffmpeg/ffmpeg.exe';
const config=require('./config.cjs');
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
function run(args){const r=spawnSync(ffmpeg,['-hide_banner','-y',...args],{encoding:'utf8',windowsHide:true,maxBuffer:20e6});assert.equal(r.status,0,r.error||r.stderr);return r;}
function streamHash(file){return run(['-i',file,'-map','0:v:0','-c','copy','-f','hash','-hash','sha256','-']).stdout.trim();}
(async()=>{
 const reports=[],metadata=JSON.parse(fs.readFileSync(path.join(output,'metadata.json'),'utf8'));
 assert.equal(metadata.length,4);
 for(const film of config){
  const base=`${film.id}-${film.slug}-en`,video=path.join(output,base+'.mp4'),silent=path.join(output,base+'-silent.mp4');
  const manifest=JSON.parse(fs.readFileSync(path.join(output,base+'-edit-manifest.json'),'utf8'));
  const meta=metadata.find(item=>item.id===film.id);
  const duration=film.segments.reduce((sum,segment)=>sum+segment.duration,0);
  assert(duration<60 && duration>20);
  const decode=run(['-i',video,'-f','null','-']);
  fs.writeFileSync(path.join(work,film.id+'-decode.log'),decode.stderr);
  assert(decode.stderr.includes('1080x1920')&&decode.stderr.includes('30 fps')&&decode.stderr.includes('Video: h264'));
  assert(/Audio: aac.*48000 Hz, stereo/.test(decode.stderr));
  assert(!decode.stderr.includes('Subtitle:'));
  const frames=[...decode.stderr.matchAll(/frame=\s*(\d+)/g)].at(-1)?.[1];
  assert.equal(Number(frames),duration*30,'Full frame count');
  const stamp=decode.stderr.match(/Duration: (\d+):(\d+):([\d.]+)/);
  assert.equal(Number(stamp[1])*3600+Number(stamp[2])*60+Number(stamp[3]),duration);
  assert.equal(streamHash(video),streamHash(silent),'Music must not alter picture');
  const musicLog=run(['-i',video,'-vn','-af','ebur128=peak=true','-f','null','-']).stderr;
  const lufs=Number(musicLog.match(/Summary:[\s\S]*?I:\s*([\d.-]+) LUFS/)[1]);
  assert(lufs>-28&&lufs<-20,'Quiet music level');
  for(const segment of manifest.segments){
   assert.equal(hash(path.join(root,segment.file)),segment.sourceSha256,'Source unchanged');
   if(segment.endStill)assert.equal(hash(path.join(root,segment.endStill)),segment.endStillSha256,'Still unchanged');
   assert.equal(segment.speed,1,'No accelerated steps');
   assert(segment.hold>=4,'Readable pause');
   if(segment.file.endsWith('.mp4')){
    const info=spawnSync(ffmpeg,['-hide_banner','-i',path.join(root,segment.file)],{encoding:'utf8',windowsHide:true}).stderr;
    const d=info.match(/Duration: (\d+):(\d+):([\d.]+)/);
    const available=Number(d[1])*3600+Number(d[2])*60+Number(d[3]);
    assert(segment.start+segment.length<=available+0.02,'Trim inside real recording');
   }
   if(segment.file.includes('video-v04/sources')){
    assert(!segment.file.endsWith('02-open.mp4'),'No private file dialog');
    if(segment.layout==='cad'){
     const c=segment.crop;assert(c.x>=36&&c.y>=90&&c.x+c.width<=1776&&c.y+c.height<=840,'CAD crop inside approved private-data-free viewport');
    }else if(segment.layout==='units')assert.deepEqual(segment.crop,{x:10,y:10,width:500,height:200});
    else assert.equal(segment.layout,'phone');
   }
  }
  assert.equal(hash(path.join(root,manifest.music.file)),manifest.music.sha256);
  assert(meta.title.length<=100&&meta.description.length<=5000);
  assert(meta.description.includes(manifest.credits)&&meta.description.includes(manifest.disclosure));
  const mp4metadata=run(['-i',video,'-f','ffmetadata','-']).stdout;
  assert(mp4metadata.includes('Kevin MacLeod')&&mp4metadata.includes('creativecommons.org/licenses/by/4.0/'));
  if(film.simulated){assert(meta.description.includes('simulated'));assert(mp4metadata.includes('simulated'));}
  if(film.generatedIllustration){assert(meta.description.includes('AI-generated'));assert(mp4metadata.includes('AI-generated'));}
  const cover=await sharp(path.join(output,base+'-cover.png')).metadata();assert.equal(cover.width,1080);assert.equal(cover.height,1920);
  const framesToView=[];
  for(const [index,segment] of manifest.segments.entries()){
   const times=segment.file.endsWith('.mp4')?[segment.outputStart+1,segment.outputStart+segment.duration-2]:[segment.outputStart+segment.duration/2];
   for(const [j,time] of times.entries()){
    const frame=path.join(work,`${film.id}-qa-${index}-${j}.png`);
    run(['-ss',String(time),'-i',video,'-frames:v','1',frame]);
    framesToView.push(await sharp(frame).resize(360,640).png().toBuffer());
   }
  }
  const columns=3,rows=Math.ceil(framesToView.length/columns);
  await sharp({create:{width:columns*360,height:rows*640,channels:3,background:'#e6ecdf'}}).composite(framesToView.map((input,index)=>({input,left:index%columns*360,top:Math.floor(index/columns)*640}))).png().toFile(path.join(output,base+'-contact-sheet.png'));
  reports.push({id:film.id,file:base+'.mp4',durationSeconds:duration,frames:Number(frames),width:1080,height:1920,fps:30,audio:'AAC stereo 48 kHz',integratedLufs:lufs,sourcesVerified:true,videoStreamPreserved:true,privacyCropsVerified:true,disclosuresVerified:true,sha256:hash(video),bytes:fs.statSync(video).size});
  console.log(`Verified ${film.id}: ${duration} s / ${frames} frames / ${lufs} LUFS; sources, metadata and privacy crops checked.`);
 }
 const preview=fs.readFileSync(path.join(output,'preview.html'),'utf8');
 assert.equal((preview.match(/<video /g)||[]).length,4);assert(!preview.includes('autoplay'));
 for(const match of preview.matchAll(/(?:src|href|poster)="([^"#]+)"/g))if(!match[1].startsWith('https:'))assert(fs.existsSync(path.join(output,match[1])));
 fs.writeFileSync(path.join(output,'verification.json'),JSON.stringify({date:'2026-11-01',reports},null,2)+'\n');
})().catch(error=>{console.error(error);process.exitCode=1;});
