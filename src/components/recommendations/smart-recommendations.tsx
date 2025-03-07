"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Pause, Play, Sparkles, BookOpen, Target, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { SubjectCard } from "./subject-card";
import RecommendationSection from "./recommendation-section";
import { getSmartRecommendations } from "@/lib/recommendations/smart-recommendations";
import { SubjectWithRelations } from '@/lib/calculations';

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
    isMathSubject(subject.name) && learningProgress > 0 && learningProgress < 100
  );

  const nonMathSubjects = subjects.filter(({ subject, learningProgress }) =>
    !isMathSubject(subject.name) && learningProgress > 0 && learningProgress < 100
  );

  const sortedMathSubjects = mathSubjects.sort((a, b) => b.learningProgress - a.learningProgress);
  const sortedNonMathSubjects = nonMathSubjects.sort((a, b) => b.learningProgress - a.learningProgress);

  return sortedMathSubjects.length > 0
    ? [...sortedNonMathSubjects.slice(0, 2), ...sortedMathSubjects.slice(0, 1)]
    : sortedNonMathSubjects.slice(0, 3);
}

function filterRevisionSubjects(subjects: SubjectRecommendation[]) {
  return subjects
    .sort((a, b) => {
      const scoreA = (a.weightage * (100 - a.revisionProgress)) / 100;
      const scoreB = (b.weightage * (100 - b.revisionProgress)) / 100;
      return scoreB - scoreA;
    })
    .slice(0, 3);
}

