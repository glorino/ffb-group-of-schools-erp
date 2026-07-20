"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  Users,
  Plus,
  Search,
  Filter,
  Activity,
  Pill,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Thermometer,
  Stethoscope,
  Loader2,
  Download,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { downloadCSV } from "@/lib/exports";

interface ClinicVisit {
  id: string;
  date: string;
  reason: string;
  diagnosis: string;
  treatment: string;
  medication: string;
  student: { firstName: string; lastName: string };
}

interface ClinicStats {
  totalVisits: number;
  recentVisits: number;
}

export default function ClinicPage() {
  const [visits, setVisits] = useState<ClinicVisit[]>([]);
  const [stats, setStats] = useState<ClinicStats>({ totalVisits: 0, recentVisits: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ studentId: "", reason: "", diagnosis: "", treatment: "", medication: "" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/clinic");
      const data = await res.json();
      setVisits(data.visits || []);
      setStats(data.stats || { totalVisits: 0, recentVisits: 0 });
    } catch {
      toast.error("Failed to load clinic data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.studentId || !form.reason) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/clinic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: form.studentId,
          reason: form.reason,
          diagnosis: form.diagnosis,
          treatment: form.treatment,
          medication: form.medication,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Visit recorded successfully");
      setShowModal(false);
      setForm({ studentId: "", reason: "", diagnosis: "", treatment: "", medication: "" });
      fetchData();
    } catch {
      toast.error("Failed to record visit");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredVisits = visits.filter((v) => {
    const name = `${v.student.firstName} ${v.student.lastName}`.toLowerCase();
    return (
      name.includes(search.toLowerCase()) ||
      v.reason.toLowerCase().includes(search.toLowerCase()) ||
      v.diagnosis.toLowerCase().includes(search.toLowerCase())
    );
  });

  const statCards = [
    { label: "Total Visits", value: stats.totalVisits, icon: Users, color: "from-blue-500 to-blue-600" },
    { label: "Recent Visits", value: stats.recentVisits, icon: Clock, color: "from-emerald-500 to-emerald-600" },
    { label: "Medications", value: "85", icon: Pill, color: "from-purple-500 to-purple-600" },
    { label: "Alerts", value: "3", icon: AlertTriangle, color: "from-orange-500 to-orange-600" },
  ];

  const handleExport = () => {
    const data = visits.map((v) => ({
      Student: `${v.student.firstName} ${v.student.lastName}`,
      Date: new Date(v.date).toLocaleDateString(),
      Reason: v.reason,
      Diagnosis: v.diagnosis,
      Treatment: v.treatment,
      Medication: v.medication,
    }));
    downloadCSV(data, "clinic_visits");
    toast.success("CSV downloaded");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-gradient-to-r from-[var(--primary)]/20 to-[var(--accent)]/10 border-[var(--primary)]/20"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Clinic / Medical Records</h1>
            <p className="text-white/60 text-[13px]">
              Manage student visits, medications, allergies, and health records
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.12] text-white text-[13px] font-medium hover:bg-white/[0.1] transition-all duration-200"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--primary)] text-white text-[13px] font-semibold hover:brightness-110 transition-all duration-200 shadow-lg shadow-[var(--primary)]/25"
            >
              <Plus className="w-4 h-4" />
              New Visit
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/50 text-[12px] mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 card"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-semibold text-lg">Recent Visits</h3>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
              <button className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/60 hover:bg-white/[0.08]">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="space-y-3">
            {filteredVisits.map((visit) => (
              <div key={visit.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] transition-all">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-500/20 text-emerald-400">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-white text-[13px] font-medium">{visit.student.firstName} {visit.student.lastName}</p>
                  <p className="text-white/40 text-[12px]">{visit.reason} • {visit.diagnosis}</p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-1 rounded-lg text-[12px] font-medium bg-emerald-500/20 text-emerald-400">
                    treated
                  </span>
                  <p className="text-white/30 text-[12px] mt-1">{new Date(visit.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
            {filteredVisits.length === 0 && (
              <div className="text-center py-8 text-white/40 text-[13px]">No visits found</div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-6"
        >
          <div className="card">
            <h3 className="text-white font-semibold text-lg mb-4">Medications Stock</h3>
            <div className="space-y-3">
              {[
                { name: "Paracetamol", stock: 500, used: 120, category: "Analgesic" },
                { name: "Amalar", stock: 200, used: 85, category: "Antimalarial" },
                { name: "Amoxicillin", stock: 150, used: 45, category: "Antibiotic" },
                { name: "ORS", stock: 300, used: 90, category: "Rehydration" },
              ].map((med, i) => (
                <div key={i} className="p-3 rounded-xl bg-white/[0.04]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white text-[13px] font-medium">{med.name}</span>
                    <span className="text-white/40 text-[12px]">{med.category}</span>
                  </div>
                  <div className="flex items-center justify-between text-[12px] mb-1">
                    <span className="text-white/40">Stock: {med.stock}</span>
                    <span className="text-white/40">Used: {med.used}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        (med.stock - med.used) / med.stock < 0.2 ? "bg-red-500" : "bg-[var(--accent)]"
                      }`}
                      style={{ width: `${((med.stock - med.used) / med.stock) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="text-white font-semibold text-lg mb-4">Health Alerts</h3>
            <div className="space-y-2">
              {[
                { alert: "Low stock: Amalar", severity: "high" },
                { alert: "Allergy alert: Chidinma O.", severity: "medium" },
                { alert: "Vaccination due: JSS1", severity: "low" },
              ].map((alert, i) => (
                <div key={i} className={`p-3 rounded-xl ${
                  alert.severity === "high" ? "bg-red-500/10 border border-red-500/20" :
                  alert.severity === "medium" ? "bg-orange-500/10 border border-orange-500/20" :
                  "bg-white/[0.04]"
                }`}>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`w-4 h-4 ${
                      alert.severity === "high" ? "text-red-400" :
                      alert.severity === "medium" ? "text-orange-400" : "text-white/40"
                    }`} />
                    <span className="text-white text-[13px]">{alert.alert}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl bg-[#0f1b33] border border-white/[0.08] p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-lg font-semibold">New Clinic Visit</h2>
              <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white/60 text-[13px] mb-1">Student ID</label>
                <input
                  type="text"
                  value={form.studentId}
                  onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                  placeholder="e.g. STU-001"
                />
              </div>
              <div>
                <label className="block text-white/60 text-[13px] mb-1">Reason for Visit</label>
                <input
                  type="text"
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                  placeholder="e.g. Headache"
                />
              </div>
              <div>
                <label className="block text-white/60 text-[13px] mb-1">Diagnosis</label>
                <input
                  type="text"
                  value={form.diagnosis}
                  onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                  placeholder="e.g. Malaria"
                />
              </div>
              <div>
                <label className="block text-white/60 text-[13px] mb-1">Treatment</label>
                <input
                  type="text"
                  value={form.treatment}
                  onChange={(e) => setForm({ ...form, treatment: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                  placeholder="e.g. Medication prescribed"
                />
              </div>
              <div>
                <label className="block text-white/60 text-[13px] mb-1">Medication</label>
                <input
                  type="text"
                  value={form.medication}
                  onChange={(e) => setForm({ ...form, medication: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                  placeholder="e.g. Paracetamol"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/60 text-[13px] font-medium hover:bg-white/[0.08] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-5 py-2.5 rounded-xl bg-[var(--primary)] text-white text-[13px] font-semibold hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-[var(--primary)]/25"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin inline" /> : "Record Visit"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
