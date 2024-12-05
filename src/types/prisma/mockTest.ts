export type MockTest = {
  id: string;
  name: string;
  date: Date;
  expectedMarks: number;
  actualMarks?: number;
  subjectId: string;
  createdAt: Date;
  updatedAt: Date;
}; 