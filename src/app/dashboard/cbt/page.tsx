"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";
import { toast } from "sonner";

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
  Mathematics: "📐",
  "English Language": "📝",
  "English": "📝",
  Physics: "🌍",
  Chemistry: "⚗️",
  Biology: "🔬",
  Economics: "💰",
  "Civic Education": "🏛️",
  "Computer Science": "💻",
  "Further Mathematics": "📊",
  "Agricultural Science": "🌾",
  "Literature in English": "📖",
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

  // Exam state
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

  // Results state
  const [resultData, setResultData] = useState<ExamResultData | null>(null);

  // History state
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Question bank state
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

  // ─── Fetch exams ────────────────────────────────────────────────
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

  // ─── Before-unload warning during exam ──────────────────────────
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

  // ─── Timer countdown ────────────────────────────────────────────
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

  // Auto-submit when timer reaches zero
  useEffect(() => {
    if (timerRunning && timeLeft === 0 && currentExam) {
      handleSubmitExam();
    }
  }, [timeLeft, timerRunning]);

  // Sound alert at 60 seconds
  useEffect(() => {
    if (timeLeft === 60 && !soundPlayed && timerRunning) {
      playAlertSound();
      setSoundPlayed(true);
    }
  }, [timeLeft, soundPlayed, timerRunning]);

  // ─── Alert sound ────────────────────────────────────────────────
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

  // ─── Format time ────────────────────────────────────────────────
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // ─── Start exam ─────────────────────────────────────────────────
  const handleStartExam = async (exam: CbtExam) => {
    setExamLoading(true);
    try {
      const res = await fetch(`/api/cbt/exams/${exam.id}/start`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start exam");

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
    } catch (err: any) {
      toast.error(err.message || "Failed to start exam");
    } finally {
      setExamLoading(false);
    }
  };

  // ─── Submit exam ────────────────────────────────────────────────
  const handleSubmitExam = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerRunning(false);
    setShowSubmitConfirm(false);

    if (!currentExam) return;

    try {
      const answerArray = Object.entries(answers).map(([questionId, response]) => ({
        questionId,
        response,
      }));

      const res = await fetch(`/api/cbt/exams/${currentExam.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, answers: answerArray }),
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

  // ─── Fetch history ──────────────────────────────────────────────
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

  // ─── Fetch question bank ────────────────────────────────────────
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

  // ─── AI Generate questions ──────────────────────────────────────
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

  // ─── Add / Edit question ────────────────────────────────────────
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

  // ─── Delete question ────────────────────────────────────────────
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

  // ─── Filtered exams ─────────────────────────────────────────────
  const filteredExams = exams.filter((e) => {
    if (search && !e.title.toLowerCase().includes(search.toLowerCase()) && !e.subject.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterSubject && e.subject !== filterSubject) return false;
    if (filterType && e.examType !== filterType) return false;
    if (filterDifficulty && e.difficulty !== filterDifficulty) return false;
    if (isStudent && e.status !== "active") return false;
    return true;
  });

  // ─── Stats ──────────────────────────────────────────────────────
  const totalExams = exams.length;
  const activeExams = exams.filter((e) => e.status === "active").length;
  const totalAttempts = exams.reduce((s, e) => s + (e.attempts || 0), 0);
  const avgScore =
    history.length > 0
      ? Math.round(history.reduce((s, h) => s + h.percentage, 0) / history.length)
      : 0;

  // ─── Topic performance for results ──────────────────────────────
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

  // ─── Subject icon helper ────────────────────────────────────────
  const getSubjectIcon = (subject: string) => {
    return (
      SUBJECT_ICONS[subject] ||
      SUBJECT_ICONS[Object.keys(SUBJECT_ICONS).find((k) => subject.toLowerCase().includes(k.toLowerCase())) || ""] ||
      "📝"
    );
  };

  // ─── Render: Exam List ──────────────────────────────────────────
  const renderExamList = () => (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-gradient-to-r from-[#0a2a6e] to-[#0055ff] border-white/10 mx-6 mt-6 p-7"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1a1a2e] mb-1 flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <MonitorPlay className="w-5 h-5 text-white" />
              </div>
              CBT Exam Portal
            </h1>
            <p className="text-[#475569] text-[13px] ml-[52px]">
              Computer-Based Testing for WAEC, NECO, JAMB &amp; Practice
            </p>
          </div>
          <div className="flex gap-3">
            {isTeacher && (
              <>
                <button
                  onClick={() => {
                    setView("questionbank");
                    fetchQuestionBank();
                  }}
                  className="btn btn-secondary"
                >
                  <BookOpen className="w-4 h-4" />
                  Question Bank
                </button>
                <button
                  onClick={() => setView("history")}
                  className="btn btn-secondary"
                >
                  <History className="w-4 h-4" />
                  History
                </button>
              </>
            )}
            {isStudent && (
              <button
                onClick={() => {
                  setView("history");
                  fetchHistory();
                }}
                className="btn btn-secondary"
              >
                <History className="w-4 h-4" />
                My History
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Exams", value: totalExams, icon: FileText, color: "from-blue-500 to-blue-600" },
          { label: "Active Exams", value: activeExams, icon: Play, color: "from-emerald-500 to-emerald-600" },
          { label: "Total Attempts", value: totalAttempts, icon: Target, color: "from-purple-500 to-purple-600" },
          { label: "Avg Score", value: `${avgScore}%`, icon: BarChart3, color: "from-amber-500 to-orange-500" },
        ].map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[#64748b] text-[13px] mb-1">{kpi.label}</p>
                <p className="text-3xl font-bold text-[#1a1a2e]">{kpi.value}</p>
              </div>
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center`}
              >
                <kpi.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card"
      >
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
            <input
              type="text"
              placeholder="Search exams by title or subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field w-full pl-9"
            />
          </div>
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="select-field"
            style={{ colorScheme: "light" }}
          >
            <option value="" style={{ background: "#fff", color: "#1a1a2e" }}>
              All Subjects
            </option>
            {SUBJECTS.map((s) => (
              <option key={s} value={s} style={{ background: "#fff", color: "#1a1a2e" }}>
                {s}
              </option>
            ))}
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="select-field"
            style={{ colorScheme: "light" }}
          >
            <option value="" style={{ background: "#fff", color: "#1a1a2e" }}>
              All Types
            </option>
            {EXAM_TYPES.map((t) => (
              <option key={t} value={t} style={{ background: "#fff", color: "#1a1a2e" }}>
                {t}
              </option>
            ))}
          </select>
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="select-field"
            style={{ colorScheme: "light" }}
          >
            <option value="" style={{ background: "#fff", color: "#1a1a2e" }}>
              All Difficulty
            </option>
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d} style={{ background: "#fff", color: "#1a1a2e" }}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Exam cards */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#64748b] animate-spin" />
        </div>
      ) : filteredExams.length === 0 ? (
        <div className="card text-center py-20 text-[#64748b]">
          <MonitorPlay className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-[14px]">No exams found</p>
          <p className="text-[12px] mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExams.map((exam, i) => (
            <motion.div
              key={exam.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card hover:shadow-lg transition-all duration-200 group"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 flex items-center justify-center text-2xl shrink-0">
                  {getSubjectIcon(exam.subject)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[#1a1a2e] font-semibold text-[14px] truncate group-hover:text-blue-600 transition-colors">
                    {exam.title}
                  </h3>
                  <p className="text-[#64748b] text-[12px]">{exam.subject}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="flex items-center gap-1.5 text-[#475569] text-[12px]">
                  <Clock className="w-3.5 h-3.5 text-[#94a3b8]" />
                  {exam.duration} min
                </div>
                <div className="flex items-center gap-1.5 text-[#475569] text-[12px]">
                  <Hash className="w-3.5 h-3.5 text-[#94a3b8]" />
                  {exam.totalQuestions} questions
                </div>
                <div className="flex items-center gap-1.5 text-[#475569] text-[12px]">
                  <Percent className="w-3.5 h-3.5 text-[#94a3b8]" />
                  Pass: {exam.passingScore}%
                </div>
                <div className="flex items-center gap-1.5 text-[#475569] text-[12px]">
                  <Target className="w-3.5 h-3.5 text-[#94a3b8]" />
                  {exam.attempts || 0} attempts
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span className={`px-2 py-0.5 rounded-lg text-[11px] font-medium ${
                  exam.examType === "WAEC"
                    ? "bg-blue-50 text-blue-600"
                    : exam.examType === "NECO"
                      ? "bg-purple-50 text-purple-600"
                      : exam.examType === "JAMB"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-amber-50 text-amber-600"
                }`}>
                  {exam.examType}
                </span>
                <span className={`px-2 py-0.5 rounded-lg text-[11px] font-medium ${
                  exam.difficulty === "Easy"
                    ? "bg-emerald-50 text-emerald-600"
                    : exam.difficulty === "Hard"
                      ? "bg-red-50 text-red-600"
                      : "bg-amber-50 text-amber-600"
                }`}>
                  {exam.difficulty}
                </span>
                <span className={`px-2 py-0.5 rounded-lg text-[11px] font-medium ml-auto ${
                  exam.status === "active"
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-slate-100 text-slate-500"
                }`}>
                  {exam.status}
                </span>
              </div>

              {exam.status === "active" && (
                <button
                  onClick={() => handleStartExam(exam)}
                  disabled={examLoading}
                  className="btn btn-primary w-full"
                >
                  {examLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  Start Exam
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  // ─── Render: Exam Interface ─────────────────────────────────────
  const renderExam = () => {
    const q = questions[currentIndex];
    const answeredCount = Object.keys(answers).length;
    const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;
    const isTimeCritical = timeLeft <= 300;

    return (
      <div className="min-h-[calc(100vh-120px)]">
        {/* Top bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-40 bg-white border border-[#e2e8f0] rounded-2xl shadow-sm mb-4 px-4 py-3"
        >
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <MonitorPlay className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-[#1a1a2e] font-semibold text-[14px]">{currentExam?.title}</h2>
                <p className="text-[#64748b] text-[11px]">{currentExam?.subject}</p>
              </div>
            </div>

            {/* Timer */}
            <div
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-lg font-bold transition-all duration-300 ${
                isTimeCritical
                  ? "bg-red-50 text-red-600 border-2 border-red-200 animate-pulse"
                  : "bg-[#f8fafc] text-[#1a1a2e] border border-[#e2e8f0]"
              }`}
            >
              <Timer className={`w-5 h-5 ${isTimeCritical ? "text-red-500" : "text-[#64748b]"}`} />
              {formatTime(timeLeft)}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowQuestionNav(!showQuestionNav)}
                className="btn btn-secondary"
              >
                <Grid className="w-4 h-4" />
                <span className="hidden sm:inline">Navigator</span>
              </button>
              <button
                onClick={() => setShowSubmitConfirm(true)}
                className="btn btn-primary bg-gradient-to-r from-emerald-500 to-emerald-600"
              >
                <Send className="w-4 h-4" />
                Submit
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-[#64748b]">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="text-[#64748b]">
                {answeredCount} answered · {questions.length - answeredCount} remaining
              </span>
            </div>
            <div className="w-full bg-[#f1f5f9] rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </motion.div>

        {/* Question navigator panel */}
        <AnimatePresence>
          {showQuestionNav && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="card p-4">
                <h4 className="text-[#1a1a2e] font-semibold text-[13px] mb-3">Question Navigator</h4>
                <div className="flex flex-wrap gap-2">
                  {questions.map((question, idx) => {
                    const qId = question.id;
                    const isAnswered = !!answers[qId];
                    const isFlagged = flagged.has(qId);
                    const isCurrent = idx === currentIndex;
                    return (
                      <button
                        key={qId}
                        onClick={() => {
                          setCurrentIndex(idx);
                          setShowQuestionNav(false);
                        }}
                        className={`w-10 h-10 rounded-lg text-[12px] font-semibold transition-all flex items-center justify-center relative ${
                          isCurrent
                            ? "bg-blue-500 text-white shadow-md ring-2 ring-blue-200"
                            : isAnswered
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-[#f8fafc] text-[#475569] border border-[#e2e8f0] hover:bg-[#f1f5f9]"
                        }`}
                      >
                        {idx + 1}
                        {isFlagged && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border border-white" />
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-4 mt-3 text-[11px]">
                  <span className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-emerald-50 border border-emerald-200" />
                    Answered
                  </span>
                  <span className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-[#f8fafc] border border-[#e2e8f0]" />
                    Unanswered
                  </span>
                  <span className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-amber-400" />
                    Flagged
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Question content */}
        {q && (
          <motion.div
            key={q.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card mb-4"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-[14px]">{currentIndex + 1}</span>
                </div>
                <div>
                  <p className="text-[#1a1a2e] text-[12px] font-medium">
                    {q.topic && <span className="text-[#64748b]">Topic: {q.topic} · </span>}
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
                  flagged.has(q.id)
                    ? "bg-amber-50 text-amber-600 border border-amber-200"
                    : "bg-[#f8fafc] text-[#64748b] border border-[#e2e8f0] hover:bg-[#f1f5f9]"
                }`}
              >
                <Flag className="w-3.5 h-3.5" />
                {flagged.has(q.id) ? "Flagged" : "Flag"}
              </button>
            </div>

            <p className="text-[#1a1a2e] text-[15px] leading-relaxed mb-6">{q.question}</p>

            <div className="space-y-3">
              {q.options.map((option, idx) => {
                const letter = String.fromCharCode(65 + idx);
                const isSelected = answers[q.id] === letter;
                return (
                  <label
                    key={idx}
                    className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? "bg-blue-50 border-blue-400 shadow-sm"
                        : "bg-[#f8fafc] border-[#e2e8f0] hover:border-[#cbd5e1] hover:bg-[#f1f5f9]"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                        isSelected
                          ? "bg-blue-500 border-blue-500"
                          : "border-[#d1d5db] bg-white"
                      }`}
                    >
                      <span
                        className={`text-[12px] font-bold ${isSelected ? "text-white" : "text-[#64748b]"}`}
                      >
                        {letter}
                      </span>
                    </div>
                    <span className="text-[#1a1a2e] text-[13px] leading-relaxed pt-1">
                      {option}
                    </span>
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      checked={isSelected}
                      onChange={() => setAnswers({ ...answers, [q.id]: letter })}
                      className="sr-only"
                    />
                  </label>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="btn btn-secondary disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          {flagged.has(q?.id) && (
            <div className="flex items-center gap-1.5 text-amber-500 text-[12px] font-medium">
              <Flag className="w-3.5 h-3.5" />
              Flagged for review
            </div>
          )}

          <button
            onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}
            disabled={currentIndex === questions.length - 1}
            className="btn btn-primary disabled:opacity-40"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Submit confirmation */}
        <AnimatePresence>
          {showSubmitConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="modal-overlay"
              onClick={() => setShowSubmitConfirm(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="modal-content max-w-sm"
              >
                <div className="text-center p-6">
                  <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-amber-500" />
                  </div>
                  <h3 className="text-[#1a1a2e] font-bold text-[17px] mb-2">
                    Submit Exam?
                  </h3>
                  <p className="text-[#64748b] text-[13px] mb-2">
                    You have answered <span className="font-semibold text-[#1a1a2e]">{answeredCount}</span> of{" "}
                    <span className="font-semibold text-[#1a1a2e]">{questions.length}</span> questions.
                  </p>
                  {answeredCount < questions.length && (
                    <p className="text-amber-600 text-[12px] font-medium">
                      ⚠️ {questions.length - answeredCount} question(s) unanswered!
                    </p>
                  )}
                  <p className="text-[#64748b] text-[12px] mt-2">
                    Time remaining: {formatTime(timeLeft)}
                  </p>
                </div>
                <div className="modal-footer">
                  <button
                    onClick={() => setShowSubmitConfirm(false)}
                    className="btn btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitExam}
                    className="btn btn-primary flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600"
                  >
                    <Send className="w-4 h-4" />
                    Submit Exam
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // ─── Render: Results ────────────────────────────────────────────
  const renderResults = () => {
    if (!resultData) return null;

    return (
      <div className="space-y-6">
        {/* Score card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`card text-center py-8 ${
            resultData.passed
              ? "bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200"
              : "bg-gradient-to-br from-red-50 to-red-100/50 border-red-200"
          }`}
        >
          <div
            className={`w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center ${
              resultData.passed
                ? "bg-gradient-to-br from-emerald-500 to-emerald-600"
                : "bg-gradient-to-br from-red-500 to-red-600"
            }`}
          >
            {resultData.passed ? (
              <Trophy className="w-10 h-10 text-white" />
            ) : (
              <ShieldX className="w-10 h-10 text-white" />
            )}
          </div>
          <h2 className="text-[#1a1a2e] font-bold text-2xl mb-1">Exam Completed!</h2>
          <div className="text-5xl font-bold text-[#1a1a2e] my-4">
            {resultData.score}/{resultData.total}
          </div>
          <p className="text-[#475569] text-lg mb-1">
            <span className="font-bold">{resultData.percentage}%</span>
          </p>
          <span
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[13px] font-semibold ${
              resultData.passed
                ? "bg-emerald-500/10 text-emerald-700"
                : "bg-red-500/10 text-red-700"
            }`}
          >
            {resultData.passed ? (
              <>
                <ShieldCheck className="w-4 h-4" /> Passed
              </>
            ) : (
              <>
                <ShieldX className="w-4 h-4" /> Failed
              </>
            )}
          </span>
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Time Taken", value: formatTime(resultData.timeTaken), icon: Clock, color: "from-blue-500 to-blue-600" },
            { label: "Correct", value: resultData.correct, icon: CheckCircle2, color: "from-emerald-500 to-emerald-600" },
            { label: "Incorrect", value: resultData.incorrect, icon: X, color: "from-red-500 to-red-600" },
            { label: "Unanswered", value: resultData.unanswered, icon: AlertCircle, color: "from-amber-500 to-amber-600" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="card"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shrink-0`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-[#64748b] text-[11px]">{stat.label}</p>
                  <p className="text-[#1a1a2e] font-bold text-lg">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Topic performance */}
        {topicPerformance.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card"
          >
            <h3 className="text-[#1a1a2e] font-semibold text-[15px] mb-4">
              Topic Performance
            </h3>
            <div className="space-y-3">
              {topicPerformance.map((tp, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[#475569] text-[12px]">{tp.topic}</span>
                    <span className="text-[#64748b] text-[11px]">
                      {tp.correct}/{tp.total} ({tp.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#f1f5f9] rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        tp.percentage >= 70
                          ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                          : tp.percentage >= 50
                            ? "bg-gradient-to-r from-amber-500 to-amber-400"
                            : "bg-gradient-to-r from-red-500 to-red-400"
                      }`}
                      style={{ width: `${tp.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Detailed review */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <h3 className="text-[#1a1a2e] font-semibold text-[15px] mb-4">
            Detailed Review
          </h3>
          <div className="space-y-4">
            {resultData.results.map((r, i) => {
              const question = questions.find((q) => q.id === r.questionId);
              return (
                <div
                  key={r.questionId}
                  className={`p-4 rounded-xl border ${
                    r.isCorrect
                      ? "bg-emerald-50/50 border-emerald-200"
                      : r.selected
                        ? "bg-red-50/50 border-red-200"
                        : "bg-amber-50/50 border-amber-200"
                  }`}
                >
                  <div className="flex items-start gap-3 mb-2">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                        r.isCorrect
                          ? "bg-emerald-500 text-white"
                          : r.selected
                            ? "bg-red-500 text-white"
                            : "bg-amber-400 text-white"
                      }`}
                    >
                      {r.isCorrect ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <span className="text-[10px] font-bold">✕</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-[#1a1a2e] text-[13px] font-medium mb-2">
                        {i + 1}. {question?.question || "Question"}
                      </p>
                      {question && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-2">
                          {question.options.map((opt, idx) => {
                            const letter = String.fromCharCode(65 + idx);
                            const isCorrect = letter === r.correct;
                            const isSelected = letter === r.selected;
                            return (
                              <div
                                key={idx}
                                className={`px-3 py-1.5 rounded-lg text-[12px] ${
                                  isCorrect
                                    ? "bg-emerald-100 text-emerald-800 font-medium"
                                    : isSelected
                                      ? "bg-red-100 text-red-800"
                                      : "bg-[#f8fafc] text-[#475569]"
                                }`}
                              >
                                <span className="font-semibold">{letter}.</span> {opt}
                                {isCorrect && " ✓"}
                                {isSelected && !isCorrect && " ✗"}
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {r.explanation && (
                        <div className="mt-2 p-2 rounded-lg bg-blue-50 text-blue-800 text-[12px]">
                          <span className="font-semibold">💡 Explanation:</span> {r.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3">
          {currentExam && (
            <button
              onClick={() => handleStartExam(currentExam)}
              className="btn btn-primary"
            >
              <RotateCcw className="w-4 h-4" />
              Retry Exam
            </button>
          )}
          <button
            onClick={() => {
              setView("list");
              setResultData(null);
            }}
            className="btn btn-secondary"
          >
            <BookOpen className="w-4 h-4" />
            Back to Exams
          </button>
        </div>
      </div>
    );
  };

  // ─── Render: History ────────────────────────────────────────────
  const renderHistory = () => (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-gradient-to-r from-purple-500/20 to-indigo-500/10 border-purple-200"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1a1a2e] mb-1 flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                <History className="w-5 h-5 text-white" />
              </div>
              Exam History
            </h1>
            <p className="text-[#475569] text-[13px] ml-[52px]">
              Track your performance across all CBT exams
            </p>
          </div>
          <button onClick={() => setView("list")} className="btn btn-secondary">
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </motion.div>

      {/* Summary stats */}
      {history.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: "Exams Taken",
              value: history.length,
              icon: FileText,
              color: "from-blue-500 to-blue-600",
            },
            {
              label: "Average Score",
              value: `${Math.round(history.reduce((s, h) => s + h.percentage, 0) / history.length)}%`,
              icon: BarChart3,
              color: "from-emerald-500 to-emerald-600",
            },
            {
              label: "Pass Rate",
              value: `${Math.round((history.filter((h) => h.passed).length / history.length) * 100)}%`,
              icon: Trophy,
              color: "from-purple-500 to-purple-600",
            },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="card"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-[#64748b] text-[11px]">{stat.label}</p>
                  <p className="text-[#1a1a2e] font-bold text-lg">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {historyLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#64748b] animate-spin" />
        </div>
      ) : history.length === 0 ? (
        <div className="card text-center py-20 text-[#64748b]">
          <History className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-[14px]">No exam history yet</p>
          <p className="text-[12px] mt-1">Complete an exam to see your history here</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e2e8f0]">
                  {["Date", "Exam", "Subject", "Type", "Score", "Status", "Time", "Improvement"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-left text-[#64748b] text-[11px] font-semibold uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {history.map((entry, i) => (
                  <motion.tr
                    key={entry.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className={`border-b border-[#e2e8f0] hover:bg-[#f8fafc] transition ${
                      i % 2 === 1 ? "bg-[#f8fafc]/50" : ""
                    }`}
                  >
                    <td className="px-5 py-3.5 text-[#94a3b8] text-[12px]">
                      {new Date(entry.date).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 text-[#1a1a2e] text-[13px] font-medium">
                      {entry.examTitle}
                    </td>
                    <td className="px-5 py-3.5 text-[#475569] text-[12px]">{entry.subject}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-lg text-[11px] font-medium ${
                          entry.examType === "WAEC"
                            ? "bg-blue-50 text-blue-600"
                            : entry.examType === "NECO"
                              ? "bg-purple-50 text-purple-600"
                              : entry.examType === "JAMB"
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-amber-50 text-amber-600"
                        }`}
                      >
                        {entry.examType}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[#1a1a2e] font-semibold text-[13px]">
                        {entry.score}/{entry.total}
                      </span>
                      <span className="text-[#64748b] text-[11px] ml-1">({entry.percentage}%)</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium ${
                          entry.passed
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {entry.passed ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <X className="w-3 h-3" />
                        )}
                        {entry.passed ? "Pass" : "Fail"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[#64748b] text-[12px]">
                      {formatTime(entry.timeTaken)}
                    </td>
                    <td className="px-5 py-3.5">
                      {entry.improvement != null ? (
                        <span
                          className={`flex items-center gap-1 text-[12px] font-medium ${
                            entry.improvement > 0
                              ? "text-emerald-600"
                              : entry.improvement < 0
                                ? "text-red-600"
                                : "text-[#64748b]"
                          }`}
                        >
                          {entry.improvement > 0 ? (
                            <ArrowUpRight className="w-3 h-3" />
                          ) : entry.improvement < 0 ? (
                            <ArrowDownRight className="w-3 h-3" />
                          ) : null}
                          {entry.improvement > 0 ? "+" : ""}
                          {entry.improvement}%
                        </span>
                      ) : (
                        <span className="text-[#94a3b8] text-[12px]">—</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  // ─── Render: Question Bank ──────────────────────────────────────
  const renderQuestionBank = () => (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-gradient-to-r from-amber-500/20 to-orange-500/10 border-amber-200"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1a1a2e] mb-1 flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              Question Bank
            </h1>
            <p className="text-[#475569] text-[13px] ml-[52px]">
              Create, import, and manage exam questions
            </p>
          </div>
          <button onClick={() => setView("list")} className="btn btn-secondary">
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </motion.div>

      {/* AI Generate */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <h3 className="text-[#1a1a2e] font-semibold text-[15px] mb-4 flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-purple-500" />
          AI Question Generator
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <select
            value={qbSubject}
            onChange={(e) => setQbSubject(e.target.value)}
            className="select-field"
            style={{ colorScheme: "light" }}
          >
            <option value="" style={{ background: "#fff", color: "#1a1a2e" }}>
              Subject
            </option>
            {SUBJECTS.map((s) => (
              <option key={s} value={s} style={{ background: "#fff", color: "#1a1a2e" }}>
                {s}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Topics (comma separated)"
            value={qbTopic}
            onChange={(e) => setQbTopic(e.target.value)}
            className="input-field"
          />
          <select
            value={qbCount}
            onChange={(e) => setQbCount(e.target.value)}
            className="select-field"
            style={{ colorScheme: "light" }}
          >
            {[5, 10, 20, 30, 50].map((n) => (
              <option key={n} value={n} style={{ background: "#fff", color: "#1a1a2e" }}>
                {n} Questions
              </option>
            ))}
          </select>
          <select
            value={qbDifficulty}
            onChange={(e) => setQbDifficulty(e.target.value)}
            className="select-field"
            style={{ colorScheme: "light" }}
          >
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d} style={{ background: "#fff", color: "#1a1a2e" }}>
                {d}
              </option>
            ))}
          </select>
          <button
            onClick={handleAiGenerate}
            disabled={generating || !qbSubject}
            className="btn btn-primary"
          >
            {generating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            Generate
          </button>
        </div>
      </motion.div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => {
            setEditingQuestion(null);
            resetQuestionForm();
            setShowAddQuestion(true);
          }}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4" />
          Add Question
        </button>
        <button onClick={() => setShowBulkImport(true)} className="btn btn-secondary">
          <Upload className="w-4 h-4" />
          Bulk Import
        </button>
        <button
          onClick={fetchQuestionBank}
          className="btn btn-secondary"
        >
          <BookOpen className="w-4 h-4" />
          Load Questions
        </button>
      </div>

      {/* Questions list */}
      {qbLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#64748b] animate-spin" />
        </div>
      ) : questionBank.length === 0 ? (
        <div className="card text-center py-20 text-[#64748b]">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-[14px]">No questions in the bank</p>
          <p className="text-[12px] mt-1">Add questions manually or generate with AI</p>
        </div>
      ) : (
        <div className="space-y-3">
          {questionBank.map((q, i) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="card"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-[#1a1a2e] text-[13px] font-medium mb-2">{q.question}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-2">
                    {q.options.map((opt, idx) => {
                      const letter = String.fromCharCode(65 + idx);
                      return (
                        <div
                          key={idx}
                          className={`px-3 py-1.5 rounded-lg text-[12px] ${
                            letter === q.correct
                              ? "bg-emerald-50 text-emerald-700 font-medium"
                              : "bg-[#f8fafc] text-[#475569]"
                          }`}
                        >
                          <span className="font-semibold">{letter}.</span> {opt}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600">{q.subject}</span>
                    {q.topic && (
                      <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-600">{q.topic}</span>
                    )}
                    <span className={`px-2 py-0.5 rounded ${
                      q.difficulty === "Easy"
                        ? "bg-emerald-50 text-emerald-600"
                        : q.difficulty === "Hard"
                          ? "bg-red-50 text-red-600"
                          : "bg-amber-50 text-amber-600"
                    }`}>
                      {q.difficulty}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setEditingQuestion(q);
                      setNewQuestion({
                        question: q.question,
                        optionA: q.options[0] || "",
                        optionB: q.options[1] || "",
                        optionC: q.options[2] || "",
                        optionD: q.options[3] || "",
                        correct: q.correct,
                        subject: q.subject,
                        topic: q.topic,
                        difficulty: q.difficulty,
                      });
                      setShowAddQuestion(true);
                    }}
                    className="p-2 rounded-lg hover:bg-[#f1f5f9] text-[#64748b] hover:text-[#1a1a2e] transition"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-[#64748b] hover:text-red-600 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit question modal */}
      <AnimatePresence>
        {showAddQuestion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => {
              setShowAddQuestion(false);
              setEditingQuestion(null);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="modal-content"
            >
              <div className="modal-header">
                <h3 className="text-[#1a1a2e] font-semibold text-lg">
                  {editingQuestion ? "Edit Question" : "Add Question"}
                </h3>
                <button
                  onClick={() => {
                    setShowAddQuestion(false);
                    setEditingQuestion(null);
                  }}
                  className="text-[#64748b] hover:text-[#1a1a2e]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSaveQuestion} className="space-y-4 p-6">
                <div>
                  <label className="block text-[#475569] text-[13px] mb-1.5">
                    Question *
                  </label>
                  <textarea
                    required
                    value={newQuestion.question}
                    onChange={(e) =>
                      setNewQuestion({ ...newQuestion, question: e.target.value })
                    }
                    className="input-field w-full"
                    rows={3}
                    placeholder="Enter the question..."
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(["A", "B", "C", "D"] as const).map((letter) => (
                    <div key={letter}>
                      <label className="block text-[#475569] text-[13px] mb-1.5">
                        Option {letter} *
                      </label>
                      <input
                        type="text"
                        required
                        value={
                          letter === "A"
                            ? newQuestion.optionA
                            : letter === "B"
                              ? newQuestion.optionB
                              : letter === "C"
                                ? newQuestion.optionC
                                : newQuestion.optionD
                        }
                        onChange={(e) =>
                          setNewQuestion({
                            ...newQuestion,
                            [`option${letter}`]: e.target.value,
                          })
                        }
                        className="input-field w-full"
                        placeholder={`Option ${letter}`}
                      />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[#475569] text-[13px] mb-1.5">
                      Correct Answer
                    </label>
                    <select
                      value={newQuestion.correct}
                      onChange={(e) =>
                        setNewQuestion({ ...newQuestion, correct: e.target.value })
                      }
                      className="select-field w-full"
                      style={{ colorScheme: "light" }}
                    >
                      {["A", "B", "C", "D"].map((l) => (
                        <option key={l} value={l} style={{ background: "#fff", color: "#1a1a2e" }}>
                          Option {l}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#475569] text-[13px] mb-1.5">
                      Subject
                    </label>
                    <select
                      value={newQuestion.subject}
                      onChange={(e) =>
                        setNewQuestion({ ...newQuestion, subject: e.target.value })
                      }
                      className="select-field w-full"
                      style={{ colorScheme: "light" }}
                    >
                      <option value="" style={{ background: "#fff", color: "#1a1a2e" }}>
                        Select
                      </option>
                      {SUBJECTS.map((s) => (
                        <option key={s} value={s} style={{ background: "#fff", color: "#1a1a2e" }}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#475569] text-[13px] mb-1.5">
                      Difficulty
                    </label>
                    <select
                      value={newQuestion.difficulty}
                      onChange={(e) =>
                        setNewQuestion({ ...newQuestion, difficulty: e.target.value })
                      }
                      className="select-field w-full"
                      style={{ colorScheme: "light" }}
                    >
                      {DIFFICULTIES.map((d) => (
                        <option key={d} value={d} style={{ background: "#fff", color: "#1a1a2e" }}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[#475569] text-[13px] mb-1.5">
                    Topic
                  </label>
                  <input
                    type="text"
                    value={newQuestion.topic}
                    onChange={(e) =>
                      setNewQuestion({ ...newQuestion, topic: e.target.value })
                    }
                    className="input-field w-full"
                    placeholder="e.g. Algebra, Algebraic Fractions"
                  />
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddQuestion(false);
                      setEditingQuestion(null);
                    }}
                    className="btn btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary flex-1">
                    {editingQuestion ? "Update" : "Add"} Question
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk import modal */}
      <AnimatePresence>
        {showBulkImport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => setShowBulkImport(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="modal-content"
            >
              <div className="modal-header">
                <h3 className="text-[#1a1a2e] font-semibold text-lg">
                  Bulk Import Questions
                </h3>
                <button
                  onClick={() => setShowBulkImport(false)}
                  className="text-[#64748b] hover:text-[#1a1a2e]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                  <h4 className="text-blue-800 text-[13px] font-semibold mb-2 flex items-center gap-1.5">
                    <Info className="w-4 h-4" />
                    CSV Format Instructions
                  </h4>
                  <p className="text-blue-700 text-[12px] leading-relaxed">
                    Upload a CSV file with columns: <strong>question, optionA, optionB, optionC, optionD, correct, subject, topic, difficulty</strong>.
                    Each row represents one question.
                  </p>
                </div>
                <div className="border-2 border-dashed border-[#e2e8f0] rounded-xl p-8 text-center">
                  <Upload className="w-10 h-10 text-[#94a3b8] mx-auto mb-3" />
                  <p className="text-[#64748b] text-[13px] mb-2">
                    Drag and drop your CSV file here
                  </p>
                  <p className="text-[#94a3b8] text-[11px]">or</p>
                  <label className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-[12px] font-semibold cursor-pointer hover:brightness-110 transition-all">
                    <Upload className="w-4 h-4" />
                    Choose File
                    <input type="file" accept=".csv" className="sr-only" onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const text = await file.text();
                      const lines = text.split("\n").filter((l) => l.trim());
                      if (lines.length < 2) {
                        toast.error("CSV must have a header and at least one row");
                        return;
                      }
                      const header = lines[0].toLowerCase();
                      if (!header.includes("question")) {
                        toast.error("Invalid CSV format. Expected header with 'question' column");
                        return;
                      }
                      let imported = 0;
                      for (let i = 1; i < lines.length; i++) {
                        const cols = lines[i].split(",").map((c) => c.trim());
                        if (cols.length < 6) continue;
                        try {
                          await fetch("/api/cbt/practice", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              question: cols[0],
                              options: [cols[1], cols[2], cols[3], cols[4]],
                              correct: cols[5],
                              subject: cols[6] || qbSubject,
                              topic: cols[7] || "",
                              difficulty: cols[8] || "Medium",
                            }),
                          });
                          imported++;
                        } catch {}
                      }
                      toast.success(`Imported ${imported} questions`);
                      setShowBulkImport(false);
                      fetchQuestionBank();
                    }} />
                  </label>
                </div>
                <button
                  onClick={() => setShowBulkImport(false)}
                  className="btn btn-secondary w-full"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // ─── Main render ────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {view === "list" && (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {renderExamList()}
          </motion.div>
        )}
        {view === "exam" && (
          <motion.div
            key="exam"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {renderExam()}
          </motion.div>
        )}
        {view === "results" && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {renderResults()}
          </motion.div>
        )}
        {view === "history" && (
          <motion.div
            key="history"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {renderHistory()}
          </motion.div>
        )}
        {view === "questionbank" && (
          <motion.div
            key="questionbank"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {renderQuestionBank()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Small grid icon component used in navigator button
function Grid({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}
