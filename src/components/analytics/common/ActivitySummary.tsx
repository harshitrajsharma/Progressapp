'use client';

import { TotalStats } from '@/app/api/analytics/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TrendingUp } from 'lucide-react';
import { type ActivityConfig } from '../types';

interface ActivitySummaryProps {
  totalStats: TotalStats;
  activityConfig: Record<string, ActivityConfig>;
}

export function ActivitySummary({ totalStats, activityConfig }: ActivitySummaryProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          <TrendingUp className="mr-2 h-5 w-5 text-blue-500" />
          Activity Summary
        </CardTitle>
        <CardDescription>
          Your study activity breakdown
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(activityConfig).map(([key, config]) => {
            const count = totalStats[key as keyof TotalStats] || 0;
            const percentage = totalStats.total 
              ? Math.round((count / totalStats.total) * 100) 
              : 0;
            
            return (
              <div 
                key={key} 
                className={`rounded-lg p-3 border ${count > 0 ? config.bgColorFaded : ''}`}
              >
                <div className="flex items-center mb-1.5">
                  <span className={`p-1.5 rounded-full ${config.bgColorFaded} ${config.color} mr-2`}>
                    {config.icon}
                  </span>
                  <span className="text-sm font-medium">{config.label}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-2xl font-bold">{count}</span>
                  {count > 0 && (
                    <span className="text-xs text-muted-foreground">{percentage}%</span>
                  )}
                </div>
                <Progress 
                  value={percentage} 
                  className={`h-1.5 mt-1 ${percentage > 0 ? config.bgColor : ''}`}
                />
              </div>
            );
          })}
        </div>
        <div className="flex justify-between items-center mt-4 pt-3 border-t">
          <div>
            <span className="text-sm text-muted-foreground">Total Activities</span>
            <p className="text-2xl font-bold">{totalStats.total || 0}</p>
          </div>
          <div className="flex space-x-1">
            {Object.entries(activityConfig).map(([key, config]) => {
              const count = totalStats[key as keyof TotalStats] || 0;
              if (count === 0) return null;
              
              return (
                <Tooltip key={key}>
                  <TooltipTrigger asChild>
                    <Badge 
                      variant="outline" 
                      className={`${config.color} ${config.bgColorFaded} border-0`}
                    >
                      <span className="flex items-center">
                        {config.icon}
                        <span className="ml-1">{count}</span>
                      </span>
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    {config.label}: {count} activities
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 