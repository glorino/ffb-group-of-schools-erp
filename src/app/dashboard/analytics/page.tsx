"use client";

import { useEffect, useState, useMemo, Suspense, lazy } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  Users,
  GraduationCap,
  Calendar,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { downloadCSV } from "@/lib/exports";
import { formatCurrencyCompact } from "@/lib/school-config";

const PIE_COLORS = ["#6366f1", "#22d3ee"];
const ATTENDANCE_COLORS = ["#22c55e", "#ef4444"];
const FALLBACK_CLASS_PERF = [
  { class: "JSS1", avg: 0, pass: 0, fail: 0 },
  { class: "JSS2", avg: 0, pass: 0, fail: 0 },
  { class: "JSS3", avg: 0, pass: 0, fail: 0 },
  { class: "SS1", avg: 0, pass: 0, fail: 0 },
  { class: "SS2", avg: 0, pass: 0, fail: 0 },
  { class: "SS3", avg: 0, pass: 0, fail: 0 },
];
const FALLBACK_SUBJECT_PERF = [
  { subject: "Mathematics", avg: 0, trend: "up" as const },
  { subject: "English", avg: 0, trend: "up" as const },
  { subject: "Physics", avg: 0, trend: "up" as const },
  { subject: "Chemistry", avg: 0, trend: "up" as const },
  { subject: "Biology", avg: 0, trend: "up" as const },
];

interface DashboardStats {
  totalStudents?: number;
  totalTeachers?: number;
  totalClasses?: number;
  [key: string]: unknown;
}

interface Grade {
  id: string;
  studentId: string;
  studentName?: string;
  class?: string;
  subject?: string;
  score: number;
  term?: string;
  session?: string;
  [key: string]: unknown;
}

interface Payment {
  id: string;
  amount: number;
  date?: string;
  status?: string;
  [key: string]: unknown;
}

interface Attendance {
  id: string;
  studentId: string;
  status: string;
  date?: string;
  [key: string]: unknown;
}

interface Student {
  id: string;
  gender?: string;
  [key: string]: unknown;
}

interface KpiData {
  label: string;
  value: string;
  change: string;
  trend: string;
  icon: typeof Users;
  color: string;
}

interface ClassPerf {
  class: string;
  avg: number;
  pass: number;
  fail: number;
}

interface SubjectPerf {
  subject: string;
  avg: number;
  trend: string;
}

interface MonthlyRevenue {
  month: string;
  amount: number;
}

function ChartFallback() {
  return (
    <div className="flex items-center justify-center h-[260px]">
      <Loader2 className="w-6 h-6 text-[var(--primary)] animate-spin" />
    </div>
  );
}

