"use client";

import { SubjectWithRelations } from "@/lib/calculations/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SubjectCardProps {
  subject: SubjectWithRelations;
  progress: number;
  weightage: number;
  status?: string;
  statusColor?: string;
  behindTarget?: number;
  href?: string;
  className?: string;
  variant?: 'emerald' | 'blue' | 'amber';
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
  
  // Determine progress bar color based on variant
  const progressColor = cn(
    "h-2 mb-2 transition-all",
    variant === 'emerald' && "bg-emerald-600 dark:bg-emerald-500",
    variant === 'blue' && "bg-blue-600 dark:bg-blue-500",
    variant === 'amber' && "bg-amber-600 dark:bg-amber-500"
  );

  return (
    <Link href={href}>
      <Card className={cn("p-4 hover:bg-accent/50 transition-colors cursor-pointer group relative overflow-hidden my-2", className)}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium">{subject.name}</h3>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs font-normal">
              {weightage} Marks
            </Badge>
            <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </div>
        
        {/* Progress bar background */}
        <div className="w-full h-2 mb-2 bg-secondary rounded-full overflow-hidden">
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
          <span>{roundedProgress}% complete</span>
          <div className="flex items-center gap-2">
            {behindTarget !== undefined && (
              <span className="text-green-500 hidden">
                {Math.round(behindTarget)}% behind target
              </span>
            )}
            {status && (
              <span className={statusColor}>
                {status}
              </span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
} 