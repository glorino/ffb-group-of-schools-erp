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
      { label: "Analytics", href: "/dashboard/analytics", emoji: "📈", roles: ["ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"] },
    ],
  },
  {
    title: "User Management",
    items: [
      { label: "Students", href: "/dashboard/students", emoji: "👨‍🎓", roles: ["ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"] },
      { label: "Teachers", href: "/dashboard/teachers", emoji: "👩‍🏫", roles: ["ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"] },
      { label: "Parents", href: "/dashboard/students", emoji: "👪", roles: ["ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"] },
    ],
  },
  {
    title: "Academics",
    items: [
      { label: "Classes", href: "/dashboard/classes", emoji: "🏫", roles: ["ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER"] },
      { label: "Attendance", href: "/dashboard/attendance", emoji: "✅", roles: ["ADMINISTRATOR", "PRINCIPAL", "TEACHER"] },
      { label: "Examinations", href: "/dashboard/exams", emoji: "📝", roles: ["ADMINISTRATOR", "PRINCIPAL", "TEACHER"] },
      { label: "My Exams", href: "/dashboard/exams", emoji: "📝", roles: ["STUDENT"] },
      { label: "Timetable", href: "/dashboard/timetable", emoji: "📅", roles: ["ADMINISTRATOR", "PRINCIPAL", "TEACHER", "STUDENT"] },
      { label: "Lesson Plans", href: "/dashboard/lesson-plans", emoji: "📋", roles: ["TEACHER"] },
    ],
  },
  {
    title: "Results Engine",
    items: [
      { label: "Results", href: "/dashboard/results", emoji: "📊", roles: ["ADMINISTRATOR", "PRINCIPAL", "TEACHER"] },
      { label: "My Results", href: "/dashboard/results", emoji: "📊", roles: ["STUDENT"] },
      { label: "Report Cards", href: "/dashboard/report-cards", emoji: "📄", roles: ["ADMINISTRATOR", "PRINCIPAL", "TEACHER", "STUDENT"] },
    ],
  },
  {
    title: "Admissions",
    items: [
      { label: "Applications", href: "/dashboard/admissions", emoji: "📋", badge: "New", roles: ["ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"] },
    ],
  },
  {
    title: "Finance & Fees",
    items: [
      { label: "Fees & Invoices", href: "/dashboard/finance", emoji: "💰", roles: ["ADMINISTRATOR", "PRINCIPAL"] },
      { label: "My Fees", href: "/dashboard/finance", emoji: "💰", roles: ["STUDENT"] },
      { label: "Payments", href: "/dashboard/payments", emoji: "💳", roles: ["ADMINISTRATOR", "PRINCIPAL"] },
      { label: "Income", href: "/dashboard/income", emoji: "📈", roles: ["ADMINISTRATOR"] },
      { label: "Expenses", href: "/dashboard/expenses", emoji: "📉", roles: ["ADMINISTRATOR"] },
      { label: "Payroll", href: "/dashboard/payroll", emoji: "💵", roles: ["ADMINISTRATOR", "PRINCIPAL"] },
    ],
  },
  {
    title: "Library",
    items: [
      { label: "Library", href: "/dashboard/library", emoji: "📚", roles: ["ADMINISTRATOR", "TEACHER", "STUDENT"] },
    ],
  },
  {
    title: "Operations",
    items: [
      { label: "Hostel", href: "/dashboard/hostel", emoji: "🏠", roles: ["ADMINISTRATOR", "PRINCIPAL"] },
      { label: "Transport", href: "/dashboard/transport", emoji: "🚌", roles: ["ADMINISTRATOR"] },
      { label: "Clinic", href: "/dashboard/clinic", emoji: "🏥", roles: ["ADMINISTRATOR"] },
      { label: "Inventory", href: "/dashboard/inventory", emoji: "📦", roles: ["ADMINISTRATOR"] },
    ],
  },
  {
    title: "AI & Intelligence",
    items: [
      { label: "AI Insights", href: "/dashboard/ai", emoji: "🤖", roles: ["ADMINISTRATOR", "PRINCIPAL"] },
      { label: "Alumni", href: "/dashboard/alumni", emoji: "🎓", roles: ["ADMINISTRATOR"] },
    ],
  },
  {
    title: "Institution",
    items: [
      { label: "Announcements", href: "/dashboard/announcements", emoji: "📢", roles: ["ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER", "STUDENT"] },
      { label: "Calendar", href: "/dashboard/calendar", emoji: "📅", roles: ["ADMINISTRATOR", "PRINCIPAL", "TEACHER", "STUDENT"] },
      { label: "Settings", href: "/dashboard/settings", emoji: "⚙️", roles: ["ADMINISTRATOR"] },
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
        <img src="/logo.svg" alt="FFB Logo" className="w-14 h-14 mx-auto mb-2 rounded-xl" />
        <h2 className="text-white font-bold text-[14px] leading-tight">FFB Group of Schools</h2>
        <p className="text-white/40 text-[10px] mt-0.5">{roleLabel}</p>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-3">
        {navSections.map((section, si) => {
          const visibleItems = section.items.filter(item => {
            if (!item.roles) return true;
            return item.roles.some(r => userRoles.includes(r));
          });
          if (visibleItems.length === 0) return null;
          return (
            <div key={si} className="mb-3">
              <h3 className="text-white/25 text-[9px] font-semibold uppercase tracking-[0.15em] px-2 mb-1.5">
                {section.title}
              </h3>
              <div className="space-y-0.5">
                {visibleItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href + item.label}
                      href={item.href}
                      className={`flex items-center gap-2.5 px-2.5 py-[8px] rounded-lg text-[12px] font-medium transition-all duration-150 ${
                        isActive
                          ? "bg-white/[0.1] text-white"
                          : "text-white/50 hover:text-white/80 hover:bg-white/[0.04]"
                      }`}
                    >
                      <span className="text-[13px]">{item.emoji}</span>
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge && (
                        <span className="px-1.5 py-px rounded-full bg-[var(--accent)]/15 text-[var(--accent)] text-[9px] font-bold">
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
          className="w-full flex items-center gap-2.5 px-2.5 py-[8px] rounded-lg text-white/50 hover:text-red-400 hover:bg-red-500/[0.06] text-[12px] font-medium transition-all"
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
        className="lg:hidden fixed top-3 left-3 z-50 w-9 h-9 rounded-lg bg-white/[0.08] backdrop-blur-xl flex items-center justify-center text-white border border-white/10"
      >
        <Menu className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <motion.aside initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-[240px] z-50 bg-[var(--sidebar)]">
              <button onClick={() => setMobileOpen(false)} className="absolute top-3 right-3 text-white/40 hover:text-white z-10">
                <X className="w-4 h-4" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <aside className="hidden lg:block fixed left-0 top-0 bottom-0 w-[240px] z-40 bg-[var(--sidebar)] border-r border-white/[0.06]">
        <SidebarContent />
      </aside>
    </>
  );
}