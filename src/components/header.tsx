"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Moon,
  Sun,
  X,
  Sparkles,
  Clock,
  FileText,
  MessageSquare,
} from "lucide-react";
import { useTheme } from "@/providers/theme-provider";
import { signOut } from "next-auth/react";

const quickLinks = [
  { label: "My Profile", href: "/dashboard/profile", icon: User },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const name = session?.user?.name || "Admin";
  const email = session?.user?.email || "admin@ffb.edu.ng";
  const initials = name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) searchInputRef.current.focus();
  }, [searchOpen]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotificationsOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const breadcrumbs = pathname
    .split("/")
    .filter(Boolean)
    .filter((p) => p !== "dashboard")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, " "));

  const notifications = [
    { id: 1, title: "New Admission Request", desc: "Chidinma Okafor submitted an application", time: "5m ago", type: "admission", read: false },
    { id: 2, title: "Fee Payment Received", desc: "₦245,000 from Adewale Family", time: "12m ago", type: "payment", read: false },
    { id: 3, title: "Exam Results Ready", desc: "JSS3 First Term results pending approval", time: "1h ago", type: "exam", read: true },
    { id: 4, title: "PTA Meeting Reminder", desc: "Scheduled for tomorrow at 2:00 PM", time: "2h ago", type: "event", read: true },
    { id: 5, title: "Low Inventory Alert", desc: "Science lab supplies below threshold", time: "3h ago", type: "alert", read: true },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-white/[0.03] backdrop-blur-2xl border-b border-white/[0.06]">
        <div className="h-full px-4 lg:px-6 flex items-center gap-4">
          <div className="flex-1 flex items-center gap-3">
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/30 text-sm w-full max-w-md hover:bg-white/[0.08] hover:border-white/[0.12] transition-all"
            >
              <Search className="w-4 h-4" />
              <span className="flex-1 text-left">Search anything...</span>
              <kbd className="hidden md:inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-white/[0.06] text-white/25 text-[10px] font-mono border border-white/[0.08]">
                ⌘K
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white/35 hover:text-white/70 hover:bg-white/[0.06] transition-all"
            >
              {theme === "dark" ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
            </button>

            <div ref={notifRef} className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white/35 hover:text-white/70 hover:bg-white/[0.06] transition-all relative"
              >
                <Bell className="w-[18px] h-[18px]" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[var(--accent)] text-[var(--blue-1)] text-[9px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    className="absolute right-0 top-12 w-[360px] rounded-2xl bg-[var(--sidebar)]/95 backdrop-blur-3xl border border-white/[0.08] shadow-2xl shadow-black/40 overflow-hidden"
                  >
                    <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
                      <h3 className="text-white font-semibold text-sm">Notifications</h3>
                      <span className="text-[10px] text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-0.5 rounded-full font-medium">{unreadCount} new</span>
                    </div>
                    <div className="max-h-[320px] overflow-y-auto">
                      {notifications.map((n) => (
                        <div key={n.id} className={`px-4 py-3 border-b border-white/[0.04] hover:bg-white/[0.04] transition cursor-pointer ${!n.read ? "bg-white/[0.02]" : ""}`}>
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              n.type === "payment" ? "bg-emerald-500/15 text-emerald-400" :
                              n.type === "admission" ? "bg-blue-500/15 text-blue-400" :
                              n.type === "exam" ? "bg-amber-500/15 text-amber-400" :
                              n.type === "event" ? "bg-purple-500/15 text-purple-400" :
                              "bg-red-500/15 text-red-400"
                            }`}>
                              {n.type === "payment" ? <CreditCardIcon /> :
                               n.type === "admission" ? <FileText className="w-4 h-4" /> :
                               n.type === "exam" ? <Sparkles className="w-4 h-4" /> :
                               n.type === "event" ? <Clock className="w-4 h-4" /> :
                               <Bell className="w-4 h-4" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white/90 text-[13px] font-medium leading-tight">{n.title}</p>
                              <p className="text-white/35 text-[11px] mt-0.5 truncate">{n.desc}</p>
                              <p className="text-white/20 text-[10px] mt-1">{n.time}</p>
                            </div>
                            {!n.read && <div className="w-2 h-2 rounded-full bg-[var(--accent)] mt-2 flex-shrink-0" />}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 border-t border-white/[0.06]">
                      <button className="w-full py-2 rounded-xl bg-white/[0.05] text-white/40 text-[12px] font-medium hover:bg-white/[0.08] transition">
                        View all notifications
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div ref={profileRef} className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-white/[0.06] transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--blue-3)] to-[var(--blue-1)] flex items-center justify-center text-white text-[11px] font-bold border border-white/10">
                  {initials}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-white/90 text-[13px] font-medium leading-tight">{name}</p>
                  <p className="text-white/30 text-[10px]">Administrator</p>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-white/30 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    className="absolute right-0 top-12 w-[220px] rounded-2xl bg-[var(--sidebar)]/95 backdrop-blur-3xl border border-white/[0.08] shadow-2xl shadow-black/40 overflow-hidden"
                  >
                    <div className="p-3 border-b border-white/[0.06]">
                      <p className="text-white/90 text-sm font-medium">{name}</p>
                      <p className="text-white/30 text-[11px]">{email}</p>
                    </div>
                    <div className="p-1.5">
                      {quickLinks.map((link) => (
                        <button
                          key={link.href}
                          onClick={() => { router.push(link.href); setProfileOpen(false); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-white/45 hover:text-white/80 hover:bg-white/[0.06] text-[13px] transition-all"
                        >
                          <link.icon className="w-4 h-4" />
                          {link.label}
                        </button>
                      ))}
                    </div>
                    <div className="p-1.5 border-t border-white/[0.06]">
                      <button
                        onClick={() => signOut({ callbackUrl: "/auth/login" })}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-red-400/70 hover:text-red-400 hover:bg-red-500/[0.06] text-[13px] transition-all"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[20vh]"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="w-full max-w-lg mx-4 bg-[var(--sidebar)]/95 backdrop-blur-3xl rounded-2xl border border-white/[0.1] shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06]">
                <Search className="w-5 h-5 text-white/30" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search students, teachers, invoices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-white placeholder-white/25 text-sm outline-none"
                />
                <kbd className="px-2 py-0.5 rounded-md bg-white/[0.06] text-white/25 text-[10px] font-mono border border-white/[0.08]">ESC</kbd>
              </div>
              <div className="p-4 space-y-1">
                {[
                  { icon: Users, label: "Students", count: "20 records", href: "/dashboard/students" },
                  { icon: User, label: "Teachers", count: "8 records", href: "/dashboard/teachers" },
                  { icon: CreditCardIcon, label: "Payments", count: "Finance module", href: "/dashboard/finance" },
                  { icon: FileText, label: "Admissions", count: "Pipeline view", href: "/dashboard/admissions" },
                ].map((item) => (
                  <button
                    key={item.href}
                    onClick={() => { router.push(item.href); setSearchOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.06] transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center text-white/40">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-white/80 text-sm font-medium">{item.label}</p>
                      <p className="text-white/25 text-[11px]">{item.count}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function CreditCardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  );
}
