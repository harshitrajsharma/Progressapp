export type Category = 'overall' | 'learning' | 'revision' | 'practice' | 'test';

export interface Progress {
  overall: number;
  learning: number;
  revision: number;
  practice: number;
  test: number;
}

export interface CategoryConfig {
  label: string;
  color: string;
  bgColor: string;
  progressColor: string;
}

export const CATEGORIES: Record<Category, CategoryConfig> = {
  overall: { 
    label: 'Overall', 
    color: 'text-primary', 
    bgColor: 'bg-primary/10',
    progressColor: 'bg-primary'
  },
  learning: { 
    label: 'Learning', 
    color: 'text-blue-500', 
    bgColor: 'bg-blue-500/10',
    progressColor: 'bg-blue-500'
  },
  revision: { 
    label: 'Revision', 
    color: 'text-green-500', 
    bgColor: 'bg-green-500/10',
    progressColor: 'bg-green-500'
  },
  practice: { 
    label: 'Practice', 
    color: 'text-orange-500', 
    bgColor: 'bg-orange-500/10',
    progressColor: 'bg-orange-500'
  },
  test: { 
    label: 'Test', 
    color: 'text-purple-500', 
    bgColor: 'bg-purple-500/10',
    progressColor: 'bg-purple-500'
  }
}; 