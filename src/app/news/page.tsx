"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { SCHOOL_CONFIG } from "@/lib/school-config";

const particles = Array.from({ length: 80 }, (_, i) => ({
  id: i, left: `${Math.random() * 100}%`, duration: `${10 + Math.random() * 20}s`,
  delay: `${Math.random() * 10}s`, size: `${3 + Math.random() * 3}px`,
}));

export default function NewsPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [filter, setFilter] = useState("All");
  const [modal, setModal] = useState<number | null>(null);
  const [newsItems, setNewsItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/public/announcements?type=news&limit=20")
      .then((res) => res.json())
      .then((data) => {
        const items = (data.announcements || []).map((a: any) => {
          const target = typeof a.target === "string" ? JSON.parse(a.target) : (a.target || {});
          return {
            title: a.title,
            desc: a.content,
            full: a.content,
            date: new Date(a.createdAt).toLocaleDateString("en-NG", { month: "long", year: "numeric" }),
            category: target.category || "General",
            gradient: "linear-gradient(135deg, #1e3a8a, #3b82f6)",
            image: target.imageUrl || "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=400&fit=crop",
          };
        });
        setNewsItems(items.length > 0 ? items : [
          { title: "Welcome to FFB", desc: "Stay tuned for the latest news and updates from our school.", full: "Welcome to FFB Group of Schools. We keep you updated with the latest news, achievements and events.", date: new Date().toLocaleDateString("en-NG", { month: "long", year: "numeric" }), category: "General", gradient: "linear-gradient(135deg, #1e3a8a, #3b82f6)", image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=400&fit=crop" }
        ]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = ["All", ...Array.from(new Set(newsItems.map((n) => n.category)))];

  const filtered = filter === "All" ? newsItems : newsItems.filter((n) => n.category === filter);

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
            <Link href="/events" style={{ color: "#ffffff" }}>Events</Link>
            <Link href="/news" className="active" style={{ color: "#ffffff" }}>News</Link>
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
          School <span className="accent">News</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.8)", maxWidth: "650px", margin: "15px auto 0", lineHeight: 1.7 }}>
          Stay updated with the latest happenings, achievements and events at {SCHOOL_CONFIG.name}.
        </p>
      </section>

      <section className="glass-section">
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center", marginBottom: "30px" }}>
          {categories.map((c) => (
            <button key={c} onClick={() => setFilter(c)} style={{ padding: "8px 18px", borderRadius: "20px", border: filter === c ? "none" : "1px solid rgba(255,255,255,0.15)", background: filter === c ? "#28ff9c" : "rgba(255,255,255,0.05)", color: filter === c ? "#001f5f" : "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: "13px", fontWeight: 600, transition: "0.3s" }}>
              {c}
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px" }}>
          {filtered.map((n, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.06)", borderRadius: "25px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer", transition: "0.3s" }} onClick={() => setModal(i)}>
              <img src={n.image} alt={n.title} className="w-full h-[200px] object-cover" />
              <div style={{ padding: "22px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <span style={{ padding: "4px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.08)", fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>{n.category}</span>
                  <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>{n.date}</span>
                </div>
                <h3 style={{ fontSize: "17px", fontWeight: 700, marginBottom: "8px", color: "#ffffff" }}>{n.title}</h3>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", lineHeight: 1.6, marginBottom: "12px" }}>{n.desc}</p>
                <span style={{ color: "#28ff9c", fontSize: "13px", fontWeight: 600 }}>Read More →</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {modal !== null && (
        <div className="modal" style={{ display: "flex", position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(10px)", alignItems: "center", justifyContent: "center", padding: "20px" }} onClick={() => setModal(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "30px", padding: "30px", maxWidth: "600px", width: "100%", maxHeight: "80vh", overflowY: "auto", position: "relative" }}>
            <button onClick={() => setModal(null)} style={{ position: "absolute", top: "15px", right: "20px", background: "none", border: "none", color: "#1a1a2e", fontSize: "28px", cursor: "pointer" }}>×</button>
            <img src={newsItems[modal].image} alt={newsItems[modal].title} className="w-full h-[200px] object-cover rounded-2xl mb-5" />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
              <span style={{ padding: "4px 12px", borderRadius: "8px", background: "#f1f5f9", fontSize: "11px", fontWeight: 600, color: "#475569" }}>{newsItems[modal].category}</span>
              <span style={{ fontSize: "12px", color: "#94a3b8" }}>{newsItems[modal].date}</span>
            </div>
            <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "15px", color: "#1a1a2e" }}>{newsItems[modal].title}</h2>
            <p style={{ color: "#475569", lineHeight: 1.8, fontSize: "14px" }}>{newsItems[modal].full}</p>
          </div>
        </div>
      )}

      <footer className="footer">
        <div className="footer-bottom" style={{ color: "rgba(255,255,255,0.6)" }}>© {new Date().getFullYear()} {SCHOOL_CONFIG.name}. All rights reserved.</div>
      </footer>
    </div>
  );
}
