"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell,
} from "recharts";
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
        <DashboardCard><p className="text-white/40 text-[12px] font-medium">Avg. Performance</p><p className="text-[28px] font-bold text-white mt-1">{stats.attendance?.rate || 0}%</p></DashboardCard>
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
    </>
  );
}

function AccountantDashboard() {
  const [stats, setStats] = useState<any>({ totalRevenue: 0, monthlyRevenue: [] });
  useEffect(() => { fetch("/api/dashboard/stats").then(r => r.json()).then(d => { if (d.success) setStats(d); }).catch(() => {}); }, []);

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard><p className="text-white/40 text-[12px] font-medium">Total Collected</p><p className="text-[22px] font-bold text-white mt-1">{"\u20A6"}{(stats.totalRevenue / 1000000).toFixed(1)}M</p></DashboardCard>
        <DashboardCard><p className="text-white/40 text-[12px] font-medium">Active Classes</p><p className="text-[28px] font-bold text-white mt-1">{stats.totalClasses || 0}</p></DashboardCard>
        <DashboardCard><p className="text-white/40 text-[12px] font-medium">Total Students</p><p className="text-[28px] font-bold text-white mt-1">{stats.totalStudents || 0}</p></DashboardCard>
        <DashboardCard><p className="text-white/40 text-[12px] font-medium">Total Teachers</p><p className="text-[28px] font-bold text-white mt-1">{stats.totalTeachers || 0}</p></DashboardCard>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <DashboardCard>
          <CardTitle title="Revenue Trend" />
          {stats.monthlyRevenue?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={stats.monthlyRevenue}>
                <defs><linearGradient id="gRevAc" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#28ff9c" stopOpacity={0.3} /><stop offset="95%" stopColor="#28ff9c" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#28ff9c" fill="url(#gRevAc)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <div className="flex items-center justify-center h-[200px] text-white/30 text-[13px]">No revenue data</div>}
        </DashboardCard>
        <DashboardCard>
          <CardTitle title="Recent Activity" />
          <div className="space-y-2">
            {stats.recentActivities?.slice(0, 5).map((item: any, i: number) => (
              <div key={i} className="flex items-start gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/[0.03] transition">
                <div className="w-7 h-7 rounded-md bg-emerald-500/15 text-emerald-400 flex items-center justify-center flex-shrink-0 text-[10px] font-bold">{i + 1}</div>
                <div className="flex-1 min-w-0"><p className="text-white/60 text-[12px]">{item.description}</p><p className="text-white/20 text-[10px] mt-0.5">{new Date(item.time).toLocaleDateString()}</p></div>
              </div>
            )) || <p className="text-white/30 text-[12px] text-center py-4">No recent activity</p>}
          </div>
        </DashboardCard>
      </div>
    </>
  );
}

function AuditorDashboard() {
  const [stats, setStats] = useState<any>({ totalRevenue: 0, monthlyRevenue: [] });
  useEffect(() => { fetch("/api/dashboard/stats").then(r => r.json()).then(d => { if (d.success) setStats(d); }).catch(() => {}); }, []);

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard><p className="text-white/40 text-[12px] font-medium">Total Revenue</p><p className="text-[22px] font-bold text-white mt-1">{"\u20A6"}{(stats.totalRevenue / 1000000).toFixed(1)}M</p></DashboardCard>
        <DashboardCard><p className="text-white/40 text-[12px] font-medium">Total Students</p><p className="text-[28px] font-bold text-white mt-1">{stats.totalStudents || 0}</p></DashboardCard>
        <DashboardCard><p className="text-white/40 text-[12px] font-medium">Total Teachers</p><p className="text-[28px] font-bold text-white mt-1">{stats.totalTeachers || 0}</p></DashboardCard>
        <DashboardCard><p className="text-white/40 text-[12px] font-medium">Active Classes</p><p className="text-[28px] font-bold text-white mt-1">{stats.totalClasses || 0}</p></DashboardCard>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <DashboardCard>
          <CardTitle title="Revenue Trend" subtitle="6-month overview" />
          {stats.monthlyRevenue?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={stats.monthlyRevenue}>
                <defs><linearGradient id="gRevAu" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0055ff" stopOpacity={0.3} /><stop offset="95%" stopColor="#0055ff" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#0055ff" fill="url(#gRevAu)" strokeWidth={2} dot={false} />
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
                <div className="flex-1 min-w-0"><p className="text-white/60 text-[12px]">{item.description}</p><p className="text-white/20 text-[10px] mt-0.5">{new Date(item.time).toLocaleDateString()}</p></div>
              </div>
            )) || <p className="text-white/30 text-[12px] text-center py-4">No recent activity</p>}
          </div>
        </DashboardCard>
      </div>
    </>
  );
}

