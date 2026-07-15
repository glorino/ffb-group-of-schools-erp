"use client";

import { motion } from "framer-motion";
import {
  Users,
  UserPlus,
  CreditCard,
  BookOpen,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  GraduationCap,
  Building,
  Bus,
  Library,
} from "lucide-react";

const kpiData = [
  {
    label: "Total Students",
    value: 2847,
    change: "+12%",
    trend: "up",
    icon: Users,
    color: "from-blue-500 to-blue-600",
  },
  {
    label: "Total Teachers",
    value: 156,
    change: "+5%",
    trend: "up",
    icon: GraduationCap,
    color: "from-emerald-500 to-emerald-600",
  },
  {
    label: "Revenue (Month)",
    value: "₦45.2M",
    change: "+18%",
    trend: "up",
    icon: CreditCard,
    color: "from-purple-500 to-purple-600",
  },
  {
    label: "Attendance Rate",
    value: "94.2%",
    change: "+2.1%",
    trend: "up",
    icon: CheckCircle,
    color: "from-[var(--accent)] to-emerald-400",
  },
];

const recentActivities = [
  {
    title: "New admission application received",
    description: "Chidi Okonkwo applied for JSS1",
    time: "5 minutes ago",
    icon: UserPlus,
    color: "text-blue-400",
  },
  {
    title: "School fees payment confirmed",
    description: "Amina Mohammed paid ₦125,000",
    time: "12 minutes ago",
    icon: CreditCard,
    color: "text-emerald-400",
  },
  {
    title: "Examination results uploaded",
    description: "SS3 Mathematics results published",
    time: "1 hour ago",
    icon: BookOpen,
    color: "text-purple-400",
  },
  {
    title: "Hostel allocation updated",
    description: "Block A, Room 12 - 3 new students",
    time: "2 hours ago",
    icon: Building,
    color: "text-orange-400",
  },
  {
    title: "Transport route optimized",
    description: "Route 3 (Mainland) time updated",
    time: "3 hours ago",
    icon: Bus,
    color: "text-cyan-400",
  },
];

const upcomingEvents = [
  {
    title: "Mid-Term Examination",
    date: "Jan 20, 2025",
    type: "exam",
    status: "upcoming",
  },
  {
    title: "Parent-Teacher Meeting",
    date: "Jan 22, 2025",
    type: "meeting",
    status: "upcoming",
  },
  {
    title: "School Sports Day",
    date: "Jan 25, 2025",
    type: "event",
    status: "upcoming",
  },
  {
    title: "Board Meeting",
    date: "Jan 28, 2025",
    type: "admin",
    status: "upcoming",
  },
];

const classPerformance = [
  { name: "JSS1", pass: 85, fail: 15 },
  { name: "JSS2", pass: 78, fail: 22 },
  { name: "JSS3", pass: 92, fail: 8 },
  { name: "SS1", pass: 74, fail: 26 },
  { name: "SS2", pass: 88, fail: 12 },
  { name: "SS3", pass: 95, fail: 5 },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-gradient-to-r from-[var(--primary)]/20 to-[var(--accent)]/10 border-[var(--primary)]/20"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              Good Morning, Admin 👋
            </h2>
            <p className="text-white/60">
              Here&apos;s what&apos;s happening at your school today. You have{" "}
              <span className="text-[var(--accent)] font-semibold">3 new admissions</span> and{" "}
              <span className="text-[var(--accent)] font-semibold">₦2.5M</span> in pending payments.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-all">
              View Reports
            </button>
            <button className="px-4 py-2 rounded-xl glass border border-white/20 text-white text-sm font-medium hover:bg-white/10 transition-all">
              Quick Actions
            </button>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/50 text-sm mb-1">{kpi.label}</p>
                <p className="text-3xl font-bold text-white animate-count">
                  {kpi.value}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  {kpi.trend === "up" ? (
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      kpi.trend === "up" ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {kpi.change}
                  </span>
                  <span className="text-white/40 text-sm">vs last month</span>
                </div>
              </div>
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center shadow-lg`}
              >
                <kpi.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 card"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-semibold text-lg">Recent Activities</h3>
            <button className="text-[var(--accent)] text-sm hover:underline">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/5 transition-all"
              >
                <div
                  className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${activity.color}`}
                >
                  <activity.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{activity.title}</p>
                  <p className="text-white/40 text-xs">{activity.description}</p>
                </div>
                <span className="text-white/30 text-xs whitespace-nowrap">
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Upcoming Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-semibold text-lg">Upcoming Events</h3>
            <Calendar className="w-5 h-5 text-white/40" />
          </div>
          <div className="space-y-3">
            {upcomingEvents.map((event, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/8 transition-all"
              >
                <p className="text-white text-sm font-medium">{event.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="w-3 h-3 text-white/30" />
                  <span className="text-white/40 text-xs">{event.date}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Class Performance Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-semibold text-lg">Class Performance Overview</h3>
          <div className="flex gap-4 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-emerald-500" />
              Pass Rate
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-red-500" />
              Fail Rate
            </span>
          </div>
        </div>
        <div className="grid grid-cols-6 gap-4">
          {classPerformance.map((cls, i) => (
            <div key={i} className="text-center">
              <div className="relative h-40 flex items-end justify-center mb-2">
                <div className="w-full max-w-[60px] relative">
                  <div
                    className="w-full bg-emerald-500/80 rounded-t-lg transition-all duration-500"
                    style={{ height: `${cls.pass * 1.5}px` }}
                  />
                  <div
                    className="w-full bg-red-500/80 rounded-b-lg transition-all duration-500"
                    style={{ height: `${cls.fail * 1.5}px` }}
                  />
                </div>
              </div>
              <p className="text-white text-sm font-medium">{cls.name}</p>
              <p className="text-white/40 text-xs">{cls.pass}% pass</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Pending Admissions", value: "12", icon: AlertCircle, color: "text-orange-400" },
          { label: "Fee Collections Today", value: "₦1.2M", icon: CreditCard, color: "text-emerald-400" },
          { label: "Library Books Borrowed", value: "34", icon: Library, color: "text-blue-400" },
          { label: "Absent Today", value: "23", icon: AlertCircle, color: "text-red-400" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 + i * 0.05 }}
            className="card flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-white font-bold text-xl">{stat.value}</p>
              <p className="text-white/40 text-xs">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
