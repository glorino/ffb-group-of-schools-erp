"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, LogIn, AlertCircle, Loader2 } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 30% 30%, rgba(249,115,22,0.1) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(75,30,115,0.15) 0%, transparent 50%)" }} />
      <div className="absolute top-20 left-20 w-72 h-72 rounded-full blur-[120px]" style={{ background: "rgba(249,115,22,0.08)" }} />
      <div className="absolute bottom-20 right-20 w-72 h-72 rounded-full blur-[120px]" style={{ background: "rgba(75,30,115,0.1)" }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[440px] relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center border border-white/10" style={{ background: "linear-gradient(135deg, #4B1E73, #2E0F4F)" }}>
            <svg viewBox="0 0 64 64" className="w-10 h-10" fill="none">
              <path d="M32 4 L56 14 L56 32 C56 48 44 58 32 62 C20 58 8 48 8 32 L8 14 Z" fill="#4B1E73" stroke="#f97316" strokeWidth="2"/>
              <text x="32" y="20" textAnchor="middle" fontFamily="Poppins" fontWeight="bold" fontSize="10" fill="#f97316">FFB</text>
              <path d="M20 36 L32 42 L44 36 L44 48 L32 54 L20 48 Z" fill="#f97316" opacity="0.9"/>
            </svg>
          </div>
          <h1 className="text-white font-bold text-xl">FFB Group of Schools</h1>
          <p className="text-white/50 text-sm mt-1">School Management Portal</p>
        </div>

        {/* Card */}
        <div className="p-8 rounded-[30px]" style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(25px)", border: "1px solid rgba(255,255,255,0.15)", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
          <h2 className="text-white/90 font-semibold text-lg mb-1">Welcome back</h2>
          <p className="text-white/50 text-sm mb-6">Sign in to access your dashboard</p>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="flex items-center gap-2.5 px-4 py-3 rounded-2xl mb-5"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)" }}
            >
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-xs">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ffb.edu.ng"
                required
                className="input-glass"
              />
            </div>

            <div>
              <label className="block text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="input-glass pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-white/30 hover:text-white/60 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded-md accent-[#f97316]" />
                <span className="text-white/40 text-xs">Remember me</span>
              </label>
              <button type="button" className="text-[#f97316] text-xs font-medium hover:underline transition">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed mt-2"
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
          <div className="mt-6 pt-5 border-t border-white/10">
            <p className="text-white/30 text-xs text-center mb-3">Demo Credentials</p>
            <div className="space-y-2">
              {[
                { role: "Administrator", email: "admin@ffb.edu.ng", pass: "admin123" },
                { role: "Teacher", email: "teacher@ffb.edu.ng", pass: "teacher123" },
                { role: "Student", email: "adebayo.johnson@student.ffb.edu.ng", pass: "student123" },
              ].map((cred) => (
                <button
                  key={cred.role}
                  type="button"
                  onClick={() => { setEmail(cred.email); setPassword(cred.pass); }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-2xl transition text-left"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <div>
                    <p className="text-white/50 text-xs font-medium">{cred.role}</p>
                    <p className="text-white/25 text-[10px]">{cred.email}</p>
                  </div>
                  <span className="text-white/20 text-[10px]">Click to fill</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          © 2025 FFB Group of Schools. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
