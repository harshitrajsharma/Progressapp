import type { SubjectWithRelations, Subject } from "@/types/prisma/subject";
import type { ExamFoundationResult } from "@/lib/calculations/types";
import type { ChapterWithRelations } from "@/types/prisma/chapter";

// Base subjects
const basePhysicsSubject: Subject = {
  id: "1",
  name: "Physics",
  weightage: 20,
  expectedMarks: 15,
  foundationLevel: "Advanced",
  overallProgress: 75,
  learningProgress: 75,
  revisionProgress: 50,
  practiceProgress: 40,
  testProgress: 30,
  position: 0,
  userId: "1",
  createdAt: new Date(),
  updatedAt: new Date()
};

const baseChemistrySubject: Subject = {
  id: "2",
  name: "Chemistry",
  weightage: 20,
  expectedMarks: 8,
  foundationLevel: "Moderate",
  overallProgress: 75,
  learningProgress: 75,
  revisionProgress: 30,
  practiceProgress: 20,
  testProgress: 10,
  position: 1,
  userId: "1",
  createdAt: new Date(),
  updatedAt: new Date()
};

const baseBiologySubject: Subject = {
  id: "3",
  name: "Biology",
  weightage: 10,
  expectedMarks: 0,
  foundationLevel: "Beginner",
  overallProgress: 33,
  learningProgress: 33,
  revisionProgress: 25,
  practiceProgress: 0,
  testProgress: 0,
  position: 2,
  userId: "1",
  createdAt: new Date(),
  updatedAt: new Date()
};

const baseEconomicsSubject: Subject = {
  id: "4",
  name: "Economics",
  weightage: 30,
  expectedMarks: 0,
  foundationLevel: "Beginner",
  overallProgress: 50,
  learningProgress: 50,
  revisionProgress: 0,
  practiceProgress: 0,
  testProgress: 0,
  position: 3,
  userId: "1",
  createdAt: new Date(),
  updatedAt: new Date()
};

const baseMathematicsSubject: Subject = {
  id: "5",
  name: "Mathematics",
  weightage: 10,
  expectedMarks: 0,
  foundationLevel: "Beginner",
  overallProgress: 0,
  learningProgress: 0,
  revisionProgress: 0,
  practiceProgress: 0,
  testProgress: 0,
  position: 4,
  userId: "1",
  createdAt: new Date(),
  updatedAt: new Date()
};

