'use client';

import { Card } from "@/components/ui/card";
import { getDaysUntilGATE } from "@/lib/utils";

interface CountdownSectionProps {
  examDate: Date;
  examName: string;
}

export function CountdownSection({ examDate, examName }: CountdownSectionProps) {
  const daysLeft = getDaysUntilGATE();
  const formattedDate = new Date(examDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">{daysLeft} Days Left</h2>
          <p className="text-muted-foreground">Until {examName}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Exam Date</p>
          <p className="font-medium">{formattedDate}</p>
        </div>
      </div>
    </Card>
  );
} 