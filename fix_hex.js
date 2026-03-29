const fs = require('fs');

// Read school_attendance.jsx as a Buffer to handle encoding correctly
let raw = fs.readFileSync('school_attendance.jsx', 'utf8');

// Map of corrupted sequences (as hex sequences) -> correct replacements
// These are UTF-8 bytes that were mis-read as Latin-1 and re-encoded
// We use Buffer tricks to get the actual bad strings
function latin1ToUtf8(str) {
  return Buffer.from(str, 'latin1').toString('utf8');
}

// Build replacements using Buffer.from with the actual byte sequences
const replacements = [
  // 👨‍🎓 = F0 9F 91 A8 E2 80 8D F0 9F 8E 93 - the "man student" emoji
  [Buffer.from([0xC3, 0xB0, 0xC5, 0xB8, 0xE2, 0x80, 0x99, 0xC2, 0xA8, 0xC3, 0xA2, 0xE2, 0x80, 0x9A, 0xE2, 0x80, 0xAC, 0xC3, 0xB0, 0xC5, 0xB8, 0xC5, 0xBD, 0xE2, 0x80, 0x9C], 'utf8'), '\uD83D\uDC68\u200D\uD83C\uDF93'],
  // ✅ = E2 9C 85
  [Buffer.from([0xC3, 0xA2, 0xC5, 0x93, 0xE2, 0x80, 0xA6], 'utf8'), '\u2705'],
  // ❌ = E2 9D 8C
  [Buffer.from([0xC3, 0xA2, 0xC2, 0x8C], 'utf8'), '\u274C'],
  // 📊 = F0 9F 93 8A
  [Buffer.from([0xC3, 0xB0, 0xC5, 0xB8, 0xE2, 0x80, 0x9C, 0xC5, 0xA0], 'utf8'), '\uD83D\uDCCA'],
  // — em dash = E2 80 94
  [Buffer.from([0xC3, 0xA2, 0xE2, 0x80, 0x9A, 0xE2, 0x80, 0x94], 'utf8'), '\u2014'],
  // ✓ = E2 9C 93
  [Buffer.from([0xC3, 0xA2, 0xC5, 0x93, 0xE2, 0x80, 0x9C], 'utf8'), '\u2713'],
  // ✗ = E2 9C 97
  [Buffer.from([0xC3, 0xA2, 0xC5, 0x93, 0xE2, 0x80, 0x97], 'utf8'), '\u2717'],
  // … = E2 80 A6
  [Buffer.from([0xC3, 0xA2, 0xE2, 0x80, 0x9A, 0xC2, 0xA6], 'utf8'), '\u2026'],
  // 🏫 = F0 9F 8F AB
  [Buffer.from([0xC3, 0xB0, 0xC5, 0xB8, 0xC2, 0x8F, 0xC2, 0xAB], 'utf8'), '\uD83C\uDFEB'],
  // 📚 = F0 9F 93 9A
  [Buffer.from([0xC3, 0xB0, 0xC5, 0xB8, 0xE2, 0x80, 0x9C, 0xC5, 0xBC], 'utf8'), '\uD83D\uDCDA'],
  // 📅 = F0 9F 93 85
  [Buffer.from([0xC3, 0xB0, 0xC5, 0xB8, 0xE2, 0x80, 0x9C, 0xE2, 0x80, 0xA6], 'utf8'), '\uD83D\uDCC5'],
  // ☰ = E2 98 B0
  [Buffer.from([0xC3, 0xA2, 0xCB, 0x9C, 0xC2, 0xB0], 'utf8'), '\u2630'],
  // 👤 = F0 9F 91 A4
  [Buffer.from([0xC3, 0xB0, 0xC5, 0xB8, 0xE2, 0x80, 0x98, 0xC2, 0xA4], 'utf8'), '\uD83D\uDC64'],
  // 🎉 = F0 9F 8E 89
  [Buffer.from([0xC3, 0xB0, 0xC5, 0xB8, 0xC5, 0xBD, 0xE2, 0x80, 0xB0], 'utf8'), '\uD83C\uDF89'],
  // ⊞ = E2 8A 9E
  [Buffer.from([0xC3, 0xA2, 0xC5, 0xA0, 0xC5, 0xBE], 'utf8'), '\u229E'],
  // ◎ = E2 97 8E
  [Buffer.from([0xC3, 0xA2, 0xE2, 0x80, 0x97, 0xC5, 0xBD], 'utf8'), '\u25CE'],
  // ▦ = E2 96 A6
  [Buffer.from([0xC3, 0xA2, 0xE2, 0x80, 0x96, 0xC2, 0xA6], 'utf8'), '\u25A6'],
  // ◈ = E2 97 88
  [Buffer.from([0xC3, 0xA2, 0xE2, 0x80, 0x97, 0xCB, 0x86], 'utf8'), '\u25C8'],
  // ▤ = E2 96 A4
  [Buffer.from([0xC3, 0xA2, 0xE2, 0x80, 0x96, 0xC2, 0xA4], 'utf8'), '\u25A4'],
];

let changed = 0;
for (const [badBuf, good] of replacements) {
  const bad = badBuf.toString('utf8');
  const before = raw;
  raw = raw.split(bad).join(good);
  if (raw !== before) {
    changed++;
    console.log(`Replaced: -> ${good}`);
  }
}

// Also simple string replacements for chars in some simpler patterns
const simpleReplacements = [
  ['\u00c3\u00a2\u00e2\u0082\u00ac\u00e2\u20ac\u009c', '\u2014'], // another â€" pattern
];

console.log(`Total replacement groups applied: ${changed}`);
fs.writeFileSync('school_attendance.jsx', raw, 'utf8');
console.log('Wrote school_attendance.jsx');
