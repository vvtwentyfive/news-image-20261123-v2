// news-image-20261123 v2 — "23 NOVEMBER 2026: THE WORLD IN ONE DAY"
// Node 22, stdlib only. Code-renders a dense 1024x1024 PNG newspaper front
// page summing up Monday 23 November 2026. No network, no Date, no random:
// every run writes byte-identical output (zlib level 9, fixed data).
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { deflateSync } from 'node:zlib';

const W = 1024;
const H = 1024;

// ---------- palette ----------
const INK = [245, 247, 250, 255];      // near-white text
const MUT = [154, 167, 189, 255];      // muted grey-blue
const BG = [10, 15, 30, 255];          // deep navy
const PANEL = [19, 30, 54, 255];       // panel navy
const PANEL2 = [23, 37, 66, 255];      // lighter panel
const RED = [230, 57, 70, 255];        // accent red
const GOLD = [244, 180, 0, 255];       // accent gold
const GREEN = [34, 197, 94, 255];      // up green
const LINE = [52, 68, 102, 255];       // hairline
const DARK = [8, 12, 24, 255];

// ---------- 5x7 bitmap font (rows of 5 bits, '#' = on) ----------
const G: Record<string, string[]> = {
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
  C: ['01110', '10001', '10000', '10000', '10000', '10001', '01110'],
  D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  F: ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
  G: ['01110', '10001', '10000', '10111', '10001', '10001', '01111'],
  H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  I: ['01110', '00100', '00100', '00100', '00100', '00100', '01110'],
  J: ['00111', '00010', '00010', '00010', '00010', '10010', '01100'],
  K: ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
  L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
  M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
  N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
  Q: ['01110', '10001', '10001', '10001', '10101', '10010', '01101'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
  V: ['10001', '10001', '10001', '10001', '10001', '01010', '00100'],
  W: ['10001', '10001', '10001', '10101', '10101', '10101', '01010'],
  X: ['10001', '10001', '01010', '00100', '01010', '10001', '10001'],
  Y: ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
  Z: ['11111', '00001', '00010', '00100', '01000', '10000', '11111'],
  '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
  '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  '2': ['01110', '10001', '00001', '00110', '01000', '10000', '11111'],
  '3': ['11111', '00010', '00100', '00010', '00001', '10001', '01110'],
  '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  '5': ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
  '6': ['00110', '01000', '10000', '11110', '10001', '10001', '01110'],
  '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  '9': ['01110', '10001', '10001', '01111', '00001', '00010', '01100'],
  ' ': ['00000', '00000', '00000', '00000', '00000', '00000', '00000'],
  '.': ['00000', '00000', '00000', '00000', '00000', '01100', '01100'],
  ',': ['00000', '00000', '00000', '00000', '01100', '00100', '01000'],
  ':': ['00000', '01100', '01100', '00000', '01100', '01100', '00000'],
  ';': ['00000', '01100', '01100', '00000', '01100', '00100', '01000'],
  '!': ['00100', '00100', '00100', '00100', '00100', '00000', '00100'],
  '?': ['01110', '10001', '00001', '00110', '00100', '00000', '00100'],
  "'": ['00100', '00100', '01000', '00000', '00000', '00000', '00000'],
  '-': ['00000', '00000', '00000', '01110', '00000', '00000', '00000'],
  '+': ['00000', '00100', '00100', '01110', '00100', '00100', '00000'],
  '%': ['11001', '11010', '00010', '00100', '01000', '01011', '10011'],
  $: ['00100', '01111', '10100', '01110', '00101', '11110', '00100'],
  '/': ['00001', '00010', '00010', '00100', '01000', '01000', '10000'],
  '(': ['00010', '00100', '01000', '01000', '01000', '00100', '00010'],
  ')': ['01000', '00100', '00010', '00010', '00010', '00100', '01000'],
  '&': ['01100', '10010', '10100', '01000', '10101', '10010', '01101'],
  '=': ['00000', '00000', '01110', '00000', '01110', '00000', '00000'],
  '"': ['01010', '01010', '00000', '00000', '00000', '00000', '00000'],
  '*': ['00000', '00100', '10101', '01110', '10101', '00100', '00000'],
  '<': ['00001', '00010', '00100', '01000', '00100', '00010', '00001'],
  '>': ['10000', '01000', '00100', '00010', '00100', '01000', '10000'],
  '\u2022': ['00000', '00000', '01100', '01100', '00000', '00000', '00000'],
  '\u2014': ['00000', '00000', '00000', '11111', '00000', '00000', '00000'],
  '\u2013': ['00000', '00000', '00000', '01110', '00000', '00000', '00000'],
  '\u2019': ['00100', '00100', '01000', '00000', '00000', '00000', '00000'],
};

// ---------- canvas ----------
const px = Buffer.alloc(W * H * 4);
function setPix(x: number, y: number, c: number[]): void {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = (y * W + x) * 4;
  px[i] = c[0]; px[i + 1] = c[1]; px[i + 2] = c[2]; px[i + 3] = c[3];
}
function rect(x: number, y: number, w: number, h: number, c: number[]): void {
  for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) setPix(i, j, c);
}
function textWidth(s: string, sc: number): number {
  return s.length * 6 * sc - sc; // 5px glyph + 1px gap, no trailing gap
}
function drawText(s: string, x: number, y: number, sc: number, c: number[]): void {
  const up = s.toUpperCase();
  let cx = x;
  for (const ch of up) {
    const g = G[ch] ?? G['?'];
    for (let r = 0; r < 7; r++) {
      for (let col = 0; col < 5; col++) {
        if (g[r][col] === '1') rect(cx + col * sc, y + r * sc, sc, sc, c);
      }
    }
    cx += 6 * sc;
  }
}
function drawTextC(s: string, cx: number, y: number, sc: number, c: number[]): void {
  drawText(s, Math.round(cx - textWidth(s, sc) / 2), y, sc, c);
}
function wrap(s: string, maxW: number, sc: number): string[] {
  const words = s.split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const t = cur ? cur + ' ' + w : w;
    if (textWidth(t, sc) <= maxW) { cur = t; continue; }
    if (cur) lines.push(cur);
    cur = w;
  }
  if (cur) lines.push(cur);
  return lines;
}
function para(s: string, x: number, y: number, maxW: number, sc: number, c: number[], lh: number): number {
  const lines = wrap(s, maxW, sc);
  lines.forEach((ln, i) => drawText(ln, x, y + i * lh, sc, c));
  return y + lines.length * lh;
}

