"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ChangePasswordPage() {
  const { update } = useSession();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (password !== confirm) { toast.error("Passwords do not match"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ changePassword: true, newPassword: password }),
      });
      if (res.ok) {
        await update({ mustChangePassword: false } as any);
        toast.success("Password changed successfully");
        router.push("/dashboard");
      } else {
        const d = await res.json();
        toast.error(d.error || "Failed to change password");
      }
    } catch { toast.error("Failed to change password"); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-animated flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="card">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-[var(--primary)]/20 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-[var(--primary)]" />
            </div>
            <h1 className="text-xl font-bold text-white">Change Your Password</h1>
            <p className="text-white/50 text-[13px] mt-1">You must change your default password before continuing</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-white/60 text-[12px] mb-1 block">New Password</label>
              <div className="relative">
                <input type={show ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)] pr-10" placeholder="Enter new password" />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-white/60 text-[12px] mb-1 block">Confirm Password</label>
              <input type={show ? "text" : "password"} value={confirm} onChange={e => setConfirm(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]" placeholder="Confirm new password" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-2.5 rounded-xl bg-[var(--primary)] text-white text-[13px] font-semibold hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              Change Password
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
