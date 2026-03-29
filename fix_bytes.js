const fs = require('fs');
let b = fs.readFileSync('school_attendance.jsx');

function replaceBytes(buf, searchHex, replaceHex) {
  const search = Buffer.from(searchHex.split(' ').map(h => parseInt(h, 16)));
  const replace = Buffer.from(replaceHex.split(' ').map(h => parseInt(h, 16)));
  const parts = [];
  let start = 0;
  let idx;
  while ((idx = buf.indexOf(search, start)) !== -1) {
    parts.push(buf.slice(start, idx));
    parts.push(replace);
    start = idx + search.length;
    console.log('Fixed at byte offset', idx);
  }
  parts.push(buf.slice(start));
  return Buffer.concat(parts);
}

// All mojibake patterns -> correct UTF-8
const patterns = [
  // 👨‍🎓 man graduate - let's simplify to just 🎓
  ['c3 b0 c5 b8 e2 80 99 c2 a8 c3 a2 e2 80 9a ac c3 b0 c5 b8 c5 bd e2 80 9c', 'f0 9f 8e 93'],
  // ❌
  ['c3 a2 c2 8c', 'e2 9d 8c'],
  // ✅ 
  ['c3 a2 c5 93 e2 80 a6', 'e2 9c 85'],
  // 📊
  ['c3 b0 c5 b8 e2 80 9c c5 a0', 'f0 9f 93 8a'],
  // 🏫
  ['c3 b0 c5 b8 c2 8f c2 ab', 'f0 9f 8f ab'],
  // 📚
  ['c3 b0 c5 b8 e2 80 9c c5 bc', 'f0 9f 93 9a'],
  // 📅
  ['c3 b0 c5 b8 e2 80 9c e2 80 a6', 'f0 9f 93 85'],
  // ☰
  ['c3 a2 cb 9c c2 b0', 'e2 98 b0'],
  // 👤
  ['c3 b0 c5 b8 e2 80 98 c2 a4', 'f0 9f 91 a4'],
  // 🎉
  ['c3 b0 c5 b8 c5 bd e2 80 b0', 'f0 9f 8e 89'],
  // ⊞
  ['c3 a2 c5 a0 c5 be', 'e2 8a 9e'],
  // ◎
  ['c3 a2 e2 80 97 c5 bd', 'e2 97 8e'],
  // ▦
  ['c3 a2 e2 80 96 c2 a6', 'e2 96 a6'],
  // ◈
  ['c3 a2 e2 80 97 cb 86', 'e2 97 88'],
  // ▤
  ['c3 a2 e2 80 96 c2 a4', 'e2 96 a4'],
  // — em dash
  ['c3 a2 e2 80 9a e2 80 94', 'e2 80 94'],
  // ✓
  ['c3 a2 c5 93 e2 80 9c', 'e2 9c 93'],
  // ✗
  ['c3 a2 c5 93 e2 80 97', 'e2 9c 97'],
  // …
  ['c3 a2 e2 80 9a c2 a6', 'e2 80 a6'],
];

for (const [bad, good] of patterns) {
  b = replaceBytes(b, bad, good);
}

fs.writeFileSync('school_attendance.jsx', b);
console.log('Done! File size:', b.length, 'bytes');

// Verify
const text = b.toString('utf8');
const line314 = text.split('\n')[313];
console.log('Line 314:', line314.trim().slice(0, 100));
const line316 = text.split('\n')[315];
console.log('Line 316:', line316.trim().slice(0, 100));
