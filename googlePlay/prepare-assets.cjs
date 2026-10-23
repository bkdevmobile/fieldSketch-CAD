const fs = require('node:fs');
const path = require('node:path');
const sharp = require('../app/node_modules/sharp');
const root = __dirname;
const repo = path.dirname(root);
const variants = [
  {
    id: '01-z-terenu-do-cad', background: '#123D2D',
    portrait: 'googlePlay/sources/01-z-terenu-do-cad-portrait.png',
    wide: 'sources/01-z-terenu-do-cad-wide.png',
  },
  {
    id: '02-zaplanuj-przestrzen', background: '#F5F4EE',
    portrait: 'googlePlay/sources/02-zaplanuj-przestrzen-portrait.png',
    wide: 'sources/02-zaplanuj-przestrzen-wide.png',
  },
];
async function exportImage(input, output, width, height, background) {
  fs.mkdirSync(path.dirname(output), { recursive: true });
  await sharp(input).resize(width, height, {fit:'contain', background})
    .flatten({background}).toColourspace('srgb').removeAlpha()
    .png({palette:false, compressionLevel:9}).toFile(output);
  const m = await sharp(output).metadata();
  if(m.width !== width || m.height !== height || m.channels !== 3 || m.hasAlpha || m.format !== 'png') throw new Error('Invalid export: ' + output);
  return {file:path.relative(root,output).replaceAll('\\','/'), width, height, format:m.format, channels:m.channels, hasAlpha:m.hasAlpha, bytes:fs.statSync(output).size};
}
(async()=>{
  const report=[];
  for(const v of variants){
    report.push(await exportImage(path.join(repo,v.portrait),path.join(root,'screenshots/portrait',v.id+'-1080x1920.png'),1080,1920,v.background));
    report.push(await exportImage(path.join(root,v.wide),path.join(root,'screenshots/landscape',v.id+'-1920x1080.png'),1920,1080,v.background));
    report.push(await exportImage(path.join(root,v.wide),path.join(root,'feature-graphic',v.id+'-1024x500.png'),1024,500,v.background));
  }
  const icon=path.join(root,'icon/outlineGo-512x512.png');
  fs.mkdirSync(path.dirname(icon),{recursive:true});
  await sharp(path.join(repo,'app/assets/brand/icon.png')).resize(512,512).toColourspace('srgb').ensureAlpha().png({palette:false,compressionLevel:9}).toFile(icon);
  const m=await sharp(icon).metadata();
  if(m.width!==512||m.height!==512||m.channels!==4||fs.statSync(icon).size>1024*1024)throw new Error('Invalid icon');
  report.push({file:'icon/outlineGo-512x512.png',width:512,height:512,format:m.format,channels:m.channels,hasAlpha:m.hasAlpha,bytes:fs.statSync(icon).size});
  fs.writeFileSync(path.join(root,'validation.json'),JSON.stringify({date:'2026-10-23',files:report},null,2)+'\n');
  console.log(JSON.stringify(report,null,2));
})().catch(e=>{console.error(e);process.exit(1)});
