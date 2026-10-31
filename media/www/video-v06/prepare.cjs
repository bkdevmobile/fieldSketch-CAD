const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{DatabaseSync}=require('node:sqlite');
const assert=(p,m)=>{if(!p)throw Error(m);};
const sha=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
function prepare(lang){const dir=path.join(__dirname,'sources',lang),dbFile=path.join(dir,'after/fieldsketch.db'),db=new DatabaseSync(dbFile,{readOnly:true}),rows=db.prepare('SELECT body FROM projects').all();db.close();assert(rows.length===1,'Expected one captured project');const p=JSON.parse(rows[0].body);assert(JSON.stringify(p)===JSON.stringify(JSON.parse(fs.readFileSync(path.join(dir,'project.json'),'utf8'))),'Project snapshot differs from SQLite');
 assert(p.closed&&p.mode==='relative'&&p.points.length===4,'Expected sensor-mode closed outline');
 const points=[[0,0],[6,0],[6,4.5],[0,4.5]];p.points.forEach((q,i)=>assert(Math.abs(q.x-points[i][0])<1e-7&&Math.abs(q.y-points[i][1])<1e-7,'Unexpected points'));
 const active=p.activeObservationIds.map(id=>p.observations.find(o=>o.id===id));assert(active.length===3,'Expected three sensor sides');
 active.forEach((o,i)=>assert(o.lengthSource==='steps'&&o.stepCount===[8,6,8][i]&&o.detectedSteps===o.stepCount&&o.stepLengthCm===75&&o.stepMeasurementId.startsWith('demo-')&&o.capture?.stable&&o.capture.accuracy===3,'Missing simulated sensor measurement'));
 assert(p.closureObservationId===null,'Expected calculated closure');
 const png=path.join(dir,`outlinego-${p.id}-r${p.geometryRevision}-free.png`);assert(fs.existsSync(png),'Missing original PNG');fs.copyFileSync(png,path.join(__dirname,'output',`camera-steps-${lang}-free.png`));
 return {projectId:p.id,name:p.name,mode:p.mode,points:p.points.map(({x,y})=>({x,y})),steps:active.map(o=>o.stepCount),detectedSteps:active.map(o=>o.detectedSteps),stepLengthCm:75,lengthsMetres:active.map(o=>o.lengthM),perimeterMetres:21,areaSquareMetres:27,closure:'calculated',simulated:true,pngSha256:sha(png)};
}
module.exports={prepare};if(require.main===module)for(const lang of process.argv.slice(2).length?process.argv.slice(2):['pl','en'])console.log(JSON.stringify({language:lang,...prepare(lang)},null,2));
