'use client';

import { Progress } from "@/types/progress";
import { ProgressIndicator } from "@/components/ui/progress-indicator";
import { cn } from "@/lib/utils";
import { ChartPieIcon } from "lucide-react";

interface SidebarProgressCardProps {
    progress: Progress;
    isCollapsed: boolean;
    variant?: 'sidebar' | 'dashboard';
    className?: string;
}

export function SidebarProgressCard({
    progress,
    isCollapsed,
    variant = 'sidebar',
    className
}: SidebarProgressCardProps) {
    const isSidebar = variant === 'sidebar';

    if (isCollapsed) {
        return (
            <div className={cn(
                "flex flex-col items-center justify-center p-2 relative",
                "transition-all duration-200 ",
                className
            )}>
                <div className="relative">
                    <ChartPieIcon className="w-6 h-6 text-blue-500" />
                    <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full px-1.5 min-w-[20px] h-[20px] flex items-center justify-center">
                        {Math.round(progress.overall)}%
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={cn(
            "space-y-4",
            !isSidebar && "sm:p-6",
            className
        )}>

            <div className="space-y-2">
                <ProgressIndicator
                    label="Overall"
                    value={progress.overall}
                    category="overall"
                    size="sm"
                />
                <div className="grid grid-cols-2 gap-2">
                    <ProgressIndicator
                        label="Learning"
                        value={progress.learning}
                        category="learning"
                        size="sm"
                    />
                    <ProgressIndicator
                        label="Revision"
                        value={progress.revision}
                        category="revision"
                        size="sm"
                    />
                    <ProgressIndicator
                        label="Practice"
                        value={progress.practice}
                        category="practice"
                        size="sm"
                    />
                    <ProgressIndicator
                        label="Test"
                        value={progress.test}
                        category="test"
                        size="sm"
                    />
                </div>
            </div>
        </div>
    );
}