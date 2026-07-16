"use client";

import { useState } from "react";
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
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  Play,
  Award,
  Heart,
  Zap,
  Globe,
  Calendar,
  Sparkles,
} from "lucide-react";

const fadeIn = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
};

const stats = [
  { value: "1,200+", label: "Students", icon: Users },
  { value: "85+", label: "Qualified Teachers", icon: GraduationCap },
  { value: "25+", label: "Years of Excellence", icon: Award },
  { value: "98%", label: "WAEC Pass Rate", icon: Trophy },
];

const programs = [
  { title: "Junior Secondary", desc: "Building strong academic foundations in a nurturing environment", icon: BookOpen, color: "from-blue-500 to-blue-700" },
  { title: "Senior Secondary (Science)", desc: "Preparing future scientists and engineers", icon: Sparkles, color: "from-purple-500 to-purple-700" },
  { title: "Senior Secondary (Arts)", desc: "Nurturing creative and critical minds", icon: Heart, color: "from-pink-500 to-pink-700" },
  { title: "Senior Secondary (Commercial)", desc: "Developing future business leaders", icon: Globe, color: "from-emerald-500 to-emerald-700" },
];

const testimonials = [
  { name: "Mrs. Adewale", role: "Parent", text: "FFB has transformed my children's academic performance. The teachers are dedicated and the environment is conducive for learning." },
  { name: "Mr. Chukwuemeka", role: "Alumni (Class of 2018)", text: "My years at FFB shaped who I am today. The foundation I received in science and leadership opened doors for me at university." },
  { name: "Mrs. Fatima Bello", role: "Parent", text: "The ERP system keeps me updated on my child's progress in real time. I can see attendance, grades, and fee status from my phone." },
];

const gallery = [
  { title: "Modern Classrooms", desc: "Smart boards and air-conditioned halls" },
  { title: "Science Laboratories", desc: "Fully equipped physics, chemistry, and biology labs" },
  { title: "Sports Complex", desc: "Football field, basketball court, and swimming pool" },
  { title: "School Library", desc: "Over 10,000 volumes and digital research center" },
];

const whyFFB = [
  { title: "25+ Years of Excellence", desc: "A proven track record of academic distinction since 1998", icon: Award },
  { title: "WAEC/NECO Top Results", desc: "Consistently among the top-performing schools in the state", icon: Trophy },
  { title: "Modern ERP System", desc: "Real-time tracking of academic and administrative activities", icon: Zap },
  { title: "Safe & Secure Campus", desc: "24/7 security, CCTV surveillance, and health clinic", icon: Shield },
  { title: "Experienced Faculty", desc: "Over 85 qualified and dedicated teaching professionals", icon: Users },
  { title: "Holistic Development", desc: "Sports, clubs, and extracurricular activities for balanced growth", icon: Heart },
];

