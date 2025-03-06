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
  const roundedProgress = Math.max(0, Math.min(100, Math.round(progress)));

  const progressColor = cn(
    "absolute -top-[8%] left-0 h-2 transition-all rounded-full relative z-10",
    roundedProgress < 30 && "bg-red-500/80",
    roundedProgress >= 30 && roundedProgress < 70 && "bg-yellow-500/80",
    roundedProgress >= 70 && cn(
      variant === 'emerald' && "bg-emerald-500/80",
      variant === 'blue' && "bg-blue-500/80",
      variant === 'amber' && "bg-amber-500/80"
    )
  );

  const milestones = [25, 50, 75];

  return (
    <Card className={cn(
      "relative p-4 backdrop-blur-md bg-white/10 dark:bg-black/10",
      "border border-white/20 dark:border-white/10",
      "before:absolute before:inset-0 before:bg-gradient-to-br",
      "before:from-white/5 before:to-white/20 dark:before:from-white/5 dark:before:to-transparent",
      "before:rounded-lg before:z-0",
      "hover:bg-white/20 dark:hover:bg-white/5",
      "hover:scale-[1.02] hover:shadow-xl",
      "transition-all duration-300 ease-in-out",
      "cursor-pointer group overflow-hidden",
      className
    )}>
      <div className="relative z-10">
        <Link href={href} className="block">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-lg bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text truncate text-transparent">
              {subject.name}
            </h3>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="secondary" className={cn(
                      "text-xs font-normal backdrop-blur-sm",
                      "transition-all duration-300",
                      weightage >= 15 ?
                        "bg-blue-100/80 text-blue-700 dark:bg-blue-900/80 dark:text-blue-300" :
                        "bg-gray-100/80 text-gray-700 dark:bg-gray-800/80 dark:text-gray-300"
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

          <div className="relative w-full  h-2 mb-2 bg-black/10 dark:bg-secondary/30 rounded-full overflow-hidden backdrop-blur-sm border dark:border-white/20">
            {milestones.map((milestone) => (
              <div
                key={milestone}
                className="absolute top-0 bottom-0 w-0.5 bg-black/20 dark:bg-white/20"
                style={{ left: `${milestone}%` }}
              />
            ))}

            <div
              className={progressColor}
              style={{
                width: `${roundedProgress}%`,
                transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
              }}
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="font-medium bg-gradient-to-r from-gray-700 to-gray-500 dark:from-gray-300 dark:to-gray-400 bg-clip-text text-transparent">
              {roundedProgress}% complete
            </span>
            <div className="flex items-center gap-2">
              {behindTarget !== undefined && (
                <span className="text-blue-600 dark:text-blue-300 font-medium">
                  Complete it at priority
                </span>
              )}
              {status && (
                <span className={cn(statusColor, "font-medium")}>
                  {status}
                </span>
              )}
            </div>
          </div>
        </Link>
      </div>
    </Card>
  );
}