import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
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
  isAfter
} from "date-fns";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface ActivityDetails {
  learning: number;
  revision: number;
  practice: number;
  test: number;
}

interface ActivityData {
  date: Date;
  studyTime: number;
  totalCount?: number;
  details: ActivityDetails;
}

interface MonthActivity {
  date: string;
  totalCount: number;
  learning: number;
  revision: number;
  practice: number;
  test: number;
}

interface ActivityCalendarProps {
  variant?: 'sidebar' | 'dashboard';
  onSelectDate?: (date: Date) => void;
  selectedDate?: Date;
  examDate: Date | null;
}

// Function to fetch activities for a month
async function fetchMonthActivities(monthStart: Date, monthEnd: Date): Promise<ActivityData[]> {
  const response = await fetch(
    `/api/analytics/calendar/month?start=${monthStart.toISOString()}&end=${monthEnd.toISOString()}`
  );
  if (!response.ok) throw new Error('Failed to fetch activities');
  const data = await response.json();
  return data.map((activity: MonthActivity) => ({
    date: new Date(activity.date),
    studyTime: activity.totalCount * 60,
    totalCount: activity.totalCount,
    details: {
      learning: activity.learning,
      revision: activity.revision,
      practice: activity.practice,
      test: activity.test
    }
  }));
}

