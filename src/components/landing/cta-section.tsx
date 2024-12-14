"use client";

import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function CTASection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 dark:bg-black/90" />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] dark:bg-blue-500/20 rounded-full blur-[120px]"
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative max-w-4xl mx-auto ">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            className={cn(
              "relative p-8 sm:p-12 rounded-2xl text-center",
              "bg-gradient-to-br from-white/[0.05] to-white/[0.01]",
              "border border-black/40 dark:border-white/10",
              "bg-black/20 backdrop-blur-xl",
              "backdrop-blur-sm"
            )}
          >
            {/* Floating sparkles icon */}
            <motion.div
              animate={{
                y: [-10, 10, -10],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -top-6 left-1/2 -translate-x-1/2"
            >
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg">
                <Sparkles className="w-6 h-6 " />
              </div>
            </motion.div>

            <div className="space-y-4 mb-8">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                Start Your{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
                  Learning Journey
                </span>
              </h2>
              <p className="text-base sm:text-lg text-black/60 dark:text-white/60 max-w-2xl mx-auto">
                Join our platform and master your subjects with our foundation level system. Get started for free today!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg"
                className="w-full sm:w-auto px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 group"
                asChild
              >
                <Link href="/auth/signin">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="w-full sm:w-auto px-8 border-black/20 dark:border-white/10 hover:black/10 dark:hover:bg-white/10"
                asChild
              >
                <Link href="#features">
                  Learn More
                </Link>
              </Button>
            </div>

            <p className="mt-6 text-sm text-black/40 dark:text-white/40">
              No credit card required. Start learning immediately.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 