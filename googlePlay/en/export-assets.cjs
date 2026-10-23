const fs=require('node:fs');
const path=require('node:path');
const sharp=require('../../app/node_modules/sharp');
const root=__dirname;
const items=[
 {id:'01-from-field-to-cad',bg:'#123D2D'},
 {id:'02-plan-your-space',bg:'#F5F4EE'},
];
async function output(source,file,width,height,bg){
 const target=path.join(root,file);
 fs.mkdirSync(path.dirname(target),{recursive:true});
 await sharp(path.join(root,'sources',source)).resize(width,height,{fit:'contain',background:bg}).flatten({background:bg}).toColourspace('srgb').removeAlpha().png({palette:false,compressionLevel:9}).toFile(target);
 const m=await sharp(target).metadata(),bytes=fs.statSync(target).size;
 if(m.width!==width||m.height!==height||m.channels!==3||m.hasAlpha||m.format!=='png'||bytes>8000000)throw Error('Invalid '+file);
 return {file,width,height,format:'PNG RGB 24-bit',hasAlpha:false,bytes};
}
(async()=>{
 const report=[];
 for(const item of items){
  for(const device of ['phone','tablet-7','tablet-10'])report.push(await output(item.id+'-portrait.png','screenshots/'+device+'/'+item.id+'-1080x1920.png',1080,1920,item.bg));
  report.push(await output(item.id+'-wide.png','screenshots/landscape/'+item.id+'-1920x1080.png',1920,1080,item.bg));
  report.push(await output(item.id+'-wide.png','feature-graphic/'+item.id+'-1024x500.png',1024,500,item.bg));
 }
 fs.writeFileSync(path.join(root,'validation.json'),JSON.stringify({language:'en',maxBytes:8000000,files:report},null,2)+'\n');
 console.log(JSON.stringify(report));
})().catch(e=>{console.error(e);process.exit(1)});
