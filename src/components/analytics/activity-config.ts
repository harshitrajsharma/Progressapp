import { BookOpen, RefreshCw, PenTool, GraduationCap } from "lucide-react";
import { LucideIcon } from "lucide-react";

export type ActivityType = 'learning' | 'revision' | 'practice' | 'test';

export const ACTIVITIES: Record<ActivityType, { 
  icon: LucideIcon;
  label: string;
  color: string;
  lightBg: string;
  darkBg: string;
  lightBorder: string;
  darkBorder: string;
}> = {
  learning: {
    icon: BookOpen,
    label: "Learning",
    color: "text-emerald-500",
    lightBg: "bg-emerald-50/50",
    darkBg: "dark:bg-emerald-950/50",
    lightBorder: "border-emerald-200",
    darkBorder: "dark:border-emerald-800"
  },
  revision: {
    icon: RefreshCw,
    label: "Revision",
    color: "text-blue-500",
    lightBg: "bg-blue-50/50",
    darkBg: "dark:bg-blue-950/50",
    lightBorder: "border-blue-200",
    darkBorder: "dark:border-blue-800"
  },
  practice: {
    icon: PenTool,
    label: "Practice",
    color: "text-amber-500",
    lightBg: "bg-amber-50/50",
    darkBg: "dark:bg-amber-950/50",
    lightBorder: "border-amber-200",
    darkBorder: "dark:border-amber-800"
  },
  test: {
    icon: GraduationCap,
    label: "Test",
    color: "text-purple-500",
    lightBg: "bg-purple-50/50",
    darkBg: "dark:bg-purple-950/50",
    lightBorder: "border-purple-200",
    darkBorder: "dark:border-purple-800"
  }
}; 