import { SubjectWithRelations } from "../calculations/types";
import { calculateSubjectProgress } from "../calculations/progress";

// Define math subjects constant at the top level
const MATH_SUBJECTS = ['Discrete Mathematics', 'Engineering Mathematics', 'Aptitude'] as const;
type MathSubject = typeof MATH_SUBJECTS[number];

function isMathSubject(name: string): name is MathSubject {
  return MATH_SUBJECTS.includes(name as MathSubject);
}

export interface SmartRecommendations {
  priorityFocus: Array<{
    subject: SubjectWithRelations;
    learningProgress: number;
  }>;
  startNext: Array<{
    subject: SubjectWithRelations;
    weightage: number;
  }>;
  revise: Array<{
    subject: SubjectWithRelations;
    learningProgress: number;
    revisionProgress: number;
  }>;
  practice: Array<{
    subject: SubjectWithRelations;
    weightage: number;
    learningProgress: number;
    revisionProgress: number;
    practiceProgress: number;
    combinedScore: number;
  }>;
  test: Array<{
    subject: SubjectWithRelations;
    weightage: number;
    learningProgress: number;
    revisionProgress: number;
    practiceProgress: number;
    testProgress: number;
    combinedScore: number;
  }>;
}

/**
 * Calculate a combined score for subject prioritization
 */
function calculateCombinedScore(
  weightage: number,
  learningProgress: number,
  revisionProgress: number,
  practiceProgress: number = 0,
  testProgress: number = 0
): number {
  // Normalize weightage to 0-100 scale (assuming max weightage is 20)
  const normalizedWeightage = (weightage / 20) * 100;
  
  // Calculate combined score with weighted components
  return (
    normalizedWeightage * 0.4 +      // 40% weightage importance
    learningProgress * 0.3 +         // 30% learning progress
    revisionProgress * 0.2 +         // 20% revision progress
    practiceProgress * 0.05 +        // 5% practice progress
    testProgress * 0.05             // 5% test progress
  );
}

/**
 * Get smart recommendations for subjects based on progress and weightage
 */
export function getSmartRecommendations(subjects: SubjectWithRelations[]): SmartRecommendations {
  // Calculate progress for each subject
  const subjectsWithProgress = subjects.map(subject => ({
    subject,
    progress: calculateSubjectProgress(subject)
  }));

  // Split subjects into math and non-math
  const mathSubjects = subjectsWithProgress.filter(({ subject }) => 
    isMathSubject(subject.name)
  );
  
  console.log('Available Math Subjects:', mathSubjects.map(s => ({
    name: s.subject.name,
    progress: s.progress.learning
  })));

  const nonMathSubjects = subjectsWithProgress.filter(({ subject }) => 
    !isMathSubject(subject.name)
  );

  // Priority Focus: Handle math and non-math subjects separately
  const priorityFocusMath = mathSubjects
    .filter(({ progress }) => {
      const hasProgress = progress.learning > 0;
      const notComplete = progress.learning < 100;
      return hasProgress && notComplete;
    })
    .sort((a, b) => b.progress.learning - a.progress.learning)
    .slice(0, 1)
    .map(({ subject, progress }) => ({
      subject,
      learningProgress: progress.learning
    }));

  console.log('Selected Math Subject:', priorityFocusMath);

  const priorityFocusOthers = nonMathSubjects
    .filter(({ progress }) => progress.learning > 0 && progress.learning < 100)
    .sort((a, b) => b.progress.learning - a.progress.learning)
    .slice(0, 2)
    .map(({ subject, progress }) => ({
      subject,
      learningProgress: progress.learning
    }));

  // Combine with non-math subjects first, then math subjects
  const priorityFocus = [...priorityFocusOthers, ...priorityFocusMath];
  
  console.log('Final Priority Focus:', priorityFocus.map(p => ({
    name: p.subject.name,
    progress: p.learningProgress,
    isMath: MATH_SUBJECTS.includes(p.subject.name as MathSubject)
  })));

  // Start Next: Only show non-math subjects with 0% progress
  const startNext = nonMathSubjects
    .filter(({ progress }) => progress.learning === 0)
    .sort((a, b) => b.subject.weightage - a.subject.weightage)
    .slice(0, 3)
    .map(({ subject }) => ({
      subject,
      weightage: subject.weightage
    }));

  // Revise: Include all subjects that meet criteria
  const revise = subjectsWithProgress
    .filter(({ progress }) => 
      progress.learning > 40 && 
      progress.revision > 0 &&
      progress.revision < 100
    )
    .sort((a, b) => {
      const aCombined = a.progress.learning + a.progress.revision;
      const bCombined = b.progress.learning + b.progress.revision;
      return bCombined - aCombined;
    })
    .slice(0, 3)
    .map(({ subject, progress }) => ({
      subject,
      learningProgress: progress.learning,
      revisionProgress: progress.revision
    }));

  // Practice: Show subjects ordered by weightage and progress, exclude 100% practice
  const practice = subjectsWithProgress
    .filter(({ progress }) => progress.practice < 100)
    .map(({ subject, progress }) => {
      const combinedScore = calculateCombinedScore(
        subject.weightage,
        progress.learning,
        progress.revision,
        progress.practice
      );
      return {
        subject,
        weightage: subject.weightage,
        learningProgress: progress.learning,
        revisionProgress: progress.revision,
        practiceProgress: progress.practice,
        combinedScore
      };
    })
    .sort((a, b) => b.combinedScore - a.combinedScore);

  // Test: Show subjects ordered by weightage and all progress metrics
  const test = subjectsWithProgress
    .map(({ subject, progress }) => {
      const combinedScore = calculateCombinedScore(
        subject.weightage,
        progress.learning,
        progress.revision,
        progress.practice,
        progress.test
      );
      return {
        subject,
        weightage: subject.weightage,
        learningProgress: progress.learning,
        revisionProgress: progress.revision,
        practiceProgress: progress.practice,
        testProgress: progress.test,
        combinedScore
      };
    })
    .sort((a, b) => b.combinedScore - a.combinedScore);

  return {
    priorityFocus,
    startNext,
    revise,
    practice,
    test
  };
} 