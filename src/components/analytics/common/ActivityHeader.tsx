'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from 'lucide-react';

interface ActivityHeaderProps {
  title: string;
  subtitle: string;
  timeRange: 'day' | 'week' | 'month' | 'all';
  isLoading: boolean;
  onTimeRangeChange: (range: 'day' | 'week' | 'month' | 'all') => void;
  dateRangeText: string;
  tooltipContent?: string;
}

export function ActivityHeader({
  title,
  subtitle,
  timeRange,
  isLoading,
  onTimeRangeChange,
  dateRangeText,
  tooltipContent,
}: ActivityHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight flex items-center">
          {title}
          {tooltipContent && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span><HelpCircle className="ml-1.5 h-4 w-4 text-muted-foreground cursor-help" /></span>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-sm">
                <p>{tooltipContent}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </h2>
        <p className="text-muted-foreground">
          {isLoading ? (
            <Skeleton className="h-4 w-56 inline-block" />
          ) : (
            <>{subtitle} <span className="font-medium">{dateRangeText}</span></>
          )}
        </p>
      </div>
      
      <Tabs 
        value={timeRange} 
        onValueChange={(value: string) => onTimeRangeChange(value as 'day' | 'week' | 'month' | 'all')} 
        className="w-full md:w-auto"
      >
        <TabsList className="grid grid-cols-4 w-full md:w-auto">
          <TabsTrigger value="day" className="text-xs sm:text-sm">Day</TabsTrigger>
          <TabsTrigger value="week" className="text-xs sm:text-sm">Week</TabsTrigger>
          <TabsTrigger value="month" className="text-xs sm:text-sm">Month</TabsTrigger>
          <TabsTrigger value="all" className="text-xs sm:text-sm">All Time</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
} 