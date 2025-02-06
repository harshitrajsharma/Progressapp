"use client";

import React, { useState, useRef, useEffect } from 'react';
import { SubjectWithRelations } from "@/lib/calculations/types";
import { useSession } from "next-auth/react";
import { getSmartRecommendations } from "@/lib/recommendations/smart-recommendations";
import { SubjectCard } from "./subject-card";
import RecommendationSection from "./recommendation-section";
import { Pause, Play, Sparkles, ChevronLeft, ChevronRight, BookOpen, Target, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface SmartRecommendationsProps {
  subjects: SubjectWithRelations[];
}

const MATH_SUBJECTS = ["Discrete Maths", "Engineering Maths", "Aptitude"] as const;
type MathSubject = typeof MATH_SUBJECTS[number];

function isMathSubject(name: string): name is MathSubject {
  return MATH_SUBJECTS.includes(name as MathSubject);
}

interface SubjectRecommendation {
  subject: SubjectWithRelations & { isMathSubject?: boolean };
  learningProgress: number;
  revisionProgress: number;
  testProgress: number;
  weightage: number;
}

function filterPriorityFocusSubjects(subjects: SubjectRecommendation[]) {
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

  if (sortedMathSubjects.length > 0) {
    const selectedNonMath = sortedNonMathSubjects.slice(0, 2);
    const selectedMath = sortedMathSubjects.slice(0, 1);
    return [...selectedNonMath, ...selectedMath];
  } else {
    return sortedNonMathSubjects.slice(0, 3);
  }
}

function filterRevisionSubjects(subjects: SubjectRecommendation[]) {
  return subjects
    .sort((a, b) => {
      const weightageA = a.weightage;
      const weightageB = b.weightage;
      const revisionProgressA = a.revisionProgress;
      const revisionProgressB = b.revisionProgress;

      const scoreA = (weightageA * (100 - revisionProgressA)) / 100;
      const scoreB = (weightageB * (100 - revisionProgressB)) / 100;

      return scoreB - scoreA;
    })
    .slice(0, 3);
}

export function SmartRecommendations({ subjects }: SmartRecommendationsProps) {
  const recommendations = getSmartRecommendations(subjects);
  const { data: session } = useSession();
  const [activeSection, setActiveSection] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartRef = useRef(0);
  const touchEndRef = useRef(0);

  const reviseSubjects = filterRevisionSubjects(recommendations.revise);
  const priorityFocusSubjects = filterPriorityFocusSubjects(recommendations.priorityFocus);
  const testProgressSubjects = recommendations.testProgress;

  const sections = [
    {
      title: "Revise",
      icon: <BookOpen className="h-5 w-5 text-emerald-500" />,
      description: "Subjects that need revision based on your learning progress",
      className: "bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/40 dark:to-emerald-800/40",
      emptyMessage: (
        <div className="flex flex-col items-center space-y-4">
          <BookOpen className="h-12 w-12 text-emerald-500 opacity-50" />
          <p className="text-lg font-semibold">All Caught Up! 🌟</p>
          <div className="text-center space-y-2">
            <p>You&apos;re doing great with your revisions.</p>
            <p className="text-sm text-muted-foreground">
              Keep maintaining this momentum to strengthen your knowledge.
            </p>
          </div>
        </div>
      ),
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
      icon: <Target className="h-5 w-5 text-blue-500" />,
      description: "Subjects that need immediate attention based on learning progress",
      className: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-800/40",
      emptyMessage: (
        <div className="flex flex-col items-center space-y-4">
          <Target className="h-12 w-12 text-blue-500 opacity-50" />
          <p className="text-lg font-semibold">Time to Begin Your Journey! 🚀</p>
          <div className="text-center space-y-2">
            <p>You haven&apos;t started any subjects yet.</p>
            <p className="text-sm text-muted-foreground">
              Pick a subject from the &quot;Start Next&quot; section and begin your learning adventure.
            </p>
          </div>
        </div>
      ),
      subjects: priorityFocusSubjects.map(({ subject, learningProgress }) => ({
        subject,
        progress: learningProgress,
        variant: "blue",
        behindTarget: undefined,
        status: subject.isMathSubject ? "Math Subject - Focus Required" : "Complete it at Priority",
        statusColor: subject.isMathSubject ? "text-red-600" : "text-blue-500",
        cardClassName: cn(
          "bg-white/80 dark:bg-blue-900/60 hover:bg-blue-50/90 dark:hover:bg-blue-800/80",
          subject.isMathSubject && "border-t-2 border-blue-200 dark:border-blue-800 pt-2"
        )
      }))
    },
    ...(recommendations.startNext.length > 0 ? [{
      title: "Start Next",
      icon: <Rocket className="h-5 w-5 text-amber-500" />,
      description: `Recommended subjects to start based on ${session?.user?.examName || "exam"} weightage`,
      className: "bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/40 dark:to-amber-800/40",
      emptyMessage: (
        <div className="flex flex-col items-center space-y-4">
          <Rocket className="h-12 w-12 text-amber-500 opacity-50" />
          <p className="text-lg font-semibold">Ready for Takeoff! 🎯</p>
          <div className="text-center space-y-2">
            <p>Your learning journey awaits!</p>
            <p className="text-sm text-muted-foreground">
              Choose a subject that interests you and start making progress today.
            </p>
          </div>
        </div>
      ),
      subjects: recommendations.startNext.map(({ subject }) => ({
        subject,
        progress: 0,
        variant: "amber",
        status: "High priority - Start soon",
        statusColor: "text-orange-500",
        cardClassName: "bg-white/80 dark:bg-amber-900/60 hover:bg-amber-50/90 dark:hover:bg-amber-800/80",
        behindTarget: undefined
      }))
    }] : [{
      title: "Test Progress",
      icon: <Target className="h-5 w-5 text-purple-500" />,
      description: "Track your test performance across all subjects",
      className: "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/40 dark:to-purple-800/40",
      emptyMessage: (
        <div className="flex flex-col items-center space-y-4">
          <Target className="h-12 w-12 text-purple-500 opacity-50" />
          <p className="text-lg font-semibold">Time to Test Your Knowledge! 📝</p>
          <div className="text-center space-y-2">
            <p>You haven&apos;t taken any tests yet.</p>
            <p className="text-sm text-muted-foreground">
              Start taking tests to measure your understanding and track your progress.
            </p>
          </div>
        </div>
      ),
      subjects: testProgressSubjects.map(({ subject, testProgress }) => ({
        subject,
        progress: testProgress,
        variant: "purple",
        status: testProgress === 0 ? "Start your first test" : "Take more tests",
        statusColor: "text-purple-500",
        cardClassName: "bg-white/80 dark:bg-purple-900/60 hover:bg-purple-50/90 dark:hover:bg-purple-800/80",
        behindTarget: undefined
      }))
    }])
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
    <Card className="p-4 md:p-6 md:bg-background/50 backdrop-blur-sm ">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className='w-full'>
            <div className="flex items-center justify-between w-full gap-2">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-violet-500 to-blue-500 bg-clip-text text-transparent animate-gradient">
                Smart Recommendations
              </h1>
              <Sparkles className="h-6 w-6 text-blue-500 " />
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Based on your progress and {session?.user?.examName || "exam"} weightage
            </p>
          </div>
        </div>

        {/* Desktop view */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-6">
          {sections.map((section) => (
            <RecommendationSection
              key={section.title}
              title={
                <div className="flex items-center gap-2">
                  {section.icon}
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
              <div className="space-y-2">
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
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
              >
                <RecommendationSection
                  title={
                    <div className="flex items-center gap-2">
                      {sections[activeSection].icon}
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
              </motion.div>
            </AnimatePresence>

            {/* Swipe indicators */}
            <div className="absolute inset-y-0 left-0 flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
                onClick={() => setActiveSection((prev) => (prev - 1 + sections.length) % sections.length)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
                onClick={() => setActiveSection((prev) => (prev + 1) % sections.length)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

          </div>

          {/* Autoplay control */}
          <div className=" mt-2 gap-2 flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
              onClick={() => setIsAutoPlay(!isAutoPlay)}
            >
              {isAutoPlay ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            {/* Mini previews */}
            <div className=" flex justify-center gap-2">
              {sections.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveSection(index)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    activeSection === index
                      ? "bg-primary w-8"
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}