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
  AlertTriangle,
  GraduationCap,
} from "lucide-react";
import { SCHOOL_CONFIG } from "@/lib/school-config";

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
  const [notifList, setNotifList] = useState<{ id: string; title: string; message: string; type: string; read: boolean; createdAt: string }[]>([]);
  const [notifUnread, setNotifUnread] = useState(0);

  useEffect(() => {
    fetch("/api/notifications")
      .then(r => r.json())
      .then(d => {
        setNotifList(d.notifications ?? []);
        setNotifUnread(d.unreadCount ?? 0);
      })
      .catch(() => {});
  }, []);

const name = session?.user?.name || "Admin";
const email = session?.user?.email || SCHOOL_CONFIG.email;
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

  return (
    <>
      <header className="sticky top-0 z-30 h-14 bg-white border-b border-[#e8ecf1]">
        <div className="h-full pl-14 pr-4 flex items-center gap-3 lg:pl-4">
          <div className="flex-1 min-w-0">
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-[#f1f5f9] border border-[#e2e8f0] text-[#94a3b8] text-[12px] w-full max-w-xs hover:bg-[#e2e8f0] transition-all"
            >
              <Search className="w-4 h-4" />
              <span className="flex-1 text-left">Search anything...</span>
              <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#e2e8f0] text-[#94a3b8] text-[9px] font-mono border border-[#cbd5e1]">
                ⌘K
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div ref={notifRef} className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-[#64748b] hover:text-[#1a1a2e] hover:bg-[#f1f5f9] transition-all relative"
              >
                <Bell className="w-4.5 h-4.5" />
                {notifUnread > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#ef4444] text-white text-[8px] font-bold flex items-center justify-center">
                    {notifUnread}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    className="absolute right-0 top-12 w-[calc(100vw-32px)] max-w-[320px] rounded-xl bg-white border border-[#e2e8f0] shadow-xl overflow-hidden z-[55]"
                  >
                    <div className="px-4 py-3 border-b border-[#e8ecf1] flex items-center justify-between">
                      <h3 className="text-[#1a1a2e] font-semibold text-[13px]">Notifications</h3>
                      <span className="text-[10px] text-[#0055ff] bg-[#dbeafe] px-2 py-0.5 rounded-full font-medium">{notifUnread} new</span>
                    </div>
                    <div className="max-h-[280px] overflow-y-auto">
                      {notifList.map((n) => (
                        <div key={n.id} className={`px-4 py-3 border-b border-[#f1f5f9] hover:bg-[#f8fafc] transition cursor-pointer ${!n.read ? "bg-[#f0f9ff]" : ""}`}>
                          <div className="flex items-start gap-2.5">
                            <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              n.type === "finance" ? "bg-[#dcfce7] text-[#16a34a]" :
                              n.type === "academic" ? "bg-[#dbeafe] text-[#2563eb]" :
                              n.type === "system" ? "bg-[#fef3c7] text-[#d97706]" :
                              n.type === "warning" ? "bg-[#fee2e2] text-[#dc2626]" :
                              "bg-[#f3e8ff] text-[#9333ea]"
                            }`}>
                              {n.type === "finance" ? <CreditCard className="w-3.5 h-3.5" /> :
                               n.type === "academic" ? <GraduationCap className="w-3.5 h-3.5" /> :
                               n.type === "system" ? <Settings className="w-3.5 h-3.5" /> :
                               n.type === "warning" ? <AlertTriangle className="w-3.5 h-3.5" /> :
                               <Bell className="w-3.5 h-3.5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[#1a1a2e] text-[12px] font-medium leading-tight">{n.title}</p>
                              <p className="text-[#64748b] text-[10px] mt-0.5 truncate">{n.message}</p>
                              <p className="text-[#94a3b8] text-[9px] mt-0.5">{n.createdAt ? (() => {
                                const diff = Date.now() - new Date(n.createdAt).getTime();
                                const mins = Math.floor(diff / 60000);
                                if (mins < 60) return `${mins}m ago`;
                                const hrs = Math.floor(mins / 60);
                                if (hrs < 24) return `${hrs}h ago`;
                                return `${Math.floor(hrs / 24)}d ago`;
                              })() : ""}</p>
                            </div>
                            {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-[#0055ff] mt-1.5 flex-shrink-0" />}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-2 border-t border-[#e8ecf1]">
                      <button onClick={() => { router.push("/dashboard/notifications"); setNotificationsOpen(false); }} className="w-full py-2 rounded-lg bg-[#f1f5f9] text-[#64748b] text-[11px] font-medium hover:bg-[#e2e8f0] transition">
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
                className="flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-lg hover:bg-[#f1f5f9] transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0055ff] to-[#0039a6] flex items-center justify-center text-white text-[11px] font-bold">
                  {initials}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-[#1a1a2e] text-[12px] font-medium leading-tight">{name}</p>
                  <p className="text-[#64748b] text-[9px]">{(session?.user as any)?.roles?.[0]?.name || "User"}</p>
                </div>
                <ChevronDown className={`w-3 h-3 text-[#94a3b8] transition-transform ${profileOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    className="absolute right-0 top-12 w-[200px] rounded-xl bg-white border border-[#e2e8f0] shadow-xl overflow-hidden z-[60]"
                  >
                    <div className="px-3 py-2 border-b border-[#e8ecf1]">
                      <p className="text-[#1a1a2e] text-[13px] font-medium">{name}</p>
                      <p className="text-[#64748b] text-[10px]">{email}</p>
                    </div>
                    <div className="p-1">
                      {quickLinks.map((link) => (
                        <button
                          key={link.href}
                          onClick={() => { router.push(link.href); setProfileOpen(false); }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[#64748b] hover:text-[#1a1a2e] hover:bg-[#f1f5f9] text-[12px] transition-all"
                        >
                          <link.icon className="w-3.5 h-3.5" />
                          {link.label}
                        </button>
                      ))}
                    </div>
                    <div className="p-1 border-t border-[#e8ecf1]">
                      <button
                        onClick={() => signOut({ callbackUrl: "/auth/login" })}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[#dc2626] hover:bg-[#fee2e2] text-[12px] transition-all"
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