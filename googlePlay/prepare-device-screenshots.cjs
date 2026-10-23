const fs = require('node:fs');
const path = require('node:path');
const sharp = require('../app/node_modules/sharp');
const root = __dirname;
const devices = [
  {folder:'phone', label:'Telefon', min:320, max:3840, minimumCount:2},
  {folder:'tablet-7', label:'Tablet 7 cali', min:320, max:3840, minimumCount:0},
  {folder:'tablet-10', label:'Tablet 10 cali', min:1080, max:7680, minimumCount:0},
];
const selected = ['01-z-terenu-do-cad', '02-zaplanuj-przestrzen'];
(async()=>{
  const report=[];
  for(const device of devices){
    const outDir=path.join(root,'screenshots',device.folder);
    fs.mkdirSync(outDir,{recursive:true});
    const files=[];
    for(const name of selected){
      const source=path.join(root,'screenshots/portrait',name+'-1080x1920.png');
      const target=path.join(outDir,name+'-1080x1920.png');
      fs.copyFileSync(source,target);
      const m=await sharp(target).metadata();
      const bytes=fs.statSync(target).size;
      const correctRatio=m.width*16===m.height*9||m.width*9===m.height*16;
      if(m.format!=='png'||m.channels!==3||m.hasAlpha||!correctRatio||m.width<device.min||m.height<device.min||m.width>device.max||m.height>device.max||bytes>8000000)throw Error('Invalid screenshot: '+target);
      files.push({file:path.relative(root,target).replaceAll('\\','/'),width:m.width,height:m.height,aspectRatio:'9:16',format:'PNG RGB 24-bit',bytes,under8MB:true});
    }
    if(files.length<device.minimumCount||files.length>8)throw Error('Invalid screenshot count');
    report.push({device:device.label,minSide:device.min,maxSide:device.max,count:files.length,files});
  }
  fs.writeFileSync(path.join(root,'device-screenshots-validation.json'),JSON.stringify({date:'2026-10-23',maxBytes:8000000,devices:report},null,2)+'\n');
  console.log(JSON.stringify(report,null,2));
})().catch(e=>{console.error(e);process.exit(1)});
