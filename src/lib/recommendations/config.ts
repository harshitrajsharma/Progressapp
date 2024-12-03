import type { RecommendationConfig } from './types';

export const DEFAULT_CONFIG: RecommendationConfig = {
  maxSubjectsPerCategory: 2,
  progressThresholds: {
    revision: 40,  // Start recommending revision at 40% learning progress
    practice: 80,  // Start recommending practice at 80% learning progress
    test: 90      // Start recommending tests at 90% learning progress
  },
  weightageFactors: {
    gate: 0.4,    // 40% weight for GATE marks
    progress: 0.3, // 30% weight for current progress
    foundation: 0.2, // 20% weight for foundation level
    time: 0.1     // 10% weight for time pressure
  }
}; 