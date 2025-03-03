'use client';

import { UserNav } from "@/components/user-nav";
import { Shell } from "@/components/shell";
import { format } from "date-fns";
import { Clock } from "@/components/nav/clock";
import { Calendar } from "lucide-react";

interface HeaderProps {
  children?: React.ReactNode;
}

export function Header({ children }: HeaderProps) {
  const currentDate = format(new Date(), "do MMM yyyy");

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Shell layout="dashboard">
        <div className="flex h-[60px] items-center justify-between">
          <div className="flex items-center gap-4">
            {children}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-blue-500/10 px-3 py-1.5 rounded-lg">
                <Calendar className="h-4 w-4 md:h-6 md:w-6  text-blue-500" />
                <span className="text-sm font-medium bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">
                  {currentDate}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <Clock />
            <div className="md:hidden">
            <UserNav isCollapsed= {true} />
            </div>
          </div>
        </div>
      </Shell>
    </header>
  );
} 