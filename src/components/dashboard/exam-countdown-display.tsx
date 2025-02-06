import { differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import { Timer, Calendar, Trophy, AlertTriangle } from "lucide-react";

interface ExamCountdownDisplayProps {
  examDate: Date | null;
  variant?: 'sidebar' | 'dashboard';
}

export function ExamCountdownDisplay({ 
  examDate,
  variant = 'dashboard'
}: ExamCountdownDisplayProps) {
  const isSidebar = variant === 'sidebar';
  
  // Calculate days left
  const daysLeft = examDate ? Math.max(0, differenceInDays(examDate, new Date())) : null;

  const getCountdownMessage = (): { message: string; icon: JSX.Element } => {
    if (!examDate || daysLeft === null) {
      return {
        message: "Please set your exam date in onboarding",
        icon: <Calendar className="h-5 w-5 text-blue-500" />
      };
    }
    
    if (daysLeft === 0) {
      return {
        message: "Today is your exam day! Best of luck! 🍀",
        icon: <Trophy className="h-5 w-5 text-yellow-500" />
      };
    }
    if (daysLeft <= 7) {
      return {
        message: "Final week! Stay focused and confident! 💪",
        icon: <AlertTriangle className="h-5 w-5 text-orange-500" />
      };
    }
    if (daysLeft <= 30) {
      return {
        message: "Less than a month left! Keep pushing! 🎯",
        icon: <Timer className="h-5 w-5 text-blue-500" />
      };
    }
    return {
      message: "Keep up the consistent preparation! 📚",
      icon: <Calendar className="h-5 w-5 text-green-500" />
    };
  };

  const { message } = getCountdownMessage();

  return (
    <div className={cn(
      "flex items-center gap-4",
      isSidebar ? "flex-col text-center" : "flex-row"
    )}>
      <div className="space-y-1">
        <div className="flex items-baseline justify-center gap-2">
          <span className={cn(
            "font-bold",
            isSidebar ? "text-xl" : "text-2xl",
            !examDate || daysLeft === null ? "text-blue-500" :
            daysLeft <= 7 ? "text-orange-500" :
            daysLeft <= 30 ? "text-blue-500" :
            "text-green-500"
          )}>
            {daysLeft ?? "?"}
          </span>
          <span className={cn(
            "text-muted-foreground",
            isSidebar ? "text-sm" : "text-base"
          )}>
            days left
          </span>
        </div>
        <p className={cn(
          "text-muted-foreground",
          isSidebar ? "text-xs" : "text-sm"
        )}>
          {message}
        </p>
      </div>
    </div>
  );
} 