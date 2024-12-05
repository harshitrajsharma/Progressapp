import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { memo, useMemo } from "react"
import { SubjectProgress } from "@/types/prisma/subject"
import { cn } from "@/lib/utils"

interface ProgressOverviewProps {
  progress: SubjectProgress;
}

interface CategoryProgress {
  value: number;
  completedTopics: number;
  totalTopics: number;
  color: "blue" | "green" | "amber" | "purple";
}

const colorMap = {
  blue: "text-blue-500",
  green: "text-green-500",
  amber: "text-amber-500",
  purple: "text-purple-500"
} as const;

const bgColorMap = {
  blue: "bg-blue-500",
  green: "bg-green-500",
  amber: "bg-amber-500",
  purple: "bg-purple-500"
} as const;

function ProgressOverviewComponent({ progress }: ProgressOverviewProps) {
  // Pre-calculate all progress values with proper validation
  const progressData = useMemo(() => {
    const validateProgress = (value: number) => {
      if (isNaN(value) || value < 0) return 0;
      if (value > 100) return 100;
      return Math.round(value);
    };

    const validateTopics = (completed: number, total: number) => ({
      completed: Math.max(0, completed),
      total: Math.max(0, total || 0)
    });

    // Get validated stats
    const learningStats = validateTopics(progress.stats.learning.completedTopics, progress.stats.learning.totalTopics);
    const revisionStats = validateTopics(progress.stats.revision.completedTopics, progress.stats.revision.totalTopics);
    const practiceStats = validateTopics(progress.stats.practice.completedTopics, progress.stats.practice.totalTopics);
    const testStats = validateTopics(progress.stats.test.completedTopics, progress.stats.test.totalTopics);

    return {
      overall: validateProgress(progress.overall),
      categories: {
        learning: {
          value: validateProgress(progress.learning),
          completedTopics: learningStats.completed,
          totalTopics: learningStats.total,
          color: "blue" as const
        },
        revision: {
          value: validateProgress(progress.revision),
          completedTopics: revisionStats.completed,
          totalTopics: revisionStats.total,
          color: "green" as const
        },
        practice: {
          value: validateProgress(progress.practice),
          completedTopics: practiceStats.completed,
          totalTopics: practiceStats.total,
          color: "amber" as const
        },
        test: {
          value: validateProgress(progress.test),
          completedTopics: testStats.completed,
          totalTopics: testStats.total,
          color: "purple" as const
        }
      }
    };
  }, [
    progress.overall,
    progress.learning,
    progress.revision,
    progress.practice,
    progress.test,
    progress.stats.learning.completedTopics,
    progress.stats.learning.totalTopics,
    progress.stats.revision.completedTopics,
    progress.stats.revision.totalTopics,
    progress.stats.practice.completedTopics,
    progress.stats.practice.totalTopics,
    progress.stats.test.completedTopics,
    progress.stats.test.totalTopics
  ]);

  // Component for rendering individual category progress
  const CategoryProgressDisplay = memo(({ 
    title, 
    data 
  }: { 
    title: string; 
    data: CategoryProgress 
  }) => (
    <div className="space-y-1.5">
      <div className="flex justify-between items-baseline">
        <div>
          <span className="text-sm">{title}</span>
          <p className="text-[10px] text-muted-foreground">
            {data.completedTopics}/{data.totalTopics}
          </p>
        </div>
        <span className={cn("text-sm font-medium", colorMap[data.color])}>
          {data.value}%
        </span>
      </div>
      <Progress 
        value={data.value} 
        className="h-1.5"
        indicatorClassName={bgColorMap[data.color]}
      />
    </div>
  ));

  // Set display name for the memoized component
  CategoryProgressDisplay.displayName = 'CategoryProgressDisplay';

  return (
    <Card className="p-4 rounded-xl border-2">
      <div className="space-y-4">
        {/* Overall Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="font-medium text-sm">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{progressData.overall}%</span>
          </div>
          <Progress 
            value={progressData.overall} 
            className="h-2"
            indicatorClassName="bg-red-500"
          />
        </div>

        {/* Progress Grid */}
        <div className="grid grid-cols-2 gap-3">
          <CategoryProgressDisplay 
            title="Learning" 
            data={progressData.categories.learning} 
          />
          <CategoryProgressDisplay 
            title="Revision" 
            data={progressData.categories.revision} 
          />
          <CategoryProgressDisplay 
            title="Practice" 
            data={progressData.categories.practice} 
          />
          <CategoryProgressDisplay 
            title="Test" 
            data={progressData.categories.test} 
          />
        </div>
      </div>
    </Card>
  );
}

// Export with optimized memoization
export const ProgressOverview = memo(ProgressOverviewComponent); 