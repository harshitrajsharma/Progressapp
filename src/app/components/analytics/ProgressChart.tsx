import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { format, parseISO, isWeekend } from 'date-fns';
import { ChartProps, ActivityType, ViewMode, TimeRange } from '@/types/analytics';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const TIME_RANGES: { label: string; value: TimeRange }[] = [
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: '90 Days', value: '90d' },
  { label: 'All Time', value: 'all' }
];

export function ProgressChart({
  data,
  isLoading,
  error,
  viewMode = 'activities',
  timeRange = '30d',
  onViewModeChange,
  onTimeRangeChange
}: ChartProps) {
  const [selectedActivities, setSelectedActivities] = useState<ActivityType[]>(['learning', 'revision', 'practice', 'test']);

  // Format data for charts
  const chartData = useMemo(() => {
    if (!data?.daily) return [];

    return data.daily.map(day => ({
      ...day,
      date: format(parseISO(day.date), 'MMM dd'),
      isWeekend: isWeekend(parseISO(day.date))
    }));
  }, [data?.daily]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!data?.insights) return null;

    return {
      streak: {
        label: 'Current Streak',
        value: `${data.insights.currentStreak} days`,
        icon: '🔥'
      },
      bestActivity: {
        label: 'Best Activity',
        value: data.config.activities[data.insights.bestActivity].name,
        icon: data.config.activities[data.insights.bestActivity].icon
      },
      completion: {
        label: 'Completion Rate',
        value: `${Math.round(data.insights.completionRate)}%`,
        icon: '📈'
      },
      average: {
        label: 'Daily Average',
        value: `${Math.round(data.insights.averageDailyActivities)} activities`,
        icon: '📊'
      }
    };
  }, [data?.insights, data?.config]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[400px] w-full" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-[100px]" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!data) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>No progress data available</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats && Object.entries(stats).map(([key, stat]) => (
          <Card key={key}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <h4 className="text-2xl font-bold">{stat.value}</h4>
                </div>
                <span className="text-2xl">{stat.icon}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart Controls */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Tabs value={viewMode} onValueChange={(v) => onViewModeChange?.(v as ViewMode)}>
          <TabsList>
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="goal">Goal Progress</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex gap-2">
          {TIME_RANGES.map(range => (
            <Button
              key={range.value}
              variant={timeRange === range.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => onTimeRangeChange?.(range.value)}
            >
              {range.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'activities' ? (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(value, index) => chartData[index].isWeekend ? `${value} 🌅` : value}
              />
              <YAxis />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-background border rounded-lg p-3 shadow-lg">
                        <p className="font-bold">{label}</p>
                        {payload.map((entry) => (
                          <p key={entry.name} style={{ color: entry.color }}>
                            {data.config.activities[entry.name as ActivityType].icon}{' '}
                            {data.config.activities[entry.name as ActivityType].name}: {entry.value}
                          </p>
                        ))}
                        <p className="mt-2 pt-2 border-t">
                          Total: {payload.reduce((sum, entry) => sum + (entry.value as number), 0)}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              {selectedActivities.map(type => (
                <Bar
                  key={type}
                  dataKey={type}
                  name={data.config.activities[type].name}
                  fill={data.config.activities[type].color}
                  stackId="activities"
                />
              ))}
              <ReferenceLine y={data.config.dailyGoal} stroke="#ff4081" strokeDasharray="3 3" />
            </BarChart>
          ) : (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="goalProgress"
                name="Goal Progress"
                stroke="#2196f3"
                dot={false}
              />
              <ReferenceLine y={100} stroke="#ff4081" strokeDasharray="3 3" label="Daily Goal" />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
} 