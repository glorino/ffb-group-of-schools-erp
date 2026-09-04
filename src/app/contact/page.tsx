"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { SCHOOL_CONFIG } from "@/lib/school-config";

const particles = Array.from({ length: 80 }, (_, i) => ({
  id: i, left: `${Math.random() * 100}%`, duration: `${10 + Math.random() * 20}s`,
  delay: `${Math.random() * 10}s`, size: `${3 + Math.random() * 3}px`,
}));

export default function ContactPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [faqs, setFaqs] = useState<{q: string; a: string}[]>([]);

  useEffect(() => {
    fetch("/api/public/faqs")
      .then((res) => res.json())
      .then((data) => {
        const items = (data.faqs || []).map((f: any) => ({ q: f.question, a: f.answer }));
        setFaqs(items.length > 0 ? items : [
          { q: "What is the admission process?", a: "Visit our Apply page to fill out the admission form. Shortlisted candidates will be contacted for an entrance examination and interview." },
          { q: "Do you offer boarding facilities?", a: "Yes, we provide comfortable boarding facilities for students." },
          { q: "How can I track my child's progress?", a: "Parents can track their child's academic progress through the school portal." },
        ]);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send message");
      setSent(true);
      setTimeout(() => setSent(false), 5000);
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch {
      alert("Failed to send message. Please try again later.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-animated" style={{ minHeight: "100vh" }}>
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
        <h1 style={{ fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 800, color: "#fff" }}>
          Get In <span className="accent">Touch</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.8)", maxWidth: "650px", margin: "15px auto 0", lineHeight: 1.7 }}>
          Have questions? Reach out to us and we will respond promptly.
        </p>
      </section>

      <section className="glass-section">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "40px" }}>
          {[
            { icon: "📍", title: "Address", text: SCHOOL_CONFIG.address },
            { icon: "📞", title: "Phone", text: SCHOOL_CONFIG.phone },
            { icon: "✉️", title: "Email", text: SCHOOL_CONFIG.email },
            { icon: "⏰", title: "Working Hours", text: SCHOOL_CONFIG.workingHours },
          ].map((c, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.06)", borderRadius: "20px", padding: "25px", textAlign: "center", border: "1px solid rgba(255,255,255,0.08)", cursor: "default" }}>
              <div style={{ fontSize: "32px", marginBottom: "12px" }}>{c.icon}</div>
              <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "8px", color: "#fff" }}>{c.title}</h3>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>{c.text}</p>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "30px", alignItems: "start" }}>
          <div>
            <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "8px", color: "#fff" }}>Send Us A Message</h2>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px", marginBottom: "25px" }}>Fill out the form and our team will get back to you within 24 hours.</p>
            {sent && (
              <div style={{ background: "rgba(40,255,156,0.1)", border: "1px solid rgba(40,255,156,0.3)", borderRadius: "12px", padding: "14px 18px", marginBottom: "20px", color: "#28ff9c", fontSize: "14px", fontWeight: 600 }}>
                Message sent successfully! We will get back to you soon.
              </div>
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
              <button type="submit" className="btn-primary" disabled={sending} style={{ width: "100%", padding: "16px", opacity: sending ? 0.7 : 1, color: "#ffffff" }}>
                {sending ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>

          <div style={{ borderRadius: "25px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" }}>
            <iframe src={`https://www.google.com/maps?q=${SCHOOL_CONFIG.googleMapsQuery}&output=embed`} style={{ width: "100%", height: "450px", border: "none", borderRadius: "25px" }}></iframe>
          </div>
        </div>
      </section>

      <section className="glass-section">
        <h2 className="section-title" style={{ color: "#fff" }}>Frequently Asked Questions</h2>
        <div style={{ maxWidth: "700px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "12px" }}>
          {faqs.map((faq, i) => (
            <details key={i} style={{ background: "rgba(255,255,255,0.04)", borderRadius: "16px", padding: "18px 22px", border: "1px solid rgba(255,255,255,0.06)" }}>
              <summary style={{ cursor: "pointer", fontWeight: 600, fontSize: "14px", listStyle: "none", color: "#fff" }}>{faq.q}</summary>
              <p style={{ marginTop: "10px", fontSize: "13px", color: "rgba(255,255,255,0.8)", lineHeight: 1.6 }}>{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="footer">
        <div className="footer-bottom" style={{ color: "#fff" }}>{`© ${new Date().getFullYear()} ${SCHOOL_CONFIG.name}. All rights reserved.`}</div>
      </footer>
    </div>
  );
}
