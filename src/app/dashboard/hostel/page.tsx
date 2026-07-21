"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Building,
  Users,
  Bed,
  Plus,
  Search,
  QrCode,
  CheckCircle,
  AlertCircle,
  Wifi,
  Thermometer,
  Eye,
  Edit,
  Loader2,
  Download,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { downloadCSV } from "@/lib/exports";

interface HostelRoom {
  id: string;
  number: string;
  capacity: number;
  beds: { id: string; number: string; status: string }[];
  status: string;
}

interface Hostel {
  id: string;
  name: string;
  type: string;
  capacity: number;
  rooms: HostelRoom[];
}

interface HostelStats {
  totalHostels: number;
  totalRooms: number;
  totalBeds: number;
  occupiedBeds: number;
  allocations: number;
}

export default function HostelPage() {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [stats, setStats] = useState<HostelStats>({ totalHostels: 0, totalRooms: 0, totalBeds: 0, occupiedBeds: 0, allocations: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", type: "Boys", capacity: "" });
  const [viewBlock, setViewBlock] = useState<Hostel | null>(null);
  const [editBlock, setEditBlock] = useState<Hostel | null>(null);
  const [editForm, setEditForm] = useState({ name: "", type: "Boys", capacity: "" });
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [qrAdmission, setQrAdmission] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/hostel");
      const data = await res.json();
      setHostels(data.hostels || []);
      setStats(data.stats || { totalHostels: 0, totalRooms: 0, totalBeds: 0, occupiedBeds: 0, allocations: 0 });
    } catch {
      toast.error("Failed to load hostel data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.capacity) {
      toast.error("Please fill in all fields");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/hostel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, type: form.type, capacity: parseInt(form.capacity) }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Hostel block created");
      setShowModal(false);
      setForm({ name: "", type: "Boys", capacity: "" });
      fetchData();
    } catch {
      toast.error("Failed to create hostel block");
    } finally {
      setSubmitting(false);
    }
  };

  const allRooms = hostels.flatMap((h) =>
    h.rooms.map((r) => ({ ...r, blockName: h.name }))
  );

  const filteredBlocks = hostels.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.type.toLowerCase().includes(search.toLowerCase())
  );

  const statCards = [
    { label: "Total Beds", value: stats.totalBeds, icon: Bed, color: "from-blue-500 to-blue-600" },
    { label: "Occupied", value: stats.occupiedBeds, icon: Users, color: "from-emerald-500 to-emerald-600" },
    { label: "Available", value: stats.totalBeds - stats.occupiedBeds, icon: CheckCircle, color: "from-purple-500 to-purple-600" },
    { label: "Occupancy Rate", value: stats.totalBeds ? `${Math.round((stats.occupiedBeds / stats.totalBeds) * 100)}%` : "0%", icon: Building, color: "from-[var(--accent)] to-emerald-400" },
  ];

  const handleExport = () => {
    const data = hostels.flatMap((h) =>
      h.rooms.map((r) => ({
        Block: h.name,
        Type: h.type,
        "Room Number": r.number,
        Capacity: r.capacity,
        Beds: r.beds.length,
        Status: r.status,
      }))
    );
    downloadCSV(data, "hostel_data");
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
            <h1 className="text-2xl font-bold text-white mb-1">Hostel Management</h1>
            <p className="text-white/60 text-[13px]">
              Manage blocks, rooms, beds, allocation, and QR attendance
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
              onClick={() => setShowQRScanner(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.12] text-white text-[13px] font-medium hover:bg-white/[0.1] transition-all duration-200"
            >
              <QrCode className="w-4 h-4" />
              QR Attendance
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--primary)] text-white text-[13px] font-semibold hover:brightness-110 transition-all duration-200 shadow-lg shadow-[var(--primary)]/25"
            >
              <Plus className="w-4 h-4" />
              Add Block
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
            <h3 className="text-white font-semibold text-lg">Hostel Blocks</h3>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Search blocks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {filteredBlocks.map((block) => {
              const occupied = block.rooms.reduce((acc, r) => acc + r.beds.length, 0);
              const totalRoomBeds = block.rooms.reduce((acc, r) => acc + r.capacity, 0);
              return (
                <div key={block.id} className="p-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-white font-medium text-[13px]">{block.name}</h4>
                      <p className="text-white/40 text-[12px]">{block.type} • {block.rooms.length} rooms</p>
                    </div>
                    <span className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-[12px]">active</span>
                  </div>
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-[13px] mb-1">
                      <span className="text-white/60">Occupancy</span>
                      <span className="text-white/40">{occupied}/{totalRoomBeds || block.capacity}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className="bg-[var(--accent)] h-2 rounded-full"
                        style={{ width: `${totalRoomBeds ? (occupied / totalRoomBeds) * 100 : block.capacity ? (occupied / block.capacity) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewBlock(block)}
                      className="flex-1 py-1.5 rounded-lg bg-white/[0.04] text-white/60 text-[12px] hover:bg-white/[0.08] transition-all"
                    >
                      <Eye className="w-3 h-3 inline mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => {
                        setEditBlock(block);
                        setEditForm({ name: block.name, type: block.type, capacity: String(block.capacity) });
                      }}
                      className="flex-1 py-1.5 rounded-lg bg-white/[0.04] text-white/60 text-[12px] hover:bg-white/[0.08] transition-all"
                    >
                      <Edit className="w-3 h-3 inline mr-1" />
                      Edit
                    </button>
                  </div>
                </div>
              );
            })}
            {filteredBlocks.length === 0 && (
              <div className="col-span-2 text-center py-8 text-white/40 text-[13px]">No hostel blocks found</div>
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
            <h3 className="text-white font-semibold text-lg mb-4">Room Status</h3>
            <div className="space-y-3">
              {allRooms.slice(0, 6).map((room) => (
                <div key={room.id} className="p-3 rounded-xl bg-white/[0.04]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white text-[13px] font-medium">{room.blockName} - Room {room.number}</span>
                    <span className={`px-2 py-1 rounded-lg text-[12px] font-medium ${
                      room.status === "full" ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"
                    }`}>
                      {room.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-white/40">{room.beds.length}/{room.capacity} beds</span>
                    <span className="text-white/30">{room.capacity - room.beds.length} available</span>
                  </div>
                </div>
              ))}
              {allRooms.length === 0 && (
                <p className="text-center py-4 text-white/40 text-[13px]">No rooms yet</p>
              )}
            </div>
          </div>

          <div className="card">
            <h3 className="text-white font-semibold text-lg mb-4">Facilities</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Wifi, label: "WiFi", status: "Active" },
                { icon: Thermometer, label: "AC", status: "Active" },
                { icon: AlertCircle, label: "Security", status: "Active" },
                { icon: Building, label: "Water", status: "Active" },
              ].map((facility, i) => (
                <div key={i} className="p-3 rounded-xl bg-white/[0.04] flex items-center gap-2">
                  <facility.icon className="w-4 h-4 text-[var(--accent)]" />
                  <div>
                    <p className="text-white text-[13px] font-medium">{facility.label}</p>
                    <p className="text-white/40 text-[12px]">{facility.status}</p>
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
            className="w-full max-w-xl rounded-2xl bg-[#0f1b33] border border-white/[0.08] p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-lg font-semibold">Add Hostel Block</h2>
              <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white/60 text-[13px] mb-1">Block Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                  placeholder="e.g. Block E"
                />
              </div>
              <div>
                <label className="block text-white/60 text-[13px] mb-1">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  style={{ colorScheme: "dark" }}
                  className="w-full px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                >
                  <option style={{ background: "#0f1b33", color: "#fff" }}>Boys</option>
                  <option style={{ background: "#0f1b33", color: "#fff" }}>Girls</option>
                  <option style={{ background: "#0f1b33", color: "#fff" }}>Staff</option>
                </select>
              </div>
              <div>
                <label className="block text-white/60 text-[13px] mb-1">Capacity</label>
                <input
                  type="number"
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                  placeholder="e.g. 80"
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
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin inline" /> : "Create Block"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {viewBlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg rounded-2xl bg-[#0f1b33] border border-white/[0.08] p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-lg font-semibold">{viewBlock.name} — Rooms</h2>
              <button onClick={() => setViewBlock(null)} className="text-white/40 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {viewBlock.rooms.length === 0 && (
                <p className="text-white/40 text-[13px] text-center py-4">No rooms in this block</p>
              )}
              {viewBlock.rooms.map((room) => (
                <div key={room.id} className="p-3 rounded-xl bg-white/[0.04]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white text-[13px] font-medium">Room {room.number}</span>
                    <span className={`px-2 py-1 rounded-lg text-[12px] font-medium ${
                      room.status === "full" ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"
                    }`}>
                      {room.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-white/40">Beds: {room.beds.length}/{room.capacity}</span>
                    <span className="text-white/30">{room.capacity - room.beds.length} available</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {editBlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xl rounded-2xl bg-[#0f1b33] border border-white/[0.08] p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-lg font-semibold">Edit {editBlock.name}</h2>
              <button onClick={() => setEditBlock(null)} className="text-white/40 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-white/60 text-[13px] mb-1">Block Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
              <div>
                <label className="block text-white/60 text-[13px] mb-1">Type</label>
                <select
                  value={editForm.type}
                  onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                  style={{ colorScheme: "dark" }}
                  className="w-full px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                >
                  <option style={{ background: "#0f1b33", color: "#fff" }}>Boys</option>
                  <option style={{ background: "#0f1b33", color: "#fff" }}>Girls</option>
                  <option style={{ background: "#0f1b33", color: "#fff" }}>Staff</option>
                </select>
              </div>
              <div>
                <label className="block text-white/60 text-[13px] mb-1">Capacity</label>
                <input
                  type="number"
                  value={editForm.capacity}
                  onChange={(e) => setEditForm({ ...editForm, capacity: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setEditBlock(null)}
                  className="flex-1 px-5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/60 text-[13px] font-medium hover:bg-white/[0.08] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!editBlock) return;
                    try {
                      const res = await fetch("/api/hostel", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: editBlock.id, ...editForm, capacity: Number(editForm.capacity) }),
                      });
                      if (!res.ok) throw new Error("Failed");
                      toast.success("Hostel updated");
                      setEditBlock(null);
                      fetchData();
                    } catch { toast.error("Failed to update"); }
                  }}
                  className="flex-1 px-5 py-2.5 rounded-xl bg-[var(--primary)] text-white text-[13px] font-semibold hover:brightness-110 transition-all duration-200 shadow-lg shadow-[var(--primary)]/25"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {showQRScanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowQRScanner(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-[#0f1b33] border border-white/[0.08] p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-lg font-semibold">QR Attendance</h2>
              <button onClick={() => setShowQRScanner(false)} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-white/60 text-[13px] mb-4">Scan or type the student admission number to check in to the hostel.</p>
            <input
              type="text"
              autoFocus
              value={qrAdmission}
              onChange={(e) => setQrAdmission(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && qrAdmission.trim()) {
                  toast.success(`Student ${qrAdmission} checked into hostel`);
                  setQrAdmission("");
                  setShowQRScanner(false);
                }
              }}
              placeholder="Scan or type admission number..."
              className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
            />
            <p className="text-white/30 text-[12px] mt-2">Press Enter to submit</p>
          </motion.div>
        </div>
      )}
    </div>
  );
}