export function ActivityCalendar({ 
  variant = 'dashboard',
  onSelectDate,
  selectedDate,
  examDate
}: ActivityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const queryClient = useQueryClient();
  const isSidebar = variant === 'sidebar';

  // Query for activities
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const { data: activities = [] } = useQuery<ActivityData[]>({
    queryKey: ['activities', monthStart.toISOString()],
    queryFn: () => fetchMonthActivities(monthStart, monthEnd),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  // Prefetch next month's activities
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(addMonths(currentMonth, -1));
  };

  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  // Get all days including those from previous/next months to fill the calendar grid
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Get activity level for a day (0: no activity, 1: low, 2: medium, 3: high)
  const getActivityLevel = (date: Date): number => {
    const activity = activities.find((a) => 
      isSameDay(new Date(a.date), date)
    );
    
    if (!activity?.totalCount) return 0;
    
    if (activity.totalCount >= 10) return 3;
    if (activity.totalCount >= 5) return 2;
    if (activity.totalCount >= 1) return 1;
    return 0;
  };

  // Function to get activity background color
  const getActivityColor = (level: number): string => {
    switch (level) {
      case 1: return "bg-green-200 hover:bg-green-300 dark:bg-green-900/30 dark:hover:bg-green-900/40";
      case 2: return "bg-green-400 hover:bg-green-500 dark:bg-green-700 dark:hover:bg-green-600";
      case 3: return "bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-400";
      default: return "hover:bg-green-100 dark:hover:bg-green-900/20";
    }
  };

  // Function to get activity tooltip content
  const getActivityTooltip = (date: Date): string => {
    const activity = activities.find((a) => isSameDay(new Date(a.date), date));
    if (!activity?.totalCount) return "No activities";
    
    const { details } = activity;
    return `${activity.totalCount} activities\n` +
           `Learning: ${details.learning}\n` +
           `Revision: ${details.revision}\n` +
           `Practice: ${details.practice}\n` +
           `Test: ${details.test}`;
  };

  const handleDateClick = (date: Date) => {
    if (onSelectDate && (!examDate || !isAfter(date, examDate))) {
      onSelectDate(date);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Calendar className={cn(
            "text-green-500",
            isSidebar ? "h-3 w-3" : "h-3.5 w-3.5 sm:h-4 sm:w-4"
          )} />
          <h2 className={cn(
            "font-semibold text-foreground",
            isSidebar ? "text-xs" : "text-xs sm:text-sm"
          )}>
            {format(currentMonth, isSidebar ? 'dd MMM yyyy' : 'dd MMMM yyyy')}
          </h2>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "hover:bg-green-900/10",
              isSidebar ? "h-5 w-5" : "h-6 w-6 sm:h-7 sm:w-7"
            )}
            onClick={prevMonth}
          >
            <ChevronLeft className={isSidebar ? "h-3 w-3" : "h-3.5 w-3.5 sm:h-4 sm:w-4"} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "hover:bg-green-900/10",
              isSidebar ? "h-5 w-5" : "h-6 w-6 sm:h-7 sm:w-7"
            )}
            onClick={nextMonth}
          >
            <ChevronRight className={isSidebar ? "h-3 w-3" : "h-3.5 w-3.5 sm:h-4 sm:w-4"} />
          </Button>
        </div>
      </div>

      <div className={cn(
        "grid grid-cols-7 gap-1 mb-1",
        isSidebar ? "text-[10px]" : "text-[10px] sm:text-xs"
      )}>
        {(isSidebar ? ['S', 'M', 'T', 'W', 'T', 'F', 'S'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']).map(day => (
          <div key={day} className="text-center text-muted-foreground font-medium">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map(day => {
          const activityLevel = getActivityLevel(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isExamDay = examDate && isSameDay(day, examDate);
          const isFutureDay = examDate && isAfter(day, examDate);
          const isHovered = hoveredDate && isSameDay(day, hoveredDate);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          
          return (
            <Tooltip key={day.toString()}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handleDateClick(day)}
                  onMouseEnter={() => setHoveredDate(day)}
                  onMouseLeave={() => setHoveredDate(null)}
                  disabled={isFutureDay}
                  className={cn(
                    "aspect-square flex items-center justify-center relative transition-colors duration-150",
                    isSidebar ? "text-[10px]" : "text-[10px] sm:text-xs",
                    !isCurrentMonth && "text-muted-foreground/50",
                    isExamDay && "bg-red-500/20 rounded-md font-bold text-red-600 dark:text-red-400",
                    !isExamDay && !isFutureDay && getActivityColor(activityLevel),
                    "rounded-md",
                    isToday(day) && "ring-1 ring-green-500 ring-offset-1 ring-offset-background",
                    isFutureDay && "text-muted-foreground/30 cursor-not-allowed",
                    isHovered && !isFutureDay && !isExamDay && "bg-green-100 dark:bg-green-900/30",
                    isSelected && !isExamDay && "ring-2 ring-primary"
                  )}
                >
                  <span className={cn(
                    "z-10 relative",
                    isExamDay && "text-red-600 dark:text-red-400 font-bold",
                    activityLevel > 1 && !isFutureDay && "text-white dark:text-green-50"
                  )}>
                    {format(day, 'd')}
                  </span>
                  {isExamDay && (
                    <span className="absolute inset-0 animate-ping bg-red-500/20 rounded-md" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <pre className="text-xs whitespace-pre-line">
                  {getActivityTooltip(day)}
                </pre>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>

      {/* Legend */}
      <div className={cn(
        "flex items-center justify-between text-muted-foreground border-t",
        isSidebar ? "mt-2 pt-2 text-[10px]" : "mt-3 pt-3 sm:mt-4 sm:pt-3 text-[10px] sm:text-xs"
      )}>
        <div className={cn(
          "flex items-center",
          isSidebar ? "gap-2" : "gap-2 sm:gap-3"
        )}>
          <div className="flex items-center gap-1">
            <div className={cn(
              "bg-emerald-200 dark:bg-emerald-900/30 rounded-md",
              isSidebar ? "w-1.5 h-1.5" : "w-1.5 h-1.5 sm:w-2 sm:h-2"
            )} />
            <span>Light</span>
          </div>
          <div className="flex items-center gap-1">
            <div className={cn(
              "bg-emerald-400 dark:bg-emerald-700 rounded-md",
              isSidebar ? "w-1.5 h-1.5" : "w-1.5 h-1.5 sm:w-2 sm:h-2"
            )} />
            <span>Med</span>
          </div>
          <div className="flex items-center gap-1">
            <div className={cn(
              "bg-emerald-600 dark:bg-emerald-500 rounded-md",
              isSidebar ? "w-1.5 h-1.5" : "w-1.5 h-1.5 sm:w-2 sm:h-2"
            )} />
            <span>High</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <div className={cn(
            "bg-red-500/20 rounded-md",
            isSidebar ? "w-1.5 h-1.5" : "w-1.5 h-1.5 sm:w-2 sm:h-2"
          )} />
          <span className="text-red-600 dark:text-red-400 font-medium">
            {isSidebar ? "Exam" : "Exam Day"}
          </span>
        </div>
      </div>
    </div>
  );
} 