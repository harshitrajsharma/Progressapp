"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { ArrowRight, Brain, LineChart, Target } from "lucide-react";
import { useRouter } from "next/navigation";

const featureCardVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (index: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      delay: index * 0.2,
      ease: "easeOut"
    }
  })
};

const iconVariants = {
  hidden: { scale: 0.5, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

export default function HeroSection() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/auth/signin");
  };

  return (
    <div className="relative dark:bg-black bg-white min-h-screen w-full flex items-center justify-center overflow-hidden py-10 sm:py-16 lg:py-20">
      {/* Animated background gradients */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 dark:bg-black" />
        {/* Floating gradient orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-20 -left-32 w-64 sm:w-96 h-64 sm:h-96 bg-purple-600/30 rounded-full blur-[80px] sm:blur-[128px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-20 -right-32 w-64 sm:w-96 h-64 sm:h-96 bg-blue-600/30 rounded-full blur-[80px] sm:blur-[128px]"
        />
        {/* Additional floating colors */}
        <motion.div
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [-50, 50, -50],
            y: [50, -30, 50],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/3 left-1/3 w-64 sm:w-80 h-64 sm:h-80 bg-indigo-500/20 rounded-full blur-[96px]"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
            x: [30, -30, 30],
            y: [-30, 50, -30],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-1/3 right-1/3 w-64 sm:w-80 h-64 sm:h-80 bg-cyan-500/20 rounded-full blur-[96px]"
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-16 xl:px-24 max-w-[1400px]">
        <div className="flex flex-col-reverse lg:flex-row gap-8 lg:gap-20 items-center">
          {/* Left Column - Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center lg:text-left space-y-6 sm:space-y-8"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight">
              Master Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-500 to-indigo-500 animate-gradient">
                Learning Journey
              </span>
            </h1>

            <p className="text-base text-center lg:text-left sm:text-lg lg:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0">
              Track progress, set goals, and achieve mastery with our intelligent learning platform. <br /> <br />
              Made with the help of <br /> <a target="_blank" href="https://claude.ai/" className="underline hover:text-blue-500 text-red-500 font-bold">claude 3.5 Sonnet</a> in <a target="_blank" href="https://www.cursor.com/" className="underline hover:text-blue-500 text-red-500 font-bold">Cursor IDE</a>.
            </p>

            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center lg:justify-start gap-4">
              {!session && (
                <Button
                  size="lg"
                  className="group h-12 px-6 sm:px-8 w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  onClick={handleGetStarted}
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              )}
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-6 sm:px-8 w-full sm:w-auto border-white/20 hover:bg-white/10"
              >
                Learn More
              </Button>
            </div>

            {/* Stats
            <div className="md:grid grid-cols-1 hidden gap-4 sm:gap-8 pt-4 max-w-2xl mx-auto lg:mx-0">
              {[
                { value: "Sign up Now", label: "Active Users" },
                { value: "Be the First one to Know", label: "Success Rate" }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="text-center lg:text-left"
                >
                  <div className=" bg-blue-500/10 p-4 rounded-lg">
                    <div className="text-xs sm:text-sm ">{stat.label}</div>
                    <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text">
                      {stat.value}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div> */}
          </motion.div>

          {/* Right Column - Feature Cards */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative max-w-lg mx-auto my-12 lg:my-0 lg:mx-0 w-full lg:ml-auto"
          >
            <div className="grid gap-4 sm:gap-6">
              <FeatureCard
                icon={Brain}
                title="Smart Learning"
                description="AI-powered study recommendations"
                className="bg-gradient-to-r from-purple-900/50 to-purple-800/30 hover:from-purple-800/50 hover:to-purple-700/30"
                index={0}
              />
              <FeatureCard
                icon={Target}
                title="Goal Tracking"
                description="Set and achieve your targets"
                className="bg-gradient-to-r from-blue-900/50 to-blue-800/30 hover:from-blue-800/50 hover:to-blue-700/30"
                index={1}
              />
              <FeatureCard
                icon={LineChart}
                title="Progress Analytics"
                description="Visualize your improvement"
                className="bg-gradient-to-r from-indigo-900/50 to-indigo-800/30 hover:from-indigo-800/50 hover:to-indigo-700/30"
                index={2}
              />
            </div>

            {/* Decorative elements */}
            <div className="absolute inset-0 -z-10 blur-[100px] opacity-25">
              <div className="absolute top-1/3 -left-4 w-48 sm:w-72 h-48 sm:h-72 bg-purple-500 rounded-full mix-blend-screen animate-pulse" />
              <div className="absolute top-1/2 right-0 w-48 sm:w-72 h-48 sm:h-72 bg-blue-500 rounded-full mix-blend-screen animate-pulse" />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  className,
  index
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  className?: string;
  index: number;
}) {
  return (
    <motion.div
      variants={featureCardVariants}
      initial="hidden"
      animate="visible"
      custom={index}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      className={`p-4 sm:p-6 rounded-2xl border border-white/10 backdrop-blur-sm transition-all duration-300 ${className}`}
    >
      <div className="flex items-start gap-4">
        <motion.div
          variants={iconVariants}
          initial="hidden"
          animate="visible"
          className="p-2 rounded-lg bg-white/10 ring-1 ring-white/20"
        >
          <Icon className="w-4 sm:w-5 h-4 sm:h-5 text-blue-700" />
        </motion.div>
        <div>
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 + 0.3 }}
            className="font-semibold text-sm sm:text-base text-blue-700"
          >
            {title}
          </motion.h3>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.2 + 0.4 }}
            className="text-xs sm:text-sm "
          >
            {description}
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
} 