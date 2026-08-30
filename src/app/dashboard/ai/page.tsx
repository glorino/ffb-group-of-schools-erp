"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Users,
  RefreshCw,
  Send,
  X,
  MessageSquare,
  Loader2,
  FileText,
  BookOpen,
  GraduationCap,
  CheckCircle,
  ChevronDown,
  Sparkles,
  BarChart3,
  Target,
  Shield,
  Zap,
  Copy,
} from "lucide-react";
import { toast } from "sonner";

interface Prediction {
  studentId: string;
  name: string;
  admissionNumber: string;
  riskLevel: "low" | "medium" | "high";
  factors: string[];
  recommendations: string[];
  predictedScore: number;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface HeatmapCell {
  subject: string;
  topic: string;
  score: number;
}

interface SubjectPerf {
  subject: string;
  avg: number;
  count: number;
}

interface ExamQuestion {
  question: string;
  options: { A: string; B: string; C: string; D: string };
  answer: string;
  explanation: string;
  difficulty: string;
  topic: string;
}

interface LessonPlan {
  objectives: string[];
  materials: string[];
  introduction: string;
  mainContent: { step: string; activity: string; time: string }[];
  evaluation: string;
  assignment: string;
}

export default function AIPage() {
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [stats, setStats] = useState({
    atRisk: 0,
    reports: 0,
    predictionsMade: 0,
    contentGenerated: 0,
  });

  const [activeTab, setActiveTab] = useState<"questions" | "comments" | "lessonplans">("questions");
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [questionSubject, setQuestionSubject] = useState("Mathematics");
  const [questionTopic, setQuestionTopic] = useState("Algebra");
  const [questionCount, setQuestionCount] = useState(5);
  const [questionDifficulty, setQuestionDifficulty] = useState("Medium");
  const [questionExamType, setQuestionExamType] = useState("WAEC");
  const [generatedQuestions, setGeneratedQuestions] = useState<ExamQuestion[]>([]);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);

  const [commentStudent, setCommentStudent] = useState("");
  const [commentSubjects, setCommentSubjects] = useState("Mathematics: 75 A, English: 68 B");
  const [commentAttendance, setCommentAttendance] = useState("85");
  const [commentBehavior, setCommentBehavior] = useState("Good");
  const [generatedComment, setGeneratedComment] = useState("");
  const [generatingComment, setGeneratingComment] = useState(false);

  const [lessonSubject, setLessonSubject] = useState("Mathematics");
  const [lessonTopic, setLessonTopic] = useState("Quadratic Equations");
  const [lessonClass, setLessonClass] = useState("JSS3");
  const [lessonDuration, setLessonDuration] = useState("45 minutes");
  const [generatedLesson, setGeneratedLesson] = useState<LessonPlan | null>(null);
  const [generatingLesson, setGeneratingLesson] = useState(false);

  const [heatmapData, setHeatmapData] = useState<HeatmapCell[]>([]);
  const [subjectPerformance, setSubjectPerformance] = useState<SubjectPerf[]>([]);
  const [selectedHeatCell, setSelectedHeatCell] = useState<HeatmapCell | null>(null);

  const subjects = ["Mathematics", "English", "Physics", "Chemistry", "Biology", "Economics"];
  const topics: Record<string, string[]> = {
    Mathematics: ["Algebra", "Geometry", "Trigonometry", "Statistics", "Calculus"],
    English: ["Grammar", "Comprehension", "Literature", "Essay Writing", "Summary"],
    Physics: ["Forces", "Energy", "Waves", "Electricity", "Optics"],
    Chemistry: ["Atoms", "Organic Chemistry", "Acids & Bases", "Periodic Table", "Chemical Bonds"],
    Biology: ["Cells", "Ecology", "Genetics", "Photosynthesis", "Human Biology"],
    Economics: ["Supply/Demand", "Inflation", "Market Structures", "National Income", "Trade"],
  };

