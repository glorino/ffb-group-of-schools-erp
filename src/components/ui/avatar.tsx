"use client";

import { cn, getInitials } from "@/lib/utils";

interface AvatarProps {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  status?: "online" | "offline" | "away";
  className?: string;
}

const sizeMap = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-lg",
};

const statusSizeMap = {
  sm: "w-2.5 h-2.5 border-[1.5px]",
  md: "w-3 h-3 border-2",
  lg: "w-3.5 h-3.5 border-2",
  xl: "w-4 h-4 border-2",
};

const statusColorMap = {
  online: "bg-emerald-400",
  offline: "bg-white/40",
  away: "bg-yellow-400",
};

const gradientColors = [
  "from-blue-500 to-blue-600",
  "from-emerald-500 to-emerald-600",
  "from-purple-500 to-purple-600",
  "from-orange-500 to-orange-600",
  "from-cyan-500 to-cyan-600",
  "from-pink-500 to-pink-600",
];

function getGradient(name: string) {
  const index =
    name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    gradientColors.length;
  return gradientColors[index];
}

export function Avatar({
  src,
  name,
  size = "md",
  status,
  className,
}: AvatarProps) {
  return (
    <div className={cn("relative inline-flex flex-shrink-0", className)}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={cn(
            "rounded-xl object-cover",
            sizeMap[size]
          )}
        />
      ) : (
        <div
          className={cn(
            "rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-bold",
            sizeMap[size],
            getGradient(name)
          )}
        >
          {getInitials(name)}
        </div>
      )}
      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-[var(--card)]",
            statusSizeMap[size],
            statusColorMap[status]
          )}
        />
      )}
    </div>
  );
}
