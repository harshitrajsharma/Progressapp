'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarView } from "@/components/analytics/CalendarView";
import StudyTimelineSkeleton from '../../../components/skeletons/studytimeline-skeleton';

// Function to fetch exam date
async function fetchExamDate(): Promise<Date | null> {
  const response = await fetch('/api/user/dashboard');
  if (response.ok) {
    const data = await response.json();
    return data.user?.examDate ? new Date(data.user.examDate) : null;
  }
  return null;
}

export default function AnalyticsPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const { data: examDate = null, isLoading } = useQuery({
    queryKey: ['examDate'],
    queryFn: fetchExamDate,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  if (isLoading) return (
    <div className="w-full px-2 sm:px-4">
      <StudyTimelineSkeleton />
    </div>
  );

  return (
    <div className="space-y-8">
      <CalendarView
        selectedDate={selectedDate}
        onSelectDate={(date) => date && setSelectedDate(date)}
        examDate={examDate}
      />
    </div>
  );
} 