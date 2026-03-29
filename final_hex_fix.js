const fs = require('fs');

const files = [
  'school_attendance.jsx',
  'edutrack-app/src/App.jsx',
  'index.html'
];

const patterns = [
    // The "Man-Graduate" nightmare sequence
    { bad: Buffer.from([0xc3,0xb0,0xc5,0xb8,0xe2,0x80,0x99,0xc2,0xa8,0xc3,0xa2,0xe2,0x80,0x9a,0xac,0xc3,0xb0,0xc5,0xb8,0xc5,0xbd,0xe2,0x80,0x9c]), good: '&#127891;' },
    // A simpler variant sometimes seen
    { bad: Buffer.from([0xc3,0xb0,0xc5,0xb8,0xe2,0x80,0x98,0xc2,0xa8,0x20,0xc3,0xb0,0xc5,0xb8,0xc5,0xbd,0xe2,0x80,0x9c]), good: '&#127891;' },
    // "ðŸ‘¨â€ ðŸŽ“" literally
    { bad: 'ðŸ‘¨â€ ðŸŽ“', good: '&#127891;' }
];

function finalClean(filePath) {
    if (!fs.existsSync(filePath)) return;
    let b = fs.readFileSync(filePath);
    let original = b;

    for (const p of patterns) {
        const search = Buffer.isBuffer(p.bad) ? p.bad : Buffer.from(p.bad, 'utf8');
        const replace = Buffer.from(p.good, 'utf8');

        let start = 0;
        let idx;
        while ((idx = b.indexOf(search, start)) !== -1) {
            b = Buffer.concat([b.slice(0, idx), replace, b.slice(idx + search.length)]);
            start = idx + replace.length;
        }
    }

    if (b.length !== original.length || b.toString('hex') !== original.toString('hex')) {
        fs.writeFileSync(filePath, b);
        console.log(`[HEX-FIXED] ${filePath}`);
    }
}

files.forEach(finalClean);
console.log("Final hex cleanup done.");
