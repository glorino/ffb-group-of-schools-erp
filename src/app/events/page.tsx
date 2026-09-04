"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { SCHOOL_CONFIG } from "@/lib/school-config";

const particles = Array.from({ length: 80 }, (_, i) => ({
  id: i, left: `${Math.random() * 100}%`, duration: `${10 + Math.random() * 20}s`,
  delay: `${Math.random() * 10}s`, size: `${3 + Math.random() * 3}px`,
}));



const categoryColors: Record<string, string> = {
  Sports: "#28ff9c", Academic: "#3b82f6", Ceremony: "#a855f7",
  Cultural: "#f59e0b", Career: "#06b6d4", Creative: "#ec4899",
};

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

function CountdownTimer({ date }: { date: string }) {
  const t = useCountdown(date);
  if (t.expired) return <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px" }}>Event passed</span>;
  return (
    <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
      {[{ val: t.days, label: "D" }, { val: t.hours, label: "H" }, { val: t.minutes, label: "M" }, { val: t.seconds, label: "S" }].map((u) => (
        <div key={u.label} style={{ textAlign: "center" }}>
          <div style={{ background: "rgba(40,255,156,0.15)", border: "1px solid rgba(40,255,156,0.3)", borderRadius: "8px", padding: "4px 8px", minWidth: "36px" }}>
            <span style={{ fontSize: "14px", fontWeight: 800, color: "#28ff9c" }}>{String(u.val).padStart(2, "0")}</span>
          </div>
          <span style={{ fontSize: "8px", color: "rgba(255,255,255,0.4)", marginTop: "2px", display: "block" }}>{u.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function EventsPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [filter, setFilter] = useState("All");
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/public/announcements?type=event&limit=20")
      .then((res) => res.json())
      .then((data) => {
        const items = (data.announcements || []).map((a: any) => {
          const target = typeof a.target === "string" ? JSON.parse(a.target) : (a.target || {});
          return {
            title: a.title,
            desc: a.content,
            date: target.eventDate ? `${target.eventDate}T09:00:00` : new Date(a.createdAt).toISOString(),
            icon: "📅",
            category: target.category || "Event",
          };
        });
        setEvents(items.length > 0 ? items : [
          { title: "No Events Yet", desc: "Check back soon for upcoming school events.", date: new Date().toISOString(), icon: "📅", category: "General" }
        ]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = ["All", ...Array.from(new Set(events.map((e) => e.category)))];
  const filtered = filter === "All" ? events : events.filter((e) => e.category === filter);
  const nextEvent = events.find((e) => new Date(e.date).getTime() > Date.now()) || events[0];

  const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="bg-animated" style={{ minHeight: "100vh" }}>
      {particles.map((p) => (
        <div key={p.id} className="particle" style={{ left: p.left, width: p.size, height: p.size, animationDuration: p.duration, animationDelay: p.delay }} />
      ))}

      <div className="navbar">
        <div className="nav-inner">
          <Link href="/" className="flex items-center gap-2"><img src="/logo.svg" alt="FFB" style={{ height: "50px" }} /></Link>
          <div className={`nav-links ${mobileMenuOpen ? "active" : ""}`}>
            <Link href="/" style={{ color: "#ffffff" }}>Home</Link>
            <Link href="/about" style={{ color: "#ffffff" }}>About</Link>
            <Link href="/events" className="active" style={{ color: "#ffffff" }}>Events</Link>
            <Link href="/news" style={{ color: "#ffffff" }}>News</Link>
            <Link href="/contact" style={{ color: "#ffffff" }}>Contact</Link>
            <Link href="/portal/apply" className="menu-btn apply-btn">Admissions</Link>
            <Link href="/portal/track" className="menu-btn" style={{ color: "#ffffff", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "24px", padding: "8px 20px", fontSize: "14px", fontWeight: 500, textDecoration: "none" }}>Track</Link>
            <Link href="/auth/login" className="menu-btn portal-btn" style={{ color: "#ffffff" }}>Portal</Link>
          </div>
          <div className="hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>

      <section style={{ marginTop: "90px", padding: "80px 20px 40px", textAlign: "center" }}>
        <h1 style={{ fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 800, color: "#ffffff" }}>
          School <span className="accent">Events</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.8)", maxWidth: "650px", margin: "15px auto 0", lineHeight: 1.7 }}>
          Stay updated with our academic calendar, competitions and school activities.
        </p>
      </section>

      <section className="glass-section">
        {nextEvent && (
        <div style={{ textAlign: "center", marginBottom: "40px", padding: "30px", background: "rgba(40,255,156,0.05)", borderRadius: "20px", border: "1px solid rgba(40,255,156,0.15)" }}>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px", marginBottom: "5px" }}>NEXT EVENT</p>
          <h3 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "10px", color: "#ffffff" }}>{nextEvent.icon} {nextEvent.title}</h3>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px", marginBottom: "12px" }}>{nextEvent.desc}</p>
          <CountdownTimer date={nextEvent.date} />
        </div>
        )}

        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center", marginBottom: "30px" }}>
          {categories.map((c) => (
            <button key={c} onClick={() => setFilter(c)} style={{ padding: "8px 18px", borderRadius: "20px", border: filter === c ? "none" : "1px solid rgba(255,255,255,0.15)", background: filter === c ? "#28ff9c" : "rgba(255,255,255,0.05)", color: filter === c ? "#001f5f" : "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: "13px", fontWeight: 600, transition: "0.3s" }}>
              {c}
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
          {filtered.map((e, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.06)", borderRadius: "25px", padding: "25px", border: "1px solid rgba(255,255,255,0.08)", transition: "0.3s", cursor: "default" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontSize: "32px" }}>{e.icon}</span>
                <span style={{ padding: "4px 12px", borderRadius: "8px", background: "rgba(40,255,156,0.13)", color: categoryColors[e.category] || "#28ff9c", fontSize: "11px", fontWeight: 600 }}>{e.category}</span>
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px", color: "#ffffff" }}>{e.title}</h3>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", marginBottom: "15px", lineHeight: 1.6 }}>{e.desc}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "15px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>{fmtDate(e.date)}</span>
                <CountdownTimer date={e.date} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="footer">
        <div className="footer-bottom" style={{ color: "rgba(255,255,255,0.6)" }}>© {new Date().getFullYear()} {SCHOOL_CONFIG.name}. All rights reserved.</div>
      </footer>
    </div>
  );
}
