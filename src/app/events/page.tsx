"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { SCHOOL_CONFIG } from "@/lib/school-config";

const particles = Array.from({ length: 80 }, (_, i) => ({
  id: i, left: `${Math.random() * 100}%`, duration: `${10 + Math.random() * 20}s`,
  delay: `${Math.random() * 10}s`, size: `${3 + Math.random() * 3}px`,
}));

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

function CountdownTimer({ date, large }: { date: string; large?: boolean }) {
  const t = useCountdown(date);
  if (t.expired) return <span style={{ color: "rgba(255,255,255,0.3)", fontSize: large ? "14px" : "12px" }}>Event passed</span>;
  const unitStyle = large
    ? { background: "rgba(40,255,156,0.15)", border: "1px solid rgba(40,255,156,0.3)", borderRadius: "12px", padding: "12px 16px", minWidth: "70px", textAlign: "center" as const }
    : { background: "rgba(40,255,156,0.15)", border: "1px solid rgba(40,255,156,0.3)", borderRadius: "8px", padding: "4px 8px", minWidth: "36px", textAlign: "center" as const };
  const numSize = large ? "28px" : "14px";
  const lblSize = large ? "10px" : "8px";
  return (
    <div style={{ display: "flex", gap: large ? "10px" : "6px", justifyContent: "center" }}>
      {[{ val: t.days, label: "Days" }, { val: t.hours, label: "Hrs" }, { val: t.minutes, label: "Min" }, { val: t.seconds, label: "Sec" }].map((u) => (
        <div key={u.label} style={{ textAlign: "center" }}>
          <div style={unitStyle}>
            <span style={{ fontSize: numSize, fontWeight: 800, color: "#28ff9c" }}>{String(u.val).padStart(2, "0")}</span>
          </div>
          <span style={{ fontSize: lblSize, color: "rgba(255,255,255,0.4)", marginTop: "4px", display: "block" }}>{u.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function EventsPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const nextAcademicSession = "2026-09-07T08:00:00";

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

      <section style={{ marginTop: "90px", padding: "60px 20px 40px", textAlign: "center" }}>
        <h1 style={{ fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 800, color: "#ffffff" }}>
          School <span className="accent">Events</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.8)", maxWidth: "650px", margin: "15px auto 0", lineHeight: 1.7 }}>
          Stay updated with our academic calendar, competitions and school activities.
        </p>
      </section>

      {/* Next Academic Session Countdown */}
      <section style={{ padding: "0 20px 40px", maxWidth: "800px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", padding: "40px 30px", background: "linear-gradient(135deg, rgba(40,255,156,0.08), rgba(0,85,255,0.08))", borderRadius: "24px", border: "1px solid rgba(40,255,156,0.2)" }}>
          <p style={{ color: "#28ff9c", fontSize: "13px", fontWeight: 700, letterSpacing: "0.1em", marginBottom: "8px" }}>NEXT ACADEMIC SESSION</p>
          <h2 style={{ fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 800, color: "#ffffff", marginBottom: "8px" }}>2026/2027 Academic Year</h2>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", marginBottom: "24px" }}>Resumption: 7th September, 2026</p>
          <CountdownTimer date={nextAcademicSession} large />
        </div>
      </section>

      {/* Events Grid */}
      <section style={{ padding: "0 20px 60px", maxWidth: "1200px", margin: "0 auto" }}>
        <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#ffffff", marginBottom: "24px", textAlign: "center" }}>Upcoming Events</h2>
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ width: "40px", height: "40px", border: "3px solid rgba(255,255,255,0.2)", borderTopColor: "#28ff9c", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto" }} />
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px" }}>
            {events.map((e, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.06)", borderRadius: "20px", padding: "24px", border: "1px solid rgba(255,255,255,0.08)", transition: "transform 0.2s, box-shadow 0.2s" }}
                onMouseEnter={(ev) => { ev.currentTarget.style.transform = "translateY(-4px)"; ev.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.2)"; }}
                onMouseLeave={(ev) => { ev.currentTarget.style.transform = "translateY(0)"; ev.currentTarget.style.boxShadow = "none"; }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                  <span style={{ fontSize: "36px" }}>{e.icon}</span>
                  <span style={{ padding: "4px 12px", borderRadius: "8px", background: "rgba(40,255,156,0.13)", color: "#28ff9c", fontSize: "11px", fontWeight: 600 }}>{e.category}</span>
                </div>
                <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px", color: "#ffffff" }}>{e.title}</h3>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.65)", marginBottom: "16px", lineHeight: 1.6 }}>{e.desc}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "14px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>📅 {fmtDate(e.date)}</span>
                  <CountdownTimer date={e.date} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <footer className="footer">
        <div className="footer-bottom" style={{ color: "rgba(255,255,255,0.6)" }}>© {new Date().getFullYear()} {SCHOOL_CONFIG.name}. All rights reserved.</div>
      </footer>
    </div>
  );
}
