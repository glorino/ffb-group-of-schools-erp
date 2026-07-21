"use client";

import { useEffect, useState, useCallback } from "react";
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
  Plus,
  Trash2,
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

interface GradingGrade {
  grade: string;
  min: number;
  max: number;
  points: number;
  color: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  paymentAlerts: boolean;
  examReminders: boolean;
  attendanceAlerts: boolean;
  reportCardAlerts: boolean;
}

interface RoleAssignment {
  id: string;
  role: string;
  desc: string;
  color: string;
  permissions: string[];
}

interface AcademicYearData {
  session: string;
  term: string;
  firstTermStart: string;
  firstTermEnd: string;
  secondTermStart: string;
  secondTermEnd: string;
  thirdTermStart: string;
  thirdTermEnd: string;
  midTermBreakStart: string;
  midTermBreakEnd: string;
}

interface SchoolProfileData {
  schoolName: string;
  motto: string;
  address: string;
  phone: string;
  email: string;
}

const settingSections = [
  { title: "School Profile", icon: School, description: "School name, logo, address, and contact details" },
  { title: "Academic Year", icon: Calendar, description: "Terms, sessions, and holiday schedules" },
  { title: "Grading System", icon: GraduationCap, description: "Grade scales, CA weights, and pass marks" },
  { title: "Notifications", icon: Bell, description: "Email, SMS, and push notification settings" },
  { title: "User Roles", icon: Users, description: "Admin, teacher, student, and parent roles" },
  { title: "Security", icon: Shield, description: "Password policies and 2FA settings" },
];

const defaultGradingConfig: GradingGrade[] = [
  { grade: "A", min: 70, max: 100, points: 5, color: "text-emerald-400" },
  { grade: "B", min: 60, max: 69, points: 4, color: "text-blue-400" },
  { grade: "C", min: 50, max: 59, points: 3, color: "text-yellow-400" },
  { grade: "D", min: 40, max: 49, points: 2, color: "text-orange-400" },
  { grade: "F", min: 0, max: 39, points: 0, color: "text-red-400" },
];

