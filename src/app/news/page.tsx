"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const particles = Array.from({ length: 80 }, (_, i) => ({
  id: i, left: `${Math.random() * 100}%`, duration: `${10 + Math.random() * 20}s`,
  delay: `${Math.random() * 10}s`, size: `${3 + Math.random() * 3}px`,
}));

const newsItems = [
  { title: "Academic Excellence Award", desc: "Our students received national recognition for outstanding WAEC results.", full: "FFB Group of Schools has once again demonstrated academic excellence as our students received national recognition for their outstanding WAEC results. With a 98% pass rate and multiple distinctions across key subjects, our school has been ranked among the top performing institutions in the state.", date: "June 2025", category: "Achievement", gradient: "linear-gradient(135deg, #1e3a8a, #3b82f6)" },
  { title: "New Science Laboratory", desc: "A state-of-the-art science laboratory was commissioned.", full: "A new state-of-the-art science laboratory has been commissioned at FFB Group of Schools. The laboratory features modern equipment for Physics, Chemistry and Biology practical sessions. This facility will provide students with hands-on experience and improve their understanding of scientific concepts.", date: "May 2025", category: "Infrastructure", gradient: "linear-gradient(135deg, #164e63, #06b6d4)" },
  { title: "Leadership Bootcamp", desc: "Students trained in leadership development and innovation.", full: "Over 150 students participated in the annual Leadership Bootcamp organized by FFB Group of Schools. The programme covered topics including public speaking, project management, entrepreneurship and digital literacy. Participants gained practical skills that will serve them in academics and future careers.", date: "April 2025", category: "Programme", gradient: "linear-gradient(135deg, #312e81, #6366f1)" },
  { title: "Cultural Day Celebration", desc: "Students showcased diverse Nigerian cultures through presentations.", full: "The annual Cultural Day celebration at FFB Group of Schools was a vibrant display of Nigerian cultural heritage. Students from different backgrounds presented traditional dances, songs, food and attire, fostering unity and appreciation for cultural diversity.", date: "March 2025", category: "Event", gradient: "linear-gradient(135deg, #7c2d12, #f97316)" },
  { title: "Sports Festival Results", desc: "Our athletes excelled at the zonal sports competition.", full: "FFB students brought home 12 gold medals, 8 silver medals and 6 bronze medals from the zonal sports competition. The school came first overall, demonstrating exceptional athletic ability and sportsmanship.", date: "February 2025", category: "Sports", gradient: "linear-gradient(135deg, #065f46, #10b981)" },
  { title: "Digital Learning Platform Launch", desc: "Students now have access to online learning resources.", full: "FFB Group of Schools has officially launched its digital learning platform, providing students with access to e-books, video lessons, practice tests and interactive quizzes. The platform supports both in-school and remote learning.", date: "January 2025", category: "Technology", gradient: "linear-gradient(135deg, #581c87, #a855f7)" },
];

const categories = ["All", "Achievement", "Infrastructure", "Programme", "Event", "Sports", "Technology"];

const stagger = { animate: { transition: { staggerChildren: 0.1 } } };
const item = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4 } };

export default function NewsPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [filter, setFilter] = useState("All");
  const [modal, setModal] = useState<number | null>(null);

  const filtered = filter === "All" ? newsItems : newsItems.filter((n) => n.category === filter);

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
            <Link href="/news" className="active">News</Link>
            <Link href="/contact">Contact</Link>
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
          School <span className="accent">News</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} style={{ color: "rgba(255,255,255,0.7)", maxWidth: "650px", margin: "15px auto 0", lineHeight: 1.7 }}>
          Stay updated with the latest happenings, achievements and events at FFB Group of Schools.
        </motion.p>
      </section>

      <section className="glass-section">
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center", marginBottom: "30px" }}>
          {categories.map((c) => (
            <button key={c} onClick={() => setFilter(c)} style={{ padding: "8px 18px", borderRadius: "20px", border: filter === c ? "none" : "1px solid rgba(255,255,255,0.15)", background: filter === c ? "#28ff9c" : "rgba(255,255,255,0.05)", color: filter === c ? "#001f5f" : "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: "13px", fontWeight: 600, transition: "0.3s" }}>
              {c}
            </button>
          ))}
        </div>

        <motion.div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px" }} variants={stagger} initial="initial" animate="animate">
          {filtered.map((n, i) => (
            <motion.div key={i} variants={item} whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }} style={{ background: "rgba(255,255,255,0.06)", borderRadius: "25px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer", transition: "0.3s" }} onClick={() => setModal(i)}>
              <div style={{ width: "100%", height: "200px", background: n.gradient }}></div>
              <div style={{ padding: "22px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <span style={{ padding: "4px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.08)", fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>{n.category}</span>
                  <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>{n.date}</span>
                </div>
                <h3 style={{ fontSize: "17px", fontWeight: 700, marginBottom: "8px" }}>{n.title}</h3>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", lineHeight: 1.6, marginBottom: "12px" }}>{n.desc}</p>
                <span style={{ color: "#28ff9c", fontSize: "13px", fontWeight: 600 }}>Read More →</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <AnimatePresence>
        {modal !== null && (
          <motion.div className="modal" style={{ display: "flex", position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(10px)", alignItems: "center", justifyContent: "center", padding: "20px" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModal(null)}>
            <motion.div onClick={(e) => e.stopPropagation()} initial={{ opacity: 0, scale: 0.8, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8, y: 20 }} transition={{ duration: 0.3 }} style={{ background: "rgba(15,23,42,0.95)", backdropFilter: "blur(25px)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "30px", padding: "30px", maxWidth: "600px", width: "100%", maxHeight: "80vh", overflowY: "auto" }}>
              <button onClick={() => setModal(null)} style={{ position: "absolute", top: "15px", right: "20px", background: "none", border: "none", color: "#fff", fontSize: "28px", cursor: "pointer" }}>×</button>
              <div style={{ width: "100%", height: "200px", background: newsItems[modal].gradient, borderRadius: "16px", marginBottom: "20px" }}></div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                <span style={{ padding: "4px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.08)", fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>{newsItems[modal].category}</span>
                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>{newsItems[modal].date}</span>
              </div>
              <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "15px" }}>{newsItems[modal].title}</h2>
              <p style={{ color: "rgba(255,255,255,0.75)", lineHeight: 1.8, fontSize: "14px" }}>{newsItems[modal].full}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="footer">
        <div className="footer-bottom">© 2025 FFB Group of Schools. All rights reserved.</div>
      </footer>
    </>
  );
}
