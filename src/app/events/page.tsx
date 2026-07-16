"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const particles = Array.from({ length: 40 }, (_, i) => ({
  id: i, left: `${Math.random() * 100}%`, duration: `${10 + Math.random() * 20}s`,
  delay: `${Math.random() * 10}s`, size: `${3 + Math.random() * 3}px`,
}));

const events = [
  { title: "Interhouse Sports", desc: "Annual sports competition showcasing teamwork and athleticism across all houses. Students compete in football, athletics, volleyball, and more.", date: "2026-03-25T09:00:00", icon: "⚽" },
  { title: "Science Exhibition", desc: "Students present innovative science projects and research findings. Categories include Physics, Chemistry, Biology, and Computer Science.", date: "2026-04-10T10:00:00", icon: "🔬" },
  { title: "Inter-House Quiz Competition", desc: "Academic quiz competition covering Mathematics, English, Science, and Current Affairs. Teams of 4 students per house.", date: "2026-05-15T10:00:00", icon: "📚" },
  { title: "Career Day", desc: "Guest speakers from various industries share career experiences. Students explore career paths in medicine, engineering, law, and more.", date: "2026-06-12T09:00:00", icon: "💼" },
  { title: "Cultural Day", desc: "Celebration of Nigerian cultural diversity through music, dance, drama, and traditional attire.", date: "2026-06-28T10:00:00", icon: "🎭" },
  { title: "Graduation Ceremony", desc: "Celebrating graduating students and their achievements. Parents and guardians are invited to attend.", date: "2026-07-18T11:00:00", icon: "🎓" },
];

function useCountdown(targetDate: string) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false });
  useEffect(() => {
    const calc = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
      return { days: Math.floor(diff / 86400000), hours: Math.floor((diff % 86400000) / 3600000), minutes: Math.floor((diff % 3600000) / 60000), seconds: Math.floor((diff % 60000) / 1000), expired: false };
    };
    setTimeLeft(calc());
    const timer = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(timer);
  }, [targetDate]);
  return timeLeft;
}

function CountdownDisplay({ date }: { date: string }) {
  const t = useCountdown(date);
  if (t.expired) return <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px" }}>Event has passed</span>;
  return (
    <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
      {[{ val: t.days, label: "D" }, { val: t.hours, label: "H" }, { val: t.minutes, label: "M" }, { val: t.seconds, label: "S" }].map((u) => (
        <div key={u.label} style={{ textAlign: "center", background: "rgba(40,255,156,0.12)", borderRadius: "8px", padding: "6px 10px", minWidth: "42px", border: "1px solid rgba(40,255,156,0.2)" }}>
          <div style={{ fontSize: "18px", fontWeight: 800, color: "#28ff9c" }}>{String(u.val).padStart(2, "0")}</div>
          <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.4)" }}>{u.label}</div>
        </div>
      ))}
    </div>
  );
}

export default function EventsPage() {
  return (
    <>
      {particles.map((p) => (
        <div key={p.id} className="particle" style={{ left: p.left, width: p.size, height: p.size, animationDuration: p.duration, animationDelay: p.delay }} />
      ))}

      <div className="navbar">
        <div className="nav-inner">
          <Link href="/" className="flex items-center gap-2"><img src="/logo.svg" alt="FFB" style={{ height: "50px" }} /></Link>
          <div className="nav-links">
            <Link href="/">Home</Link>
            <Link href="/about">About</Link>
            <Link href="/events" style={{ color: "#28ff9c" }}>Events</Link>
            <Link href="/news">News</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/portal/apply" className="menu-btn apply-btn" style={{ color: "#001f5f" }}>Admissions</Link>
            <Link href="/auth/login" className="menu-btn portal-btn">Portal</Link>
          </div>
        </div>
      </div>

      <div style={{ paddingTop: "120px", paddingBottom: "60px", maxWidth: "1200px", margin: "auto", padding: "120px 20px 60px" }}>
        <h1 className="section-title">Upcoming Events</h1>
        <p className="section-subtitle">Stay updated with our academic calendar, competitions and school activities.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "25px" }}>
          {events.map((e, i) => (
            <div key={i} className="feature-card" style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <span style={{ fontSize: "32px" }}>{e.icon}</span>
                <div>
                  <h3 style={{ fontSize: "18px", marginBottom: "0" }}>{e.title}</h3>
                  <span style={{ color: "#28ff9c", fontWeight: 600, fontSize: "13px" }}>
                    {new Date(e.date).toLocaleDateString("en-NG", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                  </span>
                </div>
              </div>
              <p style={{ color: "rgba(255,255,255,0.6)", flex: 1 }}>{e.desc}</p>
              <CountdownDisplay date={e.date} />
            </div>
          ))}
        </div>
      </div>

      <footer className="footer">
        <div className="footer-bottom">© 2025 FFB Group of Schools. All rights reserved.</div>
      </footer>
    </>
  );
}
