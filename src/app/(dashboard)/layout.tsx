'use client';

import { useState, useEffect } from "react";
import { Header } from "@/components/nav/header";
import { Sidebar } from "@/components/nav/sidebar";
import { MobileBottomNavbar } from "@/components/nav/mobile-bottom-navbar";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    try {
      const savedState = localStorage.getItem('sidebarCollapsed');
      setIsCollapsed(savedState === 'true');

      const handleStorage = () => {
        const newState = localStorage.getItem('sidebarCollapsed') === 'true';
        setIsCollapsed(newState);
      };

      window.addEventListener('storage', handleStorage);
      return () => window.removeEventListener('storage', handleStorage);
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    }
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className={cn(
        "hidden md:flex h-screen flex-col border-r bg-background transition-all duration-300 sticky top-0",
        isCollapsed ? "w-[80px]" : "w-[280px]"
      )}>
        <Sidebar isCollapsed={isCollapsed} />
      </aside>
      <div className="flex-1 flex flex-col h-screen overflow-auto">
        <Header />
        <main className="flex-1 p-8 pb-20 md:pb-8">
          {children}
        </main>
        <MobileBottomNavbar />
      </div>
    </div>
  );
} 