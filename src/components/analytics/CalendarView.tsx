import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { format, addDays, subDays } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { ActivityType } from "./activity-config";
import type { CalendarActivity, ActivityDetail } from "@/app/api/analytics/types";
import { StudyStreak } from "./StudyStreak";
import { ActivityFilters } from "./ActivityFilters";
import { ActivityList } from "./ActivityList";

interface CalendarViewProps {
  selectedDate: Date;
  onSelectDate: (date: Date | undefined) => void;
}

async function fetchDayActivities(date: string): Promise<CalendarActivity> {
  const response = await fetch(`/api/analytics/calendar?date=${date}`);
  if (!response.ok) {
    throw new Error('Failed to fetch activities');
  }
  return response.json();
}

export function CalendarView({ selectedDate, onSelectDate }: CalendarViewProps) {
  const [selectedFilter, setSelectedFilter] = useState<ActivityType | null>(null);
  
  const { data: activityData, isLoading } = useQuery({
    queryKey: ['calendar-activities', format(selectedDate, 'yyyy-MM-dd')],
    queryFn: () => fetchDayActivities(format(selectedDate, 'yyyy-MM-dd')),
    staleTime: 1000 * 60 * 5,
  });

  const handlePreviousDay = () => onSelectDate(subDays(selectedDate, 1));
  const handleNextDay = () => onSelectDate(addDays(selectedDate, 1));

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
    <div className="flex flex-col md:grid md:grid-cols-[0.4fr,1.6fr] gap-6 rounded-xl border-2 border-border p-4 lg:p-6 bg-card">
      {/* Left side - Calendar */}
      <div className="space-y-4 hidden md:block">
        <h2 className="text-2xl font-semibold tracking-tight">Study Timeline</h2>
        <StudyStreak 
          streak={activityData?.currentStreak ?? 0} 
          className="mb-4"
        />
        <Card className="p-4 shadow-sm border border-border bg-card">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onSelectDate}
            className={cn(
              "w-full select-none opacity-[.85]",
              isLoading && "pointer-events-none"
            )}
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
              {format(selectedDate, 'MMMM d, yyyy')}
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