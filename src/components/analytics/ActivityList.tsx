import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock } from "lucide-react";
import { format } from "date-fns";
import { ActivityType, ACTIVITIES } from "./activity-config";
import { cn } from "@/lib/utils";
import { ActivityDetail } from "./types";
import { TVAWarning } from "./TVAWarning";

interface ActivityListProps {
  selectedDate: Date;
  filteredDetails: Record<ActivityType, ActivityDetail[]> | null;
  selectedFilter: ActivityType | null;
  isLoading: boolean;
  onResetTimeline: () => void;
}

export function ActivityList({
  selectedDate,
  filteredDetails,
  selectedFilter,
  isLoading,
  onResetTimeline
}: ActivityListProps) {
  // Render activity item
  const renderActivityItem = (activity: ActivityDetail, type: ActivityType, index: number) => {
    const { icon: Icon, color, lightBg, darkBg, lightBorder, darkBorder } = ACTIVITIES[type];
    const key = `${type}-${activity.subject}-${activity.topic}-${activity.completedAt}-${index}`;
    
    return (
      <div
        key={key}
        className={cn(
          "flex flex-row sm:items-center gap-3 p-4 rounded-xl border transition-all hover:shadow-sm",
          lightBg,
          darkBg,
          lightBorder,
          darkBorder
        )}
      >
        <div className={cn("flex items-center gap-2", color)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-medium text-foreground">{activity.subject}</h4>
          <p className="text-sm text-muted-foreground">{activity.topic}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          {format(new Date(activity.completedAt), 'h:mm a')}
        </div>
      </div>
    );
  };

  return (
    <Card className="border border-border bg-card">
      <ScrollArea className="h-[500px] lg:h-[600px]">
        <div className="space-y-4 p-4">
          {isLoading ? (
            // Loading skeletons for activities
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border bg-muted/10">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : selectedDate > new Date() ? (
            <TVAWarning selectedDate={selectedDate} onReset={onResetTimeline} />
          ) : (
            <>
              {filteredDetails && Object.entries(filteredDetails).map(([type, activities]) => {
                if (!activities?.length) return null;
                return (
                  <div key={type} className="space-y-4">
                    {activities.map((activity: ActivityDetail, index: number) => 
                      renderActivityItem(activity, type as ActivityType, index)
                    )}
                  </div>
                );
              })}
              {(!filteredDetails || Object.values(filteredDetails).flat().length === 0) && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-muted p-3 mb-4">
                    <Clock className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h4 className="text-base font-medium text-foreground">No Activities Yet</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedFilter 
                      ? `No ${ACTIVITIES[selectedFilter].label.toLowerCase()} activities recorded for this date`
                      : 'No activities have been recorded for this date'}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
} 