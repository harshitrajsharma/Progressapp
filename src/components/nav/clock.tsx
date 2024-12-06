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
    <div className="text-md text-red-500 md:text-xl font-medium">
      {format(time, "hh:mm:ss a")}
    </div>
  );
} 