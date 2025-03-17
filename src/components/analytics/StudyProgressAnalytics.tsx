'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, isToday, isSameWeek, isSameMonth } from 'date-fns';
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAnalytics } from '@/contexts/analytics-context';
import { SubjectActivity } from '@/app/api/analytics/types';

// Import the common components
import { ActivityHeader } from './common/ActivityHeader';
import { ActivitySummary } from './common/ActivitySummary';
import { ActivityInsights } from './common/ActivityInsights';
import { LoadingErrorEmpty } from './common/LoadingErrorEmpty';
import { ActivityConfig, getPredominantActivityType, fetchSubjectProgress } from './common/activity-utils';

export function StudyProgressAnalytics() {
    const { selectedDate } = useAnalytics();
    
    const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'all'>(() => {
        // Set default time range based on selected date
        if (isToday(selectedDate)) return 'day';
        if (isSameWeek(selectedDate, new Date())) return 'week';
        if (isSameMonth(selectedDate, new Date())) return 'month';
        return 'day';
    });

    // Fetch subject progress data
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['subject-progress', timeRange, selectedDate.toISOString()],
        queryFn: () => fetchSubjectProgress(timeRange, selectedDate.toISOString()),
        staleTime: 60000, // 1 minute
    });

    // Format date range for display
    const getDateRangeText = () => {
        if (!data) return '';

        switch (timeRange) {
            case 'day':
                return format(new Date(data.dateRange.start), 'MMMM d, yyyy');
            case 'week':
                return `${format(new Date(data.dateRange.start), 'MMM d')} - ${format(new Date(data.dateRange.end), 'MMM d, yyyy')}`;
            case 'month':
                return format(new Date(data.dateRange.start), 'MMMM yyyy');
            case 'all':
                return 'All Time';
        }
    };

    // Calculate insights and recommendations
    const insights = useMemo(() => {
        if (!data || !data.subjects || data.totalStats.total === 0) return null;

        const mostActiveSubject = [...data.subjects].sort((a, b) => b.activity.total - a.activity.total)[0];
        const leastActiveSubject = [...data.subjects]
            .filter(s => s.overallProgress < 100 && s.overallProgress > 0) // Only consider incomplete subjects
            .sort((a, b) => a.activity.total - b.activity.total)[0];

        const balancedSubjects = data.subjects.filter((s: SubjectActivity) => {
            // Check if activity is balanced across all types
            const types = ['learning', 'revision', 'practice', 'test'] as const;
            const activityValues = types.map(t => s.activity[t]);
            const max = Math.max(...activityValues);
            const min = Math.min(...activityValues.filter(v => v > 0) || [0]);

            // Consider balanced if max/min ratio is less than 3 and there's activity
            return max > 0 && (min === 0 || max / min < 3);
        });

        const learningHeavy = data.subjects.filter((s: SubjectActivity) =>
            s.activity.total > 0 &&
            s.activity.learning > (s.activity.revision + s.activity.practice + s.activity.test)
        );

        return {
            mostActiveSubject,
            leastActiveSubject,
            balancedSubjects,
            learningHeavy,
            focusRecommendation: leastActiveSubject ? leastActiveSubject.name : undefined,
            balanceRecommendation: learningHeavy.length > 0 ? learningHeavy[0].name : undefined,
        };
    }, [data]);

    // Check if there is data to display
    const isEmpty = !data?.totalStats.total;

    return (
        <TooltipProvider>
            <div className="space-y-6 h-full flex flex-col">
                {/* Header with Time Range Tabs */}
                <ActivityHeader
                    title="Subject Progress"
                    subtitle="Analyzing your activity for"
                    timeRange={timeRange}
                    isLoading={isLoading}
                    onTimeRangeChange={setTimeRange}
                    dateRangeText={getDateRangeText()}
                    tooltipContent="Track your progress and activity across subjects"
                />

                {/* Loading, Error, or Empty State */}
                <div className="flex-1 flex flex-col">
                    <LoadingErrorEmpty
                        isLoading={isLoading}
                        isError={isError}
                        isEmpty={isEmpty}
                        error={error}
                        dateRangeText={getDateRangeText()}
                        onViewAllData={() => setTimeRange('all')}
                    />

                    {/* Show content when there is data */}
                    {!isLoading && !isError && !isEmpty && (
                        <div className="h-full flex-1">
                            {/* Activity Summary and Insights */}
                            <div className="h-full grid grid-cols-1 md:grid-cols-[1.2fr,0.8fr] gap-6">
                                {/* Activity Insights Card */}
                                <ActivityInsights
                                    subjects={data!.subjects}
                                    activityConfig={ActivityConfig}
                                    focusRecommendation={insights?.focusRecommendation}
                                    getPredominantActivityType={getPredominantActivityType}
                                />

                                {/* Activity Summary Card */}
                                <ActivitySummary
                                    totalStats={data!.totalStats}
                                    activityConfig={ActivityConfig}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </TooltipProvider>
    );
} 