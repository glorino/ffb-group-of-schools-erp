"use client";

import Link from "next/link";

const particles = Array.from({ length: 40 }, (_, i) => ({
  id: i, left: `${Math.random() * 100}%`, duration: `${10 + Math.random() * 20}s`,
  delay: `${Math.random() * 10}s`, size: `${3 + Math.random() * 3}px`,
}));

export default function ContactPage() {
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
            <Link href="/events">Events</Link>
            <Link href="/news">News</Link>
            <Link href="/contact" style={{ color: "#28ff9c" }}>Contact</Link>
            <Link href="/portal/apply" className="menu-btn apply-btn" style={{ color: "#001f5f" }}>Admissions</Link>
            <Link href="/auth/login" className="menu-btn portal-btn">Portal</Link>
          </div>
        </div>
      </div>

      <div style={{ paddingTop: "120px", paddingBottom: "60px", maxWidth: "1200px", margin: "auto", padding: "120px 20px 60px" }}>
        <h1 className="section-title">Contact Us</h1>
        <p className="section-subtitle">Have questions? We would love to hear from you.</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px" }}>
          <div className="glass-section" style={{ marginTop: 0 }}>
            <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "25px" }}>Get In Touch</h2>
            {[
              { icon: "📍", text: "123 Education Avenue, GRA, Lagos State, Nigeria" },
              { icon: "📞", text: "+234 905 998 0991" },
              { icon: "✉️", text: "info@glopresc.com" },
              { icon: "🕐", text: "Mon - Fri: 7:30 AM - 4:00 PM" },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "15px", padding: "15px 0", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <span style={{ fontSize: "22px" }}>{item.icon}</span>
                <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.6, fontSize: "14px" }}>{item.text}</p>
              </div>
            ))}

            <div style={{ marginTop: "25px", borderRadius: "16px", overflow: "hidden", height: "200px" }}>
              <iframe src="https://www.google.com/maps?q=Lagos+Nigeria&output=embed" style={{ width: "100%", height: "100%", border: "none" }}></iframe>
            </div>
          </div>

          <div className="glass-section" style={{ marginTop: 0 }}>
            <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "25px" }}>Send Us a Message</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
              <input placeholder="First Name" className="input-glass" />
              <input placeholder="Last Name" className="input-glass" />
            </div>
            <input placeholder="Email Address" type="email" className="input-glass" style={{ marginTop: "15px" }} />
            <input placeholder="Phone Number" className="input-glass" style={{ marginTop: "15px" }} />
            <textarea placeholder="Your Message" rows={5} className="input-glass" style={{ marginTop: "15px", resize: "none" }}></textarea>
            <button className="btn-primary" style={{ marginTop: "20px", width: "100%", padding: "16px", fontSize: "15px" }}>Send Message</button>
          </div>
        </div>
      </div>

      <footer className="footer">
        <div className="footer-bottom">© 2025 FFB Group of Schools. All rights reserved.</div>
      </footer>
    </>
  );
}