  const fetchInsights = useCallback(async () => {
    setLoading(true);
    try {
      const [insightsRes, predictionsRes] = await Promise.all([
        fetch("/api/ai/insights"),
        fetch("/api/ai/predictions"),
      ]);

      const insightsData = insightsRes.ok ? await insightsRes.json() : {};
      const predictionsData = predictionsRes.ok ? await predictionsRes.json() : {};

      if (insightsData.success) {
        setSubjectPerformance(insightsData.subjectPerformance || []);
        setHeatmapData(insightsData.heatmapData || []);
      }

      if (predictionsData.success) {
        const preds = predictionsData.predictions || [];
        setPredictions(preds);
        const atRisk = preds.filter((p: Prediction) => p.riskLevel === "high").length;
        setStats({
          atRisk,
          reports: 0,
          predictionsMade: preds.length,
          contentGenerated: 0,
        });
      }
    } catch {
      toast.error("Failed to load AI insights");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch("/api/ai/analyze", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setPredictions(data.predictions || []);
        setStats((s) => ({
          ...s,
          atRisk: data.riskCounts?.high || 0,
          predictionsMade: data.totalAnalyzed || 0,
        }));
        toast.success(`Analyzed ${data.totalAnalyzed} students successfully`);
      } else {
        toast.error(data.error || "Analysis failed");
      }
    } catch {
      toast.error("Failed to run AI analysis");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setChatLoading(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMsg }),
      });
      const data = await res.json();
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.success ? data.answer : "Sorry, I couldn't process that question." },
      ]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Connection error. Please try again." },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleGenerateQuestions = async () => {
    setGeneratingQuestions(true);
    try {
      const res = await fetch("/api/ai/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: questionSubject,
          topic: questionTopic,
          count: questionCount,
          difficulty: questionDifficulty,
          examType: questionExamType,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedQuestions(data.questions);
        setStats((s) => ({ ...s, contentGenerated: s.contentGenerated + data.questions.length }));
        toast.success(`Generated ${data.questions.length} questions`);
      } else {
        toast.error(data.error || "Failed to generate questions");
      }
    } catch {
      toast.error("Failed to generate questions");
    } finally {
      setGeneratingQuestions(false);
    }
  };

  const handleGenerateComment = async () => {
    if (!commentStudent.trim()) return toast.error("Enter student name");
    setGeneratingComment(true);
    try {
      const subjectsList = commentSubjects.split(",").map((s) => {
        const parts = s.trim().split(":");
        const nameScore = parts[0]?.trim().split(" ");
        return {
          name: nameScore?.[0] || s.trim(),
          score: parseInt(nameScore?.[1] || "50"),
          grade: parts[1]?.trim() || "C",
        };
      });

      const res = await fetch("/api/ai/generate-comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: commentStudent,
          subjects: subjectsList,
          attendance: parseInt(commentAttendance) || 85,
          behavior: commentBehavior,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedComment(data.comment);
        setStats((s) => ({ ...s, contentGenerated: s.contentGenerated + 1 }));
        toast.success("Report comment generated");
      } else {
        toast.error(data.error || "Failed to generate comment");
      }
    } catch {
      toast.error("Failed to generate comment");
    } finally {
      setGeneratingComment(false);
    }
  };

  const handleGenerateLesson = async () => {
    setGeneratingLesson(true);
    try {
      const res = await fetch("/api/ai/generate-lesson-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: lessonSubject,
          topic: lessonTopic,
          classLevel: lessonClass,
          duration: lessonDuration,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedLesson(data.plan);
        setStats((s) => ({ ...s, contentGenerated: s.contentGenerated + 1 }));
        toast.success("Lesson plan generated");
      } else {
        toast.error(data.error || "Failed to generate lesson plan");
      }
    } catch {
      toast.error("Failed to generate lesson plan");
    } finally {
      setGeneratingLesson(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const getHeatColor = (score: number) => {
    if (score >= 70) return "bg-emerald-500";
    if (score >= 50) return "bg-amber-400";
    if (score >= 35) return "bg-orange-500";
    return "bg-red-500";
  };

  const getHeatTextColor = (score: number) => {
    if (score >= 50) return "text-white";
    return "text-white";
  };

  const getRiskBadge = (level: string) => {
    if (level === "high") return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-700">High Risk</span>;
    if (level === "medium") return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700">Medium</span>;
    return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700">Low Risk</span>;
  };

  const statCards = [
    { label: "Students at Risk", value: stats.atRisk, icon: AlertTriangle, color: "from-red-500 to-rose-600" },
    { label: "AI Reports Generated", value: stats.reports, icon: FileText, color: "from-blue-500 to-indigo-600" },
    { label: "Predictions Made", value: stats.predictionsMade, icon: Target, color: "from-violet-500 to-purple-600" },
    { label: "Content Generated", value: stats.contentGenerated, icon: Sparkles, color: "from-emerald-500 to-teal-600" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
          <p className="text-[#64748b] text-[13px]">Loading AI Intelligence Hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="dashboard-card bg-gradient-to-r from-[#0a2a6e] to-[#0055ff] border-white/10 mx-10 mt-8 p-8"
        style={{ background: "linear-gradient(to right, #0a2a6e, #0055ff)" }}
      >
        <div className="section-header">
          <div>
            <h1 className="section-title">AI Intelligence Hub</h1>
            <p className="section-subtitle">OpenAI-powered student analysis, predictions, and content generation</p>
          </div>
          <div className="flex gap-3">
            <button onClick={fetchInsights} className="btn btn-secondary">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
        </div>
      </motion.div>

      <div className="stats-grid-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="stat-card"
          >
            <div className={`stat-card-icon bg-gradient-to-br ${stat.color}`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <div className="stat-card-content">
              <p className="stat-card-label">{stat.label}</p>
              <p className="stat-card-value">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="dashboard-card"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[#1a1a2e] font-semibold text-[16px]">AI Student Analysis</h3>
          <button onClick={handleAnalyze} disabled={analyzing} className="btn btn-primary">
            {analyzing ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
            ) : (
              <><Brain className="w-4 h-4" /> Analyze All Students</>
            )}
          </button>
        </div>

        {predictions.length > 0 ? (
          <div className="table-container">
            <div className="table-scroll">
              <table className="table-glass">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Admission #</th>
                    <th>Risk Level</th>
                    <th>Predicted Score</th>
                    <th>Risk Factors</th>
                    <th>Recommendations</th>
                  </tr>
                </thead>
                <tbody>
                  {predictions.slice(0, 20).map((pred) => (
                    <tr key={pred.studentId}>
                      <td className="font-medium text-[#1a1a2e]">{pred.name}</td>
                      <td className="text-[#64748b]">{pred.admissionNumber}</td>
                      <td>{getRiskBadge(pred.riskLevel)}</td>
                      <td className="font-semibold text-[#1a1a2e]">{pred.predictedScore}%</td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          {pred.factors?.slice(0, 2).map((f, i) => (
                            <span key={i} className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded">{f}</span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          {pred.recommendations?.slice(0, 1).map((r, i) => (
                            <span key={i} className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{r}</span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="empty-state py-8">
            <div className="empty-state-icon"><Brain className="w-8 h-8 text-[#94a3b8]" /></div>
            <p className="empty-state-title">No Analysis Yet</p>
            <p className="empty-state-desc">Click &quot;Analyze All Students&quot; to run AI-powered risk assessment</p>
          </div>
        )}
      </motion.div>

      <div className="dashboard-card">
        <h3 className="text-[#1a1a2e] font-semibold text-[16px] mb-4">AI Performance Heatmap</h3>
        {heatmapData.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center gap-4 mb-3">
              <span className="text-[11px] text-[#64748b]">Score Legend:</span>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-red-500" /><span className="text-[10px] text-[#64748b]">&lt;35 Weak</span></div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-orange-500" /><span className="text-[10px] text-[#64748b]">35-49</span></div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-amber-400" /><span className="text-[10px] text-[#64748b]">50-69</span></div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-emerald-500" /><span className="text-[10px] text-[#64748b]">70+ Strong</span></div>
            </div>
            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(heatmapData.length, 8)}, 1fr)` }}>
              {heatmapData.map((cell, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedHeatCell(cell)}
                  className={`${getHeatColor(cell.score)} ${getHeatTextColor(cell.score)} rounded-lg p-3 text-center transition-all hover:scale-105 hover:shadow-lg cursor-pointer`}
                >
                  <p className="text-[11px] font-semibold truncate">{cell.subject}</p>
                  <p className="text-[18px] font-bold">{cell.score}%</p>
                  <p className="text-[9px] opacity-80 truncate">{cell.topic}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="empty-state py-6">
            <p className="empty-state-desc">No heatmap data available</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedHeatCell && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="dashboard-card border-[var(--primary)]/30 bg-[var(--primary)]/5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[#1a1a2e] font-semibold text-[14px]">
                  Study Plan: {selectedHeatCell.subject} - {selectedHeatCell.topic}
                </h4>
                <button onClick={() => setSelectedHeatCell(null)} className="text-[#64748b] hover:text-[#1a1a2e]">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-white rounded-xl border border-[#e2e8f0]">
                  <p className="text-[12px] font-semibold text-[#1a1a2e] mb-1">Current Score</p>
                  <p className={`text-2xl font-bold ${selectedHeatCell.score >= 60 ? "text-emerald-600" : selectedHeatCell.score >= 40 ? "text-amber-600" : "text-red-600"}`}>
                    {selectedHeatCell.score}%
                  </p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#e2e8f0]">
                  <p className="text-[12px] font-semibold text-[#1a1a2e] mb-1">Target Score</p>
                  <p className="text-2xl font-bold text-[var(--primary)]">75%</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#e2e8f0]">
                  <p className="text-[12px] font-semibold text-[#1a1a2e] mb-1">Priority</p>
                  <p className={`text-2xl font-bold ${selectedHeatCell.score < 40 ? "text-red-600" : "text-amber-600"}`}>
                    {selectedHeatCell.score < 40 ? "Urgent" : "Moderate"}
                  </p>
                </div>
              </div>
              <div className="mt-3 p-3 bg-white rounded-xl border border-[#e2e8f0]">
                <p className="text-[12px] font-semibold text-[#1a1a2e] mb-2">Recommended Actions:</p>
                <ul className="space-y-1">
                  {selectedHeatCell.score < 50 && (
                    <li className="text-[11px] text-[#64748b] flex items-center gap-2">
                      <Zap className="w-3 h-3 text-amber-500" /> Schedule remedial classes for {selectedHeatCell.topic}
                    </li>
                  )}
                  <li className="text-[11px] text-[#64748b] flex items-center gap-2">
                    <BookOpen className="w-3 h-3 text-blue-500" /> Focus on {selectedHeatCell.topic} fundamentals
                  </li>
                  <li className="text-[11px] text-[#64748b] flex items-center gap-2">
                    <Target className="w-3 h-3 text-violet-500" /> Assign practice exercises and quizzes
                  </li>
                  {selectedHeatCell.score < 40 && (
                    <li className="text-[11px] text-[#64748b] flex items-center gap-2">
                      <Users className="w-3 h-3 text-red-500" /> Consider peer tutoring for this topic
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="dashboard-card">
        <h3 className="text-[#1a1a2e] font-semibold text-[16px] mb-4">AI Content Generator</h3>
        <div className="tabs mb-5">
          <button className={`tab ${activeTab === "questions" ? "active" : ""}`} onClick={() => setActiveTab("questions")}>
            <FileText className="w-3.5 h-3.5 inline mr-1" /> Exam Questions
          </button>
          <button className={`tab ${activeTab === "comments" ? "active" : ""}`} onClick={() => setActiveTab("comments")}>
            <GraduationCap className="w-3.5 h-3.5 inline mr-1" /> Report Comments
          </button>
          <button className={`tab ${activeTab === "lessonplans" ? "active" : ""}`} onClick={() => setActiveTab("lessonplans")}>
            <BookOpen className="w-3.5 h-3.5 inline mr-1" /> Lesson Plans
          </button>
        </div>

        {activeTab === "questions" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div>
                <label className="input-label">Subject</label>
                <select value={questionSubject} onChange={(e) => { setQuestionSubject(e.target.value); setQuestionTopic(topics[e.target.value]?.[0] || ""); }} className="select-field">
                  {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="input-label">Topic</label>
                <select value={questionTopic} onChange={(e) => setQuestionTopic(e.target.value)} className="select-field">
                  {(topics[questionSubject] || []).map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="input-label">Count</label>
                <select value={questionCount} onChange={(e) => setQuestionCount(Number(e.target.value))} className="select-field">
                  {[3, 5, 10, 15, 20].map((n) => <option key={n} value={n}>{n} Questions</option>)}
                </select>
              </div>
              <div>
                <label className="input-label">Difficulty</label>
                <select value={questionDifficulty} onChange={(e) => setQuestionDifficulty(e.target.value)} className="select-field">
                  {["Easy", "Medium", "Hard"].map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="input-label">Exam Type</label>
                <select value={questionExamType} onChange={(e) => setQuestionExamType(e.target.value)} className="select-field">
                  {["WAEC", "NECO", "JAMB", "School Exam"].map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <button onClick={handleGenerateQuestions} disabled={generatingQuestions} className="btn btn-primary">
              {generatingQuestions ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate Questions</>}
            </button>
            {generatedQuestions.length > 0 && (
              <div className="space-y-3 mt-4">
                <div className="flex items-center justify-between">
                  <p className="text-[13px] font-semibold text-[#1a1a2e]">{generatedQuestions.length} Questions Generated</p>
                  <button onClick={() => copyToClipboard(generatedQuestions.map((q, i) => `${i + 1}. ${q.question}\nA. ${q.options.A}\nB. ${q.options.B}\nC. ${q.options.C}\nD. ${q.options.D}\nAnswer: ${q.answer}\n`).join("\n"))} className="btn btn-ghost btn-sm">
                    <Copy className="w-3.5 h-3.5" /> Copy All
                  </button>
                </div>
                {generatedQuestions.map((q, i) => (
                  <div key={i} className="p-4 bg-[#f8fafc] rounded-xl border border-[#e2e8f0]">
                    <p className="text-[13px] font-medium text-[#1a1a2e] mb-2">
                      <span className="text-[var(--primary)] font-bold">Q{i + 1}.</span> {q.question}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 mb-2">
                      {(["A", "B", "C", "D"] as const).map((opt) => (
                        <span key={opt} className={`text-[12px] px-2 py-1 rounded-lg ${opt === q.answer ? "bg-emerald-100 text-emerald-700 font-semibold" : "bg-white text-[#475569] border border-[#e2e8f0]"}`}>
                          {opt}. {q.options[opt]}
                        </span>
                      ))}
                    </div>
                    {q.explanation && (
                      <p className="text-[11px] text-[#64748b] mt-2 bg-blue-50 p-2 rounded-lg">
                        <Lightbulb className="w-3 h-3 inline mr-1 text-blue-500" /> {q.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "comments" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="input-label">Student Name</label>
                <input type="text" value={commentStudent} onChange={(e) => setCommentStudent(e.target.value)} placeholder="e.g. Adebayo Olamide" className="input-field" />
              </div>
              <div>
                <label className="input-label">Attendance %</label>
                <input type="number" value={commentAttendance} onChange={(e) => setCommentAttendance(e.target.value)} className="input-field" min="0" max="100" />
              </div>
              <div>
                <label className="input-label">Subjects (Name: Score Grade, ...)</label>
                <input type="text" value={commentSubjects} onChange={(e) => setCommentSubjects(e.target.value)} placeholder="Mathematics: 75 A, English: 68 B" className="input-field" />
              </div>
              <div>
                <label className="input-label">Behavior</label>
                <select value={commentBehavior} onChange={(e) => setCommentBehavior(e.target.value)} className="select-field">
                  {["Excellent", "Good", "Satisfactory", "Needs Improvement"].map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>
            <button onClick={handleGenerateComment} disabled={generatingComment} className="btn btn-primary">
              {generatingComment ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate Comment</>}
            </button>
            {generatedComment && (
              <div className="p-4 bg-[#f8fafc] rounded-xl border border-[#e2e8f0]">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[13px] font-semibold text-[#1a1a2e]">Generated Report Card Comment</p>
                  <button onClick={() => copyToClipboard(generatedComment)} className="btn btn-ghost btn-sm">
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </button>
                </div>
                <p className="text-[13px] text-[#475569] leading-relaxed whitespace-pre-wrap">{generatedComment}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "lessonplans" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="input-label">Subject</label>
                <select value={lessonSubject} onChange={(e) => setLessonSubject(e.target.value)} className="select-field">
                  {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="input-label">Topic</label>
                <select value={lessonTopic} onChange={(e) => setLessonTopic(e.target.value)} className="select-field">
                  {(topics[lessonSubject] || []).map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="input-label">Class Level</label>
                <select value={lessonClass} onChange={(e) => setLessonClass(e.target.value)} className="select-field">
                  {["JSS1", "JSS2", "JSS3", "SS1", "SS2", "SS3"].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="input-label">Duration</label>
                <select value={lessonDuration} onChange={(e) => setLessonDuration(e.target.value)} className="select-field">
                  {["30 minutes", "45 minutes", "60 minutes", "90 minutes"].map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <button onClick={handleGenerateLesson} disabled={generatingLesson} className="btn btn-primary">
              {generatingLesson ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate Lesson Plan</>}
            </button>
            {generatedLesson && (
              <div className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <p className="text-[13px] font-semibold text-[#1a1a2e]">Generated Lesson Plan</p>
                  <button onClick={() => {
                    const text = `LESSON PLAN\nSubject: ${lessonSubject}\nTopic: ${lessonTopic}\nClass: ${lessonClass}\nDuration: ${lessonDuration}\n\nOBJECTIVES:\n${generatedLesson.objectives.map((o) => `- ${o}`).join("\n")}\n\nMATERIALS:\n${generatedLesson.materials.map((m) => `- ${m}`).join("\n")}\n\nINTRODUCTION:\n${generatedLesson.introduction}\n\nMAIN CONTENT:\n${generatedLesson.mainContent.map((s, i) => `${i + 1}. ${s.step} (${s.time})\n   Activity: ${s.activity}`).join("\n\n")}\n\nEVALUATION:\n${generatedLesson.evaluation}\n\nASSIGNMENT:\n${generatedLesson.assignment}`;
                    copyToClipboard(text);
                  }} className="btn btn-ghost btn-sm">
                    <Copy className="w-3.5 h-3.5" /> Copy All
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-[#f0fdf4] rounded-xl border border-emerald-200">
                    <h4 className="text-[13px] font-semibold text-[#1a1a2e] mb-2 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-emerald-600" /> Learning Objectives
                    </h4>
                    <ul className="space-y-1">
                      {generatedLesson.objectives.map((obj, i) => (
                        <li key={i} className="text-[12px] text-[#475569] flex items-start gap-1.5">
                          <CheckCircle className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" /> {obj}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <h4 className="text-[13px] font-semibold text-[#1a1a2e] mb-2 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-blue-600" /> Materials Needed
                    </h4>
                    <ul className="space-y-1">
                      {generatedLesson.materials.map((mat, i) => (
                        <li key={i} className="text-[12px] text-[#475569] flex items-start gap-1.5">
                          <span className="text-blue-500">&#x2022;</span> {mat}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="p-4 bg-[#f8fafc] rounded-xl border border-[#e2e8f0]">
                  <h4 className="text-[13px] font-semibold text-[#1a1a2e] mb-2">Introduction</h4>
                  <p className="text-[12px] text-[#475569] leading-relaxed">{generatedLesson.introduction}</p>
                </div>
                <div className="p-4 bg-[#f8fafc] rounded-xl border border-[#e2e8f0]">
                  <h4 className="text-[13px] font-semibold text-[#1a1a2e] mb-3">Lesson Steps</h4>
                  <div className="space-y-3">
                    {generatedLesson.mainContent.map((step, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="w-7 h-7 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0">
                          {i + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-[12px] font-semibold text-[#1a1a2e]">{step.step}</p>
                            <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">{step.time}</span>
                          </div>
                          <p className="text-[11px] text-[#64748b]">{step.activity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <h4 className="text-[13px] font-semibold text-[#1a1a2e] mb-2">Evaluation</h4>
                    <p className="text-[12px] text-[#475569]">{generatedLesson.evaluation}</p>
                  </div>
                  <div className="p-4 bg-violet-50 rounded-xl border border-violet-200">
                    <h4 className="text-[13px] font-semibold text-[#1a1a2e] mb-2">Assignment</h4>
                    <p className="text-[12px] text-[#475569]">{generatedLesson.assignment}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-[380px] h-[500px] bg-white rounded-2xl shadow-2xl border border-[#e2e8f0] flex flex-col z-50 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-[var(--primary)] to-blue-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-white text-[13px] font-semibold">AI School Assistant</p>
                  <p className="text-white/70 text-[10px]">Ask about fees, schedules, policies</p>
                </div>
              </div>
              <button onClick={() => setChatOpen(false)} className="text-white/70 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.length === 0 && (
                <div className="text-center py-8">
                  <Brain className="w-10 h-10 text-[#cbd5e1] mx-auto mb-3" />
                  <p className="text-[13px] text-[#64748b] font-medium">How can I help you today?</p>
                  <div className="mt-3 space-y-2">
                    {["When are school fees due?", "What are the school hours?", "What subjects are offered?"].map((q) => (
                      <button key={q} onClick={() => { setChatInput(q); }} className="block w-full text-left text-[11px] text-[var(--primary)] bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition">
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] px-3 py-2 rounded-xl text-[12px] leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[var(--primary)] text-white rounded-br-sm"
                      : "bg-[#f1f5f9] text-[#1a1a2e] rounded-bl-sm"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#f1f5f9] px-4 py-2.5 rounded-xl rounded-bl-sm">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-[#94a3b8] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-1.5 h-1.5 bg-[#94a3b8] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-1.5 h-1.5 bg-[#94a3b8] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-3 border-t border-[#e2e8f0]">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleChat()}
                  placeholder="Ask a question..."
                  className="flex-1 px-3 py-2 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-[13px] text-[#1a1a2e] focus:outline-none focus:border-[var(--primary)]"
                  disabled={chatLoading}
                />
                <button
                  onClick={handleChat}
                  disabled={!chatInput.trim() || chatLoading}
                  className="w-9 h-9 rounded-xl bg-[var(--primary)] text-white flex items-center justify-center disabled:opacity-50 hover:bg-blue-700 transition flex-shrink-0"
                >
                  {chatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-[var(--primary)] to-blue-600 text-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition z-50"
      >
        {chatOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>
    </div>
  );
}
