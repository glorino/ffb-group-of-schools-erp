"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, ArrowLeft, CheckCircle, AlertTriangle } from "lucide-react";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"success" | "error">("success");

  const headerStyle: React.CSSProperties = {
    background: "linear-gradient(135deg, #0a2a6e, #0055ff)",
    borderRadius: 16,
    padding: 32,
    marginBottom: 32,
    color: "#fff",
    position: "relative",
    overflow: "hidden",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: 12,
    borderRadius: 10,
    border: "2px solid #e5e7eb",
    fontSize: 14,
    background: "#fff",
    outline: "none",
    transition: "border-color 0.2s",
  };

  const btnPrimary: React.CSSProperties = {
    background: "linear-gradient(135deg, #0055ff, #0033cc)",
    color: "#fff",
    border: "none",
    padding: "14px 28px",
    borderRadius: 10,
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 14,
    width: "100%",
    opacity: loading ? 0.6 : 1,
  };

  const handleChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMsgType("error");
      setMsg("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setMsgType("error");
      setMsg("New password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    setMsg("");
    try {
      const r = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const d = await r.json();
      if (r.ok) {
        setMsgType("success");
        setMsg("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setMsgType("error");
        setMsg(d.error || "Failed to change password.");
      }
    } catch {
      setMsgType("error");
      setMsg("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "24px 24px 0 24px", maxWidth: 600, margin: "0 auto" }}>
      <div style={headerStyle}>
        <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        <div style={{ position: "absolute", bottom: -40, left: -20, width: 150, height: 150, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={() => router.back()} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 10, padding: 10, cursor: "pointer", display: "flex", color: "#fff" }}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Change Password</h1>
            <p style={{ margin: "4px 0 0", opacity: 0.85, fontSize: 14 }}>Update your account password</p>
          </div>
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: 16, padding: 32, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0" }}>
        {msg && (
          <div style={{ padding: 14, borderRadius: 10, marginBottom: 20, display: "flex", alignItems: "center", gap: 10, background: msgType === "success" ? "#d1fae5" : "#fef2f2", color: msgType === "success" ? "#065f46" : "#dc2626" }}>
            {msgType === "success" ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
            <span style={{ fontWeight: 500, fontSize: 14 }}>{msg}</span>
          </div>
        )}

        <form onSubmit={handleChange}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontWeight: 600, fontSize: 13, color: "#374151", marginBottom: 6 }}>Current Password</label>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
              <input type={showCurrent ? "text" : "password"} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Enter current password" required style={{ ...inputStyle, paddingLeft: 38 }} onFocus={e => (e.currentTarget.style.borderColor = "#0055ff")} onBlur={e => (e.currentTarget.style.borderColor = "#e5e7eb")} />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4 }}>
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontWeight: 600, fontSize: 13, color: "#374151", marginBottom: 6 }}>New Password</label>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
              <input type={showNew ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Enter new password" required style={{ ...inputStyle, paddingLeft: 38 }} onFocus={e => (e.currentTarget.style.borderColor = "#0055ff")} onBlur={e => (e.currentTarget.style.borderColor = "#e5e7eb")} />
              <button type="button" onClick={() => setShowNew(!showNew)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4 }}>
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={{ display: "block", fontWeight: 600, fontSize: 13, color: "#374151", marginBottom: 6 }}>Confirm New Password</label>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
              <input type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm new password" required style={{ ...inputStyle, paddingLeft: 38 }} onFocus={e => (e.currentTarget.style.borderColor = "#0055ff")} onBlur={e => (e.currentTarget.style.borderColor = "#e5e7eb")} />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4 }}>
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading || !currentPassword || !newPassword || !confirmPassword} style={btnPrimary}>
            {loading ? "Changing Password..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
