"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  GraduationCap,
  CreditCard,
  AlertTriangle,
  Settings,
  Check,
  Trash2,
} from "lucide-react";

interface Notification {
  id: string;
  title: string;
  description: string;
  type: "academic" | "finance" | "system" | "warning";
  read: boolean;
  time: string;
}

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

const sampleNotifications: Notification[] = [
  {
    id: "1",
    title: "New admission application",
    description: "Chidi Okonkwo applied for JSS1",
    type: "academic",
    read: false,
    time: "5m ago",
  },
  {
    id: "2",
    title: "Fee payment received",
    description: "Amina Mohammed paid ₦125,000",
    type: "finance",
    read: false,
    time: "12m ago",
  },
  {
    id: "3",
    title: "System update scheduled",
    description: "Maintenance tonight at 2 AM",
    type: "system",
    read: true,
    time: "1h ago",
  },
  {
    id: "4",
    title: "Low attendance alert",
    description: "SS2B attendance below 70%",
    type: "warning",
    read: false,
    time: "2h ago",
  },
];

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(sampleNotifications);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1"
          >
            {unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            className="absolute right-0 top-14 w-80 card py-0 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <h3 className="text-white font-semibold text-sm">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[var(--accent)] text-xs hover:underline flex items-center gap-1"
                >
                  <Check className="w-3 h-3" />
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-white/40 text-sm">
                  No notifications
                </div>
              ) : (
                notifications.map((n) => {
                  const Icon = iconMap[n.type];
                  return (
                    <div
                      key={n.id}
                      className={`flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-all ${
                        !n.read ? "bg-white/[0.03]" : ""
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colorMap[n.type]}`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">
                          {n.title}
                        </p>
                        <p className="text-white/40 text-xs truncate">
                          {n.description}
                        </p>
                        <p className="text-white/30 text-[10px] mt-1">
                          {n.time}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {!n.read && (
                          <button
                            onClick={() => markAsRead(n.id)}
                            className="text-white/30 hover:text-[var(--accent)] transition-colors"
                            title="Mark as read"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => removeNotification(n.id)}
                          className="text-white/30 hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="border-t border-white/10 px-4 py-2.5">
              <a
                href="/dashboard/notifications"
                className="text-[var(--accent)] text-xs hover:underline block text-center"
              >
                View all notifications
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
