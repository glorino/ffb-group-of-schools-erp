"use client";

import { cn } from "@/lib/utils";

type StatusType =
  | "active"
  | "inactive"
  | "pending"
  | "approved"
  | "rejected"
  | "paid"
  | "unpaid"
  | "partial"
  | "excellent"
  | "good"
  | "fair"
  | "poor";

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  className?: string;
}

const statusStyles: Record<StatusType, string> = {
  active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  inactive: "bg-white/5 text-white/50 border-white/10",
  pending: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  approved: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  rejected: "bg-red-500/20 text-red-400 border-red-500/30",
  paid: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  unpaid: "bg-red-500/20 text-red-400 border-red-500/30",
  partial: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  excellent: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  good: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  fair: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  poor: "bg-red-500/20 text-red-400 border-red-500/30",
};

const dotStyles: Record<StatusType, string> = {
  active: "bg-emerald-400",
  inactive: "bg-white/40",
  pending: "bg-orange-400",
  approved: "bg-emerald-400",
  rejected: "bg-red-400",
  paid: "bg-emerald-400",
  unpaid: "bg-red-400",
  partial: "bg-yellow-400",
  excellent: "bg-emerald-400",
  good: "bg-blue-400",
  fair: "bg-orange-400",
  poor: "bg-red-400",
};

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border",
        statusStyles[status],
        className
      )}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[status]}`} />
      {label || status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
