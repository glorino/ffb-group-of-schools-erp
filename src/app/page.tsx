"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  GraduationCap,
  ArrowRight,
  Shield,
  BookOpen,
  Users,
  Trophy,
  Star,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  Award,
  Heart,
  Zap,
  Globe,
  Calendar,
  Sparkles,
  Target,
  ChevronDown,
} from "lucide-react";

const fadeIn = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const stats = [
  { value: "1,200+", label: "Students", icon: Users },
  { value: "85+", label: "Qualified Teachers", icon: GraduationCap },
  { value: "25+", label: "Years of Excellence", icon: Award },
  { value: "98%", label: "WAEC Pass Rate", icon: Trophy },
];

const features = [
  { icon: "🎯", title: "Mission", desc: "To provide quality education that empowers students to become responsible leaders and lifelong learners." },
  { icon: "🌍", title: "Vision", desc: "To be a leading institution recognized for academic excellence and character development globally." },
  { icon: "⭐", title: "Core Values", desc: "Integrity, Discipline, Excellence, Innovation and Respect for all members of the school community." },
];

const programs = [
  { title: "Junior Secondary", desc: "Building strong academic foundations in a nurturing environment for young learners.", icon: BookOpen },
  { title: "Senior Secondary (Science)", desc: "Preparing future scientists and engineers with hands-on lab experience.", icon: Sparkles },
  { title: "Senior Secondary (Arts)", desc: "Nurturing creative and critical minds for humanities and social sciences.", icon: Heart },
  { title: "Senior Secondary (Commercial)", desc: "Developing future business leaders with entrepreneurship skills.", icon: Globe },
];

const events = [
  { title: "Interhouse Sports", desc: "Annual sports competition showcasing teamwork and athleticism.", date: "March 25, 2026", color: "from-emerald-500 to-emerald-700" },
  { title: "Science Exhibition", desc: "Students present innovative science projects and research.", date: "April 10, 2026", color: "from-blue-500 to-blue-700" },
  { title: "Graduation Ceremony", desc: "Celebrating graduating students and their achievements.", date: "July 18, 2026", color: "from-purple-500 to-purple-700" },
];

const testimonials = [
  { text: "FFB transformed my child's confidence and academic performance.", name: "Mrs Adewale", role: "Parent" },
  { text: "The teachers are passionate and supportive. My son loves coming to school.", name: "Mr Johnson", role: "Parent" },
  { text: "A wonderful environment for learning and character development.", name: "Mrs Bello", role: "Parent" },
];

const quickLinks = ["Home", "About Us", "Programs", "Events", "Contact", "Apply for Admission"];

