"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";

export function Clock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    // Set initial time only after component mounts
    setTime(new Date());
    
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Don't render anything until after first client-side render
  if (!time) return null;

  return (
    <div className="bg-black/10 backdrop-blur-sm px-3 py-1.5 rounded-lg font-mono font-bold text-lg">
      <div className="flex items-center gap-1">
        <span className="text-emerald-500">{format(time, "HH")}</span>
        <span className="text-emerald-500 animate-pulse">:</span>
        <span className="text-emerald-500">{format(time, "mm")}</span>
        <span className="text-emerald-500 animate-pulse">:</span>
        <span className="text-emerald-500">{format(time, "ss")}</span>
        <span className="text-xs text-emerald-500/70 ml-1">{format(time, "a")}</span>
      </div>
    </div>
  );
} 