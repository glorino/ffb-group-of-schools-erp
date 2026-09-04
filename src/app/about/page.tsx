"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { SCHOOL_CONFIG } from "@/lib/school-config";

const particles = Array.from({ length: 80 }, (_, i) => ({
  id: i, left: `${Math.random() * 100}%`, duration: `${10 + Math.random() * 20}s`,
  delay: `${Math.random() * 10}s`, size: `${3 + Math.random() * 3}px`,
}));

export default function AboutPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/public/team?limit=10").then(r => r.json()),
      fetch("/api/public/milestones").then(r => r.json()),
      fetch("/api/public/stats").then(r => r.json()),
    ]).then(([teamData, milestoneData, statsData]) => {
      const team = (teamData.team || []).map((s: any) => ({
        role: s.position || "Staff",
        name: `${s.firstName} ${s.lastName}`,
        desc: s.qualification || s.department || "",
        photo: s.photo || `https://i.pravatar.cc/200?img=${Math.floor(Math.random() * 70) + 1}`,
      }));
      setTeamMembers(team.length > 0 ? team : [
        { role: "Director of Education", name: "FFB Group of Schools", desc: "Dedicated to academic excellence and leadership development.", photo: "https://i.pravatar.cc/200?img=68" },
      ]);
      setMilestones(milestoneData.milestones || []);
      setStats(statsData);
    }).catch(() => {});
  }, []);

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
            <Link href="/about" className="active" style={{ color: "#ffffff" }}>About</Link>
            <Link href="/events" style={{ color: "#ffffff" }}>Events</Link>
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

      {/* Hero */}
      <section style={{ marginTop: "90px", padding: "80px 20px 40px", textAlign: "center" }}>
        <h1 style={{ fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 800, color: "#ffffff" }}>
          About <span className="accent">FFB</span> Group of Schools
        </h1>
        <p style={{ color: "rgba(255,255,255,0.8)", maxWidth: "650px", margin: "15px auto 0", lineHeight: 1.7 }}>
          Learn about our journey, mission and commitment to nurturing future leaders.
        </p>
      </section>

      {/* Mission / Vision / Values */}
      <section className="glass-section">
        <h2 className="section-title" style={{ color: "#ffffff" }}>Our Foundation</h2>
        <div className="features-grid">
          {[
            { icon: "🎯", title: "Mission", desc: stats?.school?.mission || "To provide quality education that empowers students to become responsible leaders and lifelong learners through innovative teaching methods." },
            { icon: "🌍", title: "Vision", desc: stats?.school?.vision || "To be a leading institution recognized for academic excellence, character development and preparing students for global success." },
            { icon: "⭐", title: "Core Values", desc: stats?.school?.coreValues ? `Core values: ${stats.school.coreValues}` : `Integrity, Discipline, Excellence, Innovation and Respect. These values guide everything we do at ${SCHOOL_CONFIG.name}.` },
          ].map((f, i) => (
            <div key={i} className="feature-card" style={{ textAlign: "center" }}>
              <div style={{ fontSize: "40px", marginBottom: "15px" }}>{f.icon}</div>
              <h3 style={{ color: "#ffffff" }}>{f.title}</h3>
              <p style={{ color: "rgba(255,255,255,0.8)" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* History Timeline */}
      <section className="glass-section">
        <h2 className="section-title" style={{ color: "#ffffff" }}>Our Journey</h2>
        <p className="section-subtitle" style={{ color: "rgba(255,255,255,0.7)" }}>
          From humble beginnings to a leading educational institution.
        </p>
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          {milestones.map((m, i) => (
            <div key={i} style={{ display: "flex", gap: "20px", marginBottom: "30px", alignItems: "flex-start" }}>
              <div style={{ minWidth: "70px", textAlign: "center" }}>
                <div style={{ width: "14px", height: "14px", borderRadius: "50%", background: "#28ff9c", margin: "0 auto 8px" }}></div>
                <span style={{ fontSize: "15px", fontWeight: 700, color: "#28ff9c" }}>{m.year}</span>
              </div>
              <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: "16px", padding: "18px 22px", flex: 1, borderLeft: "3px solid #28ff9c" }}>
                <p style={{ fontSize: "14px", lineHeight: 1.6, color: "rgba(255,255,255,0.8)" }}>{m.event}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="glass-section">
        <h2 className="section-title" style={{ color: "#ffffff" }}>Our Leadership</h2>
        <p className="section-subtitle" style={{ color: "rgba(255,255,255,0.7)" }}>
          Experienced educators committed to nurturing excellence.
        </p>
        <div className="features-grid">
          {teamMembers.map((t, i) => (
            <div key={i} className="feature-card" style={{ textAlign: "center" }}>
              <img src={t.photo} alt={t.name} style={{ width: "90px", height: "90px", borderRadius: "50%", objectFit: "cover", margin: "0 auto 15px", border: "3px solid rgba(40,255,156,0.3)" }} />
              <h3 style={{ fontSize: "16px", marginBottom: "4px", color: "#ffffff" }}>{t.name}</h3>
              <p style={{ color: "#28ff9c", fontSize: "12px", fontWeight: 600, marginBottom: "10px" }}>{t.role}</p>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)" }}>{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="glass-section">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "20px" }}>
          {[
            { val: stats?.totalStudents ? `${stats.totalStudents}+` : "2000+", label: "Students" },
            { val: stats?.totalTeachers ? `${stats.totalTeachers}+` : "120+", label: "Teachers" },
            { val: "98%", label: "Pass Rate" },
            { val: stats?.yearsSince ? `${stats.yearsSince}+` : "15+", label: "Years" },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center", padding: "25px", background: "rgba(40,255,156,0.06)", borderRadius: "20px", border: "1px solid rgba(40,255,156,0.15)" }}>
              <div style={{ fontSize: "32px", fontWeight: 800, color: "#28ff9c" }}>{s.val}</div>
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", marginTop: "5px" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="glass-section" style={{ textAlign: "center" }}>
        <h2 className="section-title" style={{ color: "#ffffff" }}>Join Our Community</h2>
        <p className="section-subtitle" style={{ color: "rgba(255,255,255,0.7)" }}>
          Give your child the best education and leadership development.
        </p>
        <div style={{ display: "flex", gap: "15px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/portal/apply" className="btn-primary" style={{ padding: "14px 32px", borderRadius: "12px", fontSize: "14px", fontWeight: 600 }}>Apply for Admission</Link>
          <Link href="/contact" style={{ padding: "14px 32px", borderRadius: "12px", fontSize: "14px", fontWeight: 600, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", textDecoration: "none", transition: "all 0.3s ease" }}>Contact Us</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-grid">
          <div>
            <img src="/logo.svg" alt="FFB" style={{ height: "70px", marginBottom: "15px" }} />
            <p style={{ color: "rgba(255,255,255,0.7)" }}>{SCHOOL_CONFIG.name} is committed to academic excellence, innovation and leadership development.</p>
          </div>
          <div>
            <h4 style={{ color: "#ffffff" }}>Quick Links</h4>
            <div className="footer-links">
              <Link href="/" style={{ color: "#ffffff" }}>Home</Link>
              <Link href="/about" style={{ color: "#ffffff" }}>About</Link>
              <Link href="/events" style={{ color: "#ffffff" }}>Events</Link>
              <Link href="/news" style={{ color: "#ffffff" }}>News</Link>
              <Link href="/contact" style={{ color: "#ffffff" }}>Contact</Link>
            </div>
          </div>
          <div>
            <h4 style={{ color: "#ffffff" }}>Contact</h4>
            <p style={{ color: "rgba(255,255,255,0.7)" }}>{SCHOOL_CONFIG.address}</p>
            <p style={{ marginTop: "8px", color: "rgba(255,255,255,0.7)" }}>{SCHOOL_CONFIG.phone}</p>
            <p style={{ marginTop: "8px", color: "rgba(255,255,255,0.7)" }}>{SCHOOL_CONFIG.email}</p>
          </div>
        </div>
        <div className="footer-bottom" style={{ color: "rgba(255,255,255,0.6)" }}>{`© ${new Date().getFullYear()} ${SCHOOL_CONFIG.name}. All rights reserved.`}</div>
      </footer>
    </div>
  );
}
