const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Create public and public/icons directories
const iconsDir = path.join(process.cwd(), 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Function to generate a basic uncompressed PNG
function createSimplePng(width, height, r, g, b) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // 8-bit depth
  ihdrData.writeUInt8(6, 9); // RGBA color type
  ihdrData.writeUInt8(0, 10); // compression
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // interlace

  const ihdr = makeChunk('IHDR', ihdrData);

  // Raw Image Data (with filter byte 0 at start of each line)
  const lineSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * lineSize);

  for (let y = 0; y < height; y++) {
    const lineStart = y * lineSize;
    rawData[lineStart] = 0; // Filter: None

    for (let x = 0; x < width; x++) {
      const px = lineStart + 1 + x * 4;
      
      // Calculate distance from center for subtle rounded squircle
      const dx = Math.abs(x - width / 2) / (width / 2);
      const dy = Math.abs(y - height / 2) / (height / 2);
      const dist = Math.pow(dx, 4) + Math.pow(dy, 4);

      if (dist <= 0.85) {
        // Brand Blue #3182F6 (49, 130, 246)
        // White Letter 'M' in the center
        const nx = x / width;
        const ny = y / height;
        const isM = (
          (nx >= 0.28 && nx <= 0.36 && ny >= 0.3 && ny <= 0.7) || // Left pillar
          (nx >= 0.64 && nx <= 0.72 && ny >= 0.3 && ny <= 0.7) || // Right pillar
          (nx >= 0.36 && nx <= 0.5 && Math.abs((ny - 0.3) - (nx - 0.36) * 1.5) < 0.08) || // Left diagonal
          (nx >= 0.5 && nx <= 0.64 && Math.abs((ny - 0.3) - (0.64 - nx) * 1.5) < 0.08) // Right diagonal
        );

        if (isM && ny >= 0.3 && ny <= 0.7) {
          rawData[px] = 255;
          rawData[px + 1] = 255;
          rawData[px + 2] = 255;
          rawData[px + 3] = 255;
        } else {
          rawData[px] = 49;   // R
          rawData[px + 1] = 130; // G
          rawData[px + 2] = 246; // B
          rawData[px + 3] = 255; // A
        }
      } else {
        // Transparent
        rawData[px] = 0;
        rawData[px + 1] = 0;
        rawData[px + 2] = 0;
        rawData[px + 3] = 0;
      }
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idat = makeChunk('IDAT', compressedData);

  // IEND chunk
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function makeChunk(type, data) {
  const length = data.length;
  const chunk = Buffer.alloc(8 + length + 4);
  chunk.writeUInt32BE(length, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);

  const crc = crc32(chunk.subarray(4, 8 + length));
  chunk.writeUInt32BE(crc, 8 + length);
  return chunk;
}

// CRC32 table & function
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// Generate icon-192.png and icon-512.png
const png192 = createSimplePng(192, 192, 49, 130, 246);
fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), png192);

const png512 = createSimplePng(512, 512, 49, 130, 246);
fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), png512);

// Favicon
fs.writeFileSync(path.join(process.cwd(), 'public', 'favicon.ico'), png192);

console.log('Successfully generated public/icons/icon-192.png and icon-512.png!');
