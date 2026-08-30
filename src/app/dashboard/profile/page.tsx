"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { SCHOOL_CONFIG } from "@/lib/school-config";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Shield,
  Bell,
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

export default function ProfilePage() {
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-gradient-to-r from-[#0a2a6e] to-[#0055ff] border-white/10 mt-8 p-8"
        style={{ background: "linear-gradient(to right, #0a2a6e, #0055ff)" }}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1a1a2e] mb-1">My Profile</h1>
            <p className="text-[#475569] text-[13px]">
              Manage your account settings, preferences, and personal information
            </p>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className="btn btn-primary"
          >
            <Edit className="w-4 h-4" />
            {editing ? "Cancel" : "Edit Profile"}
          </button>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card shadow-sm"
        >
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-5">
              {userImage ? (
                <img
                  src={userImage}
                  alt={userName}
                  className="w-28 h-28 rounded-full object-cover ring-4 ring-white shadow-lg"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white text-4xl font-bold ring-4 ring-white shadow-lg">
                  {initials}
                </div>
              )}
              <label className="absolute bottom-0 right-0 w-10 h-10 rounded-xl bg-[var(--primary)] flex items-center justify-center cursor-pointer hover:bg-[var(--blue-2)] transition-all shadow-lg border-2 border-white">
                <Camera className="w-4 h-4 text-white" />
                <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
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
            <h3 className="text-[#1a1a2e] text-xl font-bold">{userName}</h3>
            <p className="text-[var(--primary)] text-[13px] font-medium mt-1">{(session?.user as any)?.roles?.[0]?.name || "User"}</p>
          </div>

          <div className="mt-6 pt-6 border-t border-[#e2e8f0] space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-[#64748b]" />
              <span className="text-[#475569] text-[13px]">{userEmail || "No email"}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-[#64748b]" />
              <span className="text-[#475569] text-[13px]">{SCHOOL_CONFIG.phone}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-[#64748b]" />
              <span className="text-[#475569] text-[13px]">{SCHOOL_CONFIG.address}</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-[#64748b]" />
              <span className="text-[#475569] text-[13px]">Joined September 2018</span>
            </div>
            <div className="flex items-center gap-3">
              <Briefcase className="w-4 h-4 text-[#64748b]" />
              <span className="text-[#475569] text-[13px]">{(session?.user as any)?.roles?.[0]?.name || "User"}</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 space-y-6"
        >
          <div className="card shadow-sm">
            <h3 className="text-[#1a1a2e] font-semibold text-lg mb-6">Personal Information</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[#475569] text-[13px] mb-2 block">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  readOnly={!editing}
                  className="w-full px-4 py-2 rounded-xl bg-[#ffffff] border border-[#e2e8f0] text-[#1a1a2e] text-[13px] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
              <div>
                <label className="text-[#475569] text-[13px] mb-2 block">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  readOnly={!editing}
                  className="w-full px-4 py-2 rounded-xl bg-[#ffffff] border border-[#e2e8f0] text-[#1a1a2e] text-[13px] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
              <div>
                <label className="text-[#475569] text-[13px] mb-2 block">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  readOnly={!editing}
                  className="w-full px-4 py-2 rounded-xl bg-[#ffffff] border border-[#e2e8f0] text-[#1a1a2e] text-[13px] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
              <div>
                <label className="text-[#475569] text-[13px] mb-2 block">Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  readOnly={!editing}
                  className="w-full px-4 py-2 rounded-xl bg-[#ffffff] border border-[#e2e8f0] text-[#1a1a2e] text-[13px] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="mt-4 btn btn-primary disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

          <div className="card shadow-sm">
            <h3 className="text-[#1a1a2e] font-semibold text-lg mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {activityLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-[var(--primary)] animate-spin" />
                </div>
              ) : recentActivity.length > 0 ? (
                recentActivity.map((activity, i) => {
                  const Icon = getActivityIcon(activity.action);
                  return (
                    <div key={activity.id || i} className="flex items-center gap-4 p-3 rounded-xl bg-[#f8fafc]">
                      <div className="w-8 h-8 rounded-lg bg-[#f1f5f9] flex items-center justify-center">
                        <Icon className="w-4 h-4 text-[#64748b]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[#1a1a2e] text-[13px]">{activity.action}</p>
                      </div>
                      <span className="text-[#94a3b8] text-[12px]">{getTimeAgo(activity.timestamp)}</span>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <p className="text-[#64748b] text-[13px]">No recent activity</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="card shadow-sm">
              <h3 className="text-[#1a1a2e] font-semibold text-lg mb-4">Security</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#f8fafc] hover:bg-[#f1f5f9] transition-all text-left"
                >
                  <Key className="w-5 h-5 text-[#64748b]" />
                  <div>
                    <p className="text-[#1a1a2e] text-[13px] font-medium">Change Password</p>
                    <p className="text-[#64748b] text-[12px]">Last changed 3 days ago</p>
                  </div>
                </button>
                <button
                  onClick={() => setShow2FAModal(true)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#f8fafc] hover:bg-[#f1f5f9] transition-all text-left"
                >
                  <Shield className="w-5 h-5 text-[#64748b]" />
                  <div>
                    <p className="text-[#1a1a2e] text-[13px] font-medium">Two-Factor Auth</p>
                    <p className="text-[#64748b] text-[12px]">Enabled</p>
                  </div>
                </button>
              </div>
            </div>

            <div className="card shadow-sm">
              <h3 className="text-[#1a1a2e] font-semibold text-lg mb-4">Notifications</h3>
              <div className="space-y-3">
                {[
                  { key: "email" as const, label: "Email Notifications" },
                  { key: "sms" as const, label: "SMS Notifications" },
                  { key: "push" as const, label: "Push Notifications" },
                ].map((notif) => (
                  <div key={notif.key} className="flex items-center justify-between p-3 rounded-xl bg-[#f8fafc]">
                    <span className="text-[#1a1a2e] text-[13px]">{notif.label}</span>
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
                      className={`w-10 h-5 rounded-full relative cursor-pointer transition-all ${notifications[notif.key] ? "bg-[var(--accent)]" : "bg-[#e2e8f0]"}`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${notifications[notif.key] ? "left-[22px]" : "left-0.5"}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Change Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay bg-black/60 backdrop-blur-sm" onClick={() => setShowPasswordModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl mx-4 p-6 rounded-2xl bg-white border border-[#e2e8f0] shadow-2xl"
          
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[#1a1a2e] font-semibold text-lg">Change Password</h3>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="w-8 h-8 rounded-lg bg-[#f1f5f9] flex items-center justify-center text-[#64748b] hover:text-[#1a1a2e] hover:bg-[#e2e8f0] transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[#475569] text-[13px] mb-2 block">Current Password</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-[#ffffff] border border-[#e2e8f0] text-[#1a1a2e] text-[13px] focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="text-[#475569] text-[13px] mb-2 block">New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-[#ffffff] border border-[#e2e8f0] text-[#1a1a2e] text-[13px] focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="text-[#475569] text-[13px] mb-2 block">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-[#ffffff] border border-[#e2e8f0] text-[#1a1a2e] text-[13px] focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={changingPassword}
                  className="btn btn-primary disabled:opacity-50"
                >
                  {changingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                  {changingPassword ? "Changing..." : "Change Password"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {show2FAModal && (
        <div className="modal-overlay bg-black/60 backdrop-blur-sm" onClick={() => setShow2FAModal(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md mx-4 p-6 rounded-2xl bg-white border border-[#e2e8f0] shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[#1a1a2e] font-semibold text-lg">Two-Factor Authentication</h3>
              <button onClick={() => setShow2FAModal(false)} className="w-8 h-8 rounded-lg bg-[#f1f5f9] flex items-center justify-center text-[#64748b] hover:text-[#1a1a2e] hover:bg-[#e2e8f0] transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#f8fafc]">
                <span className="text-[#1a1a2e] text-[13px]">Enable 2FA</span>
                <button
                  type="button"
                  onClick={() => {
                    setTwoFAEnabled(!twoFAEnabled);
                    if (!twoFAEnabled) toast.success("2FA setup link will be sent to your email");
                  }}
                  className={`w-10 h-5 rounded-full relative cursor-pointer transition-all ${twoFAEnabled ? "bg-[var(--accent)]" : "bg-[#e2e8f0]"}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${twoFAEnabled ? "left-[22px]" : "left-0.5"}`} />
                </button>
              </div>
              {twoFAEnabled && (
                <p className="text-[#64748b] text-[12px] text-center">2FA setup link will be sent to your email address</p>
              )}
              <div className="modal-footer">
                <button onClick={() => setShow2FAModal(false)}
                  className="flex-1 btn btn-secondary">
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
