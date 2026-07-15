"use client";

import { motion } from "framer-motion";
import {
  Award,
  TrendingUp,
  Users,
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  BarChart3,
} from "lucide-react";

const results = [
  { id: 1, class: "JSS1A", subject: "Mathematics", exam: "Mid-Term Test", avgScore: 72, highest: 98, lowest: 25, passRate: 85 },
  { id: 2, class: "JSS2A", subject: "English Language", exam: "Mid-Term Test", avgScore: 68, highest: 95, lowest: 20, passRate: 78 },
  { id: 3, class: "SS1A", subject: "Physics", exam: "Mid-Term Test", avgScore: 65, highest: 92, lowest: 18, passRate: 72 },
  { id: 4, class: "SS2A", subject: "Chemistry", exam: "Mid-Term Test", avgScore: 70, highest: 96, lowest: 22, passRate: 80 },
  { id: 5, class: "SS3A", subject: "Biology", exam: "Mid-Term Test", avgScore: 75, highest: 99, lowest: 30, passRate: 88 },
];

const gradingScale = [
  { grade: "A", range: "70-100", points: "5", color: "text-emerald-400" },
  { grade: "B", range: "60-69", points: "4", color: "text-blue-400" },
  { grade: "C", range: "50-59", points: "3", color: "text-yellow-400" },
  { grade: "D", range: "40-49", points: "2", color: "text-orange-400" },
  { grade: "F", range: "0-39", points: "0", color: "text-red-400" },
];

export default function ResultsPage() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-gradient-to-r from-[var(--primary)]/20 to-[var(--accent)]/10 border-[var(--primary)]/20"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Results Management</h1>
            <p className="text-white/60">
              Grading, ranking, CA marks, and result analysis
            </p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-white/20 text-white text-sm font-medium hover:bg-white/10 transition-all">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-all">
              <Plus className="w-4 h-4" />
              Enter Results
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Results", value: "2,847", icon: FileText, color: "from-blue-500 to-blue-600" },
          { label: "Average Score", value: "72%", icon: TrendingUp, color: "from-emerald-500 to-emerald-600" },
          { label: "Pass Rate", value: "81%", icon: Award, color: "from-purple-500 to-purple-600" },
          { label: "Top Student", value: "98%", icon: Users, color: "from-[var(--accent)] to-emerald-400" },
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
            <h3 className="text-white font-semibold text-lg">Recent Results</h3>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Search results..."
                  className="pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
              <button className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-white/50 text-sm font-medium pb-3">Class</th>
                  <th className="text-left text-white/50 text-sm font-medium pb-3">Subject</th>
                  <th className="text-left text-white/50 text-sm font-medium pb-3">Exam</th>
                  <th className="text-left text-white/50 text-sm font-medium pb-3">Avg Score</th>
                  <th className="text-left text-white/50 text-sm font-medium pb-3">Pass Rate</th>
                  <th className="text-left text-white/50 text-sm font-medium pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => (
                  <tr key={result.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                    <td className="py-3 text-white font-medium">{result.class}</td>
                    <td className="py-3 text-white/70">{result.subject}</td>
                    <td className="py-3 text-white/70 text-sm">{result.exam}</td>
                    <td className="py-3 text-white/70">{result.avgScore}%</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-white/10 rounded-full h-2 max-w-[60px]">
                          <div
                            className="bg-[var(--accent)] h-2 rounded-full"
                            style={{ width: `${result.passRate}%` }}
                          />
                        </div>
                        <span className="text-white/70 text-sm">{result.passRate}%</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <button className="p-1 rounded-lg hover:bg-white/10 text-white/40">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-6"
        >
          <div className="card">
            <h3 className="text-white font-semibold text-lg mb-4">Grading Scale</h3>
            <div className="space-y-2">
              {gradingScale.map((scale, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                  <span className={`text-lg font-bold ${scale.color}`}>{scale.grade}</span>
                  <span className="text-white/70 text-sm">{scale.range}</span>
                  <span className="text-white/40 text-sm">{scale.points} pts</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="text-white font-semibold text-lg mb-4">CA Marks Distribution</h3>
            <div className="space-y-3">
              {[
                { label: "1st CA (20%)", count: 2847, color: "bg-blue-500" },
                { label: "2nd CA (20%)", count: 2847, color: "bg-emerald-500" },
                { label: "Exam (60%)", count: 2847, color: "bg-purple-500" },
              ].map((item, i) => (
                <div key={i} className="p-3 rounded-xl bg-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white text-sm">{item.label}</span>
                    <span className="text-white/40 text-sm">{item.count} records</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className={`${item.color} h-2 rounded-full`} style={{ width: "100%" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
