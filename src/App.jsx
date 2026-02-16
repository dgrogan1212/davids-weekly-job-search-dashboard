import React, { useState, useEffect } from "react";

// Generate current week's dates
const getWeekWithDates = () => {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay() + 1); // Monday start

  const baseWeek = [
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

  return baseWeek.map((d, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);

    return {
      ...d,
      dateLabel: date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
    };
  });
};

const STORAGE_KEY = "davids-dashboard";

export default function App() {
  const [checked, setChecked] = useState({});
  const [view, setView] = useState("week");
  const [history, setHistory] = useState([]);
  const week = getWeekWithDates();

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

  const dayBox = {
    background: "rgba(255,255,255,0.15)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    backdropFilter: "blur(6px)",
  };

  const modernButton = {
    background: "rgba(255,255,255,0.15)",
    border: "1px solid rgba(255,255,255,0.3)",
    color: "white",
    padding: "8px 16px",
    borderRadius: 999,
    cursor: "pointer",
    margin: "0 4px",
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={{ textAlign: "center", padding: 20 }}>
        <h1 style={{ marginBottom: 10 }}>David's Weekly Job Search Dashboard</h1>
        <button style={modernButton} onClick={() => setView("week")}>Weekly</button>
        <button style={modernButton} onClick={() => setView("calendar")}>Archive</button>
      </div>

      {/* Weekly View */}
      {view === "week" && (
        <div style={{ padding: 20, flex: 1 }}>
          {/* Centered Progress Bar */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 30 }}>
            <div style={{ position: "relative", width: "66%", background: "rgba(255,255,255,0.3)", height: 22, borderRadius: 12, overflow: "hidden" }}>
              <div style={{ width: progress + "%", background: "#4CAF50", height: "100%" }} />

              {/* Percentage Overlay */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                }}
              >
                {progress}%
              </div>
            </div>
          </div>

          {week.map((d) => {
            const dayTime = d.tasks.reduce((s, t) => s + t.time, 0);

            return (
              <div key={d.day} style={dayBox}>
                <div style={{ opacity: 0.85, fontSize: 14 }}>{d.dateLabel}</div>
                <h2 style={{ marginTop: 4 }}>{d.day} — {dayTime} min</h2>

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

      {/* Archive View */}
      {view === "calendar" && (
        <div style={{ padding: 20, flex: 1 }}>
          <h2>Weekly Archive</h2>
          {history.length === 0 && <p>No completed weeks yet.</p>}
          {history.map((w, i) => (
            <div key={i}>{w.date} — {w.progress}% complete</div>
          ))}
        </div>
      )}

      {/* Reset Button */}
      <div style={{ position: "fixed", bottom: 30, right: 30 }}>
        <button style={modernButton} onClick={resetWeek}>Reset Week</button>
      </div>
    </div>
  );
}
