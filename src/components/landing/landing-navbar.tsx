"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useSession } from "next-auth/react";
import { Menu } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export function LandingNavbar() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav 
      ref={navRef}
      className={`fixed top-0 w-full z-50 transition-all duration-300 
        ${scrolled || isOpen ? 'bg-white/10 dark:bg-gray-950/10 backdrop-blur-xl shadow-lg' : 'bg-transparent'}`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <span className="text-2xl font-bold bg-gradient-to-r from-primary via-purple-500 to-blue-500 bg-clip-text text-transparent bg-300% animate-gradient">
              Progress Tracking
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <div className="bg-background/50 backdrop-blur-sm px-4 py-2 rounded-full border border-border/50">
              <Link 
                href="#features" 
                className="px-4 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
              >
                Features
              </Link>
              <Link 
                href="#pricing" 
                className="px-4 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
              >
                Pricing
              </Link>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            <div className="group bg-background/50 backdrop-blur-sm p-2 rounded-xl border border-border/50 hover:bg-background/80 transition-all">
              <div>
                <ThemeToggle />
              </div>
            </div>
            
            {session ? (
              <Button 
                asChild
                className="rounded-full px-6 bg-gradient-to-r from-primary via-purple-500 to-blue-500 hover:opacity-90"
              >
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  asChild 
                  className="rounded-full"
                >
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
                <Button 
                  asChild
                  className="rounded-full px-6 bg-gradient-to-r from-primary via-purple-500 to-blue-500 hover:opacity-90"
                >
                  <Link href="/auth/signin">Get Started</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button 
              variant="outline" 
              size="icon"
              className={`md:hidden rounded-full transition-colors ${isOpen ? 'bg-primary/10 border-primary/20' : ''}`}
              onClick={() => setIsOpen(!isOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 px-2 bg-background/50 backdrop-blur-md rounded-2xl mt-2 border border-border/50 animate-in slide-in-from-top duration-300">
            <div className="flex flex-col space-y-2">
              <Link 
                href="#features" 
                className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                onClick={() => setIsOpen(false)}
              >
                Features
              </Link>
              <Link 
                href="#pricing" 
                className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                onClick={() => setIsOpen(false)}
              >
                Pricing
              </Link>
              {!session && (
                <Link 
                  href="/auth/signin" 
                  className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                  onClick={() => setIsOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}