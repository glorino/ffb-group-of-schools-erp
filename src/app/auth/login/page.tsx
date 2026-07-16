"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const particles = Array.from({ length: 80 }, (_, i) => ({
  id: i, left: `${Math.random() * 100}%`, duration: `${10 + Math.random() * 20}s`,
  delay: `${Math.random() * 10}s`, size: `${3 + Math.random() * 3}px`,
}));

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { signIn } = await import("next-auth/react");
      let result = await signIn("credentials", { email, password, redirect: false });
      console.log("[LOGIN] signIn result:", result);

      if (result?.error) {
        await fetch("/api/seed-auto", { method: "POST" });
        result = await signIn("credentials", { email, password, redirect: false });
        console.log("[LOGIN] signIn after seed:", result);
      }

      if (result?.error) {
        setError(`Login failed: ${result.error}`);
      } else if (result?.ok) {
        window.location.href = "/dashboard";
      } else {
        setError("Unexpected response. Please try again.");
      }
    } catch (err) {
      console.error("[LOGIN] catch error:", err);
      setError(`Connection error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", position: "relative" }}>
      {particles.map((p) => (
        <div key={p.id} className="particle" style={{ left: p.left, width: p.size, height: p.size, animationDuration: p.duration, animationDelay: p.delay }} />
      ))}

      {/* Back to Home */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} style={{ position: "fixed", top: "25px", left: "25px", zIndex: 100 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: "14px", fontWeight: 500, transition: "0.3s" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
          Back to Home
        </Link>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }} style={{ width: "100%", maxWidth: "440px" }}>
        <div style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "40px", padding: "40px 35px" }}>
          {/* Logo */}
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} style={{ textAlign: "center", marginBottom: "30px" }}>
            <img src="/logo.svg" alt="FFB" style={{ height: "70px", margin: "0 auto 15px" }} />
            <h1 style={{ fontSize: "24px", fontWeight: 800 }}>Welcome Back</h1>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", marginTop: "5px" }}>Sign in to your portal</p>
          </motion.div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "14px", padding: "12px 16px", marginBottom: "20px", color: "#ef4444", fontSize: "13px", fontWeight: 500 }}>
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginBottom: "6px", display: "block", fontWeight: 600 }}>Email Address</label>
              <input className="input-glass" type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginBottom: "6px", display: "block", fontWeight: 600 }}>Password</label>
              <div style={{ position: "relative" }}>
                <input className="input-glass" type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ paddingRight: "45px" }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", padding: "4px", fontSize: "14px" }}>
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "rgba(255,255,255,0.5)", cursor: "pointer" }}>
                <input type="checkbox" style={{ accentColor: "#28ff9c" }} /> Remember me
              </label>
              <a href="#" style={{ color: "#28ff9c", fontSize: "12px", textDecoration: "none" }}>Forgot password?</a>
            </div>
            <motion.button type="submit" className="btn-primary" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ width: "100%", padding: "16px", fontSize: "15px", fontWeight: 700, borderRadius: "20px", marginTop: "5px" }}>
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  <span className="spinner" style={{ width: "18px", height: "18px", border: "2px solid rgba(0,31,95,0.3)", borderTopColor: "#001f5f", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}></span>
                  Signing In...
                </span>
              ) : "Sign In"}
            </motion.button>
          </form>

          {/* Demo Credentials */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} style={{ marginTop: "25px", padding: "18px", background: "rgba(40,255,156,0.05)", borderRadius: "16px", border: "1px solid rgba(40,255,156,0.15)" }}>
            <p style={{ fontSize: "12px", fontWeight: 700, color: "#28ff9c", marginBottom: "10px", textAlign: "center" }}>DEMO CREDENTIALS</p>
            {[
              { role: "Admin", email: "admin@ffb.edu.ng", password: "admin123" },
              { role: "Teacher", email: "teacher@ffb.edu.ng", password: "teacher123" },
              { role: "Student", email: "adebayo.johnson@student.ffb.edu.ng", password: "student123" },
            ].map((cred) => (
              <div key={cred.role} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderRadius: "10px", marginBottom: "5px", background: "rgba(255,255,255,0.04)", cursor: "pointer" }} onClick={() => { setEmail(cred.email); setPassword(cred.password); }}>
                <div>
                  <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>{cred.role}</span>
                  <p style={{ fontSize: "12px", fontWeight: 600 }}>{cred.email}</p>
                </div>
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>Click to fill</span>
              </div>
            ))}
          </motion.div>

          {/* Links */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} style={{ textAlign: "center", marginTop: "20px" }}>
            <Link href="/portal/apply" style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", textDecoration: "none" }}>
              New student? <span style={{ color: "#28ff9c", fontWeight: 600 }}>Apply for Admission</span>
            </Link>
          </motion.div>
        </div>
      </motion.div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
