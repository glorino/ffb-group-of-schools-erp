"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowLeft, Loader2, AlertCircle } from "lucide-react";

const particles = Array.from({ length: 80 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  duration: `${10 + Math.random() * 20}s`,
  delay: `${Math.random() * 10}s`,
  size: `${3 + Math.random() * 3}px`,
}));

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        setError("Invalid email or password. Please try again.");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("An error occurred. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      {particles.map((p) => (
        <div key={p.id} className="particle" style={{ left: p.left, width: p.size, height: p.size, animationDuration: p.duration, animationDelay: p.delay }} />
      ))}

      <Link href="/" style={{ position: "absolute", top: "25px", left: "25px", color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: "14px", fontWeight: 500, zIndex: 10, display: "flex", alignItems: "center", gap: "8px" }}>
        <ArrowLeft style={{ width: "18px", height: "18px" }} /> Back to Home
      </Link>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "20px" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            width: "100%",
            maxWidth: "450px",
            background: "rgba(255,255,255,0.1)",
            backdropFilter: "blur(25px)",
            WebkitBackdropFilter: "blur(25px)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "30px",
            padding: "50px 40px",
            boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
          }}
        >
          <h1 style={{ fontSize: "28px", fontWeight: 800, textAlign: "center", marginBottom: "8px" }}>Secure Login</h1>
          <p style={{ textAlign: "center", color: "rgba(255,255,255,0.5)", fontSize: "14px", marginBottom: "35px" }}>Sign in to access your portal</p>

          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", borderRadius: "12px", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", marginBottom: "20px" }}>
              <AlertCircle style={{ width: "16px", height: "16px", color: "#ef4444", flexShrink: 0 }} />
              <p style={{ color: "#ef4444", fontSize: "13px" }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              style={{
                width: "100%", padding: "16px 20px", borderRadius: "16px", border: "none",
                background: "rgba(255,255,255,0.12)", color: "#fff", fontSize: "15px",
                outline: "none", marginBottom: "16px", fontFamily: "'Poppins', sans-serif",
              }}
            />

            <div style={{ position: "relative", marginBottom: "10px" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                style={{
                  width: "100%", padding: "16px 50px 16px 20px", borderRadius: "16px", border: "none",
                  background: "rgba(255,255,255,0.12)", color: "#fff", fontSize: "15px",
                  outline: "none", fontFamily: "'Poppins', sans-serif",
                }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer" }}>
                {showPassword ? <EyeOff style={{ width: "18px", height: "18px" }} /> : <Eye style={{ width: "18px", height: "18px" }} />}
              </button>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>
                <input type="checkbox" style={{ accentColor: "#28ff9c" }} /> Remember Me
              </label>
              <Link href="/auth/forgot-password" style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", textDecoration: "none" }}>Forgot Password?</Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "16px", borderRadius: "16px", border: "none",
                background: "#f97316", color: "#fff", fontSize: "16px", fontWeight: 700,
                cursor: "pointer", fontFamily: "'Poppins', sans-serif",
                opacity: loading ? 0.6 : 1, transition: "0.3s",
              }}
            >
              {loading ? <Loader2 style={{ width: "20px", height: "20px", animation: "spin 1s linear infinite" }} /> : "Login"}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
