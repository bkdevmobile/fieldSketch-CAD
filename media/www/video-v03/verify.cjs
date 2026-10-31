const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{spawnSync}=require('node:child_process');
const sharp=require(path.resolve(__dirname,'../../../app/node_modules/sharp')),ffmpeg=process.env.V03_FFMPEG||'C:/ffmpeg/ffmpeg.exe';
const out=path.join(__dirname,'output'),work=path.join(__dirname,'rendered');
const assert=(p,m)=>{if(!p)throw Error(m);},sha=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
function run(args){const r=spawnSync(ffmpeg,['-hide_banner','-y',...args],{encoding:'utf8',windowsHide:true,maxBuffer:12e6});assert(r.status===0,r.error||r.stderr);return r;}
(async()=>{const reports=[];
 for(const lang of ['pl','en']){
  const film=path.join(out,`v03-garden-${lang}.mp4`),silent=path.join(out,`v03-garden-${lang}-silent.mp4`);
  const decoded=run(['-i',film,'-f','null','-']);fs.writeFileSync(path.join(work,`validation-${lang}.log`),decoded.stderr);
  assert(/Duration: 00:00:45\.00/.test(decoded.stderr)&&/frame=\s*1350/.test(decoded.stderr),'Expected 45 seconds / 1350 frames');
  assert(/1920x1080/.test(decoded.stderr)&&/30 fps/.test(decoded.stderr)&&/Audio: aac.*48000 Hz, stereo/.test(decoded.stderr),'Unexpected format');assert(!/Subtitle:/.test(decoded.stderr),'Unexpected subtitle stream');
  const videoHash=f=>run(['-i',f,'-map','0:v:0','-c','copy','-f','hash','-hash','sha256','-']).stdout.trim();assert(videoHash(film)===videoHash(silent),'Music changed picture');
  const edit=JSON.parse(fs.readFileSync(path.join(out,`edit-manifest-${lang}.json`),'utf8'));
  assert(edit.segments.length===3&&edit.segments.reduce((s,v)=>s+v.outputSeconds,0)===45,'Unexpected edit');
  const motion=edit.segments[0];assert(motion.motion==='centered-zoom-out'&&motion.zoomStart===1.035&&motion.zoomEnd===1&&motion.pan===false&&motion.center.x===0.5&&motion.center.y===0.5&&motion.interpolation==='cubic','Expected gentle centred zoom out without pan');
  for(const s of edit.segments){assert(sha(path.resolve(__dirname,s.source))===s.sha256,'Source changed');if(s.detail)assert(sha(path.resolve(__dirname,s.detail.source))===s.detail.sha256,'Detail source changed');if(s.speed)assert(s.speed===1&&s.hold>=9,'Unexpected acceleration');}
  assert(sha(path.join(out,`patio-${lang}-free.png`))===sha(path.resolve(__dirname,`../video-v02/output/first-sketch-${lang}-free.png`)),'PNG changed');
  const html=fs.readFileSync(path.join(out,`preview-${lang}.html`),'utf8');assert(!/<track\b/.test(html),'Duplicate captions');assert(html.includes(edit.disclosure),'Missing illustration disclosure outside picture');
  for(const match of html.matchAll(/(?:src|poster|href)="([^"#]+)"/g))if(!/^https?:/.test(match[1]))assert(fs.existsSync(path.join(out,match[1])),'Missing preview asset');
  const buffers=[];for(const [i,t] of [1,10,16,27,32,43].entries()){
   const frame=path.join(work,`${lang}-qa-${i}.png`);run(['-ss',String(t),'-i',film,'-frames:v','1',frame]);buffers.push(await sharp(frame).resize(960,540).toBuffer());
  }
  assert(sha(path.join(work,`${lang}-qa-0.png`))!==sha(path.join(work,`${lang}-qa-1.png`)),'Camera movement absent');
  await sharp({create:{width:1920,height:1620,channels:3,background:'#f6f5ef'}}).composite(buffers.map((input,i)=>({input,left:i%2*960,top:Math.floor(i/2)*540}))).png().toFile(path.join(out,`contact-sheet-${lang}.png`));
  const audio=run(['-i',film,'-vn','-af','ebur128=peak=true','-f','null','-']).stderr;fs.writeFileSync(path.join(work,`audio-${lang}.log`),audio);
  const integrated=+audio.match(/Summary:[\s\S]*?I:\s*([\d.-]+) LUFS/)[1];assert(integrated>-28&&integrated<-20,'Unexpected music level');
  reports.push({language:lang,durationSeconds:45,decodedFrames:1350,width:1920,height:1080,fps:30,audio:'AAC stereo 48 kHz',integratedLufs:integrated,videoStreamPreserved:true,sourceHashesVerified:true,pngUnchanged:true,cameraMovement:true,motion:'centered-zoom-out',pan:false,zoomStart:1.035,zoomEnd:1,sha256:sha(film),bytes:fs.statSync(film).size});console.log('Verified '+lang+': 45 s, 1350 frames, centred zoom out, music '+integrated+' LUFS, sources unchanged.');
 }
 fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify({date:'2026-10-31',reports,illustration:{generated:true,method:'Built-in ImageGen, still image animated with centred zoom out and no pan; no human motion generated',sourceSha256:sha(path.join(__dirname,'sources/garden-measurement.png')),prompt:'sources/image-prompt.txt'},music:{title:'Wallpaper',artist:'Kevin MacLeod',license:'CC BY 4.0',source:'https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100843',sha256:sha(path.join(__dirname,'audio/Wallpaper.mp3'))}},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
