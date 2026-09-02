"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { Clock, ChevronLeft, ChevronRight, CheckCircle, XCircle, AlertTriangle, Send, RotateCcw } from "lucide-react";

interface ExamData {
  id: string;
  applicant: { firstName: string; lastName: string; applicationNumber: string; classAppliedFor: string };
  examDate: string;
  startTime: string;
  endTime: string;
  durationMins: number;
  subjects: string[];
  totalQuestions: number;
  status: string;
  score?: number;
  passed?: boolean;
  isExamDay: boolean;
  questions?: { index: number; subject: string; question: string; options: string[] }[];
}

export default function EntranceExamPage() {
  const params = useParams();
  const token = params.token as string;
  const [exam, setExam] = useState<ExamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [started, setStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [submitted, setSubmitted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<string>("");

  useEffect(() => {
    if (!token) return;
    fetch(`/api/admissions/entrance-exam?token=${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setError(d.error); }
        else {
          setExam(d);
          if (d.status === "completed") {
            setSubmitted(true);
            setResult({ score: d.score, totalQuestions: d.totalQuestions, passed: d.passed, percentage: Math.round((d.score / d.totalQuestions) * 100) });
          }
        }
      })
      .catch(() => setError("Failed to load exam"))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (started && timeLeft > 0 && !submitted) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [started, submitted]);

  const startExam = () => {
    setStarted(true);
    startTimeRef.current = new Date().toISOString();
    setTimeLeft((exam?.durationMins || 60) * 60);
  };

  const selectAnswer = (qIndex: number, optionIndex: number) => {
    setAnswers(prev => ({ ...prev, [qIndex]: optionIndex }));
  };

  const handleSubmit = useCallback(async () => {
    if (submitting || submitted) return;
    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      const res = await fetch("/api/admissions/entrance-exam/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, answers, startedAt: startTimeRef.current }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data);
        setSubmitted(true);
      } else {
        setError(data.error || "Failed to submit");
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setSubmitting(false);
  }, [token, answers, submitting, submitted]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? `${h}:` : ""}${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const answeredCount = Object.keys(answers).length;
  const questions = exam?.questions || [];

  const headerStyle: React.CSSProperties = { background: "linear-gradient(135deg, #0a2a6e, #0055ff)", borderRadius: 16, padding: 32, marginBottom: 32, color: "#fff", position: "relative", overflow: "hidden" };
  const cardStyle: React.CSSProperties = { background: "#fff", borderRadius: 16, padding: 32, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0" };
  const btnPrimary: React.CSSProperties = { background: "linear-gradient(135deg, #0055ff, #0033cc)", color: "#fff", border: "none", padding: "14px 28px", borderRadius: 10, fontWeight: 600, cursor: "pointer", fontSize: 14, display: "inline-flex", alignItems: "center", gap: 8 };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f4f6f9" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 48, height: 48, border: "4px solid #e5e7eb", borderTopColor: "#0055ff", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
        <p style={{ color: "#64748b", fontSize: 14 }}>Loading exam...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f4f6f9", padding: 20 }}>
      <div style={{ ...cardStyle, maxWidth: 500, textAlign: "center" }}>
        <AlertTriangle style={{ width: 48, height: 48, color: "#f59e0b", margin: "0 auto 16px" }} />
        <h2 style={{ margin: "0 0 8px", fontSize: 20, color: "#0f172a" }}>Error</h2>
        <p style={{ margin: 0, color: "#64748b", fontSize: 14 }}>{error}</p>
      </div>
    </div>
  );

  if (!exam) return null;

  // Result screen
  if (submitted && result) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f4f6f9", padding: 20 }}>
        <div style={{ ...cardStyle, maxWidth: 500, textAlign: "center" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: result.passed ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            {result.passed ? <CheckCircle style={{ width: 40, height: 40, color: "#10b981" }} /> : <XCircle style={{ width: 40, height: 40, color: "#ef4444" }} />}
          </div>
          <h1 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 800, color: "#0f172a" }}>Examination Complete</h1>
          <p style={{ margin: "0 0 24px", color: "#64748b", fontSize: 14 }}>{exam.applicant.firstName}, your results are ready</p>
          <div style={{ background: result.passed ? "rgba(16,185,129,0.05)" : "rgba(239,68,68,0.05)", borderRadius: 12, padding: 24, marginBottom: 24, border: `1px solid ${result.passed ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}` }}>
            <p style={{ margin: 0, fontSize: 48, fontWeight: 800, color: result.passed ? "#10b981" : "#ef4444" }}>{result.percentage}%</p>
            <p style={{ margin: "8px 0 0", fontSize: 14, color: "#64748b" }}>{result.correctCount} out of {result.totalQuestions} correct</p>
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <div style={{ padding: "8px 16px", borderRadius: 8, background: "#f8fafc", fontSize: 13, color: "#475569" }}>
              <strong>Status:</strong> {result.passed ? "PASSED" : "NOT PASSED"}
            </div>
            <div style={{ padding: "8px 16px", borderRadius: 8, background: "#f8fafc", fontSize: 13, color: "#475569" }}>
              <strong>Class:</strong> {exam.applicant.classAppliedFor}
            </div>
          </div>
          <p style={{ margin: "20px 0 0", fontSize: 12, color: "#94a3b8" }}>Results have been sent to your email and guardian's email.</p>
        </div>
      </div>
    );
  }

  // Not exam day
  if (!exam.isExamDay && !started) {
    const examDate = new Date(exam.examDate).toLocaleDateString("en-NG", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f4f6f9", padding: 20 }}>
        <div style={{ ...cardStyle, maxWidth: 500, textAlign: "center" }}>
          <Clock style={{ width: 48, height: 48, color: "#0055ff", margin: "0 auto 16px" }} />
          <h2 style={{ margin: "0 0 8px", fontSize: 20, color: "#0f172a" }}>Exam Not Available Yet</h2>
          <p style={{ margin: "0 0 20px", color: "#64748b", fontSize: 14 }}>This exam is scheduled for:</p>
          <div style={{ background: "#f8fafc", borderRadius: 12, padding: 20, marginBottom: 20 }}>
            <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0f172a" }}>{examDate}</p>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "#64748b" }}>{exam.startTime} - {exam.endTime}</p>
          </div>
          <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>Please return on the scheduled date to take the exam.</p>
        </div>
      </div>
    );
  }

  // Exam interface
  return (
    <div style={{ minHeight: "100vh", background: "#f4f6f9" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0a2a6e, #0055ff)", padding: "16px 24px", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ color: "#fff" }}>
            <h1 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>FFB Entrance Examination</h1>
            <p style={{ margin: 0, fontSize: 12, opacity: 0.7 }}>{exam.applicant.firstName} {exam.applicant.lastName} | {exam.applicant.applicationNumber}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ textAlign: "right", color: "#fff" }}>
              <p style={{ margin: 0, fontSize: 11, opacity: 0.7 }}>Time Remaining</p>
              <p style={{ margin: 0, fontSize: 22, fontWeight: 800, fontFamily: "monospace", color: timeLeft < 300 ? "#fbbf24" : "#fff" }}>{formatTime(timeLeft)}</p>
            </div>
            <div style={{ textAlign: "right", color: "#fff" }}>
              <p style={{ margin: 0, fontSize: 11, opacity: 0.7 }}>Progress</p>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>{answeredCount}/{questions.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 20px" }}>
        {/* Start screen */}
        {!started && (
          <div style={{ ...cardStyle, textAlign: "center", maxWidth: 600, margin: "40px auto" }}>
            <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 800, color: "#0f172a" }}>Ready to Begin?</h2>
            <p style={{ margin: "0 0 24px", color: "#64748b", fontSize: 14 }}>Please read the instructions carefully</p>
            <div style={{ textAlign: "left", background: "#f8fafc", borderRadius: 12, padding: 20, marginBottom: 24 }}>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "#475569", lineHeight: 2 }}>
                <li>Total Questions: <strong>{exam.totalQuestions}</strong></li>
                <li>Duration: <strong>{exam.durationMins} minutes</strong></li>
                <li>Subjects: <strong>{exam.subjects.join(", ")}</strong></li>
                <li>Pass Mark: <strong>50%</strong></li>
                <li>Each question has one correct answer</li>
                <li>You can navigate between questions</li>
                <li>The exam will auto-submit when time runs out</li>
              </ul>
            </div>
            <button onClick={startExam} style={{ ...btnPrimary, padding: "16px 40px", fontSize: 16 }}>
              Start Examination
            </button>
          </div>
        )}

        {/* Question interface */}
        {started && questions.length > 0 && (
          <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
            {/* Question */}
            <div style={{ flex: 1, ...cardStyle }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <span style={{ padding: "4px 12px", borderRadius: 6, background: "#eff6ff", color: "#0055ff", fontSize: 12, fontWeight: 600 }}>{questions[currentQ].subject}</span>
                <span style={{ padding: "4px 12px", borderRadius: 6, background: "#f8fafc", color: "#64748b", fontSize: 12 }}>Question {currentQ + 1} of {questions.length}</span>
              </div>
              <h3 style={{ margin: "0 0 20px", fontSize: 16, color: "#0f172a", lineHeight: 1.6 }}>{questions[currentQ].question}</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {questions[currentQ].options.map((opt, i) => (
                  <button key={i} onClick={() => selectAnswer(questions[currentQ].index, i)} style={{ padding: "14px 18px", borderRadius: 10, border: `2px solid ${answers[questions[currentQ].index] === i ? "#0055ff" : "#e5e7eb"}`, background: answers[questions[currentQ].index] === i ? "#eff6ff" : "#fff", color: "#0f172a", fontSize: 14, textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, transition: "all 0.15s" }}>
                    <span style={{ width: 28, height: 28, borderRadius: "50%", border: `2px solid ${answers[questions[currentQ].index] === i ? "#0055ff" : "#d1d5db"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, background: answers[questions[currentQ].index] === i ? "#0055ff" : "transparent", color: answers[questions[currentQ].index] === i ? "#fff" : "#6b7280", flexShrink: 0 }}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
                <button onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0} style={{ padding: "10px 20px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", color: currentQ === 0 ? "#d1d5db" : "#475569", cursor: currentQ === 0 ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
                  <ChevronLeft style={{ width: 16, height: 16 }} /> Previous
                </button>
                {currentQ < questions.length - 1 ? (
                  <button onClick={() => setCurrentQ(currentQ + 1)} style={{ ...btnPrimary, padding: "10px 20px", fontSize: 13 }}>
                    Next <ChevronRight style={{ width: 16, height: 16 }} />
                  </button>
                ) : (
                  <button onClick={handleSubmit} disabled={submitting} style={{ ...btnPrimary, padding: "10px 20px", fontSize: 13, background: submitting ? "#94a3b8" : "linear-gradient(135deg, #10b981, #059669)" }}>
                    {submitting ? "Submitting..." : "Submit Exam"} <Send style={{ width: 16, height: 16 }} />
                  </button>
                )}
              </div>
            </div>

            {/* Question navigator */}
            <div style={{ width: 200, ...cardStyle, position: "sticky", top: 80 }}>
              <h4 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: "#0f172a" }}>Questions</h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
                {questions.map((q, i) => (
                  <button key={i} onClick={() => setCurrentQ(i)} style={{ width: 32, height: 32, borderRadius: 6, border: "none", background: answers[q.index] !== undefined ? "#0055ff" : i === currentQ ? "#e5e7eb" : "#f8fafc", color: answers[q.index] !== undefined ? "#fff" : i === currentQ ? "#0f172a" : "#94a3b8", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                    {i + 1}
                  </button>
                ))}
              </div>
              <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid #f1f5f9" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: "#0055ff" }} />
                  <span style={{ fontSize: 11, color: "#64748b" }}>Answered ({answeredCount})</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: "#f8fafc", border: "1px solid #e5e7eb" }} />
                  <span style={{ fontSize: 11, color: "#64748b" }}>Unanswered ({questions.length - answeredCount})</span>
                </div>
              </div>
              <button onClick={handleSubmit} disabled={submitting} style={{ width: "100%", marginTop: 16, padding: "10px 16px", borderRadius: 8, border: "none", background: submitting ? "#94a3b8" : "linear-gradient(135deg, #10b981, #059669)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                {submitting ? "Submitting..." : "Submit Exam"} <Send style={{ width: 14, height: 14 }} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
