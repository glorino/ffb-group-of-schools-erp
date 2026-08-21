"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  Phone,
  Mail,
  Eye,
  X,
  Loader2,
  GraduationCap,
  Link,
} from "lucide-react";
import { toast } from "sonner";

interface Guardian {
  id: string;
  firstName: string;
  lastName: string;
  relationship: string;
  phone: string;
  email: string | null;
  address: string | null;
  occupation: string | null;
  isPrimary: boolean;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    admissionNumber: string;
    class: { name: string; displayName: string } | null;
  };
}

export default function ParentsPage() {
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewGuardian, setViewGuardian] = useState<Guardian | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchGuardians();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    const timeout = setTimeout(() => fetchGuardians(), 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const rowsPerPage = 10;
  const totalPages = Math.ceil(guardians.length / rowsPerPage);
  const displayedGuardians = guardians.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  const startIndex = (currentPage - 1) * rowsPerPage + 1;
  const endIndex = Math.min(currentPage * rowsPerPage, guardians.length);

  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const fetchGuardians = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const res = await fetch(`/api/guardians?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch guardians");
      setGuardians(data.guardians || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load guardians");
    } finally {
      setLoading(false);
    }
  };

  const uniqueParents = guardians.reduce((acc, g) => {
    const key = g.email || g.id;
    if (!acc.find((p) => (p.email || p.id) === key)) acc.push(g);
    return acc;
  }, [] as Guardian[]);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-gradient-to-r from-[var(--primary)]/20 to-[var(--accent)]/10 border-[var(--primary)]/20"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Parents & Guardians</h1>
            <p className="text-[#475569]">
              View all guardians and their linked students
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Guardians", value: guardians.length, icon: Users, color: "from-blue-500 to-blue-600" },
          { label: "Unique Parents", value: uniqueParents.length, icon: GraduationCap, color: "from-emerald-500 to-emerald-600" },
          { label: "Primary Contacts", value: guardians.filter((g) => g.isPrimary).length, icon: Phone, color: "from-purple-500 to-purple-600" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[#64748b] text-[13px] mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[#1a1a2e] font-semibold text-lg">All Guardians</h3>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
            <input
              type="text"
              placeholder="Search guardians..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl bg-[#ffffff] border border-[#e2e8f0] text-white text-sm focus:outline-none focus:border-[var(--primary)]"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#64748b] animate-spin" />
          </div>
        ) : guardians.length === 0 ? (
          <div className="text-center py-20 text-[#64748b]">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-[13px]">No guardians found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e2e8f0]">
                  <th className="text-left text-[#64748b] text-sm font-medium pb-3">Guardian</th>
                  <th className="text-left text-[#64748b] text-sm font-medium pb-3">Relationship</th>
                  <th className="text-left text-[#64748b] text-sm font-medium pb-3">Student</th>
                  <th className="text-left text-[#64748b] text-sm font-medium pb-3">Class</th>
                  <th className="text-left text-[#64748b] text-sm font-medium pb-3">Contact</th>
                  <th className="text-left text-[#64748b] text-sm font-medium pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedGuardians.map((g) => (
                  <tr key={g.id} className="border-b border-[#e2e8f0] hover:bg-[#f8fafc] transition-all">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--primary)]/30 to-[var(--accent)]/30 flex items-center justify-center text-white text-[13px] font-bold">
                          {g.firstName[0]}{g.lastName[0]}
                        </div>
                        <div>
                          <p className="text-[#1a1a2e] font-medium text-[13px]">{g.firstName} {g.lastName}</p>
                          {g.isPrimary && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-[var(--accent)]/20 text-[var(--accent)]">Primary</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-[#475569] text-[13px]">{g.relationship}</td>
                    <td className="py-3 text-[#475569] text-[13px]">{g.student.firstName} {g.student.lastName}</td>
                    <td className="py-3 text-[#475569] text-[13px]">{g.student.class?.displayName || g.student.class?.name || "—"}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2 text-[13px]">
                        {g.phone && (
                          <span className="flex items-center gap-1 text-[#64748b]">
                            <Phone className="w-3 h-3" /> {g.phone}
                          </span>
                        )}
                        {g.email && (
                          <span className="flex items-center gap-1 text-[#64748b]">
                            <Mail className="w-3 h-3" /> {g.email}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => setViewGuardian(g)}
                        className="p-1 rounded-lg hover:bg-[#f1f5f9] text-[#64748b]"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && guardians.length > 0 && totalPages > 0 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#e2e8f0]">
            <p className="text-[13px] text-[#64748b]">
              Showing {startIndex}-{endIndex} of {guardians.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-[13px] rounded-lg border border-[#e2e8f0] bg-white text-white hover:bg-[#f8fafc] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>
              {getPageNumbers().map((page, i) =>
                page === "..." ? (
                  <span key={`ellipsis-${i}`} className="px-2 py-1.5 text-[13px] text-[#64748b]">
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page as number)}
                    className={`w-8 h-8 text-[13px] rounded-lg border transition-all ${
                      currentPage === page
                        ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                        : "bg-white text-white border-[#e2e8f0] hover:bg-[#f8fafc]"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-[13px] rounded-lg border border-[#e2e8f0] bg-white text-white hover:bg-[#f8fafc] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {viewGuardian && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="modal-overlay">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setViewGuardian(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white text-lg font-bold">
                    {viewGuardian.firstName[0]}{viewGuardian.lastName[0]}
                  </div>
                  <h3 className="text-[#1a1a2e] font-semibold text-lg">Guardian Details</h3>
                </div>
                <button onClick={() => setViewGuardian(null)} className="btn btn-secondary"><X className="w-5 h-5" /></button>
              </div>
              <div className="border-t border-[#e2e8f0] mb-6"></div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                    <p className="text-[#64748b] text-[11px] mb-1">Full Name</p>
                    <p className="text-[#1a1a2e] font-semibold text-[15px]">{viewGuardian.firstName} {viewGuardian.lastName}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                    <p className="text-[#64748b] text-[11px] mb-1">Relationship</p>
                    <p className="text-[#1a1a2e] font-semibold text-[15px]">{viewGuardian.relationship}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                    <p className="text-[#64748b] text-[11px] mb-1">Phone</p>
                    <div className="flex items-center justify-between">
                      <p className="text-[#1a1a2e] font-semibold text-[15px]">{viewGuardian.phone}</p>
                      <a href={`tel:${viewGuardian.phone}`} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-[11px] font-medium hover:bg-blue-100 transition-all">
                        <Phone className="w-3 h-3" /> Call
                      </a>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                    <p className="text-[#64748b] text-[11px] mb-1">Email</p>
                    <div className="flex items-center justify-between">
                      <p className="text-[#1a1a2e] font-semibold text-[15px] truncate">{viewGuardian.email || "—"}</p>
                      {viewGuardian.email && (
                        <a href={`mailto:${viewGuardian.email}`} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-medium hover:bg-emerald-100 transition-all">
                          <Mail className="w-3 h-3" /> Email
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                    <p className="text-[#64748b] text-[11px] mb-1">Occupation</p>
                    <p className="text-[#1a1a2e] font-semibold text-[15px]">{viewGuardian.occupation || "—"}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Link className="w-3 h-3 text-[#64748b]" />
                      <p className="text-[#64748b] text-[11px]">Linked Student</p>
                    </div>
                    <p className="text-[#1a1a2e] font-semibold text-[15px]">{viewGuardian.student.firstName} {viewGuardian.student.lastName}</p>
                    <p className="text-[#64748b] text-[11px] mt-0.5">{viewGuardian.student.admissionNumber} &middot; {viewGuardian.student.class?.displayName || "—"}</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button onClick={() => setViewGuardian(null)} className="btn btn-secondary px-5 py-2.5 text-[13px] font-medium">Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
