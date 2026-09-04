"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { SCHOOL_CONFIG } from "@/lib/school-config";
import {
  FileText, Download, Eye, Printer, QrCode, Search,
} from "lucide-react";
import { ReportCardPDF, ReportCardProps } from "@/components/reports/report-card-pdf";
import { toast } from "sonner";

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false }
);
const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  { ssr: false }
);

const inputStyle: React.CSSProperties = { width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1.5px solid #e2e8f0", fontSize: "13px", color: "#0f172a", outline: "none", boxSizing: "border-box", background: "#f8fafc", transition: "border-color 0.2s, box-shadow 0.2s" };
const inputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => { e.currentTarget.style.borderColor = "#0055ff"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,85,255,0.1)"; e.currentTarget.style.background = "#ffffff"; };
const inputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.background = "#f8fafc"; };
const labelStyle: React.CSSProperties = { display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "8px" };
const btnStyle = (bg: string, hover?: string): React.CSSProperties => ({ padding: "10px 20px", borderRadius: "12px", border: "none", background: bg, color: "#ffffff", fontSize: "13px", fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px", transition: "all 0.15s" });

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
  const [notifying, setNotifying] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");

  useEffect(() => {
    fetch("/api/students?limit=100").then(r => r.json()).then(d => {
      const list = d.students || [];
      setStudents(list);
      if (isReadOnly) {
        const email = (session?.user as any)?.email || "";
        const matched = list.find((s: any) => s.email === email || s.user?.email === email);
        if (matched) setSelectedStudent(matched.id);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [isReadOnly, session]);

  useEffect(() => {
    fetch("/api/calendar").then(r => r.json()).then(d => setTerms(d.terms || [])).catch(() => {});
    fetch("/api/classes").then(r => r.json()).then(d => setClasses(d.classes || d || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (terms.length > 0 && !termId) { const current = terms.find((t: any) => t.isCurrent) || terms[0]; if (current) setTermId(current.id); }
  }, [terms, termId]);

  useEffect(() => {
    if (!selectedStudent || !termId) { setReportData(null); return; }
    setGenerating(true);
    fetch(`/api/reports/report-card?studentId=${selectedStudent}&termId=${termId}`)
      .then(r => r.json()).then(d => {
        if (d.student) {
          setReportData({
            studentData: { id: d.student.id, name: d.student.name || `${d.student.firstName || ""} ${d.student.lastName || ""}`.trim(), admissionNumber: d.student.admissionNumber, className: d.student.className || d.student.class?.displayName || d.student.class?.name || "", photo: d.student.photo, qrCode: d.student.qrCode },
            termData: { id: d.term?.id || "", name: d.term?.name || "Current Term", academicYear: d.term?.academicYear || "2025/2026" },
            school: { name: d.school?.name || process.env.NEXT_PUBLIC_SCHOOL_NAME || SCHOOL_CONFIG.name, address: d.school?.address || SCHOOL_CONFIG.address, logo: d.school?.logo, phone: d.school?.phone || SCHOOL_CONFIG.phone, email: d.school?.email || SCHOOL_CONFIG.email, motto: d.school?.motto || SCHOOL_CONFIG.motto, principalSignature: d.school?.principalSignature },
            grades: (d.subjects || d.grades || []).map((g: any) => ({ subject: g.subject?.name || g.subject || "", subjectCode: g.subject?.code || g.subjectCode || "", teacher: g.teacher || "", ca1: g.ca1 || 0, ca2: g.ca2 || 0, ca3: g.ca3 || 0, exam: g.exam || 0, total: g.total || 0, grade: g.grade || "", remark: g.remark || "" })),
            gradingScale: d.gradingScale || [{ name: "A1", minScore: 75, maxScore: 100, grade: "A1", remark: "Excellent" }, { name: "B2", minScore: 70, maxScore: 74, grade: "B2", remark: "Very Good" }, { name: "B3", minScore: 65, maxScore: 69, grade: "B3", remark: "Good" }, { name: "C4", minScore: 60, maxScore: 64, grade: "C4", remark: "Credit" }, { name: "C5", minScore: 55, maxScore: 59, grade: "C5", remark: "Credit" }, { name: "C6", minScore: 50, maxScore: 54, grade: "C6", remark: "Credit" }, { name: "D7", minScore: 45, maxScore: 49, grade: "D7", remark: "Pass" }, { name: "E8", minScore: 40, maxScore: 44, grade: "E8", remark: "Pass" }, { name: "F9", minScore: 0, maxScore: 39, grade: "F9", remark: "Fail" }],
            attendance: d.attendance || { totalDays: 120, present: 110, absent: 10 },
            behaviour: d.behaviour, psychomotor: d.psychomotor, teacherComment: d.teacherComment, principalComment: d.principalComment, classTeacher: d.classTeacher, position: d.position, classSize: d.classSize,
          });
        }
      }).catch(() => setReportData(null)).finally(() => setGenerating(false));
  }, [selectedStudent, termId]);

  const filteredStudents = students.filter(s => !search || `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase()) || s.admissionNumber?.toLowerCase().includes(search.toLowerCase()));

  const notifyParents = async () => {
    if (!selectedClass || !termId) { toast.error("Please select a class and term first"); return; }
    setNotifying(true);
    try {
      const res = await fetch("/api/reports/notify-parents", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ classId: selectedClass, termId }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success(data.message || "Parents notified successfully");
    } catch (err: any) { toast.error(err.message || "Failed"); } finally { setNotifying(false); }
  };

  const getGradeColor = (total: number) => total >= 70 ? "#16a34a" : total >= 50 ? "#2563eb" : "#dc2626";
  const getGradeBg = (total: number) => total >= 70 ? "#dcfce7" : total >= 50 ? "#eff6ff" : "#fef2f2";

  const kpis = [
    { label: "Total Students", value: students.length, bg: "linear-gradient(135deg, #0055ff, #0033cc)" },
    { label: "Selected", value: selectedStudent ? 1 : 0, bg: "linear-gradient(135deg, #10b981, #059669)" },
    { label: "Status", value: generating ? "Generating..." : reportData ? "Ready" : "Select student", bg: "linear-gradient(135deg, #8b5cf6, #7c3aed)", isText: true },
  ];

  const avatarGradients = [
    "linear-gradient(135deg, #0055ff, #0033cc)",
    "linear-gradient(135deg, #8b5cf6, #7c3aed)",
    "linear-gradient(135deg, #10b981, #059669)",
    "linear-gradient(135deg, #f59e0b, #d97706)",
    "linear-gradient(135deg, #ef4444, #dc2626)",
    "linear-gradient(135deg, #06b6d4, #0891b2)",
  ];

  return (
    <div style={{ padding: "24px 32px", minHeight: "100vh", background: "#f8fafc" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0a2a6e, #0055ff)", borderRadius: "20px", padding: "28px 32px", marginBottom: "28px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 90% 20%, rgba(255,255,255,0.12) 0%, transparent 60%), radial-gradient(circle at 10% 80%, rgba(255,255,255,0.08) 0%, transparent 50%)" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <h1 style={{ margin: 0, fontSize: "26px", fontWeight: 800, color: "#ffffff", display: "flex", alignItems: "center", gap: "12px" }}>
            <FileText style={{ width: "28px", height: "28px" }} /> Report Cards
          </h1>
          <p style={{ margin: "6px 0 0", fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>Generate, preview, and download report cards with QR verification</p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {kpis.map((stat, i) => (
          <div key={i} style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "20px 22px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <p style={{ margin: 0, fontSize: "13px", fontWeight: 500, color: "#64748b" }}>{stat.label}</p>
            <p style={{ margin: "6px 0 0", fontSize: stat.isText ? "18px" : "28px", fontWeight: 800, color: "#0f172a" }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Notify Parents Bar */}
      {!isReadOnly && (
        <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "16px 24px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>Notify Parents:</p>
          <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} style={{ ...inputStyle, width: "auto", minWidth: "180px", padding: "10px 14px", cursor: "pointer", colorScheme: "light" }} onFocus={inputFocus} onBlur={inputBlur}>
            <option value="">Select Class</option>
            {classes.map((c: any) => <option key={c.id} value={c.id}>{c.displayName || c.name}</option>)}
          </select>
          <button onClick={notifyParents} disabled={notifying || !selectedClass || !termId} style={{ ...btnStyle(notifying || !selectedClass ? "#94a3b8" : "#10b981"), opacity: notifying || !selectedClass ? 0.6 : 1, cursor: notifying || !selectedClass ? "not-allowed" : "pointer" }}>
            {notifying ? "Sending..." : "Send Report Card Emails"}
          </button>
        </div>
      )}

      {/* Main Content */}
      <div style={{ display: "grid", gridTemplateColumns: isReadOnly ? "1fr" : "2fr 3fr", gap: "24px" }}>
        {/* Student List */}
        {!isReadOnly && (
          <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9" }}>
              <h3 style={{ margin: "0 0 12px", fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>Select Student</h3>
              <div style={{ position: "relative" }}>
                <Search style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "#94a3b8" }} />
                <input type="text" placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...inputStyle, paddingLeft: "36px", padding: "10px 14px 10px 36px" }} onFocus={inputFocus} onBlur={inputBlur} />
              </div>
            </div>
            <div style={{ maxHeight: "480px", overflowY: "auto", padding: "8px" }}>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} style={{ height: "52px", borderRadius: "12px", background: "#f8fafc", marginBottom: "6px" }} />
                ))
              ) : filteredStudents.length === 0 ? (
                <p style={{ textAlign: "center", padding: "32px 0", fontSize: "13px", color: "#94a3b8" }}>No students found</p>
              ) : (
                filteredStudents.map((s, idx) => {
                  const isSelected = selectedStudent === s.id;
                  return (
                    <button key={s.id} onClick={() => setSelectedStudent(s.id)} style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: isSelected ? "1.5px solid rgba(0,85,255,0.3)" : "1.5px solid transparent", background: isSelected ? "rgba(0,85,255,0.06)" : "transparent", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", textAlign: "left", transition: "all 0.15s", marginBottom: "4px" }} onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "#f8fafc"; }} onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: avatarGradients[idx % avatarGradients.length], display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "#ffffff" }}>{s.firstName?.[0]}{s.lastName?.[0]}</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.firstName} {s.lastName}</p>
                        <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#94a3b8" }}>{s.class?.displayName || s.class?.name || "—"} · {s.admissionNumber}</p>
                      </div>
                      {isSelected && <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#0055ff", flexShrink: 0 }} />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Preview Area */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {reportData ? (
            <>
              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button onClick={() => setShowPreview(!showPreview)} style={btnStyle("#ffffff")}>
                  <span style={{ color: "#475569" }}><Eye style={{ width: "16px", height: "16px", display: "inline" }} /></span> <span style={{ color: "#475569" }}>{showPreview ? "Hide Preview" : "Preview"}</span>
                </button>
                <PDFDownloadLink
                  document={<ReportCardPDF {...reportData} />}
                  fileName={`report_card_${reportData.studentData.admissionNumber}.pdf`}
                  style={{ ...btnStyle("#0055ff"), textDecoration: "none" }}
                >
                  {({ loading: l }) => l ? "Generating..." : <><Download style={{ width: "16px", height: "16px" }} /> Download PDF</>}
                </PDFDownloadLink>
                <button onClick={() => {
                  const w = window.open("", "_blank");
                  if (!w) return;
                  w.document.write(`<html><head><title>Report Card - ${reportData.studentData.name}</title><style>body{font-family:sans-serif;padding:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:8px;text-align:left}th{background:#1e3a8a;color:white}</style></head><body><h2>${reportData.school?.name || "School"} - Report Card</h2><p><strong>${reportData.studentData.name}</strong> | ${reportData.studentData.admissionNumber} | ${reportData.studentData.className}</p><p>${reportData.termData.name} - ${reportData.termData.academicYear}</p><table><tr><th>Subject</th><th>CA1</th><th>CA2</th><th>CA3</th><th>Exam</th><th>Total</th><th>Grade</th></tr>${reportData.grades.map(g => `<tr><td>${g.subject}</td><td>${g.ca1}</td><td>${g.ca2}</td><td>${g.ca3}</td><td>${g.exam}</td><td>${g.total}</td><td>${g.grade}</td></tr>`).join("")}</table><p><strong>Attendance:</strong> ${reportData.attendance.present}/${reportData.attendance.totalDays} days</p><script>window.onload=function(){window.print()}<\/script></body></html>`);
                  w.document.close();
                }} style={btnStyle("#ffffff")}>
                  <span style={{ color: "#475569" }}><Printer style={{ width: "16px", height: "16px", display: "inline" }} /></span> <span style={{ color: "#475569" }}>Print</span>
                </button>
              </div>

              {/* PDF Preview */}
              {showPreview && (
                <div style={{ borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden", height: "700px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                  <PDFViewer width="100%" height="100%" showToolbar={false}>
                    <ReportCardPDF {...reportData} />
                  </PDFViewer>
                </div>
              )}

              {/* Report Card Details */}
              {!showPreview && (
                <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" }}>
                  <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9" }}>
                    <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>Report Card Details</h3>
                  </div>
                  <div style={{ padding: "20px 24px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                      {[
                        { label: "Student", value: reportData.studentData.name },
                        { label: "Class", value: reportData.studentData.className },
                        { label: "Term", value: reportData.termData.name },
                        { label: "Session", value: reportData.termData.academicYear },
                      ].map((item, i) => (
                        <div key={i} style={{ padding: "14px 16px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #f1f5f9" }}>
                          <p style={{ margin: 0, fontSize: "10px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.label}</p>
                          <p style={{ margin: "6px 0 0", fontSize: "14px", fontWeight: 600, color: "#0f172a" }}>{item.value}</p>
                        </div>
                      ))}
                    </div>

                    {reportData.grades.length > 0 && (
                      <div>
                        <p style={{ margin: "0 0 12px", fontSize: "12px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Subjects ({reportData.grades.length})</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          {reportData.grades.map((g, i) => (
                            <div key={i} style={{ padding: "12px 16px", borderRadius: "10px", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "background 0.1s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")} onMouseLeave={(e) => (e.currentTarget.style.background = "#f8fafc")}>
                              <span style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>{g.subject}</span>
                              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <span style={{ fontSize: "12px", color: "#64748b" }}>CA: {g.ca1 + g.ca2}</span>
                                <span style={{ fontSize: "12px", color: "#64748b" }}>Exam: {g.exam}</span>
                                <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a", minWidth: "36px", textAlign: "right" }}>{g.total}%</span>
                                <span style={{ padding: "3px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 700, background: getGradeBg(g.total), color: getGradeColor(g.total) }}>{g.grade}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* QR Verification */}
              <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", padding: "24px" }}>
                <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>QR Verification</h3>
                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                  <div style={{ width: "80px", height: "80px", borderRadius: "16px", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <QrCode style={{ width: "40px", height: "40px", color: "#0055ff" }} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#475569" }}>Each report card includes a unique QR code for third-party verification.</p>
                    <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#94a3b8" }}>Scan to verify authenticity of this report card.</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Empty State */
            <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", padding: "80px 40px", textAlign: "center" }}>
              <div style={{ width: "80px", height: "80px", borderRadius: "20px", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <FileText style={{ width: "36px", height: "36px", color: "#cbd5e1" }} />
              </div>
              <p style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "#94a3b8" }}>Select a student to generate their report card</p>
              <p style={{ margin: "6px 0 0", fontSize: "13px", color: "#cbd5e1" }}>The report card will be generated with real data from the database</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
