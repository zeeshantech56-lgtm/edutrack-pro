const fs = require('fs');

const files = [
  'index.html',
  'school_attendance.jsx',
  'edutrack-app/src/App.jsx'
];

const dict = {
  // Triple/Double
  "Ã°Å¸â€˜Â¨Ã¢â‚¬Â Ã°Å¸Å½â€œ": "👨‍🎓",
  "Ã¢Å“â€¦": "✅",
  "Ã¢Â Å’": "❌",
  "Ã°Å¸â€œÅ ": "📊",
  "Ã¢Å“â€œ": "✓",
  "Ã¢Å“â€”": "✗",
  "Ã¢Å Å¾": "⊞",
  "Ã¢Å“â€ ": "✔",
  "Ã¢â€”Å½": "◎",
  "Ã°Å¸â€˜Â¤": "👤",
  "Ã¢â€“Â¦": "▦",
  "Ã¢â€”Ë†": "◈",
  "Ã¢â€“Â¤": "▤",
  "Ã°Å¸Â Â«": "🏫",
  "Ã°Å¸â€œÅ¡": "📚",
  "Ã°Å¸â€œâ€¦": "📅",
  "Ã°Å¸Å½â€°": "🎉",
  "Ã¢â‚¬â€ ": "—",
  "Ã¢â‚¬Â¦": "…",
  "Ã¢â€ â€™": "→",
  "Ã¢â‚¬â„¢": "'",
  "Ã¢â€ â‚¬": "─",

  // Single
  "ðŸ‘¨â€ ðŸŽ“": "👨‍🎓",
  "âœ…": "✅",
  "â Œ": "❌",
  "ðŸ“Š": "📊",
  "âœ“": "✓",
  "âœ—": "✗",
  "âŠž": "⊞",
  "âœ”": "✔",
  "â—Ž": "◎",
  "ðŸ‘¤": "👤",
  "â–¦": "▦",
  "â—ˆ": "◈",
  "â–¤": "▤",
  "ðŸ «": "🏫",
  "ðŸ“š": "📚",
  "ðŸ“…": "📅",
  "ðŸŽ‰": "🎉",
  "â˜°": "☰",
  "â€”": "—",
  "â€¦": "…",
  "â†’": "→",
  "â€™": "'",
  "â”€": "─",
  
  // Also clean up any potential leftover broken characters
  "â†’": "→"
};

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    for (const [bad, good] of Object.entries(dict)) {
      content = content.split(bad).join(good);
    }
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Fixed ${file}`);
  } else {
    console.log(`Skipped ${file}`);
  }
}
