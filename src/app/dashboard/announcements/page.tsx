"use client";

import { Suspense, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Megaphone,
  Plus,
  Search,
  Filter,
  Clock,
  Users,
  Eye,
  Edit,
  Trash2,
  Pin,
  Calendar,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  priority: string;
  published: boolean;
  createdAt: string;
  authorId?: string;
  target?: any;
}

const ROWS_PER_PAGE = 20;

function AnnouncementsPageInner() {
  const { data: session } = useSession();
  const userRoles: string[] = (session?.user as any)?.roles?.map((r: any) => r.name) || [];
  const isStudent = userRoles.includes("STUDENT");
  const isParent = userRoles.includes("PARENT");
  const isReadOnly = isStudent || isParent;
  const canManage = userRoles.some(r => ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"].includes(r));

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showFilter, setShowFilter] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editAnnouncement, setEditAnnouncement] = useState<Announcement | null>(null);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("general");
  const [priority, setPriority] = useState("medium");
  const [targetAudience, setTargetAudience] = useState<string[]>(["all"]);

  const [searchFocused, setSearchFocused] = useState(false);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/announcements");
      const data = await res.json();
      const items = (data.announcements || data || []).filter((a: any) => a.type !== "news" && a.type !== "event");
      setAnnouncements(items);
    } catch {
      toast.error("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const filtered = announcements.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase()) || a.content.toLowerCase().includes(search.toLowerCase());
    if (filterStatus === "all") return matchesSearch;
    if (filterStatus === "published") return matchesSearch && a.published;
    if (filterStatus === "draft") return matchesSearch && !a.published;
    if (filterStatus === "pinned") return matchesSearch && a.target?.pinned;
    return matchesSearch;
  });

  const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

  useEffect(() => { setCurrentPage(1); }, [search, filterStatus]);

  const draftCount = announcements.filter(a => !a.published).length;
  const stats = {
    total: announcements.length,
    published: announcements.filter(a => a.published).length,
    draft: draftCount,
    types: new Set(announcements.map(a => a.type)).size,
  };

  const openCreate = () => {
    setEditAnnouncement(null);
    setTitle("");
    setContent("");
    setType("general");
    setPriority("medium");
    setTargetAudience(["all"]);
    setShowModal(true);
  };

  const openEdit = (a: Announcement) => {
    setEditAnnouncement(a);
    setTitle(a.title);
    setContent(a.content);
    setType(a.type);
    setPriority(a.priority);
    setTargetAudience(a.target?.audience || ["all"]);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }
    setSaving(true);
    try {
      const body = {
        title: title.trim(),
        content: content.trim(),
        type,
        priority,
        published: true,
        target: { audience: targetAudience },
      };

      if (editAnnouncement) {
        const res = await fetch(`/api/announcements?id=${editAnnouncement.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("Failed to update");
        toast.success("Announcement updated");
      } else {
        const res = await fetch("/api/announcements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("Failed to create");
        toast.success("Announcement created");
      }
      setShowModal(false);
      fetchAnnouncements();
    } catch {
      toast.error("Failed to save announcement");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this announcement?")) return;
    try {
      const res = await fetch(`/api/announcements?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Announcement deleted");
      fetchAnnouncements();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 16px", borderRadius: "12px", backgroundColor: "#ffffff", border: "1px solid #e2e8f0", color: "#1a1a2e", fontSize: "13px", outline: "none" };
  const labelStyle: React.CSSProperties = { color: "#475569", fontSize: "13px", marginBottom: "6px", display: "block" };
  const btnStyle = (bg: string, disabled?: boolean): React.CSSProperties => ({
    padding: "8px 16px",
    borderRadius: "12px",
    backgroundColor: bg,
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: 500,
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
  });

  const statCardConfigs = [
    { label: "Total Announcements", value: stats.total, icon: Megaphone, gradient: "linear-gradient(135deg, #3b82f6, #2563eb)" },
    { label: "Published", value: stats.published, icon: Eye, gradient: "linear-gradient(135deg, #10b981, #059669)" },
    { label: "Drafts", value: stats.draft, icon: Edit, gradient: "linear-gradient(135deg, #f97316, #ea580c)" },
    { label: "Types", value: stats.types, icon: Users, gradient: "linear-gradient(135deg, #a855f7, #9333ea)" },
  ];

  const filterOptions = ["all", "published", "draft", "pinned"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ background: "linear-gradient(135deg, #0a2a6e, #0055ff)", borderRadius: "16px", padding: "32px", margin: "32px 16px 0", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-50%", right: "-20%", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "-30%", left: "-10%", width: "200px", height: "200px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)" }} />
        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ color: "#ffffff", fontSize: "24px", fontWeight: 700, marginBottom: "4px" }}>Announcements</h1>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px" }}>View and manage school announcements</p>
          </div>
          {canManage && (
            <button onClick={openCreate} style={{ padding: "10px 20px", borderRadius: "12px", backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#ffffff", fontSize: "13px", fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
              <Plus style={{ width: "16px", height: "16px" }} />
              New Announcement
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
                <stat.icon style={{ width: "24px", height: "24px", color: "#ffffff" }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px", margin: "0 16px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          <h3 style={{ color: "#1a1a2e", fontSize: "18px", fontWeight: 600 }}>All Announcements</h3>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <div style={{ position: "relative" }}>
              <Search style={{ width: "16px", height: "16px", position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
              <input
                type="text"
                placeholder="Search announcements..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                style={{ ...inputStyle, paddingLeft: "36px", width: "220px", borderColor: searchFocused ? "#0055ff" : "#e2e8f0" }}
              />
            </div>
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowFilter(!showFilter)}
                style={{ padding: "10px 12px", borderRadius: "12px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", color: "#475569", cursor: "pointer", display: "flex", alignItems: "center" }}
              >
                <Filter style={{ width: "16px", height: "16px" }} />
              </button>
              {showFilter && (
                <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", zIndex: 40, width: "176px", borderRadius: "12px", backgroundColor: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", padding: "4px" }}>
                  {filterOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => { setFilterStatus(opt); setShowFilter(false); }}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "10px 20px",
                        borderRadius: "8px",
                        fontSize: "13px",
                        textTransform: "capitalize",
                        border: "none",
                        cursor: "pointer",
                        backgroundColor: filterStatus === opt ? "rgba(0,85,255,0.1)" : "transparent",
                        color: filterStatus === opt ? "#0055ff" : "#475569",
                        fontWeight: filterStatus === opt ? 500 : 400,
                      }}
                    >
                      {opt === "all" ? "All" : opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0" }}>
            <Loader2 style={{ width: "32px", height: "32px", color: "#64748b", animation: "spin 1s linear infinite" }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#64748b" }}>
            <Megaphone style={{ width: "48px", height: "48px", margin: "0 auto 12px", opacity: 0.4 }} />
            <p style={{ fontSize: "13px" }}>No announcements found</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {paginated.map((announcement) => (
              <div key={announcement.id} style={{ padding: "16px", borderRadius: "12px", backgroundColor: "#f8fafc", transition: "background-color 0.15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f1f5f9")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {!announcement.published && <Pin style={{ width: "16px", height: "16px", color: "#94a3b8" }} />}
                    <h4 style={{ color: "#1a1a2e", fontSize: "14px", fontWeight: 500 }}>{announcement.title}</h4>
                  </div>
                  <span style={{
                    padding: "4px 8px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: 500,
                    backgroundColor: announcement.priority === "high" ? "#fee2e2" : announcement.priority === "medium" ? "rgba(249,115,22,0.15)" : "#f1f5f9",
                    color: announcement.priority === "high" ? "#dc2626" : announcement.priority === "medium" ? "#f97316" : "#64748b",
                  }}>
                    {announcement.priority}
                  </span>
                </div>
                <p style={{ color: "#475569", fontSize: "13px", marginBottom: "12px", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{announcement.content}</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "12px" }}>
                    <span style={{ color: "#64748b" }}>Type: {announcement.type}</span>
                    <span style={{
                      padding: "2px 6px",
                      borderRadius: "4px",
                      fontSize: "11px",
                      backgroundColor: announcement.published ? "#dcfce7" : "#f1f5f9",
                      color: announcement.published ? "#16a34a" : "#64748b",
                    }}>
                      {announcement.published ? "Published" : "Draft"}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Calendar style={{ width: "12px", height: "12px", color: "#94a3b8" }} />
                      <span style={{ color: "#94a3b8" }}>{new Date(announcement.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {!isReadOnly && (
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <button
                        onClick={() => openEdit(announcement)}
                        style={{ padding: "6px", borderRadius: "8px", backgroundColor: "transparent", border: "none", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center" }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f1f5f9"; e.currentTarget.style.color = "#1a1a2e"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#64748b"; }}
                      >
                        <Edit style={{ width: "16px", height: "16px" }} />
                      </button>
                      <button
                        onClick={() => handleDelete(announcement.id)}
                        style={{ padding: "6px", borderRadius: "8px", backgroundColor: "transparent", border: "none", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center" }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(220,38,38,0.1)"; e.currentTarget.style.color = "#dc2626"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#64748b"; }}
                      >
                        <Trash2 style={{ width: "16px", height: "16px" }} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {totalPages > 1 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "8px", paddingTop: "16px", borderTop: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "13px", color: "#64748b" }}>
                  Showing {((currentPage - 1) * ROWS_PER_PAGE) + 1}–{Math.min(currentPage * ROWS_PER_PAGE, filtered.length)} of {filtered.length}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", backgroundColor: "#ffffff", color: "#475569", fontSize: "13px", cursor: currentPage === 1 ? "not-allowed" : "pointer", opacity: currentPage === 1 ? 0.5 : 1 }}
                  >
                    Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        backgroundColor: currentPage === page ? "#0055ff" : "#ffffff",
                        color: currentPage === page ? "#ffffff" : "#475569",
                        fontSize: "13px",
                        fontWeight: currentPage === page ? 500 : 400,
                        cursor: "pointer",
                      }}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
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
              <h2 style={{ color: "#ffffff", fontSize: "18px", fontWeight: 600 }}>{editAnnouncement ? "Edit Announcement" : "New Announcement"}</h2>
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
                  placeholder="Enter title"
                />
              </div>
              <div>
                <label style={labelStyle}>Content *</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  style={{ ...inputStyle, resize: "none" }}
                  placeholder="Write content..."
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={labelStyle}>Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    style={{ ...inputStyle, colorScheme: "light" }}
                  >
                    <option value="general" style={{ background: "#ffffff", color: "#1a1a2e" }}>General</option>
                    <option value="academic" style={{ background: "#ffffff", color: "#1a1a2e" }}>Academic</option>
                    <option value="sports" style={{ background: "#ffffff", color: "#1a1a2e" }}>Sports</option>
                    <option value="admin" style={{ background: "#ffffff", color: "#1a1a2e" }}>Admin</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    style={{ ...inputStyle, colorScheme: "light" }}
                  >
                    <option value="low" style={{ background: "#ffffff", color: "#1a1a2e" }}>Low</option>
                    <option value="medium" style={{ background: "#ffffff", color: "#1a1a2e" }}>Medium</option>
                    <option value="high" style={{ background: "#ffffff", color: "#1a1a2e" }}>High</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Target Audience</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {["all", "students", "parents", "teachers", "staff"].map((aud) => {
                    const active = targetAudience.includes(aud);
                    return (
                      <button
                        key={aud}
                        onClick={() => {
                          if (aud === "all") {
                            setTargetAudience(["all"]);
                          } else {
                            const next = targetAudience.filter(a => a !== "all");
                            if (next.includes(aud)) {
                              setTargetAudience(next.filter(a => a !== aud));
                            } else {
                              setTargetAudience([...next, aud]);
                            }
                          }
                        }}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "8px",
                          fontSize: "12px",
                          fontWeight: 500,
                          cursor: "pointer",
                          backgroundColor: active ? "rgba(0,85,255,0.1)" : "#f8fafc",
                          color: active ? "#0055ff" : "#64748b",
                          border: `1px solid ${active ? "rgba(0,85,255,0.3)" : "#e2e8f0"}`,
                        }}
                      >
                        {aud.charAt(0).toUpperCase() + aud.slice(1)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div style={{ padding: "16px 24px", borderTop: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "12px" }}>
              <button onClick={() => setShowModal(false)} style={btnStyle("#f1f5f9", false)}>
                <span style={{ color: "#475569" }}>Cancel</span>
              </button>
              <button onClick={handleSave} disabled={saving} style={btnStyle("#0055ff", saving)}>
                {saving && <Loader2 style={{ width: "16px", height: "16px", animation: "spin 1s linear infinite" }} />}
                {editAnnouncement ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AnnouncementsPage() {
  return (
    <Suspense fallback={<div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0" }}><Loader2 style={{ width: "32px", height: "32px", color: "#64748b", animation: "spin 1s linear infinite" }} /></div>}>
      <AnnouncementsPageInner />
    </Suspense>
  );
}
