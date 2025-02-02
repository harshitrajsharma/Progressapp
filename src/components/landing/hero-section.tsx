"use client";

import React from "react";
import Link from "next/link";
import { ExamFoundationCard } from "@/components/dashboard/exam-foundation-card";
import { dummyExamFoundation } from "@/lib/demo-data";

export default function HeroSection() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90">
      {/* Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/4 top-1/4 w-1/2 h-1/2 bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute -right-1/4 top-1/2 w-1/2 h-1/2 bg-purple-500/20 rounded-full blur-[120px]" />
        <div className="absolute left-1/4 bottom-0 w-1/2 h-1/2 bg-indigo-500/20 rounded-full blur-[120px]" />
      </div>

      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#80808015_1px,transparent_1px),linear-gradient(to_bottom,#80808015_1px,transparent_1px)] bg-[size:32px_32px]"
        style={{ 
          maskImage: 'radial-gradient(circle at center, black, transparent)',
          WebkitMaskImage: 'radial-gradient(circle at center, black, transparent)'
        }}
      />

      {/* Content */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-screen flex-col items-center justify-center gap-16 py-40 md:py-12 lg:flex-row lg:justify-between lg:py-0">
          {/* Left side */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left lg:w-1/2">
            <div className="p-2 bg-background/50 backdrop-blur-sm rounded-2xl border border-border/50 mb-8">
              <span className="bg-gradient-to-r from-primary via-purple-500 to-blue-500 bg-clip-text text-transparent px-4 py-2 text-sm font-medium">
                Supercharge your exam preparation
              </span>
            </div>
            
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/80 bg-clip-text text-transparent sm:text-6xl">
              Your personalized path to exam success
            </h1>
            
            <p className="mt-6 text-lg text-muted-foreground backdrop-blur-sm">
              Track your progress, identify strengths and weaknesses, and get personalized recommendations to improve your exam preparation.
            </p>

            <p className="mt-6 text-lg text-muted-foreground backdrop-blur-sm">
              <b>NOTE:</b> Just a CRUD app with calculation logic based on user's progress data. <br />
            </p>
            
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:gap-6">
              <Link
                href="/auth/signin"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-primary via-purple-500 to-blue-500 px-8 py-3 text-base font-medium text-white shadow-lg hover:opacity-90 transition-all"
              >
                Get started
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center justify-center rounded-full bg-background/50 backdrop-blur-sm px-8 py-3 text-base font-medium border border-border/50 hover:bg-background/80 transition-all"
              >
                Learn more
              </Link>
            </div>
            
            <div className="mt-8 p-4 bg-background/50 backdrop-blur-sm rounded-2xl border border-border/50">
              <p className="text-sm text-muted-foreground">
                Made with the help of{" "}
                <Link href="https://anthropic.com/claude" target="_blank" className="text-primary hover:text-primary/80 transition-colors">
                  Claude 3.5 Sonnet
                </Link>{" "}
                in{" "}
                <Link href="https://cursor.com" target="_blank" className="text-primary hover:text-primary/80 transition-colors">
                  Cursor IDE
                </Link>
              </p>
            </div>
          </div>

          {/* Right side */}
          <div className="w-full lg:w-1/2 max-w-lg">
            <div className="transform transition-all hover:scale-[1.02] hover:shadow-xl">
              <div className="p-1 bg-gradient-to-r from-primary via-purple-500 to-blue-500 rounded-2xl">
                <div className="bg-background/95 backdrop-blur-xl p-1 rounded-2xl">
                  <ExamFoundationCard result={dummyExamFoundation} examName="JEE Advanced" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}