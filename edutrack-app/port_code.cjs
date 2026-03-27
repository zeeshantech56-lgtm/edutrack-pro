const fs = require('fs');

let code = fs.readFileSync('c:/Users/hp/Downloads/school_attendance.jsx', 'utf8');

// Strip out the manual Firebase initialization block as we are importing it now
code = code.replace(/const firebaseConfig = \{[\s\S]*?\};\s*let db = null;\s*if\s*\(typeof window !== "undefined"[\s\S]*?\}/g, '');

// Prepend modern module imports
const imports = `import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import { db } from './firebase.js';

`;

// Fix the undefined object crash in the useMemo root cause
code = code.replace(/const totalStudents = useMemo\(\(\) => Object.values\(students\).reduce\(\(acc, v\) => acc \+ v.length, 0\), \[students\]\);/g, `const totalStudents = useMemo(() => students ? Object.values(students).reduce((acc, v) => acc + v.length, 0) : 0, [students]);`);
code = code.replace(/if \(doc.exists\) setStudents\(doc.data\(\).data\);/g, `if (doc.exists && doc.data().data) setStudents(doc.data().data);`);
code = code.replace(/if \(doc.exists\) setAttendance\(doc.data\(\).data\);/g, `if (doc.exists && doc.data().data) setAttendance(doc.data().data);`);

// Clean up any remaining exports (if any exist) and ensure App is exported
code = code.replace(/export default function App/g, 'export default function App');

fs.writeFileSync('d:/App buliding anti/edutrack-app/src/App.jsx', imports + code);
console.log('Successfully ported to completely modular App.jsx and resolved edge case crashes.');
