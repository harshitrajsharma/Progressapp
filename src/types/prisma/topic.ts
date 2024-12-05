import type { Chapter } from './chapter';

export interface BaseTopic {
  id: string;
  name: string;
  important: boolean;
  learningStatus: boolean;
  revisionCount: number;
  practiceCount: number;
  testCount: number;
  position: number;
  lastRevised: Date | null;
  nextRevision: Date | null;
  chapterId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TopicWithRelations extends BaseTopic {
  chapter: Chapter;
}

// API response types
export interface TopicResponse {
  success: boolean;
  topic: BaseTopic;
}

export interface TopicUpdateData {
  name?: string;
  important?: boolean;
  position?: number;
  learningStatus?: boolean;
  revisionCount?: number;
  practiceCount?: number;
  testCount?: number;
} 