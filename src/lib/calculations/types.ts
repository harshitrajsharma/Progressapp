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
export interface ProgressDetail {
  total: number
  completed: number
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
  totalTopics: number
  completedTopics: number
}

export interface SubjectProgress extends TopicProgress {
  overall: number
  totalChapters: number
  completedChapters: number
  totalTopics: number
  completedTopics: number
  expectedMarks: number
  testAverage: number
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