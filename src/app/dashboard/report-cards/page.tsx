"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import {
  FileText, Download, Eye, Printer, QrCode, CheckCircle, Clock, Users, Search,
} from "lucide-react";
import { ReportCardPDF, ReportCardProps } from "@/components/reports/report-card-pdf";
import { downloadPDF } from "@/lib/exports";

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
};

export default function ReportCardsPage() {
  const { data: session } = useSession();
  const userRoles: string[] = (session?.user as any)?.roles?.map((r: any) => r.name) || [];
  const isStudent = userRoles.includes("STUDENT");
  const isParent = userRoles.includes("PARENT");
  const isReadOnly = isStudent || isParent;

  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [reportData, setReportData] = useState<ReportCardProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [search, setSearch] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [termId, setTermId] = useState("");
  const [terms, setTerms] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/students?limit=100")
      .then(r => r.json())
      .then(d => {
        const studentList = d.students || [];
        setStudents(studentList);
        if (isReadOnly) {
          const userEmail = (session?.user as any)?.email || "";
          const matched = studentList.find((s: any) => s.email === userEmail || s.user?.email === userEmail);
          if (matched) setSelectedStudent(matched.id);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isReadOnly, session]);

  useEffect(() => {
    fetch("/api/calendar").then(r => r.json()).then(d => setTerms(d.terms || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (terms.length > 0 && !termId) {
      const current = terms.find((t: any) => t.isCurrent) || terms[0];
      if (current) setTermId(current.id);
    }
  }, [terms, termId]);

  useEffect(() => {
    if (!selectedStudent) { setReportData(null); return; }
    setGenerating(true);
    fetch(`/api/reports/report-card?studentId=${selectedStudent}&termId=${termId || "current"}`)
      .then(r => r.json())
      .then(d => {
        if (d.student) {
          setReportData({
            studentData: {
              id: d.student.id,
              name: `${d.student.firstName} ${d.student.lastName}`,
              admissionNumber: d.student.admissionNumber,
              className: d.student.class?.displayName || d.student.class?.name || "",
              photo: d.student.photo,
              qrCode: d.student.qrCode,
            },
            termData: {
              id: d.term?.id || "",
              name: d.term?.name || "Current Term",
              academicYear: d.term?.academicYear || "2025/2026",
            },
            school: {
              name: d.school?.name || process.env.NEXT_PUBLIC_SCHOOL_NAME || "FFB Group of Schools",
              address: d.school?.address,
              logo: d.school?.logo,
            },
            grades: (d.grades || []).map((g: any) => ({
              subject: g.subject?.name || g.subject,
              subjectCode: g.subject?.code || "",
              teacher: g.teacher || "",
              ca1: g.ca1 || 0,
              ca2: g.ca2 || 0,
              ca3: g.ca3 || 0,
              exam: g.exam || 0,
              total: g.total || 0,
              grade: g.grade || "",
              remark: g.remark || "",
            })),
            gradingScale: d.gradingScale || [
              { name: "A1", minScore: 75, maxScore: 100, grade: "A1", remark: "Excellent" },
              { name: "B2", minScore: 70, maxScore: 74, grade: "B2", remark: "Very Good" },
              { name: "B3", minScore: 65, maxScore: 69, grade: "B3", remark: "Good" },
              { name: "C4", minScore: 60, maxScore: 64, grade: "C4", remark: "Credit" },
              { name: "C5", minScore: 55, maxScore: 59, grade: "C5", remark: "Credit" },
              { name: "C6", minScore: 50, maxScore: 54, grade: "C6", remark: "Credit" },
              { name: "D7", minScore: 45, maxScore: 49, grade: "D7", remark: "Pass" },
              { name: "E8", minScore: 40, maxScore: 44, grade: "E8", remark: "Pass" },
              { name: "F9", minScore: 0, maxScore: 39, grade: "F9", remark: "Fail" },
            ],
            attendance: d.attendance || { totalDays: 120, present: 110, absent: 10 },
            behaviour: d.behaviour,
            psychomotor: d.psychomotor,
            teacherComment: d.teacherComment,
            principalComment: d.principalComment,
            classTeacher: d.classTeacher,
            position: d.position,
            classSize: d.classSize,
          });
        }
      })
      .catch(() => setReportData(null))
      .finally(() => setGenerating(false));
  }, [selectedStudent, termId]);

  const filteredStudents = students.filter(s =>
    !search || `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    s.admissionNumber?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div {...fadeIn} className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-[#1a1a2e] font-display tracking-tight flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
              <FileText className="w-[18px] h-[18px] text-[#1a1a2e]" />
            </div>
            Report Cards
          </h1>
          <p className="text-[#94a3b8] text-[12px] mt-1 ml-[46px]">Generate, preview, and download report cards with QR verification</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#f1f5f9] rounded-2xl border border-[#e2e8f0] p-5">
          <p className="text-[#64748b] text-[12px]">Total Students</p>
          <p className="text-[28px] font-bold text-[#1a1a2e] mt-1">{students.length}</p>
        </div>
        <div className="bg-[#f1f5f9] rounded-2xl border border-[#e2e8f0] p-5">
          <p className="text-[#64748b] text-[12px]">Selected</p>
          <p className="text-[28px] font-bold text-[#1a1a2e] mt-1">{selectedStudent ? "1" : "0"}</p>
        </div>
        <div className="bg-[#f1f5f9] rounded-2xl border border-[#e2e8f0] p-5">
          <p className="text-[#64748b] text-[12px]">Status</p>
          <p className="text-[18px] font-bold text-[#1a1a2e] mt-1">{generating ? "Generating..." : reportData ? "Ready" : "Select student"}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        {/* Student List - hidden for students/parents (auto-selected) */}
        {!isReadOnly && (
          <div className="lg:col-span-2 bg-[#f1f5f9] rounded-2xl border border-[#e2e8f0] p-5">
            <h3 className="text-[#1a1a2e] font-semibold text-[14px] mb-3">Select Student</h3>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
              <input
                type="text"
                placeholder="Search students..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-[#1a1a2e] text-[12px] placeholder-[#94a3b8] outline-none focus:border-[var(--primary)]/50"
              />
            </div>
            <div className="space-y-1 max-h-[400px] overflow-y-auto">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-12 rounded-xl bg-[#f8fafc] animate-pulse" />
                ))
              ) : filteredStudents.length === 0 ? (
                <p className="text-[#94a3b8] text-[12px] text-center py-8">No students found</p>
              ) : (
                filteredStudents.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStudent(s.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition ${
                      selectedStudent === s.id
                        ? "bg-[var(--primary)]/20 border border-[var(--primary)]/40"
                        : "hover:bg-[#f8fafc] border border-transparent"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                      {s.firstName?.[0]}{s.lastName?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#1a1a2e] text-[12px] font-medium truncate">{s.firstName} {s.lastName}</p>
                      <p className="text-[#94a3b8] text-[10px]">{s.class?.displayName || s.class?.name || "—"} · {s.admissionNumber}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Preview Area */}
        <div className="lg:col-span-3 space-y-4">
          {reportData ? (
            <>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-[#475569] text-[12px] font-medium hover:bg-[#f1f5f9] transition"
                >
                  <Eye className="w-4 h-4" /> {showPreview ? "Hide Preview" : "Preview"}
                </button>
                <PDFDownloadLink
                  document={<ReportCardPDF {...reportData} />}
                  fileName={`report_card_${reportData.studentData.admissionNumber}.pdf`}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--primary)] text-white text-[12px] font-semibold hover:brightness-110 transition"
                >
                  {({ loading }) => loading ? "Generating..." : <><Download className="w-4 h-4" /> Download PDF</>}
                </PDFDownloadLink>
                <button
                  onClick={() => {
                    downloadPDF(
                      `Report Card - ${reportData.studentData.name}`,
                      `<table><tr><th>Subject</th><th>CA1</th><th>CA2</th><th>Exam</th><th>Total</th><th>Grade</th></tr>${
                        reportData.grades.map(g => `<tr><td>${g.subject}</td><td>${g.ca1}</td><td>${g.ca2}</td><td>${g.exam}</td><td>${g.total}</td><td>${g.grade}</td></tr>`).join("")
                      }</table><p><strong>Attendance:</strong> ${reportData.attendance.present}/${reportData.attendance.totalDays} days</p>`
                    );
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-[#475569] text-[12px] font-medium hover:bg-[#f1f5f9] transition"
                >
                  <Printer className="w-4 h-4" /> Print
                </button>
              </div>

              {showPreview && (
                <div className="bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden" style={{ height: "700px" }}>
                  <PDFViewer width="100%" height="100%" showToolbar={false}>
                    <ReportCardPDF {...reportData} />
                  </PDFViewer>
                </div>
              )}

              {!showPreview && (
                <div className="bg-[#f1f5f9] rounded-2xl border border-[#e2e8f0] p-5">
                  <h3 className="text-[#1a1a2e] font-semibold text-[14px] mb-3">Report Card Details</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-[#f8fafc]">
                      <p className="text-[#64748b] text-[10px]">Student</p>
                      <p className="text-[#1a1a2e] text-[13px] font-medium">{reportData.studentData.name}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#f8fafc]">
                      <p className="text-[#64748b] text-[10px]">Class</p>
                      <p className="text-[#1a1a2e] text-[13px] font-medium">{reportData.studentData.className}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#f8fafc]">
                      <p className="text-[#64748b] text-[10px]">Term</p>
                      <p className="text-[#1a1a2e] text-[13px] font-medium">{reportData.termData.name}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#f8fafc]">
                      <p className="text-[#64748b] text-[10px]">Session</p>
                      <p className="text-[#1a1a2e] text-[13px] font-medium">{reportData.termData.academicYear}</p>
                    </div>
                  </div>
                  {reportData.grades.length > 0 && (
                    <div className="mt-3">
                      <p className="text-[#64748b] text-[10px] mb-2">Subjects ({reportData.grades.length})</p>
                      <div className="space-y-1">
                        {reportData.grades.map((g, i) => (
                          <div key={i} className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#f8fafc]">
                            <span className="text-[#475569] text-[11px]">{g.subject}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-[#64748b] text-[10px]">CA: {g.ca1 + g.ca2}</span>
                              <span className="text-[#64748b] text-[10px]">Exam: {g.exam}</span>
                              <span className="text-[#1a1a2e] text-[11px] font-semibold">{g.total}%</span>
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                g.total >= 70 ? "bg-[#dcfce7] text-[#16a34a]" :
                                g.total >= 50 ? "bg-[#dbeafe] text-[#2563eb]" :
                                "bg-[#fee2e2] text-[#dc2626]"
                              }`}>{g.grade}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* QR Code */}
              <div className="bg-[#f1f5f9] rounded-2xl border border-[#e2e8f0] p-5">
                <h3 className="text-[#1a1a2e] font-semibold text-[14px] mb-3">QR Verification</h3>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-xl bg-white flex items-center justify-center">
                    <QrCode className="w-16 h-16 text-[var(--blue-1)]" />
                  </div>
                  <div>
                    <p className="text-[#475569] text-[12px]">Each report card includes a unique QR code for third-party verification.</p>
                    <p className="text-[#94a3b8] text-[10px] mt-1">Scan to verify authenticity of this report card.</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-[#f1f5f9] rounded-2xl border border-[#e2e8f0] p-12 text-center">
              <FileText className="w-16 h-16 text-[#94a3b8] mx-auto mb-4" />
              <p className="text-[#94a3b8] text-[14px]">Select a student to generate their report card</p>
              <p className="text-[#94a3b8] text-[11px] mt-1">The report card will be generated with real data from the database</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
