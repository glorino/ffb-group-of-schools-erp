"use client";

import { useEffect, useState } from "react";
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

const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 16px", borderRadius: "12px", backgroundColor: "#ffffff", border: "1px solid #e2e8f0", color: "#1a1a2e", fontSize: "13px", outline: "none" };
const inputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => { e.currentTarget.style.borderColor = "#0055ff"; };
const inputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => { e.currentTarget.style.borderColor = "#e2e8f0"; };
const labelStyle: React.CSSProperties = { color: "#475569", fontSize: "13px", marginBottom: "6px", display: "block" };
const btnStyle = (bg: string, disabled?: boolean): React.CSSProperties => ({ padding: "8px 16px", borderRadius: "12px", backgroundColor: bg, color: "#ffffff", fontSize: "13px", fontWeight: 500, border: "none", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, display: "inline-flex", alignItems: "center", gap: "6px" });
const modalOverlay: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "16px" };
const cardStyle: React.CSSProperties = { background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", padding: "24px" };
const cardHover = (enter: boolean) => ({ boxShadow: enter ? "0 4px 16px rgba(0,0,0,0.08)" : "0 1px 3px rgba(0,0,0,0.04)" });

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
  const [roomsPage, setRoomsPage] = useState(1);
  const ROOMS_PER_PAGE = 20;

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

  const totalRoomsPages = Math.max(1, Math.ceil(allRooms.length / ROOMS_PER_PAGE));
  const paginatedRooms = allRooms.slice((roomsPage - 1) * ROOMS_PER_PAGE, roomsPage * ROOMS_PER_PAGE);

  const statCards = [
    { label: "Total Beds", value: stats.totalBeds, icon: Bed, bg: "linear-gradient(135deg, #0055ff, #0033cc)" },
    { label: "Occupied", value: stats.occupiedBeds, icon: Users, bg: "linear-gradient(135deg, #10b981, #059669)" },
    { label: "Available", value: stats.totalBeds - stats.occupiedBeds, icon: CheckCircle, bg: "linear-gradient(135deg, #8b5cf6, #7c3aed)" },
    { label: "Occupancy Rate", value: stats.totalBeds ? `${Math.round((stats.occupiedBeds / stats.totalBeds) * 100)}%` : "0%", icon: Building, bg: "linear-gradient(135deg, #0055ff, #10b981)" },
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "400px" }}>
        <Loader2 style={{ width: "32px", height: "32px", color: "#0055ff", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  return (
    <div style={{ padding: "24px 32px", minHeight: "100vh", background: "#f8fafc" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0a2a6e, #0055ff)", borderRadius: "20px", padding: "28px 32px", marginBottom: "28px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 90% 20%, rgba(255,255,255,0.12) 0%, transparent 60%), radial-gradient(circle at 10% 80%, rgba(255,255,255,0.08) 0%, transparent 50%)" }} />
        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "26px", fontWeight: 800, color: "#ffffff" }}>Hostel Management</h1>
            <p style={{ margin: "6px 0 0", fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>Manage blocks, rooms, beds, allocation, and QR attendance</p>
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button onClick={handleExport} style={btnStyle("#475569")}>
              <Download style={{ width: "14px", height: "14px" }} /> Export
            </button>
            <button onClick={() => setShowQRScanner(true)} style={btnStyle("#475569")}>
              <QrCode style={{ width: "14px", height: "14px" }} /> QR Attendance
            </button>
            <button onClick={() => setShowModal(true)} style={btnStyle("#0055ff")}>
              <Plus style={{ width: "14px", height: "14px" }} /> Add Block
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {statCards.map((stat, i) => (
          <div key={i} style={{ ...cardStyle, display: "flex", alignItems: "center", justifyContent: "space-between", transition: "box-shadow 0.15s" }} onMouseEnter={(e) => { Object.assign(e.currentTarget.style, cardHover(true)); }} onMouseLeave={(e) => { Object.assign(e.currentTarget.style, cardHover(false)); }}>
            <div>
              <p style={{ margin: 0, fontSize: "13px", fontWeight: 500, color: "#64748b" }}>{stat.label}</p>
              <p style={{ margin: "6px 0 0", fontSize: "28px", fontWeight: 800, color: "#0f172a" }}>{stat.value}</p>
            </div>
            <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: stat.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <stat.icon style={{ width: "22px", height: "22px", color: "#ffffff" }} />
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
        {/* Blocks Grid */}
        <div style={{ ...cardStyle }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>Hostel Blocks</h3>
            <div style={{ position: "relative" }}>
              <Search style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", width: "14px", height: "14px", color: "#94a3b8" }} />
              <input type="text" placeholder="Search blocks..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...inputStyle, paddingLeft: "38px", padding: "10px 14px 10px 38px", width: "220px" }} onFocus={inputFocus} onBlur={inputBlur} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {filteredBlocks.map((block) => {
              const occupied = block.rooms.reduce((acc, r) => acc + r.beds.length, 0);
              const totalRoomBeds = block.rooms.reduce((acc, r) => acc + r.capacity, 0);
              const pct = totalRoomBeds ? (occupied / totalRoomBeds) * 100 : block.capacity ? (occupied / block.capacity) * 100 : 0;
              return (
                <div key={block.id} style={{ padding: "16px", borderRadius: "14px", background: "#f8fafc", border: "1px solid transparent", transition: "all 0.15s" }} onMouseEnter={(e) => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.borderColor = "#e2e8f0"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "transparent"; }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>{block.name}</h4>
                      <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>{block.type} &bull; {block.rooms.length} rooms</p>
                    </div>
                    <span style={{ padding: "3px 10px", borderRadius: "8px", background: "#dcfce7", color: "#16a34a", fontSize: "11px", fontWeight: 600 }}>active</span>
                  </div>
                  <div style={{ marginBottom: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "13px", marginBottom: "6px" }}>
                      <span style={{ color: "#475569" }}>Occupancy</span>
                      <span style={{ color: "#64748b" }}>{occupied}/{totalRoomBeds || block.capacity}</span>
                    </div>
                    <div style={{ width: "100%", height: "8px", borderRadius: "4px", background: "#e2e8f0", overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: "4px", background: "linear-gradient(90deg, #0055ff, #10b981)", width: `${pct}%`, transition: "width 0.3s" }} />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button onClick={() => setViewBlock(block)} style={{ flex: 1, padding: "6px 12px", borderRadius: "10px", background: "#ffffff", border: "1px solid #e2e8f0", color: "#475569", fontSize: "12px", fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", transition: "all 0.15s" }} onMouseEnter={(e) => { e.currentTarget.style.background = "#f1f5f9"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "#ffffff"; }}>
                      <Eye style={{ width: "12px", height: "12px" }} /> View
                    </button>
                    <button onClick={() => { setEditBlock(block); setEditForm({ name: block.name, type: block.type, capacity: String(block.capacity) }); }} style={{ flex: 1, padding: "6px 12px", borderRadius: "10px", background: "#ffffff", border: "1px solid #e2e8f0", color: "#475569", fontSize: "12px", fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", transition: "all 0.15s" }} onMouseEnter={(e) => { e.currentTarget.style.background = "#f1f5f9"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "#ffffff"; }}>
                      <Edit style={{ width: "12px", height: "12px" }} /> Edit
                    </button>
                  </div>
                </div>
              );
            })}
            {filteredBlocks.length === 0 && (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px 16px", color: "#94a3b8", fontSize: "13px" }}>No hostel blocks found</div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Room Status */}
          <div style={{ ...cardStyle }}>
            <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>Room Status</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {paginatedRooms.map((room) => (
                <div key={room.id} style={{ padding: "12px", borderRadius: "12px", background: "#f8fafc" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>{room.blockName} - Room {room.number}</span>
                    <span style={{ padding: "3px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: 600, background: room.status === "full" ? "#fef2f2" : "#dcfce7", color: room.status === "full" ? "#dc2626" : "#16a34a" }}>
                      {room.status}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px" }}>
                    <span style={{ color: "#64748b" }}>{room.beds.length}/{room.capacity} beds</span>
                    <span style={{ color: "#94a3b8" }}>{room.capacity - room.beds.length} available</span>
                  </div>
                </div>
              ))}
              {allRooms.length === 0 && (
                <p style={{ textAlign: "center", padding: "16px", color: "#94a3b8", fontSize: "13px", margin: 0 }}>No rooms yet</p>
              )}
            </div>
            {allRooms.length > ROOMS_PER_PAGE && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "14px", paddingTop: "14px", borderTop: "1px solid #f1f5f9" }}>
                <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                  {(roomsPage - 1) * ROOMS_PER_PAGE + 1}-{Math.min(roomsPage * ROOMS_PER_PAGE, allRooms.length)} of {allRooms.length}
                </span>
                <div style={{ display: "flex", gap: "4px" }}>
                  <button disabled={roomsPage === 1} onClick={() => setRoomsPage((p) => p - 1)} style={{ padding: "4px 10px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#ffffff", color: roomsPage === 1 ? "#cbd5e1" : "#475569", fontSize: "12px", cursor: roomsPage === 1 ? "not-allowed" : "pointer" }}>
                    Prev
                  </button>
                  <span style={{ padding: "4px 10px", fontSize: "12px", color: "#64748b" }}>{roomsPage}/{totalRoomsPages}</span>
                  <button disabled={roomsPage === totalRoomsPages} onClick={() => setRoomsPage((p) => p + 1)} style={{ padding: "4px 10px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#ffffff", color: roomsPage === totalRoomsPages ? "#cbd5e1" : "#475569", fontSize: "12px", cursor: roomsPage === totalRoomsPages ? "not-allowed" : "pointer" }}>
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Facilities */}
          <div style={{ ...cardStyle }}>
            <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>Facilities</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {[
                { icon: Wifi, label: "WiFi", status: "Active" },
                { icon: Thermometer, label: "AC", status: "Active" },
                { icon: AlertCircle, label: "Security", status: "Active" },
                { icon: Building, label: "Water", status: "Active" },
              ].map((facility, i) => (
                <div key={i} style={{ padding: "12px", borderRadius: "12px", background: "#f8fafc", display: "flex", alignItems: "center", gap: "10px" }}>
                  <facility.icon style={{ width: "16px", height: "16px", color: "#0055ff", flexShrink: 0 }} />
                  <div>
                    <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>{facility.label}</p>
                    <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>{facility.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Block Modal */}
      {showModal && (
        <div style={modalOverlay} onClick={() => setShowModal(false)}>
          <div style={{ background: "#ffffff", borderRadius: "24px", width: "100%", maxWidth: "480px", maxHeight: "90vh", overflow: "auto", boxShadow: "0 25px 80px rgba(0,0,0,0.25)" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "24px 28px", background: "linear-gradient(135deg, #0a2a6e, #0055ff)", borderRadius: "24px 24px 0 0", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 90% 20%, rgba(255,255,255,0.1) 0%, transparent 60%)" }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "#ffffff" }}>Add Hostel Block</h2>
                  <p style={{ margin: "4px 0 0", fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>Create a new hostel block</p>
                </div>
                <button onClick={() => setShowModal(false)} style={{ width: "36px", height: "36px", borderRadius: "10px", border: "none", background: "rgba(255,255,255,0.15)", color: "#ffffff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <X style={{ width: "18px", height: "18px" }} />
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: "24px 28px 28px", display: "flex", flexDirection: "column", gap: "18px" }}>
              <div>
                <label style={labelStyle}>Block Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} placeholder="e.g. Block E" onFocus={inputFocus} onBlur={inputBlur} />
              </div>
              <div>
                <label style={labelStyle}>Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} style={{ ...inputStyle, colorScheme: "light", cursor: "pointer" }} onFocus={inputFocus} onBlur={inputBlur}>
                  <option style={{ background: "#ffffff", color: "#1a1a2e" }}>Boys</option>
                  <option style={{ background: "#ffffff", color: "#1a1a2e" }}>Girls</option>
                  <option style={{ background: "#ffffff", color: "#1a1a2e" }}>Staff</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Capacity</label>
                <input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} style={inputStyle} placeholder="e.g. 80" onFocus={inputFocus} onBlur={inputBlur} />
              </div>
              <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ ...btnStyle("#e2e8f0"), flex: 1, color: "#475569" }}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} style={{ ...btnStyle("#0055ff"), flex: 1 }}>
                  {submitting ? <Loader2 style={{ width: "14px", height: "14px", animation: "spin 1s linear infinite" }} /> : "Create Block"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Block Modal */}
      {viewBlock && (
        <div style={modalOverlay} onClick={() => setViewBlock(null)}>
          <div style={{ background: "#ffffff", borderRadius: "24px", width: "100%", maxWidth: "520px", maxHeight: "90vh", overflow: "auto", boxShadow: "0 25px 80px rgba(0,0,0,0.25)" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "24px 28px", background: "linear-gradient(135deg, #0a2a6e, #0055ff)", borderRadius: "24px 24px 0 0", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 90% 20%, rgba(255,255,255,0.1) 0%, transparent 60%)" }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "#ffffff" }}>{viewBlock.name} &mdash; Rooms</h2>
                  <p style={{ margin: "4px 0 0", fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>{viewBlock.rooms.length} rooms in this block</p>
                </div>
                <button onClick={() => setViewBlock(null)} style={{ width: "36px", height: "36px", borderRadius: "10px", border: "none", background: "rgba(255,255,255,0.15)", color: "#ffffff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <X style={{ width: "18px", height: "18px" }} />
                </button>
              </div>
            </div>
            <div style={{ padding: "20px 28px 28px", display: "flex", flexDirection: "column", gap: "10px", maxHeight: "400px", overflowY: "auto" }}>
              {viewBlock.rooms.length === 0 && (
                <p style={{ color: "#94a3b8", fontSize: "13px", textAlign: "center", padding: "16px", margin: 0 }}>No rooms in this block</p>
              )}
              {viewBlock.rooms.map((room) => (
                <div key={room.id} style={{ padding: "12px", borderRadius: "12px", background: "#f8fafc" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>Room {room.number}</span>
                    <span style={{ padding: "3px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: 600, background: room.status === "full" ? "#fef2f2" : "#dcfce7", color: room.status === "full" ? "#dc2626" : "#16a34a" }}>
                      {room.status}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px" }}>
                    <span style={{ color: "#64748b" }}>Beds: {room.beds.length}/{room.capacity}</span>
                    <span style={{ color: "#94a3b8" }}>{room.capacity - room.beds.length} available</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit Block Modal */}
      {editBlock && (
        <div style={modalOverlay} onClick={() => setEditBlock(null)}>
          <div style={{ background: "#ffffff", borderRadius: "24px", width: "100%", maxWidth: "480px", maxHeight: "90vh", overflow: "auto", boxShadow: "0 25px 80px rgba(0,0,0,0.25)" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "24px 28px", background: "linear-gradient(135deg, #0a2a6e, #0055ff)", borderRadius: "24px 24px 0 0", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 90% 20%, rgba(255,255,255,0.1) 0%, transparent 60%)" }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "#ffffff" }}>Edit {editBlock.name}</h2>
                  <p style={{ margin: "4px 0 0", fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>Update block details</p>
                </div>
                <button onClick={() => setEditBlock(null)} style={{ width: "36px", height: "36px", borderRadius: "10px", border: "none", background: "rgba(255,255,255,0.15)", color: "#ffffff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <X style={{ width: "18px", height: "18px" }} />
                </button>
              </div>
            </div>
            <div style={{ padding: "24px 28px 28px", display: "flex", flexDirection: "column", gap: "18px" }}>
              <div>
                <label style={labelStyle}>Block Name</label>
                <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
              </div>
              <div>
                <label style={labelStyle}>Type</label>
                <select value={editForm.type} onChange={(e) => setEditForm({ ...editForm, type: e.target.value })} style={{ ...inputStyle, colorScheme: "light", cursor: "pointer" }} onFocus={inputFocus} onBlur={inputBlur}>
                  <option style={{ background: "#ffffff", color: "#1a1a2e" }}>Boys</option>
                  <option style={{ background: "#ffffff", color: "#1a1a2e" }}>Girls</option>
                  <option style={{ background: "#ffffff", color: "#1a1a2e" }}>Staff</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Capacity</label>
                <input type="number" value={editForm.capacity} onChange={(e) => setEditForm({ ...editForm, capacity: e.target.value })} style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
              </div>
              <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                <button onClick={() => setEditBlock(null)} style={{ ...btnStyle("#e2e8f0"), flex: 1, color: "#475569" }}>
                  Cancel
                </button>
                <button onClick={async () => {
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
                }} style={{ ...btnStyle("#0055ff"), flex: 1 }}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <div style={modalOverlay} onClick={() => setShowQRScanner(false)}>
          <div style={{ background: "#ffffff", borderRadius: "24px", width: "100%", maxWidth: "440px", boxShadow: "0 25px 80px rgba(0,0,0,0.25)" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "24px 28px", background: "linear-gradient(135deg, #0a2a6e, #0055ff)", borderRadius: "24px 24px 0 0", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 90% 20%, rgba(255,255,255,0.1) 0%, transparent 60%)" }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "#ffffff" }}>QR Attendance</h2>
                  <p style={{ margin: "4px 0 0", fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>Check in student to hostel</p>
                </div>
                <button onClick={() => setShowQRScanner(false)} style={{ width: "36px", height: "36px", borderRadius: "10px", border: "none", background: "rgba(255,255,255,0.15)", color: "#ffffff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <X style={{ width: "18px", height: "18px" }} />
                </button>
              </div>
            </div>
            <div style={{ padding: "24px 28px 28px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <p style={{ margin: 0, color: "#475569", fontSize: "13px" }}>Scan or type the student admission number to check in to the hostel.</p>
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
                style={inputStyle}
                onFocus={inputFocus}
                onBlur={inputBlur}
              />
              <p style={{ margin: 0, color: "#94a3b8", fontSize: "12px" }}>Press Enter to submit</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
