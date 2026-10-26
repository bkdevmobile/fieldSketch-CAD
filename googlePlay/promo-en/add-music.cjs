const fs=require('node:fs');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const sharp=require(path.resolve(__dirname,'../../app/node_modules/sharp'));
const base=__dirname;
const credit='Music: Carefree by Kevin MacLeod (incompetech.com). Licensed under CC BY 4.0: https://creativecommons.org/licenses/by/4.0/. Source: https://www.incompetech.com/music/royalty-free/index.html?isrc=USUAN1400037. Changes: 15-second excerpt, volume normalization, fade-in and fade-out.';
(async()=>{
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920"><g text-anchor="middle" font-family="Arial" font-size="27" fill="#526959"><text x="540" y="1638">Music: “Carefree” — Kevin MacLeod</text><text x="540" y="1680">incompetech.com · CC BY 4.0</text><text x="540" y="1722">creativecommons.org/licenses/by/4.0/</text><text x="540" y="1764">15-second excerpt · fades and level adjusted</text></g></svg>`;
  await sharp(Buffer.from(svg)).png().toFile(path.join(base,'music-credits.png'));
  fs.writeFileSync(path.join(base,'MUSIC-CREDITS.txt'),credit+'\n\nUse this attribution in the published video description as well.\n');
  const args=['-hide_banner','-y','-i',path.join(base,'outlineGo-promo-15s-1080x1920-v2.mp4'),'-i',path.join(base,'audio/Carefree.mp3'),'-loop','1','-framerate','30','-i',path.join(base,'music-credits.png'),'-filter_complex_threads','2','-filter_complex',"[2:v]format=rgba,fade=t=in:st=11.9:d=0.3:alpha=1,fade=t=out:st=14.75:d=0.25:alpha=1[credits];[0:v][credits]overlay=shortest=1:format=auto,format=yuv420p[video];[1:a]atrim=0:15,asetpts=PTS-STARTPTS,loudnorm=I=-16:TP=-1.5:LRA=7,afade=t=in:st=0:d=0.4,afade=t=out:st=13.7:d=1.3[audio]",'-map','[video]','-map','[audio]','-t','15','-c:v','libx264','-preset','medium','-crf','20','-threads','4','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-ar','48000','-metadata','title=outlineGo — From field to a finished plan','-metadata',`comment=${credit}`,'-movflags','+faststart',path.join(base,'outlineGo-promo-15s-with-music.mp4')];
  const result=spawnSync(process.env.PROMO_FFMPEG||'C:/ffmpeg/ffmpeg.exe',args,{stdio:['ignore','ignore',fs.openSync(path.join(base,'music-render.log'),'w')],windowsHide:true});
  if(result.error)throw result.error;
  if(result.status!==0)throw new Error('FFmpeg failed; see music-render.log');
  console.log('Music video rendered.');
})().catch(error=>{console.error(error);process.exitCode=1;});
