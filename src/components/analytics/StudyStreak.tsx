import { Card } from "@/components/ui/card";
import { Flame } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StudyStreakProps {
  streak: number;
  className?: string;
}

export function StudyStreak({ streak, className }: StudyStreakProps) {
  return (
    <Card className={cn("p-4 relative overflow-hidden", className)}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3"
      >
        <div className="relative">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Flame className="h-8 w-8 text-orange-500" />
          </motion.div>
          {streak > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
              }}
              className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-xs font-bold"
            >
              {streak}
            </motion.div>
          )}
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold">Study Streak</h3>
          <p className="text-sm text-muted-foreground">
            {streak === 0
              ? "Start your streak today!"
              : streak === 1
              ? "1 day streak! Keep it up!"
              : `${streak} days streak! You're on fire! 🔥`}
          </p>
        </div>
      </motion.div>
      
      {/* Background effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent"
        animate={{
          opacity: [0.5, 0.3, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </Card>
  );
} 