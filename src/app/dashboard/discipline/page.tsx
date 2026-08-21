"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "@/lib/school-config";
import { Toaster, toast } from "sonner";

interface DisciplineRecord {
  id: string;
  studentId: string;
  type: string;
  title: string;
  details?: string;
  date: string;
  action?: string;
  reportedBy?: string;
  createdAt: string;
  student: { id: string; firstName: string; lastName: string; admissionNumber?: string; class?: { name: string } };
}

export default function DisciplinePage() {
  const { data: session } = useSession();
  const [records, setRecords] = useState<DisciplineRecord[]>([]);
  const [stats, setStats] = useState({ totalIncidents: 0, resolved: 0, pending: 0, byType: [], monthlyTrend: [] });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DisciplineRecord | null>(null);
  const [form, setForm] = useState({ studentId: "", type: "behavior", title: "", details: "", date: new Date().toISOString().split("T")[0], action: "pending" });
  const [students, setStudents] = useState<any[]>([]);
  const [filter, setFilter] = useState({ type: "", status: "", search: "" });

  useEffect(() => {
    fetchRecords();
    fetchStudents();
  }, []);

  const fetchRecords = async () => {
    try {
      const res = await fetch("/api/discipline");
      const data = await res.json();
      if (data.success) {
        setRecords(data.records);
        setStats({ totalIncidents: data.totalIncidents, resolved: data.resolved, pending: data.pending, byType: data.byType, monthlyTrend: data.monthlyTrend });
      }
    } catch {} finally { setLoading(false); }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch("/api/students?limit=200");
      const data = await res.json();
      if (data.students) setStudents(data.students);
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingRecord ? "/api/discipline" : "/api/discipline";
      const method = editingRecord ? "PUT" : "POST";
      const body = editingRecord ? { id: editingRecord.id, ...form } : form;
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) {
        toast.success(editingRecord ? "Record updated" : "Record created");
        setShowModal(false); setEditingRecord(null);
        setForm({ studentId: "", type: "behavior", title: "", details: "", date: new Date().toISOString().split("T")[0], action: "pending" });
        fetchRecords();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed");
      }
    } catch { toast.error("Failed to save record"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this record?")) return;
    try {
      const res = await fetch(`/api/discipline?id=${id}`, { method: "DELETE" });
      if (res.ok) { toast.success("Record deleted"); fetchRecords(); }
    } catch { toast.error("Failed to delete"); }
  };

  const filteredRecords = records.filter(r => {
    if (filter.type && r.type !== filter.type) return false;
    if (filter.status && r.action !== filter.status) return false;
    if (filter.search && !`${r.student.firstName} ${r.student.lastName}`.toLowerCase().includes(filter.search.toLowerCase()) && !r.title.toLowerCase().includes(filter.search.toLowerCase())) return false;
    return true;
  });

  const typeColors: Record<string, string> = { behavior: "bg-[#fef3c7] text-[#d97706]", academic: "bg-[#dbeafe] text-[#2563eb]", attendance: "bg-[#fee2e2] text-[#dc2626]", safety: "bg-[#f3e8ff] text-[#7c3aed]" };
  const actionColors: Record<string, string> = { pending: "bg-yellow-500/20 text-[#ca8a04]", warning: "bg-[#fef3c7] text-[#d97706]", suspension: "bg-[#fee2e2] text-[#dc2626]", expulsion: "bg-red-700/20 text-red-300", resolved: "bg-[#dcfce7] text-[#16a34a]" };

  return (
    <div className="space-y-6">
      <Toaster richColors position="top-right" />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a2e]">Discipline Management</h1>
          <p className="text-[#64748b] text-sm">Track and manage student discipline records</p>
        </div>
        <button onClick={() => { setShowModal(true); setEditingRecord(null); setForm({ studentId: "", type: "behavior", title: "", details: "", date: new Date().toISOString().split("T")[0], action: "pending" }); }} className="px-4 py-2 bg-gradient-to-r from-[#0039a6] to-[#0055ff] rounded-lg text-white font-medium hover:opacity-90 transition">+ New Record</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Incidents", value: stats.totalIncidents, color: "from-blue-500 to-blue-600" },
          { label: "Resolved", value: stats.resolved, color: "from-green-500 to-green-600" },
          { label: "Pending", value: stats.pending, color: "from-amber-500 to-amber-600" },
          { label: "Types Tracked", value: stats.byType.length, color: "from-purple-500 to-purple-600" },
        ].map((s, i) => (
          <div key={i} className={`bg-gradient-to-br ${s.color} rounded-xl p-4`}>
            <p className="text-[#475569] text-sm">{s.label}</p>
            <p className="text-2xl font-bold text-[#1a1a2e] mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
        <div className="flex flex-wrap gap-3">
          <input type="text" placeholder="Search student or title..." value={filter.search} onChange={e => setFilter({ ...filter, search: e.target.value })} className="input-glass flex-1 min-w-[200px]" />
          <select value={filter.type} onChange={e => setFilter({ ...filter, type: e.target.value })} className="input-glass" style={{ colorScheme: "light" }}>
            <option value="">All Types</option>
            <option value="behavior">Behavior</option>
            <option value="academic">Academic</option>
            <option value="attendance">Attendance</option>
            <option value="safety">Safety</option>
          </select>
          <select value={filter.status} onChange={e => setFilter({ ...filter, status: e.target.value })} className="input-glass" style={{ colorScheme: "light" }}>
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="warning">Warning</option>
            <option value="suspension">Suspension</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-[#e2e8f0]">
                <th className="text-left py-3 px-4 text-[#64748b] font-semibold text-[12px] uppercase tracking-wider">Student</th>
                <th className="text-left py-3 px-4 text-[#64748b] font-semibold text-[12px] uppercase tracking-wider">Type</th>
                <th className="text-left py-3 px-4 text-[#64748b] font-semibold text-[12px] uppercase tracking-wider">Title</th>
                <th className="text-left py-3 px-4 text-[#64748b] font-semibold text-[12px] uppercase tracking-wider">Date</th>
                <th className="text-left py-3 px-4 text-[#64748b] font-semibold text-[12px] uppercase tracking-wider">Action</th>
                <th className="text-right py-3 px-4 text-[#64748b] font-semibold text-[12px] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((r, idx) => (
                <tr key={r.id} className={`border-b border-[#e2e8f0] hover:bg-[#f1f5f9] transition-colors ${idx % 2 === 1 ? "bg-[#f8fafc]" : ""}`}>
                  <td className="py-3 px-4 text-[#1a1a2e]">{r.student.firstName} {r.student.lastName}</td>
                  <td className="py-3 px-4"><span className={`px-2 py-1 rounded-full text-xs ${typeColors[r.type] || "bg-gray-500/20 text-gray-400"}`}>{r.type}</span></td>
                  <td className="py-3 px-4 text-[#475569]">{r.title}</td>
                  <td className="py-3 px-4 text-[#64748b]">{new Date(r.date).toLocaleDateString()}</td>
                  <td className="py-3 px-4"><span className={`px-2 py-1 rounded-full text-xs ${actionColors[r.action || "pending"] || "bg-gray-500/20 text-gray-400"}`}>{r.action || "pending"}</span></td>
                  <td className="py-3 px-4 text-right">
                    <button onClick={() => { setEditingRecord(r); setForm({ studentId: r.studentId, type: r.type, title: r.title, details: r.details || "", date: new Date(r.date).toISOString().split("T")[0], action: r.action || "pending" }); setShowModal(true); }} className="text-[#2563eb] hover:text-blue-300 mr-3">Edit</button>
                    <button onClick={() => handleDelete(r.id)} className="text-[#dc2626] hover:text-red-300">Delete</button>
                  </td>
                </tr>
              ))}
              {filteredRecords.length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center text-[#94a3b8]">{loading ? "Loading..." : "No discipline records found"}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()} className="modal-content">
              <h2 className="text-xl font-bold text-[#1a1a2e] mb-4">{editingRecord ? "Edit Record" : "New Discipline Record"}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[#64748b] text-sm mb-1">Student</label>
                  <select required value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })} className="input-glass w-full" style={{ colorScheme: "light" }}>
                    <option value="">Select student</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.admissionNumber})</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#64748b] text-sm mb-1">Type</label>
                    <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="input-glass w-full" style={{ colorScheme: "light" }}>
                      <option value="behavior">Behavior</option>
                      <option value="academic">Academic</option>
                      <option value="attendance">Attendance</option>
                      <option value="safety">Safety</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#64748b] text-sm mb-1">Action</label>
                    <select value={form.action} onChange={e => setForm({ ...form, action: e.target.value })} className="input-glass w-full" style={{ colorScheme: "light" }}>
                      <option value="pending">Pending</option>
                      <option value="warning">Warning</option>
                      <option value="suspension">Suspension</option>
                      <option value="expulsion">Expulsion</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[#64748b] text-sm mb-1">Title</label>
                  <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-glass w-full" placeholder="Brief title" />
                </div>
                <div>
                  <label className="block text-[#64748b] text-sm mb-1">Details</label>
                  <textarea value={form.details} onChange={e => setForm({ ...form, details: e.target.value })} className="input-glass w-full" rows={3} placeholder="Detailed description..." />
                </div>
                <div>
                  <label className="block text-[#64748b] text-sm mb-1">Date</label>
                  <input type="date" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="input-glass w-full" style={{ colorScheme: "light" }} />
                </div>
                <div className="modal-footer">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 border border-[#e2e8f0] rounded-lg text-[#475569] hover:bg-[#f8fafc]">Cancel</button>
                  <button type="submit" className="flex-1 py-2 bg-gradient-to-r from-[#0039a6] to-[#0055ff] rounded-lg text-white font-medium">{editingRecord ? "Update" : "Create"}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
