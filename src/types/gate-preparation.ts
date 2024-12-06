export type SubjectPriority = 'HIGH' | 'MEDIUM' | 'LOW';
export type StudyBlock = 'MORNING' | 'AFTERNOON' | 'EVENING';
export type TrackType = 'MATHEMATICAL' | 'CORE' | 'REVISION';
export type TestType = 'TWT' | 'SWT' | 'MST' | 'GBG' | 'GATE_PYQ';

export interface Topic {
    id: string;
    name: string;
    subject: string;
    priority: SubjectPriority;
    estimatedHours: number;
    completedHours?: number;
    lastStudied?: Date;
    track: TrackType;
}

export interface DailyStudySlot {
    block: StudyBlock;
    duration: number;  // in hours
    topic: Topic;
    isCompleted: boolean;
    isTest?: boolean;
    testDetails?: TestSchedule;
}

export interface DailyPlan {
    date: Date;
    slots: DailyStudySlot[];
    totalHours: number;
}

export interface StudyProgress {
    topicId: string;
    completedHours: number;
    lastStudied: Date;
    confidence: number;  // 0-100
}

export interface PreparationConfig {
    examDate: Date;
    dailyAvailableHours: {
        [key in StudyBlock]: number;
    };
    preferredTrackOrder: TrackType[];
    topicPriorityWeights: {
        [key in SubjectPriority]: number;
    };
}

export interface TestConfig {
    type: TestType;
    triggerProgress: number;
    frequency: number;
    duration: number;
    questionsCount: number;
    marksPerTest: number;
}

export interface TestScheduleConfig {
    topicWiseTests: TestConfig;
    subjectWiseTests: TestConfig;
    multipleSubjectTests: TestConfig;
    gateBeforeGate: TestConfig;
    gatePYQs: TestConfig;
}

export interface TestSchedule {
    id: string;
    type: TestType;
    name: string;
    questions: number;
    marks: number;
    duration: number;
    scheduledFor: Date;
    subjects: string[];
    track: TrackType;
    completed: boolean;
    score?: number;
}

export interface StudyPlan {
    startDate: Date;
    endDate: Date;
    dailyPlans: DailyPlan[];
    progress: StudyProgress[];
    config: PreparationConfig;
    testSchedule?: TestSchedule[];
} 