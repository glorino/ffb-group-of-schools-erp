"use client";

import { useState } from "react";
import Link from "next/link";

const particles = Array.from({ length: 40 }, (_, i) => ({
  id: i, left: `${Math.random() * 100}%`, duration: `${10 + Math.random() * 20}s`,
  delay: `${Math.random() * 10}s`, size: `${3 + Math.random() * 3}px`,
}));

const newsItems = [
  {
    title: "Academic Excellence Award", desc: "Our students received national recognition for outstanding WAEC results.",
    full: "FFB Group of Schools has once again demonstrated academic excellence as our students received national recognition for their outstanding WAEC results. With a 98% pass rate and multiple distinctions across key subjects, our school has been ranked among the top performing institutions in the state. The management congratulates all students, teachers, and parents for this remarkable achievement.",
    date: "June 10, 2025", img: "from-blue-600 to-blue-900",
  },
  {
    title: "New Science Laboratory", desc: "A state-of-the-art science laboratory was commissioned.",
    full: "A new state-of-the-art science laboratory has been commissioned at FFB Group of Schools. The laboratory features modern equipment for Physics, Chemistry, and Biology practical sessions. This facility will provide students with hands-on experience and prepare them for university-level research. The project was funded by the school's alumni association and generous donations from parents.",
    date: "May 22, 2025", img: "from-cyan-600 to-cyan-900",
  },
  {
    title: "Leadership Bootcamp", desc: "Students trained in leadership development and innovation.",
    full: "Over 150 students participated in the annual Leadership Bootcamp organized by FFB Group of Schools. The programme covered topics including public speaking, project management, entrepreneurship, and digital literacy. Guest speakers from various industries shared their experiences and motivated students to become future leaders. The bootcamp concluded with group presentations and award ceremonies.",
    date: "April 15, 2025", img: "from-indigo-600 to-indigo-900",
  },
  {
    title: "PTA Meeting Highlights", desc: "Parents and teachers discuss student progress and school development.",
    full: "The Parent-Teacher Association meeting held on campus brought together over 300 parents and guardians. Key discussion points included student academic performance, upcoming school events, and infrastructure development plans. The school management presented a progress report on the new library building and ICT center. Parents expressed satisfaction with the school's academic performance and discipline.",
    date: "March 28, 2025", img: "from-purple-600 to-purple-900",
  },
  {
    title: "Inter-House Sports Festival", desc: "Students compete in various sporting events during annual sports day.",
    full: "The annual Inter-House Sports Festival was held at the school sports complex. Four houses — Blue, Green, Red, and Yellow — competed in events including 100m, 200m, relay races, long jump, high jump, and tug of war. Green House emerged as overall champions. The event was graced by distinguished alumni and parents who cheered the students.",
    date: "March 5, 2025", img: "from-emerald-600 to-emerald-900",
  },
  {
    title: "STEM Workshop", desc: "Students explore robotics, coding, and AI during technology week.",
    full: "FFB Group of Schools organized a week-long STEM workshop in partnership with a leading technology company. Students learned about robotics, Python programming, artificial intelligence, and web development. The workshop included hands-on sessions where students built simple robots and created basic websites. Several students expressed interest in pursuing careers in technology.",
    date: "February 18, 2025", img: "from-amber-600 to-amber-900",
  },
];

export default function NewsPage() {
  const [modal, setModal] = useState<number | null>(null);

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
            <Link href="/news" style={{ color: "#28ff9c" }}>News</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/portal/apply" className="menu-btn apply-btn" style={{ color: "#001f5f" }}>Admissions</Link>
            <Link href="/auth/login" className="menu-btn portal-btn">Portal</Link>
          </div>
        </div>
      </div>

      <div style={{ paddingTop: "120px", paddingBottom: "60px", maxWidth: "1200px", margin: "auto", padding: "120px 20px 60px" }}>
        <h1 className="section-title">Featured News</h1>
        <p className="section-subtitle">Stay updated with the latest happenings at FFB Group of Schools.</p>

        <div className="news-grid">
          {newsItems.map((n, i) => (
            <div key={i} className="news-card">
              <div className={`news-card-img bg-gradient-to-br ${n.img}`}></div>
              <div className="news-content">
                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>{n.date}</span>
                <h3>{n.title}</h3>
                <p>{n.desc}</p>
                <span className="read-more" onClick={() => setModal(i)}>Read More</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {modal !== null && (
        <div className="modal" style={{ display: "flex" }} onClick={() => setModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModal(null)}>&times;</button>
            <div className={`w-full h-48 rounded-2xl bg-gradient-to-br ${newsItems[modal].img} mb-5`} style={{ width: "100%", height: "200px", borderRadius: "16px" }}></div>
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>{newsItems[modal].date}</span>
            <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "15px", marginTop: "5px" }}>{newsItems[modal].title}</h2>
            <p style={{ color: "rgba(255,255,255,0.75)", lineHeight: 1.8 }}>{newsItems[modal].full}</p>
          </div>
        </div>
      )}

      <footer className="footer">
        <div className="footer-bottom">© 2025 FFB Group of Schools. All rights reserved.</div>
      </footer>
    </>
  );
}
