import React, { useState, useEffect } from "react";

// ===== WEEK DATA =====
const getWeekWithDates = () => {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay() + 1);

  const baseWeek = [
    {
      day: "Monday",
      tasks: [
        { text: "Deep role research & job alerts", time: 90 },
        { text: "Apply to priority roles", time: 60 },
        { text: "Networking outreach", time: 20 },
      ],
    },
    {
      day: "Tuesday",
      tasks: [
        { text: "Light role scan", time: 20 },
        { text: "Submit applications", time: 75 },
        { text: "Follow‑ups", time: 15 },
      ],
    },
    {
      day: "Wednesday",
      tasks: [
        { text: "Light role scan", time: 15 },
        { text: "Networking / informational calls", time: 45 },
        { text: "Submit applications", time: 45 },
      ],
    },
    {
      day: "Thursday",
      tasks: [
        { text: "Light role scan", time: 15 },
        { text: "Submit applications", time: 60 },
        { text: "Follow‑ups", time: 20 },
      ],
    },
    {
      day: "Friday",
      tasks: [
        { text: "Light role scan", time: 10 },
        { text: "Light applications", time: 30 },
        { text: "Weekly reflection & planning", time: 20 },
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
  const week = getWeekWithDates();

  const [checked, setChecked] = useState({});
  const [view, setView] = useState("week");
  const [history, setHistory] = useState([]);
  const [hovered, setHovered] = useState(null);

  // weekly totals input (Soft‑C)
  const [apps, setApps] = useState("");
  const [networking, setNetworking] = useState("");
  const [interviews, setInterviews] = useState("");

  const [showShutdown, setShowShutdown] = useState(false);

  // ===== LOAD / SAVE =====
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

  // ===== PROGRESS =====
  const toggle = (key) => setChecked((p) => ({ ...p, [key]: !p[key] }));

  const totalTasks = week.reduce((s, d) => s + d.tasks.length, 0);
  const doneTasks = Object.values(checked).filter(Boolean).length;
  const progress = Math.round((doneTasks / totalTasks) * 100);

  // ===== TODAY COMPLETION =====
  const todayName = new Date().toLocaleDateString(undefined, { weekday: "long" });
  const today = week.find((d) => d.day === todayName);
  const todayComplete = today
    ? today.tasks.every((_, i) => checked[today.day + i])
    : false;

  // ===== SHUTDOWN CUE =====
  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const et = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));

      if (todayComplete || et.getHours() >= 19) {
        setShowShutdown(true);
      }
    };

    checkTime();
    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, [todayComplete]);

  // ===== RESET WEEK =====
  const resetWeek = () => {
    setHistory([
      {
        date: new Date().toLocaleDateString(),
        progress,
        apps: Number(apps || 0),
        networking: Number(networking || 0),
        interviews: Number(interviews || 0),
      },
      ...history,
    ]);

    setChecked({});
    setApps("");
    setNetworking("");
    setInterviews("");
    setShowShutdown(false);
  };

  // ===== STREAK CALC =====
  const streak = history.filter((h) => h.apps >= 10 || h.networking >= 3 || h.interviews >= 2).length;

  // ===== STYLES =====
  const containerStyle = {
    minHeight: "100vh",
    background: "rgb(40,61,181)",
    color: "white",
    fontFamily: "sans-serif",
  };

  const modernButton = (name) => ({
    background: hovered === name ? "white" : "rgba(255,255,255,0.15)",
    color: hovered === name ? "black" : "white",
    border: "1px solid rgba(255,255,255,0.4)",
    padding: "8px 16px",
    borderRadius: 999,
    cursor: "pointer",
    margin: "0 4px",
    transition: "all 0.2s ease",
  });

  const card = {
    background: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  };

  const SectionTitle = ({ children }) => <h2 style={{ marginTop: 0 }}>{children}</h2>;

  // ===== GRAPH =====
  const Graph = () => {
    if (history.length === 0) return null;

    const max = Math.max(...history.map((h) => Math.max(h.apps, h.networking, h.interviews)), 1);

    const width = 500;
    const height = 200;

    const makePath = (key) =>
      history
        .map((h, i) => {
          const x = (i / Math.max(history.length - 1, 1)) * width;
          const y = height - (h[key] / max) * height;
          return `${i === 0 ? "M" : "L"}${x},${y}`;
        })
        .join(" ");

    return (
      <svg width="100%" viewBox={`0 0 ${width} ${height}`}>
        <path d={makePath("apps")} stroke="#4CAF50" fill="none" strokeWidth="3" />
        <path d={makePath("networking")} stroke="#FFD54F" fill="none" strokeWidth="3" />
        <path d={makePath("interviews")} stroke="#FF8A65" fill="none" strokeWidth="3" />
      </svg>
    );
  };

  return (
    <div style={containerStyle}>
      {/* HEADER */}
      <div style={{ textAlign: "center", padding: 24 }}>
        <h1>David's Weekly Job Search Dashboard</h1>

        {[{ key: "week", label: "Weekly" }, { key: "archive", label: "Archive" }, { key: "priority", label: "Applications Priority List" }].map((btn) => (
          <button
            key={btn.key}
            style={modernButton(btn.key)}
            onMouseEnter={() => setHovered(btn.key)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => setView(btn.key)}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* WEEKLY VIEW */}
      {view === "week" && (
        <div style={{ padding: 24 }}>
          {/* STREAK */}
          <div style={{ ...card, maxWidth: 320 }}>
            <strong>Momentum:</strong> {streak} week streak
          </div>

          {/* TOTALS INPUT */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <div style={{ ...card, width: 260 }}>
              <SectionTitle>Weekly Totals</SectionTitle>
              <div style={{ color: "#4CAF50" }}>Applications</div>
              <input value={apps} onChange={(e) => setApps(e.target.value)} style={{ width: "100%" }} />

              <div style={{ color: "#FFD54F", marginTop: 8 }}>Networking</div>
              <input value={networking} onChange={(e) => setNetworking(e.target.value)} style={{ width: "100%" }} />

              <div style={{ color: "#FF8A65", marginTop: 8 }}>Interviews</div>
              <input value={interviews} onChange={(e) => setInterviews(e.target.value)} style={{ width: "100%" }} />
            </div>
          </div>

          {/* PROGRESS BAR */}
          <div style={{ display: "flex", justifyContent: "center", margin: "32px 0" }}>
            <div style={{ position: "relative", width: "66%", background: "rgba(255,255,255,0.25)", height: 22, borderRadius: 12 }}>
              <div style={{ width: progress + "%", background: "#4CAF50", height: "100%", borderRadius: 12 }} />
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                {progress}%
              </div>
            </div>
          </div>

          {/* TASKS */}
          {week.map((d) => {
            const totalTime = d.tasks.reduce((s, t) => s + t.time, 0);

            return (
              <div key={d.day} style={card}>
                <div style={{ opacity: 0.8 }}>{d.dateLabel}</div>
                <SectionTitle>{d.day} — {totalTime} min</SectionTitle>

                {d.tasks.map((t, i) => {
                  const key = d.day + i;
                  return (
                    <div key={key} onClick={() => toggle(key)} style={{ cursor: "pointer", marginBottom: 6 }}>
                      <input type="checkbox" readOnly checked={!!checked[key]} /> {t.text} ({t.time}m)
                    </div>
                  );
                })}
              </div>
            );
          })}

          {/* SHUTDOWN MESSAGE */}
          {showShutdown && (
            <div style={{ ...card, maxWidth: 420, margin: "24px auto", textAlign: "center" }}>
              <strong>You did enough today.</strong>
              <p style={{ margin: 0, opacity: 0.9 }}>Momentum continues tomorrow.</p>
            </div>
          )}
        </div>
      )}

      {/* ARCHIVE VIEW */}
      {view === "archive" && (
        <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
          <SectionTitle>Progress Over Time</SectionTitle>
          <Graph />

          {history.map((w, i) => (
            <div key={i} style={card}>
              <strong>Week of {w.date}</strong>
              <p>Progress: {w.progress}%</p>
              <p style={{ color: "#4CAF50" }}>Applications: {w.apps}</p>
              <p style={{ color: "#FFD54F" }}>Networking: {w.networking}</p>
              <p style={{ color: "#FF8A65" }}>Interviews: {w.interviews}</p>
            </div>
          ))}
        </div>
      )}

      {/* PRIORITY VIEW */}
      {view === "priority" && (
        <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
          <SectionTitle>Weekly Application Targets</SectionTitle>
          <div style={card}>
            <p><strong>12–15 high‑quality applications/week</strong></p>
            <ul>
              <li>6 Healthcare / Universities</li>
              <li>3 Infrastructure / Civic</li>
              <li>3–6 Corporate stabilizers</li>
            </ul>
          </div>
        </div>
      )}

      {/* RESET */}
      <div style={{ position: "fixed", bottom: 24, right: 24 }}>
        <button
          style={modernButton("reset")}
          onMouseEnter={() => setHovered("reset")}
          onMouseLeave={() => setHovered(null)}
          onClick={resetWeek}
        >
          Reset Week
        </button>
      </div>
    </div>
  );
}
