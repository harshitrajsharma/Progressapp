"use client";

import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    name: "Arjun Patel",
    role: "IIT JEE Aspirant",
    image: "/testimonials/arjun.jpg",
    content: "The foundation level system helped me structure my JEE preparation perfectly. Great for Physics and Mathematics!",
    rating: 5,
  },
  {
    name: "Priya Sharma",
    role: "NEET Student",
    image: "/testimonials/priya.jpg",
    content: "Perfect for managing Biology topics. The systematic approach helped me master NCERT concepts thoroughly.",
    rating: 5,
  },
  {
    name: "Rahul Verma",
    role: "GATE Aspirant",
    image: "/testimonials/rahul.jpg",
    content: "The progress tracking feature helped me identify my weak areas in Computer Science. Highly effective!",
    rating: 5,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const testimonialVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export function TestimonialSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-black/90" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[120px]" />
      </div>

      <motion.div
        ref={ref}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={containerVariants}
        className="container mx-auto px-4 sm:px-6 lg:px-8"
      >
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <motion.h2
            variants={testimonialVariants}
            className="text-3xl sm:text-4xl font-bold tracking-tight mb-4"
          >
            Student{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
              Success Stories
            </span>
          </motion.h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.name}
              variants={testimonialVariants}
              className={cn(
                "relative p-6 rounded-2xl",
                "bg-gradient-to-br from-white/[0.05] to-white/[0.01]",
                "border border-white/10 hover:border-white/20",
                "backdrop-blur-sm transition-all duration-300",
                "group hover:translate-y-[-2px]"
              )}
            >
              {/* Rating */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-yellow-500 text-yellow-500"
                  />
                ))}
              </div>

              {/* Content */}
              <blockquote className="mb-6">
                <p className="text-base text-white/70 group-hover:text-white/80 transition-colors">
                  "{testimonial.content}"
                </p>
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-4">
                <Avatar className="w-10 h-10 border border-white/10">
                  <AvatarImage src={testimonial.image} alt={testimonial.name} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-white group-hover:text-white/90">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-white/60 group-hover:text-white/70">
                    {testimonial.role}
                  </div>
                </div>
              </div>

              {/* Decorative gradient */}
              <div className="absolute inset-0 -z-10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl" />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
} 