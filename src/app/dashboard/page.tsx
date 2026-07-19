"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell,
} from "recharts";

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.04 } },
};

const COLORS = ["#0055ff", "#28ff9c", "#ff6b35", "#a855f7", "#f59e0b", "#06b6d4", "#ec4899", "#10b981"];

const classPerformance = [
  { name: "JSS1", avg: 72 }, { name: "JSS2", avg: 68 }, { name: "JSS3", avg: 81 },
  { name: "SS1", avg: 76 }, { name: "SS2", avg: 84 }, { name: "SS3", avg: 88 },
];

const revenueData = [
  { month: "Sep", revenue: 4200000, expenses: 1800000 },
  { month: "Oct", revenue: 3800000, expenses: 1600000 },
  { month: "Nov", revenue: 5100000, expenses: 2100000 },
  { month: "Dec", revenue: 2900000, expenses: 1400000 },
  { month: "Jan", revenue: 6200000, expenses: 2400000 },
  { month: "Feb", revenue: 4800000, expenses: 1900000 },
];

const attendancePie = [
  { name: "Present", value: 156, color: "#28ff9c" },
  { name: "Absent", value: 18, color: "#ff4444" },
  { name: "Late", value: 12, color: "#f59e0b" },
  { name: "Excused", value: 8, color: "#0055ff" },
];

const recentActivity = [
  { text: "Adewale Babatunde paid ₦245,000 tuition fee", time: "12m ago", color: "bg-emerald-500/15 text-emerald-400" },
  { text: "Chidinma Okafor submitted admission application", time: "34m ago", color: "bg-blue-500/15 text-blue-400" },
  { text: "JSS3 First Term results uploaded", time: "1h ago", color: "bg-purple-500/15 text-purple-400" },
  { text: "Science lab inventory below threshold", time: "2h ago", color: "bg-amber-500/15 text-amber-400" },
  { text: "PTA meeting scheduled for tomorrow 2:00 PM", time: "3h ago", color: "bg-cyan-500/15 text-cyan-400" },
];

const todaySchedule = [
  { time: "08:00", subject: "Mathematics", class: "JSS3A", teacher: "Mr. Adebayo", type: "lecture" },
  { time: "09:30", subject: "English Language", class: "SS1B", teacher: "Mrs. Fatima", type: "lecture" },
  { time: "11:00", subject: "Physics", class: "SS2A", teacher: "Dr. Okafor", type: "practical" },
  { time: "13:00", subject: "Agricultural Science", class: "JSS2A", teacher: "Mr. Ibrahim", type: "lecture" },
];

function DashboardCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white/[0.04] backdrop-blur-xl rounded-xl border border-white/[0.07] p-5 ${className}`}>
      {children}
    </div>
  );
}

function CardTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h3 className="text-white/90 font-semibold text-[14px]">{title}</h3>
      {subtitle && <p className="text-white/30 text-[11px] mt-0.5">{subtitle}</p>}
    </div>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[var(--sidebar)]/95 backdrop-blur-xl border border-white/[0.1] rounded-lg px-3 py-2 shadow-2xl">
      <p className="text-white/50 text-[10px] font-medium mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-white/90 text-[12px] font-semibold">
          {p.name}: {typeof p.value === "number" && p.value > 10000 ? `₦${(p.value / 1000000).toFixed(1)}M` : p.value}
        </p>
      ))}
    </div>
  );
}

function AdminDashboard() {
  const [stats, setStats] = useState({ totalStudents: 20, totalTeachers: 8, totalRevenue: 48200000, totalClasses: 6 });
  useEffect(() => {
    fetch("/api/dashboard/stats").then(r => r.json()).then(d => { if (d.success) setStats(d.stats); }).catch(() => {});
  }, []);

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard>
          <p className="text-white/40 text-[12px] font-medium">Total Students</p>
          <p className="text-[28px] font-bold text-white mt-1">{stats.totalStudents}</p>
          <p className="text-emerald-400 text-[11px] mt-1">↗ +12% vs last month</p>
        </DashboardCard>
        <DashboardCard>
          <p className="text-white/40 text-[12px] font-medium">Total Teachers</p>
          <p className="text-[28px] font-bold text-white mt-1">{stats.totalTeachers}</p>
          <p className="text-emerald-400 text-[11px] mt-1">↗ +4% vs last month</p>
        </DashboardCard>
        <DashboardCard>
          <p className="text-white/40 text-[12px] font-medium">Total Revenue</p>
          <p className="text-[28px] font-bold text-white mt-1">₦{(stats.totalRevenue / 1000000).toFixed(1)}M</p>
          <p className="text-emerald-400 text-[11px] mt-1">↗ +18% vs last month</p>
        </DashboardCard>
        <DashboardCard>
          <p className="text-white/40 text-[12px] font-medium">Active Classes</p>
          <p className="text-[28px] font-bold text-white mt-1">{stats.totalClasses}</p>
          <p className="text-white/30 text-[11px] mt-1">0% vs last month</p>
        </DashboardCard>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-4">
        <DashboardCard>
          <p className="text-white/40 text-[12px] font-medium">Admission Applications</p>
          <p className="text-[28px] font-bold text-white mt-1">15</p>
          <p className="text-amber-400 text-[11px] mt-1">5 pending review</p>
        </DashboardCard>
        <DashboardCard>
          <p className="text-white/40 text-[12px] font-medium">Average Academic Score</p>
          <p className="text-[28px] font-bold text-white mt-1">78.5%</p>
          <p className="text-emerald-400 text-[11px] mt-1">↗ +3% vs last term</p>
        </DashboardCard>
        <DashboardCard>
          <p className="text-white/40 text-[12px] font-medium">Fee Collection Rate</p>
          <p className="text-[28px] font-bold text-white mt-1">82%</p>
          <p className="text-emerald-400 text-[11px] mt-1">↗ +7% vs last month</p>
        </DashboardCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <DashboardCard className="lg:col-span-2">
          <CardTitle title="Class Performance" subtitle="Average scores across classes" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={classPerformance} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Bar dataKey="avg" name="Average" fill="#0055ff" radius={[6, 6, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </DashboardCard>
        <DashboardCard>
          <CardTitle title="Today's Attendance" subtitle="194 students expected" />
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={attendancePie} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={3} dataKey="value">
                {attendancePie.map((entry, i) => <Cell key={i} fill={entry.color} stroke="transparent" />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            {attendancePie.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5 text-[10px]">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-white/40">{item.name}</span>
                <span className="text-white/70 font-medium ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <DashboardCard>
          <CardTitle title="Revenue vs Expenses" subtitle="6-month financial overview" />
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0055ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0055ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#0055ff" fill="url(#gRev)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" fill="transparent" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </DashboardCard>
        <DashboardCard>
          <CardTitle title="Recent Activity" />
          <div className="space-y-2">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-start gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/[0.03] transition">
                <div className={`w-7 h-7 rounded-md ${item.color} flex items-center justify-center flex-shrink-0 text-[10px] font-bold`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/60 text-[12px] leading-relaxed">{item.text}</p>
                  <p className="text-white/20 text-[10px] mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>
    </>
  );
}

function TeacherDashboard() {
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard>
          <p className="text-white/40 text-[12px] font-medium">My Classes</p>
          <p className="text-[28px] font-bold text-white mt-1">6</p>
          <p className="text-white/30 text-[11px] mt-1">Across 3 levels</p>
        </DashboardCard>
        <DashboardCard>
          <p className="text-white/40 text-[12px] font-medium">My Students</p>
          <p className="text-[28px] font-bold text-white mt-1">184</p>
          <p className="text-white/30 text-[11px] mt-1">45 JSS1, 52 SS1...</p>
        </DashboardCard>
        <DashboardCard>
          <p className="text-white/40 text-[12px] font-medium">Attendance Today</p>
          <p className="text-[28px] font-bold text-white mt-1">89%</p>
          <p className="text-emerald-400 text-[11px] mt-1">164 of 184 present</p>
        </DashboardCard>
        <DashboardCard>
          <p className="text-white/40 text-[12px] font-medium">Pending Grades</p>
          <p className="text-[28px] font-bold text-white mt-1">12</p>
          <p className="text-amber-400 text-[11px] mt-1">3 overdue</p>
        </DashboardCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <DashboardCard className="lg:col-span-2">
          <CardTitle title="Today's Schedule" />
          <div className="space-y-2">
            {todaySchedule.map((item, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition">
                <div className="w-12 text-center">
                  <p className="text-white/70 text-[12px] font-semibold">{item.time}</p>
                </div>
                <div className="w-px h-7 bg-white/[0.08]" />
                <div className="flex-1 min-w-0">
                  <p className="text-white/80 text-[13px] font-medium">{item.subject}</p>
                  <p className="text-white/30 text-[11px]">{item.class} · {item.teacher}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                  item.type === "practical" ? "bg-purple-500/15 text-purple-400" : "bg-blue-500/15 text-blue-400"
                }`}>{item.type}</span>
              </div>
            ))}
          </div>
        </DashboardCard>
        <DashboardCard>
          <CardTitle title="Recent Activity" />
          <div className="space-y-2">
            {recentActivity.slice(0, 4).map((item, i) => (
              <div key={i} className="flex items-start gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.03] transition">
                <div className={`w-6 h-6 rounded ${item.color} flex items-center justify-center flex-shrink-0 text-[9px] font-bold`}>{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/55 text-[11px] leading-relaxed">{item.text}</p>
                  <p className="text-white/20 text-[9px] mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>
    </>
  );
}

function StudentDashboard() {
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard>
          <p className="text-white/40 text-[12px] font-medium">My Class</p>
          <p className="text-[22px] font-bold text-white mt-1">JSS3A</p>
          <p className="text-white/30 text-[11px] mt-1">Class of 42 students</p>
        </DashboardCard>
        <DashboardCard>
          <p className="text-white/40 text-[12px] font-medium">Attendance Rate</p>
          <p className="text-[28px] font-bold text-white mt-1">95%</p>
          <p className="text-emerald-400 text-[11px] mt-1">Present 38 of 40 days</p>
        </DashboardCard>
        <DashboardCard>
          <p className="text-white/40 text-[12px] font-medium">Current Average</p>
          <p className="text-[28px] font-bold text-white mt-1">82%</p>
          <p className="text-emerald-400 text-[11px] mt-1">↗ +5% from last term</p>
        </DashboardCard>
        <DashboardCard>
          <p className="text-white/40 text-[12px] font-medium">Fee Balance</p>
          <p className="text-[22px] font-bold text-white mt-1">₦85,000</p>
          <p className="text-amber-400 text-[11px] mt-1">Due by month end</p>
        </DashboardCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <DashboardCard className="lg:col-span-2">
          <CardTitle title="Today's Classes" />
          <div className="space-y-2">
            {todaySchedule.map((item, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition">
                <div className="w-12 text-center">
                  <p className="text-white/70 text-[12px] font-semibold">{item.time}</p>
                </div>
                <div className="w-px h-7 bg-white/[0.08]" />
                <div className="flex-1">
                  <p className="text-white/80 text-[13px] font-medium">{item.subject}</p>
                  <p className="text-white/30 text-[11px]">{item.teacher}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                  item.type === "practical" ? "bg-purple-500/15 text-purple-400" : "bg-blue-500/15 text-blue-400"
                }`}>{item.type}</span>
              </div>
            ))}
          </div>
        </DashboardCard>
        <DashboardCard>
          <CardTitle title="Upcoming" />
          <div className="space-y-2.5">
            <div className="px-2.5 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <p className="text-amber-400 text-[11px] font-medium">📝 Math Exam</p>
              <p className="text-white/50 text-[10px] mt-0.5">Tomorrow, 9:00 AM</p>
            </div>
            <div className="px-2.5 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-blue-400 text-[11px] font-medium">📚 English Assignment</p>
              <p className="text-white/50 text-[10px] mt-0.5">Due in 3 days</p>
            </div>
            <div className="px-2.5 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-emerald-400 text-[11px] font-medium">💰 Fee Payment</p>
              <p className="text-white/50 text-[10px] mt-0.5">₦85,000 due by Friday</p>
            </div>
          </div>
        </DashboardCard>
      </div>
    </>
  );
}

function PrincipalDashboard() {
  const [stats, setStats] = useState({ totalStudents: 20, totalTeachers: 8, totalRevenue: 48200000, totalClasses: 6 });
  useEffect(() => {
    fetch("/api/dashboard/stats").then(r => r.json()).then(d => { if (d.success) setStats(d.stats); }).catch(() => {});
  }, []);

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard>
          <p className="text-white/40 text-[12px] font-medium">Total Students</p>
          <p className="text-[28px] font-bold text-white mt-1">{stats.totalStudents}</p>
          <p className="text-emerald-400 text-[11px] mt-1">↗ +12% this term</p>
        </DashboardCard>
        <DashboardCard>
          <p className="text-white/40 text-[12px] font-medium">Total Teachers</p>
          <p className="text-[28px] font-bold text-white mt-1">{stats.totalTeachers}</p>
          <p className="text-white/30 text-[11px] mt-1">All active</p>
        </DashboardCard>
        <DashboardCard>
          <p className="text-white/40 text-[12px] font-medium">School Revenue</p>
          <p className="text-[22px] font-bold text-white mt-1">₦{(stats.totalRevenue / 1000000).toFixed(1)}M</p>
          <p className="text-emerald-400 text-[11px] mt-1">↗ +18% vs last month</p>
        </DashboardCard>
        <DashboardCard>
          <p className="text-white/40 text-[12px] font-medium">Avg. Performance</p>
          <p className="text-[28px] font-bold text-white mt-1">78.5%</p>
          <p className="text-emerald-400 text-[11px] mt-1">↗ +3% from last term</p>
        </DashboardCard>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-4">
        <DashboardCard>
          <p className="text-white/40 text-[12px] font-medium">Pending Admissions</p>
          <p className="text-[28px] font-bold text-white mt-1">5</p>
          <p className="text-amber-400 text-[11px] mt-1">Needs your review</p>
        </DashboardCard>
        <DashboardCard>
          <p className="text-white/40 text-[12px] font-medium">Fee Collection Rate</p>
          <p className="text-[28px] font-bold text-white mt-1">82%</p>
          <p className="text-emerald-400 text-[11px] mt-1">₦39.5M collected</p>
        </DashboardCard>
        <DashboardCard>
          <p className="text-white/40 text-[12px] font-medium">Staff Attendance</p>
          <p className="text-[28px] font-bold text-white mt-1">96%</p>
          <p className="text-emerald-400 text-[11px] mt-1">All teachers present today</p>
        </DashboardCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <DashboardCard className="lg:col-span-2">
          <CardTitle title="Class Performance" subtitle="Average scores across all classes" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={classPerformance} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Bar dataKey="avg" name="Average" fill="#0055ff" radius={[6, 6, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </DashboardCard>
        <DashboardCard>
          <CardTitle title="Revenue Trend" />
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="gRevP" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#28ff9c" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#28ff9c" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#28ff9c" fill="url(#gRevP)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </DashboardCard>
      </div>
    </>
  );
}

function OwnerDashboard() {
  const [stats, setStats] = useState({ totalStudents: 20, totalTeachers: 8, totalRevenue: 48200000, totalClasses: 6 });
  useEffect(() => {
    fetch("/api/dashboard/stats").then(r => r.json()).then(d => { if (d.totalStudents !== undefined) setStats({ totalStudents: d.totalStudents, totalTeachers: d.totalTeachers, totalRevenue: d.totalRevenue, totalClasses: d.classPerformance?.length || 6 }); }).catch(() => {});
  }, []);

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard><p className="text-white/40 text-[12px] font-medium">Total Students</p><p className="text-[28px] font-bold text-white mt-1">{stats.totalStudents}</p></DashboardCard>
        <DashboardCard><p className="text-white/40 text-[12px] font-medium">Total Teachers</p><p className="text-[28px] font-bold text-white mt-1">{stats.totalTeachers}</p></DashboardCard>
        <DashboardCard><p className="text-white/40 text-[12px] font-medium">Total Revenue</p><p className="text-[28px] font-bold text-white mt-1">₦{(stats.totalRevenue / 1000000).toFixed(1)}M</p></DashboardCard>
        <DashboardCard><p className="text-white/40 text-[12px] font-medium">Active Classes</p><p className="text-[28px] font-bold text-white mt-1">{stats.totalClasses}</p></DashboardCard>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <DashboardCard><CardTitle title="Revenue vs Expenses" subtitle="6-month financial overview" /><ResponsiveContainer width="100%" height={200}><AreaChart data={revenueData}><defs><linearGradient id="gRevO" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0055ff" stopOpacity={0.3} /><stop offset="95%" stopColor="#0055ff" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" /><XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} /><Tooltip content={<CustomTooltip />} /><Area type="monotone" dataKey="revenue" name="Revenue" stroke="#0055ff" fill="url(#gRevO)" strokeWidth={2} dot={false} /><Area type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" fill="transparent" strokeWidth={2} dot={false} /></AreaChart></ResponsiveContainer></DashboardCard>
        <DashboardCard><CardTitle title="Recent Activity" /><div className="space-y-2">{recentActivity.map((item, i) => (<div key={i} className="flex items-start gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/[0.03] transition"><div className={`w-7 h-7 rounded-md ${item.color} flex items-center justify-center flex-shrink-0 text-[10px] font-bold`}>{i + 1}</div><div className="flex-1 min-w-0"><p className="text-white/60 text-[12px] leading-relaxed">{item.text}</p><p className="text-white/20 text-[10px] mt-0.5">{item.time}</p></div></div>))}</div></DashboardCard>
      </div>
    </>
  );
}

function AccountantDashboard() {
  const [stats, setStats] = useState({ totalRevenue: 48200000 });
  useEffect(() => {
    fetch("/api/dashboard/stats").then(r => r.json()).then(d => { if (d.totalRevenue !== undefined) setStats({ totalRevenue: d.totalRevenue }); }).catch(() => {});
  }, []);

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard><p className="text-white/40 text-[12px] font-medium">Total Collected</p><p className="text-[22px] font-bold text-white mt-1">₦{(stats.totalRevenue / 1000000).toFixed(1)}M</p><p className="text-emerald-400 text-[11px] mt-1">↗ +18% vs last month</p></DashboardCard>
        <DashboardCard><p className="text-white/40 text-[12px] font-medium">Outstanding</p><p className="text-[22px] font-bold text-white mt-1">₦12.8M</p><p className="text-amber-400 text-[11px] mt-1">16 defaulters</p></DashboardCard>
        <DashboardCard><p className="text-white/40 text-[12px] font-medium">This Month</p><p className="text-[22px] font-bold text-white mt-1">₦6.2M</p><p className="text-emerald-400 text-[11px] mt-1">↗ +24%</p></DashboardCard>
        <DashboardCard><p className="text-white/40 text-[12px] font-medium">Payroll This Month</p><p className="text-[22px] font-bold text-white mt-1">₦4.1M</p><p className="text-white/30 text-[11px] mt-1">8 teachers</p></DashboardCard>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <DashboardCard><CardTitle title="Revenue by Class" /><ResponsiveContainer width="100%" height={200}><BarChart data={classPerformance} barGap={4}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" /><XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} /><Tooltip content={<CustomTooltip />} cursor={false} /><Bar dataKey="avg" name="Revenue" fill="#28ff9c" radius={[6, 6, 0, 0]} maxBarSize={36} /></BarChart></ResponsiveContainer></DashboardCard>
        <DashboardCard><CardTitle title="Fee Collection Rate" /><ResponsiveContainer width="100%" height={160}><PieChart><Pie data={attendancePie} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={3} dataKey="value">{attendancePie.map((entry, i) => <Cell key={i} fill={entry.color} stroke="transparent" />)}</Pie><Tooltip content={<CustomTooltip />} /></PieChart></ResponsiveContainer></DashboardCard>
      </div>
    </>
  );
}

function AuditorDashboard() {
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard><p className="text-white/40 text-[12px] font-medium">Total Revenue</p><p className="text-[22px] font-bold text-white mt-1">₦48.2M</p><p className="text-white/30 text-[11px] mt-1">Fiscal Year 2025</p></DashboardCard>
        <DashboardCard><p className="text-white/40 text-[12px] font-medium">Total Expenses</p><p className="text-[22px] font-bold text-white mt-1">₦18.4M</p><p className="text-white/30 text-[11px] mt-1">38% of revenue</p></DashboardCard>
        <DashboardCard><p className="text-white/40 text-[12px] font-medium">Net Surplus</p><p className="text-[22px] font-bold text-emerald-400 mt-1">₦29.8M</p><p className="text-emerald-400 text-[11px] mt-1">Healthy margin</p></DashboardCard>
        <DashboardCard><p className="text-white/40 text-[12px] font-medium">Compliance Score</p><p className="text-[22px] font-bold text-white mt-1">94%</p><p className="text-emerald-400 text-[11px] mt-1">All checks passed</p></DashboardCard>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <DashboardCard><CardTitle title="Revenue vs Expenses" subtitle="6-month trend" /><ResponsiveContainer width="100%" height={200}><AreaChart data={revenueData}><defs><linearGradient id="gRevA" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0055ff" stopOpacity={0.3} /><stop offset="95%" stopColor="#0055ff" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" /><XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} /><Tooltip content={<CustomTooltip />} /><Area type="monotone" dataKey="revenue" name="Revenue" stroke="#0055ff" fill="url(#gRevA)" strokeWidth={2} dot={false} /><Area type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" fill="transparent" strokeWidth={2} dot={false} /></AreaChart></ResponsiveContainer></DashboardCard>
        <DashboardCard><CardTitle title="Audit Summary" /><div className="space-y-2">{[{ text: "Fee collection audit completed", time: "1 day ago", color: "bg-emerald-500/15 text-emerald-400" }, { text: "Payroll verification passed", time: "3 days ago", color: "bg-blue-500/15 text-blue-400" }, { text: "Expense receipts reconciled", time: "5 days ago", color: "bg-purple-500/15 text-purple-400" }].map((item, i) => (<div key={i} className="flex items-start gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/[0.03] transition"><div className={`w-7 h-7 rounded-md ${item.color} flex items-center justify-center flex-shrink-0 text-[10px] font-bold`}>{i + 1}</div><div className="flex-1 min-w-0"><p className="text-white/60 text-[12px]">{item.text}</p><p className="text-white/20 text-[10px] mt-0.5">{item.time}</p></div></div>))}</div></DashboardCard>
      </div>
    </>
  );
}

function LibrarianDashboard() {
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard><p className="text-white/40 text-[12px] font-medium">Total Books</p><p className="text-[28px] font-bold text-white mt-1">2,603</p><p className="text-white/30 text-[11px] mt-1">Across 12 categories</p></DashboardCard>
        <DashboardCard><p className="text-white/40 text-[12px] font-medium">Borrowed Today</p><p className="text-[28px] font-bold text-white mt-1">18</p><p className="text-emerald-400 text-[11px] mt-1">↑ 5 from yesterday</p></DashboardCard>
        <DashboardCard><p className="text-white/40 text-[12px] font-medium">Overdue Returns</p><p className="text-[28px] font-bold text-white mt-1">7</p><p className="text-red-400 text-[11px] mt-1">Needs follow-up</p></DashboardCard>
        <DashboardCard><p className="text-white/40 text-[12px] font-medium">Active Members</p><p className="text-[28px] font-bold text-white mt-1">156</p><p className="text-white/30 text-[11px] mt-1">Students + Staff</p></DashboardCard>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <DashboardCard><CardTitle title="Recently Borrowed" /><div className="space-y-2">{[{ book: "Mathematics JSSE", student: "Adebayo J.", due: "Jun 25" }, { book: "English Composition", student: "Chioma O.", due: "Jun 26" }, { book: "Physics Practical", student: "Ibrahim M.", due: "Jun 27" }, { book: "Biology Textbook", student: "Fatima A.", due: "Jun 28" }].map((item, i) => (<div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]"><div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center flex-shrink-0"><span className="text-[10px] text-blue-400 font-bold">📚</span></div><div className="flex-1 min-w-0"><p className="text-white/80 text-[12px] font-medium">{item.book}</p><p className="text-white/30 text-[10px]">{item.student} · Due {item.due}</p></div></div>))}</div></DashboardCard>
        <DashboardCard><CardTitle title="Low Stock Alert" /><div className="space-y-2">{[{ book: "Chalk (Box)", qty: 3, min: 10 }, { book: "Exercise Books", qty: 15, min: 50 }, { book: "Lab Coats", qty: 8, min: 20 }].map((item, i) => (<div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-red-500/5 border border-red-500/10"><div><p className="text-white/70 text-[12px]">{item.book}</p><p className="text-red-400 text-[10px]">Only {item.qty} left (min: {item.min})</p></div></div>))}</div></DashboardCard>
      </div>
    </>
  );
}

function PorterDashboard() {
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard><p className="text-white/40 text-[12px] font-medium">Total Beds</p><p className="text-[28px] font-bold text-white mt-1">230</p><p className="text-white/30 text-[11px] mt-1">4 blocks</p></DashboardCard>
        <DashboardCard><p className="text-white/40 text-[12px] font-medium">Occupied</p><p className="text-[28px] font-bold text-white mt-1">198</p><p className="text-white/30 text-[11px] mt-1">86% occupancy</p></DashboardCard>
        <DashboardCard><p className="text-white/40 text-[12px] font-medium">Available</p><p className="text-[28px] font-bold text-emerald-400 mt-1">32</p><p className="text-white/30 text-[11px] mt-1">Across all blocks</p></DashboardCard>
        <DashboardCard><p className="text-white/40 text-[12px] font-medium">Check-outs Today</p><p className="text-[28px] font-bold text-white mt-1">3</p><p className="text-amber-400 text-[11px] mt-1">Pending approval</p></DashboardCard>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <DashboardCard><CardTitle title="Recent Check-ins" /><div className="space-y-2">{[{ name: "Emeka Obi", block: "Block A", room: "Room 12", time: "08:15 AM" }, { name: "Yusuf Abdullahi", block: "Block B", room: "Room 08", time: "07:45 AM" }, { name: "David Nwachukwu", block: "Block A", room: "Room 05", time: "07:30 AM" }].map((item, i) => (<div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]"><div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center flex-shrink-0 text-emerald-400 text-[10px] font-bold">✓</div><div className="flex-1 min-w-0"><p className="text-white/80 text-[12px] font-medium">{item.name}</p><p className="text-white/30 text-[10px]">{item.block} · {item.room} · {item.time}</p></div></div>))}</div></DashboardCard>
        <DashboardCard><CardTitle title="Pending Requests" /><div className="space-y-2">{[{ type: "Room Change", student: "Chidi E.", detail: "Block B → Block A" }, { type: "Maintenance", student: "Block C", detail: "Broken window" }].map((item, i) => (<div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-amber-500/5 border border-amber-500/10"><div className="flex-1 min-w-0"><p className="text-white/80 text-[12px] font-medium">{item.type}</p><p className="text-white/30 text-[10px]">{item.student} · {item.detail}</p></div></div>))}</div></DashboardCard>
      </div>
    </>
  );
}

function AlumniDashboard() {
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard><p className="text-white/40 text-[12px] font-medium">Alumni Members</p><p className="text-[28px] font-bold text-white mt-1">342</p><p className="text-emerald-400 text-[11px] mt-1">+28 this year</p></DashboardCard>
        <DashboardCard><p className="text-white/40 text-[12px] font-medium">Events This Year</p><p className="text-[28px] font-bold text-white mt-1">6</p><p className="text-white/30 text-[11px] mt-1">3 completed</p></DashboardCard>
        <DashboardCard><p className="text-white/40 text-[12px] font-medium">Total Donations</p><p className="text-[22px] font-bold text-white mt-1">₦2.4M</p><p className="text-emerald-400 text-[11px] mt-1">↑ 15% vs last year</p></DashboardCard>
        <DashboardCard><p className="text-white/40 text-[12px] font-medium">Mentorship Active</p><p className="text-[28px] font-bold text-white mt-1">12</p><p className="text-white/30 text-[11px] mt-1">Student pairs</p></DashboardCard>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <DashboardCard><CardTitle title="Upcoming Events" /><div className="space-y-2">{[{ name: "Annual Homecoming", date: "Dec 20, 2026", attendees: 85 }, { name: "Career Day Mentorship", date: "Feb 15, 2027", attendees: 42 }, { name: "Alumni Reunion Dinner", date: "Mar 22, 2027", attendees: 120 }].map((item, i) => (<div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]"><div className="w-10 text-center"><p className="text-white/50 text-[9px] uppercase">{new Date(item.date).toLocaleDateString("en", { month: "short" })}</p><p className="text-white/80 text-[16px] font-bold">{new Date(item.date).getDate()}</p></div><div className="flex-1"><p className="text-white/80 text-[12px] font-medium">{item.name}</p><p className="text-white/30 text-[10px]">{item.attendees} expected</p></div></div>))}</div></DashboardCard>
        <DashboardCard><CardTitle title="Recent Donations" /><div className="space-y-2">{[{ donor: "Emeka Obi (2015)", amount: "₦250,000", purpose: "Lab Equipment" }, { donor: "Chioma Nwosu (2018)", amount: "₦150,000", purpose: "Scholarship Fund" }, { donor: "Ibrahim Musa (2012)", amount: "₦500,000", purpose: "Library Building" }].map((item, i) => (<div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10"><div className="flex-1"><p className="text-white/80 text-[12px] font-medium">{item.donor}</p><p className="text-emerald-400 text-[10px]">{item.amount} · {item.purpose}</p></div></div>))}</div></DashboardCard>
      </div>
    </>
  );
}

function ParentDashboard() {
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard><p className="text-white/40 text-[12px] font-medium">My Child</p><p className="text-[18px] font-bold text-white mt-1">Adebayo Johnson</p><p className="text-white/30 text-[11px] mt-1">JSS3A</p></DashboardCard>
        <DashboardCard><p className="text-white/40 text-[12px] font-medium">Attendance</p><p className="text-[28px] font-bold text-white mt-1">95%</p><p className="text-emerald-400 text-[11px] mt-1">38 of 40 days</p></DashboardCard>
        <DashboardCard><p className="text-white/40 text-[12px] font-medium">Current Average</p><p className="text-[28px] font-bold text-white mt-1">82%</p><p className="text-emerald-400 text-[11px] mt-1">↑ +5% from last term</p></DashboardCard>
        <DashboardCard><p className="text-white/40 text-[12px] font-medium">Fee Balance</p><p className="text-[22px] font-bold text-white mt-1">₦85,000</p><p className="text-amber-400 text-[11px] mt-1">Due by month end</p></DashboardCard>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <DashboardCard><CardTitle title="Recent Results" /><div className="space-y-2">{[{ subject: "Mathematics", score: 86, grade: "A1" }, { subject: "English", score: 78, grade: "B2" }, { subject: "Physics", score: 70, grade: "B3" }, { subject: "Chemistry", score: 80, grade: "B2" }].map((item, i) => (<div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]"><p className="text-white/70 text-[12px]">{item.subject}</p><div className="flex items-center gap-2"><p className="text-white/80 text-[12px] font-semibold">{item.score}%</p><span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-[10px] font-bold">{item.grade}</span></div></div>))}</div></DashboardCard>
        <DashboardCard><CardTitle title="Upcoming" /><div className="space-y-2.5"><div className="px-2.5 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20"><p className="text-amber-400 text-[11px] font-medium">📝 Math Exam</p><p className="text-white/50 text-[10px] mt-0.5">Tomorrow, 9:00 AM</p></div><div className="px-2.5 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20"><p className="text-emerald-400 text-[11px] font-medium">💰 Fee Payment</p><p className="text-white/50 text-[10px] mt-0.5">₦85,000 due by Friday</p></div></div></DashboardCard>
      </div>
    </>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const name = session?.user?.name?.split(" ")[0] || "Admin";
  const userRoles: string[] = (session?.user as any)?.roles?.map((r: any) => r.name) || [];

  const role = userRoles[0] || "ADMINISTRATOR";
  const roleDashboardMap: Record<string, { title: string; component: React.ReactNode }> = {
    OWNER: { title: "Owner Dashboard", component: <OwnerDashboard /> },
    ADMINISTRATOR: { title: "Admin Command Center", component: <AdminDashboard /> },
    PRINCIPAL: { title: "Principal Dashboard", component: <PrincipalDashboard /> },
    VICE_PRINCIPAL: { title: "Vice Principal Dashboard", component: <PrincipalDashboard /> },
    ACCOUNTANT: { title: "Finance Dashboard", component: <AccountantDashboard /> },
    AUDITOR: { title: "Audit Dashboard", component: <AuditorDashboard /> },
    TEACHER: { title: "Teacher Dashboard", component: <TeacherDashboard /> },
    LIBRARIAN: { title: "Library Dashboard", component: <LibrarianDashboard /> },
    PORTER: { title: "Hostel Dashboard", component: <PorterDashboard /> },
    ALUMNI: { title: "Alumni Portal", component: <AlumniDashboard /> },
    PARENT: { title: "Parent Portal", component: <ParentDashboard /> },
    STUDENT: { title: "Student Portal", component: <StudentDashboard /> },
  };

  const { title, component } = roleDashboardMap[role] || roleDashboardMap.ADMINISTRATOR;

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-4">
      <motion.div variants={fadeIn} className="flex items-center justify-between">
        <h1 className="text-[20px] font-bold text-white/95">{title}</h1>
        <p className="text-white/30 text-[12px]">Welcome, {name}</p>
      </motion.div>
      {component}
    </motion.div>
  );
}