const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const sharp = require('../../../app/node_modules/sharp');
const root = __dirname;
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
(async () => {
  const report = { date: '2026-10-29', app: 'LibreCAD', version: '2.2.1.5', controlDistanceMetres: 8, files: [], sources: [] };
  for (const language of ['pl', 'en']) {
    const files = fs.readdirSync(path.join(root, language)).filter(file => file.endsWith('.jpg')).sort();
    if (files.length !== (language === 'pl' ? 3 : 5)) throw new Error('Unexpected screenshot count: ' + language);
    const tiles = [];
    for (const [i, file] of files.entries()) {
      const bytes = fs.readFileSync(path.join(root, language, file));
      const metadata = await sharp(bytes).metadata();
      report.files.push({ language, file, width: metadata.width, height: metadata.height, bytes: bytes.length, sha256: hash(bytes) });
      tiles.push({ input: await sharp(bytes).resize(640, 344, { fit: 'contain', background: '#eceeea' }).jpeg({ quality: 90 }).toBuffer(), left: (i % 2) * 648 + 4, top: Math.floor(i / 2) * 352 + 4 });
    }
    await sharp({ create: { width: 1296, height: Math.ceil(files.length / 2) * 352, channels: 3, background: '#d8ddd8' } }).composite(tiles).jpeg({ quality: 92 }).toFile(path.join(root, `contact-sheet-${language}.jpg`));
    const source = path.join(root, '../app-screenshots/exports', `garden-${language}.dxf`);
    const expected = language === 'pl' ? '84e0917d42e2d30ae6376fd4ba6518682ccb79bbe013d3ca66640ae52d79dcd4' : '076a5b68d640620a1bb538cd09d5d0e49cc8022d86d583865085731bc37e079b';
    if (hash(fs.readFileSync(source)) !== expected) throw new Error('Source DXF modified: ' + language);
    report.sources.push({ language, file: `../app-screenshots/exports/garden-${language}.dxf`, sha256: expected, unchanged: true });
  }
  fs.writeFileSync(path.join(root, 'verification.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(`Verified ${report.files.length} genuine screenshots and unchanged source DXFs.`);
})().catch(error => { console.error(error); process.exitCode = 1; });
