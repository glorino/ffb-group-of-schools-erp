"use client";

import Link from "next/link";

const particles = Array.from({ length: 40 }, (_, i) => ({
  id: i, left: `${Math.random() * 100}%`, duration: `${10 + Math.random() * 20}s`,
  delay: `${Math.random() * 10}s`, size: `${3 + Math.random() * 3}px`,
}));

export default function AboutPage() {
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
            <Link href="/about" style={{ color: "#28ff9c" }}>About</Link>
            <Link href="/events">Events</Link>
            <Link href="/news">News</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/portal/apply" className="menu-btn apply-btn" style={{ color: "#001f5f" }}>Admissions</Link>
            <Link href="/auth/login" className="menu-btn portal-btn">Portal</Link>
          </div>
        </div>
      </div>

      <div style={{ paddingTop: "120px", paddingBottom: "60px", maxWidth: "1200px", margin: "auto", padding: "120px 20px 60px" }}>
        <h1 className="section-title">About FFB Group of Schools</h1>
        <p className="section-subtitle">Excellence, Discipline, Integrity — Building Leaders Since 1998</p>

        <div className="glass-section" style={{ marginTop: "40px" }}>
          <h2 className="section-title" style={{ fontSize: "32px" }}>Our Story</h2>
          <p className="section-subtitle">Founded in 1998, FFB Group of Schools has grown from a small community school to one of the most respected educational institutions in the region. With a student body of over 1,200 learners, 85+ qualified teachers, and state-of-the-art facilities, we provide an environment where every child can thrive academically, socially, and personally.</p>
        </div>

        <div className="glass-section">
          <div className="features-grid">
            {[
              { icon: "🎯", title: "Mission", desc: "To provide quality education that empowers students to become responsible leaders and lifelong learners." },
              { icon: "🌍", title: "Vision", desc: "To be a leading institution recognized for academic excellence and character development globally." },
              { icon: "⭐", title: "Core Values", desc: "Integrity, Discipline, Excellence, Innovation and Respect for all members of the school community." },
            ].map((f, i) => (
              <div key={i} className="feature-card" style={{ textAlign: "center" }}>
                <div style={{ fontSize: "40px", marginBottom: "15px" }}>{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-section">
          <div className="founder">
            <img src="/founder.jpg" alt="Founder" style={{ width: "260px", height: "300px", borderRadius: "20px", objectFit: "cover", border: "2px solid rgba(255,255,255,0.15)" }} />
            <div className="founder-text">
              <h2 className="section-title" style={{ textAlign: "left", fontSize: "32px" }}>Message From The Founder</h2>
              <p>Welcome to FFB Group of Schools. Our mission is to inspire young minds to achieve their highest potential academically and morally. We believe every child deserves access to quality education, modern learning resources and mentorship that prepares them for global success.</p>
              <p>At FFB we focus not only on academic excellence but also on leadership development, discipline and innovation.</p>
              <h4>— Founder, FFB Group of Schools</h4>
            </div>
          </div>
        </div>

        <div className="glass-section">
          <h2 className="section-title" style={{ fontSize: "32px" }}>Why Choose FFB?</h2>
          <div className="features-grid">
            {[
              { icon: "🏆", title: "25+ Years", desc: "A proven track record of academic distinction since 1998." },
              { icon: "📊", title: "Top Results", desc: "Consistently among the top-performing schools in WAEC/NECO." },
              { icon: "🔬", title: "Modern Labs", desc: "Fully equipped science, computer, and language laboratories." },
              { icon: "⚽", title: "Sports Complex", desc: "Football field, basketball court, and swimming pool." },
              { icon: "📚", title: "Library", desc: "Over 10,000 volumes and digital research center." },
              { icon: "🛡️", title: "Safe Campus", desc: "24/7 security, CCTV surveillance, and health clinic." },
            ].map((item, i) => (
              <div key={i} className="feature-card" style={{ textAlign: "center" }}>
                <div style={{ fontSize: "36px", marginBottom: "12px" }}>{item.icon}</div>
                <h3 style={{ fontSize: "18px" }}>{item.title}</h3>
                <p style={{ fontSize: "14px" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="footer">
        <div className="footer-bottom">© 2025 FFB Group of Schools. All rights reserved.</div>
      </footer>
    </>
  );
}
