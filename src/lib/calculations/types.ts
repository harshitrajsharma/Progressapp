import { Chapter, Subject, Test, Topic } from "@prisma/client"

// Extended types with relations
export interface TopicWithRelations extends Topic {
  chapter: Chapter
}

export interface ChapterWithRelations extends Chapter {
  topics: Topic[]
  subject: Subject
}

export interface SubjectWithRelations extends Subject {
  chapters: ChapterWithRelations[]
  tests: Test[]
}

// Progress types
export interface ProgressStats {
  totalTopics: number
  completedTopics: number
  percentage: number
}

export interface TopicProgress {
  learning: number    // 0 or 100
  revision: number    // 0 to 100 (based on count/3)
  practice: number    // 0 to 100 (based on count/3)
  test: number       // 0 to 100 (based on count/3)
}

export interface ChapterProgress extends TopicProgress {
  overall: number
  stats: {
    learning: ProgressStats
    revision: ProgressStats
    practice: ProgressStats
    test: ProgressStats
  }
}

export interface SubjectProgress extends TopicProgress {
  overall: number
  foundationLevel: FoundationLevel
  expectedMarks: number
  stats: {
    learning: ProgressStats
    revision: ProgressStats
    practice: ProgressStats
    test: ProgressStats
  }
}

// Foundation Level
export type FoundationLevel = "Beginner" | "Moderate" | "Advanced"

// Test Statistics
export interface TestStatistics {
  totalTests: number
  averageScore: number
  highestScore: number
  lowestScore: number
  recentScore: number
  trend: "up" | "down" | "stable"
} 