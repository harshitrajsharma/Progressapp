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
  const totalChapters = subject.chapters.length;
  const totalTopics = subject.chapters.reduce(
    (acc, chapter) => acc + chapter.topics.length,
    0
  );

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
    };
  }

  // Calculate total completed topics for each mode
  const chaptersProgress = subject.chapters.reduce(
    (acc, chapter) => {
      // Count completed topics for each mode
      const completedLearning = chapter.topics.filter(t => t.learningStatus).length;
      const revisionCount = chapter.topics.reduce((sum, t) => sum + t.revisionCount, 0);
      const practiceCount = chapter.topics.reduce((sum, t) => sum + t.practiceCount, 0);
      const testCount = chapter.topics.reduce((sum, t) => sum + t.testCount, 0);
      const totalTopicsInChapter = chapter.topics.length;

      return {
        learning: acc.learning + completedLearning,
        revision: acc.revision + revisionCount,
        practice: acc.practice + practiceCount,
        test: acc.test + testCount,
        completedTopics: acc.completedTopics + chapter.topics.filter(t => 
          t.learningStatus && 
          t.revisionCount >= 3 && 
          t.practiceCount >= 3 && 
          t.testCount >= 3
        ).length,
        totalTopics: acc.totalTopics + totalTopicsInChapter
      };
    },
    { learning: 0, revision: 0, practice: 0, test: 0, completedTopics: 0, totalTopics: 0 }
  );

  // Convert to percentages
  const progress = {
    learning: (chaptersProgress.learning / totalTopics) * 100,
    revision: (chaptersProgress.revision / (totalTopics * 3)) * 100,
    practice: (chaptersProgress.practice / (totalTopics * 3)) * 100,
    test: (chaptersProgress.test / (totalTopics * 3)) * 100
  };

  // Calculate test average with safe access
  const tests = subject.tests || [];
  const testAverage = tests.length > 0
    ? tests.reduce((acc, test) => acc + test.score, 0) / tests.length
    : 0;

  // Calculate overall progress (80% from modes, 20% from tests)
  const modesProgress = (
    progress.learning +
    progress.revision +
    progress.practice +
    progress.test
  ) / 4 * 0.8; // 80% weight

  const testProgress = testAverage * 0.2; // 20% weight

  const completedChapters = subject.chapters.filter(chapter => {
    const chapterProgress = calculateChapterProgress(chapter);
    return chapterProgress.learning === 100 &&
           chapterProgress.revision === 100 &&
           chapterProgress.practice === 100 &&
           chapterProgress.test === 100;
  }).length;

  // Calculate expected marks based on weightage and test average
  const expectedMarks = (subject.weightage * testAverage) / 100;

  return {
    ...progress,
    overall: modesProgress + testProgress,
    totalChapters,
    completedChapters,
    totalTopics,
    completedTopics: chaptersProgress.completedTopics,
    expectedMarks,
    testAverage
  };
} 