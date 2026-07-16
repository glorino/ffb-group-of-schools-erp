"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Users,
  GraduationCap,
  CreditCard,
  BookOpen,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  BarChart3,
  Sparkles,
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
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { StatCard } from "@/components/ui/stat-card";

const fadeIn = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
};

const COLORS = ["#0055ff", "#28ff9c", "#ff6b35", "#a855f7", "#f59e0b", "#06b6d4", "#ec4899", "#10b981"];

const classPerformance = [
  { name: "JSS1", avg: 72, target: 75 },
  { name: "JSS2", avg: 68, target: 75 },
  { name: "JSS3", avg: 81, target: 75 },
  { name: "SS1", avg: 76, target: 75 },
  { name: "SS2", avg: 84, target: 75 },
  { name: "SS3", avg: 88, target: 75 },
];

const revenueData = [
  { month: "Sep", revenue: 4200000, expenses: 1800000 },
  { month: "Oct", revenue: 3800000, expenses: 1600000 },
  { month: "Nov", revenue: 5100000, expenses: 2100000 },
  { month: "Dec", revenue: 2900000, expenses: 1400000 },
  { month: "Jan", revenue: 6200000, expenses: 2400000 },
  { month: "Feb", revenue: 4800000, expenses: 1900000 },
  { month: "Mar", revenue: 5500000, expenses: 2200000 },
  { month: "Apr", revenue: 7100000, expenses: 2600000 },
  { month: "May", revenue: 4400000, expenses: 1700000 },
  { month: "Jun", revenue: 3600000, expenses: 1500000 },
];

const enrollmentByClass = [
  { name: "JSS1", male: 45, female: 38 },
  { name: "JSS2", male: 42, female: 40 },
  { name: "JSS3", male: 38, female: 35 },
  { name: "SS1", male: 52, female: 48 },
  { name: "SS2", male: 48, female: 44 },
  { name: "SS3", male: 55, female: 50 },
];

const attendancePie = [
  { name: "Present", value: 156, color: "#28ff9c" },
  { name: "Absent", value: 18, color: "#ff4444" },
  { name: "Late", value: 12, color: "#f59e0b" },
  { name: "Excused", value: 8, color: "#0055ff" },
];

