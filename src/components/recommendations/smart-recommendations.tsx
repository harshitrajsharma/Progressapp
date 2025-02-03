"use client";

import React, { useState, useRef, useEffect } from 'react';
import { SubjectWithRelations } from "@/lib/calculations/types";
import { useSession } from "next-auth/react";
import { getSmartRecommendations } from "@/lib/recommendations/smart-recommendations";
import { SubjectCard } from "./subject-card";
import RecommendationSection from "./recommendation-section";
import { Pause, Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SmartRecommendationsProps {
  subjects: SubjectWithRelations[];
}

const MATH_SUBJECTS = ["Discrete Maths", "Engineering Maths", "Aptitude"] as const;
type MathSubject = typeof MATH_SUBJECTS[number];

function isMathSubject(name: string): name is MathSubject {
  return MATH_SUBJECTS.includes(name as MathSubject);
}

function filterPriorityFocusSubjects(subjects: Array<{ subject: SubjectWithRelations; learningProgress: number }>) {
  const mathSubjects = subjects.filter(({ subject, learningProgress }) =>
    isMathSubject(subject.name) &&
    learningProgress > 0 &&
    learningProgress < 100
  );

  const nonMathSubjects = subjects.filter(({ subject, learningProgress }) =>
    !isMathSubject(subject.name) &&
    learningProgress > 0 &&
    learningProgress < 100
  );

  const sortedMathSubjects = mathSubjects.sort((a, b) => b.learningProgress - a.learningProgress);
  const sortedNonMathSubjects = nonMathSubjects.sort((a, b) => b.learningProgress - a.learningProgress);

  const selectedNonMath = sortedNonMathSubjects.slice(0, 2);
  const selectedMath = sortedMathSubjects.slice(0, 1);

  return [...selectedNonMath, ...selectedMath];
}

export function SmartRecommendations({ subjects }: SmartRecommendationsProps) {
  const recommendations = getSmartRecommendations(subjects);
  const { data: session } = useSession();
  const [activeSection, setActiveSection] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartRef = useRef(0);
  const touchEndRef = useRef(0);

  const reviseSubjects = recommendations.revise.slice(0, 3);
  const priorityFocusSubjects = filterPriorityFocusSubjects(recommendations.priorityFocus);
  const startNextSubjects = recommendations.startNext.slice(0, 3);

  const sections = [
    {
      title: "Revise",
      icon: "🔄",
      description: "Subjects that need revision based on your learning progress",
      className: "bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/40 dark:to-emerald-800/40",
      emptyMessage: "Great job! You're up to date with your revisions. 🎉",
      subjects: reviseSubjects.map(({ subject, revisionProgress }) => ({
        subject,
        progress: revisionProgress,
        variant: "emerald",
        status: "Revise Now",
        statusColor: "text-emerald-500",
        cardClassName: "bg-white/80 dark:bg-emerald-900/60 hover:bg-emerald-50/90 dark:hover:bg-emerald-800/80",
        behindTarget: undefined
      }))
    },
    {
      title: "Priority Focus",
      icon: "🎯",
      description: "Subjects that need immediate attention based on learning progress",
      className: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-800/40",
      emptyMessage: "Excellent! You're on track with all your subjects. 🌟",
      subjects: priorityFocusSubjects.map(({ subject, learningProgress }, index) => ({
        subject,
        progress: learningProgress,
        variant: "blue",
        behindTarget: undefined,
        status: index === 2 ? "Math Subject - Focus Required" : "Complete it at Priority",
        statusColor: index === 2 ? "text-red-600" : "text-blue-500",
        cardClassName: cn(
          "bg-white/80 dark:bg-blue-900/60 hover:bg-blue-50/90 dark:hover:bg-blue-800/80",
          index === 2 && "border-t-2 border-blue-200 dark:border-blue-800 pt-2"
        )
      }))
    },
    {
      title: "Start Next",
      icon: "🚀",
      description: `Recommended subjects to start based on ${session?.user?.examName || "exam"} weightage`,
      className: "bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/40 dark:to-amber-800/40",
      emptyMessage: "Congratulations! You've started all your subjects. 🎯",
      subjects: startNextSubjects.map(({ subject }) => ({
        subject,
        progress: 0,
        variant: "amber",
        status: "High priority - Start soon",
        statusColor: "text-orange-500",
        cardClassName: "bg-white/80 dark:bg-amber-900/60 hover:bg-amber-50/90 dark:hover:bg-amber-800/80",
        behindTarget: undefined
      }))
    }
  ];

  // Auto-carousel effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isAutoPlay) {
      interval = setInterval(() => {
        setActiveSection((prev) => (prev + 1) % sections.length);
      }, 10000);
    }

    return () => clearInterval(interval);
  }, [isAutoPlay, sections.length]);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    touchEndRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    const swipeDistance = touchStartRef.current - touchEndRef.current;
    const minSwipeDistance = 50;

    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0) {
        setActiveSection((prev) => (prev + 1) % sections.length);
      } else {
        setActiveSection((prev) => (prev - 1 + sections.length) % sections.length);
      }
    }

    setIsDragging(false);
  };

  return (
    <Card className="p-6 bg-background/50 backdrop-blur-sm border border-white/20">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-200 to-primary/60 bg-clip-text text-transparent">
                Smart Recommendations
              </h1>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Based on your progress and {session?.user?.examName || "exam"} weightage
            </p>
          </div>
            <Sparkles className="h-6 w-6 text-blue-500" />
        </div>

        {/* Desktop view */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-6">
          {sections.map((section) => (
            <RecommendationSection
              key={section.title}
              title={
                <div className="flex items-center gap-2">
                  <span>{section.icon}</span>
                  <span>{section.title}</span>
                </div>
              }
              description={section.description}
              className={cn(
                section.className,
                "transition-transform hover:scale-[1.01] border border-white/20"
              )}
              emptyMessage={section.emptyMessage}
              isEmpty={section.subjects.length === 0}
            >
              <div className="space-y-4">
                {section.subjects.map((subjectData) => (
                  <SubjectCard
                    key={subjectData.subject.id}
                    subject={subjectData.subject}
                    progress={subjectData.progress}
                    weightage={subjectData.subject.weightage}
                    status={subjectData.status}
                    statusColor={subjectData.statusColor}
                    behindTarget={subjectData.behindTarget}
                    className={cn(
                      subjectData.cardClassName,
                      "transition-all duration-200 hover:translate-y-[-2px] hover:shadow-lg"
                    )}
                    variant={subjectData.variant}
                  />
                ))}
              </div>
            </RecommendationSection>
          ))}
        </div>

        {/* Mobile/Tablet carousel */}
        <div className="lg:hidden">
          <div
            className="relative"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div>
              <div className="transition-opacity duration-300">
                <RecommendationSection
                  title={
                    <div className="flex items-center gap-2">
                      <span>{sections[activeSection].icon}</span>
                      <span>{sections[activeSection].title}</span>
                    </div>
                  }
                  description={sections[activeSection].description}
                  className={cn(
                    sections[activeSection].className,
                    "border border-white/20"
                  )}
                  emptyMessage={sections[activeSection].emptyMessage}
                  isEmpty={sections[activeSection].subjects.length === 0}
                >
                  {sections[activeSection].subjects.map((subjectData) => (
                    <SubjectCard
                      key={subjectData.subject.id}
                      subject={subjectData.subject}
                      progress={subjectData.progress}
                      weightage={subjectData.subject.weightage}
                      status={subjectData.status}
                      statusColor={subjectData.statusColor}
                      behindTarget={subjectData.behindTarget}
                      className={cn(
                        subjectData.cardClassName,
                        "transition-all duration-200 hover:translate-y-[-2px] hover:shadow-lg"
                      )}
                      variant={subjectData.variant}
                    />
                  ))}
                </RecommendationSection>
              </div>
            </div>
          </div>

          {/* Progress bar and dots */}
          <div className="mt-4 space-y-2">

            {/* Navigation dots */}
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 bg-muted-foreground/30 p-4 rounded-full"
                onClick={() => setIsAutoPlay(!isAutoPlay)}
              >
                {isAutoPlay ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <div className=' flex items-center gap-2'>
                {sections.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveSection(index)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all duration-1000",
                      activeSection === index
                        ? "bg-primary w-6"
                        : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    )}
                    style={{
                      animationPlayState: isAutoPlay ? "running" : "paused"
                    }}
                  />
                ))}
              </div>

            </div>
          </div>


          
        </div>
      </div>
    </Card>
  );
}