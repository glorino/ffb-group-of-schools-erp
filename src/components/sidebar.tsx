"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  BookOpen,
  ClipboardCheck,
  CreditCard,
  Library,
  Building,
  Bus,
  Stethoscope,
  Package,
  Trophy,
  BarChart3,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Calendar,
  FileText,
  Brain,
  Target,
  ClipboardList,
  School,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: any;
  badge?: string;
  roles?: string[];
}

const navSections: { title: string; items: NavItem[] }[] = [
  {
    title: "Main",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Calendar", href: "/dashboard/calendar", icon: Calendar },
      { label: "Announcements", href: "/dashboard/announcements", icon: Bell },
    ],
  },
  {
    title: "People",
    items: [
      { label: "Students", href: "/dashboard/students", icon: Users, roles: ["SUPER_ADMIN", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "ACADEMIC_ADMIN", "CLASS_TEACHER"] },
      { label: "Teachers", href: "/dashboard/teachers", icon: School, roles: ["SUPER_ADMIN", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"] },
      { label: "Admissions", href: "/dashboard/admissions", icon: UserPlus, badge: "New", roles: ["SUPER_ADMIN", "ADMINISTRATOR", "ADMISSIONS_OFFICER"] },
    ],
  },
  {
    title: "Academics",
    items: [
      { label: "Classes", href: "/dashboard/classes", icon: BookOpen, roles: ["SUPER_ADMIN", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "ACADEMIC_ADMIN", "CLASS_TEACHER", "TEACHER"] },
      { label: "Attendance", href: "/dashboard/attendance", icon: ClipboardCheck, roles: ["SUPER_ADMIN", "ADMINISTRATOR", "PRINCIPAL", "CLASS_TEACHER", "TEACHER"] },
      { label: "Examinations", href: "/dashboard/exams", icon: ClipboardList, roles: ["SUPER_ADMIN", "ADMINISTRATOR", "PRINCIPAL", "EXAM_OFFICER", "TEACHER"] },
      { label: "Results", href: "/dashboard/results", icon: FileText, roles: ["SUPER_ADMIN", "ADMINISTRATOR", "PRINCIPAL", "TEACHER", "STUDENT", "PARENT"] },
      { label: "Report Cards", href: "/dashboard/report-cards", icon: Trophy, roles: ["SUPER_ADMIN", "ADMINISTRATOR", "PRINCIPAL", "TEACHER", "STUDENT", "PARENT"] },
      { label: "Timetable", href: "/dashboard/timetable", icon: Calendar, roles: ["SUPER_ADMIN", "ADMINISTRATOR", "PRINCIPAL", "TEACHER", "STUDENT"] },
      { label: "Lesson Plans", href: "/dashboard/lesson-plans", icon: BookOpen, roles: ["TEACHER", "CLASS_TEACHER"] },
    ],
  },
  {
    title: "Finance",
    items: [
      { label: "Fees & Invoices", href: "/dashboard/finance", icon: CreditCard, roles: ["SUPER_ADMIN", "ADMINISTRATOR", "PRINCIPAL", "BURSAR", "ACCOUNTANT"] },
      { label: "Payments", href: "/dashboard/payments", icon: CreditCard, roles: ["SUPER_ADMIN", "ADMINISTRATOR", "BURSAR", "ACCOUNTANT"] },
      { label: "Income", href: "/dashboard/income", icon: BarChart3, roles: ["SUPER_ADMIN", "ADMINISTRATOR", "BURSAR", "ACCOUNTANT"] },
      { label: "Expenses", href: "/dashboard/expenses", icon: BarChart3, roles: ["SUPER_ADMIN", "ADMINISTRATOR", "BURSAR", "ACCOUNTANT"] },
      { label: "Payroll", href: "/dashboard/payroll", icon: CreditCard, roles: ["SUPER_ADMIN", "ADMINISTRATOR", "BURSAR"] },
    ],
  },
  {
    title: "Operations",
    items: [
      { label: "Hostel", href: "/dashboard/hostel", icon: Building, roles: ["SUPER_ADMIN", "ADMINISTRATOR", "HOSTEL_MASTER", "HOSTEL_MISTRESS"] },
      { label: "Transport", href: "/dashboard/transport", icon: Bus, roles: ["SUPER_ADMIN", "ADMINISTRATOR"] },
      { label: "Library", href: "/dashboard/library", icon: Library, roles: ["SUPER_ADMIN", "ADMINISTRATOR", "LIBRARIAN", "STUDENT", "TEACHER"] },
      { label: "Clinic", href: "/dashboard/clinic", icon: Stethoscope, roles: ["SUPER_ADMIN", "ADMINISTRATOR", "CLINIC_STAFF"] },
      { label: "Inventory", href: "/dashboard/inventory", icon: Package, roles: ["SUPER_ADMIN", "ADMINISTRATOR"] },
    ],
  },
  {
    title: "Intelligence",
    items: [
      { label: "AI Insights", href: "/dashboard/ai", icon: Brain, roles: ["SUPER_ADMIN", "ADMINISTRATOR", "PRINCIPAL"] },
      { label: "Analytics", href: "/dashboard/analytics", icon: Target, roles: ["SUPER_ADMIN", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"] },
      { label: "Alumni", href: "/dashboard/alumni", icon: Trophy, roles: ["SUPER_ADMIN", "ADMINISTRATOR"] },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const userRoles: string[] = (session?.user as any)?.roles?.map((r: any) => r.name) || [];
  const isSuperAdmin = userRoles.includes("SUPER_ADMIN") || userRoles.includes("ADMINISTRATOR");

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-3 py-3 border-b border-white/[0.06]">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <img src="/logo.svg" alt="FFB Logo" className="w-8 h-8 rounded-lg flex-shrink-0" />
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden">
              <h2 className="text-white font-bold text-[13px] leading-tight">FFB Group</h2>
              <p className="text-white/30 text-[9px] tracking-wider uppercase">School Portal</p>
            </motion.div>
          )}
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-2 px-1.5">
        {navSections.map((section, si) => {
          const visibleItems = section.items.filter(item => {
            if (isSuperAdmin) return true;
            if (!item.roles) return true;
            return item.roles.some(r => userRoles.includes(r));
          });
          if (visibleItems.length === 0) return null;
          return (
            <div key={si} className="mb-2">
              {!collapsed && (
                <h3 className="text-white/20 text-[9px] font-semibold uppercase tracking-[0.15em] px-2.5 mb-1">
                  {section.title}
                </h3>
              )}
              <div className="space-y-px">
                {visibleItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[12px] font-medium transition-all duration-150 ${
                        isActive
                          ? "bg-white/[0.08] text-white"
                          : "text-white/40 hover:text-white/75 hover:bg-white/[0.04]"
                      } ${collapsed ? "justify-center" : ""}`}
                      title={collapsed ? item.label : undefined}
                    >
                      <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-[var(--accent)]" : ""}`} />
                      {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                      {!collapsed && item.badge && (
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

      <div className="p-2 border-t border-white/[0.06]">
        <button
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          className="w-full flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/[0.06] text-[12px] font-medium transition-all"
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span>Sign Out</span>}
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
            <motion.aside initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-[220px] z-50 bg-[var(--sidebar)]">
              <button onClick={() => setMobileOpen(false)} className="absolute top-3 right-3 text-white/40 hover:text-white">
                <X className="w-4 h-4" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <aside className={`hidden lg:block fixed left-0 top-0 bottom-0 z-40 bg-[var(--sidebar)] transition-all duration-300 ${
        collapsed ? "w-[56px]" : "w-[220px]"
      }`}>
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute right-0 top-14 translate-x-1/2 w-5 h-5 rounded-full bg-[var(--primary)] flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform z-50"
        >
          {collapsed ? <ChevronRight className="w-2.5 h-2.5" /> : <ChevronLeft className="w-2.5 h-2.5" />}
        </button>
      </aside>
    </>
  );
}