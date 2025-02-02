import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface StatsCardProps {
  title: string;
  value: number;
  total: number;
  tooltipText: string;
  suffix?: string;
  badge?: {
    value: number;
    icon: React.ReactNode;
    tooltipText: string;
  };
}

export function StatsCard({ 
  title, 
  value, 
  total, 
  tooltipText,
  suffix = "",
  badge 
}: StatsCardProps) {
  return (
    <Card className="border relative w-full  p-4">
      <div className="flex items-center justify-between mb-1.5 sm:mb-2">
        <div className="flex items-center gap-1 sm:gap-2">
          <h2 className="text-sm sm:text-lg font-semibold">{title}</h2>
        </div>
      </div>

      <div className="flex flex-col  items-baseline gap-1">
        <div className="justify-center w-full">
          <span className="text-3xl font-bold text-red-500">{value}</span>
          <span className="text-xl text-muted-foreground">/</span>
          <span className="text-xl text-muted-foreground">{total}</span>
        </div>
        <span className="ml-1 sm:ml-2 text-muted-foreground">
          {suffix}
        </span>
      </div>

      <div className="absolute top-4 right-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p>{tooltipText}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {badge && (
        <div className="absolute bottom-2 right-3 sm:bottom-4 sm:right-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge 
                  variant="outline" 
                  className="bg-green-500/10 text-green-500 border-green-500/20 flex items-center gap-1 text-[10px] sm:text-sm"
                >
                  {badge.icon}
                  {badge.value}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>{badge.tooltipText}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </Card>
  );
} 