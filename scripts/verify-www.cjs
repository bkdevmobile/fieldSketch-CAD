const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../public');
const origin='https://outlinego-27ab5.web.app';
const routes={pl:['/pl/','/pl/jak-to-dziala/','/pl/szkic-ogrodu/','/pl/eksport-dxf/'],en:['/en/','/en/how-it-works/','/en/garden-sketch/','/en/dxf-export/']};
const resolveFile=pathname=>path.join(root,pathname.endsWith('/')?pathname+'index.html':pathname);
const attr=(tag,key)=>tag.match(new RegExp('(?:^|\\s)'+key+'="([^"]*)"'))?.[1];
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
let preview;
(async()=>{
  if(process.argv.includes('--serve')){
    preview=require('node:child_process').spawn(process.execPath,[path.join(__dirname,'preview-www.cjs')],{stdio:['ignore','pipe','pipe'],windowsHide:true});
    await new Promise((resolve,reject)=>{preview.stdout.once('data',resolve);preview.once('error',reject);preview.once('exit',code=>reject(Error('Preview exited: '+code)));});
  }
  const titles=new Set(),descriptions=new Set(),references=new Set();
  let links=0,images=0;
  for(const [lang,pages] of Object.entries(routes))for(const [i,route] of pages.entries()){
    const html=fs.readFileSync(resolveFile(route),'utf8');
    assert(html.includes(`<html lang="${lang}">`),route+' language');
    assert.equal((html.match(/<h1[ >]/g)||[]).length,1,route+' H1');
    const title=html.match(/<title>(.*?)<\/title>/)?.[1];assert(title&&!titles.has(title),'Unique title');titles.add(title);
    const desc=attr(html.match(/<meta name="description"[^>]*>/)?.[0]||'','content');assert(desc&&!descriptions.has(desc),'Unique description');descriptions.add(desc);
    assert(html.includes(`<link rel="canonical" href="${origin}${route}">`),'Canonical '+route);
    assert(!/<meta\b[^>]*name="robots"[^>]*content="[^"]*(?:noindex|nofollow)/i.test(html),'Marketing page remains indexable '+route);
    const schemaBlocks=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
    assert.equal(schemaBlocks.length,1,'One structured data block '+route);
    const schema=JSON.parse(schemaBlocks[0][1]);
    assert.equal(schema['@context'],'https://schema.org');
    if(i===0){
      assert.equal(schema['@type'],'WebSite');
      assert.equal(schema.url,origin+'/');
      assert.equal(schema.name,'outlineGo');
      assert.deepEqual(schema.inLanguage,['pl','en']);
    }else{
      assert.equal(schema['@type'],'BreadcrumbList');
      assert.equal(schema.itemListElement.length,2);
      const crumbs=html.match(/<nav class="breadcrumbs"[\s\S]*?<\/nav>/)?.[0];
      assert(crumbs,'Visible breadcrumbs '+route);
      for(const [index,item] of schema.itemListElement.entries()){
        assert.equal(item['@type'],'ListItem');
        assert.equal(item.position,index+1);
        assert.equal(item.item,origin+(index===0?pages[0]:route));
        assert(crumbs.includes(item.name),'Structured breadcrumb matches visible name '+route);
      }
    }
    for(const code of ['pl','en'])assert(html.includes(`<link rel="alternate" hreflang="${code}" href="${origin}${routes[code][i]}">`),'Reciprocal language links');
    const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,'Duplicate IDs '+route);
    for(const tag of html.match(/<(?:a|img|source|link|script)\b[^>]*>/g)||[]){
      const targets=[attr(tag,'href'),attr(tag,'src'),...(attr(tag,'srcset')||'').split(',').map(s=>s.trim().split(' ')[0])].filter(Boolean);
      for(const target of targets){
        const u=new URL(target.replaceAll('&amp;','&'),origin+route);if(u.origin!==origin)continue;
        const file=resolveFile(decodeURIComponent(u.pathname));assert(fs.existsSync(file),'Missing local target: '+target+' on '+route);references.add(file);links++;
        if(u.hash&&file.endsWith('.html')){const targetHtml=fs.readFileSync(file,'utf8');assert(targetHtml.includes(`id="${u.hash.slice(1)}"`),'Missing anchor '+target);}
      }
      if(tag.startsWith('<img')&&attr(tag,'src')){assert(attr(tag,'alt')!==undefined,'Missing alt');assert(Number(attr(tag,'width'))>0&&Number(attr(tag,'height'))>0,'Missing image dimensions');images++;}
    }
    assert(!/TODO|Lorem ipsum|Coming soon/.test(html),'Placeholder content');
  }
  const legalPairs=[['privacy.html','/pl/prywatnosc/'],['terms.html','/pl/regulamin/'],['measurement-notice.html','/pl/ograniczenia-pomiarow/']];
  for(const [en,pl] of legalPairs){
    const english=fs.readFileSync(path.join(root,en),'utf8');
    const polish=fs.readFileSync(resolveFile(pl),'utf8');
    assert(english.includes(`href="${pl}" lang="pl" hreflang="pl"`),'English legal page links to Polish counterpart');
    assert(polish.includes(`href="/${en}" lang="en" hreflang="en"`),'Polish legal page links to English counterpart');
    for(const tag of ['h1','h2','p','li','address'])assert.equal((polish.match(new RegExp('<'+tag+'(?:\\s[^>]*)?>','g'))||[]).length,(english.match(new RegExp('<'+tag+'(?:\\s[^>]*)?>','g'))||[]).length,'Translated legal content structure: '+en+' '+tag);
    for(const [route,html,lang] of [['/'+en,english,'en'],[pl,polish,'pl']]){
      assert(html.includes(`<html lang="${lang}">`),'Legal page language '+route);
      assert(html.includes('<meta name="robots" content="noindex">'),'Legal page indexing preference '+route);
      assert(html.includes('<p class="legal-meta">'),'Legal effective/update date '+route);
      assert(!/class="draft"|Draft for review|Wersja robocza|Remaining configuration to confirm|Pozostała konfiguracja do potwierdzenia|com\.bk\.dev\.mobile\.outlinego|version code 4|kod wersji 4/.test(html),'No internal drafting notes '+route);
      assert.equal((html.match(/<h1[ >]/g)||[]).length,1,'Legal H1 '+route);
      for(const match of html.matchAll(/(?:href|src)="([^"]+)"/g)){
        const u=new URL(match[1].replaceAll('&amp;','&'),origin+route);
        if(u.origin!==origin)continue;
        const file=resolveFile(decodeURIComponent(u.pathname));
        assert(fs.existsSync(file),'Legal local target '+match[1]);
        if(u.hash)assert(fs.readFileSync(file,'utf8').includes(`id="${u.hash.slice(1)}"`),'Legal anchor '+match[1]);
      }
    }
  }
  console.log('Verified 6 legal pages: PL/EN links, dates, no internal drafting notes, matching content structure and local links.');
  const sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
  const locs=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
  assert.deepEqual(locs,Object.values(routes).flat().map(r=>origin+r),'Sitemap covers exactly the eight pages');
  const hosting=require('../firebase.json').hosting;
  for(const old of ['/','/index.html'])assert(hosting.redirects.some(r=>r.source===old&&r.destination==='/en/'&&r.type===301),'Legacy homepage redirect');
  const manifest=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../media/www/stage1-completion/manifest.json'),'utf8'));
  let media=0;
  for(const file of references){if(!file.includes(path.join('assets','stage1')))continue;const relative=path.relative(path.join(root,'assets/stage1'),file).replaceAll('\\','/');const source=manifest.files.find(f=>f.file===relative);assert(source,'Media provenance '+relative);assert.equal(hash(fs.readFileSync(file)),source.sha256,'Copied original differs: '+relative);media++;}
  const checkHttp=process.argv.includes('--http')||process.argv.includes('--serve');
  if(checkHttp){
    const local='http://127.0.0.1:4173';
    for(const route of Object.values(routes).flat()){const r=await fetch(local+route);assert.equal(r.status,200,'HTTP '+route);assert((await r.text()).includes('<h1>'));}
    for(const old of ['/','/index.html']){const r=await fetch(local+old,{redirect:'manual'});assert.equal(r.status,301);assert.equal(r.headers.get('location'),'/en/');}
    assert.equal((await fetch(local+'/missing-page-test/')).status,404);
    for(const lang of ['pl','en'])for(const file of [`garden-${lang}.dxf`,`garden-${lang}-free.png`]){const r=await fetch(local+'/assets/stage1/downloads/'+file);assert.equal(r.status,200);const localFile=path.join(root,'assets/stage1/downloads',file);assert.equal(hash(Buffer.from(await r.arrayBuffer())),hash(fs.readFileSync(localFile)),'Download integrity');}
  }
  console.log(`Verified 8 pages, unique metadata, language pairs, ${links} local references, ${images} image elements and ${media} unchanged media files${checkHttp?'; HTTP 200/301/404 and four downloads verified':''}.`);
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{if(preview)preview.kill();});
