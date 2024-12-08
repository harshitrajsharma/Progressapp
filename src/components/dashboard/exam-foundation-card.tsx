"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExamFoundationResult } from "@/lib/calculations/types";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, TrendingUp, Target, BookOpen, Star, Trophy, Brain, Rocket, GraduationCap } from "lucide-react";
import { useEffect, useState } from "react";

interface ExamFoundationCardProps {
  result: ExamFoundationResult;
  examName: string;
}

// Level color mapping
const getLevelColor = (level: number) => {
  if (level <= 2) return "text-red-500";
  if (level <= 4) return "text-orange-500";
  if (level <= 6) return "text-yellow-500";
  if (level <= 8) return "text-emerald-500";
  return "text-purple-500";
};

const getLevelBgColor = (level: number) => {
  const getColor = (level: number) => {
    if (level <= 2) return "bg-gradient-to-r from-red-500/50 via-red-500/30 to-red-500/20";
    if (level <= 4) return "bg-gradient-to-r from-orange-500/50 via-orange-500/30 to-orange-500/20";
    if (level <= 6) return "bg-gradient-to-r from-yellow-500/50 via-yellow-500/30 to-yellow-500/20";
    if (level <= 8) return "bg-gradient-to-r from-emerald-500/50 via-emerald-500/30 to-emerald-500/20";
    return "bg-gradient-to-r from-purple-500/50 via-purple-500/30 to-purple-500/20";
  };

  return getColor(level);
};

const getLevelBorderColor = (level: number) => {
  if (level <= 2) return "border-red-500/20";
  if (level <= 4) return "border-orange-500/20";
  if (level <= 6) return "border-yellow-500/20";
  if (level <= 8) return "border-emerald-500/20";
  return "border-purple-500/20";
};

// Level icon mapping
const getLevelIcon = (level: number) => {
  if (level <= 2) return Brain;
  if (level <= 4) return Star;
  if (level <= 6) return Rocket;
  if (level <= 8) return GraduationCap;
  return Trophy;
};

// Add this new function to get stat-specific colors
const getStatColors = (statType: string) => {
  switch (statType.toLowerCase()) {
    case 'learning':
      return {
        text: 'text-blue-500',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20'
      };
    case 'revision':
      return {
        text: 'text-emerald-500',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20'
      };
    case 'practice':
      return {
        text: 'text-yellow-500',
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/20'
      };
    case 'test':
      return {
        text: 'text-purple-500',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/20'
      };
    default:
      return {
        text: 'text-muted-foreground',
        bg: 'bg-muted/10',
        border: 'border-muted/20'
      };
  }
};

