"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  User,
  BookOpen,
  Calendar,
  CreditCard,
  Heart,
  FileText,
  Clock,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Users,
  Download,
  MoreHorizontal,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Activity,
} from "lucide-react";

const studentData = {
  id: "1",
  admissionNo: "FFB/2024/0001",
  firstName: "Adebayo",
  lastName: "Johnson",
  middleName: "Olumide",
  class: "SS3 Science",
  gender: "Male",
  dateOfBirth: "2006-03-15",
  bloodGroup: "O+",
  nationality: "Nigerian",
  stateOfOrigin: "Lagos",
  lga: "Ikeja",
  address: "12 Adeola Street, Ikeja, Lagos",
  phone: "08012345678",
  email: "adebayo.johnson@student.ffb.edu.ng",
  enrollmentDate: "2021-09-01",
  guardian: {
    name: "Mr. Olawale Johnson",
    relationship: "Father",
    phone: "08098765432",
    email: "olawale.johnson@email.com",
  },
  medical: {
    bloodGroup: "O+",
    allergies: "None",
    conditions: "None",
    medications: "None",
    height: 175,
    weight: 70,
    emergencyContact: "Mr. Olawale Johnson",
    emergencyPhone: "08098765432",
  },
};

const tabs = [
  { id: "overview", label: "Overview", icon: User },
  { id: "academic", label: "Academic", icon: BookOpen },
  { id: "attendance", label: "Attendance", icon: Calendar },
  { id: "fees", label: "Fees", icon: CreditCard },
  { id: "medical", label: "Medical", icon: Heart },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "timeline", label: "Timeline", icon: Clock },
];

const mockGrades = [
  { subject: "Mathematics", ca: 28, exam: 62, total: 90, grade: "A1" },
  { subject: "Physics", ca: 25, exam: 58, total: 83, grade: "A1" },
  { subject: "Chemistry", ca: 22, exam: 55, total: 77, grade: "B2" },
  { subject: "English Language", ca: 24, exam: 52, total: 76, grade: "B2" },
  { subject: "Biology", ca: 26, exam: 56, total: 82, grade: "A1" },
];

const mockAttendance = [
  { date: "2025-07-14", status: "present", session: "morning" },
  { date: "2025-07-13", status: "present", session: "morning" },
  { date: "2025-07-12", status: "late", session: "morning" },
  { date: "2025-07-11", status: "present", session: "morning" },
  { date: "2025-07-10", status: "absent", session: "morning" },
  { date: "2025-07-09", status: "present", session: "morning" },
  { date: "2025-07-08", status: "present", session: "morning" },
];

const mockFees = [
  { name: "Tuition Fee - Term 1", amount: 150000, paid: 150000, status: "paid", date: "2025-01-15" },
  { name: "Development Levy", amount: 25000, paid: 25000, status: "paid", date: "2025-01-15" },
  { name: "Tuition Fee - Term 2", amount: 150000, paid: 100000, status: "partial", date: "2025-04-10" },
  { name: "Exam Fee", amount: 15000, paid: 0, status: "unpaid", date: "2025-06-01" },
];

const mockDocuments = [
  { name: "Birth Certificate", type: "PDF", size: "2.4 MB", uploadDate: "2021-09-01" },
  { name: "Previous Report Card", type: "PDF", size: "1.8 MB", uploadDate: "2021-09-01" },
  { name: "Passport Photograph", type: "JPG", size: "0.5 MB", uploadDate: "2021-09-01" },
  { name: "Medical Record", type: "PDF", size: "1.2 MB", uploadDate: "2021-09-01" },
];

const mockTimeline = [
  { action: "Term 2 results published", date: "2025-06-30", icon: TrendingUp, color: "text-emerald-400" },
  { action: "Exam fee invoice generated", date: "2025-06-01", icon: CreditCard, color: "text-blue-400" },
  { action: "Parent-Teacher meeting attended", date: "2025-05-20", icon: Users, color: "text-purple-400" },
  { action: "Science fair participation", date: "2025-05-10", icon: Award, color: "text-yellow-400" },
  { action: "Term 1 results published", date: "2025-03-30", icon: TrendingUp, color: "text-emerald-400" },
  { action: "Enrolled in SS3 Science", date: "2024-09-01", icon: GraduationCap, color: "text-[var(--accent)]" },
];

