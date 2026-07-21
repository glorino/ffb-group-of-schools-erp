"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Download,
  Printer,
  Search,
  GraduationCap,
  Award,
  BookOpen,
  Loader2,
  ChevronDown,
  Stamp,
  PenLine,
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

const GRADING_SCALE: { grade: string; min: number; max: number; points: number; remark: string }[] = [
  { grade: "A1", min: 75, max: 100, points: 4.0, remark: "Excellent" },
  { grade: "B2", min: 70, max: 74, points: 3.5, remark: "Very Good" },
  { grade: "B3", min: 65, max: 69, points: 3.0, remark: "Good" },
  { grade: "C4", min: 60, max: 64, points: 2.5, remark: "Credit" },
  { grade: "C5", min: 55, max: 59, points: 2.0, remark: "Credit" },
  { grade: "C6", min: 50, max: 54, points: 1.5, remark: "Credit" },
  { grade: "D7", min: 45, max: 49, points: 1.0, remark: "Pass" },
  { grade: "E8", min: 40, max: 44, points: 0.5, remark: "Pass" },
  { grade: "F9", min: 0, max: 39, points: 0.0, remark: "Fail" },
];

function getGradePoint(grade: string): number {
  const match = GRADING_SCALE.find((g) => g.grade === grade);
  return match ? match.points : 0;
}

function getGradeFromScore(score: number): string {
  const match = GRADING_SCALE.find((g) => score >= g.min && score <= g.max);
  return match ? match.grade : "F9";
}

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
};

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
    const totalTerms = termGradesData.length;
    const sum = termGradesData.reduce((acc, t) => acc + t.termGPA, 0);
    return Math.round((sum / totalTerms) * 100) / 100;
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
    <h1>FFB Group of Schools</h1>
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
    This is an official academic transcript issued by FFB Group of Schools. Any alteration or forgery of this document is prohibited.<br/>
    Transcript ID: TRN-${Date.now().toString(36).toUpperCase()}
  </div>

  <script>window.onload=function(){window.print();}<\/script>
