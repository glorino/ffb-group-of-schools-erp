"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/providers/theme-provider";
import { useSession, signOut } from "next-auth/react";
import {
  GraduationCap,
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
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
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

interface NavSection {
  title: string;
  items: NavItem[];
  roles?: string[];
}

const navSections: NavSection[] = [
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
      { label: "Students", href: "/dashboard/students", icon: Users, roles: ["SUPER_ADMIN", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"] },
      { label: "Teachers", href: "/dashboard/teachers", icon: School, roles: ["SUPER_ADMIN", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"] },
      { label: "Admissions", href: "/dashboard/admissions", icon: UserPlus, badge: "New", roles: ["SUPER_ADMIN", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"] },
    ],
    roles: ["SUPER_ADMIN", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"],
  },
  {
    title: "Academics",
    items: [
      { label: "Classes", href: "/dashboard/classes", icon: BookOpen },
      { label: "Attendance", href: "/dashboard/attendance", icon: ClipboardCheck },
      { label: "Examinations", href: "/dashboard/exams", icon: ClipboardList },
      { label: "Results", href: "/dashboard/results", icon: FileText },
      { label: "Report Cards", href: "/dashboard/report-cards", icon: Trophy },
      { label: "Timetable", href: "/dashboard/timetable", icon: Calendar },
      { label: "Lesson Plans", href: "/dashboard/lesson-plans", icon: BookOpen, roles: ["SUPER_ADMIN", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "TEACHER", "CLASS_TEACHER"] },
    ],
  },
  {
    title: "Finance",
    items: [
      { label: "Fees & Invoices", href: "/dashboard/finance", icon: CreditCard },
      { label: "Payments", href: "/dashboard/payments", icon: CreditCard },
      { label: "Income", href: "/dashboard/income", icon: BarChart3 },
      { label: "Expenses", href: "/dashboard/expenses", icon: BarChart3 },
      { label: "Payroll", href: "/dashboard/payroll", icon: CreditCard },
    ],
    roles: ["SUPER_ADMIN", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "BURSAR", "ACCOUNTANT"],
  },
  {
    title: "Operations",
    items: [
      { label: "Hostel", href: "/dashboard/hostel", icon: Building },
      { label: "Transport", href: "/dashboard/transport", icon: Bus },
      { label: "Library", href: "/dashboard/library", icon: Library },
      { label: "Clinic", href: "/dashboard/clinic", icon: Stethoscope },
      { label: "Inventory", href: "/dashboard/inventory", icon: Package },
    ],
    roles: ["SUPER_ADMIN", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"],
  },
  {
    title: "Intelligence",
    items: [
      { label: "AI Insights", href: "/dashboard/ai", icon: Brain },
      { label: "Analytics", href: "/dashboard/analytics", icon: Target },
      { label: "Alumni", href: "/dashboard/alumni", icon: Trophy },
    ],
    roles: ["SUPER_ADMIN", "ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL"],
  },
];

const ROLE_HOMES: Record<string, string> = {
  STUDENT: "/dashboard/results",
  PARENT: "/dashboard",
  TEACHER: "/dashboard/classes",
  CLASS_TEACHER: "/dashboard/classes",
  BURSAR: "/dashboard/finance",
  ACCOUNTANT: "/dashboard/finance",
  LIBRARIAN: "/dashboard/library",
};

export function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const userRoles = useMemo(() => {
    const roles = (session?.user as any)?.roles as { name: string; level: number }[] | undefined;
    if (!roles) return [];
    return roles.map((r) => r.name);
  }, [session]);

  const highestLevel = useMemo(() => {
    const roles = (session?.user as any)?.roles as { name: string; level: number }[] | undefined;
    if (!roles || roles.length === 0) return 0;
    return Math.max(...roles.map((r) => r.level));
  }, [session]);

  const hasAccess = (itemRoles?: string[]) => {
    if (!itemRoles || itemRoles.length === 0) return true;
    return userRoles.some((r) => itemRoles.includes(r));
  };

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-white/10">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="overflow-hidden"
            >
              <h2 className="text-white font-bold text-lg leading-tight">FFB ERP</h2>
              <p className="text-white/40 text-xs">School Management</p>
            </motion.div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {navSections.map((section, si) => {
          if (!hasAccess(section.roles)) return null;

          const visibleItems = section.items.filter((item) => hasAccess(item.roles));
          if (visibleItems.length === 0) return null;

          return (
            <div key={si} className="mb-6">
              {!collapsed && (
                <h3 className="text-white/30 text-xs font-semibold uppercase tracking-wider px-3 mb-2">
                  {section.title}
                </h3>
              )}
              <div className="space-y-1">
                {visibleItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? "bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/30"
                          : "text-white/60 hover:text-white hover:bg-white/5"
                      } ${collapsed ? "justify-center" : ""}`}
                      title={collapsed ? item.label : undefined}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!collapsed && (
                        <span className="flex-1">{item.label}</span>
                      )}
                      {!collapsed && item.badge && (
                        <span className="px-2 py-0.5 rounded-full bg-[var(--accent)] text-[var(--blue-1)] text-xs font-bold">
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

      {/* Bottom Actions */}
      <div className="p-3 border-t border-white/10 space-y-1">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 text-sm font-medium transition-all"
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          {!collapsed && <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
        </button>
        <button
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 text-sm font-medium transition-all"
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl glass flex items-center justify-center text-white"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25 }}
            className="lg:hidden fixed left-0 top-0 bottom-0 w-[280px] z-50 bg-[var(--sidebar)]"
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:block fixed left-0 top-0 bottom-0 z-40 bg-[var(--sidebar)] transition-all duration-300 ${
          collapsed ? "w-[72px]" : "w-[260px]"
        }`}
      >
        <SidebarContent />

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[var(--primary)] flex items-center justify-center text-white shadow-lg"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>
    </>
  );
}
