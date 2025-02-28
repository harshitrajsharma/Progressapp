import { Card } from "@/components/ui/card"
import { Info } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { memo } from "react"
import { StatCardProps } from "@/types/ui"

function StatCardComponent({ 
  label, 
  value, 
  subValue,
  icon: Icon,
  iconColor = "text-muted-foreground",
  bgColor = "text-muted-foreground",
  tooltipText,
  valueColor,
  className,
  variant = 'default'
}: StatCardProps) {
  return (
    <Card className={cn(
      "p-4 relative overflow-hidden",
      variant === 'outline' && "border-2",
      className
    )}>
      <div className={cn("absolute left-0 top-0 bottom-0 w-1 ", bgColor )} />
      <div className=" space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{label}</span>
          {tooltipText ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{tooltipText}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : Icon && (
            <Icon className={cn("h-4 w-4", iconColor)} />
          )}
        </div>
        <div className="flex items-baseline gap-1">
          <span className={cn(
            "text-2xl font-bold",
            valueColor
          )}>
            {value}
          </span>
          {subValue && (
            <span className="text-muted-foreground">{subValue}</span>
          )}
        </div>
      </div>
    </Card>
  );
}

// Memoize with display name
StatCardComponent.displayName = 'StatCardComponent';
export const StatCard = memo(StatCardComponent); 