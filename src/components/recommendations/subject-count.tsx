"use client";

import { SubjectWithRelations } from "@/lib/calculations/types";
import { calculateSubjectProgress } from "@/lib/calculations";
import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SubjectCountProps {
  subjects: SubjectWithRelations[];
}

export function SubjectCount({ subjects }: SubjectCountProps) {
  const totalSubjects = subjects.length;
  const completedSubjects = subjects.filter(subject => {
    const progress = calculateSubjectProgress(subject);
    return progress.learning === 100;
  }).length;

  return (
    <Card className="border relative p-4 sm:p-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <h2 className="text-base sm:text-lg font-semibold text-white">Subject Progress</h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Number of subjects where learning phase is completed</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="flex items-baseline gap-1">
        <span className="text-2xl sm:text-3xl text-red-500 font-bold text-primary">{completedSubjects}</span>
        <span className="text-lg sm:text-xl text-muted-foreground">/</span>
        <span className="text-lg sm:text-xl text-muted-foreground">{totalSubjects}</span>
        <span className="ml-1.5 sm:ml-2 text-xs sm:text-sm text-muted-foreground">subjects completed</span>
      </div>
    </Card>
  );
} 