const fs = require('fs');

const files = [
  'school_attendance.jsx',
  'edutrack-app/src/App.jsx',
  'index.html'
];

function robustFix(filePath) {
    if (!fs.existsSync(filePath)) return;
    let t = fs.readFileSync(filePath, 'utf8');

    // 1. Remove all import/export statements correctly (even multi-line)
    // Regex matches "import { ... } from '...';" or "import X from '...';"
    t = t.replace(/import\s+({[\s\S]*?}|[\s\S]*?)\s+from\s+['"].*?['"];?/gm, '');
    t = t.replace(/export\s+default\s+/gm, '');
    t = t.replace(/export\s+function\s+/gm, 'function ');
    
    // 2. Fix entities in Template Literals
    // Replace `... &mdash; ...` with the actual character or Unicode
    t = t.replace(/&mdash;/g, '—');
    t = t.replace(/&hellip;/g, '…');
    t = t.replace(/&rarr;/g, '→');
    t = t.replace(/&ndash;/g, '–');
    
    // 3. Ensure the script block doesn't have orphans
    // Sometimes after stripping imports, we have dangling lines
    t = t.replace(/^\s*(BarChart|Bar|XAxis|YAxis|CartesianGrid|Tooltip|ResponsiveContainer|AreaChart|Area|PieChart|Pie|Cell|Legend|LineChart|Line).*$/gm, '');
    t = t.replace(/^\s*}\s*from\s*["']recharts["'];\s*$/gm, '');

    fs.writeFileSync(filePath, t, 'utf8');
    console.log(`[FIXED] ${filePath}`);
}

files.forEach(robustFix);

// Rebuild index.html properly from fixed source
console.log("\nRebuilding index.html...");
const jsx = fs.readFileSync('school_attendance.jsx', 'utf8');
const indexHtml = fs.readFileSync('index.html', 'utf8');

const scriptStart = '<script type="text/babel">';
const scriptEnd = '</script>';
const firstScript = indexHtml.indexOf(scriptStart);
const lastScript = indexHtml.lastIndexOf(scriptEnd);

if (firstScript !== -1 && lastScript !== -1) {
    const head = indexHtml.slice(0, firstScript + scriptStart.length);
    const tail = indexHtml.slice(lastScript);

    const setup = `
    const { useState, useEffect, useMemo, useCallback } = window.React;
    const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend, LineChart, Line } = window.Recharts;

    const GlobalStyles = () => null;

    class ErrorBoundary extends window.React.Component {
      constructor(props) { super(props); this.state = { hasError: false, error: null }; }
      static getDerivedStateFromError(error) { return { hasError: true, error }; }
      render() {
        if (this.state.hasError) {
          return (
            <div style={{ padding: 40, background: '#0d1117', color: '#f85149', fontFamily: 'sans-serif' }}>
              <h2>Something went wrong in the app.</h2>
              <pre style={{ background: '#161b22', padding: 20, borderRadius: 8, border: '1px solid #30363d', color: '#8b949e', overflow: 'auto' }}>
                {this.state.error?.toString()}
              </pre>
              <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', background: '#58a6ff', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Reload App</button>
            </div>
          );
        }
        return this.props.children;
      }
    }
\n`;

    const Render = `\n    const root = ReactDOM.createRoot(document.getElementById('root'));\n    root.render(<ErrorBoundary><App /></ErrorBoundary>);\n`;

    const final = head + setup + jsx.trim() + Render + tail;
    fs.writeFileSync('index.html', final, 'utf8');
    console.log("index.html fully repaired.");
}
