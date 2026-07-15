"use client";

import { useState } from "react";
import { Download, ChevronDown } from "lucide-react";

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  periods?: string[];
  onPeriodChange?: (period: string) => void;
  onExport?: () => void;
}

export function ChartCard({
  title,
  children,
  periods = ["7D", "1M", "3M", "6M", "1Y"],
  onPeriodChange,
  onExport,
}: ChartCardProps) {
  const [activePeriod, setActivePeriod] = useState(periods[0]);

  const handlePeriodChange = (period: string) => {
    setActivePeriod(period);
    onPeriodChange?.(period);
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-semibold text-lg">{title}</h3>
        <div className="flex items-center gap-3">
          <div className="flex bg-white/5 rounded-lg p-0.5">
            {periods.map((period) => (
              <button
                key={period}
                onClick={() => handlePeriodChange(period)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  activePeriod === period
                    ? "bg-[var(--primary)] text-white"
                    : "text-white/50 hover:text-white"
                }`}
              >
                {period}
              </button>
            ))}
          </div>
          {onExport && (
            <button
              onClick={onExport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-white/60 hover:text-white hover:bg-white/10 text-xs transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
