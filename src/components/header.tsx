"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bell,
  ChevronDown,
  User,
  Users,
  Settings,
  LogOut,
  X,
  Sparkles,
  Clock,
  FileText,
  CreditCard,
} from "lucide-react";

const quickLinks = [
  { label: "My Profile", href: "/dashboard/profile", icon: User },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
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
      <header className="sticky top-0 z-30 h-12 bg-[var(--sidebar)]/80 backdrop-blur-2xl border-b border-white/[0.06]">
        <div className="h-full px-4 flex items-center gap-3">
          <div className="flex-1">
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/25 text-[12px] w-full max-w-xs hover:bg-white/[0.07] hover:border-white/[0.1] transition-all"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="flex-1 text-left">Search anything...</span>
              <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/[0.05] text-white/20 text-[9px] font-mono border border-white/[0.06]">
                ⌘K
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-1">
            <div ref={notifRef} className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/[0.05] transition-all relative"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-[var(--accent)] text-[var(--sidebar)] text-[8px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    className="absolute right-0 top-10 w-[320px] rounded-xl bg-[var(--sidebar)]/95 backdrop-blur-3xl border border-white/[0.08] shadow-2xl shadow-black/40 overflow-hidden"
                  >
                    <div className="px-3 py-2.5 border-b border-white/[0.06] flex items-center justify-between">
                      <h3 className="text-white font-semibold text-[13px]">Notifications</h3>
                      <span className="text-[9px] text-[var(--accent)] bg-[var(--accent)]/10 px-1.5 py-0.5 rounded-full font-medium">{unreadCount} new</span>
                    </div>
                    <div className="max-h-[280px] overflow-y-auto">
                      {notifications.map((n) => (
                        <div key={n.id} className={`px-3 py-2.5 border-b border-white/[0.04] hover:bg-white/[0.04] transition cursor-pointer ${!n.read ? "bg-white/[0.02]" : ""}`}>
                          <div className="flex items-start gap-2.5">
                            <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              n.type === "payment" ? "bg-emerald-500/15 text-emerald-400" :
                              n.type === "admission" ? "bg-blue-500/15 text-blue-400" :
                              n.type === "exam" ? "bg-amber-500/15 text-amber-400" :
                              n.type === "event" ? "bg-purple-500/15 text-purple-400" :
                              "bg-red-500/15 text-red-400"
                            }`}>
                              {n.type === "payment" ? <CreditCard className="w-3.5 h-3.5" /> :
                               n.type === "admission" ? <FileText className="w-3.5 h-3.5" /> :
                               n.type === "exam" ? <Sparkles className="w-3.5 h-3.5" /> :
                               n.type === "event" ? <Clock className="w-3.5 h-3.5" /> :
                               <Bell className="w-3.5 h-3.5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white/85 text-[12px] font-medium leading-tight">{n.title}</p>
                              <p className="text-white/30 text-[10px] mt-0.5 truncate">{n.desc}</p>
                              <p className="text-white/15 text-[9px] mt-0.5">{n.time}</p>
                            </div>
                            {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-1.5 flex-shrink-0" />}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-2 border-t border-white/[0.06]">
                      <button onClick={() => { router.push("/dashboard/notifications"); setNotificationsOpen(false); }} className="w-full py-1.5 rounded-lg bg-white/[0.04] text-white/30 text-[11px] font-medium hover:bg-white/[0.07] transition">
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
                className="flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-lg hover:bg-white/[0.05] transition-all"
              >
                <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[var(--blue-3)] to-[var(--blue-1)] flex items-center justify-center text-white text-[10px] font-bold border border-white/10">
                  {initials}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-white/85 text-[12px] font-medium leading-tight">{name}</p>
                  <p className="text-white/25 text-[9px]">Administrator</p>
                </div>
                <ChevronDown className={`w-3 h-3 text-white/25 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    className="absolute right-0 top-10 w-[200px] rounded-xl bg-[var(--sidebar)]/95 backdrop-blur-3xl border border-white/[0.08] shadow-2xl shadow-black/40 overflow-hidden"
                  >
                    <div className="px-3 py-2 border-b border-white/[0.06]">
                      <p className="text-white/85 text-[13px] font-medium">{name}</p>
                      <p className="text-white/25 text-[10px]">{email}</p>
                    </div>
                    <div className="p-1">
                      {quickLinks.map((link) => (
                        <button
                          key={link.href}
                          onClick={() => { router.push(link.href); setProfileOpen(false); }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-white/40 hover:text-white/75 hover:bg-white/[0.05] text-[12px] transition-all"
                        >
                          <link.icon className="w-3.5 h-3.5" />
                          {link.label}
                        </button>
                      ))}
                    </div>
                    <div className="p-1 border-t border-white/[0.06]">
                      <button
                        onClick={() => signOut({ callbackUrl: "/auth/login" })}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-red-400/60 hover:text-red-400 hover:bg-red-500/[0.06] text-[12px] transition-all"
                      >
                        <LogOut className="w-3.5 h-3.5" />
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

      <AnimatePresence>
        {searchOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[20vh]"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.95 }}
              className="w-full max-w-md mx-4 bg-[var(--sidebar)]/95 backdrop-blur-3xl rounded-xl border border-white/[0.1] shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/[0.06]">
                <Search className="w-4 h-4 text-white/25" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search students, teachers, invoices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-white placeholder-white/20 text-[13px] outline-none"
                />
                <kbd className="px-1.5 py-0.5 rounded bg-white/[0.05] text-white/20 text-[9px] font-mono border border-white/[0.06]">ESC</kbd>
              </div>
              <div className="p-2 space-y-0.5">
                {[
                  { icon: Users, label: "Students", count: "20 records", href: "/dashboard/students" },
                  { icon: User, label: "Teachers", count: "8 records", href: "/dashboard/teachers" },
                  { icon: CreditCard, label: "Payments", count: "Finance module", href: "/dashboard/finance" },
                  { icon: FileText, label: "Admissions", count: "Pipeline view", href: "/dashboard/admissions" },
                ].map((item) => (
                  <button
                    key={item.href}
                    onClick={() => { router.push(item.href); setSearchOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/[0.05] transition-all"
                  >
                    <div className="w-7 h-7 rounded-md bg-white/[0.05] flex items-center justify-center text-white/35">
                      <item.icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-white/75 text-[12px] font-medium">{item.label}</p>
                      <p className="text-white/20 text-[10px]">{item.count}</p>
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