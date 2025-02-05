"use client";

import React from 'react';
import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RecommendationSectionProps {
  title: React.ReactNode;
  description: string;
  children: React.ReactNode;
  className?: string;
  emptyMessage?: React.ReactNode;
  isEmpty?: boolean;
}

const RecommendationSection: React.FC<RecommendationSectionProps> = ({ 
  title, 
  description, 
  children, 
  className = "",
  emptyMessage,
  isEmpty = false
}) => {
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
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center space-y-2">
            {emptyMessage || (
              <p className="text-muted-foreground text-sm font-medium">No items to display</p>
            )}
          </div>
        ) : children}
      </div>
    </Card>
  );
};

export default RecommendationSection; 