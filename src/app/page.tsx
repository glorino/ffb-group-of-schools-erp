"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const particles = Array.from({ length: 80 }, (_, i) => ({
  id: i, left: `${Math.random() * 100}%`, duration: `${10 + Math.random() * 20}s`,
  delay: `${Math.random() * 10}s`, size: `${3 + Math.random() * 3}px`,
}));

const events = [
  { title: "Interhouse Sports", desc: "Annual sports competition showcasing teamwork and athleticism across all houses.", date: "2026-03-25T09:00:00" },
  { title: "Science Exhibition", desc: "Students present innovative science projects and research findings.", date: "2026-04-10T10:00:00" },
  { title: "Graduation Ceremony", desc: "Celebrating graduating students and their achievements.", date: "2026-07-18T11:00:00" },
];

const newsItems = [
  { title: "Academic Excellence Award", desc: "Our students received national recognition for outstanding WAEC results.", full: "FFB Group of Schools has once again demonstrated academic excellence as our students received national recognition for their outstanding WAEC results. With a 98% pass rate and multiple distinctions across key subjects, our school has been ranked among the top performing institutions in the state.", gradient: "linear-gradient(135deg, #1e3a8a, #3b82f6)", image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&h=400&fit=crop" },
  { title: "New Science Laboratory", desc: "A state-of-the-art science laboratory was commissioned.", full: "A new state-of-the-art science laboratory has been commissioned at FFB Group of Schools. The laboratory features modern equipment for Physics, Chemistry, and Biology practical sessions. This facility will provide students with hands-on experience.", gradient: "linear-gradient(135deg, #164e63, #06b6d4)", image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&h=400&fit=crop" },
  { title: "Leadership Bootcamp", desc: "Students trained in leadership development and innovation.", full: "Over 150 students participated in the annual Leadership Bootcamp organized by FFB Group of Schools. The programme covered topics including public speaking, project management, entrepreneurship, and digital literacy.", gradient: "linear-gradient(135deg, #312e81, #6366f1)", image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&h=400&fit=crop" },
];

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
  if (t.expired) return null;
  return (
    <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginTop: "12px" }}>
      {[{ val: t.days, label: "D" }, { val: t.hours, label: "H" }, { val: t.minutes, label: "M" }, { val: t.seconds, label: "S" }].map((u) => (
        <div key={u.label} style={{ textAlign: "center" }}>
          <div style={{ background: "rgba(40,255,156,0.15)", border: "1px solid rgba(40,255,156,0.3)", borderRadius: "10px", padding: "6px 10px", minWidth: "42px" }}>
            <span style={{ fontSize: "18px", fontWeight: 800, color: "#28ff9c" }}>{String(u.val).padStart(2, "0")}</span>
          </div>
          <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.4)", marginTop: "3px", display: "block" }}>{u.label}</span>
        </div>
      ))}
    </div>
  );
}

