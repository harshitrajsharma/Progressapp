"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SubjectWithRelations } from "@/lib/calculations/types"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useMemo } from "react"
import { calculateSubjectProgress } from "@/lib/calculations/progress"
import { cn } from "@/lib/utils"

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

// Custom colors for the bars
const COLORS = {
  weightage: {
    base: "hsl(217 91% 60% / 0.8)", // Blue with opacity
    hover: "hsl(217 91% 60%)",
  },
  preparation: {
    base: "hsl(142 76% 36% / 0.8)", // Green with opacity
    hover: "hsl(142 76% 36%)",
  },
  progress: {
    low: "hsl(0 84% 60%)", // Red
    medium: "hsl(38 92% 50%)", // Amber
    high: "hsl(142 76% 36%)", // Green
  }
};

interface CustomBarProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fill?: string;
  type: 'weightage' | 'preparation';
}

const CustomBar = ({ x, y, width, height, type }: CustomBarProps) => {
  return (
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
          {
            "hover:fill-[var(--bar-hover)]": true
          }
        )}
        style={{
          "--bar-hover": COLORS[type].hover
        } as React.CSSProperties}
      />
    </g>
  );
};

export function TopicWeightageAnalysis({ subjects }: TopicWeightageAnalysisProps) {
  const chartData = useMemo(() => {
    // Calculate total weightage for normalization
    const totalWeightage = subjects.reduce((sum, subject) => sum + subject.weightage, 0);

    return subjects.map(subject => {
      const progress = calculateSubjectProgress(subject);
      const normalizedWeightage = (subject.weightage / totalWeightage) * 100;
      
      // Calculate preparation relative to subject weightage
      const relativePreparation = (progress.overall * normalizedWeightage) / 100;
      const preparation = Math.round(relativePreparation * 10) / 10;
      
      // Gap is now between weightage and relative preparation
      const gap = Math.round((normalizedWeightage - preparation) * 10) / 10;

      // Calculate color based on preparation vs weightage
      const ratio = progress.overall / 100; // Using original progress percentage for color
      let color = COLORS.progress.low;
      if (ratio >= 0.8) color = COLORS.progress.high;
      else if (ratio >= 0.5) color = COLORS.progress.medium;

      return {
        name: subject.name,
        weightage: Math.round(normalizedWeightage * 10) / 10,
        preparation,
        gap,
        color,
        originalProgress: Math.round(progress.overall * 10) / 10 // Keep original progress for tooltip
      };
    }).sort((a, b) => b.weightage - a.weightage);
  }, [subjects]);

  // Calculate dynamic chart height based on number of subjects
  const chartHeight = useMemo(() => {
    const baseHeight = 300; // Base height for mobile
    const heightPerSubject = 40; // Additional height per subject
    return Math.max(baseHeight, subjects.length * heightPerSubject);
  }, [subjects]);

  return (
    <Card className="col-span-4">
      <CardHeader className="pb-2 sm:pb-6">
        <CardTitle className="flex items-center justify-between">
          Topic Weightage Analysis
          <span className="text-sm font-normal text-muted-foreground">
            Total Subjects: {subjects.length}
          </span>
        </CardTitle>
        <CardDescription>
          Compare your preparation level with exam weightage
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[300px] sm:h-[400px]" style={{ minHeight: `${chartHeight}px` }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 10,
                right: 10,
                left: 0,
                bottom: 5,
              }}
              barGap={2}
            >
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
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as ChartDataItem;
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
                    )
                  }
                  return null
                }}
              />
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
          </ResponsiveContainer>
        </div>
        
        {/* Gap Analysis */}
        <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
          <h4 className="text-sm sm:text-base font-semibold flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            Focus Areas
            <span className="text-xs sm:text-sm font-normal text-muted-foreground">
              (Subjects requiring attention)
            </span>
          </h4>
          <div className="space-y-1.5 sm:space-y-2">
            {chartData
              .filter(subject => subject.gap > 0)
              .sort((a, b) => b.gap - a.gap)
              .slice(0, 3)
              .map((subject) => (
                <div 
                  key={subject.name} 
                  className="flex items-center justify-between rounded-lg border p-2 sm:p-3 text-xs sm:text-sm"
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