// ---------- PNG encode (deterministic) ----------
const CRC_TABLE: number[] = (() => {
  const t: number[] = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t.push(c >>> 0);
  }
  return t;
})();
function crc32(b: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < b.length; i++) c = CRC_TABLE[(c ^ b[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td), 0);
  return Buffer.concat([len, td, crc]);
}
function encodePNG(): Buffer {
  const raw = Buffer.alloc(H * (1 + W * 4));
  for (let y = 0; y < H; y++) {
    raw[y * (1 + W * 4)] = 0; // filter: none
    px.copy(raw, y * (1 + W * 4) + 1, y * W * 4, (y + 1) * W * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ---------- layout ----------
rect(0, 0, W, H, BG);
rect(0, 0, W, 10, RED);

// Masthead
drawTextC('THE WORLD IN ONE DAY  \u2022  MONDAY', W / 2, 26, 2, GOLD);
drawTextC('23 NOVEMBER 2026', W / 2, 52, 10, INK);
rect(24, 132, 976, 2, LINE);
drawTextC('THE DAY THE MARKETS ROARED BACK \u2014 AND THE CLIMATE TALKS COLLAPSED', W / 2, 144, 2, MUT);

// KPI strip: 4 boxes
const kpis: { label: string; value: string; sub: string; col: number[] }[] = [
  { label: 'NASDAQ COMPOSITE', value: '+6.5%', sub: '24,090 \u2022 2ND-BIGGEST PTS GAIN EVER', col: GREEN },
  { label: 'S&P 500', value: '+4.7%', sub: '7,238 \u2022 OUT OF CORRECTION', col: GREEN },
  { label: 'NVIDIA', value: '+31%', sub: 'HUANG REINSTATED AS CEO', col: GREEN },
  { label: 'BITCOIN', value: '$61,300', sub: 'BACK ABOVE $60,000', col: GOLD },
];
kpis.forEach((k, i) => {
  const x = 24 + i * 248;
  rect(x, 176, 240, 104, PANEL);
  rect(x, 176, 240, 4, k.col);
  drawText(k.label, x + 14, 192, 2, MUT);
  drawText(k.value, x + 14, 212, 5, k.col);
  para(k.sub, x + 14, 256, 212, 1, INK, 11);
});

// Hero: the day's biggest story
rect(24, 292, 976, 148, PANEL2);
rect(24, 292, 10, 148, GOLD);
drawText('HUANG IS BACK \u2014 NVIDIA SOARS 31%', 52, 308, 4, INK);
para('Jensen Huang is reinstated as chief executive just 11 days after resigning, and Wall Street erupts: the Dow jumps 1,450 points to 49,595, chips rally with Micron +19% and Marvell +18%, and Tesla climbs 11%.', 52, 348, 920, 2, MUT, 19);

// Story grid: 2 cols x 4 rows
const stories: { n: string; head: string; body: string }[] = [
  { n: '01', head: 'COP31 COLLAPSES', body: 'UN climate talks in Turkey end with no deal after record-long talks. Nations split on fossil fuels.' },
  { n: '02', head: 'UKRAINE HITS RUSSIAN SHIPS OFF LIBYA', body: 'Naval drones strike two Russian ships at Benghazi port, Zelensky confirms. War reaches the Med.' },
  { n: '03', head: '15 KILLED AROUND KYIV', body: 'Russian strikes kill at least 15 people in the Kyiv region. A boy is pulled alive from the rubble.' },
  { n: '04', head: 'INDONESIA FACTORY FIRE', body: 'A blaze at a sweets factory kills at least 24 people, with about 30 still missing.' },
  { n: '05', head: 'EURO INFLATION 4.0%', body: 'Euro-area inflation rises to 4.0%. Asian tech shares fall further as the AI sell-off deepens.' },
  { n: '06', head: "AI 'PROVES' RIEMANN", body: 'Anthropic says AI helped prove the Riemann hypothesis \u2014 a proof no human can check.' },
  { n: '07', head: "SKUBAL'S $450M DEAL", body: 'Tarik Skubal agrees a 9-year, $450 million Mets deal \u2014 the biggest ever for a pitcher.' },
  { n: '08', head: 'MERCURY AT LAST', body: 'BepiColombo enters orbit around Mercury after an eight-year journey through space.' },
];
stories.forEach((s, i) => {
  const col = i % 2;
  const row = Math.floor(i / 2);
  const x = 24 + col * 492;
  const y = 452 + row * 118;
  rect(x, y, 484, 110, PANEL);
  rect(x, y, 4, 110, RED);
  drawText(s.n, x + 16, y + 12, 2, GOLD);
  const hl = wrap(s.head, 400, 3);
  hl.slice(0, 2).forEach((ln, j) => drawText(ln, x + 58, y + 10 + j * 24, 3, INK));
  para(s.body, x + 16, y + 60, 452, 2, MUT, 16);
});

// Bottom ticker — four single lines, each measured to fit 976px at scale 2
rect(0, 920, W, 104, DARK);
rect(0, 920, W, 2, GOLD);
drawText('GOLD $3,635 +3.4%  \u2022  OIL $80.25 -3.8%  \u2022  DOW 49,595 +3.0%  \u2022  BITCOIN $61,300', 24, 932, 2, INK);
drawText('CROWDSTRIKE BUYS ZSCALER $44BN  \u2022  EU PROPOSES 22ND RUSSIA SANCTIONS', 24, 952, 2, INK);
drawText('FBI PROBES POLICE DATABASE HACK  \u2022  US SANCTIONS 20+ IRAN TARGETS', 24, 972, 2, MUT);
drawText('MEXICO CAPTURES FBI MOST-WANTED EL CHAPO ISIDRO', 24, 992, 2, MUT);
drawTextC('SOURCES: REUTERS \u2022 INVESTOPEDIA \u2022 BBC \u2022 PRINCIPIA \u2022 THE BRIEF  \u2014  MONDAY 23 NOVEMBER 2026', W / 2, 1012, 1, MUT);

// ---------- write ----------
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'entry.png'), encodePNG());
