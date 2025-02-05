import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ACTIVITIES, ActivityType } from "./activity-config";

interface ActivityFiltersProps {
  selectedFilter: ActivityType | null;
  onFilterChange: (filter: ActivityType | null) => void;
  activityCounts: Partial<Record<ActivityType, number>>;
  isLoading?: boolean;
}

export function ActivityFilters({
  selectedFilter,
  onFilterChange,
  activityCounts,
  isLoading
}: ActivityFiltersProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:flex justify-start gap-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:flex justify-start gap-2">
      {Object.entries(ACTIVITIES).map(([type, { icon: Icon, label, color, lightBorder, darkBorder }]) => {
        const count = activityCounts[type as ActivityType] ?? 0;
        return (
          <Button
            key={type}
            variant="outline"
            className={cn(
              "flex items-center gap-2 h-9 px-4 rounded-full border transition-all",
              selectedFilter === type ? cn(lightBorder, darkBorder) : "hover:border-border/80",
              selectedFilter === type && "bg-background shadow-sm"
            )}
            onClick={() => onFilterChange(selectedFilter === type ? null : type as ActivityType)}
          >
            <Icon className={cn("h-4 w-4", color)} />
            <span className="font-medium">{label}</span>
            {count > 0 && (
              <span className={cn(
                "text-sm px-2 py-0.5 rounded-full",
                color,
                "bg-background dark:bg-card"
              )}>
                {count}
              </span>
            )}
          </Button>
        );
      })}
    </div>
  );
} 