"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Calendar,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { DataTable } from "@/components/ui/data-table";

interface Applicant {
  id: string;
  applicationNumber: string;
  firstName: string;
  lastName: string;
  classAppliedFor: string;
  status: string;
  submittedAt: string;
  admissionFeePaid: boolean;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400",
  exam: "bg-blue-500/20 text-blue-400",
  interview: "bg-purple-500/20 text-purple-400",
  admitted: "bg-emerald-500/20 text-emerald-400",
  rejected: "bg-red-500/20 text-red-400",
};

const statusIcons: Record<string, any> = {
  pending: Clock,
  exam: FileText,
  interview: Calendar,
  admitted: CheckCircle,
  rejected: XCircle,
};

export default function AdmissionsPage() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("applications");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);

    fetch(`/api/admissions?${params}`)
      .then((res) => res.json())
      .then((data) => setApplicants(data.applicants ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search]);

  const workflowSteps = [
    { step: "Application", count: applicants.filter((a) => a.status === "pending").length, color: "bg-blue-500" },
    { step: "Exam", count: applicants.filter((a) => a.status === "exam").length, color: "bg-yellow-500" },
    { step: "Interview", count: applicants.filter((a) => a.status === "interview").length, color: "bg-purple-500" },
    { step: "Admitted", count: applicants.filter((a) => a.status === "admitted").length, color: "bg-emerald-500" },
    { step: "Rejected", count: applicants.filter((a) => a.status === "rejected").length, color: "bg-red-500" },
  ];

  const columns = [
    {
      key: "name",
      label: "Applicant",
      render: (row: Applicant) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white text-xs font-bold">
            {row.firstName[0]}{row.lastName[0]}
          </div>
          <span className="text-white font-medium">{row.firstName} {row.lastName}</span>
        </div>
      ),
    },
    { key: "applicationNumber", label: "Application No." },
    { key: "classAppliedFor", label: "Class Applied" },
    {
      key: "submittedAt",
      label: "Date",
      render: (row: Applicant) => new Date(row.submittedAt).toLocaleDateString(),
    },
    {
      key: "admissionFeePaid",
      label: "Fee Status",
      render: (row: Applicant) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.admissionFeePaid
              ? "bg-emerald-500/20 text-emerald-400"
              : "bg-red-500/20 text-red-400"
          }`}
        >
          {row.admissionFeePaid ? "Paid" : "Unpaid"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row: Applicant) => {
        const StatusIcon = statusIcons[row.status] || Clock;
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[row.status] || "bg-white/10 text-white/60"}`}
          >
            <StatusIcon className="w-3 h-3" />
            {row.status}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      className: "text-right",
      render: (row: Applicant) => (
        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all">
            <Eye className="w-4 h-4" />
          </button>
          {row.status === "pending" && (
            <>
              <button className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/20 transition-all">
                <CheckCircle className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-all">
                <XCircle className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Admissions Management</h2>
          <p className="text-white/50 text-sm">
            Process applications, schedule exams, and manage the admission workflow
          </p>
        </div>
        <button className="px-4 py-2.5 rounded-xl bg-[var(--primary)] text-white text-sm font-semibold hover:opacity-90 transition-all flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Application
        </button>
      </div>

      {/* Admission Workflow */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <h3 className="text-white font-semibold mb-4">Admission Pipeline</h3>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {workflowSteps.map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex-1 min-w-[120px] p-4 rounded-xl bg-white/5 text-center">
                <div className={`w-3 h-3 rounded-full ${step.color} mx-auto mb-2`} />
                <p className="text-white font-bold text-xl">{step.count}</p>
                <p className="text-white/40 text-xs">{step.step}</p>
              </div>
              {i < workflowSteps.length - 1 && (
                <ArrowRight className="w-5 h-5 text-white/20 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-white/10 pb-2">
        {["applications", "entrance-exam", "interviews", "offer-letters"].map(
          (tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all ${
                activeTab === tab
                  ? "text-[var(--accent)] border-b-2 border-[var(--accent)]"
                  : "text-white/50 hover:text-white"
              }`}
            >
              {tab
                .replace(/-/g, " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())}
            </button>
          )
        )}
      </div>

      {/* Applications Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card overflow-hidden"
      >
        <div className="p-4">
          <DataTable
            columns={columns}
            data={applicants}
            loading={loading}
            searchable={false}
            pagination={true}
            pageSize={10}
            emptyMessage="No applications found"
          />
        </div>
      </motion.div>
    </div>
  );
}
