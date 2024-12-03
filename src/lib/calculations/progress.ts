import { Topic } from "@prisma/client"
import { 
  TopicProgress, 
  ChapterProgress, 
  SubjectProgress,
  ChapterWithRelations,
  SubjectWithRelations,
  ProgressStats,
  FoundationLevel
} from "./types"

/**
 * Safely get topics array from a chapter
 */
function getSafeTopics(chapter: any): Topic[] {
  if (!chapter) return [];
  return Array.isArray(chapter.topics) ? chapter.topics : [];
}

/**
 * Safely get chapters array from a subject
 */
function getSafeChapters(subject: any): any[] {
  if (!subject) return [];
  return Array.isArray(subject.chapters) ? subject.chapters : [];
}

/**
 * Calculate progress for a single topic across all study modes
 */
export function calculateTopicProgress(topic: Topic): TopicProgress {
  return {
    learning: topic.learningStatus ? 100 : 0,
    revision: Math.min(100, (topic.revisionCount / 3) * 100),
    practice: Math.min(100, (topic.practiceCount / 3) * 100),
    test: Math.min(100, (topic.testCount / 3) * 100)
  }
}

/**
 * Calculate if a topic is completed for a specific category
 */
export function isTopicCompletedForCategory(topic: Topic, category: 'learning' | 'revision' | 'practice' | 'test'): boolean {
  switch (category) {
    case 'learning':
      return topic.learningStatus;
    case 'revision':
      return topic.revisionCount >= 3;
    case 'practice':
      return topic.practiceCount >= 3;
    case 'test':
      return topic.testCount >= 3;
    default:
      return false;
  }
}

/**
 * Calculate if a topic is fully completed
 */
export function isTopicCompleted(topic: Topic): boolean {
  return isTopicCompletedForCategory(topic, 'learning') &&
         isTopicCompletedForCategory(topic, 'revision') &&
         isTopicCompletedForCategory(topic, 'practice') &&
         isTopicCompletedForCategory(topic, 'test');
}

/**
 * Calculate progress stats for a specific category
 */
export function calculateProgressStats(
  topics: Topic[], 
  category: 'learning' | 'revision' | 'practice' | 'test'
): ProgressStats {
  const totalTopics = topics.length;
  const completedTopics = topics.filter(topic => isTopicCompletedForCategory(topic, category)).length;

  return {
    totalTopics,
    completedTopics,
    percentage: totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0
  };
}

/**
 * Calculate foundation level based on weighted progress
 */
export function calculateFoundationLevel(progress: {
  learning: number;
  revision: number;
  practice: number;
  test: number;
}): FoundationLevel {
  // Weighted calculation (Learning: 40%, Others: 20% each)
  const weightedProgress = 
    (progress.learning * 0.4) +
    (progress.revision * 0.2) +
    (progress.practice * 0.2) +
    (progress.test * 0.2);

  if (weightedProgress >= 80) return "Advanced";
  if (weightedProgress >= 50) return "Moderate";
  return "Beginner";
}

/**
 * Calculate expected marks based on test performance
 */
export function calculateExpectedMarks(subject: SubjectWithRelations): number {
  const tests = Array.isArray(subject.tests) ? subject.tests : [];
  if (tests.length === 0) return 0;

  const testAverage = tests.reduce((acc, test) => acc + test.score, 0) / tests.length;
  return Math.round((subject.weightage * testAverage) / 100);
}

/**
 * Calculate progress for a chapter including all its topics
 */
export function calculateChapterProgress(chapter: ChapterWithRelations): ChapterProgress {
  const topics = getSafeTopics(chapter);
  const totalTopics = topics.length;
  
  if (totalTopics === 0) {
    return {
      learning: 0,
      revision: 0,
      practice: 0,
      test: 0,
      overall: 0,
      stats: {
        learning: { totalTopics: 0, completedTopics: 0, percentage: 0 },
        revision: { totalTopics: 0, completedTopics: 0, percentage: 0 },
        practice: { totalTopics: 0, completedTopics: 0, percentage: 0 },
        test: { totalTopics: 0, completedTopics: 0, percentage: 0 }
      }
    }
  }

  // Calculate progress for each mode
  const modeProgress = topics.reduce(
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
    learning: Math.min(100, modeProgress.learning / totalTopics),
    revision: Math.min(100, modeProgress.revision / totalTopics),
    practice: Math.min(100, modeProgress.practice / totalTopics),
    test: Math.min(100, modeProgress.test / totalTopics)
  }

  // Calculate stats for each category
  const stats = {
    learning: calculateProgressStats(topics, 'learning'),
    revision: calculateProgressStats(topics, 'revision'),
    practice: calculateProgressStats(topics, 'practice'),
    test: calculateProgressStats(topics, 'test')
  };

  // Calculate overall progress (equal weight for all modes)
  const overall = Math.min(100,
    (progress.learning +
    progress.revision +
    progress.practice +
    progress.test) / 4
  );

  return {
    ...progress,
    overall,
    stats
  }
}

/**
 * Calculate test average for a subject
 */
function calculateTestAverage(subject: SubjectWithRelations): number {
  const tests = Array.isArray(subject.tests) ? subject.tests : [];
  if (tests.length === 0) return 0;
  return tests.reduce((acc, test) => acc + test.score, 0) / tests.length;
}

/**
 * Calculate progress for a subject including all chapters and tests
 */
export function calculateSubjectProgress(subject: SubjectWithRelations): SubjectProgress {
  const chapters = getSafeChapters(subject);
  const allTopics = chapters.flatMap(chapter => getSafeTopics(chapter));
  
  if (allTopics.length === 0) {
    return {
      learning: 0,
      revision: 0,
      practice: 0,
      test: 0,
      overall: 0,
      foundationLevel: "Beginner",
      expectedMarks: 0,
      stats: {
        learning: { totalTopics: 0, completedTopics: 0, percentage: 0 },
        revision: { totalTopics: 0, completedTopics: 0, percentage: 0 },
        practice: { totalTopics: 0, completedTopics: 0, percentage: 0 },
        test: { totalTopics: 0, completedTopics: 0, percentage: 0 }
      }
    }
  }

  // Calculate progress stats for each category
  const stats = {
    learning: calculateProgressStats(allTopics, 'learning'),
    revision: calculateProgressStats(allTopics, 'revision'),
    practice: calculateProgressStats(allTopics, 'practice'),
    test: calculateProgressStats(allTopics, 'test')
  };

  // Calculate percentages for each mode
  const progress = {
    learning: stats.learning.percentage,
    revision: stats.revision.percentage,
    practice: stats.practice.percentage,
    test: stats.test.percentage
  };

  // Calculate study modes progress (80% of total)
  const modesProgress = Math.min(100,
    (progress.learning +
    progress.revision +
    progress.practice +
    progress.test) / 4
  ) * 0.8; // 80% weight for study modes

  // Calculate test performance progress (20% of total)
  const testAverage = calculateTestAverage(subject);
  const testProgress = testAverage * 0.2; // 20% weight for test performance

  // Calculate overall progress
  const overall = Math.min(100, modesProgress + testProgress);

  // Calculate foundation level based on weighted progress
  const foundationLevel = calculateFoundationLevel(progress);

  // Calculate expected marks based on test performance only
  const expectedMarks = calculateExpectedMarks(subject);

  return {
    ...progress,
    overall,
    foundationLevel,
    expectedMarks,
    stats
  }
} 