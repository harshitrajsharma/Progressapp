'use client';

import { SubjectActivity } from '@/app/api/analytics/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  ArrowRight, 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  BarChart3, 
  Layers, 
  Calendar,
  Bookmark,
  TrendingUp,
  Scale,
  AlertCircle,
  Search,
  Filter,
  Eye,
  EyeOff,
  Sparkles,
  Target,
  Clock,
  Zap,
  X
} from 'lucide-react';
import { formatDistance, format } from 'date-fns';
import { useState, useMemo, useEffect } from 'react';
import { ActivityConfig } from '../types';
import { CustomScrollbar } from './CustomScrollbar';
import { useProgress } from '@/contexts/progress-context';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAnalytics } from '@/contexts/analytics-context';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SubjectActivityListProps {
  subjects: SubjectActivity[];
  activityConfig: Record<string, ActivityConfig>;
  getPredominantActivityType: (subject: SubjectActivity) => string;
}

export function SubjectActivityList({ 
  subjects, 
  activityConfig,
  getPredominantActivityType 
}: SubjectActivityListProps) {
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({});
  const { formatProgressPercentage, getActivityDays } = useProgress();
  const { selectedDate } = useAnalytics();
  
  // Display options - show all subjects by default
  const [sortOption, setSortOption] = useState<'activity' | 'progress' | 'alphabetical' | 'weightage'>('progress');
  const [showEmptySubjects, setShowEmptySubjects] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'categories' | 'list'>('categories');
  const [expandedSections, setExpandedSections] = useState({
    completed: true,
    inProgress: true,
    notStarted: true
  });
  
  // Toggle subject expansion
  const toggleSubjectExpansion = (subjectId: string) => {
    setExpandedSubjects(prev => ({
      ...prev,
      [subjectId]: !prev[subjectId]
    }));
  };

  // Expand a subject
  const expandSubject = (subjectId: string) => {
    setExpandedSubjects(prev => ({
      ...prev,
      [subjectId]: true
    }));
  };

  // Toggle section expansion
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Auto-expand the first subject when there are few subjects
  useEffect(() => {
    if (subjects?.length === 1) {
      expandSubject(subjects[0].id);
    }
  }, [subjects]);
  
  // Process and sort subjects based on user preferences and search
  const processedSubjects = useMemo(() => {
    // Apply search filter first
    const filteredSubjects = subjects?.filter(s => {
      // Check if subject should be shown based on activity
      const activityFilter = showEmptySubjects || s.activity.total > 0;
      
      // Apply search filter if query exists
      const searchFilter = !searchQuery || 
        s.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      return activityFilter && searchFilter;
    }) || [];
    
    // Sort based on selected option
    switch (sortOption) {
      case 'activity':
        return [...filteredSubjects].sort((a, b) => b.activity.total - a.activity.total);
      case 'progress':
        return [...filteredSubjects].sort((a, b) => b.overallProgress - a.overallProgress);
      case 'weightage':
        return [...filteredSubjects].sort((a, b) => b.weightage - a.weightage);
      case 'alphabetical':
        return [...filteredSubjects].sort((a, b) => a.name.localeCompare(b.name));
      default:
        return [...filteredSubjects].sort((a, b) => b.overallProgress - a.overallProgress);
    }
  }, [subjects, sortOption, showEmptySubjects, searchQuery]);
  
  // Group subjects by progress range for better insights
  const subjectGroups = useMemo(() => {
    const groups = {
      completed: [] as SubjectActivity[],
      highProgress: [] as SubjectActivity[],
      mediumProgress: [] as SubjectActivity[],
      lowProgress: [] as SubjectActivity[],
      noProgress: [] as SubjectActivity[]
    };
    
    processedSubjects.forEach(subject => {
      if (subject.overallProgress >= 100) {
        groups.completed.push(subject);
      } else if (subject.overallProgress >= 75) {
        groups.highProgress.push(subject);
      } else if (subject.overallProgress >= 50) {
        groups.mediumProgress.push(subject);
      } else if (subject.overallProgress > 0) {
        groups.lowProgress.push(subject);
      } else {
        groups.noProgress.push(subject);
      }
    });
    
    return groups;
  }, [processedSubjects]);
  
  // Calculate key metrics
  const metrics = useMemo(() => {
    const total = subjects?.length || 0;
    if (!total) return null;
    
    const totalActivities = subjects?.reduce((sum, s) => sum + s.activity.total, 0) || 0;
    const avgProgress = subjects?.reduce((sum, s) => sum + s.overallProgress, 0) / total || 0;
    const completedCount = subjects?.filter(s => s.overallProgress >= 100).length || 0;
    const activeSubjects = subjects?.filter(s => s.activity.total > 0).length || 0;
    const totalWeight = subjects?.reduce((sum, s) => sum + s.weightage, 0) || 0;
    
    return {
      totalSubjects: total,
      totalActivities,
      avgProgress,
      completedCount,
      activeSubjects,
      completionRate: (completedCount / total) * 100,
      remainingSubjects: total - completedCount,
      totalWeight
    };
  }, [subjects]);
  
  // Check if no subjects match the current filters
  const noMatchingSubjects = processedSubjects.length === 0 && subjects && subjects.length > 0;
  
  // Generate overall subject count text
  const subjectCountText = useMemo(() => {
    if (!subjects?.length) return "No subjects";
    
    if (processedSubjects.length === subjects.length) {
      return `All ${subjects.length} subjects`;
    }
    
    return `${processedSubjects.length} of ${subjects.length} subjects`;
  }, [subjects, processedSubjects]);
  
  return (
    <Card className="h-full flex flex-col border-muted">
      <CardHeader className="pb-0">
        <div className="flex justify-between items-start mb-3">
          <div>
            <CardTitle className="flex items-center text-xl">
              <BookOpen className="mr-2.5 h-6 w-6 text-purple-500" />
              Subject Activity
            </CardTitle>
            <CardDescription className="mt-1">
              Comprehensive view of all your study subjects
            </CardDescription>
          </div>
          
          {/* View mode selector */}
          <Tabs
            value={viewMode}
            onValueChange={(value) => setViewMode(value as 'categories' | 'list')}
            className="w-auto"
          >
            <TabsList className="h-8 px-1">
              <TabsTrigger value="categories" className="h-6 px-2 text-xs">
                <Layers className="h-3.5 w-3.5 mr-1" />
                Categories
              </TabsTrigger>
              <TabsTrigger value="list" className="h-6 px-2 text-xs">
                <BarChart3 className="h-3.5 w-3.5 mr-1" />
                All Subjects
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {/* Overview metrics - displayed as cards */}
        {metrics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 p-3 rounded-md border shadow-sm">
              <div className="text-xs text-muted-foreground flex items-center">
                <Layers className="h-3 w-3 mr-1" />
                Total Subjects
              </div>
              <div className="text-lg font-semibold">{metrics.totalSubjects}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {metrics.activeSubjects} active
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950/30 dark:to-green-950/30 p-3 rounded-md border shadow-sm">
              <div className="text-xs text-muted-foreground flex items-center">
                <Target className="h-3 w-3 mr-1" />
                Completion
              </div>
              <div className="text-lg font-semibold">{metrics.completedCount}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {formatProgressPercentage(metrics.completionRate)} of all
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-amber-50 dark:from-green-950/30 dark:to-amber-950/30 p-3 rounded-md border shadow-sm">
              <div className="text-xs text-muted-foreground flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                Activities
              </div>
              <div className="text-lg font-semibold">{metrics.totalActivities}</div>
              <div className="text-xs text-muted-foreground mt-1">
                across all subjects
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-amber-50 to-purple-50 dark:from-amber-950/30 dark:to-purple-950/30 p-3 rounded-md border shadow-sm">
              <div className="text-xs text-muted-foreground flex items-center">
                <Sparkles className="h-3 w-3 mr-1" />
                Average Progress
              </div>
              <div className="text-lg font-semibold">{formatProgressPercentage(metrics.avgProgress)}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {metrics.totalWeight}% total weightage
              </div>
            </div>
          </div>
        )}
        
        {/* Search and filter bar */}
        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search subjects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-7 w-7 p-0"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-9 px-2 text-xs",
                      showEmptySubjects ? "border-purple-300 dark:border-purple-700" : ""
                    )}
                    onClick={() => setShowEmptySubjects(!showEmptySubjects)}
                  >
                    {showEmptySubjects ? <EyeOff className="h-3.5 w-3.5 mr-1.5" /> : <Eye className="h-3.5 w-3.5 mr-1.5" />}
                    {showEmptySubjects ? "Hide Inactive" : "Show All"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  {showEmptySubjects ? "Hide subjects with no activity" : "Show all subjects including those with no activity"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <select
                    className="h-9 px-2 text-xs rounded-md border border-input bg-background"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as 'activity' | 'progress' | 'alphabetical' | 'weightage')}
                  >
                    <option value="progress">Sort by Progress</option>
                    <option value="activity">Sort by Activity</option>
                    <option value="weightage">Sort by Weightage</option>
                    <option value="alphabetical">Sort Alphabetically</option>
                  </select>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  Change how subjects are sorted
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        {/* Filter status indicator */}
        {(searchQuery || !showEmptySubjects) && (
          <div className="flex items-center mt-2 text-xs text-muted-foreground">
            <Filter className="h-3 w-3 mr-1.5" />
            <span>
              {subjectCountText} {searchQuery && `matching "${searchQuery}"`}
            </span>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-5 ml-2 px-1.5 text-xs"
              onClick={() => {
                setSearchQuery('');
                setShowEmptySubjects(true);
              }}
            >
              Clear all filters
            </Button>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="flex-1 p-0 mt-2">
        <CustomScrollbar className="h-full">
          {/* List View Mode */}
          {viewMode === 'list' && (
            <div className="p-4 space-y-3">
              {processedSubjects.length > 0 ? (
                processedSubjects.map((subject) => renderSubjectCard(subject))
              ) : (
                <RenderEmptyState />
              )}
            </div>
          )}
          
          {/* Categories View Mode */}
          {viewMode === 'categories' && (
            <div className="p-4 space-y-6">
              {/* Completed subjects section with green styling */}
              {subjectGroups.completed.length > 0 && (
                <section className="space-y-3">
                  <button
                    onClick={() => toggleSection('completed')}
                    className="text-sm font-medium flex items-center text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 w-full justify-between"
                  >
                    <div className="flex items-center">
                      <Bookmark className="h-4 w-4 mr-1.5" />
                      Completed Subjects ({subjectGroups.completed.length})
                    </div>
                    {expandedSections.completed ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                  
                  {expandedSections.completed && (
                    <div className="space-y-2">
                      {subjectGroups.completed.map((subject) => renderSubjectCard(subject))}
                    </div>
                  )}
                </section>
              )}
              
              {/* High progress subjects */}
              {(subjectGroups.highProgress.length > 0 || subjectGroups.mediumProgress.length > 0 || subjectGroups.lowProgress.length > 0) && (
                <section className="space-y-3">
                  <button
                    onClick={() => toggleSection('inProgress')}
                    className="text-sm font-medium flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 w-full justify-between"
                  >
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1.5" />
                      In Progress Subjects ({subjectGroups.highProgress.length + subjectGroups.mediumProgress.length + subjectGroups.lowProgress.length})
                    </div>
                    {expandedSections.inProgress ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                  
                  {expandedSections.inProgress && (
                    <div className="space-y-2">
                      {/* High progress */}
                      {subjectGroups.highProgress.length > 0 && (
                        <div className="pl-6 border-l-2 border-blue-200 dark:border-blue-800 space-y-2">
                          <h4 className="text-xs font-medium text-blue-500 dark:text-blue-400 mb-2">
                            Almost Complete ({subjectGroups.highProgress.length})
                          </h4>
                          {subjectGroups.highProgress.map((subject) => renderSubjectCard(subject))}
                        </div>
                      )}
                      
                      {/* Medium progress */}
                      {subjectGroups.mediumProgress.length > 0 && (
                        <div className="pl-6 border-l-2 border-purple-200 dark:border-purple-800 space-y-2 mt-4">
                          <h4 className="text-xs font-medium text-purple-500 dark:text-purple-400 mb-2">
                            Halfway Complete ({subjectGroups.mediumProgress.length})
                          </h4>
                          {subjectGroups.mediumProgress.map((subject) => renderSubjectCard(subject))}
                        </div>
                      )}
                      
                      {/* Low progress */}
                      {subjectGroups.lowProgress.length > 0 && (
                        <div className="pl-6 border-l-2 border-amber-200 dark:border-amber-800 space-y-2 mt-4">
                          <h4 className="text-xs font-medium text-amber-500 dark:text-amber-400 mb-2">
                            Just Started ({subjectGroups.lowProgress.length})
                          </h4>
                          {subjectGroups.lowProgress.map((subject) => renderSubjectCard(subject))}
                        </div>
                      )}
                    </div>
                  )}
                </section>
              )}
              
              {/* Subjects with no progress */}
              {subjectGroups.noProgress.length > 0 && (
                <section className="space-y-3">
                  <button
                    onClick={() => toggleSection('notStarted')}
                    className="text-sm font-medium flex items-center text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 w-full justify-between"
                  >
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1.5" />
                      Not Started ({subjectGroups.noProgress.length})
                    </div>
                    {expandedSections.notStarted ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                  
                  {expandedSections.notStarted && (
                    <div className="space-y-2">
                      {subjectGroups.noProgress.map((subject) => renderSubjectCard(subject))}
                    </div>
                  )}
                </section>
              )}
              
              {/* If no subjects match filters */}
              {noMatchingSubjects && <RenderEmptyState />}
            </div>
          )}
        </CustomScrollbar>
      </CardContent>
      
      {subjects?.length > 0 && (
        <CardFooter className="flex justify-between border-t p-4 text-sm text-muted-foreground">
          <div className="flex flex-wrap items-center gap-3">
            {Object.entries(activityConfig).map(([key, config]) => (
              <div key={key} className="flex items-center">
                <div className={`w-3 h-3 ${config.bgColor} rounded-full mr-1.5`}></div>
                <span className="text-xs">{config.label}</span>
              </div>
            ))}
          </div>
          
          <span className="text-xs">
            Data for {format(selectedDate, 'MMMM d, yyyy')}
          </span>
        </CardFooter>
      )}
    </Card>
  );
  
  // Helper component to render empty states
  function RenderEmptyState() {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {noMatchingSubjects ? (
          <>
            <Filter className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p className="mb-2">No subjects match the current filters</p>
            <p className="text-sm mb-4">Try adjusting your search or show all subjects</p>
            <div className="flex justify-center gap-2">
              {searchQuery && (
                <Button variant="outline" size="sm" onClick={() => setSearchQuery('')}>
                  Clear search
                </Button>
              )}
              {!showEmptySubjects && (
                <Button variant="outline" size="sm" onClick={() => setShowEmptySubjects(true)}>
                  Show all subjects
                </Button>
              )}
            </div>
          </>
        ) : subjects?.length === 0 ? (
          <>
            <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p className="mb-2">No subjects have been added yet</p>
            <p className="text-sm">Create subjects to start tracking your progress</p>
            <Button 
              variant="default" 
              size="sm" 
              className="mt-4"
              asChild
            >
              <a href="/subjects/add">
                Create a new subject
                <Zap className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </>
        ) : (
          <>
            <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p className="mb-2">No subject activity data available</p>
            <p className="text-sm">Try selecting a different time period or check your subjects setup</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              asChild
            >
              <a href="/subjects">
                Go to my subjects
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </>
        )}
      </div>
    );
  }
  
  // Helper function to render subject cards
  function renderSubjectCard(subject: SubjectActivity) {
    const isExpanded = expandedSubjects[subject.id] || false;
    const predominantType = getPredominantActivityType(subject);
    const activityDays = getActivityDays(subject.activity);
    
    // Calculate progressive colors based on progress
    const progressClass = cn(
      subject.overallProgress >= 100 ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/50" :
      subject.overallProgress >= 75 ? "bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/30" :
      subject.overallProgress >= 50 ? "bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-900/30" :
      subject.overallProgress > 0 ? "bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/30" :
      "bg-slate-50 dark:bg-slate-800/20 border-slate-200 dark:border-slate-800/50"
    );

    // Calculate the inactive style for subjects with no activity
    const inactiveStyle = subject.activity.total === 0 ? "opacity-80" : "";
    
    return (
      <div 
        key={subject.id} 
        className={cn(
          "rounded-lg border p-3 transition-all duration-200 hover:shadow-md",
          progressClass,
          isExpanded ? "shadow-sm" : "",
          inactiveStyle
        )}
      >
        {/* Subject header - always visible */}
        <div 
          className="flex justify-between items-center cursor-pointer"
          onClick={() => toggleSubjectExpansion(subject.id)}
        >
          <div className="flex items-center gap-3">
            <Badge 
              variant="outline" 
              className={cn(
                "text-foreground border-0 flex items-center justify-center w-8 h-8 rounded-md",
                subject.activity.total > 0 ? activityConfig[predominantType].bgColorFaded : "bg-muted"
              )}
            >
              {subject.activity.total > 0 ? subject.activity.total : "0"}
            </Badge>
            <div>
              <h3 className="font-medium line-clamp-1">{subject.name}</h3>
              <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                <span className="mr-3 whitespace-nowrap">{formatProgressPercentage(subject.overallProgress)} complete</span>
                {subject.activity.total > 0 && (
                  <span className="whitespace-nowrap">{formatProgressPercentage(subject.activityPercentage)} of activity</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {subject.weightage > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="text-xs border-0 bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-300">
                      <Scale className="mr-1 h-3 w-3" />
                      {subject.weightage}%
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    Subject weightage: {subject.weightage}% of your overall study
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            <button 
              className="p-1 rounded-full hover:bg-muted"
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? 
                <ChevronUp className="h-4 w-4 text-muted-foreground" /> : 
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              }
            </button>
          </div>
        </div>
        
        {/* Overall progress bar */}
        <div className="w-full h-2 bg-muted rounded-full mt-3 overflow-hidden">
          <div 
            className={cn(
              "h-full transition-all duration-500",
              subject.overallProgress >= 100 ? "bg-green-500" :
              subject.overallProgress >= 75 ? "bg-blue-500" :
              subject.overallProgress >= 50 ? "bg-purple-500" :
              subject.overallProgress > 0 ? "bg-amber-500" : "bg-slate-300 dark:bg-slate-700"
            )}
            style={{ width: `${subject.overallProgress}%` }}
          />
        </div>
        
        {/* Multi-progress bar showing all progress types */}
        <div className="grid grid-cols-4 gap-1 mt-2">
          {['learning', 'revision', 'practice', 'test'].map(category => (
            <TooltipProvider key={category}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-col items-center">
                    <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                      <div 
                        className={activityConfig[category].bgColor}
                        style={{ width: `${subject[`${category}Progress` as keyof SubjectActivity] as number}%`, height: '100%' }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1 flex items-center">
                      {activityConfig[category].icon}
                      <span className="ml-0.5">{subject.activity[category as keyof typeof subject.activity] || 0}</span>
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs p-2">
                  {activityConfig[category].label}: {formatProgressPercentage(subject[`${category}Progress` as keyof SubjectActivity] as number)}
                  <br />
                  {subject.activity[category as keyof typeof subject.activity] || 0} activities
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
        
        {/* Expanded details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-4 mt-4 border-t grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Progress card */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1 text-blue-500" />
                    Progress Breakdown
                  </h4>
                  
                  <div className="space-y-2">
                    {['learning', 'revision', 'practice', 'test'].map(category => (
                      <div key={category} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="flex items-center">
                            {activityConfig[category].icon}
                            <span className="ml-1">{activityConfig[category].label}</span>
                          </span>
                          <span>{formatProgressPercentage(subject[`${category}Progress` as keyof SubjectActivity] as number)}</span>
                        </div>
                        <Progress 
                          value={subject[`${category}Progress` as keyof SubjectActivity] as number} 
                          className={cn("h-1.5", activityConfig[category].bgColor)} 
                        />
                      </div>
                    ))}
                    
                    <div className="pt-2 mt-2 border-t">
                      <div className="flex justify-between text-xs font-medium">
                        <span>Overall Progress</span>
                        <span>{formatProgressPercentage(subject.overallProgress)}</span>
                      </div>
                      <Progress 
                        value={subject.overallProgress} 
                        className="h-2 mt-1 bg-gradient-to-r from-blue-500 via-purple-500 to-amber-500" 
                      />
                    </div>
                  </div>
                </div>
                
                {/* Activity card */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium flex items-center">
                    <BarChart3 className="h-4 w-4 mr-1 text-purple-500" />
                    Activity Details
                  </h4>
                  
                  <div className="space-y-3">
                    {/* Activity stats */}
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(activityConfig).map(([key, config]) => {
                        const activityKey = key as keyof typeof subject.activity;
                        const count = subject.activity[activityKey] || 0;
                        
                        if (count === 0 && subject.activity.total > 0) return null;
                        
                        return (
                          <div key={key} className="flex items-center text-sm">
                            <span className={`p-1 rounded-full ${config.bgColorFaded} ${config.color} mr-2`}>
                              {config.icon}
                            </span>
                            <span>
                              <span className="font-medium">{count}</span> {config.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Timeline info */}
                    <div className="text-xs space-y-2">
                      <div className="flex items-center text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 mr-1.5" />
                        Added {formatDistance(new Date(subject.createdAt), new Date(), { addSuffix: true })}
                      </div>
                      
                      {subject.activity.total > 0 && (
                        <div className="flex items-center text-muted-foreground">
                          <BookOpen className="h-3.5 w-3.5 mr-1.5" />
                          {activityDays.max > 0 ? (
                            <>Spent ~{activityDays.max} days on {activityConfig[activityDays.maxType].label}</>
                          ) : (
                            <>Recently active</>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Footer with action button */}
                <div className="col-span-1 sm:col-span-2 flex justify-end pt-2 mt-1 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 text-xs"
                    asChild
                  >
                    <a href={`/subjects/${subject.id}`}>
                      View Subject Details
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
} 