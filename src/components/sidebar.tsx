"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import { Menu, X } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  emoji: string;
  badge?: string;
  roles?: string[];
}

const navSections: { title: string; items: NavItem[] }[] = [
  {
    title: "Dashboard",
    items: [
      { label: "Overview", href: "/dashboard", emoji: "📊" },
      { label: "Analytics", href: "/dashboard/analytics", emoji: "📈", roles: ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "ACCOUNTANT", "AUDITOR"] },
    ],
  },
  {
    title: "User Management",
    items: [
      { label: "Students", href: "/dashboard/students", emoji: "👨‍🎓", roles: ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"] },
      { label: "Teachers", href: "/dashboard/teachers", emoji: "👩‍🏫", roles: ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"] },
      { label: "Parents", href: "/dashboard/students", emoji: "👪", roles: ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"] },
    ],
  },
  {
    title: "Academics",
    items: [
      { label: "Classes", href: "/dashboard/classes", emoji: "🏫", roles: ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER"] },
      { label: "Attendance", href: "/dashboard/attendance", emoji: "✅", roles: ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER", "PARENT"] },
      { label: "My Attendance", href: "/dashboard/attendance", emoji: "✅", roles: ["STUDENT"] },
      { label: "Examinations", href: "/dashboard/exams", emoji: "📝", roles: ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER"] },
      { label: "My Exams", href: "/dashboard/exams", emoji: "📝", roles: ["STUDENT"] },
      { label: "Timetable", href: "/dashboard/timetable", emoji: "📅", roles: ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER", "STUDENT", "PARENT"] },
      { label: "Lesson Plans", href: "/dashboard/lesson-plans", emoji: "📋", roles: ["TEACHER", "PRINCIPAL", "VICE_PRINCIPAL"] },
    ],
  },
  {
    title: "Results Engine",
    items: [
      { label: "Results", href: "/dashboard/results", emoji: "📊", roles: ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER"] },
      { label: "My Results", href: "/dashboard/results", emoji: "📊", roles: ["STUDENT", "PARENT"] },
      { label: "Report Cards", href: "/dashboard/report-cards", emoji: "📄", roles: ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER", "STUDENT", "PARENT"] },
    ],
  },
  {
    title: "Admissions",
    items: [
      { label: "Applications", href: "/dashboard/admissions", emoji: "📋", badge: "New", roles: ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"] },
    ],
  },
  {
    title: "Finance & Fees",
    items: [
      { label: "Fees & Invoices", href: "/dashboard/finance", emoji: "💰", roles: ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "ACCOUNTANT", "AUDITOR"] },
      { label: "My Fees", href: "/dashboard/finance", emoji: "💰", roles: ["STUDENT", "PARENT"] },
      { label: "Payments", href: "/dashboard/payments", emoji: "💳", roles: ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "ACCOUNTANT"] },
      { label: "Income", href: "/dashboard/income", emoji: "📈", roles: ["OWNER", "ADMINISTRATOR", "ACCOUNTANT", "AUDITOR"] },
      { label: "Expenses", href: "/dashboard/expenses", emoji: "📉", roles: ["OWNER", "ADMINISTRATOR", "ACCOUNTANT", "AUDITOR"] },
      { label: "Payroll", href: "/dashboard/payroll", emoji: "💵", roles: ["OWNER", "ADMINISTRATOR", "ACCOUNTANT"] },
    ],
  },
  {
    title: "Library",
    items: [
      { label: "Library", href: "/dashboard/library", emoji: "📚", roles: ["OWNER", "ADMINISTRATOR", "LIBRARIAN", "TEACHER", "STUDENT", "PARENT"] },
    ],
  },
  {
    title: "Hostel",
    items: [
      { label: "Hostel", href: "/dashboard/hostel", emoji: "🏠", roles: ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "PORTER"] },
    ],
  },
  {
    title: "Operations",
    items: [
      { label: "Transport", href: "/dashboard/transport", emoji: "🚌", roles: ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"] },
      { label: "Clinic", href: "/dashboard/clinic", emoji: "🏥", roles: ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER"] },
      { label: "Inventory", href: "/dashboard/inventory", emoji: "📦", roles: ["OWNER", "ADMINISTRATOR"] },
    ],
  },
  {
    title: "AI & Intelligence",
    items: [
      { label: "AI Insights", href: "/dashboard/ai", emoji: "🤖", roles: ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "AUDITOR"] },
      { label: "Alumni", href: "/dashboard/alumni", emoji: "🎓", roles: ["OWNER", "ADMINISTRATOR", "ALUMNI"] },
    ],
  },
  {
    title: "Institution",
    items: [
      { label: "Announcements", href: "/dashboard/announcements", emoji: "📢", roles: ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER", "STUDENT", "PARENT", "ALUMNI"] },
      { label: "Calendar", href: "/dashboard/calendar", emoji: "📅", roles: ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER", "STUDENT", "PARENT"] },
      { label: "Notifications", href: "/dashboard/notifications", emoji: "🔔", roles: ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER", "STUDENT", "PARENT", "ALUMNI", "ACCOUNTANT", "AUDITOR", "LIBRARIAN", "PORTER"] },
      { label: "Settings", href: "/dashboard/settings", emoji: "⚙️", roles: ["OWNER", "ADMINISTRATOR"] },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "My Profile", href: "/dashboard/profile", emoji: "👤", roles: ["OWNER", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER", "STUDENT", "PARENT", "ACCOUNTANT", "AUDITOR", "LIBRARIAN", "PORTER", "ALUMNI"] },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const userRoles: string[] = (session?.user as any)?.roles?.map((r: any) => r.name) || [];
  const roleLabel = userRoles[0]?.replace("_", " ") || "User";

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-5 pb-4 text-center border-b border-white/[0.08]">
        <div className="flex justify-center mb-2">
          <img src="/logo.svg" alt="FFB Logo" className="w-14 h-14 rounded-xl" />
        </div>
        <h2 className="text-white font-bold text-[15px] leading-tight text-center">FFB Group of Schools</h2>
        <p className="text-white/40 text-[11px] mt-0.5 text-center">{roleLabel}</p>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-3" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>
        {navSections.map((section, si) => {
          const visibleItems = section.items.filter(item => {
            if (!item.roles) return true;
            return item.roles.some(r => userRoles.includes(r));
          });
          if (visibleItems.length === 0) return null;
          return (
            <div key={si} className="mb-3">
              <h3 className="text-white/30 text-[10px] font-semibold uppercase tracking-[0.15em] px-2 mb-1.5">
                {section.title}
              </h3>
              <div className="space-y-0.5">
                {visibleItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href + item.label}
                      href={item.href}
                      className={`flex items-center gap-2.5 px-2.5 py-[9px] rounded-lg text-[13px] font-medium transition-all duration-150 ${
                        isActive
                          ? "bg-white/[0.1] text-white"
                          : "text-white/50 hover:text-white/80 hover:bg-white/[0.04]"
                      }`}
                    >
                      <span className="text-[14px]">{item.emoji}</span>
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge && (
                        <span className="px-1.5 py-px rounded-full bg-[var(--accent)]/15 text-[var(--accent)] text-[10px] font-bold">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/[0.08]">
        <button
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          className="w-full flex items-center gap-2.5 px-2.5 py-[9px] rounded-lg text-white/50 hover:text-red-400 hover:bg-red-500/[0.06] text-[13px] font-medium transition-all"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-2.5 left-3 z-[60] w-10 h-10 rounded-xl bg-white/[0.08] backdrop-blur-xl flex items-center justify-center text-white border border-white/10 shadow-lg"
      >
        <Menu className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <motion.aside initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-[240px] z-[80] bg-[var(--sidebar)] shadow-2xl">
              <button onClick={() => setMobileOpen(false)} className="absolute top-3 right-3 text-white/40 hover:text-white z-10">
                <X className="w-5 h-5" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <aside className="hidden lg:block fixed left-0 top-0 bottom-0 w-[240px] z-20 bg-[var(--sidebar)] border-r border-white/[0.06]">
        <SidebarContent />
      </aside>
    </>
  );
}
