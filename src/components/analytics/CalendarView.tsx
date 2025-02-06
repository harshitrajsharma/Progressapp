import { Card } from "@/components/ui/card";
import { format, addDays, subDays, isToday } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo, useCallback, useEffect } from "react";
import { ActivityType } from "./activity-config";
import type { CalendarActivity, ActivityDetail } from "@/app/api/analytics/types";
import { StudyStreak } from "./StudyStreak";
import { ActivityFilters } from "./ActivityFilters";
import { ActivityList } from "./ActivityList";
import { useMediaQuery } from "@/hooks/use-media-query";
import { ExamCountdown } from "@/components/dashboard/exam-countdown";

interface CalendarViewProps {
  selectedDate: Date;
  onSelectDate: (date: Date | undefined) => void;
  examDate: Date | null;
}

async function fetchDayActivities(date: string): Promise<CalendarActivity> {
  const response = await fetch(`/api/analytics/calendar?date=${date}`);
  if (!response.ok) {
    throw new Error('Failed to fetch activities');
  }
  return response.json();
}

export function CalendarView({ selectedDate, onSelectDate, examDate }: CalendarViewProps) {
  const [selectedFilter, setSelectedFilter] = useState<ActivityType | null>(null);
  const queryClient = useQueryClient();
  const isMobile = useMediaQuery("(max-width: 768px)");

  // If no exam date is set, use a default date 90 days from now
  const effectiveExamDate = examDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

  // Query for selected day's activities
  const { data: activityData, isLoading } = useQuery({
    queryKey: ['calendar-activities', format(selectedDate, 'yyyy-MM-dd')],
    queryFn: () => fetchDayActivities(format(selectedDate, 'yyyy-MM-dd')),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });


  // Prefetch next and previous day data
  useEffect(() => {
    const nextDay = format(addDays(selectedDate, 1), 'yyyy-MM-dd');
    const prevDay = format(subDays(selectedDate, 1), 'yyyy-MM-dd');

    queryClient.prefetchQuery({
      queryKey: ['calendar-activities', nextDay],
      queryFn: () => fetchDayActivities(nextDay),
    });

    queryClient.prefetchQuery({
      queryKey: ['calendar-activities', prevDay],
      queryFn: () => fetchDayActivities(prevDay),
    });
  }, [selectedDate, queryClient]);

  const handlePreviousDay = useCallback(() =>
    onSelectDate(subDays(selectedDate, 1)), [selectedDate, onSelectDate]);

  const handleNextDay = useCallback(() =>
    onSelectDate(addDays(selectedDate, 1)), [selectedDate, onSelectDate]);

  const handleKeyNavigation = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePreviousDay();
    if (e.key === 'ArrowRight') handleNextDay();
  }, [handlePreviousDay, handleNextDay]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyNavigation);
    return () => window.removeEventListener('keydown', handleKeyNavigation);
  }, [handleKeyNavigation]);

  const filteredDetails = useMemo<Record<ActivityType, ActivityDetail[]> | null>(() => {
    if (!activityData?.details) return null;

    if (selectedFilter) {
      return {
        learning: [],
        revision: [],
        practice: [],
        test: [],
        [selectedFilter]: activityData.details[selectedFilter]
      };
    }

    return activityData.details;
  }, [activityData?.details, selectedFilter]);

  return (
    <div className="flex flex-col md:grid md:grid-cols-[0.5fr,1.5fr] gap-6 rounded-xl border-2 border-border p-4 lg:p-6 bg-card">
      {/* Left side - Calendar */}
      <div className={cn(
        "space-y-4",
        isMobile ? "block" : "hidden md:block"
      )}>
        <h2 className="text-2xl font-semibold tracking-tight">Study Timeline</h2>
        
        <StudyStreak
          streak={activityData?.currentStreak ?? 0}
          className="mb-4"
        />

        <Card className="border border-border bg-card">
          <ExamCountdown
            variant="dashboard"
            onSelectDate={onSelectDate}
            selectedDate={selectedDate}
            examDate={effectiveExamDate}
          />
        </Card>
      </div>

      {/* Right side - Activity Details */}
      <div className="space-y-4">
        {/* Header with Date Navigation */}
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-8">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePreviousDay}
              className="h-9 w-9 rounded-full border border-border"
              disabled={isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="text-xl font-semibold tracking-tight">
              {isToday(selectedDate) ? "Today" : format(selectedDate, 'MMMM d, yyyy')}
            </h3>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextDay}
              className="h-9 w-9 rounded-full border border-border"
              disabled={isLoading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Activity Filters */}
          <ActivityFilters
            selectedFilter={selectedFilter}
            onFilterChange={setSelectedFilter}
            activityCounts={activityData || {}}
            isLoading={isLoading}
          />
        </div>

        {/* Activity List */}
        <ActivityList
          selectedDate={selectedDate}
          filteredDetails={filteredDetails}
          selectedFilter={selectedFilter}
          isLoading={isLoading}
          onResetTimeline={() => onSelectDate(new Date())}
        />
      </div>
    </div>
  );
} 