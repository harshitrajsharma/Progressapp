'use client';

import useSWR from 'swr';
import { SubjectWithRelations } from '@/lib/calculations/types';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useSubjects() {
  const {
    data: subjects,
    error,
    isLoading,
    mutate
  } = useSWR<SubjectWithRelations[]>('/api/subjects', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 10000,
  });

  const revalidateSubjects = () => {
    return mutate();
  };

  return {
    subjects,
    error,
    isLoading,
    revalidateSubjects
  };
} 