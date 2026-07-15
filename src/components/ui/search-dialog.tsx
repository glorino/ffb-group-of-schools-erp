"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Users,
  GraduationCap,
  CreditCard,
  BookOpen,
  X,
  ArrowRight,
} from "lucide-react";

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: "student" | "teacher" | "class" | "payment";
  href: string;
}

const iconMap = {
  student: Users,
  teacher: GraduationCap,
  class: BookOpen,
  payment: CreditCard,
};

const colorMap = {
  student: "text-blue-400",
  teacher: "text-emerald-400",
  class: "text-purple-400",
  payment: "text-orange-400",
};

const sampleResults: SearchResult[] = [
  { id: "1", title: "Chidi Okonkwo", subtitle: "JSS1 - Admission #2025/0042", type: "student", href: "/dashboard/students/1" },
  { id: "2", title: "Amina Mohammed", subtitle: "SS2A - Fees Pending", type: "student", href: "/dashboard/students/2" },
  { id: "3", title: "Mr. Emeka Obi", subtitle: "Mathematics Department", type: "teacher", href: "/dashboard/teachers/1" },
  { id: "4", title: "Mrs. Fatima Ali", subtitle: "English Department", type: "teacher", href: "/dashboard/teachers/2" },
  { id: "5", title: "JSS1 - Gold", subtitle: "42 students", type: "class", href: "/dashboard/classes/1" },
  { id: "6", title: "SS3 - Diamond", subtitle: "38 students", type: "class", href: "/dashboard/classes/2" },
  { id: "7", title: "Payment #INV-2025-0847", subtitle: "₦125,000 - Amina Mohammed", type: "payment", href: "/dashboard/payments/1" },
];

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const filtered = query
    ? sampleResults.filter(
        (r) =>
          r.title.toLowerCase().includes(query.toLowerCase()) ||
          r.subtitle.toLowerCase().includes(query.toLowerCase())
      )
    : sampleResults;

  const grouped = filtered.reduce(
    (acc, item) => {
      (acc[item.type] = acc[item.type] || []).push(item);
      return acc;
    },
    {} as Record<string, SearchResult[]>
  );

  const flatResults = Object.values(grouped).flat();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const navigate = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, flatResults.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && flatResults[selectedIndex]) {
        navigate(flatResults[selectedIndex].href);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, flatResults, selectedIndex, navigate]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
        title="Search (Cmd+K)"
      >
        <Search className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-lg z-50"
            >
              <div className="card py-0 overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
                  <Search className="w-5 h-5 text-white/40" />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search students, teachers, classes..."
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setSelectedIndex(0);
                    }}
                    className="flex-1 bg-transparent text-white placeholder-white/30 text-sm focus:outline-none"
                  />
                  <kbd className="text-[10px] text-white/30 bg-white/5 px-1.5 py-0.5 rounded">
                    ESC
                  </kbd>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {flatResults.length === 0 ? (
                    <div className="py-8 text-center text-white/40 text-sm">
                      No results found
                    </div>
                  ) : (
                    Object.entries(grouped).map(([type, items]) => (
                      <div key={type}>
                        <div className="px-4 py-2 text-[10px] uppercase tracking-wider text-white/30 font-semibold">
                          {type}
                        </div>
                        {items.map((item) => {
                          const idx = flatResults.indexOf(item);
                          const Icon = iconMap[item.type];
                          return (
                            <button
                              key={item.id}
                              onClick={() => navigate(item.href)}
                              onMouseEnter={() => setSelectedIndex(idx)}
                              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                                idx === selectedIndex
                                  ? "bg-white/10"
                                  : "hover:bg-white/5"
                              }`}
                            >
                              <Icon
                                className={`w-4 h-4 flex-shrink-0 ${colorMap[item.type]}`}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium truncate">
                                  {item.title}
                                </p>
                                <p className="text-white/40 text-xs truncate">
                                  {item.subtitle}
                                </p>
                              </div>
                              <ArrowRight className="w-3.5 h-3.5 text-white/20 flex-shrink-0" />
                            </button>
                          );
                        })}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
