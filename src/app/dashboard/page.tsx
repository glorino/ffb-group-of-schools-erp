"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { StatCard } from "@/components/ui/stat-card";

interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  attendance: { present: number; absent: number; late: number; rate: string };
  totalRevenue: number;
  monthlyRevenue: { month: string; revenue: number }[];
  classPerformance: { name: string; students: number; teacher: string; capacity: number }[];
  recentActivities: { title: string; description: string; time: string; type: string }[];
  pendingAdmissions: number;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const userName = session?.user?.name?.split(" ")[0] || "Admin";
  const greeting = new Date().getHours() < 12 ? "Good Morning" : new Date().getHours() < 17 ? "Good Afternoon" : "Good Evening";

  const kpiData = [
    {
      label: "Total Students",
      value: stats?.totalStudents ?? 0,
      change: "",
      trend: "up" as const,
      icon: Users,
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Total Teachers",
      value: stats?.totalTeachers ?? 0,
      change: "",
      trend: "up" as const,
      icon: GraduationCap,
      color: "from-emerald-500 to-emerald-600",
    },
    {
      label: "Revenue (Total)",
      value: stats ? `₦${(stats.totalRevenue / 1_000_000).toFixed(1)}M` : "₦0",
      change: "",
      trend: "up" as const,
      icon: CreditCard,
      color: "from-purple-500 to-purple-600",
    },
    {
      label: "Attendance Rate",
      value: stats ? `${stats.attendance.rate}%` : "0%",
      change: "",
      trend: "up" as const,
      icon: CheckCircle,
      color: "from-[var(--accent)] to-emerald-400",
    },
  ];

  const quickStats = [
    { label: "Pending Admissions", value: String(stats?.pendingAdmissions ?? 0), icon: AlertCircle, color: "text-orange-400" },
    { label: "Present Today", value: String(stats?.attendance.present ?? 0), icon: CheckCircle, color: "text-emerald-400" },
    { label: "Absent Today", value: String(stats?.attendance.absent ?? 0), icon: AlertCircle, color: "text-red-400" },
    { label: "Late Today", value: String(stats?.attendance.late ?? 0), icon: Clock, color: "text-yellow-400" },
  ];

  const activityIconMap: Record<string, any> = {
    payment: CreditCard,
    admission: UserPlus,
  };

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
              {greeting}, {userName}
            </h2>
            <p className="text-white/60">
              Here&apos;s what&apos;s happening at your school today. You have{" "}
              <span className="text-[var(--accent)] font-semibold">{stats?.pendingAdmissions ?? 0} pending admissions</span> and{" "}
              <span className="text-[var(--accent)] font-semibold">{stats?.attendance.present ?? 0} students present</span> today.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-all">
              View Reports
            </button>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, i) => (
          <StatCard
            key={i}
            title={kpi.label}
            value={kpi.value}
            change={kpi.change}
            trend={kpi.trend}
            icon={kpi.icon}
            color={kpi.color}
            delay={i * 0.1}
          />
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
          </div>
          <div className="space-y-4">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-4 p-3">
                    <div className="skeleton w-10 h-10 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="skeleton h-4 w-3/4" />
                      <div className="skeleton h-3 w-1/2" />
                    </div>
                  </div>
                ))
              : stats?.recentActivities.map((activity, i) => {
                  const ActivityIcon = activityIconMap[activity.type] || BookOpen;
                  const colorMap: Record<string, string> = {
                    payment: "text-emerald-400",
                    admission: "text-blue-400",
                  };
                  const timeAgo = getTimeAgo(activity.time);
                  return (
                    <div
                      key={i}
                      className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/5 transition-all"
                    >
                      <div
                        className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${colorMap[activity.type] || "text-white/40"}`}
                      >
                        <ActivityIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{activity.title}</p>
                        <p className="text-white/40 text-xs">{activity.description}</p>
                      </div>
                      <span className="text-white/30 text-xs whitespace-nowrap">
                        {timeAgo}
                      </span>
                    </div>
                  );
                })}
          </div>
        </motion.div>

        {/* Monthly Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-semibold text-lg">Revenue Trend</h3>
          </div>
          {stats?.monthlyRevenue ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={stats.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }}
                  labelStyle={{ color: "rgba(255,255,255,0.6)" }}
                  formatter={(value: any) => [`₦${(Number(value) / 1_000_000).toFixed(1)}M`, "Revenue"]}
                />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-white/30">
              Loading chart...
            </div>
          )}
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
        </div>
        {stats?.classPerformance ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.classPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }}
                labelStyle={{ color: "rgba(255,255,255,0.6)" }}
              />
              <Bar dataKey="students" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-white/30">
            Loading chart...
          </div>
        )}
      </motion.div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickStats.map((stat, i) => (
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

function getTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
