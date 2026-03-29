const fs = require('fs');

const appPath = 'edutrack-app/src/App.jsx';
if (fs.existsSync(appPath)) {
    let content = fs.readFileSync(appPath, 'utf8');
    
    // I will just use the clean school_attendance.jsx as the new App.jsx 
    // but I need to make sure the imports are correct for a Vite project.
    // The previous agent already had a version of App.jsx. 
    // I'll just apply the mojibake fix to it.
    
    const patterns = {
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
        "ðŸ‘¨â€ ðŸŽ“": "👨‍🎓",
        "ðŸ «": "🏫",
        "â€”": "—",
        "âœ…": "✅",
        "â Œ": "❌",
        "âŒ": "❌",
        "ðŸ“Š": "📊",
        "â˜°": "☰"
    };

    for (const [bad, good] of Object.entries(patterns)) {
        content = content.split(bad).join(good);
    }

    fs.writeFileSync(appPath, content, 'utf8');
    console.log("App.jsx updated.");
}
