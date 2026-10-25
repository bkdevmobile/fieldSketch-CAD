const fs=require('node:fs'),path=require('node:path'),{spawn}=require('node:child_process'),{pathToFileURL}=require('node:url'),crypto=require('node:crypto');
const base=__dirname,root=path.resolve(base,'../..'),sharp=require(path.join(root,'app/node_modules/sharp'));
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const profiles=[{id:'phone',width:1080,height:1920},{id:'tablet-7',width:1920,height:1080},{id:'tablet-10',width:2560,height:1440}];
(async()=>{
 const profile=path.join(root,'artifacts/workflow-render-browser');fs.mkdirSync(profile,{recursive:true});
 const portFile=path.join(profile,'DevToolsActivePort');fs.rmSync(portFile,{force:true});
 const child=spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',['--headless','--disable-gpu','--no-first-run','--no-default-browser-check','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],{windowsHide:true,stdio:'ignore'});let ws;
 try{
  for(let i=0;i<100&&!fs.existsSync(portFile);i++)await pause(100);
  const port=fs.readFileSync(portFile,'utf8').split('\n')[0];const tabs=await(await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise((resolve,reject)=>{ws.addEventListener('open',resolve,{once:true});ws.addEventListener('error',reject,{once:true})});
  let id=0;const pending=new Map();ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id&&pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(new Error(JSON.stringify(m.error))):p.resolve(m.result)}});
  const send=(method,params={})=>new Promise((resolve,reject)=>{pending.set(++id,{resolve,reject});ws.send(JSON.stringify({id,method,params}))});await send('Page.enable');
  const report=[];
  for(const p of profiles){
   await send('Emulation.setDeviceMetricsOverride',{width:p.width,height:p.height,deviceScaleFactor:1,mobile:false});
   await send('Page.navigate',{url:pathToFileURL(path.join(base,`layout-${p.id}.html`)).href});
   for(let i=0;i<60;i++){const r=await send('Runtime.evaluate',{expression:'document.readyState',returnByValue:true});if(r.result.value==='complete')break;await pause(100)}
   await send('Runtime.evaluate',{expression:'Promise.all([document.fonts.ready,...[...document.images].map(i=>i.decode())])',awaitPromise:true});
   const metrics=await send('Runtime.evaluate',{expression:"JSON.stringify({viewport:innerWidth,scroll:document.documentElement.scrollWidth,missing:[...document.images].filter(i=>!i.naturalWidth).map(i=>i.src),screen:document.querySelector('.device img').getBoundingClientRect().toJSON()})",returnByValue:true});
   const parsed=JSON.parse(metrics.result.value);if(parsed.missing.length||parsed.scroll>p.width)throw new Error('Bad layout: '+JSON.stringify(parsed));
   const capture=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
   const png=await sharp(Buffer.from(capture.data,'base64')).removeAlpha().png({compressionLevel:9}).toBuffer();
   const metadata=await sharp(png).metadata();if(metadata.width!==p.width||metadata.height!==p.height||png.length>8000000)throw new Error('Play format mismatch');
   const folder=path.join(base,p.id);fs.mkdirSync(folder,{recursive:true});const file=path.join(folder,'03-from-field-to-plan.png');fs.writeFileSync(file,png);
   const gallery=path.join(root,'googlePlay/en/screenshots',p.id);fs.mkdirSync(gallery,{recursive:true});fs.writeFileSync(path.join(gallery,'03-from-field-to-plan.png'),png);
   report.push({profile:p.id,file:path.relative(root,file).replaceAll('\\','/'),width:p.width,height:p.height,bytes:png.length,sha256:crypto.createHash('sha256').update(png).digest('hex'),actualScreenBounds:parsed.screen});
  }
  fs.writeFileSync(path.join(base,'verification.json'),JSON.stringify({created:'2026-10-25',language:'en',format:'PNG RGB',files:report},null,2)+'\n');console.log(JSON.stringify(report));
  await send('Browser.close');
 }finally{if(ws)ws.close();child.kill();}
})().catch(e=>{console.error(e);process.exit(1)});
