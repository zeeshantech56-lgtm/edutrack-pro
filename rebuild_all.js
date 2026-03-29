const fs = require('fs');

// 1. Read the CLEAN source of truth
let jsx = fs.readFileSync('school_attendance.jsx', 'utf8');

// 2. Clean App.jsx for the Vite project
let viteApp = jsx.replace(/import .*\n/g, ''); // Simple cleanup of imports for now
// Actually, App.jsx needs the imports. Let's just fix the mojibake in App.jsx directly.
const viteAppPath = 'edutrack-app/src/App.jsx';
if (fs.existsSync(viteAppPath)) {
    let appContent = fs.readFileSync(viteAppPath, 'utf8');
    // We already cleaned this in unified_fix.js, but let's be sure.
}

// 3. Re-generate index.html script block accurately
// Extract everything from "// ─── CONSTANTS" to before "export default function App"
const constantsStart = jsx.indexOf('// ─── CONSTANTS');
const appStart = jsx.indexOf('export default function App');
const appLogic = jsx.slice(constantsStart, appStart);

// Clean up "export default" from the JSX for the HTML version
const appFunction = jsx.slice(appStart).replace('export default function App', 'function App');

// Define the static parts of index.html
const htmlBefore = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
  <title>EduTrack Pro (Live)</title>
  
  <script src="https://unpkg.com/react@18.2.0/umd/react.development.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18.2.0/umd/react-dom.development.js" crossorigin></script>
  <script src="https://unpkg.com/prop-types@15.8.1/prop-types.js"></script>
  <script src="https://unpkg.com/recharts@2.12.3/umd/Recharts.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

  <script src="https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore-compat.js"></script>
  
  <style>
    body { margin: 0; padding: 0; background: #0d1117; color: #e6edf3; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif; overflow-x: hidden; }
    
    @keyframes spin { 100% { transform: rotate(360deg); } }
    .page-transition { animation: fadeIn 0.3s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

    /* Scrollbar */
    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: #0d1117; }
    ::-webkit-scrollbar-thumb { background: #30363d; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #484f58; }

    /* Responsive Grid */
    .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 16px; }
    .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 16px; }
    
    @media (max-width: 1024px) {
      .grid-4 { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 640px) {
      .grid-4, .grid-2 { grid-template-columns: 1fr; }
      .app-sidebar { position: fixed; left: -260px; top: 0; bottom: 0; z-index: 1000; transition: left 0.3s ease; }
      .app-sidebar.open { left: 0; }
      .app-main { padding: 16px !important; }
      .mobile-header { display: flex !important; }
    }

    .mobile-header { display: none; height: 60px; background: #161b22; border-bottom: 1px solid #30363d; align-items: center; justify-content: space-between; padding: 0 16px; position: sticky; top: 0; z-index: 900; }
    .app-sidebar { width: 260px; background: #161b22; border-right: 1px solid #30363d; display: flex; flexDirection: column; }
    .app-main { flex: 1; padding: 24px; overflow-y: auto; max-width: 1200px; margin: 0 auto; width: 100%; box-sizing: border-box; }
    .overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 999; }
    .overlay.open { display: block; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    const { useState, useEffect, useMemo, useCallback } = window.React;
    const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend, LineChart, Line } = window.Recharts;

    const GlobalStyles = () => null;

    class ErrorBoundary extends window.React.Component {
      constructor(props) { super(props); this.state = { hasError: false }; }
      static getDerivedStateFromError(error) { return { hasError: true }; }
      render() {
        if (this.state.hasError) return <div style={{padding: 20}}>Something went wrong.</div>;
        return this.props.children;
      }
    }

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

    function LoadingOverlay() {
      return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(13,17,23,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999, backdropFilter: "blur(2px)" }}>
          <div style={{ background: "#21262d", borderRadius: 10, padding: "18px 20px", border: "1px solid #30363d", display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 22, height: 22, border: "3px solid #30363d", borderTopColor: "#58a6ff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <span style={{ fontWeight: 600 }}>Loading Firebase...</span>
          </div>
        </div>
      );
    }

    function LoginScreen({ onLogin }) {
      const [user, setUser] = useState("");
      const [pass, setPass] = useState("");
      const handleLogin = (e) => {
        e.preventDefault();
        if (user === "admin" && pass === "admin") onLogin({ username: "Admin", role: "admin" });
        else alert("Invalid Credentials");
      };
      return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#0d1117", color: "white", fontFamily: "sans-serif" }}>
          <form onSubmit={handleLogin} style={{ background: "#161b22", padding: 40, borderRadius: 12, border: "1px solid #30363d", width: 320 }}>
            <h2 style={{ textAlign: "center", marginBottom: 20 }}>EduTrack Pro</h2>
            <input style={{ width: "100%", padding: 12, marginBottom: 15, background: "#0d1117", color: "white", border: "1px solid #30363d", borderRadius: 6 }} placeholder="Username" value={user} onChange={e => setUser(e.target.value)} />
            <input type="password" style={{ width: "100%", padding: 12, marginBottom: 20, background: "#0d1117", color: "white", border: "1px solid #30363d", borderRadius: 6 }} placeholder="Password" value={pass} onChange={e => setPass(e.target.value)} />
            <button type="submit" style={{ width: "100%", padding: 12, background: "#58a6ff", color: "white", border: "none", borderRadius: 6, fontWeight: "bold", cursor: "pointer" }}>Sign In</button>
          </form>
        </div>
      );
    }
`;

const htmlAfter = `
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<ErrorBoundary><App /></ErrorBoundary>);
  </script>
</body>
</html>`;

// Full assembly
const finalHtml = htmlBefore + appLogic + appFunction + htmlAfter;

fs.writeFileSync('index.html', finalHtml, 'utf8');
console.log("SUCCESS: index.html has been fully rebuilt from clean source.");
