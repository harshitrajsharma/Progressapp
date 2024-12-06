"use client";

import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RecommendationSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}

export function RecommendationSection({
  title,
  description,
  children,
  className = ""
}: RecommendationSectionProps) {
  return (
    <Card className={`p-3 ${className}`}>
      <div className="flex items-center justify-between gap-1.5 mb-3">
        <h2 className="text-xl font-semibold">{title}</h2>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3.5 w-3.5 text-muted-foreground hover:text-primary transition-colors scale-105 cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="top" align="start" className="max-w-[200px]">
              <p className="text-xs">{description}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </Card>
  );
} 