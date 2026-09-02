"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { SCHOOL_CONFIG } from "@/lib/school-config";
import { GRADE_SCALE } from "@/lib/constants";
import {
  FileText,
  Download,
  Printer,
  Search,
  GraduationCap,
  Award,
  BookOpen,
  Loader2,
  Stamp,
  PenLine,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface Term {
  id: string;
  name: string;
  academicYear: string;
  isCurrent?: boolean;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
  class?: { id: string; name: string; displayName?: string };
  photo?: string;
}

interface Grade {
  id: string;
  subject?: { id: string; name: string; code?: string };
  ca1?: number;
  ca2?: number;
  ca3?: number;
  exam?: number;
  total?: number;
  grade?: string;
  remark?: string;
  termId?: string;
  term?: { id: string; name: string; academicYear: string };
  type?: string;
  score?: number;
  maxScore?: number;
}

interface TermGrades {
  term: Term;
  grades: Grade[];
  termGPA: number;
  totalScore: number;
  avgScore: number;
}

function getGradePoint(grade: string): number {
  const match = GRADE_SCALE.find((g) => g.grade === grade);
  return match ? match.gpa : 0;
}

function getGradeFromScore(score: number): string {
  const match = GRADE_SCALE.find((g) => score >= g.min && score <= g.max);
  return match ? match.grade : "F9";
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 16px",
  borderRadius: "12px",
  border: "1.5px solid #e2e8f0",
  fontSize: "13px",
  color: "#0f172a",
  outline: "none",
  boxSizing: "border-box",
  background: "#f8fafc",
  transition: "border-color 0.2s, box-shadow 0.2s",
};
const inputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
  e.currentTarget.style.borderColor = "#0055ff";
  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,85,255,0.1)";
  e.currentTarget.style.background = "#ffffff";
};
const inputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
  e.currentTarget.style.borderColor = "#e2e8f0";
  e.currentTarget.style.boxShadow = "none";
  e.currentTarget.style.background = "#f8fafc";
};
const btnStyle = (bg: string, disabled?: boolean): React.CSSProperties => ({
  padding: "10px 20px",
  borderRadius: "12px",
  border: "none",
  background: disabled ? "#94a3b8" : bg,
  color: "#ffffff",
  fontSize: "13px",
  fontWeight: 600,
  cursor: disabled ? "not-allowed" : "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  transition: "all 0.15s",
  opacity: disabled ? 0.6 : 1,
});

const avatarGradients = [
  "linear-gradient(135deg, #0055ff, #0033cc)",
  "linear-gradient(135deg, #8b5cf6, #7c3aed)",
  "linear-gradient(135deg, #10b981, #059669)",
  "linear-gradient(135deg, #f59e0b, #d97706)",
  "linear-gradient(135deg, #ef4444, #dc2626)",
  "linear-gradient(135deg, #06b6d4, #0891b2)",
];

function getGradeColor(total: number): { color: string; bg: string } {
  if (total >= 70) return { color: "#16a34a", bg: "#dcfce7" };
  if (total >= 50) return { color: "#2563eb", bg: "#eff6ff" };
  if (total >= 40) return { color: "#ca8a04", bg: "#fef9c3" };
  return { color: "#dc2626", bg: "#fee2e2" };
}

function getGradeBadge(grade: string): { color: string; bg: string } {
  const letter = grade?.[0] || "F";
  if (letter === "A") return { color: "#16a34a", bg: "#dcfce7" };
  if (letter === "B") return { color: "#2563eb", bg: "#eff6ff" };
  if (letter === "C") return { color: "#ca8a04", bg: "#fef9c3" };
  if (letter === "D") return { color: "#ea580c", bg: "#fff7ed" };
  return { color: "#dc2626", bg: "#fee2e2" };
}

