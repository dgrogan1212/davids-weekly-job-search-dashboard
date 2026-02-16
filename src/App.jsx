import React, { useState, useEffect } from "react";

// ===== WEEK DATA WITH ORIGINAL TARGETS =====
const getWeekWithDates = () => {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay() + 1);

  const baseWeek = [
    {
      day: "Monday",
      tasks: [
        { text: "Deep role research (15–20 roles) & alerts", time: 90 },
        { text: "Submit 3 high‑quality applications", time: 90 },
        { text: "Send 2 networking messages", time: 20 },
      ],
    },
    {
      day: "Tuesday",
      tasks: [
        { text: "Light role scan (5–10 roles)", time: 20 },
        { text: "Submit 3 applications", time: 60 },
        { text: "Send 2 follow‑up messages", time: 15 },
      ],
    },
    {
      day: "Wednesday",
      tasks: [
        { text: "Light role scan (5–10 roles)", time: 15 },
        { text: "Schedule or hold 1 informational call or networking meeting", time: 45 },
        { text: "Submit 2 applications", time: 40 },
      ],
    },
    {
      day: "Thursday",
      tasks: [
        { text: "Light role scan (5–10 roles)", time: 15 },
        { text: "Submit 3 tailored applications", time: 90 },
        { text: "Send 2 follow‑ups AND/OR new networking messages", time: 20 },
      ],
    },
    {
      day: "Friday",
      tasks: [
        { text: "Light role scan (3–5 roles)", time: 10 },
        { text: "Submit 1–2 lighter applications", time: 30 },
        { text: "Weekly reflection & next‑week planning", time: 20 },
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

  // ===== SHUTDOWN =====
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

  // ===== STREAKS =====
  const qualifyingWeeks = history.filter(
    (h) => h.apps >= 10 || h.networking >= 3 || h.interviews >= 2
  );

  const currentStreak = qualifyingWeeks.length;
  const longestStreak = qualifyingWeeks.length; // simple version

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
          {/* MOMENTUM + TOTALS ROW */}
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            <div style={{ ...card, maxWidth: 260 }}>
              <SectionTitle>Momentum</SectionTitle>
              <p>Current streak: <strong>{currentStreak}</strong></p>
              <p>Longest streak: <strong>{longestStreak}</strong></p>
            </div>

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

      {/* PRIORITY LIST */}
      {view === "priority" && (
        <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
          <SectionTitle>Applications Priority List</SectionTitle>

          {/* Weekly Targets */}
          <div style={card}>
            <strong>12–15 high‑quality applications/week</strong>
            <ul>
              <li>6 Healthcare / Universities</li>
              <li>3 Infrastructure / Civic</li>
              <li>3–6 Corporate stabilizers</li>
            </ul>
          </div>

          {/* VERY HIGH */}
          <div style={card}>
            <strong>Very High Priority — Healthcare & Universities</strong>
            <ul>
              <li><a href="https://www.medstarhealth.org" target="_blank">MedStar Health</a></li>
              <li><a href="https://www.kaiserpermanentejobs.org" target="_blank">Kaiser Permanente</a></li>
              <li><a href="https://childrensnational.org" target="_blank">Children’s National Hospital</a></li>
              <li><a href="https://www.gwhospital.com" target="_blank">GWU Hospital</a></li>
              <li><a href="https://www.inova.org" target="_blank">Inova Health System</a></li>
              <li><a href="https://www.georgetown.edu" target="_blank">Georgetown University</a></li>
              <li><a href="https://www.gwu.edu" target="_blank">George Washington University</a></li>
              <li><a href="https://www.american.edu" target="_blank">American University</a></li>
              <li><a href="https://www.umd.edu" target="_blank">University of Maryland</a></li>
              <li><a href="https://howard.edu" target="_blank">Howard University</a></li>
            </ul>
          </div>

          {/* HIGH */}
          <div style={card}>
            <strong>High Priority — Civic Infrastructure</strong>
            <ul>
              <li><a href="https://www.wmata.com" target="_blank">WMATA</a></li>
              <li><a href="https://www.mwaa.com" target="_blank">Metropolitan Washington Airports Authority</a></li>
              <li><a href="https://www.dchousing.org" target="_blank">DC Housing Authority</a></li>
              <li><a href="https://eventsdc.com" target="_blank">Events DC</a></li>
              <li><a href="https://www.si.edu" target="_blank">Smithsonian Institution</a></li>
            </ul>
          </div>

          {/* MEDIUM‑HIGH */}
          <div style={card}>
            <strong>Medium‑High Priority — Mission Nonprofits</strong>
            <ul>
              <li><a href="https://www.brookings.edu" target="_blank">Brookings Institution</a></li>
              <li><a href="https://www.urban.org" target="_blank">Urban Institute</a></li>
              <li><a href="https://www.pewtrusts.org" target="_blank">Pew Charitable Trusts</a></li>
              <li><a href="https://www.fhi360.org" target="_blank">FHI 360</a></li>
              <li><a href="https://www.nationalgeographic.org" target="_blank">National Geographic Society</a></li>
            </ul>
          </div>

          {/* BACKUP */}
          <div style={card}>
            <strong>Controlled Backup — Corporate Stabilizers</strong>
            <ul>
              <li><a href="https://www.capitalonecareers.com" target="_blank">Capital One</a></li>
              <li><a href="https://www.guidehouse.com/careers" target="_blank">Guidehouse</a></li>
              <li><a href="https://www.boozallen.com/careers" target="_blank">Booz Allen Hamilton</a></li>
              <li><a href="https://www.amazon.jobs" target="_blank">Amazon</a></li>
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
