'use client';

import { SubjectActivity } from '@/app/api/analytics/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ActivityConfig } from '../types';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useProgress } from '@/contexts/progress-context';

// Define activity type
type ActivityType = 'learning' | 'revision' | 'practice' | 'test';

// Define a type for the activity record
interface ActivityRecord {
    learning: number;
    revision: number;
    practice: number;
    test: number;
    total: number;
    [key: string]: number; // Add index signature to allow string indexing
}

interface ActivitySubjectCardProps {
    subject: SubjectActivity;
    index: number;
    activityConfig: Record<string, ActivityConfig>;
    predominantActivityType: string;
}

// List of valid activity types for checking
const ACTIVITY_TYPES: ActivityType[] = ['learning', 'revision', 'practice', 'test'];

export function ActivitySubjectCard({
    subject,
    index,
    activityConfig,
    predominantActivityType
}: ActivitySubjectCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const { getActivityDays, formatProgressPercentage } = useProgress();

    // Determine if this is the most active subject
    const isMostActive = index === 0;
    const rankText = isMostActive ? "#1" : `#${index + 1}`;

    // Validate and normalize subject data to ensure consistency
    const safeSubject = useMemo(() => {
        const defaultActivity: ActivityRecord = { learning: 0, revision: 0, practice: 0, test: 0, total: 0 };
        return {
            ...subject,
            activity: subject.activity || defaultActivity,
            learningProgress: typeof subject.learningProgress === 'number' ? subject.learningProgress : 0,
            revisionProgress: typeof subject.revisionProgress === 'number' ? subject.revisionProgress : 0,
            practiceProgress: typeof subject.practiceProgress === 'number' ? subject.practiceProgress : 0,
            testProgress: typeof subject.testProgress === 'number' ? subject.testProgress : 0,
            overallProgress: typeof subject.overallProgress === 'number' ? subject.overallProgress : 0,
            createdAt: subject.createdAt || new Date().toISOString()
        };
    }, [subject]);

    // Properly round progress values to integers for display
    const learningProgress = Math.round(safeSubject.learningProgress);
    const revisionProgress = Math.round(safeSubject.revisionProgress);
    const practiceProgress = Math.round(safeSubject.practiceProgress);
    const testProgress = Math.round(safeSubject.testProgress);
    const overallProgress = Math.round(safeSubject.overallProgress);
    
    // Determine if a specific category filter is applied
    const isCategorySelected = ACTIVITY_TYPES.includes(predominantActivityType as ActivityType);
    
    // Get the appropriate progress percentage to display
    const displayProgress = useMemo(() => {
        if (!isCategorySelected) {
            return overallProgress; // Overall progress when no category is selected
        }
        
        // Return category-specific progress when a category is selected
        switch (predominantActivityType as ActivityType) {
            case 'learning': return learningProgress;
            case 'revision': return revisionProgress;
            case 'practice': return practiceProgress;
            case 'test': return testProgress;
            default: return overallProgress;
        }
    }, [predominantActivityType, overallProgress, learningProgress, revisionProgress, practiceProgress, testProgress, isCategorySelected]);
    
    // Check if learning is completed (95% or more is considered complete)
    const isLearningCompleted = learningProgress >= 95;

    // Calculate days for each activity type using the progress context
    const activityDays = useMemo(() => {
        return getActivityDays(safeSubject.activity);
    }, [safeSubject.activity, getActivityDays]);

    // Calculate days since subject was started
    const daysActive = useMemo(() => {
        try {
            const startDate = new Date(safeSubject.createdAt);
            const currentDate = new Date();
            
            // Ensure startDate is valid and not in the future
            if (isNaN(startDate.getTime()) || startDate > currentDate) {
                return 1;
            }
            
            const daysSinceCreation = Math.max(
                1, // Minimum 1 day
                Math.ceil((currentDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24))
            );
            return daysSinceCreation;
        } catch (error) {
            console.error("Error calculating days active:", error);
            return 1;
        }
    }, [safeSubject.createdAt]);

    // Generate more appropriate status message based on context
    const statusMessage = useMemo(() => {
        // If a specific category is selected, show days spent in that category
        if (isCategorySelected && ACTIVITY_TYPES.includes(predominantActivityType as ActivityType)) {
            const activityType = predominantActivityType as ActivityType;
            const categoryDays = activityDays[activityType] as number || 0;
            return `Spent ${categoryDays} days in ${activityConfig[predominantActivityType].label.toLowerCase()} phase`;
        }
        
        // When no category is selected
        if (isLearningCompleted) {
            // If learning is completed, show the maximum activity phase
            return `Spent ${activityDays.max} days from total ${daysActive} days in ${activityConfig[activityDays.maxType].label.toLowerCase()} phase`;
        } else if (learningProgress > 0) {
            // If still in learning phase
            return `From last ${daysActive} days (including active and inactive) you are doing this subject`;
        } else if (safeSubject.activity.total > 0) {
            // If has some activity but learning not started
            return `Recently active with ${safeSubject.activity.total} activities`;
        } else {
            // Default state
            return `Subject added ${daysActive} days ago`;
        }
    }, [isCategorySelected, predominantActivityType, activityDays, activityConfig, isLearningCompleted, learningProgress, daysActive, safeSubject.activity.total]);

    // Get the total topics count to display in the badge
    const badgeCount = useMemo(() => {
        if (!isCategorySelected) {
            return safeSubject.activity.total;
        }
        // Safely access the activity by treating predominantActivityType as a key
        return predominantActivityType in safeSubject.activity 
            ? (safeSubject.activity as ActivityRecord)[predominantActivityType] 
            : 0;
    }, [isCategorySelected, predominantActivityType, safeSubject.activity]);
    
    // Verify if subject is actually completed based on learning progress
    const isCompleted = learningProgress >= 100;

    // Make sure predominantActivityType exists in activityConfig
    const validActivityType = useMemo(() => {
        // When a category is selected, use that category
        if (isCategorySelected) {
            return predominantActivityType as ActivityType;
        }
        
        // When no category is selected, show the max activity type for the selected time period
        return activityDays.maxType && ACTIVITY_TYPES.includes(activityDays.maxType)
            ? activityDays.maxType
            : 'learning'; // Default to learning if no valid type found
    }, [predominantActivityType, isCategorySelected, activityDays.maxType]);

    // Consistent badge styling with improved visibility for activity counts
    const activityBadgeClass = cn(
        "flex items-center gap-1 px-2.5 py-1 text-sm font-semibold",
        isMostActive ? "bg-green-500 hover:bg-green-600 text-white" : "",
        isCompleted ? "bg-blue-500 hover:bg-blue-600 text-white" : "",
        !isMostActive && !isCompleted ? "bg-secondary text-foreground" : ""
    );

    return (
        <Link href={`/subjects/${safeSubject.id}`} className="block">
            <div
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={cn(
                    "relative flex gap-3 w-full rounded-lg border p-4 transition-all duration-200 group cursor-pointer",
                    isMostActive ? "border-green-200 dark:border-green-800" : "",
                    isCompleted ? "border-blue-200 dark:border-blue-900/50" : "",
                    isHovered ? "shadow-md border-muted-foreground/30 bg-muted/5" : ""
                )}
            >
                {/* Top row with rank, subject name, and progress */}
                <div className={cn(
                    "text-xl font-bold",
                    isMostActive ? "text-green-600 dark:text-green-400" : "text-foreground/90",
                    isCompleted ? "text-blue-600 dark:text-blue-400" : ""
                )}>
                    {rankText}
                </div>
                
                <div className="w-full">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-semibold leading-tight">{safeSubject.name}</h3>
                                <Badge
                                    variant={isCompleted ? "default" : "outline"}
                                    className={cn(
                                        "px-2.5 py-0.5 font-medium",
                                        isCompleted ? "bg-blue-500 hover:bg-blue-600" : "",
                                        displayProgress > 0 && !isCompleted ? "bg-slate-100 dark:bg-slate-800 text-foreground" : ""
                                    )}
                                >
                                    {formatProgressPercentage(displayProgress)}
                                    {isCompleted && <CheckCircle2 className="ml-1 h-3 w-3" />}
                                </Badge>
                            </div>
                            
                            {statusMessage && (
                                <div className={cn(
                                    "text-xs mt-0.5",
                                    isCompleted ? "text-blue-600 dark:text-blue-400 font-medium" : "text-muted-foreground"
                                )}>
                                    {statusMessage}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <Badge className={activityBadgeClass}>
                                {badgeCount}
                            </Badge>

                            {/* Navigation arrow - visible on hover */}
                            <Button
                                size="icon"
                                variant="ghost"
                                className={cn(
                                    "h-7 w-7 rounded-full transition-all duration-300",
                                    isHovered ? "opacity-100 text-primary" : "opacity-75 text-muted-foreground"
                                )}
                            >
                                <ArrowUpRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Activity type indicator */}
                    <div className="flex items-center justify-between mt-3">
                        <div className={cn(
                            "flex items-center gap-1.5 text-sm transition-colors duration-200",
                            isHovered ? activityConfig[validActivityType].color : "text-muted-foreground"
                        )}>
                            <span>
                                {activityConfig[validActivityType].icon}
                            </span>
                            <span>
                                Mostly {activityConfig[validActivityType].label}
                            </span>
                        </div>

                        {/* Progress indicator */}
                        <div className={cn(
                            "text-xs font-medium",
                            displayProgress > 0 ? "text-foreground" : "text-muted-foreground"
                        )}>
                            {!isCategorySelected ? "Overall: " : `${activityConfig[predominantActivityType].label}: `}
                            {formatProgressPercentage(displayProgress)}
                        </div>
                    </div>

                    {/* Subtle hover overlay */}
                    <div className={cn(
                        "absolute inset-0 bg-primary/5 rounded-lg opacity-0 transition-opacity duration-200 pointer-events-none",
                        isHovered ? "opacity-100" : "opacity-0"
                    )} />
                </div>
            </div>
        </Link>
    );
} 