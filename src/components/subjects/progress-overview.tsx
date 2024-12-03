import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { memo } from "react"
import { SubjectProgress } from "@/lib/calculations/types"

interface ProgressOverviewProps {
  progress: SubjectProgress;
}

function ProgressOverviewComponent({ progress }: ProgressOverviewProps) {
  return (
    <Card className="p-4 rounded-xl border-2">
      <div className="space-y-4">
        {/* Overall Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="font-medium text-sm">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{Math.round(progress.overall)}%</span>
          </div>
          <Progress 
            value={progress.overall} 
            className="h-2"
            indicatorClassName="bg-red-500"
          />
        </div>

        {/* Progress Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Learning Progress */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-baseline">
              <div>
                <span className="text-sm">Learning</span>
                <p className="text-[10px] text-muted-foreground">
                  {progress.stats.learning.completedTopics}/{progress.stats.learning.totalTopics}
                </p>
              </div>
              <span className="text-sm text-blue-500 font-medium">{Math.round(progress.learning)}%</span>
            </div>
            <Progress 
              value={progress.learning} 
              className="h-1.5"
              indicatorClassName="bg-blue-500"
            />
          </div>

          {/* Revision Progress */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-baseline">
              <div>
                <span className="text-sm">Revision</span>
                <p className="text-[10px] text-muted-foreground">
                  {progress.stats.revision.completedTopics}/{progress.stats.revision.totalTopics}
                </p>
              </div>
              <span className="text-sm text-green-500 font-medium">{Math.round(progress.revision)}%</span>
            </div>
            <Progress 
              value={progress.revision} 
              className="h-1.5"
              indicatorClassName="bg-green-500"
            />
          </div>

          {/* Practice Progress */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-baseline">
              <div>
                <span className="text-sm">Practice</span>
                <p className="text-[10px] text-muted-foreground">
                  {progress.stats.practice.completedTopics}/{progress.stats.practice.totalTopics}
                </p>
              </div>
              <span className="text-sm text-amber-500 font-medium">{Math.round(progress.practice)}%</span>
            </div>
            <Progress 
              value={progress.practice} 
              className="h-1.5"
              indicatorClassName="bg-amber-500"
            />
          </div>

          {/* Test Progress */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-baseline">
              <div>
                <span className="text-sm">Test</span>
                <p className="text-[10px] text-muted-foreground">
                  {progress.stats.test.completedTopics}/{progress.stats.test.totalTopics}
                </p>
              </div>
              <span className="text-sm text-purple-500 font-medium">{Math.round(progress.test)}%</span>
            </div>
            <Progress 
              value={progress.test} 
              className="h-1.5"
              indicatorClassName="bg-purple-500"
            />
          </div>
        </div>
      </div>
    </Card>
  );
}

export const ProgressOverview = memo(ProgressOverviewComponent); 