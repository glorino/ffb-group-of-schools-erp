"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Users,
  GraduationCap,
  Calendar,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const kpiData = [
  { label: "Enrollment Growth", value: "+12.5%", change: "+2.3%", trend: "up", icon: Users, color: "from-blue-500 to-blue-600" },
  { label: "Pass Rate", value: "81.2%", change: "+4.1%", trend: "up", icon: GraduationCap, color: "from-emerald-500 to-emerald-600" },
  { label: "Revenue", value: "₦45.2M", change: "+18%", trend: "up", icon: TrendingUp, color: "from-purple-500 to-purple-600" },
  { label: "Attendance", value: "94.2%", change: "+2.1%", trend: "up", icon: Calendar, color: "from-[var(--accent)] to-emerald-400" },
];

const classPerformance = [
  { class: "JSS1", avg: 72, pass: 85, fail: 15 },
  { class: "JSS2", avg: 68, pass: 78, fail: 22 },
  { class: "JSS3", avg: 75, pass: 92, fail: 8 },
  { class: "SS1", avg: 65, pass: 74, fail: 26 },
  { class: "SS2", avg: 70, pass: 88, fail: 12 },
  { class: "SS3", avg: 78, pass: 95, fail: 5 },
];

const subjectPerformance = [
  { subject: "Mathematics", avg: 68, trend: "up" },
  { subject: "English", avg: 72, trend: "up" },
  { subject: "Physics", avg: 65, trend: "down" },
  { subject: "Chemistry", avg: 70, trend: "up" },
  { subject: "Biology", avg: 75, trend: "up" },
];

const monthlyRevenue = [
  { month: "Sep", amount: 38.5 },
  { month: "Oct", amount: 42.1 },
  { month: "Nov", amount: 40.8 },
  { month: "Dec", amount: 45.2 },
  { month: "Jan", amount: 43.5 },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-gradient-to-r from-[var(--primary)]/20 to-[var(--accent)]/10 border-[var(--primary)]/20"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Analytics Dashboard</h1>
            <p className="text-white/60">
              Charts, KPIs, heatmaps, and trend analysis for data-driven decisions
            </p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-white/20 text-white text-sm font-medium hover:bg-white/10 transition-all">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-all">
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, i) => (
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
                <div className="flex items-center gap-1 mt-2">
                  {kpi.trend === "up" ? (
                    <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-400" />
                  )}
                  <span className={`text-sm font-medium ${kpi.trend === "up" ? "text-emerald-400" : "text-red-400"}`}>
                    {kpi.change}
                  </span>
                </div>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center`}>
                <kpi.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <h3 className="text-white font-semibold text-lg mb-6">Class Performance</h3>
          <div className="space-y-4">
            {classPerformance.map((cls, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="text-white/60 text-sm w-12">{cls.class}</span>
                <div className="flex-1">
                  <div className="flex gap-1">
                    <div className="bg-emerald-500/80 h-6 rounded-l-lg" style={{ width: `${cls.pass}%` }} />
                    <div className="bg-red-500/80 h-6 rounded-r-lg" style={{ width: `${cls.fail}%` }} />
                  </div>
                </div>
                <span className="text-white/40 text-sm w-16 text-right">{cls.avg}% avg</span>
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
          <h3 className="text-white font-semibold text-lg mb-6">Subject Performance</h3>
          <div className="space-y-4">
            {subjectPerformance.map((subject, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="text-white/60 text-sm w-24">{subject.subject}</span>
                <div className="flex-1">
                  <div className="w-full bg-white/10 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] h-3 rounded-full"
                      style={{ width: `${subject.avg}%` }}
                    />
                  </div>
                </div>
                <span className="text-white/40 text-sm w-12 text-right">{subject.avg}%</span>
                {subject.trend === "up" ? (
                  <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-red-400" />
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card"
      >
        <h3 className="text-white font-semibold text-lg mb-6">Monthly Revenue Trend</h3>
        <div className="flex items-end justify-between h-48 gap-4">
          {monthlyRevenue.map((month, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <span className="text-white/40 text-sm mb-2">₦{month.amount}M</span>
              <div
                className="w-full bg-gradient-to-t from-[var(--primary)] to-[var(--accent)] rounded-t-lg transition-all duration-500"
                style={{ height: `${(month.amount / 50) * 100}%` }}
              />
              <span className="text-white/40 text-sm mt-2">{month.month}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
