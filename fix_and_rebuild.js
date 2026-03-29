const fs = require('fs');

function fixBytes(filename, patterns) {
  let b = fs.readFileSync(filename);
  for (const [searchArr, replaceArr] of patterns) {
    const search = Buffer.from(searchArr);
    const replace = Buffer.from(replaceArr);
    const parts = [];
    let start = 0, idx, count = 0;
    while ((idx = b.indexOf(search, start)) !== -1) {
      parts.push(b.slice(start, idx));
      parts.push(replace);
      start = idx + search.length;
      count++;
    }
    parts.push(b.slice(start));
    if (count > 0) {
      b = Buffer.concat(parts);
      const friendly = Buffer.from(replaceArr).toString('utf8');
      console.log(`Fixed x${count}: -> ${friendly}`);
    }
  }
  fs.writeFileSync(filename, b);
  return b;
}

// All broken byte sequences in school_attendance.jsx
// Format: [badBytes, goodBytes]
const patterns = [
  // 🎓 (simplifying man+grad to just mortarboard)
  [[0xc3,0xb0,0xc5,0xb8,0xe2,0x80,0x99,0xc2,0xa8,0xc3,0xa2,0xe2,0x80,0x9a,0xac,0xc3,0xb0,0xc5,0xb8,0xc5,0xbd,0xe2,0x80,0x9c], [0xf0,0x9f,0x8e,0x93]],
  // ❌ exact bytes from file: c3 a2 c2 9d c5 92
  [[0xc3,0xa2,0xc2,0x9d,0xc5,0x92], [0xe2,0x9d,0x8c]],
  // ✅ (c3 a2 c5 93 e2 80 a6)
  [[0xc3,0xa2,0xc5,0x93,0xe2,0x80,0xa6], [0xe2,0x9c,0x85]],
  // 📊 (c3 b0 c5 b8 e2 80 9c c5 a0)
  [[0xc3,0xb0,0xc5,0xb8,0xe2,0x80,0x9c,0xc5,0xa0], [0xf0,0x9f,0x93,0x8a]],
  // 🏫 (c3 b0 c5 b8 c2 8f c2 ab)
  [[0xc3,0xb0,0xc5,0xb8,0xc2,0x8f,0xc2,0xab], [0xf0,0x9f,0x8f,0xab]],
  // 📚 (c3 b0 c5 b8 e2 80 9c c5 bc)
  [[0xc3,0xb0,0xc5,0xb8,0xe2,0x80,0x9c,0xc5,0xbc], [0xf0,0x9f,0x93,0x9a]],
  // 📅 (c3 b0 c5 b8 e2 80 9c e2 80 a6)
  [[0xc3,0xb0,0xc5,0xb8,0xe2,0x80,0x9c,0xe2,0x80,0xa6], [0xf0,0x9f,0x93,0x85]],
  // ☰ (c3 a2 cb 9c c2 b0)
  [[0xc3,0xa2,0xcb,0x9c,0xc2,0xb0], [0xe2,0x98,0xb0]],
  // 👤 (c3 b0 c5 b8 e2 80 98 c2 a4)
  [[0xc3,0xb0,0xc5,0xb8,0xe2,0x80,0x98,0xc2,0xa4], [0xf0,0x9f,0x91,0xa4]],
  // 🎉 (c3 b0 c5 b8 c5 bd e2 80 b0)
  [[0xc3,0xb0,0xc5,0xb8,0xc5,0xbd,0xe2,0x80,0xb0], [0xf0,0x9f,0x8e,0x89]],
  // ⊞ (c3 a2 c5 a0 c5 be)
  [[0xc3,0xa2,0xc5,0xa0,0xc5,0xbe], [0xe2,0x8a,0x9e]],
  // ◎ (c3 a2 e2 80 97 c5 bd)
  [[0xc3,0xa2,0xe2,0x80,0x97,0xc5,0xbd], [0xe2,0x97,0x8e]],
  // ▦ (c3 a2 e2 80 96 c2 a6)
  [[0xc3,0xa2,0xe2,0x80,0x96,0xc2,0xa6], [0xe2,0x96,0xa6]],
  // ◈ (c3 a2 e2 80 97 cb 86)
  [[0xc3,0xa2,0xe2,0x80,0x97,0xcb,0x86], [0xe2,0x97,0x88]],
  // ▤ (c3 a2 e2 80 96 c2 a4)
  [[0xc3,0xa2,0xe2,0x80,0x96,0xc2,0xa4], [0xe2,0x96,0xa4]],
  // — em dash (c3 a2 e2 80 9a e2 80 94)
  [[0xc3,0xa2,0xe2,0x80,0x9a,0xe2,0x80,0x94], [0xe2,0x80,0x94]],
  // ✓ (c3 a2 c5 93 e2 80 9c)
  [[0xc3,0xa2,0xc5,0x93,0xe2,0x80,0x9c], [0xe2,0x9c,0x93]],
  // ✗ (c3 a2 c5 93 e2 80 97)
  [[0xc3,0xa2,0xc5,0x93,0xe2,0x80,0x97], [0xe2,0x9c,0x97]],
  // … (c3 a2 e2 80 9a c2 a6)
  [[0xc3,0xa2,0xe2,0x80,0x9a,0xc2,0xa6], [0xe2,0x80,0xa6]],
];

