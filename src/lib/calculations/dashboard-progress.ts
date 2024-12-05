import { Subject } from "@prisma/client";
import { SubjectWithRelations } from "./types";
import { calculateSubjectProgress } from "./progress";
import { clampPercentage, roundPercentage } from "./index";

export interface DashboardProgress {
  overall: number;
  learning: number;
  revision: number;
  practice: number;
  test: number;
  stats: {
    subjects: {
      total: number;
      completed: number;
    };
    topics: {
      total: number;
      completed: number;
    };
  };
}

/**
 * Calculate weighted average progress based on subject weightage
 */
function calculateWeightedProgress(subjects: SubjectWithRelations[], progressType: keyof Pick<SubjectWithRelations, 'overallProgress' | 'learningProgress' | 'revisionProgress' | 'practiceProgress' | 'testProgress'>): number {
  if (subjects.length === 0) return 0;

  let totalWeightage = 0;
  let weightedSum = 0;

  subjects.forEach(subject => {
    const weight = subject.weightage || 1; // Default to 1 if weightage is not set
    totalWeightage += weight;
    weightedSum += ((subject[progressType] || 0) * weight);
  });

  if (totalWeightage === 0) return 0;
  return clampPercentage(roundPercentage(weightedSum / totalWeightage));
}

/**
 * Calculate overall dashboard progress combining all subjects
 */
export function calculateDashboardProgress(subjects: SubjectWithRelations[]): DashboardProgress {
  if (!subjects || subjects.length === 0) {
    return {
      overall: 0,
      learning: 0,
      revision: 0,
      practice: 0,
      test: 0,
      stats: {
        subjects: { total: 0, completed: 0 },
        topics: { total: 0, completed: 0 }
      }
    };
  }

  // Calculate progress for each subject first
  const subjectsWithProgress = subjects.map(subject => {
    const progress = calculateSubjectProgress(subject);
    return {
      ...subject,
      overallProgress: progress.overall,
      learningProgress: progress.learning,
      revisionProgress: progress.revision,
      practiceProgress: progress.practice,
      testProgress: progress.test
    };
  });

  // Calculate weighted averages for each progress type
  const overall = calculateWeightedProgress(subjectsWithProgress, 'overallProgress');
  const learning = calculateWeightedProgress(subjectsWithProgress, 'learningProgress');
  const revision = calculateWeightedProgress(subjectsWithProgress, 'revisionProgress');
  const practice = calculateWeightedProgress(subjectsWithProgress, 'practiceProgress');
  const test = calculateWeightedProgress(subjectsWithProgress, 'testProgress');

  // Calculate completion statistics
  const completedSubjects = subjectsWithProgress.filter(
    subject => subject.overallProgress >= 100
  ).length;

  // Calculate total topics and completed topics
  const topicsStats = subjectsWithProgress.reduce(
    (acc, subject) => {
      const progress = calculateSubjectProgress(subject);
      return {
        total: acc.total + progress.stats.learning.totalTopics,
        completed: acc.completed + progress.stats.learning.completedTopics
      };
    },
    { total: 0, completed: 0 }
  );

  return {
    overall,
    learning,
    revision,
    practice,
    test,
    stats: {
      subjects: {
        total: subjects.length,
        completed: completedSubjects
      },
      topics: topicsStats
    }
  };
} 