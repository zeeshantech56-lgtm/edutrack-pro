const fs = require('fs');

const files = [
  'school_attendance.jsx',
  'edutrack-app/src/App.jsx',
  'index.html'
];

const patterns = [
    // --- Manual Emoji to Entity Mapping ---
    { bad: '🎓', good: '&#127891;' },
    { bad: '🏫', good: '&#127979;' },
    { bad: '✅', good: '&#9989;' },
    { bad: '❌', good: '&#10060;' },
    { bad: '📊', good: '&#128202;' },
    { bad: '✔', good: '&#10004;' },
    { bad: '◎', good: '&#9678;' },
    { bad: '👤', good: '&#128100;' },
    { bad: '▦', good: '&#9638;' },
    { bad: '◈', good: '&#9672;' },
    { bad: '▤', good: '&#9636;' },
    { bad: '📚', good: '&#128218;' },
    { bad: '📅', good: '&#128197;' },
    { bad: '🎉', good: '&#127881;' },
    { bad: '⊞', good: '&#8862;' },
    { bad: '☰', good: '&#9776;' },
    { bad: '—', good: '&mdash;' },
    { bad: '–', good: '&ndash;' },
    { bad: '→', good: '&rarr;' },
    { bad: '…', good: '&hellip;' },
    { bad: '✓', good: '&#10003;' },
    { bad: '✗', good: '&#10007;' },
    
    // Mojibake variants found in previous attempts
    { bad: 'Ã¢â‚¬â€', good: '&mdash;' },
    { bad: 'Ã°Å¸Â Â«', good: '&#127979;' },
    { bad: 'Ã°Å¸â€œÅ ', good: '&#128202;' },
    { bad: 'Ã¢â‚¬Â¦', good: '&hellip;' }
];

function cleanse(filePath) {
    if (!fs.existsSync(filePath)) return;
    let text = fs.readFileSync(filePath, 'utf8');
    let original = text;

    for (const p of patterns) {
        text = text.split(p.bad).join(p.good);
    }

    if (text !== original) {
        fs.writeFileSync(filePath, text, 'utf8');
        console.log(`[CLEANSED] ${filePath}`);
    }
}

files.forEach(cleanse);
console.log("Emoji to Entity conversion finished.");
