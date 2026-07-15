"use client";

import { motion } from "framer-motion";
import {
  Users,
  Heart,
  Handshake,
  Plus,
  Search,
  Filter,
  GraduationCap,
  Briefcase,
  MapPin,
  DollarSign,
  Star,
  MessageCircle,
  Calendar,
} from "lucide-react";

const alumni = [
  { id: 1, name: "Dr. Chukwuemeka Okafor", year: "2010", profession: "Medical Doctor", location: "Lagos", donation: "₦500,000", status: "active" },
  { id: 2, name: "Engr. Amina Bello", year: "2008", profession: "Civil Engineer", location: "Abuja", donation: "₦250,000", status: "active" },
  { id: 3, name: "Mr. Tunde Adeyemi", year: "2012", profession: "Software Engineer", location: "Lagos", donation: "₦150,000", status: "active" },
  { id: 4, name: "Mrs. Ngozi Okwu", year: "2005", profession: "Lawyer", location: "Port Harcourt", donation: "₦300,000", status: "active" },
  { id: 5, name: "Alhaji Ibrahim Musa", year: "2000", profession: "Businessman", location: "Kano", donation: "₦1,000,000", status: "active" },
];

const events = [
  { title: "Alumni Homecoming 2025", date: "Dec 20, 2025", attendees: 150, status: "upcoming" },
  { title: "Career Day Mentorship", date: "Feb 15, 2025", attendees: 50, status: "upcoming" },
  { title: "Annual Dinner", date: "Mar 22, 2025", attendees: 200, status: "planning" },
];

const stats = [
  { label: "Total Alumni", value: "5,200", icon: Users, color: "from-blue-500 to-blue-600" },
  { label: "Active Members", value: "1,800", icon: Star, color: "from-emerald-500 to-emerald-600" },
  { label: "Total Donations", value: "₦15M", icon: DollarSign, color: "from-purple-500 to-purple-600" },
  { label: "Mentorship Pairs", value: "120", icon: Handshake, color: "from-[var(--accent)] to-emerald-400" },
];

export default function AlumniPage() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-gradient-to-r from-[var(--primary)]/20 to-[var(--accent)]/10 border-[var(--primary)]/20"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Alumni Portal</h1>
            <p className="text-white/60">
              Connect with alumni, manage networking, donations, and mentorship
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-all">
            <Plus className="w-4 h-4" />
            Add Alumni
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/50 text-sm mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 card"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-semibold text-lg">Alumni Directory</h3>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Search alumni..."
                  className="pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
              <button className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="space-y-3">
            {alumni.map((person) => (
              <div key={person.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/8 transition-all">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white font-semibold text-sm">
                  {person.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{person.name}</p>
                  <p className="text-white/40 text-xs">{person.profession} • Class of {person.year}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-white/40" />
                    <span className="text-white/40 text-xs">{person.location}</span>
                  </div>
                  <p className="text-[var(--accent)] text-xs font-medium">{person.donation}</p>
                </div>
                <button className="p-2 rounded-lg hover:bg-white/10 text-white/40">
                  <MessageCircle className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-6"
        >
          <div className="card">
            <h3 className="text-white font-semibold text-lg mb-4">Upcoming Events</h3>
            <div className="space-y-3">
              {events.map((event, i) => (
                <div key={i} className="p-3 rounded-xl bg-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white text-sm font-medium">{event.title}</span>
                    <span className="px-2 py-1 rounded-lg bg-blue-500/20 text-blue-400 text-xs">{event.status}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-white/30" />
                      <span className="text-white/40">{event.date}</span>
                    </div>
                    <span className="text-white/30">{event.attendees} expected</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="text-white font-semibold text-lg mb-4">Donation Summary</h3>
            <div className="p-4 rounded-xl bg-white/5">
              <div className="text-center mb-4">
                <p className="text-3xl font-bold text-[var(--accent)]">₦15M</p>
                <p className="text-white/40 text-sm">Total Raised This Year</p>
              </div>
              <div className="space-y-2">
                {[
                  { label: "Building Fund", amount: "₦8M", percent: 53 },
                  { label: "Scholarship", amount: "₦4M", percent: 27 },
                  { label: "Equipment", amount: "₦3M", percent: 20 },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-white/60">{item.label}</span>
                      <span className="text-white/40">{item.amount}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5">
                      <div className="bg-[var(--accent)] h-1.5 rounded-full" style={{ width: `${item.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
