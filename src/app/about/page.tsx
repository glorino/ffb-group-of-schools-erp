"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";

const particles = Array.from({ length: 80 }, (_, i) => ({
  id: i, left: `${Math.random() * 100}%`, duration: `${10 + Math.random() * 20}s`,
  delay: `${Math.random() * 10}s`, size: `${3 + Math.random() * 3}px`,
}));

const fadeUp = { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };
const stagger = { animate: { transition: { staggerChildren: 0.1 } } };
const item = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4 } };

const teamMembers = [
  { role: "Director of Education", name: "Dr Adebayo Okafor", desc: "Oversees academic programmes and curriculum development across all school levels." },
  { role: "Head of Operations", name: "Mrs Funke Adeyemi", desc: "Manages school operations, logistics and administrative affairs." },
  { role: "Student Affairs", name: "Mr Tunde Balogun", desc: "Coordinates student welfare, guidance counselling and extracurricular activities." },
  { role: "Innovation Lead", name: "Miss Amara Nwosu", desc: "Leads STEM programmes, digital learning initiatives and innovation hub." },
];

const milestones = [
  { year: "2008", event: "School founded with 45 students and 6 teachers" },
  { year: "2013", event: "First set of WAEC candidates achieved 92% pass rate" },
  { year: "2016", event: "Expanded to include junior and senior secondary sections" },
  { year: "2019", event: "State-of-the-art science laboratory commissioned" },
  { year: "2022", event: "National recognition for academic excellence" },
  { year: "2024", event: "Digital learning platform launched for all students" },
];

