"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-sm text-[#94a3b8] mb-4">
      <Link
        href="/dashboard"
        className="hover:text-[#1a1a2e] transition-colors flex items-center gap-1"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Home</span>
      </Link>
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <ChevronRight className="w-3.5 h-3.5 text-[#cbd5e1]" />
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-[#1a1a2e] transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-[#1a1a2e] font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
