import type { BaseTopic } from './topic';
import type { Subject } from './subject';

export interface BaseChapter {
  id: string;
  name: string;
  important: boolean;
  overallProgress: number;
  learningProgress: number;
  revisionProgress: number;
  practiceProgress: number;
  testProgress: number;
  position: number;
  subjectId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChapterWithRelations extends BaseChapter {
  topics: BaseTopic[];
  subject: Subject;
}

// Progress types
export interface ChapterProgress {
  learning: number;
  revision: number;
  practice: number;
  test: number;
  overall: number;
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