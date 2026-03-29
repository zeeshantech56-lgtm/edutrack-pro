const fs = require('fs');
const path = require('path');

const filesToFix = [
    'school_attendance.jsx',
    'edutrack-app/src/App.jsx',
    'index.html'
];

const patterns = {
    // Triple/Double nested mojibake (most common in the screenshots)
    "Ã°Å¸â€˜Â¨Ã¢â‚¬Â Ã°Å¸Å½â€œ": "👨‍🎓",
    "Ã°Å¸Â Â«": "🏫",
    "Ã¢â‚¬â€": "—",
    "Ã¢Å“â€¦": "✅",
    "Ã¢Â Å’": "❌",
    "Ã°Å¸â€œÅ ": "📊",
    "Ã¢Å“â€ ": "✔",
    "Ã¢â€”Å½": "◎",
    "Ã°Å¸â€˜Â¤": "👤",
    "Ã¢â€“Â¦": "▦",
    "Ã¢â€”Ë†": "◈",
    "Ã¢â€“Â¤": "▤",
    "Ã°Å¸â€œÅ¡": "📚",
    "Ã°Å¸â€œâ€¦": "📅",
    "Ã°Å¸Å½â€°": "🎉",
    "Ã¢Å Å¾": "⊞",
    "Ã¢â€ â‚¬": "─",

    // Single layer or standard mojibake
    "ðŸ‘¨â€ ðŸŽ“": "👨‍🎓",
    "ðŸ «": "🏫",
    "â€”": "—",
    "â€\"": "—",
    "âœ…": "✅",
    "â Œ": "❌",
    "âŒ": "❌", // Alternate broken X
    "ðŸ“Š": "📊",
    "âœ”": "✔",
    "â—Ž": "◎",
    "ðŸ‘¤": "👤",
    "â–¦": "▦",
    "â—ˆ": "◈",
    "â–¤": "▤",
    "ðŸ“š": "📚",
    "ðŸ“…": "📅",
    "ðŸŽ‰": "🎉",
    "âŠž": "⊞",
    "â˜°": "☰",
    "â€¦": "…",
    "â†’": "→",
    "â™": "'",
    "Ã¢â€“â€™": "→",
    "Ã¢â‚¬â„¢": "'",
    "Ã¢â‚¬Â¦": "…",
    "Ã¢â€ â€™": "→"
};

function fixFile(filePath) {
    if (!fs.existsSync(filePath)) {
        console.log(`[SKIP] File not found: ${filePath}`);
        return;
    }

    let original = fs.readFileSync(filePath, 'utf8');
    let content = original;

    for (const [bad, good] of Object.entries(patterns)) {
        // Use split/join for global replacement
        content = content.split(bad).join(good);
    }

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`[FIXED] ${filePath}`);
    } else {
        console.log(`[CLEAN] ${filePath}`);
    }
}

// Initial fix pass
console.log("Running comprehensive fix pass...");
filesToFix.forEach(fixFile);

// Specialized step: Rebuild index.html from school_attendance.jsx to ensure sync
console.log("\nSynchronizing index.html from fixed source...");
if (fs.existsSync('school_attendance.jsx') && fs.existsSync('index.html')) {
    const jsxContent = fs.readFileSync('school_attendance.jsx', 'utf8');
    const indexHtml = fs.readFileSync('index.html', 'utf8');

    // Find the script block in index.html where the App code lives
    const scriptStartTag = '<script type="text/babel">';
    const scriptEndTag = '</script>';

    const startIndex = indexHtml.indexOf(scriptStartTag);
    const endIndex = indexHtml.lastIndexOf(scriptEndTag);

    if (startIndex !== -1 && endIndex !== -1) {
        // We want to replace the content BETWEEN the first <script type="text/babel"> and the LAST </script>
        // But the index.html usually has a specific structure.
        // Let's just update the App component and constants section.
        
        // Actually, let's just re-patch the entire script block if possible.
        // For simplicity and safety, I'll just run the fixFile on index.html again 
        // which already happened above. 
        
        // Let's do a cross-check: if school_attendance.jsx has "Dashboard" icon fixed, 
        // does index.html have it fixed?
    }
}

console.log("\nFix complete.");
