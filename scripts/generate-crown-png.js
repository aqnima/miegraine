const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Create PNG buffer from RGBA data
function createPng(width, height, rgbaBuffer) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // bit depth 8
  ihdr.writeUInt8(6, 9); // color type 6 (RGBA)
  ihdr.writeUInt8(0, 10); // compression 0
  ihdr.writeUInt8(0, 11); // filter 0
  ihdr.writeUInt8(0, 12); // interlace 0
  const ihdrChunk = makeChunk('IHDR', ihdr);

  // IDAT chunk (scanlines with filter byte 0)
  const scanlineLength = width * 4 + 1;
  const rawData = Buffer.alloc(height * scanlineLength);

  for (let y = 0; y < height; y++) {
    const scanlineOffset = y * scanlineLength;
    rawData[scanlineOffset] = 0; // Filter None
    rgbaBuffer.copy(rawData, scanlineOffset + 1, y * width * 4, (y + 1) * width * 4);
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);

  // IEND chunk
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const length = data.length;
  const buffer = Buffer.alloc(8 + length + 4);
  buffer.writeUInt32BE(length, 0);
  buffer.write(type, 4);
  data.copy(buffer, 8);

  const crc = crc32(buffer.subarray(4, 8 + length));
  buffer.writeUInt32BE(crc, 8 + length);
  return buffer;
}

// CRC32 implementation
function crc32(buf) {
  let table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    table[n] = c;
  }

  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

// Render Crown Geometry on RGBA Buffer
function renderCrown(size) {
  const buffer = Buffer.alloc(size * size * 4, 0); // Transparent RGBA

  // Blue #3182F6 -> R: 49, G: 130, B: 246
  const R = 49;
  const G = 130;
  const B = 246;

  // Normalized Crown Polygon & Lines (24x24 space)
  // Points: (12, 3.3), (15.4, 8.9), (21.2, 5.5), (18.4, 15.7), (5.8, 15.7), (2.8, 5.5), (8.6, 8.9)
  // Bottom line: (5, 21) to (19, 21)

  const strokeWidth = size / 14;

  function setPixel(x, y, alpha = 255) {
    if (x < 0 || x >= size || y < 0 || y >= size) return;
    const idx = (Math.floor(y) * size + Math.floor(x)) * 4;
    buffer[idx] = R;
    buffer[idx + 1] = G;
    buffer[idx + 2] = B;
    buffer[idx + 3] = Math.min(255, buffer[idx + 3] + alpha);
  }

  function drawLine(x0, y0, x1, y1, width) {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const dist = Math.hypot(dx, dy);
    const steps = Math.ceil(dist * 3);

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const cx = x0 + dx * t;
      const cy = y0 + dy * t;

      const r = width / 2;
      for (let ox = -r; ox <= r; ox += 0.5) {
        for (let oy = -r; oy <= r; oy += 0.5) {
          if (ox * ox + oy * oy <= r * r) {
            setPixel(cx + ox, cy + oy, 255);
          }
        }
      }
    }
  }

  const s = size / 24;

  const p1 = [12 * s, 3.5 * s];
  const p2 = [15.5 * s, 9 * s];
  const p3 = [21.2 * s, 5.8 * s];
  const p4 = [18.4 * s, 16.5 * s];
  const p5 = [5.6 * s, 16.5 * s];
  const p6 = [2.8 * s, 5.8 * s];
  const p7 = [8.5 * s, 9 * s];

  // Crown body lines
  drawLine(p1[0], p1[1], p2[0], p2[1], strokeWidth);
  drawLine(p2[0], p2[1], p3[0], p3[1], strokeWidth);
  drawLine(p3[0], p3[1], p4[0], p4[1], strokeWidth);
  drawLine(p4[0], p4[1], p5[0], p5[1], strokeWidth);
  drawLine(p5[0], p5[1], p6[0], p6[1], strokeWidth);
  drawLine(p6[0], p6[1], p7[0], p7[1], strokeWidth);
  drawLine(p7[0], p7[1], p1[0], p1[1], strokeWidth);

  // Bottom base line
  drawLine(5 * s, 21 * s, 19 * s, 21 * s, strokeWidth);

  return buffer;
}

// Generate PNGs
const sizes = [
  { size: 512, filename: 'icon-512.png' },
  { size: 192, filename: 'icon-192.png' },
  { size: 512, filename: 'logo.png', root: true },
  { size: 256, filename: 'crown-logo.png' },
];

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
const publicDir = path.join(__dirname, '..', 'public');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

sizes.forEach(({ size, filename, root }) => {
  const buffer = renderCrown(size);
  const png = createPng(size, size, buffer);
  const targetPath = root ? path.join(publicDir, filename) : path.join(iconsDir, filename);
  fs.writeFileSync(targetPath, png);
  console.log(`Generated HD Crown PNG: ${targetPath} (${size}x${size})`);
});