const defaultRoles: RoleAssignment[] = [
  { id: "1", role: "Owner", desc: "Full access to all modules and settings", color: "from-red-500 to-red-600", permissions: ["All Access"] },
  { id: "2", role: "Admin", desc: "Manage staff, students, academics, and finance", color: "from-blue-500 to-blue-600", permissions: ["Students", "Teachers", "Finance", "Settings"] },
  { id: "3", role: "Principal", desc: "Academic oversight and staff management", color: "from-purple-500 to-purple-600", permissions: ["Academics", "Teachers", "Reports"] },
  { id: "4", role: "Vice Principal", desc: "Student discipline and academic support", color: "from-emerald-500 to-emerald-600", permissions: ["Students", "Attendance", "Discipline"] },
  { id: "5", role: "Teacher", desc: "Class management, grades, and lesson plans", color: "from-amber-500 to-amber-600", permissions: ["My Classes", "Grades", "Lesson Plans"] },
  { id: "6", role: "Accountant", desc: "Finance, payments, and invoicing", color: "from-teal-500 to-teal-600", permissions: ["Finance", "Payments", "Reports"] },
  { id: "7", role: "Parent", desc: "View child progress and communications", color: "from-pink-500 to-pink-600", permissions: ["Child Progress", "Messages", "Fees"] },
  { id: "8", role: "Student", desc: "View grades, timetable, and assignments", color: "from-cyan-500 to-cyan-600", permissions: ["Grades", "Timetable", "Assignments"] },
];

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(`settings_${key}`);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveToStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(`settings_${key}`, JSON.stringify(value));
  } catch {
    // silent fail
  }
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState(0);

  const [schoolProfile, setSchoolProfile] = useState<SchoolProfileData>({
    schoolName: "FFB Group of Schools",
    motto: "Excellence in Education",
    address: "123 Education Road, Lagos, Nigeria",
    phone: "+234 801 234 5678",
    email: "admin@ffbschools.edu.ng",
  });

  const [academicYear, setAcademicYear] = useState<AcademicYearData>({
    session: "2024/2025",
    term: "First Term",
    firstTermStart: "2025-09-08",
    firstTermEnd: "2025-12-12",
    secondTermStart: "2026-01-06",
    secondTermEnd: "2026-03-27",
    thirdTermStart: "2026-04-13",
    thirdTermEnd: "2026-07-17",
    midTermBreakStart: "2025-10-27",
    midTermBreakEnd: "2025-10-31",
  });

  const [gradingConfig, setGradingConfig] = useState<GradingGrade[]>(defaultGradingConfig);

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: false,
    paymentAlerts: true,
    examReminders: true,
    attendanceAlerts: true,
    reportCardAlerts: false,
  });

  const [roles, setRoles] = useState<RoleAssignment[]>(defaultRoles);

  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [changingPassword, setChangingPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [passwordPolicy, setPasswordPolicy] = useState({
    minLength: 8,
    expiryDays: 90,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: false,
    requireSpecial: false,
  });
  const [sessionPolicy, setSessionPolicy] = useState({ maxAttempts: 5, timeoutMinutes: 60 });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const savedProfile = loadFromStorage<SchoolProfileData>("schoolProfile", schoolProfile);
        const savedAcademicYear = loadFromStorage<AcademicYearData>("academicYear", academicYear);
        const savedGrading = loadFromStorage<GradingGrade[]>("gradingConfig", defaultGradingConfig);
        const savedNotifications = loadFromStorage<NotificationSettings>("notifications", notifications);
        const savedRoles = loadFromStorage<RoleAssignment[]>("roles", defaultRoles);
        const saved2fa = loadFromStorage<boolean>("twoFactorEnabled", false);
        const savedPasswordPolicy = loadFromStorage<typeof passwordPolicy>("passwordPolicy", passwordPolicy);
        const savedSessionPolicy = loadFromStorage<typeof sessionPolicy>("sessionPolicy", sessionPolicy);

        setSchoolProfile(savedProfile);
        setAcademicYear(savedAcademicYear);
        setGradingConfig(savedGrading);
        setNotifications(savedNotifications);
        setRoles(savedRoles);
        setTwoFactorEnabled(saved2fa);
        setPasswordPolicy(savedPasswordPolicy);
        setSessionPolicy(savedSessionPolicy);

        try {
          const res = await fetch("/api/dashboard/stats");
          if (res.ok) {
            const data: DashboardStats = await res.json();
            if (data.schoolName) setSchoolProfile((p) => ({ ...p, schoolName: data.schoolName! }));
            if (data.address) setSchoolProfile((p) => ({ ...p, address: data.address! }));
            if (data.phone) setSchoolProfile((p) => ({ ...p, phone: data.phone! }));
            if (data.email) setSchoolProfile((p) => ({ ...p, email: data.email! }));
            if (data.session) setAcademicYear((a) => ({ ...a, session: data.session! }));
            if (data.term) setAcademicYear((a) => ({ ...a, term: data.term! }));
          }
        } catch {
          // keep localStorage values
        }

        try {
          const res = await fetch("/api/roles");
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) setRoles(data);
          }
        } catch {
          // keep localStorage values
        }
      } catch {
        // keep defaults
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveAll = useCallback(async () => {
    setSaving(true);
    try {
      saveToStorage("schoolProfile", schoolProfile);
      saveToStorage("academicYear", academicYear);
      saveToStorage("gradingConfig", gradingConfig);
      saveToStorage("notifications", notifications);
      saveToStorage("roles", roles);
      saveToStorage("twoFactorEnabled", twoFactorEnabled);
      saveToStorage("passwordPolicy", passwordPolicy);
      saveToStorage("sessionPolicy", sessionPolicy);

      try {
        await fetch("/api/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ schoolProfile, academicYear, gradingConfig, notifications, roles }),
        });
      } catch {
        // localStorage already saved
      }

      toast.success("All settings saved successfully");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }, [schoolProfile, academicYear, gradingConfig, notifications, roles, twoFactorEnabled, passwordPolicy, sessionPolicy]);

  const saveSection = async (sectionName: string, data: any) => {
    try {
      saveToStorage(sectionName, data);
      try {
        await fetch(`/api/settings/${sectionName}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      } catch {
        // localStorage already saved
      }
      toast.success(`${sectionName} settings saved`);
    } catch {
      toast.error(`Failed to save ${sectionName} settings`);
    }
  };

  const handleSaveSchoolProfile = () => saveSection("schoolProfile", schoolProfile as unknown as Record<string, unknown>);
  const handleSaveAcademicYear = () => saveSection("academicYear", academicYear);
  const handleSaveGrading = () => saveSection("gradingConfig", gradingConfig);

  const handleSaveNotifications = () => saveSection("notifications", notifications);
  const handleSaveRoles = () => saveSection("roles", roles);

  const handleSavePasswordPolicy = () => {
    saveToStorage("passwordPolicy", passwordPolicy);
    saveToStorage("sessionPolicy", sessionPolicy);
    saveToStorage("twoFactorEnabled", twoFactorEnabled);
    toast.success("Security settings saved");
  };

  const handleChangePassword = async () => {
    if (!passwords.currentPassword || !passwords.newPassword) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwords.newPassword.length < passwordPolicy.minLength) {
      toast.error(`Password must be at least ${passwordPolicy.minLength} characters`);
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      });

      if (res.ok) {
        toast.success("Password changed successfully");
        setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Failed to change password");
      }
    } catch {
      toast.error("Failed to change password. Please try again.");
    } finally {
      setChangingPassword(false);
    }
  };

  const toggleNotification = (key: keyof NotificationSettings) => {
    setNotifications((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      return updated;
    });
  };

  const updateGradingRow = (index: number, field: string, value: string) => {
    const updated = [...gradingConfig];
    updated[index] = { ...updated[index], [field]: field === "grade" ? value : Number(value) };
    setGradingConfig(updated);
  };

  const addGradingRow = () => {
    const newGrade = String.fromCharCode(65 + gradingConfig.length);
    setGradingConfig((prev) => [
      ...prev,
      { grade: newGrade, min: 0, max: 0, points: 0, color: "text-white/60" },
    ]);
  };

  const removeGradingRow = (index: number) => {
    if (gradingConfig.length <= 1) {
      toast.error("Must have at least one grade");
      return;
    }
    setGradingConfig((prev) => prev.filter((_, i) => i !== index));
  };

  const updateRolePermissions = (roleId: string, permIndex: number, value: string) => {
    setRoles((prev) =>
      prev.map((r) => {
        if (r.id !== roleId) return r;
        const perms = [...r.permissions];
        perms[permIndex] = value;
        return { ...r, permissions: perms };
      })
    );
  };

  const addRolePermission = (roleId: string) => {
    setRoles((prev) =>
      prev.map((r) => {
        if (r.id !== roleId) return r;
        return { ...r, permissions: [...r.permissions, "New Permission"] };
      })
    );
  };

  const removeRolePermission = (roleId: string, permIndex: number) => {
    setRoles((prev) =>
      prev.map((r) => {
        if (r.id !== roleId) return r;
        const perms = r.permissions.filter((_, i) => i !== permIndex);
        return { ...r, permissions: perms };
      })
    );
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
            onClick={saveAll}
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
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold text-lg">School Profile</h3>
                <button
                  onClick={handleSaveSchoolProfile}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)]/80 text-white text-[13px] font-medium hover:bg-[var(--primary)] transition-all"
                >
                  <Save className="w-4 h-4" />
                  Save Profile
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/60 text-[13px] mb-2 block">School Name</label>
                    <input
                      type="text"
                      value={schoolProfile.schoolName}
                      onChange={(e) => setSchoolProfile((p) => ({ ...p, schoolName: e.target.value }))}
                      className="w-full px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                  <div>
                    <label className="text-white/60 text-[13px] mb-2 block">Motto</label>
                    <input
                      type="text"
                      value={schoolProfile.motto}
                      onChange={(e) => setSchoolProfile((p) => ({ ...p, motto: e.target.value }))}
                      className="w-full px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-white/60 text-[13px] mb-2 block">Address</label>
                  <input
                    type="text"
                    value={schoolProfile.address}
                    onChange={(e) => setSchoolProfile((p) => ({ ...p, address: e.target.value }))}
                    className="w-full px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/60 text-[13px] mb-2 block">Phone</label>
                    <input
                      type="text"
                      value={schoolProfile.phone}
                      onChange={(e) => setSchoolProfile((p) => ({ ...p, phone: e.target.value }))}
                      className="w-full px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                  <div>
                    <label className="text-white/60 text-[13px] mb-2 block">Email</label>
                    <input
                      type="email"
                      value={schoolProfile.email}
                      onChange={(e) => setSchoolProfile((p) => ({ ...p, email: e.target.value }))}
                      className="w-full px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Academic Year */}
          {activeSection === 1 && (
            <>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold text-lg">Academic Year</h3>
                <button
                  onClick={handleSaveAcademicYear}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)]/80 text-white text-[13px] font-medium hover:bg-[var(--primary)] transition-all"
                >
                  <Save className="w-4 h-4" />
                  Save Schedule
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/60 text-[13px] mb-2 block">Academic Session</label>
                    <input
                      type="text"
                      value={academicYear.session}
                      onChange={(e) => setAcademicYear((a) => ({ ...a, session: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                  <div>
                    <label className="text-white/60 text-[13px] mb-2 block">Current Term</label>
                    <select
                      value={academicYear.term}
                      onChange={(e) => setAcademicYear((a) => ({ ...a, term: e.target.value }))}
                      style={{ colorScheme: "dark" }}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                    >
                      <option style={{ background: "#0f1b33", color: "#fff" }}>First Term</option>
                      <option style={{ background: "#0f1b33", color: "#fff" }}>Second Term</option>
                      <option style={{ background: "#0f1b33", color: "#fff" }}>Third Term</option>
                    </select>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/60 text-[13px] mb-2 block">First Term Start</label>
                    <input
                      type="date"
                      value={academicYear.firstTermStart}
                      onChange={(e) => setAcademicYear((a) => ({ ...a, firstTermStart: e.target.value }))}
                      style={{ colorScheme: "dark" }}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                  <div>
                    <label className="text-white/60 text-[13px] mb-2 block">First Term End</label>
                    <input
                      type="date"
                      value={academicYear.firstTermEnd}
                      onChange={(e) => setAcademicYear((a) => ({ ...a, firstTermEnd: e.target.value }))}
                      style={{ colorScheme: "dark" }}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/60 text-[13px] mb-2 block">Second Term Start</label>
                    <input
                      type="date"
                      value={academicYear.secondTermStart}
                      onChange={(e) => setAcademicYear((a) => ({ ...a, secondTermStart: e.target.value }))}
                      style={{ colorScheme: "dark" }}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                  <div>
                    <label className="text-white/60 text-[13px] mb-2 block">Second Term End</label>
                    <input
                      type="date"
                      value={academicYear.secondTermEnd}
                      onChange={(e) => setAcademicYear((a) => ({ ...a, secondTermEnd: e.target.value }))}
                      style={{ colorScheme: "dark" }}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/60 text-[13px] mb-2 block">Third Term Start</label>
                    <input
                      type="date"
                      value={academicYear.thirdTermStart}
                      onChange={(e) => setAcademicYear((a) => ({ ...a, thirdTermStart: e.target.value }))}
                      style={{ colorScheme: "dark" }}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                  <div>
                    <label className="text-white/60 text-[13px] mb-2 block">Third Term End</label>
                    <input
                      type="date"
                      value={academicYear.thirdTermEnd}
                      onChange={(e) => setAcademicYear((a) => ({ ...a, thirdTermEnd: e.target.value }))}
                      style={{ colorScheme: "dark" }}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-white/60 text-[13px] mb-2 block">Mid-Term Break</label>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <input
                      type="date"
                      value={academicYear.midTermBreakStart}
                      onChange={(e) => setAcademicYear((a) => ({ ...a, midTermBreakStart: e.target.value }))}
                      style={{ colorScheme: "dark" }}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                    />
                    <input
                      type="date"
                      value={academicYear.midTermBreakEnd}
                      onChange={(e) => setAcademicYear((a) => ({ ...a, midTermBreakEnd: e.target.value }))}
                      style={{ colorScheme: "dark" }}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Grading System */}
          {activeSection === 2 && (
            <>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold text-lg">Grading System</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={addGradingRow}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.06] text-white/70 text-[13px] font-medium hover:bg-white/[0.1] transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Add Grade
                  </button>
                  <button
                    onClick={handleSaveGrading}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)]/80 text-white text-[13px] font-medium hover:bg-[var(--primary)] transition-all"
                  >
                    <Save className="w-4 h-4" />
                    Save Grades
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/[0.08]">
                      <th className="text-left text-white/50 text-[13px] font-medium pb-3">Grade</th>
                      <th className="text-left text-white/50 text-[13px] font-medium pb-3">Min %</th>
                      <th className="text-left text-white/50 text-[13px] font-medium pb-3">Max %</th>
                      <th className="text-left text-white/50 text-[13px] font-medium pb-3">Points</th>
                      <th className="text-left text-white/50 text-[13px] font-medium pb-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {gradingConfig.map((grade, i) => (
                      <tr key={i} className="border-b border-white/5">
                        <td className="py-2">
                          <input
                            type="text"
                            value={grade.grade}
                            onChange={(e) => updateGradingRow(i, "grade", e.target.value)}
                            className="w-16 px-3 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-[13px] font-bold focus:outline-none focus:border-[var(--primary)]"
                          />
                        </td>
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
                        <td className="py-2">
                          <button
                            onClick={() => removeGradingRow(i)}
                            className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold text-lg">Notification Settings</h3>
                <button
                  onClick={handleSaveNotifications}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)]/80 text-white text-[13px] font-medium hover:bg-[var(--primary)] transition-all"
                >
                  <Save className="w-4 h-4" />
                  Save Notifications
                </button>
              </div>
              <div className="space-y-4">
                {([
                  { key: "emailNotifications" as const, label: "Email Notifications", desc: "Receive email alerts for important updates" },
                  { key: "smsNotifications" as const, label: "SMS Notifications", desc: "Send SMS alerts to parents and students" },
                  { key: "pushNotifications" as const, label: "Push Notifications", desc: "Browser push notifications for real-time alerts" },
                  { key: "paymentAlerts" as const, label: "Payment Alerts", desc: "Get notified when payments are received" },
                  { key: "examReminders" as const, label: "Exam Reminders", desc: "Automated reminders before examination dates" },
                  { key: "attendanceAlerts" as const, label: "Attendance Alerts", desc: "Notify parents of student absences" },
                  { key: "reportCardAlerts" as const, label: "Report Card Alerts", desc: "Notify when report cards are ready" },
                ]).map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.06] transition">
                    <div>
                      <p className="text-white text-[13px] font-medium">{item.label}</p>
                      <p className="text-white/40 text-[11px] mt-0.5">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications[item.key]}
                        onChange={() => toggleNotification(item.key)}
                        className="sr-only peer"
                      />
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
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold text-lg">User Roles & Permissions</h3>
                <button
                  onClick={handleSaveRoles}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)]/80 text-white text-[13px] font-medium hover:bg-[var(--primary)] transition-all"
                >
                  <Save className="w-4 h-4" />
                  Save Roles
                </button>
              </div>
              <div className="space-y-3">
                {roles.map((item) => (
                  <div key={item.id} className="p-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.06] transition">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white text-[11px] font-bold`}>
                        {item.role.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-[13px] font-medium">{item.role}</p>
                        <p className="text-white/40 text-[11px] mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 ml-12">
                      {item.permissions.map((perm, j) => (
                        <div key={j} className="flex items-center gap-1">
                          <input
                            type="text"
                            value={perm}
                            onChange={(e) => updateRolePermissions(item.id, j, e.target.value)}
                            className="px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/[0.08] text-white/60 text-[10px] font-medium focus:outline-none focus:border-[var(--primary)] w-28"
                          />
                          <button
                            onClick={() => removeRolePermission(item.id, j)}
                            className="p-0.5 rounded text-white/20 hover:text-red-400 transition"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addRolePermission(item.id)}
                        className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-dashed border-white/10 text-white/30 text-[10px] hover:text-white/60 hover:border-white/20 transition"
                      >
                        + Add
                      </button>
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
                      <input
                        type="checkbox"
                        checked={twoFactorEnabled}
                        onChange={() => {
                          setTwoFactorEnabled((prev) => !prev);
                          toast.success(`Two-factor authentication ${!twoFactorEnabled ? "enabled" : "disabled"}`);
                        }}
                        className="sr-only peer"
                      />
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
                        <input
                          type="number"
                          value={passwordPolicy.minLength}
                          onChange={(e) => setPasswordPolicy((p) => ({ ...p, minLength: Number(e.target.value) }))}
                          min={6}
                          className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                        />
                      </div>
                      <div>
                        <label className="text-white/60 text-[11px] mb-1 block">Password Expiry (days)</label>
                        <input
                          type="number"
                          value={passwordPolicy.expiryDays}
                          onChange={(e) => setPasswordPolicy((p) => ({ ...p, expiryDays: Number(e.target.value) }))}
                          min={30}
                          className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                        />
                      </div>
                    </div>
                    {(["requireUppercase", "requireLowercase", "requireNumber", "requireSpecial"] as const).map((rule, i) => (
                      <label key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.04] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={passwordPolicy[rule]}
                          onChange={() => setPasswordPolicy((p) => ({ ...p, [rule]: !p[rule] }))}
                          className="w-4 h-4 rounded bg-white/[0.04] border-white/[0.1] text-[var(--primary)] focus:ring-[var(--primary)]"
                        />
                        <span className="text-white/60 text-[12px]">
                          {["Require uppercase letter", "Require lowercase letter", "Require number", "Require special character"][i]}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.04]">
                  <p className="text-white text-[13px] font-medium mb-3">Session Management</p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white/60 text-[12px]">Max login attempts before lockout</span>
                      <input
                        type="number"
                        value={sessionPolicy.maxAttempts}
                        onChange={(e) => setSessionPolicy((p) => ({ ...p, maxAttempts: Number(e.target.value) }))}
                        min={3}
                        className="w-20 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-[13px] text-right focus:outline-none focus:border-[var(--primary)]"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60 text-[12px]">Session timeout (minutes)</span>
                      <input
                        type="number"
                        value={sessionPolicy.timeoutMinutes}
                        onChange={(e) => setSessionPolicy((p) => ({ ...p, timeoutMinutes: Number(e.target.value) }))}
                        min={15}
                        className="w-20 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-[13px] text-right focus:outline-none focus:border-[var(--primary)]"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.04]">
                  <p className="text-white text-[13px] font-medium mb-3">Change Password</p>
                  <div className="space-y-3">
                    <div>
                      <label className="text-white/60 text-[11px] mb-1 block">Current Password</label>
                      <input
                        type="password"
                        value={passwords.currentPassword}
                        onChange={(e) => setPasswords((p) => ({ ...p, currentPassword: e.target.value }))}
                        placeholder="Enter current password"
                        className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-[13px] placeholder:text-white/20 focus:outline-none focus:border-[var(--primary)]"
                      />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-white/60 text-[11px] mb-1 block">New Password</label>
                        <input
                          type="password"
                          value={passwords.newPassword}
                          onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))}
                          placeholder="Enter new password"
                          className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-[13px] placeholder:text-white/20 focus:outline-none focus:border-[var(--primary)]"
                        />
                      </div>
                      <div>
                        <label className="text-white/60 text-[11px] mb-1 block">Confirm New Password</label>
                        <input
                          type="password"
                          value={passwords.confirmPassword}
                          onChange={(e) => setPasswords((p) => ({ ...p, confirmPassword: e.target.value }))}
                          placeholder="Confirm new password"
                          className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-[13px] placeholder:text-white/20 focus:outline-none focus:border-[var(--primary)]"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleChangePassword}
                      disabled={changingPassword}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)]/80 text-white text-[13px] font-medium hover:bg-[var(--primary)] transition-all disabled:opacity-50"
                    >
                      {changingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                      {changingPassword ? "Changing..." : "Change Password"}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSavePasswordPolicy}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)]/80 text-white text-[13px] font-medium hover:bg-[var(--primary)] transition-all"
                  >
                    <Save className="w-4 h-4" />
                    Save Security Settings
                  </button>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
