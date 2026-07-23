"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Bus,
  MapPin,
  Users,
  Plus,
  Search,
  Navigation,
  Fuel,
  Wrench,
  CheckCircle,
  AlertCircle,
  Clock,
  Eye,
  Edit,
  Loader2,
  Download,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { downloadCSV } from "@/lib/exports";

interface Vehicle {
  id: string;
  name: string;
  plateNumber: string;
  capacity: number;
  driverName: string;
  driverPhone: string;
  type: string;
  status: string;
  routes: { id: string; name: string }[];
}

interface Route {
  id: string;
  name: string;
  stops: number;
  students: number;
  time: string;
  status: string;
}

interface TransportStats {
  total: number;
  active: number;
  routes: number;
}

export default function TransportPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [stats, setStats] = useState<TransportStats>({ total: 0, active: 0, routes: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", plateNumber: "", type: "Bus", capacity: "", driverName: "", driverPhone: "" });
  const [showGPS, setShowGPS] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/transport");
      const data = await res.json();
      setVehicles(data.vehicles || []);
      setRoutes(data.routes || []);
      setStats(data.stats || { total: 0, active: 0, routes: 0 });
    } catch {
      toast.error("Failed to load transport data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.plateNumber || !form.capacity || !form.driverName) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/transport", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          plateNumber: form.plateNumber,
          type: form.type,
          capacity: parseInt(form.capacity),
          driverName: form.driverName,
          driverPhone: form.driverPhone,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Vehicle added successfully");
      setShowModal(false);
      setForm({ name: "", plateNumber: "", type: "Bus", capacity: "", driverName: "", driverPhone: "" });
      fetchData();
    } catch {
      toast.error("Failed to add vehicle");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredVehicles = vehicles.filter((v) =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.plateNumber.toLowerCase().includes(search.toLowerCase()) ||
    v.driverName.toLowerCase().includes(search.toLowerCase())
  );

  const statCards = [
    { label: "Total Vehicles", value: stats.total, icon: Bus, color: "from-blue-500 to-blue-600" },
    { label: "Active Routes", value: stats.routes, icon: MapPin, color: "from-emerald-500 to-emerald-600" },
    { label: "Active Vehicles", value: stats.active, icon: Users, color: "from-purple-500 to-purple-600" },
    { label: "On-Time Rate", value: "94%", icon: Clock, color: "from-[var(--accent)] to-emerald-400" },
  ];

  const handleExport = () => {
    const data = vehicles.map((v) => ({
      Name: v.name,
      "Plate Number": v.plateNumber,
      Type: v.type,
      Capacity: v.capacity,
      Driver: v.driverName,
      Phone: v.driverPhone,
      Status: v.status,
    }));
    downloadCSV(data, "transport_vehicles");
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
            <h1 className="text-2xl font-bold text-white mb-1">Transport Management</h1>
            <p className="text-white/60 text-[13px]">
              Manage vehicles, routes, drivers, and GPS tracking
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
              onClick={() => setShowGPS(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.12] text-white text-[13px] font-medium hover:bg-white/[0.1] transition-all duration-200"
            >
              <Navigation className="w-4 h-4" />
              GPS Tracking
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--primary)] text-white text-[13px] font-semibold hover:brightness-110 transition-all duration-200 shadow-lg shadow-[var(--primary)]/25"
            >
              <Plus className="w-4 h-4" />
              Add Vehicle
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
            <h3 className="text-white font-semibold text-lg">Vehicle Fleet</h3>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Search vehicles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
          </div>
          <div className="space-y-3">
            {filteredVehicles.map((vehicle) => (
              <div key={vehicle.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] transition-all">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  vehicle.status === "active" ? "bg-emerald-500/20 text-emerald-400" : "bg-orange-500/20 text-orange-400"
                }`}>
                  <Bus className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-white text-[13px] font-medium">{vehicle.name}</p>
                    <span className="text-white/30 text-[12px]">{vehicle.plateNumber}</span>
                  </div>
                  <p className="text-white/40 text-[12px]">{vehicle.driverName} • {vehicle.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-white text-[13px] font-medium">{vehicle.capacity} seats</p>
                  <span className={`px-2 py-1 rounded-lg text-[12px] font-medium ${
                    vehicle.status === "active" ? "bg-emerald-500/20 text-emerald-400" : "bg-orange-500/20 text-orange-400"
                  }`}>
                    {vehicle.status}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button className="p-2 rounded-lg hover:bg-white/[0.08] text-white/40">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-white/[0.08] text-white/40">
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {filteredVehicles.length === 0 && (
              <div className="text-center py-8 text-white/40 text-[13px]">No vehicles found</div>
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
            <h3 className="text-white font-semibold text-lg mb-4">Routes</h3>
            <div className="space-y-3">
              {routes.map((route) => (
                <div key={route.id} className="p-3 rounded-xl bg-white/[0.04]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white text-[13px] font-medium">{route.name}</span>
                    <span className="text-[var(--accent)] text-[12px]">{route.students} students</span>
                  </div>
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-white/40">{route.stops} stops • {route.time}</span>
                    <span className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400">{route.status}</span>
                  </div>
                </div>
              ))}
              {routes.length === 0 && (
                <p className="text-center py-4 text-white/40 text-[13px]">No routes yet</p>
              )}
            </div>
          </div>

          <div className="card">
            <h3 className="text-white font-semibold text-lg mb-4">GPS Live Map</h3>
            <div className="aspect-video rounded-xl overflow-hidden border border-white/[0.08]">
              <iframe
                src="https://www.google.com/maps/embed/v1/place?key=AIzaSyBCJsRJI5wjJ9l64a1RQNPsUG_WpXtYQQo&q=Lagos,Nigeria&zoom=12"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: "200px" }}
                allowFullScreen
                loading="lazy"
              />
            </div>
            <p className="text-white/40 text-[12px] mt-2">{stats.active} vehicles online</p>
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
              <h2 className="text-white text-lg font-semibold">Add Vehicle</h2>
              <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white/60 text-[13px] mb-1">Vehicle Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                  placeholder="e.g. Bus A1"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/60 text-[13px] mb-1">Plate Number</label>
                  <input
                    type="text"
                    value={form.plateNumber}
                    onChange={(e) => setForm({ ...form, plateNumber: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                    placeholder="LAG-123-AB"
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
                    <option style={{ background: "#0f1b33", color: "#fff" }}>Bus</option>
                    <option style={{ background: "#0f1b33", color: "#fff" }}>Van</option>
                    <option style={{ background: "#0f1b33", color: "#fff" }}>Minibus</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-white/60 text-[13px] mb-1">Capacity</label>
                <input
                  type="number"
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                  placeholder="e.g. 45"
                />
              </div>
              <div>
                <label className="block text-white/60 text-[13px] mb-1">Driver Name</label>
                <input
                  type="text"
                  value={form.driverName}
                  onChange={(e) => setForm({ ...form, driverName: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                  placeholder="e.g. Mr. Chukwuemeka"
                />
              </div>
              <div>
                <label className="block text-white/60 text-[13px] mb-1">Driver Phone</label>
                <input
                  type="text"
                  value={form.driverPhone}
                  onChange={(e) => setForm({ ...form, driverPhone: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-[var(--primary)]"
                  placeholder="e.g. 08012345678"
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
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin inline" /> : "Add Vehicle"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {showGPS && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowGPS(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-2xl bg-[#0f1b33] border border-white/[0.08] p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-lg font-semibold">GPS Tracking</h2>
              <button onClick={() => setShowGPS(false)} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="aspect-video rounded-xl overflow-hidden border border-white/[0.08] mb-4">
              <iframe
                src="https://www.google.com/maps/embed/v1/place?key=AIzaSyBCJsRJI5wjJ9l64a1RQNPsUG_WpXtYQQo&q=Lagos,Nigeria&zoom=11"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: "250px" }}
                allowFullScreen
                loading="lazy"
              />
            </div>
            <div className="space-y-2">
              {vehicles.filter(v => v.status === "active").map((v) => (
                <div key={v.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04]">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                    <div>
                      <p className="text-white text-[13px] font-medium">{v.name}</p>
                      <p className="text-white/40 text-[12px]">{v.plateNumber}</p>
                    </div>
                  </div>
                  <span className="text-white/40 text-[12px]">Last seen: 2 min ago</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
