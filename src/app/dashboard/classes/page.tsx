"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Users,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Building,
  UserCheck,
  X,
  Loader2,
  Eye,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";

interface ClassItem {
  id: string;
  name: string;
  displayName: string;
  section: string | null;
  capacity: number;
  _count: { students: number };
  classTeacher: { firstName: string; lastName: string } | null;
}

interface ClassesResponse {
  classes: ClassItem[];
  total: number;
}

export default function ClassesPage() {
  const [data, setData] = useState<ClassesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState({
    name: "",
    displayName: "",
    level: "primary",
    capacity: "40",
  });

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);

    fetch(`/api/classes?${params}`)
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const totalStudents = data?.classes?.reduce((sum, c) => sum + c._count.students, 0) ?? 0;
  const avgClassSize = data?.classes?.length ? Math.round(totalStudents / data.classes.length) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Class name is required");
      return;
    }
    setSubmitting(true);
    try {
      const levelMap: Record<string, number> = { nursery: 1, primary: 2, junior: 3, secondary: 4 };
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          displayName: form.displayName || form.name,
          level: levelMap[form.level] || 2,
          capacity: parseInt(form.capacity) || 40,
        }),
      });
      const cls = await res.json();
      if (!res.ok) throw new Error(cls.error || "Failed to create class");
      toast.success("Class created successfully");
      setShowModal(false);
      setForm({ name: "", displayName: "", level: "primary", capacity: "40" });
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      fetch(`/api/classes?${params}`)
        .then((res) => res.json())
        .then((d) => setData(d))
        .catch(console.error)
        .finally(() => setLoading(false));
    } catch (err: any) {
      toast.error(err.message || "Failed to create class");
    } finally {
      setSubmitting(false);
    }
  };

  const kpis = [
    { label: "Total Classes", value: String(data?.total ?? 0), icon: Building, color: "from-blue-500 to-blue-600" },
    { label: "Total Students", value: String(totalStudents), icon: Users, color: "from-emerald-500 to-emerald-600" },
    { label: "Avg. Class Size", value: String(avgClassSize), icon: GraduationCap, color: "from-purple-500 to-purple-600" },
    { label: "Capacity Used", value: data?.classes?.length ? `${Math.round((totalStudents / (data.classes.reduce((s, c) => s + c.capacity, 0) || 1)) * 100)}%` : "0%", icon: UserCheck, color: "from-[var(--accent)] to-emerald-400" },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-gradient-to-r from-[var(--primary)]/20 to-[var(--accent)]/10 border-[var(--primary)]/20"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Class Management</h1>
            <p className="text-white/60">
              Manage classes, streams, arms, and teacher assignments across all levels
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--primary)] text-white text-sm font-semibold hover:brightness-110 transition-all duration-200 shadow-lg shadow-[var(--primary)]/25"
          >
            <Plus className="w-4 h-4" />
            Add Class
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/50 text-sm mb-1">{kpi.label}</p>
                <p className="text-3xl font-bold text-white">{kpi.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center`}>
                <kpi.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-3 card"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-semibold text-lg">All Classes</h3>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Search classes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-white/50 text-sm font-medium pb-3">Class</th>
                  <th className="text-left text-white/50 text-sm font-medium pb-3">Section</th>
                  <th className="text-left text-white/50 text-sm font-medium pb-3">Teacher</th>
                  <th className="text-left text-white/50 text-sm font-medium pb-3">Students</th>
                  <th className="text-left text-white/50 text-sm font-medium pb-3">Capacity</th>
                  <th className="text-left text-white/50 text-sm font-medium pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td colSpan={6} className="py-3"><div className="skeleton h-4 w-full" /></td>
                    </tr>
                  ))
                ) : data?.classes?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-white/40">
                      No classes found
                    </td>
                  </tr>
                ) : (
                  data?.classes?.map((cls) => {
                    const usagePercent = Math.round((cls._count.students / cls.capacity) * 100);
                    return (
                      <tr key={cls.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                        <td className="py-3 text-white font-medium">{cls.displayName}</td>
                        <td className="py-3 text-white/70">{cls.section || "—"}</td>
                        <td className="py-3 text-white/70 text-sm">
                          {cls.classTeacher ? `${cls.classTeacher.firstName} ${cls.classTeacher.lastName}` : "Unassigned"}
                        </td>
                        <td className="py-3 text-white/70">{cls._count.students}/{cls.capacity}</td>
                        <td className="py-3">
                          <div className="w-full bg-white/10 rounded-full h-2 max-w-[80px]">
                            <div
                              className={`h-2 rounded-full ${
                                usagePercent >= 90 ? "bg-red-500" : usagePercent >= 70 ? "bg-yellow-500" : "bg-[var(--accent)]"
                              }`}
                              style={{ width: `${Math.min(usagePercent, 100)}%` }}
                            />
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="relative" ref={dropdownOpen === cls.id ? dropdownRef : undefined}>
                            <button
                              onClick={() => setDropdownOpen(dropdownOpen === cls.id ? null : cls.id)}
                              className="p-1 rounded-lg hover:bg-white/10 text-white/40"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            <AnimatePresence>
                              {dropdownOpen === cls.id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                  className="absolute right-0 top-full mt-1 w-36 bg-[#0a0f1e] border border-white/[0.08] rounded-xl shadow-xl z-20 overflow-hidden"
                                >
                                  <button
                                    onClick={() => {
                                      setDropdownOpen(null);
                                      toast.info(`Viewing class: ${cls.displayName}`);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-white/70 hover:bg-white/[0.06] transition"
                                  >
                                    <Eye className="w-3.5 h-3.5" /> View
                                  </button>
                                  <button
                                    onClick={() => {
                                      setDropdownOpen(null);
                                      toast.info(`Editing class: ${cls.displayName}`);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-white/70 hover:bg-white/[0.06] transition"
                                  >
                                    <Pencil className="w-3.5 h-3.5" /> Edit
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <h3 className="text-white font-semibold text-lg mb-4">Capacity Overview</h3>
          <div className="space-y-3">
            {data?.classes?.slice(0, 6).map((cls) => {
              const pct = Math.round((cls._count.students / cls.capacity) * 100);
              return (
                <div key={cls.id} className="p-3 rounded-xl bg-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white text-sm font-medium">{cls.displayName}</span>
                    <span className="text-white/40 text-sm">{pct}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-yellow-500" : "bg-[var(--accent)]"
                      }`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#0a0f1e] border border-white/[0.08] rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold text-lg">Add Class</h3>
                <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-white/10 text-white/40">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-white/60 text-[13px] mb-1.5">Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                    placeholder="e.g. JSS1"
                  />
                </div>
                <div>
                  <label className="block text-white/60 text-[13px] mb-1.5">Display Name</label>
                  <input
                    type="text"
                    value={form.displayName}
                    onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                    placeholder="e.g. Junior Secondary 1A"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/60 text-[13px] mb-1.5">Level</label>
                    <select
                      value={form.level}
                      onChange={(e) => setForm({ ...form, level: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                      style={{ colorScheme: "dark" }}
                    >
                      <option style={{ background: "#0f1b33", color: "#fff" }} value="nursery">Nursery</option>
                      <option style={{ background: "#0f1b33", color: "#fff" }} value="primary">Primary</option>
                      <option style={{ background: "#0f1b33", color: "#fff" }} value="junior">Junior</option>
                      <option style={{ background: "#0f1b33", color: "#fff" }} value="secondary">Secondary</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-white/60 text-[13px] mb-1.5">Capacity</label>
                    <input
                      type="number"
                      min="1"
                      value={form.capacity}
                      onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/60 text-[13px] font-medium hover:bg-white/[0.08] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-xl bg-[var(--primary)] text-white text-[13px] font-semibold hover:brightness-110 transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-[var(--primary)]/25"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    Create Class
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
