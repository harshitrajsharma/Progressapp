import { BookOpen, RotateCcw, Dumbbell, FileSpreadsheet } from 'lucide-react';
import { SubjectActivity } from '@/app/api/analytics/types';
import type { ActivityConfig as ActivityConfigType } from '../types';

// Activity Type icons and colors
export const ActivityConfig: Record<string, ActivityConfigType> = {
  learning: {
      icon: <BookOpen className="h-4 w-4" />,
      label: "Learning",
      color: "text-blue-500",
      bgColor: "bg-blue-500",
      bgColorFaded: "bg-blue-100 dark:bg-blue-900/30",
      description: "First-time study of a topic"
  },
  revision: {
      icon: <RotateCcw className="h-4 w-4" />,
      label: "Revision",
      color: "text-purple-500",
      bgColor: "bg-purple-500",
      bgColorFaded: "bg-purple-100 dark:bg-purple-900/30",
      description: "Reinforcing previously learned material"
  },
  practice: {
      icon: <Dumbbell className="h-4 w-4" />,
      label: "Practice",
      color: "text-amber-500",
      bgColor: "bg-amber-500",
      bgColorFaded: "bg-amber-100 dark:bg-amber-900/30",
      description: "Applying knowledge to problems"
  },
  test: {
      icon: <FileSpreadsheet className="h-4 w-4" />,
      label: "Tests",
      color: "text-red-500",
      bgColor: "bg-red-500",
      bgColorFaded: "bg-red-100 dark:bg-red-900/30",
      description: "Testing knowledge and skills"
  }
};

// Determine predominant activity type with better error handling
export const getPredominantActivityType = (subject: SubjectActivity) => {
  try {
    if (!subject?.activity) {
      return 'learning'; // Default if no activity data
    }
    
    const activityTypes = ['learning', 'revision', 'practice', 'test'] as const;
    
    // Check if there's any activity at all
    const hasActivity = activityTypes.some(type => 
      typeof subject.activity[type] === 'number' && subject.activity[type] > 0
    );
    
    if (!hasActivity) {
      return 'learning'; // Default if no activity counts
    }
    
    // Find the predominant activity type
    return activityTypes.reduce((prev, curr) => {
      const prevCount = typeof subject.activity[prev] === 'number' ? subject.activity[prev] : 0;
      const currCount = typeof subject.activity[curr] === 'number' ? subject.activity[curr] : 0;
      return currCount > prevCount ? curr : prev;
    }, activityTypes[0]);
  } catch (error) {
    console.error("Error determining predominant activity type:", error);
    return 'learning'; // Fallback to learning in case of errors
  }
};

// Fetch subject progress data with improved validation
export async function fetchSubjectProgress(range: string, date: string) {
  try {
    const response = await fetch(`/api/analytics/subjects?range=${range}&date=${date}`);
    if (!response.ok) {
      throw new Error('Failed to fetch subject progress');
    }
    
    const data = await response.json();
    
    // Validate and normalize subject data
    if (data.subjects && Array.isArray(data.subjects)) {
      data.subjects = data.subjects.map((subject: SubjectActivity) => {
        // Ensure proper progress values
        const learningProgress = typeof subject.learningProgress === 'number' 
          ? Math.max(0, Math.min(100, subject.learningProgress)) // Clamp between 0-100
          : 0;
          
        const overallProgress = typeof subject.overallProgress === 'number'
          ? Math.max(0, Math.min(100, subject.overallProgress))
          : 0;
        
        // Ensure activity structure is complete
        const activity = {
          learning: typeof subject.activity?.learning === 'number' ? subject.activity.learning : 0,
          revision: typeof subject.activity?.revision === 'number' ? subject.activity.revision : 0,
          practice: typeof subject.activity?.practice === 'number' ? subject.activity.practice : 0,
          test: typeof subject.activity?.test === 'number' ? subject.activity.test : 0,
          total: typeof subject.activity?.total === 'number' ? subject.activity.total : 0
        };
        
        // Recalculate total if needed
        if (activity.total === 0 && (activity.learning > 0 || activity.revision > 0 || 
            activity.practice > 0 || activity.test > 0)) {
          activity.total = activity.learning + activity.revision + activity.practice + activity.test;
        }
        
        // Ensure dates are valid
        const createdAt = subject.createdAt ? new Date(subject.createdAt).toISOString() : new Date().toISOString();
        
        return {
          ...subject,
          learningProgress,
          overallProgress,
          activity,
          createdAt,
          // Add a data validation flag for components to check
          isDataValidated: true
        };
      });
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching subject progress:", error);
    throw error;
  }
} 