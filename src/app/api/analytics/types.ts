// Types for analytics components and API responses
import { ActivityType } from "@/components/analytics/activity-config";

export interface ActivityDetail {
  subject: string;
  topic: string;
  completedAt: string;
}

export interface DailyActivityDetails {
  learning: ActivityDetail[];
  revision: ActivityDetail[];
  practice: ActivityDetail[];
  test: ActivityDetail[];
}

export interface CalendarActivity {
  date: string;
  learning: number;
  revision: number;
  practice: number;
  test: number;
  totalCount: number;
  goalProgress: number;
  currentStreak: number;
  longestStreak: number;
  details: DailyActivityDetails;
} 