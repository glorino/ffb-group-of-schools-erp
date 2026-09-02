"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import {
  Settings,
  School,
  Calendar,
  GraduationCap,
  Bell,
  Shield,
  Users,
  Save,
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
  { grade: "A", min: 70, max: 100, points: 5, color: "#16a34a" },
  { grade: "B", min: 60, max: 69, points: 4, color: "#2563eb" },
  { grade: "C", min: 50, max: 59, points: 3, color: "#ca8a04" },
  { grade: "D", min: 40, max: 49, points: 2, color: "#f97316" },
  { grade: "F", min: 0, max: 39, points: 0, color: "#dc2626" },
];

const defaultRoles: RoleAssignment[] = [
  { id: "1", role: "Owner", desc: "Full access to all modules and settings", color: "#dc2626", permissions: ["All Access"] },
  { id: "2", role: "Admin", desc: "Manage staff, students, academics, and finance", color: "#2563eb", permissions: ["Students", "Teachers", "Finance", "Settings"] },
  { id: "3", role: "Principal", desc: "Academic oversight and staff management", color: "#9333ea", permissions: ["Academics", "Teachers", "Reports"] },
  { id: "4", role: "Vice Principal", desc: "Student discipline and academic support", color: "#059669", permissions: ["Students", "Attendance", "Discipline"] },
  { id: "5", role: "Teacher", desc: "Class management, grades, and lesson plans", color: "#d97706", permissions: ["My Classes", "Grades", "Lesson Plans"] },
  { id: "6", role: "Accountant", desc: "Finance, payments, and invoicing", color: "#0d9488", permissions: ["Finance", "Payments", "Reports"] },
  { id: "7", role: "Parent", desc: "View child progress and communications", color: "#ec4899", permissions: ["Child Progress", "Messages", "Fees"] },
  { id: "8", role: "Student", desc: "View grades, timetable, and assignments", color: "#06b6d4", permissions: ["Grades", "Timetable", "Assignments"] },
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

const ROLES_PER_PAGE = 20;

const headerStyle: React.CSSProperties = {
  marginTop: "32px",
  borderRadius: "20px",
  padding: "32px 36px",
  background: "linear-gradient(135deg, #0a2a6e, #0055ff)",
  position: "relative",
  overflow: "hidden",
};

const cardStyle: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: "16px",
  border: "1px solid #e2e8f0",
  padding: "24px 28px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  borderRadius: "10px",
  border: "2px solid #e5e7eb",
  background: "#ffffff",
  fontSize: "13px",
  color: "#0f172a",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
};

const labelStyle: React.CSSProperties = {
  fontSize: "13px",
  color: "#475569",
  marginBottom: "6px",
  display: "block",
  fontWeight: 500,
};

const smallLabelStyle: React.CSSProperties = {
  fontSize: "11px",
  color: "#475569",
  marginBottom: "4px",
  display: "block",
  fontWeight: 500,
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: "15px",
  fontWeight: 700,
  color: "#0f172a",
  margin: "0 0 18px",
};

const btnPrimaryStyle: React.CSSProperties = {
  padding: "10px 20px",
  borderRadius: "12px",
  background: "linear-gradient(135deg, #0a2a6e, #0055ff)",
  color: "#ffffff",
  fontSize: "13px",
  fontWeight: 600,
  border: "none",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  boxShadow: "0 2px 8px rgba(0,85,255,0.25)",
  transition: "transform 0.15s, box-shadow 0.15s",
};

const btnSecondaryStyle: React.CSSProperties = {
  padding: "10px 20px",
  borderRadius: "12px",
  background: "#f8fafc",
  color: "#475569",
  fontSize: "13px",
  fontWeight: 600,
  border: "1px solid #e2e8f0",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  transition: "background 0.15s",
};

const tabStyle = (isActive: boolean): React.CSSProperties => ({
  width: "100%",
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "10px 12px",
  borderRadius: "10px",
  cursor: "pointer",
  textAlign: "left" as const,
  border: isActive ? "1px solid rgba(0,85,255,0.2)" : "1px solid transparent",
  background: isActive ? "rgba(0,85,255,0.08)" : "transparent",
  transition: "all 0.15s",
  fontSize: "13px",
  fontWeight: 500,
});

