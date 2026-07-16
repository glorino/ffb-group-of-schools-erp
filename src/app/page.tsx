"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const particles = Array.from({ length: 80 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  duration: `${10 + Math.random() * 20}s`,
  delay: `${Math.random() * 10}s`,
  size: `${3 + Math.random() * 3}px`,
}));

const events = [
  { title: "Interhouse Sports", desc: "Annual sports competition showcasing teamwork.", date: "March 25, 2026" },
  { title: "Science Exhibition", desc: "Students present innovative science projects.", date: "April 10, 2026" },
  { title: "Graduation Ceremony", desc: "Celebrating graduating students.", date: "July 18, 2026" },
];

const news = [
  { title: "Academic Excellence Award", desc: "Our students received national recognition for outstanding WAEC results.", color: "from-blue-500 to-blue-800" },
  { title: "New Science Laboratory", desc: "A state-of-the-art science laboratory was commissioned.", color: "from-cyan-500 to-cyan-800" },
  { title: "Leadership Bootcamp", desc: "Students trained in leadership development and innovation.", color: "from-indigo-500 to-indigo-800" },
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  const testimonials = [
    { text: "FFB transformed my child's confidence and academic performance.", name: "Mrs Adewale" },
    { text: "The teachers are passionate and supportive.", name: "Mr Johnson" },
    { text: "A wonderful environment for learning and character development.", name: "Mrs Bello" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialIdx((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <>
      {/* Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            animationDuration: p.duration,
            animationDelay: p.delay,
          }}
        />
      ))}

      {/* Navbar */}
      <div className="navbar">
        <div className="nav-inner">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0039a6, #001f5f)", border: "1px solid rgba(255,255,255,0.15)" }}>
              <svg viewBox="0 0 64 64" className="w-7 h-7" fill="none">
                <path d="M32 4 L56 14 L56 32 C56 48 44 58 32 62 C20 58 8 48 8 32 L8 14 Z" fill="#0039a6" stroke="#28ff9c" strokeWidth="2"/>
                <text x="32" y="20" textAnchor="middle" fontFamily="Poppins" fontWeight="bold" fontSize="10" fill="#28ff9c">FFB</text>
                <path d="M20 36 L32 42 L44 36 L44 48 L32 54 L20 48 Z" fill="#28ff9c" opacity="0.9"/>
              </svg>
            </div>
            <img src="/logo.svg" alt="FFB" className="h-[45px] hidden sm:block" />
          </Link>

          <div className={`nav-links ${mobileMenuOpen ? "active" : ""}`}>
            <a href="#about">Home</a>
            <a href="#about-section">About</a>
            <a href="#events">Events</a>
            <a href="#news">News</a>
            <a href="#contact">Contact</a>
            <Link href="/portal" className="menu-btn apply-btn">Admissions</Link>
            <Link href="/auth/login" className="menu-btn portal-btn">Portal</Link>
          </div>

          <div className="hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="hero">
        <video autoPlay muted loop playsInline poster="">
          <source src="/school-hero.mp4" type="video/mp4" />
        </video>
        <div className="hero-overlay"></div>
        <div className="hero-content container">
          <h1>
            Building Leaders<br />
            For The <span className="accent">Future</span>
          </h1>
          <p>
            FFB Group of Schools provides a world-class learning
            environment where students develop academic excellence,
            leadership and innovation.
          </p>
          <Link href="/portal" className="hero-btn" style={{ background: "#28ff9c", color: "#001f5f" }}>
            Apply For Admission
          </Link>
          <Link href="/auth/login" className="hero-btn" style={{ background: "rgba(0,0,0,0.6)", border: "1px solid #fff" }}>
            Portal Login
          </Link>
        </div>
      </section>

      {/* About */}
      <section className="glass-section" id="about-section">
        <h2 className="section-title">About FFB Group of Schools</h2>
        <p className="section-subtitle">
          FFB Group of Schools is committed to nurturing future leaders through
          academic excellence, innovation and strong character development.
          Our institution provides modern facilities, highly qualified teachers
          and a safe environment where students can grow intellectually,
          socially and morally.
        </p>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Mission</h3>
            <p>
              To provide quality education that empowers students
              to become responsible leaders and lifelong learners.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌍</div>
            <h3>Vision</h3>
            <p>
              To be a leading institution recognized for academic excellence
              and character development globally.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⭐</div>
            <h3>Core Values</h3>
            <p>
              Integrity, Discipline, Excellence, Innovation
              and Respect for all members of the school community.
            </p>
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="glass-section">
        <div className="founder">
          <div className="founder-img">
            <svg viewBox="0 0 64 64" className="w-20 h-20" fill="none">
              <path d="M32 4 L56 14 L56 32 C56 48 44 58 32 62 C20 58 8 48 8 32 L8 14 Z" fill="#0039a6" stroke="#28ff9c" strokeWidth="2"/>
              <text x="32" y="20" textAnchor="middle" fontFamily="Poppins" fontWeight="bold" fontSize="10" fill="#28ff9c">FFB</text>
              <path d="M20 36 L32 42 L44 36 L44 48 L32 54 L20 48 Z" fill="#28ff9c" opacity="0.9"/>
            </svg>
          </div>
          <div className="founder-text">
            <h2 className="section-title" style={{ textAlign: "left" }}>Message From The Founder</h2>
            <p>
              Welcome to FFB Group of Schools. Our mission is to inspire young minds to achieve their highest
              potential academically and morally. We believe every child
              deserves access to quality education, modern learning resources
              and mentorship that prepares them for global success.
            </p>
            <p>
              At FFB we focus not only on academic excellence but also on
              leadership development, discipline and innovation.
            </p>
            <h4>— Founder, FFB Group of Schools</h4>
          </div>
        </div>
      </section>

      {/* Events */}
      <section className="glass-section" id="events">
        <h2 className="section-title">Upcoming Events</h2>
        <p className="section-subtitle">
          Stay updated with our academic calendar, competitions
          and school activities.
        </p>
        <div className="events-grid">
          {events.map((e, i) => (
            <div key={i} className="event-card">
              <h3>{e.title}</h3>
              <p>{e.desc}</p>
              <span className="event-date">{e.date}</span>
            </div>
          ))}
        </div>
      </section>

      {/* News */}
      <section className="glass-section" id="news">
        <h2 className="section-title">Featured News</h2>
        <p className="section-subtitle">
          Stay updated with the latest happenings at FFB Group of Schools.
        </p>
        <div className="news-grid">
          {news.map((n, i) => (
            <div key={i} className="news-card">
              <div className={`news-card-img bg-gradient-to-br ${n.color}`}></div>
              <div className="news-content">
                <h3>{n.title}</h3>
                <p>{n.desc}</p>
                <span className="read-more">Read More</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="glass-section">
        <h2 className="section-title">Testimonials</h2>
        <p className="section-subtitle">
          What parents and students say about our learning environment.
        </p>
        {testimonials.map((t, i) => (
          <div key={i} className={`testimonial ${i === testimonialIdx ? "active" : ""}`}>
            <p>&ldquo;{t.text}&rdquo;</p>
            <h4>— {t.name}</h4>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "30px" }}>
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setTestimonialIdx(i)}
              style={{
                width: i === testimonialIdx ? "30px" : "10px",
                height: "10px",
                borderRadius: "5px",
                border: "none",
                background: i === testimonialIdx ? "#28ff9c" : "rgba(255,255,255,0.3)",
                cursor: "pointer",
                transition: "0.3s",
              }}
            />
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="glass-section">
        <h2 className="section-title">Subscribe To Our Newsletter</h2>
        <p className="section-subtitle">
          Get updates, school news and event notifications directly to your inbox.
        </p>
        <div className="newsletter-form">
          <input type="email" placeholder="Enter your email" />
          <button type="button">Subscribe</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-grid">
          <div>
            <img src="/logo.svg" alt="FFB" style={{ height: "70px", marginBottom: "15px" }} />
            <p>
              FFB Group of Schools is committed to academic excellence,
              innovation and leadership development.
              We nurture future leaders prepared for global success.
            </p>
            <div className="social-icons">
              <a href="#"><span>f</span></a>
              <a href="#"><span>ig</span></a>
              <a href="#"><span>tw</span></a>
              <a href="#"><span>yt</span></a>
            </div>
          </div>
          <div>
            <h4>Quick Links</h4>
            <div className="footer-links">
              <a href="#about-section">Home</a>
              <a href="#about-section">About Us</a>
              <a href="#events">Events</a>
              <a href="#news">News</a>
              <a href="#contact">Contact</a>
              <a href="/portal">Apply for Admission</a>
            </div>
          </div>
          <div>
            <h4>Contact</h4>
            <p>123 Education Avenue, GRA<br />Lagos State, Nigeria</p>
            <p style={{ marginTop: "8px" }}>Phone: +234 (0) 801 234 5678</p>
            <p style={{ marginTop: "8px" }}>Email: info@ffb.edu.ng</p>
            <div className="footer-map" style={{ marginTop: "15px" }}>
              <iframe
                src="https://www.google.com/maps?q=Lagos+Nigeria&output=embed"
              ></iframe>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          © 2025 FFB Group of Schools. All rights reserved.
        </div>
      </footer>

      {/* Floating Contact */}
      <div className="fab-container">
        <a href="tel:+2348012345678" className="fab fab-call" title="Call Us">📞</a>
        <a href="https://wa.me/2348012345678" className="fab fab-whatsapp" title="WhatsApp" target="_blank">💬</a>
        <a href="mailto:info@ffb.edu.ng" className="fab fab-email" title="Email Us">✉️</a>
      </div>
    </>
  );
}
