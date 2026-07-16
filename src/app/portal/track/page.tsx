"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const particles = Array.from({ length: 80 }, (_, i) => ({
  id: i, left: `${Math.random() * 100}%`, duration: `${10 + Math.random() * 20}s`,
  delay: `${Math.random() * 10}s`, size: `${3 + Math.random() * 3}px`,
}));

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: string; description: string }> = {
  pending: { label: "Application Received", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", icon: "📋", description: "Your application has been received and is awaiting review by the admissions team." },
  under_review: { label: "Under Review", color: "#3b82f6", bg: "rgba(59,130,246,0.1)", icon: "🔍", description: "Your application is currently being reviewed by the Principal and Vice Principal." },
  exam: { label: "Entrance Exam Scheduled", color: "#a855f7", bg: "rgba(168,85,247,0.1)", icon: "📝", description: "An entrance examination has been scheduled for you. Please check your email for details." },
  interview: { label: "Interview Scheduled", color: "#06b6d4", bg: "rgba(6,182,212,0.1)", icon: "🗣️", description: "An interview has been scheduled. Please check your email for the date and time." },
  admitted: { label: "Admitted", color: "#28ff9c", bg: "rgba(40,255,156,0.1)", icon: "🎉", description: "Congratulations! You have been admitted. Check your email for your admission letter and next steps." },
  rejected: { label: "Not Admitted", color: "#ef4444", bg: "rgba(239,68,68,0.1)", icon: "❌", description: "We regret to inform you that your application was not successful at this time." },
};

const timelineSteps = ["pending", "under_review", "exam", "interview", "admitted"];

export default function TrackPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [appNumber, setAppNumber] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appNumber.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/admissions/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationNumber: appNumber }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.applicant);
      } else {
        setError(data.error || "Application not found");
      }
    } catch {
      setError("Connection error. Please try again.");
    }
    setLoading(false);
  };

  const status = result ? statusConfig[result.status] || statusConfig.pending : null;
  const currentStepIdx = result ? timelineSteps.indexOf(result.status) : -1;

  return (
    <>
      {particles.map((p) => (
        <div key={p.id} className="particle" style={{ left: p.left, width: p.size, height: p.size, animationDuration: p.duration, animationDelay: p.delay }} />
      ))}

      <div className="navbar">
        <div className="nav-inner">
          <Link href="/" className="flex items-center gap-2"><img src="/logo.svg" alt="FFB" style={{ height: "50px" }} /></Link>
          <div className={`nav-links ${mobileMenuOpen ? "active" : ""}`}>
            <Link href="/">Home</Link>
            <Link href="/portal/apply" className="menu-btn apply-btn" style={{ color: "#001f5f" }}>Admissions</Link>
            <Link href="/portal/track" className="menu-btn apply-btn" style={{ color: "#001f5f" }}>Track Application</Link>
            <Link href="/auth/login" className="menu-btn portal-btn">Portal</Link>
          </div>
          <div className="hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>

      <section style={{ marginTop: "80px", padding: "60px 20px 40px", textAlign: "center", maxWidth: "700px", margin: "80px auto 0" }}>
        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800 }}>
          Track Your <span className="accent">Application</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} style={{ color: "rgba(255,255,255,0.6)", maxWidth: "500px", margin: "15px auto 0" }}>
          Enter your application number to check the status of your admission.
        </motion.p>

        <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} onSubmit={handleTrack} style={{ display: "flex", gap: "10px", marginTop: "30px", justifyContent: "center", flexWrap: "wrap" }}>
          <input className="input-glass" placeholder="Enter application number (e.g. APP/2025/0001)" value={appNumber} onChange={(e) => setAppNumber(e.target.value)} style={{ maxWidth: "400px", flex: 1 }} />
          <motion.button type="submit" className="btn-primary" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ padding: "14px 30px" }}>
            {loading ? "Checking..." : "Track"}
          </motion.button>
        </motion.form>
      </section>

      {error && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: "600px", margin: "20px auto", padding: "16px 20px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "16px", color: "#ef4444", fontSize: "14px", textAlign: "center" }}>
          {error}
        </motion.div>
      )}

      <AnimatePresence>
        {result && status && (
          <motion.section initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }} className="glass-section" style={{ maxWidth: "700px", margin: "20px auto 40px" }}>
            {/* Status Header */}
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }} style={{ textAlign: "center", padding: "30px", background: status.bg, borderRadius: "24px", border: `1px solid ${status.color}33`, marginBottom: "30px" }}>
              <div style={{ fontSize: "56px", marginBottom: "12px" }}>{status.icon}</div>
              <h2 style={{ fontSize: "24px", fontWeight: 800, color: status.color, marginBottom: "8px" }}>{status.label}</h2>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", lineHeight: 1.7, maxWidth: "450px", margin: "0 auto" }}>{status.description}</p>
            </motion.div>

            {/* Application Info */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "30px" }}>
              {[
                { label: "Application No.", value: result.applicationNumber },
                { label: "Name", value: `${result.firstName} ${result.lastName}` },
                { label: "Class Applied", value: result.classAppliedFor },
                { label: "Date Submitted", value: new Date(result.submittedAt).toLocaleDateString("en-NG", { month: "long", day: "numeric", year: "numeric" }) },
              ].map((item, i) => (
                <div key={i} style={{ padding: "14px 18px", background: "rgba(255,255,255,0.04)", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.label}</p>
                  <p style={{ fontSize: "14px", fontWeight: 600 }}>{item.value}</p>
                </div>
              ))}
            </div>

            {/* Timeline */}
            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "20px" }}>Application Progress</h3>
            <div style={{ display: "flex", justifyContent: "space-between", position: "relative", marginBottom: "20px" }}>
              <div style={{ position: "absolute", top: "16px", left: "0", right: "0", height: "3px", background: "rgba(255,255,255,0.08)" }}></div>
              <div style={{ position: "absolute", top: "16px", left: "0", height: "3px", background: `linear-gradient(90deg, #28ff9c, ${status.color})`, width: `${Math.max(0, (currentStepIdx / (timelineSteps.length - 1)) * 100)}%`, transition: "0.8s" }}></div>
              {timelineSteps.map((s, i) => {
                const cfg = statusConfig[s];
                const isActive = i <= currentStepIdx;
                const isCurrent = s === result.status;
                return (
                  <div key={s} style={{ textAlign: "center", position: "relative", zIndex: 1, flex: 1 }}>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 + i * 0.1, type: "spring" }} style={{ width: "34px", height: "34px", borderRadius: "50%", background: isActive ? cfg.color : "rgba(255,255,255,0.08)", color: isActive ? "#001f5f" : "rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px", fontSize: isCurrent ? "18px" : "14px", fontWeight: 700, border: isCurrent ? `3px solid ${cfg.color}` : "none", boxShadow: isCurrent ? `0 0 20px ${cfg.color}44` : "none" }}>
                      {cfg.icon}
                    </motion.div>
                    <span style={{ fontSize: "10px", color: isActive ? cfg.color : "rgba(255,255,255,0.3)", fontWeight: isCurrent ? 700 : 500 }}>{cfg.label.split(" ").slice(0, 2).join(" ")}</span>
                  </div>
                );
              })}
            </div>

            {/* Decision Note */}
            {result.decisionNote && (
              <div style={{ marginTop: "20px", padding: "16px 20px", background: "rgba(255,255,255,0.04)", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.06)" }}>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "6px", textTransform: "uppercase" }}>Note from Admissions</p>
                <p style={{ fontSize: "14px", lineHeight: 1.6 }}>{result.decisionNote}</p>
              </div>
            )}

            {/* Admitted extra info */}
            {result.status === "admitted" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} style={{ marginTop: "20px", padding: "20px", background: "rgba(40,255,156,0.06)", borderRadius: "16px", border: "1px solid rgba(40,255,156,0.2)", textAlign: "center" }}>
                <p style={{ fontSize: "14px", color: "#28ff9c", fontWeight: 600, marginBottom: "8px" }}>Next Steps</p>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", lineHeight: 1.7 }}>Check your email for your admission letter. You will need to complete fee payment and document verification to finalize enrollment.</p>
              </motion.div>
            )}

            {/* Rejected */}
            {result.status === "rejected" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} style={{ marginTop: "20px", padding: "20px", background: "rgba(239,68,68,0.06)", borderRadius: "16px", border: "1px solid rgba(239,68,68,0.2)", textAlign: "center" }}>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", lineHeight: 1.7 }}>If you have questions about this decision, please contact the admissions office at <strong style={{ color: "#fff" }}>info@glopresc.com</strong> or call <strong style={{ color: "#fff" }}>+234 905 998 0991</strong>.</p>
              </motion.div>
            )}
          </motion.section>
        )}
      </AnimatePresence>

      <footer className="footer">
        <div className="footer-bottom">© 2025 FFB Group of Schools. All rights reserved.</div>
      </footer>
    </>
  );
}
