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
  Calendar,
  ChartNoAxesCombined,
} from "lucide-react";
import { ExamCountdown } from "@/components/dashboard/exam-countdown";
import { SidebarProgressCard } from "./sidebar-progress-card";
import { calculateDashboardProgress } from "@/lib/calculations/dashboard-progress";
import { DailyActivity } from "@prisma/client";
import { SubjectWithRelations } from "@/lib/calculations/types";

interface SidebarProps {
  isCollapsed: boolean;
  examDate: Date;
  dailyActivities: DailyActivity[];
  subjects: SubjectWithRelations[];
}

function CollapsedExamCountdown({ daysLeft }: { daysLeft: number }) {
  return (
    <div className="flex items-center justify-center py-4">
      <div className="relative">
        <Calendar className="h-6 w-6 text-blue-500" />
        <div className="absolute -top-2 -right-2 bg-red-600 rounded-full w-5 h-5 flex items-center justify-center">
          <span className="text-white text-xs font-bold">{daysLeft - 1}</span>
        </div>
      </div>
    </div>
  );
}

export function Sidebar({
  isCollapsed,
  examDate,
  dailyActivities,
  subjects
}: SidebarProps) {
  const pathname = usePathname();
  const isDashboard = pathname === "/dashboard";
  const progress = calculateDashboardProgress(subjects);

  return (
    <div className="flex h-full w-full flex-col">
      {/* Header */}
      <div className="flex h-[60px] border-b items-center p-4">
        <Link
          href="/dashboard"
          className={cn(
            "flex items-center gap-2 font-semibold",
            isCollapsed ? "justify-center" : "flex-1"
          )}
        >
          <GraduationCap className="h-7 w-7 text-blue-500" />
          {!isCollapsed && <span>Progress Tracking</span>}
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

      <div className="flex flex-col flex-1 p-4 justify-between">
        {/* Top Navigation Links */}
        <div className="flex flex-col gap-2">
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
          <Link href="/analytics">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2",
                pathname?.startsWith("/subjects") && "bg-secondary"
              )}
            >
              <ChartNoAxesCombined className="h-5 w-5 text-yellow-500" />
              {!isCollapsed && <span>Analytics</span>}
            </Button>
          </Link>



          {/* Exam Countdown */}
          {examDate && !isDashboard && (
            <div className={cn(
              "my-4 border-t border-b py-2",
              isCollapsed ? "" : ""
            )}>
              {isCollapsed ? (
                <CollapsedExamCountdown daysLeft={Math.ceil((new Date(examDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} />
              ) : (
                <div className="px-2">
                  <ExamCountdown variant="sidebar" examDate={new Date(examDate)} dailyActivities={dailyActivities} />
                </div>
              )}
            </div>
          )}

          {/* Progress Card - Hidden on Dashboard */}
          {!isDashboard && (
            <div className="px-2 py-4 border-b">
              <SidebarProgressCard
                progress={progress}
                isCollapsed={isCollapsed}
                variant="sidebar"
              />
            </div>
          )}

        </div>



        {/* Bottom Logout Button */}
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
    </div>
  );
}

export function MobileSidebar({
  examDate,
  dailyActivities,
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
          dailyActivities={dailyActivities}
          subjects={subjects}
        />
      </SheetContent>
    </Sheet>
  );
} 