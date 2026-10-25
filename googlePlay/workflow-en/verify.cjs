const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const base=__dirname,root=path.resolve(base,'../..'),sharp=require(path.join(root,'app/node_modules/sharp'));
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
(async()=>{
 const expected=[['phone',1080,1920],['tablet-7',1920,1080],['tablet-10',2560,1440]],results=[];
 for(const [profile,width,height]of expected){
  const file=path.join(base,profile,'03-from-field-to-plan.png'),gallery=path.join(root,'googlePlay/en/screenshots',profile,'03-from-field-to-plan.png'),source=path.join(root,'googlePlay/emulator-screenshots/en',profile,'03-summary.png'),copy=path.join(base,'sources',`app-${profile}.png`),m=await sharp(file).metadata(),bytes=fs.statSync(file).size;
  if(m.width!==width||m.height!==height||m.format!=='png'||m.channels!==3||bytes>8000000)throw new Error('Invalid output: '+profile);
  if(hash(file)!==hash(gallery)||hash(source)!==hash(copy))throw new Error('Source or gallery mismatch: '+profile);
  results.push({profile,width,height,bytes,sha256:hash(file),sourceScreenshotUnchanged:true,galleryCopyIdentical:true});
 }
 const webSource=path.join(root,'public/assets/workflow-app-screen.png'),original=path.join(root,'googlePlay/emulator-screenshots/en/phone/03-summary.png');if(hash(webSource)!==hash(original))throw new Error('Web screenshot changed');
 const report={created:'2026-10-25',files:results,webScreenshotUnchanged:true,webScreenshotSha256:hash(webSource)};fs.writeFileSync(path.join(base,'final-validation.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
})().catch(e=>{console.error(e);process.exit(1)});
