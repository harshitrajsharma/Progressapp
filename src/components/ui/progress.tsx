"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cn } from "@/lib/utils"
import { useSmoothTransition } from "@/hooks/use-smooth-transition"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    indicatorClassName?: string;
    transitionDuration?: number;
  }
>(({ 
  className, 
  value, 
  indicatorClassName,
  transitionDuration = 500,
  ...props 
}, ref) => {
  const { displayValue, isTransitioning } = useSmoothTransition(value, {
    duration: transitionDuration,
    immediate: value === 0 // Prevent animation on initial render
  });

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-gray-100",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full w-full flex-1 bg-primary transform-gpu",
          isTransitioning ? "transition-transform duration-500 ease-out" : "",
          indicatorClassName
        )}
        style={{ 
          transform: `translateX(-${100 - (displayValue || 0)}%)`
        }}
      />
    </ProgressPrimitive.Root>
  );
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
