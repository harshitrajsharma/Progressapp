// Types for analytics components and API responses

// Existing types for Calendar View
export type ActivityType = 'learning' | 'revision' | 'practice' | 'test';

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
  details: {
    learning: ActivityDetail[];
    revision: ActivityDetail[];
    practice: ActivityDetail[];
    test: ActivityDetail[];
  };
  currentStreak?: number;
  longestStreak?: number;
}

// New types for Subject Progress Analytics
export interface SubjectActivity {
  id: string;
  name: string;
  weightage: number;
  overallProgress: number;
  learningProgress: number;
  revisionProgress: number;
  practiceProgress: number;
  testProgress: number;
  createdAt: string;
  updatedAt: string;
  activity: {
    learning: number;
    revision: number;
    practice: number;
    test: number;
    total: number;
  };
  activityPercentage: number;
}

export interface TotalStats {
  learning: number;
  revision: number;
  practice: number;
  test: number;
  total: number;
}

export interface DateRange {
  start: string;
  end: string;
  range: 'day' | 'week' | 'month' | 'all';
}

export interface SubjectProgressResponse {
  subjects: SubjectActivity[];
  totalStats: TotalStats;
  dateRange: DateRange;
} 