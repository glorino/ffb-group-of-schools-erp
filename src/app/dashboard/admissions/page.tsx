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
  Mail,
  GraduationCap,
  AlertCircle,
  UserCheck,
  MessageSquare,
  Loader2,
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
  guardianRelationship: string | null;
  dateOfBirth: string;
  gender: string;
  previousSchool: string | null;
  decisionNote: string | null;
  rejectionReason: string | null;
  reviewedAt: string | null;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400",
  under_review: "bg-blue-500/20 text-blue-400",
  exam: "bg-purple-500/20 text-purple-400",
  interview: "bg-cyan-500/20 text-cyan-400",
  admitted: "bg-emerald-500/20 text-emerald-400",
  rejected: "bg-red-500/20 text-red-400",
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

  const fetchApplicants = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/admissions?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setApplicants(data.applicants ?? []);
    } catch {
      toast.error("Failed to load admissions data");
    }
    setLoading(false);
  }, [search, statusFilter]);

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
      if (data.id) {
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
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Admissions Management</h2>
          <p className="text-white/50 text-sm">Review applications, approve or reject, and manage admission decisions</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/60 text-[13px] font-medium hover:bg-white/[0.08] transition-all"
        >
          Export CSV
        </button>
      </div>

      {/* Pipeline */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/[0.04] backdrop-blur-xl rounded-xl border border-white/[0.08] p-5">
        <h3 className="text-white font-semibold mb-4">Admission Pipeline</h3>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {workflowSteps.map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              <button onClick={() => setStatusFilter(statusFilter === step.step ? "" : step.step)} className={`flex-1 min-w-[100px] p-3 rounded-xl text-center transition-all ${statusFilter === step.step ? "bg-white/[0.15] ring-2 ring-white/20" : "bg-white/[0.04] hover:bg-white/[0.08]"}`}>
                <div className={`w-2.5 h-2.5 rounded-full ${step.color} mx-auto mb-1.5`} />
                <p className="text-white font-bold text-lg">{step.count}</p>
                <p className="text-white/40 text-[10px]">{step.label}</p>
              </button>
              {i < workflowSteps.length - 1 && <ArrowRight className="w-4 h-4 text-white/15 flex-shrink-0" />}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
          <input type="text" placeholder="Search by name or application number..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/90 text-[13px] placeholder-white/20 outline-none focus:border-[var(--primary)]/50 transition-all" />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ colorScheme: "dark" }}
          className="px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/60 text-[13px] outline-none focus:border-[var(--primary)]/50 appearance-none cursor-pointer"
        >
          <option value="" style={{ background: "#0f1b33", color: "#fff" }}>All Status</option>
          {Object.entries(statusLabels).map(([val, label]) => (
            <option key={val} value={val} style={{ background: "#0f1b33", color: "#fff" }}>{label}</option>
          ))}
        </select>
      </div>

      {/* Applications List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-white/40 animate-spin" />
          </div>
        ) : applicants.length === 0 ? (
          <div className="text-center py-16"><FileText className="w-10 h-10 text-white/10 mx-auto mb-3" /><p className="text-white/30 text-[13px]">No applications found</p></div>
        ) : (
          applicants.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="bg-white/[0.04] backdrop-blur-xl rounded-xl border border-white/[0.08] p-5 hover:border-white/[0.12] transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--blue-3)] to-[var(--blue-1)] flex items-center justify-center text-white text-sm font-bold border border-white/10 flex-shrink-0">
                    {a.firstName[0]}{a.lastName[0]}
                  </div>
                  <div>
                    <p className="text-white/90 font-semibold text-[15px]">{a.firstName} {a.lastName}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-white/30 text-[11px]">{a.applicationNumber}</span>
                      <span className="text-white/20">·</span>
                      <span className="text-white/30 text-[11px]">{a.classAppliedFor}</span>
                      <span className="text-white/20">·</span>
                      <span className="text-white/30 text-[11px]">{new Date(a.submittedAt).toLocaleDateString("en-NG")}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusColors[a.status] || "bg-white/10 text-white/60"}`}>
                    {statusLabels[a.status] || a.status}
                  </span>
                  <button onClick={() => setSelectedApplicant(a)} className="p-2 rounded-lg bg-white/[0.04] text-white/40 hover:text-white hover:bg-white/[0.08] transition">
                    <Eye className="w-4 h-4" />
                  </button>
                  {a.status === "pending" && (
                    <>
                      <button onClick={() => setShowActionModal(a.id)} className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold hover:bg-emerald-500/20 transition flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Approve
                      </button>
                      <button onClick={() => { setShowActionModal(a.id); setActionNote(""); }} className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-[11px] font-semibold hover:bg-red-500/20 transition flex items-center gap-1">
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }} onClick={() => setSelectedApplicant(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-lg bg-[#0a1628] border border-white/10 rounded-3xl p-6 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-white font-bold text-lg">Application Details</h3>
                <button onClick={() => setSelectedApplicant(null)} className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--blue-3)] to-[var(--blue-1)] flex items-center justify-center text-white text-xl font-bold">{selectedApplicant.firstName[0]}{selectedApplicant.lastName[0]}</div>
                  <div>
                    <p className="text-white font-bold text-lg">{selectedApplicant.firstName} {selectedApplicant.lastName}</p>
                    <p className="text-white/30 text-[12px]">{selectedApplicant.applicationNumber}</p>
                  </div>
                </div>
                {[
                  { label: "Class Applied", value: selectedApplicant.classAppliedFor },
                  { label: "Gender", value: selectedApplicant.gender },
                  { label: "Date of Birth", value: new Date(selectedApplicant.dateOfBirth).toLocaleDateString("en-NG") },
                  { label: "Email", value: selectedApplicant.email || "—" },
                  { label: "Phone", value: selectedApplicant.phone || "—" },
                  { label: "Guardian", value: selectedApplicant.guardianName ? `${selectedApplicant.guardianName} (${selectedApplicant.guardianRelationship || ""})` : "—" },
                  { label: "Guardian Phone", value: selectedApplicant.guardianPhone || "—" },
                  { label: "Previous School", value: selectedApplicant.previousSchool || "—" },
                  { label: "Date Submitted", value: new Date(selectedApplicant.submittedAt).toLocaleDateString("en-NG") },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-white/40 text-[13px]">{item.label}</span>
                    <span className="text-white/80 text-[13px] font-medium text-right">{item.value}</span>
                  </div>
                ))}
                {selectedApplicant.decisionNote && (
                  <div className="mt-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                    <p className="text-white/30 text-[11px] uppercase mb-1">Decision Note</p>
                    <p className="text-white/70 text-[13px]">{selectedApplicant.decisionNote}</p>
                  </div>
                )}
                {selectedApplicant.status === "pending" && (
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => { setShowActionModal(selectedApplicant.id); }} className="flex-1 py-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 text-[13px] font-semibold hover:bg-emerald-500/25 transition flex items-center justify-center gap-2">
                      <CheckCircle className="w-4 h-4" /> Approve
                    </button>
                    <button onClick={() => { setShowActionModal(selectedApplicant.id); }} className="flex-1 py-2.5 rounded-xl bg-red-500/15 text-red-400 text-[13px] font-semibold hover:bg-red-500/25 transition flex items-center justify-center gap-2">
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }} onClick={() => { setShowActionModal(null); setActionNote(""); }}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-[#0a1628] border border-white/10 rounded-3xl p-6">
              <h3 className="text-white font-bold text-lg mb-2">Review Application</h3>
              <p className="text-white/40 text-[13px] mb-4">Add a note for the applicant (optional)</p>
              <textarea value={actionNote} onChange={(e) => setActionNote(e.target.value)} placeholder="Enter notes, instructions or reason..." rows={4} className="w-full p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] outline-none focus:border-[var(--primary)]/50 resize-none" />
              <div className="flex gap-2 mt-4">
                <button onClick={() => handleStatusUpdate(showActionModal, "admitted")} disabled={actionLoading} className="flex-1 py-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 text-[13px] font-semibold hover:bg-emerald-500/25 transition flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" /> {actionLoading ? "Processing..." : "Approve & Admit"}
                </button>
                <button onClick={() => handleStatusUpdate(showActionModal, "rejected")} disabled={actionLoading} className="flex-1 py-2.5 rounded-xl bg-red-500/15 text-red-400 text-[13px] font-semibold hover:bg-red-500/25 transition flex items-center justify-center gap-2">
                  <XCircle className="w-4 h-4" /> {actionLoading ? "Processing..." : "Reject"}
                </button>
              </div>
              <button onClick={() => handleStatusUpdate(showActionModal, "under_review")} disabled={actionLoading} className="w-full mt-2 py-2 rounded-xl bg-white/[0.04] text-white/50 text-[12px] font-medium hover:bg-white/[0.08] transition">
                Mark as Under Review
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
