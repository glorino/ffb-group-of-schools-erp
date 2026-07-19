"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
} from "lucide-react";

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
  class?: { name: string; id: string };
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
        if (!res.ok) { setLoading(false); return; }
        const data = await res.json();
        setStudent(data);
      } catch { }
      setLoading(false);
    };
    fetchStudent();
  }, [params.id]);

  const initials = student
    ? `${student.firstName?.[0] || ""}${student.lastName?.[0] || ""}`.toUpperCase()
    : "";

  const mockAttendance = [
    { date: "2025-06-16", status: "present" },
    { date: "2025-06-15", status: "present" },
    { date: "2025-06-14", status: "late" },
    { date: "2025-06-13", status: "present" },
    { date: "2025-06-12", status: "present" },
    { date: "2025-06-11", status: "absent" },
    { date: "2025-06-10", status: "present" },
    { date: "2025-06-09", status: "present" },
    { date: "2025-06-08", status: "present" },
    { date: "2025-06-07", status: "present" },
  ];

  const mockGrades = [
    { subject: "Mathematics", ca1: 28, ca2: 30, exam: 58, total: 86, grade: "A1" },
    { subject: "English Language", ca1: 25, ca2: 27, exam: 52, total: 78, grade: "B2" },
    { subject: "Physics", ca1: 22, ca2: 24, exam: 46, total: 70, grade: "B3" },
    { subject: "Chemistry", ca1: 26, ca2: 28, exam: 54, total: 80, grade: "B2" },
    { subject: "Biology", ca1: 24, ca2: 26, exam: 50, total: 76, grade: "B2" },
    { subject: "Computer Studies", ca1: 29, ca2: 30, exam: 60, total: 89, grade: "A1" },
  ];

  const mockFees = [
    { term: "First Term 2024/25", amount: 245000, paid: 245000, status: "paid", date: "2024-09-15" },
    { term: "Second Term 2024/25", amount: 245000, paid: 180000, status: "partial", date: "2025-01-10" },
    { term: "Third Term 2024/25", amount: 245000, paid: 0, status: "unpaid", date: "" },
  ];

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
          <p className="text-white/30">Student not found</p>
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
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.07] p-6">
                  <h3 className="text-white/80 font-semibold text-[15px] mb-4">Academic Summary</h3>
                  <div className="space-y-3">
                    {[
                      { label: "Attendance Rate", value: "92%", icon: ClipboardCheck, color: "text-emerald-400" },
                      { label: "Average Score", value: "80%", icon: Target, color: "text-blue-400" },
                      { label: "Class Position", value: "3rd / 42", icon: Award, color: "text-amber-400" },
                      { label: "Fee Status", value: "₦65,000 balance", icon: CreditCard, color: "text-purple-400" },
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
          )}

          {activeTab === "academic" && (
            <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.07] overflow-hidden">
              <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
                <div>
                  <h3 className="text-white/80 font-semibold text-[15px]">Academic Results</h3>
                  <p className="text-white/25 text-[11px] mt-0.5">Second Term 2024/2025</p>
                </div>
                <button className="px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/40 text-[12px] font-medium hover:bg-white/[0.08] transition flex items-center gap-2">
                  <Download className="w-3.5 h-3.5" /> Download Report Card
                </button>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="px-5 py-3 text-left text-[11px] font-semibold text-white/30 uppercase tracking-wider">Subject</th>
                    <th className="px-5 py-3 text-center text-[11px] font-semibold text-white/30 uppercase tracking-wider">CA1 (20)</th>
                    <th className="px-5 py-3 text-center text-[11px] font-semibold text-white/30 uppercase tracking-wider">CA2 (20)</th>
                    <th className="px-5 py-3 text-center text-[11px] font-semibold text-white/30 uppercase tracking-wider">Exam (60)</th>
                    <th className="px-5 py-3 text-center text-[11px] font-semibold text-white/30 uppercase tracking-wider">Total (100)</th>
                    <th className="px-5 py-3 text-center text-[11px] font-semibold text-white/30 uppercase tracking-wider">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {mockGrades.map((g, i) => (
                    <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition">
                      <td className="px-5 py-3.5 text-white/70 text-[13px] font-medium">{g.subject}</td>
                      <td className="px-5 py-3.5 text-center text-white/50 text-[13px]">{g.ca1}</td>
                      <td className="px-5 py-3.5 text-center text-white/50 text-[13px]">{g.ca2}</td>
                      <td className="px-5 py-3.5 text-center text-white/50 text-[13px]">{g.exam}</td>
                      <td className="px-5 py-3.5 text-center text-white/80 text-[13px] font-semibold">{g.total}</td>
                      <td className="px-5 py-3.5 text-center">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-lg text-[11px] font-bold ${
                          g.grade.startsWith("A") ? "bg-emerald-500/15 text-emerald-400" :
                          g.grade.startsWith("B") ? "bg-blue-500/15 text-blue-400" :
                          "bg-amber-500/15 text-amber-400"
                        }`}>
                          {g.grade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-5 py-4 border-t border-white/[0.06] flex items-center justify-between">
                <p className="text-white/30 text-[12px]">Overall Average: <span className="text-white/70 font-semibold">80%</span></p>
                <p className="text-white/30 text-[12px]">Class Position: <span className="text-white/70 font-semibold">3rd of 42</span></p>
              </div>
            </div>
          )}

          {activeTab === "attendance" && (
            <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.07] p-6">
              <h3 className="text-white/80 font-semibold text-[15px] mb-5">Attendance Records</h3>
              <div className="flex items-center gap-6 mb-6">
                {[
                  { label: "Present", count: 156, color: "text-emerald-400" },
                  { label: "Absent", count: 8, color: "text-red-400" },
                  { label: "Late", count: 12, color: "text-amber-400" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className={`text-2xl font-bold font-display ${item.color}`}>{item.count}</span>
                    <span className="text-white/30 text-[12px]">{item.label}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-1.5">
                {mockAttendance.map((a, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${
                        a.status === "present" ? "bg-emerald-400" :
                        a.status === "absent" ? "bg-red-400" : "bg-amber-400"
                      }`} />
                      <span className="text-white/50 text-[13px]">
                        {new Date(a.date).toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
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
            </div>
          )}

          {activeTab === "fees" && (
            <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.07] overflow-hidden">
              <div className="p-5 border-b border-white/[0.06]">
                <h3 className="text-white/80 font-semibold text-[15px]">Fee Records</h3>
              </div>
              <div className="p-5 space-y-3">
                {mockFees.map((f, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition">
                    <div>
                      <p className="text-white/70 text-[13px] font-medium">{f.term}</p>
                      <p className="text-white/25 text-[11px] mt-0.5">
                        {f.date ? `Paid on ${new Date(f.date).toLocaleDateString("en-NG")}` : "Not yet paid"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/70 text-[13px] font-semibold">
                        ₦{f.paid.toLocaleString()} / ₦{f.amount.toLocaleString()}
                      </p>
                      <span className={`inline-flex items-center gap-1 text-[11px] font-medium mt-1 ${
                        f.status === "paid" ? "text-emerald-400" :
                        f.status === "partial" ? "text-amber-400" : "text-red-400"
                      }`}>
                        {f.status === "paid" ? <CheckCircle2 className="w-3 h-3" /> :
                         f.status === "partial" ? <AlertCircle className="w-3 h-3" /> :
                         <XCircle className="w-3 h-3" />}
                        {f.status === "paid" ? "Fully Paid" : f.status === "partial" ? "Partially Paid" : "Unpaid"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-5 py-4 border-t border-white/[0.06]">
                <p className="text-white/30 text-[12px]">
                  Total Fees: <span className="text-white/60 font-semibold">₦735,000</span> · Paid: <span className="text-emerald-400 font-semibold">₦425,000</span> · Balance: <span className="text-amber-400 font-semibold">₦310,000</span>
                </p>
              </div>
            </div>
          )}

          {activeTab === "medical" && (
            <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.07] p-6">
              <h3 className="text-white/80 font-semibold text-[15px] mb-5">Medical Records</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Blood Group", value: "O+" },
                  { label: "Genotype", value: "AA" },
                  { label: "Allergies", value: "Penicillin" },
                  { label: "Medical Conditions", value: "None" },
                  { label: "Emergency Contact", value: student?.guardianName || "—" },
                  { label: "Emergency Phone", value: student?.guardianPhone || "—" },
                ].map((item, i) => (
                  <div key={i} className="px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <p className="text-white/25 text-[10px] uppercase tracking-wider font-medium">{item.label}</p>
                    <p className="text-white/70 text-[13px] mt-0.5">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "documents" && (
            <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.07] p-6">
              <h3 className="text-white/80 font-semibold text-[15px] mb-5">Documents</h3>
              <div className="space-y-2">
                {[
                  { name: "Birth Certificate", type: "PDF", size: "1.2 MB", uploaded: "2024-08-20" },
                  { name: "Previous School Report", type: "PDF", size: "856 KB", uploaded: "2024-08-20" },
                  { name: "Medical Certificate", type: "PDF", size: "432 KB", uploaded: "2024-09-01" },
                  { name: "Passport Photograph", type: "JPG", size: "245 KB", uploaded: "2024-08-20" },
                ].map((doc, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-white/70 text-[13px] font-medium">{doc.name}</p>
                        <p className="text-white/25 text-[10px]">{doc.type} · {doc.size} · Uploaded {doc.uploaded}</p>
                      </div>
                    </div>
                    <button className="p-2 rounded-lg text-white/25 hover:text-white/60 hover:bg-white/[0.06] transition">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
