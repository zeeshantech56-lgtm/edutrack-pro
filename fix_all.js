const fs = require('fs');

// Fix school_attendance.jsx broken chars
let f = fs.readFileSync('school_attendance.jsx', 'utf8');

const fixes = [
  // Stat card icons
  ["ðŸ'¨â€ðŸŽ"", "👨‍🎓"],
  ["âœ…", "✅"],
  // The broken ❌ — using actual bytes
  ["\u00e2\u0080\u008c", "❌"],
  ["ðŸ"Š", "📊"],
  // Dash — 
  ["\u00e2\u0080\u0094", "—"],
  [" â€" ", " — "],
  ["â€"", "—"],
  // Tick/cross
  ["âœ"", "✓"],
  ["âœ—", "✗"],
  // Ellipsis
  ["â€¦", "…"],
  // Sidebar logo
  ["ðŸ«", "🏫"],
  // Other
  ["ðŸ"š", "📚"],
  ["ðŸ"…", "📅"],
  ["â˜°", "☰"],
  ["ðŸ'¤", "👤"],
  ["ðŸŽ‰", "🎉"],
  // Nav icons
  ["âŠž",  "⊞"],
  ["â—Ž",  "◎"],
  ["â–¦",  "▦"],
  ["â—ˆ",  "◈"],
  ["â–¤",  "▤"],
  // Missing ❌ pattern
  ["âŒ", "❌"],
];

for (const [bad, good] of fixes) {
  f = f.split(bad).join(good);
}

fs.writeFileSync('school_attendance.jsx', f, 'utf8');
console.log('school_attendance.jsx fixed');

// Now rebuild index.html from the fixed jsx
let jsx = fs.readFileSync('school_attendance.jsx', 'utf8');
const bodyStart = jsx.indexOf('\n// ─── CONSTANTS');
if (bodyStart === -1) {
  // try alternate
  const alt = jsx.indexOf('// ─── CONSTANTS');
  console.log('body search result:', alt);
  console.log(jsx.substring(0, 200));
  process.exit(1);
}

let body = jsx.slice(bodyStart);
body = body.replace(/export default function App\b/g, 'function App');
body = body.replace(/export function LoginScreen\b/g, 'function LoginScreen');

const firebaseBlock = `
const firebaseConfig = {
  apiKey: "AIzaSyAeE4r7KKuyFwWp5Z-N5SYQiRsjiWZ4QwQ",
  authDomain: "flutter-ai-playground-d5855.firebaseapp.com",
  projectId: "flutter-ai-playground-d5855",
  storageBucket: "flutter-ai-playground-d5855.firebasestorage.app",
  messagingSenderId: "700259421993",
  appId: "1:700259421993:web:94bcc0b2a5ca16384af138"
};

let db = null;
if (typeof window !== "undefined" && window.firebase) {
  if (!window.firebase.apps.length) window.firebase.initializeApp(firebaseConfig);
  db = window.firebase.firestore();
  db.enablePersistence({ synchronizeTabs: true }).catch(err => console.warn("Caching error", err));
}
`;

const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
  <title>EduTrack Pro (Live)</title>
  
  <script src="https://unpkg.com/react@18.2.0/umd/react.development.js" crossorigin><\/script>
  <script src="https://unpkg.com/react-dom@18.2.0/umd/react-dom.development.js" crossorigin><\/script>
  <script src="https://unpkg.com/prop-types@15.8.1/prop-types.js"><\/script>
  <script src="https://unpkg.com/recharts@2.12.3/umd/Recharts.js" crossorigin><\/script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>

  <script src="https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js"><\/script>
  <script src="https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore-compat.js"><\/script>
  
  <style>
    body { margin: 0; padding: 0; background: #0d1117; color: #e6edf3; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif; overflow-x: hidden; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    const { useState, useEffect, useMemo, useCallback } = window.React;
    const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend, LineChart, Line } = window.Recharts;
    
    class ErrorBoundary extends window.React.Component {
      constructor(props) { super(props); this.state = { error: null, errorInfo: null }; }
      static getDerivedStateFromError(error) { return { error }; }
      componentDidCatch(error, errorInfo) { this.setState({ errorInfo }); console.error("Caught by ErrorBoundary:", error, errorInfo); }
      render() {
        if (this.state.error) {
          return (
            <div style={{ padding: 40, color: "#f85149", background: "#0d1117", minHeight: "100vh" }}>
              <h2>Fatal React Error</h2>
              <p style={{ color: "#e6edf3" }}>A crash occurred: {this.state.error.toString()}</p>
            </div>
          );
        }
        return this.props.children;
      }
    }

${firebaseBlock}

${body}

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<ErrorBoundary><App /></ErrorBoundary>);
  <\/script>
</body>
</html>`;

fs.writeFileSync('index.html', html, 'utf8');
console.log('index.html rebuilt. Size:', html.length, 'chars');

// Spot check
const check = [
  '🏫', '📊', '✅', '❌', '—', '👤', '☰', '✓', '✗'
];
for (const c of check) {
  const count = (html.match(new RegExp(c, 'g')) || []).length;
  console.log(`  ${c}: ${count} occurrences`);
}
