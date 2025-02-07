import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const inputPath = join(__dirname, '../public/MysticBalls-logo.png');
const outputPath = join(__dirname, '../public/favicon.png');

async function optimizeFavicon() {
  try {
    await sharp(inputPath)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(outputPath);
    
    console.log('Favicon optimized successfully!');
  } catch (error) {
    console.error('Error optimizing favicon:', error);
  }
}

optimizeFavicon();
