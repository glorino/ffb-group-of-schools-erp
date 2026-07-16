"use client";

import { useState, useEffect } from "react";
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
  Shield,
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
  const { theme, toggleTheme } = useTheme();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const userRoles: string[] = (session?.user as any)?.roles?.map((r: any) => r.name) || [];
  const isSuperAdmin = userRoles.includes("SUPER_ADMIN") || userRoles.includes("ADMINISTRATOR");

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-white/[0.06]">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/10" style={{ background: "linear-gradient(135deg, #4B1E73, #2E0F4F)" }}>
            <svg viewBox="0 0 64 64" className="w-7 h-7" fill="none">
              <path d="M32 4 L56 14 L56 32 C56 48 44 58 32 62 C20 58 8 48 8 32 L8 14 Z" fill="#4B1E73" stroke="#f97316" strokeWidth="2"/>
              <path d="M20 36 L32 42 L44 36 L44 48 L32 54 L20 48 Z" fill="#f97316" opacity="0.9"/>
              <path d="M32 12 C34 16 36 18 36 22 C38 18 38 14 36 10 C34 8 32 6 32 6 C32 6 30 8 28 10 C26 14 26 18 28 22 C28 18 30 16 32 12Z" fill="#f97316"/>
              <text x="32" y="20" textAnchor="middle" fontFamily="Poppins" fontWeight="bold" fontSize="10" fill="#f97316">FFB</text>
            </svg>
          </div>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden">
              <h2 className="text-white font-bold text-[15px] leading-tight">FFB Group</h2>
              <p className="text-white/30 text-[10px] tracking-wider uppercase">School Portal</p>
            </motion.div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2.5">
        {navSections.map((section, si) => {
          const visibleItems = section.items.filter(item => {
            if (isSuperAdmin) return true;
            if (!item.roles) return true;
            return item.roles.some(r => userRoles.includes(r));
          });
          if (visibleItems.length === 0) return null;
          return (
            <div key={si} className="mb-4">
              {!collapsed && (
                <h3 className="text-white/25 text-[10px] font-semibold uppercase tracking-[0.15em] px-3 mb-1.5">
                  {section.title}
                </h3>
              )}
              <div className="space-y-0.5">
                {visibleItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-white/[0.08] text-white shadow-lg shadow-black/20"
                          : "text-white/45 hover:text-white/80 hover:bg-white/[0.04]"
                      } ${collapsed ? "justify-center" : ""}`}
                      title={collapsed ? item.label : undefined}
                    >
                      <item.icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? "text-[#f97316]" : ""}`} />
                      {!collapsed && <span className="flex-1">{item.label}</span>}
                      {!collapsed && item.badge && (
                        <span className="px-2 py-0.5 rounded-full bg-[#f97316]/15 text-[#f97316] text-[10px] font-bold">
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

      {/* Bottom */}
      <div className="p-2.5 border-t border-white/[0.06] space-y-0.5">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/45 hover:text-white/80 hover:bg-white/[0.04] text-[13px] font-medium transition-all"
        >
          {theme === "dark" ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
          {!collapsed && <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
        </button>
        <button
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400/70 hover:text-red-400 hover:bg-red-500/[0.06] text-[13px] font-medium transition-all"
        >
          <LogOut className="w-[18px] h-[18px]" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl bg-white/[0.08] backdrop-blur-xl flex items-center justify-center text-white border border-white/10"
      >
        <Menu className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-[260px] z-50 bg-[var(--sidebar)]">
              <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 text-white/40 hover:text-white">
                <X className="w-5 h-5" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <aside className={`hidden lg:block fixed left-0 top-0 bottom-0 z-40 bg-[var(--sidebar)] transition-all duration-300 ${
        collapsed ? "w-[68px]" : "w-[250px]"
      }`}>
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-[72px] w-6 h-6 rounded-full bg-[var(--primary)] flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>
    </>
  );
}
