const {spawnSync}=require('node:child_process');
const fs=require('node:fs');
const path=require('node:path');
const result=spawnSync(process.env.PROMO_FFMPEG||'C:/ffmpeg/ffmpeg.exe',['-v','error','-i',path.join(__dirname,'outlineGo-promo-15s-1080x1920.mp4'),'-vf',"select='eq(n,30)+eq(n,90)+eq(n,150)+eq(n,210)+eq(n,270)+eq(n,330)+eq(n,390)+eq(n,435)',scale=270:480,format=gray",'-fps_mode','vfr','-f','rawvideo','pipe:1'],{maxBuffer:3000000,windowsHide:true});
if(result.status!==0)throw new Error(result.stderr.toString());
const size=270*480;
if(result.stdout.length!==8*size)throw new Error('Missing sample frames');
const scenes=[];
for(let scene=0;scene<4;scene++){
  const a=result.stdout.subarray(scene*2*size,(scene*2+1)*size),b=result.stdout.subarray((scene*2+1)*size,(scene*2+2)*size);
  let sum=0;for(let i=0;i<size;i++)sum+=Math.abs(a[i]-b[i]);
  const meanAbsolutePixelDifference=sum/size;
  scenes.push({scene:scene+1,meanAbsolutePixelDifference,stable:meanAbsolutePixelDifference<0.5});
}
fs.writeFileSync(path.join(__dirname,'stability.json'),JSON.stringify({description:'Decoded grayscale differences during each stationary scene, in 0–255 pixel units. Minor differences are expected from lossy H.264 encoding.',scenes},null,2)+'\n');
console.log(JSON.stringify(scenes));
if(scenes.some(s=>!s.stable))process.exitCode=1;
