"use client";

import { Suspense, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Calendar,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Loader2,
  CalendarDays,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

interface EventItem {
  id: string;
  title: string;
  content: string;
  type: string;
  priority: string;
  published: boolean;
  createdAt: string;
  target?: any;
}

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const ROWS_PER_PAGE = 20;

export function EventsPageInner() {
  const { data: session } = useSession();
  const userRoles: string[] = (session?.user as any)?.roles?.map((r: any) => r.name) || [];
  const canManage = userRoles.some(r => ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"].includes(r));

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<EventItem | null>(null);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState("");
  const [featured, setFeatured] = useState(false);

  const fetchEvents = async (page = 1, searchQuery = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(ROWS_PER_PAGE) });
      if (searchQuery) params.set("search", searchQuery);
      const res = await fetch(`/api/events?${params.toString()}`);
      const data = await res.json();
      const items = (data.events || []).map((e: any) => ({
        id: e.id,
        title: e.title,
        content: e.description || "",
        type: e.type || "event",
        priority: "medium",
        published: true,
        createdAt: e.createdAt,
        target: {
          eventDate: e.startDate,
          imageUrl: "",
          featured: false,
          audience: ["all"],
        },
      }));
      setEvents(items);
      setTotalPages(data.totalPages || Math.ceil((data.total || items.length) / ROWS_PER_PAGE));
      setTotalCount(data.total || items.length);
    } catch {
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(currentPage, search); }, []);
  useEffect(() => { setCurrentPage(1); fetchEvents(1, search); }, [search]);

  const now = new Date();
  const stats = {
    total: totalCount,
    upcoming: events.filter(e => e.target?.eventDate && new Date(e.target.eventDate) >= now).length,
    past: events.filter(e => e.target?.eventDate && new Date(e.target.eventDate) < now).length,
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImageFile(reader.result as string);
      setImageUrl("");
    };
    reader.readAsDataURL(file);
  };

  const openCreate = () => {
    setEditItem(null);
    setTitle("");
    setContent("");
    setEventDate("");
    setImageUrl("");
    setImageFile("");
    setFeatured(false);
    setShowModal(true);
  };

  const openEdit = (item: EventItem) => {
    setEditItem(item);
    setTitle(item.title);
    setContent(item.content);
    setEventDate(item.target?.eventDate ? item.target.eventDate.split("T")[0] : "");
    setImageUrl(item.target?.imageUrl || "");
    setImageFile("");
    setFeatured(item.target?.featured || false);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }
    if (!eventDate) {
      toast.error("Event date is required");
      return;
    }
    setSaving(true);
    try {
      const body: any = {
        title: title.trim(),
        description: content.trim(),
        startDate: eventDate,
        endDate: eventDate,
        type: "event",
        location: "",
      };

      if (editItem) {
        const res = await fetch(`/api/events?id=${editItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("Failed to update");
        toast.success("Event updated");
      } else {
        const res = await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("Failed to create");
        toast.success("Event created");
      }
      setShowModal(false);
      fetchEvents(currentPage, search);
    } catch {
      toast.error("Failed to save event");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    try {
      const res = await fetch(`/api/events?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Event deleted");
      fetchEvents(currentPage, search);
    } catch {
      toast.error("Failed to delete");
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    } catch {
      return dateStr;
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 16px", borderRadius: "12px",
    backgroundColor: "#ffffff", border: "1px solid #e2e8f0", color: "#1a1a2e",
    fontSize: "13px", outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    color: "#475569", fontSize: "13px", marginBottom: "6px", display: "block",
  };

  const btnStyle = (bg: string, disabled?: boolean): React.CSSProperties => ({
    padding: "8px 16px", borderRadius: "12px", backgroundColor: bg,
    color: "#ffffff", fontSize: "13px", fontWeight: 500, border: "none",
    cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1,
    display: "inline-flex", alignItems: "center", gap: "6px",
  });

  const statCardConfigs = [
    { label: "Total Events", value: stats.total, gradient: "linear-gradient(135deg, #3b82f6, #2563eb)" },
    { label: "Upcoming", value: stats.upcoming, gradient: "linear-gradient(135deg, #10b981, #059669)" },
    { label: "Past", value: stats.past, gradient: "linear-gradient(135deg, #94a3b8, #64748b)" },
  ];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchEvents(page, search);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ background: "linear-gradient(135deg, #0a2a6e, #0055ff)", borderRadius: "16px", padding: "32px", margin: "32px 16px 0", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-50%", right: "-20%", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "-30%", left: "-10%", width: "200px", height: "200px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)" }} />
        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ color: "#ffffff", fontSize: "24px", fontWeight: 700, marginBottom: "4px" }}>Events Management</h1>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px" }}>Create and manage school events and activities</p>
          </div>
          {canManage && (
            <button onClick={openCreate} style={{ padding: "10px 20px", borderRadius: "12px", backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#ffffff", fontSize: "13px", fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
              <Plus style={{ width: "16px", height: "16px" }} />
              New Event
            </button>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", padding: "0 16px" }}>
        {statCardConfigs.map((stat, i) => (
          <div key={i} style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <p style={{ color: "#64748b", fontSize: "13px", marginBottom: "4px" }}>{stat.label}</p>
                <p style={{ fontSize: "30px", fontWeight: 700, color: "#1a1a2e" }}>{stat.value}</p>
              </div>
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: stat.gradient, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Calendar style={{ width: "24px", height: "24px", color: "#ffffff" }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px", margin: "0 16px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          <h3 style={{ color: "#1a1a2e", fontSize: "18px", fontWeight: 600 }}>All Events</h3>
          <div style={{ position: "relative" }}>
            <Search style={{ width: "16px", height: "16px", position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={{ ...inputStyle, paddingLeft: "36px", width: "220px", borderColor: searchFocused ? "#0055ff" : "#e2e8f0" }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0" }}>
            <Loader2 style={{ width: "32px", height: "32px", color: "#64748b", animation: "spin 1s linear infinite" }} />
          </div>
        ) : events.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#64748b" }}>
            <CalendarDays style={{ width: "48px", height: "48px", margin: "0 auto 12px", opacity: 0.4 }} />
            <p style={{ fontSize: "13px" }}>No events found</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {events.map((item) => {
              const evDate = item.target?.eventDate;
              const dateObj = evDate ? new Date(evDate) : null;
              const day = dateObj ? dateObj.getDate() : "–";
              const month = dateObj ? MONTHS[dateObj.getMonth()] : "–";
              const img = item.target?.imageUrl;
              return (
                <div key={item.id} style={{ display: "flex", alignItems: "flex-start", gap: "16px", padding: "16px", borderRadius: "12px", backgroundColor: "#f8fafc", transition: "background-color 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f1f5f9")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                >
                  <div style={{ width: "56px", height: "56px", borderRadius: "12px", background: "linear-gradient(135deg, rgba(16,185,129,0.3), rgba(5,150,105,0.3))", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ color: "#16a34a", fontSize: "18px", fontWeight: 700, lineHeight: 1 }}>{day}</span>
                    <span style={{ color: "rgba(22,163,74,0.7)", fontSize: "10px", textTransform: "uppercase" }}>{month}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <h4 style={{ color: "#1a1a2e", fontSize: "14px", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</h4>
                      {item.target?.featured && (
                        <span style={{ padding: "2px 8px", borderRadius: "9999px", backgroundColor: "rgba(234,179,8,0.2)", color: "#ca8a04", fontSize: "11px", fontWeight: 500, flexShrink: 0 }}>Featured</span>
                      )}
                    </div>
                    <p style={{ color: "#64748b", fontSize: "13px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: "4px" }}>{item.content}</p>
                    {evDate && (
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#94a3b8", fontSize: "12px" }}>
                        <Clock style={{ width: "12px", height: "12px" }} />
                        {formatDate(evDate)}
                      </div>
                    )}
                  </div>
                  {img && (
                    <div style={{ width: "80px", height: "56px", borderRadius: "8px", overflow: "hidden", flexShrink: 0, display: "none" }}>
                      <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    </div>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                    <button onClick={() => openEdit(item)} style={{ padding: "6px", borderRadius: "8px", backgroundColor: "transparent", border: "none", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center" }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f1f5f9"; e.currentTarget.style.color = "#1a1a2e"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#64748b"; }}
                    >
                      <Edit style={{ width: "16px", height: "16px" }} />
                    </button>
                    <button onClick={() => handleDelete(item.id)} style={{ padding: "6px", borderRadius: "8px", backgroundColor: "transparent", border: "none", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center" }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(220,38,38,0.1)"; e.currentTarget.style.color = "#dc2626"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#64748b"; }}
                    >
                      <Trash2 style={{ width: "16px", height: "16px" }} />
                    </button>
                  </div>
                </div>
              );
            })}

            {totalPages > 1 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "8px", paddingTop: "16px", borderTop: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "13px", color: "#64748b" }}>
                  Showing {((currentPage - 1) * ROWS_PER_PAGE) + 1}–{Math.min(currentPage * ROWS_PER_PAGE, totalCount)} of {totalCount}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", backgroundColor: "#ffffff", color: "#475569", fontSize: "13px", cursor: currentPage === 1 ? "not-allowed" : "pointer", opacity: currentPage === 1 ? 0.5 : 1 }}
                  >
                    Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      style={{
                        padding: "6px 12px", borderRadius: "8px", border: "1px solid #e2e8f0",
                        backgroundColor: currentPage === page ? "#0055ff" : "#ffffff",
                        color: currentPage === page ? "#ffffff" : "#475569",
                        fontSize: "13px", fontWeight: currentPage === page ? 500 : 400, cursor: "pointer",
                      }}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", backgroundColor: "#ffffff", color: "#475569", fontSize: "13px", cursor: currentPage === totalPages ? "not-allowed" : "pointer", opacity: currentPage === totalPages ? 0.5 : 1 }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{ width: "100%", maxWidth: "500px", backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <div style={{ background: "linear-gradient(135deg, #0a2a6e, #0055ff)", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ color: "#ffffff", fontSize: "18px", fontWeight: 600 }}>{editItem ? "Edit Event" : "New Event"}</h2>
              <button onClick={() => setShowModal(false)} style={{ color: "rgba(255,255,255,0.7)", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}>
                <X style={{ width: "20px", height: "20px" }} />
              </button>
            </div>

            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={labelStyle}>Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={inputStyle}
                  placeholder="Enter event title"
                />
              </div>
              <div>
                <label style={labelStyle}>Content *</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  style={{ ...inputStyle, resize: "none" }}
                  placeholder="Write event description..."
                />
              </div>
              <div>
                <label style={labelStyle}>Event Date *</label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  style={{ ...inputStyle, colorScheme: "light" }}
                />
              </div>
              <div>
                <label style={labelStyle}>Event Image</label>
                <div style={{ display: "flex", gap: "12px" }}>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => { setImageUrl(e.target.value); setImageFile(""); }}
                    placeholder="Image URL"
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  <label style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "10px 16px", borderRadius: "12px", backgroundColor: "#f8fafc", border: "1px dashed #e2e8f0", color: "#64748b", fontSize: "13px", cursor: "pointer" }}>
                    <svg style={{ width: "16px", height: "16px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    Upload
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />
                  </label>
                </div>
                {(imageFile || imageUrl) && (
                  <div style={{ marginTop: "8px", position: "relative", display: "inline-block" }}>
                    <img src={imageFile || imageUrl} alt="Preview" style={{ height: "80px", borderRadius: "8px", objectFit: "cover" }} />
                    <button onClick={() => { setImageFile(""); setImageUrl(""); }} style={{ position: "absolute", top: "-4px", right: "-4px", padding: "4px", borderRadius: "9999px", backgroundColor: "#dc2626", color: "#ffffff", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}>
                      <X style={{ width: "12px", height: "12px" }} />
                    </button>
                  </div>
                )}
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", color: "#475569", fontSize: "13px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  style={{ accentColor: "#0055ff" }}
                />
                Mark as featured
              </label>
            </div>

            <div style={{ padding: "16px 24px", borderTop: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "12px" }}>
              <button onClick={() => setShowModal(false)} style={btnStyle("#f1f5f9", false)}>
                <span style={{ color: "#475569" }}>Cancel</span>
              </button>
              <button onClick={handleSave} disabled={saving} style={btnStyle("#0055ff", saving)}>
                {saving && <Loader2 style={{ width: "16px", height: "16px", animation: "spin 1s linear infinite" }} />}
                {editItem ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EventsPage() {
  return (
    <Suspense fallback={<div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0" }}><Loader2 style={{ width: "32px", height: "32px", color: "#64748b", animation: "spin 1s linear infinite" }} /></div>}>
      <EventsPageInner />
    </Suspense>
  );
}
