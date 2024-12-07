"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Subject } from "@prisma/client"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useMemo } from "react"

interface TopicWeightageAnalysisProps {
  subjects: Subject[]
}

export function TopicWeightageAnalysis({ subjects }: TopicWeightageAnalysisProps) {
  const chartData = useMemo(() => {
    return subjects.map(subject => ({
      name: subject.name,
      weightage: subject.weightage * 100, // Convert to percentage
      preparation: subject.overallProgress,
      gap: (subject.weightage * 100) - subject.overallProgress
    }))
  }, [subjects])

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Topic Weightage Analysis</CardTitle>
        <CardDescription>
          Compare your preparation level with GATE exam weightage
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Weightage
                            </span>
                            <span className="font-bold text-muted-foreground">
                              {payload[0].value?.toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Preparation
                            </span>
                            <span className="font-bold text-muted-foreground">
                              {payload[1].value?.toFixed(1)}%
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
                name="GATE Weightage"
                fill="#93c5fd"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="preparation"
                name="Your Preparation"
                fill="#22c55e"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Gap Analysis */}
        <div className="mt-4 space-y-2">
          <h4 className="font-semibold">Focus Areas</h4>
          <div className="space-y-1">
            {chartData
              .sort((a, b) => b.gap - a.gap)
              .slice(0, 3)
              .map((subject) => (
                <div key={subject.name} className="flex items-center justify-between text-sm">
                  <span>{subject.name}</span>
                  <span className="text-red-500">
                    {subject.gap > 0 ? `${subject.gap.toFixed(1)}% below target` : 'On track'}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 