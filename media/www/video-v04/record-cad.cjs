const fs=require('node:fs'),path=require('node:path'),{spawn}=require('node:child_process');
const [name,title,seconds]=process.argv.slice(2);if(!name||!title)throw Error('Usage: record-cad.cjs name window-title');
const log=fs.openSync(path.join(__dirname,'sources',name+'.log'),'w');
const p=spawn('C:/ffmpeg/ffmpeg.exe',['-hide_banner','-y','-f','gdigrab','-framerate','15','-draw_mouse','1','-i','title='+title,...(seconds?['-t',seconds]:[]),'-vf','pad=ceil(iw/2)*2:ceil(ih/2)*2','-c:v','libx264','-preset','ultrafast','-crf','18','-pix_fmt','yuv420p',path.join(__dirname,'sources',name+'.mp4')],{windowsHide:true,stdio:['pipe','ignore',log]});
process.stdin.on('data',data=>p.stdin.write(data));
p.on('exit',code=>{fs.writeFileSync(path.join(__dirname,'sources',name+'-capture.json'),JSON.stringify({name,title,exitCode:code,endedAt:new Date().toISOString()},null,2));process.exit(code||0);});
p.on('error',e=>{console.error(e);process.exit(1);});
console.log('Recording only window: '+title+'; send q to finish.');
