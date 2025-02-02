import { TestType, TestSchedule, TestScheduleConfig } from '@/types/gate-preparation';
import { Subject, SubjectProgress } from '@prisma/client';

export class TestScheduler {
  private readonly TEST_CONFIG: TestScheduleConfig = {
    topicWiseTests: {
      type: 'TWT',
      triggerProgress: 50,
      frequency: 3,
      duration: 40,
      questionsCount: 13,
      marksPerTest: 20
    },
    subjectWiseTests: {
      type: 'SWT',
      triggerProgress: 75,
      frequency: 5,
      duration: 75,
      questionsCount: 26,
      marksPerTest: 40
    },
    multipleSubjectTests: {
      type: 'MST',
      triggerProgress: 60,
      frequency: 14,
      duration: 110,
      questionsCount: 39,
      marksPerTest: 60
    },
    gateBeforeGate: {
      type: 'GBG',
      triggerProgress: 80,
      frequency: 7,
      duration: 180,
      questionsCount: 65,
      marksPerTest: 100
    },
    gatePYQs: {
      type: 'GATE_PYQ',
      triggerProgress: 90,
      frequency: 3,
      duration: 180,
      questionsCount: 65,
      marksPerTest: 100
    }
  };

  constructor(
    private subjects: Subject[],
    private progress: SubjectProgress[],
    private daysToExam: number
  ) {}

  public generateTestSchedule(): TestSchedule[] {
    const schedule: TestSchedule[] = [];
    
    // Schedule Topic Wise Tests
    this.subjects.forEach(subject => {
      if (this.getSubjectProgress(subject.id) >= this.TEST_CONFIG.topicWiseTests.triggerProgress) {
        schedule.push(...this.generateTWTs(subject));
      }
    });

    // Schedule Subject Wise Tests
    this.subjects.forEach(subject => {
      if (this.getSubjectProgress(subject.id) >= this.TEST_CONFIG.subjectWiseTests.triggerProgress) {
        schedule.push(...this.generateSWTs(subject));
      }
    });

    // Schedule Multiple Subject Tests
    if (this.getOverallProgress() >= this.TEST_CONFIG.multipleSubjectTests.triggerProgress) {
      schedule.push(...this.generateMSTs());
    }

    // Schedule Full Length Tests
    if (this.getOverallProgress() >= this.TEST_CONFIG.gateBeforeGate.triggerProgress) {
      schedule.push(...this.generateFullLengthTests());
    }

    return this.optimizeSchedule(schedule);
  }

  private generateTWTs(subject: Subject): TestSchedule[] {
    const tests: TestSchedule[] = [];
    const config = this.TEST_CONFIG.topicWiseTests;
    const scheduleDate = new Date();

    // Generate TWTs for each chapter
    subject.chapters.forEach((chapter, index) => {
      tests.push({
        id: `twt-${subject.id}-${index}`,
        type: 'TWT',
        name: `TWT ${index + 1}: ${subject.name} - ${chapter.name}`,
        questions: config.questionsCount,
        marks: config.marksPerTest,
        duration: config.duration,
        scheduledFor: new Date(scheduleDate),
        subjects: [subject.id],
        track: 'CORE',
        completed: false
      });

      // Add frequency days for next test
      scheduleDate.setDate(scheduleDate.getDate() + config.frequency);
    });

    return tests;
  }

  private generateSWTs(subject: Subject): TestSchedule[] {
    const config = this.TEST_CONFIG.subjectWiseTests;
    return [{
      id: `swt-${subject.id}`,
      type: 'SWT',
      name: `SWT: ${subject.name} Comprehensive`,
      questions: config.questionsCount,
      marks: config.marksPerTest,
      duration: config.duration,
      scheduledFor: this.findNextAvailableDate(config.frequency),
      subjects: [subject.id],
      track: 'CORE',
      completed: false
    }];
  }