const tableThStyle: React.CSSProperties = {
  textAlign: "left",
  fontSize: "11px",
  fontWeight: 600,
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  color: "#64748b",
  padding: "10px 12px",
  borderBottom: "2px solid #e2e8f0",
  background: "#f8fafc",
};

const tableTdStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderBottom: "1px solid #f1f5f9",
};

const toggleTrackStyle: React.CSSProperties = {
  width: "44px",
  height: "24px",
  borderRadius: "12px",
  position: "relative",
  cursor: "pointer",
  transition: "background 0.2s",
  flexShrink: 0,
};

const toggleThumbStyle: React.CSSProperties = {
  width: "18px",
  height: "18px",
  borderRadius: "50%",
  background: "#ffffff",
  position: "absolute",
  top: "3px",
  transition: "transform 0.2s, left 0.2s",
  boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
};

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <div
      onClick={disabled ? undefined : onChange}
      style={{
        ...toggleTrackStyle,
        background: checked ? "#0055ff" : "#e2e8f0",
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      <div style={{ ...toggleThumbStyle, left: checked ? "23px" : "3px" }} />
    </div>
  );
}

export function SettingsPageInner() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [rolesPage, setRolesPage] = useState(1);

  const [schoolProfile, setSchoolProfile] = useState<SchoolProfileData>({
    schoolName: "",
    motto: "",
    address: "",
    phone: "",
    email: "",
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
        try {
          const res = await fetch("/api/settings");
          if (res.ok) {
            const data = await res.json();
            if (data.schoolProfile) setSchoolProfile(data.schoolProfile);
            if (data.settings?.academicYear) setAcademicYear(data.settings.academicYear);
            if (data.gradingScales?.length) {
              setGradingConfig(data.gradingScales.map((g: any) => ({
                label: g.grade || g.name,
                min: g.minScore,
                max: g.maxScore,
                gpa: g.gpa || 0,
              })));
            }
            if (data.settings?.notifications) setNotifications(data.settings.notifications);
          }
        } catch {}

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
        } catch {}

        try {
          const res = await fetch("/api/roles");
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) setRoles(data);
          }
        } catch {}
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
      } catch {}

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
        await fetch("/api/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ [sectionName]: data }),
        });
      } catch {}
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

  const handleSavePasswordPolicy = async () => {
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passwordPolicy,
          sessionPolicy,
          twoFactorEnabled,
        }),
      });
      saveToStorage("passwordPolicy", passwordPolicy);
      saveToStorage("sessionPolicy", sessionPolicy);
      saveToStorage("twoFactorEnabled", twoFactorEnabled);
      toast.success("Security settings saved");
    } catch {
      toast.error("Failed to save security settings");
    }
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
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
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
      { grade: newGrade, min: 0, max: 0, points: 0, color: "#475569" },
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

  const rolesTotalPages = Math.max(1, Math.ceil(roles.length / ROLES_PER_PAGE));
  const rolesStartIdx = (rolesPage - 1) * ROLES_PER_PAGE;
  const pagedRoles = roles.slice(rolesStartIdx, rolesStartIdx + ROLES_PER_PAGE);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <Loader2 style={{ width: "32px", height: "32px", color: "#0055ff", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  return (
    <div style={{ padding: "0 16px 32px", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 60%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 10% 80%, rgba(255,255,255,0.05) 0%, transparent 50%)" }} />
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", position: "relative", zIndex: 1 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "26px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em" }}>System Settings</h1>
            <p style={{ margin: "6px 0 0", fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>
              Configure school profile, academic year, grading, and notifications
            </p>
          </div>
          <button
            onClick={saveAll}
            disabled={saving}
            style={{
              ...btnPrimaryStyle,
              opacity: saving ? 0.7 : 1,
              padding: "12px 28px",
              fontSize: "14px",
            }}
          >
            {saving ? <Loader2 style={{ width: "16px", height: "16px", animation: "spin 1s linear infinite" }} /> : <Save style={{ width: "16px", height: "16px" }} />}
            {saving ? "Saving..." : "Save All Changes"}
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "20px", marginTop: "20px" }}>
        {/* Sidebar Menu */}
        <div style={{ ...cardStyle, padding: "20px", alignSelf: "start", position: "sticky", top: "20px" }}>
          <h3 style={{ margin: "0 0 14px", fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>Settings Menu</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {settingSections.map((section, i) => {
              const Icon = section.icon;
              const isActive = i === activeSection;
              return (
                <button
                  key={i}
                  onClick={() => setActiveSection(i)}
                  style={tabStyle(isActive)}
                >
                  <Icon style={{ width: "18px", height: "18px", color: isActive ? "#0055ff" : "#94a3b8", flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: "13px", fontWeight: 500, color: isActive ? "#0f172a" : "#64748b" }}>{section.title}</p>
                    <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#94a3b8" }}>{section.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div style={{ ...cardStyle, padding: "28px", minHeight: "500px" }}>
          {/* School Profile */}
          {activeSection === 0 && (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>School Profile</h3>
                <button onClick={handleSaveSchoolProfile} style={btnPrimaryStyle}>
                  <Save style={{ width: "14px", height: "14px" }} />
                  Save Profile
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={labelStyle}>School Name</label>
                    <input type="text" value={schoolProfile.schoolName} onChange={(e) => setSchoolProfile((p) => ({ ...p, schoolName: e.target.value }))} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Motto</label>
                    <input type="text" value={schoolProfile.motto} onChange={(e) => setSchoolProfile((p) => ({ ...p, motto: e.target.value }))} style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Address</label>
                  <input type="text" value={schoolProfile.address} onChange={(e) => setSchoolProfile((p) => ({ ...p, address: e.target.value }))} style={inputStyle} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={labelStyle}>Phone</label>
                    <input type="text" value={schoolProfile.phone} onChange={(e) => setSchoolProfile((p) => ({ ...p, phone: e.target.value }))} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Email</label>
                    <input type="email" value={schoolProfile.email} onChange={(e) => setSchoolProfile((p) => ({ ...p, email: e.target.value }))} style={inputStyle} />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Academic Year */}
          {activeSection === 1 && (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>Academic Year</h3>
                <button onClick={handleSaveAcademicYear} style={btnPrimaryStyle}>
                  <Save style={{ width: "14px", height: "14px" }} />
                  Save Schedule
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={labelStyle}>Academic Session</label>
                    <input type="text" value={academicYear.session} onChange={(e) => setAcademicYear((a) => ({ ...a, session: e.target.value }))} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Current Term</label>
                    <select
                      value={academicYear.term}
                      onChange={(e) => setAcademicYear((a) => ({ ...a, term: e.target.value }))}
                      style={{ ...inputStyle, cursor: "pointer", colorScheme: "light" }}
                    >
                      <option style={{ background: "#ffffff", color: "#1a1a2e" }}>First Term</option>
                      <option style={{ background: "#ffffff", color: "#1a1a2e" }}>Second Term</option>
                      <option style={{ background: "#ffffff", color: "#1a1a2e" }}>Third Term</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={labelStyle}>First Term Start</label>
                    <input type="date" value={academicYear.firstTermStart} onChange={(e) => setAcademicYear((a) => ({ ...a, firstTermStart: e.target.value }))} style={{ ...inputStyle, colorScheme: "light" }} />
                  </div>
                  <div>
                    <label style={labelStyle}>First Term End</label>
                    <input type="date" value={academicYear.firstTermEnd} onChange={(e) => setAcademicYear((a) => ({ ...a, firstTermEnd: e.target.value }))} style={{ ...inputStyle, colorScheme: "light" }} />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={labelStyle}>Second Term Start</label>
                    <input type="date" value={academicYear.secondTermStart} onChange={(e) => setAcademicYear((a) => ({ ...a, secondTermStart: e.target.value }))} style={{ ...inputStyle, colorScheme: "light" }} />
                  </div>
                  <div>
                    <label style={labelStyle}>Second Term End</label>
                    <input type="date" value={academicYear.secondTermEnd} onChange={(e) => setAcademicYear((a) => ({ ...a, secondTermEnd: e.target.value }))} style={{ ...inputStyle, colorScheme: "light" }} />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={labelStyle}>Third Term Start</label>
                    <input type="date" value={academicYear.thirdTermStart} onChange={(e) => setAcademicYear((a) => ({ ...a, thirdTermStart: e.target.value }))} style={{ ...inputStyle, colorScheme: "light" }} />
                  </div>
                  <div>
                    <label style={labelStyle}>Third Term End</label>
                    <input type="date" value={academicYear.thirdTermEnd} onChange={(e) => setAcademicYear((a) => ({ ...a, thirdTermEnd: e.target.value }))} style={{ ...inputStyle, colorScheme: "light" }} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Mid-Term Break</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <input type="date" value={academicYear.midTermBreakStart} onChange={(e) => setAcademicYear((a) => ({ ...a, midTermBreakStart: e.target.value }))} style={{ ...inputStyle, colorScheme: "light" }} />
                    <input type="date" value={academicYear.midTermBreakEnd} onChange={(e) => setAcademicYear((a) => ({ ...a, midTermBreakEnd: e.target.value }))} style={{ ...inputStyle, colorScheme: "light" }} />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Grading System */}
          {activeSection === 2 && (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>Grading System</h3>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <button onClick={addGradingRow} style={btnSecondaryStyle}>
                    <Plus style={{ width: "14px", height: "14px" }} />
                    Add Grade
                  </button>
                  <button onClick={handleSaveGrading} style={btnPrimaryStyle}>
                    <Save style={{ width: "14px", height: "14px" }} />
                    Save Grades
                  </button>
                </div>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" as const }}>
                  <thead>
                    <tr>
                      <th style={tableThStyle}>Grade</th>
                      <th style={tableThStyle}>Min %</th>
                      <th style={tableThStyle}>Max %</th>
                      <th style={tableThStyle}>Points</th>
                      <th style={{ ...tableThStyle, width: "48px" }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {gradingConfig.map((grade, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.15s" }} onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#f8fafc"; }} onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                        <td style={tableTdStyle}>
                          <input
                            type="text"
                            value={grade.grade}
                            onChange={(e) => updateGradingRow(i, "grade", e.target.value)}
                            style={{ width: "60px", padding: "8px 12px", borderRadius: "8px", border: "2px solid #e5e7eb", background: "#ffffff", fontSize: "13px", fontWeight: 700, color: "#0f172a", outline: "none" }}
                          />
                        </td>
                        <td style={tableTdStyle}>
                          <input
                            type="number"
                            value={grade.min}
                            onChange={(e) => updateGradingRow(i, "min", e.target.value)}
                            style={{ width: "80px", padding: "8px 12px", borderRadius: "8px", border: "2px solid #e5e7eb", background: "#ffffff", fontSize: "13px", color: "#0f172a", outline: "none" }}
                          />
                        </td>
                        <td style={tableTdStyle}>
                          <input
                            type="number"
                            value={grade.max}
                            onChange={(e) => updateGradingRow(i, "max", e.target.value)}
                            style={{ width: "80px", padding: "8px 12px", borderRadius: "8px", border: "2px solid #e5e7eb", background: "#ffffff", fontSize: "13px", color: "#0f172a", outline: "none" }}
                          />
                        </td>
                        <td style={tableTdStyle}>
                          <input
                            type="number"
                            value={grade.points}
                            onChange={(e) => updateGradingRow(i, "points", e.target.value)}
                            style={{ width: "80px", padding: "8px 12px", borderRadius: "8px", border: "2px solid #e5e7eb", background: "#ffffff", fontSize: "13px", color: "#0f172a", outline: "none" }}
                          />
                        </td>
                        <td style={tableTdStyle}>
                          <button
                            onClick={() => removeGradingRow(i)}
                            style={{ width: "32px", height: "32px", borderRadius: "8px", border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", transition: "all 0.15s" }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = "#dc2626"; e.currentTarget.style.background = "rgba(220,38,38,0.08)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = "#94a3b8"; e.currentTarget.style.background = "transparent"; }}
                          >
                            <Trash2 style={{ width: "14px", height: "14px" }} />
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
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>Notification Settings</h3>
                <button onClick={handleSaveNotifications} style={btnPrimaryStyle}>
                  <Save style={{ width: "14px", height: "14px" }} />
                  Save Notifications
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {([
                  { key: "emailNotifications" as const, label: "Email Notifications", desc: "Receive email alerts for important updates" },
                  { key: "smsNotifications" as const, label: "SMS Notifications", desc: "Send SMS alerts to parents and students" },
                  { key: "pushNotifications" as const, label: "Push Notifications", desc: "Browser push notifications for real-time alerts" },
                  { key: "paymentAlerts" as const, label: "Payment Alerts", desc: "Get notified when payments are received" },
                  { key: "examReminders" as const, label: "Exam Reminders", desc: "Automated reminders before examination dates" },
                  { key: "attendanceAlerts" as const, label: "Attendance Alerts", desc: "Notify parents of student absences" },
                  { key: "reportCardAlerts" as const, label: "Report Card Alerts", desc: "Notify when report cards are ready" },
                ]).map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "16px 20px",
                      borderRadius: "12px",
                      background: "#f8fafc",
                      border: "1px solid #f1f5f9",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#f1f5f9"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#f8fafc"; }}
                  >
                    <div>
                      <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>{item.label}</p>
                      <p style={{ margin: "3px 0 0", fontSize: "11px", color: "#94a3b8" }}>{item.desc}</p>
                    </div>
                    <Toggle checked={notifications[item.key]} onChange={() => toggleNotification(item.key)} />
                  </div>
                ))}
              </div>
            </>
          )}

          {/* User Roles */}
          {activeSection === 4 && (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>User Roles & Permissions</h3>
                <button onClick={handleSaveRoles} style={btnPrimaryStyle}>
                  <Save style={{ width: "14px", height: "14px" }} />
                  Save Roles
                </button>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" as const }}>
                  <thead>
                    <tr>
                      <th style={tableThStyle}>Role</th>
                      <th style={tableThStyle}>Description</th>
                      <th style={tableThStyle}>Permissions</th>
                      <th style={{ ...tableThStyle, width: "48px" }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedRoles.map((item) => (
                      <tr key={item.id} style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.15s" }} onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#f8fafc"; }} onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                        <td style={tableTdStyle}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "10px",
                              background: `linear-gradient(135deg, ${item.color}, ${item.color}cc)`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#ffffff",
                              fontSize: "11px",
                              fontWeight: 700,
                              flexShrink: 0,
                              boxShadow: `0 2px 8px ${item.color}33`,
                            }}>
                              {item.role.slice(0, 2).toUpperCase()}
                            </div>
                            <span style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>{item.role}</span>
                          </div>
                        </td>
                        <td style={tableTdStyle}>
                          <span style={{ fontSize: "12px", color: "#64748b" }}>{item.desc}</span>
                        </td>
                        <td style={tableTdStyle}>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                            {item.permissions.map((perm, j) => (
                              <div key={j} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                <input
                                  type="text"
                                  value={perm}
                                  onChange={(e) => updateRolePermissions(item.id, j, e.target.value)}
                                  style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid #e2e8f0", background: "#ffffff", color: "#475569", fontSize: "10px", fontWeight: 500, outline: "none", width: "100px" }}
                                />
                                <button
                                  onClick={() => removeRolePermission(item.id, j)}
                                  style={{ width: "20px", height: "20px", borderRadius: "4px", border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", transition: "color 0.15s" }}
                                  onMouseEnter={(e) => { e.currentTarget.style.color = "#dc2626"; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.color = "#94a3b8"; }}
                                >
                                  <Trash2 style={{ width: "10px", height: "10px" }} />
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => addRolePermission(item.id)}
                              style={{ padding: "4px 8px", borderRadius: "6px", border: "1px dashed #e2e8f0", background: "#f8fafc", color: "#94a3b8", fontSize: "10px", cursor: "pointer", transition: "all 0.15s" }}
                              onMouseEnter={(e) => { e.currentTarget.style.color = "#475569"; e.currentTarget.style.borderColor = "#cbd5e1"; }}
                              onMouseLeave={(e) => { e.currentTarget.style.color = "#94a3b8"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
                            >
                              + Add
                            </button>
                          </div>
                        </td>
                        <td style={tableTdStyle}></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {rolesTotalPages > 1 && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #f1f5f9" }}>
                  <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
                    Showing {rolesStartIdx + 1} to {Math.min(rolesStartIdx + ROLES_PER_PAGE, roles.length)} of {roles.length} roles
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <button
                      disabled={rolesPage === 1}
                      onClick={() => setRolesPage((p) => Math.max(1, p - 1))}
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        background: rolesPage === 1 ? "#f8fafc" : "#ffffff",
                        color: rolesPage === 1 ? "#cbd5e1" : "#475569",
                        cursor: rolesPage === 1 ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: rolesPage === 1 ? 0.4 : 1,
                        fontSize: "12px",
                        fontWeight: 600,
                      }}
                    >
                      Prev
                    </button>
                    {Array.from({ length: Math.min(rolesTotalPages, 5) }, (_, i) => {
                      let pageNum: number;
                      if (rolesTotalPages <= 5) {
                        pageNum = i + 1;
                      } else if (rolesPage <= 3) {
                        pageNum = i + 1;
                      } else if (rolesPage >= rolesTotalPages - 2) {
                        pageNum = rolesTotalPages - 4 + i;
                      } else {
                        pageNum = rolesPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setRolesPage(pageNum)}
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "8px",
                            border: rolesPage === pageNum ? "none" : "1px solid #e2e8f0",
                            background: rolesPage === pageNum ? "#0055ff" : "#f8fafc",
                            color: rolesPage === pageNum ? "#ffffff" : "#64748b",
                            fontSize: "12px",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.15s",
                          }}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      disabled={rolesPage === rolesTotalPages}
                      onClick={() => setRolesPage((p) => Math.min(rolesTotalPages, p + 1))}
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        background: rolesPage === rolesTotalPages ? "#f8fafc" : "#ffffff",
                        color: rolesPage === rolesTotalPages ? "#cbd5e1" : "#475569",
                        cursor: rolesPage === rolesTotalPages ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: rolesPage === rolesTotalPages ? 0.4 : 1,
                        fontSize: "12px",
                        fontWeight: 600,
                      }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Security */}
          {activeSection === 5 && (
            <>
              <h3 style={{ margin: "0 0 24px", fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>Security Settings</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Two-Factor Auth */}
                <div style={{ padding: "20px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #f1f5f9" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>Two-Factor Authentication</p>
                      <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#94a3b8" }}>Add an extra layer of security to admin accounts</p>
                    </div>
                    <Toggle checked={twoFactorEnabled} onChange={() => setTwoFactorEnabled((p) => !p)} />
                  </div>
                </div>

                {/* Password Policy */}
                <div style={{ padding: "20px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #f1f5f9" }}>
                  <p style={{ margin: "0 0 14px", fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>Password Policy</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <div>
                        <label style={smallLabelStyle}>Minimum Length</label>
                        <input
                          type="number"
                          value={passwordPolicy.minLength}
                          onChange={(e) => setPasswordPolicy((p) => ({ ...p, minLength: Number(e.target.value) }))}
                          min={6}
                          style={{ ...inputStyle, padding: "10px 12px" }}
                        />
                      </div>
                      <div>
                        <label style={smallLabelStyle}>Password Expiry (days)</label>
                        <input
                          type="number"
                          value={passwordPolicy.expiryDays}
                          onChange={(e) => setPasswordPolicy((p) => ({ ...p, expiryDays: Number(e.target.value) }))}
                          min={30}
                          style={{ ...inputStyle, padding: "10px 12px" }}
                        />
                      </div>
                    </div>
                    {(["requireUppercase", "requireLowercase", "requireNumber", "requireSpecial"] as const).map((rule, i) => (
                      <label
                        key={i}
                        style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px", borderRadius: "8px", cursor: "pointer", transition: "background 0.15s" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#ffffff"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                      >
                        <input
                          type="checkbox"
                          checked={passwordPolicy[rule]}
                          onChange={() => setPasswordPolicy((p) => ({ ...p, [rule]: !p[rule] }))}
                          style={{ width: "16px", height: "16px", accentColor: "#0055ff" }}
                        />
                        <span style={{ fontSize: "12px", color: "#475569" }}>
                          {["Require uppercase letter", "Require lowercase letter", "Require number", "Require special character"][i]}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Session Management */}
                <div style={{ padding: "20px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #f1f5f9" }}>
                  <p style={{ margin: "0 0 14px", fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>Session Management</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "12px", color: "#475569" }}>Max login attempts before lockout</span>
                      <input
                        type="number"
                        value={sessionPolicy.maxAttempts}
                        onChange={(e) => setSessionPolicy((p) => ({ ...p, maxAttempts: Number(e.target.value) }))}
                        min={3}
                        style={{ width: "80px", padding: "8px 12px", borderRadius: "8px", border: "2px solid #e5e7eb", background: "#ffffff", fontSize: "13px", color: "#0f172a", textAlign: "right" as const, outline: "none" }}
                      />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "12px", color: "#475569" }}>Session timeout (minutes)</span>
                      <input
                        type="number"
                        value={sessionPolicy.timeoutMinutes}
                        onChange={(e) => setSessionPolicy((p) => ({ ...p, timeoutMinutes: Number(e.target.value) }))}
                        min={15}
                        style={{ width: "80px", padding: "8px 12px", borderRadius: "8px", border: "2px solid #e5e7eb", background: "#ffffff", fontSize: "13px", color: "#0f172a", textAlign: "right" as const, outline: "none" }}
                      />
                    </div>
                  </div>
                </div>

                {/* Change Password */}
                <div style={{ padding: "20px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #f1f5f9" }}>
                  <p style={{ margin: "0 0 14px", fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>Change Password</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div>
                      <label style={smallLabelStyle}>Current Password</label>
                      <input
                        type="password"
                        value={passwords.currentPassword}
                        onChange={(e) => setPasswords((p) => ({ ...p, currentPassword: e.target.value }))}
                        placeholder="Enter current password"
                        style={{ ...inputStyle, padding: "10px 12px", colorScheme: "light" }}
                      />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <div>
                        <label style={smallLabelStyle}>New Password</label>
                        <input
                          type="password"
                          value={passwords.newPassword}
                          onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))}
                          placeholder="Enter new password"
                          style={{ ...inputStyle, padding: "10px 12px", colorScheme: "light" }}
                        />
                      </div>
                      <div>
                        <label style={smallLabelStyle}>Confirm New Password</label>
                        <input
                          type="password"
                          value={passwords.confirmPassword}
                          onChange={(e) => setPasswords((p) => ({ ...p, confirmPassword: e.target.value }))}
                          placeholder="Confirm new password"
                          style={{ ...inputStyle, padding: "10px 12px", colorScheme: "light" }}
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleChangePassword}
                      disabled={changingPassword}
                      style={{
                        ...btnPrimaryStyle,
                        opacity: changingPassword ? 0.7 : 1,
                        alignSelf: "flex-start",
                      }}
                    >
                      {changingPassword ? <Loader2 style={{ width: "14px", height: "14px", animation: "spin 1s linear infinite" }} /> : <Shield style={{ width: "14px", height: "14px" }} />}
                      {changingPassword ? "Changing..." : "Change Password"}
                    </button>
                  </div>
                </div>

                {/* Save Security */}
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button onClick={handleSavePasswordPolicy} style={btnPrimaryStyle}>
                    <Save style={{ width: "14px", height: "14px" }} />
                    Save Security Settings
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0" }}>
        <Loader2 style={{ width: "32px", height: "32px", color: "#64748b", animation: "spin 1s linear infinite" }} />
      </div>
    }>
      <SettingsPageInner />
    </Suspense>
  );
}
