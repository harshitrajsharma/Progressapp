'use client';

import { UserNav } from "@/components/user-nav";
import { MobileSidebar } from "@/components/nav/sidebar";
import { Shell } from "@/components/shell";
import { format } from "date-fns";
import { Clock } from "@/components/nav/clock";

export function Header() {
  const currentDate = format(new Date(), "do MMM yyyy");

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Shell layout="dashboard">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <MobileSidebar />
              <span className="text-sm font-medium">
                {currentDate}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Clock />
            <UserNav />
          </div>
        </div>
      </Shell>
    </header>
  );
} 