  private generateMSTs(): TestSchedule[] {
    const config = this.TEST_CONFIG.multipleSubjectTests;
    const tests: TestSchedule[] = [];
    const subjectGroups = this.getSubjectGroups();

    subjectGroups.forEach((group, index) => {
      tests.push({
        id: `mst-${index}`,
        type: 'MST',
        name: `MST ${index + 1}: ${group.map(s => s.name).join(' + ')}`,
        questions: config.questionsCount,
        marks: config.marksPerTest,
        duration: config.duration,
        scheduledFor: this.findNextAvailableDate(config.frequency),
        subjects: group.map(s => s.id),
        track: 'CORE',
        completed: false
      });
    });

    return tests;
  }

  private generateFullLengthTests(): TestSchedule[] {
    const tests: TestSchedule[] = [];
    const gbgConfig = this.TEST_CONFIG.gateBeforeGate;
    const pyqConfig = this.TEST_CONFIG.gatePYQs;

    // Generate GATE Before GATE tests
    for (let i = 0; i < 11; i++) {
      tests.push({
        id: `gbg-${i}`,
        type: 'GBG',
        name: `GATE Before GATE ${i + 1}`,
        questions: gbgConfig.questionsCount,
        marks: gbgConfig.marksPerTest,
        duration: gbgConfig.duration,
        scheduledFor: this.findNextAvailableDate(gbgConfig.frequency),
        subjects: this.subjects.map(s => s.id),
        track: 'CORE',
        completed: false
      });
    }

    // Generate GATE PYQ tests if close to exam
    if (this.daysToExam <= 30) {
      for (let i = 0; i < 13; i++) {
        tests.push({
          id: `pyq-${i}`,
          type: 'GATE_PYQ',
          name: `GATE PYQ ${2024 - i}`,
          questions: pyqConfig.questionsCount,
          marks: pyqConfig.marksPerTest,
          duration: pyqConfig.duration,
          scheduledFor: this.findNextAvailableDate(pyqConfig.frequency),
          subjects: this.subjects.map(s => s.id),
          track: 'CORE',
          completed: false
        });
      }
    }

    return tests;
  }

  private optimizeSchedule(tests: TestSchedule[]): TestSchedule[] {
    return tests.sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime())
      .map((test, index) => {
        if (index > 0) {
          const prevTest = tests[index - 1];
          const minGap = this.getMinimumGapDays(test.type);
          
          if (this.getDaysDifference(prevTest.scheduledFor, test.scheduledFor) < minGap) {
            test.scheduledFor = this.addDays(prevTest.scheduledFor, minGap);
          }
        }
        return test;
      });
  }

  private getSubjectProgress(subjectId: string): number {
    return this.progress.find(p => p.subjectId === subjectId)?.learningProgress ?? 0;
  }

  private getOverallProgress(): number {
    const progressValues = this.progress.map(p => p.learningProgress);
    return progressValues.reduce((a, b) => a + b, 0) / progressValues.length;
  }

  private findNextAvailableDate(frequency: number): Date {
    const date = new Date();
    date.setDate(date.getDate() + frequency);
    return date;
  }

  private getSubjectGroups(): Subject[][] {
    // Group related subjects for MSTs
    return [
      this.subjects.filter(s => ['DS', 'ALGO', 'CN'].includes(s.name)),
      this.subjects.filter(s => ['DBMS', 'OS', 'COA'].includes(s.name))
    ];
  }

  private getMinimumGapDays(testType: TestType): number {
    switch (testType) {
      case 'TWT': return 2;
      case 'SWT': return 3;
      case 'MST': return 7;
      case 'GBG': return 5;
      case 'GATE_PYQ': return 2;
      default: return 1;
    }
  }

  private getDaysDifference(date1: Date, date2: Date): number {
    return Math.floor((date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24));
  }

  private addDays(date: Date, days: number): Date {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    return newDate;
  }
} 