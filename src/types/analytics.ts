export interface SubjectAnalytics {
  id: string;
  name: string;
  weightage: number;
  expectedMarks: number;
  learningProgress: number;
  revisionProgress: number;
  practiceProgress: number;
  testProgress: number;
}

// Activity Types
export type ActivityType = 'learning' | 'revision' | 'practice' | 'test';

export type ViewMode = 'activities' | 'goal';
export type TimeRange = '7d' | '30d' | '90d' | 'all';

// Base Activity Interface
export interface ActivityCount {
  [key: string]: number;
  learning: number;
  revision: number;
  practice: number;
  test: number;
}

// Daily Activity Data
export interface DailyActivity extends ActivityCount {
  date: string;
  totalCount: number;
  goalProgress: number;
}

// Activity Statistics
export interface ActivityStats {
  count: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
}

// Daily Statistics
export interface DailyStats {
  date: string;
  stats: Record<ActivityType, ActivityStats>;
  total: number;
  goalAchievement: number;
}

// Progress Insights
export interface ProgressInsights {
  currentStreak: number;
  bestActivity: ActivityType;
  averageDailyActivities: number;
  daysGoalAchieved: number;
  weeklyAverage: number;
  monthlyAverage: number;
  completionRate: number;
  lastActive: string;
}

// Activity Configuration
export interface ActivityConfig {
  name: string;
  color: string;
  icon: string;
  weight: number;
}

// Progress Data
export interface ProgressData {
  daily: DailyActivity[];
  insights: ProgressInsights;
  config: {
    dailyGoal: number;
    activities: Record<ActivityType, ActivityConfig>;
  };
}

// Common Props
export interface LoadingErrorProps {
  isLoading?: boolean;
  error?: string | null;
}

// Chart Props
export interface ChartProps extends LoadingErrorProps {
  data: ProgressData | null;
  viewMode?: ViewMode;
  timeRange?: TimeRange;
  onViewModeChange?: (mode: ViewMode) => void;
  onTimeRangeChange?: (range: TimeRange) => void;
}

export interface DailyProgress {
  date: string;
  learning: number;
  revision: number;
  practice: number;
  test: number;
  totalActivities: number;
  goalAchievement: number;
  learningPercentage: number;
  revisionPercentage: number;
  practicePercentage: number;
  testPercentage: number;
} 