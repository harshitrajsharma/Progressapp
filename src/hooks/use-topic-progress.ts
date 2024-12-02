import { useEffect } from 'react';
import { Topic } from "@prisma/client";
import { useProgress } from '@/components/providers/progress-provider';
import { progressStore } from '@/lib/progress-store';

export function useTopicProgress(topic: Topic) {
  // Set topic data in store
  useEffect(() => {
    progressStore.setData(topic.id, { topic });
  }, [topic]);

  // Get progress values
  const progress = useProgress(topic.id);

  return {
    ...progress,
    // Helper functions
    isStarted: progress.learning > 0,
    isCompleted: progress.learning === 100,
    isInProgress: progress.learning > 0 && progress.learning < 100,
  };
} 