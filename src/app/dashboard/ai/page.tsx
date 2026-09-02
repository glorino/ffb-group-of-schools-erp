"use client";

import { useEffect, useState, useRef, useCallback } from "react";
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

const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 16px', borderRadius: '12px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', color: '#1a1a2e', fontSize: '13px', outline: 'none' };
const labelStyle: React.CSSProperties = { color: '#475569', fontSize: '13px', marginBottom: '6px', display: 'block' };

const btnStyle = (bg: string, disabled?: boolean): React.CSSProperties => ({
  padding: '8px 16px',
  borderRadius: '12px',
  backgroundColor: bg,
  color: '#ffffff',
  fontSize: '13px',
  fontWeight: 500,
  border: 'none',
  cursor: disabled ? 'not-allowed' : 'pointer',
  opacity: disabled ? 0.5 : 1,
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
});

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

  const [predPage, setPredPage] = useState(1);
  const PAGE_SIZE = 20;

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
    if (score >= 70) return "#10b981";
    if (score >= 50) return "#fbbf24";
    if (score >= 35) return "#f97316";
    return "#ef4444";
  };

  const getRiskBadgeStyle = (level: string): React.CSSProperties => {
    const base: React.CSSProperties = { padding: '2px 8px', borderRadius: '9999px', fontSize: '10px', fontWeight: 600 };
    if (level === "high") return { ...base, backgroundColor: '#fee2e2', color: '#dc2626' };
    if (level === "medium") return { ...base, backgroundColor: '#fef3c7', color: '#d97706' };
    return { ...base, backgroundColor: '#d1fae5', color: '#059669' };
  };

  const statCards = [
    { label: "Students at Risk", value: stats.atRisk, icon: AlertTriangle, gradient: "linear-gradient(135deg, #ef4444, #e11d48)" },
    { label: "AI Reports Generated", value: stats.reports, icon: FileText, gradient: "linear-gradient(135deg, #3b82f6, #4f46e5)" },
    { label: "Predictions Made", value: stats.predictionsMade, icon: Target, gradient: "linear-gradient(135deg, #8b5cf6, #9333ea)" },
    { label: "Content Generated", value: stats.contentGenerated, icon: Sparkles, gradient: "linear-gradient(135deg, #10b981, #0d9488)" },
  ];

  const totalPredPages = Math.max(1, Math.ceil(predictions.length / PAGE_SIZE));
  const pagedPredictions = predictions.slice((predPage - 1) * PAGE_SIZE, predPage * PAGE_SIZE);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <Loader2 style={{ width: '32px', height: '32px', color: '#0055ff', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: '#64748b', fontSize: '13px' }}>Loading AI Intelligence Hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Gradient Header */}
      <div style={{ background: 'linear-gradient(135deg, #0a2a6e, #0055ff)', borderRadius: '16px', padding: '32px', margin: '32px 16px 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-50%', right: '-20%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '-30%', left: '-10%', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)' }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ color: '#ffffff', fontSize: '24px', fontWeight: 700, marginBottom: '4px' }}>AI Intelligence Hub</h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>OpenAI-powered student analysis, predictions, and content generation</p>
          </div>
          <button onClick={fetchInsights} style={btnStyle('#ffffff')}>
            <RefreshCw style={{ width: '16px', height: '16px' }} /> Refresh
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', padding: '0 16px' }}>
        {statCards.map((stat, i) => (
          <div key={i} style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}>{stat.label}</p>
              <p style={{ fontSize: '30px', fontWeight: 700, color: '#1a1a2e' }}>{stat.value}</p>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: stat.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <stat.icon style={{ width: '24px', height: '24px', color: '#ffffff' }} />
            </div>
          </div>
        ))}
      </div>

      {/* AI Student Analysis */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', margin: '0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ color: '#1a1a2e', fontWeight: 600, fontSize: '16px' }}>AI Student Analysis</h3>
          <button onClick={handleAnalyze} disabled={analyzing} style={btnStyle('#0055ff', analyzing)}>
            {analyzing ? (
              <><Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> Analyzing...</>
            ) : (
              <><Brain style={{ width: '16px', height: '16px' }} /> Analyze All Students</>
            )}
          </button>
        </div>

        {predictions.length > 0 ? (
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                    <th style={{ textAlign: 'left', padding: '12px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em', color: '#64748b' }}>Student</th>
                    <th style={{ textAlign: 'left', padding: '12px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em', color: '#64748b' }}>Admission #</th>
                    <th style={{ textAlign: 'left', padding: '12px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em', color: '#64748b' }}>Risk Level</th>
                    <th style={{ textAlign: 'left', padding: '12px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em', color: '#64748b' }}>Predicted Score</th>
                    <th style={{ textAlign: 'left', padding: '12px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em', color: '#64748b' }}>Risk Factors</th>
                    <th style={{ textAlign: 'left', padding: '12px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em', color: '#64748b' }}>Recommendations</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedPredictions.map((pred) => (
                    <tr key={pred.studentId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', fontSize: '13px', color: '#1a1a2e', fontWeight: 500 }}>{pred.name}</td>
                      <td style={{ padding: '12px', fontSize: '13px', color: '#64748b' }}>{pred.admissionNumber}</td>
                      <td style={{ padding: '12px' }}><span style={getRiskBadgeStyle(pred.riskLevel)}>{pred.riskLevel === "high" ? "High Risk" : pred.riskLevel === "medium" ? "Medium" : "Low Risk"}</span></td>
                      <td style={{ padding: '12px', fontSize: '13px', color: '#1a1a2e', fontWeight: 600 }}>{pred.predictedScore}%</td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {pred.factors?.slice(0, 2).map((f, i) => (
                            <span key={i} style={{ fontSize: '10px', backgroundColor: '#fef2f2', color: '#dc2626', padding: '2px 6px', borderRadius: '4px' }}>{f}</span>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {pred.recommendations?.slice(0, 1).map((r, i) => (
                            <span key={i} style={{ fontSize: '10px', backgroundColor: '#eff6ff', color: '#2563eb', padding: '2px 6px', borderRadius: '4px' }}>{r}</span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {predictions.length > PAGE_SIZE && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                <p style={{ fontSize: '12px', color: '#64748b' }}>Showing {((predPage - 1) * PAGE_SIZE) + 1}–{Math.min(predPage * PAGE_SIZE, predictions.length)} of {predictions.length}</p>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => setPredPage((p) => Math.max(1, p - 1))}
                    disabled={predPage === 1}
                    style={btnStyle('#e2e8f0', predPage === 1)}
                  >
                    <span style={{ color: '#334155' }}>Prev</span>
                  </button>
                  {Array.from({ length: Math.min(totalPredPages, 5) }, (_, i) => {
                    let pageNum: number;
                    if (totalPredPages <= 5) {
                      pageNum = i + 1;
                    } else if (predPage <= 3) {
                      pageNum = i + 1;
                    } else if (predPage >= totalPredPages - 2) {
                      pageNum = totalPredPages - 4 + i;
                    } else {
                      pageNum = predPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPredPage(pageNum)}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          border: 'none',
                          backgroundColor: pageNum === predPage ? '#0055ff' : '#f1f5f9',
                          color: pageNum === predPage ? '#ffffff' : '#64748b',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPredPage((p) => Math.min(totalPredPages, p + 1))}
                    disabled={predPage === totalPredPages}
                    style={btnStyle('#e2e8f0', predPage === totalPredPages)}
                  >
                    <span style={{ color: '#334155' }}>Next</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}><Brain style={{ width: '32px', height: '32px', color: '#94a3b8' }} /></div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a2e', marginBottom: '4px' }}>No Analysis Yet</p>
            <p style={{ fontSize: '13px', color: '#64748b' }}>Click &quot;Analyze All Students&quot; to run AI-powered risk assessment</p>
          </div>
        )}
      </div>

      {/* AI Performance Heatmap */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', margin: '0 16px' }}>
        <h3 style={{ color: '#1a1a2e', fontWeight: 600, fontSize: '16px', marginBottom: '16px' }}>AI Performance Heatmap</h3>
        {heatmapData.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', color: '#64748b' }}>Score Legend:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#ef4444' }} /><span style={{ fontSize: '10px', color: '#64748b' }}>&lt;35 Weak</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#f97316' }} /><span style={{ fontSize: '10px', color: '#64748b' }}>35-49</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#fbbf24' }} /><span style={{ fontSize: '10px', color: '#64748b' }}>50-69</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#10b981' }} /><span style={{ fontSize: '10px', color: '#64748b' }}>70+ Strong</span></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(heatmapData.length, 8)}, 1fr)`, gap: '8px' }}>
              {heatmapData.map((cell, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedHeatCell(cell)}
                  style={{
                    backgroundColor: getHeatColor(cell.score),
                    color: '#ffffff',
                    borderRadius: '10px',
                    padding: '12px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    border: 'none',
                    transition: 'transform 0.15s, box-shadow 0.15s',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'; }}
                >
                  <p style={{ fontSize: '11px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{cell.subject}</p>
                  <p style={{ fontSize: '18px', fontWeight: 700 }}>{cell.score}%</p>
                  <p style={{ fontSize: '9px', opacity: 0.8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{cell.topic}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <p style={{ fontSize: '13px', color: '#64748b' }}>No heatmap data available</p>
          </div>
        )}
      </div>

      {/* Study Plan Detail */}
      {selectedHeatCell && (
        <div style={{ backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', margin: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h4 style={{ color: '#1a1a2e', fontWeight: 600, fontSize: '14px' }}>
              Study Plan: {selectedHeatCell.subject} - {selectedHeatCell.topic}
            </h4>
            <button onClick={() => setSelectedHeatCell(null)} style={{ color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}>
              <X style={{ width: '16px', height: '16px' }} />
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div style={{ padding: '12px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <p style={{ fontSize: '12px', fontWeight: 600, color: '#1a1a2e', marginBottom: '4px' }}>Current Score</p>
              <p style={{ fontSize: '24px', fontWeight: 700, color: selectedHeatCell.score >= 60 ? '#059669' : selectedHeatCell.score >= 40 ? '#d97706' : '#dc2626' }}>
                {selectedHeatCell.score}%
              </p>
            </div>
            <div style={{ padding: '12px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <p style={{ fontSize: '12px', fontWeight: 600, color: '#1a1a2e', marginBottom: '4px' }}>Target Score</p>
              <p style={{ fontSize: '24px', fontWeight: 700, color: '#0055ff' }}>75%</p>
            </div>
            <div style={{ padding: '12px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <p style={{ fontSize: '12px', fontWeight: 600, color: '#1a1a2e', marginBottom: '4px' }}>Priority</p>
              <p style={{ fontSize: '24px', fontWeight: 700, color: selectedHeatCell.score < 40 ? '#dc2626' : '#d97706' }}>
                {selectedHeatCell.score < 40 ? "Urgent" : "Moderate"}
              </p>
            </div>
          </div>
          <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <p style={{ fontSize: '12px', fontWeight: 600, color: '#1a1a2e', marginBottom: '8px' }}>Recommended Actions:</p>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {selectedHeatCell.score < 50 && (
                <li style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap style={{ width: '12px', height: '12px', color: '#f59e0b' }} /> Schedule remedial classes for {selectedHeatCell.topic}
                </li>
              )}
              <li style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen style={{ width: '12px', height: '12px', color: '#3b82f6' }} /> Focus on {selectedHeatCell.topic} fundamentals
              </li>
              <li style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Target style={{ width: '12px', height: '12px', color: '#8b5cf6' }} /> Assign practice exercises and quizzes
              </li>
              {selectedHeatCell.score < 40 && (
                <li style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users style={{ width: '12px', height: '12px', color: '#ef4444' }} /> Consider peer tutoring for this topic
                </li>
              )}
            </ul>
          </div>
        </div>
      )}

      {/* AI Content Generator */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', margin: '0 16px' }}>
        <h3 style={{ color: '#1a1a2e', fontWeight: 600, fontSize: '16px', marginBottom: '20px' }}>AI Content Generator</h3>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', backgroundColor: '#f1f5f9', borderRadius: '12px', padding: '4px' }}>
          {([
            { key: "questions" as const, label: "Exam Questions", icon: FileText },
            { key: "comments" as const, label: "Report Comments", icon: GraduationCap },
            { key: "lessonplans" as const, label: "Lesson Plans", icon: BookOpen },
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: activeTab === tab.key ? '#ffffff' : 'transparent',
                color: activeTab === tab.key ? '#0055ff' : '#64748b',
                boxShadow: activeTab === tab.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <tab.icon style={{ width: '14px', height: '14px' }} /> {tab.label}
            </button>
          ))}
        </div>

        {/* Questions Tab */}
        {activeTab === "questions" && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Subject</label>
                <select value={questionSubject} onChange={(e) => { setQuestionSubject(e.target.value); setQuestionTopic(topics[e.target.value]?.[0] || ""); }} style={inputStyle}>
                  {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Topic</label>
                <select value={questionTopic} onChange={(e) => setQuestionTopic(e.target.value)} style={inputStyle}>
                  {(topics[questionSubject] || []).map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Count</label>
                <select value={questionCount} onChange={(e) => setQuestionCount(Number(e.target.value))} style={inputStyle}>
                  {[3, 5, 10, 15, 20].map((n) => <option key={n} value={n}>{n} Questions</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Difficulty</label>
                <select value={questionDifficulty} onChange={(e) => setQuestionDifficulty(e.target.value)} style={inputStyle}>
                  {["Easy", "Medium", "Hard"].map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Exam Type</label>
                <select value={questionExamType} onChange={(e) => setQuestionExamType(e.target.value)} style={inputStyle}>
                  {["WAEC", "NECO", "JAMB", "School Exam"].map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <button onClick={handleGenerateQuestions} disabled={generatingQuestions} style={btnStyle('#0055ff', generatingQuestions)}>
              {generatingQuestions ? <><Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> Generating...</> : <><Sparkles style={{ width: '16px', height: '16px' }} /> Generate Questions</>}
            </button>
            {generatedQuestions.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a2e' }}>{generatedQuestions.length} Questions Generated</p>
                  <button onClick={() => copyToClipboard(generatedQuestions.map((q, i) => `${i + 1}. ${q.question}\nA. ${q.options.A}\nB. ${q.options.B}\nC. ${q.options.C}\nD. ${q.options.D}\nAnswer: ${q.answer}\n`).join("\n"))} style={{ ...btnStyle('transparent'), color: '#64748b', fontSize: '12px', padding: '6px 12px' }}>
                    <Copy style={{ width: '14px', height: '14px' }} /> Copy All
                  </button>
                </div>
                {generatedQuestions.map((q, i) => (
                  <div key={i} style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <p style={{ fontSize: '13px', fontWeight: 500, color: '#1a1a2e', marginBottom: '8px' }}>
                      <span style={{ color: '#0055ff', fontWeight: 700 }}>Q{i + 1}.</span> {q.question}
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', marginBottom: '8px' }}>
                      {(["A", "B", "C", "D"] as const).map((opt) => (
                        <span key={opt} style={{
                          fontSize: '12px',
                          padding: '6px 8px',
                          borderRadius: '8px',
                          backgroundColor: opt === q.answer ? '#d1fae5' : '#ffffff',
                          color: opt === q.answer ? '#059669' : '#475569',
                          border: opt === q.answer ? 'none' : '1px solid #e2e8f0',
                          fontWeight: opt === q.answer ? 600 : 400,
                        }}>
                          {opt}. {q.options[opt]}
                        </span>
                      ))}
                    </div>
                    {q.explanation && (
                      <p style={{ fontSize: '11px', color: '#64748b', marginTop: '8px', backgroundColor: '#eff6ff', padding: '8px', borderRadius: '8px' }}>
                        <Lightbulb style={{ width: '12px', height: '12px', color: '#3b82f6', display: 'inline', marginRight: '4px' }} /> {q.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Comments Tab */}
        {activeTab === "comments" && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Student Name</label>
                <input type="text" value={commentStudent} onChange={(e) => setCommentStudent(e.target.value)} placeholder="e.g. Adebayo Olamide" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Attendance %</label>
                <input type="number" value={commentAttendance} onChange={(e) => setCommentAttendance(e.target.value)} style={inputStyle} min="0" max="100" />
              </div>
              <div>
                <label style={labelStyle}>Subjects (Name: Score Grade, ...)</label>
                <input type="text" value={commentSubjects} onChange={(e) => setCommentSubjects(e.target.value)} placeholder="Mathematics: 75 A, English: 68 B" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Behavior</label>
                <select value={commentBehavior} onChange={(e) => setCommentBehavior(e.target.value)} style={inputStyle}>
                  {["Excellent", "Good", "Satisfactory", "Needs Improvement"].map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>
            <button onClick={handleGenerateComment} disabled={generatingComment} style={btnStyle('#0055ff', generatingComment)}>
              {generatingComment ? <><Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> Generating...</> : <><Sparkles style={{ width: '16px', height: '16px' }} /> Generate Comment</>}
            </button>
            {generatedComment && (
              <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a2e' }}>Generated Report Card Comment</p>
                  <button onClick={() => copyToClipboard(generatedComment)} style={{ ...btnStyle('transparent'), color: '#64748b', fontSize: '12px', padding: '6px 12px' }}>
                    <Copy style={{ width: '14px', height: '14px' }} /> Copy
                  </button>
                </div>
                <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{generatedComment}</p>
              </div>
            )}
          </div>
        )}

        {/* Lesson Plans Tab */}
        {activeTab === "lessonplans" && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Subject</label>
                <select value={lessonSubject} onChange={(e) => setLessonSubject(e.target.value)} style={inputStyle}>
                  {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Topic</label>
                <select value={lessonTopic} onChange={(e) => setLessonTopic(e.target.value)} style={inputStyle}>
                  {(topics[lessonSubject] || []).map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Class Level</label>
                <select value={lessonClass} onChange={(e) => setLessonClass(e.target.value)} style={inputStyle}>
                  {["JSS1", "JSS2", "JSS3", "SS1", "SS2", "SS3"].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Duration</label>
                <select value={lessonDuration} onChange={(e) => setLessonDuration(e.target.value)} style={inputStyle}>
                  {["30 minutes", "45 minutes", "60 minutes", "90 minutes"].map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <button onClick={handleGenerateLesson} disabled={generatingLesson} style={btnStyle('#0055ff', generatingLesson)}>
              {generatingLesson ? <><Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> Generating...</> : <><Sparkles style={{ width: '16px', height: '16px' }} /> Generate Lesson Plan</>}
            </button>
            {generatedLesson && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a2e' }}>Generated Lesson Plan</p>
                  <button onClick={() => {
                    const text = `LESSON PLAN\nSubject: ${lessonSubject}\nTopic: ${lessonTopic}\nClass: ${lessonClass}\nDuration: ${lessonDuration}\n\nOBJECTIVES:\n${generatedLesson.objectives.map((o) => `- ${o}`).join("\n")}\n\nMATERIALS:\n${generatedLesson.materials.map((m) => `- ${m}`).join("\n")}\n\nINTRODUCTION:\n${generatedLesson.introduction}\n\nMAIN CONTENT:\n${generatedLesson.mainContent.map((s, i) => `${i + 1}. ${s.step} (${s.time})\n   Activity: ${s.activity}`).join("\n\n")}\n\nEVALUATION:\n${generatedLesson.evaluation}\n\nASSIGNMENT:\n${generatedLesson.assignment}`;
                    copyToClipboard(text);
                  }} style={{ ...btnStyle('transparent'), color: '#64748b', fontSize: '12px', padding: '6px 12px' }}>
                    <Copy style={{ width: '14px', height: '14px' }} /> Copy All
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  <div style={{ padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a2e', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Target style={{ width: '14px', height: '14px', color: '#059669' }} /> Learning Objectives
                    </h4>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {generatedLesson.objectives.map((obj, i) => (
                        <li key={i} style={{ fontSize: '12px', color: '#475569', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                          <CheckCircle style={{ width: '12px', height: '12px', color: '#10b981', marginTop: '2px', flexShrink: 0 }} /> {obj}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div style={{ padding: '16px', backgroundColor: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a2e', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <BookOpen style={{ width: '14px', height: '14px', color: '#2563eb' }} /> Materials Needed
                    </h4>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {generatedLesson.materials.map((mat, i) => (
                        <li key={i} style={{ fontSize: '12px', color: '#475569', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                          <span style={{ color: '#3b82f6' }}>&#x2022;</span> {mat}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a2e', marginBottom: '8px' }}>Introduction</h4>
                  <p style={{ fontSize: '12px', color: '#475569', lineHeight: 1.6 }}>{generatedLesson.introduction}</p>
                </div>
                <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a2e', marginBottom: '12px' }}>Lesson Steps</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {generatedLesson.mainContent.map((step, i) => (
                      <div key={i} style={{ display: 'flex', gap: '12px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#0055ff', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>
                          {i + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <p style={{ fontSize: '12px', fontWeight: 600, color: '#1a1a2e' }}>{step.step}</p>
                            <span style={{ fontSize: '10px', backgroundColor: '#dbeafe', color: '#2563eb', padding: '2px 6px', borderRadius: '4px' }}>{step.time}</span>
                          </div>
                          <p style={{ fontSize: '11px', color: '#64748b' }}>{step.activity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  <div style={{ padding: '16px', backgroundColor: '#fffbeb', borderRadius: '12px', border: '1px solid #fde68a' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a2e', marginBottom: '8px' }}>Evaluation</h4>
                    <p style={{ fontSize: '12px', color: '#475569' }}>{generatedLesson.evaluation}</p>
                  </div>
                  <div style={{ padding: '16px', backgroundColor: '#f5f3ff', borderRadius: '12px', border: '1px solid #ddd6fe' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a2e', marginBottom: '8px' }}>Assignment</h4>
                    <p style={{ fontSize: '12px', color: '#475569' }}>{generatedLesson.assignment}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating AI Chat Widget */}
      {chatOpen && (
        <div style={{ position: 'fixed', bottom: '96px', right: '24px', width: '380px', height: '500px', backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', zIndex: 50, overflow: 'hidden' }}>
          {/* Chat Header */}
          <div style={{ background: 'linear-gradient(135deg, #0055ff, #2563eb)', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Brain style={{ width: '16px', height: '16px', color: '#ffffff' }} />
              </div>
              <div>
                <p style={{ color: '#ffffff', fontSize: '13px', fontWeight: 600 }}>AI School Assistant</p>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '10px' }}>Ask about fees, schedules, policies</p>
              </div>
            </div>
            <button onClick={() => setChatOpen(false)} style={{ color: 'rgba(255,255,255,0.7)', background: 'none', border: 'none', cursor: 'pointer' }}>
              <X style={{ width: '20px', height: '20px' }} />
            </button>
          </div>

          {/* Chat Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {chatMessages.length === 0 && (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <Brain style={{ width: '40px', height: '40px', color: '#cbd5e1', margin: '0 auto 12px' }} />
                <p style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>How can I help you today?</p>
                <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {["When are school fees due?", "What are the school hours?", "What subjects are offered?"].map((q) => (
                    <button key={q} onClick={() => { setChatInput(q); }} style={{ display: 'block', width: '100%', textAlign: 'left', fontSize: '11px', color: '#0055ff', backgroundColor: '#eff6ff', padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {chatMessages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: '85%',
                  padding: '8px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  lineHeight: 1.6,
                  backgroundColor: msg.role === "user" ? '#0055ff' : '#f1f5f9',
                  color: msg.role === "user" ? '#ffffff' : '#1a1a2e',
                  borderBottomRightRadius: msg.role === "user" ? '4px' : '12px',
                  borderBottomLeftRadius: msg.role === "user" ? '12px' : '4px',
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ backgroundColor: '#f1f5f9', padding: '10px 16px', borderRadius: '12px', borderBottomLeftRadius: '4px' }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <div style={{ width: '6px', height: '6px', backgroundColor: '#94a3b8', borderRadius: '50%', animation: 'bounce 1s infinite', animationDelay: '0ms' }} />
                    <div style={{ width: '6px', height: '6px', backgroundColor: '#94a3b8', borderRadius: '50%', animation: 'bounce 1s infinite', animationDelay: '150ms' }} />
                    <div style={{ width: '6px', height: '6px', backgroundColor: '#94a3b8', borderRadius: '50%', animation: 'bounce 1s infinite', animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <div style={{ padding: '12px', borderTop: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleChat()}
                placeholder="Ask a question..."
                style={{ flex: 1, padding: '8px 12px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '13px', color: '#1a1a2e', outline: 'none' }}
                disabled={chatLoading}
              />
              <button
                onClick={handleChat}
                disabled={!chatInput.trim() || chatLoading}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '12px',
                  backgroundColor: '#0055ff',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  cursor: (!chatInput.trim() || chatLoading) ? 'not-allowed' : 'pointer',
                  opacity: (!chatInput.trim() || chatLoading) ? 0.5 : 1,
                  flexShrink: 0,
                }}
              >
                {chatLoading ? <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> : <Send style={{ width: '16px', height: '16px' }} />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Chat Button */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '56px',
          height: '56px',
          background: 'linear-gradient(135deg, #0055ff, #2563eb)',
          color: '#ffffff',
          borderRadius: '50%',
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          cursor: 'pointer',
          zIndex: 50,
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.1)'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
      >
        {chatOpen ? <X style={{ width: '24px', height: '24px' }} /> : <MessageSquare style={{ width: '24px', height: '24px' }} />}
      </button>
    </div>
  );
}
