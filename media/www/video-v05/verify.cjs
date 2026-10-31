const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{spawnSync}=require('node:child_process');
const {prepare}=require('./prepare.cjs'),sharp=require(path.resolve(__dirname,'../../../app/node_modules/sharp'));
const ffmpeg=process.env.V05_FFMPEG||'C:/ffmpeg/ffmpeg.exe',out=path.join(__dirname,'output'),work=path.join(__dirname,'rendered');
const assert=(p,m)=>{if(!p)throw Error(m);},sha=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
function run(args){const r=spawnSync(ffmpeg,['-hide_banner','-y',...args],{encoding:'utf8',windowsHide:true,maxBuffer:12e6});assert(r.status===0,r.error||r.stderr);return r;}
(async()=>{const reports=[];
 for(const lang of process.argv.slice(2).length?process.argv.slice(2):['pl','en']){
  const geometry=prepare(lang),film=path.join(out,`v05-room-${lang}.mp4`),silent=path.join(out,`v05-room-${lang}-silent.mp4`);
  const decoded=run(['-i',film,'-f','null','-']);fs.writeFileSync(path.join(work,`validation-${lang}.log`),decoded.stderr);
  assert(/Duration: 00:01:12\.00/.test(decoded.stderr)&&/frame=\s*2160/.test(decoded.stderr),'Expected 72 seconds / 2160 frames');
  assert(/1920x1080/.test(decoded.stderr)&&/30 fps/.test(decoded.stderr)&&/Audio: aac.*48000 Hz, stereo/.test(decoded.stderr),'Unexpected format');assert(!/Subtitle:/.test(decoded.stderr),'Unexpected subtitle stream');
  const videoHash=f=>run(['-i',f,'-map','0:v:0','-c','copy','-f','hash','-hash','sha256','-']).stdout.trim();assert(videoHash(film)===videoHash(silent),'Music changed picture');
  const edit=JSON.parse(fs.readFileSync(path.join(out,`edit-manifest-${lang}.json`),'utf8'));
  assert(edit.segments.length===7&&edit.segments.reduce((s,v)=>s+v.outputSeconds,0)===72,'Unexpected edit');
  const intro=edit.segments[0];assert(intro.kind==='generated-room-illustration'&&intro.motion==='centered-zoom-out'&&intro.zoomStart===1.035&&intro.zoomEnd===1&&intro.pan===false&&intro.center.x===0.5&&intro.center.y===0.5,'Expected gentle centered room illustration');
  for(const s of edit.segments){if(s.kind!=='generated-room-illustration')assert(s.speed===1&&s.hold>=4,'Unexpected acceleration or missing pause');assert(sha(path.resolve(__dirname,s.source))===s.sha256,'Source changed');if(s.endStill)assert(sha(path.resolve(__dirname,s.endStill.source))===s.endStill.sha256,'End still changed');if(s.illustration)assert(sha(path.resolve(__dirname,s.illustration.source))===s.illustration.sha256,'Illustration changed');}
  const html=fs.readFileSync(path.join(out,`preview-${lang}.html`),'utf8');assert(!/<track\b/.test(html),'Duplicate captions');
  assert(html.includes(edit.disclosure),'Missing illustration disclosure');const metadata=run(['-i',film,'-f','ffmetadata','-']).stdout;assert(/ilustracją|AI-generated/.test(metadata),'Missing illustration disclosure in metadata');
  for(const match of html.matchAll(/(?:src|poster|href)="([^"#]+)"/g))if(!/^https?:/.test(match[1]))assert(fs.existsSync(path.join(out,match[1])),'Missing preview asset');
  const buffers=[];for(const [i,t] of [4,10,19,29,39,49,59,69].entries()){
   const frame=path.join(work,`${lang}-qa-${i}.png`);run(['-ss',String(t),'-i',film,'-frames:v','1',frame]);buffers.push(await sharp(frame).resize(768,432).toBuffer());
  }
  await sharp({create:{width:1536,height:1728,channels:3,background:'#f6f5ef'}}).composite(buffers.map((input,i)=>({input,left:i%2*768,top:Math.floor(i/2)*432}))).png().toFile(path.join(out,`contact-sheet-${lang}.png`));
  const audio=run(['-i',film,'-vn','-af','ebur128=peak=true','-f','null','-']).stderr;fs.writeFileSync(path.join(work,`audio-${lang}.log`),audio);
  const integrated=+audio.match(/Summary:[\s\S]*?I:\s*([\d.-]+) LUFS/)[1];assert(integrated>-28&&integrated<-20,'Unexpected music level');
  reports.push({language:lang,...geometry,durationSeconds:72,decodedFrames:2160,width:1920,height:1080,fps:30,audio:'AAC stereo 48 kHz',integratedLufs:integrated,videoStreamPreserved:true,sourceHashesVerified:true,illustrationDisclosed:true,illustrationMotion:'centered-zoom-out',sha256:sha(film),bytes:fs.statSync(film).size});console.log('Verified '+lang+': 72 s, 2160 frames, room illustration, saved correction, 18 m / 20 m², music '+integrated+' LUFS.');
 }
 const restorationPath=path.join(__dirname,'sources/restoration.json'),restoration=fs.existsSync(restorationPath)?JSON.parse(fs.readFileSync(restorationPath,'utf8')):null;
 if(!process.argv.slice(2).length)assert(restoration?.demonstrationDatabaseRestored&&restoration?.productionApkUnchanged&&!restoration?.plusMockUsed,'Restoration not confirmed');
 fs.writeFileSync(path.join(out,process.argv.slice(2).length?`verification-${process.argv[2]}.json`:'verification.json'),JSON.stringify({date:'2026-10-31',reports,illustration:{generated:true,method:'Built-in ImageGen; gentle centered zoom out without lateral pan',sourceSha256:sha(path.join(__dirname,'sources/room-measurement.png')),prompt:'sources/image-prompt.txt'},music:{title:'Dream Culture',artist:'Kevin MacLeod',license:'CC BY 4.0',source:'https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1300046',sha256:sha(path.join(__dirname,'audio/Dream-Culture.mp3'))},restoration},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
