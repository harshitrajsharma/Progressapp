'use client'

import { createContext, useCallback, useContext, useMemo, PropsWithChildren } from 'react'
import { ProgressType, ProgressUpdate, progressStore } from '@/lib/progress-store'

interface ProgressContextValue {
  getProgress: (entityId: string, type: ProgressType) => number;
  invalidateProgress: (entityId: string) => void;
  batchUpdate: (updates: ProgressUpdate[]) => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: PropsWithChildren) {
  const contextValue = useMemo(() => ({
    getProgress: (id: string, type: ProgressType) => progressStore.calculateProgress(id, type),
    invalidateProgress: (id: string) => progressStore.invalidate(id),
    batchUpdate: (updates: ProgressUpdate[]) => progressStore.batchUpdate(updates)
  }), []);

  return (
    <ProgressContext.Provider value={contextValue}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress(entityId: string) {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within ProgressProvider');
  }

  return useMemo(() => ({
    learning: context.getProgress(entityId, 'learning'),
    revision: context.getProgress(entityId, 'revision'),
    practice: context.getProgress(entityId, 'practice'),
    test: context.getProgress(entityId, 'test'),
    overall: context.getProgress(entityId, 'overall'),
    invalidate: () => context.invalidateProgress(entityId)
  }), [context, entityId]);
}

export function useProgressUpdate() {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgressUpdate must be used within ProgressProvider');
  }

  return useCallback((updates: ProgressUpdate[]) => {
    context.batchUpdate(updates);
  }, [context]);
} 