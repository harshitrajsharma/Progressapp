"use client";

import { Card } from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ActivityCalendar } from "./activity-calendar";
import { ExamCountdownDisplay } from "./exam-countdown-display";

interface ExamCountdownProps {
  variant?: 'sidebar' | 'dashboard';
  onSelectDate?: (date: Date) => void;
  selectedDate?: Date;
  examDate: Date | null;
}

export function ExamCountdown({
  variant = 'dashboard',
  onSelectDate,
  selectedDate,
  examDate
}: ExamCountdownProps) {
  const isSidebar = variant === 'sidebar';

  const content = (
    <div className={cn(
      "space-y-2",
      !isSidebar && "p-4 sm:p-6"
    )}>
      {/* Exam Countdown Display */}
      <div className={cn(
        "bg-green-900/10 rounded-lg",
        isSidebar ? "" : "p-3 sm:p-4"
      )}>
        <ExamCountdownDisplay
          examDate={examDate}
        />
      </div>

      {/* Activity Calendar */}
      <TooltipProvider>
        <ActivityCalendar
          variant={variant}
          onSelectDate={onSelectDate}
          selectedDate={selectedDate}
          examDate={examDate}
        />
      </TooltipProvider>
    </div>
  );

  if (variant === 'dashboard') {
    return (
      <Card className="border border-border bg-card">
        {content}
      </Card>
    );
  }

  return content;
} 