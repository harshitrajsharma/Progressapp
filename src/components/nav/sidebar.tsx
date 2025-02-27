'use client';

import React, { useMemo, useCallback, useState, useRef, useEffect } from 'react';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  ChevronLeft,
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
import Image from 'next/image';

// Memoized navigation link component to reduce unnecessary re-renders
interface NavigationLinkProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  color: string;
  isActive: boolean;
  isCollapsed: boolean;
}

const NavigationLink = React.memo(({
  href,
  icon: Icon,
  label,
  color,
  isActive,
  isCollapsed,
}: NavigationLinkProps) => (
  <Link href={href} aria-label={isCollapsed ? label : undefined}>
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start gap-2 transition-colors duration-200",
        isActive && "bg-secondary",
        "hover:bg-secondary/50 focus-visible:ring-2 focus-visible:ring-offset-1"
      )}
      aria-current={isActive ? "page" : undefined}
      role="menuitem"
    >
      <Icon className={cn(
        `h-5 w-5 ${color}`,
        isActive ? "opacity-100" : "opacity-70 "
      )} />
      {!isCollapsed && <span className="transition-opacity duration-300 truncate">{label}</span>}
    </Button>
  </Link>
));

NavigationLink.displayName = 'NavigationLink';

interface DailyActivity {
  id: string;
  date: Date;
}

interface SidebarProps {
  isCollapsed: boolean;
  examDate: Date;
  subjects: SubjectWithRelations[];
  dailyActivities?: DailyActivity[];
  onToggleCollapse?: (newState: boolean) => void;
}

export function Sidebar({
  isCollapsed,
  examDate,
  subjects,
  onToggleCollapse
}: SidebarProps) {
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Memoize complex calculations and derivations
  const progress = useMemo(() => calculateDashboardProgress(subjects), [subjects]);
  const isDashboard = useMemo(() => pathname === "/dashboard", [pathname]);
  const isAnalytics = useMemo(() => pathname === "/analytics", [pathname]);

  // Optimize localStorage interaction with useCallback
  const toggleSidebar = useCallback(() => {
    const newState = !isCollapsed;
    
    // Debounce localStorage operations for performance
    window.clearTimeout(window.sidebarToggleTimer as number);
    window.sidebarToggleTimer = window.setTimeout(() => {
      localStorage.setItem('sidebarCollapsed', String(newState));
      window.dispatchEvent(new Event('storage'));
    }, 50);
    
    // Notify parent component of state change
    if (onToggleCollapse) {
      onToggleCollapse(newState);
    }
    
    return newState;
  }, [isCollapsed, onToggleCollapse]);

  // Implement keyboard shortcut (Ctrl+B) for toggling sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);

  // Implement intelligent hover intent detection
  /*
  useEffect(() => {
    if (!sidebarRef.current) return;
    
    let hoverTimer: number;
    const handleMouseEnter = () => {
      if (isCollapsed) {
        hoverTimer = window.setTimeout(() => {
          // Only auto-expand if device is not mobile/tablet
          if (window.innerWidth >= 1024) {
            toggleSidebar();
          }
        }, 1000); // Intent confirmation delay
      }
      else{
        hoverTimer = window.setTimeout(() => {
          // Only auto-collapse if device is not mobile/tablet
          if (window.innerWidth >= 1024) {
            toggleSidebar();
          }
        }, 1000); // Intent confirmation delay
      }
    };
    
    const handleMouseLeave = () => {
      window.clearTimeout(hoverTimer);
    };
    
    const element = sidebarRef.current;
    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      window.clearTimeout(hoverTimer);
    };
  }, [isCollapsed, toggleSidebar]); 
  */

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
            <span className="text-white text-xs font-bold" aria-label={`${daysRemaining - 1} days remaining`}>
              {daysRemaining - 1}
            </span>
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
    <div 
      ref={sidebarRef}
      id="main-sidebar" 
      className="relative flex h-full w-full flex-col"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Sidebar Header */}
      <div className="flex h-[60px] border-b justify-center items-center p-4">
        <Link
          href="/dashboard"
          className={cn(
            "flex items-center gap-2 font-semibold",
            isCollapsed ? "justify-center" : "flex-1",
          )}
          aria-label="Progress Tracking Dashboard"
        >
          <Image src="/xMWLogo.svg" alt='Logo' width={100} height={100} className="h-7 w-7 text-blue-500" />
          {!isCollapsed && <span className="truncate">Progress Tracking</span>}
        </Link>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className={`absolute top-4 right-4 z-50 h-8 w-8 shrink-0 ${isCollapsed && 'right-1 w-4 '}`}
        onClick={() => toggleSidebar()}
        aria-label={isCollapsed ? "Expand sidebar (Ctrl+B)" : "Collapse sidebar (Ctrl+B)"}
        aria-expanded={!isCollapsed}
        title={isCollapsed ? "Expand sidebar (Ctrl+B)" : "Collapse sidebar (Ctrl+B)"}
      >
        <ChevronLeft
          className={cn(
            "h-4 w-4 transition-transform",
            isCollapsed && "rotate-180"
          )}
        />
      </Button>

      <div className="flex flex-col flex-1 p-4 justify-between">
        {/* Navigation Links */}
        <div className="flex flex-col gap-2" role="menu">
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
            aria-label="Log out"
          >
            <LogOut className="h-5 w-5 text-red-500" />
            {!isCollapsed && <span>Log out</span>}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Mobile Sidebar with enhanced touch interactions
export function MobileSidebar({
  examDate,
  subjects
}: Omit<SidebarProps, 'isCollapsed'>) {
  const [isOpen, setIsOpen] = useState(false);
  const [localIsCollapsed, setLocalIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sidebarCollapsed');
      return stored === 'true';
    }
    return false;
  });
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const sheetContentRef = useRef<HTMLDivElement>(null);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
  
  const handleTouchEnd = () => {
    const swipeDistance = touchEndX.current - touchStartX.current;
    const swipeThreshold = 80;
    
    if (swipeDistance < -swipeThreshold && isOpen) {
      setIsOpen(false);
    }
  };

  // Handle storage events to keep state in sync
  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem('sidebarCollapsed');
      setLocalIsCollapsed(stored === 'true');
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleCollapseChange = useCallback((newState: boolean) => {
    setLocalIsCollapsed(newState);
  }, []);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Open Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="left" 
        className="p-0"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        ref={sheetContentRef}
      >
        <Sidebar
          isCollapsed={localIsCollapsed}
          examDate={examDate}
          subjects={subjects}
          onToggleCollapse={handleCollapseChange}
        />
      </SheetContent>
    </Sheet>
  );
}

// Add TypeScript window extension for timer property
declare global {
  interface Window {
    sidebarToggleTimer: number;
  }
}