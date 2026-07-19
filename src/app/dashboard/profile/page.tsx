"use client";

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
} from "lucide-react";

const profileData = {
  name: "Dr. Adebayo Johnson",
  role: "Super Administrator",
  email: "admin@ffbschools.edu.ng",
  phone: "+234 801 234 5678",
  address: "12 Education Lane, Victoria Island, Lagos",
  joinDate: "September 2018",
  department: "Administration",
  employeeId: "FFB-ADMIN-001",
};

const recentActivity = [
  { action: "Updated student records", time: "2 hours ago", icon: User },
  { action: "Approved payment of ₦2.5M", time: "4 hours ago", icon: Briefcase },
  { action: "Generated term report", time: "1 day ago", icon: GraduationCap },
  { action: "Changed password", time: "3 days ago", icon: Key },
];

export default function ProfilePage() {
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
            <p className="text-white/60">
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
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white text-3xl font-bold">
                AJ
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-white">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <h3 className="text-white text-xl font-bold">{profileData.name}</h3>
            <p className="text-white/60 text-sm">{profileData.role}</p>
            <p className="text-white/40 text-xs mt-1">{profileData.employeeId}</p>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-white/40" />
              <span className="text-white/70 text-sm">{profileData.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-white/40" />
              <span className="text-white/70 text-sm">{profileData.phone}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-white/40" />
              <span className="text-white/70 text-sm">{profileData.address}</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-white/40" />
              <span className="text-white/70 text-sm">Joined {profileData.joinDate}</span>
            </div>
            <div className="flex items-center gap-3">
              <Briefcase className="w-4 h-4 text-white/40" />
              <span className="text-white/70 text-sm">{profileData.department}</span>
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
                <label className="text-white/60 text-sm mb-2 block">Full Name</label>
                <input
                  type="text"
                  defaultValue={profileData.name}
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
              <div>
                <label className="text-white/60 text-sm mb-2 block">Email</label>
                <input
                  type="email"
                  defaultValue={profileData.email}
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
              <div>
                <label className="text-white/60 text-sm mb-2 block">Phone</label>
                <input
                  type="tel"
                  defaultValue={profileData.phone}
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
              <div>
                <label className="text-white/60 text-sm mb-2 block">Address</label>
                <input
                  type="text"
                  defaultValue={profileData.address}
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[var(--primary)]"
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
              {recentActivity.map((activity, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/5">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                    <activity.icon className="w-4 h-4 text-white/40" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm">{activity.action}</p>
                  </div>
                  <span className="text-white/30 text-xs">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-white font-semibold text-lg mb-4">Security</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/[0.08] transition-all text-left">
                  <Key className="w-5 h-5 text-white/40" />
                  <div>
                    <p className="text-white text-sm font-medium">Change Password</p>
                    <p className="text-white/40 text-xs">Last changed 3 days ago</p>
                  </div>
                </button>
                <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/[0.08] transition-all text-left">
                  <Shield className="w-5 h-5 text-white/40" />
                  <div>
                    <p className="text-white text-sm font-medium">Two-Factor Auth</p>
                    <p className="text-white/40 text-xs">Enabled</p>
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
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                    <span className="text-white text-sm">{notif.label}</span>
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
