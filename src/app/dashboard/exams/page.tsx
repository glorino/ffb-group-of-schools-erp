"use client";

import { motion } from "framer-motion";
import {
  FileText,
  Clock,
  Calendar,
  Plus,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Users,
  BookOpen,
  Play,
  Settings,
} from "lucide-react";

const exams = [
  { id: 1, name: "First Term Examination", type: "Terminal", duration: "3 hours", questions: 60, students: 2847, status: "upcoming", date: "Jan 20-30, 2025" },
  { id: 2, name: "Mid-Term Test", type: "Continuous", duration: "1 hour", questions: 30, students: 2847, status: "completed", date: "Jan 10, 2025" },
  { id: 3, name: "Mock Examination", type: "Mock", duration: "2.5 hours", questions: 50, students: 245, status: "upcoming", date: "Feb 5-8, 2025" },
  { id: 4, name: "WAEC Preparation Test", type: "Practice", duration: "2 hours", questions: 40, students: 180, status: "active", date: "Jan 15, 2025" },
];

const questionBank = [
  { subject: "Mathematics", questions: 450, difficulty: "Mixed", lastUpdated: "2 days ago" },
  { subject: "English Language", questions: 380, difficulty: "Mixed", lastUpdated: "1 week ago" },
  { subject: "Physics", questions: 320, difficulty: "Advanced", lastUpdated: "3 days ago" },
  { subject: "Chemistry", questions: 290, difficulty: "Intermediate", lastUpdated: "5 days ago" },
  { subject: "Biology", questions: 310, difficulty: "Mixed", lastUpdated: "1 week ago" },
];

export default function ExamsPage() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-gradient-to-r from-[var(--primary)]/20 to-[var(--accent)]/10 border-[var(--primary)]/20"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Examinations</h1>
            <p className="text-white/60">
              CBT setup, question bank management, and exam scheduling
            </p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-white/20 text-white text-sm font-medium hover:bg-white/10 transition-all">
              <Settings className="w-4 h-4" />
              CBT Settings
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-all">
              <Plus className="w-4 h-4" />
              Create Exam
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Exams", value: "12", icon: FileText, color: "from-blue-500 to-blue-600" },
          { label: "Question Bank", value: "1,750", icon: BookOpen, color: "from-emerald-500 to-emerald-600" },
          { label: "Active Exams", value: "1", icon: Play, color: "from-purple-500 to-purple-600" },
          { label: "Avg. Score", value: "72%", icon: CheckCircle, color: "from-[var(--accent)] to-emerald-400" },
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
            <h3 className="text-white font-semibold text-lg">Examination Schedule</h3>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Search exams..."
                className="pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
          </div>
          <div className="space-y-3">
            {exams.map((exam) => (
              <div key={exam.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/8 transition-all">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  exam.status === "active" ? "bg-emerald-500/20 text-emerald-400" :
                  exam.status === "completed" ? "bg-white/10 text-white/40" :
                  "bg-blue-500/20 text-blue-400"
                }`}>
                  {exam.status === "active" ? <Play className="w-5 h-5" /> :
                   exam.status === "completed" ? <CheckCircle className="w-5 h-5" /> :
                   <Clock className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{exam.name}</p>
                  <p className="text-white/40 text-xs">{exam.type} • {exam.duration} • {exam.questions} questions</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                    exam.status === "active" ? "bg-emerald-500/20 text-emerald-400" :
                    exam.status === "completed" ? "bg-white/10 text-white/40" :
                    "bg-blue-500/20 text-blue-400"
                  }`}>
                    {exam.status}
                  </span>
                  <p className="text-white/40 text-xs mt-1">{exam.date}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <h3 className="text-white font-semibold text-lg mb-4">Question Bank</h3>
          <div className="space-y-3">
            {questionBank.map((subject, i) => (
              <div key={i} className="p-3 rounded-xl bg-white/5 hover:bg-white/8 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white text-sm font-medium">{subject.subject}</span>
                  <span className="text-white/40 text-xs">{subject.questions} Qs</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/40">{subject.difficulty}</span>
                  <span className="text-white/30">Updated {subject.lastUpdated}</span>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 text-sm hover:bg-white/10 transition-all">
            View All Subjects
          </button>
        </motion.div>
      </div>
    </div>
  );
}
