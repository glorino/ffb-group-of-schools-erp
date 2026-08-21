"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
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

export default function EventsPage() {
  const { data: session } = useSession();
  const userRoles: string[] = (session?.user as any)?.roles?.map((r: any) => r.name) || [];
  const canManage = userRoles.some(r => ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"].includes(r));

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<EventItem | null>(null);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState("");
  const [featured, setFeatured] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/announcements");
      const data = await res.json();
      const items = (data.announcements || data || []).filter((a: any) => a.type === "event");
      setEvents(items);
    } catch {
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const filtered = events.filter(e =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.content.toLowerCase().includes(search.toLowerCase())
  );

  const now = new Date();
  const stats = {
    total: events.length,
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
        content: content.trim(),
        type: "event",
        priority: "medium",
        published: true,
        target: {
          eventDate,
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
        toast.success("Event updated");
      } else {
        const res = await fetch("/api/announcements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("Failed to create");
        toast.success("Event created");
      }
      setShowModal(false);
      fetchEvents();
    } catch {
      toast.error("Failed to save event");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    try {
      const res = await fetch(`/api/announcements?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Event deleted");
      fetchEvents();
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#1a1a2e] text-2xl font-bold">Events Management</h1>
          <p className="text-[#64748b] text-sm mt-1">Create and manage school events and activities</p>
        </div>
        {canManage && (
          <button onClick={openCreate} className="btn btn-primary">
            <Plus className="w-4 h-4" />
            New Event
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Events", value: stats.total, color: "from-emerald-500 to-emerald-600" },
          { label: "Upcoming", value: stats.upcoming, color: "from-blue-500 to-blue-600" },
          { label: "Past", value: stats.past, color: "from-[#94a3b8] to-[#64748b]" },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="card shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[#64748b] text-[13px] mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-[#1a1a2e]">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[#1a1a2e] font-semibold text-lg">All Events</h3>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl bg-[#ffffff] border border-[#e2e8f0] text-[#1a1a2e] text-[13px] focus:outline-none focus:border-[var(--primary)]"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#64748b] animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-[#64748b]">
            <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-[13px]">No events found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => {
              const eventDate = item.target?.eventDate;
              const dateObj = eventDate ? new Date(eventDate) : null;
              const day = dateObj ? dateObj.getDate() : "–";
              const month = dateObj ? MONTHS[dateObj.getMonth()] : "–";
              const img = item.target?.imageUrl;
              return (
                <div key={item.id} className="flex items-start gap-4 p-4 rounded-xl bg-[#f8fafc] hover:bg-[#f1f5f9] transition-all">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500/30 to-emerald-600/30 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[#16a34a] text-[18px] font-bold leading-none">{day}</span>
                    <span className="text-[#16a34a]/70 text-[10px] uppercase">{month}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-[#1a1a2e] font-medium text-[14px] truncate">{item.title}</h4>
                      {item.target?.featured && (
                        <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-[#ca8a04] text-[11px] font-medium shrink-0">Featured</span>
                      )}
                    </div>
                    <p className="text-[#64748b] text-[13px] line-clamp-1 mb-1">{item.content}</p>
                    {eventDate && (
                      <div className="flex items-center gap-1 text-[#94a3b8] text-[12px]">
                        <Clock className="w-3 h-3" />
                        {formatDate(eventDate)}
                      </div>
                    )}
                  </div>
                  {img && (
                    <div className="w-20 h-14 rounded-lg overflow-hidden shrink-0 hidden sm:block">
                      <img src={img} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    </div>
                  )}
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-[#f1f5f9] text-[#64748b] hover:text-[#1a1a2e] transition-all">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-[#64748b] hover:text-[#dc2626] transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {showModal && (
        <div className="modal-overlay">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="modal-content shadow-sm">
            <div className="modal-header">
              <h3 className="text-[#1a1a2e] font-semibold text-lg">{editItem ? "Edit Event" : "New Event"}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-[#f1f5f9] text-[#64748b] hover:text-[#1a1a2e]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[#475569] text-[13px] mb-1.5">Title *</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-5 py-2.5 rounded-xl bg-[#ffffff] border border-[#e2e8f0] text-[#1a1a2e] text-[13px] focus:outline-none focus:border-[var(--primary)]" placeholder="Enter event title" />
              </div>
              <div>
                <label className="block text-[#475569] text-[13px] mb-1.5">Content *</label>
                <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={3} className="w-full px-5 py-2.5 rounded-xl bg-[#ffffff] border border-[#e2e8f0] text-[#1a1a2e] text-[13px] focus:outline-none focus:border-[var(--primary)] resize-none" placeholder="Write event description..." />
              </div>
              <div>
                <label className="block text-[#475569] text-[13px] mb-1.5">Event Date *</label>
                <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="w-full px-5 py-2.5 rounded-xl bg-[#ffffff] border border-[#e2e8f0] text-[#1a1a2e] text-[13px] focus:outline-none focus:border-[var(--primary)]" style={{ colorScheme: "light" }} />
              </div>
              <div>
                <label className="block text-[#475569] text-[13px] mb-1.5">Event Image</label>
                <div className="flex gap-3">
                  <input type="text" value={imageUrl} onChange={(e) => { setImageUrl(e.target.value); setImageFile(""); }} placeholder="Image URL" className="flex-1 px-5 py-2.5 rounded-xl bg-[#ffffff] border border-[#e2e8f0] text-[#1a1a2e] text-[13px] focus:outline-none focus:border-[var(--primary)]" />
                  <label className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#f8fafc] border border-dashed border-[#e2e8f0] text-[#64748b] text-[13px] cursor-pointer hover:bg-[#f1f5f9]">
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
              <label className="flex items-center gap-2 text-[#475569] text-[13px] cursor-pointer">
                <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="rounded border-[#e2e8f0]" />
                Mark as featured
              </label>
            </div>

            <div className="modal-footer">
              <button onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn btn-primary disabled:opacity-50 flex items-center gap-2">
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
