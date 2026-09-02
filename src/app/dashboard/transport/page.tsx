"use client";

import { useEffect, useState } from "react";
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { downloadCSV } from "@/lib/exports";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 16px",
  borderRadius: "12px",
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  color: "#1a1a2e",
  fontSize: "13px",
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  color: "#475569",
  fontSize: "13px",
  marginBottom: "6px",
  display: "block",
};

const cardStyle: React.CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  border: "1px solid #e2e8f0",
  padding: "24px",
};

const PAGE_SIZE = 20;

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
  const [page, setPage] = useState(1);
  const [searchFocused, setSearchFocused] = useState(false);

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

  const filteredVehicles = vehicles.filter(
    (v) =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.plateNumber.toLowerCase().includes(search.toLowerCase()) ||
      v.driverName.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredVehicles.length / PAGE_SIZE));
  const paginatedVehicles = filteredVehicles.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const statCards = [
    { label: "Total Vehicles", value: stats.total, icon: Bus, bg: "linear-gradient(135deg, #3b82f6, #2563eb)" },
    { label: "Active Routes", value: stats.routes, icon: MapPin, bg: "linear-gradient(135deg, #10b981, #059669)" },
    { label: "Active Vehicles", value: stats.active, icon: Users, bg: "linear-gradient(135deg, #8b5cf6, #7c3aed)" },
    { label: "On-Time Rate", value: "94%", icon: Clock, bg: "linear-gradient(135deg, #0055ff, #10b981)" },
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "400px" }}>
        <Loader2 size={32} style={{ animation: "spin 1s linear infinite", color: "#0055ff" }} />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Gradient Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #0a2a6e, #0055ff)",
          borderRadius: "16px",
          padding: "32px",
          margin: "32px 16px 0",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-50%",
            right: "-20%",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-30%",
            left: "-10%",
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)",
          }}
        />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <h1 style={{ color: "#ffffff", fontSize: "24px", fontWeight: 700, marginBottom: "4px" }}>Transport Management</h1>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px" }}>Manage vehicles, routes, drivers, and GPS tracking</p>
            </div>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button
                onClick={handleExport}
                style={{
                  padding: "8px 16px",
                  borderRadius: "12px",
                  backgroundColor: "rgba(255,255,255,0.15)",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: 500,
                  border: "1px solid rgba(255,255,255,0.2)",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Download size={16} />
                Export
              </button>
              <button
                onClick={() => setShowGPS(true)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "12px",
                  backgroundColor: "rgba(255,255,255,0.15)",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: 500,
                  border: "1px solid rgba(255,255,255,0.2)",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Navigation size={16} />
                GPS Tracking
              </button>
              <button
                onClick={() => setShowModal(true)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "12px",
                  backgroundColor: "#ffffff",
                  color: "#0a2a6e",
                  fontSize: "13px",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Plus size={16} />
                Add Vehicle
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          padding: "0 16px",
        }}
      >
        {statCards.map((stat, i) => (
          <div key={i} style={cardStyle}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <p style={{ color: "#64748b", fontSize: "12px", marginBottom: "4px" }}>{stat.label}</p>
                <p style={{ color: "#1a1a2e", fontSize: "28px", fontWeight: 700 }}>{stat.value}</p>
              </div>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: stat.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <stat.icon size={24} style={{ color: "#ffffff" }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "24px", padding: "0 16px" }}>
        {/* Vehicle Fleet */}
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
            <h3 style={{ color: "#1a1a2e", fontWeight: 600, fontSize: "18px" }}>Vehicle Fleet</h3>
            <div style={{ position: "relative" }}>
              <Search
                size={16}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94a3b8",
                }}
              />
              <input
                type="text"
                placeholder="Search vehicles..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                style={{
                  ...inputStyle,
                  paddingLeft: "36px",
                  width: "220px",
                  borderColor: searchFocused ? "#0055ff" : "#e2e8f0",
                }}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {paginatedVehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  padding: "16px",
                  borderRadius: "12px",
                  backgroundColor: "#f8fafc",
                  transition: "background-color 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f1f5f9")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: vehicle.status === "active" ? "#dcfce7" : "rgba(249,115,22,0.15)",
                    color: vehicle.status === "active" ? "#16a34a" : "#f97316",
                    flexShrink: 0,
                  }}
                >
                  <Bus size={24} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <p style={{ color: "#1a1a2e", fontSize: "13px", fontWeight: 500 }}>{vehicle.name}</p>
                    <span style={{ color: "#94a3b8", fontSize: "12px" }}>{vehicle.plateNumber}</span>
                  </div>
                  <p style={{ color: "#64748b", fontSize: "12px" }}>
                    {vehicle.driverName} • {vehicle.type}
                  </p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{ color: "#1a1a2e", fontSize: "13px", fontWeight: 500 }}>{vehicle.capacity} seats</p>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "4px 8px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: 500,
                      backgroundColor: vehicle.status === "active" ? "#dcfce7" : "rgba(249,115,22,0.15)",
                      color: vehicle.status === "active" ? "#16a34a" : "#f97316",
                    }}
                  >
                    {vehicle.status}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                  <button
                    title="View vehicle details"
                    onClick={() =>
                      alert(
                        `Vehicle: ${vehicle.name}\nPlate: ${vehicle.plateNumber}\nDriver: ${vehicle.driverName}\nCapacity: ${vehicle.capacity} seats\nStatus: ${vehicle.status}`
                      )
                    }
                    style={{
                      padding: "8px",
                      borderRadius: "8px",
                      border: "none",
                      backgroundColor: "transparent",
                      color: "#64748b",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f1f5f9")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    title="Edit vehicle"
                    onClick={() => {
                      setForm({
                        name: vehicle.name,
                        plateNumber: vehicle.plateNumber,
                        type: vehicle.type,
                        capacity: String(vehicle.capacity),
                        driverName: vehicle.driverName,
                        driverPhone: vehicle.driverPhone,
                      });
                      setShowModal(true);
                    }}
                    style={{
                      padding: "8px",
                      borderRadius: "8px",
                      border: "none",
                      backgroundColor: "transparent",
                      color: "#64748b",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f1f5f9")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <Edit size={16} />
                  </button>
                </div>
              </div>
            ))}
            {filteredVehicles.length === 0 && (
              <div style={{ textAlign: "center", padding: "32px", color: "#64748b", fontSize: "13px" }}>
                No vehicles found
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredVehicles.length > PAGE_SIZE && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: "20px",
                paddingTop: "16px",
                borderTop: "1px solid #e2e8f0",
              }}
            >
              <p style={{ color: "#64748b", fontSize: "13px" }}>
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredVehicles.length)} of{" "}
                {filteredVehicles.length}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{
                    padding: "6px 10px",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    backgroundColor: "#ffffff",
                    color: page === 1 ? "#cbd5e1" : "#475569",
                    cursor: page === 1 ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce<(number | string)[]>((acc, p, idx, arr) => {
                    if (idx > 0 && typeof arr[idx - 1] === "number" && p - (arr[idx - 1] as number) > 1) {
                      acc.push("...");
                    }
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, idx) =>
                    typeof p === "string" ? (
                      <span key={`ellipsis-${idx}`} style={{ color: "#94a3b8", fontSize: "13px", padding: "0 4px" }}>
                        ...
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "8px",
                          border: "none",
                          backgroundColor: page === p ? "#0055ff" : "transparent",
                          color: page === p ? "#ffffff" : "#475569",
                          cursor: "pointer",
                          fontSize: "13px",
                          fontWeight: page === p ? 600 : 400,
                        }}
                      >
                        {p}
                      </button>
                    )
                  )}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={{
                    padding: "6px 10px",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    backgroundColor: "#ffffff",
                    color: page === totalPages ? "#cbd5e1" : "#475569",
                    cursor: page === totalPages ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Routes */}
          <div style={cardStyle}>
            <h3 style={{ color: "#1a1a2e", fontWeight: 600, fontSize: "18px", marginBottom: "16px" }}>Routes</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {routes.map((route) => (
                <div key={route.id} style={{ padding: "12px", borderRadius: "12px", backgroundColor: "#f8fafc" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ color: "#1a1a2e", fontSize: "13px", fontWeight: 500 }}>{route.name}</span>
                    <span style={{ color: "#0055ff", fontSize: "12px" }}>{route.students} students</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px" }}>
                    <span style={{ color: "#64748b" }}>
                      {route.stops} stops • {route.time}
                    </span>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: "8px",
                        backgroundColor: "#dcfce7",
                        color: "#16a34a",
                        fontSize: "12px",
                        fontWeight: 500,
                      }}
                    >
                      {route.status}
                    </span>
                  </div>
                </div>
              ))}
              {routes.length === 0 && (
                <p style={{ textAlign: "center", padding: "16px", color: "#64748b", fontSize: "13px" }}>No routes yet</p>
              )}
            </div>
          </div>

          {/* GPS Live Map */}
          <div style={cardStyle}>
            <h3 style={{ color: "#1a1a2e", fontWeight: 600, fontSize: "18px", marginBottom: "16px" }}>GPS Live Map</h3>
            <div
              style={{
                aspectRatio: "16/9",
                borderRadius: "12px",
                overflow: "hidden",
                border: "1px solid #e2e8f0",
              }}
            >
              <iframe
                src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ""}&q=Lagos,Nigeria&zoom=12`}
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: "200px" }}
                allowFullScreen
                loading="lazy"
              />
            </div>
            <p style={{ color: "#64748b", fontSize: "12px", marginTop: "8px" }}>{stats.active} vehicles online</p>
          </div>
        </div>
      </div>

      {/* Add Vehicle Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "520px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "20px 24px",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              <h2 style={{ color: "#1a1a2e", fontSize: "18px", fontWeight: 600 }}>Add Vehicle</h2>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  color: "#64748b",
                  cursor: "pointer",
                  border: "none",
                  backgroundColor: "transparent",
                  padding: "4px",
                }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={labelStyle}>Vehicle Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={inputStyle}
                  placeholder="e.g. Bus A1"
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={labelStyle}>Plate Number</label>
                  <input
                    type="text"
                    value={form.plateNumber}
                    onChange={(e) => setForm({ ...form, plateNumber: e.target.value })}
                    style={inputStyle}
                    placeholder="LAG-123-AB"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    style={{ ...inputStyle, colorScheme: "light" }}
                  >
                    <option style={{ background: "#ffffff", color: "#1a1a2e" }}>Bus</option>
                    <option style={{ background: "#ffffff", color: "#1a1a2e" }}>Van</option>
                    <option style={{ background: "#ffffff", color: "#1a1a2e" }}>Minibus</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Capacity</label>
                <input
                  type="number"
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                  style={inputStyle}
                  placeholder="e.g. 45"
                />
              </div>
              <div>
                <label style={labelStyle}>Driver Name</label>
                <input
                  type="text"
                  value={form.driverName}
                  onChange={(e) => setForm({ ...form, driverName: e.target.value })}
                  style={inputStyle}
                  placeholder="e.g. Mr. Chukwuemeka"
                />
              </div>
              <div>
                <label style={labelStyle}>Driver Phone</label>
                <input
                  type="text"
                  value={form.driverPhone}
                  onChange={(e) => setForm({ ...form, driverPhone: e.target.value })}
                  style={inputStyle}
                  placeholder="e.g. 08012345678"
                />
              </div>
              <div style={{ display: "flex", gap: "12px", paddingTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1,
                    padding: "10px 16px",
                    borderRadius: "12px",
                    backgroundColor: "#f1f5f9",
                    color: "#475569",
                    fontSize: "13px",
                    fontWeight: 500,
                    border: "1px solid #e2e8f0",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    flex: 1,
                    padding: "10px 16px",
                    borderRadius: "12px",
                    backgroundColor: submitting ? "#93c5fd" : "#0055ff",
                    color: "#ffffff",
                    fontSize: "13px",
                    fontWeight: 500,
                    border: "none",
                    cursor: submitting ? "not-allowed" : "pointer",
                    opacity: submitting ? 0.7 : 1,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  {submitting ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : "Add Vehicle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GPS Modal */}
      {showGPS && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
          }}
          onClick={() => setShowGPS(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "640px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "20px 24px",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              <h2 style={{ color: "#1a1a2e", fontSize: "18px", fontWeight: 600 }}>GPS Tracking</h2>
              <button
                onClick={() => setShowGPS(false)}
                style={{
                  color: "#64748b",
                  cursor: "pointer",
                  border: "none",
                  backgroundColor: "transparent",
                  padding: "4px",
                }}
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: "24px" }}>
              <div
                style={{
                  aspectRatio: "16/9",
                  borderRadius: "12px",
                  overflow: "hidden",
                  border: "1px solid #e2e8f0",
                  marginBottom: "16px",
                }}
              >
                <iframe
                  src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ""}&q=Lagos,Nigeria&zoom=11`}
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: "250px" }}
                  allowFullScreen
                  loading="lazy"
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {vehicles
                  .filter((v) => v.status === "active")
                  .map((v) => (
                    <div
                      key={v.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px",
                        borderRadius: "12px",
                        backgroundColor: "#f8fafc",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            backgroundColor: "#10b981",
                          }}
                        />
                        <div>
                          <p style={{ color: "#1a1a2e", fontSize: "13px", fontWeight: 500 }}>{v.name}</p>
                          <p style={{ color: "#64748b", fontSize: "12px" }}>{v.plateNumber}</p>
                        </div>
                      </div>
                      <span style={{ color: "#64748b", fontSize: "12px" }}>Last seen: 2 min ago</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
