const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const sharp=require('../../../app/node_modules/sharp');
const root=__dirname;
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
(async()=>{
  const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));
  for(const entry of [...manifest.files,...manifest.sources]){
    const full=path.resolve(root,entry.file),bytes=fs.readFileSync(full);
    if(hash(bytes)!==entry.sha256)throw Error('Hash mismatch: '+entry.file);
    if(entry.width){const m=await sharp(bytes).metadata();if(m.width!==entry.width||m.height!==entry.height)throw Error('Size mismatch: '+entry.file);}
  }
  for(const lang of ['pl','en']){
    for(const name of ['14-edit-length','15-edit-note']){
      const m=await sharp(path.join(root,'screenshots',lang,name+'.png')).metadata();
      if(m.width!==1080||m.height!==1920)throw Error('Invalid screenshot dimensions');
    }
    const a=fs.readFileSync(path.join(root,'downloads',`garden-${lang}.dxf`));
    const b=fs.readFileSync(path.join(root,'../app-screenshots/exports',`garden-${lang}.dxf`));
    if(!a.equals(b))throw Error('DXF is not original');
    const text=a.toString('utf8').replaceAll('\r','');
    if(!text.includes('$INSUNITS\n70\n6\n'))throw Error('DXF unit is not metre');
    const lines=text.trim().split('\n'),pairs=[];
    for(let i=0;i<lines.length;i+=2)pairs.push([lines[i],lines[i+1]]);
    const start=pairs.findIndex(([c,v])=>c==='0'&&v==='LWPOLYLINE');
    const vertices=[];for(let i=start+1;i<pairs.length&&pairs[i][0]!=='0';i++)if(pairs[i][0]==='10')vertices.push([Number(pairs[i][1]),Number(pairs[i+1][1])]);
    const expected=[[0,0],[8,0],[8,5],[5,5],[5,8],[0,8]];
    if(vertices.length!==6||vertices.some((p,i)=>p.some((v,j)=>Math.abs(v-expected[i][j])>1e-8)))throw Error('SVG coordinates differ from DXF');
    let area=0,perimeter=0;vertices.forEach((p,i)=>{const q=vertices[(i+1)%6];area+=p[0]*q[1]-q[0]*p[1];perimeter+=Math.hypot(p[0]-q[0],p[1]-q[1]);});
    if(Math.abs(area/2)!==55||perimeter!==32)throw Error('Unexpected garden measurements');
  }
  console.log(`Verified ${manifest.files.length} media files, ${manifest.sources.length} source references, screenshot sizes and matching DXF/SVG geometry (32 m / 55 m²).`);
})().catch(e=>{console.error(e);process.exitCode=1;});
