/* Generates Servehub PWA icons as PNGs using only Node built-ins (zlib).
   Run: node scripts/make-icons.js
   Output: frontend/icons/icon-192.png, icon-512.png, maskable-512.png, apple-touch-icon.png */
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const OUT = path.join(__dirname, '..', 'frontend', 'icons');

/* ---------------- PNG encoder (RGBA, 8-bit, no deps) ---------------- */
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();
const crc32 = buf => {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
};
const png = (size, px) => {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const rows = [];
  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 4);
    row[0] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      const i = y * size + x;
      row[1 + x * 4] = px[i * 4];
      row[2 + x * 4] = px[i * 4 + 1];
      row[3 + x * 4] = px[i * 4 + 2];
      row[4 + x * 4] = px[i * 4 + 3];
    }
    rows.push(row);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(Buffer.concat(rows), { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
};

/* ---------------- drawing helpers ---------------- */
const lerp = (a, b, t) => a + (b - a) * t;
const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const C_TOP = hex('#2563EB'), C_BOT = hex('#0EA5E9'), C_WHITE = [255, 255, 255];

// distance from point (px,py) to polyline segments (round caps via end-point clamping)
const segDist = (px, py, segs) => {
  let best = Infinity;
  for (const [x1, y1, x2, y2] of segs) {
    const dx = x2 - x1, dy = y2 - y1;
    const L2 = dx * dx + dy * dy;
    let t = L2 ? ((px - x1) * dx + (py - y1) * dy) / L2 : 0;
    t = Math.max(0, Math.min(1, t));
    const cx = x1 + t * dx, cy = y1 + t * dy;
    best = Math.min(best, Math.hypot(px - cx, py - cy));
  }
  return best;
};

// The Servehub mark — a "zap/bolt" zig-zag (mirrors the favicon SVG).
const MARK = (size, scale) => {
  const c = size / 2, s = (size / 512) * scale;
  const m = (x, y) => [c + (x - 256) * s, c + (y - 256) * s];
  const A = m(160, 352), B = m(160, 160), C = m(352, 352), D = m(352, 160);
  return [[A[0], A[1], B[0], B[1]], [B[0], B[1], C[0], C[1]], [C[0], C[1], D[0], D[1]]];
};

// rounded-square "inside" test (radius r)
const inRound = (x, y, size, r) => {
  const minX = r, minY = r, maxX = size - r, maxY = size - r;
  if (x < minX || x > maxX || y < minY || y > maxY) return false;
  const cx = Math.max(minX, Math.min(x, maxX)), cy = Math.max(minY, Math.min(y, maxY));
  return Math.hypot(x - cx, y - cy) <= r;
};

function drawIcon(size, { maskable = false, scale = 1, halfStroke = 24 } = {}) {
  const px = new Uint8Array(size * size * 4);
  const segs = MARK(size, scale);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      let inside = maskable ? true : inRound(x + 0.5, y + 0.5, size, size * 0.22);
      if (!inside) { px[i + 3] = 0; continue; }
      const t = y / (size - 1);
      const r = Math.round(lerp(C_TOP[0], C_BOT[0], t));
      const g = Math.round(lerp(C_TOP[1], C_BOT[1], t));
      const b = Math.round(lerp(C_TOP[2], C_BOT[2], t));
      const d = segDist(x + 0.5, y + 0.5, segs);
      if (d < halfStroke * (size / 512)) { px[i] = C_WHITE[0]; px[i + 1] = C_WHITE[1]; px[i + 2] = C_WHITE[2]; }
      else { px[i] = r; px[i + 1] = g; px[i + 2] = b; }
      px[i + 3] = 255;
    }
  }
  return px;
}

fs.mkdirSync(OUT, { recursive: true });
const jobs = [
  ['icon-192.png', drawIcon(192, { halfStroke: 24 })],
  ['icon-512.png', drawIcon(512, { halfStroke: 24 })],
  ['maskable-512.png', drawIcon(512, { maskable: true, scale: 0.62, halfStroke: 24 })],
  ['apple-touch-icon.png', drawIcon(180, { halfStroke: 24 })],
];
for (const [name, px] of jobs) {
  const size = Math.round(Math.sqrt(px.length / 4));
  fs.writeFileSync(path.join(OUT, name), png(size, px));
  console.log('wrote frontend/icons/' + name + ' (' + size + 'x' + size + ')');
}