export function ExamFoundationCard({ result, examName }: ExamFoundationCardProps) {
  const [currentProgress, setCurrentProgress] = useState(0);
  const [nextLevelProgress, setNextLevelProgress] = useState(0);
  const { currentLevel, nextLevel, progressToNextLevel, strengths, areasToImprove, overallProgress } = result;
  const levelColor = getLevelColor(currentLevel.level);
  const levelBgColor = getLevelBgColor(currentLevel.level);
  const levelBorderColor = getLevelBorderColor(currentLevel.level);
  const LevelIcon = getLevelIcon(currentLevel.level);

  // Reset and animate progress when values change
  useEffect(() => {
    setCurrentProgress(0);
    setNextLevelProgress(0);
    
    const timer = setTimeout(() => {
      setCurrentProgress(overallProgress);
      setNextLevelProgress(progressToNextLevel);
    }, 100);

    return () => clearTimeout(timer);
  }, [overallProgress, progressToNextLevel]);

  return (
    <Card className="col-span-4 bg-card">
      <CardHeader className="pb-2 sm:pb-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-0">
          <div>
            <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Target className={cn("h-5 w-5 sm:h-6 sm:w-6", levelColor)} />
              Foundation Level
            </CardTitle>
            <CardDescription className="mt-0.5 sm:mt-1">
              Your current preparation level for {examName}
            </CardDescription>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentLevel.level}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex flex-col items-start sm:items-end gap-1.5 sm:gap-2"
            >
              <Badge 
                variant="outline" 
                className={cn(
                  "text-base sm:text-lg px-3 sm:px-4 py-1 sm:py-1.5 font-semibold flex items-center gap-1.5 sm:gap-2",
                  levelColor,
                  levelBorderColor
                )}
              >
                <LevelIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Level {currentLevel.level}
              </Badge>
              <span className="text-xs sm:text-sm text-muted-foreground">
                {Math.round(overallProgress)}% Overall Progress
              </span>
            </motion.div>
          </AnimatePresence>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        {/* Level Title and Description */}
        <motion.div 
          className={cn(
            "relative p-3 sm:p-4 rounded-lg border bg-gradient-to-br",
            levelBgColor,
            levelBorderColor
          )}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex items-center gap-2">
              <h3 className={cn("text-lg sm:text-xl font-semibold", levelColor)}>
                {currentLevel.title}
              </h3>
              {currentLevel.level === 10 && (
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                </motion.div>
              )}
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm">{currentLevel.description}</p>
          </div>
        </motion.div>

        {/* Progress Section */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {/* Progress Bars */}
          <div className="space-y-4">
            <div>
              <h4 className="text-sm sm:text-base font-medium mb-3 sm:mb-4 flex items-center gap-2">
                <TrendingUp className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", levelColor)} />
                Progress Tracking
              </h4>
              <div className="space-y-3 sm:space-y-4">
                <div className="space-y-1.5 sm:space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground">Overall Mastery</span>
                    <span className="font-medium">{Math.round(overallProgress)}%</span>
                  </div>
                  <div className="h-2 sm:h-2.5 w-full bg-muted/30 rounded-full overflow-hidden">
                    <motion.div
                      className={cn(
                        "h-full rounded-full",
                        levelBgColor
                      )}
                      initial={{ width: 0 }}
                      animate={{ width: `${currentProgress}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </div>

                {nextLevel && (
                  <div className="space-y-1.5 sm:space-y-2">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-muted-foreground">Progress to Level {nextLevel.level}</span>
                      <span className="font-medium">{Math.round(progressToNextLevel)}%</span>
                    </div>
                    <div className="h-2 sm:h-2.5 w-full bg-muted/30 rounded-full overflow-hidden">
                      <motion.div
                        className={cn(
                          "h-full rounded-full",
                          levelBgColor
                        )}
                        initial={{ width: 0 }}
                        animate={{ width: `${nextLevelProgress}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        <div className=" border-t grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Insights */}
        {(strengths.length > 0 || areasToImprove.length > 0) && (
          <div className=" pt-3 sm:pt-4 mt-3 sm:mt-4">
            <h4 className="text-sm sm:text-base font-medium mb-2 sm:mb-3 flex items-center gap-2">
              <Star className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", levelColor)} />
              Performance Insights
            </h4>
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {strengths.length > 0 && (
                <div className="space-y-1.5 sm:space-y-2">
                  {strengths.map((strength, index) => (
                    <motion.div
                      key={index}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.1 * index }}
                      className="flex items-center gap-2 text-emerald-500 bg-emerald-500/5 p-1.5 sm:p-2 rounded-md"
                    >
                      <div className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-emerald-500" />
                      <span className="text-xs sm:text-sm">{strength}</span>
                    </motion.div>
                  ))}
                </div>
              )}
              {areasToImprove.length > 0 && (
                <div className="space-y-1.5 sm:space-y-2">
                  {areasToImprove.map((area, index) => (
                    <motion.div
                      key={index}
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.1 * index }}
                      className="flex items-center gap-2 text-amber-500 bg-amber-500/5 p-1.5 sm:p-2 rounded-md"
                    >
                      <div className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-amber-500" />
                      <span className="text-xs sm:text-sm">{area}</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        {/* Requirements */}
        <div className="pt-3 sm:pt-4 mt-3 sm:mt-4">
            <h4 className="text-sm sm:text-base font-medium mb-3 sm:mb-4 flex items-center gap-2">
              <BookOpen className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", levelColor)} />
              {nextLevel ? `Requirements for Level ${nextLevel.level}` : 'Current Requirements'}
            </h4>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {Object.entries(nextLevel ? nextLevel.requirements : currentLevel.requirements).map(([key, value], index) => {
                const statColors = getStatColors(key);
                return (
                  <motion.div
                    key={key}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 + (index * 0.1) }}
                    className={cn(
                      "p-2 sm:p-3 rounded-lg border",
                      statColors.bg,
                      statColors.border
                    )}
                  >
                    <span className={cn("text-xs sm:text-sm font-medium capitalize", statColors.text)}>
                      {key}
                    </span>
                    <div className={cn("text-lg sm:text-xl font-bold mt-0.5 sm:mt-1", statColors.text)}>
                      {value}%
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>


      </CardContent>
    </Card>
  );
} 