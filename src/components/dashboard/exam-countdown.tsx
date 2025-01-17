"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  differenceInDays, 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday,
  startOfWeek,
  endOfWeek,
  addMonths,
  isBefore,
  isAfter
} from "date-fns";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DailyActivity {
  date: Date;
  studyTime: number;
}

interface ExamCountdownProps {
  examDate: Date;
  dailyActivities: DailyActivity[];
  variant?: 'sidebar' | 'dashboard';
}

export function ExamCountdown({ examDate, dailyActivities, variant = 'dashboard' }: ExamCountdownProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [daysLeft, setDaysLeft] = useState(0);

  const isSidebar = variant === 'sidebar';

  useEffect(() => {
    // Update current date and days left every day
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentDate(now);
      setDaysLeft(differenceInDays(examDate, now));
    }, 1000 * 60 * 60); // Update every hour

    setDaysLeft(differenceInDays(examDate, currentDate));

    return () => clearInterval(timer);
  }, [examDate, currentDate]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  // Get all days including those from previous/next months to fill the calendar grid
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Get activity level for a day (0: no activity, 1: low, 2: medium, 3: high)
  const getActivityLevel = (date: Date): number => {
    const activity = dailyActivities.find(a => 
      isSameDay(new Date(a.date), date)
    );
    
    if (!activity) return 0;
    
    const hours = activity.studyTime / 60;
    if (hours >= 6) return 3;
    if (hours >= 4) return 2;
    if (hours > 0) return 1;
    return 0;
  };

  const nextMonth = () => {
    const nextDate = addMonths(currentMonth, 1);
    if (isBefore(nextDate, addMonths(examDate, 1))) {
      setCurrentMonth(nextDate);
    }
  };

  const prevMonth = () => {
    const prevDate = addMonths(currentMonth, -1);
    const startDate = new Date();
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);
    
    if (!isBefore(prevDate, startDate)) {
      setCurrentMonth(prevDate);
    }
  };

  // Function to get activity background color
  const getActivityColor = (level: number): string => {
    switch (level) {
      case 1: return "bg-[#40c463]/40"; // Light green
      case 2: return "bg-[#2ea043]"; // Medium green
      case 3: return "bg-[#216e39]"; // Dark green
      default: return "";
    }
  };

  // Check if next/prev buttons should be disabled
  const canGoNext = isBefore(addMonths(currentMonth, 1), addMonths(examDate, 1));
  const startDate = new Date();
  startDate.setDate(1);
  startDate.setHours(0, 0, 0, 0);
  const canGoPrev = !isBefore(addMonths(currentMonth, -1), startDate);

  const content = (
    <div className={cn(
      "space-y-3",
      !isSidebar && "p-6"
    )}>
      {/* Days Left Counter */}
      <div className={cn(
        "text-center bg-[#216e39]/10 rounded-lg",
        isSidebar ? "p-2" : "p-4"
      )}>
        <div className={cn(
          "font-bold text-[#2ea043] font-mono tracking-tight",
          isSidebar ? "text-3xl" : "text-5xl mb-2"
        )}>
          {daysLeft}
        </div>
        <div className={cn(
          "text-muted-foreground font-medium",
          isSidebar ? "text-xs" : "text-sm"
        )}>
          Days until {format(examDate, 'dd MMM yyyy')}
        </div>
      </div>

      {/* Calendar */}
      <div className="rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <Calendar className={cn(
              "text-[#2ea043]",
              isSidebar ? "h-3 w-3" : "h-4 w-4"
            )} />
            <h2 className={cn(
              "font-semibold text-foreground",
              isSidebar ? "text-xs" : "text-sm"
            )}>
              {format(currentMonth, isSidebar ? 'MMM yyyy' : 'MMMM yyyy')}
            </h2>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "hover:bg-[#216e39]/10",
                isSidebar ? "h-5 w-5" : "h-7 w-7"
              )}
              onClick={prevMonth}
              disabled={!canGoPrev}
            >
              <ChevronLeft className={isSidebar ? "h-3 w-3" : "h-4 w-4"} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "hover:bg-[#216e39]/10",
                isSidebar ? "h-5 w-5" : "h-7 w-7"
              )}
              onClick={nextMonth}
              disabled={!canGoNext}
            >
              <ChevronRight className={isSidebar ? "h-3 w-3" : "h-4 w-4"} />
            </Button>
          </div>
        </div>

        <div className={cn(
          "grid grid-cols-7 gap-1 mb-1",
          isSidebar ? "text-[10px]" : "text-xs"
        )}>
          {(isSidebar ? ['S', 'M', 'T', 'W', 'T', 'F', 'S'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']).map(day => (
            <div key={day} className="text-center text-muted-foreground font-medium">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const activityLevel = getActivityLevel(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isExamDay = isSameDay(day, examDate);
            const isFutureDay = isAfter(day, examDate);
            
            return (
              <div
                key={day.toString()}
                className={cn(
                  "aspect-square flex items-center justify-center relative",
                  isSidebar ? "text-[10px]" : "text-xs",
                  !isCurrentMonth && "text-muted-foreground/50",
                  isExamDay && "bg-red-500/20 rounded-full font-bold text-red-600 dark:text-red-400",
                  !isExamDay && !isFutureDay && getActivityColor(activityLevel),
                  "rounded-full",
                  isToday(day) && "ring-1 ring-[#2ea043] ring-offset-1 ring-offset-background",
                  isFutureDay && "text-muted-foreground/30"
                )}
              >
                <span className={cn(
                  "z-10 relative",
                  isExamDay && "text-red-600 dark:text-red-400 font-bold",
                  activityLevel > 1 && !isFutureDay && "text-white"
                )}>
                  {format(day, 'd')}
                </span>
                {isExamDay && (
                  <span className="absolute inset-0 animate-ping bg-red-500/20 rounded-full" />
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className={cn(
          "flex items-center justify-between text-muted-foreground border-t",
          isSidebar ? "mt-2 pt-2 text-[10px]" : "mt-4 pt-3 text-xs"
        )}>
          <div className={cn(
            "flex items-center",
            isSidebar ? "gap-2" : "gap-3"
          )}>
            <div className="flex items-center gap-1">
              <div className={cn(
                "bg-[#40c463]/40 rounded-full",
                isSidebar ? "w-1.5 h-1.5" : "w-2 h-2"
              )} />
              <span>{isSidebar ? "Light" : "Light Activity"}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className={cn(
                "bg-[#2ea043] rounded-full",
                isSidebar ? "w-1.5 h-1.5" : "w-2 h-2"
              )} />
              <span>{isSidebar ? "Med" : "Medium"}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className={cn(
                "bg-[#216e39] rounded-full",
                isSidebar ? "w-1.5 h-1.5" : "w-2 h-2"
              )} />
              <span>{isSidebar ? "High" : "Heavy"}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <div className={cn(
              "bg-red-500/20 rounded-full",
              isSidebar ? "w-1.5 h-1.5" : "w-2 h-2"
            )} />
            <span className="text-red-600 dark:text-red-400 font-medium">
              {isSidebar ? "Exam" : "Exam Day"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  if (variant === 'dashboard') {
    return (
      <Card className="bg-background">
        <CardContent className="p-0">
          {content}
        </CardContent>
      </Card>
    );
  }

  return content;
} 