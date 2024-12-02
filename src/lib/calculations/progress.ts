import { Topic } from "@prisma/client"
import { 
  TopicProgress, 
  ChapterProgress, 
  SubjectProgress,
  ChapterWithRelations,
  SubjectWithRelations
} from "./types"

/**
 * Calculate progress for a single topic across all study modes
 */
export function calculateTopicProgress(topic: Topic): TopicProgress {
  return {
    learning: topic.learningStatus ? 100 : 0,
    revision: (topic.revisionCount / 3) * 100,
    practice: (topic.practiceCount / 3) * 100,
    test: (topic.testCount / 3) * 100
  }
}

/**
 * Calculate if a topic is fully completed
 */
export function isTopicCompleted(topic: Topic): boolean {
  const progress = calculateTopicProgress(topic)
  return (
    progress.learning === 100 &&
    progress.revision === 100 &&
    progress.practice === 100 &&
    progress.test === 100
  )
}

/**
 * Calculate progress for a chapter including all its topics
 */
export function calculateChapterProgress(chapter: ChapterWithRelations): ChapterProgress {
  const totalTopics = chapter.topics.length
  if (totalTopics === 0) {
    return {
      learning: 0,
      revision: 0,
      practice: 0,
      test: 0,
      overall: 0,
      totalTopics: 0,
      completedTopics: 0
    }
  }

  // Calculate progress for each mode
  const modeProgress = chapter.topics.reduce(
    (acc, topic) => {
      const progress = calculateTopicProgress(topic)
      return {
        learning: acc.learning + progress.learning,
        revision: acc.revision + progress.revision,
        practice: acc.practice + progress.practice,
        test: acc.test + progress.test
      }
    },
    { learning: 0, revision: 0, practice: 0, test: 0 }
  )

  // Convert to percentages
  const progress = {
    learning: modeProgress.learning / totalTopics,
    revision: modeProgress.revision / totalTopics,
    practice: modeProgress.practice / totalTopics,
    test: modeProgress.test / totalTopics
  }

  // Calculate overall progress (80% from modes, 20% from test scores)
  const modesProgress = (
    progress.learning +
    progress.revision +
    progress.practice +
    progress.test
  ) / 4

  const completedTopics = chapter.topics.filter(isTopicCompleted).length

  return {
    ...progress,
    overall: modesProgress,
    totalTopics,
    completedTopics
  }
}

/**
 * Calculate progress for a subject including all chapters and tests
 */
export function calculateSubjectProgress(subject: SubjectWithRelations): SubjectProgress {
  const totalChapters = subject.chapters.length
  const totalTopics = subject.chapters.reduce(
    (acc, chapter) => acc + chapter.topics.length,
    0
  )

  if (totalChapters === 0) {
    return {
      learning: 0,
      revision: 0,
      practice: 0,
      test: 0,
      overall: 0,
      totalChapters: 0,
      completedChapters: 0,
      totalTopics: 0,
      completedTopics: 0,
      expectedMarks: 0,
      testAverage: 0
    }
  }

  // Calculate progress from chapters
  const chaptersProgress = subject.chapters.reduce(
    (acc, chapter) => {
      const progress = calculateChapterProgress(chapter)
      return {
        learning: acc.learning + progress.learning,
        revision: acc.revision + progress.revision,
        practice: acc.practice + progress.practice,
        test: acc.test + progress.test,
        completedTopics: acc.completedTopics + progress.completedTopics
      }
    },
    { learning: 0, revision: 0, practice: 0, test: 0, completedTopics: 0 }
  )

  // Convert to percentages
  const progress = {
    learning: chaptersProgress.learning / totalChapters,
    revision: chaptersProgress.revision / totalChapters,
    practice: chaptersProgress.practice / totalChapters,
    test: chaptersProgress.test / totalChapters
  }

  // Calculate test average
  const testAverage = subject.tests.length > 0
    ? subject.tests.reduce((acc, test) => acc + test.score, 0) / subject.tests.length
    : 0

  // Calculate overall progress (80% from modes, 20% from tests)
  const modesProgress = (
    progress.learning +
    progress.revision +
    progress.practice +
    progress.test
  ) / 4 * 0.8 // 80% weight

  const testProgress = testAverage * 0.2 // 20% weight

  const completedChapters = subject.chapters.filter(
    chapter => calculateChapterProgress(chapter).overall >= 90
  ).length

  // Calculate expected marks based on weightage and test average
  const expectedMarks = (subject.weightage * testAverage) / 100

  return {
    ...progress,
    overall: modesProgress + testProgress,
    totalChapters,
    completedChapters,
    totalTopics,
    completedTopics: chaptersProgress.completedTopics,
    expectedMarks,
    testAverage
  }
} 