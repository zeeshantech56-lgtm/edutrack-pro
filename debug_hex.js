const fs = require('fs');
const b = fs.readFileSync('edutrack-app/src/App.jsx');
const t = b.toString('utf8');
const lines = t.split('\n');
const line = lines[313]; // Line 314 (0-indexed)
const iconPos = line.indexOf('icon=');
const iconPart = line.slice(iconPos, iconPos + 30);
console.log('Line 314 icon part:', iconPart);
const bufferPart = Buffer.from(iconPart, 'utf8');
console.log('Hex of that part:', bufferPart.toString('hex'));
