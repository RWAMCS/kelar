const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgFile = path.resolve(__dirname, '../public/icon.svg');
const out192 = path.resolve(__dirname, '../public/icon-192.png');
const out512 = path.resolve(__dirname, '../public/icon-512.png');

async function generate() {
  await sharp(svgFile).resize(192, 192).png().toFile(out192);
  await sharp(svgFile).resize(512, 512).png().toFile(out512);
  console.log('Icons generated successfully.');
}
generate();
