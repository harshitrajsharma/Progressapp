'use client';

import React, { useMemo, useCallback } from 'react';
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
  Calendar,
  ChartNoAxesCombined,
} from "lucide-react";
import { ExamCountdown } from "@/components/dashboard/exam-countdown";
import { SidebarProgressCard } from "./sidebar-progress-card";
import { calculateDashboardProgress } from "@/lib/calculations/dashboard-progress";
import { SubjectWithRelations } from "@/lib/calculations/types";

// Memoized navigation link component to reduce unnecessary re-renders
const NavigationLink = React.memo(({ 
  href, 
  icon: Icon, 
  label, 
  color,
  isActive, 
  isCollapsed,
}: { 
  href: string, 
  icon: React.ElementType, 
  label: string, 
  color: string,
  isActive: boolean, 
  isCollapsed: boolean ,
}) => (
  <Link href={href}>
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start gap-2 transition-colors duration-200",
        isActive && "bg-secondary",
        "hover:bg-secondary/50"
      )}
    >
      <Icon className={cn(
        `h-5 w-5 ${color}`,
        isActive ? "opacity-100" : "opacity-70 "
      )} />
      {!isCollapsed && <span className="transition-opacity duration-300">{label}</span>}
    </Button>
  </Link>
));

NavigationLink.displayName = 'NavigationLink';

interface SidebarProps {
  isCollapsed: boolean;
  examDate: Date;
  subjects: SubjectWithRelations[];
}

export function Sidebar({
  isCollapsed,
  examDate,
  subjects
}: SidebarProps) {
  const pathname = usePathname();

  // Memoize complex calculations and derivations
  const progress = useMemo(() => calculateDashboardProgress(subjects), [subjects]);
  const isDashboard = useMemo(() => pathname === "/dashboard", [pathname]);
  const isAnalytics = useMemo(() => pathname === "/analytics", [pathname]);

  // Optimize localStorage interaction with useCallback
  const toggleSidebar = useCallback(() => {
    const newState = !isCollapsed;
    localStorage.setItem('sidebarCollapsed', String(newState));
    window.dispatchEvent(new Event('storage'));
  }, [isCollapsed]);

  // Memoize navigation configurations
  const navigationItems = useMemo(() => [
    {
      href: "/dashboard",
      icon: BarChart3,
      label: "Dashboard",
      color: "text-blue-500",
      isActive: pathname?.startsWith("/dashboard")
    },
    {
      href: "/subjects",
      icon: BookOpen,
      label: "Subjects",
      color: "text-green-500",
      isActive: pathname?.startsWith("/subjects")
    },
    {
      href: "/analytics",
      icon: ChartNoAxesCombined,
      label: "Analytics",
      color: "text-yellow-500",
      isActive: pathname?.startsWith("/analytics")
    }
  ], [pathname]);

  // Render exam days remaining
  const renderExamCounter = useMemo(() => {
    if (!examDate || isDashboard || isAnalytics) return null;
    
    const daysRemaining = Math.max(0, Math.ceil((examDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
    
    return isCollapsed ? (
      <div className="flex items-center justify-center py-4">
        <div className="relative">
          <Calendar className="h-6 w-6 text-blue-500" />
          <div className="absolute -top-2 -right-2 bg-red-600 rounded-full w-5 h-5 flex items-center justify-center">
            <span className="text-white text-xs font-bold">{daysRemaining - 1}</span>
          </div>
        </div>
      </div>
    ) : (
      <div className="px-2">
        <ExamCountdown 
          variant="sidebar"
          examDate={examDate}
        />
      </div>
    );
  }, [examDate, isDashboard, isAnalytics, isCollapsed]);

  return (
    <div className="flex h-full w-full flex-col">
      {/* Sidebar Header */}
      <div className="flex h-[60px] border-b items-center p-4">
        <Link
          href="/dashboard"
          className={cn(
            "flex items-center gap-2 font-semibold",
            isCollapsed ? "justify-center" : "flex-1",
          )}
        >
          <GraduationCap className="h-7 w-7 text-blue-500" />
          {!isCollapsed && <span>Progress Tracking</span>}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={toggleSidebar}
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform",
              isCollapsed && "rotate-180"
            )}
          />
        </Button>
      </div>

      <div className="flex flex-col flex-1 p-4 justify-between">
        {/* Navigation Links */}
        <div className="flex flex-col gap-2">
          {navigationItems.map(item => (
            <NavigationLink
              key={item.href}
              {...item}
              isCollapsed={isCollapsed}
              color={item.color}
            />
          ))}

          {/* Exam Countdown Section */}
          {renderExamCounter && (
            <div className="border-t border-b py-2">
              {renderExamCounter}
            </div>
          )}

          {/* Progress Card */}
          {!isDashboard && (
            <div className="px-2 py-4 border-t border-b">
              <SidebarProgressCard
                progress={progress}
                isCollapsed={isCollapsed}
                variant="sidebar"
              />
            </div>
          )}
        </div>

        {/* Logout Button */}
        <div className="flex flex-col gap-2">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 hover:bg-destructive/10 hover:text-destructive transition-colors"
            onClick={() => signOut()}
          >
            <LogOut className="h-5 w-5 text-red-500" />
            {!isCollapsed && <span>Log out</span>}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Mobile Sidebar remains unchanged
export function MobileSidebar({
  examDate,
  subjects
}: Omit<SidebarProps, 'isCollapsed'>) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Open Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0">
        <Sidebar
          isCollapsed={false}
          examDate={examDate}
          subjects={subjects}
        />
      </SheetContent>
    </Sheet>
  );
}