const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const sharp = require('../../../app/node_modules/sharp');
const root = __dirname;
(async () => {
  const report = { date: '2026-10-29', appVersion: '1.0.0', versionCode: 4, serial: 'emulator-5556', files: [] };
  for (const lang of ['pl', 'en']) {
    const files = fs.readdirSync(path.join(root, lang)).filter(f => f.endsWith('.png')).sort();
    if (files.length !== 9) throw new Error(`Expected 9 ${lang} screenshots, found ${files.length}`);
    const tiles = [];
    for (const [i, file] of files.entries()) {
      const full = path.join(root, lang, file);
      const bytes = fs.readFileSync(full);
      const metadata = await sharp(bytes).metadata();
      if (metadata.width !== 1080 || metadata.height !== 1920) throw new Error(`Unexpected size: ${file}`);
      report.files.push({ language: lang, file, width: metadata.width, height: metadata.height, bytes: bytes.length, sha256: crypto.createHash('sha256').update(bytes).digest('hex') });
      tiles.push({ input: await sharp(bytes).resize(270, 480).png().toBuffer(), left: (i % 3) * 278 + 4, top: Math.floor(i / 3) * 488 + 4 });
    }
    await sharp({ create: { width: 834, height: 1464, channels: 3, background: '#d8ddd8' } }).composite(tiles).png().toFile(path.join(root, `contact-sheet-${lang}.png`));
  }
  fs.writeFileSync(path.join(root, 'verification.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(`Verified ${report.files.length} PNG screenshots, 1080x1920, with SHA256.`);
})().catch(error => { console.error(error); process.exitCode = 1; });
