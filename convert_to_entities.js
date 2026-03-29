const fs = require('fs');

const files = [
  'school_attendance.jsx',
  'edutrack-app/src/App.jsx',
  'index.html'
];

const patterns = [
    // --- MOJIBAKE TRIPLE/DOUBLE - HEX BYTE LEVEL REPLACEMENT ---
    // Dashboard Stat Icons (Top level corruption seen in screenshots)
    { bad: Buffer.from([0xc3,0xb0,0xc5,0xb8,0xe2,0x80,0x99,0xc2,0xa8,0xc3,0xa2,0xe2,0x80,0x9a,0xac,0xc3,0xb0,0xc5,0xb8,0xc5,0xbd,0xe2,0x80,0x9c]), good: '&#127891;' }, // 👨‍🎓
    { bad: Buffer.from([0xc3,0xb0,0xc5,0xb8,0xc2,0x8f,0xc2,0xab]), good: '&#127979;' }, // 🏫
    { bad: Buffer.from([0xc3,0xa2,0xc5,0x93,0xe2,0x80,0xa6]), good: '&#9989;' }, // ✅
    { bad: Buffer.from([0xc3,0xa2,0xc2,0x8c]), good: '&#10060;' }, // ❌ (one variant)
    { bad: Buffer.from([0xc3,0xa2,0xc2,0x9d,0xc5,0x92]), good: '&#10060;' }, // ❌ (another variant)
    { bad: Buffer.from([0xc3,0xb0,0xc5,0xb8,0xe2,0x80,0x9c,0xc5,0xa0]), good: '&#128202;' }, // 📊
    { bad: Buffer.from([0xc3,0xa2,0xc5,0x93,0xe2,0x80,0x9c]), good: '&#10004;' }, // ✔
    { bad: Buffer.from([0xc3,0xa2,0xe2,0x80,0x97,0xc5,0xbd]), good: '&#9678;' }, // ◎
    { bad: Buffer.from([0xc3,0xb0,0xc5,0xb8,0xe2,0x80,0x98,0xc2,0xa4]), good: '&#128100;' }, // 👤
    { bad: Buffer.from([0xc3,0xa2,0xe2,0x80,0x96,0xc2,0xa6]), good: '&#9638;' }, // ▦
    { bad: Buffer.from([0xc3,0xa2,0xe2,0x80,0x97,0xce,0x86]), good: '&#9672;' }, // ◈
    { bad: Buffer.from([0xc3,0xa2,0xe2,0x80,0x96,0xc2,0xa4]), good: '&#9636;' }, // ▤
    { bad: Buffer.from([0xc3,0xb0,0xc5,0xb8,0xe2,0x80,0x9c,0xc5,0xbc]), good: '&#128218;' }, // 📚
    { bad: Buffer.from([0xc3,0xb0,0xc5,0xb8,0xe2,0x80,0x9c,0xe2,0x80,0xa6]), good: '&#128197;' }, // 📅
    { bad: Buffer.from([0xc3,0xb0,0xc5,0xb8,0xc5,0xbd,0xe2,0x80,0xb0]), good: '&#127881;' }, // 🎉
    { bad: Buffer.from([0xc3,0xa2,0xc5,0xa0,0xc5,0xbe]), good: '&#8862;' }, // ⊞
    { bad: Buffer.from([0xc3,0xa2,0xcb,0x9c,0xc2,0xb0]), good: '&#9776;' }, // ☰
    { bad: Buffer.from([0xc3,0xa2,0xe2,0x80,0x9a,0xe2,0x80,0x94]), good: '&mdash;' }, // —

    // --- STANDARD EMOJIS (In case they were already fixed partially) ---
    { bad: '👨‍🎓', good: '&#127891;' },
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
    { bad: '→', good: '&rarr;' },
    { bad: '…', good: '&hellip;' },

    // --- LEFT NAV / SUBTITLE DARLING (Seen in screenshots) ---
    { bad: 'Ã¢â‚¬â€', good: '&mdash;' },
    { bad: 'Ã°Å¸Â Â«', good: '&#127979;' },
    { bad: 'Ã°Å¸â€œÅ ', good: '&#128202;' }
];

function cleanse(filePath) {
    if (!fs.existsSync(filePath)) return;
    let b = fs.readFileSync(filePath);
    let originalLen = b.length;

    console.log(`Cleansing ${filePath}...`);

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

    fs.writeFileSync(filePath, b);
    console.log(`  Done. New size: ${b.length} bytes.`);
}

files.forEach(cleanse);

// Re-generate index.html from school_attendance.jsx
console.log("\nRe-generating index.html for total sync...");
const jsx = fs.readFileSync('school_attendance.jsx', 'utf8');
const indexHtml = fs.readFileSync('index.html', 'utf8');

const scriptStart = '<script type="text/babel">';
const scriptEnd = '</script>';

const firstScript = indexHtml.indexOf(scriptStart);
const lastScript = indexHtml.lastIndexOf(scriptEnd);

if (firstScript !== -1 && lastScript !== -1) {
    const headPart = indexHtml.slice(0, firstScript + scriptStart.length);
    const tailPart = indexHtml.slice(lastScript);

    // Filter JSX to remove node-only stuff
    let browserJsx = jsx.replace(/^import .*/gm, '').trim();
    browserJsx = browserJsx.replace(/^export default /gm, '');
    browserJsx = browserJsx.replace(/^export function /gm, 'function ');

    // Add back the React standard variables that index.html expects
    const prep = `\n    const { useState, useEffect, useMemo, useCallback } = window.React;\n    const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend, LineChart, Line } = window.Recharts;\n\n`;
    
    // Manual merge of Firebase config (already in index.html, but let's keep it safe)
    const firebaseBlock = indexHtml.match(/\n    const firebaseConfig = \{[\s\S]*?let db = null;[\s\S]*?db\.enablePersistence.*?\}\n/);
    const firebaseCode = firebaseBlock ? firebaseBlock[0] : '';

    const LoadingOverlay = `\n    function LoadingOverlay() { return <div style={{ position: "fixed", inset: 0, background: "rgba(13,17,23,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999, backdropFilter: "blur(2px)" }}><div style={{ background: "#21262d", borderRadius: 10, padding: "18px 20px", border: "1px solid #30363d", display: "flex", alignItems: "center", gap: 16 }}><div style={{ width: 22, height: 22, border: "3px solid #30363d", borderTopColor: "#58a6ff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /><span style={{ fontWeight: 600 }}>Loading Firebase...</span></div></div>; }\n`;

    const RenderCode = `\n    const root = ReactDOM.createRoot(document.getElementById('root'));\n    root.render(<App />);\n`;

    // Combine
    const finalContent = headPart + prep + firebaseCode + LoadingOverlay + browserJsx + RenderCode + tailPart;
    fs.writeFileSync('index.html', finalContent, 'utf8');
    console.log("index.html fully rebuilt with ASCII-safe entities.");
}

console.log("\nProcess complete.");
