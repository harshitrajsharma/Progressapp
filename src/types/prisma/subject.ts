import type { ChapterWithRelations } from './chapter';
import type { Test } from './test';
import type { MockTest } from './mockTest';

export type FoundationLevel = "Beginner" | "Moderate" | "Advanced";

export interface Subject {
  id: string;
  name: string;
  weightage: number;
  expectedMarks: number;
  foundationLevel: FoundationLevel;
  overallProgress: number;
  learningProgress: number;
  revisionProgress: number;
  practiceProgress: number;
  testProgress: number;
  position: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubjectWithRelations extends Subject {
  chapters: ChapterWithRelations[];
  tests: Test[];
  mockTests: MockTest[];
}

export interface SubjectProgress {
  learning: number;
  revision: number;
  practice: number;
  test: number;
  overall: number;
  foundationLevel: FoundationLevel;
  expectedMarks: number;
  stats: {
    learning: ProgressStats;
    revision: ProgressStats;
    practice: ProgressStats;
    test: ProgressStats;
  };
}

export interface ProgressStats {
  totalTopics: number;
  completedTopics: number;
  percentage: number;
} 