const fadeUp = { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };
const stagger = { animate: { transition: { staggerChildren: 0.1 } } };
const item = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4 } };

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [newsModal, setNewsModal] = useState<number | null>(null);
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState("");

  const testimonials = [
    { text: "FFB transformed my child's confidence and academic performance.", name: "Mrs Adewale" },
    { text: "The teachers are passionate and supportive.", name: "Mr Johnson" },
    { text: "A wonderful environment for learning and character development.", name: "Mrs Bello" },
  ];

  useEffect(() => {
    const interval = setInterval(() => setTestimonialIdx((prev) => (prev + 1) % testimonials.length), 4000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const nextEvent = events.find((e) => new Date(e.date).getTime() > Date.now()) || events[events.length - 1];

  const handleSubscribe = async () => {
    if (!email) return;
    try {
      const url = process.env.NEXT_PUBLIC_MAILCHIMP_URL || "https://glopresc.us18.list-manage.com/subscribe/post-json";
      const params = new URLSearchParams({ EMAIL: email, u: process.env.NEXT_PUBLIC_MAILCHIMP_U || "", id: process.env.NEXT_PUBLIC_MAILCHIMP_ID || "" });
      await fetch(`${url}?${params.toString()}`, { mode: "no-cors" });
    } catch {}
    setSubscribed(true);
    setEmail("");
  };

  return (
    <>
      {particles.map((p) => (
        <div key={p.id} className="particle" style={{ left: p.left, width: p.size, height: p.size, animationDuration: p.duration, animationDelay: p.delay }} />
      ))}

      {/* Navbar */}
      <div className="navbar">
        <div className="nav-inner">
          <Link href="/" className="flex items-center gap-2"><img src="/logo.svg" alt="FFB" style={{ height: "50px" }} /></Link>
          <div className={`nav-links ${mobileMenuOpen ? "active" : ""}`}>
            <Link href="/">Home</Link>
            <Link href="/about">About</Link>
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
      <section className="hero">
        <video autoPlay muted loop playsInline>
          <source src="/video/school-hero.mp4" type="video/mp4" />
        </video>
        <div className="hero-overlay"></div>
        <div className="hero-content container">
          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            Building Leaders<br />For The <span className="accent">Future</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
            FFB Group of Schools provides a world-class learning environment where students develop academic excellence, leadership and innovation.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }} style={{ display: "flex", gap: "15px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/portal/apply" className="hero-btn" style={{ background: "#28ff9c", color: "#001f5f" }}>Apply For Admission</Link>
            <Link href="/auth/login" className="hero-btn" style={{ background: "rgba(0,0,0,0.6)", border: "1px solid #fff" }}>Portal Login</Link>
          </motion.div>
        </div>
      </section>

      {/* About */}
      <section className="glass-section" id="about-section">
        <motion.h2 className="section-title" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>About FFB Group of Schools</motion.h2>
        <motion.p className="section-subtitle" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
          FFB Group of Schools is committed to nurturing future leaders through academic excellence, innovation and strong character development.
        </motion.p>
        <motion.div className="features-grid" variants={stagger} initial="initial" whileInView="animate" viewport={{ once: true }}>
          {[
            { icon: "🎯", title: "Mission", desc: "To provide quality education that empowers students to become responsible leaders and lifelong learners." },
            { icon: "🌍", title: "Vision", desc: "To be a leading institution recognized for academic excellence and character development globally." },
            { icon: "⭐", title: "Core Values", desc: "Integrity, Discipline, Excellence, Innovation and Respect for all members of the school community." },
          ].map((f, i) => (
            <motion.div key={i} className="feature-card" variants={item} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "40px", marginBottom: "15px" }}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Founder */}
      <section className="glass-section">
        <div className="founder">
          <motion.img src="/logo.svg" alt="Founder" style={{ width: "260px", height: "300px", borderRadius: "20px", objectFit: "cover", border: "2px solid rgba(255,255,255,0.15)", background: "rgba(0,31,95,0.5)", padding: "20px" }} initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} />
          <motion.div className="founder-text" initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="section-title" style={{ textAlign: "left", fontSize: "32px" }}>Message From The Founder</h2>
            <p>Welcome to FFB Group of Schools. Our mission is to inspire young minds to achieve their highest potential academically and morally. We believe every child deserves access to quality education and mentorship that prepares them for global success.</p>
            <p>At FFB we focus not only on academic excellence but also on leadership development, discipline and innovation.</p>
            <h4>— Founder, FFB Group of Schools</h4>
          </motion.div>
        </div>
      </section>

      {/* Events with Countdown */}
      <section className="glass-section" id="events-section">
        <motion.h2 className="section-title" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>Upcoming Events</motion.h2>
        <motion.p className="section-subtitle" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
          Stay updated with our academic calendar, competitions and school activities.
        </motion.p>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: "40px", padding: "30px", background: "rgba(40,255,156,0.05)", borderRadius: "20px", border: "1px solid rgba(40,255,156,0.15)" }}>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", marginBottom: "5px" }}>NEXT EVENT</p>
          <h3 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "10px" }}>{nextEvent.title}</h3>
          <CountdownTimer date={nextEvent.date} />
        </motion.div>

        <motion.div className="events-grid" variants={stagger} initial="initial" whileInView="animate" viewport={{ once: true }}>
          {events.map((e, i) => (
            <motion.div key={i} className="event-card" variants={item}>
              <h3>{e.title}</h3>
              <p>{e.desc}</p>
              <span className="event-date">{new Date(e.date).toLocaleDateString("en-NG", { month: "long", day: "numeric", year: "numeric" })}</span>
              <CountdownTimer date={e.date} />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* News with Images + Modal */}
      <section className="glass-section" id="news-section">
        <motion.h2 className="section-title" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>Featured News</motion.h2>
        <motion.p className="section-subtitle" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
          Stay updated with the latest happenings at FFB Group of Schools.
        </motion.p>
        <motion.div className="news-grid" variants={stagger} initial="initial" whileInView="animate" viewport={{ once: true }}>
          {newsItems.map((n, i) => (
            <motion.div key={i} className="news-card" variants={item}>
              <img src={n.image} alt={n.title} className="w-full h-[200px] object-cover rounded-t-[25px]" onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=400&fit=crop"; }} />
              <div className="news-content">
                <h3>{n.title}</h3>
                <p>{n.desc}</p>
                <span className="read-more" onClick={() => setNewsModal(i)}>Read More</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* News Modal */}
      {newsModal !== null && (
        <div className="modal" style={{ display: "flex" }} onClick={() => setNewsModal(null)}>
          <motion.div className="modal-content" onClick={(e) => e.stopPropagation()} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
            <button className="modal-close" onClick={() => setNewsModal(null)}>&times;</button>
            <img src={newsItems[newsModal].image} alt={newsItems[newsModal].title} className="w-full h-[200px] object-cover rounded-2xl mb-5" onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=400&fit=crop"; }} />
            <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "15px" }}>{newsItems[newsModal].title}</h2>
            <p style={{ color: "rgba(255,255,255,0.75)", lineHeight: 1.8 }}>{newsItems[newsModal].full}</p>
          </motion.div>
        </div>
      )}

      {/* Testimonials */}
      <section className="glass-section">
        <motion.h2 className="section-title" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>Testimonials</motion.h2>
        <motion.p className="section-subtitle" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
          What parents and students say about our learning environment.
        </motion.p>
        <div style={{ textAlign: "center", minHeight: "120px" }}>
          {testimonials.map((t, i) => (
            <motion.div key={i} style={{ display: i === testimonialIdx ? "block" : "none" }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <p style={{ fontStyle: "italic", fontSize: "20px", lineHeight: 1.7 }}>&ldquo;{t.text}&rdquo;</p>
              <h4 style={{ marginTop: "15px", color: "#28ff9c", fontSize: "16px" }}>— {t.name}</h4>
            </motion.div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "25px" }}>
          {testimonials.map((_, i) => (
            <button key={i} onClick={() => setTestimonialIdx(i)} style={{ width: i === testimonialIdx ? "30px" : "10px", height: "10px", borderRadius: "5px", border: "none", background: i === testimonialIdx ? "#28ff9c" : "rgba(255,255,255,0.3)", cursor: "pointer", transition: "0.3s" }} />
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="glass-section">
        <motion.h2 className="section-title" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>Subscribe To Our Newsletter</motion.h2>
        <motion.p className="section-subtitle" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
          Get updates, school news and event notifications directly to your inbox.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
          {subscribed ? (
            <p style={{ textAlign: "center", color: "#28ff9c", fontWeight: 600 }}>Thank you for subscribing!</p>
          ) : (
            <div className="newsletter-form">
              <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <button type="button" onClick={handleSubscribe}>Subscribe</button>
            </div>
          )}
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-grid">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <img src="/logo.svg" alt="FFB" style={{ height: "70px", marginBottom: "15px" }} />
            <p>FFB Group of Schools is committed to academic excellence, innovation and leadership development.</p>
            <div className="social-icons">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg></a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></a>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
            <h4>Quick Links</h4>
            <div className="footer-links">
              <Link href="/">Home</Link>
              <Link href="/about">About Us</Link>
              <Link href="/events">Events</Link>
              <Link href="/news">News</Link>
              <Link href="/contact">Contact</Link>
              <Link href="/portal/apply">Apply for Admission</Link>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
            <h4>Contact</h4>
            <p>123 Education Avenue, GRA<br />Lagos State, Nigeria</p>
            <p style={{ marginTop: "8px" }}>Phone: +234 905 998 0991</p>
            <p style={{ marginTop: "8px" }}>Email: info@glopresc.com</p>
            <div className="footer-map" style={{ marginTop: "15px" }}><iframe src="https://www.google.com/maps?q=Lagos+Nigeria&output=embed"></iframe></div>
          </motion.div>
        </div>
        <div className="footer-bottom">© 2025 FFB Group of Schools. All rights reserved.</div>
      </footer>

      {/* Floating Contact */}
      <div className="fab-container">
        <a href="tel:+2349059980991" className="fab fab-call" title="Call Us">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/></svg>
        </a>
        <a href="https://wa.me/2349059980991" className="fab fab-whatsapp" title="WhatsApp" target="_blank" rel="noopener noreferrer">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        </a>
        <a href="mailto:info@glopresc.com" className="fab fab-email" title="Email Us">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
        </a>
      </div>
    </>
  );
}