console.log('Fixing school_attendance.jsx...');
const finalBuf = fixBytes('school_attendance.jsx', patterns);
const text = finalBuf.toString('utf8');
const lines = text.split('\n');
console.log('\nVerification:');
console.log('Line 314:', lines[313].trim().slice(0, 100));
console.log('Line 316:', lines[315].trim().slice(0, 100));
console.log('Line 375:', lines[374].trim().slice(0, 100));

// Now rebuild index.html
console.log('\nRebuilding index.html...');
let jsx = text;
const bodyStart = jsx.indexOf('\n// \u2500\u2500\u2500 CONSTANTS');
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
}`;

const html = [
  '<!DOCTYPE html>',
  '<html>',
  '<head>',
  '  <meta charset="UTF-8">',
  '  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">',
  '  <title>EduTrack Pro (Live)</title>',
  '  <script src="https://unpkg.com/react@18.2.0/umd/react.development.js" crossorigin></script>',
  '  <script src="https://unpkg.com/react-dom@18.2.0/umd/react-dom.development.js" crossorigin></script>',
  '  <script src="https://unpkg.com/prop-types@15.8.1/prop-types.js"></script>',
  '  <script src="https://unpkg.com/recharts@2.12.3/umd/Recharts.js" crossorigin></script>',
  '  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>',
  '  <script src="https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js"></script>',
  '  <script src="https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore-compat.js"></script>',
  '  <style>',
  '    body { margin: 0; padding: 0; background: #0d1117; color: #e6edf3; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif; overflow-x: hidden; }',
  '  </style>',
  '</head>',
  '<body>',
  '  <div id="root"></div>',
  '  <script type="text/babel">',
  '    const { useState, useEffect, useMemo, useCallback } = window.React;',
  '    const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend, LineChart, Line } = window.Recharts;',
  '    class ErrorBoundary extends window.React.Component {',
  '      constructor(props) { super(props); this.state = { error: null }; }',
  '      static getDerivedStateFromError(error) { return { error }; }',
  '      componentDidCatch(e, info) { console.error(e, info); }',
  '      render() {',
  '        if (this.state.error) return <div style={{padding:40,color:"#f85149",background:"#0d1117",minHeight:"100vh"}}><h2>Fatal React Error</h2><pre style={{whiteSpace:"pre-wrap",background:"#161b22",padding:20,borderRadius:8,border:"1px solid #f85149"}}>{this.state.error.toString()}</pre></div>;',
  '        return this.props.children;',
  '      }',
  '    }',
  firebaseBlock,
  body,
  "    const root = ReactDOM.createRoot(document.getElementById('root'));",
  '    root.render(<ErrorBoundary><App /></ErrorBoundary>);',
  '  </script>',
  '</body>',
  '</html>',
].join('\n');

fs.writeFileSync('index.html', html, 'utf8');
console.log('index.html written. Size:', html.length);
