'use client';

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface SubjectHeaderProps {
  subject: {
    name: string;
    weightage: number;
  };
  chaptersCount: number;
  topicsCount: number;
}

export function SubjectHeader({ subject, chaptersCount, topicsCount }: SubjectHeaderProps) {
  return (
    <div className="flex items-center gap-2 sm:gap-4">
      <Link href="/subjects">
        <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10 rounded-full">
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </Link>
      
      <div className="space-y-0.5 sm:space-y-1 w-full">
        <div className="flex items-center justify-between w-full gap-1.5 sm:gap-2 flex-wrap">
          <h1 className="text-xl sm:text-2xl font-bold line-clamp-1">{subject.name}</h1>
          <Badge variant="secondary" className="font-normal text-xs sm:text-sm">
            {subject.weightage} marks
          </Badge>
        </div>
        <p className="text-sm sm:text-base text-muted-foreground">
          {chaptersCount} chapters • {topicsCount} topics
        </p>
      </div>
    </div>
  );
} 