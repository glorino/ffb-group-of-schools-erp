"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  Search,
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Calendar,
  UserPlus,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

const mockApplications = [
  {
    id: "1",
    appNo: "APP/2025/001",
    name: "Blessing Eze",
    class: "JSS1",
    date: "2025-01-15",
    status: "pending",
    examScore: null,
    feePaid: false,
  },
  {
    id: "2",
    appNo: "APP/2025/002",
    name: "Yusuf Aliyu",
    class: "SS1",
    date: "2025-01-14",
    status: "exam",
    examScore: 78,
    feePaid: true,
  },
  {
    id: "3",
    appNo: "APP/2025/003",
    name: "Ngozi Okoro",
    class: "JSS2",
    date: "2025-01-13",
    status: "interview",
    examScore: 85,
    feePaid: true,
  },
  {
    id: "4",
    appNo: "APP/2025/004",
    name: "Tunde Bakare",
    class: "SS2",
    date: "2025-01-12",
    status: "admitted",
    examScore: 92,
    feePaid: true,
  },
  {
    id: "5",
    appNo: "APP/2025/005",
    name: "Halima Suleiman",
    class: "JSS1",
    date: "2025-01-11",
    status: "rejected",
    examScore: 35,
    feePaid: false,
  },
];

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

const workflowSteps = [
  { step: "Application", count: 12, color: "bg-blue-500" },
  { step: "Screening", count: 8, color: "bg-yellow-500" },
  { step: "Exam", count: 5, color: "bg-purple-500" },
  { step: "Interview", count: 3, color: "bg-orange-500" },
  { step: "Admitted", count: 18, color: "bg-emerald-500" },
];

export default function AdmissionsPage() {
  const [activeTab, setActiveTab] = useState("applications");

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
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
            <input
              type="text"
              placeholder="Search applications..."
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-premium">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Application No.</th>
                <th>Class Applied</th>
                <th>Date</th>
                <th>Exam Score</th>
                <th>Fee Status</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockApplications.map((app) => {
                const StatusIcon = statusIcons[app.status];
                return (
                  <tr key={app.id} className="group">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white text-xs font-bold">
                          {app.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <span className="text-white font-medium">{app.name}</span>
                      </div>
                    </td>
                    <td className="text-white/60">{app.appNo}</td>
                    <td className="text-white/60">{app.class}</td>
                    <td className="text-white/60">{app.date}</td>
                    <td className="text-white/60">
                      {app.examScore ? (
                        <span
                          className={`font-semibold ${
                            app.examScore >= 50
                              ? "text-emerald-400"
                              : "text-red-400"
                          }`}
                        >
                          {app.examScore}%
                        </span>
                      ) : (
                        <span className="text-white/30">—</span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          app.feePaid
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {app.feePaid ? "Paid" : "Unpaid"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[app.status]}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {app.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all">
                          <Eye className="w-4 h-4" />
                        </button>
                        {app.status === "pending" && (
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
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