// Chapters for each subject
const physicsChapters: ChapterWithRelations[] = [
  {
    id: "1",
    name: "Mechanics",
    important: true,
    overallProgress: 80,
    learningProgress: 90,
    revisionProgress: 70,
    practiceProgress: 50,
    testProgress: 40,
    position: 0,
    subjectId: "1",
    createdAt: new Date(),
    updatedAt: new Date(),
    subject: basePhysicsSubject,
    topics: [
      {
        id: "1",
        name: "Newton's Laws",
        important: true,
        learningStatus: true,
        revisionCount: 2,
        practiceCount: 1,
        testCount: 1,
        chapterId: "1",
        position: 0,
        lastRevised: new Date(),
        nextRevision: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "2",
        name: "Work and Energy",
        important: true,
        learningStatus: true,
        revisionCount: 1,
        practiceCount: 1,
        testCount: 0,
        chapterId: "1",
        position: 1,
        lastRevised: new Date(),
        nextRevision: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  }
];

const chemistryChapters: ChapterWithRelations[] = [
  {
    id: "2",
    name: "Organic Chemistry",
    important: true,
    overallProgress: 40,
    learningProgress: 45,
    revisionProgress: 30,
    practiceProgress: 20,
    testProgress: 10,
    position: 0,
    subjectId: "2",
    createdAt: new Date(),
    updatedAt: new Date(),
    subject: baseChemistrySubject,
    topics: [
      {
        id: "3",
        name: "Alkanes",
        important: true,
        learningStatus: true,
        revisionCount: 1,
        practiceCount: 0,
        testCount: 0,
        chapterId: "2",
        position: 0,
        lastRevised: new Date(),
        nextRevision: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  }
];

const biologyChapters: ChapterWithRelations[] = [
  {
    id: "3",
    name: "Cell Biology",
    important: true,
    overallProgress: 33,
    learningProgress: 33,
    revisionProgress: 25,
    practiceProgress: 0,
    testProgress: 0,
    position: 0,
    subjectId: "3",
    createdAt: new Date(),
    updatedAt: new Date(),
    subject: baseBiologySubject,
    topics: [
      {
        id: "4",
        name: "Cell Structure",
        important: true,
        learningStatus: true,
        revisionCount: 1,
        practiceCount: 0,
        testCount: 0,
        chapterId: "3",
        position: 0,
        lastRevised: new Date(),
        nextRevision: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  }
];

const economicsChapters: ChapterWithRelations[] = [
  {
    id: "4",
    name: "Microeconomics",
    important: true,
    overallProgress: 50,
    learningProgress: 50,
    revisionProgress: 0,
    practiceProgress: 0,
    testProgress: 0,
    position: 0,
    subjectId: "4",
    createdAt: new Date(),
    updatedAt: new Date(),
    subject: baseEconomicsSubject,
    topics: [
      {
        id: "5",
        name: "Supply and Demand",
        important: true,
        learningStatus: true,
        revisionCount: 0,
        practiceCount: 0,
        testCount: 0,
        chapterId: "4",
        position: 0,
        lastRevised: new Date(),
        nextRevision: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  }
];

const mathematicsChapters: ChapterWithRelations[] = [
  {
    id: "5",
    name: "Calculus",
    important: true,
    overallProgress: 0,
    learningProgress: 0,
    revisionProgress: 0,
    practiceProgress: 0,
    testProgress: 0,
    position: 0,
    subjectId: "5",
    createdAt: new Date(),
    updatedAt: new Date(),
    subject: baseMathematicsSubject,
    topics: [
      {
        id: "6",
        name: "Limits",
        important: true,
        learningStatus: false,
        revisionCount: 0,
        practiceCount: 0,
        testCount: 0,
        chapterId: "5",
        position: 0,
        lastRevised: new Date(),
        nextRevision: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  }
];

export const dummySubjects: SubjectWithRelations[] = [
  {
    ...basePhysicsSubject,
    chapters: physicsChapters,
    tests: [],
    mockTests: []
  },
  {
    ...baseChemistrySubject,
    chapters: chemistryChapters,
    tests: [],
    mockTests: []
  },
  {
    ...baseBiologySubject,
    chapters: biologyChapters,
    tests: [],
    mockTests: []
  },
  {
    ...baseEconomicsSubject,
    chapters: economicsChapters,
    tests: [],
    mockTests: []
  },
  {
    ...baseMathematicsSubject,
    chapters: mathematicsChapters,
    tests: [],
    mockTests: []
  }
];

export const dummyMaths: SubjectWithRelations = {
  id: "3",
  name: "Mathematics",
  weightage: 30,
  expectedMarks: 90,
  foundationLevel: "Advanced",
  overallProgress: 85,
  learningProgress: 90,
  revisionProgress: 80,
  practiceProgress: 75,
  testProgress: 95,
  position: 3,
  userId: "demo",
  createdAt: new Date(),
  updatedAt: new Date(),
  chapters: [
    {
      id: "3",
      name: "Calculus",
      important: true,
      overallProgress: 85,
      learningProgress: 90,
      revisionProgress: 80,
      practiceProgress: 75,
      testProgress: 95,
      position: 1,
      subjectId: "3",
      createdAt: new Date(),
      updatedAt: new Date(),
      topics: [
        {
          id: "3",
          name: "Limits and Continuity",
          important: true,
          learningStatus: true,
          revisionCount: 3,
          practiceCount: 2,
          testCount: 2,
          position: 1,
          lastRevised: new Date(),
          nextRevision: new Date(Date.now() + 24 * 60 * 60 * 1000),
          chapterId: "3",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      subject: {
        id: "3",
        name: "Mathematics",
        weightage: 30,
        expectedMarks: 90,
        foundationLevel: "Advanced",
        overallProgress: 85,
        learningProgress: 90,
        revisionProgress: 80,
        practiceProgress: 75,
        testProgress: 95,
        position: 3,
        userId: "demo",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }
  ],
  tests: [{ id: "3", score: 95, subjectId: "3", createdAt: new Date() }],
  mockTests: []
};

export const dummyExamFoundation: ExamFoundationResult = {
  currentLevel: {
    level: 6,
    title: "Advanced Learner",
    description: "Deep understanding with strong problem-solving abilities.",
    minProgress: 51,
    requirements: {
      learning: 70,
      revision: 60,
      practice: 55,
      test: 50
    }
  },
  nextLevel: {
    level: 7,
    title: "Competent Solver",
    description: "Proficient in solving complex problems with good test performance.",
    minProgress: 61,
    requirements: {
      learning: 80,
      revision: 70,
      practice: 65,
      test: 60
    }
  },
  progressToNextLevel: 75,
  strengths: [
    "Strong conceptual learning",
    "Excellent revision habits"
  ],
  areasToImprove: [
    "More problem-solving practice needed",
    "Improve test performance"
  ],
  overallProgress: 65
}; 