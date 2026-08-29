"use client";

import { motion } from "framer-motion";
import { LucideIcon, Inbox } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon = Inbox,
  title = "No data found",
  description = "There's nothing to show here yet.",
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-[#f1f5f9] flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-[#cbd5e1]" />
      </div>
      <h3 className="text-[#1a1a2e] font-semibold text-lg mb-1">{title}</h3>
      <p className="text-[#64748b] text-sm max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 rounded-xl bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-all"
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
}
