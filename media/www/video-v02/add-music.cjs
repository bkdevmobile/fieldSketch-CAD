const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{spawnSync}=require('node:child_process');
const base=__dirname,out=path.join(base,'output'),ffmpeg=process.env.V02_FFMPEG||'C:/ffmpeg/ffmpeg.exe';
const source=path.resolve(base,'../../../googlePlay/promo-en/audio/Carefree.mp3');
const credit='Music: "Carefree" by Kevin MacLeod (incompetech.com). Licensed under Creative Commons Attribution 4.0: https://creativecommons.org/licenses/by/4.0/. Source: https://remote.incompetech.com/music/royalty-free/index.html?Search=Search&isrc=USUAN1400037. Changes: excerpted, repeated with a 2.5-second crossfade, normalized to quiet background level, 2-second fade-in, 4-second fade-out, encoded to AAC.';
function run(args,log){const r=spawnSync(ffmpeg,['-hide_banner','-y',...args],{encoding:'utf8',windowsHide:true,maxBuffer:12e6});if(log)fs.writeFileSync(log,r.stderr||'');if(r.status!==0||r.error)throw Error(r.error||r.stderr);return r;}
const sha=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
function streamHash(file){return run(['-i',file,'-map','0:v:0','-c','copy','-f','hash','-hash','sha256','-']).stdout.trim();}
fs.mkdirSync(path.join(base,'audio'),{recursive:true});
const audio=path.join(base,'audio','v02-background.m4a');
run(['-i',source,'-filter_complex','[0:a]asplit=2[a][b];[a]atrim=0:200,asetpts=PTS-STARTPTS[first];[b]atrim=0:26.5,asetpts=PTS-STARTPTS[repeat];[first][repeat]acrossfade=d=2.5:c1=tri:c2=tri,atrim=0:224,loudnorm=I=-24:TP=-3:LRA=7:print_format=json,afade=t=in:st=0:d=2,afade=t=out:st=220:d=4[audio]','-map','[audio]','-t','224','-c:a','aac','-b:a','192k','-ar','48000','-ac','2','-metadata','comment='+credit,audio],path.join(base,'audio','render.log'));
fs.writeFileSync(path.join(out,'MUSIC-CREDITS.txt'),credit+'\n\nInclude this attribution in the published video description.\n');
const reports=[];
for(const lang of ['pl','en']){
 const silent=path.join(out,`v02-first-sketch-${lang}.mp4`),music=path.join(out,`v02-first-sketch-${lang}-with-music.mp4`);
 run(['-i',silent,'-i',audio,'-map','0:v:0','-map','1:a:0','-c','copy','-t','224','-metadata','comment='+credit,'-metadata','title=outlineGo V02 '+lang+' — with music','-movflags','+faststart',music],path.join(base,'audio',`mux-${lang}.log`));
 const decoded=run(['-i',music,'-f','null','-'],path.join(out,`validation-music-${lang}.log`));
 if(!/Duration: 00:03:44\.00/.test(decoded.stderr)||!/frame=\s*6720/.test(decoded.stderr)||!/Audio: aac/.test(decoded.stderr))throw Error('Unexpected music video format');
 if(streamHash(silent)!==streamHash(music))throw Error('Video stream changed');
 const file=path.join(out,`preview-${lang}.html`);
 let html=fs.readFileSync(file,'utf8').replaceAll(`v02-first-sketch-${lang}.mp4`,`v02-first-sketch-${lang}-with-music.mp4`);
 html=html.replace(/<p id="music-credit">.*?<\/p>/s,'').replace('</video>','</video><p id="music-credit"><small>Music: <a href="https://remote.incompetech.com/music/royalty-free/index.html?Search=Search&amp;isrc=USUAN1400037">Carefree — Kevin MacLeod (incompetech.com)</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>. Edited, repeated, volume adjusted and faded. <a href="MUSIC-CREDITS.txt">Credits</a>.</small></p>');
 fs.writeFileSync(file,html);
 reports.push({language:lang,file:path.basename(music),durationSeconds:224,decodedFrames:6720,videoStreamIdentical:true,audio:'AAC stereo, 48 kHz, 192 kb/s',sha256:sha(music)});
 console.log('Music added and verified: '+lang);
}
const levels=run(['-i',audio,'-af','ebur128=peak=true','-f','null','-'],path.join(base,'audio','loudness.log'));
fs.writeFileSync(path.join(out,'music-verification.json'),JSON.stringify({source:path.relative(base,source).replaceAll('\\','/'),sourceSha256:sha(source),credit,targetLoudnessLUFS:-24,fadeInSeconds:2,fadeOutSeconds:4,crossfadeSeconds:2.5,reports},null,2));
