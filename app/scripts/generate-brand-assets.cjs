// Vector implementation of the selected outlineGo concept.
// Run from app/: npm run assets:brand. PNGs and SVGs are checked in for prebuild.
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const mark = require('../assets/brand/mark.json');
const directory = path.join(__dirname, '../assets/brand');
function graphic(color) {
  return `<path d="${mark.path}" fill="none" stroke="${color}" stroke-width="${mark.strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>` +
    mark.rings.map(p => `<circle cx="${p.cx}" cy="${p.cy}" r="${mark.ringRadius}" fill="none" stroke="${color}" stroke-width="${mark.ringStrokeWidth}"/>`).join('') +
    `<circle cx="${mark.endpoint.cx}" cy="${mark.endpoint.cy}" r="${mark.endpoint.r}" fill="${color}"/>`;
}
function svg(size, glyphSize, color, background) {
  const offset = (size - glyphSize) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
    (background ? `<rect width="${size}" height="${size}" fill="${background}"/>` : '') +
    `<g transform="translate(${offset} ${offset}) scale(${glyphSize / 128})">${graphic(color)}</g></svg>`;
}
async function main() {
  fs.mkdirSync(directory, { recursive: true });
  const sources = [
    ['logo-mark', 128, 128, '#1B684B'],
    ['icon', 1024, 720, '#FFFEFA', '#1B684B'],
    ['adaptive-foreground', 1024, 600, '#FFFEFA'],
    ['adaptive-monochrome', 1024, 600, '#FFFFFF'],
    ['splash-mark', 512, 416, '#1B684B'],
  ];
  for (const [name, size, glyphSize, color, background] of sources) {
    const source = svg(size, glyphSize, color, background);
    fs.writeFileSync(path.join(directory, name + '.svg'), source + '\n');
    await sharp(Buffer.from(source)).png().toFile(path.join(directory, name + '.png'));
    console.log(`${name}: ${size}x${size}`);
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
