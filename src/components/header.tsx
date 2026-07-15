"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Bell, Search, ChevronDown } from "lucide-react";
import { useState } from "react";
import { getInitials } from "@/lib/utils";

export function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const getPageTitle = () => {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length === 1) return "Dashboard";
    return parts[parts.length - 1]
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <header className="sticky top-0 z-30 glass border-b border-white/10">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-4">
          <div className="lg:hidden w-10" />
          <div>
            <h1 className="text-white font-semibold text-lg">{getPageTitle()}</h1>
            <p className="text-white/40 text-xs">
              {new Date().toLocaleDateString("en-NG", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Notifications */}
          <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[var(--accent)]" />
          </button>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white text-xs font-bold">
                {getInitials(session?.user?.name || "Admin")}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-white text-sm font-medium">
                  {session?.user?.name || "Admin"}
                </p>
                <p className="text-white/40 text-xs">
                  {(session?.user as any)?.roles?.[0]?.name || "Administrator"}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-white/40 hidden md:block" />
            </button>

            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 top-12 w-56 card py-2"
              >
                <a
                  href="/dashboard/profile"
                  className="block px-4 py-2 text-white/70 hover:text-white hover:bg-white/5 text-sm transition-all"
                >
                  My Profile
                </a>
                <a
                  href="/dashboard/settings"
                  className="block px-4 py-2 text-white/70 hover:text-white hover:bg-white/5 text-sm transition-all"
                >
                  Settings
                </a>
                <hr className="border-white/10 my-2" />
                <button
                  onClick={() => {
                    import("next-auth/react").then(({ signOut }) =>
                      signOut({ callbackUrl: "/auth/login" })
                    );
                  }}
                  className="w-full text-left px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 text-sm transition-all"
                >
                  Sign Out
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Global Search Bar */}
      {searchOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-white/10 px-6 py-3"
        >
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
            <input
              type="text"
              placeholder="Search students, teachers, classes, payments..."
              autoFocus
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              onKeyDown={(e) => {
                if (e.key === "Escape") setSearchOpen(false);
              }}
            />
          </div>
        </motion.div>
      )}
    </header>
  );
}
