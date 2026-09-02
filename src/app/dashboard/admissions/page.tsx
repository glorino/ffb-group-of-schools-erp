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
  ChevronRight,
  ChevronLeft,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { downloadCSV } from "@/lib/exports";

interface ApplicantDocument {
  name: string;
  type: string;
  url: string;
  size: number | null;
  uploadedAt?: string;
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

const statusColors: Record<string, string> = {
  pending: "bg-[#fef9c3] text-[#a16207] border border-[#fde047]",
  under_review: "bg-[#dbeafe] text-[#1d4ed8] border border-[#93c5fd]",
  exam: "bg-[#f3e8ff] text-[#7c3aed] border border-[#c4b5fd]",
  interview: "bg-[#cffafe] text-[#0891b2] border border-[#67e8f9]",
  admitted: "bg-[#dcfce7] text-[#15803d] border border-[#86efac]",
  rejected: "bg-[#fee2e2] text-[#dc2626] border border-[#fca5a5]",
};

const statusLabels: Record<string, string> = {
  pending: "Pending Review",
  under_review: "Under Review",
  exam: "Entrance Exam",
  interview: "Interview",
  admitted: "Admitted",
  rejected: "Rejected",
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
    } catch {
    }
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
  }, []);

  const workflowSteps = [
    { step: "pending", label: "New", count: applicants.filter((a) => a.status === "pending").length, color: "bg-yellow-500" },
    { step: "under_review", label: "Reviewing", count: applicants.filter((a) => a.status === "under_review").length, color: "bg-blue-500" },
    { step: "exam", label: "Exam", count: applicants.filter((a) => a.status === "exam").length, color: "bg-purple-500" },
    { step: "interview", label: "Interview", count: applicants.filter((a) => a.status === "interview").length, color: "bg-cyan-500" },
    { step: "admitted", label: "Admitted", count: applicants.filter((a) => a.status === "admitted").length, color: "bg-emerald-500" },
    { step: "rejected", label: "Rejected", count: applicants.filter((a) => a.status === "rejected").length, color: "bg-red-500" },
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
      Status: statusLabels[a.status] || a.status,
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
    return doc.url.startsWith("data:image/") || getDocFileType(doc.name) === "image";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0a2a6e] to-[#0055ff] rounded-2xl p-8 border border-white/10 mt-8 mx-4" style={{ background: "linear-gradient(to right, #0a2a6e, #0055ff)" }}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Admissions Management</h1>
            <p className="text-white/70 text-[13px]">Review applications, approve or reject, and manage admission decisions</p>
          </div>
          <button
            onClick={handleExport}
            className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-[13px] font-medium hover:bg-white/20 transition-all"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Pipeline */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#f8fafc] rounded-xl border border-[#e2e8f0] p-5 shadow-sm">
        <h3 className="text-[#1a1a2e] font-semibold mb-4">Admission Pipeline</h3>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {workflowSteps.map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <button onClick={() => setStatusFilter(statusFilter === step.step ? "" : step.step)} className={`flex-1 min-w-[100px] p-3 rounded-xl text-center transition-all ${statusFilter === step.step ? "bg-[#e0e7ff] ring-2 ring-[var(--primary)]/50" : "bg-[#f8fafc] hover:bg-[#f1f5f9]"}`}>
                <div className={`w-2.5 h-2.5 rounded-full ${step.color} mx-auto mb-1.5`} />
                <p className="text-[#1a1a2e] font-bold text-lg">{step.count}</p>
                <p className="text-[#64748b] text-[10px]">{step.label}</p>
              </button>
              {i < workflowSteps.length - 1 && <ArrowRight className="w-4 h-4 text-[#94a3b8] flex-shrink-0" />}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
          <input type="text" placeholder="Search by name or application number..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-[#1a1a2e] text-[13px] placeholder-[#94a3b8] outline-none focus:border-[var(--primary)]/50 transition-all" />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ colorScheme: "light" }}
          className="px-5 py-2.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-[#475569] text-[13px] outline-none focus:border-[var(--primary)]/50 appearance-none cursor-pointer"
        >
          <option value="" style={{ background: "#ffffff", color: "#1a1a2e" }}>All Status</option>
          {Object.entries(statusLabels).map(([val, label]) => (
            <option key={val} value={val} style={{ background: "#ffffff", color: "#1a1a2e" }}>{label}</option>
          ))}
        </select>
      </div>

      {/* Applications List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-[#64748b] animate-spin" />
          </div>
        ) : loadError ? (
          <div className="text-center py-16">
            <AlertCircle className="w-10 h-10 text-[#dc2626] mx-auto mb-3" />
            <p className="text-[#dc2626] text-[14px] font-medium mb-2">{loadError}</p>
            <p className="text-[#94a3b8] text-[12px] mb-4">This may be because the admissions table hasn&apos;t been created yet.</p>
            <button
              onClick={handlePushSchema}
              disabled={pushingSchema}
              className="px-5 py-2.5 rounded-xl bg-[var(--primary)] text-white text-[13px] font-medium hover:opacity-90 transition-all disabled:opacity-50"
            >
              {pushingSchema ? <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> : null}
              {pushingSchema ? "Setting up..." : "Setup Admissions Table"}
            </button>
          </div>
        ) : applicants.length === 0 ? (
          <div className="text-center py-16"><FileText className="w-10 h-10 text-[#94a3b8] mx-auto mb-3" /><p className="text-[#94a3b8] text-[13px]">No applications found</p></div>
        ) : (
          applicants.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="bg-[#f8fafc] rounded-xl border border-[#e2e8f0] p-5 hover:border-[#e2e8f0] hover:shadow-sm transition-all shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--blue-3)] to-[var(--blue-1)] flex items-center justify-center text-white text-sm font-bold border border-[#e2e8f0] flex-shrink-0">
                    {a.firstName[0]}{a.lastName[0]}
                  </div>
                  <div>
                    <p className="text-[#1a1a2e] font-semibold text-[15px]">{a.firstName} {a.lastName}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[#94a3b8] text-[11px]">{a.applicationNumber}</span>
                      <span className="text-[#94a3b8]">·</span>
                      <span className="text-[#94a3b8] text-[11px]">{a.classAppliedFor}</span>
                      <span className="text-[#94a3b8]">·</span>
                      <span className="text-[#94a3b8] text-[11px]">{new Date(a.submittedAt).toLocaleDateString("en-NG")}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusColors[a.status] || "bg-[#f1f5f9] text-[#475569]"}`}>
                    {statusLabels[a.status] || a.status}
                  </span>
                  <button onClick={() => fetchApplicantDetail(a)} className="p-2 rounded-lg bg-[#f8fafc] text-[#64748b] hover:text-[#1a1a2e] hover:bg-[#f1f5f9] transition">
                    <Eye className="w-4 h-4" />
                  </button>
                  {a.status === "pending" && (
                    <>
                      <button onClick={() => setShowActionModal(a.id)} className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-[#16a34a] text-[11px] font-semibold hover:bg-[#dcfce7] transition flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Approve
                      </button>
                      <button onClick={() => { setShowActionModal(a.id); setActionNote(""); }} className="px-3 py-1.5 rounded-lg bg-red-500/10 text-[#dc2626] text-[11px] font-semibold hover:bg-[#fee2e2] transition flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedApplicant && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} onClick={() => { setSelectedApplicant(null); setDocPreview(null); }}>
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
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColors[selectedApplicant.status] || ""}`}>{statusLabels[selectedApplicant.status] || selectedApplicant.status}</span>
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
                  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    {/* Section: Personal */}
                    <Section title="Personal Information">
                      <InfoGrid items={[
                        { label: "Class Applied", value: selectedApplicant.classAppliedFor },
                        { label: "Gender", value: selectedApplicant.gender },
                        { label: "Date of Birth", value: selectedApplicant.dateOfBirth ? new Date(selectedApplicant.dateOfBirth).toLocaleDateString("en-NG") : "—" },
                        { label: "Nationality", value: selectedApplicant.nationality || "—" },
                        { label: "State of Origin", value: selectedApplicant.stateOfOrigin || "—" },
                        { label: "Blood Group", value: selectedApplicant.bloodGroup || "—" },
                      ]} />
                    </Section>

                    {/* Section: Contact */}
                    <Section title="Contact Information">
                      <InfoGrid items={[
                        { label: "Email", value: selectedApplicant.email || "—" },
                        { label: "Phone", value: selectedApplicant.phone || "—" },
                        { label: "Address", value: selectedApplicant.address || "—" },
                        { label: "Previous School", value: selectedApplicant.previousSchool || "—" },
                      ]} />
                    </Section>

                    {/* Section: Guardian */}
                    <Section title="Guardian Information">
                      <InfoGrid items={[
                        { label: "Guardian Name", value: selectedApplicant.guardianName || "—" },
                        { label: "Relationship", value: selectedApplicant.guardianRelationship || "—" },
                        { label: "Guardian Phone", value: selectedApplicant.guardianPhone || "—" },
                        { label: "Guardian Email", value: selectedApplicant.guardianEmail || "—" },
                      ]} />
                    </Section>

                    {/* Section: Documents */}
                    <Section title="Uploaded Documents" badge={selectedApplicant.documents?.length || 0}>
                      {selectedApplicant.documents && selectedApplicant.documents.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          {selectedApplicant.documents.map((doc, i) => {
                            const fileType = getDocFileType(doc.name);
                            const iconBg = fileType === "pdf" ? "#fef2f2" : fileType === "image" ? "#eff6ff" : "#f0fdf4";
                            const iconColor = fileType === "pdf" ? "#dc2626" : fileType === "image" ? "#2563eb" : "#16a34a";
                            const typeLabel = fileType === "pdf" ? "PDF" : fileType === "image" ? "IMG" : fileType === "doc" ? "DOC" : "FILE";
                            return (
                              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #e2e8f0", transition: "border-color 0.15s" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0, flex: 1 }}>
                                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    {fileType === "image" ? <ImageIcon style={{ width: "16px", height: "16px", color: iconColor }} /> : <FileText style={{ width: "16px", height: "16px", color: iconColor }} />}
                                  </div>
                                  <div style={{ minWidth: 0 }}>
                                    <p style={{ margin: 0, fontSize: "13px", fontWeight: 500, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.name}</p>
                                    <p style={{ margin: 0, fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>{doc.size ? `${(doc.size / 1024).toFixed(1)} KB` : "—"}</p>
                                  </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
                                  <span style={{ padding: "2px 6px", borderRadius: "4px", fontSize: "9px", fontWeight: 700, background: iconBg, color: iconColor, marginRight: "4px" }}>{typeLabel}</span>
                                  <button onClick={() => setDocPreview(doc)} style={{ width: "28px", height: "28px", borderRadius: "6px", border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", transition: "all 0.15s" }} title="Preview" onMouseEnter={(e) => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#475569"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}>
                                    <Eye style={{ width: "14px", height: "14px" }} />
                                  </button>
                                  {doc.url && !doc.url.startsWith("data:") && (
                                    <a href={doc.url} download={doc.name} style={{ width: "28px", height: "28px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", textDecoration: "none", transition: "all 0.15s" }} title="Download" onMouseEnter={(e) => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#475569"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}>
                                      <Download style={{ width: "14px", height: "14px" }} />
                                    </a>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8", textAlign: "center", padding: "16px 0" }}>No documents uploaded</p>
                      )}
                    </Section>

                    {/* Dates */}
                    <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "#94a3b8" }}>
                      <span>Submitted: {new Date(selectedApplicant.submittedAt).toLocaleDateString("en-NG")}</span>
                      {selectedApplicant.reviewedAt && <span>Reviewed: {new Date(selectedApplicant.reviewedAt).toLocaleDateString("en-NG")}</span>}
                    </div>

                    {/* Decision Notes */}
                    {selectedApplicant.decisionNote && (
                      <div style={{ padding: "12px 16px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                        <p style={{ margin: 0, fontSize: "10px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Decision Note</p>
                        <p style={{ margin: 0, fontSize: "13px", color: "#475569" }}>{selectedApplicant.decisionNote}</p>
                      </div>
                    )}
                    {selectedApplicant.rejectionReason && (
                      <div style={{ padding: "12px 16px", borderRadius: "12px", background: "#fef2f2", border: "1px solid #fecaca" }}>
                        <p style={{ margin: 0, fontSize: "10px", fontWeight: 700, color: "#dc2626", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Rejection Reason</p>
                        <p style={{ margin: 0, fontSize: "13px", color: "#dc2626" }}>{selectedApplicant.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              {selectedApplicant.status === "pending" && (
                <div style={{ padding: "16px 28px 20px", borderTop: "1px solid #f1f5f9", display: "flex", gap: "10px", flexShrink: 0 }}>
                  <button onClick={() => setShowActionModal(selectedApplicant.id)} style={{ flex: 1, padding: "10px", borderRadius: "12px", border: "none", background: "#f0fdf4", color: "#16a34a", fontSize: "13px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", transition: "background 0.15s" }} onMouseEnter={(e) => { e.currentTarget.style.background = "#dcfce7"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "#f0fdf4"; }}>
                    <CheckCircle style={{ width: "16px", height: "16px" }} /> Approve
                  </button>
                  <button onClick={() => setShowActionModal(selectedApplicant.id)} style={{ flex: 1, padding: "10px", borderRadius: "12px", border: "none", background: "#fef2f2", color: "#dc2626", fontSize: "13px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", transition: "background 0.15s" }} onMouseEnter={(e) => { e.currentTarget.style.background = "#fee2e2"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "#fef2f2"; }}>
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }} onClick={() => setDocPreview(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: "900px", maxHeight: "90vh", background: "#ffffff", borderRadius: "16px", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 25px 60px rgba(0,0,0,0.4)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid #f1f5f9", background: "#f8fafc" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <FileText style={{ width: "16px", height: "16px", color: "#64748b" }} />
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>{docPreview.name}</span>
                  {docPreview.size && <span style={{ fontSize: "11px", color: "#94a3b8" }}>({(docPreview.size / 1024).toFixed(1)} KB)</span>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  {docPreview.url && (
                    <a href={docPreview.url} download={docPreview.name} style={{ padding: "6px 12px", borderRadius: "8px", background: "#f1f5f9", color: "#475569", fontSize: "12px", fontWeight: 500, textDecoration: "none", display: "flex", alignItems: "center", gap: "4px", transition: "background 0.15s" }} onMouseEnter={(e) => { e.currentTarget.style.background = "#e2e8f0"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "#f1f5f9"; }}>
                      <Download style={{ width: "12px", height: "12px" }} /> Download
                    </a>
                  )}
                  <button onClick={() => setDocPreview(null)} style={{ width: "28px", height: "28px", borderRadius: "6px", border: "none", background: "#f1f5f9", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", transition: "all 0.15s" }} onMouseEnter={(e) => { e.currentTarget.style.background = "#e2e8f0"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "#f1f5f9"; }}>
                    <X style={{ width: "14px", height: "14px" }} />
                  </button>
                </div>
              </div>
              <div style={{ flex: 1, overflow: "auto", display: "flex", alignItems: "center", justifyContent: "center", padding: "10px", background: "#f8fafc", minHeight: "300px" }}>
                {isImageDoc(docPreview) ? (
                  <img src={docPreview.url} alt={docPreview.name} style={{ maxWidth: "100%", maxHeight: "70vh", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                ) : docPreview.url.startsWith("data:application/pdf") ? (
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }} onClick={() => { setShowActionModal(null); setActionNote(""); }}>
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

function Section({ title, children, badge }: { title: string; children: React.ReactNode; badge?: number }) {
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