</body></html>`);
    printWindow.document.close();
  };

  const getGradeColor = (grade: string) => {
    if (grade?.startsWith("A")) return "text-emerald-400 bg-emerald-500/15 border-emerald-500/25";
    if (grade?.startsWith("B")) return "text-blue-400 bg-blue-500/15 border-blue-500/25";
    if (grade?.startsWith("C")) return "text-yellow-400 bg-yellow-500/15 border-yellow-500/25";
    if (grade?.startsWith("D")) return "text-orange-400 bg-orange-500/15 border-orange-500/25";
    return "text-red-400 bg-red-500/15 border-red-500/25";
  };

  return (
    <motion.div {...fadeIn} className={`space-y-5 ${printMode ? "hidden" : ""}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-white/95 font-display tracking-tight flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-700 flex items-center justify-center">
              <GraduationCap className="w-[18px] h-[18px] text-white" />
            </div>
            Academic Transcript
          </h1>
          <p className="text-white/30 text-[12px] mt-1 ml-[46px]">Cumulative student transcript with term-by-term breakdown</p>
        </div>
        {selectedStudent && termGradesData.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/60 text-[12px] font-medium hover:bg-white/[0.08] transition"
            >
              <Printer className="w-4 h-4" /> Print
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--primary)] text-white text-[12px] font-semibold hover:brightness-110 transition"
            >
              <Download className="w-4 h-4" /> Download PDF
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.07] p-5">
          <p className="text-white/40 text-[12px]">Terms Recorded</p>
          <p className="text-[28px] font-bold text-white mt-1">{termGradesData.length}</p>
        </div>
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.07] p-5">
          <p className="text-white/40 text-[12px]">Subjects</p>
          <p className="text-[28px] font-bold text-white mt-1">{totalSubjects}</p>
        </div>
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.07] p-5">
          <p className="text-white/40 text-[12px]">Cumulative GPA</p>
          <p className="text-[28px] font-bold text-[var(--accent)] mt-1">{cumulativeGPA.toFixed(2)}</p>
        </div>
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.07] p-5">
          <p className="text-white/40 text-[12px]">Overall Average</p>
          <p className="text-[28px] font-bold text-white mt-1">{overallAvg}%</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        <div className="lg:col-span-2 bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.07] p-5">
          <h3 className="text-white/90 font-semibold text-[14px] mb-3">Select Student</h3>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
            <input
              type="text"
              placeholder="Search students..."
              value={studentSearch}
              onChange={(e) => {
                setStudentSearch(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/90 text-[12px] placeholder-white/20 outline-none focus:border-[var(--primary)]/50"
            />
          </div>
          <div className="space-y-1 max-h-[400px] overflow-y-auto">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 rounded-xl bg-white/[0.04] animate-pulse" />
              ))
            ) : filteredStudents.length === 0 ? (
              <p className="text-white/30 text-[12px] text-center py-8">No students found</p>
            ) : (
              filteredStudents.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSelectedStudentId(s.id);
                    setShowDropdown(false);
                    setStudentSearch("");
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition ${
                    selectedStudentId === s.id
                      ? "bg-[var(--primary)]/20 border border-[var(--primary)]/40"
                      : "hover:bg-white/[0.04] border border-transparent"
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                    {s.firstName?.[0]}{s.lastName?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/80 text-[12px] font-medium truncate">{s.firstName} {s.lastName}</p>
                    <p className="text-white/30 text-[10px]">{s.class?.displayName || s.class?.name || "—"} · {s.admissionNumber}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          {selectedStudent && termGradesData.length > 0 ? (
            <>
              <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.07] p-5">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-700 flex items-center justify-center text-white text-[18px] font-bold">
                    {selectedStudent.firstName?.[0]}{selectedStudent.lastName?.[0]}
                  </div>
                  <div>
                    <h3 className="text-white/95 font-bold text-[16px]">{selectedStudent.firstName} {selectedStudent.lastName}</h3>
                    <p className="text-white/40 text-[12px]">
                      {selectedStudent.admissionNumber} · {selectedStudent.class?.displayName || selectedStudent.class?.name || "—"}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-white/[0.04] text-center">
                    <p className="text-white/40 text-[10px]">CGPA</p>
                    <p className="text-[20px] font-bold text-[var(--accent)]">{cumulativeGPA.toFixed(2)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.04] text-center">
                    <p className="text-white/40 text-[10px]">Overall Avg</p>
                    <p className="text-[20px] font-bold text-white">{overallAvg}%</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.04] text-center">
                    <p className="text-white/40 text-[10px]">Terms</p>
                    <p className="text-[20px] font-bold text-white">{termGradesData.length}</p>
                  </div>
                </div>
              </div>

              {termGradesData.map((tg) => (
                <div key={tg.term.id} className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.07] p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-white/90 font-semibold text-[14px] flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-[var(--primary)]" />
                        {tg.term.name}
                      </h3>
                      <p className="text-white/30 text-[11px] ml-6">{tg.term.academicYear}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-white/40 text-[10px]">Term Avg</p>
                        <p className="text-white/80 text-[13px] font-bold">{tg.avgScore}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white/40 text-[10px]">GPA</p>
                        <p className="text-[var(--accent)] text-[13px] font-bold">{tg.termGPA.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/[0.08]">
                          <th className="text-left text-white/50 text-[10px] font-medium pb-2 uppercase tracking-wider w-8">#</th>
                          <th className="text-left text-white/50 text-[10px] font-medium pb-2 uppercase tracking-wider">Subject</th>
                          <th className="text-center text-white/50 text-[10px] font-medium pb-2 uppercase tracking-wider">CA1</th>
                          <th className="text-center text-white/50 text-[10px] font-medium pb-2 uppercase tracking-wider">CA2</th>
                          <th className="text-center text-white/50 text-[10px] font-medium pb-2 uppercase tracking-wider">Exam</th>
                          <th className="text-center text-white/50 text-[10px] font-medium pb-2 uppercase tracking-wider">Total</th>
                          <th className="text-center text-white/50 text-[10px] font-medium pb-2 uppercase tracking-wider">Grade</th>
                          <th className="text-left text-white/50 text-[10px] font-medium pb-2 uppercase tracking-wider">Remark</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tg.grades.map((g, i) => {
                          const total = g.total ?? g.score ?? 0;
                          const gradeStr = g.grade || getGradeFromScore(total);
                          return (
                            <tr key={g.id || i} className="border-b border-white/[0.04] hover:bg-white/[0.03] transition">
                              <td className="py-2.5 text-white/40 text-[11px]">{i + 1}</td>
                              <td className="py-2.5 text-white/80 text-[12px] font-medium">{g.subject?.name || "—"}</td>
                              <td className="py-2.5 text-white/60 text-[12px] text-center">{g.ca1 ?? "—"}</td>
                              <td className="py-2.5 text-white/60 text-[12px] text-center">{g.ca2 ?? "—"}</td>
                              <td className="py-2.5 text-white/60 text-[12px] text-center">{g.exam ?? "—"}</td>
                              <td className="py-2.5 text-white/90 text-[12px] font-bold text-center">{total}</td>
                              <td className="py-2.5 text-center">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${getGradeColor(gradeStr)}`}>
                                  {gradeStr}
                                </span>
                              </td>
                              <td className="py-2.5 text-white/40 text-[11px]">{g.remark || "—"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}

              <div className="bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/[0.1] p-6">
                <h3 className="text-white/90 font-semibold text-[15px] mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-[var(--accent)]" />
                  Cumulative Summary
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full mb-4">
                    <thead>
                      <tr className="border-b border-white/[0.1]">
                        <th className="text-left text-white/50 text-[10px] font-medium pb-2 uppercase tracking-wider">Term</th>
                        <th className="text-center text-white/50 text-[10px] font-medium pb-2 uppercase tracking-wider">Session</th>
                        <th className="text-center text-white/50 text-[10px] font-medium pb-2 uppercase tracking-wider">Subjects</th>
                        <th className="text-center text-white/50 text-[10px] font-medium pb-2 uppercase tracking-wider">Average</th>
                        <th className="text-center text-white/50 text-[10px] font-medium pb-2 uppercase tracking-wider">GPA</th>
                      </tr>
                    </thead>
                    <tbody>
                      {termGradesData.map((tg) => (
                        <tr key={tg.term.id} className="border-b border-white/[0.04]">
                          <td className="py-2.5 text-white/80 text-[12px] font-medium">{tg.term.name}</td>
                          <td className="py-2.5 text-white/50 text-[12px] text-center">{tg.term.academicYear}</td>
                          <td className="py-2.5 text-white/50 text-[12px] text-center">{tg.grades.length}</td>
                          <td className="py-2.5 text-white/80 text-[12px] font-bold text-center">{tg.avgScore}%</td>
                          <td className="py-2.5 text-[var(--accent)] text-[12px] font-bold text-center">{tg.termGPA.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/[0.08]">
                  <div className="text-center p-4 rounded-xl bg-white/[0.04]">
                    <p className="text-white/40 text-[10px] uppercase tracking-wider">Cumulative GPA</p>
                    <p className="text-[28px] font-bold text-[var(--accent)] mt-1">{cumulativeGPA.toFixed(2)}</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-white/[0.04]">
                    <p className="text-white/40 text-[10px] uppercase tracking-wider">Overall Average</p>
                    <p className="text-[28px] font-bold text-white mt-1">{overallAvg}%</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-white/[0.04]">
                    <p className="text-white/40 text-[10px] uppercase tracking-wider">Total Subjects</p>
                    <p className="text-[28px] font-bold text-white mt-1">{totalSubjects}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mt-8 pt-6 border-t border-white/[0.08]">
                  <div className="text-center">
                    <div className="w-48 mx-auto border-b border-white/30 mb-2" />
                    <PenLine className="w-4 h-4 text-white/20 mx-auto mb-1" />
                    <p className="text-white/60 text-[12px] font-medium">Dean of Faculty</p>
                    <p className="text-white/30 text-[10px]">Date: _______________</p>
                  </div>
                  <div className="text-center">
                    <div className="w-48 mx-auto border-b border-white/30 mb-2" />
                    <PenLine className="w-4 h-4 text-white/20 mx-auto mb-1" />
                    <p className="text-white/60 text-[12px] font-medium">School Principal</p>
                    <p className="text-white/30 text-[10px]">Date: _______________</p>
                  </div>
                </div>

                <div className="mt-6 p-4 border-2 border-dashed border-white/10 rounded-xl text-center">
                  <Stamp className="w-6 h-6 text-white/10 mx-auto mb-1" />
                  <p className="text-white/20 text-[11px]">Official School Stamp</p>
                </div>

                <p className="text-center text-white/20 text-[9px] mt-4">
                  This is an official academic transcript issued by FFB Group of Schools. Any alteration or forgery is strictly prohibited.
                </p>
              </div>
            </>
          ) : fetchingGrades ? (
            <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.07] p-12 text-center">
              <Loader2 className="w-12 h-12 text-white/20 mx-auto mb-4 animate-spin" />
              <p className="text-white/30 text-[14px]">Loading transcript data...</p>
            </div>
          ) : selectedStudent ? (
            <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.07] p-12 text-center">
              <FileText className="w-16 h-16 text-white/10 mx-auto mb-4" />
              <p className="text-white/30 text-[14px]">No grade records found for {selectedStudent.firstName}</p>
              <p className="text-white/20 text-[11px] mt-1">Grades must be entered across terms to generate a transcript</p>
            </div>
          ) : (
            <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.07] p-12 text-center">
              <GraduationCap className="w-16 h-16 text-white/10 mx-auto mb-4" />
              <p className="text-white/30 text-[14px]">Select a student to view their academic transcript</p>
              <p className="text-white/20 text-[11px] mt-1">The transcript displays cumulative performance across all terms</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
