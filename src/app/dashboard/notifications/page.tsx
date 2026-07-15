"use client";

import { useState } from "react";
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
} from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { EmptyState } from "@/components/ui/empty-state";

interface Notification {
  id: string;
  title: string;
  description: string;
  type: "academic" | "finance" | "system" | "warning";
  read: boolean;
  time: string;
  date: string;
}

type FilterType = "all" | "unread" | "academic" | "finance" | "system";

const iconMap = {
  academic: GraduationCap,
  finance: CreditCard,
  system: Settings,
  warning: AlertTriangle,
};

const colorMap = {
  academic: "text-blue-400 bg-blue-500/20",
  finance: "text-emerald-400 bg-emerald-500/20",
  system: "text-purple-400 bg-purple-500/20",
  warning: "text-orange-400 bg-orange-500/20",
};

const initialNotifications: Notification[] = [
  { id: "1", title: "New admission application", description: "Chidi Okonkwo applied for JSS1. Please review the application and supporting documents.", type: "academic", read: false, time: "5 min ago", date: "Today" },
  { id: "2", title: "Fee payment received", description: "Amina Mohammed (SS2A) paid ₦125,000 for second term fees.", type: "finance", read: false, time: "12 min ago", date: "Today" },
  { id: "3", title: "System maintenance scheduled", description: "The system will undergo maintenance tonight from 2:00 AM to 4:00 AM.", type: "system", read: true, time: "1 hour ago", date: "Today" },
  { id: "4", title: "Low attendance alert", description: "SS2B attendance dropped below 70% threshold. Immediate action required.", type: "warning", read: false, time: "2 hours ago", date: "Today" },
  { id: "5", title: "Examination results published", description: "SS3 Mathematics results have been published and are now visible to parents.", type: "academic", read: true, time: "3 hours ago", date: "Today" },
  { id: "6", title: "Salary payment processed", description: "Monthly salaries for January have been processed successfully.", type: "finance", read: true, time: "5 hours ago", date: "Today" },
  { id: "7", title: "New teacher registration", description: "Mr. Emeka Obi has been registered in the system.", type: "academic", read: true, time: "1 day ago", date: "Yesterday" },
  { id: "8", title: "Hostel allocation update", description: "Block A, Room 12 has been allocated to 3 new students.", type: "system", read: true, time: "1 day ago", date: "Yesterday" },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState<FilterType>("all");

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

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const grouped = filteredNotifications.reduce(
    (acc, n) => {
      (acc[n.date] = acc[n.date] || []).push(n);
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
                : "bg-white/5 text-white/50 hover:text-white hover:bg-white/10"
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

      {filteredNotifications.length === 0 ? (
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
                    const Icon = iconMap[n.type];
                    return (
                      <motion.div
                        key={n.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className={`card flex items-start gap-4 py-4 ${
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
                              <p className="text-white font-medium text-sm">
                                {n.title}
                              </p>
                              <p className="text-white/40 text-sm mt-0.5">
                                {n.description}
                              </p>
                            </div>
                            <span className="text-white/30 text-xs whitespace-nowrap">
                              {n.time}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            {!n.read && (
                              <button
                                onClick={() => markAsRead(n.id)}
                                className="flex items-center gap-1 text-[var(--accent)] text-xs hover:underline"
                              >
                                <Check className="w-3 h-3" />
                                Mark as read
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(n.id)}
                              className="flex items-center gap-1 text-white/30 text-xs hover:text-red-400 transition-colors"
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
