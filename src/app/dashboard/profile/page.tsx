"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { toast } from "sonner";

interface ActivityLog {
  id: string;
  action: string;
  timestamp: string;
  [key: string]: unknown;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);

  const userName = (session?.user as Record<string, unknown>)?.name as string || "User";
  const userEmail = (session?.user as Record<string, unknown>)?.email as string || "";
  const userImage = (session?.user as Record<string, unknown>)?.image as string || "";
  const userId = (session?.user as Record<string, unknown>)?.id as string || "FFB-001";

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
        className="card bg-gradient-to-r from-[var(--primary)]/20 to-[var(--accent)]/10 border-[var(--primary)]/20"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">My Profile</h1>
            <p className="text-white/60 text-[13px]">
              Manage your account settings, preferences, and personal information
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-all">
            <Edit className="w-4 h-4" />
            Edit Profile
          </button>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              {userImage ? (
                <img
                  src={userImage}
                  alt={userName}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white text-3xl font-bold">
                  {initials}
                </div>
              )}
              <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-white">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <h3 className="text-white text-xl font-bold">{userName}</h3>
            <p className="text-white/60 text-[13px]">Administrator</p>
            <p className="text-white/40 text-[12px] mt-1">{userId}</p>
          </div>

          <div className="mt-6 pt-6 border-t border-white/[0.08] space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-white/40" />
              <span className="text-white/70 text-[13px]">{userEmail || "No email"}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-white/40" />
              <span className="text-white/70 text-[13px]">+234 801 234 5678</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-white/40" />
              <span className="text-white/70 text-[13px]">12 Education Lane, Victoria Island, Lagos</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-white/40" />
              <span className="text-white/70 text-[13px]">Joined September 2018</span>
            </div>
            <div className="flex items-center gap-3">
              <Briefcase className="w-4 h-4 text-white/40" />
              <span className="text-white/70 text-[13px]">Administration</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 space-y-6"
        >
          <div className="card">
            <h3 className="text-white font-semibold text-lg mb-6">Personal Information</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-white/60 text-[13px] mb-2 block">Full Name</label>
                <input
                  type="text"
                  defaultValue={userName}
                  className="w-full px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
              <div>
                <label className="text-white/60 text-[13px] mb-2 block">Email</label>
                <input
                  type="email"
                  defaultValue={userEmail}
                  className="w-full px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
              <div>
                <label className="text-white/60 text-[13px] mb-2 block">Phone</label>
                <input
                  type="tel"
                  defaultValue="+234 801 234 5678"
                  className="w-full px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
              <div>
                <label className="text-white/60 text-[13px] mb-2 block">Address</label>
                <input
                  type="text"
                  defaultValue="12 Education Lane, Victoria Island, Lagos"
                  className="w-full px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
            </div>
            <button className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-all">
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>

          <div className="card">
            <h3 className="text-white font-semibold text-lg mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {activityLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-[var(--primary)] animate-spin" />
                </div>
              ) : recentActivity.length > 0 ? (
                recentActivity.map((activity, i) => {
                  const Icon = getActivityIcon(activity.action);
                  return (
                    <div key={activity.id || i} className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.04]">
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-white/40" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-[13px]">{activity.action}</p>
                      </div>
                      <span className="text-white/30 text-[12px]">{getTimeAgo(activity.timestamp)}</span>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <p className="text-white/40 text-[13px]">No recent activity</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-white font-semibold text-lg mb-4">Security</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] transition-all text-left">
                  <Key className="w-5 h-5 text-white/40" />
                  <div>
                    <p className="text-white text-[13px] font-medium">Change Password</p>
                    <p className="text-white/40 text-[12px]">Last changed 3 days ago</p>
                  </div>
                </button>
                <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] transition-all text-left">
                  <Shield className="w-5 h-5 text-white/40" />
                  <div>
                    <p className="text-white text-[13px] font-medium">Two-Factor Auth</p>
                    <p className="text-white/40 text-[12px]">Enabled</p>
                  </div>
                </button>
              </div>
            </div>

            <div className="card">
              <h3 className="text-white font-semibold text-lg mb-4">Notifications</h3>
              <div className="space-y-3">
                {[
                  { label: "Email Notifications", enabled: true },
                  { label: "SMS Notifications", enabled: false },
                  { label: "Push Notifications", enabled: true },
                ].map((notif, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04]">
                    <span className="text-white text-[13px]">{notif.label}</span>
                    <div className={`w-10 h-5 rounded-full relative cursor-pointer transition-all ${notif.enabled ? "bg-[var(--accent)]" : "bg-white/20"}`}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${notif.enabled ? "left-[22px]" : "left-0.5"}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