export default function LandingPage() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  return (
    <div className="min-h-screen bg-[var(--bg-dark)]">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg-dark)]/80 backdrop-blur-xl border-b border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--blue-2)] to-[var(--blue-1)] flex items-center justify-center border border-white/10">
              <svg viewBox="0 0 64 64" className="w-6 h-6" fill="none">
                <path d="M32 4 L56 14 L56 32 C56 48 44 58 32 62 C20 58 8 48 8 32 L8 14 Z" fill="#0039a6" stroke="#ffd700" strokeWidth="2"/>
                <text x="32" y="20" textAnchor="middle" fontFamily="serif" fontWeight="bold" fontSize="10" fill="#ffd700">FFB</text>
                <path d="M20 36 L32 42 L44 36 L44 48 L32 54 L20 48 Z" fill="#ffd700" opacity="0.9"/>
              </svg>
            </div>
            <span className="text-white font-bold text-lg">FFB Group of Schools</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-[13px] text-white/50">
            <a href="#about" className="hover:text-white transition">About</a>
            <a href="#programs" className="hover:text-white transition">Programs</a>
            <a href="#why-ffb" className="hover:text-white transition">Why FFB</a>
            <a href="#gallery" className="hover:text-white transition">Campus</a>
            <a href="#contact" className="hover:text-white transition">Contact</a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="px-4 py-2 rounded-xl text-white/60 text-[13px] font-medium hover:text-white transition"
            >
              Sign In
            </Link>
            <Link
              href="/portal"
              className="px-5 py-2.5 rounded-xl bg-[var(--primary)] text-white text-[13px] font-semibold hover:brightness-110 transition shadow-lg shadow-[var(--primary)]/25"
            >
              Apply Now
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--blue-1)]/40 to-transparent" />
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 30% 40%, rgba(0,85,255,0.15) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(40,255,156,0.08) 0%, transparent 50%)" }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36 relative">
          <motion.div {...fadeIn} className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-[var(--accent)] text-[12px] font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Admissions Open for 2025/2026 Academic Session
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-[1.1] tracking-tight font-display">
              Nurturing <span className="bg-gradient-to-r from-[var(--blue-3)] to-[var(--accent)] bg-clip-text text-transparent">Tomorrow&apos;s Leaders</span> Today
            </h1>
            <p className="text-white/40 text-lg md:text-xl mt-6 leading-relaxed max-w-xl">
              FFB Group of Schools provides world-class education from Junior Secondary to Senior Secondary, empowering students with knowledge, skills, and values for a changing world.
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-8">
              <Link
                href="/portal"
                className="px-7 py-3.5 rounded-xl bg-[var(--primary)] text-white text-sm font-semibold hover:brightness-110 transition shadow-xl shadow-[var(--primary)]/25 flex items-center gap-2"
              >
                Start Application <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#about"
                className="px-7 py-3.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-white/60 text-sm font-medium hover:bg-white/[0.08] hover:text-white transition flex items-center gap-2"
              >
                Learn More <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 -mt-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.07] p-5 text-center"
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center mx-auto mb-3">
                  <s.icon className="w-5 h-5 text-[var(--blue-3)]" />
                </div>
                <p className="text-white text-2xl font-bold font-display">{s.value}</p>
                <p className="text-white/30 text-[12px] mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white font-display tracking-tight">
                A Legacy of <span className="bg-gradient-to-r from-[var(--blue-3)] to-[var(--accent)] bg-clip-text text-transparent">Academic Excellence</span>
              </h2>
              <p className="text-white/35 text-base leading-relaxed mt-5">
                Founded in 1998, FFB Group of Schools has grown from a small community school to one of the most respected educational institutions in the region. Our commitment to academic rigor, moral values, and holistic development has produced thousands of successful graduates.
              </p>
              <p className="text-white/35 text-base leading-relaxed mt-4">
                With a student body of over 1,200 learners, 85+ qualified teachers, and state-of-the-art facilities, we provide an environment where every child can thrive academically, socially, and personally.
              </p>
              <div className="grid grid-cols-2 gap-3 mt-8">
                {[
                  { label: "WAEC/NECO Excellence", icon: Trophy },
                  { label: "Modern ERP System", icon: Zap },
                  { label: "Safe Environment", icon: Shield },
                  { label: "Holistic Education", icon: Heart },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-white/50 text-[13px]">
                    <div className="w-7 h-7 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center">
                      <item.icon className="w-3.5 h-3.5 text-[var(--blue-3)]" />
                    </div>
                    {item.label}
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-[4/3] rounded-3xl bg-gradient-to-br from-[var(--blue-1)] to-[var(--blue-2)] border border-white/[0.08] overflow-hidden flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-20 h-20 rounded-2xl bg-white/[0.06] flex items-center justify-center mx-auto mb-4">
                    <svg viewBox="0 0 64 64" className="w-14 h-14" fill="none">
                      <path d="M32 4 L56 14 L56 32 C56 48 44 58 32 62 C20 58 8 48 8 32 L8 14 Z" fill="#0039a6" stroke="#ffd700" strokeWidth="2"/>
                      <text x="32" y="20" textAnchor="middle" fontFamily="serif" fontWeight="bold" fontSize="10" fill="#ffd700">FFB</text>
                      <path d="M20 36 L32 42 L44 36 L44 48 L32 54 L20 48 Z" fill="#ffd700" opacity="0.9"/>
                    </svg>
                  </div>
                  <p className="text-white/20 text-sm">FFB Group of Schools</p>
                  <p className="text-white/10 text-[11px] mt-1">Est. 1998</p>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 w-28 h-28 rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)]/20" />
              <div className="absolute -top-4 -right-4 w-20 h-20 rounded-2xl bg-[var(--blue-3)]/10 border border-[var(--blue-3)]/20" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Programs */}
      <section id="programs" className="py-20 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white font-display tracking-tight">Academic Programs</h2>
            <p className="text-white/30 text-sm mt-3 max-w-lg mx-auto">Comprehensive programmes designed to develop well-rounded students ready for the challenges of the modern world</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {programs.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.07] p-6 hover:border-white/[0.12] transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center mb-4 group-hover:scale-105 transition`}>
                  <p.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white/90 font-semibold text-[15px]">{p.title}</h3>
                <p className="text-white/30 text-[13px] mt-2 leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why FFB */}
      <section id="why-ffb" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white font-display tracking-tight">Why Choose FFB?</h2>
            <p className="text-white/30 text-sm mt-3 max-w-lg mx-auto">Discover what makes us one of the leading schools in the region</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {whyFFB.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.07] p-6 hover:bg-white/[0.05] transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5 text-[var(--blue-3)]" />
                </div>
                <h3 className="text-white/90 font-semibold text-[15px]">{item.title}</h3>
                <p className="text-white/30 text-[13px] mt-2 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Campus Gallery */}
      <section id="gallery" className="py-20 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white font-display tracking-tight">Our Campus</h2>
            <p className="text-white/30 text-sm mt-3 max-w-lg mx-auto">State-of-the-art facilities designed for optimal learning and development</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {gallery.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group"
              >
                <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-[var(--blue-1)] to-[var(--blue-2)] border border-white/[0.07] overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h4 className="text-white font-semibold text-[14px]">{item.title}</h4>
                    <p className="text-white/40 text-[11px] mt-0.5">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white font-display tracking-tight">What People Say</h2>
          </motion.div>
          <div className="bg-white/[0.03] backdrop-blur-xl rounded-3xl border border-white/[0.07] p-8 md:p-12 text-center">
            <div className="flex items-center justify-center gap-1 mb-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
              ))}
            </div>
            <p className="text-white/70 text-lg md:text-xl leading-relaxed italic max-w-2xl mx-auto">
              &ldquo;{testimonials[activeTestimonial].text}&rdquo;
            </p>
            <div className="mt-8">
              <p className="text-white/80 font-semibold text-[15px]">{testimonials[activeTestimonial].name}</p>
              <p className="text-white/30 text-[12px]">{testimonials[activeTestimonial].role}</p>
            </div>
            <div className="flex items-center justify-center gap-2 mt-6">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === activeTestimonial ? "bg-[var(--primary)] w-6" : "bg-white/15 hover:bg-white/25"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Admissions CTA */}
      <section className="py-20 bg-gradient-to-b from-[var(--blue-1)]/30 to-transparent">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-bold text-white font-display tracking-tight">
              Ready to Join the <span className="bg-gradient-to-r from-[var(--blue-3)] to-[var(--accent)] bg-clip-text text-transparent">FFB Family</span>?
            </h2>
            <p className="text-white/35 text-base mt-4 max-w-lg mx-auto">
              Admissions for the 2025/2026 academic session are now open. Give your child the gift of excellence.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
              <Link
                href="/portal"
                className="px-8 py-4 rounded-xl bg-[var(--primary)] text-white text-sm font-semibold hover:brightness-110 transition shadow-xl shadow-[var(--primary)]/25 flex items-center gap-2"
              >
                Apply for Admission <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#contact"
                className="px-8 py-4 rounded-xl bg-white/[0.05] border border-white/[0.1] text-white/60 text-sm font-medium hover:bg-white/[0.08] transition"
              >
                Contact Us
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl font-bold text-white font-display tracking-tight">Get in Touch</h2>
              <p className="text-white/30 text-sm mt-3">Have questions? We would love to hear from you.</p>
              <div className="space-y-4 mt-8">
                {[
                  { icon: MapPin, label: "123 Education Avenue, GRA, Lagos State, Nigeria" },
                  { icon: Phone, label: "+234 (0) 801 234 5678" },
                  { icon: Mail, label: "info@ffb.edu.ng" },
                  { icon: Calendar, label: "Mon - Fri: 7:30 AM - 4:00 PM" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <item.icon className="w-4 h-4 text-[var(--blue-3)]" />
                    </div>
                    <p className="text-white/50 text-[13px] leading-relaxed">{item.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <form className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.07] p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <input placeholder="First Name" className="px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/90 text-[13px] placeholder-white/20 outline-none focus:border-[var(--primary)]/50 transition" />
                  <input placeholder="Last Name" className="px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/90 text-[13px] placeholder-white/20 outline-none focus:border-[var(--primary)]/50 transition" />
                </div>
                <input placeholder="Email Address" type="email" className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/90 text-[13px] placeholder-white/20 outline-none focus:border-[var(--primary)]/50 transition" />
                <input placeholder="Phone Number" className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/90 text-[13px] placeholder-white/20 outline-none focus:border-[var(--primary)]/50 transition" />
                <textarea placeholder="Your Message" rows={4} className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/90 text-[13px] placeholder-white/20 outline-none focus:border-[var(--primary)]/50 transition resize-none" />
                <button type="button" className="w-full py-3.5 rounded-xl bg-[var(--primary)] text-white text-[13px] font-semibold hover:brightness-110 transition shadow-lg shadow-[var(--primary)]/20">
                  Send Message
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.05] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--blue-2)] to-[var(--blue-1)] flex items-center justify-center border border-white/10">
                <svg viewBox="0 0 64 64" className="w-5 h-5" fill="none">
                  <path d="M32 4 L56 14 L56 32 C56 48 44 58 32 62 C20 58 8 48 8 32 L8 14 Z" fill="#0039a6" stroke="#ffd700" strokeWidth="2"/>
                  <text x="32" y="20" textAnchor="middle" fontFamily="serif" fontWeight="bold" fontSize="10" fill="#ffd700">FFB</text>
                  <path d="M20 36 L32 42 L44 36 L44 48 L32 54 L20 48 Z" fill="#ffd700" opacity="0.9"/>
                </svg>
              </div>
              <span className="text-white/50 text-[13px]">© 2025 FFB Group of Schools. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-6 text-[12px] text-white/25">
              <a href="#" className="hover:text-white/50 transition">Privacy Policy</a>
              <a href="#" className="hover:text-white/50 transition">Terms of Service</a>
              <a href="#" className="hover:text-white/50 transition">Academic Calendar</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
