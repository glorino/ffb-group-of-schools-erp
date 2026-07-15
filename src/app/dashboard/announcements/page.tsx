"use client";

import { motion } from "framer-motion";
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
} from "lucide-react";

const announcements = [
  { id: 1, title: "Mid-Term Examination Schedule", content: "Mid-term examinations will begin on January 20th. All students are advised to prepare adequately.", author: "Principal", audience: "All Students", date: "Jan 15, 2025", priority: "high", views: 2847, pinned: true },
  { id: 2, title: "Parent-Teacher Meeting", content: "Parents are invited for a meeting on January 22nd to discuss student progress.", author: "Vice Principal", audience: "Parents", date: "Jan 14, 2025", priority: "medium", views: 1200, pinned: false },
  { id: 3, title: "School Sports Day", content: "Annual sports day will hold on January 25th. All houses should prepare.", author: "Sports Master", audience: "All Students", date: "Jan 13, 2025", priority: "low", views: 2100, pinned: false },
  { id: 4, title: "Fee Payment Deadline", content: "All outstanding fees must be paid before January 31st to avoid examination malpractice.", author: "Bursar", audience: "Parents", date: "Jan 12, 2025", priority: "high", views: 1800, pinned: true },
];

const stats = [
  { label: "Total Announcements", value: "48", icon: Megaphone, color: "from-blue-500 to-blue-600" },
  { label: "Published", value: "42", icon: Eye, color: "from-emerald-500 to-emerald-600" },
  { label: "Drafts", value: "6", icon: Edit, color: "from-orange-500 to-orange-600" },
  { label: "Total Views", value: "15.2K", icon: Users, color: "from-purple-500 to-purple-600" },
];

export default function AnnouncementsPage() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-gradient-to-r from-[var(--primary)]/20 to-[var(--accent)]/10 border-[var(--primary)]/20"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Announcements</h1>
            <p className="text-white/60">
              Create and manage school-wide announcements and notifications
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-all">
            <Plus className="w-4 h-4" />
            New Announcement
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/50 text-sm mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-semibold text-lg">All Announcements</h3>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Search announcements..."
                className="pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
            <button className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="p-4 rounded-xl bg-white/5 hover:bg-white/8 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {announcement.pinned && <Pin className="w-4 h-4 text-[var(--accent)]" />}
                  <h4 className="text-white font-medium">{announcement.title}</h4>
                </div>
                <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                  announcement.priority === "high" ? "bg-red-500/20 text-red-400" :
                  announcement.priority === "medium" ? "bg-orange-500/20 text-orange-400" :
                  "bg-white/10 text-white/40"
                }`}>
                  {announcement.priority}
                </span>
              </div>
              <p className="text-white/60 text-sm mb-3">{announcement.content}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-white/40">By: {announcement.author}</span>
                  <span className="text-white/40">To: {announcement.audience}</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-white/30" />
                    <span className="text-white/30">{announcement.date}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white/30 text-xs">{announcement.views} views</span>
                  <button className="p-1 rounded-lg hover:bg-white/10 text-white/40">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-1 rounded-lg hover:bg-white/10 text-white/40">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
