"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Calendar,
  ArrowRight,
  X,
  AlertCircle,
  UserCheck,
  Loader2,
  Download,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { downloadCSV } from "@/lib/exports";

interface ApplicantDocument {
  id?: string;
  name: string;
  type: string;
  url?: string;
  size: number | null;
  uploadedAt?: string;
  hasContent?: boolean;
}

interface Applicant {
  id: string;
  applicationNumber: string;
  firstName: string;
  lastName: string;
  middleName: string | null;
  email: string;
  phone: string;
  classAppliedFor: string;
  status: string;
  submittedAt: string;
  admissionFeePaid: boolean;
  guardianName: string | null;
  guardianPhone: string | null;
  guardianEmail: string | null;
  guardianRelationship: string | null;
  dateOfBirth: string;
  gender: string;
  previousSchool: string | null;
  address: string | null;
  nationality: string | null;
  stateOfOrigin: string | null;
  bloodGroup: string | null;
  decisionNote: string | null;
  rejectionReason: string | null;
  reviewedAt: string | null;
  documents?: ApplicantDocument[];
}

const statusConfig: Record<string, { bg: string; text: string; border: string; label: string; dot: string }> = {
  pending: { bg: "#fef9c3", text: "#a16207", border: "#fde047", label: "Pending Review", dot: "#eab308" },
  under_review: { bg: "#dbeafe", text: "#1d4ed8", border: "#93c5fd", label: "Under Review", dot: "#3b82f6" },
  exam: { bg: "#f3e8ff", text: "#7c3aed", border: "#c4b5fd", label: "Entrance Exam", dot: "#a855f7" },
  interview: { bg: "#cffafe", text: "#0891b2", border: "#67e8f9", label: "Interview", dot: "#06b6d4" },
  admitted: { bg: "#dcfce7", text: "#15803d", border: "#86efac", label: "Admitted", dot: "#22c55e" },
  rejected: { bg: "#fee2e2", text: "#dc2626", border: "#fca5a5", label: "Rejected", dot: "#ef4444" },
};

