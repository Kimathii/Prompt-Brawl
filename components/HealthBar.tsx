"use client";

import { motion } from "framer-motion";

interface HealthBarProps {
  value: number;
  side: "A" | "B";
  label: string;
}

export default function HealthBar({ value, side, label }: HealthBarProps) {
  const colorClass = side === "A" ? "bg-fighterA" : "bg-fighterB";
  const align = side === "A" ? "items-start" : "items-end";
  const critical = value <= 25;

  return (
    <div className={`flex flex-col gap-1.5 w-full ${align}`}>
      <span className="font-display text-xs sm:text-sm tracking-wide text-ink/90 uppercase">
        {label}
      </span>
      <div className="w-full h-2.5 rounded-full bg-panel border border-line overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${colorClass} ${critical ? "animate-pulse-slow" : ""}`}
          initial={false}
          animate={{ width: `${Math.max(0, Math.min(100, value))}%` }}
          transition={{ type: "spring", stiffness: 220, damping: 28 }}
        />
      </div>
    </div>
  );
}
