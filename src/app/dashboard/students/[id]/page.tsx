"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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
  X,
  Activity,
  Stethoscope,
  Droplets,
  AlertTriangle,
  Pill,
  Upload,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/school-config";
import { useUploadThing } from "@/lib/uploadthing-helpers";

const tabs = [
  { id: "overview", label: "Overview", icon: User },
  { id: "academic", label: "Academic", icon: BookOpen },
  { id: "attendance", label: "Attendance", icon: ClipboardCheck },
  { id: "fees", label: "Fees", icon: CreditCard },
  { id: "medical", label: "Medical", icon: Heart },
  { id: "documents", label: "Documents", icon: FileText },
];

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
  documents?: { name: string; type: string; size: string; url: string; uploadedAt: string }[];
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
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageSubject, setMessageSubject] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  const { data: session } = useSession();
  const userRoles: string[] = (session?.user as any)?.roles?.map((r: any) => r.name) || [];
  const canUploadDocs = userRoles.some(r => ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"].includes(r));
  const { startUpload, isUploading } = useUploadThing("document", {
    onClientUploadComplete: () => { toast.success("Document uploaded successfully"); window.location.reload(); },
    onUploadError: () => { toast.error("Failed to upload document"); },
  });

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await fetch(`/api/students/${params.id}`);
        if (!res.ok) { setLoading(false); return; }
        const data = await res.json();
        setStudent(data);
      } catch { toast.error("Failed to load student details"); }
      setLoading(false);
    };
    fetchStudent();
  }, [params.id]);

  const initials = student ? `${student.firstName?.[0] || ""}${student.lastName?.[0] || ""}`.toUpperCase() : "";
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
    if (g.type === "ca1" || g.type === "CA1") { if (existing) existing.ca1 = g.score; else gradeSubjectMap.set(name, { ca1: g.score, ca2: 0, exam: 0, total: 0, grade: g.grade, term: g.term || "—" }); }
    else if (g.type === "ca2" || g.type === "CA2") { if (existing) existing.ca2 = g.score; else gradeSubjectMap.set(name, { ca1: 0, ca2: g.score, exam: 0, total: 0, grade: g.grade, term: g.term || "—" }); }
    else if (g.type === "exam" || g.type === "EXAM") { if (existing) existing.exam = g.score; else gradeSubjectMap.set(name, { ca1: 0, ca2: 0, exam: g.score, total: 0, grade: g.grade, term: g.term || "—" }); }
    else { if (existing) { existing.total = g.score; existing.grade = g.grade; } else gradeSubjectMap.set(name, { ca1: 0, ca2: 0, exam: 0, total: g.score, grade: g.grade, term: g.term || "—" }); }
  }
  for (const [, v] of gradeSubjectMap) { if (v.total === 0) v.total = v.ca1 + v.ca2 + v.exam; }
  const gradeRows = Array.from(gradeSubjectMap.entries()).map(([subject, v]) => ({ subject, ...v }));
  const overallAverage = gradeRows.length > 0 ? Math.round(gradeRows.reduce((s, g) => s + g.total, 0) / gradeRows.length) : 0;
  const totalFees = invoices.reduce((s, inv) => s + inv.schoolFee?.amount || inv.amount, 0);
  const totalPaid = invoices.reduce((s, inv) => s + inv.payments.reduce((ps, p) => ps + p.amount, 0), 0);
  const totalBalance = totalFees - totalPaid;
  const feeRecords = invoices.map((inv) => {
    const paid = inv.payments.reduce((s, p) => s + p.amount, 0);
    const amount = inv.schoolFee?.amount || inv.amount;
    let status: "paid" | "partial" | "unpaid" = "unpaid";
    if (paid >= amount) status = "paid"; else if (paid > 0) status = "partial";
    return { term: inv.schoolFee?.name || "School Fee", amount, paid, status, dueDate: inv.dueDate || "", payments: inv.payments || [] };
  });
  const recentGrades = grades.slice(-5).reverse();
  const recentAttendance = attendanceRecords.slice(-5).reverse();
  const chartData = gradeRows.map((g) => ({ name: g.subject.length > 10 ? g.subject.slice(0, 10) + "…" : g.subject, score: g.total }));

  const statusBadge = (status: string) => {
    const s = status === "active" ? { bg: "#dcfce7", color: "#16a34a", border: "#bbf7d0" } : { bg: "#f1f5f9", color: "#94a3b8", border: "#e2e8f0" };
    return <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "3px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: 500, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: s.color }} /> {status}
    </span>;
  };

  const gradeBadge = (grade: string) => {
    const c = grade?.startsWith("A") ? { bg: "#dcfce7", color: "#16a34a" } : grade?.startsWith("B") ? { bg: "#dbeafe", color: "#2563eb" } : grade?.startsWith("C") ? { bg: "#fef3c7", color: "#d97706" } : { bg: "#fee2e2", color: "#dc2626" };
    return <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 600, background: c.bg, color: c.color }}>{grade || "—"}</span>;
  };

  const attendanceBadge = (status: string) => {
    const c = status === "present" ? { bg: "#dcfce7", color: "#16a34a" } : status === "absent" ? { bg: "#fee2e2", color: "#dc2626" } : { bg: "#fef3c7", color: "#d97706" };
    return <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: 500, background: c.bg, color: c.color, textTransform: "capitalize" }}>
      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: c.color }} /> {status}
    </span>;
  };

  const infoRow = (label: string, value: string, icon: any) => (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "12px 16px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
      {(() => { const I = icon; return <I style={{ width: "16px", height: "16px", color: "#94a3b8", marginTop: "2px", flexShrink: 0 }} />; })()}
      <div>
        <p style={{ margin: 0, fontSize: "10px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
        <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#0f172a" }}>{value}</p>
      </div>
    </div>
  );

  if (loading) return (
    <div style={{ padding: "0 16px 32px", maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ height: "160px", borderRadius: "20px", background: "#f1f5f9", animation: "pulse 2s infinite" }} />
      <div style={{ height: "48px", borderRadius: "16px", background: "#f1f5f9", animation: "pulse 2s infinite" }} />
      <div style={{ height: "400px", borderRadius: "20px", background: "#f1f5f9", animation: "pulse 2s infinite" }} />
    </div>
  );

  if (!student) return (
    <div style={{ padding: "64px 16px", textAlign: "center" }}>
      <User style={{ width: "48px", height: "48px", color: "#94a3b8", margin: "0 auto 12px" }} />
      <p style={{ margin: 0, color: "#94a3b8", fontSize: "14px" }}>Student not found</p>
    </div>
  );

  return (
    <div style={{ padding: "0 16px 32px", maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Back */}
      <button onClick={() => router.push("/dashboard/students")} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 0", border: "none", background: "transparent", color: "#94a3b8", fontSize: "13px", cursor: "pointer", marginTop: "16px" }}>
        <ArrowLeft style={{ width: "16px", height: "16px" }} /> Back to Students
      </button>

      {/* Profile Header */}
      <div style={{ borderRadius: "20px", border: "1px solid #e2e8f0", overflow: "hidden", background: "#ffffff" }}>
        <div style={{ background: "linear-gradient(135deg, #0a2a6e, #0055ff)", position: "relative", padding: "32px 28px 0" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 80% 50%, rgba(16,185,129,0.15) 0%, transparent 60%)" }} />
          <div style={{ display: "flex", alignItems: "flex-end", gap: "20px", position: "relative", zIndex: 1, paddingBottom: "20px" }}>
            <div style={{ width: "96px", height: "96px", borderRadius: "20px", background: "linear-gradient(135deg, #ffffff, #e2e8f0)", display: "flex", alignItems: "center", justifyContent: "center", color: "#0055ff", fontSize: "32px", fontWeight: 800, border: "4px solid #ffffff", boxShadow: "0 4px 20px rgba(0,0,0,0.15)", flexShrink: 0, letterSpacing: "-0.02em" }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em" }}>{student.firstName} {student.lastName}</h1>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px", marginTop: "10px" }}>
                <span style={{ padding: "4px 10px", borderRadius: "8px", background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.85)", fontSize: "12px", fontWeight: 500, border: "1px solid rgba(255,255,255,0.2)" }}>{student.admissionNumber}</span>
                <span style={{ padding: "4px 10px", borderRadius: "8px", background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.85)", fontSize: "12px", fontWeight: 500, border: "1px solid rgba(255,255,255,0.2)" }}>{student.class?.name || "Unassigned"}</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: 500, background: student.status === "active" ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.15)", color: student.status === "active" ? "#6ee7b7" : "rgba(255,255,255,0.7)", border: `1px solid ${student.status === "active" ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.2)"}` }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: student.status === "active" ? "#6ee7b7" : "rgba(255,255,255,0.5)" }} /> {student.status}
                </span>
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px", paddingBottom: "4px" }}>
              <button title="Print" onClick={() => window.print()} style={{ width: "40px", height: "40px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.12)", color: "#ffffff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Printer style={{ width: "16px", height: "16px" }} /></button>
              <button title="Download" onClick={() => window.print()} style={{ width: "40px", height: "40px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.12)", color: "#ffffff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Download style={{ width: "16px", height: "16px" }} /></button>
              <button onClick={() => router.push(`/dashboard/students?edit=${student.id}`)} style={{ padding: "10px 20px", borderRadius: "12px", background: "#ffffff", color: "#0055ff", fontSize: "12px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}><Edit3 style={{ width: "14px", height: "14px" }} /> Edit Profile</button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", background: "#f1f5f9", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "6px", overflowX: "auto" }}>
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", borderRadius: "12px", fontSize: "13px", fontWeight: 500, border: "none", cursor: "pointer", whiteSpace: "nowrap", background: active ? "#0055ff" : "transparent", color: active ? "#ffffff" : "#94a3b8", transition: "all 0.15s" }}>
            <tab.icon style={{ width: "16px", height: "16px" }} /> {tab.label}
          </button>;
        })}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "16px" }}>
            {/* Personal Info */}
            <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px" }}>
              <h3 style={{ margin: "0 0 20px", fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>Personal Information</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {infoRow("Full Name", `${student.firstName} ${student.lastName}`, User)}
                {infoRow("Admission No.", student.admissionNumber, GraduationCap)}
                {infoRow("Class", student.class?.name || "Unassigned", School)}
                {infoRow("Gender", student.gender || "Not specified", Users)}
                {infoRow("Date of Birth", student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" }) : "Not specified", Calendar)}
                {infoRow("Email", student.email || "Not provided", Mail)}
                {infoRow("Phone", student.phone || "Not provided", Phone)}
                {infoRow("Address", student.address || "Not provided", MapPin)}
              </div>
            </div>

            {/* Right column */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Guardian */}
              <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px" }}>
                <h3 style={{ margin: "0 0 16px", fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>Guardian / Parent</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {student.guardians && student.guardians.length > 0 ? student.guardians.slice(0, 1).map((g, i) => (
                    <div key={i} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {infoRow("Name", g.name || "—", User)}
                      {infoRow("Phone", g.phone || "—", Phone)}
                      {infoRow("Email", g.email || "—", Mail)}
                      {infoRow("Relationship", g.relationship || "—", Users)}
                    </div>
                  )) : (
                    <>
                      {infoRow("Name", student.guardianName || "—", User)}
                      {infoRow("Phone", student.guardianPhone || "—", Phone)}
                      {infoRow("Email", student.guardianEmail || "—", Mail)}
                      {infoRow("Relationship", student.guardianRelation || "—", Users)}
                    </>
                  )}
                </div>
              </div>

              {/* Academic Summary */}
              <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px" }}>
                <h3 style={{ margin: "0 0 16px", fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>Academic Summary</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {[
                    { label: "Attendance Rate", value: `${attendanceRate}%`, icon: ClipboardCheck, color: "#16a34a" },
                    { label: "Average Score", value: `${overallAverage}%`, icon: Target, color: "#0055ff" },
                    { label: "Total Subjects", value: gradeRows.length.toString(), icon: Award, color: "#d97706" },
                    { label: "Fee Balance", value: totalBalance > 0 ? formatCurrency(totalBalance) : "Cleared", icon: CreditCard, color: totalBalance > 0 ? "#d97706" : "#16a34a" },
                  ].map((item, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: `${item.color}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <item.icon style={{ width: "16px", height: "16px", color: item.color }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: "10px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.label}</p>
                        <p style={{ margin: "4px 0 0", fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px" }}>
            <h3 style={{ margin: "0 0 20px", fontSize: "15px", fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
              <Activity style={{ width: "16px", height: "16px", color: "#64748b" }} /> Recent Activity
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {/* Grades */}
              <div>
                <p style={{ margin: "0 0 12px", fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Last 5 Grade Entries</p>
                {recentGrades.length === 0 ? (
                  <div style={{ padding: "24px", textAlign: "center", borderRadius: "12px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                    <BookOpen style={{ width: "24px", height: "24px", color: "#94a3b8", margin: "0 auto 8px" }} />
                    <p style={{ margin: 0, color: "#94a3b8", fontSize: "12px" }}>No grades yet</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {recentGrades.map((g, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: g.grade?.startsWith("A") ? "#16a34a" : g.grade?.startsWith("B") ? "#2563eb" : g.grade?.startsWith("C") ? "#d97706" : "#dc2626" }} />
                          <span style={{ fontSize: "12px", color: "#475569" }}>{g.subject?.name || "Unknown"}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>{g.score}</span>
                          {gradeBadge(g.grade)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Attendance */}
              <div>
                <p style={{ margin: "0 0 12px", fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Last 5 Attendance Records</p>
                {recentAttendance.length === 0 ? (
                  <div style={{ padding: "24px", textAlign: "center", borderRadius: "12px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                    <ClipboardCheck style={{ width: "24px", height: "24px", color: "#94a3b8", margin: "0 auto 8px" }} />
                    <p style={{ margin: 0, color: "#94a3b8", fontSize: "12px" }}>No attendance records</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {recentAttendance.map((a, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: a.status === "present" ? "#16a34a" : a.status === "absent" ? "#dc2626" : "#d97706" }} />
                          <span style={{ fontSize: "12px", color: "#475569" }}>{new Date(a.date).toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "short" })}</span>
                        </div>
                        {attendanceBadge(a.status)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>Quick Actions</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              <button onClick={() => setShowMessageModal(true)} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 20px", borderRadius: "12px", border: "1px solid #dbeafe", background: "#eff6ff", color: "#2563eb", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}><MessageSquare style={{ width: "16px", height: "16px" }} /> Send Message</button>
              <button onClick={() => router.push("/dashboard/report-cards")} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 20px", borderRadius: "12px", border: "1px solid #bbf7d0", background: "#f0fdf4", color: "#16a34a", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}><FileText style={{ width: "16px", height: "16px" }} /> View Report Card</button>
              <button onClick={() => window.print()} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 20px", borderRadius: "12px", border: "1px solid #e9d5ff", background: "#faf5ff", color: "#9333ea", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}><Printer style={{ width: "16px", height: "16px" }} /> Print Profile</button>
            </div>
          </div>

          {/* Discipline & Hostel */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px" }}>
              <h3 style={{ margin: "0 0 20px", fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>Discipline Records</h3>
              {!student.disciplineRecords || student.disciplineRecords.length === 0 ? (
                <div style={{ padding: "32px", textAlign: "center" }}>
                  <CheckCircle2 style={{ width: "32px", height: "32px", color: "#16a34a", margin: "0 auto 8px" }} />
                  <p style={{ margin: 0, color: "#94a3b8", fontSize: "13px" }}>No discipline records</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {student.disciplineRecords.map((r) => (
                    <div key={r.id} style={{ padding: "14px 16px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                        <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>{r.title}</p>
                        <span style={{ padding: "2px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: 500, ...(r.type === "major" ? { background: "#fee2e2", color: "#dc2626" } : r.type === "minor" ? { background: "#fef3c7", color: "#d97706" } : { background: "#dbeafe", color: "#2563eb" }) }}>{r.type}</span>
                      </div>
                      {r.details && <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>{r.details}</p>}
                      <div style={{ display: "flex", gap: "12px", marginTop: "8px", fontSize: "11px", color: "#94a3b8" }}>
                        <span>{new Date(r.date).toLocaleDateString("en-NG")}</span>
                        {r.action && <span>Action: {r.action}</span>}
                        {r.reportedBy && <span>By: {r.reportedBy}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px" }}>
              <h3 style={{ margin: "0 0 20px", fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>Hostel Information</h3>
              {!student.hostels || student.hostels.length === 0 ? (
                <div style={{ padding: "32px", textAlign: "center" }}>
                  <School style={{ width: "32px", height: "32px", color: "#94a3b8", margin: "0 auto 8px" }} />
                  <p style={{ margin: 0, color: "#94a3b8", fontSize: "13px" }}>No hostel allocation</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {student.hostels.filter(h => h.status === "active").map((a) => (
                    <div key={a.id} style={{ padding: "14px 16px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <div><p style={{ margin: 0, fontSize: "10px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase" }}>Hostel</p><p style={{ margin: "4px 0 0", fontSize: "13px", color: "#0f172a" }}>{a.hostel?.name || "—"}</p></div>
                        <div><p style={{ margin: 0, fontSize: "10px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase" }}>Room</p><p style={{ margin: "4px 0 0", fontSize: "13px", color: "#0f172a" }}>{a.room?.number || "—"}</p></div>
                        <div><p style={{ margin: 0, fontSize: "10px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase" }}>Bed</p><p style={{ margin: "4px 0 0", fontSize: "13px", color: "#0f172a" }}>{a.bedNumber || "—"}</p></div>
                        <div><p style={{ margin: 0, fontSize: "10px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase" }}>Since</p><p style={{ margin: "4px 0 0", fontSize: "13px", color: "#0f172a" }}>{new Date(a.startDate).toLocaleDateString("en-NG")}</p></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ACADEMIC TAB */}
      {activeTab === "academic" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {gradeRows.length > 0 && (
            <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px" }}>
              <h3 style={{ margin: "0 0 20px", fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>Subject Performance</h3>
              <div style={{ height: "256px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, fontSize: 12 }} />
                    <Bar dataKey="score" name="Total Score" fill="#0055ff" radius={[6, 6, 0, 0]} maxBarSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <div style={{ padding: "24px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div><h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>Academic Results</h3><p style={{ margin: "4px 0 0", fontSize: "11px", color: "#94a3b8" }}>All recorded grades</p></div>
              <button onClick={() => router.push(`/dashboard/report-cards?studentId=${student.id}`)} style={{ padding: "8px 16px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#ffffff", color: "#475569", fontSize: "12px", fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}><Download style={{ width: "14px", height: "14px" }} /> Download Report</button>
            </div>
            {gradeRows.length === 0 ? (
              <div style={{ padding: "64px", textAlign: "center" }}>
                <BookOpen style={{ width: "40px", height: "40px", color: "#94a3b8", margin: "0 auto 12px" }} />
                <p style={{ margin: 0, color: "#94a3b8", fontSize: "13px" }}>No grades recorded yet</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                      {["Subject", "CA1 (20)", "CA2 (20)", "Exam (60)", "Total (100)", "Grade", "Term"].map((h) => (
                        <th key={h} style={{ padding: "12px 20px", textAlign: h === "Subject" ? "left" : "center", fontSize: "11px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #f1f5f9", background: "#f8fafc" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {gradeRows.map((g, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #f8fafc" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                        <td style={{ padding: "14px 20px", fontSize: "13px", fontWeight: 500, color: "#0f172a" }}>{g.subject}</td>
                        <td style={{ padding: "14px 20px", textAlign: "center", fontSize: "13px", color: "#64748b" }}>{g.ca1 || "—"}</td>
                        <td style={{ padding: "14px 20px", textAlign: "center", fontSize: "13px", color: "#64748b" }}>{g.ca2 || "—"}</td>
                        <td style={{ padding: "14px 20px", textAlign: "center", fontSize: "13px", color: "#64748b" }}>{g.exam || "—"}</td>
                        <td style={{ padding: "14px 20px", textAlign: "center", fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>{g.total}</td>
                        <td style={{ padding: "14px 20px", textAlign: "center" }}>{gradeBadge(g.grade)}</td>
                        <td style={{ padding: "14px 20px", textAlign: "center", fontSize: "12px", color: "#64748b" }}>{g.term}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ padding: "16px 20px", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>Overall Average: <span style={{ fontWeight: 700, color: "#0f172a" }}>{overallAverage}%</span></p>
                  <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>Subjects: <span style={{ fontWeight: 700, color: "#0f172a" }}>{gradeRows.length}</span></p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ATTENDANCE TAB */}
      {activeTab === "attendance" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
            {[
              { label: "Total Days", value: attendanceRecords.length, icon: Calendar, bg: "linear-gradient(135deg, #0055ff, #0033cc)" },
              { label: "Present", value: presentCount, icon: CheckCircle2, bg: "linear-gradient(135deg, #10b981, #059669)" },
              { label: "Absent", value: absentCount, icon: XCircle, bg: "linear-gradient(135deg, #ef4444, #dc2626)" },
              { label: "Attendance Rate", value: `${attendanceRate}%`, icon: TrendingUp, bg: "linear-gradient(135deg, #8b5cf6, #7c3aed)" },
            ].map((s, i) => (
              <div key={i} style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "20px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
                  <s.icon style={{ width: "20px", height: "20px", color: "#ffffff" }} />
                </div>
                <p style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "#0f172a" }}>{s.value}</p>
                <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#94a3b8" }}>{s.label}</p>
              </div>
            ))}
          </div>

          <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9" }}>
              <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>Attendance Records</h3>
            </div>
            {attendanceRecords.length === 0 ? (
              <div style={{ padding: "64px", textAlign: "center" }}>
                <ClipboardCheck style={{ width: "40px", height: "40px", color: "#94a3b8", margin: "0 auto 12px" }} />
                <p style={{ margin: 0, color: "#94a3b8", fontSize: "13px" }}>No attendance records</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                      {["Date", "Day", "Status"].map((h) => (
                        <th key={h} style={{ padding: "12px 20px", textAlign: h === "Status" ? "center" : "left", fontSize: "11px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #f1f5f9", background: "#f8fafc" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceRecords.map((a, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #f8fafc" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                        <td style={{ padding: "14px 20px", fontSize: "13px", color: "#0f172a" }}>{new Date(a.date).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}</td>
                        <td style={{ padding: "14px 20px", fontSize: "13px", color: "#64748b" }}>{new Date(a.date).toLocaleDateString("en-NG", { weekday: "long" })}</td>
                        <td style={{ padding: "14px 20px", textAlign: "center" }}>{attendanceBadge(a.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FEES TAB */}
      {activeTab === "fees" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
            {[
              { label: "Total Fees", value: formatCurrency(totalFees), bg: "linear-gradient(135deg, #0055ff, #0033cc)" },
              { label: "Total Paid", value: formatCurrency(totalPaid), bg: "linear-gradient(135deg, #10b981, #059669)" },
              { label: "Balance", value: formatCurrency(totalBalance), bg: totalBalance > 0 ? "linear-gradient(135deg, #f59e0b, #d97706)" : "linear-gradient(135deg, #10b981, #059669)" },
            ].map((s, i) => (
              <div key={i} style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "20px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
                  <CreditCard style={{ width: "20px", height: "20px", color: "#ffffff" }} />
                </div>
                <p style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "#0f172a" }}>{s.value}</p>
                <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#94a3b8" }}>{s.label}</p>
              </div>
            ))}
          </div>

          <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9" }}>
              <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>Invoices</h3>
            </div>
            {feeRecords.length === 0 ? (
              <div style={{ padding: "64px", textAlign: "center" }}>
                <CreditCard style={{ width: "40px", height: "40px", color: "#94a3b8", margin: "0 auto 12px" }} />
                <p style={{ margin: 0, color: "#94a3b8", fontSize: "13px" }}>No fee records</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                      {["Fee Name", "Amount", "Paid", "Status", "Due Date"].map((h) => (
                        <th key={h} style={{ padding: "12px 20px", textAlign: "center", fontSize: "11px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #f1f5f9", background: "#f8fafc" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {feeRecords.map((f, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #f8fafc" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                        <td style={{ padding: "14px 20px", fontSize: "13px", fontWeight: 500, color: "#0f172a" }}>{f.term}</td>
                        <td style={{ padding: "14px 20px", textAlign: "center", fontSize: "13px", color: "#0f172a" }}>{formatCurrency(f.amount)}</td>
                        <td style={{ padding: "14px 20px", textAlign: "center", fontSize: "13px", fontWeight: 600, color: "#16a34a" }}>{formatCurrency(f.paid)}</td>
                        <td style={{ padding: "14px 20px", textAlign: "center" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: 500, ...(f.status === "paid" ? { background: "#dcfce7", color: "#16a34a" } : f.status === "partial" ? { background: "#fef3c7", color: "#d97706" } : { background: "#fee2e2", color: "#dc2626" }) }}>
                            {f.status === "paid" ? "Paid" : f.status === "partial" ? "Partial" : "Unpaid"}
                          </span>
                        </td>
                        <td style={{ padding: "14px 20px", textAlign: "center", fontSize: "12px", color: "#64748b" }}>{f.dueDate ? new Date(f.dueDate).toLocaleDateString("en-NG") : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {feeRecords.some((f) => f.payments.length > 0) && (
            <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9" }}>
                <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>Payment History</h3>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                      {["Fee", "Amount", "Method", "Date"].map((h) => (
                        <th key={h} style={{ padding: "12px 20px", textAlign: "center", fontSize: "11px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #f1f5f9", background: "#f8fafc" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {feeRecords.flatMap((f, fi) => f.payments.map((p, pi) => (
                      <tr key={`${fi}-${pi}`} style={{ borderBottom: "1px solid #f8fafc" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                        <td style={{ padding: "14px 20px", fontSize: "13px", color: "#0f172a" }}>{f.term}</td>
                        <td style={{ padding: "14px 20px", textAlign: "center", fontSize: "13px", fontWeight: 600, color: "#16a34a" }}>{formatCurrency(p.amount)}</td>
                        <td style={{ padding: "14px 20px", textAlign: "center", fontSize: "12px", color: "#64748b", textTransform: "capitalize" }}>{p.method || "—"}</td>
                        <td style={{ padding: "14px 20px", textAlign: "center", fontSize: "12px", color: "#64748b" }}>{p.paidAt ? new Date(p.paidAt).toLocaleDateString("en-NG") : "—"}</td>
                      </tr>
                    )))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MEDICAL TAB */}
      {activeTab === "medical" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px" }}>
            <h3 style={{ margin: "0 0 20px", fontSize: "15px", fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
              <Heart style={{ width: "16px", height: "16px", color: "#64748b" }} /> Medical Information
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
              {[
                { label: "Blood Group", value: student.medicalRecords?.[0]?.bloodGroup || student.bloodGroup || "Not recorded", icon: Droplets, color: "#dc2626" },
                { label: "Genotype", value: student.medicalRecords?.[0]?.genotype || "Not recorded", icon: Activity, color: "#2563eb" },
                { label: "Allergies", value: student.medicalRecords?.[0]?.allergies || "None", icon: AlertTriangle, color: "#d97706" },
                { label: "Medical Conditions", value: student.medicalRecords?.[0]?.conditions || "None", icon: Pill, color: "#9333ea" },
                { label: "Emergency Contact", value: student.guardians?.[0]?.name || student.guardianName || "—", icon: User, color: "#16a34a" },
                { label: "Emergency Phone", value: student.guardians?.[0]?.phone || student.guardianPhone || "—", icon: Phone, color: "#0891b2" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "14px 16px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: `${item.color}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <item.icon style={{ width: "16px", height: "16px", color: item.color }} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: "10px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.label}</p>
                    <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#0f172a" }}>{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9" }}>
              <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
                <Stethoscope style={{ width: "16px", height: "16px", color: "#64748b" }} /> Clinic Visit History
              </h3>
            </div>
            {student.medicalRecords?.[0]?.clinicVisits && student.medicalRecords[0].clinicVisits.length > 0 ? (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                      {["Date", "Reason", "Doctor", "Notes"].map((h) => (
                        <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #f1f5f9", background: "#f8fafc" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {student.medicalRecords[0].clinicVisits.map((v) => (
                      <tr key={v.id} style={{ borderBottom: "1px solid #f8fafc" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                        <td style={{ padding: "14px 20px", fontSize: "13px", color: "#0f172a" }}>{new Date(v.date).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</td>
                        <td style={{ padding: "14px 20px", fontSize: "13px", fontWeight: 500, color: "#0f172a" }}>{v.reason}</td>
                        <td style={{ padding: "14px 20px", fontSize: "12px", color: "#64748b" }}>{v.doctor || "—"}</td>
                        <td style={{ padding: "14px 20px", fontSize: "12px", color: "#64748b" }}>{v.notes || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: "48px", textAlign: "center" }}>
                <Stethoscope style={{ width: "40px", height: "40px", color: "#94a3b8", margin: "0 auto 12px" }} />
                <p style={{ margin: 0, color: "#94a3b8", fontSize: "13px" }}>No clinic visits recorded</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DOCUMENTS TAB */}
      {activeTab === "documents" && (
        <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
            <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
              <FileText style={{ width: "16px", height: "16px", color: "#64748b" }} /> Documents
            </h3>
            {canUploadDocs && (
              <label style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "10px", border: "1px solid #bbf7d0", background: "#f0fdf4", color: "#16a34a", fontSize: "12px", fontWeight: 500, cursor: "pointer" }}>
                <Upload style={{ width: "14px", height: "14px" }} /> Upload
                <input type="file" accept="image/*,.pdf,.doc,.docx,.txt,application/*" style={{ display: "none" }} multiple onChange={async (e) => { const files = Array.from(e.target.files || []); if (!files.length) return; await startUpload(files, { studentId: student.id }); e.target.value = ""; }} />
              </label>
            )}
          </div>
          {isUploading && <div style={{ marginBottom: "12px", fontSize: "12px", color: "#0055ff", display: "flex", alignItems: "center", gap: "8px" }}><Loader2 style={{ width: "14px", height: "14px", animation: "spin 1s linear infinite" }} /> Uploading document...</div>}
          {!student.documents || student.documents.length === 0 ? (
            <div style={{ padding: "48px", textAlign: "center" }}>
              <FileText style={{ width: "40px", height: "40px", color: "#94a3b8", margin: "0 auto 12px" }} />
              <p style={{ margin: 0, color: "#94a3b8", fontSize: "13px" }}>No documents uploaded</p>
              <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "11px" }}>Upload birth certificates, ID cards, or medical records.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {student.documents.map((doc, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <FileText style={{ width: "16px", height: "16px", color: "#2563eb" }} />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: "13px", fontWeight: 500, color: "#0f172a" }}>{doc.name}</p>
                      <p style={{ margin: "2px 0 0", fontSize: "10px", color: "#94a3b8" }}>{doc.type} · {doc.size} · {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString("en-NG") : "—"}</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "4px" }}>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{ width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", textDecoration: "none" }}><Eye style={{ width: "16px", height: "16px" }} /></a>
                    <a href={doc.url} download style={{ width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", textDecoration: "none" }}><Download style={{ width: "16px", height: "16px" }} /></a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Message Modal */}
      {showMessageModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "16px" }} onClick={() => setShowMessageModal(false)}>
          <div style={{ background: "#ffffff", borderRadius: "20px", width: "100%", maxWidth: "480px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "24px 28px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div><h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>Send Message</h3><p style={{ margin: "4px 0 0", fontSize: "12px", color: "#64748b" }}>To: {student.firstName} {student.lastName}</p></div>
              <button onClick={() => setShowMessageModal(false)} style={{ width: "32px", height: "32px", borderRadius: "8px", border: "none", background: "#f1f5f9", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X style={{ width: "16px", height: "16px" }} /></button>
            </div>
            <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "#475569", marginBottom: "6px" }}>Subject</label>
                <input type="text" value={messageSubject} onChange={(e) => setMessageSubject(e.target.value)} placeholder="Enter subject" style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "13px", color: "#0f172a", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "#475569", marginBottom: "6px" }}>Message</label>
                <textarea value={messageBody} onChange={(e) => setMessageBody(e.target.value)} rows={5} placeholder="Write your message..." style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "13px", color: "#0f172a", outline: "none", boxSizing: "border-box", resize: "none" }} />
              </div>
            </div>
            <div style={{ padding: "16px 28px 24px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button onClick={() => setShowMessageModal(false)} style={{ padding: "10px 20px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#ffffff", color: "#475569", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}>Cancel</button>
              <button onClick={async () => {
                if (!messageSubject.trim() || !messageBody.trim()) { toast.error("Subject and message are required"); return; }
                setSendingMessage(true);
                try {
                  const res = await fetch("/api/notifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: messageSubject.trim(), message: messageBody.trim(), type: "message", targetUserId: student.id }) });
                  if (!res.ok) throw new Error("Failed");
                  toast.success("Message sent"); setShowMessageModal(false); setMessageSubject(""); setMessageBody("");
                } catch { toast.error("Failed to send message"); } finally { setSendingMessage(false); }
              }} disabled={sendingMessage} style={{ padding: "10px 20px", borderRadius: "10px", border: "none", background: "#0055ff", color: "#ffffff", fontSize: "13px", fontWeight: 600, cursor: sendingMessage ? "not-allowed" : "pointer", opacity: sendingMessage ? 0.6 : 1, display: "flex", alignItems: "center", gap: "6px" }}>
                {sendingMessage && <Loader2 style={{ width: "14px", height: "14px", animation: "spin 1s linear infinite" }} />} Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
