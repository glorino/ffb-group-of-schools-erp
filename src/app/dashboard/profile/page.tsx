"use client";

import { useEffect, useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { SCHOOL_CONFIG } from "@/lib/school-config";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Shield,
  Key,
  Camera,
  Save,
  GraduationCap,
  Briefcase,
  Loader2,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface ActivityLog {
  id: string;
  action: string;
  timestamp: string;
  [key: string]: unknown;
}

const spinnerStyle: React.CSSProperties = {
  animation: "spin 1s linear infinite",
};

function ProfilePageInner() {
  const { data: session, status, update } = useSession();
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [changingPassword, setChangingPassword] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notifications, setNotifications] = useState({ email: true, sms: false, push: true });
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);

  const userName = (session?.user as any)?.name as string || "User";
  const userEmail = (session?.user as any)?.email as string || "";
  const userImage = (session?.user as any)?.image as string || "";
  const userId = (session?.user as any)?.id as string || "FFB-001";

  const initials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  useEffect(() => {
    if (status !== "loading") {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    setName(userName);
    setEmail(userEmail);
    setPhone("");
    setAddress("");
  }, [userName, userEmail]);

  useEffect(() => {
    const fetchActivity = async () => {
      setActivityLoading(true);
      try {
        const res = await fetch("/api/activity-log");
        if (res.ok) {
          const data: ActivityLog[] = await res.json();
          setRecentActivity(Array.isArray(data) ? data.slice(0, 5) : []);
        }
      } catch {
        // Activity log is optional — keep empty state
      } finally {
        setActivityLoading(false);
      }
    };
    fetchActivity();
  }, []);

  const getTimeAgo = (timestamp: string): string => {
    try {
      const now = new Date();
      const then = new Date(timestamp);
      const diffMs = now.getTime() - then.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${diffDays}d ago`;
    } catch {
      return "Recently";
    }
  };

  const getActivityIcon = (action: string) => {
    if (action.toLowerCase().includes("student")) return User;
    if (action.toLowerCase().includes("payment") || action.toLowerCase().includes("finance")) return Briefcase;
    if (action.toLowerCase().includes("report") || action.toLowerCase().includes("grade")) return GraduationCap;
    if (action.toLowerCase().includes("password") || action.toLowerCase().includes("security")) return Key;
    return User;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, name, email, phone, address }),
      });
      if (res.ok) {
        toast.success("Profile updated successfully");
        setEditing(false);
        await update({ name, email });
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update profile");
      }
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    setChangingPassword(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword }),
      });
      if (res.ok) {
        toast.success("Password changed successfully");
        setShowPasswordModal(false);
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to change password");
      }
    } catch {
      toast.error("Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <Loader2 style={{ width: 32, height: 32, color: "#0a2a6e", ...spinnerStyle }} />
      </div>
    );
  }

  const headerStyle: React.CSSProperties = {
    background: "linear-gradient(135deg, #0a2a6e, #0055ff)",
    borderRadius: 16,
    padding: 32,
    marginTop: 32,
    marginLeft: 16,
    marginRight: 16,
    position: "relative",
    overflow: "hidden",
    boxShadow: "0 4px 24px rgba(10,42,110,0.18)",
  };

  const headerOverlayRadial1: React.CSSProperties = {
    position: "absolute",
    top: -40,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)",
    pointerEvents: "none",
  };

  const headerOverlayRadial2: React.CSSProperties = {
    position: "absolute",
    bottom: -30,
    left: 30,
    width: 140,
    height: 140,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)",
    pointerEvents: "none",
  };

  const cardStyle: React.CSSProperties = {
    background: "#fff",
    borderRadius: 16,
    padding: 24,
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    border: "1px solid #e5e7eb",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: 12,
    borderRadius: 10,
    border: "2px solid #e5e7eb",
    background: "#fff",
    color: "#1a1a2e",
    fontSize: 13,
    outline: "none",
    transition: "border-color 0.2s",
  };

  const labelStyle: React.CSSProperties = {
    color: "#475569",
    fontSize: 13,
    marginBottom: 8,
    display: "block",
  };

  const sectionHeaderStyle: React.CSSProperties = {
    background: "linear-gradient(135deg, #0a2a6e, #0055ff)",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    position: "relative",
    overflow: "hidden",
  };

  const sectionOverlayRadial: React.CSSProperties = {
    position: "absolute",
    top: -20,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
    pointerEvents: "none",
  };

  const toggleBg = (on: boolean): React.CSSProperties => ({
    width: 40,
    height: 20,
    borderRadius: 10,
    position: "relative",
    cursor: "pointer",
    transition: "all 0.2s",
    background: on ? "#10b981" : "#e2e8f0",
    border: "none",
    padding: 0,
    flexShrink: 0,
  });

  const toggleDot = (on: boolean): React.CSSProperties => ({
    position: "absolute",
    top: 2,
    width: 16,
    height: 16,
    borderRadius: "50%",
    background: "#fff",
    transition: "all 0.2s",
    left: on ? 22 : 2,
  });

  const modalOverlayStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  };

  const modalCardStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: 520,
    margin: "0 16px",
    background: "#fff",
    borderRadius: 16,
    border: "1px solid #e5e7eb",
    boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
    overflow: "hidden",
  };

  const modalHeaderBannerStyle: React.CSSProperties = {
    background: "linear-gradient(135deg, #0a2a6e, #0055ff)",
    padding: "20px 24px",
    position: "relative",
    overflow: "hidden",
  };

  const modalCloseBtnStyle: React.CSSProperties = {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 8,
    border: "none",
    background: "rgba(255,255,255,0.2)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  };

  const btnPrimaryStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 20px",
    borderRadius: 10,
    border: "none",
    background: "linear-gradient(135deg, #0a2a6e, #0055ff)",
    color: "#fff",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
  };

  const btnSecondaryStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 20px",
    borderRadius: 10,
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    color: "#475569",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
  };

  const activityItemStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: 12,
    borderRadius: 12,
    background: "#f8fafc",
  };

  const activityIconBoxStyle: React.CSSProperties = {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  };

  const securityBtnStyle: React.CSSProperties = {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 12,
    background: "#f8fafc",
    border: "none",
    cursor: "pointer",
    textAlign: "left",
    transition: "background 0.2s",
  };

  return (
    <div style={{ padding: "0 0 32px 0" }}>
      <div style={headerStyle}>
        <div style={headerOverlayRadial1} />
        <div style={headerOverlayRadial2} />
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16, position: "relative", zIndex: 1 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#fff", margin: "0 0 4px 0" }}>My Profile</h1>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, margin: 0 }}>
              Manage your account settings, preferences, and personal information
            </p>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            style={btnPrimaryStyle}
          >
            <Edit style={{ width: 16, height: 16 }} />
            {editing ? "Cancel" : "Edit Profile"}
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 2fr)", gap: 24, padding: "24px 16px 0" }}>
        {/* Left Column - Profile Card */}
        <div style={cardStyle}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            <div style={{ position: "relative", marginBottom: 20 }}>
              {userImage ? (
                <img
                  src={userImage}
                  alt={userName}
                  style={{ width: 112, height: 112, borderRadius: "50%", objectFit: "cover", border: "4px solid #fff", boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}
                />
              ) : (
                <div style={{
                  width: 112,
                  height: 112,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #0a2a6e, #0055ff)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: 36,
                  fontWeight: 700,
                  border: "4px solid #fff",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                }}>
                  {initials}
                </div>
              )}
              <label style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: 40,
                height: 40,
                borderRadius: 12,
                background: "#0a2a6e",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(10,42,110,0.3)",
                border: "2px solid #fff",
              }}>
                <Camera style={{ width: 16, height: 16, color: "#fff" }} />
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
                  const reader = new FileReader();
                  reader.onload = async () => {
                    try {
                      const base64 = reader.result as string;
                      const res = await fetch("/api/users", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: userId, image: base64 }),
                      });
                      if (!res.ok) throw new Error("Failed");
                      await update({ user: { ...session?.user, image: base64 } } as any);
                      toast.success("Profile photo updated");
                    } catch { toast.error("Failed to upload photo"); }
                  };
                  reader.readAsDataURL(file);
                }} />
              </label>
            </div>
            <h3 style={{ color: "#1a1a2e", fontSize: 20, fontWeight: 700, margin: 0 }}>{userName}</h3>
            <p style={{ color: "#0a2a6e", fontSize: 13, fontWeight: 500, marginTop: 4 }}>
              {(session?.user as any)?.roles?.[0]?.name || "User"}
            </p>
          </div>

          <div style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Mail style={{ width: 16, height: 16, color: "#64748b" }} />
              <span style={{ color: "#475569", fontSize: 13 }}>{userEmail || "No email"}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Phone style={{ width: 16, height: 16, color: "#64748b" }} />
              <span style={{ color: "#475569", fontSize: 13 }}>{SCHOOL_CONFIG.phone}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <MapPin style={{ width: 16, height: 16, color: "#64748b" }} />
              <span style={{ color: "#475569", fontSize: 13 }}>{SCHOOL_CONFIG.address}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Calendar style={{ width: 16, height: 16, color: "#64748b" }} />
              <span style={{ color: "#475569", fontSize: 13 }}>Joined September 2018</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Briefcase style={{ width: 16, height: 16, color: "#64748b" }} />
              <span style={{ color: "#475569", fontSize: 13 }}>{(session?.user as any)?.roles?.[0]?.name || "User"}</span>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Personal Information */}
          <div style={cardStyle}>
            <div style={sectionHeaderStyle}>
              <div style={sectionOverlayRadial} />
              <h3 style={{ color: "#fff", fontWeight: 600, fontSize: 18, margin: 0, position: "relative", zIndex: 1 }}>Personal Information</h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  readOnly={!editing}
                  style={{ ...inputStyle, cursor: editing ? "text" : "default", background: editing ? "#fff" : "#f8fafc" }}
                  onFocus={(e) => { if (editing) e.currentTarget.style.borderColor = "#0a2a6e"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; }}
                />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  readOnly={!editing}
                  style={{ ...inputStyle, cursor: editing ? "text" : "default", background: editing ? "#fff" : "#f8fafc" }}
                  onFocus={(e) => { if (editing) e.currentTarget.style.borderColor = "#0a2a6e"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; }}
                />
              </div>
              <div>
                <label style={labelStyle}>Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  readOnly={!editing}
                  style={{ ...inputStyle, cursor: editing ? "text" : "default", background: editing ? "#fff" : "#f8fafc" }}
                  onFocus={(e) => { if (editing) e.currentTarget.style.borderColor = "#0a2a6e"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; }}
                />
              </div>
              <div>
                <label style={labelStyle}>Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  readOnly={!editing}
                  style={{ ...inputStyle, cursor: editing ? "text" : "default", background: editing ? "#fff" : "#f8fafc" }}
                  onFocus={(e) => { if (editing) e.currentTarget.style.borderColor = "#0a2a6e"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; }}
                />
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{ ...btnPrimaryStyle, marginTop: 16, opacity: saving ? 0.6 : 1 }}
            >
              {saving ? <Loader2 style={{ width: 16, height: 16, ...spinnerStyle }} /> : <Save style={{ width: 16, height: 16 }} />}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

          {/* Recent Activity */}
          <div style={cardStyle}>
            <div style={sectionHeaderStyle}>
              <div style={sectionOverlayRadial} />
              <h3 style={{ color: "#fff", fontWeight: 600, fontSize: 18, margin: 0, position: "relative", zIndex: 1 }}>Recent Activity</h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {activityLoading ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
                  <Loader2 style={{ width: 24, height: 24, color: "#0a2a6e", ...spinnerStyle }} />
                </div>
              ) : recentActivity.length > 0 ? (
                recentActivity.map((activity, i) => {
                  const Icon = getActivityIcon(activity.action);
                  return (
                    <div key={activity.id || i} style={activityItemStyle}>
                      <div style={activityIconBoxStyle}>
                        <Icon style={{ width: 16, height: 16, color: "#64748b" }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ color: "#1a1a2e", fontSize: 13, margin: 0 }}>{activity.action}</p>
                      </div>
                      <span style={{ color: "#94a3b8", fontSize: 12 }}>{getTimeAgo(activity.timestamp)}</span>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: "center", padding: 32 }}>
                  <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>No recent activity</p>
                </div>
              )}
            </div>
          </div>

          {/* Security & Notifications Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24 }}>
            {/* Security */}
            <div style={cardStyle}>
              <div style={sectionHeaderStyle}>
                <div style={sectionOverlayRadial} />
                <h3 style={{ color: "#fff", fontWeight: 600, fontSize: 18, margin: 0, position: "relative", zIndex: 1 }}>Security</h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  style={securityBtnStyle}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#f1f5f9"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#f8fafc"; }}
                >
                  <Key style={{ width: 20, height: 20, color: "#64748b" }} />
                  <div>
                    <p style={{ color: "#1a1a2e", fontSize: 13, fontWeight: 500, margin: 0 }}>Change Password</p>
                    <p style={{ color: "#64748b", fontSize: 12, margin: "2px 0 0 0" }}>Last changed 3 days ago</p>
                  </div>
                </button>
                <button
                  onClick={() => setShow2FAModal(true)}
                  style={securityBtnStyle}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#f1f5f9"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#f8fafc"; }}
                >
                  <Shield style={{ width: 20, height: 20, color: "#64748b" }} />
                  <div>
                    <p style={{ color: "#1a1a2e", fontSize: 13, fontWeight: 500, margin: 0 }}>Two-Factor Auth</p>
                    <p style={{ color: "#64748b", fontSize: 12, margin: "2px 0 0 0" }}>Enabled</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Notifications */}
            <div style={cardStyle}>
              <div style={sectionHeaderStyle}>
                <div style={sectionOverlayRadial} />
                <h3 style={{ color: "#fff", fontWeight: 600, fontSize: 18, margin: 0, position: "relative", zIndex: 1 }}>Notifications</h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { key: "email" as const, label: "Email Notifications" },
                  { key: "sms" as const, label: "SMS Notifications" },
                  { key: "push" as const, label: "Push Notifications" },
                ].map((notif) => (
                  <div key={notif.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 12, borderRadius: 12, background: "#f8fafc" }}>
                    <span style={{ color: "#1a1a2e", fontSize: 13 }}>{notif.label}</span>
                    <button
                      type="button"
                      onClick={async () => {
                        const updated = { ...notifications, [notif.key]: !notifications[notif.key] };
                        setNotifications(updated);
                        toast.success(`${notif.label} ${notifications[notif.key] ? "disabled" : "enabled"}`);
                        try {
                          await fetch('/api/settings', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ type: 'notifications', settings: { email: updated.email, sms: updated.sms, push: updated.push } })
                          });
                        } catch {
                          // preferences update is best-effort
                        }
                      }}
                      style={toggleBg(notifications[notif.key])}
                    >
                      <div style={toggleDot(notifications[notif.key])} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div style={modalOverlayStyle} onClick={() => setShowPasswordModal(false)}>
          <div style={modalCardStyle} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderBannerStyle}>
              <div style={sectionOverlayRadial} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
                <h3 style={{ color: "#fff", fontWeight: 600, fontSize: 18, margin: 0 }}>Change Password</h3>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  style={modalCloseBtnStyle}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.35)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.2)"; }}
                >
                  <X style={{ width: 16, height: 16 }} />
                </button>
              </div>
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={labelStyle}>Current Password</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    style={inputStyle}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "#0a2a6e"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    style={inputStyle}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "#0a2a6e"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    style={inputStyle}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "#0a2a6e"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; }}
                  />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24, paddingTop: 16, borderTop: "1px solid #e2e8f0" }}>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  style={btnSecondaryStyle}
                >
                  Cancel
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={changingPassword}
                  style={{ ...btnPrimaryStyle, opacity: changingPassword ? 0.6 : 1 }}
                >
                  {changingPassword ? <Loader2 style={{ width: 16, height: 16, ...spinnerStyle }} /> : <Key style={{ width: 16, height: 16 }} />}
                  {changingPassword ? "Changing..." : "Change Password"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2FA Modal */}
      {show2FAModal && (
        <div style={modalOverlayStyle} onClick={() => setShow2FAModal(false)}>
          <div style={{ ...modalCardStyle, maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderBannerStyle}>
              <div style={sectionOverlayRadial} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
                <h3 style={{ color: "#fff", fontWeight: 600, fontSize: 18, margin: 0 }}>Two-Factor Authentication</h3>
                <button
                  onClick={() => setShow2FAModal(false)}
                  style={modalCloseBtnStyle}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.35)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.2)"; }}
                >
                  <X style={{ width: 16, height: 16 }} />
                </button>
              </div>
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 12, borderRadius: 12, background: "#f8fafc" }}>
                  <span style={{ color: "#1a1a2e", fontSize: 13 }}>Enable 2FA</span>
                  <button
                    type="button"
                    onClick={() => {
                      setTwoFAEnabled(!twoFAEnabled);
                      if (!twoFAEnabled) toast.success("2FA setup link will be sent to your email");
                    }}
                    style={toggleBg(twoFAEnabled)}
                  >
                    <div style={toggleDot(twoFAEnabled)} />
                  </button>
                </div>
                {twoFAEnabled && (
                  <p style={{ color: "#64748b", fontSize: 12, textAlign: "center", margin: 0 }}>
                    2FA setup link will be sent to your email address
                  </p>
                )}
                <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 16, borderTop: "1px solid #e2e8f0" }}>
                  <button onClick={() => setShow2FAModal(false)} style={{ ...btnSecondaryStyle, width: "100%", justifyContent: "center" }}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
          <Loader2 style={{ width: 32, height: 32, color: "#0a2a6e", animation: "spin 1s linear infinite" }} />
        </div>
      }
    >
      <ProfilePageInner />
    </Suspense>
  );
}
