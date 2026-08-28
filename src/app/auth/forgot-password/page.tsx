"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { GraduationCap, Mail, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send reset email");
      }

      setIsSent(true);
      toast.success("Password reset email sent!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send reset email");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: "linear-gradient(-45deg, #000a1f, #001f5f, #0039a6, #0055ff)", backgroundSize: "400% 400%", animation: "gradientMove 18s ease infinite" }}>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[var(--primary)] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[var(--accent)] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[420px] relative z-10"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center shadow-lg">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-white">FFB ERP</h1>
              <p className="text-white/60 text-xs">School Management System</p>
            </div>
          </Link>
        </div>

        <div style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "24px", padding: "40px 36px" }}>
          {!isSent ? (
            <>
              <h2 className="text-[26px] font-bold text-white mb-3 tracking-tight">Reset Password</h2>
              <p className="text-white/50 mb-8 text-[14px] leading-relaxed">
                Enter your email address and we&apos;ll send you a link to reset your password
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-white/70 text-[13px] font-medium mb-2.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@ffb.edu.ng"
                      required
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/[0.07] border border-white/15 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all text-[14px]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[var(--primary)] to-[var(--blue-2)] text-white font-semibold text-[15px] hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 group shadow-lg shadow-blue-500/20"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Send Reset Link
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-18 h-18 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6" style={{ width: "72px", height: "72px" }}>
                <CheckCircle className="w-9 h-9 text-emerald-400" />
              </div>
              <h2 className="text-[26px] font-bold text-white mb-3 tracking-tight">Check Your Email</h2>
              <p className="text-white/50 mb-3 text-[14px] leading-relaxed">
                We&apos;ve sent a password reset link to
              </p>
              <p className="text-white font-medium text-[14px] mb-8">{email}</p>
              <p className="text-white/30 text-[13px] mb-8">
                Didn&apos;t receive the email? Check your spam folder or try again.
              </p>
              <button
                onClick={() => {
                  setIsSent(false);
                  setEmail("");
                }}
                className="px-8 py-3.5 rounded-2xl bg-white/[0.08] border border-white/15 text-white font-medium text-[14px] hover:bg-white/[0.12] transition-all"
              >
                Try Another Email
              </button>
            </div>
          )}

          <div className="mt-8 text-center">
            <Link
              href="/auth/login"
              className="text-white/40 text-[13px] hover:text-white/60 transition-colors inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Link>
          </div>
        </div>

        <p className="text-white/30 text-[11px] text-center mt-6 tracking-wide">
          Protected by enterprise-grade security. Your data is safe with us.
        </p>
      </motion.div>
    </div>
  );
}
