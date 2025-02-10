import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SubjectWithRelations } from "@/lib/calculations/types";
import { BarChart, LineChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { calculateSubjectProgress } from "@/lib/calculations/progress";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BarChart2, LineChart as LineChartIcon } from "lucide-react";

interface TopicWeightageAnalysisProps {
  subjects: SubjectWithRelations[]
}

interface ChartDataItem {
  name: string;
  weightage: number;
  preparation: number;
  gap: number;
  color: string;
  originalProgress: number;
}

type ViewMode = 'bar' | 'line';

interface CustomBarProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  type: 'weightage' | 'preparation';
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: ChartDataItem;
  }>;
}

const COLORS = {
  weightage: {
    base: "hsl(217 91% 60% / 0.8)",
    hover: "hsl(217 91% 60%)",
    line: "hsl(217 91% 60%)",
  },
  preparation: {
    base: "hsl(142 76% 36% / 0.8)",
    hover: "hsl(142 76% 36%)",
    line: "hsl(142 76% 36%)",
  },
  progress: {
    low: "hsl(0 84% 60%)",
    medium: "hsl(38 92% 50%)",
    high: "hsl(142 76% 36%)",
  }
} as const;

const CustomBar = ({ x = 0, y = 0, width = 0, height = 0, type }: CustomBarProps) => (
  <g>
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      rx={4}
      fill={COLORS[type].base}
      className={cn(
        "transition-colors duration-200",
        "hover:fill-[var(--bar-hover)]"
      )}
      style={{
        "--bar-hover": COLORS[type].hover
      } as React.CSSProperties}
    />
  </g>
);

const CustomTooltip = ({ active, payload }: TooltipProps) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border bg-background p-2 sm:p-3 shadow-sm">
        <div className="text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2">{data.name}</div>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div className="flex flex-col">
            <span className="text-[0.65rem] sm:text-[0.70rem] uppercase text-muted-foreground">
              Weightage
            </span>
            <span className="text-xs sm:text-sm font-bold" style={{ color: COLORS.weightage.hover }}>
              {data.weightage}%
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[0.65rem] sm:text-[0.70rem] uppercase text-muted-foreground">
              Preparation
            </span>
            <span className="text-xs sm:text-sm font-bold" style={{ color: data.color }}>
              {data.preparation}% ({data.originalProgress}%)
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function TopicWeightageAnalysis({ subjects }: TopicWeightageAnalysisProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('bar');

  const chartData = useMemo(() => {
    const totalWeightage = subjects.reduce((sum, subject) => sum + subject.weightage, 0);

    return subjects.map(subject => {
      const progress = calculateSubjectProgress(subject);
      const normalizedWeightage = (subject.weightage / totalWeightage) * 100;
      const relativePreparation = (progress.overall * normalizedWeightage) / 100;
      const preparation = Math.round(relativePreparation * 10) / 10;
      const gap = Math.round((normalizedWeightage - preparation) * 10) / 10;

      const ratio = progress.overall / 100;
      let color: string = COLORS.progress.low;
      if (ratio >= 0.8) color = COLORS.progress.high;
      else if (ratio >= 0.5) color = COLORS.progress.medium;

      return {
        name: subject.name,
        weightage: Math.round(normalizedWeightage * 10) / 10,
        preparation,
        gap,
        color,
        originalProgress: Math.round(progress.overall * 10) / 10
      };
    }).sort((a, b) => b.weightage - a.weightage);
  }, [subjects]);

  const chartHeight = useMemo(() => {
    const baseHeight = 300;
    const heightPerSubject = 40;
    return Math.max(baseHeight, subjects.length * heightPerSubject);
  }, [subjects]);

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 10, right: 10, left: 0, bottom: 5 },
      height: chartHeight,
      width: 100
    };

    if (viewMode === 'bar') {
      return (
        <BarChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
          <XAxis
            dataKey="name"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
            label={{
              value: 'Percentage (%)',
              angle: -90,
              position: 'insideLeft',
              fill: 'hsl(var(--muted-foreground))'
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar
            dataKey="weightage"
            name="Exam Weightage"
            shape={<CustomBar type="weightage" />}
          />
          <Bar
            dataKey="preparation"
            name="Your Preparation"
            shape={<CustomBar type="preparation" />}
          />
        </BarChart>
      );
    }

    return (
      <LineChart {...commonProps}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
        <XAxis
          dataKey="name"
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
          tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
        />
        <YAxis
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
          tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
          label={{
            value: 'Percentage (%)',
            angle: -90,
            position: 'insideLeft',
            fill: 'hsl(var(--muted-foreground))'
          }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line
          type="monotone"
          dataKey="weightage"
          name="Exam Weightage"
          stroke={COLORS.weightage.line}
          strokeWidth={2}
          dot={{ fill: COLORS.weightage.line }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="preparation"
          name="Your Preparation"
          stroke={COLORS.preparation.line}
          strokeWidth={2}
          dot={{ fill: COLORS.preparation.line }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    );
  };

  return (
    <Card className="col-span-4">
      <CardHeader className="pb-2 sm:pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>Topic Weightage Analysis</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-normal text-muted-foreground">
              Total Subjects: {subjects.length}
            </span>
          </div>
        </div>
        <div className='flex flex-col md:flex-row gap-4 items-center justify-between'>
          <CardDescription>
            Visualize and track your preparation progress against subject weightage
          </CardDescription>
          <div className="flex border p-0.5 rounded items-center gap-2">
            <Button
              variant={viewMode === 'bar' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-8"
              onClick={() => setViewMode('bar')}
            >
              <BarChart2 className="h-4 w-4 mr-1" />
              Bar
            </Button>
            <Button
              variant={viewMode === 'line' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-8"
              onClick={() => setViewMode('line')}
            >
              <LineChartIcon className="h-4 w-4 mr-1" />
              Line
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className='p-2 md:p-6'>
        <div className="w-full" style={{ height: `${chartHeight}px` }}>
          <ResponsiveContainer>
            {renderChart()}
          </ResponsiveContainer>
        </div>

        <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm sm:text-base font-semibold flex items-center gap-2">
              Focus Areas
              <span className="text-xs sm:text-sm font-normal text-muted-foreground">
                (Subjects requiring attention)
              </span>
            </h4>
          </div>
          <div className="space-y-1.5 sm:space-y-2">
            {chartData
              .filter(subject => subject.gap > 0)
              .sort((a, b) => b.gap - a.gap)
              .slice(0, 3)
              .map((subject) => (
                <div
                  key={subject.name}
                  className="flex items-center justify-between rounded-lg border p-2 sm:p-3 text-xs sm:text-sm hover:bg-muted/50 transition-colors"
                >
                  <div className="flex flex-col gap-0.5 sm:gap-1">
                    <span className="font-medium">{subject.name}</span>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-[0.65rem] sm:text-xs text-muted-foreground">
                      <span style={{ color: COLORS.weightage.hover }}>
                        Weightage: {subject.weightage}%
                      </span>
                      <span className="text-muted-foreground/50">|</span>
                      <span style={{ color: subject.color }}>
                        Progress: {subject.originalProgress}%
                      </span>
                    </div>
                  </div>
                  <span className="text-red-500 text-xs sm:text-sm font-medium whitespace-nowrap">
                    {subject.gap}% gap
                  </span>
                </div>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}