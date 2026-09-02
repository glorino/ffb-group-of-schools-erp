"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { formatCurrency, formatCurrencyCompact, SCHOOL_CONFIG } from "@/lib/school-config";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell,
} from "recharts";
import Link from "next/link";
import { toast } from "sonner";
import { X, Loader2, DollarSign } from "lucide-react";

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
    <div className={`dashboard-card ${className}`}>
      {children}
    </div>
  );
}

function CardTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h3 className="text-[#1a1a2e] font-semibold text-[14px]">{title}</h3>
      {subtitle && <p className="text-[#64748b] text-[11px] mt-0.5">{subtitle}</p>}
    </div>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#e2e8f0] rounded-lg px-3 py-2 shadow-lg">
      <p className="text-[#64748b] text-[10px] font-medium mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-[#1a1a2e] text-[12px] font-semibold">
          {p.name}: {typeof p.value === "number" && p.value > 10000 ? formatCurrencyCompact(p.value) : p.value}
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
      <div className="stats-grid-4">
        <DashboardCard>
          <p className="text-[#64748b] text-[12px] font-medium">Total Students</p>
          <p className="text-[28px] font-bold text-[#1a1a2e] mt-1">{stats.totalStudents}</p>
        </DashboardCard>
        <DashboardCard>
          <p className="text-[#64748b] text-[12px] font-medium">Total Teachers</p>
          <p className="text-[28px] font-bold text-[#1a1a2e] mt-1">{stats.totalTeachers}</p>
        </DashboardCard>
        <DashboardCard>
          <p className="text-[#64748b] text-[12px] font-medium">Total Revenue</p>
          <p className="text-[22px] font-bold text-[#1a1a2e] mt-1">{formatCurrencyCompact(stats.totalRevenue)}</p>
        </DashboardCard>
        <DashboardCard>
          <p className="text-[#64748b] text-[12px] font-medium">Active Classes</p>
          <p className="text-[28px] font-bold text-[#1a1a2e] mt-1">{stats.totalClasses}</p>
        </DashboardCard>
      </div>
      <div className="stats-grid-3">
        <DashboardCard>
          <p className="text-[#64748b] text-[12px] font-medium">Pending Admissions</p>
          <p className="text-[28px] font-bold text-[#1a1a2e] mt-1">{stats.pendingAdmissions}</p>
          <p className="text-[#ffd700] text-[11px] mt-1">Needs review</p>
        </DashboardCard>
        <DashboardCard>
          <p className="text-[#64748b] text-[12px] font-medium">Attendance Today</p>
          <p className="text-[28px] font-bold text-[#1a1a2e] mt-1">{stats.attendance?.rate || 0}%</p>
          <p className="text-[#22c55e] text-[11px] mt-1">{stats.attendance?.present || 0} present</p>
        </DashboardCard>
        <DashboardCard>
          <p className="text-[#64748b] text-[12px] font-medium">Fee Collection</p>
          <p className="text-[22px] font-bold text-[#1a1a2e] mt-1">{formatCurrencyCompact(stats.totalRevenue)}</p>
          <p className="text-[#22c55e] text-[11px] mt-1">Total collected</p>
        </DashboardCard>
      </div>
      <div className="charts-grid">
        <DashboardCard>
          <CardTitle title="Class Performance" subtitle="Students per class" />
          {stats.classPerformance?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.classPerformance} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={false} />
                <Bar dataKey="students" name="Students" fill="#0055ff" radius={[6, 6, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-[#94a3b8] text-[13px]">No class data yet</div>
          )}
        </DashboardCard>
        <DashboardCard>
          <CardTitle title="Attendance Today" />
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={[
                { name: "Present", value: stats.attendance?.present || 0, color: "#10b981" },
                { name: "Absent", value: stats.attendance?.absent || 0, color: "#ef4444" },
                { name: "Late", value: stats.attendance?.late || 0, color: "#f59e0b" },
              ]} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={3} dataKey="value">
                {[{ color: "#10b981" }, { color: "#ef4444" }, { color: "#f59e0b" }].map((e, i) => <Cell key={i} fill={e.color} stroke="transparent" />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-3 gap-1.5 mt-2">
            {[
              { label: "Present", value: stats.attendance?.present || 0, color: "#10b981" },
              { label: "Absent", value: stats.attendance?.absent || 0, color: "#ef4444" },
              { label: "Late", value: stats.attendance?.late || 0, color: "#f59e0b" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5 text-[10px] min-w-0">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-[#64748b] truncate">{item.label}</span>
                <span className="text-[#475569] font-medium ml-auto flex-shrink-0">{item.value}</span>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>
      <div className="charts-grid-equal">
        <DashboardCard>
          <CardTitle title="Revenue Trend" subtitle="6-month overview" />
          {stats.monthlyRevenue?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={stats.monthlyRevenue}>
                <defs>
                  <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0055ff" stopOpacity={0.15} /><stop offset="95%" stopColor="#0055ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#0055ff" fill="url(#gRev)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-[#94a3b8] text-[13px]">No revenue data yet</div>
          )}
        </DashboardCard>
        <DashboardCard>
          <CardTitle title="Recent Activity" />
          <div className="space-y-2">
            {stats.recentActivities?.length > 0 ? stats.recentActivities.slice(0, 5).map((item: any, i: number) => (
              <div key={i} className="flex items-start gap-2.5 px-2.5 py-2 rounded-lg hover:bg-[#f1f5f9] transition min-w-0">
                <div className={`w-7 h-7 rounded-md ${item.type === "payment" ? "bg-[#dcfce7] text-[#16a34a]" : "bg-[#dbeafe] text-[#2563eb]"} flex items-center justify-center flex-shrink-0 text-[10px] font-bold`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#475569] text-[12px] leading-relaxed truncate">{item.description}</p>
                  <p className="text-[#94a3b8] text-[10px] mt-0.5">{new Date(item.time).toLocaleDateString()}</p>
                </div>
              </div>
            )) : (
              <p className="text-[#94a3b8] text-[12px] text-center py-4">No recent activity</p>
            )}
          </div>
        </DashboardCard>
      </div>
      <div className="stats-grid-4">
        <Link href="/dashboard/admissions" className="flex items-center gap-3 flex-wrap px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-[#0055ff] to-[#0033cc] border border-[#1a1a2e] text-[#ffffff] hover:bg-gradient-to-r transition-all group">
          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#1a1a2e] flex items-center justify-center text-[14px] sm:text-[16px] group-hover:scale-110 transition-transform shrink-0">➕</span>
          <div className="min-w-0"><p className="text-[12px] sm:text-[13px] font-semibold truncate">Add Student</p><p className="text-[#ffffff] text-[9px] sm:text-[10px]">New admissions</p></div>
        </Link>
        <Link href="/dashboard/classes" className="flex items-center gap-3 flex-wrap px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-[#1e40af] to-[#1e3a8a] border border-[#1a1a2e] text-[#ffffff] hover:bg-gradient-to-r transition-all group">
          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#1a1a2e] flex items-center justify-center text-[14px] sm:text-[16px] group-hover:scale-110 transition-transform shrink-0">🏫</span>
          <div className="min-w-0"><p className="text-[12px] sm:text-[13px] font-semibold truncate">Manage Classes</p><p className="text-[#ffffff] text-[9px] sm:text-[10px]">Organize classes</p></div>
        </Link>
        <Link href="/dashboard/payments" className="flex items-center gap-3 flex-wrap px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-[#059669] to-[#06b6d4] border border-[#1a1a2e] text-[#ffffff] hover:bg-gradient-to-r transition-all group">
          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#1a1a2e] flex items-center justify-center text-[14px] sm:text-[16px] group-hover:scale-110 transition-transform shrink-0">💰</span>
          <div className="min-w-0"><p className="text-[12px] sm:text-[13px] font-semibold truncate">View Payments</p><p className="text-[#ffffff] text-[9px] sm:text-[10px]">Fee records</p></div>
        </Link>
        <Link href="/dashboard/announcements" className="flex items-center gap-3 flex-wrap px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-[#0055ff] to-[#3b82f6] border border-[#1a1a2e] text-[#ffffff] hover:bg-gradient-to-r transition-all group">
          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#1a1a2e] flex items-center justify-center text-[14px] sm:text-[16px] group-hover:scale-110 transition-transform shrink-0">📢</span>
          <div className="min-w-0"><p className="text-[12px] sm:text-[13px] font-semibold truncate">Send Announcement</p><p className="text-[#ffffff] text-[9px] sm:text-[10px]">Broadcast to all</p></div>
        </Link>
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

  const attendanceTrend = teacherData.attendanceTrend?.length > 0 ? teacherData.attendanceTrend : [];

  const gradeDistribution = teacherData.gradeDistribution?.length > 0 ? teacherData.gradeDistribution : [];

  const classPerf = teacherData.classPerformance?.length > 0 ? teacherData.classPerformance : (stats.classPerformance || []);

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard>
          <p className="text-[#64748b] text-[12px] font-medium">Total Students</p>
          <p className="text-[28px] font-bold text-[#1a1a2e] mt-1">{stats.totalStudents}</p>
        </DashboardCard>
        <DashboardCard>
          <p className="text-[#64748b] text-[12px] font-medium">Active Classes</p>
          <p className="text-[28px] font-bold text-[#1a1a2e] mt-1">{stats.totalClasses}</p>
        </DashboardCard>
        <DashboardCard>
          <p className="text-[#64748b] text-[12px] font-medium">Attendance Today</p>
          <p className="text-[28px] font-bold text-[#1a1a2e] mt-1">{stats.attendance?.rate || 0}%</p>
        </DashboardCard>
        <DashboardCard>
          <p className="text-[#64748b] text-[12px] font-medium">Collected Revenue</p>
          <p className="text-[22px] font-bold text-[#1a1a2e] mt-1">{formatCurrencyCompact(stats.totalRevenue)}</p>
        </DashboardCard>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <DashboardCard className="lg:col-span-2">
          <CardTitle title="Class Performance" subtitle="Average scores per class" />
          {classPerf.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={classPerf} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={false} />
                <Bar dataKey="students" name="Students" fill="#0055ff" radius={[6, 6, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-[#94a3b8] text-[13px]">No data</div>
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
                <span className="text-[#64748b] text-[9px]">{item.name}</span>
                <span className="text-[#475569] text-[10px] font-medium">{item.value}</span>
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
                  <stop offset="5%" stopColor="#28ff9c" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#28ff9c" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="week" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="rate" name="Attendance %" stroke="#28ff9c" fill="url(#gAtt)" strokeWidth={2} dot={{ r: 3, fill: "#28ff9c" }} />
            </AreaChart>
          </ResponsiveContainer>
        </DashboardCard>
        <DashboardCard>
          <CardTitle title="Recent Activity" />
          <div className="space-y-2">
            {stats.recentActivities?.slice(0, 5).map((item: any, i: number) => (
              <div key={i} className="flex items-start gap-2.5 px-2.5 py-2 rounded-lg hover:bg-[#f1f5f9] transition">
                <div className={`w-7 h-7 rounded-md ${item.type === "payment" ? "bg-[#dcfce7] text-[#16a34a]" : "bg-[#dbeafe] text-[#2563eb]"} flex items-center justify-center flex-shrink-0 text-[10px] font-bold`}>{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#475569] text-[12px] leading-relaxed">{item.description}</p>
                  <p className="text-[#94a3b8] text-[10px] mt-0.5">{new Date(item.time).toLocaleDateString()}</p>
                </div>
              </div>
            )) || <p className="text-[#94a3b8] text-[12px] text-center py-4">No recent activity</p>}
          </div>
        </DashboardCard>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mt-4">
        <Link href="/dashboard/attendance" className="flex items-center gap-3 flex-wrap px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r bg-[#dbeafe] border-[#bfdbfe] text-[#1a1a2e] hover:bg-[#bfdbfe] transition-all group">
          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#93c5fd] flex items-center justify-center text-[14px] sm:text-[16px] group-hover:scale-110 transition-transform shrink-0">✅</span>
          <div className="min-w-0"><p className="text-[12px] sm:text-[13px] font-semibold truncate">Take Attendance</p><p className="text-[#64748b] text-[9px] sm:text-[10px]">Mark today's roll</p></div>
        </Link>
        <Link href="/dashboard/results" className="flex items-center gap-3 flex-wrap px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r bg-[#f3e8ff] border-[#e9d5ff] text-[#1a1a2e] hover:bg-[#e9d5ff] transition-all group">
          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#c4b5fd] flex items-center justify-center text-[14px] sm:text-[16px] group-hover:scale-110 transition-transform shrink-0">📝</span>
          <div className="min-w-0"><p className="text-[12px] sm:text-[13px] font-semibold truncate">Enter Grades</p><p className="text-[#64748b] text-[9px] sm:text-[10px]">Record student scores</p></div>
        </Link>
        <Link href="/dashboard/timetable" className="flex items-center gap-3 flex-wrap px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r bg-[#dcfce7] border-[#bbf7d0] text-[#1a1a2e] hover:bg-[#bbf7d0] transition-all group">
          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#86efac] flex items-center justify-center text-[14px] sm:text-[16px] group-hover:scale-110 transition-transform shrink-0">📅</span>
          <div className="min-w-0"><p className="text-[12px] sm:text-[13px] font-semibold truncate">View Schedule</p><p className="text-[#64748b] text-[9px] sm:text-[10px]">Your class timetable</p></div>
        </Link>
        <Link href="/dashboard/lesson-plans" className="flex items-center gap-3 flex-wrap px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r bg-[#fef3c7] border-[#fde68a] text-[#1a1a2e] hover:bg-[#fde68a] transition-all group">
          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#fcd34d] flex items-center justify-center text-[14px] sm:text-[16px] group-hover:scale-110 transition-transform shrink-0">📋</span>
          <div className="min-w-0"><p className="text-[12px] sm:text-[13px] font-semibold truncate">Create Lesson Plan</p><p className="text-[#64748b] text-[9px] sm:text-[10px]">Plan your lessons</p></div>
        </Link>
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
          <p className="text-[#64748b] text-[12px] font-medium">My Class</p>
          <p className="text-[22px] font-bold text-[#1a1a2e] mt-1">{child?.class?.name || "—"}</p>
        </DashboardCard>
        <DashboardCard>
          <p className="text-[#64748b] text-[12px] font-medium">Attendance</p>
          <p className="text-[28px] font-bold text-[#1a1a2e] mt-1">{attendance.length ? Math.round((presentDays / attendance.length) * 100) : 0}%</p>
        </DashboardCard>
        <DashboardCard>
          <p className="text-[#64748b] text-[12px] font-medium">Current Average</p>
          <p className="text-[28px] font-bold text-[#1a1a2e] mt-1">{avgScore}%</p>
        </DashboardCard>
        <DashboardCard>
          <p className="text-[#64748b] text-[12px] font-medium">Fee Balance</p>
          <p className="text-[22px] font-bold text-[#1a1a2e] mt-1">{formatCurrency(unpaidAmount)}</p>
        </DashboardCard>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <DashboardCard>
          <CardTitle title="Recent Results" />
          <div className="space-y-2">
            {grades.length === 0 ? <p className="text-[#94a3b8] text-[12px]">No results yet</p> : grades.slice(0, 6).map((g: any, i: number) => (
              <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
                <p className="text-[#475569] text-[12px]">{g.subject?.name || "—"}</p>
                <div className="flex items-center gap-3">
                  <p className="text-[#1a1a2e] text-[12px] font-semibold">{g.score}%</p>
                  {g.grade && <span className="px-2 py-0.5 rounded bg-[#dcfce7] text-[#16a34a] text-[10px] font-bold">{g.grade}</span>}
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>
        <DashboardCard>
          <CardTitle title="Fee Status" />
          <div className="space-y-2">
            {invoices.length === 0 ? <p className="text-[#94a3b8] text-[12px]">No invoices</p> : invoices.slice(0, 5).map((inv: any, i: number) => (
              <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
                <div>
                  <p className="text-[#475569] text-[12px]">{inv.schoolFee?.name || "Fee"}</p>
                    <p className="text-[#64748b] text-[10px]">{formatCurrency(inv.amount || 0)}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${inv.status === "paid" ? "bg-[#dcfce7] text-[#16a34a]" : "bg-[#fef3c7] text-[#d97706]"}`}>{inv.status}</span>
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
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} cursor={false} />
                <Bar dataKey="score" name="Score %" fill="#0055ff" radius={[6, 6, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="flex items-center justify-center h-[200px] text-[#94a3b8] text-[13px]">No grade data yet</div>}
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
            <div className="flex items-center gap-1.5 text-[10px]"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#28ff9c" }} /><span className="text-[#64748b]">Present</span><span className="text-[#475569] font-medium ml-1">{presentDays}</span></div>
            <div className="flex items-center gap-1.5 text-[10px]"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#ff4444" }} /><span className="text-[#64748b]">Absent</span><span className="text-[#475569] font-medium ml-1">{Math.max(0, attendance.length - presentDays)}</span></div>
          </div>
        </DashboardCard>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mt-4">
        <Link href="/dashboard/timetable" className="flex items-center gap-3 flex-wrap px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r bg-[#dbeafe] border-[#bfdbfe] text-[#1a1a2e] hover:bg-[#bfdbfe] transition-all group">
          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#93c5fd] flex items-center justify-center text-[14px] sm:text-[16px] group-hover:scale-110 transition-transform shrink-0">📅</span>
          <div className="min-w-0"><p className="text-[12px] sm:text-[13px] font-semibold truncate">View Timetable</p><p className="text-[#64748b] text-[9px] sm:text-[10px]">Your class schedule</p></div>
        </Link>
        <Link href="/dashboard/exams" className="flex items-center gap-3 flex-wrap px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r bg-[#f3e8ff] border-[#e9d5ff] text-[#1a1a2e] hover:bg-[#e9d5ff] transition-all group">
          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#c4b5fd] flex items-center justify-center text-[14px] sm:text-[16px] group-hover:scale-110 transition-transform shrink-0">📝</span>
          <div className="min-w-0"><p className="text-[12px] sm:text-[13px] font-semibold truncate">My Exams</p><p className="text-[#64748b] text-[9px] sm:text-[10px]">View upcoming exams</p></div>
        </Link>
        <Link href="/dashboard/results" className="flex items-center gap-3 flex-wrap px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r bg-[#dcfce7] border-[#bbf7d0] text-[#1a1a2e] hover:bg-[#bbf7d0] transition-all group">
          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#86efac] flex items-center justify-center text-[14px] sm:text-[16px] group-hover:scale-110 transition-transform shrink-0">📊</span>
          <div className="min-w-0"><p className="text-[12px] sm:text-[13px] font-semibold truncate">View Results</p><p className="text-[#64748b] text-[9px] sm:text-[10px]">Check your grades</p></div>
        </Link>
        <Link href="/dashboard/finance" className="flex items-center gap-3 flex-wrap px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r bg-[#fef3c7] border-[#fde68a] text-[#1a1a2e] hover:bg-[#fde68a] transition-all group">
          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#fcd34d] flex items-center justify-center text-[14px] sm:text-[16px] group-hover:scale-110 transition-transform shrink-0">💰</span>
          <div className="min-w-0"><p className="text-[12px] sm:text-[13px] font-semibold truncate">Pay Fees</p><p className="text-[#64748b] text-[9px] sm:text-[10px]">View & pay fees</p></div>
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
  const disciplineByType = discipline.byType?.length > 0 ? discipline.byType : [];
  const disciplineTrend = discipline.monthlyTrend?.length > 0 ? discipline.monthlyTrend : [];
  const teacherSupervision = [
    { label: "Total Teachers", value: stats.totalTeachers || 0 },
    { label: "Active Classes", value: stats.totalClasses || 0 },
    { label: "Avg Class Size", value: stats.totalClasses ? Math.round((stats.totalStudents || 0) / stats.totalClasses) : 0 },
  ];

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard><p className="text-[#64748b] text-[12px] font-medium">Total Students</p><p className="text-[28px] font-bold text-[#1a1a2e] mt-1">{stats.totalStudents}</p></DashboardCard>
        <DashboardCard><p className="text-[#64748b] text-[12px] font-medium">Discipline Cases</p><p className="text-[28px] font-bold text-[#1a1a2e] mt-1">{discipline.totalIncidents}</p><p className="text-[#d97706] text-[11px] mt-1">{discipline.pending} pending</p></DashboardCard>
        <DashboardCard><p className="text-[#64748b] text-[12px] font-medium">Total Teachers</p><p className="text-[28px] font-bold text-[#1a1a2e] mt-1">{stats.totalTeachers}</p></DashboardCard>
        <DashboardCard><p className="text-[#64748b] text-[12px] font-medium">Resolution Rate</p><p className="text-[28px] font-bold text-[#1a1a2e] mt-1">{discipline.totalIncidents ? Math.round((discipline.resolved / discipline.totalIncidents) * 100) : 0}%</p></DashboardCard>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <DashboardCard>
          <CardTitle title="Discipline by Type" />
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={disciplineByType} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="type" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Bar dataKey="count" name="Cases" fill="#ff6b35" radius={[6, 6, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </DashboardCard>
        <DashboardCard>
          <CardTitle title="Monthly Discipline Trend" />
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={disciplineTrend}>
              <defs><linearGradient id="gDisc" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ff6b35" stopOpacity={0.15} /><stop offset="95%" stopColor="#ff6b35" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="incidents" name="Incidents" stroke="#ff6b35" fill="url(#gDisc)" strokeWidth={2} dot={{ r: 3, fill: "#ff6b35" }} />
            </AreaChart>
          </ResponsiveContainer>
        </DashboardCard>
        <DashboardCard>
          <CardTitle title="Teacher Supervision" />
          <div className="space-y-3">
            {teacherSupervision.map((item) => (
              <div key={item.label} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
                <p className="text-[#475569] text-[12px]">{item.label}</p>
                <p className="text-[#1a1a2e] text-[14px] font-bold">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
            {disciplineStats.map((item) => (
              <div key={item.label} className="text-center p-2 rounded-lg bg-[#f8fafc]">
                <p className="text-[18px] font-bold" style={{ color: item.color }}>{item.value}</p>
                <p className="text-[#94a3b8] text-[9px] mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mt-4">
        <Link href="/dashboard/discipline" className="flex items-center gap-3 flex-wrap px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl bg-[#dbeafe] border-[#bfdbfe] text-[#1a1a2e] hover:bg-[#bfdbfe] transition-all group">
          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#93c5fd] flex items-center justify-center text-[14px] sm:text-[16px] group-hover:scale-110 transition-transform shrink-0">📋</span>
          <div className="min-w-0"><p className="text-[12px] sm:text-[13px] font-semibold truncate">View Discipline Records</p><p className="text-[#64748b] text-[9px] sm:text-[10px]">Incident logs</p></div>
        </Link>
        <Link href="/dashboard/students" className="flex items-center gap-3 flex-wrap px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r bg-[#f3e8ff] border-[#e9d5ff] text-[#1a1a2e] hover:bg-[#e9d5ff] transition-all group">
          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#c4b5fd] flex items-center justify-center text-[14px] sm:text-[16px] group-hover:scale-110 transition-transform shrink-0">👥</span>
          <div className="min-w-0"><p className="text-[12px] sm:text-[13px] font-semibold truncate">Student Affairs</p><p className="text-[#64748b] text-[9px] sm:text-[10px]">Manage students</p></div>
        </Link>
        <Link href="/dashboard/teachers" className="flex items-center gap-3 flex-wrap px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r bg-[#dcfce7] border-[#bbf7d0] text-[#1a1a2e] hover:bg-[#bbf7d0] transition-all group">
          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#86efac] flex items-center justify-center text-[14px] sm:text-[16px] group-hover:scale-110 transition-transform shrink-0">👩‍🏫</span>
          <div className="min-w-0"><p className="text-[12px] sm:text-[13px] font-semibold truncate">Teacher Supervision</p><p className="text-[#64748b] text-[9px] sm:text-[10px]">Staff oversight</p></div>
        </Link>
        <Link href="/dashboard/analytics" className="flex items-center gap-3 flex-wrap px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r bg-[#fef3c7] border-[#fde68a] text-[#1a1a2e] hover:bg-[#fde68a] transition-all group">
          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#fcd34d] flex items-center justify-center text-[14px] sm:text-[16px] group-hover:scale-110 transition-transform shrink-0">📊</span>
          <div className="min-w-0"><p className="text-[12px] sm:text-[13px] font-semibold truncate">Generate Report</p><p className="text-[#64748b] text-[9px] sm:text-[10px]">Analytics & insights</p></div>
        </Link>
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
        <DashboardCard><p className="text-[#64748b] text-[12px] font-medium">Total Students</p><p className="text-[28px] font-bold text-[#1a1a2e] mt-1">{stats.totalStudents}</p></DashboardCard>
        <DashboardCard><p className="text-[#64748b] text-[12px] font-medium">Total Teachers</p><p className="text-[28px] font-bold text-[#1a1a2e] mt-1">{stats.totalTeachers}</p></DashboardCard>
        <DashboardCard><p className="text-[#64748b] text-[12px] font-medium">School Revenue</p><p className="text-[22px] font-bold text-[#1a1a2e] mt-1">{formatCurrencyCompact(stats.totalRevenue)}</p></DashboardCard>
        <DashboardCard><p className="text-[#64748b] text-[12px] font-medium">Avg. Performance</p><p className="text-[28px] font-bold text-[#1a1a2e] mt-1">{stats.classPerformance?.length ? Math.round(stats.classPerformance.reduce((s: number, c: any) => s + (c.performance || c.students || 0), 0) / stats.classPerformance.length) : 0}%</p></DashboardCard>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        <DashboardCard><p className="text-[#64748b] text-[12px] font-medium">Pending Admissions</p><p className="text-[28px] font-bold text-[#1a1a2e] mt-1">{stats.pendingAdmissions}</p><p className="text-[#d97706] text-[11px] mt-1">Needs review</p></DashboardCard>
        <DashboardCard><p className="text-[#64748b] text-[12px] font-medium">Active Classes</p><p className="text-[28px] font-bold text-[#1a1a2e] mt-1">{stats.totalClasses}</p></DashboardCard>
        <DashboardCard><p className="text-[#64748b] text-[12px] font-medium">Attendance Today</p><p className="text-[28px] font-bold text-[#1a1a2e] mt-1">{stats.attendance?.rate || 0}%</p></DashboardCard>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <DashboardCard>
          <CardTitle title="Class Performance" subtitle="Students per class" />
          {stats.classPerformance?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.classPerformance} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={false} />
                <Bar dataKey="students" name="Students" fill="#0055ff" radius={[6, 6, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="flex items-center justify-center h-[220px] text-[#94a3b8] text-[13px]">No data</div>}
        </DashboardCard>
        <DashboardCard>
          <CardTitle title="Recent Activity" />
          <div className="space-y-2">
            {stats.recentActivities?.slice(0, 5).map((item: any, i: number) => (
              <div key={i} className="flex items-start gap-2.5 px-2.5 py-2 rounded-lg hover:bg-[#f1f5f9] transition">
                <div className={`w-7 h-7 rounded-md ${item.type === "payment" ? "bg-[#dcfce7] text-[#16a34a]" : "bg-[#dbeafe] text-[#2563eb]"} flex items-center justify-center flex-shrink-0 text-[10px] font-bold`}>{i + 1}</div>
                <div className="flex-1 min-w-0"><p className="text-[#475569] text-[12px] leading-relaxed">{item.description}</p><p className="text-[#94a3b8] text-[10px] mt-0.5">{new Date(item.time).toLocaleDateString()}</p></div>
              </div>
            )) || <p className="text-[#94a3b8] text-[12px] text-center py-4">No recent activity</p>}
          </div>
        </DashboardCard>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mt-4">
        <Link href="/dashboard/admissions" className="flex items-center gap-3 flex-wrap px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r bg-[#dbeafe] border-[#bfdbfe] text-[#1a1a2e] hover:bg-[#bfdbfe] transition-all group">
          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#93c5fd] flex items-center justify-center text-[14px] sm:text-[16px] group-hover:scale-110 transition-transform shrink-0">➕</span>
          <div className="min-w-0"><p className="text-[12px] sm:text-[13px] font-semibold truncate">Add Student</p><p className="text-[#64748b] text-[9px] sm:text-[10px]">New admissions</p></div>
        </Link>
        <Link href="/dashboard/classes" className="flex items-center gap-3 flex-wrap px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r bg-[#f3e8ff] border-[#e9d5ff] text-[#1a1a2e] hover:bg-[#e9d5ff] transition-all group">
          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#c4b5fd] flex items-center justify-center text-[14px] sm:text-[16px] group-hover:scale-110 transition-transform shrink-0">🏫</span>
          <div className="min-w-0"><p className="text-[12px] sm:text-[13px] font-semibold truncate">Manage Classes</p><p className="text-[#64748b] text-[9px] sm:text-[10px]">Organize classes</p></div>
        </Link>
        <Link href="/dashboard/payments" className="flex items-center gap-3 flex-wrap px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r bg-[#dcfce7] border-[#bbf7d0] text-[#1a1a2e] hover:bg-[#bbf7d0] transition-all group">
          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#86efac] flex items-center justify-center text-[14px] sm:text-[16px] group-hover:scale-110 transition-transform shrink-0">💰</span>
          <div className="min-w-0"><p className="text-[12px] sm:text-[13px] font-semibold truncate">View Payments</p><p className="text-[#64748b] text-[9px] sm:text-[10px]">Fee records</p></div>
        </Link>
        <Link href="/dashboard/announcements" className="flex items-center gap-3 flex-wrap px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r bg-[#fef3c7] border-[#fde68a] text-[#1a1a2e] hover:bg-[#fde68a] transition-all group">
          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#fcd34d] flex items-center justify-center text-[14px] sm:text-[16px] group-hover:scale-110 transition-transform shrink-0">📢</span>
          <div className="min-w-0"><p className="text-[12px] sm:text-[13px] font-semibold truncate">Send Announcement</p><p className="text-[#64748b] text-[9px] sm:text-[10px]">Broadcast to all</p></div>
        </Link>
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
        <DashboardCard><p className="text-[#64748b] text-[12px] font-medium">Total Students</p><p className="text-[28px] font-bold text-[#1a1a2e] mt-1">{stats.totalStudents}</p></DashboardCard>
        <DashboardCard><p className="text-[#64748b] text-[12px] font-medium">Total Teachers</p><p className="text-[28px] font-bold text-[#1a1a2e] mt-1">{stats.totalTeachers}</p></DashboardCard>
        <DashboardCard><p className="text-[#64748b] text-[12px] font-medium">Total Revenue</p><p className="text-[22px] font-bold text-[#1a1a2e] mt-1">{formatCurrencyCompact(stats.totalRevenue)}</p></DashboardCard>
        <DashboardCard><p className="text-[#64748b] text-[12px] font-medium">Active Classes</p><p className="text-[28px] font-bold text-[#1a1a2e] mt-1">{stats.totalClasses}</p></DashboardCard>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <DashboardCard>
          <CardTitle title="Revenue Trend" />
          {stats.monthlyRevenue?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={stats.monthlyRevenue}>
                <defs><linearGradient id="gRevO" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0055ff" stopOpacity={0.15} /><stop offset="95%" stopColor="#0055ff" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#0055ff" fill="url(#gRevO)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <div className="flex items-center justify-center h-[200px] text-[#94a3b8] text-[13px]">No revenue data</div>}
        </DashboardCard>
        <DashboardCard>
          <CardTitle title="Recent Activity" />
          <div className="space-y-2">
            {stats.recentActivities?.slice(0, 5).map((item: any, i: number) => (
              <div key={i} className="flex items-start gap-2.5 px-2.5 py-2 rounded-lg hover:bg-[#f1f5f9] transition">
                <div className={`w-7 h-7 rounded-md ${item.type === "payment" ? "bg-[#dcfce7] text-[#16a34a]" : "bg-[#dbeafe] text-[#2563eb]"} flex items-center justify-center flex-shrink-0 text-[10px] font-bold`}>{i + 1}</div>
                <div className="flex-1 min-w-0"><p className="text-[#475569] text-[12px] leading-relaxed">{item.description}</p><p className="text-[#94a3b8] text-[10px] mt-0.5">{new Date(item.time).toLocaleDateString()}</p></div>
              </div>
            )) || <p className="text-[#94a3b8] text-[12px] text-center py-4">No recent activity</p>}
          </div>
        </DashboardCard>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mt-4">
        <Link href="/dashboard/analytics" className="flex items-center gap-3 flex-wrap px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r bg-[#dbeafe] border-[#bfdbfe] text-[#1a1a2e] hover:bg-[#bfdbfe] transition-all group">
          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#93c5fd] flex items-center justify-center text-[14px] sm:text-[16px] group-hover:scale-110 transition-transform shrink-0">📊</span>
          <div className="min-w-0"><p className="text-[12px] sm:text-[13px] font-semibold truncate">View Reports</p><p className="text-[#64748b] text-[9px] sm:text-[10px]">School analytics</p></div>
        </Link>
        <Link href="/dashboard/teachers" className="flex items-center gap-3 flex-wrap px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r bg-[#f3e8ff] border-[#e9d5ff] text-[#1a1a2e] hover:bg-[#e9d5ff] transition-all group">
          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#c4b5fd] flex items-center justify-center text-[14px] sm:text-[16px] group-hover:scale-110 transition-transform shrink-0">👩‍🏫</span>
          <div className="min-w-0"><p className="text-[12px] sm:text-[13px] font-semibold truncate">Manage Staff</p><p className="text-[#64748b] text-[9px] sm:text-[10px]">Teacher & staff</p></div>
        </Link>
        <Link href="/dashboard/finance" className="flex items-center gap-3 flex-wrap px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r bg-[#dcfce7] border-[#bbf7d0] text-[#1a1a2e] hover:bg-[#bbf7d0] transition-all group">
          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#86efac] flex items-center justify-center text-[14px] sm:text-[16px] group-hover:scale-110 transition-transform shrink-0">💰</span>
          <div className="min-w-0"><p className="text-[12px] sm:text-[13px] font-semibold truncate">Financial Summary</p><p className="text-[#64748b] text-[9px] sm:text-[10px]">Revenue & expenses</p></div>
        </Link>
        <Link href="/dashboard/settings" className="flex items-center gap-3 flex-wrap px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r bg-[#fef3c7] border-[#fde68a] text-[#1a1a2e] hover:bg-[#fde68a] transition-all group">
          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#fcd34d] flex items-center justify-center text-[14px] sm:text-[16px] group-hover:scale-110 transition-transform shrink-0">⚙️</span>
          <div className="min-w-0"><p className="text-[12px] sm:text-[13px] font-semibold truncate">School Settings</p><p className="text-[#64748b] text-[9px] sm:text-[10px]">Configure school</p></div>
        </Link>
      </div>
    </>
  );
}

function AccountantDashboard() {
  const [stats, setStats] = useState<any>({ totalRevenue: 0, monthlyRevenue: [], totalExpenses: 0, outstandingBalance: 0, feeCollectionRate: 0, expenseBreakdown: [] });
  useEffect(() => { fetch("/api/dashboard/stats").then(r => r.json()).then(d => { if (d.success) setStats(d); }).catch(() => {}); }, []);

  const financeStats = [
    { label: "Total Revenue", value: stats.totalRevenue || 0, prefix: SCHOOL_CONFIG.currencySymbol, color: "#28ff9c" },
    { label: "Total Expenses", value: stats.totalExpenses || 0, prefix: SCHOOL_CONFIG.currencySymbol, color: "#ff6b35" },
    { label: "Outstanding Balance", value: stats.outstandingBalance || 0, prefix: SCHOOL_CONFIG.currencySymbol, color: "#f59e0b" },
    { label: "Fee Collection Rate", value: stats.feeCollectionRate || 0, suffix: "%", color: "#0055ff" },
  ];
  const expenseBreakdown = stats.expenseBreakdown?.length > 0 ? stats.expenseBreakdown : [
    { name: "Salaries", value: 45 }, { name: "Utilities", value: 15 }, { name: "Maintenance", value: 10 },
    { name: "Supplies", value: 12 }, { name: "Transport", value: 8 }, { name: "Other", value: 10 },
  ];
  const monthlyRev = stats.monthlyRevenue?.length > 0 ? stats.monthlyRevenue : [];

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {financeStats.map((s) => (
          <DashboardCard key={s.label}>
            <p className="text-[#64748b] text-[12px] font-medium">{s.label}</p>
            <p className="text-[22px] font-bold mt-1" style={{ color: s.color }}>{s.prefix || ""}{typeof s.value === "number" && s.value > 10000 ? `${(s.value / 1000000).toFixed(1)}M` : s.value}{s.suffix || ""}</p>
          </DashboardCard>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <DashboardCard>
          <CardTitle title="Revenue Trend" subtitle="6-month overview" />
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthlyRev}>
              <defs><linearGradient id="gRevAc" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#28ff9c" stopOpacity={0.15} /><stop offset="95%" stopColor="#28ff9c" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
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
                <span className="text-[#64748b]">{item.name}</span>
                <span className="text-[#475569] font-medium ml-auto">{item.value}%</span>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mt-4">
        <Link href="/dashboard/payments" className="flex items-center gap-3 flex-wrap px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r bg-[#dbeafe] border-[#bfdbfe] text-[#1a1a2e] hover:bg-[#bfdbfe] transition-all group">
          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#93c5fd] flex items-center justify-center text-[14px] sm:text-[16px] group-hover:scale-110 transition-transform shrink-0">💳</span>
          <div className="min-w-0"><p className="text-[12px] sm:text-[13px] font-semibold truncate">Record Payment</p><p className="text-[#64748b] text-[9px] sm:text-[10px]">Log a payment</p></div>
        </Link>
        <Link href="/dashboard/expenses" className="flex items-center gap-3 flex-wrap px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r bg-[#f3e8ff] border-[#e9d5ff] text-[#1a1a2e] hover:bg-[#e9d5ff] transition-all group">
          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#c4b5fd] flex items-center justify-center text-[14px] sm:text-[16px] group-hover:scale-110 transition-transform shrink-0">🧾</span>
          <div className="min-w-0"><p className="text-[12px] sm:text-[13px] font-semibold truncate">View Expenses</p><p className="text-[#64748b] text-[9px] sm:text-[10px]">Expense records</p></div>
        </Link>
        <Link href="/dashboard/analytics" className="flex items-center gap-3 flex-wrap px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r bg-[#dcfce7] border-[#bbf7d0] text-[#1a1a2e] hover:bg-[#bbf7d0] transition-all group">
          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#86efac] flex items-center justify-center text-[14px] sm:text-[16px] group-hover:scale-110 transition-transform shrink-0">📊</span>
          <div className="min-w-0"><p className="text-[12px] sm:text-[13px] font-semibold truncate">Generate Report</p><p className="text-[#64748b] text-[9px] sm:text-[10px]">Financial reports</p></div>
        </Link>
        <Link href="/dashboard/finance" className="flex items-center gap-3 flex-wrap px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r bg-[#fef3c7] border-[#fde68a] text-[#1a1a2e] hover:bg-[#fde68a] transition-all group">
          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#fcd34d] flex items-center justify-center text-[14px] sm:text-[16px] group-hover:scale-110 transition-transform shrink-0">📑</span>
          <div className="min-w-0"><p className="text-[12px] sm:text-[13px] font-semibold truncate">Manage Fees</p><p className="text-[#64748b] text-[9px] sm:text-[10px]">Fee structures</p></div>
        </Link>
      </div>
    </>
  );
}

function AuditorDashboard() {
  const [stats, setStats] = useState<any>({ totalRevenue: 0, totalExpenses: 0, monthlyRevenue: [], totalTransactions: 0, pendingAudits: 0, complianceScore: 0 });
  useEffect(() => { fetch("/api/dashboard/stats").then(r => r.json()).then(d => { if (d.success) setStats(d); }).catch(() => {}); }, []);

  const totalExpenses = stats.totalExpenses || 0;
  const auditStats = [
    { label: "Total Transactions", value: stats.totalTransactions || 0, color: "#0055ff" },
    { label: "Revenue vs Expenses", value: `${totalExpenses > 0 ? ((stats.totalRevenue / totalExpenses) * 100).toFixed(0) : 0}%`, color: "#28ff9c" },
    { label: "Pending Audits", value: stats.pendingAudits || 0, color: "#f59e0b" },
    { label: "Compliance Score", value: `${stats.complianceScore || 0}%`, color: "#10b981" },
  ];
  const monthlyRev = stats.monthlyRevenue?.length > 0 ? stats.monthlyRevenue : [];

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {auditStats.map((s) => (
          <DashboardCard key={s.label}>
            <p className="text-[#64748b] text-[12px] font-medium">{s.label}</p>
            <p className="text-[22px] font-bold mt-1" style={{ color: s.color }}>{typeof s.value === "number" && s.value > 10000 ? `${(s.value / 1000000).toFixed(1)}M` : s.value}</p>
          </DashboardCard>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <DashboardCard>
          <CardTitle title="Revenue vs Expenses" subtitle="6-month comparison" />
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthlyRev}>
              <defs><linearGradient id="gRevAu" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0055ff" stopOpacity={0.15} /><stop offset="95%" stopColor="#0055ff" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#0055ff" fill="url(#gRevAu)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </DashboardCard>
        <DashboardCard>
          <CardTitle title="Audit Overview" />
          <div className="space-y-3">
            {[
              { label: "Financial Records", status: stats.financialRecordsStatus || "Verified", color: "#28ff9c" },
              { label: "Fee Collections", status: stats.feeCollectionsStatus || "Pending Review", color: "#f59e0b" },
              { label: "Expense Reports", status: stats.expenseReportsStatus || "Cleared", color: "#28ff9c" },
              { label: "Bank Reconciliation", status: stats.bankReconciliationStatus || "In Progress", color: "#0055ff" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
                <p className="text-[#475569] text-[12px] font-medium">{item.label}</p>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded" style={{ color: item.color, backgroundColor: `${item.color}15` }}>{item.status}</span>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mt-4">
        <Link href="/dashboard/analytics" className="flex items-center gap-3 flex-wrap px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r bg-[#dbeafe] border-[#bfdbfe] text-[#1a1a2e] hover:bg-[#bfdbfe] transition-all group">
          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#93c5fd] flex items-center justify-center text-[14px] sm:text-[16px] group-hover:scale-110 transition-transform shrink-0">📋</span>
          <div className="min-w-0"><p className="text-[12px] sm:text-[13px] font-semibold truncate">Analytics Overview</p><p className="text-[#64748b] text-[9px] sm:text-[10px]">Charts & trends</p></div>
        </Link>
        <Link href="/dashboard/payments" className="flex items-center gap-3 flex-wrap px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r bg-[#f3e8ff] border-[#e9d5ff] text-[#1a1a2e] hover:bg-[#e9d5ff] transition-all group">
          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#c4b5fd] flex items-center justify-center text-[14px] sm:text-[16px] group-hover:scale-110 transition-transform shrink-0">🔍</span>
          <div className="min-w-0"><p className="text-[12px] sm:text-[13px] font-semibold truncate">View Transactions</p><p className="text-[#64748b] text-[9px] sm:text-[10px]">All transactions</p></div>
        </Link>
        <Link href="/dashboard/activity-log" className="flex items-center gap-3 flex-wrap px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r bg-[#dcfce7] border-[#bbf7d0] text-[#1a1a2e] hover:bg-[#bbf7d0] transition-all group">
          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#86efac] flex items-center justify-center text-[14px] sm:text-[16px] group-hover:scale-110 transition-transform shrink-0">✅</span>
          <div className="min-w-0"><p className="text-[12px] sm:text-[13px] font-semibold truncate">Activity Log</p><p className="text-[#64748b] text-[9px] sm:text-[10px]">User actions audit</p></div>
        </Link>
        <Link href="/dashboard/expenses" className="flex items-center gap-3 flex-wrap px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r bg-[#fef3c7] border-[#fde68a] text-[#1a1a2e] hover:bg-[#fde68a] transition-all group">
          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#fcd34d] flex items-center justify-center text-[14px] sm:text-[16px] group-hover:scale-110 transition-transform shrink-0">📤</span>
          <div className="min-w-0"><p className="text-[12px] sm:text-[13px] font-semibold truncate">Expense Reports</p><p className="text-[#64748b] text-[9px] sm:text-[10px]">Review expenses</p></div>
        </Link>
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
            <p className="text-[#64748b] text-[12px] font-medium">{s.label}</p>
            <p className="text-[28px] font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
          </DashboardCard>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <DashboardCard>
          <CardTitle title="Books by Category" subtitle="Collection distribution" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={booksByCategory} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="category" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Bar dataKey="count" name="Books" fill="#a855f7" radius={[6, 6, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </DashboardCard>
        <DashboardCard>
          <CardTitle title="Recent Borrowing Activity" />
          <div className="space-y-2">
            {booksByCategory.slice(0, 5).map((item: any, i: number) => (
              <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
                <p className="text-[#1a1a2e] text-[13px] font-medium">{item.category}</p>
                <span className="text-[#64748b] text-[12px]">{item.count} books</span>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mt-4">
        <Link href="/dashboard/library" className="flex items-center gap-3 flex-wrap px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r bg-[#dbeafe] border-[#bfdbfe] text-[#1a1a2e] hover:bg-[#bfdbfe] transition-all group">
          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#93c5fd] flex items-center justify-center text-[14px] sm:text-[16px] group-hover:scale-110 transition-transform shrink-0">📚</span>
          <div className="min-w-0"><p className="text-[12px] sm:text-[13px] font-semibold truncate">Add Book</p><p className="text-[#64748b] text-[9px] sm:text-[10px]">New inventory</p></div>
        </Link>
        <Link href="/dashboard/library" className="flex items-center gap-3 flex-wrap px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r bg-[#f3e8ff] border-[#e9d5ff] text-[#1a1a2e] hover:bg-[#e9d5ff] transition-all group">
          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#c4b5fd] flex items-center justify-center text-[14px] sm:text-[16px] group-hover:scale-110 transition-transform shrink-0">📖</span>
          <div className="min-w-0"><p className="text-[12px] sm:text-[13px] font-semibold truncate">Issue Book</p><p className="text-[#64748b] text-[9px] sm:text-[10px]">Lend to students</p></div>
        </Link>
        <Link href="/dashboard/library" className="flex items-center gap-3 flex-wrap px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r bg-[#dcfce7] border-[#bbf7d0] text-[#1a1a2e] hover:bg-[#bbf7d0] transition-all group">
          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#86efac] flex items-center justify-center text-[14px] sm:text-[16px] group-hover:scale-110 transition-transform shrink-0">🔄</span>
          <div className="min-w-0"><p className="text-[12px] sm:text-[13px] font-semibold truncate">Return Book</p><p className="text-[#64748b] text-[9px] sm:text-[10px]">Process returns</p></div>
        </Link>
        <Link href="/dashboard/library" className="flex items-center gap-3 flex-wrap px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r bg-[#fef3c7] border-[#fde68a] text-[#1a1a2e] hover:bg-[#fde68a] transition-all group">
          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#fcd34d] flex items-center justify-center text-[14px] sm:text-[16px] group-hover:scale-110 transition-transform shrink-0">🔎</span>
          <div className="min-w-0"><p className="text-[12px] sm:text-[13px] font-semibold truncate">Search Catalog</p><p className="text-[#64748b] text-[9px] sm:text-[10px]">Find books</p></div>
        </Link>
      </div>
    </>
  );
}

function PorterDashboard() {
  const [hostelData, setHostelData] = useState<any>({ studentsInHostel: 0, visitorsToday: 0, roomsOccupied: 0, totalRooms: 0, maintenanceRequests: 0, roomOccupancy: [] });
  const [showVisitorLog, setShowVisitorLog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hostels, setHostels] = useState<any[]>([]);
  const [visitors, setVisitors] = useState<any[]>([]);
  const [visitorFilter, setVisitorFilter] = useState<string>("");
  const [visitorForm, setVisitorForm] = useState({ visitorName: "", visitorPhone: "", studentId: "", purpose: "", hostelId: "" });

  useEffect(() => {
    fetch("/api/hostel").then(r => r.json()).then(d => { if (d.success) setHostelData(d); }).catch(() => {});
    fetch("/api/hostel").then(r => r.json()).then(d => { if (d.hostels) setHostels(d.hostels); }).catch(() => {});
  }, []);

  const fetchVisitors = async (status?: string) => {
    try {
      const url = status ? `/api/hostel/visitors?status=${status}` : "/api/hostel/visitors";
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setVisitors(data.visitors);
    } catch {}
  };

  const handleLogVisitor = async () => {
    if (!visitorForm.visitorName || !visitorForm.visitorPhone || !visitorForm.studentId || !visitorForm.purpose || !visitorForm.hostelId) {
      toast.error("Please fill all fields");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/hostel/visitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(visitorForm),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Visitor logged successfully");
        setShowVisitorLog(false);
        setVisitorForm({ visitorName: "", visitorPhone: "", studentId: "", purpose: "", hostelId: "" });
        fetchVisitors();
      } else {
        toast.error(data.error || "Failed to log visitor");
      }
    } catch {
      toast.error("Failed to log visitor");
    } finally {
      setSubmitting(false);
    }
  };

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

  const displayVisitors = visitorFilter ? visitors : (hostelData.recentVisitors || []);

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {porterStats.map((s) => (
          <DashboardCard key={s.label}>
            <p className="text-[#64748b] text-[12px] font-medium">{s.label}</p>
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
                <span className="text-[#64748b]">{item.name}</span>
                <span className="text-[#475569] font-medium ml-1">{item.value}</span>
              </div>
            ))}
          </div>
        </DashboardCard>
        <DashboardCard>
          <div className="flex items-center justify-between mb-4">
            <CardTitle title={visitorFilter ? `Visitors (${visitorFilter})` : "Recent Visitors"} />
            {visitorFilter && (
              <button onClick={() => { setVisitorFilter(""); setVisitors([]); }} className="text-[#64748b] hover:text-[#1a1a2e] text-[11px]">Clear filter</button>
            )}
          </div>
          <div className="space-y-2">
            {visitorFilter ? (
              visitors.length > 0 ? visitors.slice(0, 10).map((v: any, i: number) => (
                <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
                  <div>
                    <p className="text-[#1a1a2e] text-[12px] font-medium">{v.visitorName}</p>
                    <p className="text-[#94a3b8] text-[10px]">{v.purpose} - {v.student?.firstName} {v.student?.lastName}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${v.status === "checked_in" ? "bg-[#dcfce7] text-[#16a34a]" : v.status === "checked_out" ? "bg-[#f1f5f9] text-[#64748b]" : "bg-[#fef3c7] text-[#d97706]"}`}>{v.status}</span>
                </div>
              )) : (
                <div className="text-center py-8 text-[#94a3b8] text-[12px]">No visitors found</div>
              )
            ) : (
              displayVisitors.length > 0 ? displayVisitors.slice(0, 5).map((v: any, i: number) => (
                <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
                  <div>
                    <p className="text-[#1a1a2e] text-[12px] font-medium">{v.name || v.visitorName || "Visitor"}</p>
                    <p className="text-[#94a3b8] text-[10px]">{v.purpose || "Visit"}</p>
                  </div>
                  <span className="text-[#64748b] text-[11px]">{v.time || "Today"}</span>
                </div>
              )) : (
                <div className="text-center py-8 text-[#94a3b8] text-[12px]">No recent visitors</div>
              )
            )}
          </div>
        </DashboardCard>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mt-4">
        <button onClick={() => setShowVisitorLog(true)} className="flex items-center gap-3 flex-wrap px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r bg-[#dbeafe] border-[#bfdbfe] text-[#1a1a2e] hover:bg-[#bfdbfe] transition-all group">
          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#93c5fd] flex items-center justify-center text-[14px] sm:text-[16px] group-hover:scale-110 transition-transform shrink-0">🚶</span>
          <div className="min-w-0"><p className="text-[12px] sm:text-[13px] font-semibold truncate">Log Visitor</p><p className="text-[#64748b] text-[9px] sm:text-[10px]">Visitor check-in</p></div>
        </button>
        <Link href="/dashboard/hostel" className="flex items-center gap-3 flex-wrap px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r bg-[#f3e8ff] border-[#e9d5ff] text-[#1a1a2e] hover:bg-[#e9d5ff] transition-all group">
          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#c4b5fd] flex items-center justify-center text-[14px] sm:text-[16px] group-hover:scale-110 transition-transform shrink-0">🛏️</span>
          <div className="min-w-0"><p className="text-[12px] sm:text-[13px] font-semibold truncate">Assign Room</p><p className="text-[#64748b] text-[9px] sm:text-[10px]">Room allocation</p></div>
        </Link>
        <Link href="/dashboard/hostel" className="flex items-center gap-3 flex-wrap px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r bg-[#dcfce7] border-[#bbf7d0] text-[#1a1a2e] hover:bg-[#bbf7d0] transition-all group">
          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#86efac] flex items-center justify-center text-[14px] sm:text-[16px] group-hover:scale-110 transition-transform shrink-0">🔧</span>
          <div className="min-w-0"><p className="text-[12px] sm:text-[13px] font-semibold truncate">Report Maintenance</p><p className="text-[#64748b] text-[9px] sm:text-[10px]">Request repairs</p></div>
        </Link>
        <button onClick={() => { setVisitorFilter("checked_in"); fetchVisitors("checked_in"); }} className="flex items-center gap-3 flex-wrap px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r bg-[#fef3c7] border-[#fde68a] text-[#1a1a2e] hover:bg-[#fde68a] transition-all group">
          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#fcd34d] flex items-center justify-center text-[14px] sm:text-[16px] group-hover:scale-110 transition-transform shrink-0">📋</span>
          <div className="min-w-0"><p className="text-[12px] sm:text-[13px] font-semibold truncate">View Check-in/out</p><p className="text-[#64748b] text-[9px] sm:text-[10px]">Movement logs</p></div>
        </button>
      </div>

      {showVisitorLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-8 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[#1a1a2e] font-semibold text-[16px]">Log Visitor</h3>
              <button onClick={() => setShowVisitorLog(false)} className="text-[#64748b] hover:text-[#475569]"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[#64748b] text-[11px] mb-1 block">Visitor Name</label>
                <input type="text" value={visitorForm.visitorName} onChange={e => setVisitorForm({ ...visitorForm, visitorName: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] text-[#1a1a2e] text-[13px] outline-none focus:border-[var(--primary)]/50" placeholder="Enter visitor name" />
              </div>
              <div>
                <label className="text-[#64748b] text-[11px] mb-1 block">Phone</label>
                <input type="text" value={visitorForm.visitorPhone} onChange={e => setVisitorForm({ ...visitorForm, visitorPhone: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] text-[#1a1a2e] text-[13px] outline-none focus:border-[var(--primary)]/50" placeholder="Enter phone number" />
              </div>
              <div>
                <label className="text-[#64748b] text-[11px] mb-1 block">Student ID</label>
                <input type="text" value={visitorForm.studentId} onChange={e => setVisitorForm({ ...visitorForm, studentId: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] text-[#1a1a2e] text-[13px] outline-none focus:border-[var(--primary)]/50" placeholder="Enter student ID" />
              </div>
              <div>
                <label className="text-[#64748b] text-[11px] mb-1 block">Purpose</label>
                <input type="text" value={visitorForm.purpose} onChange={e => setVisitorForm({ ...visitorForm, purpose: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] text-[#1a1a2e] text-[13px] outline-none focus:border-[var(--primary)]/50" placeholder="Reason for visit" />
              </div>
              <div>
                <label className="text-[#64748b] text-[11px] mb-1 block">Hostel</label>
                <select value={visitorForm.hostelId} onChange={e => setVisitorForm({ ...visitorForm, hostelId: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] text-[#1a1a2e] text-[13px] outline-none focus:border-[var(--primary)]/50">
                  <option value="">Select hostel</option>
                  {hostels.map((h: any) => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowVisitorLog(false)} className="flex-1 px-4 py-2.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] text-[#475569] text-[13px] hover:bg-[#f1f5f9] transition-colors">Cancel</button>
              <button onClick={handleLogVisitor} disabled={submitting} className="flex-1 px-4 py-2.5 rounded-lg bg-[var(--primary)] text-white text-[13px] font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Log Visitor
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function AlumniDashboard() {
  const { data: session } = useSession();
  const [alumniData, setAlumniData] = useState<any>({ totalAlumni: 0, eventsAttended: 0, donationsMade: 0, mentorshipSessions: 0, alumniByYear: [] });
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [donateForm, setDonateForm] = useState({ amount: "", purpose: "" });
  const [donateLoading, setDonateLoading] = useState(false);

  useEffect(() => { fetch("/api/alumni").then(r => r.json()).then(d => { if (d.success) setAlumniData(d); }).catch(() => {}); }, []);

  const alumniStats = [
    { label: "Total Alumni", value: alumniData.totalAlumni || 0, color: "#a855f7" },
    { label: "Events Attended", value: alumniData.eventsAttended || 0, color: "#28ff9c" },
    { label: "Donations Made", value: alumniData.donationsMade || 0, prefix: SCHOOL_CONFIG.currencySymbol, color: "#f59e0b" },
    { label: "Mentorship Sessions", value: alumniData.mentorshipSessions || 0, color: "#0055ff" },
  ];
  const alumniByYear = alumniData.alumniByYear?.length > 0 ? alumniData.alumniByYear : [
    { year: "2020", count: 45 }, { year: "2021", count: 52 }, { year: "2022", count: 61 },
    { year: "2023", count: 48 }, { year: "2024", count: 55 }, { year: "2025", count: 38 },
  ];

  const handleDonate = async () => {
    if (!donateForm.amount || parseFloat(donateForm.amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    const alumniId = (session?.user as any)?.id;
    if (!alumniId) {
      toast.error("Unable to identify alumni profile");
      return;
    }
    setDonateLoading(true);
    try {
      const res = await fetch("/api/alumni/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alumniId, amount: parseFloat(donateForm.amount), purpose: donateForm.purpose || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create donation");
      toast.success("Donation recorded successfully!");
      setShowDonateModal(false);
      setDonateForm({ amount: "", purpose: "" });
      fetch("/api/alumni").then(r => r.json()).then(d => { if (d.success) setAlumniData(d); }).catch(() => {});
    } catch (err: any) {
      toast.error(err.message || "Failed to create donation");
    } finally {
      setDonateLoading(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {alumniStats.map((s) => (
          <DashboardCard key={s.label}>
            <p className="text-[#64748b] text-[12px] font-medium">{s.label}</p>
            <p className="text-[22px] font-bold mt-1" style={{ color: s.color }}>{s.prefix || ""}{s.value}</p>
          </DashboardCard>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <DashboardCard>
          <CardTitle title="Alumni by Graduation Year" subtitle="Network growth" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={alumniByYear} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="year" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Bar dataKey="count" name="Alumni" fill="#a855f7" radius={[6, 6, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </DashboardCard>
        <DashboardCard>
          <CardTitle title="Upcoming Events" />
          <div className="space-y-2">
            {alumniData.upcomingEvents?.length > 0 ? alumniData.upcomingEvents.slice(0, 3).map((e: any, i: number) => (
              <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
                <div>
                  <p className="text-[#1a1a2e] text-[12px] font-medium">{e.name || e.title}</p>
                  <p className="text-[#94a3b8] text-[10px]">{e.date ? new Date(e.date).toLocaleDateString() : "TBA"}</p>
                </div>
                <span className="text-[#64748b] text-[11px]">{e.attendees || ""} {e.attendees ? "attending" : ""}</span>
              </div>
            )) : (
              <div className="text-center py-8 text-[#94a3b8] text-[12px]">No upcoming events</div>
            )}
          </div>
        </DashboardCard>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mt-4">
        <Link href="/dashboard/alumni" className="flex items-center gap-3 flex-wrap px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r bg-[#dbeafe] border-[#bfdbfe] text-[#1a1a2e] hover:bg-[#bfdbfe] transition-all group">
          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#93c5fd] flex items-center justify-center text-[14px] sm:text-[16px] group-hover:scale-110 transition-transform shrink-0">🎉</span>
          <div className="min-w-0"><p className="text-[12px] sm:text-[13px] font-semibold truncate">View Events</p><p className="text-[#64748b] text-[9px] sm:text-[10px]">Alumni gatherings</p></div>
        </Link>
        <button onClick={() => setShowDonateModal(true)} className="flex items-center gap-3 flex-wrap px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r bg-[#f3e8ff] border-[#e9d5ff] text-[#1a1a2e] hover:bg-[#e9d5ff] transition-all group cursor-pointer">
          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#c4b5fd] flex items-center justify-center text-[14px] sm:text-[16px] group-hover:scale-110 transition-transform shrink-0">❤️</span>
          <div className="min-w-0"><p className="text-[12px] sm:text-[13px] font-semibold truncate">Make Donation</p><p className="text-[#64748b] text-[9px] sm:text-[10px]">Support your school</p></div>
        </button>
        <Link href="/dashboard/alumni" className="flex items-center gap-3 flex-wrap px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r bg-[#dcfce7] border-[#bbf7d0] text-[#1a1a2e] hover:bg-[#bbf7d0] transition-all group">
          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#86efac] flex items-center justify-center text-[14px] sm:text-[16px] group-hover:scale-110 transition-transform shrink-0">🤝</span>
          <div className="min-w-0"><p className="text-[12px] sm:text-[13px] font-semibold truncate">Find Mentor</p><p className="text-[#64748b] text-[9px] sm:text-[10px]">Mentorship program</p></div>
        </Link>
        <Link href="/dashboard/profile" className="flex items-center gap-3 flex-wrap px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r bg-[#fef3c7] border-[#fde68a] text-[#1a1a2e] hover:bg-[#fde68a] transition-all group">
          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#fcd34d] flex items-center justify-center text-[14px] sm:text-[16px] group-hover:scale-110 transition-transform shrink-0">👤</span>
          <div className="min-w-0"><p className="text-[12px] sm:text-[13px] font-semibold truncate">Update Profile</p><p className="text-[#64748b] text-[9px] sm:text-[10px]">Your information</p></div>
        </Link>
      </div>

      {showDonateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowDonateModal(false)}>
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-8 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-[#7c3aed]" />
                <h3 className="text-[#1a1a2e] font-semibold text-[16px]">Make a Donation</h3>
              </div>
              <button onClick={() => setShowDonateModal(false)} className="text-[#64748b] hover:text-[#1a1a2e] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[#64748b] text-[12px] font-medium mb-1 block">Amount *</label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="Enter amount"
                  value={donateForm.amount}
                  onChange={e => setDonateForm(p => ({ ...p, amount: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg bg-[#ffffff] border border-[#e2e8f0] text-[#1a1a2e] text-[14px] placeholder:text-[#94a3b8] focus:outline-none focus:border-purple-500/50 transition-colors"
                />
              </div>
              <div>
                <label className="text-[#64748b] text-[12px] font-medium mb-1 block">Purpose (optional)</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Library fund, Scholarship support..."
                  value={donateForm.purpose}
                  onChange={e => setDonateForm(p => ({ ...p, purpose: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg bg-[#ffffff] border border-[#e2e8f0] text-[#1a1a2e] text-[14px] placeholder:text-[#94a3b8] focus:outline-none focus:border-purple-500/50 transition-colors resize-none"
                />
              </div>
              <button
                onClick={handleDonate}
                disabled={donateLoading || !donateForm.amount}
                className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-[14px] transition-colors flex items-center justify-center gap-2"
              >
                {donateLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
                {donateLoading ? "Processing..." : "Submit Donation"}
              </button>
            </div>
          </div>
        </div>
      )}
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

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-[#e2e8f0] border-t-[var(--primary)] rounded-full animate-spin" /></div>;
  if (!children.length) return (
    <div className="text-center py-20">
      <p className="text-[#64748b] text-[15px] mb-2">No children linked to this account</p>
      <p className="text-[#94a3b8] text-[12px]">Contact the school administrator to link your children</p>
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
        <div className="flex items-center gap-2 mb-4 p-1 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] inline-flex">
          {children.map((c: any, i: number) => (
            <button key={c.id} onClick={() => setSelectedIdx(i)} className={`px-5 py-2.5 rounded-lg text-[13px] font-medium transition-all ${selectedIdx === i ? "bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20" : "text-[#64748b] hover:text-[#1a1a2e] hover:bg-white"}`}>
              {c.firstName} {c.lastName}
              {c.class?.name && <span className="ml-1.5 text-[11px] opacity-60">{c.class.name}</span>}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard><p className="text-[#64748b] text-[12px] font-medium">Child</p><p className="text-[18px] font-bold text-[#1a1a2e] mt-1">{child.firstName} {child.lastName}</p><p className="text-[#94a3b8] text-[11px] mt-1">{child.class?.name || "\u2014"}</p></DashboardCard>
        <DashboardCard><p className="text-[#64748b] text-[12px] font-medium">Attendance</p><p className="text-[28px] font-bold text-[#1a1a2e] mt-1">{attendancePct}%</p><p className="text-[#94a3b8] text-[11px] mt-1">{presentDays} of {totalDays} days</p></DashboardCard>
        <DashboardCard><p className="text-[#64748b] text-[12px] font-medium">Current Average</p><p className="text-[28px] font-bold text-[#1a1a2e] mt-1">{avgScore}%</p></DashboardCard>
        <DashboardCard><p className="text-[#64748b] text-[12px] font-medium">Fee Balance</p><p className="text-[22px] font-bold text-[#1a1a2e] mt-1">{formatCurrency(unpaidAmount)}</p>{unpaidAmount > 0 && <p className="text-[#d97706] text-[11px] mt-1">Outstanding</p>}</DashboardCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <DashboardCard>
          <CardTitle title={`Results \u2014 ${child.firstName}`} subtitle={`${grades.length} grade${grades.length !== 1 ? "s" : ""} recorded`} />
          <div className="space-y-2">
            {grades.length === 0 ? <p className="text-[#94a3b8] text-[12px] text-center py-6">No results yet for {child.firstName}</p> : grades.slice(0, 8).map((g: any, i: number) => (
              <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:bg-[#f8fafc] transition">
                <div>
                  <p className="text-[#475569] text-[12px] font-medium">{g.subject?.name || "\u2014"}</p>
                  <p className="text-[#94a3b8] text-[10px]">{g.type} {g.term ? `\u00B7 ${g.term}` : ""}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-[#1a1a2e] text-[13px] font-bold">{g.score}/{g.maxScore}</p>
                  {g.grade && <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${g.grade === "A" ? "bg-[#dcfce7] text-[#16a34a]" : g.grade === "B" ? "bg-[#dbeafe] text-[#2563eb]" : g.grade === "C" ? "bg-yellow-500/15 text-[#ca8a04]" : g.grade === "F" ? "bg-[#fee2e2] text-[#dc2626]" : "bg-[#f1f5f9] text-[#64748b]"}`}>{g.grade}</span>}
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>
        <DashboardCard>
          <CardTitle title={`Fee Status \u2014 ${child.firstName}`} subtitle={`${invoices.length} invoice${invoices.length !== 1 ? "s" : ""}`} />
          <div className="space-y-2">
            {invoices.length === 0 ? <p className="text-[#94a3b8] text-[12px] text-center py-6">No invoices for {child.firstName}</p> : invoices.slice(0, 6).map((inv: any, i: number) => (
              <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] hover:bg-[#f8fafc] transition">
                <div>
                  <p className="text-[#475569] text-[12px] font-medium">{inv.schoolFee?.name || "Fee"}</p>
                    <p className="text-[#64748b] text-[10px]">{formatCurrency(inv.amount || 0)} {inv.dueDate ? `\u00B7 Due ${new Date(inv.dueDate).toLocaleDateString()}` : ""}</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-medium ${inv.status === "paid" ? "bg-[#dcfce7] text-[#16a34a]" : inv.status === "overdue" ? "bg-[#fee2e2] text-[#dc2626]" : "bg-[#fef3c7] text-[#d97706]"}`}>{inv.status}</span>
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
              <defs><linearGradient id="gAttP" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#28ff9c" stopOpacity={0.15} /><stop offset="95%" stopColor="#28ff9c" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
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
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} cursor={false} />
                <Bar dataKey="score" name="Score %" fill="#0055ff" radius={[6, 6, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="flex items-center justify-center h-[200px] text-[#94a3b8] text-[13px]">No grade data yet</div>}
        </DashboardCard>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mt-4">
        <Link href="/dashboard/parent-payments" className="flex items-center gap-3 flex-wrap px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r bg-[#dbeafe] border-[#bfdbfe] text-[#1a1a2e] hover:bg-[#bfdbfe] transition-all group">
          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#93c5fd] flex items-center justify-center text-[14px] sm:text-[16px] group-hover:scale-110 transition-transform shrink-0">💰</span>
          <div className="min-w-0"><p className="text-[12px] sm:text-[13px] font-semibold truncate">Pay Fees</p><p className="text-[#64748b] text-[9px] sm:text-[10px]">View & pay fees</p></div>
        </Link>
        <Link href="/dashboard/timetable" className="flex items-center gap-3 flex-wrap px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r bg-[#f3e8ff] border-[#e9d5ff] text-[#1a1a2e] hover:bg-[#e9d5ff] transition-all group">
          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#c4b5fd] flex items-center justify-center text-[14px] sm:text-[16px] group-hover:scale-110 transition-transform shrink-0">📅</span>
          <div className="min-w-0"><p className="text-[12px] sm:text-[13px] font-semibold truncate">View Timetable</p><p className="text-[#64748b] text-[9px] sm:text-[10px]">Child's schedule</p></div>
        </Link>
        <Link href="/dashboard/results" className="flex items-center gap-3 flex-wrap px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r bg-[#dcfce7] border-[#bbf7d0] text-[#1a1a2e] hover:bg-[#bbf7d0] transition-all group">
          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#86efac] flex items-center justify-center text-[14px] sm:text-[16px] group-hover:scale-110 transition-transform shrink-0">📊</span>
          <div className="min-w-0"><p className="text-[12px] sm:text-[13px] font-semibold truncate">View Results</p><p className="text-[#64748b] text-[9px] sm:text-[10px]">Check grades</p></div>
        </Link>
        <Link href="/dashboard/calendar" className="flex items-center gap-3 flex-wrap px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r bg-[#fef3c7] border-[#fde68a] text-[#1a1a2e] hover:bg-[#fde68a] transition-all group">
          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#fcd34d] flex items-center justify-center text-[14px] sm:text-[16px] group-hover:scale-110 transition-transform shrink-0">📆</span>
          <div className="min-w-0"><p className="text-[12px] sm:text-[13px] font-semibold truncate">Calendar</p><p className="text-[#64748b] text-[9px] sm:text-[10px]">School events</p></div>
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
    <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-5">
      <motion.div variants={fadeIn} className="section-header">
        <h1 className="section-title">{title}</h1>
        <p className="text-[#94a3b8] text-[12px] whitespace-nowrap">Welcome, {name}</p>
      </motion.div>
      {component}
    </motion.div>
  );
}
