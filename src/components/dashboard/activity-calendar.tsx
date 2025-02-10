import React, { useMemo, useCallback, useState, Suspense } from "react";
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
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  useQuery, 
  useQueryClient, 
  QueryClient, 
  QueryClientProvider 
} from "@tanstack/react-query";
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';

// Advanced Type Definitions with Enhanced Type Safety
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

// Centralized Error Handling Component
const ErrorFallback: React.FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
  return (
    <div 
      role="alert" 
      className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-center"
      aria-live="assertive"
    >
      <h2 className="text-red-600 dark:text-red-400 font-bold mb-2">
        Calendar Loading Error
      </h2>
      <p className="text-sm text-red-500 dark:text-red-300 mb-4">
        Unable to load activity calendar. {error.message}
      </p>
      <Button 
        onClick={resetErrorBoundary} 
        variant="destructive"
        aria-label="Retry loading calendar"
      >
        Try Again
      </Button>
    </div>
  );
};

// Skeleton Loading State Component
const CalendarSkeleton: React.FC<{ variant?: 'sidebar' | 'dashboard' }> = () => {

  return (
    <div className="animate-pulse space-y-4">
      <div className="grid grid-cols-7 gap-1">
        {[...Array(42)].map((_, index) => (
          <div 
            key={index} 
            className="aspect-square bg-gray-100 dark:bg-gray-800 rounded"
          />
        ))}
      </div>
    </div>
  );
};

// Memoized Data Fetching with Advanced Error Handling
const fetchMonthActivities = async (monthStart: Date, monthEnd: Date): Promise<ActivityData[]> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second timeout

  try {
    const response = await fetch(
      `/api/analytics/calendar/month?start=${monthStart.toISOString()}&end=${monthEnd.toISOString()}`,
      { 
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-store',
          'Pragma': 'no-cache'
        }
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }
    
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
  } catch (error) {
    clearTimeout(timeoutId);
    console.error("Sophisticated Error in Activity Fetching:", error);
    throw error;
  }
};

