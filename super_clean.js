const fs = require('fs');

const files = [
  'school_attendance.jsx',
  'edutrack-app/src/App.jsx',
  'index.html'
];

function superClean(filePath) {
    if (!fs.existsSync(filePath)) return;
    let b = fs.readFileSync(filePath);
    let t = b.toString('utf8');

    // Regex to find icon="XXXXX" or sub="XXXXX"
    // and replace any non-ascii content with the mortar board entity if it looks like mojibake
    // or just generically fix the Dashboard mortar board.
    
    // Specifically targeting the first StatCard icon which is the tricky one
    t = t.replace(/icon="[^"]*ð[^"]*"/g, 'icon="&#127891;"');
    t = t.replace(/icon="ðŸ‘¨â€ ðŸŽ“"/g, 'icon="&#127891;"');
    
    // Also fix any sub="..." that has mojibake
    t = t.replace(/sub={`Overview for \$\{today\} [^`]* \$\{totalStudents\}/g, 'sub={`Overview for ${today} &mdash; ${totalStudents}');

    fs.writeFileSync(filePath, t, 'utf8');
    console.log(`[SUPER-CLEANED] ${filePath}`);
}

files.forEach(superClean);
console.log("Super clean complete.");
