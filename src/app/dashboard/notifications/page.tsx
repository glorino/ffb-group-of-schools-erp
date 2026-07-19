"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  GraduationCap,
  CreditCard,
  AlertTriangle,
  Settings,
  Check,
  Trash2,
  Filter,
  Inbox,
  Loader2,
} from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "sonner";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "academic" | "finance" | "system" | "warning";
  read: boolean;
  createdAt: string;
}

type FilterType = "all" | "unread" | "academic" | "finance" | "system";

const iconMap: Record<string, typeof GraduationCap> = {
  academic: GraduationCap,
  finance: CreditCard,
  system: Settings,
  warning: AlertTriangle,
};

const colorMap: Record<string, string> = {
  academic: "text-blue-400 bg-blue-500/20",
  finance: "text-emerald-400 bg-emerald-500/20",
  system: "text-purple-400 bg-purple-500/20",
  warning: "text-orange-400 bg-orange-500/20",
};

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay > 1) return `${diffDay} days ago`;
  if (diffDay === 1) return "1 day ago";
  if (diffHr > 1) return `${diffHr} hours ago`;
  if (diffHr === 1) return "1 hour ago";
  if (diffMin > 1) return `${diffMin} min ago`;
  return "Just now";
}

function dateLabel(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long" });
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setNotifications(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch {
      toast.error("Failed to load notifications");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const filters: { label: string; value: FilterType }[] = [
    { label: "All", value: "all" },
    { label: "Unread", value: "unread" },
    { label: "Academic", value: "academic" },
    { label: "Finance", value: "finance" },
    { label: "System", value: "system" },
  ];

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.read;
    return n.type === filter;
  });

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, read: true }),
      });
      if (!res.ok) throw new Error("Failed");
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      toast.error("Failed to mark as read");
    }
  };

  const markAllRead = async () => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error("Failed");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const grouped = filteredNotifications.reduce(
    (acc, n) => {
      const label = dateLabel(n.createdAt);
      (acc[label] = acc[label] || []).push(n);
      return acc;
    },
    {} as Record<string, Notification[]>
  );

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Notifications" }]} />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          <p className="text-white/50 text-sm mt-1">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
              : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-all"
          >
            <Check className="w-4 h-4" />
            Mark all as read
          </button>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              filter === f.value
                ? "bg-[var(--primary)] text-white"
                : "bg-white/[0.04] text-white/50 hover:text-white hover:bg-white/[0.08]"
            }`}
          >
            {f.label}
            {f.value === "unread" && unreadCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px]">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-white/40 animate-spin" />
        </div>
      ) : filteredNotifications.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No notifications"
          description={
            filter === "all"
              ? "You're all caught up! No notifications to display."
              : `No ${filter} notifications found.`
          }
        />
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              <h3 className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">
                {date}
              </h3>
              <div className="space-y-2">
                <AnimatePresence>
                  {items.map((n) => {
                    const Icon = iconMap[n.type] || Settings;
                    return (
                      <motion.div
                        key={n.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className={`bg-white/[0.04] backdrop-blur-xl rounded-xl border border-white/[0.08] flex items-start gap-4 py-4 px-4 ${
                          !n.read
                            ? "border-l-2 border-l-[var(--accent)]"
                            : ""
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorMap[n.type]}`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-white font-medium text-[13px]">
                                {n.title}
                              </p>
                              <p className="text-white/60 text-[13px] mt-0.5">
                                {n.message}
                              </p>
                            </div>
                            <span className="text-white/30 text-[12px] whitespace-nowrap">
                              {timeAgo(n.createdAt)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            {!n.read && (
                              <button
                                onClick={() => markAsRead(n.id)}
                                className="flex items-center gap-1 text-[var(--accent)] text-[12px] hover:underline"
                              >
                                <Check className="w-3 h-3" />
                                Mark as read
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(n.id)}
                              className="flex items-center gap-1 text-white/30 text-[12px] hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
