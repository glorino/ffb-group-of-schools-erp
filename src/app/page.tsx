"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  GraduationCap,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  Star,
  Users,
  Award,
  BookOpen,
  Calendar,
  ArrowRight,
  Menu,
  X,
} from "lucide-react";
import { useState, useRef } from "react";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Academics", href: "#academics" },
  { label: "Admissions", href: "#admissions" },
  { label: "Gallery", href: "#gallery" },
  { label: "Contact", href: "#contact" },
];

const programs = [
  {
    level: "Nursery",
    ages: "3 - 5 Years",
    desc: "Play-based learning with foundational literacy and numeracy in a nurturing environment.",
    icon: "🌱",
  },
  {
    level: "Primary",
    ages: "6 - 11 Years",
    desc: "Building strong academic foundations with character development and creative thinking.",
    icon: "📚",
  },
  {
    level: "Junior Secondary",
    ages: "12 - 14 Years",
    desc: "Broad-based curriculum preparing students for senior secondary education.",
    icon: "🔬",
  },
  {
    level: "Senior Secondary",
    ages: "15 - 17 Years",
    desc: "Specialized tracks in Science, Commercial, and Arts for WAEC/NECO/JAMB success.",
    icon: "🎓",
  },
];

const stats = [
  { value: "2,800+", label: "Students" },
  { value: "180+", label: "Qualified Teachers" },
  { value: "98%", label: "WAEC Pass Rate" },
  { value: "25+", label: "Years of Excellence" },
];

