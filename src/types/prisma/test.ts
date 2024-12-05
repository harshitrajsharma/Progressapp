export interface BaseTest {
  id: string;
  name: string;
  score: number;      // Percentage score
  totalMarks: number;
  marksScored: number;
  subjectId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestWithRelations extends BaseTest {
  subject: {
    id: string;
    name: string;
    weightage: number;
  };
}

export interface TestStats {
  totalTests: number;
  highestScore: number;
  lowestScore: number;
  averageScore: number;
  expectedMarks: number;
  weightage: number;
  averagePerformance: number;
} 