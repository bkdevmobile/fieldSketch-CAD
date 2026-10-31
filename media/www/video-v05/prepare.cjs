const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{DatabaseSync}=require('node:sqlite');
const assert=(p,m)=>{if(!p)throw Error(m);};
const sha=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
function prepare(lang){
 const source=path.join(__dirname,'sources',lang),dbFile=path.join(source,'after/fieldsketch.db'),db=new DatabaseSync(dbFile,{readOnly:true});
 const rows=db.prepare('SELECT body FROM projects').all();db.close();assert(rows.length===1,'Expected only the recorded room');
 const p=JSON.parse(rows[0].body);assert(p.name===(lang==='pl'?'Salon':'Room'),'Unexpected room name');
 assert(p.closed&&p.mode==='manual'&&p.closureObservationId===null,'Expected manual outline and calculated closure');
 const expected=[[0,0],[5,0],[5,4],[0,4]];assert(p.points.length===4,'Expected four corners');
 p.points.forEach((q,i)=>assert(Math.abs(q.x-expected[i][0])<1e-8&&Math.abs(q.y-expected[i][1])<1e-8,'Unexpected room geometry'));
 const active=p.activeObservationIds.map(id=>p.observations.find(o=>o.id===id));assert(active.every(o=>o.lengthSource==='manual'),'Expected manual lengths');
 assert(p.observations.some(o=>o.lengthM===4.8)&&active.at(-1).lengthM===5&&active.at(-1).supersedesId,'Missing saved 4.8 -> 5 correction');
 let perimeter=0,area=0;for(let i=0;i<4;i++){const a=p.points[i],b=p.points[(i+1)%4];perimeter+=Math.hypot(b.x-a.x,b.y-a.y);area+=a.x*b.y-a.y*b.x;}area=Math.abs(area/2);
 assert(Math.abs(perimeter-18)<1e-8&&Math.abs(area-20)<1e-8,'Unexpected perimeter or area');
 const original=path.join(source,`outlinego-${p.id}-r${p.geometryRevision}-free.png`);assert(fs.existsSync(original),'Missing original PNG');
 const target=path.join(__dirname,'output',`room-${lang}-free.png`);fs.copyFileSync(original,target);fs.writeFileSync(path.join(source,'project.json'),JSON.stringify(p,null,2));
 return {projectId:p.id,name:p.name,mode:p.mode,closed:p.closed,points:p.points.map(({x,y})=>({x,y})),perimeterMetres:perimeter,areaSquareMetres:area,closure:'calculated',savedCorrection:'4.8 -> 5 m',pngSha256:sha(original),databaseSha256:sha(dbFile)};
}
module.exports={prepare};
if(require.main===module)for(const lang of process.argv.slice(2).length?process.argv.slice(2):['pl','en'])console.log(JSON.stringify({language:lang,...prepare(lang)},null,2));