const gallery = [
  { title: "Science Laboratory", color: "from-blue-500 to-cyan-500" },
  { title: "Sports Complex", color: "from-emerald-500 to-teal-500" },
  { title: "Library", color: "from-purple-500 to-pink-500" },
  { title: "Classroom", color: "from-orange-500 to-red-500" },
  { title: "Computer Lab", color: "from-indigo-500 to-blue-500" },
  { title: "School Hall", color: "from-pink-500 to-rose-500" },
];

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);
  const videoOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.4]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, 100]);

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white overflow-x-hidden">
      {/* Top Bar */}
      <div className="bg-[var(--blue-1)] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between text-xs text-white/50">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3" /> +234 801 234 5678
            </span>
            <span className="flex items-center gap-1">
              <Mail className="w-3 h-3" /> info@ffb.edu.ng
            </span>
          </div>
          <div className="hidden md:flex items-center gap-1">
            <MapPin className="w-3 h-3" /> 123 Education Avenue, GRA, Lagos
          </div>
        </div>
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0f1c]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-tight">FFB Group of Schools</h1>
              <p className="text-white/40 text-[10px] tracking-wider uppercase">Excellence in Education</p>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-white/60 hover:text-white text-sm font-medium transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <Link
              href="/auth/login"
              className="text-white/60 hover:text-white text-sm font-medium transition-colors"
            >
              Student Portal
            </Link>
            <Link
              href="/portal/apply"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--blue-2)] text-white text-sm font-semibold hover:opacity-90 transition-all"
            >
              Apply Now
            </Link>
          </div>

          <button
            className="lg:hidden text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:hidden bg-[#0a0f1c] border-t border-white/5 p-4"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block py-3 text-white/60 hover:text-white text-sm"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="mt-4 flex gap-3">
              <Link href="/auth/login" className="flex-1 py-2.5 text-center rounded-xl border border-white/20 text-white text-sm">
                Portal Login
              </Link>
              <Link href="/portal/apply" className="flex-1 py-2.5 text-center rounded-xl bg-[var(--primary)] text-white text-sm font-semibold">
                Apply Now
              </Link>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero with Video Parallax */}
      <section ref={heroRef} className="relative h-screen overflow-hidden">
        <motion.div
          style={{ scale: videoScale, opacity: videoOpacity }}
          className="absolute inset-0"
        >
          <video
            autoPlay
            muted
            loop
            playsInline
            poster="https://images.unsplash.com/photo-1562774053-701939374585?w=1920&q=80"
            className="w-full h-full object-cover"
          >
            <source
              src="https://assets.mixkit.co/videos/preview/mixkit-students-in-a-classroom-raising-their-hands-4799-large.mp4"
              type="video/mp4"
            />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1c]/70 via-[#0a0f1c]/50 to-[#0a0f1c]" />
        </motion.div>

        <motion.div
          style={{ y: textY }}
          className="relative z-10 h-full flex items-center"
        >
          <div className="max-w-7xl mx-auto px-4 w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-2xl"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-white/80 text-sm mb-6">
                <Star className="w-4 h-4 text-[var(--accent)]" />
                Admissions Open for 2025/2026 Session
              </div>

              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-[1.1]">
                Shaping Future
                <br />
                <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--primary)] bg-clip-text text-transparent">
                  Leaders
                </span>
              </h1>

              <p className="text-lg text-white/60 mb-10 max-w-lg leading-relaxed">
                Providing world-class education from nursery through secondary school. 
                Where every child discovers their potential and achieves excellence.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/portal/apply"
                  className="group px-8 py-4 rounded-2xl bg-gradient-to-r from-[var(--primary)] to-[var(--blue-2)] text-white font-semibold text-lg hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  Apply for Admission
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href="#about"
                  className="px-8 py-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold text-lg hover:bg-white/15 transition-all text-center"
                >
                  Discover More
                </a>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-1.5"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative z-10 -mt-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center"
              >
                <p className="text-3xl font-bold text-[var(--accent)]">{stat.value}</p>
                <p className="text-white/50 text-sm mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold mb-6">
                Welcome to{" "}
                <span className="text-[var(--accent)]">FFB Group</span> of Schools
              </h2>
              <p className="text-white/50 leading-relaxed mb-4">
                Founded over 25 years ago, FFB Group of Schools has been a beacon of academic 
                excellence in Nigeria. We provide a stimulating learning environment that 
                nurtures intellectual curiosity, creativity, and character.
              </p>
              <p className="text-white/50 leading-relaxed mb-8">
                Our commitment to holistic education combines rigorous academics with 
                extracurricular activities, moral values, and technology-driven learning 
                to prepare students for the challenges of tomorrow.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  "WAEC/NECO/JAMB Excellence",
                  "Modern Facilities",
                  "Qualified Teachers",
                  "Small Class Sizes",
                  "ICT-Driven Learning",
                  "Sports & Arts Programs",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                    <span className="text-white/70 text-sm">{item}</span>
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
              <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] p-1">
                <div className="w-full h-full rounded-3xl overflow-hidden relative">
                  <img
                    src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80"
                    alt="Students learning"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/20 flex items-center justify-center">
                    <Award className="w-6 h-6 text-[var(--accent)]" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-xl">Award Winning</p>
                    <p className="text-white/50 text-sm">Best School 2024</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section id="academics" className="py-24 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Our Programs</h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto">
              Comprehensive education from nursery through senior secondary
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {programs.map((prog, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/8 hover:border-white/15 transition-all group cursor-pointer"
              >
                <span className="text-4xl">{prog.icon}</span>
                <h3 className="text-xl font-bold mt-4 mb-1">{prog.level}</h3>
                <p className="text-[var(--accent)] text-sm font-medium mb-3">{prog.ages}</p>
                <p className="text-white/50 text-sm leading-relaxed">{prog.desc}</p>
                <div className="mt-6 flex items-center gap-1 text-[var(--primary)] text-sm font-medium group-hover:gap-2 transition-all">
                  Learn More <ChevronRight className="w-4 h-4" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Our Campus</h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto">
              A world-class learning environment designed for excellence
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gallery.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="aspect-[16/10] rounded-2xl overflow-hidden relative group cursor-pointer"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-80`} />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all" />
                <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-white font-semibold">{item.title}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Admissions CTA */}
      <section id="admissions" className="py-24">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-[var(--primary)]/20 to-[var(--accent)]/10 backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center"
          >
            <h2 className="text-4xl font-bold mb-4">Join Our Family</h2>
            <p className="text-white/50 text-lg mb-8 max-w-lg mx-auto">
              Admissions for the 2025/2026 academic session are now open. 
              Give your child the gift of quality education.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/portal/apply"
                className="group px-8 py-4 rounded-2xl bg-gradient-to-r from-[var(--accent)] to-emerald-400 text-[var(--blue-1)] font-bold text-lg hover:opacity-90 transition-all inline-flex items-center justify-center gap-2"
              >
                Apply Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="tel:+2348012345678"
                className="px-8 py-4 rounded-2xl bg-white/10 border border-white/20 text-white font-semibold text-lg hover:bg-white/15 transition-all text-center"
              >
                Call Us
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold mb-6">Get in Touch</h2>
              <p className="text-white/50 mb-8">
                Have questions about admissions or our programs? We&apos;d love to hear from you.
              </p>
              <div className="space-y-6">
                {[
                  { icon: MapPin, label: "123 Education Avenue, GRA, Lagos, Nigeria" },
                  { icon: Phone, label: "+234 801 234 5678" },
                  { icon: Mail, label: "info@ffb.edu.ng" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/20 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-[var(--primary)]" />
                    </div>
                    <span className="text-white/70 pt-2.5">{item.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8"
            >
              <form className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Subject"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
                <textarea
                  rows={4}
                  placeholder="Your Message"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
                />
                <button
                  type="button"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--blue-2)] text-white font-semibold hover:opacity-90 transition-all"
                >
                  Send Message
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <span className="text-white font-bold">FFB Group of Schools</span>
              </div>
              <p className="text-white/40 text-sm leading-relaxed">
                Nurturing minds, building futures. Providing quality education since 1998.
              </p>
            </div>
            {[
              { title: "Quick Links", links: ["About Us", "Programs", "Admissions", "Contact"] },
              { title: "Programs", links: ["Nursery", "Primary", "Junior Secondary", "Senior Secondary"] },
              { title: "Portal", links: ["Student Login", "Parent Login", "Staff Login", "Apply Now"] },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="text-white font-semibold mb-4">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-white/40 hover:text-white text-sm transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-8 border-t border-white/5 text-center">
            <p className="text-white/30 text-sm">
              &copy; {new Date().getFullYear()} FFB Group of Schools. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
