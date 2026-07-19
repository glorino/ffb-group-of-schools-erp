"use client";

import { motion } from "framer-motion";
import {
  FileText,
  Download,
  Eye,
  Printer,
  QrCode,
  CheckCircle,
  Clock,
  Users,
  Settings,
  Search,
} from "lucide-react";

const reportCards = [
  { id: 1, student: "Chidinma Okafor", class: "JSS1A", term: "First Term", session: "2024/2025", status: "ready", avgScore: 85 },
  { id: 2, student: "Emeka Nwosu", class: "SS2A", term: "First Term", session: "2024/2025", status: "ready", avgScore: 78 },
  { id: 3, student: "Fatima Bello", class: "JSS3A", term: "First Term", session: "2024/2025", status: "pending", avgScore: 92 },
  { id: 4, student: "Oluwaseun Adeyemi", class: "SS1B", term: "First Term", session: "2024/2025", status: "ready", avgScore: 71 },
  { id: 5, student: "Ngozi Okwu", class: "SS3A", term: "First Term", session: "2024/2025", status: "generated", avgScore: 88 },
];

const stats = [
  { label: "Generated", value: "2,450", icon: CheckCircle, color: "from-emerald-500 to-emerald-600" },
  { label: "Pending", value: "397", icon: Clock, color: "from-orange-500 to-orange-600" },
  { label: "Total Students", value: "2,847", icon: Users, color: "from-blue-500 to-blue-600" },
  { label: "QR Verified", value: "1,890", icon: QrCode, color: "from-purple-500 to-purple-600" },
];

export default function ReportCardsPage() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-gradient-to-r from-[var(--primary)]/20 to-[var(--accent)]/10 border-[var(--primary)]/20"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Report Cards</h1>
            <p className="text-white/60">
              Generate, preview, and distribute report cards with QR verification
            </p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-white/20 text-white text-sm font-medium hover:bg-white/10 transition-all">
              <Settings className="w-4 h-4" />
              Templates
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-all">
              <Download className="w-4 h-4" />
              Generate All
            </button>
          </div>
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
            <h3 className="text-white font-semibold text-lg">Report Card List</h3>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Search students..."
                className="pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
          </div>
          <div className="space-y-3">
            {reportCards.map((card) => (
              <div key={card.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/[0.08] transition-all">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white font-semibold text-sm">
                  {card.student.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{card.student}</p>
                  <p className="text-white/40 text-xs">{card.class} • {card.term} • {card.session}</p>
                </div>
                <div className="text-right">
                  <p className="text-white text-sm font-medium">{card.avgScore}%</p>
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                    card.status === "ready" ? "bg-emerald-500/20 text-emerald-400" :
                    card.status === "generated" ? "bg-blue-500/20 text-blue-400" :
                    "bg-orange-500/20 text-orange-400"
                  }`}>
                    {card.status}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button className="p-2 rounded-lg hover:bg-white/10 text-white/40">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-white/10 text-white/40">
                    <Download className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-white/10 text-white/40">
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
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
            <h3 className="text-white font-semibold text-lg mb-4">PDF Preview</h3>
            <div className="aspect-[3/4] rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center">
              <FileText className="w-16 h-16 text-white/20 mb-4" />
              <p className="text-white/40 text-sm">Select a report card to preview</p>
            </div>
          </div>

          <div className="card">
            <h3 className="text-white font-semibold text-lg mb-4">QR Verification</h3>
            <div className="p-4 rounded-xl bg-white/5 flex flex-col items-center">
              <div className="w-32 h-32 rounded-xl bg-white flex items-center justify-center mb-3">
                <QrCode className="w-24 h-24 text-[var(--blue-1)]" />
              </div>
              <p className="text-white/60 text-xs text-center">
                Each report card includes a unique QR code for verification by third parties
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
