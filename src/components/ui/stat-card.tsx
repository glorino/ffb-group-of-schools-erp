"use client";

import { useEffect, useState, useRef, useCallback } from "react";
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="card group"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-white/50 text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">
            {isNumeric ? <CountUp target={value} /> : value}
          </p>
          {change && (
            <div className="flex items-center gap-1 mt-2">
              {trend === "up" ? (
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-400" />
              )}
              <span
                className={`text-sm font-medium ${
                  trend === "up" ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {change}
              </span>
              <span className="text-white/40 text-sm">vs last month</span>
            </div>
          )}
        </div>
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );
}
