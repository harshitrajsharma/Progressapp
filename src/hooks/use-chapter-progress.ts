import { useEffect } from 'react';
import { Chapter, Topic } from "@prisma/client";
import { useProgress } from '@/components/providers/progress-provider';
import { progressStore } from '@/lib/progress-store';

interface ChapterWithTopics extends Chapter {
  topics: Topic[];
}

export function useChapterProgress(chapter: ChapterWithTopics) {
  // Set chapter data in store
  useEffect(() => {
    progressStore.setData(chapter.id, { chapter });
  }, [chapter]);

  // Get progress values
  const progress = useProgress(chapter.id);

  return {
    ...progress,
    // Helper functions
    isStarted: progress.learning > 0,
    isCompleted: progress.learning === 100,
    isInProgress: progress.learning > 0 && progress.learning < 100,
  };
} 