export function SmartRecommendations({ subjects }: SmartRecommendationsProps) {
  const recommendations = getSmartRecommendations(subjects);
  const [userData, setUserData] = useState<{ examName: string | null }>();
  const [activeSection, setActiveSection] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [lastDirection, setLastDirection] = useState<'left' | 'right' | null>(null);
  const touchStartRef = useRef(0);
  const touchEndRef = useRef(0);

  const reviseSubjects = filterRevisionSubjects(recommendations.revise || []);
  const priorityFocusSubjects = filterPriorityFocusSubjects(recommendations.priorityFocus || []);
  const testProgressSubjects = recommendations.testProgress || [];

  // Fetch user data including exam name
  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await fetch('/api/user/details');
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }
    fetchUserData();
  }, []);

  const sections = [
    {
      title: "Revise",
      icon: <BookOpen className="h-4 sm:h-5 w-4 sm:w-5 text-emerald-500" />,
      description: "Subjects needing revision based on progress",
      className: "bg-gradient-to-br from-emerald-50/80 to-emerald-100/80 dark:from-emerald-900/20 dark:to-emerald-800/20 backdrop-blur-md",
      emptyMessage: (
        <div className="flex flex-col items-center space-y-3 p-4 sm:p-6 rounded-lg bg-white/10">
          <BookOpen className="h-10 sm:h-12 w-10 sm:w-12 text-emerald-500 opacity-50" />
          <p className="text-base sm:text-lg font-semibold">All Caught Up! 🌟</p>
          <div className="text-center space-y-1 text-sm sm:text-base">
            <p>Great job with revisions!</p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Keep up the momentum to reinforce your knowledge.
            </p>
          </div>
        </div>
      ),
      subjects: reviseSubjects.map(({ subject, revisionProgress }) => ({
        subject,
        progress: revisionProgress,
        variant: "emerald",
        status: "Revise Now",
        statusColor: " text-emerald-600 dark:text-emerald-200",
        cardClassName: "bg-emerald-400/40 dark:bg-emerald-900/40 hover:bg-emerald-400/60 dark:hover:bg-emerald-800/60 backdrop-blur-sm",
        behindTarget: undefined
      }))
    },
    {
      title: "Priority Focus",
      icon: <Target className="h-4 sm:h-5 w-4 sm:w-5 text-blue-500" />,
      description: "Subjects needing immediate attention",
      className: "bg-gradient-to-br from-blue-50/80 to-blue-100/80 dark:from-blue-900/20 dark:to-blue-800/20 backdrop-blur-md",
      emptyMessage: (
        <div className="flex flex-col items-center space-y-3 p-4 sm:p-6 rounded-lg bg-white/10">
          <Target className="h-10 sm:h-12 w-10 sm:w-12 text-blue-500 opacity-50" />
          <p className="text-base sm:text-lg font-semibold">Start Your Journey! 🚀</p>
          <div className="text-center space-y-1 text-sm sm:text-base">
            <p>No subjects started yet.</p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Begin with a subject from &quot;Start Next&quot;.
            </p>
          </div>
        </div>
      ),
      subjects: priorityFocusSubjects.map(({ subject, learningProgress }) => ({
        subject,
        progress: learningProgress,
        variant: "blue",
        behindTarget: undefined,
        status: subject.isMathSubject ? "Math - Focus Required" : "Complete at Priority",
        statusColor: subject.isMathSubject ? "text-red-600" : "dark:text-blue-600 dark:text-blue-200",
        cardClassName: cn(
          "bg-blue-400/40 dark:bg-blue-900/40 hover:bg-blue-400/60 dark:hover:bg-blue-800/60 backdrop-blur-sm",
          subject.isMathSubject && "border-t-2 border-blue-200 dark:border-blue-800 pt-2"
        )
      }))
    },
    ...(recommendations.startNext && recommendations.startNext.length > 0 ? [{
      title: "Start Next",
      icon: <Rocket className="h-4 sm:h-5 w-4 sm:w-5 text-amber-500" />,
      description: `Subjects to start based on ${userData?.examName || "exam"}`,
      className: "bg-gradient-to-br from-amber-50/80 to-amber-100/80 dark:from-amber-900/20 dark:to-amber-800/20 backdrop-blur-md",
      emptyMessage: (
        <div className="flex flex-col items-center space-y-3 p-4 sm:p-6 rounded-lg bg-white/10">
          <Rocket className="h-10 sm:h-12 w-10 sm:w-12 text-amber-500 opacity-50" />
          <p className="text-base sm:text-lg font-semibold">Ready for Takeoff! 🎯</p>
          <div className="text-center space-y-1 text-sm sm:text-base">
            <p>Your journey awaits!</p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Pick a subject to start learning today.
            </p>
          </div>
        </div>
      ),
      subjects: recommendations.startNext.map(({ subject }) => ({
        subject,
        progress: 0,
        variant: "amber",
        status: "High Priority - Start Soon",
        statusColor: " text-amber-600 dark:text-amber-200",
        cardClassName: "bg-amber-400/40 dark:bg-amber-900/40 hover:bg-amber-400/60 dark:hover:bg-amber-800/60 backdrop-blur-sm",
        behindTarget: undefined
      }))
    }] : [{
      title: "Test Progress",
      icon: <Target className="h-4 sm:h-5 w-4 sm:w-5 text-purple-500" />,
      description: "Track your test performance",
      className: "bg-gradient-to-br from-purple-50/80 to-purple-100/80 dark:from-purple-900/20 dark:to-purple-800/20 backdrop-blur-md",
      emptyMessage: (
        <div className="flex flex-col items-center space-y-3 p-4 sm:p-6 rounded-lg bg-white/10">
          <Target className="h-10 sm:h-12 w-10 sm:w-12 text-purple-500 opacity-50" />
          <p className="text-base sm:text-lg font-semibold">Test Your Knowledge! 📝</p>
          <div className="text-center space-y-1 text-sm sm:text-base">
            <p>No tests taken yet.</p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Start testing to track progress.
            </p>
          </div>
        </div>
      ),
      subjects: testProgressSubjects.map(({ subject, testProgress }) => ({
        subject,
        progress: testProgress,
        variant: "purple",
        status: testProgress === 0 ? "Start Test" : "Take More Tests",
        statusColor: "text-purple-600 dark:text-purple-200",
        cardClassName: " bg-purple-400/40 dark:bg-purple-900/40 hover:bg-purple-400/60 dark:hover:bg-purple-800/60 backdrop-blur-sm",
        behindTarget: undefined
      }))
    }])
  ];

  // Ensure activeSection stays within bounds
  useEffect(() => {
    if (activeSection >= sections.length) {
      setActiveSection(0);
    }
  }, [sections.length, activeSection]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoPlay && !isDragging) {
      interval = setInterval(() => {
        setActiveSection((prev) => (prev + 1) % sections.length);
        setLastDirection('right');
      }, 8000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlay, isDragging, sections.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX;
    setIsDragging(true);
    setIsAutoPlay(false);
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - touchStartRef.current;
    setDragOffset(diff);
    touchEndRef.current = currentX;
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    const swipeDistance = touchStartRef.current - touchEndRef.current;
    const minSwipeDistance = 50;
    const windowWidth = window.innerWidth;
    const swipeThreshold = windowWidth * 0.3;

    if (Math.abs(swipeDistance) > Math.min(minSwipeDistance, swipeThreshold)) {
      if (swipeDistance > 0) { // Left swipe = Next section
        setActiveSection((prev) => (prev + 1) % sections.length);
        setLastDirection('right');
      } else { // Right swipe = Previous section
        setActiveSection((prev) => (prev - 1 + sections.length) % sections.length);
        setLastDirection('left');
      }
    }
    setIsDragging(false);
    setDragOffset(0);
    setTimeout(() => setIsAutoPlay(true), 2000);
  };

  return (
    <Card className="p-3 sm:p-4 md:p-6 bg-white/20 dark:bg-gray-900/20 backdrop-blur-md border-black/20 dark:border-white/20 shadow-lg">
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2">
              <h1 className="text-xl sm:text-2xl font-bold ">
                Smart Recommendations
              </h1>
              <Sparkles className="h-5 sm:h-6 w-5 sm:w-6 text-blue-500 animate-pulse" />
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Based on your progress and {userData?.examName || "exam"}
            </p>
          </div>
        </div>

        {/* Desktop view */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-6">
          {sections.map((section) => (
            <RecommendationSection
              key={section.title}
              title={<div className="flex items-center gap-2">{section.icon} <span>{section.title}</span></div>}
              description={section.description}
              className={cn(section.className, "border border-black/20 dark:border-white/20 shadow-lg")}
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
                    className={cn(subjectData.cardClassName, "transition-shadow duration-200 hover:shadow-md")}
                    variant={subjectData.variant}
                  />
                ))}
              </div>
            </RecommendationSection>
          ))}
        </div>

        {/* Mobile/Tablet carousel */}
        <div className="lg:hidden">
          {sections.length > 0 ? (
            <div
              className="relative touch-pan-x "
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <AnimatePresence mode="wait" custom={lastDirection}>
                <motion.div
                  key={activeSection}
                  custom={lastDirection}
                  variants={{
                    enter: (direction) => ({
                      x: direction === 'right' ? '100%' : '-100%',
                      opacity: 0,
                    }),
                    center: {
                      x: 0,
                      opacity: 1,
                    },
                    exit: (direction) => ({
                      x: direction === 'right' ? '-100%' : '100%',
                      opacity: 0,
                    }),
                  }}
                  initial="enter"
                  animate={{
                    x: isDragging ? dragOffset : 0,
                    opacity: isDragging ? 0.8 : 1,
                    transition: { duration: 0 },
                  }}
                  exit="exit"
                  transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                  className="min-h-[300px] sm:min-h-[350px]"
                  drag={false}
                >
                  <RecommendationSection
                    title={<div className="flex items-center gap-2">{sections[activeSection].icon} <span>{sections[activeSection].title}</span></div>}
                    description={sections[activeSection].description}
                    className={cn(sections[activeSection].className, "border border-black/20 dark:border-white/20 shadow-lg")}
                    emptyMessage={sections[activeSection].emptyMessage}
                    isEmpty={sections[activeSection].subjects.length === 0}
                  >
                    <div className="space-y-2">
                      {sections[activeSection].subjects.map((subjectData) => (
                        <SubjectCard
                          key={subjectData.subject.id}
                          subject={subjectData.subject}
                          progress={subjectData.progress}
                          weightage={subjectData.subject.weightage}
                          status={subjectData.status}
                          statusColor={subjectData.statusColor}
                          behindTarget={subjectData.behindTarget}
                          className={cn(subjectData.cardClassName, "transition-shadow duration-200 hover:shadow-md")}
                          variant={subjectData.variant}
                        />
                      ))}
                    </div>
                  </RecommendationSection>
                </motion.div>
              </AnimatePresence>

            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No recommendations available
            </div>
          )}

          {sections.length > 0 && (
            <div className="mt-3 sm:mt-4 flex items-center justify-center gap-3 sm:gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-white/20 dark:bg-gray-800/20 backdrop-blur-md border border-black/20 dark:border-white/20 hover:bg-white/30 dark:hover:bg-gray-700/30 transition-colors"
                onClick={() => setIsAutoPlay(!isAutoPlay)}
                aria-label={isAutoPlay ? "Pause carousel" : "Play carousel"}
              >
                {isAutoPlay ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <div className="flex gap-1.5 sm:gap-2">
                {sections.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setActiveSection(index);
                      setLastDirection(index > activeSection ? 'right' : 'left');
                    }}
                    className={cn(
                      "h-1.5 sm:h-2 rounded-full transition-all duration-300",
                      activeSection === index
                        ? "w-6 sm:w-8 bg-primary"
                        : "w-1.5 sm:w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50",
                      "backdrop-blur-sm"
                    )}
                    aria-label={`Go to section ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}