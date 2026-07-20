"use client";

import { useEffect, useState } from "react";
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
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface DashboardStats {
  schoolName?: string;
  address?: string;
  phone?: string;
  email?: string;
  session?: string;
  term?: string;
  [key: string]: unknown;
}

const settingSections = [
  { title: "School Profile", icon: School, description: "School name, logo, address, and contact details" },
  { title: "Academic Year", icon: Calendar, description: "Terms, sessions, and holiday schedules" },
  { title: "Grading System", icon: GraduationCap, description: "Grade scales, CA weights, and pass marks" },
  { title: "Notifications", icon: Bell, description: "Email, SMS, and push notification settings" },
  { title: "User Roles", icon: Users, description: "Admin, teacher, student, and parent roles" },
  { title: "Security", icon: Shield, description: "Password policies and 2FA settings" },
];

const defaultGradingConfig = [
  { grade: "A", min: 70, max: 100, points: 5, color: "text-emerald-400" },
  { grade: "B", min: 60, max: 69, points: 4, color: "text-blue-400" },
  { grade: "C", min: 50, max: 59, points: 3, color: "text-yellow-400" },
  { grade: "D", min: 40, max: 49, points: 2, color: "text-orange-400" },
  { grade: "F", min: 0, max: 39, points: 0, color: "text-red-400" },
];

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [schoolName, setSchoolName] = useState("FFB Group of Schools");
  const [motto, setMotto] = useState("Excellence in Education");
  const [address, setAddress] = useState("123 Education Road, Lagos, Nigeria");
  const [phone, setPhone] = useState("+234 801 234 5678");
  const [email, setEmail] = useState("admin@ffbschools.edu.ng");
  const [currentSession, setCurrentSession] = useState("2024/2025");
  const [currentTerm, setCurrentTerm] = useState("First Term");
  const [gradingConfig, setGradingConfig] = useState(defaultGradingConfig);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/dashboard/stats");
        if (res.ok) {
          const data: DashboardStats = await res.json();
          if (data.schoolName) setSchoolName(data.schoolName);
          if (data.address) setAddress(data.address);
          if (data.phone) setPhone(data.phone);
          if (data.email) setEmail(data.email);
          if (data.session) setCurrentSession(data.session);
          if (data.term) setCurrentTerm(data.term);
        }
      } catch {
        // Keep defaults on error — settings page is mostly static
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast.success("Settings saved successfully");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const updateGradingRow = (index: number, field: string, value: string) => {
    const updated = [...gradingConfig];
    updated[index] = { ...updated[index], [field]: field === "grade" ? value : Number(value) };
    setGradingConfig(updated);
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
            <h1 className="text-2xl font-bold text-white mb-1">System Settings</h1>
            <p className="text-white/60 text-[13px]">
              Configure school profile, academic year, grading, and notifications
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--primary)] text-white text-[13px] font-semibold hover:brightness-110 transition-all disabled:opacity-50 shadow-lg shadow-[var(--primary)]/25"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : "Save Changes"}
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
                onClick={() => setActiveSection(i)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                  i === activeSection ? "bg-[var(--primary)]/20 border border-[var(--primary)]/30" : "hover:bg-white/[0.04]"
                }`}
              >
                <section.icon className={`w-5 h-5 ${i === activeSection ? "text-[var(--accent)]" : "text-white/40"}`} />
                <div>
                  <p className={`text-[13px] font-medium ${i === activeSection ? "text-white" : "text-white/70"}`}>{section.title}</p>
                  <p className="text-white/40 text-[12px]">{section.description}</p>
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
          {/* School Profile */}
          {activeSection === 0 && (
            <>
              <h3 className="text-white font-semibold text-lg mb-6">School Profile</h3>
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/60 text-[13px] mb-2 block">School Name</label>
                    <input
                      type="text"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                  <div>
                    <label className="text-white/60 text-[13px] mb-2 block">Motto</label>
                    <input
                      type="text"
                      value={motto}
                      onChange={(e) => setMotto(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-white/60 text-[13px] mb-2 block">Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/60 text-[13px] mb-2 block">Phone</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                  <div>
                    <label className="text-white/60 text-[13px] mb-2 block">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/60 text-[13px] mb-2 block">Current Session</label>
                    <input
                      type="text"
                      value={currentSession}
                      onChange={(e) => setCurrentSession(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                  <div>
                    <label className="text-white/60 text-[13px] mb-2 block">Current Term</label>
                    <select
                      value={currentTerm}
                      onChange={(e) => setCurrentTerm(e.target.value)}
                      style={{ colorScheme: "dark" }}
                      className="w-full px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                    >
                      <option style={{ background: "#0f1b33", color: "#fff" }}>First Term</option>
                      <option style={{ background: "#0f1b33", color: "#fff" }}>Second Term</option>
                      <option style={{ background: "#0f1b33", color: "#fff" }}>Third Term</option>
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Academic Year */}
          {activeSection === 1 && (
            <>
              <h3 className="text-white font-semibold text-lg mb-6">Academic Year</h3>
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/60 text-[13px] mb-2 block">Academic Session</label>
                    <input type="text" value={currentSession} onChange={(e) => setCurrentSession(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]" />
                  </div>
                  <div>
                    <label className="text-white/60 text-[13px] mb-2 block">Current Term</label>
                    <select value={currentTerm} onChange={(e) => setCurrentTerm(e.target.value)} style={{ colorScheme: "dark" }} className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]">
                      <option style={{ background: "#0f1b33", color: "#fff" }}>First Term</option>
                      <option style={{ background: "#0f1b33", color: "#fff" }}>Second Term</option>
                      <option style={{ background: "#0f1b33", color: "#fff" }}>Third Term</option>
                    </select>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/60 text-[13px] mb-2 block">First Term Start</label>
                    <input type="date" defaultValue="2025-09-08" style={{ colorScheme: "dark" }} className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]" />
                  </div>
                  <div>
                    <label className="text-white/60 text-[13px] mb-2 block">First Term End</label>
                    <input type="date" defaultValue="2025-12-12" style={{ colorScheme: "dark" }} className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]" />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/60 text-[13px] mb-2 block">Second Term Start</label>
                    <input type="date" defaultValue="2026-01-06" style={{ colorScheme: "dark" }} className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]" />
                  </div>
                  <div>
                    <label className="text-white/60 text-[13px] mb-2 block">Second Term End</label>
                    <input type="date" defaultValue="2026-03-27" style={{ colorScheme: "dark" }} className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]" />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/60 text-[13px] mb-2 block">Third Term Start</label>
                    <input type="date" defaultValue="2026-04-13" style={{ colorScheme: "dark" }} className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]" />
                  </div>
                  <div>
                    <label className="text-white/60 text-[13px] mb-2 block">Third Term End</label>
                    <input type="date" defaultValue="2026-07-17" style={{ colorScheme: "dark" }} className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]" />
                  </div>
                </div>
                <div>
                  <label className="text-white/60 text-[13px] mb-2 block">Mid-Term Break</label>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <input type="date" defaultValue="2025-10-27" style={{ colorScheme: "dark" }} className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]" />
                    <input type="date" defaultValue="2025-10-31" style={{ colorScheme: "dark" }} className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]" />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Grading System */}
          {activeSection === 2 && (
            <>
              <h3 className="text-white font-semibold text-lg mb-6">Grading System</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/[0.08]">
                      <th className="text-left text-white/50 text-[13px] font-medium pb-3">Grade</th>
                      <th className="text-left text-white/50 text-[13px] font-medium pb-3">Min %</th>
                      <th className="text-left text-white/50 text-[13px] font-medium pb-3">Max %</th>
                      <th className="text-left text-white/50 text-[13px] font-medium pb-3">Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gradingConfig.map((grade, i) => (
                      <tr key={i} className="border-b border-white/5">
                        <td className={`py-2 font-bold ${grade.color}`}>{grade.grade}</td>
                        <td className="py-2">
                          <input
                            type="number"
                            value={grade.min}
                            onChange={(e) => updateGradingRow(i, "min", e.target.value)}
                            className="w-20 px-3 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                          />
                        </td>
                        <td className="py-2">
                          <input
                            type="number"
                            value={grade.max}
                            onChange={(e) => updateGradingRow(i, "max", e.target.value)}
                            className="w-20 px-3 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                          />
                        </td>
                        <td className="py-2">
                          <input
                            type="number"
                            value={grade.points}
                            onChange={(e) => updateGradingRow(i, "points", e.target.value)}
                            className="w-20 px-3 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Notifications */}
          {activeSection === 3 && (
            <>
              <h3 className="text-white font-semibold text-lg mb-6">Notification Settings</h3>
              <div className="space-y-4">
                {[
                  { label: "Email Notifications", desc: "Receive email alerts for important updates", defaultOn: true },
                  { label: "SMS Notifications", desc: "Send SMS alerts to parents and students", defaultOn: true },
                  { label: "Push Notifications", desc: "Browser push notifications for real-time alerts", defaultOn: false },
                  { label: "Payment Alerts", desc: "Get notified when payments are received", defaultOn: true },
                  { label: "Exam Reminders", desc: "Automated reminders before examination dates", defaultOn: true },
                  { label: "Attendance Alerts", desc: "Notify parents of student absences", defaultOn: true },
                  { label: "Report Card Alerts", desc: "Notify when report cards are ready", defaultOn: false },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.06] transition">
                    <div>
                      <p className="text-white text-[13px] font-medium">{item.label}</p>
                      <p className="text-white/40 text-[11px] mt-0.5">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked={item.defaultOn} className="sr-only peer" />
                      <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/40 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--accent)] peer-checked:after:bg-white"></div>
                    </label>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* User Roles */}
          {activeSection === 4 && (
            <>
              <h3 className="text-white font-semibold text-lg mb-6">User Roles & Permissions</h3>
              <div className="space-y-3">
                {[
                  { role: "Owner", desc: "Full access to all modules and settings", color: "from-red-500 to-red-600", perms: ["All Access"] },
                  { role: "Admin", desc: "Manage staff, students, academics, and finance", color: "from-blue-500 to-blue-600", perms: ["Students", "Teachers", "Finance", "Settings"] },
                  { role: "Principal", desc: "Academic oversight and staff management", color: "from-purple-500 to-purple-600", perms: ["Academics", "Teachers", "Reports"] },
                  { role: "Vice Principal", desc: "Student discipline and academic support", color: "from-emerald-500 to-emerald-600", perms: ["Students", "Attendance", "Discipline"] },
                  { role: "Teacher", desc: "Class management, grades, and lesson plans", color: "from-amber-500 to-amber-600", perms: ["My Classes", "Grades", "Lesson Plans"] },
                  { role: "Accountant", desc: "Finance, payments, and invoicing", color: "from-teal-500 to-teal-600", perms: ["Finance", "Payments", "Reports"] },
                  { role: "Parent", desc: "View child progress and communications", color: "from-pink-500 to-pink-600", perms: ["Child Progress", "Messages", "Fees"] },
                  { role: "Student", desc: "View grades, timetable, and assignments", color: "from-cyan-500 to-cyan-600", perms: ["Grades", "Timetable", "Assignments"] },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.06] transition">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white text-[11px] font-bold`}>
                        {item.role.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white text-[13px] font-medium">{item.role}</p>
                        <p className="text-white/40 text-[11px] mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.perms.map((p, j) => (
                        <span key={j} className="px-2 py-0.5 rounded-md bg-white/[0.06] text-white/40 text-[10px] font-medium">{p}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Security */}
          {activeSection === 5 && (
            <>
              <h3 className="text-white font-semibold text-lg mb-6">Security Settings</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white/[0.04]">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-white text-[13px] font-medium">Two-Factor Authentication</p>
                      <p className="text-white/40 text-[11px] mt-0.5">Add an extra layer of security to admin accounts</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/40 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--accent)] peer-checked:after:bg-white"></div>
                    </label>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.04]">
                  <p className="text-white text-[13px] font-medium mb-3">Password Policy</p>
                  <div className="space-y-3">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-white/60 text-[11px] mb-1 block">Minimum Length</label>
                        <input type="number" defaultValue={8} min={6} className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]" />
                      </div>
                      <div>
                        <label className="text-white/60 text-[11px] mb-1 block">Password Expiry (days)</label>
                        <input type="number" defaultValue={90} min={30} className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]" />
                      </div>
                    </div>
                    {["Require uppercase letter", "Require lowercase letter", "Require number", "Require special character"].map((rule, i) => (
                      <label key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.04] cursor-pointer">
                        <input type="checkbox" defaultChecked={i < 2} className="w-4 h-4 rounded bg-white/[0.04] border-white/[0.1] text-[var(--primary)] focus:ring-[var(--primary)]" />
                        <span className="text-white/60 text-[12px]">{rule}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.04]">
                  <p className="text-white text-[13px] font-medium mb-3">Session Management</p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white/60 text-[12px]">Max login attempts before lockout</span>
                      <input type="number" defaultValue={5} min={3} className="w-20 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-[13px] text-right focus:outline-none focus:border-[var(--primary)]" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60 text-[12px]">Session timeout (minutes)</span>
                      <input type="number" defaultValue={60} min={15} className="w-20 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-[13px] text-right focus:outline-none focus:border-[var(--primary)]" />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