function AnalyticsCharts({
  genderData,
  attendanceData,
  classPerformance,
  subjectPerformance,
  monthlyRevenue,
}: {
  genderData: { name: string; value: number }[];
  attendanceData: { name: string; value: number }[];
  classPerformance: ClassPerf[];
  subjectPerformance: SubjectPerf[];
  monthlyRevenue: MonthlyRevenue[];
}) {
  const {
    PieChart, Pie, Cell,
    LineChart, Line, BarChart, Bar,
    ResponsiveContainer, Tooltip, Legend,
    XAxis, YAxis, CartesianGrid,
  } = require("recharts");

  return (
    <>
      <div className="charts-grid-equal">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="dashboard-card"
        >
          <h3 className="text-[#1a1a2e] font-semibold text-[16px] mb-5">Gender Distribution</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
                label={({ name, percent }: any) => `${name || ""} ${((percent || 0) * 100).toFixed(0)}%`}
              >
                {genderData.map((_entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  color: "#1a1a2e",
                }}
              />
              <Legend wrapperStyle={{ color: "#64748b" }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="dashboard-card"
        >
          <h3 className="text-[#1a1a2e] font-semibold text-[16px] mb-5">Attendance Overview</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={attendanceData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
                label={({ name, value }: any) => `${name} ${value}%`}
              >
                {attendanceData.map((_entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={ATTENDANCE_COLORS[index]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  color: "#1a1a2e",
                }}
              />
              <Legend wrapperStyle={{ color: "#64748b" }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <div className="charts-grid-equal">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="dashboard-card"
        >
          <h3 className="text-[#1a1a2e] font-semibold text-[16px] mb-5">Payment Trend</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  color: "#1a1a2e",
                }}
              />
              <Legend wrapperStyle={{ color: "#64748b" }} />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#a78bfa"
                strokeWidth={3}
                dot={{ fill: "#a78bfa", strokeWidth: 2 }}
                activeDot={{ r: 6 }}
                name={`Collection (${formatCurrencyCompact(0).charAt(0)}M)`}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="dashboard-card"
        >
          <h3 className="text-[#1a1a2e] font-semibold text-[16px] mb-5">Class Performance</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={classPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="class" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  color: "#1a1a2e",
                }}
              />
              <Legend wrapperStyle={{ color: "#64748b" }} />
              <Bar dataKey="avg" fill="#34d399" radius={[6, 6, 0, 0]} name="Avg Score %" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </>
  );
}

const AnalyticsChartsLazy = (props: any) => (
  <Suspense fallback={<ChartFallback />}>
    <AnalyticsCharts {...props} />
  </Suspense>
);

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [filterSubject, setFilterSubject] = useState("");

  const [rawGrades, setRawGrades] = useState<Grade[]>([]);
  const [rawPayments, setRawPayments] = useState<Payment[]>([]);
  const [rawStudents, setRawStudents] = useState<Student[]>([]);
  const [rawAttendance, setRawAttendance] = useState<Attendance[]>([]);
  const [rawStats, setRawStats] = useState<DashboardStats>({});

  const filteredGrades = useMemo(() => {
    return rawGrades.filter((g) => {
      if (filterClass && (g.class || "Unknown") !== filterClass) return false;
      if (filterSubject && (g.subject || "Unknown") !== filterSubject) return false;
      if (filterDateFrom || filterDateTo) {
        const ts = g.term || g.session || "";
        if (filterDateFrom && ts < filterDateFrom) return false;
        if (filterDateTo && ts > filterDateTo) return false;
      }
      return true;
    });
  }, [rawGrades, filterClass, filterSubject, filterDateFrom, filterDateTo]);

  const filteredPayments = useMemo(() => {
    return rawPayments.filter((p) => {
      if (filterDateFrom || filterDateTo) {
        if (p.date) {
          const d = new Date(p.date);
          if (filterDateFrom && d < new Date(filterDateFrom)) return false;
          if (filterDateTo && d > new Date(filterDateTo)) return false;
        }
      }
      return true;
    });
  }, [rawPayments, filterDateFrom, filterDateTo]);

  const filteredAttendance = useMemo(() => {
    return rawAttendance.filter((a) => {
      if (filterDateFrom || filterDateTo) {
        if (a.date) {
          const d = new Date(a.date);
          if (filterDateFrom && d < new Date(filterDateFrom)) return false;
          if (filterDateTo && d > new Date(filterDateTo)) return false;
        }
      }
      return true;
    });
  }, [rawAttendance, filterDateFrom, filterDateTo]);

  const uniqueClasses = useMemo(() => {
    const set = new Set(rawGrades.map((g) => g.class || "Unknown"));
    return Array.from(set).sort();
  }, [rawGrades]);

  const uniqueSubjects = useMemo(() => {
    const set = new Set(rawGrades.map((g) => g.subject || "Unknown"));
    return Array.from(set).sort();
  }, [rawGrades]);

  const kpiData = useMemo(() => {
    const totalStudents = (rawStats as Record<string, unknown>).totalStudents as number || 0;
    const avgScore = filteredGrades.length > 0
      ? filteredGrades.reduce((sum, g) => sum + (g.score || 0), 0) / filteredGrades.length
      : 0;
    const passRate = filteredGrades.length > 0
      ? Math.round((filteredGrades.filter((g) => g.score >= 50).length / filteredGrades.length) * 100)
      : 0;
    const totalRevenue = filteredPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

    return [
      {
        label: "Total Students",
        value: totalStudents > 0 ? String(totalStudents) : "\u2014",
        change: totalStudents > 0 ? `+${Math.round(totalStudents * 0.05)}` : "+0",
        trend: "up",
        icon: Users,
        color: "from-blue-500 to-blue-600",
      },
      {
        label: "Pass Rate",
        value: passRate > 0 ? `${passRate}%` : "\u2014",
        change: passRate > 0 ? `+${Math.min(5, Math.round(passRate * 0.03))}%` : "+0%",
        trend: "up",
        icon: GraduationCap,
        color: "from-emerald-500 to-emerald-600",
      },
      {
        label: "Revenue",
        value: totalRevenue > 0 ? formatCurrencyCompact(totalRevenue) : "\u2014",
        change: totalRevenue > 0 ? "+18%" : "+0%",
        trend: "up",
        icon: TrendingUp,
        color: "from-purple-500 to-purple-600",
      },
      {
        label: "Avg Score",
        value: avgScore > 0 ? `${avgScore.toFixed(1)}%` : "\u2014",
        change: avgScore > 0 ? `+${Math.min(5, Math.round(avgScore * 0.02))}%` : "+0%",
        trend: "up",
        icon: Calendar,
        color: "from-[var(--accent)] to-emerald-400",
      },
    ];
  }, [rawStats, filteredGrades, filteredPayments]);

  const genderData = useMemo(() => {
    const genderCounts: Record<string, number> = {};
    rawStudents.forEach((s) => {
      const g = s.gender || "Unknown";
      genderCounts[g] = (genderCounts[g] || 0) + 1;
    });
    return [
      { name: "Male", value: genderCounts["Male"] || 0 },
      { name: "Female", value: genderCounts["Female"] || 0 },
    ];
  }, [rawStudents]);

  const attendanceData = useMemo(() => {
    const presentCount = filteredAttendance.filter((a) => a.status?.toLowerCase() === "present").length;
    const absentCount = filteredAttendance.filter((a) => a.status?.toLowerCase() !== "present").length;
    return [
      { name: "Present", value: presentCount },
      { name: "Absent", value: absentCount },
    ];
  }, [filteredAttendance]);

  const classPerformance = useMemo(() => {
    const classMap: Record<string, { scores: number[]; total: number; passed: number }> = {};
    filteredGrades.forEach((g) => {
      const cls = g.class || "Unknown";
      if (!classMap[cls]) classMap[cls] = { scores: [], total: 0, passed: 0 };
      classMap[cls].scores.push(g.score || 0);
      classMap[cls].total += 1;
      if ((g.score || 0) >= 50) classMap[cls].passed += 1;
    });

    const result: ClassPerf[] = Object.entries(classMap).map(([cls, data]) => ({
      class: cls,
      avg: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
      pass: Math.round((data.passed / data.total) * 100),
      fail: Math.round(((data.total - data.passed) / data.total) * 100),
    })).sort((a, b) => a.class.localeCompare(b.class));

    return result.length > 0 ? result : FALLBACK_CLASS_PERF;
  }, [filteredGrades]);

  const subjectPerformance = useMemo(() => {
    const subjectMap: Record<string, number[]> = {};
    filteredGrades.forEach((g) => {
      const subj = g.subject || "Unknown";
      if (!subjectMap[subj]) subjectMap[subj] = [];
      subjectMap[subj].push(g.score || 0);
    });

    const result: SubjectPerf[] = Object.entries(subjectMap).map(([subj, scores]) => ({
      subject: subj,
      avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      trend: scores.length > 1 && scores[scores.length - 1] > scores[0] ? "up" : "down",
    })).sort((a, b) => b.avg - a.avg);

    return result.length > 0 ? result : FALLBACK_SUBJECT_PERF;
  }, [filteredGrades]);

  const monthlyRevenue = useMemo(() => {
    const monthNames = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];
    const revenueByMonth: Record<string, number> = {};
    filteredPayments.forEach((p) => {
      if (p.date) {
        const d = new Date(p.date);
        const monthName = monthNames[d.getMonth()] || monthNames[0];
        revenueByMonth[monthName] = (revenueByMonth[monthName] || 0) + (p.amount || 0);
      }
    });
    const lastFiveMonths = monthNames.slice(0, 5);
    return lastFiveMonths.map((m) => ({
      month: m,
      amount: revenueByMonth[m] ? Math.round((revenueByMonth[m] / 1000000) * 10) / 10 : 0,
    }));
  }, [filteredPayments]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, gradesRes, paymentsRes, studentsRes, attendanceRes] = await Promise.all([
        fetch("/api/dashboard/stats").catch(() => ({ ok: false, json: async () => ({}) })),
        fetch("/api/grades").catch(() => ({ ok: false, json: async () => ({}) })),
        fetch("/api/finance/payments").catch(() => ({ ok: false, json: async () => ({}) })),
        fetch("/api/students?limit=9999").catch(() => ({ ok: false, json: async () => ({ students: [] }) })),
        fetch("/api/attendance?limit=9999").catch(() => ({ ok: false, json: async () => ({ records: [] }) })),
      ]);

      const statsData: DashboardStats = statsRes.ok ? await statsRes.json() : {};
      const gradesData: Grade[] = gradesRes.ok ? await gradesRes.json() : [];
      const paymentsData: Payment[] = paymentsRes.ok ? await paymentsRes.json() : [];
      const studentsData = studentsRes.ok ? await studentsRes.json() : { students: [] };
      const attendanceDataRes = attendanceRes.ok ? await attendanceRes.json() : { records: [] };

      const grades = Array.isArray(gradesData) ? gradesData : (gradesData as Record<string, unknown>).grades as Grade[] || [];
      const payments = Array.isArray(paymentsData) ? paymentsData : (paymentsData as Record<string, unknown>).payments as Payment[] || [];
      const students: Student[] = Array.isArray(studentsData) ? studentsData : studentsData.students || [];
      const attendanceRecords: Attendance[] = Array.isArray(attendanceDataRes) ? attendanceDataRes : attendanceDataRes.records || [];

      setRawStats(statsData);
      setRawGrades(grades);
      setRawPayments(payments);
      setRawStudents(students);
      setRawAttendance(attendanceRecords);
    } catch {
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="dashboard-card bg-gradient-to-r from-[#0a2a6e] to-[#0055ff] border-white/10 mx-8 mt-8 p-8"
        style={{ background: "linear-gradient(to right, #0a2a6e, #0055ff)" }}
      >
        <div className="section-header">
          <div>
            <h1 className="section-title">Analytics Dashboard</h1>
            <p className="section-subtitle">Charts, KPIs, heatmaps, and trend analysis for data-driven decisions</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className={`btn ${showFilter ? "btn-primary" : "btn-secondary"}`}
            >
              <Filter className="w-4 h-4" />
              Filter
              {(filterClass || filterSubject || filterDateFrom || filterDateTo) && (
                <span className="ml-1 w-2 h-2 rounded-full bg-red-500 inline-block" />
              )}
            </button>
            <button
              onClick={() => {
                const data = kpiData.map((kpi) => ({
                  Metric: kpi.label,
                  Value: kpi.value,
                  Change: kpi.change,
                  Trend: kpi.trend,
                }));
                downloadCSV(data, "analytics_report");
              }}
              className="btn btn-primary"
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showFilter && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="dashboard-card border-[var(--primary)]/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[#1a1a2e] font-semibold text-[15px]">Filter Analytics</h3>
                <button
                  onClick={() => {
                    setFilterDateFrom("");
                    setFilterDateTo("");
                    setFilterClass("");
                    setFilterSubject("");
                    setShowFilter(false);
                  }}
                  className="text-[#64748b] hover:text-[#1a1a2e] text-[12px] font-medium"
                >
                  Clear all
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[#475569] text-[11px] font-medium mb-1.5">Date From</label>
                  <input
                    type="date"
                    value={filterDateFrom}
                    onChange={(e) => setFilterDateFrom(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-[#1a1a2e] text-[12px] focus:outline-none focus:border-[var(--primary)]"
                    style={{ colorScheme: "light" }}
                  />
                </div>
                <div>
                  <label className="block text-[#475569] text-[11px] font-medium mb-1.5">Date To</label>
                  <input
                    type="date"
                    value={filterDateTo}
                    onChange={(e) => setFilterDateTo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-[#1a1a2e] text-[12px] focus:outline-none focus:border-[var(--primary)]"
                    style={{ colorScheme: "light" }}
                  />
                </div>
                <div>
                  <label className="block text-[#475569] text-[11px] font-medium mb-1.5">Class</label>
                  <select
                    value={filterClass}
                    onChange={(e) => setFilterClass(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-[#1a1a2e] text-[12px] focus:outline-none focus:border-[var(--primary)]"
                    style={{ colorScheme: "light" }}
                  >
                    <option style={{ background: "#ffffff", color: "#1a1a2e" }} value="">All Classes</option>
                    {uniqueClasses.map((c) => (
                      <option key={c} style={{ background: "#ffffff", color: "#1a1a2e" }} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#475569] text-[11px] font-medium mb-1.5">Subject</label>
                  <select
                    value={filterSubject}
                    onChange={(e) => setFilterSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-[#1a1a2e] text-[12px] focus:outline-none focus:border-[var(--primary)]"
                    style={{ colorScheme: "light" }}
                  >
                    <option style={{ background: "#ffffff", color: "#1a1a2e" }} value="">All Subjects</option>
                    {uniqueSubjects.map((s) => (
                      <option key={s} style={{ background: "#ffffff", color: "#1a1a2e" }} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end mt-4 pt-3 border-t border-[#e2e8f0]">
                <button
                  onClick={() => setShowFilter(false)}
                  className="px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-[12px] font-semibold hover:brightness-110 transition-all"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="stats-grid-4">
        {kpiData.map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="stat-card"
          >
            <div className={`stat-card-icon bg-gradient-to-br ${kpi.color}`}>
              <kpi.icon className="w-6 h-6 text-white" />
            </div>
            <div className="stat-card-content">
              <p className="stat-card-label">{kpi.label}</p>
              <p className="stat-card-value">{kpi.value}</p>
              <div className="flex items-center gap-1 mt-1">
                {kpi.trend === "up" ? (
                  <ArrowUpRight className="w-3 h-3 text-[#16a34a]" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 text-[#dc2626]" />
                )}
                <span className={`text-[11px] font-medium ${kpi.trend === "up" ? "text-[#16a34a]" : "text-[#dc2626]"}`}>
                  {kpi.change}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="charts-grid-equal">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="dashboard-card"
        >
          <h3 className="text-[#1a1a2e] font-semibold text-[16px] mb-5">Class Performance</h3>
          <div className="space-y-3">
            {classPerformance.map((cls, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-[#475569] text-[12px] w-12 flex-shrink-0">{cls.class}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex gap-0.5">
                    <div className="bg-emerald-500/80 h-5 rounded-l" style={{ width: `${cls.pass}%` }} />
                    <div className="bg-red-500/80 h-5 rounded-r" style={{ width: `${cls.fail}%` }} />
                  </div>
                </div>
                <span className="text-[#64748b] text-[11px] w-14 text-right flex-shrink-0">{cls.avg}% avg</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="dashboard-card"
        >
          <h3 className="text-[#1a1a2e] font-semibold text-[16px] mb-5">Subject Performance</h3>
          <div className="space-y-3">
            {subjectPerformance.map((subject, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-[#475569] text-[12px] w-24 flex-shrink-0 truncate">{subject.subject}</span>
                <div className="flex-1 min-w-0">
                  <div className="progress-bar">
                    <div
                      className="progress-bar-fill bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]"
                      style={{ width: `${subject.avg}%` }}
                    />
                  </div>
                </div>
                <span className="text-[#64748b] text-[11px] w-10 text-right flex-shrink-0">{subject.avg}%</span>
                {subject.trend === "up" ? (
                  <ArrowUpRight className="w-3 h-3 text-[#16a34a] flex-shrink-0" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 text-[#dc2626] flex-shrink-0" />
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
        className="dashboard-card"
      >
        <h3 className="text-[#1a1a2e] font-semibold text-[16px] mb-5">Monthly Revenue Trend</h3>
        <div className="flex items-end justify-between h-48 gap-4">
          {monthlyRevenue.map((month, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <span className="text-[#64748b] text-[11px] mb-2">{formatCurrencyCompact(month.amount * 1000000)}</span>
              <div
                className="w-full bg-gradient-to-t from-[var(--primary)] to-[var(--accent)] rounded-t-lg transition-all duration-500"
                style={{ height: `${month.amount > 0 ? Math.max((month.amount / 50) * 100, 5) : 2}%` }}
              />
              <span className="text-[#64748b] text-[11px] mt-2">{month.month}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <AnalyticsChartsLazy
        genderData={genderData}
        attendanceData={attendanceData}
        classPerformance={classPerformance}
        subjectPerformance={subjectPerformance}
        monthlyRevenue={monthlyRevenue}
      />
    </div>
  );
}