export default function AboutPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {particles.map((p) => (
        <div key={p.id} className="particle" style={{ left: p.left, width: p.size, height: p.size, animationDuration: p.duration, animationDelay: p.delay }} />
      ))}

      <div className="navbar">
        <div className="nav-inner">
          <Link href="/" className="flex items-center gap-2"><img src="/logo.svg" alt="FFB" style={{ height: "50px" }} /></Link>
          <div className={`nav-links ${mobileMenuOpen ? "active" : ""}`}>
            <Link href="/">Home</Link>
            <Link href="/about" className="active">About</Link>
            <Link href="/events">Events</Link>
            <Link href="/news">News</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/portal/apply" className="menu-btn apply-btn" style={{ color: "#001f5f" }}>Admissions</Link>
            <Link href="/auth/login" className="menu-btn portal-btn">Portal</Link>
          </div>
          <div className="hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section style={{ marginTop: "80px", padding: "80px 20px 40px", textAlign: "center" }}>
        <motion.h1 {...fadeUp} style={{ fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 800 }}>
          About <span className="accent">FFB</span> Group of Schools
        </motion.h1>
        <motion.p {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.2 }} style={{ color: "rgba(255,255,255,0.7)", maxWidth: "650px", margin: "15px auto 0", lineHeight: 1.7 }}>
          Learn about our journey, mission and commitment to nurturing future leaders.
        </motion.p>
      </section>

      {/* Mission / Vision / Values */}
      <section className="glass-section">
        <motion.h2 className="section-title" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>Our Foundation</motion.h2>
        <motion.div className="features-grid" variants={stagger} initial="initial" whileInView="animate" viewport={{ once: true }}>
          {[
            { icon: "🎯", title: "Mission", desc: "To provide quality education that empowers students to become responsible leaders and lifelong learners through innovative teaching methods." },
            { icon: "🌍", title: "Vision", desc: "To be a leading institution recognized for academic excellence, character development and preparing students for global success." },
            { icon: "⭐", title: "Core Values", desc: "Integrity, Discipline, Excellence, Innovation and Respect. These values guide everything we do at FFB Group of Schools." },
          ].map((f, i) => (
            <motion.div key={i} className="feature-card" variants={item} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "40px", marginBottom: "15px" }}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* History Timeline */}
      <section className="glass-section">
        <motion.h2 className="section-title" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>Our Journey</motion.h2>
        <motion.p className="section-subtitle" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
          From humble beginnings to a leading educational institution.
        </motion.p>
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          {milestones.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }} style={{ display: "flex", gap: "20px", marginBottom: "30px", alignItems: "flex-start" }}>
              <div style={{ minWidth: "70px", textAlign: "center" }}>
                <div style={{ width: "14px", height: "14px", borderRadius: "50%", background: "#28ff9c", margin: "0 auto 8px" }}></div>
                <span style={{ fontSize: "15px", fontWeight: 700, color: "#28ff9c" }}>{m.year}</span>
              </div>
              <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: "16px", padding: "18px 22px", flex: 1, borderLeft: "3px solid #28ff9c" }}>
                <p style={{ fontSize: "14px", lineHeight: 1.6 }}>{m.event}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="glass-section">
        <motion.h2 className="section-title" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>Our Leadership</motion.h2>
        <motion.p className="section-subtitle" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
          Experienced educators committed to nurturing excellence.
        </motion.p>
        <motion.div className="features-grid" variants={stagger} initial="initial" whileInView="animate" viewport={{ once: true }}>
          {teamMembers.map((t, i) => (
            <motion.div key={i} className="feature-card" variants={item} style={{ textAlign: "center" }}>
              <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "linear-gradient(135deg, #0039a6, #28ff9c)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 15px", fontSize: "28px", fontWeight: 800 }}>
                {t.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <h3 style={{ fontSize: "16px", marginBottom: "4px" }}>{t.name}</h3>
              <p style={{ color: "#28ff9c", fontSize: "12px", fontWeight: 600, marginBottom: "10px" }}>{t.role}</p>
              <p style={{ fontSize: "13px" }}>{t.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Stats */}
      <section className="glass-section">
        <motion.div variants={stagger} initial="initial" whileInView="animate" viewport={{ once: true }} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "20px" }}>
          {[
            { val: "2000+", label: "Students" },
            { val: "120+", label: "Teachers" },
            { val: "98%", label: "Pass Rate" },
            { val: "15+", label: "Years" },
          ].map((s, i) => (
            <motion.div key={i} variants={item} style={{ textAlign: "center", padding: "25px", background: "rgba(40,255,156,0.06)", borderRadius: "20px", border: "1px solid rgba(40,255,156,0.15)" }}>
              <div style={{ fontSize: "32px", fontWeight: 800, color: "#28ff9c" }}>{s.val}</div>
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", marginTop: "5px" }}>{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA */}
      <section className="glass-section" style={{ textAlign: "center" }}>
        <motion.h2 className="section-title" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>Join Our Community</motion.h2>
        <motion.p className="section-subtitle" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
          Give your child the best education and leadership development.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} style={{ display: "flex", gap: "15px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/portal/apply" className="btn-primary">Apply for Admission</Link>
          <Link href="/contact" className="btn-primary" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff" }}>Contact Us</Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-grid">
          <div>
            <img src="/logo.svg" alt="FFB" style={{ height: "70px", marginBottom: "15px" }} />
            <p>FFB Group of Schools is committed to academic excellence, innovation and leadership development.</p>
          </div>
          <div>
            <h4>Quick Links</h4>
            <div className="footer-links">
              <Link href="/">Home</Link>
              <Link href="/about">About</Link>
              <Link href="/events">Events</Link>
              <Link href="/news">News</Link>
              <Link href="/contact">Contact</Link>
            </div>
          </div>
          <div>
            <h4>Contact</h4>
            <p>123 Education Avenue, GRA, Lagos</p>
            <p style={{ marginTop: "8px" }}>+234 905 998 0991</p>
            <p style={{ marginTop: "8px" }}>info@glopresc.com</p>
          </div>
        </div>
        <div className="footer-bottom">© 2025 FFB Group of Schools. All rights reserved.</div>
      </footer>
    </>
  );
}
