import { useState, useEffect, useMemo, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Legend, LineChart, Line
} from "recharts";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const CLASSES = [
  { id: "nursery", label: "Nursery" },
  { id: "kg", label: "KG" },
  ...Array.from({ length: 12 }, (_, i) => ({ id: `${i + 1}`, label: `Class ${i + 1}` })),
];
const SECTIONS = ["A", "B"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const FNAME = [
  "Aarav", "Aditi", "Aditya", "Akash", "Amit", "Ananya", "Anjali", "Arjun", "Aryan", "Avni",
  "Deepak", "Disha", "Gaurav", "Ishaan", "Kavya", "Kiara", "Kunal", "Manav", "Meera", "Mihir",
  "Neha", "Nikhil", "Nisha", "Pooja", "Prachi", "Pratik", "Priya", "Rahul", "Rajat", "Riya",
  "Rohit", "Sakshi", "Sanjay", "Sara", "Shiv", "Shivani", "Shreya", "Tarun", "Tanvi", "Uday",
  "Uma", "Varun", "Vidya", "Vikram", "Vivek", "Yash", "Zara", "Siddharth", "Ayesha", "Kabir",
];
const LNAME = [
  "Sharma", "Verma", "Gupta", "Singh", "Patel", "Tiwari", "Joshi", "Dubey", "Mishra", "Yadav",
  "Agarwal", "Srivastava", "Pandey", "Kumar", "Chauhan", "Rathore", "Malhotra", "Kapoor", "Khan", "Ansari",
];

// ─── SEEDED RNG & UTILITIES ───────────────────────────────────────────────────

function mkRand(seed) {
  let s = seed;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}

function fmtDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function isWeekend(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.getDay() === 0 || d.getDay() === 6;
}

function getWeekDates(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  const dow = d.getDay();
  const mon = new Date(d);
  mon.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1));
  return Array.from({ length: 5 }, (_, i) => {
    const dd = new Date(mon);
    dd.setDate(mon.getDate() + i);
    return fmtDate(dd);
  });
}

// ─── SAMPLE DATA GENERATION ───────────────────────────────────────────────────

const INIT_STUDENTS = (() => {
  const out = {};
  let uid = 1;
  CLASSES.forEach((cls, ci) => {
    SECTIONS.forEach((sec, si) => {
      const key = `${cls.id}_${sec}`;
      const r = mkRand(ci * 200 + si * 30 + 7);
      const n = 22 + Math.floor(r() * 8);
      const seen = new Set();
      const arr = [];
      for (let i = 0; i < n; i++) {
        let name;
        let tries = 0;
        do {
          name = `${FNAME[Math.floor(r() * FNAME.length)]} ${LNAME[Math.floor(r() * LNAME.length)]}`;
          tries++;
        } while (seen.has(name) && tries < 20);
        seen.add(name);
        arr.push({ id: `s${uid++}`, name, rollNo: i + 1 });
      }
      out[key] = arr;
    });
  });
  return out;
})();

const INIT_ATTENDANCE = (() => {
  const att = {};
  const today = new Date();
  for (let back = 14; back >= 0; back--) {
    const d = new Date(today);
    d.setDate(today.getDate() - back);
    const ds = fmtDate(d);
    if (isWeekend(ds)) continue;
    CLASSES.forEach(cls => {
      SECTIONS.forEach(sec => {
        const key = `${ds}_${cls.id}_${sec}`;
        const studs = INIT_STUDENTS[`${cls.id}_${sec}`] || [];
        const r = mkRand(back * 100 + cls.id.charCodeAt(0) + (sec === "A" ? 1 : 2));
        att[key] = {
          date: ds, classId: cls.id, section: sec,
          present: studs.filter(() => r() > 0.12).map(s => s.id)
        };
      });
    });
  }
  return att;
})();

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────

const GlobalStyles = () => (
  <style>{`
    @keyframes fadeIn  { from { opacity: 0 }               to { opacity: 1 } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(15px) } to { opacity: 1; transform: translateY(0) } }
    @keyframes spin    { to   { transform: rotate(360deg) } }
    .fade-in         { animation: fadeIn  0.4s ease-out  forwards }
    .slide-up        { animation: slideUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards }
    .page-transition { animation: fadeIn  0.3s ease-out  forwards }
    * { box-sizing: border-box }
    ::-webkit-scrollbar       { width: 6px; height: 6px }
    ::-webkit-scrollbar-track { background: transparent }
    ::-webkit-scrollbar-thumb { background: #30363d; border-radius: 3px }
    ::-webkit-scrollbar-thumb:hover { background: #58a6ff55 }

    /* Mobile Responsiveness */
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
    .app-sidebar { width: 228px; background: #161b22; border-right: 1px solid #30363d; position: fixed; top: 0; left: 0; height: 100vh; display: flex; flex-direction: column; z-index: 30; transition: transform 0.3s ease; }
    .app-main { margin-left: 228px; flex: 1; padding: 24px 28px; min-height: 100vh; overflow-x: hidden; }
    .mobile-header { display: none; padding: 14px 20px; background: #161b22; border-bottom: 1px solid #30363d; position: sticky; top: 0; z-index: 25; align-items: center; justify-content: space-between; }
    .overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 28; opacity: 0; transition: opacity 0.3s ease; pointer-events: none; }
    
    @media (max-width: 768px) {
      .grid-2, .grid-4 { grid-template-columns: 1fr; gap: 16px; }
      .app-sidebar { transform: translateX(-100%); }
      .app-sidebar.open { transform: translateX(0); }
      .app-main { margin-left: 0; padding: 16px; padding-top: 20px; }
      .mobile-header { display: flex; }
      .overlay.open { display: block; opacity: 1; pointer-events: auto; }
    }
  `}</style>
);

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────

const C = {
  bg: "#0d1117",
  sidebar: "#161b22",
  card: "#21262d",
  cardB: "#30363d",
  accent: "#58a6ff",
  accentG: "#3d88e8",
  text: "#e6edf3",
  muted: "#8b949e",
  border: "#30363d",
  ok: "#3fb950",
  err: "#f85149",
  warn: "#d29922",
  purple: "#bc8cff",
};

