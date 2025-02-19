import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, Target, BookOpen, Star, Trophy, Brain, Rocket, GraduationCap, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface Level {
  level: number;
  title: string;
  description: string;
  requirements: Record<string, number>;
}

interface ExamResult {
  currentLevel: Level;
  nextLevel: Level | null;
  progressToNextLevel: number;
  strengths: string[];
  areasToImprove: string[];
  overallProgress: number;
}

interface ExamFoundationCardProps {
  result: ExamResult;
  examName: string;
}

type StatType = 'learning' | 'revision' | 'practice' | 'test';

const getLevelColor = (level: number): string => {
  if (level <= 2) return "text-red-600";
  if (level <= 4) return "text-orange-600";
  if (level <= 6) return "text-yellow-600";
  if (level <= 8) return "text-emerald-600";
  return "text-purple-600";
};

const getLevelBgColor = (level: number): string => {
  if (level <= 2) return "bg-gradient-to-r from-red-600/40 via-red-600/20 dark:from-red-600/20 dark:via-red-600/10 to-transparent";
  if (level <= 4) return "bg-gradient-to-r from-orange-600/40 via-orange-600/20 dark:from-orange-600/20 dark:via-orange-600/10 to-transparent";
  if (level <= 6) return "bg-gradient-to-r from-yellow-600/40 via-yellow-600/20 dark:from-yellow-600/20 dark:via-yellow-600/10 to-transparent";
  if (level <= 8) return "bg-gradient-to-r from-emerald-600/40 via-emerald-600/20 dark:from-emerald-600/20 dark:via-emerald-600/10 to-transparent";
  return "bg-gradient-to-r from-purple-600/20 via-purple-600/10 to-transparent";
};

const getLevelBorderColor = (level: number): string => {
  if (level <= 2) return "border-red-600/20";
  if (level <= 4) return "border-orange-600/20";
  if (level <= 6) return "border-yellow-600/20";
  if (level <= 8) return "border-emerald-600/20";
  return "border-purple-600/20";
};

const getLevelIcon = (level: number): React.ElementType => {
  if (level <= 2) return Brain;
  if (level <= 4) return Star;
  if (level <= 6) return Rocket;
  if (level <= 8) return GraduationCap;
  return Trophy;
};

const getStatColors = (statType: StatType): { text: string; bg: string; border: string } => {
  const types: Record<StatType | 'default', { text: string; bg: string; border: string }> = {
    learning: { text: 'text-blue-600', bg: 'bg-blue-600/5', border: 'border-blue-600/10' },
    revision: { text: 'text-emerald-600', bg: 'bg-emerald-600/5', border: 'border-emerald-600/10' },
    practice: { text: 'text-yellow-600', bg: 'bg-yellow-600/5', border: 'border-yellow-600/10' },
    test: { text: 'text-purple-600', bg: 'bg-purple-600/5', border: 'border-purple-600/10' },
    default: { text: 'text-muted-foreground', bg: 'bg-muted/5', border: 'border-muted/10' }
  };
  
  return types[statType.toLowerCase() as StatType] || types.default;
};

