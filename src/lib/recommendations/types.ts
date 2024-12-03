import type { SubjectWithRelations } from "../calculations/types";

export enum RecommendationType {
  REVISE = 'revise',
  PRIORITY = 'priority',
  START = 'start',
  PRACTICE = 'practice',
  TEST = 'test'
}

export enum FoundationLevel {
  BEGINNER = 'Beginner',
  MODERATE = 'Moderate',
  ADVANCED = 'Advanced'
}

export interface RecommendationSubject {
  id: string;
  name: string;
  weightage: number;
  progress: number;
  behindTarget?: number;
  priority: string;
}

export interface RecommendationCategory {
  type: RecommendationType;
  title: string;
  description: string;
  subjects: RecommendationSubject[];
}

export interface RecommendationConfig {
  maxSubjectsPerCategory: number;
  progressThresholds: {
    revision: number;
    practice: number;
    test: number;
  };
  weightageFactors: {
    gate: number;
    progress: number;
    foundation: number;
    time: number;
  };
}

export interface RecommendationCacheKey {
  subjects: Array<{
    id: string;
    progress: number;
    revision: number;
    weightage: number;
  }>;
  daysLeft: number;
  config: RecommendationConfig;
} 