const S = {
  card: { background: C.card, borderRadius: 10, padding: "18px 20px", border: `1px solid ${C.border}` },
  input: {
    background: "#0d1117", border: `1px solid ${C.border}`, borderRadius: 7,
    padding: "7px 12px", color: C.text, fontSize: 13, outline: "none"
  },
  sel: {
    background: "#0d1117", border: `1px solid ${C.border}`, borderRadius: 7,
    padding: "7px 10px", color: C.text, fontSize: 13, outline: "none", cursor: "pointer"
  },
  btn: { border: "none", cursor: "pointer", borderRadius: 7, fontSize: 13, fontWeight: 600, padding: "7px 14px" },
  badge: { display: "inline-block", padding: "2px 9px", borderRadius: 20, fontSize: 11, fontWeight: 700 },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  grid4: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 },
  ttip: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12 },
};

// ─── SHARED MICRO COMPONENTS ──────────────────────────────────────────────────

function Badge({ val, thresholds }) {
  const color = val >= (thresholds?.[0] ?? 90) ? C.ok : val >= (thresholds?.[1] ?? 75) ? C.warn : C.err;
  return (
    <span style={{ ...S.badge, background: `${color}22`, color }}>
      {val}%
    </span>
  );
}

function ProgressBar({ pct }) {
  const color = pct >= 90 ? C.ok : pct >= 75 ? C.warn : C.err;
  return (
    <div style={{ background: C.border, borderRadius: 4, height: 6, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, background: color, height: "100%", borderRadius: 4, transition: "width 0.6s ease" }} />
    </div>
  );
}

