"use client";

import { motion } from "framer-motion";

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

export function LoadingSpinner({ size = 40, className = "" }: LoadingSpinnerProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        style={{ width: size, height: size }}
        className="relative"
      >
        <div
          className="absolute inset-0 rounded-full border-2 border-white/10"
          style={{ borderTopColor: "var(--primary)" }}
        />
        <div
          className="absolute inset-1 rounded-full border-2 border-transparent"
          style={{
            borderBottomColor: "var(--accent)",
            animationDuration: "1.5s",
          }}
        />
      </motion.div>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-screen bg-animated flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size={48} />
        <p className="text-white/50 text-sm">Loading...</p>
      </div>
    </div>
  );
}
