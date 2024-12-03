'use client';

import { UserNav } from "@/components/user-nav";
import { MobileSidebar } from "@/components/nav/sidebar";
import { Shell } from "@/components/shell";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Shell layout="dashboard">
        <div className="flex h-14 items-center">
          <div className="md:hidden">
            <MobileSidebar />
          </div>
          <div className="flex flex-1 items-center justify-end">
            <UserNav />
          </div>
        </div>
      </Shell>
    </header>
  );
} 