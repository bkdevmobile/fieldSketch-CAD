const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{spawnSync}=require('node:child_process');
const sharp=require(path.resolve(__dirname,'../../../app/node_modules/sharp')),ffmpeg=process.env.V01_FFMPEG||'C:/ffmpeg/ffmpeg.exe';
const out=path.join(__dirname,'output'),work=path.join(__dirname,'rendered');
const assert=(p,m)=>{if(!p)throw Error(m);},sha=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
function run(args){const r=spawnSync(ffmpeg,['-hide_banner','-y',...args],{encoding:'utf8',windowsHide:true,maxBuffer:12e6});assert(r.status===0,r.error||r.stderr);return r;}
(async()=>{const reports=[];
 for(const lang of ['pl','en']){
  const film=path.join(out,`v01-overview-${lang}.mp4`),silent=path.join(out,`v01-overview-${lang}-silent.mp4`);
  const decoded=run(['-i',film,'-f','null','-']);fs.writeFileSync(path.join(work,`validation-${lang}.log`),decoded.stderr);
  assert(/Duration: 00:01:00\.00/.test(decoded.stderr)&&/frame=\s*1800/.test(decoded.stderr),'Expected 60 seconds / 1800 frames');
  assert(/1920x1080/.test(decoded.stderr)&&/30 fps/.test(decoded.stderr)&&/Audio: aac.*48000 Hz, stereo/.test(decoded.stderr),'Unexpected format');
  assert(!/Subtitle:/.test(decoded.stderr),'Unexpected subtitle stream');
  const videoHash=f=>run(['-i',f,'-map','0:v:0','-c','copy','-f','hash','-hash','sha256','-']).stdout.trim();
  assert(videoHash(film)===videoHash(silent),'Music changed picture');
  const edit=JSON.parse(fs.readFileSync(path.join(out,`edit-manifest-${lang}.json`),'utf8'));
  assert(edit.segments[4].privacy==='drawing-viewport-only'&&edit.segments[4].viewportCrop?.x===36&&edit.segments[4].viewportCrop?.y===90&&edit.segments[4].viewportCrop?.width===1740&&edit.segments[4].viewportCrop?.height===750,'CAD must exclude local file panels');
  assert(edit.segments.length===6&&edit.segments.reduce((s,v)=>s+v.outputSeconds,0)===60,'Unexpected edit');
  for(const s of edit.segments){assert(s.speed===1&&s.hold>=4,'Unexpected acceleration or missing pause');assert(sha(path.resolve(__dirname,s.source))===s.sha256,'Source changed');if(s.endStill)assert(sha(path.resolve(__dirname,s.endStill.source))===s.endStill.sha256,'End still changed');}
  assert(sha(path.join(out,`patio-${lang}-free.png`))===sha(path.resolve(__dirname,`../video-v02/output/first-sketch-${lang}-free.png`)),'PNG changed');
  assert(sha(path.join(out,`patio-${lang}.dxf`))===sha(path.resolve(__dirname,`../video-v04/sources/${lang}/patio-${lang}.dxf`)),'DXF changed');
  const html=fs.readFileSync(path.join(out,`preview-${lang}.html`),'utf8');assert(!/<track\b/.test(html),'Duplicate captions');
  for(const match of html.matchAll(/(?:src|poster|href)="([^"#]+)"/g))if(!/^https?:/.test(match[1]))assert(fs.existsSync(path.join(out,match[1])),'Missing preview asset');
  const buffers=[];for(const [i,t] of [3,17,27,37,49,56].entries()){
   const frame=path.join(work,`${lang}-qa-${i}.png`);run(['-ss',String(t),'-i',film,'-frames:v','1',frame]);buffers.push(await sharp(frame).resize(960,540).toBuffer());
  }
  await sharp({create:{width:1920,height:1620,channels:3,background:'#f6f5ef'}}).composite(buffers.map((input,i)=>({input,left:i%2*960,top:Math.floor(i/2)*540}))).png().toFile(path.join(out,`contact-sheet-${lang}.png`));
  const audio=run(['-i',film,'-vn','-af','ebur128=peak=true','-f','null','-']).stderr;
  fs.writeFileSync(path.join(work,`audio-${lang}.log`),audio);const integrated=+audio.match(/Summary:[\s\S]*?I:\s*([\d.-]+) LUFS/)[1];assert(integrated>-28&&integrated<-20,'Unexpected music level');
  reports.push({language:lang,durationSeconds:60,decodedFrames:1800,width:1920,height:1080,fps:30,audio:'AAC stereo 48 kHz',integratedLufs:integrated,videoStreamPreserved:true,sourceHashesVerified:true,pngAndDxfUnchanged:true,sha256:sha(film),bytes:fs.statSync(film).size});console.log('Verified '+lang+': 60 s, 1800 frames, music '+integrated+' LUFS, sources unchanged.');
 }
 fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify({date:'2026-10-30',reports,music:{title:'Easy Lemon (60 second)',artist:'Kevin MacLeod',license:'CC BY 4.0',source:'https://incompetech.com/music/royalty-free/index.html?Search=Search&isrc=USUAN1200077',sha256:sha(path.join(__dirname,'audio/Easy-Lemon-60-second.mp3'))}},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