function StatCard({ title, value, sub, color, icon }) {
  return (
    <div style={{ ...S.card, borderLeft: `3px solid ${color}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ color: C.muted, fontSize: 12, marginBottom: 6 }}>{title}</div>
          <div style={{ fontSize: 26, fontWeight: 700, color }}>{value}</div>
          {sub && <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{sub}</div>}
        </div>
        <span style={{ fontSize: 24, opacity: 0.7 }}>{icon}</span>
      </div>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 10, padding: "9px 18px",
      width: "100%", textAlign: "left", border: "none", cursor: "pointer",
      background: active ? `${C.accent}18` : "transparent",
      borderLeft: `2px solid ${active ? C.accent : "transparent"}`,
      color: active ? C.accent : C.muted,
      fontSize: 13, fontWeight: active ? 600 : 400, transition: "all 0.15s",
    }}>
      <span style={{ fontSize: 14 }}>{icon}</span> {label}
    </button>
  );
}

function PageHeader({ title, sub }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: 0 }}>{title}</h1>
      {sub && <p style={{ fontSize: 13, color: C.muted, margin: "4px 0 0" }}>{sub}</p>}
    </div>
  );
}

function Label({ children }) {
  return <div style={{ fontSize: 11, color: C.muted, marginBottom: 5, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>{children}</div>;
}

function Divider() {
  return <div style={{ height: 1, background: C.border, margin: "14px 0" }} />;
}

const TT = { contentStyle: S.ttip, cursor: false };

// ─── ATTENDANCE HELPERS ───────────────────────────────────────────────────────

function getAttStats(students, attendance, classFilter, sectionFilter, date) {
  const classes = classFilter === "all" ? CLASSES : CLASSES.filter(c => c.id === classFilter);
  const sections = sectionFilter === "all" ? SECTIONS : [sectionFilter];
  let present = 0, total = 0;
  classes.forEach(cls => sections.forEach(sec => {
    const studs = students[`${cls.id}_${sec}`] || [];
    total += studs.length;
    const rec = attendance[`${date}_${cls.id}_${sec}`];
    if (rec) present += rec.present.length;
  }));
  return { present, total, absent: total - present, pct: total > 0 ? Math.round(present / total * 100) : 0 };
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────

function Dashboard({ students, attendance }) {
  const today = fmtDate(new Date());
  const weekDates = useMemo(() => getWeekDates(today), [today]);

  const todayStats = useMemo(() => getAttStats(students, attendance, "all", "all", today), [students, attendance, today]);

  const totalStudents = useMemo(() => Object.values(students).reduce((a, b) => a + b.length, 0), [students]);

  const weekData = useMemo(() =>
    weekDates.map(date => {
      const s = getAttStats(students, attendance, "all", "all", date);
      const d = new Date(date + "T00:00:00");
      return { day: DAY_NAMES[d.getDay()], ...s };
    }), [students, attendance, weekDates]);

  const classData = useMemo(() =>
    CLASSES.map(cls => {
      const s = getAttStats(students, attendance, cls.id, "all", today);
      return { name: cls.label, ...s };
    }), [students, attendance, today]);

  // Monthly trend (last 30 school days)
  const monthTrend = useMemo(() => {
    const pts = [];
    const d = new Date();
    while (pts.length < 22) {
      const ds = fmtDate(d);
      if (!isWeekend(ds)) {
        const s = getAttStats(students, attendance, "all", "all", ds);
        if (s.total > 0) pts.unshift({ label: `${d.getDate()} ${MONTHS[d.getMonth()]}`, pct: s.pct });
      }
      d.setDate(d.getDate() - 1);
    }
    return pts;
  }, [students, attendance]);

  // Top absent classes today
  const topAbsent = useMemo(() =>
    classData.filter(c => c.total > 0).sort((a, b) => b.absent - a.absent).slice(0, 5),
    [classData]);

  return (
    <div>
      <PageHeader title="Dashboard" sub={`Overview for ${today} &mdash; ${totalStudents} students enrolled across all classes`} />

      <div className="grid-4">
        <StatCard title="Total Students" value={totalStudents} sub="All classes enrolled" color={C.accent} icon="&#127891;" />
        <StatCard title="Present Today" value={todayStats.present} sub={`Out of ${todayStats.total}`} color={C.ok} icon="&#9989;" />
        <StatCard title="Absent Today" value={todayStats.absent} sub="Need follow-up" color={C.err} icon="&#10060;" />
        <StatCard title="Today's Rate" value={`${todayStats.pct}%`} sub="Overall attendance" color={C.warn} icon="&#128202;" />
      </div>

      <div className="grid-2" style={{ marginTop: 16  }}>
        {/* Weekly area chart */}
        <div style={S.card}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>This Week &mdash; Attendance %</div>
          <ResponsiveContainer width="100%" height={190}>
            <AreaChart data={weekData}>
              <defs>
                <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.accent} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={C.accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="day" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} domain={[60, 100]} />
              <Tooltip {...TT} formatter={v => [`${v}%`, "Attendance"]} />
              <Area type="monotone" dataKey="pct" stroke={C.accent} fill="url(#wg)" strokeWidth={2} dot={{ r: 3, fill: C.accent }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie summary */}
        <div style={S.card}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Today's Breakdown</div>
          <ResponsiveContainer width="100%" height={190}>
            <PieChart>
              <Pie data={[
                { name: "Present", value: todayStats.present },
                { name: "Absent", value: todayStats.absent },
              ]} cx="50%" cy="50%" innerRadius={52} outerRadius={78} dataKey="value" paddingAngle={3}>
                <Cell fill={C.ok} />
                <Cell fill={C.err} />
              </Pie>
              <Tooltip {...TT} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 22-day trend */}
      <div style={{ ...S.card, marginTop: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>30-Day Attendance Trend</div>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={monthTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
            <XAxis dataKey="label" tick={{ fill: C.muted, fontSize: 10 }} interval={4} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} domain={[60, 100]} />
            <Tooltip {...TT} formatter={v => [`${v}%`, "Attendance"]} />
            <Line type="monotone" dataKey="pct" stroke={C.purple} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Class-wise bar */}
      <div style={{ ...S.card, marginTop: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Today by Class &mdash; Present vs Absent</div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={classData} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
            <XAxis dataKey="name" tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip {...TT} />
            <Bar dataKey="present" fill={C.ok} name="Present" radius={[3, 3, 0, 0]} stackId="a" />
            <Bar dataKey="absent" fill={C.err} name="Absent" radius={[3, 3, 0, 0]} stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top absent today */}
      <div style={{ ...S.card, marginTop: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Highest Absences Today</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {topAbsent.map(r => (
            <div key={r.name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 80, fontSize: 13, fontWeight: 600, color: C.text }}>{r.name}</div>
              <div style={{ flex: 1 }}><ProgressBar pct={r.pct} /></div>
              <div style={{ width: 36, textAlign: "right" }}><Badge val={r.pct} /></div>
              <div style={{ width: 60, fontSize: 12, color: C.muted, textAlign: "right" }}>{r.absent} absent</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── MARK ATTENDANCE ──────────────────────────────────────────────────────────

function MarkAttendance({ students, attendance, onSave }) {
  const [cls, setCls] = useState(CLASSES[0].id);
  const [sec, setSec] = useState("A");
  const [date, setDate] = useState(fmtDate(new Date()));
  const [marked, setMarked] = useState({});
  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState(false);

  const attKey = `${date}_${cls}_${sec}`;
  const studKey = `${cls}_${sec}`;
  const studs = students[studKey] || [];
  const visible = search
    ? studs.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || String(s.rollNo).includes(search))
    : studs;

  useEffect(() => {
    const rec = attendance[attKey];
    if (rec) {
      const m = {};
      rec.present.forEach(id => (m[id] = true));
      setMarked(m);
    } else {
      const m = {};
      studs.forEach(s => (m[s.id] = true));
      setMarked(m);
    }
    setSaved(false);
  }, [cls, sec, date]);

  const toggle = id => setMarked(p => ({ ...p, [id]: !p[id] }));
  const markAll = () => { const m = {}; studs.forEach(s => (m[s.id] = true)); setMarked(m); };
  const markNone = () => { const m = {}; studs.forEach(s => (m[s.id] = false)); setMarked(m); };

  const handleSave = () => {
    const present = studs.filter(s => marked[s.id]).map(s => s.id);
    onSave({ ...attendance, [attKey]: { date, classId: cls, section: sec, present } });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const presentCount = studs.filter(s => marked[s.id]).length;
  const pct = studs.length > 0 ? Math.round(presentCount / studs.length * 100) : 0;

  return (
    <div>
      <PageHeader title="Mark Attendance" sub="Select class, section and date, then mark each student" />

      {/* Controls row */}
      <div style={{ ...S.card, marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div>
            <Label>Class</Label>
            <select style={S.sel} value={cls} onChange={e => setCls(e.target.value)}>
              {CLASSES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <Label>Section</Label>
            <select style={S.sel} value={sec} onChange={e => setSec(e.target.value)}>
              {SECTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
            </select>
          </div>
          <div>
            <Label>Date</Label>
            <input type="date" style={{ ...S.input, cursor: "pointer" }} value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <Label>Search Student</Label>
            <input style={{ ...S.input, width: "100%", boxSizing: "border-box" }} placeholder="Name or roll no&hellip;" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
            <button style={{ ...S.btn, background: C.border, color: C.text }} onClick={markAll}>All Present</button>
            <button style={{ ...S.btn, background: C.border, color: C.text }} onClick={markNone}>All Absent</button>
            <button style={{ ...S.btn, background: saved ? C.ok : C.accent, color: "#fff", minWidth: 130 }} onClick={handleSave}>
              {saved ? "&#10003; Saved!" : "Save Attendance"}
            </button>
          </div>
        </div>

        <Divider />
        <div style={{ display: "flex", gap: 28, fontSize: 13 }}>
          <span><span style={{ color: C.muted }}>Total: </span><strong style={{ color: C.text }}>{studs.length}</strong></span>
          <span><span style={{ color: C.muted }}>Present: </span><strong style={{ color: C.ok }}>{presentCount}</strong></span>
          <span><span style={{ color: C.muted }}>Absent: </span><strong style={{ color: C.err }}>{studs.length - presentCount}</strong></span>
          <span><span style={{ color: C.muted }}>Rate: </span><strong style={{ color: C.warn }}>{pct}%</strong></span>
        </div>
      </div>

      {/* Student grid */}
      <div style={S.card}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>
          {CLASSES.find(c => c.id === cls)?.label} &mdash; Section {sec}
          <span style={{ color: C.muted, fontWeight: 400, marginLeft: 6 }}>({visible.length} students)</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 8 }}>
          {visible.map(student => {
            const here = !!marked[student.id];
            return (
              <div key={student.id} onClick={() => toggle(student.id)} style={{
                display: "flex", alignItems: "center", gap: 11, padding: "10px 14px",
                borderRadius: 8, cursor: "pointer", transition: "all 0.15s",
                background: here ? `${C.ok}18` : `${C.err}12`,
                border: `1px solid ${here ? `${C.ok}44` : `${C.err}33`}`,
              }}>
                <div style={{
                  width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                  background: here ? C.ok : C.err, display: "flex",
                  alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff",
                }}>
                  {here ? "&#10003;" : "&#10007;"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{student.name}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>Roll No: {student.rollNo}</div>
                </div>
                <span style={{ ...S.badge, background: here ? `${C.ok}22` : `${C.err}22`, color: here ? C.ok : C.err, flexShrink: 0 }}>
                  {here ? "Present" : "Absent"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── STUDENTS PAGE ────────────────────────────────────────────────────────────

function StudentsPage({ students, onSave }) {
  const [cls, setCls] = useState(CLASSES[0].id);
  const [sec, setSec] = useState("A");
  const [newName, setNewName] = useState("");
  const [search, setSearch] = useState("");

  const key = `${cls}_${sec}`;
  const current = students[key] || [];
  const visible = search
    ? current.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || String(s.rollNo).includes(search))
    : current;

  const addStudent = () => {
    if (!newName.trim()) return;
    const maxRoll = current.length > 0 ? Math.max(...current.map(s => s.rollNo)) : 0;
    const updated = { ...students, [key]: [...current, { id: `s_${Date.now()}`, name: newName.trim(), rollNo: maxRoll + 1 }] };
    onSave(updated);
    setNewName("");
  };

  const remove = id => onSave({ ...students, [key]: current.filter(s => s.id !== id) });

  return (
    <div>
      <PageHeader title="Student Management" sub="Add, view, or remove students per class and section" />

      <div style={{ ...S.card, marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div><Label>Class</Label>
            <select style={S.sel} value={cls} onChange={e => setCls(e.target.value)}>
              {CLASSES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          <div><Label>Section</Label>
            <select style={S.sel} value={sec} onChange={e => setSec(e.target.value)}>
              {SECTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 180 }}><Label>Search</Label>
            <input style={{ ...S.input, width: "100%", boxSizing: "border-box" }} placeholder="Name or roll no&hellip;" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <Divider />
        <div style={{ display: "flex", gap: 10 }}>
          <input
            style={{ ...S.input, flex: 1 }}
            placeholder="Enter full name to add new student&hellip;"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addStudent()}
          />
          <button style={{ ...S.btn, background: C.accent, color: "#fff", whiteSpace: "nowrap" }} onClick={addStudent}>+ Add Student</button>
        </div>
      </div>

      <div style={S.card}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>
          {CLASSES.find(c => c.id === cls)?.label} &mdash; Section {sec}
          <span style={{ color: C.muted, fontWeight: 400, marginLeft: 6 }}>({visible.length} of {current.length})</span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Roll No", "Student Name", "Class", "Section", "Action"].map(h => (
                <th key={h} style={{
                  padding: "8px 12px", textAlign: "left", fontSize: 11, color: C.muted, fontWeight: 600,
                  textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: `1px solid ${C.border}`
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((s, i) => (
              <tr key={s.id} style={{ background: i % 2 === 0 ? "transparent" : "#ffffff04" }}>
                <td style={{ padding: "9px 12px", fontSize: 13, color: C.muted }}>{s.rollNo}</td>
                <td style={{ padding: "9px 12px", fontSize: 13, fontWeight: 600 }}>{s.name}</td>
                <td style={{ padding: "9px 12px", fontSize: 13 }}>
                  <span style={{ ...S.badge, background: `${C.accent}20`, color: C.accent }}>{CLASSES.find(c => c.id === cls)?.label}</span>
                </td>
                <td style={{ padding: "9px 12px", fontSize: 13 }}>
                  <span style={{ ...S.badge, background: `${C.purple}20`, color: C.purple }}>Section {sec}</span>
                </td>
                <td style={{ padding: "9px 12px" }}>
                  <button onClick={() => remove(s.id)} style={{ ...S.btn, background: `${C.err}20`, color: C.err, padding: "4px 12px", fontSize: 12 }}>Remove</button>
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr><td colSpan={5} style={{ padding: "28px 12px", textAlign: "center", color: C.muted, fontSize: 13 }}>No students found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── REPORTS PAGE ─────────────────────────────────────────────────────────────

function ReportsPage({ students, attendance }) {
  const today = fmtDate(new Date());
  const todayD = new Date(today + "T00:00:00");
  const [view, setView] = useState("weekly");
  const [cls, setCls] = useState("all");
  const [sec, setSec] = useState("all");
  const [month, setMonth] = useState(todayD.getMonth());
  const [year, setYear] = useState(todayD.getFullYear());

  // Build daily data for the selected month
  const monthData = useMemo(() => {
    const days = new Date(year, month + 1, 0).getDate();
    const out = [];
    for (let d = 1; d <= days; d++) {
      const date = new Date(year, month, d);
      const ds = fmtDate(date);
      if (isWeekend(ds)) continue;
      const s = getAttStats(students, attendance, cls, sec, ds);
      out.push({ date: d, pct: s.pct, present: s.present, absent: s.absent, total: s.total });
    }
    return out;
  }, [cls, sec, month, year, students, attendance]);

  // Weekly data (Mon-Fri of current/selected week)
  const weekData = useMemo(() => {
    const weekDates = getWeekDates(today);
    return weekDates.map(ds => {
      const s = getAttStats(students, attendance, cls, sec, ds);
      const d = new Date(ds + "T00:00:00");
      return { day: DAY_NAMES[d.getDay()], date: ds, ...s };
    });
  }, [cls, sec, students, attendance, today]);

  // Yearly monthly summary
  const yearData = useMemo(() =>
    MONTHS.map((m, mi) => {
      const days = new Date(year, mi + 1, 0).getDate();
      let tot = 0, pres = 0;
      for (let d = 1; d <= days; d++) {
        const ds = fmtDate(new Date(year, mi, d));
        if (isWeekend(ds)) continue;
        const s = getAttStats(students, attendance, cls, sec, ds);
        if (s.total > 0) { tot += s.total; pres += s.present; }
      }
      return { month: m, pct: tot > 0 ? Math.round(pres / tot * 100) : 0, present: pres, absent: tot - pres };
    }), [cls, sec, year, students, attendance]);

  const displayData = view === "weekly" ? weekData : view === "monthly" ? monthData : yearData;
  const xKey = view === "weekly" ? "day" : view === "monthly" ? "date" : "month";

  return (
    <div>
      <PageHeader title="Reports & Analytics" sub="Filter by class, section, date range and view pattern" />

      {/* Filter bar */}
      <div style={{ ...S.card, marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div>
            <Label>View</Label>
            <div style={{ display: "flex", gap: 4 }}>
              {[["weekly", "Weekly"], ["monthly", "Monthly"], ["yearly", "Yearly"]].map(([v, l]) => (
                <button key={v} onClick={() => setView(v)} style={{
                  ...S.btn,
                  background: view === v ? C.accent : C.border,
                  color: view === v ? "#fff" : C.muted,
                  padding: "6px 14px", fontSize: 12,
                }}>{l}</button>
              ))}
            </div>
          </div>
          <div><Label>Class</Label>
            <select style={S.sel} value={cls} onChange={e => setCls(e.target.value)}>
              <option value="all">All Classes</option>
              {CLASSES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          <div><Label>Section</Label>
            <select style={S.sel} value={sec} onChange={e => setSec(e.target.value)}>
              <option value="all">Both</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
            </select>
          </div>
          {view !== "yearly" && (
            <div><Label>Month</Label>
              <select style={S.sel} value={month} onChange={e => setMonth(Number(e.target.value))}>
                {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
              </select>
            </div>
          )}
          <div><Label>Year</Label>
            <select style={S.sel} value={year} onChange={e => setYear(Number(e.target.value))}>
              {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ ...S.card, marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>
          {view === "weekly" ? "This Week" : view === "monthly" ? `${MONTHS[month]} ${year}` : `Year ${year}`} &mdash; Attendance %
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={displayData}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
            <XAxis dataKey={xKey} tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
            <Tooltip {...TT} formatter={v => [`${v}%`, "Attendance"]} />
            <Bar dataKey="pct" radius={[4, 4, 0, 0]} name="Attendance %" fill={C.accent} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Stacked present/absent */}
      <div style={{ ...S.card, marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Present vs Absent &mdash; Headcount</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={displayData}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
            <XAxis dataKey={xKey} tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip {...TT} />
            <Bar dataKey="present" fill={C.ok} name="Present" stackId="x" radius={[0, 0, 0, 0]} />
            <Bar dataKey="absent" fill={C.err} name="Absent" stackId="x" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Data table */}
      <div style={S.card}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Detailed Data</div>
        <div style={{ maxHeight: 320, overflowY: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ position: "sticky", top: 0, background: C.card, zIndex: 1 }}>
              <tr>
                {[view === "yearly" ? "Month" : view === "monthly" ? "Date" : "Day", "Present", "Absent", "Total", "Rate"].map(h => (
                  <th key={h} style={{
                    padding: "8px 12px", textAlign: "left", fontSize: 11, color: C.muted,
                    fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em",
                    borderBottom: `1px solid ${C.border}`
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayData.filter(r => r.total > 0).map((r, i) => (
                <tr key={i} style={{ background: i % 2 ? "#ffffff04" : "transparent" }}>
                  <td style={{ padding: "8px 12px", fontSize: 13, fontWeight: 500 }}>
                    {view === "monthly" ? `${r.date} ${MONTHS[month]}` : r[xKey]}
                  </td>
                  <td style={{ padding: "8px 12px", fontSize: 13, color: C.ok, fontWeight: 600 }}>{r.present}</td>
                  <td style={{ padding: "8px 12px", fontSize: 13, color: C.err, fontWeight: 600 }}>{r.absent}</td>
                  <td style={{ padding: "8px 12px", fontSize: 13, color: C.muted }}>{r.total}</td>
                  <td style={{ padding: "8px 12px" }}><Badge val={r.pct} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── YEARLY VIEW ──────────────────────────────────────────────────────────────

function YearlyView({ students, attendance }) {
  const [year, setYear] = useState(new Date().getFullYear());

  const classAnnual = useMemo(() =>
    CLASSES.map(cls => {
      let pres = 0, tot = 0;
      SECTIONS.forEach(sec => {
        const studs = students[`${cls.id}_${sec}`] || [];
        Object.entries(attendance).forEach(([key, rec]) => {
          if (key.startsWith(String(year)) && key.includes(`_${cls.id}_${sec}`)) {
            pres += rec.present.length;
            tot += studs.length;
          }
        });
      });
      return { class: cls.label, pct: tot > 0 ? Math.round(pres / tot * 100) : 0 };
    }), [year, students, attendance]);

  const monthlyForClasses = useMemo(() =>
    MONTHS.map((m, mi) => {
      const row = { month: m };
      // Compare 3 key classes
      ["nursery", "3", "6", "9", "12"].forEach(cid => {
        const cls = CLASSES.find(c => c.id === cid);
        if (!cls) return;
        let pres = 0, tot = 0;
        const days = new Date(year, mi + 1, 0).getDate();
        for (let d = 1; d <= days; d++) {
          const ds = fmtDate(new Date(year, mi, d));
          if (isWeekend(ds)) continue;
          const s = getAttStats(students, attendance, cid, "all", ds);
          pres += s.present; tot += s.total;
        }
        row[cls.label] = tot > 0 ? Math.round(pres / tot * 100) : 0;
      });
      return row;
    }), [year, students, attendance]);

  const colors = [C.accent, C.ok, C.warn, C.purple, C.err];
  const compClasses = ["Nursery", "Class 3", "Class 6", "Class 9", "Class 12"];

  return (
    <div>
      <PageHeader title="Yearly Analysis" sub="Full academic year class-wise attendance breakdown" />

      <div style={{ ...S.card, marginBottom: 16, display: "inline-flex", alignItems: "center", gap: 12 }}>
        <Label>Year</Label>
        <select style={S.sel} value={year} onChange={e => setYear(Number(e.target.value))}>
          {[2023, 2024, 2025, 2026].map(y => <option key={y}>{y}</option>)}
        </select>
      </div>

      {/* Horizontal bar: class attendance % */}
      <div style={{ ...S.card, marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Annual Attendance Rate by Class &mdash; {year}</div>
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={classAnnual} layout="vertical" margin={{ left: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false} />
            <XAxis type="number" domain={[0, 100]} tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="class" tick={{ fill: C.text, fontSize: 12 }} width={70} axisLine={false} tickLine={false} />
            <Tooltip {...TT} formatter={v => [`${v}%`, "Attendance"]} />
            <Bar dataKey="pct" name="Attendance %" radius={[0, 4, 4, 0]}>
              {classAnnual.map((e, i) => (
                <Cell key={i} fill={e.pct >= 90 ? C.ok : e.pct >= 75 ? C.warn : C.err} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Multi-line comparison */}
      <div style={{ ...S.card, marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Month-wise Comparison (Key Classes) &mdash; {year}</div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={monthlyForClasses}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
            <XAxis dataKey="month" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} domain={[60, 100]} />
            <Tooltip {...TT} formatter={v => [`${v}%`, ""]} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {compClasses.map((name, i) => (
              <Line key={name} type="monotone" dataKey={name} stroke={colors[i]} strokeWidth={2} dot={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary table */}
      <div style={S.card}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>All Classes Summary &mdash; {year}</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Class", "Annual Rate", "Progress", "Status"].map(h => (
                <th key={h} style={{
                  padding: "8px 12px", textAlign: "left", fontSize: 11, color: C.muted,
                  fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em",
                  borderBottom: `1px solid ${C.border}`
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {classAnnual.map((r, i) => (
              <tr key={i} style={{ background: i % 2 ? "#ffffff04" : "transparent" }}>
                <td style={{ padding: "10px 12px", fontWeight: 600, fontSize: 13 }}>{r.class}</td>
                <td style={{ padding: "10px 12px" }}><Badge val={r.pct} /></td>
                <td style={{ padding: "10px 12px", width: 200 }}><ProgressBar pct={r.pct} /></td>
                <td style={{ padding: "10px 12px" }}>
                  <span style={{
                    ...S.badge,
                    background: r.pct >= 90 ? `${C.ok}22` : r.pct >= 75 ? `${C.warn}22` : `${C.err}22`,
                    color: r.pct >= 90 ? C.ok : r.pct >= 75 ? C.warn : C.err
                  }}>
                    {r.pct >= 90 ? "Excellent" : r.pct >= 75 ? "Good" : "Needs Attention"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── CLASS OVERVIEW ───────────────────────────────────────────────────────────

function ClassOverview({ students, attendance }) {
  const today = fmtDate(new Date());
  const [selDate, setSelDate] = useState(today);

  const data = useMemo(() =>
    CLASSES.map(cls => {
      const secs = SECTIONS.map(sec => {
        const studs = students[`${cls.id}_${sec}`] || [];
        const rec = attendance[`${selDate}_${cls.id}_${sec}`];
        const pres = rec ? rec.present.length : 0;
        return { sec, total: studs.length, present: pres, absent: studs.length - pres };
      });
      const total = secs.reduce((a, b) => a + b.total, 0);
      const present = secs.reduce((a, b) => a + b.present, 0);
      return {
        cls: cls.label, secs, total, present, absent: total - present,
        pct: total > 0 ? Math.round(present / total * 100) : 0
      };
    }), [students, attendance, selDate]);

  return (
    <div>
      <PageHeader title="Class Overview" sub="See all classes at a glance with section-wise breakdown" />

      <div style={{ ...S.card, marginBottom: 16, display: "inline-flex", alignItems: "center", gap: 12 }}>
        <Label>Date</Label>
        <input type="date" style={{ ...S.input, cursor: "pointer" }} value={selDate} onChange={e => setSelDate(e.target.value)} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
        {data.map(row => (
          <div key={row.cls} style={S.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{row.cls}</div>
              <Badge val={row.pct} />
            </div>

            <div style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.muted, marginBottom: 4 }}>
                <span>Combined</span>
                <span>{row.present}/{row.total}</span>
              </div>
              <ProgressBar pct={row.pct} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {row.secs.map(s => {
                const p = s.total > 0 ? Math.round(s.present / s.total * 100) : 0;
                return (
                  <div key={s.sec} style={{ background: "#ffffff08", borderRadius: 8, padding: "10px 12px" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, color: C.accent }}>Section {s.sec}</div>
                    <div style={{ fontSize: 12, color: C.muted }}>Total: <strong style={{ color: C.text }}>{s.total}</strong></div>
                    <div style={{ fontSize: 12, color: C.ok }}>Present: <strong>{s.present}</strong></div>
                    <div style={{ fontSize: 12, color: C.err }}>Absent: <strong>{s.absent}</strong></div>
                    <div style={{ marginTop: 6 }}><ProgressBar pct={p} /></div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── STUDENT PROFILE ──────────────────────────────────────────────────────────

function StudentProfile({ students, attendance }) {
  const [cls, setCls] = useState(CLASSES[0].id);
  const [sec, setSec] = useState("A");
  const [selId, setSelId] = useState("");
  const [search, setSearch] = useState("");

  const studs = students[`${cls}_${sec}`] || [];
  const visibleStuds = search
    ? studs.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || String(s.rollNo).includes(search))
    : studs;

  const selStudent = studs.find(s => s.id === selId) || studs[0];

  useEffect(() => {
    if (!studs.find(s => s.id === selId) && studs.length > 0) {
      setSelId(studs[0].id);
    }
  }, [cls, sec, studs, selId]);

  const stats = useMemo(() => {
    if (!selStudent) return null;
    let total = 0, present = 0;
    const absences = [];
    const monthly = {};

    MONTHS.forEach(m => monthly[m] = { month: m, total: 0, present: 0 });

    Object.values(attendance).forEach(rec => {
      if (rec.classId === cls && rec.section === sec) {
        total++;
        const pDate = new Date(rec.date + "T00:00:00");
        const mName = MONTHS[pDate.getMonth()];
        monthly[mName].total++;

        if (rec.present.includes(selStudent.id)) {
          present++;
          monthly[mName].present++;
        } else {
          absences.push(rec.date);
        }
      }
    });

    absences.sort((a, b) => new Date(b) - new Date(a));
    const absent = total - present;
    const pct = total > 0 ? Math.round(present / total * 100) : 0;

    const monthData = MONTHS.map(m => {
      const d = monthly[m];
      return { month: m, pct: d.total > 0 ? Math.round(d.present / d.total * 100) : 0, ...d };
    }).filter(d => d.total > 0);

    return { total, present, absent, pct, absences, monthData };
  }, [selStudent, cls, sec, attendance]);

  return (
    <div>
      <PageHeader title="Individual Student Data" sub="View detailed attendance stats and history for a specific student" />

      <div style={{ ...S.card, marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div><Label>Class</Label>
            <select style={S.sel} value={cls} onChange={e => { setCls(e.target.value); setSearch(""); }}>
              {CLASSES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          <div><Label>Section</Label>
            <select style={S.sel} value={sec} onChange={e => { setSec(e.target.value); setSearch(""); }}>
              {SECTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 180 }}><Label>Search</Label>
            <input style={{ ...S.input, width: "100%", boxSizing: "border-box" }} placeholder="Filter by name..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div><Label>Student</Label>
            <select style={{ ...S.sel, minWidth: 200 }} value={selStudent?.id || ""} onChange={e => setSelId(e.target.value)}>
              {visibleStuds.map(s => <option key={s.id} value={s.id}>{s.name} (Roll: {s.rollNo})</option>)}
            </select>
          </div>
        </div>
      </div>

      {!selStudent ? (
        <div style={S.card}><div style={{ color: C.muted, padding: 20, textAlign: "center" }}>No students found in this section.</div></div>
      ) : stats ? (
        <>
          <div style={{ ...S.card, marginBottom: 16, display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700, color: "#fff" }}>
              {selStudent.name.charAt(0)}
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ margin: "0 0 4px", fontSize: 20, color: C.text }}>{selStudent.name}</h2>
              <div style={{ color: C.muted, fontSize: 13 }}>
                Roll No: <strong style={{ color: C.text }}>{selStudent.rollNo}</strong> â€¢ {CLASSES.find(c => c.id === cls)?.label} &mdash; Section {sec}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: stats.pct >= 90 ? C.ok : stats.pct >= 75 ? C.warn : C.err }}>{stats.pct}%</div>
              <div style={{ fontSize: 12, color: C.muted }}>Overall Attendance</div>
            </div>
          </div>

          <div className="grid-4" style={{ marginBottom: 16  }}>
            <StatCard title="Total School Days" value={stats.total} color={C.accent} icon="&#127979;" />
            <StatCard title="Days Present" value={stats.present} color={C.ok} icon="&#9989;" />
            <StatCard title="Days Absent" value={stats.absent} color={C.err} icon="&#10060;" />
            <div style={S.card}>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>Status</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: stats.pct >= 90 ? C.ok : stats.pct >= 75 ? C.warn : C.err }}>
                {stats.pct >= 90 ? "Excellent" : stats.pct >= 75 ? "Needs Improvement" : "Critical Warning"}
              </div>
              <div style={{ marginTop: 8 }}><ProgressBar pct={stats.pct} /></div>
            </div>
          </div>

          <div className="grid-2" style={{ alignItems: "start"  }}>
            <div style={S.card}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Monthly Performance</div>
              {stats.monthData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={stats.monthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <Tooltip {...TT} formatter={v => [`${v}%`, "Attendance"]} />
                    <Bar dataKey="pct" radius={[4, 4, 0, 0]}>
                      {stats.monthData.map((e, i) => <Cell key={i} fill={e.pct >= 90 ? C.ok : e.pct >= 75 ? C.warn : C.err} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ color: C.muted, fontSize: 13, padding: 20 }}>No monthly data available.</div>
              )}
            </div>

            <div style={S.card}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Absence History</div>
              {stats.absences.length === 0 ? (
                <div style={{ padding: 20, textAlign: "center", color: C.muted }}>No absences recorded. Perfect attendance! &#127881;</div>
              ) : (
                <div style={{ maxHeight: 220, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
                  {stats.absences.map(d => {
                    const absDate = new Date(d + "T00:00:00");
                    return (
                      <div key={d} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "#ffffff04", borderRadius: 6, border: `1px solid ${C.border}` }}>
                        <div style={{ color: C.text, fontSize: 13, fontWeight: 500 }}>{absDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</div>
                        <div style={{ color: C.err, fontSize: 12, fontWeight: 600 }}>Absent</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────

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

export function LoginScreen({ onLogin }) {
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

export default function App() {
  const [user,    setUser]    = useState(null);
  const [page,    setPage]    = useState("dashboard");
  const [syncing, setSyncing] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [students, setStudents]     = useState(INIT_STUDENTS);
  const [attendance, setAttendance] = useState(INIT_ATTENDANCE);
  const [dbLoaded, setDbLoaded]     = useState(false);
  const [dbError, setDbError]       = useState("");

  useEffect(() => {
    if (!db) { setDbLoaded(true); return; } // Fallback if no firebase script
    setSyncing(true);
    let unsubS = () => {}, unsubA = () => {};
    
    // Subscribe to real-time updates from Firestore
    unsubS = db.collection("edutrack").doc("students_v2").onSnapshot(doc => {
      if (doc.exists) setStudents(doc.data().data);
      else db.collection("edutrack").doc("students_v2").set({ data: INIT_STUDENTS });
    }, err => { setDbError(err.message); setDbLoaded(true); });
    
    unsubA = db.collection("edutrack").doc("attendance_v2").onSnapshot(doc => {
      if (doc.exists) setAttendance(doc.data().data);
      else db.collection("edutrack").doc("attendance_v2").set({ data: INIT_ATTENDANCE });
      setDbLoaded(true);
      setSyncing(false);
    }, err => { setDbError(err.message); setDbLoaded(true); });
    
    return () => { unsubS(); unsubA(); };
  }, []);

  const saveStudents = async s => { 
    setStudents(s); 
    if (db) {
       setSyncing(true);
       await db.collection("edutrack").doc("students_v2").set({ data: s }); 
       setSyncing(false);
    }
  };
  
  const saveAttendance = async a => { 
    setAttendance(a); 
    if (db) {
       setSyncing(true);
       await db.collection("edutrack").doc("attendance_v2").set({ data: a }); 
       setSyncing(false);
    }
  };

  const totalStudents = useMemo(() => Object.values(students).reduce((acc, v) => acc + v.length, 0), [students]);
  const today = fmtDate(new Date());

  if (!dbLoaded) return <><GlobalStyles /><LoadingOverlay /></>;
  if (dbError) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: C.bg, color: C.text, padding: 20 }}>
      <div style={{ background: "#21262d", padding: "30px", borderRadius: 12, border: "2px solid #f85149", maxWidth: 600 }}>
         <h2 style={{ color: "#f85149", margin: "0 0 8px 0" }}>Firebase Connection Blocked</h2>
         <p style={{ margin: "0 0 16px 0", lineHeight: 1.5 }}>Your application is working perfectly, but a security setting in your <strong>Firebase Database</strong> is blocking the app from reading your data!</p>
         <p style={{ color: "#8b949e", fontSize: 13, background: "#0d1117", padding: 10, borderRadius: 6, margin: "0 0 20px 0" }}><i>Error: {dbError}</i></p>
         <p style={{ margin: "0 0 10px 0", fontWeight: 600 }}>To fix this instantly, login to your Firebase Console &rarr; Firestore Database &rarr; Rules, and paste EXACTLY this into the editor:</p>
         <pre style={{ background: "#0d1117", padding: "16px", borderRadius: 6, color: "#58a6ff", fontSize: 14, border: "1px solid #30363d", overflowX: "auto", margin: "0 0 20px 0" }}>{`service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`}</pre>
         <button onClick={() => window.location.reload()} style={{ background: "#58a6ff", color: "#fff", border: "none", padding: "12px", borderRadius: 6, cursor: "pointer", fontWeight: "bold", width: "100%", fontSize: 14 }}>I've published the new rules, Try Again!</button>
      </div>
    </div>
  );
  if (!user) return <><GlobalStyles /><LoginScreen onLogin={setUser} /></>;

  const nav = [
    { id: "dashboard", icon: "&#8862;", label: "Dashboard" },
    { id: "mark", icon: "&#10004;", label: "Mark Attendance" },
    { id: "students", icon: "&#9678;", label: "Students" },
    { id: "profile", icon: "&#128100;", label: "Student Profile" },
    { id: "reports", icon: "&#9638;", label: "Reports" },
    { id: "yearly", icon: "&#9672;", label: "Yearly View" },
    { id: "classes", icon: "&#9636;", label: "Class Overview" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif", fontSize: 14 }}>
      <GlobalStyles />
      {syncing && <LoadingOverlay />}

      {/* Mobile Top Header */}
      <div className="mobile-header">
         <div style={{ fontSize: 18, fontWeight: 800, color: C.accent, display: "flex", alignItems: "center", gap: 8 }}>
           <span style={{ fontSize: 20 }}>&#127979;</span> EduTrack Pro
         </div>
         <button onClick={() => setNavOpen(true)} style={{ background: "transparent", border: "none", color: C.text, fontSize: 24, cursor: "pointer", padding: 0 }}>&#9776;</button>
      </div>

      {/* Mobile Overlay */}
      <div className={`overlay ${navOpen ? 'open' : ''}`} onClick={() => setNavOpen(false)} />

      <aside className={`app-sidebar ${navOpen ? 'open' : ''}`}>
        <div style={{ padding: "20px 18px 16px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: C.accent, letterSpacing: -0.5, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 20 }}>&#127979;</span> EduTrack Pro
          </div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>School Attendance System</div>
        </div>

        <nav style={{ flex: 1, padding: "10px 0", overflowY: "auto" }}>
          {nav.map(({ id, icon, label }) => (
            <NavItem key={id} icon={icon} label={label} active={page === id} onClick={() => { setPage(id); setNavOpen(false); }} />
          ))}
        </nav>

        <div style={{ padding: "12px 18px", borderTop: `1px solid ${C.border}`, fontSize: 12, color: C.muted }}>
          <div style={{ marginBottom: 4 }}>&#128218; <strong style={{ color: C.text }}>{totalStudents}</strong> students enrolled</div>
          <div>&#128197; <strong style={{ color: C.text }}>{today}</strong></div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main key={page} className="page-transition app-main">
        {page === "dashboard" && <Dashboard students={students} attendance={attendance} user={user} />}
        {page === "mark" && <MarkAttendance students={students} attendance={attendance} onSave={saveAttendance} />}
        {page === "students" && <StudentsPage students={students} onSave={saveStudents} />}
        {page === "profile" && <StudentProfile students={students} attendance={attendance} />}
        {page === "reports" && <ReportsPage students={students} attendance={attendance} />}
        {page === "yearly" && <YearlyView students={students} attendance={attendance} />}
        {page === "classes" && <ClassOverview students={students} attendance={attendance} />}
      </main>
    </div>
  );
}

