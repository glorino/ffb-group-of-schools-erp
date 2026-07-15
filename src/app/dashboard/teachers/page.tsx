"use client";

import { motion } from "framer-motion";
import {
  GraduationCap,
  Users,
  Plus,
  Search,
  Filter,
  Award,
  BookOpen,
  TrendingUp,
  Mail,
  Phone,
  MoreVertical,
} from "lucide-react";

const teachers = [
  { id: 1, name: "Mrs. Adaeze Okonkwo", subject: "Mathematics", qualification: "M.Ed", experience: "12 years", performance: 92, students: 180, status: "active" },
  { id: 2, name: "Mr. Emeka Nwosu", subject: "English Language", qualification: "B.Ed", experience: "8 years", performance: 88, students: 165, status: "active" },
  { id: 3, name: "Mrs. Fatima Abubakar", subject: "Physics", qualification: "M.Sc", experience: "10 years", performance: 95, students: 120, status: "active" },
  { id: 4, name: "Mr. Olusegun Adeyemi", subject: "Chemistry", qualification: "B.Sc", experience: "6 years", performance: 85, students: 110, status: "active" },
  { id: 5, name: "Mrs. Ngozi Okwu", subject: "Biology", qualification: "M.Ed", experience: "15 years", performance: 91, students: 95, status: "active" },
  { id: 6, name: "Mr. Chinedu Obi", subject: "Literature", qualification: "B.A", experience: "5 years", performance: 82, students: 88, status: "active" },
];

const qualifications = [
  { level: "Ph.D", count: 8, color: "from-purple-500 to-purple-600" },
  { level: "Masters", count: 45, color: "from-blue-500 to-blue-600" },
  { level: "Bachelors", count: 89, color: "from-emerald-500 to-emerald-600" },
  { level: "Diploma", count: 14, color: "from-orange-500 to-orange-600" },
];

export default function TeachersPage() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-gradient-to-r from-[var(--primary)]/20 to-[var(--accent)]/10 border-[var(--primary)]/20"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Teacher Management</h1>
            <p className="text-white/60">
              Manage employee records, qualifications, and performance tracking
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-all">
            <Plus className="w-4 h-4" />
            Add Teacher
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Teachers", value: "156", icon: Users, color: "from-blue-500 to-blue-600" },
          { label: "Avg. Performance", value: "89%", icon: TrendingUp, color: "from-emerald-500 to-emerald-600" },
          { label: "Subjects Covered", value: "24", icon: BookOpen, color: "from-purple-500 to-purple-600" },
          { label: "Top Performers", value: "12", icon: Award, color: "from-[var(--accent)] to-emerald-400" },
        ].map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/50 text-sm mb-1">{kpi.label}</p>
                <p className="text-3xl font-bold text-white">{kpi.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center`}>
                <kpi.icon className="w-6 h-6 text-white" />
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
            <h3 className="text-white font-semibold text-lg">Teacher Directory</h3>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Search teachers..."
                  className="pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
              <button className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="space-y-3">
            {teachers.map((teacher) => (
              <div key={teacher.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white font-semibold">
                  {teacher.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{teacher.name}</p>
                  <p className="text-white/40 text-xs">{teacher.subject} • {teacher.qualification}</p>
                </div>
                <div className="text-right">
                  <p className="text-white text-sm font-medium">{teacher.performance}%</p>
                  <p className="text-white/40 text-xs">{teacher.experience}</p>
                </div>
                <button className="p-1 rounded-lg hover:bg-white/10 text-white/40">
                  <MoreVertical className="w-4 h-4" />
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
            <h3 className="text-white font-semibold text-lg mb-4">Qualifications</h3>
            <div className="space-y-3">
              {qualifications.map((qual, i) => (
                <div key={i} className="p-3 rounded-xl bg-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white text-sm font-medium">{qual.level}</span>
                    <span className="text-white/40 text-sm">{qual.count} teachers</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className={`bg-gradient-to-r ${qual.color} h-2 rounded-full`}
                      style={{ width: `${(qual.count / 156) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="text-white font-semibold text-lg mb-4">Top Performers</h3>
            <div className="space-y-2">
              {teachers.slice(0, 3).map((teacher, i) => (
                <div key={teacher.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5">
                  <span className="text-white/40 text-sm font-bold">#{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-white text-sm">{teacher.name}</p>
                    <p className="text-white/40 text-xs">{teacher.subject}</p>
                  </div>
                  <span className="text-[var(--accent)] text-sm font-semibold">{teacher.performance}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