const recentActivity = [
  { id: 1, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/15", text: "Adewale Babatunde paid ₦245,000 tuition fee", time: "12 minutes ago" },
  { id: 2, icon: Users, color: "text-blue-400", bg: "bg-blue-500/15", text: "Chidinma Okafor submitted admission application", time: "34 minutes ago" },
  { id: 3, icon: GraduationCap, color: "text-purple-400", bg: "bg-purple-500/15", text: "JSS3 First Term results uploaded — awaiting approval", time: "1 hour ago" },
  { id: 4, icon: AlertCircle, color: "text-amber-400", bg: "bg-amber-500/15", text: "Science lab inventory below minimum threshold", time: "2 hours ago" },
  { id: 5, icon: Calendar, color: "text-cyan-400", bg: "bg-cyan-500/15", text: "PTA meeting scheduled for tomorrow at 2:00 PM", time: "3 hours ago" },
  { id: 6, icon: BookOpen, color: "text-pink-400", bg: "bg-pink-500/15", text: "Mrs. Fatima Bello uploaded JSS2 Mathematics lesson plan", time: "4 hours ago" },
  { id: 7, icon: CreditCard, color: "text-emerald-400", bg: "bg-emerald-500/15", text: "Bank transfer verified — ₦180,000 from Okonkwo Family", time: "5 hours ago" },
  { id: 8, icon: CheckCircle2, color: "text-blue-400", bg: "bg-blue-500/15", text: "SS2 Chemistry practical attendance marked", time: "6 hours ago" },
];

const todaySchedule = [
  { time: "08:00 AM", subject: "Mathematics", class: "JSS3A", teacher: "Mr. Adebayo", type: "lecture" },
  { time: "09:30 AM", subject: "English Language", class: "SS1B", teacher: "Mrs. Fatima", type: "lecture" },
  { time: "11:00 AM", subject: "Physics", class: "SS2A", teacher: "Dr. Okafor", type: "practical" },
  { time: "01:00 PM", subject: "Agricultural Science", class: "JSS2A", teacher: "Mr. Ibrahim", type: "lecture" },
  { time: "02:30 PM", subject: "Computer Studies", class: "JSS1B", teacher: "Ms. Chioma", type: "lab" },
];

export default function DashboardPage() {
  const { data: session } = useSession();
  const name = session?.user?.name?.split(" ")[0] || "Admin";
  const [stats, setStats] = useState({
    totalStudents: 20,
    totalTeachers: 8,
    totalRevenue: 48200000,
    totalClasses: 6,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/dashboard/stats");
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
        }
      } catch { }
      setLoading(false);
    };
    fetchStats();
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-[var(--sidebar)]/95 backdrop-blur-xl border border-white/[0.1] rounded-xl px-4 py-3 shadow-2xl">
        <p className="text-white/50 text-[11px] font-medium mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="text-white/90 text-sm font-semibold">
            {p.name}: {typeof p.value === "number" && p.value > 10000
              ? `₦${(p.value / 1000000).toFixed(1)}M`
              : p.value}
          </p>
        ))}
      </div>
    );
  };

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-6">
      {/* Greeting */}
      <motion.div variants={fadeIn}>
        <h1 className="text-[26px] font-bold text-white/95 font-display tracking-tight">
          Good Morning, <span className="bg-gradient-to-r from-[var(--blue-3)] to-[var(--accent)] bg-clip-text text-transparent">{name}</span>
        </h1>
        <p className="text-white/35 text-sm mt-1">Here is what is happening at FFB Group of Schools today</p>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={fadeIn} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} title="Total Students" value={stats.totalStudents} change="+12%" trend="up" color="from-blue-500 to-blue-700" />
        <StatCard icon={GraduationCap} title="Active Teachers" value={stats.totalTeachers} change="+4%" trend="up" color="from-purple-500 to-purple-700" />
        <StatCard icon={CreditCard} title="Total Revenue" value={`₦${(stats.totalRevenue / 1000000).toFixed(1)}M`} change="+18%" trend="up" color="from-emerald-500 to-emerald-700" />
        <StatCard icon={BookOpen} title="Active Classes" value={stats.totalClasses} change="0%" trend="up" color="from-amber-500 to-amber-700" />
      </motion.div>

      {/* Charts Row 1 */}
      <motion.div variants={fadeIn} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Class Performance */}
        <div className="lg:col-span-2 bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.07] p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-white/90 font-semibold text-[15px]">Class Performance</h3>
              <p className="text-white/30 text-[11px] mt-0.5">Average scores vs target threshold</p>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[var(--blue-3)]" /> Average</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)]" /> Target</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={classPerformance} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Bar dataKey="avg" name="Average" fill="#0055ff" radius={[6, 6, 0, 0]} maxBarSize={32} />
              <Bar dataKey="target" name="Target" fill="#28ff9c" radius={[6, 6, 0, 0]} maxBarSize={32} opacity={0.6} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Attendance Today */}
        <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.07] p-5">
          <h3 className="text-white/90 font-semibold text-[15px] mb-1">Today&apos;s Attendance</h3>
          <p className="text-white/30 text-[11px] mb-4">194 students expected</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={attendancePie} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                {attendancePie.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {attendancePie.map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-[11px]">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-white/40">{item.name}</span>
                <span className="text-white/70 font-medium ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Revenue Trend */}
      <motion.div variants={fadeIn} className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.07] p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-white/90 font-semibold text-[15px]">Revenue vs Expenses</h3>
            <p className="text-white/30 text-[11px] mt-0.5">12-month financial overview</p>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[var(--blue-3)]" /> Revenue</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-400" /> Expenses</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={revenueData}>
            <defs>
              <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0055ff" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0055ff" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#0055ff" fill="url(#gradRevenue)" strokeWidth={2.5} dot={false} />
            <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" fill="url(#gradExpenses)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Bottom Row */}
      <motion.div variants={fadeIn} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Activity */}
        <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.07] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white/90 font-semibold text-[15px]">Recent Activity</h3>
            <button className="text-white/25 text-[11px] hover:text-white/50 transition">View all</button>
          </div>
          <div className="space-y-1">
            {recentActivity.map((item) => (
              <div key={item.id} className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.03] transition group">
                <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/60 text-[13px] leading-relaxed">{item.text}</p>
                  <p className="text-white/20 text-[10px] mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.07] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white/90 font-semibold text-[15px]">Today&apos;s Schedule</h3>
            <button className="text-white/25 text-[11px] hover:text-white/50 transition">Full timetable</button>
          </div>
          <div className="space-y-1.5">
            {todaySchedule.map((item, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition group">
                <div className="w-16 text-center">
                  <p className="text-white/70 text-[12px] font-semibold">{item.time.split(" ")[0]}</p>
                  <p className="text-white/25 text-[9px] uppercase">{item.time.split(" ")[1]}</p>
                </div>
                <div className="w-px h-8 bg-white/[0.08]" />
                <div className="flex-1 min-w-0">
                  <p className="text-white/80 text-[13px] font-medium">{item.subject}</p>
                  <p className="text-white/30 text-[11px]">{item.class} · {item.teacher}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-medium ${
                  item.type === "practical" ? "bg-purple-500/15 text-purple-400" :
                  item.type === "lab" ? "bg-cyan-500/15 text-cyan-400" :
                  "bg-blue-500/15 text-blue-400"
                }`}>
                  {item.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Enrollment by Gender */}
      <motion.div variants={fadeIn} className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.07] p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-white/90 font-semibold text-[15px]">Enrollment by Gender</h3>
            <p className="text-white/30 text-[11px] mt-0.5">Male vs Female students per class</p>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[var(--blue-3)]" /> Male</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)]" /> Female</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={enrollmentByClass} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Bar dataKey="male" name="Male" fill="#0055ff" radius={[4, 4, 0, 0]} maxBarSize={24} />
            <Bar dataKey="female" name="Female" fill="#28ff9c" radius={[4, 4, 0, 0]} maxBarSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </motion.div>
  );
}