export default function AdmissionsPage() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showActionModal, setShowActionModal] = useState<string | null>(null);
  const [actionNote, setActionNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [pushingSchema, setPushingSchema] = useState(false);
  const [docPreview, setDocPreview] = useState<ApplicantDocument | null>(null);

  const fetchApplicants = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/admissions?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch");
      setApplicants(data.applicants ?? []);
    } catch (err: any) {
      setLoadError(err.message || "Failed to load admissions data");
    }
    setLoading(false);
  }, [search, statusFilter]);

  const fetchApplicantDetail = async (applicant: Applicant) => {
    setSelectedApplicant(applicant);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admissions/${applicant.id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedApplicant(data);
      }
    } catch {}
    setDetailLoading(false);
  };

  const handlePushSchema = async () => {
    setPushingSchema(true);
    try {
      const res = await fetch("/api/seed/schema", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        fetchApplicants();
      } else {
        toast.error(data.error || "Failed to push schema");
      }
    } catch {
      toast.error("Failed to push schema");
    }
    setPushingSchema(false);
  };

  useEffect(() => {
    fetchApplicants();
  }, [fetchApplicants]);

  const workflowSteps = [
    { step: "pending", label: "New", count: applicants.filter((a) => a.status === "pending").length, dot: "#eab308" },
    { step: "under_review", label: "Reviewing", count: applicants.filter((a) => a.status === "under_review").length, dot: "#3b82f6" },
    { step: "exam", label: "Exam", count: applicants.filter((a) => a.status === "exam").length, dot: "#a855f7" },
    { step: "interview", label: "Interview", count: applicants.filter((a) => a.status === "interview").length, dot: "#06b6d4" },
    { step: "admitted", label: "Admitted", count: applicants.filter((a) => a.status === "admitted").length, dot: "#22c55e" },
    { step: "rejected", label: "Rejected", count: applicants.filter((a) => a.status === "rejected").length, dot: "#ef4444" },
  ];

  const handleStatusUpdate = async (applicantId: string, newStatus: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admissions/${applicantId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          decision: newStatus === "admitted" ? "approved" : newStatus === "rejected" ? "rejected" : undefined,
          decisionNote: actionNote || undefined,
          rejectionReason: newStatus === "rejected" ? actionNote : undefined,
        }),
      });
      const data = await res.json();
      if (data.success || data.applicant?.id) {
        setApplicants((prev) => prev.map((a) => a.id === applicantId ? { ...a, status: newStatus, decisionNote: actionNote || a.decisionNote } : a));
        setShowActionModal(null);
        setActionNote("");
        if (selectedApplicant?.id === applicantId) {
          setSelectedApplicant({ ...selectedApplicant, status: newStatus, decisionNote: actionNote || selectedApplicant.decisionNote, documents: selectedApplicant.documents });
        }
        toast.success(`Application ${newStatus === "admitted" ? "admitted" : newStatus === "rejected" ? "rejected" : "updated"}`);
      } else {
        toast.error(data.error || "Failed to update status");
      }
    } catch {
      toast.error("Failed to update application status");
    }
    setActionLoading(false);
  };

  const handleExport = () => {
    const data = applicants.map((a) => ({
      "Application No": a.applicationNumber,
      Name: `${a.firstName} ${a.lastName}`,
      "Class Applied": a.classAppliedFor,
      Status: statusConfig[a.status]?.label || a.status,
      Submitted: new Date(a.submittedAt).toLocaleDateString("en-NG"),
      Email: a.email,
      Phone: a.phone,
    }));
    downloadCSV(data, "admissions");
  };

  const getDocFileType = (name: string): string => {
    const ext = name.split(".").pop()?.toLowerCase() || "";
    if (ext === "pdf") return "pdf";
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "image";
    if (["doc", "docx"].includes(ext)) return "doc";
    return "file";
  };

  const isImageDoc = (doc: ApplicantDocument): boolean => {
    return (doc.url && doc.url.startsWith("data:image/")) || doc.url?.startsWith("blob:") || getDocFileType(doc.name) === "image";
  };

  return (
    <div style={{ padding: "0 16px 32px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginTop: "32px", borderRadius: "20px", padding: "32px 36px", background: "linear-gradient(135deg, #0a2a6e, #0055ff)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 60%)" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 1 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "26px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em" }}>Admissions Management</h1>
            <p style={{ margin: "6px 0 0", fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>Review applications, approve or reject, and manage admission decisions</p>
          </div>
          <button onClick={handleExport} style={{ padding: "10px 20px", borderRadius: "12px", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", color: "#ffffff", fontSize: "13px", fontWeight: 500, cursor: "pointer", backdropFilter: "blur(8px)", transition: "background 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.2)"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; }}>
            Export CSV
          </button>
        </div>
      </div>

      {/* Pipeline */}
      <div style={{ marginTop: "20px", background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px 28px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <h3 style={{ margin: "0 0 18px", fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>Admission Pipeline</h3>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
          {workflowSteps.map((step, i) => {
            const isActive = statusFilter === step.step;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button onClick={() => setStatusFilter(isActive ? "" : step.step)} style={{ flex: 1, minWidth: "110px", padding: "16px 12px", borderRadius: "14px", border: isActive ? `2px solid ${step.dot}` : "2px solid transparent", background: isActive ? `${step.dot}10` : "#f8fafc", cursor: "pointer", textAlign: "center", transition: "all 0.2s", boxShadow: isActive ? `0 0 0 3px ${step.dot}15` : "none" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: step.dot, margin: "0 auto 8px" }} />
                    <div style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>{step.count}</div>
                    <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px", fontWeight: 500 }}>{step.label}</div>
                  </button>
                {i < workflowSteps.length - 1 && <ArrowRight style={{ width: "16px", height: "16px", color: "#cbd5e1", flexShrink: 0 }} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div style={{ marginTop: "20px", display: "flex", gap: "12px" }}>
        <div style={{ flex: 1, position: "relative" }}>
          <Search style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "#94a3b8" }} />
          <input type="text" placeholder="Search by name or application number..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: "100%", padding: "12px 16px 12px 42px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#ffffff", fontSize: "13px", color: "#0f172a", outline: "none", boxSizing: "border-box", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }} />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: "12px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#ffffff", fontSize: "13px", color: "#475569", outline: "none", cursor: "pointer", minWidth: "140px", boxShadow: "0 1px 2px rgba(0,0,0,0.04)", colorScheme: "light" }}>
          <option value="">All Status</option>
          {Object.entries(statusConfig).map(([val, cfg]) => (
            <option key={val} value={val}>{cfg.label}</option>
          ))}
        </select>
      </div>

      {/* Applications List */}
      <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 0" }}>
            <Loader2 style={{ width: "24px", height: "24px", color: "#94a3b8", animation: "spin 1s linear infinite" }} />
          </div>
        ) : loadError ? (
          <div style={{ textAlign: "center", padding: "48px 0", background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
            <AlertCircle style={{ width: "40px", height: "40px", color: "#dc2626", margin: "0 auto 12px" }} />
            <p style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: 600, color: "#dc2626" }}>{loadError}</p>
            <p style={{ margin: "0 0 16px", fontSize: "12px", color: "#94a3b8" }}>This may be because the admissions table hasn&apos;t been created yet.</p>
            <button onClick={handlePushSchema} disabled={pushingSchema} style={{ padding: "10px 24px", borderRadius: "12px", background: "var(--primary, #0055ff)", color: "#ffffff", fontSize: "13px", fontWeight: 600, border: "none", cursor: pushingSchema ? "not-allowed" : "pointer", opacity: pushingSchema ? 0.5 : 1, display: "inline-flex", alignItems: "center", gap: "6px" }}>
              {pushingSchema && <Loader2 style={{ width: "14px", height: "14px", animation: "spin 1s linear infinite" }} />}
              {pushingSchema ? "Setting up..." : "Setup Admissions Table"}
            </button>
          </div>
        ) : applicants.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
            <FileText style={{ width: "40px", height: "40px", color: "#cbd5e1", margin: "0 auto 12px" }} />
            <p style={{ margin: 0, fontSize: "14px", color: "#94a3b8" }}>No applications found</p>
          </div>
        ) : (
          applicants.map((a, i) => {
            const sc = statusConfig[a.status] || statusConfig.pending;
            return (
              <motion.div key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", transition: "box-shadow 0.2s, border-color 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)"; e.currentTarget.style.borderColor = "#cbd5e1"; }} onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"; e.currentTarget.style.borderColor = "#e2e8f0"; }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px", minWidth: 0, flex: 1 }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "linear-gradient(135deg, #1e40af, #3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontSize: "15px", fontWeight: 700, flexShrink: 0, boxShadow: "0 2px 8px rgba(59,130,246,0.3)" }}>
                    {a.firstName[0]}{a.lastName[0]}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: "#0f172a" }}>{a.firstName} {a.lastName}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "12px", color: "#94a3b8", fontFamily: "monospace" }}>{a.applicationNumber}</span>
                      <span style={{ fontSize: "12px", color: "#e2e8f0" }}>|</span>
                      <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 500 }}>{a.classAppliedFor}</span>
                      <span style={{ fontSize: "12px", color: "#e2e8f0" }}>|</span>
                      <span style={{ fontSize: "12px", color: "#94a3b8" }}>{new Date(a.submittedAt).toLocaleDateString("en-NG")}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "5px 12px", borderRadius: "20px", background: sc.bg, color: sc.text, fontSize: "11px", fontWeight: 600, border: `1px solid ${sc.border}` }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: sc.dot }} />
                    {sc.label}
                  </span>
                  <button onClick={() => fetchApplicantDetail(a)} style={{ width: "34px", height: "34px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#ffffff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", transition: "all 0.15s" }} onMouseEnter={(e) => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.color = "#0f172a"; e.currentTarget.style.borderColor = "#cbd5e1"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.color = "#64748b"; e.currentTarget.style.borderColor = "#e2e8f0"; }}>
                    <Eye style={{ width: "15px", height: "15px" }} />
                  </button>
                  {a.status === "pending" && (
                    <>
                      <button onClick={() => setShowActionModal(a.id)} style={{ padding: "7px 14px", borderRadius: "10px", border: "1px solid #bbf7d0", background: "#f0fdf4", color: "#16a34a", fontSize: "12px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", transition: "background 0.15s" }} onMouseEnter={(e) => { e.currentTarget.style.background = "#dcfce7"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "#f0fdf4"; }}>
                        <CheckCircle style={{ width: "12px", height: "12px" }} /> Approve
                      </button>
                      <button onClick={() => { setShowActionModal(a.id); setActionNote(""); }} style={{ padding: "7px 14px", borderRadius: "10px", border: "1px solid #fecaca", background: "#fef2f2", color: "#dc2626", fontSize: "12px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", transition: "background 0.15s" }} onMouseEnter={(e) => { e.currentTarget.style.background = "#fee2e2"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "#fef2f2"; }}>
                        <XCircle style={{ width: "12px", height: "12px" }} /> Reject
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedApplicant && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} onClick={() => { setSelectedApplicant(null); setDocPreview(null); }}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: "680px", maxHeight: "88vh", background: "#ffffff", borderRadius: "20px", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 25px 60px rgba(0,0,0,0.25)" }}>
              {/* Modal Header */}
              <div style={{ padding: "24px 28px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "linear-gradient(135deg, #1e40af, #3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontSize: "16px", fontWeight: 700, flexShrink: 0 }}>
                    {selectedApplicant.firstName[0]}{selectedApplicant.lastName[0]}
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>{selectedApplicant.firstName} {selectedApplicant.lastName}</h2>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                      <span style={{ fontSize: "12px", color: "#64748b" }}>{selectedApplicant.applicationNumber}</span>
                      <span style={{ fontSize: "12px", color: "#cbd5e1" }}>|</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "2px 8px", borderRadius: "12px", background: (statusConfig[selectedApplicant.status] || statusConfig.pending).bg, color: (statusConfig[selectedApplicant.status] || statusConfig.pending).text, fontSize: "10px", fontWeight: 600 }}>{(statusConfig[selectedApplicant.status] || statusConfig.pending).label}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => { setSelectedApplicant(null); setDocPreview(null); }} style={{ width: "32px", height: "32px", borderRadius: "8px", border: "none", background: "#f8fafc", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", transition: "all 0.15s" }} onMouseEnter={(e) => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#475569"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.color = "#94a3b8"; }}>
                  <X style={{ width: "16px", height: "16px" }} />
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ padding: "20px 28px", overflowY: "auto", flex: 1 }}>
                {detailLoading ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "40px" }}>
                    <Loader2 style={{ width: "24px", height: "24px", color: "#94a3b8", animation: "spin 1s linear infinite" }} />
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    <ModalSection title="Personal Information">
                      <InfoGrid items={[
                        { label: "Class Applied", value: selectedApplicant.classAppliedFor },
                        { label: "Gender", value: selectedApplicant.gender },
                        { label: "Date of Birth", value: selectedApplicant.dateOfBirth ? new Date(selectedApplicant.dateOfBirth).toLocaleDateString("en-NG") : "—" },
                        { label: "Nationality", value: selectedApplicant.nationality || "—" },
                        { label: "State of Origin", value: selectedApplicant.stateOfOrigin || "—" },
                        { label: "Blood Group", value: selectedApplicant.bloodGroup || "—" },
                      ]} />
                    </ModalSection>
                    <ModalSection title="Contact Information">
                      <InfoGrid items={[
                        { label: "Email", value: selectedApplicant.email || "—" },
                        { label: "Phone", value: selectedApplicant.phone || "—" },
                        { label: "Address", value: selectedApplicant.address || "—" },
                        { label: "Previous School", value: selectedApplicant.previousSchool || "—" },
                      ]} />
                    </ModalSection>
                    <ModalSection title="Guardian Information">
                      <InfoGrid items={[
                        { label: "Guardian Name", value: selectedApplicant.guardianName || "—" },
                        { label: "Relationship", value: selectedApplicant.guardianRelationship || "—" },
                        { label: "Guardian Phone", value: selectedApplicant.guardianPhone || "—" },
                        { label: "Guardian Email", value: selectedApplicant.guardianEmail || "—" },
                      ]} />
                    </ModalSection>
                    <ModalSection title="Uploaded Documents" badge={selectedApplicant.documents?.length || 0}>
                      {selectedApplicant.documents && selectedApplicant.documents.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          {selectedApplicant.documents.map((doc, i) => {
                            const fileType = getDocFileType(doc.name);
                            const iconBg = fileType === "pdf" ? "#fef2f2" : fileType === "image" ? "#eff6ff" : "#f0fdf4";
                            const iconColor = fileType === "pdf" ? "#dc2626" : fileType === "image" ? "#2563eb" : "#16a34a";
                            const typeLabel = fileType === "pdf" ? "PDF" : fileType === "image" ? "IMG" : fileType === "doc" ? "DOC" : "FILE";
                            const docUrl = `/api/admissions/documents/${doc.id}`;
                            return (
                              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #e2e8f0", gap: "12px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0, flex: 1 }}>
                                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    {fileType === "image" ? <ImageIcon style={{ width: "18px", height: "18px", color: iconColor }} /> : <FileText style={{ width: "18px", height: "18px", color: iconColor }} />}
                                  </div>
                                  <div style={{ minWidth: 0 }}>
                                    <p style={{ margin: 0, fontSize: "13px", fontWeight: 500, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.name}</p>
                                    <p style={{ margin: 0, fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>{doc.size ? `${(doc.size / 1024).toFixed(1)} KB` : "—"}</p>
                                  </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
                                  <span style={{ padding: "3px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: 700, background: iconBg, color: iconColor }}>{typeLabel}</span>
                                  <button onClick={async () => {
                                    try {
                                      const res = await fetch(docUrl);
                                      if (res.ok) {
                                        const blob = await res.blob();
                                        const url = URL.createObjectURL(blob);
                                        setDocPreview({ ...doc, url } as any);
                                      }
                                    } catch {}
                                  }} style={{ width: "30px", height: "30px", borderRadius: "8px", border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", transition: "all 0.15s" }} title="Preview" onMouseEnter={(e) => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#475569"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}>
                                    <Eye style={{ width: "15px", height: "15px" }} />
                                  </button>
                                  <a href={docUrl} download={doc.name} style={{ width: "30px", height: "30px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", textDecoration: "none", transition: "all 0.15s" }} title="Download" onMouseEnter={(e) => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#475569"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}>
                                    <Download style={{ width: "15px", height: "15px" }} />
                                  </a>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div style={{ textAlign: "center", padding: "24px 0", color: "#94a3b8", fontSize: "13px" }}>No documents uploaded</div>
                      )}
                    </ModalSection>
                    <div style={{ display: "flex", gap: "20px", fontSize: "12px", color: "#94a3b8", paddingTop: "4px" }}>
                      <span>Submitted: {new Date(selectedApplicant.submittedAt).toLocaleDateString("en-NG")}</span>
                      {selectedApplicant.reviewedAt && <span>Reviewed: {new Date(selectedApplicant.reviewedAt).toLocaleDateString("en-NG")}</span>}
                    </div>
                    {selectedApplicant.decisionNote && (
                      <div style={{ padding: "14px 18px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                        <p style={{ margin: "0 0 4px", fontSize: "10px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Decision Note</p>
                        <p style={{ margin: 0, fontSize: "13px", color: "#475569" }}>{selectedApplicant.decisionNote}</p>
                      </div>
                    )}
                    {selectedApplicant.rejectionReason && (
                      <div style={{ padding: "14px 18px", borderRadius: "12px", background: "#fef2f2", border: "1px solid #fecaca" }}>
                        <p style={{ margin: "0 0 4px", fontSize: "10px", fontWeight: 700, color: "#dc2626", textTransform: "uppercase", letterSpacing: "0.05em" }}>Rejection Reason</p>
                        <p style={{ margin: 0, fontSize: "13px", color: "#dc2626" }}>{selectedApplicant.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              {selectedApplicant.status === "pending" && (
                <div style={{ padding: "16px 28px 20px", borderTop: "1px solid #f1f5f9", display: "flex", gap: "10px", flexShrink: 0 }}>
                  <button onClick={() => setShowActionModal(selectedApplicant.id)} style={{ flex: 1, padding: "11px", borderRadius: "12px", border: "none", background: "#f0fdf4", color: "#16a34a", fontSize: "13px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", transition: "background 0.15s" }} onMouseEnter={(e) => { e.currentTarget.style.background = "#dcfce7"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "#f0fdf4"; }}>
                    <CheckCircle style={{ width: "16px", height: "16px" }} /> Approve
                  </button>
                  <button onClick={() => setShowActionModal(selectedApplicant.id)} style={{ flex: 1, padding: "11px", borderRadius: "12px", border: "none", background: "#fef2f2", color: "#dc2626", fontSize: "13px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", transition: "background 0.15s" }} onMouseEnter={(e) => { e.currentTarget.style.background = "#fee2e2"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "#fef2f2"; }}>
                    <XCircle style={{ width: "16px", height: "16px" }} /> Reject
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Document Preview Modal */}
      <AnimatePresence>
        {docPreview && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }} onClick={() => { if (docPreview?.url?.startsWith("blob:")) URL.revokeObjectURL(docPreview.url); setDocPreview(null); }}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: "900px", maxHeight: "90vh", background: "#ffffff", borderRadius: "16px", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 25px 60px rgba(0,0,0,0.4)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid #f1f5f9", background: "#f8fafc" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <FileText style={{ width: "16px", height: "16px", color: "#64748b" }} />
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>{docPreview.name}</span>
                  {docPreview.size && <span style={{ fontSize: "11px", color: "#94a3b8" }}>({(docPreview.size / 1024).toFixed(1)} KB)</span>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  {docPreview.url && (
                    <a href={docPreview.url} download={docPreview.name} style={{ padding: "6px 14px", borderRadius: "8px", background: "#f1f5f9", color: "#475569", fontSize: "12px", fontWeight: 500, textDecoration: "none", display: "flex", alignItems: "center", gap: "4px", transition: "background 0.15s" }} onMouseEnter={(e) => { e.currentTarget.style.background = "#e2e8f0"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "#f1f5f9"; }}>
                      <Download style={{ width: "12px", height: "12px" }} /> Download
                    </a>
                  )}
                  <button onClick={() => { if (docPreview?.url?.startsWith("blob:")) URL.revokeObjectURL(docPreview.url); setDocPreview(null); }} style={{ width: "28px", height: "28px", borderRadius: "6px", border: "none", background: "#f1f5f9", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }} onMouseEnter={(e) => { e.currentTarget.style.background = "#e2e8f0"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "#f1f5f9"; }}>
                    <X style={{ width: "14px", height: "14px" }} />
                  </button>
                </div>
              </div>
              <div style={{ flex: 1, overflow: "auto", display: "flex", alignItems: "center", justifyContent: "center", padding: "10px", background: "#f8fafc", minHeight: "300px" }}>
                {isImageDoc(docPreview) ? (
                  <img src={docPreview.url} alt={docPreview.name} style={{ maxWidth: "100%", maxHeight: "70vh", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                ) : (docPreview.url?.startsWith("data:application/pdf") || docPreview.url?.startsWith("blob:")) && getDocFileType(docPreview.name) === "pdf" ? (
                  <iframe src={docPreview.url} style={{ width: "100%", height: "70vh", border: "none", borderRadius: "8px", background: "#ffffff" }} title={docPreview.name} />
                ) : (
                  <div style={{ textAlign: "center", padding: "40px" }}>
                    <FileText style={{ width: "48px", height: "48px", color: "#cbd5e1", marginBottom: "12px" }} />
                    <p style={{ fontSize: "14px", color: "#64748b", margin: "0 0 8px" }}>Preview not available for this file type</p>
                    <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0 }}>Click Download to save the file</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Modal */}
      <AnimatePresence>
        {showActionModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }} onClick={() => { setShowActionModal(null); setActionNote(""); }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: "480px", background: "#ffffff", borderRadius: "20px", padding: "28px", boxShadow: "0 25px 60px rgba(0,0,0,0.25)" }}>
              <h3 style={{ margin: "0 0 4px", fontSize: "17px", fontWeight: 700, color: "#0f172a" }}>Review Application</h3>
              <p style={{ margin: "0 0 16px", fontSize: "13px", color: "#64748b" }}>Add a note for the applicant (optional)</p>
              <textarea value={actionNote} onChange={(e) => setActionNote(e.target.value)} placeholder="Enter notes, instructions or reason..." rows={3} style={{ width: "100%", padding: "12px 14px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#ffffff", fontSize: "13px", color: "#0f172a", outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }} />
              <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
                <button onClick={() => handleStatusUpdate(showActionModal, "admitted")} disabled={actionLoading} style={{ flex: 1, padding: "10px", borderRadius: "12px", border: "none", background: "#f0fdf4", color: "#16a34a", fontSize: "13px", fontWeight: 600, cursor: actionLoading ? "not-allowed" : "pointer", opacity: actionLoading ? 0.5 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                  <CheckCircle style={{ width: "16px", height: "16px" }} /> {actionLoading ? "Processing..." : "Approve & Admit"}
                </button>
                <button onClick={() => handleStatusUpdate(showActionModal, "rejected")} disabled={actionLoading} style={{ flex: 1, padding: "10px", borderRadius: "12px", border: "none", background: "#fef2f2", color: "#dc2626", fontSize: "13px", fontWeight: 600, cursor: actionLoading ? "not-allowed" : "pointer", opacity: actionLoading ? 0.5 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                  <XCircle style={{ width: "16px", height: "16px" }} /> {actionLoading ? "Processing..." : "Reject"}
                </button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginTop: "8px" }}>
                <button onClick={() => handleStatusUpdate(showActionModal, "under_review")} disabled={actionLoading} style={{ padding: "8px", borderRadius: "10px", border: "none", background: "#eff6ff", color: "#2563eb", fontSize: "12px", fontWeight: 600, cursor: actionLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                  <Clock style={{ width: "12px", height: "12px" }} /> Under Review
                </button>
                <button onClick={() => handleStatusUpdate(showActionModal, "exam")} disabled={actionLoading} style={{ padding: "8px", borderRadius: "10px", border: "none", background: "#faf5ff", color: "#7c3aed", fontSize: "12px", fontWeight: 600, cursor: actionLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                  <Calendar style={{ width: "12px", height: "12px" }} /> Schedule Exam
                </button>
                <button onClick={() => handleStatusUpdate(showActionModal, "interview")} disabled={actionLoading} style={{ padding: "8px", borderRadius: "10px", border: "none", background: "#ecfeff", color: "#0891b2", fontSize: "12px", fontWeight: 600, cursor: actionLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                  <UserCheck style={{ width: "12px", height: "12px" }} /> Schedule Interview
                </button>
                <button onClick={() => { setShowActionModal(null); setActionNote(""); }} disabled={actionLoading} style={{ padding: "8px", borderRadius: "10px", border: "none", background: "#f8fafc", color: "#64748b", fontSize: "12px", fontWeight: 500, cursor: "pointer", transition: "background 0.15s" }} onMouseEnter={(e) => { e.currentTarget.style.background = "#f1f5f9"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "#f8fafc"; }}>
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ModalSection({ title, children, badge }: { title: string; children: React.ReactNode; badge?: number }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
        <h4 style={{ margin: 0, fontSize: "11px", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" }}>{title}</h4>
        {badge !== undefined && badge > 0 && (
          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "20px", height: "20px", borderRadius: "50%", background: "var(--primary, #0055ff)", color: "#ffffff", fontSize: "10px", fontWeight: 700 }}>{badge}</span>
        )}
      </div>
      {children}
    </div>
  );
}

function InfoGrid({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 24px" }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "8px 0", borderBottom: "1px solid #f1f5f9", gap: "8px" }}>
          <span style={{ fontSize: "13px", color: "#64748b", flexShrink: 0 }}>{item.label}</span>
          <span style={{ fontSize: "13px", fontWeight: 500, color: "#0f172a", textAlign: "right" }}>{item.value}</span>
        </div>
      ))}
    </div>
  );
}
