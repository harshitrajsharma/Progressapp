'use client';

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, isToday } from "date-fns";
import { useAnalytics } from "@/contexts/analytics-context";
import { ActivityFilters } from "./ActivityFilters";
import { ActivityList } from "./ActivityList";

export function ActivityDetailsDaywise() {
  const {
    selectedDate,
    activityData,
    isLoading,
    selectedFilter,
    setSelectedFilter,
    filteredDetails,
    goToPreviousDay,
    goToNextDay,
    goToToday
  } = useAnalytics();

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Header with Date Navigation */}
      <div>
        <div className="flex items-center justify-center gap-8 mb-4">
          <Button
            variant="outline"
            size="icon"
            onClick={goToPreviousDay}
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
            onClick={goToNextDay}
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
          activityCounts={activityData ? {
            learning: activityData.learning || 0,
            revision: activityData.revision || 0,
            practice: activityData.practice || 0,
            test: activityData.test || 0
          } : {}}
          isLoading={isLoading}
        />
      </div>

      {/* Activity List - takes remaining height */}
      <div className="flex-1 min-h-0">
        <ActivityList
          selectedDate={selectedDate}
          filteredDetails={filteredDetails}
          selectedFilter={selectedFilter}
          isLoading={isLoading}
          onResetTimeline={goToToday}
        />
      </div>
    </div>
  );
}