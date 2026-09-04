"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  MonitorPlay,
  Clock,
  Search,
  Plus,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Play,
  Flag,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  Trophy,
  Target,
  BarChart3,
  History,
  FileText,
  Zap,
  RotateCcw,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Trash2,
  Edit3,
  Upload,
  BrainCircuit,
  Send,
  ShieldCheck,
  ShieldX,
  Timer,
  Hash,
  Percent,
  Info,
  ShieldAlert,
  Camera,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { useAntiCheat } from "@/hooks/useAntiCheat";

type ViewMode = "list" | "exam" | "results" | "history" | "questionbank";

interface CbtExam {
  id: string;
  title: string;
  subject: string;
  examType: string;
  difficulty: string;
  duration: number;
  totalQuestions: number;
  passingScore: number;
  attempts: number;
  status: string;
  createdAt: string;
}

interface ExamQuestion {
  id: string;
  question: string;
  options: string[];
  topic?: string;
  difficulty?: string;
}

interface ExamResult {
  questionId: string;
  selected: string;
  correct: string;
  isCorrect: boolean;
  explanation?: string;
  topic?: string;
}

interface ExamResultData {
  score: number;
  total: number;
  percentage: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  passed: boolean;
  timeTaken: number;
  results: ExamResult[];
}

interface HistoryEntry {
  id: string;
  examTitle: string;
  subject: string;
  examType: string;
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
  timeTaken: number;
  date: string;
  improvement?: number;
}

interface QuestionBankItem {
  id: string;
  question: string;
  options: string[];
  correct: string;
  subject: string;
  topic: string;
  difficulty: string;
}

const SUBJECT_ICONS: Record<string, string> = {
  Mathematics: "\u{1F4D0}",
  "English Language": "\u{1F4DD}",
  English: "\u{1F4DD}",
  Physics: "\u{1F30D}",
  Chemistry: "\u2697\uFE0F",
  Biology: "\u{1F52C}",
  Economics: "\u{1F4B0}",
  "Civic Education": "\u{1F3DB}\uFE0F",
  "Computer Science": "\u{1F4BB}",
  "Further Mathematics": "\u{1F4CA}",
  "Agricultural Science": "\u{1F33E}",
  "Literature in English": "\u{1F4D6}",
};

const SUBJECTS = [
  "Mathematics",
  "English Language",
  "Physics",
  "Chemistry",
  "Biology",
  "Economics",
  "Civic Education",
  "Computer Science",
  "Further Mathematics",
  "Agricultural Science",
  "Literature in English",
];

