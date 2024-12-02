import { Chapter, Subject, Topic, Test } from "@prisma/client"

interface SubjectWithChapters extends Subject {
  chapters: (Chapter & {
    topics: Topic[];
  })[];
  tests?: Test[];
}

interface ChapterWithTopics extends Chapter {
  topics: Topic[];
}

// Topic Progress Calculations
export const getTopicLearningProgress = (topic: Topic) => {
  return topic.learningStatus ? 100 : 0;
};

export const getTopicRevisionProgress = (topic: Topic) => {
  return topic.revisionCount > 0 ? 100 : 0;
};

export const getTopicPracticeProgress = (topic: Topic) => {
  return topic.practiceCount > 0 ? 100 : 0;
};

export const getTopicTestProgress = (topic: Topic) => {
  return topic.testCount > 0 ? 100 : 0;
};

// Chapter Progress Calculations
export const getChapterLearningProgress = (chapter: ChapterWithTopics) => {
  if (!chapter.topics || chapter.topics.length === 0) return 0;
  const totalProgress = chapter.topics.reduce((acc, topic) => acc + getTopicLearningProgress(topic), 0);
  return Math.round(totalProgress / chapter.topics.length);
};

export const getChapterRevisionProgress = (chapter: ChapterWithTopics) => {
  if (!chapter.topics || chapter.topics.length === 0) return 0;
  const totalProgress = chapter.topics.reduce((acc, topic) => acc + getTopicRevisionProgress(topic), 0);
  return Math.round(totalProgress / chapter.topics.length);
};

export const getChapterPracticeProgress = (chapter: ChapterWithTopics) => {
  if (!chapter.topics || chapter.topics.length === 0) return 0;
  const totalProgress = chapter.topics.reduce((acc, topic) => acc + getTopicPracticeProgress(topic), 0);
  return Math.round(totalProgress / chapter.topics.length);
};

export const getChapterTestProgress = (chapter: ChapterWithTopics) => {
  if (!chapter.topics || chapter.topics.length === 0) return 0;
  const totalProgress = chapter.topics.reduce((acc, topic) => acc + getTopicTestProgress(topic), 0);
  return Math.round(totalProgress / chapter.topics.length);
};

export const getChapterOverallProgress = (chapter: ChapterWithTopics) => {
  const learningWeight = 0.4;
  const revisionWeight = 0.3;
  const practiceWeight = 0.15;
  const testWeight = 0.15;

  const learningProgress = getChapterLearningProgress(chapter);
  const revisionProgress = getChapterRevisionProgress(chapter);
  const practiceProgress = getChapterPracticeProgress(chapter);
  const testProgress = getChapterTestProgress(chapter);

  return Math.round(
    (learningProgress * learningWeight) +
    (revisionProgress * revisionWeight) +
    (practiceProgress * practiceWeight) +
    (testProgress * testWeight)
  );
};

// Subject Progress Calculations
export const getSubjectLearningProgress = (subject: SubjectWithChapters) => {
  if (!subject.chapters || subject.chapters.length === 0) return 0;
  const totalProgress = subject.chapters.reduce((acc, chapter) => acc + getChapterLearningProgress(chapter), 0);
  return Math.round(totalProgress / subject.chapters.length);
};

export const getSubjectRevisionProgress = (subject: SubjectWithChapters) => {
  if (!subject.chapters || subject.chapters.length === 0) return 0;
  const totalProgress = subject.chapters.reduce((acc, chapter) => acc + getChapterRevisionProgress(chapter), 0);
  return Math.round(totalProgress / subject.chapters.length);
};

export const getSubjectPracticeProgress = (subject: SubjectWithChapters) => {
  if (!subject.chapters || subject.chapters.length === 0) return 0;
  const totalProgress = subject.chapters.reduce((acc, chapter) => acc + getChapterPracticeProgress(chapter), 0);
  return Math.round(totalProgress / subject.chapters.length);
};

export const getSubjectTestProgress = (subject: SubjectWithChapters) => {
  if (!subject.chapters || subject.chapters.length === 0) return 0;
  const totalProgress = subject.chapters.reduce((acc, chapter) => acc + getChapterTestProgress(chapter), 0);
  return Math.round(totalProgress / subject.chapters.length);
};

export const getSubjectOverallProgress = (subject: SubjectWithChapters) => {
  const learningWeight = 0.4;
  const revisionWeight = 0.3;
  const practiceWeight = 0.15;
  const testWeight = 0.15;

  const learningProgress = getSubjectLearningProgress(subject);
  const revisionProgress = getSubjectRevisionProgress(subject);
  const practiceProgress = getSubjectPracticeProgress(subject);
  const testProgress = getSubjectTestProgress(subject);

  // Base progress from topic statuses (80% weight)
  const baseProgress = Math.round(
    (learningProgress * learningWeight) +
    (revisionProgress * revisionWeight) +
    (practiceProgress * practiceWeight) +
    (testProgress * testWeight)
  );

  // Test performance contribution (20% weight)
  const testPerformanceContribution = subject.tests && subject.tests.length > 0
    ? Math.round((subject.tests.reduce((acc, test) => acc + test.score, 0) / subject.tests.length) * 0.2)
    : 0;

  // Total progress is base progress (80%) + test performance (20%)
  return Math.min(100, baseProgress + testPerformanceContribution);
};

// Foundation Level Calculation
export const calculateFoundationLevel = (subject: SubjectWithChapters) => {
  if (!subject.chapters || subject.chapters.length === 0) return "Beginner";
  
  const learningProgress = getSubjectLearningProgress(subject);
  const revisionProgress = getSubjectRevisionProgress(subject);
  
  if (learningProgress >= 80 && revisionProgress >= 70) {
    return "Advanced";
  }
  
  if (learningProgress >= 50 && revisionProgress >= 40) {
    return "Moderate";
  }
  
  return "Beginner";
};

// Helper functions
export const getTopicsCount = (subject: SubjectWithChapters) => {
  if (!subject.chapters) return 0;
  return subject.chapters.reduce((acc, chapter) => acc + (chapter.topics?.length || 0), 0);
};

export const getCompletedTopicsCount = (subject: SubjectWithChapters) => {
  if (!subject.chapters) return { completed: 0, total: 0 };
  
  const total = getTopicsCount(subject);
  const completed = subject.chapters.reduce((acc, chapter) => {
    return acc + chapter.topics.filter(topic => topic.learningStatus).length;
  }, 0);
  
  return { completed, total };
};

export const getCompletedChaptersCount = (subject: SubjectWithChapters) => {
  if (!subject.chapters) return 0;
  return subject.chapters.filter(chapter => getChapterLearningProgress(chapter) === 100).length;
}; 