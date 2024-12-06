"use client";

import { SubjectWithRelations } from "@/lib/calculations/types";
import { calculateSubjectProgress } from "@/lib/calculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <Card className="bg-background border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-foreground">Subject Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <div className="text-3xl font-bold">
            <span className="text-primary">{completedSubjects}</span>
            <span className="text-muted-foreground">/</span>
            <span className="text-muted-foreground">{totalSubjects}</span>
          </div>
          <p className="text-sm text-muted-foreground">subjects completed</p>
        </div>
      </CardContent>
    </Card>
  );
} 