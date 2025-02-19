import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Progress } from "@/types/progress"
import { ProgressIndicator } from "./progress-indicator"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface ProgressCardProps {
  progress: Progress;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  showToggle?: boolean;
  className?: string;
}

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3 }
  }
};

export function ProgressCard({ 
  progress, 
  isExpanded = false, 
  onToggleExpand, 
  showToggle = true,
  className 
}: ProgressCardProps) {
  return (
    <Card className={cn(
      "relative overflow-hidden border",
      "transition-all duration-300",
      className
    )}>
      {/* Glassmorphism Background Layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/70 to-background/60 backdrop-blur-xl backdrop-saturate-150 z-0" />
      <div className="absolute inset-0 bg-gradient-to-br from-background/10 to-background/5 z-0" />
      
      
      
      {/* Main Content */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 p-4 space-y-6"
      >
        {/* Header */}
        <motion.div 
          variants={itemVariants}
          className="flex items-center justify-between"
        >
          <h3 className="text-lg font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Your Progress
          </h3>
          {showToggle && onToggleExpand && (
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn(
                "h-8 w-8 p-0 relative overflow-hidden",
                "hover:bg-white/10 hover:text-foreground",
                "transition-all duration-300"
              )}
              onClick={onToggleExpand}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isExpanded ? 'up' : 'down'}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </motion.div>
              </AnimatePresence>
            </Button>
          )}
        </motion.div>

        {/* Overall Progress */}
        <motion.div
          variants={itemVariants}
          className=" backdrop-blur-sm rounded-lg"
        >
          <ProgressIndicator
            label="Overall"
            value={progress.overall}
            category="overall"
            size="md"
          />
        </motion.div>

        {/* Category Progress - 2x2 Grid */}
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-2 gap-4"
        >
          {[
            { label: "Learning", value: progress.learning, category: "learning" },
            { label: "Revision", value: progress.revision, category: "revision" },
            { label: "Practice", value: progress.practice, category: "practice" },
            { label: "Test", value: progress.test, category: "test" }
          ].map((item, index) => (
            <motion.div
              key={item.category}
              variants={itemVariants}
              custom={index}
              className="relative group"
            >
              <div className=" backdrop-blur-sm rounded-lg">
                <ProgressIndicator
                  label={item.label}
                  value={item.value}
                  category={item.category as keyof Progress}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </Card>
  );
}