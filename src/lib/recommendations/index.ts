import type { SubjectWithRelations } from "../calculations/types";
import { 
  RecommendationType, 
  RecommendationCategory, 
  RecommendationConfig, 
  RecommendationSubject,
  FoundationLevel
} from './types';
import { DEFAULT_CONFIG } from './config';
import { getFoundationMultiplier, getTimeUrgency, clearUtilCaches } from './utils';

// Score calculation cache
const scoreCache = new Map<string, number>();

// Final recommendations cache
const recommendationCache = new Map<string, RecommendationCategory[]>();

// Calculate score for a subject (memoized)
function calculateSubjectScore(
  subject: SubjectWithRelations,
  type: RecommendationType,
  daysLeft: number,
  config: RecommendationConfig
): number {
  const cacheKey = `${subject.id}-${type}-${daysLeft}`;
  if (scoreCache.has(cacheKey)) return scoreCache.get(cacheKey)!;

  const { weightageFactors } = config;
  let score: number;

  switch (type) {
    case RecommendationType.REVISE:
      score = (
        subject.weightage * weightageFactors.gate +
        (100 - subject.revisionProgress) * weightageFactors.progress +
        getFoundationMultiplier(subject.foundationLevel as FoundationLevel) * weightageFactors.foundation +
        getTimeUrgency(daysLeft) * weightageFactors.time
      );
      break;

    case RecommendationType.PRIORITY:
      score = (
        subject.weightage * weightageFactors.gate +
        subject.learningProgress * weightageFactors.progress +
        getFoundationMultiplier(subject.foundationLevel as FoundationLevel) * weightageFactors.foundation +
        getTimeUrgency(daysLeft) * weightageFactors.time
      );
      break;

    case RecommendationType.START:
      score = (
        subject.weightage * (weightageFactors.gate + weightageFactors.progress) +
        getFoundationMultiplier(subject.foundationLevel as FoundationLevel) * weightageFactors.foundation +
        getTimeUrgency(daysLeft) * weightageFactors.time
      );
      break;

    default:
      score = 0;
  }

  scoreCache.set(cacheKey, score);
  return score;
}

// Main recommendation function
export function getRecommendations(
  subjects: SubjectWithRelations[],
  daysLeft: number,
  config: RecommendationConfig = DEFAULT_CONFIG
): RecommendationCategory[] {
  // Generate cache key
  const cacheKey = JSON.stringify({
    subjects: subjects.map(s => ({
      id: s.id,
      progress: s.learningProgress,
      revision: s.revisionProgress,
      weightage: s.weightage
    })),
    daysLeft,
    config
  });

  // Return cached results if available
  if (recommendationCache.has(cacheKey)) {
    return recommendationCache.get(cacheKey)!;
  }

  // Filter and sort subjects for each category
  const filterAndSortSubjects = (
    filterFn: (s: SubjectWithRelations) => boolean,
    type: RecommendationType
  ): RecommendationSubject[] => {
    return subjects
      .filter(filterFn)
      .map(subject => ({
        score: calculateSubjectScore(subject, type, daysLeft, config),
        subject,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, config.maxSubjectsPerCategory)
      .map(({ subject }) => ({
        id: subject.id,
        name: subject.name,
        weightage: subject.weightage,
        progress: subject.learningProgress,
        behindTarget: type === RecommendationType.PRIORITY ? 
          Math.max(0, 60 - subject.learningProgress) : undefined,
        priority: 'High priority - Start soon'
      }));
  };

  // Generate recommendations
  const recommendations: RecommendationCategory[] = [
    {
      type: RecommendationType.REVISE,
      title: 'Revise',
      description: 'Subjects ready for revision',
      subjects: filterAndSortSubjects(
        s => s.learningProgress >= config.progressThresholds.revision,
        RecommendationType.REVISE
      )
    },
    {
      type: RecommendationType.PRIORITY,
      title: 'Priority Focus',
      description: 'Subjects needing immediate attention',
      subjects: filterAndSortSubjects(
        s => s.learningProgress > 0 && s.learningProgress < 100,
        RecommendationType.PRIORITY
      )
    },
    {
      type: RecommendationType.START,
      title: 'Start Next',
      description: 'Recommended subjects to begin',
      subjects: filterAndSortSubjects(
        s => s.learningProgress === 0,
        RecommendationType.START
      )
    }
  ];

  // Cache the results
  recommendationCache.set(cacheKey, recommendations);

  return recommendations;
}

// Clear all caches
export function clearRecommendationCaches(): void {
  scoreCache.clear();
  recommendationCache.clear();
  clearUtilCaches();
}

// Re-export types and config
export * from './types';
export { DEFAULT_CONFIG } from './config'; 