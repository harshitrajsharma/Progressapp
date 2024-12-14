"use client";

import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  Brain,
  Target,
  BarChart3,
  BookOpen,
  Clock,
  Layers
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  hoverColor: string;
  delay: number;
}

const features: Feature[] = [
  {
    icon: Brain,
    title: "Foundation Level",
    description:
      "Master core concepts with our structured foundation level system. Perfect for building strong basics.",
    color: "from-purple-600 to-indigo-600",
    hoverColor: "group-hover:from-purple-700 group-hover:to-indigo-700",
    delay: 0.2,
  },
  {
    icon: Target,
    title: "Smart Goals",
    description:
      "Set and track personalized learning goals with our SMART goal-setting framework.",
    color: "from-blue-600 to-cyan-600",
    hoverColor: "group-hover:from-blue-700 group-hover:to-cyan-700",
    delay: 0.3,
  },
  {
    icon: BarChart3,
    title: "Progress Analytics",
    description:
      "Track your learning journey with detailed progress bars and performance metrics.",
    color: "from-cyan-600 to-teal-600",
    hoverColor: "group-hover:from-cyan-700 group-hover:to-teal-700",
    delay: 0.4,
  },
  {
    icon: BookOpen,
    title: "Study Resources",
    description:
      "Access curated study materials and resources tailored to your foundation level.",
    color: "from-teal-600 to-green-600",
    hoverColor: "group-hover:from-teal-700 group-hover:to-green-700",
    delay: 0.5,
  },
  {
    icon: Clock,
    title: "Time Management",
    description:
      "Plan your study sessions effectively with our integrated time tracking tools.",
    color: "from-green-600 to-emerald-600",
    hoverColor: "group-hover:from-green-700 group-hover:to-emerald-700",
    delay: 0.6,
  },
  {
    icon: Layers,
    title: "Topic Mastery",
    description:
      "Break down complex subjects into manageable topics and track mastery levels.",
    color: "from-emerald-600 to-blue-600",
    hoverColor: "group-hover:from-emerald-700 group-hover:to-blue-700",
    delay: 0.7,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const featureVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay,
      ease: "easeOut",
    },
  }),
};

const iconVariants = {
  hidden: { scale: 0, rotate: -45 },
  visible: {
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 150,
      damping: 15,
    },
  },
  hover: {
    scale: 1.1,
    rotate: 5,
    transition: {
      duration: 0.2,
    },
  },
};

export function FeatureSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 dark:bg-black/90" />
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-purple-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-blue-500/20 rounded-full blur-[120px]" />
      </div>

      <motion.div
        ref={ref}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={containerVariants}
        className="container mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="text-center text-black dark:text-white max-w-3xl mx-auto mb-16 space-y-4">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight"
          >
            Features to Enhance Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-500 to-indigo-500">
              Learning Experience
            </span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-base sm:text-lg text-muted-foreground"
          >
            Tools and features designed to help you master your subjects effectively
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              custom={feature.delay}
              variants={featureVariants}
              whileHover="hover"
              className={cn(
                "group relative p-6 rounded-2xl border border-black/40 dark:border-white/10",
                "backdrop-blur-sm transition-all duration-300",
                "hover:border-white/20 hover:translate-y-[-2px] hover:shadow-xl",
                "bg-gradient-to-br from-white/[0.05] to-white/[0.01]"
              )}
            >
              <div className="relative z-10 flex flex-col h-full">
                <motion.div
                  variants={iconVariants}
                  className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center mb-4",
                    "bg-gradient-to-br shadow-lg",
                    feature.color
                  )}
                >
                  <feature.icon className="w-6 h-6" />
                </motion.div>
                <h3 className="text-xl font-semibold mb-2 dark:group-hover:text-white/90">
                  {feature.title}
                </h3>
                <p className=" dark:group-hover:text-white/70 text-sm sm:text-base">
                  {feature.description}
                </p>
              </div>

              {/* Gradient hover effect */}
              <div className="absolute inset-0 -z-10 rounded-2xl transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                <div className={cn(
                  "absolute inset-0 rounded-2xl bg-gradient-to-br opacity-20",
                  feature.color,
                  feature.hoverColor
                )} />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
} 