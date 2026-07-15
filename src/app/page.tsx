"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  GraduationCap,
  BookOpen,
  Users,
  Award,
  Globe,
  Shield,
  BarChart3,
  Smartphone,
  ArrowRight,
  Menu,
  X,
  ChevronRight,
  Star,
  Zap,
  Brain,
} from "lucide-react";
import { useState } from "react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Intelligence",
    desc: "Predictive analytics, automated insights, and smart recommendations for academic excellence.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    desc: "Bank-grade encryption, RBAC, audit logs, and GDPR compliance built-in.",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    desc: "Real-time dashboards, heatmaps, trend analysis, and exportable reports.",
  },
  {
    icon: Globe,
    title: "Cloud-Native",
    desc: "Deployed on Vercel with edge runtime, auto-scaling, and 99.9% uptime.",
  },
  {
    icon: Smartphone,
    title: "Mobile-First",
    desc: "Responsive design that works flawlessly on all devices and screen sizes.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    desc: "Optimized performance with streaming, caching, and incremental static generation.",
  },
];

const modules = [
  "Student Management",
  "Admissions",
  "Attendance",
  "Finance & Billing",
  "Library",
  "Hostel",
  "Transport",
  "CBT Examinations",
  "Report Cards",
  "Alumni Portal",
  "Clinic",
  "Inventory",
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-animated">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-white font-bold text-lg">FFB ERP</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              {["Home", "About", "Admissions", "Academics", "Contact"].map(
                (item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className="text-white/70 hover:text-white text-sm font-medium transition-colors"
                  >
                    {item}
                  </a>
                )
              )}
            </div>

            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/auth/login"
                className="text-white/80 hover:text-white text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/portal/apply"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--blue-2)] text-white text-sm font-semibold hover:opacity-90 transition-all"
              >
                Apply Now
              </Link>
            </div>

            <button
              className="md:hidden text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden glass border-t border-white/10 p-4"
          >
            {["Home", "About", "Admissions", "Academics", "Contact"].map(
              (item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="block py-3 text-white/70 hover:text-white text-sm font-medium transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item}
                </a>
              )
            )}
            <div className="mt-4 flex gap-4">
              <Link
                href="/auth/login"
                className="flex-1 py-2 text-center rounded-xl border border-white/20 text-white text-sm font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/portal/apply"
                className="flex-1 py-2 text-center rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--blue-2)] text-white text-sm font-semibold"
              >
                Apply Now
              </Link>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section
        id="home"
        className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden"
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-[var(--primary)] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[var(--accent)] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10 text-white/80 text-sm mb-8">
              <Star className="w-4 h-4 text-[var(--accent)]" />
              Enterprise School Management System
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              The Future of
              <br />
              <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--primary)] bg-clip-text text-transparent">
                School Management
              </span>
            </h1>

            <p className="text-xl text-white/60 max-w-2xl mx-auto mb-10">
              AI-powered, enterprise-grade ERP for schools worldwide.
              Manage academics, finance, students, and operations in one
              beautiful platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/login"
                className="group px-8 py-4 rounded-2xl bg-gradient-to-r from-[var(--primary)] to-[var(--blue-2)] text-white font-semibold text-lg hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#features"
                className="px-8 py-4 rounded-2xl glass border border-white/20 text-white font-semibold text-lg hover:bg-white/10 transition-all"
              >
                Learn More
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-4xl mx-auto"
          >
            {[
              { label: "Schools", value: "500+" },
              { label: "Students", value: "100K+" },
              { label: "Modules", value: "25+" },
              { label: "Uptime", value: "99.9%" },
            ].map((stat, i) => (
              <div key={i} className="card text-center py-6">
                <div className="text-3xl font-bold text-[var(--accent)] mb-1">
                  {stat.value}
                </div>
                <div className="text-white/50 text-sm">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Why Choose FFB ERP?
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              Built with cutting-edge technology for modern schools that demand
              excellence.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card group cursor-pointer"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--primary)]/20 to-[var(--accent)]/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-[var(--accent)]" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-white/50 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section id="academics" className="relative py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Complete Module Suite
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              Every module you need to run a world-class educational institution.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {modules.map((mod, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="card py-5 px-4 text-center group cursor-pointer"
              >
                <BookOpen className="w-6 h-6 text-[var(--primary)] mx-auto mb-2 group-hover:text-[var(--accent)] transition-colors" />
                <span className="text-white/80 text-sm font-medium">{mod}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card py-16 px-8"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Transform Your School?
            </h2>
            <p className="text-white/50 text-lg mb-8 max-w-xl mx-auto">
              Join hundreds of schools already using FFB ERP to streamline
              operations and improve outcomes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/portal/apply"
                className="group px-8 py-4 rounded-2xl bg-gradient-to-r from-[var(--accent)] to-emerald-400 text-[var(--blue-1)] font-bold text-lg hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                Start Free Trial
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/auth/login"
                className="px-8 py-4 rounded-2xl glass border border-white/20 text-white font-semibold text-lg hover:bg-white/10 transition-all"
              >
                Schedule Demo
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <span className="text-white font-bold text-lg">FFB ERP</span>
              </div>
              <p className="text-white/50 text-sm">
                Enterprise-grade school management system built for the future
                of education.
              </p>
            </div>
            {[
              {
                title: "Product",
                links: ["Features", "Pricing", "Modules", "API"],
              },
              {
                title: "Company",
                links: ["About", "Blog", "Careers", "Contact"],
              },
              {
                title: "Support",
                links: ["Help Center", "Documentation", "Status", "Security"],
              },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="text-white font-semibold mb-4">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-white/50 hover:text-white text-sm transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 pt-8 border-t border-white/10 text-center">
            <p className="text-white/40 text-sm">
              &copy; {new Date().getFullYear()} FFB Group of Schools. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
