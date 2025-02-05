"use client";

import { SubjectWithRelations } from "@/lib/calculations/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SubjectCardProps {
  subject: SubjectWithRelations;
  progress: number;
  weightage: number;
  status?: string;
  statusColor?: string;
  behindTarget?: number;
  href?: string;
  className?: string;
  variant?: string;
}

export function SubjectCard({
  subject,
  progress,
  weightage,
  status = "",
  statusColor = "text-orange-500",
  behindTarget,
  href = `/subjects/${subject.id}`,
  className,
  variant = 'blue'
}: SubjectCardProps) {
  // Round progress to nearest integer and ensure it's between 0-100
  const roundedProgress = Math.max(0, Math.min(100, Math.round(progress)));
  
  // Determine progress bar color based on progress value and variant
  const progressColor = cn(
    "h-2 transition-all rounded-full",
    roundedProgress < 30 && "bg-red-500",
    roundedProgress >= 30 && roundedProgress < 70 && "bg-yellow-500",
    roundedProgress >= 70 && cn(
      variant === 'emerald' && "bg-emerald-500",
      variant === 'blue' && "bg-blue-500",
      variant === 'amber' && "bg-amber-500"
    )
  );

  // Add milestone markers
  const milestones = [25, 50, 75];

  return (
    <Card className={cn(
      "p-4 hover:bg-accent/50 transition-colors cursor-pointer group relative overflow-hidden",
      "hover:scale-[1.02] hover:shadow-lg transition-all duration-300",
      className
    )}>
      <Link href={href} className="block">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium">{subject.name}</h3>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="secondary" className={cn(
                    "text-xs font-normal transition-colors",
                    weightage >= 15 && "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                  )}>
                    {weightage} Marks
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Subject weightage in final exam</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </div>
        
        {/* Progress bar container */}
        <div className="relative w-full h-2 mb-2 bg-secondary rounded-full overflow-hidden">
          {/* Milestone markers */}
          {milestones.map((milestone) => (
            <div
              key={milestone}
              className="absolute top-0 bottom-0 w-0.5 bg-background/50"
              style={{ left: `${milestone}%` }}
            />
          ))}
          
          {/* Actual progress bar */}
          <div 
            className={progressColor}
            style={{ 
              width: `${roundedProgress}%`,
              transition: "width 0.3s ease-in-out"
            }} 
          />
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help">{roundedProgress}% complete</span>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1">
                  <p>Learning: {subject.learningProgress}%</p>
                  <p>Revision: {subject.revisionProgress}%</p>
                  <p>Practice: {subject.practiceProgress}%</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="flex items-center gap-2">
            {behindTarget !== undefined && (
              <span className="text-blue-300">
                Complete it at priority
              </span>
            )}
            {status && (
              <span className={statusColor}>
                {status}
              </span>
            )}
          </div>
        </div>
      </Link>
    </Card>
  );
} 