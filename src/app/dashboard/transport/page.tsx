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
        className="card bg-gradient-to-r from-[#0a2a6e] to-[#0055ff] border-white/10 mx-6 mt-6 p-7"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1a1a2e] mb-1">Transport Management</h1>
            <p className="text-[#475569] text-[13px]">
              Manage vehicles, routes, drivers, and GPS tracking
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              className="btn btn-secondary"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => setShowGPS(true)}
              className="btn btn-secondary"
            >
              <Navigation className="w-4 h-4" />
              GPS Tracking
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="btn btn-primary"
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
                <p className="text-[#64748b] text-[12px] mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-[#1a1a2e]">{stat.value}</p>
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
            <h3 className="text-[#1a1a2e] font-semibold text-lg">Vehicle Fleet</h3>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
              <input
                type="text"
                placeholder="Search vehicles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-xl bg-[#ffffff] border border-[#e2e8f0] text-[#1a1a2e] text-[13px] focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
          </div>
          <div className="space-y-3">
            {filteredVehicles.map((vehicle) => (
              <div key={vehicle.id} className="flex items-center gap-4 p-4 rounded-xl bg-[#f8fafc] hover:bg-[#f1f5f9] transition-all">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  vehicle.status === "active" ? "bg-[#dcfce7] text-[#16a34a]" : "bg-orange-500/20 text-orange-400"
                }`}>
                  <Bus className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <p className="text-[#1a1a2e] text-[13px] font-medium">{vehicle.name}</p>
                    <span className="text-[#94a3b8] text-[12px]">{vehicle.plateNumber}</span>
                  </div>
                  <p className="text-[#64748b] text-[12px]">{vehicle.driverName} • {vehicle.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-[#1a1a2e] text-[13px] font-medium">{vehicle.capacity} seats</p>
                  <span className={`px-2 py-1 rounded-lg text-[12px] font-medium ${
                    vehicle.status === "active" ? "bg-[#dcfce7] text-[#16a34a]" : "bg-orange-500/20 text-orange-400"
                  }`}>
                    {vehicle.status}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button title="View vehicle details" onClick={() => alert(`Vehicle: ${vehicle.name}\nPlate: ${vehicle.plateNumber}\nDriver: ${vehicle.driverName}\nCapacity: ${vehicle.capacity} seats\nStatus: ${vehicle.status}`)} className="p-2 rounded-lg hover:bg-[#f1f5f9] text-[#64748b]">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button title="Edit vehicle" onClick={() => { setForm({ name: vehicle.name, plateNumber: vehicle.plateNumber, type: vehicle.type, capacity: String(vehicle.capacity), driverName: vehicle.driverName, driverPhone: vehicle.driverPhone }); setShowModal(true); }} className="p-2 rounded-lg hover:bg-[#f1f5f9] text-[#64748b]">
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {filteredVehicles.length === 0 && (
              <div className="text-center py-8 text-[#64748b] text-[13px]">No vehicles found</div>
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
            <h3 className="text-[#1a1a2e] font-semibold text-lg mb-4">Routes</h3>
            <div className="space-y-3">
              {routes.map((route) => (
                <div key={route.id} className="p-3 rounded-xl bg-[#f8fafc]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[#1a1a2e] text-[13px] font-medium">{route.name}</span>
                    <span className="text-[var(--accent)] text-[12px]">{route.students} students</span>
                  </div>
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-[#64748b]">{route.stops} stops • {route.time}</span>
                    <span className="px-2 py-1 rounded-lg bg-[#dcfce7] text-[#16a34a]">{route.status}</span>
                  </div>
                </div>
              ))}
              {routes.length === 0 && (
                <p className="text-center py-4 text-[#64748b] text-[13px]">No routes yet</p>
              )}
            </div>
          </div>

          <div className="card">
            <h3 className="text-[#1a1a2e] font-semibold text-lg mb-4">GPS Live Map</h3>
            <div className="aspect-video rounded-xl overflow-hidden border border-[#e2e8f0]">
              <iframe
                src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ""}&q=Lagos,Nigeria&zoom=12`}
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: "200px" }}
                allowFullScreen
                loading="lazy"
              />
            </div>
            <p className="text-[#64748b] text-[12px] mt-2">{stats.active} vehicles online</p>
          </div>
        </motion.div>
      </div>

      {showModal && (
        <div className="modal-overlay bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="modal-content"
          >
            <div className="modal-header">
              <h2 className="text-[#1a1a2e] text-lg font-semibold">Add Vehicle</h2>
              <button onClick={() => setShowModal(false)} className="text-[#64748b] hover:text-[#1a1a2e]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[#475569] text-[13px] mb-1">Vehicle Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-5 py-2.5 rounded-xl bg-[#ffffff] border border-[#e2e8f0] text-[#1a1a2e] text-[13px] focus:outline-none focus:border-[var(--primary)]"
                  placeholder="e.g. Bus A1"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#475569] text-[13px] mb-1">Plate Number</label>
                  <input
                    type="text"
                    value={form.plateNumber}
                    onChange={(e) => setForm({ ...form, plateNumber: e.target.value })}
                    className="w-full px-5 py-2.5 rounded-xl bg-[#ffffff] border border-[#e2e8f0] text-[#1a1a2e] text-[13px] focus:outline-none focus:border-[var(--primary)]"
                    placeholder="LAG-123-AB"
                  />
                </div>
                <div>
                  <label className="block text-[#475569] text-[13px] mb-1">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    style={{ colorScheme: "light" }}
                    className="w-full px-5 py-2.5 rounded-xl bg-[#ffffff] border border-[#e2e8f0] text-[#1a1a2e] text-[13px] focus:outline-none focus:border-[var(--primary)]"
                  >
                    <option style={{ background: "#ffffff", color: "#1a1a2e" }}>Bus</option>
                    <option style={{ background: "#ffffff", color: "#1a1a2e" }}>Van</option>
                    <option style={{ background: "#ffffff", color: "#1a1a2e" }}>Minibus</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[#475569] text-[13px] mb-1">Capacity</label>
                <input
                  type="number"
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                  className="w-full px-5 py-2.5 rounded-xl bg-[#ffffff] border border-[#e2e8f0] text-[#1a1a2e] text-[13px] focus:outline-none focus:border-[var(--primary)]"
                  placeholder="e.g. 45"
                />
              </div>
              <div>
                <label className="block text-[#475569] text-[13px] mb-1">Driver Name</label>
                <input
                  type="text"
                  value={form.driverName}
                  onChange={(e) => setForm({ ...form, driverName: e.target.value })}
                  className="w-full px-5 py-2.5 rounded-xl bg-[#ffffff] border border-[#e2e8f0] text-[#1a1a2e] text-[13px] focus:outline-none focus:border-[var(--primary)]"
                  placeholder="e.g. Mr. Chukwuemeka"
                />
              </div>
              <div>
                <label className="block text-[#475569] text-[13px] mb-1">Driver Phone</label>
                <input
                  type="text"
                  value={form.driverPhone}
                  onChange={(e) => setForm({ ...form, driverPhone: e.target.value })}
                  className="w-full px-5 py-2.5 rounded-xl bg-[#ffffff] border border-[#e2e8f0] text-[#1a1a2e] text-[13px] focus:outline-none focus:border-[var(--primary)]"
                  placeholder="e.g. 08012345678"
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 btn btn-primary"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin inline" /> : "Add Vehicle"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {showGPS && (
        <div className="modal-overlay bg-black/60 backdrop-blur-sm" onClick={() => setShowGPS(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="modal-content">
            <div className="modal-header">
              <h2 className="text-[#1a1a2e] text-lg font-semibold">GPS Tracking</h2>
              <button onClick={() => setShowGPS(false)} className="text-[#64748b] hover:text-[#1a1a2e]"><X className="w-5 h-5" /></button>
            </div>
            <div className="aspect-video rounded-xl overflow-hidden border border-[#e2e8f0] mb-4">
              <iframe
                src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ""}&q=Lagos,Nigeria&zoom=11`}
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: "250px" }}
                allowFullScreen
                loading="lazy"
              />
            </div>
            <div className="space-y-2">
              {vehicles.filter(v => v.status === "active").map((v) => (
                <div key={v.id} className="flex items-center justify-between p-3 rounded-xl bg-[#f8fafc]">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                    <div>
                      <p className="text-[#1a1a2e] text-[13px] font-medium">{v.name}</p>
                      <p className="text-[#64748b] text-[12px]">{v.plateNumber}</p>
                    </div>
                  </div>
                  <span className="text-[#64748b] text-[12px]">Last seen: 2 min ago</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