export function ActivityCalendar({ 
  variant = 'dashboard',
  onSelectDate,
  selectedDate,
  examDate
}: ActivityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const isSidebar = variant === 'sidebar';
  const queryClient = useQueryClient();

  // Enhanced Query with Sophisticated Caching Strategy
  const monthStart = useMemo(() => startOfMonth(currentMonth), [currentMonth]);
  const monthEnd = useMemo(() => endOfMonth(currentMonth), [currentMonth]);
  
  const { 
    data: activities = [], 
    isLoading, 
    error,
    refetch 
  } = useQuery<ActivityData[]>({
    queryKey: ['activities', monthStart.toISOString()],
    queryFn: () => fetchMonthActivities(monthStart, monthEnd),
    staleTime: 5 * 60 * 1000,   // 5 minutes
    gcTime: 30 * 60 * 1000,      // 30 minutes cache retention
    retry: 2,                    // Retry mechanism
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  });

  // Memoized Navigation Functions
  const nextMonth = useCallback(() => {
    setCurrentMonth(prev => addMonths(prev, 1));
  }, []);

  const prevMonth = useCallback(() => {
    setCurrentMonth(prev => addMonths(prev, -1));
  }, []);

  // Performance-Optimized Calendar Calculations
  const calendarStart = useMemo(() => startOfWeek(monthStart), [monthStart]);
  const calendarEnd = useMemo(() => endOfWeek(monthEnd), [monthEnd]);
  const days = useMemo(() => 
    eachDayOfInterval({ start: calendarStart, end: calendarEnd }),
    [calendarStart, calendarEnd]
  );

  // Memoized Activity Computation Functions
  const getActivityLevel = useCallback((date: Date): number => {
    const activity = activities.find((a) => isSameDay(new Date(a.date), date));
    
    if (!activity?.totalCount) return 0;
    
    if (activity.totalCount >= 10) return 3;
    if (activity.totalCount >= 5) return 2;
    if (activity.totalCount >= 1) return 1;
    return 0;
  }, [activities]);

  const getActivityColor = useCallback((level: number): string => {
    switch (level) {
      case 1: return "bg-green-200 dark:bg-green-900/30";
      case 2: return "bg-green-400 dark:bg-green-700";
      case 3: return "bg-green-600 dark:bg-green-500";
      default: return "";
    }
  }, []);

  const getActivityTooltip = useCallback((date: Date): string => {
    const activity = activities.find((a) => isSameDay(new Date(a.date), date));
    if (!activity?.totalCount) return "No activities";
    
    const { details } = activity;
    return `${activity.totalCount} activities\n` +
           `Learning: ${details.learning}\n` +
           `Revision: ${details.revision}\n` +
           `Practice: ${details.practice}\n` +
           `Test: ${details.test}`;
  }, [activities]);

  const handleDateClick = useCallback((date: Date) => {
    if (onSelectDate && (!examDate || !isAfter(date, examDate))) {
      onSelectDate(date);
    }
  }, [onSelectDate, examDate]);

  // Accessibility-Enhanced Date Rendering
  const renderCalendarGrid = () => {
    if (isLoading) return <CalendarSkeleton variant={variant} />;
    if (error) throw error;  // Trigger error boundary

    return (
      <div 
        className="grid grid-cols-7 gap-1" 
        role="grid" 
        aria-label={`Activity Calendar for ${format(currentMonth, 'MMMM yyyy')}`}
      >
        {days.map(day => {
          const activityLevel = getActivityLevel(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isExamDay = examDate && isSameDay(day, examDate);
          const isFutureDay = examDate && isAfter(day, examDate);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          
          return (
            <Tooltip key={day.toString()}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handleDateClick(day)}
                  disabled={!!isFutureDay}
                  aria-label={`${format(day, 'MMMM d, yyyy')} activities`}
                  aria-pressed={selectedDate ? isSameDay(day, selectedDate) : false}
                  aria-disabled={isFutureDay || undefined}
                  className={cn(
                    "aspect-square flex items-center justify-center relative transition-colors duration-100",
                    isSidebar ? "text-[10px]" : "text-[10px] sm:text-xs",
                    !isCurrentMonth && "text-muted-foreground/50",
                    isExamDay && "bg-red-500/20 rounded-md text-red-600 dark:text-red-400",
                    !isExamDay && !isFutureDay && getActivityColor(activityLevel),
                    "rounded-md",
                    isToday(day) && "ring-1 ring-green-500/50",
                    isFutureDay && "text-muted-foreground/30 cursor-not-allowed",
                    isSelected && !isExamDay && "ring-2 ring-primary/50"
                  )}
                >
                  <span className={cn(
                    "z-10 relative",
                    isExamDay && "font-bold",
                    activityLevel > 1 && !isFutureDay && "text-white dark:text-green-50"
                  )}>
                    {format(day, 'd')}
                  </span>
                  {isExamDay && (
                    <span className="absolute inset-0 animate-ping bg-red-500/20 rounded-md" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <pre className="text-xs whitespace-pre-line">
                  {getActivityTooltip(day)}
                </pre>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    );
  };

  return (
    <ErrorBoundary 
      FallbackComponent={ErrorFallback}
      onReset={() => {
        refetch();
        queryClient.clear();
      }}
    >
      <div 
        className="space-y-4 select-none" 
        aria-live="polite"
      >
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
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
                "hover:bg-green-900/5 transition-colors",
                isSidebar ? "h-5 w-5" : "h-6 w-6 sm:h-7 sm:w-7"
              )}
              onClick={prevMonth}
              aria-label="Previous Month"
            >
              <ChevronLeft className={isSidebar ? "h-3 w-3" : "h-3.5 w-3.5 sm:h-4 sm:w-4"} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "hover:bg-green-900/5 transition-colors",
                isSidebar ? "h-5 w-5" : "h-6 w-6 sm:h-7 sm:w-7"
              )}
              onClick={nextMonth}
              aria-label="Next Month"
            >
              <ChevronRight className={isSidebar ? "h-3 w-3" : "h-3.5 w-3.5 sm:h-4 sm:w-4"} />
            </Button>
          </div>
        </div>

        {/* Days Header */}
        <div className={cn(
          "grid grid-cols-7 gap-1 mb-1 text-muted-foreground",
          isSidebar ? "text-[10px]" : "text-[10px] sm:text-xs"
        )}>
          {(isSidebar ? ['S', 'M', 'T', 'W', 'T', 'F', 'S'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']).map(day => (
            <div key={day} className="text-center font-medium opacity-70">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        {renderCalendarGrid()}

        {/* Legend */}
        <div className={cn(
          "flex items-center justify-between text-muted-foreground border-t",
          isSidebar ? "mt-2 pt-2 text-[10px]" : "mt-3 pt-3 sm:mt-4 sm:pt-3 text-[10px] sm:text-xs"
        )}>
          <div className={cn(
            "flex items-center",
            isSidebar ? "gap-2" : "gap-2 sm:gap-3"
          )}>
            {[
              { color: "bg-emerald-200 dark:bg-emerald-900/30", label: "Light", level: 1 },
              { color: "bg-emerald-400 dark:bg-emerald-700", label: "Med", level: 2 },
              { color: "bg-emerald-600 dark:bg-emerald-500", label: "High", level: 3 }
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1">
                <div className={cn(
                  color,
                  "rounded-md",
                  isSidebar ? "w-1.5 h-1.5" : "w-1.5 h-1.5 sm:w-2 sm:h-2"
                )} />
                <span>{label}</span>
              </div>
            ))}
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
    </ErrorBoundary>
  );
}

// Comprehensive Wrapper Component for Consistent Error Handling and Performance
export const EnhancedActivityCalendar: React.FC<ActivityCalendarProps> = (props) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,      // 5-minute stale time
        gcTime: 30 * 60 * 1000,         // 30-minute garbage collection
        refetchOnWindowFocus: false,    // Prevent unnecessary refetches
        retry: 2,                       // Intelligent retry mechanism
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
      }
    }
  });

  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<CalendarSkeleton variant={props.variant} />}>
        <ActivityCalendar {...props} />
      </Suspense>
    </QueryClientProvider>
  );
};

// Optional Utility Function for Date-Related Calculations
export const getCalendarUtils = () => ({
  isDateDisabled: (date: Date, examDate?: Date | null) => {
    return examDate ? isAfter(date, examDate) : false;
  },
  
  calculateActivityIntensity: (totalCount?: number): number => {
    if (!totalCount) return 0;
    if (totalCount >= 10) return 3;
    if (totalCount >= 5) return 2;
    if (totalCount >= 1) return 1;
    return 0;
  }
});