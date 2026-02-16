import React, { useState, useEffect } from "react";

const week = [
  {
    day: "Monday",
    tasks: [
      { text: "Identify 15–20 new roles", time: 30 },
      { text: "Select 5 roles to pursue", time: 20 },
      { text: "Send 2 networking messages", time: 20 },
      { text: "Update tracker", time: 10 },
    ],
  },
  {
    day: "Tuesday",
    tasks: [
      { text: "Submit 3 tailored applications", time: 90 },
      { text: "Send 1 networking outreach", time: 15 },
      { text: "Send 1 follow-up message", time: 10 },
    ],
  },
  {
    day: "Wednesday",
    tasks: [
      { text: "Schedule or hold 1 informational call", time: 45 },
      { text: "Submit 2 applications", time: 60 },
      { text: "Send 1–2 outreach messages", time: 15 },
      { text: "Update tracker", time: 10 },
    ],
  },
  {
    day: "Thursday",
    tasks: [
      { text: "Submit 3 tailored applications", time: 90 },
      { text: "Send 1 networking outreach", time: 15 },
      { text: "Follow up on 2 past applications", time: 20 },
    ],
  },
  {
    day: "Friday",
    tasks: [
      { text: "Submit 1–2 easier applications", time: 45 },
      { text: "Send 2 follow-ups", time: 20 },
      { text: "Clean tracker", time: 10 },
      { text: "Write weekly wins & plan next week", time: 15 },
    ],
  },
];

const STORAGE_KEY = "davids-dashboard";

export default function App() {
  const [checked, setChecked] = useState({});
  const [view, setView] = useState("week");
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setChecked(parsed.checked || {});
      setHistory(parsed.history || []);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ checked, history }));
  }, [checked, history]);

  const toggle = (key) => setChecked((p) => ({ ...p, [key]: !p[key] }));

  const totalTasks = week.reduce((s, d) => s + d.tasks.length, 0);
  const doneTasks = Object.values(checked).filter(Boolean).length;
  const progress = Math.round((doneTasks / totalTasks) * 100);

  const resetWeek = () => {
    setHistory([{ date: new Date().toLocaleDateString(), progress }, ...history]);
    setChecked({});
  };

  const containerStyle = {
    minHeight: "100vh",
    background: "rgb(40,61,181)",
    color: "white",
    fontFamily: "sans-serif",
    display: "flex",
    flexDirection: "column",
  };

  const skyline = (
    <svg viewBox="0 0 1000 120" style={{ width: "100%", height: "20vh", fill: "white" }}>
      <rect x="0" y="80" width="1000" height="40" />
      <rect x="120" y="40" width="60" height="40" />
      <rect x="200" y="20" width="50" height="60" />
      <rect x="280" y="50" width="70" height="30" />
      <rect x="380" y="10" width="40" height="70" />
      <rect x="450" y="35" width="60" height="45" />
      <rect x="540" y="25" width="50" height="55" />
      <rect x="620" y="45" width="70" height="35" />
      <rect x="720" y="15" width="40" height="65" />
      <rect x="790" y="30" width="60" height="50" />
    </svg>
  );

  return (
    <div style={containerStyle}>
      <div style={{ textAlign: "center", padding: "20px 10px" }}>
        <h1 style={{ margin: 0 }}>David's Weekly Job Search Dashboard</h1>
        <div style={{ marginTop: 10 }}>
          <button onClick={() => setView("week")}>Weekly</button>
          <button onClick={() => setView("calendar")} style={{ marginLeft: 8 }}>Archive</button>
        </div>
      </div>

      {view === "week" && (
        <div style={{ padding: 20, flex: 1 }}>
          <div style={{ background: "#ccc", height: 20, borderRadius: 10, overflow: "hidden", marginBottom: 20 }}>
            <div style={{ width: progress + "%", background: "#4caf50", height: "100%" }} />
          </div>

          {week.map((d) => {
            const dayTime = d.tasks.reduce((s, t) => s + t.time, 0);
            return (
              <div key={d.day} style={{ marginBottom: 20 }}>
                <h2>{d.day} — {dayTime} min</h2>
                {d.tasks.map((t, i) => {
                  const key = d.day + i;
                  return (
                    <div key={key} onClick={() => toggle(key)} style={{ cursor: "pointer", margin: "6px 0" }}>
                      <input type="checkbox" readOnly checked={!!checked[key]} /> {t.text} ({t.time}m)
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {view === "calendar" && (
        <div style={{ padding: 20, flex: 1 }}>
          <h2>Weekly Archive</h2>
          {history.length === 0 && <p>No completed weeks yet.</p>}
          {history.map((w, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              {w.date} — {w.progress}% complete
            </div>
          ))}
        </div>
      )}

      <div style={{ position: "fixed", bottom: 30, right: 30 }}>
        <button onClick={resetWeek}>Reset Week</button>
      </div>

      {skyline}
    </div>
  );
}
