const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'../../..');
const sharp=require(path.join(root,'app/node_modules/sharp'));
const ffmpeg=process.env.SHORTS_FFMPEG||'C:/ffmpeg/ffmpeg.exe';
const config=require('./config.cjs');
const output=path.join(__dirname,'output'),work=path.join(__dirname,'rendered');
for(const folder of [output,work])fs.mkdirSync(folder,{recursive:true});
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const esc=text=>String(text).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
function run(args,log){const result=spawnSync(ffmpeg,['-hide_banner','-y',...args],{encoding:'utf8',windowsHide:true,maxBuffer:20e6});if(log)fs.writeFileSync(log,result.stderr||'');if(result.error||result.status!==0)throw Error(result.error||result.stderr);return result;}
const text=(value,x,y,size,attrs='')=>`<text x="${x}" y="${y}" font-family="Arial" font-size="${size}" ${attrs}>${esc(value)}</text>`;
function background(film,segment){
 const phone=segment.layout==='phone';
 let canvas=`<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920"><rect width="1080" height="1920" fill="#f6f5ef"/><g fill="#19372c">${text('outlineGo',72,65,35,'font-weight="700"')}${segment.title.map((line,index)=>text(line,72,129+index*61,49,'font-weight="700" letter-spacing="-1"')).join('')}`;
 if(phone)canvas+='<rect x="54" y="214" width="828" height="1444" rx="31" fill="#19372c"/>';
 if(segment.layout==='photo')canvas+='<rect x="64" y="325" width="900" height="760" rx="24" fill="#e6ecdf"/>'+text('5 × 4 m',80,1310,100,'font-weight="700"')+text('A simple room outline',80,1370,34,'fill="#58685f"');
 if(segment.layout==='cad')canvas+=text('DXF → LibreCAD',72,350,35,'fill="#1b684b"')+text('4 × 3 m',72,1200,72,'font-weight="700"');
 if(segment.layout==='units')canvas+=text('Match the unit',72,480,48,'font-weight="700"')+text('to your exported sketch.',72,540,36,'fill="#58685f"');
 canvas+=text('Get outlineGo · Android',72,1752,33,'font-weight="700" fill="#1b684b"')+text(film.id==='s04'?'DXF export with Plus':'Sketch, check and keep the outline.',72,1804,25,'fill="#58685f"')+'</g></svg>';
 return canvas;
}
function credits(film,total){return `Music: "${film.music.title}" by Kevin MacLeod (incompetech.com). Licensed under Creative Commons Attribution 4.0: https://creativecommons.org/licenses/by/4.0/. Source: ${film.music.source}. Changes: ${total}-second excerpt, quiet volume normalization, 1.5-second fade-in and 3-second fade-out, AAC encoding.`;}
async function render(film){
 let offset=0;const segments=[],list=[];
 for(const [index,segment] of film.segments.entries()){
   const source=path.join(root,segment.file),bg=path.join(work,`${film.id}-${index}-bg.png`),target=path.join(work,`${film.id}-${index}.mp4`);
   await sharp(Buffer.from(background(film,segment))).png().toFile(bg);
   const moving=segment.file.endsWith('.mp4');
   const args=[...(moving?[]:['-loop','1','-framerate','30']),'-i',source,'-loop','1','-framerate','30','-i',bg];
   if(segment.endStill)args.push('-loop','1','-framerate','30','-i',path.join(root,segment.endStill));
   const crop=segment.crop?`crop=${segment.crop.width}:${segment.crop.height}:${segment.crop.x}:${segment.crop.y},`:'';
   let filter=`[0:v]${moving?`trim=start=${segment.start}:duration=${segment.length},setpts=PTS-STARTPTS,`:''}fps=30,tpad=stop_mode=clone:stop_duration=${segment.duration},trim=duration=${segment.duration},setsar=1[raw];`;
   const layout=segment.layout;
   if(layout==='phone'){
     filter+='[raw]scale=792:1408:flags=lanczos[screen];[1:v][screen]overlay=72:232:shortest=1[base];';
     if(segment.endStill)filter+=`[2:v]scale=792:1408:flags=lanczos[still];[base][still]overlay=72:232:enable='gte(t,${segment.duration-4})'[final];`;
     else filter+='[base]null[final];';
   }else if(layout==='export'){
     filter+='[raw]scale=870:1360:force_original_aspect_ratio=decrease:flags=lanczos,pad=870:1360:(ow-iw)/2:(oh-ih)/2:color=0xf6f5ef[screen];[1:v][screen]overlay=64:255:shortest=1[final];';
   }else if(layout==='photo'){
     const zoom=`1.025-0.025*(0.5-0.5*cos(PI*min(on,179)/179))`;
     filter+=`[raw]scale=900:700:force_original_aspect_ratio=increase:flags=lanczos,crop=900:700,format=yuv444p,perspective=x0='W*(1-(${zoom}))/2':y0='H*(1-(${zoom}))/2':x1='W*(1+(${zoom}))/2':y1='H*(1-(${zoom}))/2':x2='W*(1-(${zoom}))/2':y2='H*(1+(${zoom}))/2':x3='W*(1+(${zoom}))/2':y3='H*(1+(${zoom}))/2':sense=destination:eval=frame:interpolation=cubic[screen];[1:v][screen]overlay=64:350:shortest=1[final];`;
   }else if(layout==='cad'){
     filter+='[raw]'+(segment.detailCrop?'split=2[main][detail];[main]':'')+crop+'scale=900:662:flags=lanczos[screen];[1:v][screen]overlay=64:430:shortest=1[base];';
     if(segment.detailCrop){const d=segment.detailCrop;filter+=`[detail]crop=${d.width}:${d.height}:${d.x}:${d.y},scale=900:138:flags=lanczos[status];[base][status]overlay=64:1300:shortest=1[final];`;}
     else filter+='[base]null[final];';
   }else if(layout==='units')filter+=`[raw]${crop}scale=900:360:flags=lanczos[screen];[1:v][screen]overlay=64:650:shortest=1[final];`;
   else throw Error('Unknown layout');
   filter+='[final]format=yuv420p[v]';
   run([...args,'-filter_complex_threads','2','-filter_complex',filter,'-map','[v]','-t',String(segment.duration),'-an','-c:v','libx264','-preset','fast','-crf','17','-threads','4','-r','30','-color_primaries','bt709','-color_trc','bt709','-colorspace','bt709',target],path.join(work,`${film.id}-${index}.log`));
   list.push(target);segments.push({...segment,outputStart:offset,speed:1,hold:moving?segment.duration-segment.length:segment.duration,sourceSha256:hash(source),...(segment.endStill?{endStillSha256:hash(path.join(root,segment.endStill))}:{})});offset+=segment.duration;
   console.log(`Rendered ${film.id} scene ${index+1}/${film.segments.length}`);
 }
 const concat=path.join(work,film.id+'-concat.txt');fs.writeFileSync(concat,list.map(file=>`file '${file.replaceAll('\\','/')}'`).join('\n'));
 const base=`${film.id}-${film.slug}-en`,silent=path.join(output,base+'-silent.mp4'),video=path.join(output,base+'.mp4'),attribution=credits(film,offset);
 run(['-f','concat','-safe','0','-i',concat,'-c','copy','-movflags','+faststart',silent]);
 run(['-i',silent,'-i',path.join(root,film.music.file),'-map','0:v:0','-map','1:a:0','-c:v','copy','-af',`atrim=0:${offset},asetpts=PTS-STARTPTS,loudnorm=I=-24:TP=-3:LRA=7,afade=t=in:st=0:d=1.5,afade=t=out:st=${offset-3}:d=3`,'-t',String(offset),'-c:a','aac','-b:a','192k','-ar','48000','-ac','2','-metadata','title='+film.title,'-metadata','comment='+film.disclosure+' '+attribution,'-movflags','+faststart',video],path.join(work,film.id+'-music.log'));
 run(['-ss','2','-i',video,'-frames:v','1',path.join(output,base+'-cover.png')]);
 await sharp(path.join(output,base+'-cover.png')).webp({quality:90}).toFile(path.join(output,base+'-cover.webp'));
 const description=film.summary+'\n\n'+film.disclosure+'\n\nGet outlineGo for Android: https://play.google.com/store/apps/details?id=com.bk.dev.mobile.outlinego\nApp website: https://outlinego-27ab5.web.app/en/\n\n'+attribution+'\n\n'+film.hashtags.map(tag=>'#'+tag).join(' ');
 const metadata={id:film.id,file:base+'.mp4',title:film.title,description,tags:film.tags,language:'en',durationSeconds:offset,hasGeneratedScene:!!(film.simulated||film.generatedIllustration),publicationStatus:'prepared-not-uploaded'};
 fs.writeFileSync(path.join(output,base+'-description.txt'),description+'\n');
 fs.writeFileSync(path.join(output,base+'-metadata.json'),JSON.stringify(metadata,null,2)+'\n');
 fs.writeFileSync(path.join(output,base+'-edit-manifest.json'),JSON.stringify({width:1080,height:1920,fps:30,duration:offset,disclosure:film.disclosure,segments,music:{...film.music,sha256:hash(path.join(root,film.music.file))},credits:attribution},null,2)+'\n');
 console.log(`Completed ${base}: ${offset} s`);
 return metadata;
}
(async()=>{
 const selected=process.argv.slice(2),result=[];
 for(const film of config.filter(film=>!selected.length||selected.includes(film.id)))result.push(await render(film));
 fs.writeFileSync(path.join(output,selected.length?'metadata-selected.json':'metadata.json'),JSON.stringify(result,null,2)+'\n');
 if(!selected.length){
  const md='# YouTube Shorts — English metadata\n\nPrepared 2026-11-01. Not uploaded. The existing Firebase URL remains in descriptions until the ordered custom domain is connected.\n\n'+result.map(meta=>`## ${meta.id.toUpperCase()} — ${meta.durationSeconds} s\n\nFile: [${meta.file}](${meta.file})\n\n**Title:** ${meta.title}\n\n**Tags:** ${meta.tags.join(', ')}\n\n**Description:**\n\n\`\`\`text\n${meta.description}\n\`\`\`\n`).join('\n');
  fs.writeFileSync(path.join(output,'METADATA.md'),md);
  const html=`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>outlineGo — English Shorts</title><style>body{margin:32px auto;padding:0 24px;max-width:1100px;background:#f6f5ef;color:#19372c;font:16px/1.6 system-ui}main{display:grid;grid-template-columns:1fr 1fr;gap:36px}video{width:100%;max-height:720px;border-radius:16px;background:#19372c}a{color:inherit}h2{font-size:22px;line-height:1.3}pre{white-space:pre-wrap;overflow-wrap:anywhere}details{margin:15px 0}@media(max-width:700px){main{grid-template-columns:1fr}}</style><h1>outlineGo — English Shorts</h1><p>Four vertical edits. Original app interface, quiet music and publication metadata. Not uploaded.</p><main>${result.map(meta=>`<article><h2>${esc(meta.title)}</h2><video controls playsinline preload="none" poster="${meta.file.replace('.mp4','-cover.webp')}"><source src="${meta.file}" type="video/mp4"></video><p>${esc(config.find(f=>f.id===meta.id).disclosure)}</p><a href="${meta.file}">MP4 · ${meta.durationSeconds} s</a> · <a href="${meta.file.replace('.mp4','-description.txt')}">Description</a><details><summary>Title, description and tags</summary><pre>${esc(meta.title+'\n\n'+meta.description+'\n\nTags: '+meta.tags.join(', '))}</pre></details></article>`).join('')}</main></html>`;
  fs.writeFileSync(path.join(output,'preview.html'),html);
 }
})().catch(error=>{console.error(error);process.exitCode=1;});
