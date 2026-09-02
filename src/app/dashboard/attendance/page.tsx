"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import {
  CheckCircle,
  XCircle,
  Clock,
  QrCode,
  Users,
  Download,
  AlertTriangle,
  UserCheck,
} from "lucide-react";
import { downloadCSV } from "@/lib/exports";
import { toast } from "sonner";

export default function AttendancePage() {
  const { data: session } = useSession();
  const userRoles: string[] = (session?.user as any)?.roles?.map((r: any) => r.name) || [];
  const isStudent = userRoles.includes("STUDENT");
  const isParent = userRoles.includes("PARENT");
  const isReadOnly = isStudent || isParent;

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedSession, setSelectedSession] = useState("morning");
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const [admissionInput, setAdmissionInput] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ date: selectedDate });
    fetch(`/api/attendance?${params}`)
      .then((res) => res.json())
      .then((d) => setRecords(d.records || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedDate, selectedSession]);

  const stats = useMemo(() => {
    const present = records.filter((r) => r.status === "present").length;
    const absent = records.filter((r) => r.status === "absent").length;
    const late = records.filter((r) => r.status === "late").length;
    return { total: records.length, present, absent, late };
  }, [records]);

  const markPresent = async (admissionNumber: string) => {
    if (!admissionNumber.trim()) {
      toast.error("Please enter an admission number");
      return;
    }
    try {
      const res = await fetch(`/api/students?search=${admissionNumber}`);
      const data = await res.json();
      const student = data.students?.[0];
      if (student) {
        await fetch("/api/attendance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId: student.id,
            date: selectedDate,
            session: selectedSession,
            status: "present",
            classId: student.classId,
          }),
        });
        toast.success(`${student.firstName} ${student.lastName} marked present`);
        setAdmissionInput("");
      } else {
        toast.error("Student not found");
      }
    } catch {
      toast.error("Failed");
    }
  };

  const statCards = [
    { label: "Total Students", value: stats.total, icon: Users, bg: "linear-gradient(135deg, #0055ff, #0033cc)" },
    { label: "Present", value: stats.present, icon: CheckCircle, bg: "linear-gradient(135deg, #10b981, #059669)" },
    { label: "Absent", value: stats.absent, icon: XCircle, bg: "linear-gradient(135deg, #ef4444, #dc2626)" },
    { label: "Late", value: stats.late, icon: Clock, bg: "linear-gradient(135deg, #f59e0b, #d97706)" },
  ];

  const getRate = (present: number, total: number) => (total > 0 ? Math.round((present / total) * 100) : 0);
  const getRateColor = (rate: number) => (rate >= 90 ? "#10b981" : rate >= 70 ? "#f59e0b" : "#ef4444");

  return (
    <div style={{ padding: "24px 32px", minHeight: "100vh", background: "#f8fafc" }}>
      {/* Gradient Header Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #0a2a6e, #0055ff)",
          borderRadius: "20px",
          padding: "28px 32px",
          marginBottom: "28px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 90% 20%, rgba(255,255,255,0.12) 0%, transparent 60%), radial-gradient(circle at 10% 80%, rgba(255,255,255,0.08) 0%, transparent 50%)",
          }}
        />
        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "26px", fontWeight: 800, color: "#ffffff" }}>Attendance Management</h1>
            <p style={{ margin: "6px 0 0", fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>Track student and teacher attendance with QR code support</p>
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {!isReadOnly && (
              <button
                onClick={() => setShowQRScanner(true)}
                style={{
                  padding: "10px 20px",
                  borderRadius: "12px",
                  border: "none",
                  background: "rgba(255,255,255,0.15)",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  backdropFilter: "blur(8px)",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.25)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
              >
                <QrCode style={{ width: "16px", height: "16px" }} /> QR Scanner
              </button>
            )}
            <button
              onClick={() => {
                downloadCSV(
                  records.map((r) => ({
                    Student: `${r.student?.firstName} ${r.student?.lastName}`,
                    "Admission No": r.student?.admissionNumber,
                    Class: r.class?.name || r.class?.displayName,
                    Status: r.status,
                    Date: new Date(r.date).toLocaleDateString(),
                    Notes: r.notes || "",
                  })),
                  "attendance_report"
                );
                toast.success("Exported successfully");
              }}
              style={{
                padding: "10px 20px",
                borderRadius: "12px",
                border: "none",
                background: "rgba(255,255,255,0.15)",
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backdropFilter: "blur(8px)",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.25)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
            >
              <Download style={{ width: "16px", height: "16px" }} /> Export
            </button>
          </div>
        </div>
      </div>

      {/* Date & Session Selector */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "24px", flexWrap: "wrap", alignItems: "flex-end" }}>
        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              padding: "10px 14px",
              borderRadius: "10px",
              border: "1.5px solid #e2e8f0",
              fontSize: "13px",
              color: "#0f172a",
              outline: "none",
              background: "#ffffff",
              cursor: "pointer",
              transition: "border-color 0.15s",
            }}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>Session</label>
          <select
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            style={{
              padding: "10px 14px",
              borderRadius: "10px",
              border: "1.5px solid #e2e8f0",
              fontSize: "13px",
              color: "#475569",
              outline: "none",
              background: "#ffffff",
              cursor: "pointer",
              colorScheme: "light",
              transition: "border-color 0.15s",
            }}
          >
            <option value="morning">Morning</option>
            <option value="afternoon">Afternoon</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "28px" }}>
        {statCards.map((stat, i) => (
          <div
            key={i}
            style={{
              background: stat.bg,
              borderRadius: "16px",
              padding: "22px 24px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "-10px",
                right: "-10px",
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.08)",
              }}
            />
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                background: "rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backdropFilter: "blur(8px)",
                flexShrink: 0,
              }}
            >
              <stat.icon style={{ width: "24px", height: "24px", color: "#ffffff" }} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "26px", fontWeight: 800, color: "#ffffff" }}>{Number(stat.value).toLocaleString()}</p>
              <p style={{ margin: "2px 0 0", fontSize: "12px", fontWeight: 500, color: "rgba(255,255,255,0.75)" }}>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid: Class Attendance + Today's Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px", marginBottom: "28px" }}>
        {/* Class Attendance Table */}
        <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9" }}>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>Class Attendance</h3>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                  {["CLASS", "PRESENT", "ABSENT", "LATE", "RATE"].map((h) => (
                    <th key={h} style={{ padding: "12px 20px", fontSize: "11px", fontWeight: 700, color: "#94a3b8", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={5} style={{ padding: "16px 20px" }}>
                        <div style={{ height: "16px", width: "100%", borderRadius: "6px", background: "#f1f5f9" }} />
                      </td>
                    </tr>
                  ))
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: "40px 20px", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>No attendance data for this date</td>
                  </tr>
                ) : (
                  (() => {
                    const classMap: Record<string, { present: number; absent: number; late: number }> = {};
                    records.forEach((r) => {
                      const className = r.class?.displayName || r.class?.name || "Unknown";
                      if (!classMap[className]) classMap[className] = { present: 0, absent: 0, late: 0 };
                      if (r.status === "present") classMap[className].present++;
                      else if (r.status === "absent") classMap[className].absent++;
                      else if (r.status === "late") classMap[className].late++;
                    });
                    return Object.entries(classMap).map(([className, s]) => {
                      const total = s.present + s.absent + s.late;
                      const rate = getRate(s.present, total);
                      return (
                        <tr key={className} style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.1s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                          <td style={{ padding: "14px 20px", fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>{className}</td>
                          <td style={{ padding: "14px 20px", fontSize: "13px", fontWeight: 600, color: "#10b981" }}>{s.present}</td>
                          <td style={{ padding: "14px 20px", fontSize: "13px", fontWeight: 600, color: "#ef4444" }}>{s.absent}</td>
                          <td style={{ padding: "14px 20px", fontSize: "13px", fontWeight: 600, color: "#f59e0b" }}>{s.late}</td>
                          <td style={{ padding: "14px 20px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <div style={{ flex: 1, maxWidth: "100px", height: "8px", borderRadius: "4px", background: "#f1f5f9", overflow: "hidden" }}>
                                <div style={{ height: "100%", borderRadius: "4px", background: getRateColor(rate), width: `${rate}%`, transition: "width 0.4s ease" }} />
                              </div>
                              <span style={{ fontSize: "12px", fontWeight: 600, color: getRateColor(rate), minWidth: "36px" }}>{rate}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    });
                  })()
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Today's Summary */}
        <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", padding: "24px" }}>
          <h3 style={{ margin: "0 0 20px", fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>Today&apos;s Summary</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {[
              { label: "Present", value: stats.present, total: stats.total, color: "#10b981", bg: "#ecfdf5" },
              { label: "Absent", value: stats.absent, total: stats.total, color: "#ef4444", bg: "#fef2f2" },
              { label: "Late", value: stats.late, total: stats.total, color: "#f59e0b", bg: "#fffbeb" },
            ].map((item) => {
              const pct = item.total ? ((item.value / item.total) * 100).toFixed(1) : "0.0";
              const pctNum = item.total ? (item.value / item.total) * 100 : 0;
              return (
                <div key={item.label} style={{ padding: "16px", borderRadius: "12px", background: item.bg, border: `1px solid ${item.color}20` }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>{item.label}</span>
                    <span style={{ fontSize: "14px", fontWeight: 700, color: item.color }}>{pct}%</span>
                  </div>
                  <div style={{ height: "8px", borderRadius: "4px", background: `${item.color}20`, overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: "4px", background: item.color, width: `${pctNum}%`, transition: "width 0.4s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Absent Students Today */}
      <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AlertTriangle style={{ width: "18px", height: "18px", color: "#f59e0b" }} />
            </div>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>Absent Students Today</h3>
          </div>
          {!isReadOnly && (
            <button
              onClick={async () => {
                const absentCount = records.filter((r) => r.status === "absent").length;
                if (absentCount === 0) {
                  toast.error("No absent students to notify");
                  return;
                }
                setNotifying(true);
                try {
                  const res = await fetch("/api/attendance/notify-parents", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ date: selectedDate, session: selectedSession }),
                  });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data.error || "Failed");
                  toast.success(`Notifications sent to ${data.notified} parent(s)`);
                } catch {
                  toast.error("Failed to send notifications");
                } finally {
                  setNotifying(false);
                }
              }}
              disabled={notifying}
              style={{
                padding: "10px 22px",
                borderRadius: "12px",
                border: "none",
                background: notifying ? "#93c5fd" : "#0055ff",
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: 600,
                cursor: notifying ? "not-allowed" : "pointer",
                boxShadow: notifying ? "none" : "0 4px 14px rgba(0,85,255,0.3)",
                transition: "all 0.15s",
              }}
            >
              {notifying ? "Sending..." : "Notify Parents"}
            </button>
          )}
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                {["STUDENT", "CLASS", "REASON", "PARENT NOTIFIED"].map((h) => (
                  <th key={h} style={{ padding: "12px 20px", fontSize: "11px", fontWeight: 700, color: "#94a3b8", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={4} style={{ padding: "16px 20px" }}>
                      <div style={{ height: "16px", width: "100%", borderRadius: "6px", background: "#f1f5f9" }} />
                    </td>
                  </tr>
                ))
              ) : records.filter((r) => r.status === "absent").length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: "40px 20px", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>No absent students recorded</td>
                </tr>
              ) : (
                records.filter((r) => r.status === "absent").map((student, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.1s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                    <td style={{ padding: "14px 20px", fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>{student.student?.firstName} {student.student?.lastName}</td>
                    <td style={{ padding: "14px 20px", fontSize: "13px", color: "#475569" }}>{student.class?.name || student.class?.displayName}</td>
                    <td style={{ padding: "14px 20px", fontSize: "13px", color: "#475569" }}>{student.notes || "—"}</td>
                    <td style={{ padding: "14px 20px" }}>
                      <span style={{ padding: "4px 12px", borderRadius: "8px", background: "#fff7ed", color: "#f59e0b", fontSize: "12px", fontWeight: 600 }}>Pending</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Scanner / Mark Attendance Modal */}
      {showQRScanner && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "16px" }} onClick={() => setShowQRScanner(false)}>
          <div
            style={{
              background: "#ffffff",
              borderRadius: "24px",
              width: "100%",
              maxWidth: "440px",
              boxShadow: "0 25px 80px rgba(0,0,0,0.25)",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ padding: "28px 32px 24px", background: "linear-gradient(135deg, #0a2a6e, #0055ff)", borderRadius: "24px 24px 0 0", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 90% 20%, rgba(255,255,255,0.1) 0%, transparent 60%)" }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", position: "relative", zIndex: 1 }}>
                <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "14px", backdropFilter: "blur(8px)" }}>
                  <UserCheck style={{ width: "28px", height: "28px", color: "#ffffff" }} />
                </div>
                <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "#ffffff" }}>Mark Attendance</h3>
                <p style={{ margin: "4px 0 0", fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>Enter student admission number to mark present</p>
              </div>
            </div>
            {/* Form Body */}
            <div style={{ padding: "28px 32px 32px" }}>
              <div style={{ marginBottom: "8px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#475569", marginBottom: "8px" }}>Admission Number</label>
                <input
                  type="text"
                  placeholder="Type admission number..."
                  autoFocus
                  value={admissionInput}
                  onChange={(e) => setAdmissionInput(e.target.value)}
                  onKeyDown={async (e) => {
                    if (e.key === "Enter") await markPresent(admissionInput);
                  }}
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: "12px",
                    border: "1.5px solid #e2e8f0",
                    fontSize: "14px",
                    color: "#0f172a",
                    outline: "none",
                    boxSizing: "border-box",
                    background: "#f8fafc",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#0055ff";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,85,255,0.1)";
                    e.currentTarget.style.background = "#ffffff";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#e2e8f0";
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.background = "#f8fafc";
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                <button
                  onClick={() => setShowQRScanner(false)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "12px",
                    border: "1.5px solid #e2e8f0",
                    background: "#ffffff",
                    color: "#475569",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  Close
                </button>
                <button
                  onClick={() => markPresent(admissionInput)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "12px",
                    border: "none",
                    background: "#0055ff",
                    color: "#ffffff",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(0,85,255,0.3)",
                    transition: "all 0.15s",
                  }}
                >
                  Mark Present
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
