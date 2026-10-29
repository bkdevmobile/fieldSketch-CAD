const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const sharp = require('../../../app/node_modules/sharp');
const root = __dirname;
(async () => {
  const report = { date: '2026-10-29', appVersion: '1.0.0', versionCode: 4, serial: 'emulator-5556', files: [] };
  for (const lang of ['pl', 'en']) {
    const files = fs.readdirSync(path.join(root, lang)).filter(f => f.endsWith('.png')).sort();
    if (files.length !== 13) throw new Error(`Expected 13 ${lang} screenshots, found ${files.length}`);
    const tiles = [];
    const plusTiles = [];
    for (const [i, file] of files.entries()) {
      const full = path.join(root, lang, file);
      const bytes = fs.readFileSync(full);
      const metadata = await sharp(bytes).metadata();
      if (metadata.width !== 1080 || metadata.height !== 1920) throw new Error(`Unexpected size: ${file}`);
      report.files.push({ language: lang, file, entitlementMock: i >= 9, width: metadata.width, height: metadata.height, bytes: bytes.length, sha256: crypto.createHash('sha256').update(bytes).digest('hex') });
      const tile = await sharp(bytes).resize(270, 480).png().toBuffer();
      if (i < 9) tiles.push({ input: tile, left: (i % 3) * 278 + 4, top: Math.floor(i / 3) * 488 + 4 });
      else plusTiles.push({ input: tile, left: ((i - 9) % 2) * 278 + 4, top: Math.floor((i - 9) / 2) * 488 + 4 });
    }
    await sharp({ create: { width: 834, height: 1464, channels: 3, background: '#d8ddd8' } }).composite(tiles).png().toFile(path.join(root, `contact-sheet-${lang}.png`));
    await sharp({ create: { width: 556, height: 976, channels: 3, background: '#d8ddd8' } }).composite(plusTiles).png().toFile(path.join(root, `contact-sheet-plus-${lang}.png`));
  }
  report.exports = [];
  for (const lang of ['pl', 'en']) {
    const file = `exports/garden-${lang}.dxf`;
    const bytes = fs.readFileSync(path.join(root, file));
    const text = bytes.toString('utf8').replaceAll('\r', '');
    if (!text.startsWith('0\nSECTION\n') || !text.trimEnd().endsWith('0\nEOF')) throw new Error(`Invalid DXF envelope: ${file}`);
    if (!text.includes('$INSUNITS\n70\n6\n') || !text.includes('LWPOLYLINE\n')) throw new Error(`Expected metre-based polyline DXF: ${file}`);
    report.exports.push({ language: lang, file, entitlementMock: true, unit: 'm', bytes: bytes.length, sha256: crypto.createHash('sha256').update(bytes).digest('hex') });
  }
  fs.writeFileSync(path.join(root, 'verification.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(`Verified ${report.files.length} PNG screenshots, 1080x1920, and ${report.exports.length} DXF exports with SHA256.`);
})().catch(error => { console.error(error); process.exitCode = 1; });
