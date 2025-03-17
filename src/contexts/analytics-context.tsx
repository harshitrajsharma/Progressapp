'use client';

import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format, addDays, subDays } from 'date-fns';
import { ActivityType } from '@/components/analytics/activity-config';
import type { CalendarActivity, ActivityDetail } from '@/app/api/analytics/types';

interface AnalyticsContextType {
  // Date selection
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  
  // Activity data
  activityData: CalendarActivity | undefined;
  isLoading: boolean;
  
  // Filter state
  selectedFilter: ActivityType | null;
  setSelectedFilter: (filter: ActivityType | null) => void;
  
  // Tab state
  activeTab: string;
  setActiveTab: (tab: string) => void;
  
  // Derived data
  filteredDetails: Record<ActivityType, ActivityDetail[]> | null;
  
  // Navigation
  goToPreviousDay: () => void;
  goToNextDay: () => void;
  goToToday: () => void;
  
  // Exam date
  examDate: Date | null;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

// Fetch day activities function
async function fetchDayActivities(date: string): Promise<CalendarActivity> {
  const response = await fetch(`/api/analytics/calendar?date=${date}`);
  if (!response.ok) {
    throw new Error('Failed to fetch activities');
  }
  return response.json();
}

// Add tab constants
export const TAB_KEYS = {
  ACTIVITY: 'activity',
  PROGRESS: 'progress',
  LEARNING: 'learning',
  PHASES: 'phases'
};

// localStorage key for tab persistence
const ANALYTICS_TAB_KEY = 'analytics-active-tab';

// Helper function to get the initial tab from localStorage
const getInitialTab = (): string => {
  if (typeof window !== 'undefined') {
    const savedTab = localStorage.getItem(ANALYTICS_TAB_KEY);
    if (savedTab) return savedTab;
  }
  return TAB_KEYS.ACTIVITY; // Default tab
};

export const AnalyticsProvider: React.FC<{
  children: React.ReactNode;
  initialDate?: Date;
  examDate: Date | null;
}> = ({ children, initialDate = new Date(), examDate }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [selectedFilter, setSelectedFilter] = useState<ActivityType | null>(null);
  const [activeTab, setActiveTab] = useState<string>(getInitialTab());
  const queryClient = useQueryClient();
  
  // Query for selected day's activities
  const { data: activityData, isLoading } = useQuery({
    queryKey: ['calendar-activities', format(selectedDate, 'yyyy-MM-dd')],
    queryFn: () => fetchDayActivities(format(selectedDate, 'yyyy-MM-dd')),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

  // Save activeTab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(ANALYTICS_TAB_KEY, activeTab);
  }, [activeTab]);

  // Prefetch next and previous day data
  useEffect(() => {
    const nextDay = format(addDays(selectedDate, 1), 'yyyy-MM-dd');
    const prevDay = format(subDays(selectedDate, 1), 'yyyy-MM-dd');

    queryClient.prefetchQuery({
      queryKey: ['calendar-activities', nextDay],
      queryFn: () => fetchDayActivities(nextDay),
    });

    queryClient.prefetchQuery({
      queryKey: ['calendar-activities', prevDay],
      queryFn: () => fetchDayActivities(prevDay),
    });
  }, [selectedDate, queryClient]);

  // Navigation functions
  const goToPreviousDay = useCallback(() => 
    setSelectedDate(prev => subDays(prev, 1)), []);
    
  const goToNextDay = useCallback(() => 
    setSelectedDate(prev => addDays(prev, 1)), []);
    
  const goToToday = useCallback(() => 
    setSelectedDate(new Date()), []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyNavigation = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPreviousDay();
      if (e.key === 'ArrowRight') goToNextDay();
    };

    window.addEventListener('keydown', handleKeyNavigation);
    return () => window.removeEventListener('keydown', handleKeyNavigation);
  }, [goToPreviousDay, goToNextDay]);

  // Filtered details based on selected filter
  const filteredDetails = useMemo<Record<ActivityType, ActivityDetail[]> | null>(() => {
    if (!activityData?.details) return null;

    if (selectedFilter) {
      return {
        learning: [],
        revision: [],
        practice: [],
        test: [],
        [selectedFilter]: activityData.details[selectedFilter] || []
      };
    }

    return activityData.details;
  }, [activityData?.details, selectedFilter]);

  // Add activeTab and setActiveTab to context value
  const contextValue = useMemo(() => ({
    selectedDate,
    setSelectedDate,
    activityData,
    isLoading,
    selectedFilter,
    setSelectedFilter,
    activeTab,
    setActiveTab,
    filteredDetails,
    goToPreviousDay,
    goToNextDay,
    goToToday,
    examDate
  }), [
    selectedDate, activityData, isLoading, selectedFilter, 
    filteredDetails, goToPreviousDay, goToNextDay, goToToday, examDate,
    activeTab
  ]);

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
};

// Custom hook to use the analytics context
export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}; 