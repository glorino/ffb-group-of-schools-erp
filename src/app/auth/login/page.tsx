"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, LogIn, GraduationCap, AlertCircle, Loader2 } from "lucide-react";

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
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

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
    <div className="min-h-screen bg-[var(--bg-dark)] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 30% 30%, rgba(0,85,255,0.12) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(40,255,156,0.06) 0%, transparent 50%)" }} />
      <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-[var(--primary)]/5 blur-[120px]" />
      <div className="absolute bottom-20 right-20 w-72 h-72 rounded-full bg-[var(--accent)]/5 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-[420px] relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--blue-2)] to-[var(--blue-1)] flex items-center justify-center mx-auto mb-4 border border-white/10 shadow-xl shadow-[var(--blue-1)]/30">
            <svg viewBox="0 0 64 64" className="w-10 h-10" fill="none">
              <path d="M32 4 L56 14 L56 32 C56 48 44 58 32 62 C20 58 8 48 8 32 L8 14 Z" fill="#0039a6" stroke="#ffd700" strokeWidth="2"/>
              <text x="32" y="20" textAnchor="middle" fontFamily="serif" fontWeight="bold" fontSize="10" fill="#ffd700">FFB</text>
              <path d="M20 36 L32 42 L44 36 L44 48 L32 54 L20 48 Z" fill="#ffd700" opacity="0.9"/>
            </svg>
          </div>
          <h1 className="text-white font-bold text-xl font-display">FFB Group of Schools</h1>
          <p className="text-white/25 text-[13px] mt-1">School Management Portal</p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.04] backdrop-blur-2xl rounded-3xl border border-white/[0.08] p-7 shadow-2xl shadow-black/20">
          <h2 className="text-white/90 font-semibold text-[17px] mb-1">Welcome back</h2>
          <p className="text-white/30 text-[13px] mb-6">Sign in to access your dashboard</p>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-500/[0.08] border border-red-500/20 mb-5"
            >
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-[12px]">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-white/40 text-[11px] font-semibold uppercase tracking-wider mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ffb.edu.ng"
                required
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/90 text-[14px] placeholder-white/15 outline-none focus:border-[var(--primary)]/50 focus:bg-white/[0.06] transition-all"
              />
            </div>

            <div>
              <label className="block text-white/40 text-[11px] font-semibold uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/90 text-[14px] placeholder-white/15 outline-none focus:border-[var(--primary)]/50 focus:bg-white/[0.06] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-white/20 hover:text-white/50 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded-md bg-white/[0.06] border-white/[0.12] accent-[var(--primary)]" />
                <span className="text-white/30 text-[12px]">Remember me</span>
              </label>
              <button type="button" className="text-[var(--blue-3)] text-[12px] font-medium hover:text-[var(--accent)] transition">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[var(--primary)] text-white text-[14px] font-semibold hover:brightness-110 transition shadow-xl shadow-[var(--primary)]/25 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" /> Sign In
                </>
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 pt-5 border-t border-white/[0.06]">
            <p className="text-white/20 text-[11px] text-center mb-3">Demo Credentials</p>
            <div className="grid grid-cols-1 gap-2">
              {[
                { role: "Administrator", email: "admin@ffb.edu.ng", pass: "admin123" },
                { role: "Teacher", email: "teacher@ffb.edu.ng", pass: "teacher123" },
                { role: "Student", email: "adebayo.johnson@student.ffb.edu.ng", pass: "student123" },
              ].map((cred) => (
                <button
                  key={cred.role}
                  type="button"
                  onClick={() => { setEmail(cred.email); setPassword(cred.pass); }}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] hover:border-white/[0.1] transition text-left"
                >
                  <div>
                    <p className="text-white/40 text-[11px] font-medium">{cred.role}</p>
                    <p className="text-white/20 text-[10px]">{cred.email}</p>
                  </div>
                  <span className="text-white/15 text-[10px]">Click to fill</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white/15 text-[11px] mt-6">
          © 2025 FFB Group of Schools. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
