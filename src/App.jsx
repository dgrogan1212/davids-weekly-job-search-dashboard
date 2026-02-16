
import React, { useState, useEffect } from "react";

const tasks = [
  "Apply to 3 roles",
  "Send 1 networking message",
  "Follow up on 1 contact",
  "Log progress in tracker"
];

export default function App() {
  const [checked, setChecked] = useState({});

  useEffect(() => {
    const saved = localStorage.getItem("dashboard");
    if (saved) setChecked(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("dashboard", JSON.stringify(checked));
  }, [checked]);

  const toggle = (i) => {
    setChecked(prev => ({ ...prev, [i]: !prev[i] }));
  };

  const completed = Object.values(checked).filter(Boolean).length;
  const progress = Math.round((completed / tasks.length) * 100);

  return (
    <div style={{ fontFamily: "sans-serif", padding: 24 }}>
      <h1>David's Weekly Job Search Dashboard</h1>

      <div style={{ background: "#eee", height: 20, borderRadius: 10, overflow: "hidden", margin: "16px 0" }}>
        <div style={{ width: progress + "%", background: "black", height: "100%" }} />
      </div>
      <p>{progress}% complete</p>

      <ul>
        {tasks.map((t, i) => (
          <li key={i} style={{ cursor: "pointer", marginBottom: 8 }} onClick={() => toggle(i)}>
            <input type="checkbox" readOnly checked={!!checked[i]} /> {t}
          </li>
        ))}
      </ul>
    </div>
  );
}