function LibrarianDashboard() {
  const [stats, setStats] = useState<any>({ totalStudents: 0 });
  useEffect(() => { fetch("/api/dashboard/stats").then(r => r.json()).then(d => { if (d.success) setStats(d); }).catch(() => {}); }, []);

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard><p className="text-white/40 text-[12px] font-medium">Total Students</p><p className="text-[28px] font-bold text-white mt-1">{stats.totalStudents}</p></DashboardCard>
        <DashboardCard><p className="text-white/40 text-[12px] font-medium">Active Classes</p><p className="text-[28px] font-bold text-white mt-1">{stats.totalClasses || 0}</p></DashboardCard>
        <DashboardCard><p className="text-white/40 text-[12px] font-medium">Total Teachers</p><p className="text-[28px] font-bold text-white mt-1">{stats.totalTeachers || 0}</p></DashboardCard>
        <DashboardCard><p className="text-white/40 text-[12px] font-medium">Revenue</p><p className="text-[22px] font-bold text-white mt-1">{"\u20A6"}{(stats.totalRevenue / 1000000).toFixed(1)}M</p></DashboardCard>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <DashboardCard>
          <CardTitle title="School Overview" />
          <div className="space-y-3">
            {stats.classPerformance?.slice(0, 6).map((c: any, i: number) => (
              <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                <p className="text-white/80 text-[13px] font-medium">{c.name}</p>
                <div className="flex items-center gap-3">
                  <span className="text-white/40 text-[12px]">{c.students} students</span>
                  <span className="text-white/30 text-[11px]">{c.teacher}</span>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>
        <DashboardCard>
          <CardTitle title="Recent Activity" />
          <div className="space-y-2">
            {stats.recentActivities?.slice(0, 5).map((item: any, i: number) => (
              <div key={i} className="flex items-start gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/[0.03] transition">
                <div className={`w-7 h-7 rounded-md ${item.type === "payment" ? "bg-emerald-500/15 text-emerald-400" : "bg-blue-500/15 text-blue-400"} flex items-center justify-center flex-shrink-0 text-[10px] font-bold`}>{i + 1}</div>
                <div className="flex-1 min-w-0"><p className="text-white/60 text-[12px]">{item.description}</p></div>
              </div>
            )) || <p className="text-white/30 text-[12px] text-center py-4">No recent activity</p>}
          </div>
        </DashboardCard>
      </div>
    </>
  );
}

function PorterDashboard() {
  const [stats, setStats] = useState<any>({ totalStudents: 0 });
  useEffect(() => { fetch("/api/dashboard/stats").then(r => r.json()).then(d => { if (d.success) setStats(d); }).catch(() => {}); }, []);

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard><p className="text-white/40 text-[12px] font-medium">Total Students</p><p className="text-[28px] font-bold text-white mt-1">{stats.totalStudents}</p></DashboardCard>
        <DashboardCard><p className="text-white/40 text-[12px] font-medium">Active Classes</p><p className="text-[28px] font-bold text-white mt-1">{stats.totalClasses || 0}</p></DashboardCard>
        <DashboardCard><p className="text-white/40 text-[12px] font-medium">Total Teachers</p><p className="text-[28px] font-bold text-white mt-1">{stats.totalTeachers || 0}</p></DashboardCard>
        <DashboardCard><p className="text-white/40 text-[12px] font-medium">Revenue</p><p className="text-[22px] font-bold text-white mt-1">{"\u20A6"}{(stats.totalRevenue / 1000000).toFixed(1)}M</p></DashboardCard>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <DashboardCard>
          <CardTitle title="School Overview" />
          <div className="space-y-3">
            {stats.classPerformance?.slice(0, 6).map((c: any, i: number) => (
              <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                <p className="text-white/80 text-[13px] font-medium">{c.name}</p>
                <span className="text-white/40 text-[12px]">{c.students} students</span>
              </div>
            ))}
          </div>
        </DashboardCard>
        <DashboardCard>
          <CardTitle title="Recent Activity" />
          <div className="space-y-2">
            {stats.recentActivities?.slice(0, 5).map((item: any, i: number) => (
              <div key={i} className="flex items-start gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/[0.03] transition">
                <div className={`w-7 h-7 rounded-md ${item.type === "payment" ? "bg-emerald-500/15 text-emerald-400" : "bg-blue-500/15 text-blue-400"} flex items-center justify-center flex-shrink-0 text-[10px] font-bold`}>{i + 1}</div>
                <div className="flex-1 min-w-0"><p className="text-white/60 text-[12px]">{item.description}</p></div>
              </div>
            )) || <p className="text-white/30 text-[12px] text-center py-4">No recent activity</p>}
          </div>
        </DashboardCard>
      </div>
    </>
  );
}

function AlumniDashboard() {
  const [stats, setStats] = useState<any>({ totalStudents: 0 });
  useEffect(() => { fetch("/api/dashboard/stats").then(r => r.json()).then(d => { if (d.success) setStats(d); }).catch(() => {}); }, []);

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard><p className="text-white/40 text-[12px] font-medium">Total Students</p><p className="text-[28px] font-bold text-white mt-1">{stats.totalStudents}</p></DashboardCard>
        <DashboardCard><p className="text-white/40 text-[12px] font-medium">Active Classes</p><p className="text-[28px] font-bold text-white mt-1">{stats.totalClasses || 0}</p></DashboardCard>
        <DashboardCard><p className="text-white/40 text-[12px] font-medium">Revenue</p><p className="text-[22px] font-bold text-white mt-1">{"\u20A6"}{(stats.totalRevenue / 1000000).toFixed(1)}M</p></DashboardCard>
        <DashboardCard><p className="text-white/40 text-[12px] font-medium">Total Teachers</p><p className="text-[28px] font-bold text-white mt-1">{stats.totalTeachers || 0}</p></DashboardCard>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <DashboardCard>
          <CardTitle title="School Performance" />
          {stats.classPerformance?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.classPerformance} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={false} />
                <Bar dataKey="students" name="Students" fill="#a855f7" radius={[6, 6, 0, 0]} maxBarSize={36} />
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
                <div className="flex-1 min-w-0"><p className="text-white/60 text-[12px]">{item.description}</p></div>
              </div>
            )) || <p className="text-white/30 text-[12px] text-center py-4">No recent activity</p>}
          </div>
        </DashboardCard>
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
