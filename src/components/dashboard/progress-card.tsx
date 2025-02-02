import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Progress } from "@/types/progress"
import { ProgressIndicator } from "./progress-indicator"
import { cn } from "@/lib/utils"

interface ProgressCardProps {
  progress: Progress;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  showToggle?: boolean;
  className?: string;
}

export function ProgressCard({ 
  progress, 
  isExpanded = false, 
  onToggleExpand, 
  showToggle = true,
  className 
}: ProgressCardProps) {
  return (
    <Card className={cn("p-4 bg-card", className)}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Your Progress</h3>
          {showToggle && onToggleExpand && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={onToggleExpand}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>

        {/* Overall Progress */}
        <ProgressIndicator
          label="Overall"
          value={progress.overall}
          category="overall"
          size="md"
        />

        {/* Category Progress - 2x2 Grid */}
        <div className="grid grid-cols-2 gap-4">
          <ProgressIndicator
            label="Learning"
            value={progress.learning}
            category="learning"
          />
          <ProgressIndicator
            label="Revision"
            value={progress.revision}
            category="revision"
          />
          <ProgressIndicator
            label="Practice"
            value={progress.practice}
            category="practice"
          />
          <ProgressIndicator
            label="Test"
            value={progress.test}
            category="test"
          />
        </div>
      </div>
    </Card>
  );
} 