const path=require('node:path');
const fs=require('node:fs');
const sharp=require(path.resolve(__dirname,'../../app/node_modules/sharp'));
(async()=>{
 const source=process.argv[2];
 if(!source)throw new Error('Pass generated thumbnail source path.');
 const image=sharp(source).resize(1080,1920,{fit:'cover'}).removeAlpha();
 for(const format of ['jpg','png']){
  const file=path.join(__dirname,`youtube-thumbnail-field-to-cad-1080x1920.${format}`);
  await (format==='jpg'?image.clone().jpeg({quality:92,mozjpeg:true}):image.clone().png({compressionLevel:9})).toFile(file);
  const metadata=await sharp(file).metadata();
  console.log(JSON.stringify({file,width:metadata.width,height:metadata.height,bytes:fs.statSync(file).size}));
 }
})().catch(error=>{console.error(error);process.exitCode=1;});
