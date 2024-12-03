import { Test } from "@prisma/client"
import { SubjectWithRelations, TestStatistics } from "./types"
import { calculateSubjectProgress } from "./progress"

/**
 * Calculate test statistics for a subject
 */
export function calculateTestStatistics(tests: Test[]): TestStatistics {
  if (tests.length === 0) {
    return {
      totalTests: 0,
      averageScore: 0,
      highestScore: 0,
      lowestScore: 0,
      recentScore: 0,
      trend: "stable"
    }
  }

  // Sort tests by date
  const sortedTests = [...tests].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  )

  const scores = sortedTests.map(test => test.score)
  const recentScore = scores[0]
  const previousScore = scores[1] || scores[0]

  return {
    totalTests: tests.length,
    averageScore: scores.reduce((acc, score) => acc + score, 0) / tests.length,
    highestScore: Math.max(...scores),
    lowestScore: Math.min(...scores),
    recentScore,
    trend: recentScore > previousScore ? "up" : recentScore < previousScore ? "down" : "stable"
  }
}

/**
 * Calculate foundation level based on progress and test performance
 */
export function calculateFoundationLevel(subject: SubjectWithRelations) {
  const { overall, testAverage } = calculateSubjectProgress(subject)

  if (overall >= 80 && testAverage >= 70) return "Advanced"
  if (overall >= 50 && testAverage >= 50) return "Moderate"
  return "Beginner"
}

/**
 * Calculate expected marks based on weightage and test performance
 */
export function calculateExpectedMarks(subject: SubjectWithRelations): number {
  if (subject.tests.length === 0) return 0

  const testAverage = subject.tests.reduce(
    (acc, test) => acc + test.score,
    0
  ) / subject.tests.length

  return (subject.weightage * testAverage) / 100
}

/**
 * Calculate completion statistics for a subject
 */
export function calculateCompletionStats(subject: SubjectWithRelations) {
  const progress = calculateSubjectProgress(subject)

  return {
    chapters: {
      total: progress.totalChapters,
      completed: progress.completedChapters,
      percentage: progress.totalChapters > 0
        ? (progress.completedChapters / progress.totalChapters) * 100
        : 0
    },
    topics: {
      total: progress.totalTopics,
      completed: progress.completedTopics,
      percentage: progress.totalTopics > 0
        ? (progress.completedTopics / progress.totalTopics) * 100
        : 0
    }
  }
} 