const EXAM_TYPES = ["WAEC", "NECO", "JAMB", "Practice"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const PER_PAGE = 20;

function examTypeBadgeStyle(type: string): React.CSSProperties {
  const base: React.CSSProperties = { padding: "2px 8px", borderRadius: "8px", fontSize: "11px", fontWeight: 500 };
  switch (type) {
    case "WAEC": return { ...base, backgroundColor: "#eff6ff", color: "#2563eb" };
    case "NECO": return { ...base, backgroundColor: "#f5f3ff", color: "#7c3aed" };
    case "JAMB": return { ...base, backgroundColor: "#ecfdf5", color: "#059669" };
    default: return { ...base, backgroundColor: "#fffbeb", color: "#d97706" };
  }
}

function difficultyBadgeStyle(d: string): React.CSSProperties {
  const base: React.CSSProperties = { padding: "2px 8px", borderRadius: "8px", fontSize: "11px", fontWeight: 500 };
  switch (d) {
    case "Easy": return { ...base, backgroundColor: "#ecfdf5", color: "#059669" };
    case "Hard": return { ...base, backgroundColor: "#fef2f2", color: "#dc2626" };
    default: return { ...base, backgroundColor: "#fffbeb", color: "#d97706" };
  }
}

export default function CbtPage() {
  const { data: session } = useSession();
  const userRoles: string[] =
    (session?.user as any)?.roles?.map((r: any) => r.name) || [];
  const isStudent = userRoles.includes("STUDENT");
  const isTeacher =
    userRoles.includes("TEACHER") || userRoles.includes("ADMIN");

  const [view, setView] = useState<ViewMode>("list");
  const [exams, setExams] = useState<CbtExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");

  const [currentExam, setCurrentExam] = useState<CbtExam | null>(null);
  const [sessionId, setSessionId] = useState("");
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [examLoading, setExamLoading] = useState(false);
  const [soundPlayed, setSoundPlayed] = useState(false);
  const [showQuestionNav, setShowQuestionNav] = useState(false);

  const [resultData, setResultData] = useState<ExamResultData | null>(null);

  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);

  const [questionBank, setQuestionBank] = useState<QuestionBankItem[]>([]);
  const [qbLoading, setQbLoading] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [qbSubject, setQbSubject] = useState("");
  const [qbTopic, setQbTopic] = useState("");
  const [qbCount, setQbCount] = useState("10");
  const [qbDifficulty, setQbDifficulty] = useState("Medium");
  const [editingQuestion, setEditingQuestion] = useState<QuestionBankItem | null>(null);
  const [qbPage, setQbPage] = useState(1);

  const [newQuestion, setNewQuestion] = useState({
    question: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correct: "A",
    subject: "",
    topic: "",
    difficulty: "Medium",
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const beforeUnloadRef = useRef<((e: BeforeUnloadEvent) => void) | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [webcamActive, setWebcamActive] = useState(false);

  const {
    violations,
    isBlocked,
    warningMessage,
    showWarning,
    startMonitoring,
    stopMonitoring,
    dismissWarning,
  } = useAntiCheat({
    maxViolations: 5,
    onAutoSubmit: () => {
      if (view === "exam") handleSubmitExam();
    },
  });

  const fetchExams = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cbt/exams");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch exams");
      setExams(data.exams || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load exams");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  useEffect(() => {
    if (view === "exam" && timerRunning) {
      const handler = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = "";
      };
      beforeUnloadRef.current = handler;
      window.addEventListener("beforeunload", handler);
      return () => {
        window.removeEventListener("beforeunload", handler);
      };
    }
  }, [view, timerRunning]);

  useEffect(() => {
    if (timerRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning]);

  useEffect(() => {
    if (timerRunning && timeLeft === 0 && currentExam) {
      handleSubmitExam();
    }
  }, [timeLeft, timerRunning]);

  useEffect(() => {
    if (timeLeft === 60 && !soundPlayed && timerRunning) {
      playAlertSound();
      setSoundPlayed(true);
    }
  }, [timeLeft, soundPlayed, timerRunning]);

  const playAlertSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = "sine";
      gain.gain.value = 0.3;
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.stop(ctx.currentTime + 0.5);
    } catch {}
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const handleStartExam = async (exam: CbtExam) => {
    setExamLoading(true);
    try {
      const res = await fetch(`/api/cbt/exams/${exam.id}/start`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start exam");

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 160, height: 120, facingMode: "user" },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setWebcamActive(true);
      } catch (err) {
        console.warn("Webcam not available:", err);
      }

      setCurrentExam(exam);
      setSessionId(data.sessionId);
      setQuestions(data.questions || []);
      setAnswers({});
      setFlagged(new Set());
      setCurrentIndex(0);
      setTimeLeft(exam.duration * 60);
      setTimerRunning(true);
      setSoundPlayed(false);
      setView("exam");
      startMonitoring();
    } catch (err: any) {
      toast.error(err.message || "Failed to start exam");
    } finally {
      setExamLoading(false);
    }
  };

  const handleSubmitExam = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerRunning(false);
    setShowSubmitConfirm(false);
    stopMonitoring();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setWebcamActive(false);

    if (!currentExam) return;

    try {
      const answerArray = Object.entries(answers).map(([questionId, response]) => ({
        questionId,
        answer: response,
      }));

      const res = await fetch(`/api/cbt/exams/${currentExam.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, responses: answerArray }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit exam");

      setResultData({
        ...data,
        timeTaken: currentExam.duration * 60 - timeLeft,
      });
      setView("results");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit exam");
    }
  };

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch("/api/cbt/history");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch history");
      setHistory(data.history || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load history");
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchQuestionBank = async () => {
    setQbLoading(true);
    try {
      const res = await fetch(`/api/cbt/practice${qbSubject ? `?subject=${qbSubject}` : ""}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch question bank");
      setQuestionBank(data.questions || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load question bank");
    } finally {
      setQbLoading(false);
    }
  };

  const handleAiGenerate = async () => {
    if (!currentExam && !qbSubject) {
      toast.error("Select a subject first");
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch(
        `/api/cbt/exams/${currentExam?.id || "generate"}/generate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            count: parseInt(qbCount) || 10,
            difficulty: qbDifficulty,
            topics: qbTopic ? [qbTopic] : [],
            subject: qbSubject,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate questions");
      toast.success(`Generated ${data.count || 0} questions`);
      fetchQuestionBank();
    } catch (err: any) {
      toast.error(err.message || "Failed to generate questions");
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.question || !newQuestion.optionA) {
      toast.error("Fill in all required fields");
      return;
    }
    try {
      const body = {
        question: newQuestion.question,
        options: [newQuestion.optionA, newQuestion.optionB, newQuestion.optionC, newQuestion.optionD],
        correct: newQuestion.correct,
        subject: newQuestion.subject,
        topic: newQuestion.topic,
        difficulty: newQuestion.difficulty,
        manual: !editingQuestion,
      };
      const url = editingQuestion
        ? `/api/cbt/practice/${editingQuestion.id}`
        : "/api/cbt/practice";
      const res = await fetch(url, {
        method: editingQuestion ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to save question");
      toast.success(editingQuestion ? "Question updated" : "Question added");
      setShowAddQuestion(false);
      setEditingQuestion(null);
      resetQuestionForm();
      fetchQuestionBank();
    } catch (err: any) {
      toast.error("Failed to save question");
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm("Delete this question?")) return;
    try {
      const res = await fetch(`/api/cbt/practice/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Question deleted");
      fetchQuestionBank();
    } catch {
      toast.error("Failed to delete question");
    }
  };

  const resetQuestionForm = () => {
    setNewQuestion({
      question: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correct: "A",
      subject: "",
      topic: "",
      difficulty: "Medium",
    });
  };

  const filteredExams = exams.filter((e) => {
    if (search && !e.title.toLowerCase().includes(search.toLowerCase()) && !e.subject.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterSubject && e.subject !== filterSubject) return false;
    if (filterType && e.examType !== filterType) return false;
    if (filterDifficulty && e.difficulty !== filterDifficulty) return false;
    if (isStudent && e.status !== "active") return false;
    return true;
  });

  const totalExams = exams.length;
  const activeExams = exams.filter((e) => e.status === "active").length;
  const totalAttempts = exams.reduce((s, e) => s + (e.attempts || 0), 0);
  const avgScore =
    history.length > 0
      ? Math.round(history.reduce((s, h) => s + h.percentage, 0) / history.length)
      : 0;

  const topicPerformance = (() => {
    if (!resultData?.results) return [];
    const map: Record<string, { correct: number; total: number }> = {};
    resultData.results.forEach((r) => {
      const topic = r.topic || "General";
      if (!map[topic]) map[topic] = { correct: 0, total: 0 };
      map[topic].total++;
      if (r.isCorrect) map[topic].correct++;
    });
    return Object.entries(map)
      .map(([topic, data]) => ({
        topic,
        correct: data.correct,
        total: data.total,
        percentage: Math.round((data.correct / data.total) * 100),
      }))
      .sort((a, b) => a.percentage - b.percentage);
  })();

  const getSubjectIcon = (subject: string) => {
    return (
      SUBJECT_ICONS[subject] ||
      SUBJECT_ICONS[Object.keys(SUBJECT_ICONS).find((k) => subject.toLowerCase().includes(k.toLowerCase())) || ""] ||
      "\u{1F4DD}"
    );
  };

  const totalHistoryPages = Math.ceil(history.length / PER_PAGE);
  const paginatedHistory = history.slice((historyPage - 1) * PER_PAGE, historyPage * PER_PAGE);

  const totalQBPages = Math.ceil(questionBank.length / PER_PAGE);
  const paginatedQB = questionBank.slice((qbPage - 1) * PER_PAGE, qbPage * PER_PAGE);

  const renderExamList = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div
        style={{
          background: "linear-gradient(to right, #0a2a6e, #0055ff)",
          borderRadius: "16px",
          padding: "32px",
          marginTop: "32px",
          marginLeft: "16px",
          marginRight: "16px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: "-50%", right: "-20%", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "-30%", left: "-10%", width: "200px", height: "200px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <h1 style={{ color: "#ffffff", fontSize: "24px", fontWeight: 700, marginBottom: "4px", display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "linear-gradient(to bottom right, #3b82f6, #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <MonitorPlay style={{ width: "20px", height: "20px", color: "#ffffff" }} />
                </div>
                CBT Exam Portal
              </h1>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px", marginLeft: "50px" }}>
                Computer-Based Testing for WAEC, NECO, JAMB &amp; Practice
              </p>
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              {isTeacher && (
                <>
                  <button
                    onClick={() => { setView("questionbank"); fetchQuestionBank(); }}
                    style={{ padding: "8px 16px", borderRadius: "12px", backgroundColor: "rgba(255,255,255,0.15)", color: "#ffffff", fontSize: "13px", fontWeight: 500, border: "1px solid rgba(255,255,255,0.2)", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
                  >
                    <BookOpen style={{ width: "16px", height: "16px" }} />
                    Question Bank
                  </button>
                  <button
                    onClick={() => setView("history")}
                    style={{ padding: "8px 16px", borderRadius: "12px", backgroundColor: "rgba(255,255,255,0.15)", color: "#ffffff", fontSize: "13px", fontWeight: 500, border: "1px solid rgba(255,255,255,0.2)", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
                  >
                    <History style={{ width: "16px", height: "16px" }} />
                    History
                  </button>
                </>
              )}
              {isStudent && (
                <button
                  onClick={() => { setView("history"); fetchHistory(); }}
                  style={{ padding: "8px 16px", borderRadius: "12px", backgroundColor: "rgba(255,255,255,0.15)", color: "#ffffff", fontSize: "13px", fontWeight: 500, border: "1px solid rgba(255,255,255,0.2)", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  <History style={{ width: "16px", height: "16px" }} />
                  My History
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px", padding: "0 16px" }}>
        {[
          { label: "Total Exams", value: totalExams, icon: FileText, bg: "linear-gradient(to bottom right, #3b82f6, #2563eb)" },
          { label: "Active Exams", value: activeExams, icon: Play, bg: "linear-gradient(to bottom right, #10b981, #059669)" },
          { label: "Total Attempts", value: totalAttempts, icon: Target, bg: "linear-gradient(to bottom right, #a855f7, #9333ea)" },
          { label: "Avg Score", value: `${avgScore}%`, icon: BarChart3, bg: "linear-gradient(to bottom right, #f59e0b, #f97316)" },
        ].map((kpi, i) => (
          <div key={i} style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <p style={{ color: "#64748b", fontSize: "13px", marginBottom: "4px" }}>{kpi.label}</p>
                <p style={{ fontSize: "30px", fontWeight: 700, color: "#1a1a2e" }}>{kpi.value}</p>
              </div>
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: kpi.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <kpi.icon style={{ width: "24px", height: "24px", color: "#ffffff" }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", margin: "0 16px" }}>
        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: "200px", width: "100%" }}>
            <Search style={{ width: "16px", height: "16px", position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
            <input
              type="text"
              placeholder="Search exams by title or subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", padding: "10px 16px 10px 36px", borderRadius: "12px", backgroundColor: "#ffffff", border: "1px solid #e2e8f0", color: "#1a1a2e", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)} style={{ width: "100%", padding: "10px 16px", borderRadius: "12px", backgroundColor: "#ffffff", border: "1px solid #e2e8f0", color: "#1a1a2e", fontSize: "13px", outline: "none", colorScheme: "light", boxSizing: "border-box" } as React.CSSProperties}>
            <option value="" style={{ background: "#fff", color: "#1a1a2e" }}>All Subjects</option>
            {SUBJECTS.map((s) => (<option key={s} value={s} style={{ background: "#fff", color: "#1a1a2e" }}>{s}</option>))}
          </select>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ width: "100%", padding: "10px 16px", borderRadius: "12px", backgroundColor: "#ffffff", border: "1px solid #e2e8f0", color: "#1a1a2e", fontSize: "13px", outline: "none", colorScheme: "light", boxSizing: "border-box" } as React.CSSProperties}>
            <option value="" style={{ background: "#fff", color: "#1a1a2e" }}>All Types</option>
            {EXAM_TYPES.map((t) => (<option key={t} value={t} style={{ background: "#fff", color: "#1a1a2e" }}>{t}</option>))}
          </select>
          <select value={filterDifficulty} onChange={(e) => setFilterDifficulty(e.target.value)} style={{ width: "100%", padding: "10px 16px", borderRadius: "12px", backgroundColor: "#ffffff", border: "1px solid #e2e8f0", color: "#1a1a2e", fontSize: "13px", outline: "none", colorScheme: "light", boxSizing: "border-box" } as React.CSSProperties}>
            <option value="" style={{ background: "#fff", color: "#1a1a2e" }}>All Difficulty</option>
            {DIFFICULTIES.map((d) => (<option key={d} value={d} style={{ background: "#fff", color: "#1a1a2e" }}>{d}</option>))}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0" }}>
          <Loader2 style={{ width: "32px", height: "32px", color: "#64748b", animation: "spin 1s linear infinite" }} />
        </div>
      ) : filteredExams.length === 0 ? (
        <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "80px 24px", textAlign: "center", color: "#64748b", margin: "0 16px" }}>
          <MonitorPlay style={{ width: "48px", height: "48px", margin: "0 auto 12px", opacity: 0.4 }} />
          <p style={{ fontSize: "14px" }}>No exams found</p>
          <p style={{ fontSize: "12px", marginTop: "4px" }}>Try adjusting your filters</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px", padding: "0 16px" }}>
          {filteredExams.map((exam) => (
            <div key={exam.id} style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "16px" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "rgba(59,130,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", flexShrink: 0 }}>
                  {getSubjectIcon(exam.subject)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ color: "#1a1a2e", fontWeight: 600, fontSize: "14px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{exam.title}</h3>
                  <p style={{ color: "#64748b", fontSize: "12px" }}>{exam.subject}</p>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#475569", fontSize: "12px" }}>
                  <Clock style={{ width: "14px", height: "14px", color: "#94a3b8" }} />{exam.duration} min
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#475569", fontSize: "12px" }}>
                  <Hash style={{ width: "14px", height: "14px", color: "#94a3b8" }} />{exam.totalQuestions} questions
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#475569", fontSize: "12px" }}>
                  <Percent style={{ width: "14px", height: "14px", color: "#94a3b8" }} />Pass: {exam.passingScore}%
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#475569", fontSize: "12px" }}>
                  <Target style={{ width: "14px", height: "14px", color: "#94a3b8" }} />{exam.attempts || 0} attempts
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
                <span style={examTypeBadgeStyle(exam.examType)}>{exam.examType}</span>
                <span style={difficultyBadgeStyle(exam.difficulty)}>{exam.difficulty}</span>
                <span style={{ padding: "2px 8px", borderRadius: "8px", fontSize: "11px", fontWeight: 500, marginLeft: "auto", ...(exam.status === "active" ? { backgroundColor: "#ecfdf5", color: "#059669" } : { backgroundColor: "#f1f5f9", color: "#64748b" }) }}>{exam.status}</span>
              </div>
              {exam.status === "active" && (
                <button
                  onClick={() => handleStartExam(exam)}
                  disabled={examLoading}
                  style={{ width: "100%", padding: "8px 16px", borderRadius: "12px", backgroundColor: "#0055ff", color: "#ffffff", fontSize: "13px", fontWeight: 500, border: "none", cursor: examLoading ? "not-allowed" : "pointer", opacity: examLoading ? 0.5 : 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                >
                  {examLoading ? <Loader2 style={{ width: "16px", height: "16px", animation: "spin 1s linear infinite" }} /> : <Play style={{ width: "16px", height: "16px" }} />}
                  Start Exam
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderExam = () => {
    const q = questions[currentIndex];
    const answeredCount = Object.keys(answers).length;
    const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;
    const isTimeCritical = timeLeft <= 300;

    return (
      <div style={{ minHeight: "calc(100vh - 120px)" }}>
        <div style={{ position: "sticky", top: 0, zIndex: 40, backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", marginBottom: "16px", padding: "12px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "linear-gradient(to bottom right, #3b82f6, #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <MonitorPlay style={{ width: "20px", height: "20px", color: "#ffffff" }} />
              </div>
              <div>
                <h2 style={{ color: "#1a1a2e", fontWeight: 600, fontSize: "14px" }}>{currentExam?.title}</h2>
                <p style={{ color: "#64748b", fontSize: "11px" }}>{currentExam?.subject}</p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px", borderRadius: "12px", fontFamily: "monospace", fontSize: "18px", fontWeight: 700, ...(isTimeCritical ? { backgroundColor: "#fef2f2", color: "#dc2626", border: "2px solid #fecaca", animation: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite" } : { backgroundColor: "#f8fafc", color: "#1a1a2e", border: "1px solid #e2e8f0" }) }}>
              <Timer style={{ width: "20px", height: "20px", color: isTimeCritical ? "#ef4444" : "#64748b" }} />
              {formatTime(timeLeft)}
            </div>
            {violations > 0 && (
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 12px",
                borderRadius: "10px",
                backgroundColor: "#fef2f2",
                border: "1px solid #fecaca",
              }}>
                <ShieldAlert style={{ width: "16px", height: "16px", color: "#dc2626" }} />
                <span style={{ color: "#dc2626", fontSize: "12px", fontWeight: 600 }}>
                  {violations} Warning{violations !== 1 ? "s" : ""}
                </span>
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button onClick={() => setShowQuestionNav(!showQuestionNav)} style={{ padding: "8px 16px", borderRadius: "12px", backgroundColor: "#f8fafc", color: "#475569", fontSize: "13px", fontWeight: 500, border: "1px solid #e2e8f0", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <Grid style={{ width: "16px", height: "16px" }} />
                <span>Navigator</span>
              </button>
              <button onClick={() => setShowSubmitConfirm(true)} style={{ padding: "8px 16px", borderRadius: "12px", background: "linear-gradient(to right, #10b981, #059669)", color: "#ffffff", fontSize: "13px", fontWeight: 500, border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <Send style={{ width: "16px", height: "16px" }} />
                Submit
              </button>
            </div>
          </div>
          <div style={{ marginTop: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "11px", marginBottom: "4px" }}>
              <span style={{ color: "#64748b" }}>Question {currentIndex + 1} of {questions.length}</span>
              <span style={{ color: "#64748b" }}>{answeredCount} answered &middot; {questions.length - answeredCount} remaining</span>
            </div>
            <div style={{ width: "100%", backgroundColor: "#f1f5f9", borderRadius: "9999px", height: "8px" }}>
              <div style={{ background: "linear-gradient(to right, #3b82f6, #6366f1)", height: "8px", borderRadius: "9999px", transition: "width 0.3s", width: `${progress}%` }} />
            </div>
          </div>
        </div>

        {showQuestionNav && (
          <div style={{ marginBottom: "16px" }}>
            <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
              <h4 style={{ color: "#1a1a2e", fontWeight: 600, fontSize: "13px", marginBottom: "12px" }}>Question Navigator</h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {questions.map((question, idx) => {
                  const qId = question.id;
                  const isAnswered = !!answers[qId];
                  const isFlagged = flagged.has(qId);
                  const isCurrent = idx === currentIndex;
                  return (
                    <button
                      key={qId}
                      onClick={() => { setCurrentIndex(idx); setShowQuestionNav(false); }}
                      style={{ width: "40px", height: "40px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", border: "none", cursor: "pointer", ...(isCurrent ? { backgroundColor: "#3b82f6", color: "#ffffff", boxShadow: "0 4px 6px rgba(59,130,246,0.3)", outline: "2px solid #bfdbfe" } : isAnswered ? { backgroundColor: "#ecfdf5", color: "#047857", border: "1px solid #a7f3d0" } : { backgroundColor: "#f8fafc", color: "#475569", border: "1px solid #e2e8f0" }) }}
                    >
                      {idx + 1}
                      {isFlagged && <div style={{ position: "absolute", top: "-4px", right: "-4px", width: "12px", height: "12px", backgroundColor: "#fbbf24", borderRadius: "50%", border: "2px solid #ffffff" }} />}
                    </button>
                  );
                })}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "12px", fontSize: "11px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><div style={{ width: "12px", height: "12px", borderRadius: "3px", backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0" }} />Answered</span>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><div style={{ width: "12px", height: "12px", borderRadius: "3px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }} />Unanswered</span>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><div style={{ width: "12px", height: "12px", borderRadius: "3px", backgroundColor: "#fbbf24" }} />Flagged</span>
              </div>
            </div>
          </div>
        )}

        {q && (
          <div key={q.id} style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "12px", backgroundColor: "rgba(59,130,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "#2563eb", fontWeight: 700, fontSize: "14px" }}>{currentIndex + 1}</span>
                </div>
                <div>
                  <p style={{ color: "#1a1a2e", fontSize: "12px", fontWeight: 500 }}>
                    {q.topic && <span style={{ color: "#64748b" }}>Topic: {q.topic} &middot; </span>}
                    {q.difficulty || "Medium"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setFlagged((prev) => {
                    const next = new Set(prev);
                    if (next.has(q.id)) next.delete(q.id);
                    else next.add(q.id);
                    return next;
                  });
                }}
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 500, cursor: "pointer", ...(flagged.has(q.id) ? { backgroundColor: "#fffbeb", color: "#d97706", border: "1px solid #fde68a" } : { backgroundColor: "#f8fafc", color: "#64748b", border: "1px solid #e2e8f0" }) }}
              >
                <Flag style={{ width: "14px", height: "14px" }} />
                {flagged.has(q.id) ? "Flagged" : "Flag"}
              </button>
            </div>
            <p style={{ color: "#1a1a2e", fontSize: "15px", lineHeight: 1.6, marginBottom: "24px" }}>{q.question}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {q.options.map((option, idx) => {
                const letter = String.fromCharCode(65 + idx);
                const isSelected = answers[q.id] === letter;
                return (
                  <label
                    key={idx}
                    style={{ display: "flex", alignItems: "flex-start", gap: "16px", padding: "16px", borderRadius: "12px", cursor: "pointer", ...(isSelected ? { backgroundColor: "#eff6ff", border: "2px solid #60a5fa", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" } : { backgroundColor: "#f8fafc", border: "2px solid #e2e8f0" }) }}
                  >
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px", ...(isSelected ? { backgroundColor: "#3b82f6", border: "2px solid #3b82f6" } : { backgroundColor: "#ffffff", border: "2px solid #d1d5db" }) }}>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: isSelected ? "#ffffff" : "#64748b" }}>{letter}</span>
                    </div>
                    <span style={{ color: "#1a1a2e", fontSize: "13px", lineHeight: 1.6, paddingTop: "4px" }}>{option}</span>
                    <input type="radio" name={`q-${q.id}`} checked={isSelected} onChange={() => setAnswers({ ...answers, [q.id]: letter })} style={{ position: "absolute", width: "1px", height: "1px", padding: 0, margin: "-1px", overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0 }} />
                  </label>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))} disabled={currentIndex === 0} style={{ padding: "8px 16px", borderRadius: "12px", backgroundColor: "#f8fafc", color: "#475569", fontSize: "13px", fontWeight: 500, border: "1px solid #e2e8f0", cursor: currentIndex === 0 ? "not-allowed" : "pointer", opacity: currentIndex === 0 ? 0.4 : 1, display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <ChevronLeft style={{ width: "16px", height: "16px" }} />Previous
          </button>
          {flagged.has(q?.id) && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#f59e0b", fontSize: "12px", fontWeight: 500 }}>
              <Flag style={{ width: "14px", height: "14px" }} />Flagged for review
            </div>
          )}
          <button onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))} disabled={currentIndex === questions.length - 1} style={{ padding: "8px 16px", borderRadius: "12px", backgroundColor: "#0055ff", color: "#ffffff", fontSize: "13px", fontWeight: 500, border: "none", cursor: currentIndex === questions.length - 1 ? "not-allowed" : "pointer", opacity: currentIndex === questions.length - 1 ? 0.4 : 1, display: "inline-flex", alignItems: "center", gap: "6px" }}>
            Next<ChevronRight style={{ width: "16px", height: "16px" }} />
          </button>
        </div>

        {showSubmitConfirm && (
          <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }} onClick={() => setShowSubmitConfirm(false)}>
            <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: "400px", backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
              <div style={{ background: "linear-gradient(135deg, #0a2a6e, #0055ff)", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h3 style={{ color: "#ffffff", fontSize: "18px", fontWeight: 600 }}>Submit Exam?</h3>
                <button onClick={() => setShowSubmitConfirm(false)} style={{ color: "rgba(255,255,255,0.7)", background: "none", border: "none", cursor: "pointer" }}><X style={{ width: "20px", height: "20px" }} /></button>
              </div>
              <div style={{ padding: "24px", textAlign: "center" }}>
                <p style={{ color: "#64748b", fontSize: "13px", marginBottom: "8px" }}>
                  You have answered <span style={{ fontWeight: 600, color: "#1a1a2e" }}>{answeredCount}</span> of <span style={{ fontWeight: 600, color: "#1a1a2e" }}>{questions.length}</span> questions.
                </p>
                {answeredCount < questions.length && (
                  <p style={{ color: "#d97706", fontSize: "12px", fontWeight: 500 }}>
                    {questions.length - answeredCount} question(s) unanswered!
                  </p>
                )}
                <p style={{ color: "#64748b", fontSize: "12px", marginTop: "8px" }}>Time remaining: {formatTime(timeLeft)}</p>
              </div>
              <div style={{ padding: "0 24px 24px", display: "flex", gap: "8px" }}>
                <button onClick={() => setShowSubmitConfirm(false)} style={{ flex: 1, padding: "8px 16px", borderRadius: "12px", backgroundColor: "#f8fafc", color: "#475569", fontSize: "13px", fontWeight: 500, border: "1px solid #e2e8f0", cursor: "pointer" }}>Cancel</button>
                <button onClick={handleSubmitExam} style={{ flex: 1, padding: "8px 16px", borderRadius: "12px", background: "linear-gradient(to right, #10b981, #059669)", color: "#ffffff", fontSize: "13px", fontWeight: 500, border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                  <Send style={{ width: "16px", height: "16px" }} />Submit Exam
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Anti-cheat warning modal */}
        {showWarning && (
          <div
            onClick={dismissWarning}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(220,38,38,0.15)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 60,
              cursor: "pointer",
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                maxWidth: "420px",
                backgroundColor: "#ffffff",
                borderRadius: "16px",
                border: "2px solid #dc2626",
                overflow: "hidden",
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
              }}
            >
              <div
                style={{
                  backgroundColor: "#dc2626",
                  padding: "20px 24px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <ShieldAlert style={{ width: "28px", height: "28px", color: "#ffffff" }} />
                <h3 style={{ color: "#ffffff", fontSize: "18px", fontWeight: 700, margin: 0 }}>
                  Exam Rule Violation!
                </h3>
              </div>
              <div style={{ padding: "24px", textAlign: "center" }}>
                <p style={{ color: "#1a1a2e", fontSize: "14px", marginBottom: "12px" }}>
                  {warningMessage}
                </p>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    backgroundColor: "#fef2f2",
                    border: "1px solid #fecaca",
                  }}
                >
                  <AlertTriangle style={{ width: "16px", height: "16px", color: "#dc2626" }} />
                  <span style={{ color: "#dc2626", fontSize: "13px", fontWeight: 600 }}>
                    Warning {violations} of 5
                  </span>
                </div>
                {isBlocked && (
                  <p style={{ color: "#dc2626", fontSize: "13px", fontWeight: 600, marginTop: "12px" }}>
                    Too many violations. Exam will be submitted automatically.
                  </p>
                )}
              </div>
              <div style={{ padding: "0 24px 24px" }}>
                <button
                  onClick={dismissWarning}
                  style={{
                    width: "100%",
                    padding: "10px 16px",
                    borderRadius: "10px",
                    backgroundColor: "#dc2626",
                    color: "#ffffff",
                    fontSize: "14px",
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  I Understand
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Webcam overlay */}
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            width: "160px",
            height: "120px",
            borderRadius: "12px",
            overflow: "hidden",
            border: "3px solid #0055ff",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            zIndex: 60,
            backgroundColor: "#000",
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: "scaleX(-1)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "4px",
              left: "4px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "2px 6px",
              borderRadius: "4px",
              backgroundColor: "rgba(0,0,0,0.6)",
            }}
          >
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: webcamActive ? "#10b981" : "#dc2626",
              }}
            />
            <span style={{ color: "#fff", fontSize: "9px", fontWeight: 500 }}>
              {webcamActive ? "REC" : "OFF"}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderResults = () => {
    if (!resultData) return null;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px", padding: "0 16px" }}>
        <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "32px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", ...(resultData.passed ? { background: "linear-gradient(to bottom right, #ecfdf5, #d1fae5)", borderColor: "#a7f3d0" } : { background: "linear-gradient(to bottom right, #fef2f2, #fecaca)", borderColor: "#fca5a5" }) }}>
          <div style={{ width: "80px", height: "80px", borderRadius: "16px", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", background: resultData.passed ? "linear-gradient(to bottom right, #10b981, #059669)" : "linear-gradient(to bottom right, #ef4444, #dc2626)" }}>
            {resultData.passed ? <Trophy style={{ width: "40px", height: "40px", color: "#ffffff" }} /> : <ShieldX style={{ width: "40px", height: "40px", color: "#ffffff" }} />}
          </div>
          <h2 style={{ color: "#1a1a2e", fontWeight: 700, fontSize: "24px", marginBottom: "4px" }}>Exam Completed!</h2>
          <div style={{ fontSize: "48px", fontWeight: 700, color: "#1a1a2e", margin: "16px 0" }}>{resultData.score}/{resultData.total}</div>
          <p style={{ color: "#475569", fontSize: "18px", marginBottom: "4px" }}><span style={{ fontWeight: 700 }}>{resultData.percentage}%</span></p>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 16px", borderRadius: "9999px", fontSize: "13px", fontWeight: 600, ...(resultData.passed ? { backgroundColor: "rgba(16,185,129,0.1)", color: "#047857" } : { backgroundColor: "rgba(239,68,68,0.1)", color: "#b91c1c" }) }}>
            {resultData.passed ? (<><ShieldCheck style={{ width: "16px", height: "16px" }} /> Passed</>) : (<><ShieldX style={{ width: "16px", height: "16px" }} /> Failed</>)}
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
          {[
            { label: "Time Taken", value: formatTime(resultData.timeTaken), icon: Clock, bg: "linear-gradient(to bottom right, #3b82f6, #2563eb)" },
            { label: "Correct", value: resultData.correct, icon: CheckCircle2, bg: "linear-gradient(to bottom right, #10b981, #059669)" },
            { label: "Incorrect", value: resultData.incorrect, icon: X, bg: "linear-gradient(to bottom right, #ef4444, #dc2626)" },
            { label: "Unanswered", value: resultData.unanswered, icon: AlertCircle, bg: "linear-gradient(to bottom right, #f59e0b, #d97706)" },
          ].map((stat, i) => (
            <div key={i} style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: stat.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <stat.icon style={{ width: "20px", height: "20px", color: "#ffffff" }} />
                </div>
                <div>
                  <p style={{ color: "#64748b", fontSize: "11px" }}>{stat.label}</p>
                  <p style={{ color: "#1a1a2e", fontWeight: 700, fontSize: "18px" }}>{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {topicPerformance.length > 0 && (
          <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <h3 style={{ color: "#1a1a2e", fontWeight: 600, fontSize: "15px", marginBottom: "16px" }}>Topic Performance</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {topicPerformance.map((tp, i) => (
                <div key={i}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ color: "#475569", fontSize: "12px" }}>{tp.topic}</span>
                    <span style={{ color: "#64748b", fontSize: "11px" }}>{tp.correct}/{tp.total} ({tp.percentage}%)</span>
                  </div>
                  <div style={{ width: "100%", backgroundColor: "#f1f5f9", borderRadius: "9999px", height: "8px" }}>
                    <div style={{ height: "8px", borderRadius: "9999px", transition: "width 0.5s", ...(tp.percentage >= 70 ? { background: "linear-gradient(to right, #10b981, #34d399)" } : tp.percentage >= 50 ? { background: "linear-gradient(to right, #f59e0b, #fbbf24)" } : { background: "linear-gradient(to right, #ef4444, #f87171)" }), width: `${tp.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <h3 style={{ color: "#1a1a2e", fontWeight: 600, fontSize: "15px", marginBottom: "16px" }}>Detailed Review</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {resultData.results.map((r, i) => {
              const question = questions.find((qq) => qq.id === r.questionId);
              return (
                <div key={r.questionId} style={{ padding: "16px", borderRadius: "12px", ...(r.isCorrect ? { backgroundColor: "rgba(236,253,245,0.5)", border: "1px solid #a7f3d0" } : r.selected ? { backgroundColor: "rgba(254,226,226,0.5)", border: "1px solid #fca5a5" } : { backgroundColor: "rgba(255,251,235,0.5)", border: "1px solid #fde68a" }) }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                    <div style={{ width: "24px", height: "24px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, backgroundColor: r.isCorrect ? "#10b981" : r.selected ? "#ef4444" : "#fbbf24", color: "#ffffff" }}>
                      {r.isCorrect ? <CheckCircle2 style={{ width: "14px", height: "14px" }} /> : <span style={{ fontSize: "10px", fontWeight: 700 }}>&#10005;</span>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: "#1a1a2e", fontSize: "13px", fontWeight: 500, marginBottom: "8px" }}>{i + 1}. {question?.question || "Question"}</p>
                      {question && (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "6px", marginBottom: "8px" }}>
                          {question.options.map((opt, idx) => {
                            const letter = String.fromCharCode(65 + idx);
                            const isCorrect = letter === r.correct;
                            const isSelected = letter === r.selected;
                            return (
                              <div key={idx} style={{ padding: "6px 12px", borderRadius: "8px", fontSize: "12px", ...(isCorrect ? { backgroundColor: "#d1fae5", color: "#065f46", fontWeight: 500 } : isSelected ? { backgroundColor: "#fee2e2", color: "#991b1b" } : { backgroundColor: "#f8fafc", color: "#475569" }) }}>
                                <span style={{ fontWeight: 600 }}>{letter}.</span> {opt}{isCorrect && " \u2713"}{isSelected && !isCorrect && " \u2717"}
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {r.explanation && (
                        <div style={{ marginTop: "8px", padding: "8px", borderRadius: "8px", backgroundColor: "#eff6ff", color: "#1e40af", fontSize: "12px" }}>
                          <span style={{ fontWeight: 600 }}>Explanation:</span> {r.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}>
          {currentExam && (
            <button onClick={() => handleStartExam(currentExam)} style={{ padding: "8px 16px", borderRadius: "12px", backgroundColor: "#0055ff", color: "#ffffff", fontSize: "13px", fontWeight: 500, border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <RotateCcw style={{ width: "16px", height: "16px" }} />Retry Exam
            </button>
          )}
          <button onClick={() => { setView("list"); setResultData(null); }} style={{ padding: "8px 16px", borderRadius: "12px", backgroundColor: "#f8fafc", color: "#475569", fontSize: "13px", fontWeight: 500, border: "1px solid #e2e8f0", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <BookOpen style={{ width: "16px", height: "16px" }} />Back to Exams
          </button>
        </div>
      </div>
    );
  };

  const renderHistory = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ background: "linear-gradient(to right, rgba(168,85,247,0.2), rgba(99,102,241,0.1))", borderRadius: "16px", border: "1px solid #e9d5ff", padding: "32px", margin: "32px 16px 0", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-50%", right: "-20%", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)" }} />
        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ color: "#1a1a2e", fontSize: "24px", fontWeight: 700, marginBottom: "4px", display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "linear-gradient(to bottom right, #a855f7, #6366f1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <History style={{ width: "20px", height: "20px", color: "#ffffff" }} />
              </div>
              Exam History
            </h1>
            <p style={{ color: "#475569", fontSize: "13px", marginLeft: "50px" }}>Track your performance across all CBT exams</p>
          </div>
          <button onClick={() => setView("list")} style={{ padding: "8px 16px", borderRadius: "12px", backgroundColor: "#f8fafc", color: "#475569", fontSize: "13px", fontWeight: 500, border: "1px solid #e2e8f0", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <ChevronLeft style={{ width: "16px", height: "16px" }} />Back
          </button>
        </div>
      </div>

      {history.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "16px", padding: "0 16px" }}>
          {[
            { label: "Exams Taken", value: history.length, icon: FileText, bg: "linear-gradient(to bottom right, #3b82f6, #2563eb)" },
            { label: "Average Score", value: `${Math.round(history.reduce((s, h) => s + h.percentage, 0) / history.length)}%`, icon: BarChart3, bg: "linear-gradient(to bottom right, #10b981, #059669)" },
            { label: "Pass Rate", value: `${Math.round((history.filter((h) => h.passed).length / history.length) * 100)}%`, icon: Trophy, bg: "linear-gradient(to bottom right, #a855f7, #9333ea)" },
          ].map((stat, i) => (
            <div key={i} style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: stat.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <stat.icon style={{ width: "20px", height: "20px", color: "#ffffff" }} />
                </div>
                <div>
                  <p style={{ color: "#64748b", fontSize: "11px" }}>{stat.label}</p>
                  <p style={{ color: "#1a1a2e", fontWeight: 700, fontSize: "18px" }}>{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {historyLoading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0" }}>
          <Loader2 style={{ width: "32px", height: "32px", color: "#64748b", animation: "spin 1s linear infinite" }} />
        </div>
      ) : history.length === 0 ? (
        <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "80px 24px", textAlign: "center", color: "#64748b", margin: "0 16px" }}>
          <History style={{ width: "48px", height: "48px", margin: "0 auto 12px", opacity: 0.4 }} />
          <p style={{ fontSize: "14px" }}>No exam history yet</p>
          <p style={{ fontSize: "12px", marginTop: "4px" }}>Complete an exam to see your history here</p>
        </div>
      ) : (
        <>
          <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden", margin: "0 16px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                    {["Date", "Exam", "Subject", "Type", "Score", "Status", "Time", "Improvement"].map((h) => (
                      <th key={h} style={{ padding: "12px 20px", textAlign: "left", color: "#64748b", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedHistory.map((entry, i) => (
                    <tr key={entry.id} style={{ borderBottom: "1px solid #e2e8f0", backgroundColor: i % 2 === 1 ? "rgba(248,250,252,0.5)" : "transparent" }}>
                      <td style={{ padding: "14px 20px", color: "#94a3b8", fontSize: "12px" }}>{new Date(entry.date).toLocaleDateString()}</td>
                      <td style={{ padding: "14px 20px", color: "#1a1a2e", fontSize: "13px", fontWeight: 500 }}>{entry.examTitle}</td>
                      <td style={{ padding: "14px 20px", color: "#475569", fontSize: "12px" }}>{entry.subject}</td>
                      <td style={{ padding: "14px 20px" }}><span style={examTypeBadgeStyle(entry.examType)}>{entry.examType}</span></td>
                      <td style={{ padding: "14px 20px" }}>
                        <span style={{ color: "#1a1a2e", fontWeight: 600, fontSize: "13px" }}>{entry.score}/{entry.total}</span>
                        <span style={{ color: "#64748b", fontSize: "11px", marginLeft: "4px" }}>({entry.percentage}%)</span>
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "2px 8px", borderRadius: "8px", fontSize: "11px", fontWeight: 500, ...(entry.passed ? { backgroundColor: "#ecfdf5", color: "#059669" } : { backgroundColor: "#fef2f2", color: "#dc2626" }) }}>
                          {entry.passed ? <CheckCircle2 style={{ width: "12px", height: "12px" }} /> : <X style={{ width: "12px", height: "12px" }} />}
                          {entry.passed ? "Pass" : "Fail"}
                        </span>
                      </td>
                      <td style={{ padding: "14px 20px", color: "#64748b", fontSize: "12px" }}>{formatTime(entry.timeTaken)}</td>
                      <td style={{ padding: "14px 20px" }}>
                        {entry.improvement != null ? (
                          <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", fontWeight: 500, color: entry.improvement > 0 ? "#059669" : entry.improvement < 0 ? "#dc2626" : "#64748b" }}>
                            {entry.improvement > 0 ? <ArrowUpRight style={{ width: "12px", height: "12px" }} /> : entry.improvement < 0 ? <ArrowDownRight style={{ width: "12px", height: "12px" }} /> : null}
                            {entry.improvement > 0 ? "+" : ""}{entry.improvement}%
                          </span>
                        ) : (
                          <span style={{ color: "#94a3b8", fontSize: "12px" }}>&mdash;</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {totalHistoryPages > 1 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "0 16px" }}>
              <button onClick={() => setHistoryPage((p) => Math.max(1, p - 1))} disabled={historyPage === 1} style={{ padding: "6px 12px", borderRadius: "8px", backgroundColor: "#f8fafc", color: "#475569", fontSize: "12px", fontWeight: 500, border: "1px solid #e2e8f0", cursor: historyPage === 1 ? "not-allowed" : "pointer", opacity: historyPage === 1 ? 0.4 : 1 }}>
                <ChevronLeft style={{ width: "14px", height: "14px" }} />
              </button>
              <span style={{ fontSize: "12px", color: "#64748b" }}>Page {historyPage} of {totalHistoryPages}</span>
              <button onClick={() => setHistoryPage((p) => Math.min(totalHistoryPages, p + 1))} disabled={historyPage === totalHistoryPages} style={{ padding: "6px 12px", borderRadius: "8px", backgroundColor: "#f8fafc", color: "#475569", fontSize: "12px", fontWeight: 500, border: "1px solid #e2e8f0", cursor: historyPage === totalHistoryPages ? "not-allowed" : "pointer", opacity: historyPage === totalHistoryPages ? 0.4 : 1 }}>
                <ChevronRight style={{ width: "14px", height: "14px" }} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderQuestionBank = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ background: "linear-gradient(to right, rgba(245,158,11,0.2), rgba(249,115,22,0.1))", borderRadius: "16px", border: "1px solid #fde68a", padding: "32px", margin: "32px 16px 0", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-50%", right: "-20%", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)" }} />
        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ color: "#1a1a2e", fontSize: "24px", fontWeight: 700, marginBottom: "4px", display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "linear-gradient(to bottom right, #f59e0b, #f97316)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <BookOpen style={{ width: "20px", height: "20px", color: "#ffffff" }} />
              </div>
              Question Bank
            </h1>
            <p style={{ color: "#475569", fontSize: "13px", marginLeft: "50px" }}>Create, import, and manage exam questions</p>
          </div>
          <button onClick={() => setView("list")} style={{ padding: "8px 16px", borderRadius: "12px", backgroundColor: "#f8fafc", color: "#475569", fontSize: "13px", fontWeight: 500, border: "1px solid #e2e8f0", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <ChevronLeft style={{ width: "16px", height: "16px" }} />Back
          </button>
        </div>
      </div>

      <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", margin: "0 16px" }}>
        <h3 style={{ color: "#1a1a2e", fontWeight: 600, fontSize: "15px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          <BrainCircuit style={{ width: "20px", height: "20px", color: "#a855f7" }} />AI Question Generator
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "12px" }}>
          <select value={qbSubject} onChange={(e) => setQbSubject(e.target.value)} style={{ width: "100%", padding: "10px 16px", borderRadius: "12px", backgroundColor: "#ffffff", border: "1px solid #e2e8f0", color: "#1a1a2e", fontSize: "13px", outline: "none", colorScheme: "light", boxSizing: "border-box" } as React.CSSProperties}>
            <option value="" style={{ background: "#fff", color: "#1a1a2e" }}>Subject</option>
            {SUBJECTS.map((s) => (<option key={s} value={s} style={{ background: "#fff", color: "#1a1a2e" }}>{s}</option>))}
          </select>
          <input type="text" placeholder="Topics (comma separated)" value={qbTopic} onChange={(e) => setQbTopic(e.target.value)} style={{ width: "100%", padding: "10px 16px", borderRadius: "12px", backgroundColor: "#ffffff", border: "1px solid #e2e8f0", color: "#1a1a2e", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
          <select value={qbCount} onChange={(e) => setQbCount(e.target.value)} style={{ width: "100%", padding: "10px 16px", borderRadius: "12px", backgroundColor: "#ffffff", border: "1px solid #e2e8f0", color: "#1a1a2e", fontSize: "13px", outline: "none", colorScheme: "light", boxSizing: "border-box" } as React.CSSProperties}>
            {[5, 10, 20, 30, 50].map((n) => (<option key={n} value={n} style={{ background: "#fff", color: "#1a1a2e" }}>{n} Questions</option>))}
          </select>
          <select value={qbDifficulty} onChange={(e) => setQbDifficulty(e.target.value)} style={{ width: "100%", padding: "10px 16px", borderRadius: "12px", backgroundColor: "#ffffff", border: "1px solid #e2e8f0", color: "#1a1a2e", fontSize: "13px", outline: "none", colorScheme: "light", boxSizing: "border-box" } as React.CSSProperties}>
            {DIFFICULTIES.map((d) => (<option key={d} value={d} style={{ background: "#fff", color: "#1a1a2e" }}>{d}</option>))}
          </select>
          <button onClick={handleAiGenerate} disabled={generating || !qbSubject} style={{ padding: "8px 16px", borderRadius: "12px", backgroundColor: "#0055ff", color: "#ffffff", fontSize: "13px", fontWeight: 500, border: "none", cursor: generating || !qbSubject ? "not-allowed" : "pointer", opacity: generating || !qbSubject ? 0.5 : 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            {generating ? <Loader2 style={{ width: "16px", height: "16px", animation: "spin 1s linear infinite" }} /> : <Zap style={{ width: "16px", height: "16px" }} />}
            Generate
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: "12px", padding: "0 16px", flexWrap: "wrap" }}>
        <button onClick={() => { setEditingQuestion(null); resetQuestionForm(); setShowAddQuestion(true); }} style={{ padding: "8px 16px", borderRadius: "12px", backgroundColor: "#0055ff", color: "#ffffff", fontSize: "13px", fontWeight: 500, border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}>
          <Plus style={{ width: "16px", height: "16px" }} />Add Question
        </button>
        <button onClick={() => setShowBulkImport(true)} style={{ padding: "8px 16px", borderRadius: "12px", backgroundColor: "#f8fafc", color: "#475569", fontSize: "13px", fontWeight: 500, border: "1px solid #e2e8f0", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}>
          <Upload style={{ width: "16px", height: "16px" }} />Bulk Import
        </button>
        <button onClick={fetchQuestionBank} style={{ padding: "8px 16px", borderRadius: "12px", backgroundColor: "#f8fafc", color: "#475569", fontSize: "13px", fontWeight: 500, border: "1px solid #e2e8f0", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}>
          <BookOpen style={{ width: "16px", height: "16px" }} />Load Questions
        </button>
      </div>

      {qbLoading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0" }}>
          <Loader2 style={{ width: "32px", height: "32px", color: "#64748b", animation: "spin 1s linear infinite" }} />
        </div>
      ) : questionBank.length === 0 ? (
        <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "80px 24px", textAlign: "center", color: "#64748b", margin: "0 16px" }}>
          <BookOpen style={{ width: "48px", height: "48px", margin: "0 auto 12px", opacity: 0.4 }} />
          <p style={{ fontSize: "14px" }}>No questions in the bank</p>
          <p style={{ fontSize: "12px", marginTop: "4px" }}>Add questions manually or generate with AI</p>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "0 16px" }}>
            {paginatedQB.map((q) => (
              <div key={q.id} style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: "#1a1a2e", fontSize: "13px", fontWeight: 500, marginBottom: "8px" }}>{q.question}</p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "6px", marginBottom: "8px" }}>
                      {q.options.map((opt, idx) => {
                        const letter = String.fromCharCode(65 + idx);
                        return (
                          <div key={idx} style={{ padding: "6px 12px", borderRadius: "8px", fontSize: "12px", ...(letter === q.correct ? { backgroundColor: "#ecfdf5", color: "#047857", fontWeight: 500 } : { backgroundColor: "#f8fafc", color: "#475569" }) }}>
                            <span style={{ fontWeight: 600 }}>{letter}.</span> {opt}
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", flexWrap: "wrap" }}>
                      <span style={{ padding: "2px 8px", borderRadius: "6px", backgroundColor: "#eff6ff", color: "#2563eb" }}>{q.subject}</span>
                      {q.topic && <span style={{ padding: "2px 8px", borderRadius: "6px", backgroundColor: "#f5f3ff", color: "#7c3aed" }}>{q.topic}</span>}
                      <span style={difficultyBadgeStyle(q.difficulty)}>{q.difficulty}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                    <button
                      onClick={() => {
                        setEditingQuestion(q);
                        setNewQuestion({ question: q.question, optionA: q.options[0] || "", optionB: q.options[1] || "", optionC: q.options[2] || "", optionD: q.options[3] || "", correct: q.correct, subject: q.subject, topic: q.topic, difficulty: q.difficulty });
                        setShowAddQuestion(true);
                      }}
                      style={{ padding: "8px", borderRadius: "8px", backgroundColor: "#f8fafc", color: "#64748b", border: "1px solid #e2e8f0", cursor: "pointer" }}
                    >
                      <Edit3 style={{ width: "16px", height: "16px" }} />
                    </button>
                    <button onClick={() => handleDeleteQuestion(q.id)} style={{ padding: "8px", borderRadius: "8px", backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", cursor: "pointer" }}>
                      <Trash2 style={{ width: "16px", height: "16px" }} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {totalQBPages > 1 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "0 16px" }}>
              <button onClick={() => setQbPage((p) => Math.max(1, p - 1))} disabled={qbPage === 1} style={{ padding: "6px 12px", borderRadius: "8px", backgroundColor: "#f8fafc", color: "#475569", fontSize: "12px", fontWeight: 500, border: "1px solid #e2e8f0", cursor: qbPage === 1 ? "not-allowed" : "pointer", opacity: qbPage === 1 ? 0.4 : 1 }}>
                <ChevronLeft style={{ width: "14px", height: "14px" }} />
              </button>
              <span style={{ fontSize: "12px", color: "#64748b" }}>Page {qbPage} of {totalQBPages}</span>
              <button onClick={() => setQbPage((p) => Math.min(totalQBPages, p + 1))} disabled={qbPage === totalQBPages} style={{ padding: "6px 12px", borderRadius: "8px", backgroundColor: "#f8fafc", color: "#475569", fontSize: "12px", fontWeight: 500, border: "1px solid #e2e8f0", cursor: qbPage === totalQBPages ? "not-allowed" : "pointer", opacity: qbPage === totalQBPages ? 0.4 : 1 }}>
                <ChevronRight style={{ width: "14px", height: "14px" }} />
              </button>
            </div>
          )}
        </>
      )}

      {showAddQuestion && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }} onClick={() => { setShowAddQuestion(false); setEditingQuestion(null); }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: "500px", backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <div style={{ background: "linear-gradient(135deg, #0a2a6e, #0055ff)", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ color: "#ffffff", fontSize: "18px", fontWeight: 600 }}>{editingQuestion ? "Edit Question" : "Add Question"}</h3>
              <button onClick={() => { setShowAddQuestion(false); setEditingQuestion(null); }} style={{ color: "rgba(255,255,255,0.7)", background: "none", border: "none", cursor: "pointer" }}><X style={{ width: "20px", height: "20px" }} /></button>
            </div>
            <form onSubmit={handleSaveQuestion} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ color: "#475569", fontSize: "13px", marginBottom: "6px", display: "block" }}>Question *</label>
                <textarea required value={newQuestion.question} onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })} style={{ width: "100%", padding: "10px 16px", borderRadius: "12px", backgroundColor: "#ffffff", border: "1px solid #e2e8f0", color: "#1a1a2e", fontSize: "13px", outline: "none", resize: "vertical", boxSizing: "border-box" }} rows={3} placeholder="Enter the question..." />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {(["A", "B", "C", "D"] as const).map((letter) => (
                  <div key={letter}>
                    <label style={{ color: "#475569", fontSize: "13px", marginBottom: "6px", display: "block" }}>Option {letter} *</label>
                    <input type="text" required value={letter === "A" ? newQuestion.optionA : letter === "B" ? newQuestion.optionB : letter === "C" ? newQuestion.optionC : newQuestion.optionD} onChange={(e) => setNewQuestion({ ...newQuestion, [`option${letter}`]: e.target.value })} style={{ width: "100%", padding: "10px 16px", borderRadius: "12px", backgroundColor: "#ffffff", border: "1px solid #e2e8f0", color: "#1a1a2e", fontSize: "13px", outline: "none", boxSizing: "border-box" }} placeholder={`Option ${letter}`} />
                  </div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ color: "#475569", fontSize: "13px", marginBottom: "6px", display: "block" }}>Correct Answer</label>
                  <select value={newQuestion.correct} onChange={(e) => setNewQuestion({ ...newQuestion, correct: e.target.value })} style={{ width: "100%", padding: "10px 16px", borderRadius: "12px", backgroundColor: "#ffffff", border: "1px solid #e2e8f0", color: "#1a1a2e", fontSize: "13px", outline: "none", colorScheme: "light", boxSizing: "border-box" } as React.CSSProperties}>
                    {["A", "B", "C", "D"].map((l) => (<option key={l} value={l} style={{ background: "#fff", color: "#1a1a2e" }}>Option {l}</option>))}
                  </select>
                </div>
                <div>
                  <label style={{ color: "#475569", fontSize: "13px", marginBottom: "6px", display: "block" }}>Subject</label>
                  <select value={newQuestion.subject} onChange={(e) => setNewQuestion({ ...newQuestion, subject: e.target.value })} style={{ width: "100%", padding: "10px 16px", borderRadius: "12px", backgroundColor: "#ffffff", border: "1px solid #e2e8f0", color: "#1a1a2e", fontSize: "13px", outline: "none", colorScheme: "light", boxSizing: "border-box" } as React.CSSProperties}>
                    <option value="" style={{ background: "#fff", color: "#1a1a2e" }}>Select</option>
                    {SUBJECTS.map((s) => (<option key={s} value={s} style={{ background: "#fff", color: "#1a1a2e" }}>{s}</option>))}
                  </select>
                </div>
                <div>
                  <label style={{ color: "#475569", fontSize: "13px", marginBottom: "6px", display: "block" }}>Difficulty</label>
                  <select value={newQuestion.difficulty} onChange={(e) => setNewQuestion({ ...newQuestion, difficulty: e.target.value })} style={{ width: "100%", padding: "10px 16px", borderRadius: "12px", backgroundColor: "#ffffff", border: "1px solid #e2e8f0", color: "#1a1a2e", fontSize: "13px", outline: "none", colorScheme: "light", boxSizing: "border-box" } as React.CSSProperties}>
                    {DIFFICULTIES.map((d) => (<option key={d} value={d} style={{ background: "#fff", color: "#1a1a2e" }}>{d}</option>))}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ color: "#475569", fontSize: "13px", marginBottom: "6px", display: "block" }}>Topic</label>
                <input type="text" value={newQuestion.topic} onChange={(e) => setNewQuestion({ ...newQuestion, topic: e.target.value })} style={{ width: "100%", padding: "10px 16px", borderRadius: "12px", backgroundColor: "#ffffff", border: "1px solid #e2e8f0", color: "#1a1a2e", fontSize: "13px", outline: "none", boxSizing: "border-box" }} placeholder="e.g. Algebra, Algebraic Fractions" />
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button type="button" onClick={() => { setShowAddQuestion(false); setEditingQuestion(null); }} style={{ flex: 1, padding: "8px 16px", borderRadius: "12px", backgroundColor: "#f8fafc", color: "#475569", fontSize: "13px", fontWeight: 500, border: "1px solid #e2e8f0", cursor: "pointer" }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: "8px 16px", borderRadius: "12px", backgroundColor: "#0055ff", color: "#ffffff", fontSize: "13px", fontWeight: 500, border: "none", cursor: "pointer" }}>{editingQuestion ? "Update" : "Add"} Question</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showBulkImport && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }} onClick={() => setShowBulkImport(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: "500px", backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <div style={{ background: "linear-gradient(135deg, #0a2a6e, #0055ff)", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ color: "#ffffff", fontSize: "18px", fontWeight: 600 }}>Bulk Import Questions</h3>
              <button onClick={() => setShowBulkImport(false)} style={{ color: "rgba(255,255,255,0.7)", background: "none", border: "none", cursor: "pointer" }}><X style={{ width: "20px", height: "20px" }} /></button>
            </div>
            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ padding: "16px", borderRadius: "12px", backgroundColor: "#eff6ff", border: "1px solid #dbeafe" }}>
                <h4 style={{ color: "#1e40af", fontSize: "13px", fontWeight: 600, marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Info style={{ width: "16px", height: "16px" }} />CSV Format Instructions
                </h4>
                <p style={{ color: "#1d4ed8", fontSize: "12px", lineHeight: 1.6 }}>
                  Upload a CSV file with columns: <strong>question, optionA, optionB, optionC, optionD, correct, subject, topic, difficulty</strong>. Each row represents one question.
                </p>
              </div>
              <div style={{ border: "2px dashed #e2e8f0", borderRadius: "12px", padding: "32px", textAlign: "center" }}>
                <Upload style={{ width: "40px", height: "40px", color: "#94a3b8", margin: "0 auto 12px" }} />
                <p style={{ color: "#64748b", fontSize: "13px", marginBottom: "8px" }}>Drag and drop your CSV file here</p>
                <p style={{ color: "#94a3b8", fontSize: "11px" }}>or</p>
                <label style={{ marginTop: "12px", display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 16px", borderRadius: "12px", backgroundColor: "#0055ff", color: "#ffffff", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
                  <Upload style={{ width: "16px", height: "16px" }} />Choose File
                  <input type="file" accept=".csv" style={{ position: "absolute", width: "1px", height: "1px", padding: 0, margin: "-1px", overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0 }} onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const text = await file.text();
                    const lines = text.split("\n").filter((l) => l.trim());
                    if (lines.length < 2) { toast.error("CSV must have a header and at least one row"); return; }
                    const header = lines[0].toLowerCase();
                    if (!header.includes("question")) { toast.error("Invalid CSV format. Expected header with 'question' column"); return; }
                    let imported = 0;
                    for (let i = 1; i < lines.length; i++) {
                      const cols = lines[i].split(",").map((c) => c.trim());
                      if (cols.length < 6) continue;
                      try {
                        await fetch("/api/cbt/practice", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: cols[0], options: [cols[1], cols[2], cols[3], cols[4]], correct: cols[5], subject: cols[6] || qbSubject, topic: cols[7] || "", difficulty: cols[8] || "Medium" }) });
                        imported++;
                      } catch {}
                    }
                    toast.success(`Imported ${imported} questions`);
                    setShowBulkImport(false);
                    fetchQuestionBank();
                  }} />
                </label>
              </div>
              <button onClick={() => setShowBulkImport(false)} style={{ width: "100%", padding: "8px 16px", borderRadius: "12px", backgroundColor: "#f8fafc", color: "#475569", fontSize: "13px", fontWeight: 500, border: "1px solid #e2e8f0", cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
      {view === "list" && <div>{renderExamList()}</div>}
      {view === "exam" && <div>{renderExam()}</div>}
      {view === "results" && <div>{renderResults()}</div>}
      {view === "history" && <div>{renderHistory()}</div>}
      {view === "questionbank" && <div>{renderQuestionBank()}</div>}
    </div>
  );
}

function Grid({ style }: { style?: React.CSSProperties }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}
