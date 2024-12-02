import { Subject, Test } from "@prisma/client"

interface SubjectWithTests extends Subject {
  tests: Test[]
}

/**
 * Calculates expected marks for a subject based on test performance
 * @param subject Subject with tests array
 * @returns Expected marks for the subject
 */
export function calculateExpectedMarks(subject: SubjectWithTests): number {
  const tests = subject.tests
  
  if (!tests || tests.length === 0) {
    return 0
  }

  const averageScore = Math.round(
    tests.reduce((acc, test) => acc + test.score, 0) / tests.length
  )

  return Math.round((subject.weightage * averageScore) / 100)
}

/**
 * Calculates test statistics for a subject
 */
export function calculateTestStats(tests: Test[]) {
  const totalTests = tests.length
  
  if (totalTests === 0) {
    return {
      averageScore: 0,
      highestScore: 0,
      lowestScore: 0
    }
  }

  const averageScore = Math.round(
    tests.reduce((acc, test) => acc + test.score, 0) / totalTests
  )
  
  const highestScore = Math.max(...tests.map(test => test.score))
  const lowestScore = Math.min(...tests.map(test => test.score))

  return {
    averageScore,
    highestScore,
    lowestScore
  }
} 