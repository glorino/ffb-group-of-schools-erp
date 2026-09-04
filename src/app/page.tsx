"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { SCHOOL_CONFIG } from "@/lib/school-config";

const particles = Array.from({ length: 80 }, (_, i) => ({
  id: i, left: `${Math.random() * 100}%`, duration: `${10 + Math.random() * 20}s`,
  delay: `${Math.random() * 10}s`, size: `${3 + Math.random() * 3}px`,
}));

const captions = [
  "Excellence", "Leadership", "Innovation", "Discipline", "Character", "Integrity"
];

function TypewriterCaption() {
  const [captionIdx, setCaptionIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [text, setText] = useState("");

  useEffect(() => {
    const currentWord = captions[captionIdx];
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setText(currentWord.substring(0, charIdx + 1));
        setCharIdx(charIdx + 1);
        if (charIdx + 1 === currentWord.length) {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        setText(currentWord.substring(0, charIdx - 1));
        setCharIdx(charIdx - 1);
        if (charIdx - 1 === 0) {
          setIsDeleting(false);
          setCaptionIdx((prev) => (prev + 1) % captions.length);
        }
      }
    }, isDeleting ? 60 : 120);
    return () => clearTimeout(timeout);
  }, [charIdx, isDeleting, captionIdx]);

  return (
    <span className="accent">{text}<span style={{ borderRight: "3px solid #28ff9c", animation: "blink 0.8s infinite", marginLeft: "2px" }}>&nbsp;</span></span>
  );
}

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
            <div style={{ background: "rgba(40,255,156,0.1)", border: "1px solid rgba(40,255,156,0.25)", borderRadius: "12px", padding: "8px 12px", minWidth: "46px", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}>
            <span style={{ fontSize: "18px", fontWeight: 800, color: "#28ff9c" }}>{String(u.val).padStart(2, "0")}</span>
          </div>
          <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.4)", marginTop: "3px", display: "block" }}>{u.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [newsModal, setNewsModal] = useState<number | null>(null);
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState("");
  const [events, setEvents] = useState<any[]>([]);
  const [newsItems, setNewsItems] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<{text: string; name: string; role?: string}[]>([]);
  const [schoolData, setSchoolData] = useState<any>(null);

  useEffect(() => {
    if (testimonials.length === 0) return;
    const interval = setInterval(() => setTestimonialIdx((prev) => (prev + 1) % testimonials.length), 4000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  useEffect(() => {
    fetch("/api/public/announcements?type=event")
      .then((res) => res.json())
      .then((data) => {
        const fetchedEvents = (data.announcements || []).map((a: any) => {
          const target = typeof a.target === "string" ? JSON.parse(a.target) : (a.target || {});
          return {
            title: a.title,
            desc: a.content,
            date: target.eventDate ? `${target.eventDate}T09:00:00` : new Date(a.createdAt).toISOString(),
          };
        });
        if (fetchedEvents.length > 0) setEvents(fetchedEvents);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/public/announcements?type=news")
      .then((res) => res.json())
      .then((data) => {
        const fetchedNews = (data.announcements || []).map((a: any) => ({
          title: a.title,
          desc: a.content,
          full: a.content,
          gradient: "linear-gradient(135deg, #1e3a8a, #3b82f6)",
          image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=400&fit=crop",
        }));
        if (fetchedNews.length > 0) setNewsItems(fetchedNews);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/public/testimonials")
      .then((res) => res.json())
      .then((data) => {
        const fetched = (data.testimonials || []).map((t: any) => ({
          text: t.text,
          name: t.name,
          role: t.role,
        }));
        if (fetched.length > 0) setTestimonials(fetched);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/public/stats")
      .then((res) => res.json())
      .then((data) => setSchoolData(data))
      .catch(() => {});
  }, []);

  const nextEvent = events.find((e) => new Date(e.date).getTime() > Date.now()) || events[events.length - 1];

  const handleSubscribe = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    try {
      const url = process.env.NEXT_PUBLIC_MAILCHIMP_URL || "https://glopresc.us18.list-manage.com/subscribe/post-json";
      const params = new URLSearchParams({ EMAIL: email, u: process.env.NEXT_PUBLIC_MAILCHIMP_U || "", id: process.env.NEXT_PUBLIC_MAILCHIMP_ID || "" });
      await fetch(`${url}?${params.toString()}`, { mode: "no-cors" });
    } catch {}
    setSubscribed(true);
    setEmail("");
  };

  return (
    <div className="bg-animated" style={{ minHeight: "100vh" }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.6s ease-out forwards; }
        .fade-up-delay-1 { animation: fadeUp 0.6s ease-out 0.1s forwards; opacity: 0; }
        .fade-up-delay-2 { animation: fadeUp 0.6s ease-out 0.2s forwards; opacity: 0; }
        .fade-up-delay-3 { animation: fadeUp 0.6s ease-out 0.3s forwards; opacity: 0; }
        .fade-up-delay-4 { animation: fadeUp 0.6s ease-out 0.4s forwards; opacity: 0; }
      `}</style>

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
            <Link href="/portal/apply" className="menu-btn apply-btn" style={{ color: "#000000" }}>Admissions</Link>
            <Link href="/portal/track" className="menu-btn" style={{ color: "#ffffff", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "24px", padding: "8px 20px", fontSize: "14px", fontWeight: 500, textDecoration: "none" }}>Track</Link>
            <Link href="/auth/login" className="menu-btn portal-btn">Portal</Link>
          </div>
          <div className="hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="hero">
        <div className="hero-content container">
          <h1 className="fade-up">
            Building Leaders<br />For The <TypewriterCaption />
          </h1>
          <p className="fade-up-delay-1">
            {SCHOOL_CONFIG.name} provides a world-class learning environment where students develop academic excellence, leadership and innovation.
          </p>
          <div className="fade-up-delay-2" style={{ display: "flex", gap: "15px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/portal/apply" className="hero-btn" style={{ background: "#28ff9c", color: "#000000", fontWeight: 600, padding: "14px 32px", borderRadius: "12px", fontSize: "14px" }}>Apply For Admission</Link>
            <Link href="/auth/login" className="hero-btn" style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.3)", color: "#ffffff", fontWeight: 500, padding: "14px 32px", borderRadius: "12px", fontSize: "14px" }}>Portal Login</Link>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="glass-section" id="about-section">
        <h2 className="section-title fade-up">About {SCHOOL_CONFIG.name}</h2>
        <p className="section-subtitle fade-up-delay-1">
          {SCHOOL_CONFIG.name} is committed to nurturing future leaders through academic excellence, innovation and strong character development.
        </p>
        <div className="features-grid">
          {[
            { icon: "🎯", title: "Mission", desc: schoolData?.school?.mission || "To provide quality education that empowers students to become responsible leaders and lifelong learners." },
            { icon: "🌍", title: "Vision", desc: schoolData?.school?.vision || "To be a leading institution recognized for academic excellence and character development globally." },
            { icon: "⭐", title: "Core Values", desc: schoolData?.school?.coreValues || "Integrity, Discipline, Excellence, Innovation and Respect for all members of the school community." },
          ].map((f, i) => (
            <div key={i} className="feature-card fade-up" style={{ textAlign: "center" }}>
              <div style={{ width: "80px", height: "80px", margin: "0 auto 15px", borderRadius: "50%", background: "rgba(40,255,156,0.1)", border: "1px solid rgba(40,255,156,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "48px" }}>{f.icon}</div>
              <h3 style={{ color: "#ffffff" }}>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Founder */}
      <section className="glass-section">
        <div className="founder">
          <img src="/founder.jpg" alt="Founder" style={{ width: "260px", height: "300px", borderRadius: "20px", objectFit: "cover", border: "2px solid rgba(255,255,255,0.15)" }} className="fade-up" />
          <div className="founder-text fade-up-delay-1">
            <h2 className="section-title" style={{ textAlign: "left", fontSize: "32px" }}>Message From The Founder</h2>
            <p>{schoolData?.school?.founderMessage || `Welcome to ${SCHOOL_CONFIG.name}. Our mission is to inspire young minds to achieve their highest potential academically and morally. We believe every child deserves access to quality education and mentorship that prepares them for global success.`}</p>
            <h4>— Founder, {SCHOOL_CONFIG.name}</h4>
          </div>
        </div>
      </section>

      {/* Events with Countdown */}
      <section className="glass-section" id="events-section">
        <h2 className="section-title fade-up">Upcoming Events</h2>
        <p className="section-subtitle fade-up-delay-1">
          Stay updated with our academic calendar, competitions and school activities.
        </p>

        <div className="fade-up-delay-2" style={{ textAlign: "center", marginBottom: "40px", padding: "30px", background: "rgba(40,255,156,0.05)", borderRadius: "20px", border: "1px solid rgba(40,255,156,0.15)" }}>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", marginBottom: "5px" }}>NEXT EVENT</p>
          <h3 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "10px" }}>{nextEvent?.title || "No upcoming events"}</h3>
          {nextEvent && <CountdownTimer date={nextEvent.date} />}
        </div>

        <div className="events-grid">
          {events.map((e, i) => (
            <div key={i} className="event-card fade-up">
              <h3 style={{ color: "#ffffff" }}>{e.title}</h3>
              <p>{e.desc}</p>
              <span className="event-date">{new Date(e.date).toLocaleDateString("en-NG", { month: "long", day: "numeric", year: "numeric" })}</span>
              <CountdownTimer date={e.date} />
            </div>
          ))}
        </div>
      </section>

      {/* News with Images + Modal */}
      <section className="glass-section" id="news-section">
        <h2 className="section-title fade-up">Featured News</h2>
        <p className="section-subtitle fade-up-delay-1">
          Stay updated with the latest happenings at {SCHOOL_CONFIG.name}.
        </p>
        <div className="news-grid">
          {newsItems.map((n, i) => (
            <div key={i} className="news-card fade-up">
              <img src={n.image} alt={n.title} className="w-full h-[200px] object-cover rounded-t-[25px]" onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=400&fit=crop"; }} />
              <div className="news-content">
                <h3 style={{ color: "#ffffff" }}>{n.title}</h3>
                <p>{n.desc}</p>
                <span className="read-more" onClick={() => setNewsModal(i)}>Read More</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* News Modal */}
      {newsModal !== null && (
        <div className="modal" style={{ display: "flex" }} onClick={() => setNewsModal(null)}>
          <div className="modal-content fade-up" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setNewsModal(null)}>&times;</button>
            <img src={newsItems[newsModal].image} alt={newsItems[newsModal].title} className="w-full h-[200px] object-cover rounded-2xl mb-5" onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=400&fit=crop"; }} />
            <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "15px", color: "#1a1a2e" }}>{newsItems[newsModal].title}</h2>
            <p style={{ color: "#475569", lineHeight: 1.8 }}>{newsItems[newsModal].full}</p>
          </div>
        </div>
      )}

      {/* Testimonials */}
      <section className="glass-section">
        <h2 className="section-title fade-up">Testimonials</h2>
        <p className="section-subtitle fade-up-delay-1">
          What parents and students say about our learning environment.
        </p>
        <div style={{ textAlign: "center", minHeight: "120px" }}>
          {testimonials.map((t, i) => (
            <div key={i} style={{ display: i === testimonialIdx ? "block" : "none" }} className="fade-up">
              <div style={{ position: "relative", padding: "0 30px" }}>
                <span style={{ position: "absolute", top: "-20px", left: "50%", transform: "translateX(-50%)", fontSize: "60px", color: "rgba(40,255,156,0.2)", lineHeight: 1, fontFamily: "Georgia, serif" }}>"</span>
                <p style={{ fontStyle: "italic", fontSize: "22px", lineHeight: 1.8, color: "#ffffff" }}>{t.text}</p>
              </div>
              <h4 style={{ marginTop: "15px", color: "#28ff9c", fontSize: "16px" }}>— {t.name}</h4>
            </div>
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
        <h2 className="section-title fade-up">Subscribe To Our Newsletter</h2>
        <p className="section-subtitle fade-up-delay-1">
          Get updates, school news and event notifications directly to your inbox.
        </p>
        <div className="fade-up-delay-2">
          {subscribed ? (
            <p style={{ textAlign: "center", color: "#28ff9c", fontWeight: 600 }}>Thank you for subscribing!</p>
          ) : (
            <div className="newsletter-form">
              <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <button type="button" onClick={handleSubscribe}>Subscribe</button>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-grid">
          <div className="fade-up">
            <img src="/logo.svg" alt="FFB" style={{ height: "70px", marginBottom: "15px" }} />
            <p style={{ color: "#ffffff" }}>{SCHOOL_CONFIG.name} is committed to academic excellence, innovation and leadership development.</p>
            <div className="social-icons">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg></a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></a>
            </div>
          </div>
          <div className="fade-up-delay-1">
            <h4 style={{ color: "#ffffff" }}>Quick Links</h4>
            <div className="footer-links">
              <Link href="/" style={{ color: "#ffffff" }}>Home</Link>
              <Link href="/about" style={{ color: "#ffffff" }}>About Us</Link>
              <Link href="/events" style={{ color: "#ffffff" }}>Events</Link>
              <Link href="/news" style={{ color: "#ffffff" }}>News</Link>
              <Link href="/contact" style={{ color: "#ffffff" }}>Contact</Link>
              <Link href="/portal/apply" style={{ color: "#ffffff" }}>Apply for Admission</Link>
            </div>
          </div>
          <div className="fade-up-delay-2">
            <h4 style={{ color: "#ffffff" }}>Contact</h4>
            <p style={{ color: "#ffffff" }}>{SCHOOL_CONFIG.address}</p>
            <p style={{ marginTop: "8px", color: "#ffffff" }}>Phone: {SCHOOL_CONFIG.phone}</p>
            <p style={{ marginTop: "8px", color: "#ffffff" }}>Email: {SCHOOL_CONFIG.email}</p>
            <div className="footer-map" style={{ marginTop: "15px" }}><iframe src={`https://www.google.com/maps?q=${SCHOOL_CONFIG.googleMapsQuery}&output=embed`}></iframe></div>
          </div>
        </div>
        <div className="footer-bottom">{`© ${new Date().getFullYear()} ${SCHOOL_CONFIG.name}. All rights reserved.`}</div>
      </footer>

      {/* Floating Contact */}
      <div className="fab-container">
        <a href={`tel:${SCHOOL_CONFIG.phone.replace(/\s/g, "")}`} className="fab fab-call" title="Call Us">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/></svg>
        </a>
        <a href={`https://wa.me/${SCHOOL_CONFIG.phone.replace(/[^0-9]/g, "")}`} className="fab fab-whatsapp" title="WhatsApp" target="_blank" rel="noopener noreferrer">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        </a>
        <a href={`mailto:${SCHOOL_CONFIG.email}`} className="fab fab-email" title="Email Us">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
        </a>
      </div>
    </div>
  );
}
