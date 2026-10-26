const fs = require('node:fs');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const root = path.resolve(__dirname, '../..');
const sharp = require(path.join(root, 'app/node_modules/sharp'));
const base = __dirname;
const frames = path.join(base, 'frames');
fs.mkdirSync(frames, {recursive: true});
const ffmpeg = process.env.PROMO_FFMPEG || 'C:/ffmpeg/ffmpeg.exe';
const uri = (file, mime = 'image/png') => `data:${mime};base64,${fs.readFileSync(file).toString('base64')}`;
const logo = uri(path.join(root, 'public/assets/logo.svg'), 'image/svg+xml');
const brand = `<image href="${logo}" x="64" y="72" width="66" height="66"/><text x="146" y="125" font-family="Arial" font-size="54" font-weight="700" letter-spacing="-2">outlineGo</text>`;
function shell(body, step) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920"><defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#f7f5ed"/><stop offset="1" stop-color="#ecebdc"/></linearGradient><clipPath id="photo"><rect x="60" y="510" width="960" height="1030" rx="38"/></clipPath></defs><rect width="1080" height="1920" fill="url(#bg)"/><g fill="#103d2e">${brand}${body}</g><g>${[0,1,2,3].map(i=>`<rect x="${64+i*242}" y="1834" width="226" height="6" rx="3" fill="${i<=step?'#1b684b':'#d5ddcf'}"/>`).join('')}</g></svg>`;
}
const title = (a,b) => `<text x="64" y="310" font-family="Georgia" font-size="98" font-weight="700" letter-spacing="-4">${a}</text><text x="64" y="414" font-family="Georgia" font-size="98" font-weight="700" letter-spacing="-4">${b}</text><rect x="66" y="446" width="185" height="8" rx="4" fill="#f6c63c"/>`;
const label = (n,text) => `<circle cx="89" cy="1646" r="28" fill="#f6c63c"/><text x="89" y="1657" text-anchor="middle" font-family="Arial" font-size="30" font-weight="700">${n}</text><text x="137" y="1659" font-family="Arial" font-size="36" font-weight="700">${text}</text>`;
const note = text => `<text x="64" y="1733" font-family="Arial" font-size="29" fill="#526959">${text}</text>`;
async function run() {
  const field = uri(path.join(root, 'googlePlay/workflow-en/sources/field.png'));
  const cad = uri(path.join(root, 'googlePlay/workflow-en/sources/cad.png'));
  const app = uri(path.join(root, 'googlePlay/workflow-en/sources/app-phone.png'));
  const badge = uri(path.join(root, 'public/assets/google-play-badge-en.png'));
  const scenes = [
    shell(title('Start in','the field.') + `<image href="${field}" x="60" y="510" width="960" height="1030" preserveAspectRatio="xMidYMid slice" clip-path="url(#photo)"/>` + label(1,'Measure in the field') + note('A quick sketch. Right where you are.'), 0),
    shell(title('Keep your','outline.') + `<rect x="60" y="510" width="960" height="1030" rx="38" fill="#dfe8d6"/><rect x="267" y="535" width="546" height="982" rx="46" fill="#17221d"/><image href="${app}" x="280" y="550" width="520" height="952" preserveAspectRatio="xMidYMid meet"/>` + label(2,'Export your sketch') + note('Export PNG. Get DXF with Plus.'), 1),
    shell(title('Finish at','your desk.') + `<image href="${cad}" x="60" y="510" width="960" height="1030" preserveAspectRatio="xMidYMid slice" clip-path="url(#photo)"/><rect x="88" y="540" width="253" height="56" rx="28" fill="#103d2e"/><text x="214" y="578" text-anchor="middle" font-family="Arial" font-size="28" fill="#fffdf6" font-weight="700">Desktop CAD</text>` + label(3,'Refine on your computer') + note('Your outline. Ready for the next step.') + `<text x="64" y="1785" font-family="Arial" font-size="23" fill="#526959">Illustrative CAD scene · DXF requires Plus</text>`, 2),
    shell(`<image href="${logo}" x="412" y="346" width="256" height="256"/><text x="540" y="718" text-anchor="middle" font-family="Arial" font-size="105" font-weight="700" letter-spacing="-5">outlineGo</text><text x="540" y="905" text-anchor="middle" font-family="Georgia" font-size="91" font-weight="700" letter-spacing="-3">From field to</text><text x="540" y="1009" text-anchor="middle" font-family="Georgia" font-size="91" font-weight="700" letter-spacing="-3">a finished plan.</text><rect x="230" y="1050" width="620" height="9" rx="4" fill="#f6c63c"/><image href="${badge}" x="240" y="1218" width="600" height="178"/><text x="540" y="1506" text-anchor="middle" font-family="Arial" font-size="32" fill="#526959">Sketch outdoors. Refine at your desk.</text>`, 3)
  ];
  for (let i=0; i<scenes.length; i++) await sharp(Buffer.from(scenes[i])).png().toFile(path.join(frames, `scene-${i+1}.png`));
  const thumbs = await Promise.all(scenes.map(svg=>sharp(Buffer.from(svg)).resize(270,480).toBuffer()));
  await sharp({create:{width:1080,height:480,channels:3,background:'#f7f5ed'}}).composite(thumbs.map((input,i)=>({input,left:i*270,top:0}))).png().toFile(path.join(base,'storyboard.png'));
  const args = ['-hide_banner','-y'];
  for(let i=1;i<=4;i++) args.push('-loop','1','-framerate','30','-i', path.join(frames,`scene-${i}.png`));
  // Keep text and screenshots stationary; integer zoompan crops caused visible jitter.
  const filters = [129,129,129,99].map((count,i)=>`[${i}:v]trim=end_frame=${count},setpts=PTS-STARTPTS,setsar=1,format=yuv420p[v${i}]`);
  filters.push('[v0][v1]xfade=transition=fade:duration=0.4:offset=3.9[x1]','[x1][v2]xfade=transition=fade:duration=0.4:offset=7.8[x2]','[x2][v3]xfade=transition=fade:duration=0.4:offset=11.7,fade=t=in:st=0:d=0.25,fade=t=out:st=14.75:d=0.25[out]');
  args.push('-filter_complex_threads','2','-filter_complex',filters.join(';'),'-map','[out]','-t','15','-an','-c:v','libx264','-preset','medium','-crf','20','-threads','4','-pix_fmt','yuv420p','-movflags','+faststart',path.join(base,'outlineGo-promo-15s-1080x1920.mp4'));
  const result = spawnSync(ffmpeg,args,{stdio:['ignore','ignore',fs.openSync(path.join(base,'render.log'),'w')],windowsHide:true});
  if(result.error) throw result.error;
  if(result.status!==0) throw new Error('FFmpeg failed. See render.log');
  console.log('Rendered 15-second 1080x1920 H.264 promo.');
}
run().catch(error=>{console.error(error);process.exitCode=1;});
