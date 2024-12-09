"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";

export function LandingNavbar() {
  const { data: session } = useSession();

  return (
    <motion.nav 
      className="fixed top-0 w-full z-50 border-b bg-background/80 backdrop-blur-md"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 text-transparent bg-clip-text">
            Progress
          </span>
        </Link>

        <div className="hidden md:flex items-center space-x-6">
          <Link href="#features" className="text-muted-foreground hover:text-primary transition-colors">
            Features
          </Link>
          {/* <Link href="#testimonials" className="text-muted-foreground hover:text-primary transition-colors">
            Testimonials
          </Link> */}
          <Link href="#pricing" className="text-muted-foreground hover:text-primary transition-colors">
            Pricing
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <ThemeToggle />
          {session ? (
            <Button asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/signin">Get Started</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  );
} 