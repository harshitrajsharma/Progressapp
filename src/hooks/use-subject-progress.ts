import { useEffect } from 'react';
import { Subject, Chapter, Topic, Test } from "@prisma/client";
import { useProgress } from '@/components/providers/progress-provider';
import { progressStore } from '@/lib/progress-store';

interface SubjectWithChapters extends Subject {
  chapters: (Chapter & {
    topics: Topic[];
  })[];
  tests?: Test[];
}

export function useSubjectProgress(subject: SubjectWithChapters) {
  // Set subject data in store
  useEffect(() => {
    progressStore.setData(subject.id, { subject });
  }, [subject]);

  // Get progress values
  const progress = useProgress(subject.id);

  return {
    ...progress,
    // Helper functions
    isStarted: progress.learning > 0,
    isCompleted: progress.learning === 100,
    isInProgress: progress.learning > 0 && progress.learning < 100,
  };
} 