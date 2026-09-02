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
        <div className="card" style={{ padding: "40px 36px" }}>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: "rgba(0, 85, 255, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto" }}>
              <Lock style={{ width: "32px", height: "32px", color: "var(--primary)" }} />
            </div>
            <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#1a1a2e", margin: "0 0 8px 0" }}>Change Your Password</h1>
            <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>You must change your default password before continuing</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>New Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  style={{
                    width: "100%", padding: "12px 44px 12px 16px", borderRadius: "12px",
                    border: "1px solid #e2e8f0", background: "#ffffff", fontSize: "14px",
                    color: "#1a1a2e", outline: "none", boxSizing: "border-box"
                  }}
                />
                <button type="button" onClick={() => setShow(!show)} style={{
                  position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", padding: "4px", color: "#94a3b8"
                }}>
                  {show ? <EyeOff style={{ width: "18px", height: "18px" }} /> : <Eye style={{ width: "18px", height: "18px" }} />}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: "28px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>Confirm Password</label>
              <input
                type={show ? "text" : "password"}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Confirm new password"
                style={{
                  width: "100%", padding: "12px 16px", borderRadius: "12px",
                  border: "1px solid #e2e8f0", background: "#ffffff", fontSize: "14px",
                  color: "#1a1a2e", outline: "none", boxSizing: "border-box"
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "12px", borderRadius: "12px",
                background: "linear-gradient(135deg, var(--primary), #0039a6)",
                color: "#ffffff", fontSize: "15px", fontWeight: 600,
                border: "none", cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.5 : 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
              }}
            >
              {loading ? <Loader2 style={{ width: "18px", height: "18px", animation: "spin 1s linear infinite" }} /> : <Lock style={{ width: "18px", height: "18px" }} />}
              Change Password
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
