"use client";

import { motion } from "framer-motion";
import {
  Settings,
  School,
  Calendar,
  GraduationCap,
  Bell,
  Shield,
  Users,
  Save,
  Globe,
  Palette,
} from "lucide-react";

const settingSections = [
  { title: "School Profile", icon: School, description: "School name, logo, address, and contact details" },
  { title: "Academic Year", icon: Calendar, description: "Terms, sessions, and holiday schedules" },
  { title: "Grading System", icon: GraduationCap, description: "Grade scales, CA weights, and pass marks" },
  { title: "Notifications", icon: Bell, description: "Email, SMS, and push notification settings" },
  { title: "User Roles", icon: Users, description: "Admin, teacher, student, and parent roles" },
  { title: "Security", icon: Shield, description: "Password policies and 2FA settings" },
];

const gradingConfig = [
  { grade: "A", min: 70, max: 100, points: 5, color: "text-emerald-400" },
  { grade: "B", min: 60, max: 69, points: 4, color: "text-blue-400" },
  { grade: "C", min: 50, max: 59, points: 3, color: "text-yellow-400" },
  { grade: "D", min: 40, max: 49, points: 2, color: "text-orange-400" },
  { grade: "F", min: 0, max: 39, points: 0, color: "text-red-400" },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-gradient-to-r from-[var(--primary)]/20 to-[var(--accent)]/10 border-[var(--primary)]/20"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">System Settings</h1>
            <p className="text-white/60">
              Configure school profile, academic year, grading, and notifications
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-all">
            <Save className="w-4 h-4" />
            Save Changes
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
          <h3 className="text-white font-semibold text-lg mb-4">Settings Menu</h3>
          <div className="space-y-2">
            {settingSections.map((section, i) => (
              <button
                key={i}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                  i === 0 ? "bg-[var(--primary)]/20 border border-[var(--primary)]/30" : "hover:bg-white/5"
                }`}
              >
                <section.icon className={`w-5 h-5 ${i === 0 ? "text-[var(--accent)]" : "text-white/40"}`} />
                <div>
                  <p className={`text-sm font-medium ${i === 0 ? "text-white" : "text-white/70"}`}>{section.title}</p>
                  <p className="text-white/40 text-xs">{section.description}</p>
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 card"
        >
          <h3 className="text-white font-semibold text-lg mb-6">School Profile</h3>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-white/60 text-sm mb-2 block">School Name</label>
                <input
                  type="text"
                  defaultValue="FFB Group of Schools"
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
              <div>
                <label className="text-white/60 text-sm mb-2 block">Motto</label>
                <input
                  type="text"
                  defaultValue="Excellence in Education"
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
            </div>
            <div>
              <label className="text-white/60 text-sm mb-2 block">Address</label>
              <input
                type="text"
                defaultValue="123 Education Road, Lagos, Nigeria"
                className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-white/60 text-sm mb-2 block">Phone</label>
                <input
                  type="text"
                  defaultValue="+234 801 234 5678"
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
              <div>
                <label className="text-white/60 text-sm mb-2 block">Email</label>
                <input
                  type="email"
                  defaultValue="admin@ffbschools.edu.ng"
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-white/60 text-sm mb-2 block">Current Session</label>
                <input
                  type="text"
                  defaultValue="2024/2025"
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
              <div>
                <label className="text-white/60 text-sm mb-2 block">Current Term</label>
                <select className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none">
                  <option>First Term</option>
                  <option>Second Term</option>
                  <option>Third Term</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10">
            <h4 className="text-white font-medium mb-4">Grading Scale</h4>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-white/50 text-sm font-medium pb-3">Grade</th>
                    <th className="text-left text-white/50 text-sm font-medium pb-3">Min %</th>
                    <th className="text-left text-white/50 text-sm font-medium pb-3">Max %</th>
                    <th className="text-left text-white/50 text-sm font-medium pb-3">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {gradingConfig.map((grade, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className={`py-2 font-bold ${grade.color}`}>{grade.grade}</td>
                      <td className="py-2 text-white/70 text-sm">{grade.min}</td>
                      <td className="py-2 text-white/70 text-sm">{grade.max}</td>
                      <td className="py-2 text-white/70 text-sm">{grade.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