export default function TranscriptPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [studentSearch, setStudentSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fetchingGrades, setFetchingGrades] = useState(false);
  const [allGrades, setAllGrades] = useState<Grade[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [printMode, setPrintMode] = useState(false);
  const [expandedTerms, setExpandedTerms] = useState<Set<string>>(new Set());
  const transcriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/calendar")
        .then((r) => r.json())
        .then((d) => setTerms(d.terms || []))
        .catch(() => {}),
      fetch("/api/students?limit=100")
        .then((r) => r.json())
        .then((d) => setStudents(d.students || []))
        .catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedStudentId) {
      setAllGrades([]);
      setSelectedStudent(null);
      return;
    }
    setFetchingGrades(true);
    const student = students.find((s) => s.id === selectedStudentId) || null;
    setSelectedStudent(student);
    fetch(`/api/grades?studentId=${selectedStudentId}`)
      .then((r) => r.json())
      .then((d) => setAllGrades(d.grades || []))
      .catch(() => setAllGrades([]))
      .finally(() => setFetchingGrades(false));
  }, [selectedStudentId, students]);

  const termGradesData: TermGrades[] = useMemo(() => {
    if (!allGrades.length || !terms.length) return [];

    const grouped: Record<string, Grade[]> = {};
    allGrades.forEach((g) => {
      const tid = g.termId || g.term?.id || "unknown";
      if (!grouped[tid]) grouped[tid] = [];
      grouped[tid].push(g);
    });

    return terms
      .filter((t) => grouped[t.id]?.length)
      .map((term) => {
        const grades = grouped[term.id];
        const totalScore = grades.reduce((sum, g) => sum + (g.total ?? g.score ?? 0), 0);
        const avgScore = grades.length ? Math.round(totalScore / grades.length) : 0;
        const totalPoints = grades.reduce((sum, g) => {
          const gradeVal = g.total ?? g.score ?? 0;
          const gradeStr = g.grade || getGradeFromScore(gradeVal);
          return sum + getGradePoint(gradeStr);
        }, 0);
        const termGPA = grades.length ? Math.round((totalPoints / grades.length) * 100) / 100 : 0;
        return { term, grades, termGPA, totalScore, avgScore };
      });
  }, [allGrades, terms]);

  const cumulativeGPA = useMemo(() => {
    if (!termGradesData.length) return 0;
    const sum = termGradesData.reduce((acc, t) => acc + t.termGPA, 0);
    return Math.round((sum / termGradesData.length) * 100) / 100;
  }, [termGradesData]);

  const totalSubjects = useMemo(() => {
    const subjects = new Set<string>();
    allGrades.forEach((g) => {
      if (g.subject?.name) subjects.add(g.subject.name);
    });
    return subjects.size;
  }, [allGrades]);

  const overallAvg = useMemo(() => {
    if (!termGradesData.length) return 0;
    const total = termGradesData.reduce((acc, t) => acc + t.avgScore * t.grades.length, 0);
    const count = termGradesData.reduce((acc, t) => acc + t.grades.length, 0);
    return count ? Math.round(total / count) : 0;
  }, [termGradesData]);

  const filteredStudents = students.filter(
    (s) =>
      !studentSearch ||
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.admissionNumber?.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const toggleTerm = (termId: string) => {
    setExpandedTerms((prev) => {
      const next = new Set(prev);
      if (next.has(termId)) next.delete(termId);
      else next.add(termId);
      return next;
    });
  };

  const handlePrint = () => {
    setPrintMode(true);
    setTimeout(() => {
      window.print();
      setTimeout(() => setPrintMode(false), 500);
    }, 200);
  };

  const handleDownloadPDF = () => {
    if (!selectedStudent || !termGradesData.length) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const termSections = termGradesData
      .map(
        (tg) => `
      <div class="term-section">
        <h3>${tg.term.name} (${tg.term.academicYear})</h3>
        <table>
          <thead>
            <tr>
              <th>S/N</th>
              <th>Subject</th>
              <th>CA1</th>
              <th>CA2</th>
              <th>Exam</th>
              <th>Total</th>
              <th>Grade</th>
              <th>Remark</th>
            </tr>
          </thead>
          <tbody>
            ${tg.grades
              .map(
                (g, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${g.subject?.name || "—"}</td>
                <td>${g.ca1 ?? "—"}</td>
                <td>${g.ca2 ?? "—"}</td>
                <td>${g.exam ?? "—"}</td>
                <td><strong>${g.total ?? g.score ?? "—"}</strong></td>
                <td><strong>${g.grade || getGradeFromScore(g.total ?? g.score ?? 0)}</strong></td>
                <td>${g.remark || "—"}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        <div class="term-summary">
          <span>Term Average: <strong>${tg.avgScore}%</strong></span>
          <span>Term GPA: <strong>${tg.termGPA.toFixed(2)}</strong></span>
        </div>
      </div>
    `
      )
      .join("");

    printWindow.document.write(`<!DOCTYPE html>
<html><head><title>Academic Transcript - ${selectedStudent.firstName} ${selectedStudent.lastName}</title>
<style>
  body { font-family: 'Times New Roman', serif; padding: 40px; color: #1a1a1a; font-size: 13px; }
  .header { text-align: center; border-bottom: 3px double #003366; padding-bottom: 20px; margin-bottom: 25px; }
  .header h1 { font-size: 22px; color: #003366; margin: 0; letter-spacing: 2px; text-transform: uppercase; }
  .header h2 { font-size: 15px; color: #003366; margin: 5px 0 0 0; font-weight: normal; }
  .header p { color: #555; font-size: 11px; margin: 3px 0 0 0; }
  .transcript-title { text-align: center; font-size: 18px; font-weight: bold; margin: 20px 0; text-decoration: underline; color: #003366; }
  .student-info { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 20px; padding: 15px; border: 1px solid #ccc; background: #f9f9f9; }
  .student-info span { font-size: 12px; }
  .student-info strong { color: #003366; }
  h3 { font-size: 15px; color: #003366; border-bottom: 1px solid #003366; padding-bottom: 5px; margin: 25px 0 10px 0; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th, td { border: 1px solid #999; padding: 6px 10px; text-align: left; font-size: 12px; }
  th { background: #003366; color: white; font-weight: 600; text-transform: uppercase; font-size: 10px; letter-spacing: 0.5px; }
  tr:nth-child(even) { background: #f0f4f8; }
  .term-summary { display: flex; justify-content: flex-end; gap: 30px; margin-top: 8px; padding: 8px 12px; background: #f0f4f8; border: 1px solid #ccc; font-size: 12px; }
  .cumulative { margin-top: 30px; padding: 20px; border: 2px solid #003366; background: #f9f9f9; }
  .cumulative h3 { border-bottom: 2px solid #003366; text-align: center; }
  .cumulative-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-top: 10px; }
  .cumulative-item { text-align: center; padding: 10px; border: 1px solid #ddd; }
  .cumulative-item .value { font-size: 24px; font-weight: bold; color: #003366; }
  .cumulative-item .label { font-size: 11px; color: #666; margin-top: 4px; }
  .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; margin-top: 50px; padding-top: 20px; }
  .sig-line { text-align: center; }
  .sig-line .line { border-top: 1px solid #333; width: 200px; margin: 0 auto; padding-top: 5px; }
  .stamp-area { text-align: center; margin-top: 30px; padding: 15px; border: 2px dashed #999; width: 200px; margin-left: auto; margin-right: auto; color: #999; font-size: 11px; }
  .footer-note { text-align: center; margin-top: 30px; font-size: 10px; color: #666; border-top: 1px solid #ccc; padding-top: 10px; }
  @media print { body { padding: 20px; } }
</style></head><body>
  <div class="header">
    <h1>${SCHOOL_CONFIG.name}</h1>
    <h2>Academic Affairs Office</h2>
    <p>Official Academic Transcript of Record</p>
  </div>

  <div class="transcript-title">STUDENT ACADEMIC TRANSCRIPT</div>

  <div class="student-info">
    <span><strong>Student Name:</strong> ${selectedStudent.firstName} ${selectedStudent.lastName}</span>
    <span><strong>Admission Number:</strong> ${selectedStudent.admissionNumber}</span>
    <span><strong>Class/Programme:</strong> ${selectedStudent.class?.displayName || selectedStudent.class?.name || "—"}</span>
    <span><strong>Number of Terms:</strong> ${termGradesData.length}</span>
    <span><strong>Number of Subjects:</strong> ${totalSubjects}</span>
    <span><strong>Date Issued:</strong> ${new Date().toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" })}</span>
  </div>

  ${termSections}

  <div class="cumulative">
    <h3>CUMULATIVE SUMMARY</h3>
    <div class="cumulative-grid">
      <div class="cumulative-item">
        <div class="value">${cumulativeGPA.toFixed(2)}</div>
        <div class="label">Cumulative GPA</div>
      </div>
      <div class="cumulative-item">
        <div class="value">${overallAvg}%</div>
        <div class="label">Overall Average</div>
      </div>
      <div class="cumulative-item">
        <div class="value">${termGradesData.length}</div>
        <div class="label">Terms Completed</div>
      </div>
    </div>
  </div>

  <div class="signatures">
    <div class="sig-line">
      <div class="line"></div>
      <p style="font-size:12px; margin-top:5px;"><strong>Dean of Faculty</strong></p>
      <p style="font-size:10px; color:#666;">Date: _______________</p>
    </div>
    <div class="sig-line">
      <div class="line"></div>
      <p style="font-size:12px; margin-top:5px;"><strong>School Principal</strong></p>
      <p style="font-size:10px; color:#666;">Date: _______________</p>
    </div>
  </div>

  <div class="stamp-area">OFFICIAL STAMP</div>

  <div class="footer-note">
    This is an official academic transcript issued by ${SCHOOL_CONFIG.name}. Any alteration or forgery of this document is prohibited.<br/>
    Transcript ID: TRN-${Date.now().toString(36).toUpperCase()}
  </div>

  <script>window.onload=function(){window.print();}<\/script>
</body></html>`);
    printWindow.document.close();
  };

  return (
    <div style={{ padding: "24px 32px", minHeight: "100vh", background: "#f8fafc", display: printMode ? "none" : "block" }}>
      {/* Gradient Header */}
      <div style={{ background: "linear-gradient(135deg, #0a2a6e, #0055ff)", borderRadius: "20px", padding: "28px 32px", marginBottom: "28px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 90% 20%, rgba(255,255,255,0.12) 0%, transparent 60%), radial-gradient(circle at 10% 80%, rgba(255,255,255,0.08) 0%, transparent 50%)" }} />
        <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "26px", fontWeight: 800, color: "#ffffff", display: "flex", alignItems: "center", gap: "12px" }}>
              <GraduationCap style={{ width: "28px", height: "28px" }} /> Academic Transcript
            </h1>
            <p style={{ margin: "6px 0 0", fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>Cumulative student transcript with term-by-term breakdown</p>
          </div>
          {selectedStudent && termGradesData.length > 0 && (
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button onClick={handlePrint} style={btnStyle("#ffffff")}>
                <span style={{ color: "#475569" }}><Printer style={{ width: "16px", height: "16px", display: "inline" }} /></span>
                <span style={{ color: "#475569" }}>Print</span>
              </button>
              <button onClick={handleDownloadPDF} style={btnStyle("#0055ff")}>
                <Download style={{ width: "16px", height: "16px" }} /> Download PDF
              </button>
            </div>
          )}
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Terms Recorded", value: termGradesData.length, bg: "linear-gradient(135deg, #0055ff, #0033cc)", icon: <BookOpen style={{ width: "20px", height: "20px", color: "#ffffff" }} /> },
          { label: "Subjects", value: totalSubjects, bg: "linear-gradient(135deg, #8b5cf6, #7c3aed)", icon: <FileText style={{ width: "20px", height: "20px", color: "#ffffff" }} /> },
          { label: "Cumulative GPA", value: cumulativeGPA.toFixed(2), bg: "linear-gradient(135deg, #10b981, #059669)", icon: <Award style={{ width: "20px", height: "20px", color: "#ffffff" }} /> },
          { label: "Overall Average", value: `${overallAvg}%`, bg: "linear-gradient(135deg, #f59e0b, #d97706)", icon: <GraduationCap style={{ width: "20px", height: "20px", color: "#ffffff" }} /> },
        ].map((stat, i) => (
          <div key={i} style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "20px 22px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: stat.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {stat.icon}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: "13px", fontWeight: 500, color: "#64748b" }}>{stat.label}</p>
                <p style={{ margin: "4px 0 0", fontSize: "24px", fontWeight: 800, color: "#0f172a" }}>{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px" }}>
        {/* Student Selector */}
        <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9" }}>
            <h3 style={{ margin: "0 0 12px", fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>Select Student</h3>
            <div style={{ position: "relative" }}>
              <Search style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "#94a3b8" }} />
              <input
                type="text"
                placeholder="Search students..."
                value={studentSearch}
                onChange={(e) => { setStudentSearch(e.target.value); setShowDropdown(true); }}
                onFocus={(e) => { setShowDropdown(true); inputFocus(e); }}
                onBlur={(e) => { inputBlur(e); }}
                style={{ ...inputStyle, paddingLeft: "36px", padding: "10px 14px 10px 36px" }}
              />
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
                const isSelected = selectedStudentId === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => { setSelectedStudentId(s.id); setShowDropdown(false); setStudentSearch(""); }}
                    style={{
                      width: "100%", padding: "12px 16px", borderRadius: "12px",
                      border: isSelected ? "1.5px solid rgba(0,85,255,0.3)" : "1.5px solid transparent",
                      background: isSelected ? "rgba(0,85,255,0.06)" : "transparent",
                      cursor: "pointer", display: "flex", alignItems: "center", gap: "12px",
                      textAlign: "left", transition: "all 0.15s", marginBottom: "4px",
                    }}
                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "#f8fafc"; }}
                    onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
                  >
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

        {/* Transcript Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {selectedStudent && termGradesData.length > 0 ? (
            <>
              {/* Student Info Card */}
              <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", padding: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "20px" }}>
                  <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: "linear-gradient(135deg, #0055ff, #0033cc)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: "22px", fontWeight: 800, color: "#ffffff" }}>{selectedStudent.firstName?.[0]}{selectedStudent.lastName?.[0]}</span>
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "#0f172a" }}>{selectedStudent.firstName} {selectedStudent.lastName}</h2>
                    <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>
                      {selectedStudent.admissionNumber} · {selectedStudent.class?.displayName || selectedStudent.class?.name || "—"}
                    </p>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
                  {[
                    { label: "CGPA", value: cumulativeGPA.toFixed(2), color: "#0055ff" },
                    { label: "Overall Avg", value: `${overallAvg}%`, color: "#0f172a" },
                    { label: "Terms", value: termGradesData.length, color: "#0f172a" },
                    { label: "Subjects", value: totalSubjects, color: "#0f172a" },
                  ].map((item, i) => (
                    <div key={i} style={{ padding: "14px 16px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #f1f5f9", textAlign: "center" }}>
                      <p style={{ margin: 0, fontSize: "10px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.label}</p>
                      <p style={{ margin: "6px 0 0", fontSize: "22px", fontWeight: 800, color: item.color }}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Term Sections */}
              {termGradesData.map((tg) => {
                const isExpanded = expandedTerms.has(tg.term.id);
                return (
                  <div key={tg.term.id} style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" }}>
                    <button
                      onClick={() => toggleTerm(tg.term.id)}
                      style={{
                        width: "100%", padding: "18px 24px", border: "none", background: "#ffffff",
                        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between",
                        borderBottom: isExpanded ? "1px solid #f1f5f9" : "none",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #0055ff, #0033cc)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <BookOpen style={{ width: "18px", height: "18px", color: "#ffffff" }} />
                        </div>
                        <div style={{ textAlign: "left" }}>
                          <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>{tg.term.name}</p>
                          <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#94a3b8" }}>{tg.term.academicYear}</p>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div style={{ textAlign: "right" }}>
                          <p style={{ margin: 0, fontSize: "10px", color: "#94a3b8" }}>AVG</p>
                          <p style={{ margin: "2px 0 0", fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>{tg.avgScore}%</p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <p style={{ margin: 0, fontSize: "10px", color: "#94a3b8" }}>GPA</p>
                          <p style={{ margin: "2px 0 0", fontSize: "14px", fontWeight: 700, color: "#0055ff" }}>{tg.termGPA.toFixed(2)}</p>
                        </div>
                        <div style={{ padding: "4px 10px", borderRadius: "8px", background: "#f1f5f9", color: "#64748b" }}>
                          {tg.grades.length} subjects
                        </div>
                        {isExpanded ? <ChevronUp style={{ width: "20px", height: "20px", color: "#94a3b8" }} /> : <ChevronDown style={{ width: "20px", height: "20px", color: "#94a3b8" }} />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div style={{ padding: "0 24px 20px" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "16px" }}>
                          <thead>
                            <tr>
                              {["#", "Subject", "CA1", "CA2", "Exam", "Total", "Grade", "Remark"].map((h) => (
                                <th key={h} style={{ padding: "10px 12px", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: h === "#" || h === "Subject" || h === "Remark" ? "left" : "center", borderBottom: "2px solid #e2e8f0" }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {tg.grades.map((g, i) => {
                              const total = g.total ?? g.score ?? 0;
                              const gradeStr = g.grade || getGradeFromScore(total);
                              const gc = getGradeBadge(gradeStr);
                              return (
                                <tr key={g.id || i} style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.1s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                                  <td style={{ padding: "12px", fontSize: "12px", color: "#64748b" }}>{i + 1}</td>
                                  <td style={{ padding: "12px", fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>{g.subject?.name || "—"}</td>
                                  <td style={{ padding: "12px", fontSize: "13px", color: "#475569", textAlign: "center" }}>{g.ca1 ?? "—"}</td>
                                  <td style={{ padding: "12px", fontSize: "13px", color: "#475569", textAlign: "center" }}>{g.ca2 ?? "—"}</td>
                                  <td style={{ padding: "12px", fontSize: "13px", color: "#475569", textAlign: "center" }}>{g.exam ?? "—"}</td>
                                  <td style={{ padding: "12px", fontSize: "13px", fontWeight: 700, color: "#0f172a", textAlign: "center" }}>{total}</td>
                                  <td style={{ padding: "12px", textAlign: "center" }}>
                                    <span style={{ padding: "3px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 700, background: gc.bg, color: gc.color }}>{gradeStr}</span>
                                  </td>
                                  <td style={{ padding: "12px", fontSize: "12px", color: "#64748b" }}>{g.remark || "—"}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "24px", marginTop: "12px", padding: "12px 16px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #f1f5f9" }}>
                          <span style={{ fontSize: "13px", color: "#64748b" }}>Term Average: <strong style={{ color: "#0f172a" }}>{tg.avgScore}%</strong></span>
                          <span style={{ fontSize: "13px", color: "#64748b" }}>Term GPA: <strong style={{ color: "#0055ff" }}>{tg.termGPA.toFixed(2)}</strong></span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Cumulative Summary */}
              <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", padding: "28px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "linear-gradient(135deg, #10b981, #059669)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Award style={{ width: "20px", height: "20px", color: "#ffffff" }} />
                  </div>
                  <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#0f172a" }}>Cumulative Summary</h3>
                </div>

                {/* Summary Table */}
                <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
                  <thead>
                    <tr>
                      {["Term", "Session", "Subjects", "Average", "GPA"].map((h) => (
                        <th key={h} style={{ padding: "10px 12px", fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left", borderBottom: "2px solid #e2e8f0" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {termGradesData.map((tg) => (
                      <tr key={tg.term.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "12px", fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>{tg.term.name}</td>
                        <td style={{ padding: "12px", fontSize: "13px", color: "#64748b" }}>{tg.term.academicYear}</td>
                        <td style={{ padding: "12px", fontSize: "13px", color: "#64748b", textAlign: "center" }}>{tg.grades.length}</td>
                        <td style={{ padding: "12px", fontSize: "13px", fontWeight: 700, color: "#0f172a", textAlign: "center" }}>{tg.avgScore}%</td>
                        <td style={{ padding: "12px", fontSize: "13px", fontWeight: 700, color: "#0055ff", textAlign: "center" }}>{tg.termGPA.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Summary Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "28px" }}>
                  {[
                    { label: "Cumulative GPA", value: cumulativeGPA.toFixed(2), color: "#0055ff" },
                    { label: "Overall Average", value: `${overallAvg}%`, color: "#0f172a" },
                    { label: "Total Subjects", value: totalSubjects, color: "#0f172a" },
                  ].map((item, i) => (
                    <div key={i} style={{ padding: "16px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #f1f5f9", textAlign: "center" }}>
                      <p style={{ margin: 0, fontSize: "10px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.label}</p>
                      <p style={{ margin: "6px 0 0", fontSize: "26px", fontWeight: 800, color: item.color }}>{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Signatures */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", paddingTop: "28px", borderTop: "1px solid #e2e8f0" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ width: "200px", margin: "0 auto", borderBottom: "1px solid #94a3b8", marginBottom: "12px" }} />
                    <PenLine style={{ width: "16px", height: "16px", color: "#94a3b8", marginBottom: "6px" }} />
                    <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#475569" }}>Dean of Faculty</p>
                    <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#94a3b8" }}>Date: _______________</p>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ width: "200px", margin: "0 auto", borderBottom: "1px solid #94a3b8", marginBottom: "12px" }} />
                    <PenLine style={{ width: "16px", height: "16px", color: "#94a3b8", marginBottom: "6px" }} />
                    <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#475569" }}>School Principal</p>
                    <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#94a3b8" }}>Date: _______________</p>
                  </div>
                </div>

                {/* Official Stamp */}
                <div style={{ marginTop: "28px", padding: "20px", border: "2px dashed #e2e8f0", borderRadius: "12px", textAlign: "center" }}>
                  <Stamp style={{ width: "28px", height: "28px", color: "#94a3b8", marginBottom: "8px" }} />
                  <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8" }}>Official School Stamp</p>
                </div>

                <p style={{ textAlign: "center", fontSize: "11px", color: "#94a3b8", marginTop: "20px" }}>
                  This is an official academic transcript issued by {SCHOOL_CONFIG.name}. Any alteration or forgery is strictly prohibited.
                </p>
              </div>
            </>
          ) : fetchingGrades ? (
            <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "80px 40px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <div style={{ width: "80px", height: "80px", borderRadius: "20px", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <Loader2 style={{ width: "36px", height: "36px", color: "#0055ff" }} className="animate-spin" />
              </div>
              <p style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "#94a3b8" }}>Loading transcript data...</p>
            </div>
          ) : selectedStudent ? (
            <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "80px 40px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <div style={{ width: "80px", height: "80px", borderRadius: "20px", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <FileText style={{ width: "36px", height: "36px", color: "#cbd5e1" }} />
              </div>
              <p style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "#94a3b8" }}>No grade records found for {selectedStudent.firstName}</p>
              <p style={{ margin: "6px 0 0", fontSize: "13px", color: "#cbd5e1" }}>Grades must be entered across terms to generate a transcript</p>
            </div>
          ) : (
            <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "80px 40px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <div style={{ width: "80px", height: "80px", borderRadius: "20px", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <GraduationCap style={{ width: "36px", height: "36px", color: "#cbd5e1" }} />
              </div>
              <p style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "#94a3b8" }}>Select a student to view their academic transcript</p>
              <p style={{ margin: "6px 0 0", fontSize: "13px", color: "#cbd5e1" }}>The transcript displays cumulative performance across all terms</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
