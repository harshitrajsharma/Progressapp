'use client';

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface CompetitiveAnalysisProps {
  currentScore: number;
  targetScore: number;
  mockTestScores: number[];
}

export function CompetitiveAnalysis({ 
  currentScore, 
  targetScore,
  mockTestScores 
}: CompetitiveAnalysisProps) {
  const progress = (currentScore / targetScore) * 100;
  const trend = mockTestScores.length >= 2 
    ? mockTestScores[mockTestScores.length - 1] > mockTestScores[mockTestScores.length - 2]
      ? "Improving"
      : "Needs Focus"
    : "Not Enough Data";

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Performance Analysis</h2>
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Current Score</span>
            <span className="font-medium">{currentScore.toFixed(1)}</span>
          </div>
          <Progress value={progress} />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Target: {targetScore}</span>
            <span>Progress: {progress.toFixed(1)}%</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div>
            <p className="text-sm text-muted-foreground">Tests Taken</p>
            <p className="text-2xl font-bold">{mockTestScores.length}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Trend</p>
            <p className="text-2xl font-bold">{trend}</p>
          </div>
        </div>
      </div>
    </Card>
  );
} 