"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
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

export default function NewsPage() {
  const { data: session } = useSession();
  const userRoles: string[] = (session?.user as any)?.roles?.map((r: any) => r.name) || [];
  const canManage = userRoles.some(r => ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"].includes(r));

  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<NewsItem | null>(null);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState("");
  const [featured, setFeatured] = useState(false);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/announcements");
      const data = await res.json();
      const items = (data.announcements || data || []).filter((a: any) => a.type === "news");
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
        const res = await fetch(`/api/announcements?id=${editItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("Failed to update");
        toast.success("News updated");
      } else {
        const res = await fetch("/api/announcements", {
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
      const res = await fetch(`/api/announcements?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("News deleted");
      fetchNews();
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold">News Management</h1>
          <p className="text-white/50 text-sm mt-1">Create and manage school news articles</p>
        </div>
        {canManage && (
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all">
            <Plus className="w-4 h-4" />
            New News
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total News", value: stats.total, color: "from-blue-500 to-blue-600" },
          { label: "Published", value: stats.published, color: "from-emerald-500 to-emerald-600" },
          { label: "Featured", value: stats.featured, color: "from-purple-500 to-purple-600" },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/50 text-[13px] mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <Newspaper className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-semibold text-lg">All News</h3>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Search news..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-white/40">
            <Newspaper className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-[13px]">No news articles found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item) => {
              const img = item.target?.imageUrl;
              return (
                <div key={item.id} className="rounded-xl bg-white/[0.04] hover:bg-white/[0.08] transition-all overflow-hidden">
                  {img && (
                    <div className="h-40 bg-white/[0.04] overflow-hidden">
                      <img src={img} alt={item.title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {item.target?.featured && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-[11px] font-medium">
                          <Star className="w-3 h-3" /> Featured
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${item.published ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-white/40"}`}>
                        {item.published ? "Published" : "Draft"}
                      </span>
                    </div>
                    <h4 className="text-white font-medium text-[14px] mb-2">{item.title}</h4>
                    <p className="text-white/50 text-[13px] line-clamp-2 mb-3">{item.content}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-white/30 text-[12px]">{new Date(item.createdAt).toLocaleDateString()}</span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-white/[0.08] text-white/40 hover:text-white transition-all">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg rounded-2xl bg-[#0a1628] border border-white/[0.12] shadow-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-semibold text-lg">{editItem ? "Edit News" : "New News"}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-white/[0.08] text-white/40">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white/60 text-[13px] mb-1.5">Title *</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-blue-500" placeholder="Enter news title" />
              </div>
              <div>
                <label className="block text-white/60 text-[13px] mb-1.5">Content *</label>
                <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4} className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-blue-500 resize-none" placeholder="Write news content..." />
              </div>
              <div>
                <label className="block text-white/60 text-[13px] mb-1.5">Featured Image</label>
                <div className="flex gap-2">
                  <input type="text" value={imageUrl} onChange={(e) => { setImageUrl(e.target.value); setImageFile(""); }} placeholder="Image URL" className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[13px] focus:outline-none focus:border-blue-500" />
                  <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-dashed border-white/[0.15] text-white/50 text-[13px] cursor-pointer hover:bg-white/[0.08]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    Upload
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>
                {(imageFile || imageUrl) && (
                  <div className="mt-2 relative inline-block">
                    <img src={imageFile || imageUrl} alt="Preview" className="h-20 rounded-lg object-cover" />
                    <button onClick={() => { setImageFile(""); setImageUrl(""); }} className="absolute -top-1 -right-1 p-1 rounded-full bg-red-500 text-white">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
              <label className="flex items-center gap-2 text-white/60 text-[13px] cursor-pointer">
                <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="rounded border-white/20" />
                Mark as featured
              </label>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/60 text-sm hover:bg-white/[0.08]">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 flex items-center gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editItem ? "Update" : "Create"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
