"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  ArrowLeft,
  GraduationCap,
  Calendar,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  BookOpen,
  ClipboardCheck,
  FileText,
  Award,
  Heart,
  Clock,
  TrendingUp,
  Download,
  Edit3,
  Printer,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  Users,
  School,
  Target,
  Loader2,
  MessageSquare,
  Activity,
  Stethoscope,
  Droplets,
  AlertTriangle,
  Pill,
} from "lucide-react";
import { toast } from "sonner";

const tabs = [
  { id: "overview", label: "Overview", icon: User },
  { id: "academic", label: "Academic", icon: BookOpen },
  { id: "attendance", label: "Attendance", icon: ClipboardCheck },
  { id: "fees", label: "Fees", icon: CreditCard },
  { id: "medical", label: "Medical", icon: Heart },
  { id: "documents", label: "Documents", icon: FileText },
];

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
};

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  admissionNumber: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  bloodGroup?: string;
  class?: { name: string; id: string };
  guardians?: { name: string; phone: string; email: string; relationship: string }[];
  medicalRecords?: { bloodGroup: string; genotype: string; allergies: string; conditions: string; clinicVisits?: { id: string; date: string; reason: string; notes?: string; doctor?: string }[] }[];
  documents?: { name: string; type: string; size: string; uploadedAt: string }[];
  attendanceRecords: { date: string; status: string }[];
  grades: { subject: { name: string }; score: number; grade: string; type: string; term?: string }[];
  invoices: { id: string; amount: number; status: string; schoolFee: { name: string; amount: number }; payments: { amount: number; paidAt?: string; method?: string }[]; dueDate?: string }[];
  timeline?: { id: string; action: string; details?: string; createdAt: string }[];
  disciplineRecords?: { id: string; type: string; title: string; details?: string; date: string; action?: string; reportedBy?: string }[];
  hostels?: { id: string; hostel: { name: string }; room: { number: string }; bedNumber?: number; status: string; startDate: string; endDate?: string }[];
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  guardianRelation?: string;
  status: string;
  createdAt: string;
}

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await fetch(`/api/students/${params.id}`);
        if (!res.ok) {
          setLoading(false);
          return;
        }
        const data = await res.json();
        setStudent(data);
      } catch {
        toast.error("Failed to load student details");
      }
      setLoading(false);
    };
    fetchStudent();
  }, [params.id]);

  const initials = student
    ? `${student.firstName?.[0] || ""}${student.lastName?.[0] || ""}`.toUpperCase()
    : "";

  const attendanceRecords = student?.attendanceRecords ?? [];
  const grades = student?.grades ?? [];
  const invoices = student?.invoices ?? [];

  const presentCount = attendanceRecords.filter((a) => a.status === "present").length;
  const absentCount = attendanceRecords.filter((a) => a.status === "absent").length;
  const lateCount = attendanceRecords.filter((a) => a.status === "late").length;
  const totalAttendance = attendanceRecords.length || 1;
  const attendanceRate = Math.round((presentCount / totalAttendance) * 100);

  const gradeSubjectMap = new Map<string, { ca1: number; ca2: number; exam: number; total: number; grade: string; term: string }>();
  for (const g of grades) {
    const name = g.subject?.name || "Unknown";
    const existing = gradeSubjectMap.get(name);
    if (g.type === "ca1" || g.type === "CA1") {
      if (existing) existing.ca1 = g.score;
      else gradeSubjectMap.set(name, { ca1: g.score, ca2: 0, exam: 0, total: 0, grade: g.grade, term: g.term || "—" });
    } else if (g.type === "ca2" || g.type === "CA2") {
      if (existing) existing.ca2 = g.score;
      else gradeSubjectMap.set(name, { ca1: 0, ca2: g.score, exam: 0, total: 0, grade: g.grade, term: g.term || "—" });
    } else if (g.type === "exam" || g.type === "EXAM") {
      if (existing) existing.exam = g.score;
      else gradeSubjectMap.set(name, { ca1: 0, ca2: 0, exam: g.score, total: 0, grade: g.grade, term: g.term || "—" });
    } else {
      if (existing) {
        existing.total = g.score;
        existing.grade = g.grade;
      } else {
        gradeSubjectMap.set(name, { ca1: 0, ca2: 0, exam: 0, total: g.score, grade: g.grade, term: g.term || "—" });
      }
    }
  }
  for (const [, v] of gradeSubjectMap) {
    if (v.total === 0) v.total = v.ca1 + v.ca2 + v.exam;
  }
  const gradeRows = Array.from(gradeSubjectMap.entries()).map(([subject, v]) => ({
    subject,
    ...v,
  }));

  const overallAverage = gradeRows.length > 0
    ? Math.round(gradeRows.reduce((s, g) => s + g.total, 0) / gradeRows.length)
    : 0;

  const totalFees = invoices.reduce((s, inv) => s + inv.schoolFee?.amount || inv.amount, 0);
  const totalPaid = invoices.reduce((s, inv) => s + inv.payments.reduce((ps, p) => ps + p.amount, 0), 0);
  const totalBalance = totalFees - totalPaid;

  const feeRecords = invoices.map((inv) => {
    const paid = inv.payments.reduce((s, p) => s + p.amount, 0);
    const amount = inv.schoolFee?.amount || inv.amount;
    let status: "paid" | "partial" | "unpaid" = "unpaid";
    if (paid >= amount) status = "paid";
    else if (paid > 0) status = "partial";
    return {
      term: inv.schoolFee?.name || "School Fee",
      amount,
      paid,
      status,
      dueDate: inv.dueDate || "",
      payments: inv.payments || [],
    };
  });

  const recentGrades = grades.slice(-5).reverse();
  const recentAttendance = attendanceRecords.slice(-5).reverse();

  const chartData = gradeRows.map((g) => ({
    name: g.subject.length > 10 ? g.subject.slice(0, 10) + "…" : g.subject,
    score: g.total,
  }));

  return (
    <motion.div {...fadeIn} className="space-y-6">
      {/* Back */}
      <button
        onClick={() => router.push("/dashboard/students")}
        className="flex items-center gap-2 text-white/35 hover:text-white/60 text-[13px] transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Students
      </button>

      {loading ? (
        <div className="space-y-4">
          <div className="h-40 rounded-2xl bg-white/[0.03] animate-pulse" />
          <div className="h-12 rounded-2xl bg-white/[0.03] animate-pulse" />
          <div className="h-64 rounded-2xl bg-white/[0.03] animate-pulse" />
        </div>
      ) : !student ? (
        <div className="text-center py-20">
          <User className="w-12 h-12 text-white/10 mx-auto mb-3" />
          <p className="text-white/30 text-[13px]">Student not found</p>
        </div>
      ) : (
        <>
          {/* Profile Header */}
          <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.07] overflow-hidden">
            <div className="h-28 bg-gradient-to-r from-[var(--blue-1)] via-[var(--blue-2)] to-[var(--blue-3)] relative">
              <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 80% 50%, rgba(40,255,156,0.1) 0%, transparent 50%)" }} />
            </div>
            <div className="px-6 pb-6 relative">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[var(--blue-3)] to-[var(--blue-1)] flex items-center justify-center text-white text-2xl font-bold border-4 border-[var(--bg-dark)] shadow-xl flex-shrink-0">
                  {initials}
                </div>
                <div className="flex-1 min-w-0 pb-1">
                  <h1 className="text-white text-xl font-bold font-display">{student.lastName} {student.firstName}</h1>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5">
                    <span className="px-2.5 py-0.5 rounded-lg bg-white/[0.06] text-white/40 text-[11px] font-medium border border-white/[0.08]">
                      {student.admissionNumber}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-white/[0.06] text-white/40 text-[11px] font-medium border border-white/[0.08]">
                      {student.class?.name || "Unassigned"}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-medium ${
                      student.status === "active"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-white/[0.05] text-white/30 border border-white/[0.06]"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${student.status === "active" ? "bg-emerald-400" : "bg-white/30"}`} />
                      {student.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 pb-1">
                  <button className="p-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/30 hover:text-white/60 hover:bg-white/[0.08] transition">
                    <Printer className="w-4 h-4" />
                  </button>
                  <button className="p-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/30 hover:text-white/60 hover:bg-white/[0.08] transition">
                    <Download className="w-4 h-4" />
                  </button>
                  <button className="px-4 py-2.5 rounded-xl bg-[var(--primary)] text-white text-[12px] font-semibold hover:brightness-110 transition shadow-lg shadow-[var(--primary)]/20 flex items-center gap-2">
                    <Edit3 className="w-3.5 h-3.5" /> Edit Profile
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.07] p-1.5 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-white/[0.08] text-white shadow-lg shadow-black/10"
                    : "text-white/30 hover:text-white/60 hover:bg-white/[0.04]"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Personal Info */}
              <div className="lg:col-span-2 bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.07] p-6">
                <h3 className="text-white/80 font-semibold text-[15px] mb-5">Personal Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: "Full Name", value: `${student.firstName} ${student.lastName}`, icon: User },
                    { label: "Admission No.", value: student.admissionNumber, icon: GraduationCap },
                    { label: "Class", value: student.class?.name || "Unassigned", icon: School },
                    { label: "Gender", value: student.gender || "Not specified", icon: Users },
                    { label: "Date of Birth", value: student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" }) : "Not specified", icon: Calendar },
                    { label: "Email", value: student.email || "Not provided", icon: Mail },
                    { label: "Phone", value: student.phone || "Not provided", icon: Phone },
                    { label: "Address", value: student.address || "Not provided", icon: MapPin },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                      <item.icon className="w-4 h-4 text-white/20 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-white/25 text-[10px] uppercase tracking-wider font-medium">{item.label}</p>
                        <p className="text-white/70 text-[13px] mt-0.5">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Guardian & Quick Stats */}
              <div className="space-y-4">
                <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.07] p-6">
                  <h3 className="text-white/80 font-semibold text-[15px] mb-4">Guardian / Parent</h3>
                  <div className="space-y-3">
                    {student.guardians && student.guardians.length > 0 ? (
                      student.guardians.slice(0, 1).map((g, i) => (
                        <div key={i} className="space-y-3">
                          <div className="px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                            <p className="text-white/25 text-[10px] uppercase tracking-wider font-medium">Name</p>
                            <p className="text-white/70 text-[13px] mt-0.5">{g.name || "—"}</p>
                          </div>
                          <div className="px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                            <p className="text-white/25 text-[10px] uppercase tracking-wider font-medium">Phone</p>
                            <p className="text-white/70 text-[13px] mt-0.5">{g.phone || "—"}</p>
                          </div>
                          <div className="px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                            <p className="text-white/25 text-[10px] uppercase tracking-wider font-medium">Email</p>
                            <p className="text-white/70 text-[13px] mt-0.5">{g.email || "—"}</p>
                          </div>
                          <div className="px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                            <p className="text-white/25 text-[10px] uppercase tracking-wider font-medium">Relationship</p>
                            <p className="text-white/70 text-[13px] mt-0.5">{g.relationship || "—"}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                          <p className="text-white/25 text-[10px] uppercase tracking-wider font-medium">Name</p>
                          <p className="text-white/70 text-[13px] mt-0.5">{student.guardianName || "—"}</p>
                        </div>
                        <div className="px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                          <p className="text-white/25 text-[10px] uppercase tracking-wider font-medium">Phone</p>
                          <p className="text-white/70 text-[13px] mt-0.5">{student.guardianPhone || "—"}</p>
                        </div>
                        <div className="px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                          <p className="text-white/25 text-[10px] uppercase tracking-wider font-medium">Email</p>
                          <p className="text-white/70 text-[13px] mt-0.5">{student.guardianEmail || "—"}</p>
                        </div>
                        <div className="px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                          <p className="text-white/25 text-[10px] uppercase tracking-wider font-medium">Relationship</p>
                          <p className="text-white/70 text-[13px] mt-0.5">{student.guardianRelation || "—"}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.07] p-6">
                  <h3 className="text-white/80 font-semibold text-[15px] mb-4">Academic Summary</h3>
                  <div className="space-y-3">
                    {[
                      { label: "Attendance Rate", value: `${attendanceRate}%`, icon: ClipboardCheck, color: "text-emerald-400" },
                      { label: "Average Score", value: `${overallAverage}%`, icon: Target, color: "text-blue-400" },
                      { label: "Total Subjects", value: gradeRows.length.toString(), icon: Award, color: "text-amber-400" },
                      { label: "Fee Balance", value: totalBalance > 0 ? `₦${totalBalance.toLocaleString()}` : "Cleared", icon: CreditCard, color: "text-purple-400" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                        <div className={`w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center`}>
                          <item.icon className={`w-4 h-4 ${item.color}`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-white/25 text-[10px] uppercase tracking-wider font-medium">{item.label}</p>
                          <p className="text-white/70 text-[13px] font-semibold">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity — Grades */}
            <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.07] p-6">
              <h3 className="text-white/80 font-semibold text-[15px] mb-5 flex items-center gap-2">
                <Activity className="w-4 h-4 text-white/40" /> Recent Activity
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Recent Grades */}
                <div>
                  <p className="text-white/40 text-[11px] uppercase tracking-wider font-semibold mb-3">Last 5 Grade Entries</p>
                  {recentGrades.length === 0 ? (
                    <div className="text-center py-6 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                      <BookOpen className="w-6 h-6 text-white/10 mx-auto mb-1" />
                      <p className="text-white/25 text-[12px]">No grades yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {recentGrades.map((g, i) => (
                        <div key={i} className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                          <div className="flex items-center gap-3">
                            <span className={`w-2 h-2 rounded-full ${
                              g.grade?.startsWith("A") ? "bg-emerald-400" :
                              g.grade?.startsWith("B") ? "bg-blue-400" :
                              g.grade?.startsWith("C") ? "bg-amber-400" : "bg-red-400"
                            }`} />
                            <span className="text-white/60 text-[12px]">{g.subject?.name || "Unknown"}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-white/80 text-[12px] font-semibold">{g.score}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              g.grade?.startsWith("A") ? "bg-emerald-500/15 text-emerald-400" :
                              g.grade?.startsWith("B") ? "bg-blue-500/15 text-blue-400" :
                              g.grade?.startsWith("C") ? "bg-amber-500/15 text-amber-400" :
                              "bg-red-500/15 text-red-400"
                            }`}>{g.grade || "—"}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Attendance */}
                <div>
                  <p className="text-white/40 text-[11px] uppercase tracking-wider font-semibold mb-3">Last 5 Attendance Records</p>
                  {recentAttendance.length === 0 ? (
                    <div className="text-center py-6 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                      <ClipboardCheck className="w-6 h-6 text-white/10 mx-auto mb-1" />
                      <p className="text-white/25 text-[12px]">No attendance records</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {recentAttendance.map((a, i) => (
                        <div key={i} className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                          <div className="flex items-center gap-3">
                            <span className={`w-2 h-2 rounded-full ${
                              a.status === "present" ? "bg-emerald-400" :
                              a.status === "absent" ? "bg-red-400" : "bg-amber-400"
                            }`} />
                            <span className="text-white/60 text-[12px]">
                              {new Date(a.date).toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "short" })}
                            </span>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-medium capitalize ${
                            a.status === "present" ? "bg-emerald-500/10 text-emerald-400" :
                            a.status === "absent" ? "bg-red-500/10 text-red-400" :
                            "bg-amber-500/10 text-amber-400"
                          }`}>
                            {a.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.07] p-6">
              <h3 className="text-white/80 font-semibold text-[15px] mb-4">Quick Actions</h3>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => toast("Message feature coming soon")} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[13px] font-medium hover:bg-blue-500/15 transition">
                  <MessageSquare className="w-4 h-4" /> Send Message
                </button>
                <button onClick={() => router.push("/dashboard/report-cards")} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[13px] font-medium hover:bg-emerald-500/15 transition">
                  <FileText className="w-4 h-4" /> View Report Card
                </button>
                <button onClick={() => window.print()} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[13px] font-medium hover:bg-purple-500/15 transition">
                  <Printer className="w-4 h-4" /> Print Profile
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Discipline Records */}
              <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.07] p-6">
                <h3 className="text-white/80 font-semibold text-[15px] mb-5">Discipline Records</h3>
                {!student.disciplineRecords || student.disciplineRecords.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-8 h-8 text-white/10 mx-auto mb-2" />
                    <p className="text-white/30 text-[13px]">No discipline records available</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {student.disciplineRecords.map((record) => (
                      <div key={record.id} className="px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-white/70 text-[13px] font-medium">{record.title}</p>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                            record.type === "major" ? "bg-red-500/15 text-red-400" :
                            record.type === "minor" ? "bg-amber-500/15 text-amber-400" :
                            "bg-blue-500/15 text-blue-400"
                          }`}>{record.type}</span>
                        </div>
                        {record.details && <p className="text-white/40 text-[12px] mt-0.5">{record.details}</p>}
                        <div className="flex items-center gap-3 mt-2 text-[11px] text-white/25">
                          <span>{new Date(record.date).toLocaleDateString("en-NG")}</span>
                          {record.action && <span>Action: {record.action}</span>}
                          {record.reportedBy && <span>Reported by: {record.reportedBy}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Hostel Information */}
              <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.07] p-6">
                <h3 className="text-white/80 font-semibold text-[15px] mb-5">Hostel Information</h3>
                {!student.hostels || student.hostels.length === 0 ? (
                  <div className="text-center py-8">
                    <School className="w-8 h-8 text-white/10 mx-auto mb-2" />
                    <p className="text-white/30 text-[13px]">No hostel allocation available</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {student.hostels.filter(h => h.status === "active").map((allocation) => (
                      <div key={allocation.id} className="px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-white/25 text-[10px] uppercase tracking-wider font-medium">Hostel</p>
                            <p className="text-white/70 text-[13px] mt-0.5">{allocation.hostel?.name || "—"}</p>
                          </div>
                          <div>
                            <p className="text-white/25 text-[10px] uppercase tracking-wider font-medium">Room</p>
                            <p className="text-white/70 text-[13px] mt-0.5">{allocation.room?.number || "—"}</p>
                          </div>
                          <div>
                            <p className="text-white/25 text-[10px] uppercase tracking-wider font-medium">Bed Number</p>
                            <p className="text-white/70 text-[13px] mt-0.5">{allocation.bedNumber || "—"}</p>
                          </div>
                          <div>
                            <p className="text-white/25 text-[10px] uppercase tracking-wider font-medium">Since</p>
                            <p className="text-white/70 text-[13px] mt-0.5">{new Date(allocation.startDate).toLocaleDateString("en-NG")}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Transport Information */}
            <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.07] p-6">
              <h3 className="text-white/80 font-semibold text-[15px] mb-5">Transport Information</h3>
              <div className="text-center py-8">
                <MapPin className="w-8 h-8 text-white/10 mx-auto mb-2" />
                <p className="text-white/30 text-[13px]">No transport information available</p>
              </div>
            </div>
            </div>
          )}

          {activeTab === "academic" && (
            <div className="space-y-4">
              {/* Bar Chart */}
              {gradeRows.length > 0 && (
                <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.07] p-6">
                  <h3 className="text-white/80 font-semibold text-[15px] mb-5">Subject Performance</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} barGap={4}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                        <Tooltip
                          contentStyle={{ background: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }}
                          labelStyle={{ color: "rgba(255,255,255,0.6)" }}
                          itemStyle={{ color: "rgba(255,255,255,0.9)" }}
                        />
                        <Bar dataKey="score" name="Total Score" fill="#0055ff" radius={[6, 6, 0, 0]} maxBarSize={36} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Grades Table */}
              <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.07] overflow-hidden">
                <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
                  <div>
                    <h3 className="text-white/80 font-semibold text-[15px]">Academic Results</h3>
                    <p className="text-white/25 text-[11px] mt-0.5">All recorded grades</p>
                  </div>
                  <button className="px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/40 text-[12px] font-medium hover:bg-white/[0.08] transition flex items-center gap-2">
                    <Download className="w-3.5 h-3.5" /> Download Report Card
                  </button>
                </div>
                {gradeRows.length === 0 ? (
                  <div className="text-center py-16">
                    <BookOpen className="w-10 h-10 text-white/10 mx-auto mb-3" />
                    <p className="text-white/30 text-[13px]">No grades recorded yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/[0.06]">
                          <th className="px-5 py-3 text-left text-[11px] font-semibold text-white/30 uppercase tracking-wider">Subject</th>
                          <th className="px-5 py-3 text-center text-[11px] font-semibold text-white/30 uppercase tracking-wider">CA1 (20)</th>
                          <th className="px-5 py-3 text-center text-[11px] font-semibold text-white/30 uppercase tracking-wider">CA2 (20)</th>
                          <th className="px-5 py-3 text-center text-[11px] font-semibold text-white/30 uppercase tracking-wider">Exam (60)</th>
                          <th className="px-5 py-3 text-center text-[11px] font-semibold text-white/30 uppercase tracking-wider">Total (100)</th>
                          <th className="px-5 py-3 text-center text-[11px] font-semibold text-white/30 uppercase tracking-wider">Grade</th>
                          <th className="px-5 py-3 text-center text-[11px] font-semibold text-white/30 uppercase tracking-wider">Term</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gradeRows.map((g, i) => (
                          <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition">
                            <td className="px-5 py-3.5 text-white/70 text-[13px] font-medium">{g.subject}</td>
                            <td className="px-5 py-3.5 text-center text-white/50 text-[13px]">{g.ca1 || "—"}</td>
                            <td className="px-5 py-3.5 text-center text-white/50 text-[13px]">{g.ca2 || "—"}</td>
                            <td className="px-5 py-3.5 text-center text-white/50 text-[13px]">{g.exam || "—"}</td>
                            <td className="px-5 py-3.5 text-center text-white/80 text-[13px] font-semibold">{g.total}</td>
                            <td className="px-5 py-3.5 text-center">
                              <span className={`inline-flex px-2.5 py-0.5 rounded-lg text-[11px] font-bold ${
                                g.grade?.startsWith("A") ? "bg-emerald-500/15 text-emerald-400" :
                                g.grade?.startsWith("B") ? "bg-blue-500/15 text-blue-400" :
                                g.grade?.startsWith("C") ? "bg-amber-500/15 text-amber-400" :
                                "bg-red-500/15 text-red-400"
                              }`}>
                                {g.grade || "—"}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-center text-white/40 text-[12px]">{g.term}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="px-5 py-4 border-t border-white/[0.06] flex items-center justify-between">
                      <p className="text-white/30 text-[12px]">Overall Average: <span className="text-white/70 font-semibold">{overallAverage}%</span></p>
                      <p className="text-white/30 text-[12px]">Subjects: <span className="text-white/70 font-semibold">{gradeRows.length}</span></p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "attendance" && (
            <div className="space-y-4">
              {/* Attendance Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Total Days", value: attendanceRecords.length, icon: Calendar, color: "from-blue-500 to-blue-700" },
                  { label: "Present", value: presentCount, icon: CheckCircle2, color: "from-emerald-500 to-emerald-700" },
                  { label: "Absent", value: absentCount, icon: XCircle, color: "from-red-500 to-red-700" },
                  { label: "Attendance Rate", value: `${attendanceRate}%`, icon: TrendingUp, color: "from-purple-500 to-purple-700" },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.07] p-5"
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-white text-xl font-bold font-display">{stat.value}</p>
                    <p className="text-white/30 text-[11px] mt-1">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Attendance Table */}
              <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.07] overflow-hidden">
                <div className="p-5 border-b border-white/[0.06]">
                  <h3 className="text-white/80 font-semibold text-[15px]">Attendance Records</h3>
                </div>
                {attendanceRecords.length === 0 ? (
                  <div className="text-center py-16">
                    <ClipboardCheck className="w-10 h-10 text-white/10 mx-auto mb-3" />
                    <p className="text-white/30 text-[13px]">No attendance records found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/[0.06]">
                          <th className="px-5 py-3 text-left text-[11px] font-semibold text-white/30 uppercase tracking-wider">Date</th>
                          <th className="px-5 py-3 text-left text-[11px] font-semibold text-white/30 uppercase tracking-wider">Day</th>
                          <th className="px-5 py-3 text-center text-[11px] font-semibold text-white/30 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendanceRecords.map((a, i) => (
                          <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition">
                            <td className="px-5 py-3.5 text-white/60 text-[13px]">
                              {new Date(a.date).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}
                            </td>
                            <td className="px-5 py-3.5 text-white/40 text-[13px]">
                              {new Date(a.date).toLocaleDateString("en-NG", { weekday: "long" })}
                            </td>
                            <td className="px-5 py-3.5 text-center">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-semibold capitalize ${
                                a.status === "present"
                                  ? "bg-emerald-500/15 text-emerald-400"
                                  : a.status === "absent"
                                  ? "bg-red-500/15 text-red-400"
                                  : "bg-amber-500/15 text-amber-400"
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  a.status === "present" ? "bg-emerald-400" :
                                  a.status === "absent" ? "bg-red-400" : "bg-amber-400"
                                }`} />
                                {a.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "fees" && (
            <div className="space-y-4">
              {/* Fee Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: "Total Fees", value: `₦${totalFees.toLocaleString()}`, color: "from-blue-500 to-blue-700" },
                  { label: "Total Paid", value: `₦${totalPaid.toLocaleString()}`, color: "from-emerald-500 to-emerald-700" },
                  { label: "Balance", value: `₦${totalBalance.toLocaleString()}`, color: totalBalance > 0 ? "from-amber-500 to-amber-700" : "from-emerald-500 to-emerald-700" },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.07] p-5"
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-white text-xl font-bold font-display">{stat.value}</p>
                    <p className="text-white/30 text-[11px] mt-1">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Invoices */}
              <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.07] overflow-hidden">
                <div className="p-5 border-b border-white/[0.06]">
                  <h3 className="text-white/80 font-semibold text-[15px]">Invoices</h3>
                </div>
                {feeRecords.length === 0 ? (
                  <div className="text-center py-16">
                    <CreditCard className="w-10 h-10 text-white/10 mx-auto mb-3" />
                    <p className="text-white/30 text-[13px]">No fee records found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/[0.06]">
                          <th className="px-5 py-3 text-left text-[11px] font-semibold text-white/30 uppercase tracking-wider">Fee Name</th>
                          <th className="px-5 py-3 text-center text-[11px] font-semibold text-white/30 uppercase tracking-wider">Amount</th>
                          <th className="px-5 py-3 text-center text-[11px] font-semibold text-white/30 uppercase tracking-wider">Paid</th>
                          <th className="px-5 py-3 text-center text-[11px] font-semibold text-white/30 uppercase tracking-wider">Status</th>
                          <th className="px-5 py-3 text-center text-[11px] font-semibold text-white/30 uppercase tracking-wider">Due Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {feeRecords.map((f, i) => (
                          <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition">
                            <td className="px-5 py-3.5 text-white/70 text-[13px] font-medium">{f.term}</td>
                            <td className="px-5 py-3.5 text-center text-white/60 text-[13px]">₦{f.amount.toLocaleString()}</td>
                            <td className="px-5 py-3.5 text-center text-emerald-400 text-[13px] font-semibold">₦{f.paid.toLocaleString()}</td>
                            <td className="px-5 py-3.5 text-center">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-medium ${
                                f.status === "paid"
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : f.status === "partial"
                                  ? "bg-amber-500/10 text-amber-400"
                                  : "bg-red-500/10 text-red-400"
                              }`}>
                                {f.status === "paid" ? <CheckCircle2 className="w-3 h-3" /> :
                                 f.status === "partial" ? <AlertCircle className="w-3 h-3" /> :
                                 <XCircle className="w-3 h-3" />}
                                {f.status === "paid" ? "Paid" : f.status === "partial" ? "Partial" : "Unpaid"}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-center text-white/40 text-[12px]">
                              {f.dueDate ? new Date(f.dueDate).toLocaleDateString("en-NG") : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Payment History */}
              {feeRecords.some((f) => f.payments.length > 0) && (
                <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.07] overflow-hidden">
                  <div className="p-5 border-b border-white/[0.06]">
                    <h3 className="text-white/80 font-semibold text-[15px]">Payment History</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/[0.06]">
                          <th className="px-5 py-3 text-left text-[11px] font-semibold text-white/30 uppercase tracking-wider">Fee</th>
                          <th className="px-5 py-3 text-center text-[11px] font-semibold text-white/30 uppercase tracking-wider">Amount</th>
                          <th className="px-5 py-3 text-center text-[11px] font-semibold text-white/30 uppercase tracking-wider">Method</th>
                          <th className="px-5 py-3 text-center text-[11px] font-semibold text-white/30 uppercase tracking-wider">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {feeRecords.flatMap((f, fi) =>
                          f.payments.map((p, pi) => (
                            <tr key={`${fi}-${pi}`} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition">
                              <td className="px-5 py-3.5 text-white/60 text-[13px]">{f.term}</td>
                              <td className="px-5 py-3.5 text-center text-emerald-400 text-[13px] font-semibold">₦{p.amount.toLocaleString()}</td>
                              <td className="px-5 py-3.5 text-center text-white/40 text-[12px] capitalize">{p.method || "—"}</td>
                              <td className="px-5 py-3.5 text-center text-white/40 text-[12px]">
                                {p.paidAt ? new Date(p.paidAt).toLocaleDateString("en-NG") : "—"}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "medical" && (
            <div className="space-y-4">
              {/* Medical Info */}
              <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.07] p-6">
                <h3 className="text-white/80 font-semibold text-[15px] mb-5 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-white/40" /> Medical Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { label: "Blood Group", value: student.medicalRecords?.[0]?.bloodGroup || student.bloodGroup || "Not recorded", icon: Droplets, color: "text-red-400" },
                    { label: "Genotype", value: student.medicalRecords?.[0]?.genotype || "Not recorded", icon: Activity, color: "text-blue-400" },
                    { label: "Allergies", value: student.medicalRecords?.[0]?.allergies || "None", icon: AlertTriangle, color: "text-amber-400" },
                    { label: "Medical Conditions", value: student.medicalRecords?.[0]?.conditions || "None", icon: Pill, color: "text-purple-400" },
                    { label: "Emergency Contact", value: student.guardians?.[0]?.name || student.guardianName || "—", icon: User, color: "text-emerald-400" },
                    { label: "Emergency Phone", value: student.guardians?.[0]?.phone || student.guardianPhone || "—", icon: Phone, color: "text-cyan-400" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                      <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center flex-shrink-0">
                        <item.icon className={`w-4 h-4 ${item.color}`} />
                      </div>
                      <div>
                        <p className="text-white/25 text-[10px] uppercase tracking-wider font-medium">{item.label}</p>
                        <p className="text-white/70 text-[13px] mt-0.5">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Clinic Visit History */}
              <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.07] overflow-hidden">
                <div className="p-5 border-b border-white/[0.06]">
                  <h3 className="text-white/80 font-semibold text-[15px] flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-white/40" /> Clinic Visit History
                  </h3>
                </div>
                {student.medicalRecords?.[0]?.clinicVisits && student.medicalRecords[0].clinicVisits.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/[0.06]">
                          <th className="px-5 py-3 text-left text-[11px] font-semibold text-white/30 uppercase tracking-wider">Date</th>
                          <th className="px-5 py-3 text-left text-[11px] font-semibold text-white/30 uppercase tracking-wider">Reason</th>
                          <th className="px-5 py-3 text-left text-[11px] font-semibold text-white/30 uppercase tracking-wider">Doctor</th>
                          <th className="px-5 py-3 text-left text-[11px] font-semibold text-white/30 uppercase tracking-wider">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {student.medicalRecords[0].clinicVisits.map((visit) => (
                          <tr key={visit.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition">
                            <td className="px-5 py-3.5 text-white/60 text-[13px]">
                              {new Date(visit.date).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                            </td>
                            <td className="px-5 py-3.5 text-white/70 text-[13px] font-medium">{visit.reason}</td>
                            <td className="px-5 py-3.5 text-white/40 text-[12px]">{visit.doctor || "—"}</td>
                            <td className="px-5 py-3.5 text-white/40 text-[12px]">{visit.notes || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Stethoscope className="w-10 h-10 text-white/10 mx-auto mb-3" />
                    <p className="text-white/30 text-[13px]">No clinic visits recorded</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "documents" && (
            <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.07] p-6">
              <h3 className="text-white/80 font-semibold text-[15px] mb-5 flex items-center gap-2">
                <FileText className="w-4 h-4 text-white/40" /> Documents
              </h3>
              {!student.documents || student.documents.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-10 h-10 text-white/10 mx-auto mb-3" />
                  <p className="text-white/30 text-[13px]">No documents uploaded</p>
                  <p className="text-white/20 text-[11px] mt-1">Upload documents such as birth certificates, ID cards, or medical records.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {student.documents.map((doc, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                          <FileText className="w-4 h-4 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-white/70 text-[13px] font-medium">{doc.name}</p>
                          <p className="text-white/25 text-[10px]">{doc.type} · {doc.size} · Uploaded {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString("en-NG") : "—"}</p>
                        </div>
                      </div>
                      <button className="p-2 rounded-lg text-white/25 hover:text-white/60 hover:bg-white/[0.06] transition">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
