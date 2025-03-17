'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { 
  calculateChapterProgress, 
  calculateSubjectProgress, 
  calculateTopicProgress,
  isTopicCompletedForCategory,
  calculateProgressStats,
  calculateFoundationLevel
} from '@/lib/calculations/progress';
import { 
  Topic,
  ChapterWithRelations,
  SubjectWithRelations,
  TopicProgress,
  ChapterProgress,
  SubjectProgress,
  ProgressStats
} from '@/lib/calculations/types';

// Define the shape of our context
interface ProgressContextType {
  // Progress calculation functions
  calculateTopicProgress: (topic: Topic) => TopicProgress;
  calculateChapterProgress: (chapter: ChapterWithRelations) => ChapterProgress;
  calculateSubjectProgress: (subject: SubjectWithRelations) => SubjectProgress;
  isTopicCompletedForCategory: (topic: Topic, category: 'learning' | 'revision' | 'practice' | 'test') => boolean;
  calculateProgressStats: (topics: Topic[], category: 'learning' | 'revision' | 'practice' | 'test') => ProgressStats;
  calculateFoundationLevel: (progress: {
    learning: number;
    revision: number;
    practice: number;
    test: number;
  }) => string;
  
  // Helper functions for analytics view
  getActivityDays: (activity: {
    learning: number;
    revision: number;
    practice: number;
    test: number;
    total: number;
  }) => {
    learning: number;
    revision: number;
    practice: number;
    test: number;
    max: number;
    maxType: 'learning' | 'revision' | 'practice' | 'test';
  };
  
  formatProgressPercentage: (value: number) => string;
}

// Create the context with default values
const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

// Provider component
export function ProgressProvider({ children }: { children: ReactNode }) {
  // Helper function to get activity days
  const getActivityDays = (activity: {
    learning: number;
    revision: number;
    practice: number;
    test: number;
    total: number;
  }) => {
    // Calculate approximate days for each activity type based on activity count
    // Assuming each day has ~3 activities on average
    const learningDays = Math.ceil(activity.learning / 3);
    const revisionDays = Math.ceil(activity.revision / 3);
    const practiceDays = Math.ceil(activity.practice / 3);
    const testDays = Math.ceil(activity.test / 3);
    
    const maxDays = Math.max(learningDays, revisionDays, practiceDays, testDays);
    let maxType: 'learning' | 'revision' | 'practice' | 'test' = 'learning';
    
    if (maxDays === learningDays) maxType = 'learning';
    else if (maxDays === revisionDays) maxType = 'revision';
    else if (maxDays === practiceDays) maxType = 'practice';
    else if (maxDays === testDays) maxType = 'test';
    
    return {
      learning: learningDays,
      revision: revisionDays,
      practice: practiceDays,
      test: testDays,
      max: maxDays,
      maxType
    };
  };

  // Helper function to format progress percentage
  const formatProgressPercentage = (value: number): string => {
    return Math.round(value) + '%';
  };

  // Create the context value object
  const value: ProgressContextType = {
    calculateTopicProgress,
    calculateChapterProgress,
    calculateSubjectProgress,
    isTopicCompletedForCategory,
    calculateProgressStats,
    calculateFoundationLevel,
    getActivityDays,
    formatProgressPercentage
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

// Custom hook to use the progress context
export function useProgress() {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
} 