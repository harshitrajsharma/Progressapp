"use client";

import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Basic",
    description: "Perfect for getting started",
    price: "Free",
    features: [
      "Foundation Level System",
      "Basic Progress Tracking",
      "Subject-wise Progress",
      "Topic-wise Learning",
      "Learning, Revision, Practice and Test Progress",
      "Test Performance",
      "Projected Marks based on Tests Data",
    ],
  },
  {
    name: "Pro",
    description: "Currently free for everyone",
    price: "Free",
    popular: true,
    features: [
      "Smart Recommendations based on your Progress and Weightage",
      "Advanced 10 Levels Foundation System",
      "Detailed Progress Analytics",
      "Overall Study Tracking",
      "Topic Mastery Tracking",
      "Performance Insights",
      "Weighatge v/s your Performance Difference Garph",
    ],
  },
  {
    name: "Teams",
    description: "Will be Available in the Future with New App",
    price: "Not Available",
    disabled: true,
    features: [
      "Team Management",
      "Collaborative Learning",
      "Group Analytics",
      "Team Progress Tracking",
      "Shared Resources",
      "Team Support",
      "And a lot More features"
    ],
  },
];

export function PricingSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section className="relative py-20 overflow-hidden" id="pricing">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 dark:bg-black/90" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl font-bold tracking-tight mb-4"
          >
            Simple{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
              Pricing
            </span>
          </motion.h2>
        </div>

        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto"
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: plan.name === "Pro" ? 0.2 : 0.1 }}
              className={cn(
                "relative p-6 rounded-2xl mx-6 md:mx-0 bg-black/10",
                "bg-gradient-to-br from-white/[0.05] to-white/[0.01]",
                "border border-white/10",
                "backdrop-blur-sm transition-all duration-300",
                plan.popular && !plan.disabled && "border-blue-500/50 scale-105 ",
                plan.disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="relative z-10">
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <p className="text-sm text-black/60 dark:text-white/60 mb-6">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                </div>

                <div className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <div>
                        {plan.disabled ? (
                          <X className="w-5 h-5 text-black/70 dark:text-white/50" />
                        ) : (
                          <Check className="w-5 h-5 text-blue-500" />
                        )}
                      </div>
                      <span className="text-sm text-black/70 dark:text-white/70">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  disabled={plan.disabled}
                  asChild
                >
                  <Link href="/auth/signin">
                    {plan.disabled ? "Coming Soon" : "Get Started"}
                  </Link>
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
} 