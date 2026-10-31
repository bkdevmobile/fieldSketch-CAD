const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const sharp = require('../app/node_modules/sharp');
const root = path.resolve(__dirname, '..');
const dest = path.join(root, 'public/assets/stage2');
const files = [];
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
async function add(source, file, width) {
  const input = fs.readFileSync(path.join(root, source));
  const target = path.join(dest, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const bytes = width ? await sharp(input).resize({ width, withoutEnlargement: true }).webp({ quality: 83 }).toBuffer() : input;
  fs.writeFileSync(target, bytes);
  const dimensions = /\.(png|webp)$/.test(file) ? await sharp(bytes).metadata() : {};
  files.push({ file, source, sourceSha256: hash(input), sha256: hash(bytes), bytes: bytes.length, ...(dimensions.width ? { width: dimensions.width, height: dimensions.height } : {}) });
}
(async () => {
  await add('media/www/video-v05/sources/room-measurement.png', 'room-960.webp', 960);
  await add('media/www/video-v05/sources/room-measurement.png', 'room-1440.webp', 1440);
  for (const lang of ['pl', 'en']) {
    for (const [name, source] of Object.entries({
      'room-review': 'media/www/video-v05/sources/' + lang + '/02-review.png',
      'room-correction': 'media/www/video-v05/sources/' + lang + '/04-correction.png',
      'room-summary': 'media/www/video-v05/sources/' + lang + '/05-summary-stable.png',
      'sketches': 'googlePlay/emulator-screenshots/' + lang + '/phone/01-sketches.png',
      'camera': 'media/www/video-v06/sources/' + lang + '/02-direction.png',
      'steps': 'media/www/video-v06/sources/' + lang + '/03-steps-stopped.png'
    })) await add(source, `${lang}/${name}.webp`, 720);
    await add(`media/www/video-v05/output/room-${lang}-free.png`, `${lang}/room-free.png`);
    for (const [id, name] of [['01', 'overview'], ['02', 'first-sketch'], ['03', 'garden'], ['04', 'dxf-to-cad'], ['05', 'room'], ['06', 'camera-steps']]) {
      const filename = `v${id}-${name}-${lang}${id === '02' ? '-with-music' : ''}.mp4`;
      await add(`media/www/video-v${id}/output/${filename}`, `${lang}/${name}.mp4`);
      await add(`media/www/video-v${id}/output/poster-${lang}.webp`, `${lang}/${name}-poster.webp`);
    }
  }
  const manifest = { date: '2026-10-31', note: 'Actual app captures and original exports. Room illustration generated with ImageGen; V06 directions, steps and virtual camera scene are simulated. See video READMEs for provenance.', files };
  fs.mkdirSync(path.join(root, 'media/www/stage2'), { recursive: true });
  fs.writeFileSync(path.join(root, 'media/www/stage2/manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  console.log(`Prepared ${files.length} stage 2 assets with source hashes.`);
})().catch(error => { console.error(error); process.exitCode = 1; });
