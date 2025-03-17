'use client';

import { SubjectActivity } from '@/app/api/analytics/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Trophy, X } from 'lucide-react';
import { ActivityConfig } from '../types';
import { CustomScrollbar } from './CustomScrollbar';
import { ActivitySubjectCard } from './activity-subject-card';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useAnalytics } from '@/contexts/analytics-context';
import { useProgress } from '@/contexts/progress-context';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface ActivityInsightsProps {
  subjects: SubjectActivity[];
  activityConfig: Record<string, ActivityConfig>;
  focusRecommendation?: string;
  getPredominantActivityType: (subject: SubjectActivity) => string;
}

// Define activity types to avoid TypeScript errors
type ActivityKeys = 'learning' | 'revision' | 'practice' | 'test' | 'total';
type ActivityRecord = Record<ActivityKeys, number>;

// Key for storing selected category in localStorage
const ACTIVITY_CATEGORY_KEY = 'insights-selected-category';

export function ActivityInsights({ 
  subjects, 
  activityConfig, 
  focusRecommendation,
  getPredominantActivityType
}: ActivityInsightsProps) {
  // Access analytics context for integration
  const { selectedDate } = useAnalytics();
  // Access progress context for progress calculations
  const { formatProgressPercentage } = useProgress();

  // Load initial category from localStorage if available
  const getInitialCategory = (): ActivityKeys | null => {
    if (typeof window !== 'undefined') {
      const savedCategory = localStorage.getItem(ACTIVITY_CATEGORY_KEY);
      if (savedCategory && ['learning', 'revision', 'practice', 'test'].includes(savedCategory)) {
        return savedCategory as ActivityKeys;
      }
    }
    return null;
  };

  // State for selected category filter
  const [selectedCategory, setSelectedCategory] = useState<ActivityKeys | null>(getInitialCategory());

  // Save selected category to localStorage
  useEffect(() => {
    if (selectedCategory) {
      localStorage.setItem(ACTIVITY_CATEGORY_KEY, selectedCategory);
    } else {
      localStorage.removeItem(ACTIVITY_CATEGORY_KEY);
    }
  }, [selectedCategory]);

  // Reset category when date changes
  useEffect(() => {
    // Optional: Reset category when date changes to show fresh overview
    // This is commented out to maintain user's filter preference across date changes
    // setSelectedCategory(null);
  }, [selectedDate]);

  // Get all category types (excluding 'total')
  const categoryTypes = Object.keys(activityConfig) as ActivityKeys[];

  // Calculate total activities by category
  const categoryTotals = categoryTypes.reduce((acc, category) => {
    acc[category] = subjects.reduce((sum, subject) => 
      sum + (subject.activity?.[category] || 0), 0);
    return acc;
  }, {} as Record<ActivityKeys, number>);

  // Add total activities calculation
  categoryTotals.total = subjects.reduce((sum, subject) => 
    sum + (subject.activity?.total || 0), 0);

  // Sort subjects by the selected category or total activity if no category is selected
  const sortedSubjects = [...subjects].sort((a, b) => {
    if (selectedCategory) {
      const aValue = a.activity?.[selectedCategory] || 0;
      const bValue = b.activity?.[selectedCategory] || 0;
      return bValue - aValue;
    }
    return b.activity.total - a.activity.total;
  });
  
  // Filter subjects that have activity in the selected category or any activity if no category selected
  const filteredSubjects = sortedSubjects.filter(s => {
    if (selectedCategory) {
      return (s.activity?.[selectedCategory] || 0) > 0;
    }
    return s.activity.total > 0;
  });

  // Ensure we have valid active subjects with proper data validation
  const activeSubjects = filteredSubjects
    .map(subject => {
      // Calculate percentage for the selected category or use activityPercentage for overall
      let categoryPercentage = subject.activityPercentage;
      
      if (selectedCategory && categoryTotals[selectedCategory] > 0) {
        // Calculate percentage of this subject's category activity from total category activity
        categoryPercentage = Math.round(
          ((subject.activity?.[selectedCategory] || 0) / categoryTotals[selectedCategory]) * 100
        );
      }
      
      // For the selected category, use the corresponding progress instead of just activity percentage
      let progressPercentage = subject.overallProgress;
      if (selectedCategory) {
        switch (selectedCategory) {
          case 'learning':
            progressPercentage = subject.learningProgress;
            break;
          case 'revision':
            progressPercentage = subject.revisionProgress;
            break;
          case 'practice':
            progressPercentage = subject.practiceProgress;
            break;
          case 'test':
            progressPercentage = subject.testProgress;
            break;
        }
      }
      
      return {
        ...subject,
        // Ensure progress values are valid numbers
        overallProgress: typeof subject.overallProgress === 'number' ? 
          Math.round(subject.overallProgress) : 0,
        learningProgress: typeof subject.learningProgress === 'number' ? 
          Math.round(subject.learningProgress) : 0,
        revisionProgress: typeof subject.revisionProgress === 'number' ? 
          Math.round(subject.revisionProgress) : 0,
        practiceProgress: typeof subject.practiceProgress === 'number' ? 
          Math.round(subject.practiceProgress) : 0,
        testProgress: typeof subject.testProgress === 'number' ? 
          Math.round(subject.testProgress) : 0,
        // Ensure all activity data exists
        activity: {
          learning: subject.activity?.learning || 0,
          revision: subject.activity?.revision || 0,
          practice: subject.activity?.practice || 0,
          test: subject.activity?.test || 0,
          total: subject.activity?.total || 0
        } as ActivityRecord,
        // Use the calculated category percentage
        activityPercentage: categoryPercentage > 100 ? 
          100 : (categoryPercentage < 0 ? 0 : categoryPercentage),
        // Add the current category progress for display
        selectedCategoryProgress: typeof progressPercentage === 'number' ? 
          Math.round(progressPercentage) : 0
      };
    });

  // Handle clearing the selected category
  const clearSelectedCategory = () => {
    setSelectedCategory(null);
  };

  // Generate title based on selected category
  const getTitle = () => {
    if (selectedCategory) {
      return `${activityConfig[selectedCategory].label} Activity`;
    }
    return "Subject Activity Insights";
  };

  // Generate subtitle based on selected category
  const getSubtitle = () => {
    if (selectedCategory) {
      return `Subjects with most ${activityConfig[selectedCategory].label.toLowerCase()} activity`;
    }
    return "Your most active subjects";
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center text-lg">
              <Trophy className="mr-2 h-5 w-5 text-amber-500" />
              {getTitle()}
            </CardTitle>
            <CardDescription>
              {getSubtitle()}
            </CardDescription>
          </div>
          
          {/* Category filter buttons */}
          <div className="flex space-x-1.5">
            {categoryTypes.map(category => {
              // Calculate percentage of total activity
              const categoryPercentage = categoryTotals.total > 0 
                ? Math.round((categoryTotals[category] / categoryTotals.total) * 100) 
                : 0;
              
              return (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                  className={cn(
                    "px-2 h-8 rounded",
                    selectedCategory === category && {
                      "bg-transparent border": true,
                      [activityConfig[category].color]: true,
                      [activityConfig[category].bgColorFaded]: true,
                      "border-current": true
                    }
                  )}
                  title={`${activityConfig[category].label}: ${formatProgressPercentage(categoryPercentage)} of total activity`}
                >
                  <span className="flex items-center space-x-1">
                    {activityConfig[category].icon}
                    <Badge 
                      className={cn(
                        "ml-1.5 h-5 px-1.5 text-xs",
                        selectedCategory === category ? 
                          `${activityConfig[category].bgColor} text-white border-0` : 
                          "bg-secondary/50 text-muted-foreground"
                      )}
                    >
                      {categoryTotals[category]}
                    </Badge>
                  </span>
                </Button>
              );
            })}
          </div>
        </div>
        
        {/* Active filter indicator */}
        {selectedCategory && (
          <div className="flex items-center mt-2 text-sm">
            <div className={cn(
              "flex items-center bg-muted/40 px-2 py-1 rounded-full",
              activityConfig[selectedCategory].color
            )}>
              <span className="mr-1">Filtered by:</span>
              <span className="font-medium">{activityConfig[selectedCategory].label}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-5 w-5 p-0 ml-1 rounded-full hover:bg-muted"
                onClick={clearSelectedCategory}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-1 p-0">
        {/* Scrollable container for subjects */}
        <CustomScrollbar maxHeight={400} className="h-full">
          <div className="p-4 space-y-4">
            <div className="space-y-3">
              {activeSubjects.map((subject, index) => (
                <TooltipProvider key={subject.id}>
                  <ActivitySubjectCard
                    subject={{
                      ...subject,
                      // For category view, show category-specific progress
                      overallProgress: selectedCategory ? subject.selectedCategoryProgress : subject.overallProgress
                    }}
                    index={index}
                    activityConfig={activityConfig}
                    predominantActivityType={selectedCategory || getPredominantActivityType(subject)}
                  />
                </TooltipProvider>
              ))}

              {activeSubjects.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  <p>
                    {selectedCategory ? 
                      `No ${activityConfig[selectedCategory].label.toLowerCase()} activity data available` : 
                      "No activity data available for subjects in this period"}
                  </p>
                </div>
              )}
            </div>
            
            {/* Recommended Focus section - only show when no category is selected */}
            {!selectedCategory && focusRecommendation && (
              <div className="rounded-lg border p-3 bg-blue-50/50 dark:bg-blue-900/20 mt-3">
                <h4 className="text-sm font-medium mb-1">Recommended Focus</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  This subject has low activity but isn&apos;t complete yet
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-medium">{focusRecommendation}</span>
                  <Button variant="ghost" size="sm" className="h-7 text-xs">
                    View Subject
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CustomScrollbar>
      </CardContent>
    </Card>
  );
} 