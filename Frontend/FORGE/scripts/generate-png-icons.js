import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

// PWA Icon Generator using forge.png
// This script generates all required PWA icons from the forge.png logo

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '../public/icons');
const sourceLogo = path.join(__dirname, '../src/assets/forge.png');

// Create icons directory if it doesn't exist
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
  console.log('✅ Created icons directory:', iconsDir);
}

// Check if forge.png exists
if (!fs.existsSync(sourceLogo)) {
  console.error('❌ Error: forge.png not found in assets directory');
  console.log('Please ensure forge.png exists at:', sourceLogo);
  process.exit(1);
}

console.log('🎨 Generating PWA icons from forge.png...');
console.log('Source:', sourceLogo);
console.log('Output directory:', iconsDir);

// Generate icons using sharp
for (const size of sizes) {
  try {
    await sharp(sourceLogo)
      .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 0 } })
      .png()
      .toFile(path.join(iconsDir, `icon-${size}x${size}.png`));
    console.log(`✅ Generated icon-${size}x${size}.png`);
  } catch (err) {
    console.error(`❌ Error generating icon-${size}x${size}.png:`, err.message);
  }
}

console.log('\n🎉 All icons generated successfully!');
console.log('📁 Icons are located in:', iconsDir);
console.log('🔄 Refresh your browser to see the install prompt.');
