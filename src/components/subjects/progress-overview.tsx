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
    low: "bg-red-500/90",
    medium: "bg-yellow-500/90",
    high: "bg-blue-500/90",
    text: "text-blue-500",
    badge: "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300",
    hover: "group-hover:bg-blue-500/95"
  },
  revision: {
    low: "bg-red-500/90",
    medium: "bg-yellow-500/90",
    high: "bg-green-500/90",
    text: "text-green-500",
    badge: "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300",
    hover: "group-hover:bg-green-500/95"
  },
  practice: {
    low: "bg-red-500/90",
    medium: "bg-yellow-500/90",
    high: "bg-amber-500/90",
    text: "text-amber-500",
    badge: "bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900 dark:text-amber-300",
    hover: "group-hover:bg-amber-500/95"
  },
  test: {
    low: "bg-red-500/90",
    medium: "bg-yellow-500/90",
    high: "bg-purple-500/90",
    text: "text-purple-500",
    badge: "bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-300",
    hover: "group-hover:bg-purple-500/95"
  }
};

const CategoryProgress = memo(({ title, data, variant, previousValue }: CategoryProgressProps) => {
  const theme = progressVariants[variant];
  const progressColor = cn(
    "h-1.5 transition-all duration-300 rounded-full",
    data.value < 30 && theme.low,
    data.value >= 30 && data.value < 70 && theme.medium,
    data.value >= 70 && theme.high,
    theme.hover
  );

  const progressDiff = previousValue !== undefined ? data.value - previousValue : 0;

  return (
    <div className="group space-y-1.5 rounded-lg p-2 transition-colors hover:bg-accent/40">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">{title}</span>
        <div className="flex items-center gap-2">
          {progressDiff !== 0 && (
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
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "text-xs font-normal transition-colors",
                    theme.badge
                  )}
                >
                  {data.completedTopics}/{data.totalTopics}
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                <p>Completed {data.completedTopics} out of {data.totalTopics} topics</p>
                {progressDiff !== 0 && (
                  <p className="mt-1 text-muted-foreground">
                    {progressDiff > 0 ? "Increased" : "Decreased"} by {Math.abs(progressDiff)}% from last week
                  </p>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="relative w-full h-1.5 bg-secondary rounded-full overflow-hidden">
        {[25, 50, 75].map((milestone) => (
          <div
            key={milestone}
            className="absolute top-0 bottom-0 w-px bg-background/50"
            style={{ left: `${milestone}%` }}
          />
        ))}
        <div 
          className={progressColor}
          style={{ 
            width: `${data.value}%`,
            transform: `translateX(${data.value === 0 ? '-100%' : '0'})`,
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
            {100 - data.value}% remaining
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
          totalTopics: progress.stats.learning.totalTopics
        },
        revision: {
          value: validateProgress(progress.revision),
          previousValue: previousProgress?.revision ? validateProgress(previousProgress.revision) : undefined,
          completedTopics: progress.stats.revision.completedTopics,
          totalTopics: progress.stats.revision.totalTopics
        },
        practice: {
          value: validateProgress(progress.practice),
          previousValue: previousProgress?.practice ? validateProgress(previousProgress.practice) : undefined,
          completedTopics: progress.stats.practice.completedTopics,
          totalTopics: progress.stats.practice.totalTopics
        },
        test: {
          value: validateProgress(progress.test),
          previousValue: previousProgress?.test ? validateProgress(previousProgress.test) : undefined,
          completedTopics: progress.stats.test.completedTopics,
          totalTopics: progress.stats.test.totalTopics
        }
      }
    };
  }, [progress, previousProgress]);

  const overallProgressColor = cn(
    "h-2 transition-all duration-300 rounded-full",
    progressData.overall < 30 && "bg-red-500/90",
    progressData.overall >= 30 && progressData.overall < 70 && "bg-yellow-500/90",
    progressData.overall >= 70 && "bg-blue-500/90",
    "group-hover:bg-opacity-95"
  );

  const overallDiff = progressData.previousOverall !== undefined 
    ? progressData.overall - progressData.previousOverall 
    : 0;

  return (
    <Card className="p-4 rounded-xl">
      <div className="space-y-4">
        <div className="group space-y-2">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-medium">Overall Progress</h2>
            <div className="flex items-center gap-2">
              {overallDiff !== 0 && (
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
              )}
              <span className="text-sm font-medium">
                {progressData.overall}%
              </span>
            </div>
          </div>

          <div className="relative w-full h-2 bg-secondary rounded-full overflow-hidden">
            {[25, 50, 75].map((milestone) => (
              <div
                key={milestone}
                className="absolute top-0 bottom-0 w-px bg-background/50"
                style={{ left: `${milestone}%` }}
              />
            ))}
            <div 
              className={overallProgressColor} 
              style={{ 
                width: `${progressData.overall}%`,
                transform: `translateX(${progressData.overall === 0 ? '-100%' : '0'})`,
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