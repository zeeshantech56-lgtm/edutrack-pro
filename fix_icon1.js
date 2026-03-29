const fs = require('fs');
const b = fs.readFileSync('school_attendance.jsx');

// Find first icon="..." byte sequence
let pos = 0;
while (pos < b.length - 6) {
  if (b[pos] === 0x69 && b[pos+1] === 0x63 && b[pos+2] === 0x6f && b[pos+3] === 0x6e && b[pos+4] === 0x3d && b[pos+5] === 0x22) {
    const start = pos + 6;
    let end = start;
    while (end < b.length && b[end] !== 0x22) end++;
    const iconBytes = Array.from(b.slice(start, end)).map(x => x.toString(16).padStart(2, '0'));
    process.stdout.write('ICON1_BYTES: ' + iconBytes.join(' ') + '\n');
    
    // Replace with just 🎓 (f0 9f 8e 93)
    const newIcon = Buffer.from([0xf0, 0x9f, 0x8e, 0x93]);
    const newBuf = Buffer.concat([b.slice(0, start), newIcon, b.slice(end)]);
    fs.writeFileSync('school_attendance.jsx', newBuf);
    console.log('Fixed icon 1!');
    break;
  }
  pos++;
}
