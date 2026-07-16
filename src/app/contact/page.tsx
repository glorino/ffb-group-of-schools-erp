"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";

const particles = Array.from({ length: 80 }, (_, i) => ({
  id: i, left: `${Math.random() * 100}%`, duration: `${10 + Math.random() * 20}s`,
  delay: `${Math.random() * 10}s`, size: `${3 + Math.random() * 3}px`,
}));

const stagger = { animate: { transition: { staggerChildren: 0.1 } } };
const item = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4 } };

export default function ContactPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 5000);
    setForm({ name: "", email: "", phone: "", subject: "", message: "" });
  };

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
            <Link href="/about">About</Link>
            <Link href="/events">Events</Link>
            <Link href="/news">News</Link>
            <Link href="/contact" className="active">Contact</Link>
            <Link href="/portal/apply" className="menu-btn apply-btn" style={{ color: "#001f5f" }}>Admissions</Link>
            <Link href="/auth/login" className="menu-btn portal-btn">Portal</Link>
          </div>
          <div className="hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>

      <section style={{ marginTop: "80px", padding: "80px 20px 40px", textAlign: "center" }}>
        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} style={{ fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 800 }}>
          Get In <span className="accent">Touch</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} style={{ color: "rgba(255,255,255,0.7)", maxWidth: "650px", margin: "15px auto 0", lineHeight: 1.7 }}>
          Have questions? Reach out to us and we will respond promptly.
        </motion.p>
      </section>

      <section className="glass-section">
        <motion.div variants={stagger} initial="initial" whileInView="animate" viewport={{ once: true }} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "40px" }}>
          {[
            { icon: "📍", title: "Address", text: "123 Education Avenue, GRA, Lagos State, Nigeria" },
            { icon: "📞", title: "Phone", text: "+234 905 998 0991" },
            { icon: "✉️", title: "Email", text: "info@glopresc.com" },
            { icon: "⏰", title: "Working Hours", text: "Mon - Fri: 7:30 AM - 4:00 PM" },
          ].map((c, i) => (
            <motion.div key={i} variants={item} whileHover={{ y: -3 }} style={{ background: "rgba(255,255,255,0.06)", borderRadius: "20px", padding: "25px", textAlign: "center", border: "1px solid rgba(255,255,255,0.08)", cursor: "default" }}>
              <div style={{ fontSize: "32px", marginBottom: "12px" }}>{c.icon}</div>
              <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "8px" }}>{c.title}</h3>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>{c.text}</p>
            </motion.div>
          ))}
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "30px", alignItems: "start" }}>
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "8px" }}>Send Us A Message</h2>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", marginBottom: "25px" }}>Fill out the form and our team will get back to you within 24 hours.</p>
            {sent && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ background: "rgba(40,255,156,0.1)", border: "1px solid rgba(40,255,156,0.3)", borderRadius: "12px", padding: "14px 18px", marginBottom: "20px", color: "#28ff9c", fontSize: "14px", fontWeight: 600 }}>
                Message sent successfully! We will get back to you soon.
              </motion.div>
            )}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <input className="input-glass" placeholder="Your Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <input className="input-glass" placeholder="Email Address" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <input className="input-glass" placeholder="Phone Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                <input className="input-glass" placeholder="Subject" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
              </div>
              <textarea className="input-glass" placeholder="Your Message" rows={5} required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} style={{ resize: "vertical", minHeight: "120px" }} />
              <motion.button type="submit" className="btn-primary" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ width: "100%", padding: "16px" }}>
                Send Message
              </motion.button>
            </form>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} style={{ borderRadius: "25px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" }}>
            <iframe src="https://www.google.com/maps?q=Lagos+Nigeria&output=embed" style={{ width: "100%", height: "450px", border: "none", borderRadius: "25px" }}></iframe>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="glass-section">
        <motion.h2 className="section-title" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>Frequently Asked Questions</motion.h2>
        <div style={{ maxWidth: "700px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "12px" }}>
          {[
            { q: "What is the admission process?", a: "Visit our Apply page to fill out the admission form. Shortlisted candidates will be contacted for an entrance examination and interview." },
            { q: "Do you offer boarding facilities?", a: "Yes, FFB Group of Schools provides comfortable boarding facilities for students from Junior Secondary upwards." },
            { q: "What extracurricular activities are available?", a: "We offer sports, clubs, debates, science exhibitions, cultural events and leadership programmes." },
            { q: "How can I track my child's progress?", a: "Parents can track their child's academic progress through the school portal using their login credentials." },
          ].map((faq, i) => (
            <motion.details key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} style={{ background: "rgba(255,255,255,0.04)", borderRadius: "16px", padding: "18px 22px", border: "1px solid rgba(255,255,255,0.06)" }}>
              <summary style={{ cursor: "pointer", fontWeight: 600, fontSize: "14px", listStyle: "none" }}>{faq.q}</summary>
              <p style={{ marginTop: "10px", fontSize: "13px", color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>{faq.a}</p>
            </motion.details>
          ))}
        </div>
      </section>

      <footer className="footer">
        <div className="footer-bottom">© 2025 FFB Group of Schools. All rights reserved.</div>
      </footer>
    </>
  );
}
