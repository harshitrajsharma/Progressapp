import { SubjectWithRelations } from "@/lib/calculations/types";
import { calculateSubjectProgress } from "@/lib/calculations";

// Define math subjects constant at the top level
const MATH_SUBJECTS = ['Discrete Maths', 'Engineering Maths', 'Aptitude'] as const;
type MathSubject = typeof MATH_SUBJECTS[number];

function isMathSubject(name: string): name is MathSubject {
  return MATH_SUBJECTS.includes(name as MathSubject);
}

interface SubjectRecommendation {
  subject: SubjectWithRelations;
  learningProgress: number;
  revisionProgress: number;
  testProgress: number;
  weightage: number;
  isMathSubject: boolean;
}

interface Recommendations {
  revise: SubjectRecommendation[];
  priorityFocus: SubjectRecommendation[];
  startNext: SubjectRecommendation[];
  testProgress: SubjectRecommendation[];
}

// Helper function to calculate priority score
function calculatePriorityScore(weightage: number, progress: number): number {
  // Higher weightage and higher progress means higher priority
  return weightage * progress;
}

export function getSmartRecommendations(subjects: SubjectWithRelations[]): Recommendations {
  // Convert subjects to recommendations with progress data
  const subjectRecommendations: SubjectRecommendation[] = subjects.map(subject => {
    const progress = calculateSubjectProgress(subject);
    return {
      subject,
      learningProgress: progress.learning,
      revisionProgress: progress.revision,
      testProgress: progress.test,
      weightage: subject.weightage,
      isMathSubject: isMathSubject(subject.name)
    };
  });

  // Filter subjects that need revision (high learning, low revision)
  const reviseSubjects = subjectRecommendations
    .filter(rec => rec.learningProgress > 70 && rec.revisionProgress < 70)
    .sort((a, b) => {
      // Sort by priority score (weightage * revisionProgress)
      const scoreA = calculatePriorityScore(a.weightage, a.revisionProgress);
      const scoreB = calculatePriorityScore(b.weightage, b.revisionProgress);
      return scoreB - scoreA;
    })
    .slice(0, 3);

  // Get subjects for priority focus
  const inProgressSubjects = subjectRecommendations
    .filter(rec => rec.learningProgress > 0 && rec.learningProgress < 90);

  // Separate math and non-math subjects
  const mathSubjects = inProgressSubjects.filter(rec => rec.isMathSubject);
  const nonMathSubjects = inProgressSubjects.filter(rec => !rec.isMathSubject);

  // Sort both arrays by priority score
  const sortByPriority = (a: SubjectRecommendation, b: SubjectRecommendation) => 
    calculatePriorityScore(b.weightage, b.learningProgress) - 
    calculatePriorityScore(a.weightage, a.learningProgress);

  mathSubjects.sort(sortByPriority);
  nonMathSubjects.sort(sortByPriority);

  // Select priority focus subjects
  let priorityFocusSubjects: SubjectRecommendation[] = [];
  
  if (mathSubjects.length > 0) {
    // If we have math subjects in progress, take 2 non-math and 1 math
    priorityFocusSubjects = [
      ...nonMathSubjects.slice(0, 2),
      mathSubjects[0]
    ];
  } else {
    // If no math subjects in progress, take 3 non-math subjects
    priorityFocusSubjects = nonMathSubjects.slice(0, 3);
  }

  // Get subjects to start next (no progress or very low progress)
  const startNextSubjects = subjectRecommendations
    .filter(rec => {
      // Only include subjects with 0% progress
      // Remove the "or less than 10%" condition to prevent overlap
      return rec.learningProgress === 0;
    })
    .sort((a, b) => b.weightage - a.weightage)
    .slice(0, 3);

  // Get test progress subjects (sort by priority score)
  const testProgressSubjects = [...subjectRecommendations]
    .sort((a, b) => {
      // Sort by priority score (weightage * testProgress)
      const scoreA = calculatePriorityScore(a.weightage, a.testProgress);
      const scoreB = calculatePriorityScore(b.weightage, b.testProgress);
      return scoreB - scoreA;
    })
    .slice(0, 3);

  return {
    revise: reviseSubjects,
    priorityFocus: priorityFocusSubjects,
    startNext: startNextSubjects,
    testProgress: testProgressSubjects
  };
} 