export default function LandingPage() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50" style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(25px)", borderBottom: "1px solid rgba(255,255,255,0.15)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#4B1E73] to-[#2E0F4F] flex items-center justify-center border border-white/10">
              <svg viewBox="0 0 64 64" className="w-7 h-7" fill="none">
                <path d="M32 4 L56 14 L56 32 C56 48 44 58 32 62 C20 58 8 48 8 32 L8 14 Z" fill="#4B1E73" stroke="#f97316" strokeWidth="2"/>
                <text x="32" y="20" textAnchor="middle" fontFamily="Poppins" fontWeight="bold" fontSize="10" fill="#f97316">FFB</text>
                <path d="M20 36 L32 42 L44 36 L44 48 L32 54 L20 48 Z" fill="#f97316" opacity="0.9"/>
              </svg>
            </div>
            <span className="text-white font-bold text-lg hidden sm:block">FFB Group of Schools</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm text-white/80">
            <a href="#about" className="hover:text-[#f97316] transition">About</a>
            <a href="#programs" className="hover:text-[#f97316] transition">Programs</a>
            <a href="#events" className="hover:text-[#f97316] transition">Events</a>
            <a href="#contact" className="hover:text-[#f97316] transition">Contact</a>
            <Link href="/portal" className="btn-primary text-sm">Admissions</Link>
            <Link href="/auth/login" className="btn-secondary text-sm">Portal</Link>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex flex-col gap-1.5"
          >
            <span className="w-6 h-0.5 bg-white" />
            <span className="w-6 h-0.5 bg-white" />
            <span className="w-6 h-0.5 bg-white" />
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden px-4 pb-4 space-y-2">
            <a href="#about" className="block py-2 text-white/80 hover:text-[#f97316]">About</a>
            <a href="#programs" className="block py-2 text-white/80 hover:text-[#f97316]">Programs</a>
            <a href="#events" className="block py-2 text-white/80 hover:text-[#f97316]">Events</a>
            <a href="#contact" className="block py-2 text-white/80 hover:text-[#f97316]">Contact</a>
            <Link href="/portal" className="btn-primary text-sm block text-center">Admissions</Link>
            <Link href="/auth/login" className="btn-secondary text-sm block text-center">Portal</Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center text-center overflow-hidden" style={{ paddingTop: "90px" }}>
        <div className="absolute inset-0" style={{ backgroundImage: "url('/video-cover.jpg')", backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-20">
          <motion.div {...fadeIn}>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold leading-tight mb-6">
              Nurturing <span className="text-[#f97316]">Leaders</span><br />For The <span className="text-[#f97316]">Future</span>
            </h1>
            <p className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto mb-8">
              FFB Group of Schools provides a world-class learning environment where students develop academic excellence, leadership and innovation.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/portal" className="btn-primary text-base px-8 py-4">
                Apply For Admission
              </Link>
              <Link href="/auth/login" className="btn-secondary text-base px-8 py-4">
                Portal Login
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative z-10 -mt-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center py-6 px-4 rounded-3xl"
                style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(25px)", border: "1px solid rgba(255,255,255,0.2)" }}
              >
                <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: "rgba(249,115,22,0.15)" }}>
                  <s.icon className="w-6 h-6 text-[#f97316]" />
                </div>
                <p className="text-white text-2xl font-extrabold">{s.value}</p>
                <p className="text-white/60 text-sm mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="mt-16 mx-4 md:mx-auto max-w-7xl py-16 px-8 rounded-[40px]" style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(25px)", border: "1px solid rgba(255,255,255,0.15)" }}>
        <h2 className="text-3xl md:text-5xl font-extrabold text-center mb-4">About FFB Group of Schools</h2>
        <p className="text-white/80 text-center max-w-3xl mx-auto mb-12 text-base leading-relaxed">
          FFB Group of Schools is committed to nurturing future leaders through academic excellence, innovation and strong character development. Our institution provides modern facilities, highly qualified teachers and a safe environment where students can grow intellectually, socially and morally.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="feature-card text-center"
            >
              <div className="text-5xl mb-4">{f.icon}</div>
              <h3 className="text-xl font-bold mb-3">{f.title}</h3>
              <p className="text-white/70 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Founder Message */}
      <section className="mt-12 mx-4 md:mx-auto max-w-7xl py-16 px-8 rounded-[40px]" style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(25px)", border: "1px solid rgba(255,255,255,0.15)" }}>
        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="w-64 h-64 rounded-3xl bg-gradient-to-br from-[#4B1E73] to-[#2E0F4F] flex items-center justify-center border border-white/10 flex-shrink-0">
            <div className="text-center">
              <div className="w-20 h-20 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: "rgba(249,115,22,0.15)" }}>
                <svg viewBox="0 0 64 64" className="w-14 h-14" fill="none">
                  <path d="M32 4 L56 14 L56 32 C56 48 44 58 32 62 C20 58 8 48 8 32 L8 14 Z" fill="#4B1E73" stroke="#f97316" strokeWidth="2"/>
                  <text x="32" y="20" textAnchor="middle" fontFamily="Poppins" fontWeight="bold" fontSize="10" fill="#f97316">FFB</text>
                  <path d="M20 36 L32 42 L44 36 L44 48 L32 54 L20 48 Z" fill="#f97316" opacity="0.9"/>
                </svg>
              </div>
              <p className="text-white/30 text-sm">Est. 1998</p>
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-5">Message From The Founder</h2>
            <p className="text-white/70 text-base leading-relaxed mb-4">
              Welcome to FFB Group of Schools. Our mission is to inspire young minds to achieve their highest potential academically and morally. We believe every child deserves access to quality education, modern learning resources and mentorship that prepares them for global success.
            </p>
            <p className="text-white/70 text-base leading-relaxed">
              At FFB we focus not only on academic excellence but also on leadership development, discipline and innovation.
            </p>
            <h3 className="mt-6 text-[#f97316] font-semibold text-lg">— Founder, FFB Group of Schools</h3>
          </div>
        </div>
      </section>

      {/* Programs */}
      <section id="programs" className="mt-12 mx-4 md:mx-auto max-w-7xl py-16 px-8 rounded-[40px]" style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(25px)", border: "1px solid rgba(255,255,255,0.15)" }}>
        <h2 className="text-3xl md:text-5xl font-extrabold text-center mb-4">Academic Programs</h2>
        <p className="text-white/80 text-center max-w-2xl mx-auto mb-12">
          Comprehensive programmes designed to develop well-rounded students ready for the challenges of the modern world.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {programs.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="feature-card text-center"
            >
              <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "rgba(249,115,22,0.15)" }}>
                <p.icon className="w-7 h-7 text-[#f97316]" />
              </div>
              <h3 className="text-lg font-bold mb-2">{p.title}</h3>
              <p className="text-white/60 text-sm leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Events */}
      <section id="events" className="mt-12 mx-4 md:mx-auto max-w-7xl py-16 px-8 rounded-[40px]" style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(25px)", border: "1px solid rgba(255,255,255,0.15)" }}>
        <h2 className="text-3xl md:text-5xl font-extrabold text-center mb-4">Upcoming Events</h2>
        <p className="text-white/80 text-center max-w-2xl mx-auto mb-12">
          Stay updated with our academic calendar, competitions and school activities.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {events.map((e, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="feature-card"
            >
              <h3 className="text-xl font-bold mb-2">{e.title}</h3>
              <p className="text-white/60 text-sm mb-3">{e.desc}</p>
              <span className="text-[#f97316] font-semibold text-sm">{e.date}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="mt-12 mx-4 md:mx-auto max-w-7xl py-16 px-8 rounded-[40px]" style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(25px)", border: "1px solid rgba(255,255,255,0.15)" }}>
        <h2 className="text-3xl md:text-5xl font-extrabold text-center mb-4">Testimonials</h2>
        <p className="text-white/80 text-center max-w-2xl mx-auto mb-12">
          What parents and students say about our learning environment.
        </p>
        <div className="text-center max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-1 mb-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-5 h-5 text-[#f97316] fill-[#f97316]" />
            ))}
          </div>
          {testimonials.map((t, i) => (
            <div key={i} className={`${i === activeTestimonial ? "block" : "hidden"}`}>
              <p className="text-white/85 text-xl md:text-2xl italic leading-relaxed mb-6">
                &ldquo;{t.text}&rdquo;
              </p>
              <h4 className="text-[#f97316] font-semibold text-lg">{t.name}</h4>
              <p className="text-white/50 text-sm">{t.role}</p>
            </div>
          ))}
          <div className="flex items-center justify-center gap-3 mt-8">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveTestimonial(i)}
                className={`w-3 h-3 rounded-full transition-all ${i === activeTestimonial ? "bg-[#f97316] w-8" : "bg-white/20 hover:bg-white/30"}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="mt-12 mx-4 md:mx-auto max-w-7xl py-16 px-8 rounded-[40px] text-center" style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(25px)", border: "1px solid rgba(255,255,255,0.15)" }}>
        <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Subscribe To Our Newsletter</h2>
        <p className="text-white/80 max-w-xl mx-auto mb-8">
          Get updates, school news and event notifications directly to your inbox.
        </p>
        <form className="flex flex-wrap items-center justify-center gap-4">
          <input
            type="email"
            placeholder="Enter your email"
            className="input-glass max-w-sm"
          />
          <button type="button" className="btn-primary">Subscribe</button>
        </form>
      </section>

      {/* Contact */}
      <section id="contact" className="mt-12 mx-4 md:mx-auto max-w-7xl py-16 px-8 rounded-[40px]" style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(25px)", border: "1px solid rgba(255,255,255,0.15)" }}>
        <h2 className="text-3xl md:text-5xl font-extrabold text-center mb-4">Contact Us</h2>
        <p className="text-white/80 text-center max-w-2xl mx-auto mb-12">
          Have questions? We would love to hear from you.
        </p>
        <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-6">
            {[
              { icon: MapPin, text: "123 Education Avenue, GRA, Lagos State, Nigeria" },
              { icon: Phone, text: "+234 (0) 801 234 5678" },
              { icon: Mail, text: "info@ffb.edu.ng" },
              { icon: Calendar, text: "Mon - Fri: 7:30 AM - 4:00 PM" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(249,115,22,0.15)" }}>
                  <item.icon className="w-5 h-5 text-[#f97316]" />
                </div>
                <p className="text-white/70 text-sm leading-relaxed mt-2">{item.text}</p>
              </div>
            ))}
          </div>
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input placeholder="First Name" className="input-glass" />
              <input placeholder="Last Name" className="input-glass" />
            </div>
            <input placeholder="Email Address" type="email" className="input-glass" />
            <input placeholder="Phone Number" className="input-glass" />
            <textarea placeholder="Your Message" rows={4} className="input-glass resize-none" />
            <button type="button" className="btn-primary w-full py-4">Send Message</button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-20 py-16 px-4" style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(25px)", borderTop: "1px solid rgba(255,255,255,0.15)" }}>
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-10 px-4">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#4B1E73] to-[#2E0F4F] flex items-center justify-center border border-white/10">
                <svg viewBox="0 0 64 64" className="w-8 h-8" fill="none">
                  <path d="M32 4 L56 14 L56 32 C56 48 44 58 32 62 C20 58 8 48 8 32 L8 14 Z" fill="#4B1E73" stroke="#f97316" strokeWidth="2"/>
                  <text x="32" y="20" textAnchor="middle" fontFamily="Poppins" fontWeight="bold" fontSize="10" fill="#f97316">FFB</text>
                  <path d="M20 36 L32 42 L44 36 L44 48 L32 54 L20 48 Z" fill="#f97316" opacity="0.9"/>
                </svg>
              </div>
              <span className="font-bold text-lg">FFB Group of Schools</span>
            </div>
            <p className="text-white/70 text-sm leading-relaxed mb-4">
              Committed to academic excellence, innovation and leadership development. We nurture future leaders prepared for global success.
            </p>
            <div className="flex items-center gap-3">
              {["facebook", "instagram", "twitter", "youtube"].map((social) => (
                <a key={social} href="#" className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:-translate-y-1" style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}>
                  <span className="text-sm capitalize">{social[0]}</span>
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-[#f97316] font-semibold mb-4">Quick Links</h4>
            <div className="space-y-2">
              {quickLinks.map((link) => (
                <a key={link} href="#" className="block text-white/70 text-sm hover:text-[#f97316] transition hover:pl-1">{link}</a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-[#f97316] font-semibold mb-4">Contact</h4>
            <p className="text-white/70 text-sm mb-2">123 Education Avenue, GRA</p>
            <p className="text-white/70 text-sm mb-2">Lagos State, Nigeria</p>
            <p className="text-white/70 text-sm mb-2">Phone: +234 (0) 801 234 5678</p>
            <p className="text-white/70 text-sm mb-4">Email: info@ffb.edu.ng</p>
            <div className="rounded-xl overflow-hidden" style={{ height: "150px" }}>
              <iframe
                src="https://www.google.com/maps?q=Lagos+Nigeria&output=embed"
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
        <div className="text-center mt-10 pt-6 border-t border-white/15 text-white/50 text-sm">
          © 2025 FFB Group of Schools. All rights reserved.
        </div>
      </footer>

      {/* Floating Contact Buttons */}
      <div className="fab-container">
        <a href="tel:+2348012345678" className="fab fab-call" title="Call Us">
          <Phone className="w-5 h-5" />
        </a>
        <a href="https://wa.me/2348012345678" className="fab fab-whatsapp" title="WhatsApp" target="_blank">
          <span className="text-lg font-bold">W</span>
        </a>
        <a href="mailto:info@ffb.edu.ng" className="fab fab-email" title="Email Us">
          <Mail className="w-5 h-5" />
        </a>
      </div>
    </div>
  );
}
