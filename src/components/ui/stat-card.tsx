"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  change?: string;
  trend?: "up" | "down";
  icon: LucideIcon;
  color?: string;
  delay?: number;
}

function CountUp({ target }: { target: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));
  const displayRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const controls = animate(count, target, {
      duration: 1.5,
      ease: "easeOut",
    });
    return controls.stop;
  }, [count, target]);

  useEffect(() => {
    const unsubscribe = rounded.on("change", (v) => {
      if (displayRef.current) {
        displayRef.current.textContent = v.toLocaleString();
      }
    });
    return unsubscribe;
  }, [rounded]);

  return <span ref={displayRef}>0</span>;
}

export function StatCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  color = "from-blue-500 to-blue-600",
  delay = 0,
}: StatCardProps) {
  const isNumeric = typeof value === "number";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="bg-white/[0.04] backdrop-blur-xl rounded-xl border border-white/[0.07] p-3 group"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-white/40 text-[11px] font-medium">{title}</p>
          <p className="text-[22px] font-bold text-white leading-tight mt-0.5">
            {isNumeric ? <CountUp target={value} /> : value}
          </p>
          {change && (
            <div className="flex items-center gap-1 mt-1.5">
              {trend === "up" ? (
                <TrendingUp className="w-3 h-3 text-emerald-400" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-400" />
              )}
              <span className={`text-[11px] font-medium ${trend === "up" ? "text-emerald-400" : "text-red-400"}`}>
                {change}
              </span>
              <span className="text-white/25 text-[10px]">vs last month</span>
            </div>
          )}
        </div>
        <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform flex-shrink-0`}>
          <Icon className="w-[18px] h-[18px] text-white" />
        </div>
      </div>
    </motion.div>
  );
}