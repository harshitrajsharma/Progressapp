"use client";

import { SubjectWithRelations } from "@/lib/calculations/types";
import { calculateSubjectProgress } from "@/lib/calculations";
import { Card } from "@/components/ui/card";
import { Info, Target } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface ExpectedMarksProps {
  subjects: SubjectWithRelations[];
  targetMarks: number;
}

export function ExpectedMarks({ subjects, targetMarks }: ExpectedMarksProps) {
  // Calculate total expected marks and total weightage
  const totals = subjects.reduce((acc, subject) => {
    const progress = calculateSubjectProgress(subject);
    return {
      expectedMarks: acc.expectedMarks + progress.expectedMarks,
      totalWeightage: acc.totalWeightage + subject.weightage
    };
  }, { expectedMarks: 0, totalWeightage: 0 });

  return (
    <Card className="border relative p-4 sm:p-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <h2 className="text-base sm:text-lg font-semibold text-white">Projected Marks</h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Projected Marks based on your test performance across all subjects</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="flex items-baseline gap-1">
        <span className="text-2xl sm:text-3xl font-bold text-red-500">{Math.round(totals.expectedMarks)}</span>
        <span className="text-lg sm:text-xl text-muted-foreground">/</span>
        <span className="text-lg sm:text-xl text-muted-foreground">{Math.round(totals.totalWeightage)}</span>
        <span className="ml-1.5 sm:ml-2 text-xs sm:text-sm text-muted-foreground">marks expected</span>
      </div>

      {/* Target Badge */}
      <div className="absolute top-4 sm:top-6 right-4 sm:right-6">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm">
                <Target className="h-3 w-3" />
                {targetMarks}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Your target marks set during onboarding</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </Card>
  );
} 