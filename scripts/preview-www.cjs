const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../public');
const redirects=require('../firebase.json').hosting.redirects||[];
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8','.dxf':'application/dxf'};
http.createServer((req,res)=>{
  let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);res.end();return;}
  const redirect=redirects.find(rule=>rule.source===pathname);
  if(redirect){res.writeHead(redirect.type,{Location:redirect.destination});res.end();return;}
  let file=path.resolve(root,'.'+pathname);
  if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  if(fs.existsSync(file)&&fs.statSync(file).isDirectory()){
    if(!pathname.endsWith('/')){res.writeHead(301,{Location:pathname+'/'});res.end();return;}
    file=path.join(file,'index.html');
  }
  const exists=fs.existsSync(file)&&fs.statSync(file).isFile();
  if(!exists)file=path.join(root,'404.html');
  const size = fs.statSync(file).size;
  const headers = {'Content-Type':path.extname(file)==='.mp4'?'video/mp4':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store','Accept-Ranges':'bytes'};
  const range = req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
  if (exists && range) {
    const start = Number(range[1]), end = range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
    if (start >= size || start > end) { res.writeHead(416, {'Content-Range':`bytes */${size}`});res.end();return; }
    res.writeHead(206, {...headers,'Content-Length':end-start+1,'Content-Range':`bytes ${start}-${end}/${size}`});
    if(req.method==='HEAD')res.end();else fs.createReadStream(file,{start,end}).pipe(res);
    return;
  }
  res.writeHead(exists?200:404,{...headers,'Content-Length':size});
  if(req.method==='HEAD'){res.end();return;}
  fs.createReadStream(file).pipe(res);
}).listen(4173,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4173/pl/'));