function Award(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526" />
      <circle cx="12" cy="8" r="6" />
    </svg>
  );
}

export default function StudentDetailPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const s = studentData;

  const totalFeesPaid = mockFees.reduce((sum, f) => sum + f.paid, 0);
  const totalFees = mockFees.reduce((sum, f) => sum + f.amount, 0);
  const attendanceRate = Math.round(
    (mockAttendance.filter((a) => a.status === "present").length / mockAttendance.length) * 100
  );
  const avgScore = Math.round(mockGrades.reduce((sum, g) => sum + g.total, 0) / mockGrades.length);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/students"
            className="w-10 h-10 rounded-xl glass border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-white">
              {s.firstName} {s.middleName} {s.lastName}
            </h2>
            <p className="text-white/50 text-sm">{s.admissionNo}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2.5 rounded-xl glass border border-white/20 text-white text-sm font-medium hover:bg-white/10 transition-all flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="px-4 py-2.5 rounded-xl bg-[var(--primary)] text-white text-sm font-semibold hover:opacity-90 transition-all flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Edit Profile
          </button>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white text-2xl font-bold shrink-0">
            {s.firstName[0]}{s.lastName[0]}
          </div>
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-white/40 text-xs mb-1">Class</p>
              <p className="text-white font-medium">{s.class}</p>
            </div>
            <div>
              <p className="text-white/40 text-xs mb-1">Gender</p>
              <p className="text-white font-medium">{s.gender}</p>
            </div>
            <div>
              <p className="text-white/40 text-xs mb-1">Date of Birth</p>
              <p className="text-white font-medium">{s.dateOfBirth}</p>
            </div>
            <div>
              <p className="text-white/40 text-xs mb-1">Blood Group</p>
              <p className="text-white font-medium">{s.bloodGroup}</p>
            </div>
            <div>
              <p className="text-white/40 text-xs mb-1">Phone</p>
              <p className="text-white font-medium flex items-center gap-1">
                <Phone className="w-3 h-3" /> {s.phone}
              </p>
            </div>
            <div>
              <p className="text-white/40 text-xs mb-1">Email</p>
              <p className="text-white font-medium flex items-center gap-1 text-sm">
                <Mail className="w-3 h-3" /> {s.email}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-white/40 text-xs mb-1">Address</p>
              <p className="text-white font-medium flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {s.address}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? "bg-[var(--primary)] text-white"
                : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Average Score", value: `${avgScore}%`, icon: TrendingUp, color: "from-blue-500 to-blue-600" },
                  { label: "Attendance Rate", value: `${attendanceRate}%`, icon: Calendar, color: "from-emerald-500 to-emerald-600" },
                  { label: "Fees Paid", value: `₦${totalFeesPaid.toLocaleString()}`, icon: DollarSign, color: "from-purple-500 to-purple-600" },
                  { label: "Class Position", value: "3rd", icon: Award, color: "from-amber-500 to-amber-600" },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="card"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                        <p className="text-white/40 text-xs">{stat.label}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <div className="card">
                  <h3 className="text-white font-semibold mb-4">Guardian Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-white/50 text-sm">Name</span>
                      <span className="text-white text-sm font-medium">{s.guardian.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50 text-sm">Relationship</span>
                      <span className="text-white text-sm font-medium">{s.guardian.relationship}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50 text-sm">Phone</span>
                      <span className="text-white text-sm font-medium">{s.guardian.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50 text-sm">Email</span>
                      <span className="text-white text-sm font-medium">{s.guardian.email}</span>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h3 className="text-white font-semibold mb-4">Recent Subjects</h3>
                  <div className="space-y-3">
                    {mockGrades.slice(0, 4).map((g, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-white/70 text-sm">{g.subject}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white text-sm font-medium">{g.total}%</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            g.total >= 80 ? "bg-emerald-500/20 text-emerald-400" :
                            g.total >= 60 ? "bg-blue-500/20 text-blue-400" :
                            "bg-amber-500/20 text-amber-400"
                          }`}>
                            {g.grade}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "academic" && (
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold">Academic Results - Term 2, 2025</h3>
                <span className="text-white/40 text-sm">Average: {avgScore}%</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full table-premium">
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>CA (30)</th>
                      <th>Exam (70)</th>
                      <th>Total</th>
                      <th>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockGrades.map((g, i) => (
                      <tr key={i}>
                        <td className="text-white font-medium">{g.subject}</td>
                        <td className="text-white/60">{g.ca}</td>
                        <td className="text-white/60">{g.exam}</td>
                        <td className="text-white font-medium">{g.total}</td>
                        <td>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            g.total >= 80 ? "bg-emerald-500/20 text-emerald-400" :
                            g.total >= 60 ? "bg-blue-500/20 text-blue-400" :
                            "bg-amber-500/20 text-amber-400"
                          }`}>
                            {g.grade}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "attendance" && (
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold">Attendance Records</h3>
                <span className="text-white/40 text-sm">Rate: {attendanceRate}%</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full table-premium">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Session</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockAttendance.map((a, i) => (
                      <tr key={i}>
                        <td className="text-white">{a.date}</td>
                        <td className="text-white/60 capitalize">{a.session}</td>
                        <td>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            a.status === "present" ? "bg-emerald-500/20 text-emerald-400" :
                            a.status === "late" ? "bg-amber-500/20 text-amber-400" :
                            a.status === "excused" ? "bg-blue-500/20 text-blue-400" :
                            "bg-red-500/20 text-red-400"
                          }`}>
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "fees" && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="card">
                  <p className="text-white/40 text-xs mb-1">Total Fees</p>
                  <p className="text-2xl font-bold text-white">₦{totalFees.toLocaleString()}</p>
                </div>
                <div className="card">
                  <p className="text-white/40 text-xs mb-1">Amount Paid</p>
                  <p className="text-2xl font-bold text-emerald-400">₦{totalFeesPaid.toLocaleString()}</p>
                </div>
                <div className="card">
                  <p className="text-white/40 text-xs mb-1">Balance</p>
                  <p className="text-2xl font-bold text-red-400">₦{(totalFees - totalFeesPaid).toLocaleString()}</p>
                </div>
              </div>
              <div className="card">
                <div className="overflow-x-auto">
                  <table className="w-full table-premium">
                    <thead>
                      <tr>
                        <th>Fee Description</th>
                        <th>Amount</th>
                        <th>Paid</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockFees.map((f, i) => (
                        <tr key={i}>
                          <td className="text-white font-medium">{f.name}</td>
                          <td className="text-white/60">₦{f.amount.toLocaleString()}</td>
                          <td className="text-white/60">₦{f.paid.toLocaleString()}</td>
                          <td>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              f.status === "paid" ? "bg-emerald-500/20 text-emerald-400" :
                              f.status === "partial" ? "bg-amber-500/20 text-amber-400" :
                              "bg-red-500/20 text-red-400"
                            }`}>
                              {f.status}
                            </span>
                          </td>
                          <td className="text-white/60">{f.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "medical" && (
            <div className="card">
              <h3 className="text-white font-semibold mb-6">Medical Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {Object.entries(s.medical).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-white/50 text-sm capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                    <span className="text-white text-sm font-medium">{value || "N/A"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "documents" && (
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold">Student Documents</h3>
                <button className="px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-all">
                  Upload Document
                </button>
              </div>
              <div className="space-y-3">
                {mockDocuments.map((doc, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{doc.name}</p>
                        <p className="text-white/40 text-xs">{doc.type} - {doc.size}</p>
                      </div>
                    </div>
                    <button className="text-white/40 hover:text-white transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "timeline" && (
            <div className="card">
              <h3 className="text-white font-semibold mb-6">Activity Timeline</h3>
              <div className="space-y-6">
                {mockTimeline.map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full bg-white/5 flex items-center justify-center ${item.color}`}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      {i < mockTimeline.length - 1 && (
                        <div className="w-0.5 flex-1 bg-white/10 mt-2" />
                      )}
                    </div>
                    <div className="pb-6">
                      <p className="text-white text-sm font-medium">{item.action}</p>
                      <p className="text-white/40 text-xs mt-1">{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
