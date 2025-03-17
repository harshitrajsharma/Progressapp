'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { StudyProgressAnalytics } from './StudyProgressAnalytics';
import { LearningPatternAnalysis } from './LearningPatternAnalysis';
import { PhaseProgressAnalysis } from './PhaseProgressAnalysis';
import { ActivityDetailsDaywise } from './activity-details-daywise';
import { useAnalytics, TAB_KEYS } from '@/contexts/analytics-context';

export function AnalyticsTabs() {
  const { activeTab, setActiveTab } = useAnalytics();

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <Tabs
      defaultValue={activeTab}
      value={activeTab}
      onValueChange={handleTabChange}
      className="w-full flex flex-col h-full"
    >
      <TabsList className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-2">
        <TabsTrigger value={TAB_KEYS.ACTIVITY} className="data-[state=active]:bg-green-100 data-[state=active]:text-green-900 dark:data-[state=active]:bg-green-900 dark:data-[state=active]:text-green-100">
          Day Progress
        </TabsTrigger>
        <TabsTrigger value={TAB_KEYS.PROGRESS} className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900 dark:data-[state=active]:bg-blue-900 dark:data-[state=active]:text-blue-100">
          Subject Progress
        </TabsTrigger>
        <TabsTrigger value={TAB_KEYS.LEARNING} className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900 dark:data-[state=active]:bg-purple-900 dark:data-[state=active]:text-purple-100">
          Learning Patterns
        </TabsTrigger>
        <TabsTrigger value={TAB_KEYS.PHASES} className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900 dark:data-[state=active]:bg-amber-900 dark:data-[state=active]:text-amber-100">
          Study Phases
        </TabsTrigger>
      </TabsList>

      <div className="flex-1 flex flex-col h-full">
        <TabsContent value={TAB_KEYS.ACTIVITY} className="mt-0 focus-visible:outline-none focus-visible:ring-0 flex-1 h-full">
          <div className="h-full">
            {/* Activity Details */}
            <ActivityDetailsDaywise />
          </div>
        </TabsContent>

        <TabsContent value={TAB_KEYS.PROGRESS} className="mt-0 focus-visible:outline-none focus-visible:ring-0 flex-1 h-full">
          <StudyProgressAnalytics />
        </TabsContent>

        <TabsContent value={TAB_KEYS.LEARNING} className="mt-0 focus-visible:outline-none focus-visible:ring-0 flex-1 h-full">
          <LearningPatternAnalysis />
        </TabsContent>

        <TabsContent value={TAB_KEYS.PHASES} className="mt-0 focus-visible:outline-none focus-visible:ring-0 flex-1 h-full">
          <PhaseProgressAnalysis />
        </TabsContent>
      </div>
    </Tabs>
  );
} 