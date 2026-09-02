"use client";

import { Suspense, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Newspaper,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  X,
  Loader2,
  Star,
} from "lucide-react";
import { toast } from "sonner";

interface NewsItem {
  id: string;
  title: string;
  content: string;
  type: string;
  priority: string;
  published: boolean;
  createdAt: string;
  target?: any;
}

const ROWS_PER_PAGE = 20;

function NewsPageInner() {
  const { data: session } = useSession();
  const userRoles: string[] = (session?.user as any)?.roles?.map((r: any) => r.name) || [];
  const canManage = userRoles.some(r => ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"].includes(r));

  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<NewsItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchFocused, setSearchFocused] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState("");
  const [featured, setFeatured] = useState(false);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/news");
      const data = await res.json();
      const items = (data.announcements || []).map((a: any) => ({
        id: a.id,
        title: a.title,
        content: a.content,
        type: a.type || "news",
        priority: a.priority || "medium",
        published: a.published,
        createdAt: a.createdAt,
        target: typeof a.target === "string" ? JSON.parse(a.target) : a.target,
      }));
      setNews(items);
    } catch {
      toast.error("Failed to load news");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNews(); }, []);

  const filtered = news.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

  useEffect(() => { setCurrentPage(1); }, [search]);

  const stats = {
    total: news.length,
    published: news.filter(n => n.published).length,
    featured: news.filter(n => n.target?.featured).length,
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
    setImageUrl("");
    setImageFile("");
    setFeatured(false);
    setShowModal(true);
  };

  const openEdit = (item: NewsItem) => {
    setEditItem(item);
    setTitle(item.title);
    setContent(item.content);
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
    setSaving(true);
    try {
      const body: any = {
        title: title.trim(),
        content: content.trim(),
        type: "news",
        priority: "medium",
        published: true,
        target: {
          imageUrl: imageFile || imageUrl || "",
          featured,
          audience: ["all"],
        },
      };

      if (editItem) {
        const res = await fetch(`/api/news?id=${editItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("Failed to update");
        toast.success("News updated");
      } else {
        const res = await fetch("/api/news", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("Failed to create");
        toast.success("News created");
      }
      setShowModal(false);
      fetchNews();
    } catch {
      toast.error("Failed to save news");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this news article?")) return;
    try {
      const res = await fetch(`/api/news?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("News deleted");
      fetchNews();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const inputStyle: React.CSSProperties = { width: "100%", padding: "12px", borderRadius: "10px", backgroundColor: "#ffffff", border: "2px solid #e5e7eb", color: "#1a1a2e", fontSize: "13px", outline: "none" };
  const labelStyle: React.CSSProperties = { color: "#475569", fontSize: "13px", marginBottom: "6px", display: "block" };
  const btnStyle = (bg: string, disabled?: boolean): React.CSSProperties => ({
    padding: "10px 20px",
    borderRadius: "10px",
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
    { label: "Total News", value: stats.total, icon: Newspaper, gradient: "linear-gradient(135deg, #3b82f6, #2563eb)" },
    { label: "Published", value: stats.published, icon: Eye, gradient: "linear-gradient(135deg, #10b981, #059669)" },
    { label: "Featured", value: stats.featured, icon: Star, gradient: "linear-gradient(135deg, #a855f7, #9333ea)" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ background: "linear-gradient(135deg, #0a2a6e, #0055ff)", borderRadius: "16px", padding: "32px", margin: "32px 16px 0", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-50%", right: "-20%", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "-30%", left: "-10%", width: "200px", height: "200px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)" }} />
        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ color: "#ffffff", fontSize: "24px", fontWeight: 700, marginBottom: "4px" }}>News Management</h1>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px" }}>Create and manage school news articles</p>
          </div>
          {canManage && (
            <button onClick={openCreate} style={{ padding: "10px 20px", borderRadius: "12px", backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#ffffff", fontSize: "13px", fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
              <Plus style={{ width: "16px", height: "16px" }} />
              New News
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
          <h3 style={{ color: "#1a1a2e", fontSize: "18px", fontWeight: 600 }}>All News</h3>
          <div style={{ position: "relative" }}>
            <Search style={{ width: "16px", height: "16px", position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
            <input
              type="text"
              placeholder="Search news..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={{ ...inputStyle, paddingLeft: "36px", width: "220px", borderColor: searchFocused ? "#0055ff" : "#e5e7eb" }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0" }}>
            <Loader2 style={{ width: "32px", height: "32px", color: "#64748b", animation: "spin 1s linear infinite" }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#64748b" }}>
            <Newspaper style={{ width: "48px", height: "48px", margin: "0 auto 12px", opacity: 0.4 }} />
            <p style={{ fontSize: "13px" }}>No news articles found</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
              {paginated.map((item) => {
                const img = item.target?.imageUrl;
                return (
                  <div
                    key={item.id}
                    style={{ borderRadius: "12px", backgroundColor: "#f8fafc", overflow: "hidden", border: "1px solid #e2e8f0", transition: "background-color 0.15s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f1f5f9")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                  >
                    {img && (
                      <div style={{ height: "160px", backgroundColor: "#f8fafc", overflow: "hidden" }}>
                        <img
                          src={img}
                          alt={item.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      </div>
                    )}
                    <div style={{ padding: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                        {item.target?.featured && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "4px 10px", borderRadius: "20px", backgroundColor: "rgba(234,179,8,0.15)", color: "#ca8a04", fontSize: "11px", fontWeight: 600 }}>
                            <Star style={{ width: "12px", height: "12px" }} /> Featured
                          </span>
                        )}
                        <span style={{
                          padding: "4px 12px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: 600,
                          backgroundColor: item.published ? "#dcfce7" : "#f1f5f9",
                          color: item.published ? "#16a34a" : "#64748b",
                        }}>
                          {item.published ? "Published" : "Draft"}
                        </span>
                      </div>
                      <h4 style={{ color: "#1a1a2e", fontSize: "14px", fontWeight: 500, marginBottom: "8px" }}>{item.title}</h4>
                      <p style={{ color: "#64748b", fontSize: "13px", marginBottom: "12px", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{item.content}</p>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ color: "#94a3b8", fontSize: "12px" }}>{new Date(item.createdAt).toLocaleDateString()}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <button
                            onClick={() => openEdit(item)}
                            style={{ padding: "6px", borderRadius: "8px", backgroundColor: "transparent", border: "none", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center" }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f1f5f9"; e.currentTarget.style.color = "#1a1a2e"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#64748b"; }}
                          >
                            <Edit style={{ width: "16px", height: "16px" }} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            style={{ padding: "6px", borderRadius: "8px", backgroundColor: "transparent", border: "none", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center" }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(220,38,38,0.1)"; e.currentTarget.style.color = "#dc2626"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#64748b"; }}
                          >
                            <Trash2 style={{ width: "16px", height: "16px" }} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

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
          <div style={{ width: "100%", maxWidth: "560px", backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <div style={{ background: "linear-gradient(135deg, #0a2a6e, #0055ff)", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ color: "#ffffff", fontSize: "18px", fontWeight: 600 }}>{editItem ? "Edit News" : "New News"}</h2>
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
                  placeholder="Enter news title"
                />
              </div>
              <div>
                <label style={labelStyle}>Content *</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  style={{ ...inputStyle, resize: "none" }}
                  placeholder="Write news content..."
                />
              </div>
              <div>
                <label style={labelStyle}>Featured Image</label>
                <div style={{ display: "flex", gap: "12px" }}>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => { setImageUrl(e.target.value); setImageFile(""); }}
                    placeholder="Image URL"
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  <label
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "12px 20px", borderRadius: "10px", backgroundColor: "#f8fafc", border: "2px dashed #e5e7eb", color: "#64748b", fontSize: "13px", cursor: "pointer" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f1f5f9")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                  >
                    <svg style={{ width: "16px", height: "16px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    Upload
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />
                  </label>
                </div>
                {(imageFile || imageUrl) && (
                  <div style={{ marginTop: "8px", position: "relative", display: "inline-block" }}>
                    <img src={imageFile || imageUrl} alt="Preview" style={{ height: "80px", borderRadius: "8px", objectFit: "cover" }} />
                    <button
                      onClick={() => { setImageFile(""); setImageUrl(""); }}
                      style={{ position: "absolute", top: "-4px", right: "-4px", padding: "4px", borderRadius: "50%", backgroundColor: "#dc2626", color: "#ffffff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <X style={{ width: "12px", height: "12px" }} />
                    </button>
                  </div>
                )}
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", color: "#475569", fontSize: "13px", cursor: "pointer" }}>
                <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} style={{ borderRadius: "4px", accentColor: "#0055ff" }} />
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

export default function NewsPage() {
  return (
    <Suspense fallback={<div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0" }}><Loader2 style={{ width: "32px", height: "32px", color: "#64748b", animation: "spin 1s linear infinite" }} /></div>}>
      <NewsPageInner />
    </Suspense>
  );
}
