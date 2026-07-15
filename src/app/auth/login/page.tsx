"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { Mail, Lock, Eye, EyeOff, ArrowRight, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { ParticleBackground } from "@/components/particles";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        toast.error("Invalid email or password");
      } else {
        toast.success("Welcome back!");
        router.push("/dashboard");
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-animated flex items-center justify-center p-4 relative overflow-hidden">
      <ParticleBackground />
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[var(--primary)] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[var(--accent)] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--blue-2)] to-[var(--blue-1)] flex items-center justify-center shadow-lg border border-white/10 overflow-hidden">
              <svg viewBox="0 0 64 64" className="w-12 h-12" fill="none">
                <path d="M32 4 L56 14 L56 32 C56 48 44 58 32 62 C20 58 8 48 8 32 L8 14 Z" fill="#0039a6" stroke="#ffd700" stroke-width="2"/>
                <path d="M20 36 L32 42 L44 36 L44 48 L32 54 L20 48 Z" fill="#ffd700" opacity="0.9"/>
                <line x1="32" y1="42" x2="32" y2="54" stroke="#001f5f" stroke-width="1"/>
                <path d="M20 24 L32 30 L44 24" fill="none" stroke="#ffd700" stroke-width="2"/>
                <path d="M20 24 L20 36" stroke="#ffd700" stroke-width="2"/>
                <path d="M44 24 L44 36" stroke="#ffd700" stroke-width="2"/>
                <path d="M32 12 C34 16 36 18 36 22 C38 18 38 14 36 10 C34 8 32 6 32 6 C32 6 30 8 28 10 C26 14 26 18 28 22 C28 18 30 16 32 12Z" fill="#ffd700"/>
                <text x="32" y="20" textAnchor="middle" fontFamily="serif" fontWeight="bold" fontSize="10" fill="#ffd700">FFB</text>
              </svg>
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-white tracking-tight">FFB Group of Schools</h1>
              <p className="text-white/40 text-xs tracking-wider uppercase">Excellence &bull; Discipline &bull; Integrity</p>
            </div>
          </Link>
        </div>

        <div className="card">
          <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-white/50 mb-8 text-sm">Sign in to access your portal</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@ffb.edu.ng"
                  required
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-white/20 bg-white/5 text-[var(--primary)]" />
                <span className="text-white/50 text-sm">Remember me</span>
              </label>
              <Link href="/auth/forgot-password" className="text-[var(--accent)] text-sm hover:underline">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--blue-2)] text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 group text-sm"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/50 text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/portal/apply" className="text-[var(--accent)] hover:underline font-medium">
                Apply for Admission
              </Link>
            </p>
          </div>
        </div>

        <p className="text-white/30 text-xs text-center mt-6">
          FFB Group of Schools &copy; {new Date().getFullYear()}
        </p>
      </motion.div>
    </div>
  );
}