export function ExamFoundationCard({ result, examName }: ExamFoundationCardProps): JSX.Element {
  const [isExpanded, setIsExpanded] = useState(true);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [nextLevelProgress, setNextLevelProgress] = useState(0);
  const { currentLevel, nextLevel, progressToNextLevel, strengths, areasToImprove, overallProgress } = result;
  const levelColor = getLevelColor(currentLevel.level);
  const levelBgColor = getLevelBgColor(currentLevel.level);
  const levelBorderColor = getLevelBorderColor(currentLevel.level);
  const LevelIcon = getLevelIcon(currentLevel.level);

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
    <Card className="col-span-4 relative overflow-hidden border-0 shadow-lg">
      {/* Glassmorphism Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/70 to-background/60 backdrop-blur-xl backdrop-saturate-150 z-0" />
      <div className="absolute inset-0 bg-gradient-to-br from-background/10 to-background/5 z-0" />
      <div className={cn("absolute inset-0 opacity-20 z-0", levelBgColor)} />
      
      {/* Animated Border Effect */}
      <div className="absolute inset-0 rounded-lg border border-white/10 backdrop-blur-3xl z-0" />
      
      {/* Content Container */}
      <div className="relative z-10">
        <CardHeader className="pb-2">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row sm:items-start justify-between gap-3"
          >
            <div className="space-y-1">
              <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <Target className={cn("h-5 sm:h-6 w-5 sm:w-6", levelColor)} />
                <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Foundation Level
                </span>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-muted-foreground/80">
                Your current preparation level for {examName}
              </CardDescription>
            </div>
            
            <motion.div
              layout
              className="flex flex-col items-start sm:items-end gap-2"
            >
              <Badge 
                variant="outline" 
                className={cn(
                  "text-base sm:text-lg px-3 sm:px-4 py-1 sm:py-1.5 font-semibold flex items-center gap-2 backdrop-blur-md",
                  levelColor,
                  levelBorderColor
                )}
              >
                <LevelIcon className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
                Level {currentLevel.level}
              </Badge>
              <span className="text-xs sm:text-sm text-muted-foreground/80">
                {Math.round(overallProgress)}% Complete
              </span>
            </motion.div>
          </motion.div>
        </CardHeader>

        <CardContent className="space-y-6">
          <motion.div 
            layout
            className={cn(
              "p-3 sm:p-4 rounded-lg border backdrop-blur-lg",
              levelBgColor,
              levelBorderColor
            )}
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className={cn("text-lg sm:text-xl font-semibold", levelColor)}>
                  {currentLevel.title}
                </h3>
                {currentLevel.level === 10 && (
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <Sparkles className="h-4 sm:h-5 w-4 sm:w-5 text-purple-600" />
                  </motion.div>
                )}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground/80">{currentLevel.description}</p>
            </div>
          </motion.div>

          <motion.div layout className="space-y-6">
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full flex items-center justify-between text-xs sm:text-sm font-medium text-muted-foreground/80 hover:text-muted-foreground transition-colors"
            >
              <span>Detailed Progress</span>
              <motion.div
                animate={{ rotate: isExpanded ? 0 : 180 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronUp className="h-4 w-4" />
              </motion.div>
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6 overflow-hidden"
                >
                  <div className="space-y-4">
                    <h4 className="text-sm sm:text-base font-medium flex items-center gap-2">
                      <TrendingUp className={cn("h-3.5 sm:h-4 w-3.5 sm:w-4", levelColor)} />
                      Progress Tracking
                    </h4>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-muted-foreground/80">Overall Mastery</span>
                          <span className="font-medium">{Math.round(overallProgress)}%</span>
                        </div>
                        <div className="h-2 sm:h-2.5 w-full bg-muted/10 rounded-full overflow-hidden backdrop-blur-md">
                          <motion.div
                            className={cn("h-full rounded-full", levelBgColor)}
                            initial={{ width: 0 }}
                            animate={{ width: `${currentProgress}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                          />
                        </div>
                      </div>

                      {nextLevel && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs sm:text-sm">
                            <span className="text-muted-foreground/80">Progress to Level {nextLevel.level}</span>
                            <span className="font-medium">{Math.round(progressToNextLevel)}%</span>
                          </div>
                          <div className="h-2 sm:h-2.5 w-full bg-muted/10 rounded-full overflow-hidden backdrop-blur-md">
                            <motion.div
                              className={cn("h-full rounded-full", levelBgColor)}
                              initial={{ width: 0 }}
                              animate={{ width: `${nextLevelProgress}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {(strengths.length > 0 || areasToImprove.length > 0) && (
                      <div>
                        <h4 className="text-sm sm:text-base font-medium mb-3 flex items-center gap-2">
                          <Star className={cn("h-3.5 sm:h-4 w-3.5 sm:w-4", levelColor)} />
                          Performance Insights
                        </h4>
                        <div className="space-y-3">
                          {strengths.map((strength: string, index: number) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.1 }}
                              className="flex items-center gap-2 text-emerald-600 bg-emerald-600/5 backdrop-blur-lg p-2 rounded-md border border-emerald-600/10"
                            >
                              <div className="h-1 sm:h-1.5 w-1 sm:w-1.5 rounded-full bg-emerald-600" />
                              <span className="text-xs sm:text-sm">{strength}</span>
                            </motion.div>
                          ))}
                          {areasToImprove.map((area: string, index: number) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: (strengths.length + index) * 0.1 }}
                              className="flex items-center gap-2 text-amber-600 bg-amber-600/5 backdrop-blur-lg p-2 rounded-md border border-amber-600/10"
                            >
                              <div className="h-1 sm:h-1.5 w-1 sm:w-1.5 rounded-full bg-amber-600" />
                              <span className="text-xs sm:text-sm">{area}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="text-sm sm:text-base font-medium mb-3 flex items-center gap-2">
                        <BookOpen className={cn("h-3.5 sm:h-4 w-3.5 sm:w-4", levelColor)} />
                        {nextLevel ? `Requirements for Level ${nextLevel.level}` : 'Current Requirements'}
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(nextLevel ? nextLevel.requirements : currentLevel.requirements).map(([key, value], index) => {
                          const statColors = getStatColors(key as StatType);
                          return (
                            <motion.div
                              key={key}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.1 }}
                              className={cn(
                                "p-2 sm:p-3 rounded-lg border relative overflow-hidden",
                                "transition-all duration-300 hover:scale-[1.02]",
                                statColors.bg,
                                statColors.border
                              )}
                            >
                              {/* Glassmorphism overlay */}
                              <div className="absolute inset-0 backdrop-blur-lg backdrop-saturate-150 mix-blend-soft-light" />
                              
                              <div className="relative z-10">
                                <span className={cn(
                                  "text-xs sm:text-sm font-medium capitalize",
                                  statColors.text
                                )}>
                                  {key}
                                </span>
                                <div className={cn(
                                  "text-lg sm:text-xl font-bold mt-1",
                                  statColors.text
                                )}>
                                  {value}%
                                </div>
                              </div>
                              
                              {/* Decorative gradient */}
                              <div className={cn(
                                "absolute inset-0 opacity-20 mix-blend-overlay",
                                "bg-gradient-to-br from-white/20 to-transparent"
                              )} />
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </CardContent>
      </div>
      
      {/* Additional decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-b from-white/5 to-transparent rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-t from-white/5 to-transparent rounded-full blur-2xl -z-10" />
    </Card>
  );
}