import React, { memo, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface ProgressStats {
  completedTopics: number;
  totalTopics: number;
}

interface SubjectProgress {
  overall: number;
  learning: number;
  revision: number;
  practice: number;
  test: number;
  stats: {
    learning: ProgressStats;
    revision: ProgressStats;
    practice: ProgressStats;
    test: ProgressStats;
  };
}

interface CategoryProgressData {
  value: number;
  completedTopics: number;
  totalTopics: number;
}

interface CategoryProgressProps {
  title: string;
  data: CategoryProgressData;
  variant: keyof typeof progressVariants;
  previousValue?: number;
}

const progressVariants = {
  learning: {
    low: "bg-red-400",
    medium: "bg-yellow-400",
    high: "bg-blue-500",
    text: "text-blue-600",
    badge: "bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-200",
    hover: "group-hover:bg-blue-600",
  },
  revision: {
    low: "bg-red-400",
    medium: "bg-yellow-400",
    high: "bg-green-500",
    text: "text-green-600",
    badge: "bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950/50 dark:text-green-200",
    hover: "group-hover:bg-green-600",
  },
  practice: {
    low: "bg-red-400",
    medium: "bg-yellow-400",
    high: "bg-amber-500",
    text: "text-amber-600",
    badge: "bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/50 dark:text-amber-200",
    hover: "group-hover:bg-amber-600",
  },
  test: {
    low: "bg-red-400",
    medium: "bg-yellow-400",
    high: "bg-purple-500",
    text: "text-purple-600",
    badge: "bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-950/50 dark:text-purple-200",
    hover: "group-hover:bg-purple-600",
  },
};

const CategoryProgress = memo(({ title, data, variant, previousValue }: CategoryProgressProps) => {
  const theme = progressVariants[variant];
  const progressColor = cn(
    "h-1.5 rounded-full transition-all duration-300 ease-in-out",
    data.value < 30 && theme.low,
    data.value >= 30 && data.value < 70 && theme.medium,
    data.value >= 70 && theme.high,
    theme.hover,
  );

  const progressDiff = previousValue !== undefined ? data.value - previousValue : 0;

  return (
    <div className="group space-y-1.5 rounded-lg p-2 hover:bg-muted/50 transition-colors duration-200">
      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold text-foreground">{title}</span>
        <div className="flex items-center gap-2">
          {progressDiff !== 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1">
                    {progressDiff > 0 ? (
                      <TrendingUp className="w-3 h-3 text-green-500" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-500" />
                    )}
                    <span className={cn(
                      "text-xs font-medium",
                      progressDiff > 0 ? "text-green-500" : "text-red-500"
                    )}>
                      {Math.abs(progressDiff)}%
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  <p>{progressDiff > 0 ? "Up" : "Down"} by {Math.abs(progressDiff)}% since last update</p>
                  <p className="text-muted-foreground">Previous: {previousValue}%</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <Badge 
            variant="secondary" 
            className={cn(
              "text-xs font-medium px-2 py-0.5 transition-colors",
              theme.badge
            )}
          >
            {data.completedTopics}/{data.totalTopics}
          </Badge>
        </div>
      </div>

      <div className="relative w-full h-1.5 bg-muted rounded-full overflow-hidden">
        {[25, 50, 75].map((milestone) => (
          <div
            key={milestone}
            className="absolute top-0 bottom-0 w-px bg-muted-foreground/20"
            style={{ left: `${milestone}%` }}
          />
        ))}
        <div 
          className={progressColor}
          style={{ 
            width: `${data.value}%`,
            transform: `translateX(${data.value === 0 ? '-100%' : '0'})`,
            boxShadow: data.value > 0 ? "0 1px 3px rgba(0, 0, 0, 0.1)" : "none",
          }}
        />
      </div>

      <div className="flex justify-between items-center text-xs">
        <span className={cn(
          "font-medium transition-colors",
          data.value >= 70 && theme.text
        )}>
          {data.value}% complete
        </span>
        {data.value < 100 && (
          <span className="hidden md:block text-muted-foreground">
            {100 - data.value}% to go
          </span>
        )}
      </div>
    </div>
  );
});

CategoryProgress.displayName = "CategoryProgress";

interface ProgressOverviewProps {
  progress: SubjectProgress;
  previousProgress?: SubjectProgress;
}

const ProgressOverviewComponent = ({ progress, previousProgress }: ProgressOverviewProps) => {
  const progressData = useMemo(() => {
    const validateProgress = (value: number) => {
      if (isNaN(value) || value < 0) return 0;
      if (value > 100) return 100;
      return Math.round(value);
    };

    return {
      overall: validateProgress(progress.overall),
      previousOverall: previousProgress?.overall ? validateProgress(previousProgress.overall) : undefined,
      categories: {
        learning: {
          value: validateProgress(progress.learning),
          previousValue: previousProgress?.learning ? validateProgress(previousProgress.learning) : undefined,
          completedTopics: progress.stats.learning.completedTopics,
          totalTopics: progress.stats.learning.totalTopics,
        },
        revision: {
          value: validateProgress(progress.revision),
          previousValue: previousProgress?.revision ? validateProgress(previousProgress.revision) : undefined,
          completedTopics: progress.stats.revision.completedTopics,
          totalTopics: progress.stats.revision.totalTopics,
        },
        practice: {
          value: validateProgress(progress.practice),
          previousValue: previousProgress?.practice ? validateProgress(previousProgress.practice) : undefined,
          completedTopics: progress.stats.practice.completedTopics,
          totalTopics: progress.stats.practice.totalTopics,
        },
        test: {
          value: validateProgress(progress.test),
          previousValue: previousProgress?.test ? validateProgress(previousProgress.test) : undefined,
          completedTopics: progress.stats.test.completedTopics,
          totalTopics: progress.stats.test.totalTopics,
        },
      },
    };
  }, [progress, previousProgress]);

  const overallProgressColor = cn(
    "h-2 rounded-full transition-all duration-300 ease-in-out",
    progressData.overall < 30 && "bg-red-400",
    progressData.overall >= 30 && progressData.overall < 70 && "bg-yellow-400",
    progressData.overall >= 70 && "bg-blue-500",
    "group-hover:bg-blue-600",
  );

  const overallDiff = progressData.previousOverall !== undefined 
    ? progressData.overall - progressData.previousOverall 
    : 0;

  return (
    <Card className="p-4 rounded-xl shadow-sm bg-card border border-muted">
      <div className="space-y-4">
        <div className="group space-y-2">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-semibold text-foreground">Overall Progress</h2>
            <div className="flex items-center gap-2">
              {overallDiff !== 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1">
                        {overallDiff > 0 ? (
                          <TrendingUp className="w-3 h-3 text-green-500" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-red-500" />
                        )}
                        <span className={cn(
                          "text-xs font-medium",
                          overallDiff > 0 ? "text-green-500" : "text-red-500"
                        )}>
                          {Math.abs(overallDiff)}%
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      <p>{overallDiff > 0 ? "Up" : "Down"} by {Math.abs(overallDiff)}% since last update</p>
                      <p className="text-muted-foreground">Previous: {progressData.previousOverall}%</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <span className="text-sm font-medium text-foreground">
                {progressData.overall}%
              </span>
            </div>
          </div>
          <div className="relative w-full h-2 bg-muted rounded-full overflow-hidden">
            {[25, 50, 75].map((milestone) => (
              <div
                key={milestone}
                className="absolute top-0 bottom-0 w-px bg-muted-foreground/20"
                style={{ left: `${milestone}%` }}
              />
            ))}
            <div 
              className={overallProgressColor} 
              style={{ 
                width: `${progressData.overall}%`,
                transform: `translateX(${progressData.overall === 0 ? '-100%' : '0'})`,
                boxShadow: progressData.overall > 0 ? "0 1px 3px rgba(0, 0, 0, 0.1)" : "none",
              }} 
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <CategoryProgress 
            title="Learning" 
            data={progressData.categories.learning}
            variant="learning"
            previousValue={progressData.categories.learning.previousValue}
          />
          <CategoryProgress 
            title="Revision" 
            data={progressData.categories.revision}
            variant="revision"
            previousValue={progressData.categories.revision.previousValue}
          />
          <CategoryProgress 
            title="Practice" 
            data={progressData.categories.practice}
            variant="practice"
            previousValue={progressData.categories.practice.previousValue}
          />
          <CategoryProgress 
            title="Test" 
            data={progressData.categories.test}
            variant="test"
            previousValue={progressData.categories.test.previousValue}
          />
        </div>
      </div>
    </Card>
  );
};

export const ProgressOverview = memo(ProgressOverviewComponent);