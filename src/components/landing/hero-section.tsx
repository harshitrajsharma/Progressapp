"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ExamFoundationCard } from "@/components/dashboard/exam-foundation-card";
import { dummyExamFoundation } from "@/lib/demo-data";

export default function HeroSection() {
  return (
    <div className="relative overflow-hidden bg-slate-950 min-h-[900px]">

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#2a2657a2_1px,transparent_1px),linear-gradient(to_bottom,#2a2657a2_1px,transparent_1px)] bg-[size:24px_24px]"
        style={{ maskImage: 'radial-gradient(circle at center, transparent, black)' }}
      />

      {/* Background gradient effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 dark:bg-black/40" />
        <div className="absolute -bottom-1/4 right-1/4 w-1/2 h-1/2 bg-indigo-500/20 rounded-full blur-[120px]" />
      </div>

      

      {/* Content */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[900px] max-h-screen flex-col items-center justify-center gap-12 py-12 lg:flex-row lg:justify-between lg:py-0">
          {/* Left side */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Your personalized path to exam success
            </h1>
            <p className="mt-6 max-w-xl text-lg text-gray-300">
              Track your progress, identify strengths and weaknesses, and get personalized recommendations to improve your exam preparation.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:gap-6">
              <Link
                href="/auth/signin"
                className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-sm font-medium text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Get started
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-white backdrop-blur hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Learn more
              </Link>
            </div>
            <p className="mt-6 text-sm text-gray-400">
              Made with the help of{" "}
              <Link href="https://anthropic.com/claude" className="text-blue-400 hover:text-blue-300">
                Claude 3.5 Sonnet
              </Link>{" "}
              in{" "}
              <Link href="https://cursor.sh" className="text-blue-400 hover:text-blue-300">
                Cursor IDE
              </Link>
            </p>
          </div>

          {/* Right side */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-lg lg:w-1/2"
          >
            <ExamFoundationCard result={dummyExamFoundation} examName="JEE Advanced" />
          </motion.div>
        </div>
      </div>
    </div>
  );
} 