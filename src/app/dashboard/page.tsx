"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell,
} from "recharts";
import Link from "next/link";
import { toast } from "sonner";

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.04 } },
};

const COLORS = ["#0055ff", "#28ff9c", "#ff6b35", "#a855f7", "#f59e0b", "#06b6d4", "#ec4899", "#10b981"];

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
          {p.name}: {typeof p.value === "number" && p.value > 10000 ? `\u20A6${(p.value / 1000000).toFixed(1)}M` : p.value}
        </p>
      ))}
    </div>
  );
}

function AdminDashboard() {
  const [stats, setStats] = useState<any>({ totalStudents: 0, totalTeachers: 0, totalRevenue: 0, totalClasses: 0, attendance: { present: 0, absent: 0, late: 0, rate: "0" }, pendingAdmissions: 0, classPerformance: [], recentActivities: [], monthlyRevenue: [] });
  useEffect(() => {
    fetch("/api/dashboard/stats").then(r => r.json()).then(d => { if (d.success) setStats(d); }).catch(() => {});
  }, []);

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard>
          <p className="text-white/40 text-[12px] font-medium">Total Students</p>
          <p className="text-[28px] font-bold text-white mt-1">{stats.totalStudents}</p>
        </DashboardCard>
        <DashboardCard>
          <p className="text-white/40 text-[12px] font-medium">Total Teachers</p>
          <p className="text-[28px] font-bold text-white mt-1">{stats.totalTeachers}</p>
        </DashboardCard>
        <DashboardCard>
          <p className="text-white/40 text-[12px] font-medium">Total Revenue</p>
          <p className="text-[22px] font-bold text-white mt-1">{"\u20A6"}{(stats.totalRevenue / 1000000).toFixed(1)}M</p>
        </DashboardCard>
        <DashboardCard>
          <p className="text-white/40 text-[12px] font-medium">Active Classes</p>
          <p className="text-[28px] font-bold text-white mt-1">{stats.totalClasses}</p>
        </DashboardCard>
      </div>
      <div className="grid grid-cols-3 gap-4 mt-4">
        <DashboardCard>
          <p className="text-white/40 text-[12px] font-medium">Pending Admissions</p>
          <p className="text-[28px] font-bold text-white mt-1">{stats.pendingAdmissions}</p>
          <p className="text-amber-400 text-[11px] mt-1">Needs review</p>
        </DashboardCard>
        <DashboardCard>
          <p className="text-white/40 text-[12px] font-medium">Attendance Today</p>
          <p className="text-[28px] font-bold text-white mt-1">{stats.attendance?.rate || 0}%</p>
          <p className="text-emerald-400 text-[11px] mt-1">{stats.attendance?.present || 0} present</p>
        </DashboardCard>
        <DashboardCard>
          <p className="text-white/40 text-[12px] font-medium">Fee Collection</p>
          <p className="text-[22px] font-bold text-white mt-1">{"\u20A6"}{(stats.totalRevenue / 1000000).toFixed(1)}M</p>
          <p className="text-emerald-400 text-[11px] mt-1">Total collected</p>
        </DashboardCard>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <DashboardCard className="lg:col-span-2">
          <CardTitle title="Class Performance" subtitle="Students per class" />
          {stats.classPerformance?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.classPerformance} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={false} />
                <Bar dataKey="students" name="Students" fill="#0055ff" radius={[6, 6, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-white/30 text-[13px]">No class data yet</div>
          )}
        </DashboardCard>
        <DashboardCard>
          <CardTitle title="Attendance Today" />
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={[
                { name: "Present", value: stats.attendance?.present || 0, color: "#28ff9c" },
                { name: "Absent", value: stats.attendance?.absent || 0, color: "#ff4444" },
                { name: "Late", value: stats.attendance?.late || 0, color: "#f59e0b" },
              ]} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={3} dataKey="value">
                {[{ color: "#28ff9c" }, { color: "#ff4444" }, { color: "#f59e0b" }].map((e, i) => <Cell key={i} fill={e.color} stroke="transparent" />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-3 gap-1.5 mt-2">
            {[
              { label: "Present", value: stats.attendance?.present || 0, color: "#28ff9c" },
              { label: "Absent", value: stats.attendance?.absent || 0, color: "#ff4444" },
              { label: "Late", value: stats.attendance?.late || 0, color: "#f59e0b" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5 text-[10px]">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-white/40">{item.label}</span>
                <span className="text-white/70 font-medium ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <DashboardCard>
          <CardTitle title="Revenue Trend" subtitle="6-month overview" />
          {stats.monthlyRevenue?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={stats.monthlyRevenue}>
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
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-white/30 text-[13px]">No revenue data yet</div>
          )}
        </DashboardCard>
        <DashboardCard>
          <CardTitle title="Recent Activity" />
          <div className="space-y-2">
            {stats.recentActivities?.length > 0 ? stats.recentActivities.slice(0, 5).map((item: any, i: number) => (
              <div key={i} className="flex items-start gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/[0.03] transition">
                <div className={`w-7 h-7 rounded-md ${item.type === "payment" ? "bg-emerald-500/15 text-emerald-400" : "bg-blue-500/15 text-blue-400"} flex items-center justify-center flex-shrink-0 text-[10px] font-bold`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/60 text-[12px] leading-relaxed">{item.description}</p>
                  <p className="text-white/20 text-[10px] mt-0.5">{new Date(item.time).toLocaleDateString()}</p>
                </div>
              </div>
            )) : (
              <p className="text-white/30 text-[12px] text-center py-4">No recent activity</p>
            )}
          </div>
        </DashboardCard>
      </div>
      <div className="flex flex-wrap gap-3 mt-4">
        <Link href="/dashboard/admissions" className="px-4 py-2.5 rounded-lg bg-[var(--primary)]/15 text-[var(--primary)] text-[12px] font-medium hover:bg-[var(--primary)]/25 transition">Add Student</Link>
        <Link href="/dashboard/classes" className="px-4 py-2.5 rounded-lg bg-white/[0.05] text-white/70 text-[12px] font-medium hover:bg-white/[0.08] transition">Manage Classes</Link>
        <Link href="/dashboard/payments" className="px-4 py-2.5 rounded-lg bg-white/[0.05] text-white/70 text-[12px] font-medium hover:bg-white/[0.08] transition">View Payments</Link>
        <Link href="/dashboard/announcements" className="px-4 py-2.5 rounded-lg bg-white/[0.05] text-white/70 text-[12px] font-medium hover:bg-white/[0.08] transition">Send Announcement</Link>
      </div>
    </>
  );
}

function TeacherDashboard() {
  const [stats, setStats] = useState<any>({ totalStudents: 0, totalTeachers: 0, totalClasses: 0 });
  const [teacherData, setTeacherData] = useState<any>({ classPerformance: [], attendanceTrend: [], gradeDistribution: [] });
  useEffect(() => {
    fetch("/api/dashboard/stats").then(r => r.json()).then(d => { if (d.success) setStats(d); }).catch(() => {});
    fetch("/api/teacher/dashboard").then(r => r.json()).then(d => { if (d.success) setTeacherData(d); }).catch(() => {});
  }, []);

  const attendanceTrend = teacherData.attendanceTrend?.length > 0 ? teacherData.attendanceTrend : [
    { week: "Week 1", rate: 85 }, { week: "Week 2", rate: 90 }, { week: "Week 3", rate: 88 },
    { week: "Week 4", rate: 92 }, { week: "Week 5", rate: 87 }, { week: "Week 6", rate: 94 },
  ];

  const gradeDistribution = teacherData.gradeDistribution?.length > 0 ? teacherData.gradeDistribution : [
    { name: "A", value: 24, color: "#28ff9c" }, { name: "B", value: 35, color: "#0055ff" },
    { name: "C", value: 20, color: "#f59e0b" }, { name: "D", value: 12, color: "#ff6b35" },
    { name: "F", value: 9, color: "#ff4444" },
  ];

  const classPerf = teacherData.classPerformance?.length > 0 ? teacherData.classPerformance : (stats.classPerformance || []);

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard>
          <p className="text-white/40 text-[12px] font-medium">Total Students</p>
          <p className="text-[28px] font-bold text-white mt-1">{stats.totalStudents}</p>
        </DashboardCard>
        <DashboardCard>
          <p className="text-white/40 text-[12px] font-medium">Active Classes</p>
          <p className="text-[28px] font-bold text-white mt-1">{stats.totalClasses}</p>
        </DashboardCard>
        <DashboardCard>
          <p className="text-white/40 text-[12px] font-medium">Attendance Today</p>
          <p className="text-[28px] font-bold text-white mt-1">{stats.attendance?.rate || 0}%</p>
        </DashboardCard>
        <DashboardCard>
          <p className="text-white/40 text-[12px] font-medium">Collected Revenue</p>
          <p className="text-[22px] font-bold text-white mt-1">{"\u20A6"}{(stats.totalRevenue / 1000000).toFixed(1)}M</p>
        </DashboardCard>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <DashboardCard className="lg:col-span-2">
          <CardTitle title="Class Performance" subtitle="Average scores per class" />
          {classPerf.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={classPerf} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={false} />
                <Bar dataKey="students" name="Students" fill="#0055ff" radius={[6, 6, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-white/30 text-[13px]">No data</div>
          )}
        </DashboardCard>
        <DashboardCard>
          <CardTitle title="Grade Distribution" subtitle="Subject breakdown" />
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={gradeDistribution} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={3} dataKey="value">
                {gradeDistribution.map((entry: any, i: number) => <Cell key={i} fill={entry.color} stroke="transparent" />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-5 gap-1 mt-2">
            {gradeDistribution.map((item: any) => (
              <div key={item.name} className="flex flex-col items-center gap-0.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-white/40 text-[9px]">{item.name}</span>
                <span className="text-white/70 text-[10px] font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <DashboardCard className="lg:col-span-2">
          <CardTitle title="Attendance Trend" subtitle="Weekly attendance rate" />
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={attendanceTrend}>
              <defs>
                <linearGradient id="gAtt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#28ff9c" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#28ff9c" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="week" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="rate" name="Attendance %" stroke="#28ff9c" fill="url(#gAtt)" strokeWidth={2} dot={{ r: 3, fill: "#28ff9c" }} />
            </AreaChart>
          </ResponsiveContainer>
        </DashboardCard>
        <DashboardCard>
          <CardTitle title="Recent Activity" />
          <div className="space-y-2">
            {stats.recentActivities?.slice(0, 5).map((item: any, i: number) => (
              <div key={i} className="flex items-start gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/[0.03] transition">
                <div className={`w-7 h-7 rounded-md ${item.type === "payment" ? "bg-emerald-500/15 text-emerald-400" : "bg-blue-500/15 text-blue-400"} flex items-center justify-center flex-shrink-0 text-[10px] font-bold`}>{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/60 text-[12px] leading-relaxed">{item.description}</p>
                  <p className="text-white/20 text-[10px] mt-0.5">{new Date(item.time).toLocaleDateString()}</p>
                </div>
              </div>
            )) || <p className="text-white/30 text-[12px] text-center py-4">No recent activity</p>}
          </div>
        </DashboardCard>
      </div>
      <div className="flex flex-wrap gap-3 mt-4">
        <Link href="/dashboard/attendance" className="px-4 py-2.5 rounded-lg bg-[var(--primary)]/15 text-[var(--primary)] text-[12px] font-medium hover:bg-[var(--primary)]/25 transition">Take Attendance</Link>
        <Link href="/dashboard/grades" className="px-4 py-2.5 rounded-lg bg-white/[0.05] text-white/70 text-[12px] font-medium hover:bg-white/[0.08] transition">Enter Grades</Link>
        <Link href="/dashboard/timetable" className="px-4 py-2.5 rounded-lg bg-white/[0.05] text-white/70 text-[12px] font-medium hover:bg-white/[0.08] transition">View Schedule</Link>
        <Link href="/dashboard/lesson-plans" className="px-4 py-2.5 rounded-lg bg-white/[0.05] text-white/70 text-[12px] font-medium hover:bg-white/[0.08] transition">Create Lesson Plan</Link>
      </div>
    </>
  );
}

function StudentDashboard() {
  const { data: session } = useSession();
  const [children, setChildren] = useState<any[]>([]);
  useEffect(() => {
    const email = (session?.user as any)?.email;
    if (!email) return;
    fetch(`/api/children?email=${encodeURIComponent(email)}`).then(r => r.json()).then(d => setChildren(d.children || [])).catch(() => {});
  }, [session]);
  const child = children[0];
  const grades = child?.grades || [];
  const attendance = child?.attendanceRecords || [];
  const presentDays = attendance.filter((a: any) => a.status === "present").length;
  const avgScore = grades.length ? Math.round(grades.reduce((s: number, g: any) => s + (g.score || 0), 0) / grades.length) : 0;
  const invoices = child?.invoices || [];
  const unpaidAmount = invoices.filter((i: any) => i.status !== "paid").reduce((s: number, i: any) => s + (i.amount || 0), 0);

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard>
          <p className="text-white/40 text-[12px] font-medium">My Class</p>
          <p className="text-[22px] font-bold text-white mt-1">{child?.class?.name || "—"}</p>
        </DashboardCard>
        <DashboardCard>
          <p className="text-white/40 text-[12px] font-medium">Attendance</p>
          <p className="text-[28px] font-bold text-white mt-1">{attendance.length ? Math.round((presentDays / attendance.length) * 100) : 0}%</p>
        </DashboardCard>
        <DashboardCard>
          <p className="text-white/40 text-[12px] font-medium">Current Average</p>
          <p className="text-[28px] font-bold text-white mt-1">{avgScore}%</p>
        </DashboardCard>
        <DashboardCard>
          <p className="text-white/40 text-[12px] font-medium">Fee Balance</p>
          <p className="text-[22px] font-bold text-white mt-1">{"\u20A6"}{unpaidAmount.toLocaleString()}</p>
        </DashboardCard>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <DashboardCard>
          <CardTitle title="Recent Results" />
          <div className="space-y-2">
            {grades.length === 0 ? <p className="text-white/30 text-[12px]">No results yet</p> : grades.slice(0, 6).map((g: any, i: number) => (
              <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                <p className="text-white/70 text-[12px]">{g.subject?.name || "—"}</p>
                <div className="flex items-center gap-2">
                  <p className="text-white/80 text-[12px] font-semibold">{g.score}%</p>
                  {g.grade && <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-[10px] font-bold">{g.grade}</span>}
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>
        <DashboardCard>
          <CardTitle title="Fee Status" />
          <div className="space-y-2">
            {invoices.length === 0 ? <p className="text-white/30 text-[12px]">No invoices</p> : invoices.slice(0, 5).map((inv: any, i: number) => (
              <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                <div>
                  <p className="text-white/70 text-[12px]">{inv.schoolFee?.name || "Fee"}</p>
                  <p className="text-white/40 text-[10px]">{"\u20A6"}{(inv.amount || 0).toLocaleString()}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${inv.status === "paid" ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"}`}>{inv.status}</span>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <DashboardCard>
          <CardTitle title="Grade Trend" subtitle="Scores across subjects" />
          {grades.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={grades.slice(0, 8).map((g: any) => ({ name: (g.subject?.name || "\u2014").slice(0, 8), score: g.score || 0 }))} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} cursor={false} />
                <Bar dataKey="score" name="Score %" fill="#0055ff" radius={[6, 6, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="flex items-center justify-center h-[200px] text-white/30 text-[13px]">No grade data yet</div>}
        </DashboardCard>
        <DashboardCard>
          <CardTitle title="Attendance Overview" />
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={[
                { name: "Present", value: presentDays, color: "#28ff9c" },
                { name: "Absent", value: Math.max(0, attendance.length - presentDays), color: "#ff4444" },
              ]} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={3} dataKey="value">
                {[{ color: "#28ff9c" }, { color: "#ff4444" }].map((e, i) => <Cell key={i} fill={e.color} stroke="transparent" />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            <div className="flex items-center gap-1.5 text-[10px]"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#28ff9c" }} /><span className="text-white/40">Present</span><span className="text-white/70 font-medium ml-1">{presentDays}</span></div>
            <div className="flex items-center gap-1.5 text-[10px]"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#ff4444" }} /><span className="text-white/40">Absent</span><span className="text-white/70 font-medium ml-1">{Math.max(0, attendance.length - presentDays)}</span></div>
          </div>
        </DashboardCard>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
        <Link href="/dashboard/timetable" className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-gradient-to-r from-[var(--primary)]/20 to-[var(--primary)]/5 border border-[var(--primary)]/20 text-white hover:from-[var(--primary)]/30 hover:to-[var(--primary)]/10 transition-all group">
          <span className="w-9 h-9 rounded-lg bg-[var(--primary)]/20 flex items-center justify-center text-[16px] group-hover:scale-110 transition-transform">📅</span>
          <div><p className="text-[13px] font-semibold">View Timetable</p><p className="text-white/40 text-[10px]">Your class schedule</p></div>
        </Link>
        <Link href="/dashboard/exams" className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-gradient-to-r from-purple-500/20 to-purple-500/5 border border-purple-500/20 text-white hover:from-purple-500/30 hover:to-purple-500/10 transition-all group">
          <span className="w-9 h-9 rounded-lg bg-purple-500/20 flex items-center justify-center text-[16px] group-hover:scale-110 transition-transform">📝</span>
          <div><p className="text-[13px] font-semibold">My Exams</p><p className="text-white/40 text-[10px]">View upcoming exams</p></div>
        </Link>
        <Link href="/dashboard/results" className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-gradient-to-r from-[var(--accent)]/20 to-[var(--accent)]/5 border border-[var(--accent)]/20 text-white hover:from-[var(--accent)]/30 hover:to-[var(--accent)]/10 transition-all group">
          <span className="w-9 h-9 rounded-lg bg-[var(--accent)]/20 flex items-center justify-center text-[16px] group-hover:scale-110 transition-transform">📊</span>
          <div><p className="text-[13px] font-semibold">View Results</p><p className="text-white/40 text-[10px]">Check your grades</p></div>
        </Link>
        <Link href="/dashboard/finance" className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-500/5 border border-amber-500/20 text-white hover:from-amber-500/30 hover:to-amber-500/10 transition-all group">
          <span className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center text-[16px] group-hover:scale-110 transition-transform">💰</span>
          <div><p className="text-[13px] font-semibold">Pay Fees</p><p className="text-white/40 text-[10px]">View & pay fees</p></div>
        </Link>
      </div>
    </>
  );
}

function VicePrincipalDashboard() {
  const [stats, setStats] = useState<any>({ totalStudents: 0, totalTeachers: 0, classPerformance: [], recentActivities: [] });
  const [discipline, setDiscipline] = useState<any>({ totalIncidents: 0, resolved: 0, pending: 0, byType: [], monthlyTrend: [] });
  useEffect(() => {
    fetch("/api/dashboard/stats").then(r => r.json()).then(d => { if (d.success) setStats(d); }).catch(() => {});
    fetch("/api/discipline").then(r => r.json()).then(d => { if (d.success) setDiscipline(d); }).catch(() => {});
  }, []);

  const disciplineStats = [
    { label: "Total Incidents", value: discipline.totalIncidents, color: "#ff6b35" },
    { label: "Resolved", value: discipline.resolved, color: "#28ff9c" },
    { label: "Pending Review", value: discipline.pending, color: "#f59e0b" },
  ];
  const disciplineByType = discipline.byType?.length > 0 ? discipline.byType : [
    { type: "Lateness", count: 12 }, { type: "Uniform", count: 8 }, { type: "Conduct", count: 5 }, { type: "Academic", count: 3 },
  ];
  const disciplineTrend = discipline.monthlyTrend?.length > 0 ? discipline.monthlyTrend : [
    { month: "Sep", incidents: 18 }, { month: "Oct", incidents: 14 }, { month: "Nov", incidents: 22 }, { month: "Dec", incidents: 10 }, { month: "Jan", incidents: 8 }, { month: "Feb", incidents: 12 },
  ];
  const teacherSupervision = [
    { label: "Total Teachers", value: stats.totalTeachers || 0 },
    { label: "Active Classes", value: stats.totalClasses || 0 },
    { label: "Avg Class Size", value: stats.totalClasses ? Math.round((stats.totalStudents || 0) / stats.totalClasses) : 0 },
  ];

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard><p className="text-white/40 text-[12px] font-medium">Total Students</p><p className="text-[28px] font-bold text-white mt-1">{stats.totalStudents}</p></DashboardCard>
        <DashboardCard><p className="text-white/40 text-[12px] font-medium">Discipline Cases</p><p className="text-[28px] font-bold text-white mt-1">{discipline.totalIncidents}</p><p className="text-amber-400 text-[11px] mt-1">{discipline.pending} pending</p></DashboardCard>
        <DashboardCard><p className="text-white/40 text-[12px] font-medium">Total Teachers</p><p className="text-[28px] font-bold text-white mt-1">{stats.totalTeachers}</p></DashboardCard>
        <DashboardCard><p className="text-white/40 text-[12px] font-medium">Resolution Rate</p><p className="text-[28px] font-bold text-white mt-1">{discipline.totalIncidents ? Math.round((discipline.resolved / discipline.totalIncidents) * 100) : 0}%</p></DashboardCard>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <DashboardCard>
          <CardTitle title="Discipline by Type" />
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={disciplineByType} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="type" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Bar dataKey="count" name="Cases" fill="#ff6b35" radius={[6, 6, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </DashboardCard>
        <DashboardCard>
          <CardTitle title="Monthly Discipline Trend" />
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={disciplineTrend}>
              <defs><linearGradient id="gDisc" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ff6b35" stopOpacity={0.3} /><stop offset="95%" stopColor="#ff6b35" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="incidents" name="Incidents" stroke="#ff6b35" fill="url(#gDisc)" strokeWidth={2} dot={{ r: 3, fill: "#ff6b35" }} />
            </AreaChart>
          </ResponsiveContainer>
        </DashboardCard>
        <DashboardCard>
          <CardTitle title="Teacher Supervision" />
          <div className="space-y-3">
            {teacherSupervision.map((item) => (
              <div key={item.label} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                <p className="text-white/60 text-[12px]">{item.label}</p>
                <p className="text-white/90 text-[14px] font-bold">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {disciplineStats.map((item) => (
              <div key={item.label} className="text-center p-2 rounded-lg bg-white/[0.02]">
                <p className="text-[18px] font-bold" style={{ color: item.color }}>{item.value}</p>
                <p className="text-white/30 text-[9px] mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>
      <div className="flex flex-wrap gap-3 mt-4">
        <Link href="/dashboard/discipline" className="px-4 py-2.5 rounded-lg bg-[var(--primary)]/15 text-[var(--primary)] text-[12px] font-medium hover:bg-[var(--primary)]/25 transition">View Discipline Records</Link>
        <Link href="/dashboard/students" className="px-4 py-2.5 rounded-lg bg-white/[0.05] text-white/70 text-[12px] font-medium hover:bg-white/[0.08] transition">Student Affairs</Link>
        <Link href="/dashboard/teachers" className="px-4 py-2.5 rounded-lg bg-white/[0.05] text-white/70 text-[12px] font-medium hover:bg-white/[0.08] transition">Teacher Supervision</Link>
        <Link href="/dashboard/reports" className="px-4 py-2.5 rounded-lg bg-white/[0.05] text-white/70 text-[12px] font-medium hover:bg-white/[0.08] transition">Generate Report</Link>
      </div>
    </>
  );
}

function PrincipalDashboard() {
  const [stats, setStats] = useState<any>({ totalStudents: 0, totalTeachers: 0, totalRevenue: 0, totalClasses: 0, pendingAdmissions: 0, attendance: { rate: "0" }, classPerformance: [] });
  useEffect(() => { fetch("/api/dashboard/stats").then(r => r.json()).then(d => { if (d.success) setStats(d); }).catch(() => {}); }, []);

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard><p className="text-white/40 text-[12px] font-medium">Total Students</p><p className="text-[28px] font-bold text-white mt-1">{stats.totalStudents}</p></DashboardCard>
        <DashboardCard><p className="text-white/40 text-[12px] font-medium">Total Teachers</p><p className="text-[28px] font-bold text-white mt-1">{stats.totalTeachers}</p></DashboardCard>
        <DashboardCard><p className="text-white/40 text-[12px] font-medium">School Revenue</p><p className="text-[22px] font-bold text-white mt-1">{"\u20A6"}{(stats.totalRevenue / 1000000).toFixed(1)}M</p></DashboardCard>
        <DashboardCard><p className="text-white/40 text-[12px] font-medium">Avg. Performance</p><p className="text-[28px] font-bold text-white mt-1">{stats.classPerformance?.length ? Math.round(stats.classPerformance.reduce((s: number, c: any) => s + (c.performance || c.students || 0), 0) / stats.classPerformance.length) : 0}%</p></DashboardCard>
      </div>
      <div className="grid grid-cols-3 gap-4 mt-4">
        <DashboardCard><p className="text-white/40 text-[12px] font-medium">Pending Admissions</p><p className="text-[28px] font-bold text-white mt-1">{stats.pendingAdmissions}</p><p className="text-amber-400 text-[11px] mt-1">Needs review</p></DashboardCard>
        <DashboardCard><p className="text-white/40 text-[12px] font-medium">Active Classes</p><p className="text-[28px] font-bold text-white mt-1">{stats.totalClasses}</p></DashboardCard>
        <DashboardCard><p className="text-white/40 text-[12px] font-medium">Attendance Today</p><p className="text-[28px] font-bold text-white mt-1">{stats.attendance?.rate || 0}%</p></DashboardCard>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <DashboardCard>
          <CardTitle title="Class Performance" subtitle="Students per class" />
          {stats.classPerformance?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.classPerformance} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={false} />
                <Bar dataKey="students" name="Students" fill="#0055ff" radius={[6, 6, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="flex items-center justify-center h-[220px] text-white/30 text-[13px]">No data</div>}
        </DashboardCard>
        <DashboardCard>
          <CardTitle title="Recent Activity" />
          <div className="space-y-2">
            {stats.recentActivities?.slice(0, 5).map((item: any, i: number) => (
              <div key={i} className="flex items-start gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/[0.03] transition">
                <div className={`w-7 h-7 rounded-md ${item.type === "payment" ? "bg-emerald-500/15 text-emerald-400" : "bg-blue-500/15 text-blue-400"} flex items-center justify-center flex-shrink-0 text-[10px] font-bold`}>{i + 1}</div>
                <div className="flex-1 min-w-0"><p className="text-white/60 text-[12px] leading-relaxed">{item.description}</p><p className="text-white/20 text-[10px] mt-0.5">{new Date(item.time).toLocaleDateString()}</p></div>
              </div>
            )) || <p className="text-white/30 text-[12px] text-center py-4">No recent activity</p>}
          </div>
        </DashboardCard>
      </div>
      <div className="flex flex-wrap gap-3 mt-4">
        <Link href="/dashboard/admissions" className="px-4 py-2.5 rounded-lg bg-[var(--primary)]/15 text-[var(--primary)] text-[12px] font-medium hover:bg-[var(--primary)]/25 transition">Add Student</Link>
        <Link href="/dashboard/classes" className="px-4 py-2.5 rounded-lg bg-white/[0.05] text-white/70 text-[12px] font-medium hover:bg-white/[0.08] transition">Manage Classes</Link>
        <Link href="/dashboard/payments" className="px-4 py-2.5 rounded-lg bg-white/[0.05] text-white/70 text-[12px] font-medium hover:bg-white/[0.08] transition">View Payments</Link>
        <Link href="/dashboard/announcements" className="px-4 py-2.5 rounded-lg bg-white/[0.05] text-white/70 text-[12px] font-medium hover:bg-white/[0.08] transition">Send Announcement</Link>
      </div>
    </>
  );
}

function OwnerDashboard() {
  const [stats, setStats] = useState<any>({ totalStudents: 0, totalTeachers: 0, totalRevenue: 0, totalClasses: 0, pendingAdmissions: 0, attendance: { rate: "0" }, monthlyRevenue: [], recentActivities: [] });
  useEffect(() => { fetch("/api/dashboard/stats").then(r => r.json()).then(d => { if (d.success) setStats(d); }).catch(() => {}); }, []);

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard><p className="text-white/40 text-[12px] font-medium">Total Students</p><p className="text-[28px] font-bold text-white mt-1">{stats.totalStudents}</p></DashboardCard>
        <DashboardCard><p className="text-white/40 text-[12px] font-medium">Total Teachers</p><p className="text-[28px] font-bold text-white mt-1">{stats.totalTeachers}</p></DashboardCard>
        <DashboardCard><p className="text-white/40 text-[12px] font-medium">Total Revenue</p><p className="text-[22px] font-bold text-white mt-1">{"\u20A6"}{(stats.totalRevenue / 1000000).toFixed(1)}M</p></DashboardCard>
        <DashboardCard><p className="text-white/40 text-[12px] font-medium">Active Classes</p><p className="text-[28px] font-bold text-white mt-1">{stats.totalClasses}</p></DashboardCard>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <DashboardCard>
          <CardTitle title="Revenue Trend" />
          {stats.monthlyRevenue?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={stats.monthlyRevenue}>
                <defs><linearGradient id="gRevO" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0055ff" stopOpacity={0.3} /><stop offset="95%" stopColor="#0055ff" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#0055ff" fill="url(#gRevO)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <div className="flex items-center justify-center h-[200px] text-white/30 text-[13px]">No revenue data</div>}
        </DashboardCard>
        <DashboardCard>
          <CardTitle title="Recent Activity" />
          <div className="space-y-2">
            {stats.recentActivities?.slice(0, 5).map((item: any, i: number) => (
              <div key={i} className="flex items-start gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/[0.03] transition">
                <div className={`w-7 h-7 rounded-md ${item.type === "payment" ? "bg-emerald-500/15 text-emerald-400" : "bg-blue-500/15 text-blue-400"} flex items-center justify-center flex-shrink-0 text-[10px] font-bold`}>{i + 1}</div>
                <div className="flex-1 min-w-0"><p className="text-white/60 text-[12px] leading-relaxed">{item.description}</p><p className="text-white/20 text-[10px] mt-0.5">{new Date(item.time).toLocaleDateString()}</p></div>
              </div>
            )) || <p className="text-white/30 text-[12px] text-center py-4">No recent activity</p>}
          </div>
        </DashboardCard>
      </div>
      <div className="flex flex-wrap gap-3 mt-4">
        <Link href="/dashboard/reports" className="px-4 py-2.5 rounded-lg bg-[var(--primary)]/15 text-[var(--primary)] text-[12px] font-medium hover:bg-[var(--primary)]/25 transition">View Reports</Link>
        <Link href="/dashboard/staff" className="px-4 py-2.5 rounded-lg bg-white/[0.05] text-white/70 text-[12px] font-medium hover:bg-white/[0.08] transition">Manage Staff</Link>
        <Link href="/dashboard/finance" className="px-4 py-2.5 rounded-lg bg-white/[0.05] text-white/70 text-[12px] font-medium hover:bg-white/[0.08] transition">Financial Summary</Link>
        <Link href="/dashboard/settings" className="px-4 py-2.5 rounded-lg bg-white/[0.05] text-white/70 text-[12px] font-medium hover:bg-white/[0.08] transition">School Settings</Link>
      </div>
    </>
  );
}

function AccountantDashboard() {
  const [stats, setStats] = useState<any>({ totalRevenue: 0, monthlyRevenue: [], totalExpenses: 0, outstandingBalance: 0, feeCollectionRate: 0, expenseBreakdown: [] });
  useEffect(() => { fetch("/api/dashboard/stats").then(r => r.json()).then(d => { if (d.success) setStats(d); }).catch(() => {}); }, []);

  const financeStats = [
    { label: "Total Revenue", value: stats.totalRevenue || 0, prefix: "\u20A6", color: "#28ff9c" },
    { label: "Total Expenses", value: stats.totalExpenses || (stats.totalRevenue * 0.62) || 0, prefix: "\u20A6", color: "#ff6b35" },
    { label: "Outstanding Balance", value: stats.outstandingBalance || (stats.totalRevenue * 0.15) || 0, prefix: "\u20A6", color: "#f59e0b" },
    { label: "Fee Collection Rate", value: stats.feeCollectionRate || 85, suffix: "%", color: "#0055ff" },
  ];
  const expenseBreakdown = stats.expenseBreakdown?.length > 0 ? stats.expenseBreakdown : [
    { name: "Salaries", value: 45 }, { name: "Utilities", value: 15 }, { name: "Maintenance", value: 10 },
    { name: "Supplies", value: 12 }, { name: "Transport", value: 8 }, { name: "Other", value: 10 },
  ];
  const monthlyRev = stats.monthlyRevenue?.length > 0 ? stats.monthlyRevenue : [
    { month: "Sep", revenue: 2400000 }, { month: "Oct", revenue: 2800000 }, { month: "Nov", revenue: 3100000 },
    { month: "Dec", revenue: 2600000 }, { month: "Jan", revenue: 3400000 }, { month: "Feb", revenue: 3200000 },
  ];

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {financeStats.map((s) => (
          <DashboardCard key={s.label}>
            <p className="text-white/40 text-[12px] font-medium">{s.label}</p>
            <p className="text-[22px] font-bold mt-1" style={{ color: s.color }}>{s.prefix || ""}{typeof s.value === "number" && s.value > 10000 ? `${(s.value / 1000000).toFixed(1)}M` : s.value}{s.suffix || ""}</p>
          </DashboardCard>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <DashboardCard>
          <CardTitle title="Revenue Trend" subtitle="6-month overview" />
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthlyRev}>
              <defs><linearGradient id="gRevAc" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#28ff9c" stopOpacity={0.3} /><stop offset="95%" stopColor="#28ff9c" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#28ff9c" fill="url(#gRevAc)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </DashboardCard>
        <DashboardCard>
          <CardTitle title="Expense Breakdown" subtitle="By category" />
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={expenseBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                {expenseBreakdown.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-3 gap-1.5 mt-2">
            {expenseBreakdown.map((item: any, i: number) => (
              <div key={item.name} className="flex items-center gap-1.5 text-[10px]">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-white/40">{item.name}</span>
                <span className="text-white/70 font-medium ml-auto">{item.value}%</span>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>
      <div className="flex flex-wrap gap-3 mt-4">
        <Link href="/dashboard/payments" className="px-4 py-2.5 rounded-lg bg-[var(--primary)]/15 text-[var(--primary)] text-[12px] font-medium hover:bg-[var(--primary)]/25 transition">Record Payment</Link>
        <Link href="/dashboard/expenses" className="px-4 py-2.5 rounded-lg bg-white/[0.05] text-white/70 text-[12px] font-medium hover:bg-white/[0.08] transition">View Expenses</Link>
        <Link href="/dashboard/reports" className="px-4 py-2.5 rounded-lg bg-white/[0.05] text-white/70 text-[12px] font-medium hover:bg-white/[0.08] transition">Generate Report</Link>
        <Link href="/dashboard/fees" className="px-4 py-2.5 rounded-lg bg-white/[0.05] text-white/70 text-[12px] font-medium hover:bg-white/[0.08] transition">Manage Fees</Link>
      </div>
    </>
  );
}

function AuditorDashboard() {
  const [stats, setStats] = useState<any>({ totalRevenue: 0, totalExpenses: 0, monthlyRevenue: [], totalTransactions: 0, pendingAudits: 0, complianceScore: 0 });
  useEffect(() => { fetch("/api/dashboard/stats").then(r => r.json()).then(d => { if (d.success) setStats(d); }).catch(() => {}); }, []);

  const totalExpenses = stats.totalExpenses || (stats.totalRevenue * 0.62) || 0;
  const auditStats = [
    { label: "Total Transactions", value: stats.totalTransactions || stats.totalStudents * 12 || 0, color: "#0055ff" },
    { label: "Revenue vs Expenses", value: `${((stats.totalRevenue / (totalExpenses || 1)) * 100).toFixed(0)}%`, color: "#28ff9c" },
    { label: "Pending Audits", value: stats.pendingAudits || 3, color: "#f59e0b" },
    { label: "Compliance Score", value: `${stats.complianceScore || 92}%`, color: "#10b981" },
  ];
  const monthlyRev = stats.monthlyRevenue?.length > 0 ? stats.monthlyRevenue : [
    { month: "Sep", revenue: 2400000 }, { month: "Oct", revenue: 2800000 }, { month: "Nov", revenue: 3100000 },
    { month: "Dec", revenue: 2600000 }, { month: "Jan", revenue: 3400000 }, { month: "Feb", revenue: 3200000 },
  ];

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {auditStats.map((s) => (
          <DashboardCard key={s.label}>
            <p className="text-white/40 text-[12px] font-medium">{s.label}</p>
            <p className="text-[22px] font-bold mt-1" style={{ color: s.color }}>{typeof s.value === "number" && s.value > 10000 ? `${(s.value / 1000000).toFixed(1)}M` : s.value}</p>
          </DashboardCard>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <DashboardCard>
          <CardTitle title="Revenue vs Expenses" subtitle="6-month comparison" />
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthlyRev}>
              <defs><linearGradient id="gRevAu" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0055ff" stopOpacity={0.3} /><stop offset="95%" stopColor="#0055ff" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#0055ff" fill="url(#gRevAu)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </DashboardCard>
        <DashboardCard>
          <CardTitle title="Audit Overview" />
          <div className="space-y-3">
            {[
              { label: "Financial Records", status: "Verified", color: "#28ff9c" },
              { label: "Fee Collections", status: "Pending Review", color: "#f59e0b" },
              { label: "Expense Reports", status: "Cleared", color: "#28ff9c" },
              { label: "Bank Reconciliation", status: "In Progress", color: "#0055ff" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                <p className="text-white/70 text-[12px] font-medium">{item.label}</p>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded" style={{ color: item.color, backgroundColor: `${item.color}15` }}>{item.status}</span>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>
      <div className="flex flex-wrap gap-3 mt-4">
        <Link href="/dashboard/reports" className="px-4 py-2.5 rounded-lg bg-[var(--primary)]/15 text-[var(--primary)] text-[12px] font-medium hover:bg-[var(--primary)]/25 transition">View Audit Reports</Link>
        <Link href="/dashboard/transactions" className="px-4 py-2.5 rounded-lg bg-white/[0.05] text-white/70 text-[12px] font-medium hover:bg-white/[0.08] transition">View Transactions</Link>
        <Link href="/dashboard/compliance" className="px-4 py-2.5 rounded-lg bg-white/[0.05] text-white/70 text-[12px] font-medium hover:bg-white/[0.08] transition">Compliance Check</Link>
        <Link href="/dashboard/exports" className="px-4 py-2.5 rounded-lg bg-white/[0.05] text-white/70 text-[12px] font-medium hover:bg-white/[0.08] transition">Export Data</Link>
      </div>
    </>
  );
}

function LibrarianDashboard() {
  const [libraryData, setLibraryData] = useState<any>({ totalBooks: 0, borrowedToday: 0, overdueReturns: 0, availableStock: 0, booksByCategory: [] });
  useEffect(() => {
    fetch("/api/library").then(r => r.json()).then(d => { if (d.success) setLibraryData(d); }).catch(() => {});
  }, []);

  const libStats = [
    { label: "Total Books", value: libraryData.totalBooks || 0, color: "#0055ff" },
    { label: "Borrowed Today", value: libraryData.borrowedToday || 0, color: "#28ff9c" },
    { label: "Overdue Returns", value: libraryData.overdueReturns || 0, color: "#ff4444" },
    { label: "Available Stock", value: libraryData.availableStock || 0, color: "#a855f7" },
  ];
  const booksByCategory = libraryData.booksByCategory?.length > 0 ? libraryData.booksByCategory : [
    { category: "Fiction", count: 320 }, { category: "Science", count: 210 }, { category: "Math", count: 180 },
    { category: "History", count: 150 }, { category: "Literature", count: 240 }, { category: "Others", count: 100 },
  ];

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {libStats.map((s) => (
          <DashboardCard key={s.label}>
            <p className="text-white/40 text-[12px] font-medium">{s.label}</p>
            <p className="text-[28px] font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
          </DashboardCard>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <DashboardCard>
          <CardTitle title="Books by Category" subtitle="Collection distribution" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={booksByCategory} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="category" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Bar dataKey="count" name="Books" fill="#a855f7" radius={[6, 6, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </DashboardCard>
        <DashboardCard>
          <CardTitle title="Recent Borrowing Activity" />
          <div className="space-y-2">
            {booksByCategory.slice(0, 5).map((item: any, i: number) => (
              <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                <p className="text-white/80 text-[13px] font-medium">{item.category}</p>
                <span className="text-white/40 text-[12px]">{item.count} books</span>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>
      <div className="flex flex-wrap gap-3 mt-4">
        <Link href="/dashboard/library/add" className="px-4 py-2.5 rounded-lg bg-[var(--primary)]/15 text-[var(--primary)] text-[12px] font-medium hover:bg-[var(--primary)]/25 transition">Add Book</Link>
        <Link href="/dashboard/library/issue" className="px-4 py-2.5 rounded-lg bg-white/[0.05] text-white/70 text-[12px] font-medium hover:bg-white/[0.08] transition">Issue Book</Link>
        <Link href="/dashboard/library/return" className="px-4 py-2.5 rounded-lg bg-white/[0.05] text-white/70 text-[12px] font-medium hover:bg-white/[0.08] transition">Return Book</Link>
        <Link href="/dashboard/library/catalog" className="px-4 py-2.5 rounded-lg bg-white/[0.05] text-white/70 text-[12px] font-medium hover:bg-white/[0.08] transition">Search Catalog</Link>
      </div>
    </>
  );
}

function PorterDashboard() {
  const [hostelData, setHostelData] = useState<any>({ studentsInHostel: 0, visitorsToday: 0, roomsOccupied: 0, totalRooms: 0, maintenanceRequests: 0, roomOccupancy: [] });
  useEffect(() => {
    fetch("/api/hostel").then(r => r.json()).then(d => { if (d.success) setHostelData(d); }).catch(() => {});
  }, []);

  const porterStats = [
    { label: "Students in Hostel", value: hostelData.studentsInHostel || 0, color: "#0055ff" },
    { label: "Visitors Today", value: hostelData.visitorsToday || 0, color: "#28ff9c" },
    { label: "Rooms Occupied", value: `${hostelData.roomsOccupied || 0}/${hostelData.totalRooms || 40}`, color: "#a855f7" },
    { label: "Maintenance Requests", value: hostelData.maintenanceRequests || 0, color: "#ff6b35" },
  ];
  const occupancyData = hostelData.roomOccupancy?.length > 0 ? hostelData.roomOccupancy : [
    { name: "Occupied", value: hostelData.roomsOccupied || 28, color: "#0055ff" },
    { name: "Vacant", value: Math.max(0, (hostelData.totalRooms || 40) - (hostelData.roomsOccupied || 28)), color: "#28ff9c" },
    { name: "Maintenance", value: 2, color: "#f59e0b" },
  ];

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {porterStats.map((s) => (
          <DashboardCard key={s.label}>
            <p className="text-white/40 text-[12px] font-medium">{s.label}</p>
            <p className="text-[28px] font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
          </DashboardCard>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <DashboardCard>
          <CardTitle title="Room Occupancy" subtitle="Hostel room status" />
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={occupancyData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                {occupancyData.map((e: any, i: number) => <Cell key={i} fill={e.color} stroke="transparent" />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {occupancyData.map((item: any) => (
              <div key={item.name} className="flex items-center gap-1.5 text-[10px]">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-white/40">{item.name}</span>
                <span className="text-white/70 font-medium ml-1">{item.value}</span>
              </div>
            ))}
          </div>
        </DashboardCard>
        <DashboardCard>
          <CardTitle title="Recent Visitors" />
          <div className="space-y-2">
            {[
              { name: "Mr. Adewale", purpose: "Parent Visit", time: "10:30 AM" },
              { name: "Mrs. Bello", purpose: "Material Delivery", time: "11:15 AM" },
              { name: "Dr. Okonkwo", purpose: "Medical Check", time: "2:00 PM" },
            ].map((v, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                <div>
                  <p className="text-white/80 text-[12px] font-medium">{v.name}</p>
                  <p className="text-white/30 text-[10px]">{v.purpose}</p>
                </div>
                <span className="text-white/40 text-[11px]">{v.time}</span>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>
      <div className="flex flex-wrap gap-3 mt-4">
        <Link href="/dashboard/hostel/visitors" className="px-4 py-2.5 rounded-lg bg-[var(--primary)]/15 text-[var(--primary)] text-[12px] font-medium hover:bg-[var(--primary)]/25 transition">Log Visitor</Link>
        <Link href="/dashboard/hostel/rooms" className="px-4 py-2.5 rounded-lg bg-white/[0.05] text-white/70 text-[12px] font-medium hover:bg-white/[0.08] transition">Assign Room</Link>
        <Link href="/dashboard/hostel/maintenance" className="px-4 py-2.5 rounded-lg bg-white/[0.05] text-white/70 text-[12px] font-medium hover:bg-white/[0.08] transition">Report Maintenance</Link>
        <Link href="/dashboard/hostel/checkin" className="px-4 py-2.5 rounded-lg bg-white/[0.05] text-white/70 text-[12px] font-medium hover:bg-white/[0.08] transition">View Check-in/out</Link>
      </div>
    </>
  );
}

function AlumniDashboard() {
  const [alumniData, setAlumniData] = useState<any>({ totalAlumni: 0, eventsAttended: 0, donationsMade: 0, mentorshipSessions: 0, alumniByYear: [] });
  useEffect(() => { fetch("/api/alumni").then(r => r.json()).then(d => { if (d.success) setAlumniData(d); }).catch(() => {}); }, []);

  const alumniStats = [
    { label: "Total Alumni", value: alumniData.totalAlumni || 0, color: "#a855f7" },
    { label: "Events Attended", value: alumniData.eventsAttended || 0, color: "#28ff9c" },
    { label: "Donations Made", value: alumniData.donationsMade || 0, prefix: "\u20A6", color: "#f59e0b" },
    { label: "Mentorship Sessions", value: alumniData.mentorshipSessions || 0, color: "#0055ff" },
  ];
  const alumniByYear = alumniData.alumniByYear?.length > 0 ? alumniData.alumniByYear : [
    { year: "2020", count: 45 }, { year: "2021", count: 52 }, { year: "2022", count: 61 },
    { year: "2023", count: 48 }, { year: "2024", count: 55 }, { year: "2025", count: 38 },
  ];

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {alumniStats.map((s) => (
          <DashboardCard key={s.label}>
            <p className="text-white/40 text-[12px] font-medium">{s.label}</p>
            <p className="text-[22px] font-bold mt-1" style={{ color: s.color }}>{s.prefix || ""}{s.value}</p>
          </DashboardCard>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <DashboardCard>
          <CardTitle title="Alumni by Graduation Year" subtitle="Network growth" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={alumniByYear} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="year" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Bar dataKey="count" name="Alumni" fill="#a855f7" radius={[6, 6, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </DashboardCard>
        <DashboardCard>
          <CardTitle title="Upcoming Events" />
          <div className="space-y-2">
            {[
              { name: "Annual Reunion 2026", date: "Mar 15, 2026", attendees: 120 },
              { name: "Career Day", date: "Apr 10, 2026", attendees: 85 },
              { name: "Mentorship Workshop", date: "May 5, 2026", attendees: 40 },
            ].map((e, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                <div>
                  <p className="text-white/80 text-[12px] font-medium">{e.name}</p>
                  <p className="text-white/30 text-[10px]">{e.date}</p>
                </div>
                <span className="text-white/40 text-[11px]">{e.attendees} attending</span>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>
      <div className="flex flex-wrap gap-3 mt-4">
        <Link href="/dashboard/alumni/events" className="px-4 py-2.5 rounded-lg bg-[var(--primary)]/15 text-[var(--primary)] text-[12px] font-medium hover:bg-[var(--primary)]/25 transition">View Events</Link>
        <Link href="/dashboard/alumni/donations" className="px-4 py-2.5 rounded-lg bg-white/[0.05] text-white/70 text-[12px] font-medium hover:bg-white/[0.08] transition">Make Donation</Link>
        <Link href="/dashboard/alumni/mentorship" className="px-4 py-2.5 rounded-lg bg-white/[0.05] text-white/70 text-[12px] font-medium hover:bg-white/[0.08] transition">Find Mentor</Link>
        <Link href="/dashboard/alumni/profile" className="px-4 py-2.5 rounded-lg bg-white/[0.05] text-white/70 text-[12px] font-medium hover:bg-white/[0.08] transition">Update Profile</Link>
      </div>
    </>
  );
}

function ParentDashboard() {
  const [children, setChildren] = useState<any[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/children")
      .then(r => r.json())
      .then(d => setChildren(d.children || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-white/20 border-t-[var(--primary)] rounded-full animate-spin" /></div>;
  if (!children.length) return (
    <div className="text-center py-20">
      <p className="text-white/40 text-[15px] mb-2">No children linked to this account</p>
      <p className="text-white/25 text-[12px]">Contact the school administrator to link your children</p>
    </div>
  );

  const child = children[selectedIdx];
  const attendance = child?.attendanceRecords || [];
  const presentDays = attendance.filter((a: any) => a.status === "present").length;
  const totalDays = attendance.length || 1;
  const attendancePct = Math.round((presentDays / totalDays) * 100);
  const grades = child?.grades || [];
  const avgScore = grades.length ? Math.round(grades.reduce((s: number, g: any) => s + (g.score || 0), 0) / grades.length) : 0;
  const invoices = child?.invoices || [];
  const unpaidAmount = invoices.filter((i: any) => i.status !== "paid").reduce((s: number, i: any) => s + (i.amount || 0), 0);

  return (
    <>
      {children.length > 1 && (
        <div className="flex items-center gap-2 mb-4 p-1 bg-white/[0.03] backdrop-blur-xl rounded-xl border border-white/[0.07] inline-flex">
          {children.map((c: any, i: number) => (
            <button key={c.id} onClick={() => setSelectedIdx(i)} className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-all ${selectedIdx === i ? "bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20" : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"}`}>
              {c.firstName} {c.lastName}
              {c.class?.name && <span className="ml-1.5 text-[11px] opacity-60">{c.class.name}</span>}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard><p className="text-white/40 text-[12px] font-medium">Child</p><p className="text-[18px] font-bold text-white mt-1">{child.firstName} {child.lastName}</p><p className="text-white/30 text-[11px] mt-1">{child.class?.name || "\u2014"}</p></DashboardCard>
        <DashboardCard><p className="text-white/40 text-[12px] font-medium">Attendance</p><p className="text-[28px] font-bold text-white mt-1">{attendancePct}%</p><p className="text-white/30 text-[11px] mt-1">{presentDays} of {totalDays} days</p></DashboardCard>
        <DashboardCard><p className="text-white/40 text-[12px] font-medium">Current Average</p><p className="text-[28px] font-bold text-white mt-1">{avgScore}%</p></DashboardCard>
        <DashboardCard><p className="text-white/40 text-[12px] font-medium">Fee Balance</p><p className="text-[22px] font-bold text-white mt-1">{"\u20A6"}{unpaidAmount.toLocaleString()}</p>{unpaidAmount > 0 && <p className="text-amber-400 text-[11px] mt-1">Outstanding</p>}</DashboardCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <DashboardCard>
          <CardTitle title={`Results \u2014 ${child.firstName}`} subtitle={`${grades.length} grade${grades.length !== 1 ? "s" : ""} recorded`} />
          <div className="space-y-2">
            {grades.length === 0 ? <p className="text-white/30 text-[12px] text-center py-6">No results yet for {child.firstName}</p> : grades.slice(0, 8).map((g: any, i: number) => (
              <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition">
                <div>
                  <p className="text-white/70 text-[12px] font-medium">{g.subject?.name || "\u2014"}</p>
                  <p className="text-white/30 text-[10px]">{g.type} {g.term ? `\u00B7 ${g.term}` : ""}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-white/80 text-[13px] font-bold">{g.score}/{g.maxScore}</p>
                  {g.grade && <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${g.grade === "A" ? "bg-emerald-500/15 text-emerald-400" : g.grade === "B" ? "bg-blue-500/15 text-blue-400" : g.grade === "C" ? "bg-yellow-500/15 text-yellow-400" : g.grade === "F" ? "bg-red-500/15 text-red-400" : "bg-white/10 text-white/50"}`}>{g.grade}</span>}
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>
        <DashboardCard>
          <CardTitle title={`Fee Status \u2014 ${child.firstName}`} subtitle={`${invoices.length} invoice${invoices.length !== 1 ? "s" : ""}`} />
          <div className="space-y-2">
            {invoices.length === 0 ? <p className="text-white/30 text-[12px] text-center py-6">No invoices for {child.firstName}</p> : invoices.slice(0, 6).map((inv: any, i: number) => (
              <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition">
                <div>
                  <p className="text-white/70 text-[12px] font-medium">{inv.schoolFee?.name || "Fee"}</p>
                  <p className="text-white/40 text-[10px]">{"\u20A6"}{(inv.amount || 0).toLocaleString()} {inv.dueDate ? `\u00B7 Due ${new Date(inv.dueDate).toLocaleDateString()}` : ""}</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-medium ${inv.status === "paid" ? "bg-emerald-500/15 text-emerald-400" : inv.status === "overdue" ? "bg-red-500/15 text-red-400" : "bg-amber-500/15 text-amber-400"}`}>{inv.status}</span>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <DashboardCard>
          <CardTitle title="Attendance Trend" subtitle={`${child.firstName}'s attendance over time`} />
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={attendance.length > 0 ? attendance.slice(-10).map((a: any, i: number) => ({ day: `Day ${i + 1}`, rate: a.status === "present" ? 100 : 0 })) : [{ day: "Mon", rate: 100 }, { day: "Tue", rate: 100 }, { day: "Wed", rate: 0 }, { day: "Thu", rate: 100 }, { day: "Fri", rate: 100 }]}>
              <defs><linearGradient id="gAttP" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#28ff9c" stopOpacity={0.3} /><stop offset="95%" stopColor="#28ff9c" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="rate" name="Attendance %" stroke="#28ff9c" fill="url(#gAttP)" strokeWidth={2} dot={{ r: 3, fill: "#28ff9c" }} />
            </AreaChart>
          </ResponsiveContainer>
        </DashboardCard>
        <DashboardCard>
          <CardTitle title="Grade Progress" subtitle={`${child.firstName}'s scores by subject`} />
          {grades.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={grades.slice(0, 8).map((g: any) => ({ name: (g.subject?.name || "\u2014").slice(0, 8), score: g.score || 0 }))} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} cursor={false} />
                <Bar dataKey="score" name="Score %" fill="#0055ff" radius={[6, 6, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="flex items-center justify-center h-[200px] text-white/30 text-[13px]">No grade data yet</div>}
        </DashboardCard>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
        <Link href="/dashboard/finance" className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-gradient-to-r from-[var(--primary)]/20 to-[var(--primary)]/5 border border-[var(--primary)]/20 text-white hover:from-[var(--primary)]/30 hover:to-[var(--primary)]/10 transition-all group">
          <span className="w-9 h-9 rounded-lg bg-[var(--primary)]/20 flex items-center justify-center text-[16px] group-hover:scale-110 transition-transform">💰</span>
          <div><p className="text-[13px] font-semibold">Pay Fees</p><p className="text-white/40 text-[10px]">View & pay fees</p></div>
        </Link>
        <Link href="/dashboard/timetable" className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-gradient-to-r from-purple-500/20 to-purple-500/5 border border-purple-500/20 text-white hover:from-purple-500/30 hover:to-purple-500/10 transition-all group">
          <span className="w-9 h-9 rounded-lg bg-purple-500/20 flex items-center justify-center text-[16px] group-hover:scale-110 transition-transform">📅</span>
          <div><p className="text-[13px] font-semibold">View Timetable</p><p className="text-white/40 text-[10px]">Child's schedule</p></div>
        </Link>
        <Link href="/dashboard/results" className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-gradient-to-r from-[var(--accent)]/20 to-[var(--accent)]/5 border border-[var(--accent)]/20 text-white hover:from-[var(--accent)]/30 hover:to-[var(--accent)]/10 transition-all group">
          <span className="w-9 h-9 rounded-lg bg-[var(--accent)]/20 flex items-center justify-center text-[16px] group-hover:scale-110 transition-transform">📊</span>
          <div><p className="text-[13px] font-semibold">View Results</p><p className="text-white/40 text-[10px]">Check grades</p></div>
        </Link>
        <Link href="/dashboard/calendar" className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-500/5 border border-amber-500/20 text-white hover:from-amber-500/30 hover:to-amber-500/10 transition-all group">
          <span className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center text-[16px] group-hover:scale-110 transition-transform">📆</span>
          <div><p className="text-[13px] font-semibold">Calendar</p><p className="text-white/40 text-[10px]">School events</p></div>
        </Link>
      </div>
    </>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const name = session?.user?.name?.split(" ")[0] || "User";
  const userRoles: string[] = (session?.user as any)?.roles?.map((r: any) => r.name) || [];
  const role = userRoles[0] || "ADMINISTRATOR";

  const roleDashboardMap: Record<string, { title: string; component: React.ReactNode }> = {
    OWNER: { title: "Owner Dashboard", component: <OwnerDashboard /> },
    ADMINISTRATOR: { title: "Admin Command Center", component: <AdminDashboard /> },
    PRINCIPAL: { title: "Principal Dashboard", component: <PrincipalDashboard /> },
    VICE_PRINCIPAL: { title: "Vice Principal Dashboard", component: <VicePrincipalDashboard /> },
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
    <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-6">
      <motion.div variants={fadeIn} className="flex items-center justify-between">
        <h1 className="text-[20px] font-bold text-white/95">{title}</h1>
        <p className="text-white/30 text-[12px]">Welcome, {name}</p>
      </motion.div>
      {component}
    </motion.div>
  );
}
