'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  ChevronLeft,
  GraduationCap,
  BarChart3,
  BookOpen,
  LogOut,
  Menu,
} from "lucide-react";

interface SidebarProps {
  isCollapsed: boolean;
}

export function Sidebar({ isCollapsed }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex h-[60px] items-center px-2">
        <Link 
          href="/dashboard" 
          className={cn(
            "flex items-center gap-2 font-semibold",
            isCollapsed ? "justify-center" : "flex-1"
          )}
        >
          <GraduationCap className="h-7 w-7 text-blue-500" />
          {!isCollapsed && <span>GATE CSE</span>}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => {
            const newState = !isCollapsed;
            localStorage.setItem('sidebarCollapsed', String(newState));
            window.dispatchEvent(new Event('storage'));
          }}
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform",
              isCollapsed && "rotate-180"
            )}
          />
        </Button>
      </div>

      <div className="flex flex-1 flex-col gap-2">
        <Link href="/dashboard">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-2",
              pathname?.startsWith("/dashboard") && "bg-secondary"
            )}
          >
            <BarChart3 className="h-5 w-5 text-blue-500" />
            {!isCollapsed && <span>Dashboard</span>}
          </Button>
        </Link>
        <Link href="/subjects">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-2",
              pathname?.startsWith("/subjects") && "bg-secondary"
            )}
          >
            <BookOpen className="h-5 w-5 text-green-500" />
            {!isCollapsed && <span>Subjects</span>}
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 hover:bg-destructive/10 hover:text-destructive"
          onClick={() => signOut()}
        >
          <LogOut className="h-5 w-5 text-red-500" />
          {!isCollapsed && <span>Log out</span>}
        </Button>
      </div>
    </div>
  );
}

export function MobileSidebar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Open Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0">
        <Sidebar isCollapsed={false} />
      </SheetContent>
    </Sheet>
  );
} 