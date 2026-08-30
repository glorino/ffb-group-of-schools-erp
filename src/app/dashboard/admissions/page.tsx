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
  Heart,
  AlertCircle,
  UserCheck,
  MessageSquare,
  Loader2,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { downloadCSV } from "@/lib/exports";

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
  documents?: { name: string; type: string; url: string; size: number | null; uploadedAt: string }[];
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-[#ca8a04]",
  under_review: "bg-[#dbeafe] text-[#2563eb]",
  exam: "bg-[#f3e8ff] text-[#7c3aed]",
  interview: "bg-[#cffafe] text-[#0891b2]",
  admitted: "bg-[#dcfce7] text-[#16a34a]",
  rejected: "bg-[#fee2e2] text-[#dc2626]",
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
  const [showActionModal, setShowActionModal] = useState<string | null>(null);
  const [actionNote, setActionNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [pushingSchema, setPushingSchema] = useState(false);

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

  useEffect(() => { fetchApplicants(); }, [fetchApplicants]);

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
          setSelectedApplicant({ ...selectedApplicant, status: newStatus, decisionNote: actionNote || selectedApplicant.decisionNote });
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
      "Submitted": new Date(a.submittedAt).toLocaleDateString("en-NG"),
      Email: a.email,
      Phone: a.phone,
    }));
    downloadCSV(data, "admissions");
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
                  <button onClick={() => setSelectedApplicant(a)} className="p-2 rounded-lg bg-[#f8fafc] text-[#64748b] hover:text-[#1a1a2e] hover:bg-[#f1f5f9] transition">
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" onClick={() => setSelectedApplicant(null)}>
             <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl bg-white border border-[#e2e8f0] rounded-3xl p-8 max-h-[85vh] overflow-y-auto shadow-xl">
               <div className="flex items-center justify-between mb-6">
                   <h3 className="text-[#1a1a2e] font-extrabold text-xl">Application Details</h3>
                 <button onClick={() => setSelectedApplicant(null)} className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#1a1a2e] hover:bg-[#f1f5f9] transition"><X className="w-5 h-5" /></button>
               </div>
               <div className="space-y-4">
                 <div className="flex items-center gap-4 mb-4">
                   <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--blue-3)] to-[var(--blue-1)] flex items-center justify-center text-white text-xl font-bold">{selectedApplicant.firstName[0]}{selectedApplicant.lastName[0]}</div>
                   <div>
                     <p className="text-[#1a1a2e] font-bold text-lg">{selectedApplicant.firstName} {selectedApplicant.lastName}</p>
                     <p className="text-[#94a3b8] text-[12px]">{selectedApplicant.applicationNumber}</p>
                     <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColors[selectedApplicant.status] || "bg-[#f1f5f9] text-[#475569]"}`}>
                       {statusLabels[selectedApplicant.status] || selectedApplicant.status}
                     </span>
                   </div>
                 </div>

                 <div>
                   <h4 className="text-[#475569] text-[11px] uppercase font-semibold mb-2">Personal Information</h4>
                   <div className="grid grid-cols-2 gap-2">
                     {[
                       { label: "Class Applied", value: selectedApplicant.classAppliedFor },
                       { label: "Gender", value: selectedApplicant.gender },
                       { label: "Date of Birth", value: new Date(selectedApplicant.dateOfBirth).toLocaleDateString("en-NG") },
                       { label: "Nationality", value: selectedApplicant.nationality || "—" },
                       { label: "State of Origin", value: selectedApplicant.stateOfOrigin || "—" },
                       { label: "Blood Group", value: selectedApplicant.bloodGroup || "—" },
                     ].map((item, i) => (
                       <div key={i} className="flex justify-between py-2 border-b border-[#e2e8f0]">
                         <span className="text-[#64748b] text-[13px]">{item.label}</span>
                         <span className="text-[#1a1a2e] text-[13px] font-medium text-right">{item.value}</span>
                       </div>
                     ))}
                   </div>
                 </div>

                 <div>
                   <h4 className="text-[#475569] text-[11px] uppercase font-semibold mb-2">Contact Information</h4>
                   <div className="grid grid-cols-2 gap-2">
                     {[
                       { label: "Email", value: selectedApplicant.email || "—" },
                       { label: "Phone", value: selectedApplicant.phone || "—" },
                       { label: "Address", value: selectedApplicant.address || "—" },
                       { label: "Previous School", value: selectedApplicant.previousSchool || "—" },
                     ].map((item, i) => (
                       <div key={i} className="flex justify-between py-2 border-b border-[#e2e8f0]">
                         <span className="text-[#64748b] text-[13px]">{item.label}</span>
                         <span className="text-[#1a1a2e] text-[13px] font-medium text-right">{item.value}</span>
                       </div>
                     ))}
                   </div>
                 </div>

                 <div>
                   <h4 className="text-[#475569] text-[11px] uppercase font-semibold mb-2">Guardian Information</h4>
                   <div className="grid grid-cols-2 gap-2">
                     {[
                       { label: "Guardian Name", value: selectedApplicant.guardianName || "—" },
                       { label: "Relationship", value: selectedApplicant.guardianRelationship || "—" },
                       { label: "Guardian Phone", value: selectedApplicant.guardianPhone || "—" },
                       { label: "Guardian Email", value: selectedApplicant.guardianEmail || "—" },
                     ].map((item, i) => (
                       <div key={i} className="flex justify-between py-2 border-b border-[#e2e8f0]">
                         <span className="text-[#64748b] text-[13px]">{item.label}</span>
                         <span className="text-[#1a1a2e] text-[13px] font-medium text-right">{item.value}</span>
                       </div>
                     ))}
                   </div>
                 </div>

                  {selectedApplicant.documents && selectedApplicant.documents.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-[#475569] text-[11px] uppercase font-semibold">Uploaded Documents</h4>
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-[10px] font-bold">{selectedApplicant.documents.length}</span>
                      </div>
                      <div className="space-y-2">
                        {selectedApplicant.documents.map((doc, i) => {
                          const ext = doc.name.split(".").pop()?.toLowerCase() || "";
                          const isPDF = ext === "pdf";
                          const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(ext);
                          const iconBg = isPDF ? "bg-red-500/10" : isImage ? "bg-blue-500/10" : "bg-green-500/10";
                          const iconColor = isPDF ? "text-[#dc2626]" : isImage ? "text-[#2563eb]" : "text-[#16a34a]";
                          const typeBg = isPDF ? "bg-red-500/10 text-[#dc2626]" : isImage ? "bg-blue-500/10 text-[#2563eb]" : "bg-green-500/10 text-[#16a34a]";
                          return (
                          <div key={i} className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] hover:border-[#e2e8f0] transition">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center`}>
                                <FileText className={`w-4 h-4 ${iconColor}`} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="text-[#1a1a2e] text-[13px] font-medium">{doc.name}</p>
                                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold ${typeBg}`}>{doc.type}</span>
                                </div>
                                <p className="text-[#94a3b8] text-[10px]">{doc.size ? `${(doc.size / 1024).toFixed(1)} KB` : "—"}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <a href={doc.url} target="_blank" rel="noopener noreferrer" title="View document" className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#475569] hover:bg-[#f1f5f9] transition">
                                <Eye className="w-4 h-4" />
                              </a>
                              <a href={doc.url} download title="Download document" className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#475569] hover:bg-[#f1f5f9] transition">
                                <Download className="w-4 h-4" />
                              </a>
                            </div>
                          </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="border-t border-[#e2e8f0] my-1" />

                  {[
                   { label: "Date Submitted", value: new Date(selectedApplicant.submittedAt).toLocaleDateString("en-NG") },
                   selectedApplicant.reviewedAt ? { label: "Reviewed At", value: new Date(selectedApplicant.reviewedAt).toLocaleDateString("en-NG") } : null,
                 ].filter(Boolean).map((item, i) => (
                   <div key={i} className="flex justify-between py-2 border-b border-[#e2e8f0]">
                     <span className="text-[#64748b] text-[13px]">{item!.label}</span>
                     <span className="text-[#1a1a2e] text-[13px] font-medium text-right">{item!.value}</span>
                   </div>
                 ))}

                 {selectedApplicant.decisionNote && (
                   <div className="mt-3 p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                     <p className="text-[#94a3b8] text-[11px] uppercase mb-1">Decision Note</p>
                     <p className="text-[#475569] text-[13px]">{selectedApplicant.decisionNote}</p>
                   </div>
                 )}
                 {selectedApplicant.rejectionReason && (
                   <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                      <p className="text-[#dc2626] text-[11px] uppercase mb-1">Rejection Reason</p>
                      <p className="text-[#dc2626] text-[13px]">{selectedApplicant.rejectionReason}</p>
                   </div>
                 )}
                 {selectedApplicant.status === "pending" && (
                   <div className="flex gap-2 mt-4">
                     <button onClick={() => { setShowActionModal(selectedApplicant.id); }} className="flex-1 py-2.5 rounded-xl bg-[#dcfce7] text-[#16a34a] text-[13px] font-semibold hover:bg-emerald-500/25 transition flex items-center justify-center gap-2">
                       <CheckCircle className="w-4 h-4" /> Approve
                     </button>
                     <button onClick={() => { setShowActionModal(selectedApplicant.id); }} className="flex-1 py-2.5 rounded-xl bg-[#fee2e2] text-[#dc2626] text-[13px] font-semibold hover:bg-red-500/25 transition flex items-center justify-center gap-2">
                       <XCircle className="w-4 h-4" /> Reject
                     </button>
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" onClick={() => { setShowActionModal(null); setActionNote(""); }}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-xl bg-white border border-[#e2e8f0] rounded-3xl p-6 shadow-xl">
              <h3 className="text-[#1a1a2e] font-bold text-lg mb-2">Review Application</h3>
              <p className="text-[#64748b] text-[13px] mb-4">Add a note for the applicant (optional)</p>
              <textarea value={actionNote} onChange={(e) => setActionNote(e.target.value)} placeholder="Enter notes, instructions or reason..." rows={4} className="w-full p-3 rounded-xl bg-[#ffffff] border border-[#e2e8f0] text-[#1a1a2e] text-[13px] outline-none focus:border-[var(--primary)]/50 resize-none" />
              <div className="flex gap-2 mt-4">
                <button onClick={() => handleStatusUpdate(showActionModal, "admitted")} disabled={actionLoading} className="flex-1 py-2.5 rounded-xl bg-[#dcfce7] text-[#16a34a] text-[13px] font-semibold hover:bg-emerald-500/25 transition flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" /> {actionLoading ? "Processing..." : "Approve & Admit"}
                </button>
                <button onClick={() => handleStatusUpdate(showActionModal, "rejected")} disabled={actionLoading} className="flex-1 py-2.5 rounded-xl bg-[#fee2e2] text-[#dc2626] text-[13px] font-semibold hover:bg-red-500/25 transition flex items-center justify-center gap-2">
                  <XCircle className="w-4 h-4" /> {actionLoading ? "Processing..." : "Reject"}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button onClick={() => handleStatusUpdate(showActionModal, "under_review")} disabled={actionLoading} className="py-2 rounded-xl bg-[#dbeafe] text-[#2563eb] text-[12px] font-semibold hover:bg-blue-500/25 transition flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3" /> Under Review
                </button>
                <button onClick={() => handleStatusUpdate(showActionModal, "exam")} disabled={actionLoading} className="py-2 rounded-xl bg-[#f3e8ff] text-[#7c3aed] text-[12px] font-semibold hover:bg-purple-500/25 transition flex items-center justify-center gap-1">
                  <Calendar className="w-3 h-3" /> Schedule Exam
                </button>
                <button onClick={() => handleStatusUpdate(showActionModal, "interview")} disabled={actionLoading} className="py-2 rounded-xl bg-[#cffafe] text-[#0891b2] text-[12px] font-semibold hover:bg-cyan-500/25 transition flex items-center justify-center gap-1">
                  <UserCheck className="w-3 h-3" /> Schedule Interview
                </button>
                <button onClick={() => setShowActionModal(null)} disabled={actionLoading} className="py-2 rounded-xl bg-[#f8fafc] text-[#64748b] text-[12px] font-medium hover:bg-[#f1f5f9] transition">
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
