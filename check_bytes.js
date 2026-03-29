const fs = require('fs');
const b = fs.readFileSync('school_attendance.jsx');

// Find "icon=\"" and print 35 bytes from quote start
let pos = 0;
let found = 0;
while (pos < b.length - 6) {
  if (b[pos] === 0x69 && b[pos+1] === 0x63 && b[pos+2] === 0x6f && b[pos+3] === 0x6e && b[pos+4] === 0x3d && b[pos+5] === 0x22) {
    found++;
    const slice = b.slice(pos+6, pos+40); // bytes after icon="
    const hex = Array.from(slice).map(x => x.toString(16).padStart(2, '0')).join(' ');
    const endQuote = slice.indexOf(0x22); // find closing quote
    const iconBytes = Array.from(slice.slice(0, endQuote)).map(x => x.toString(16).padStart(2, '0')).join(' ');
    console.log(`icon #${found}: [${iconBytes}]`);
  }
  pos++;
}
