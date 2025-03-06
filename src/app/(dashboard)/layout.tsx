'use client';

import { useState, useEffect } from "react";
import { Header } from "@/components/nav/header";
import { Sidebar } from "@/components/nav/sidebar";
import { MobileBottomNavbar } from "@/components/nav/mobile-bottom-navbar";
import { Footer } from "@/components/nav/footer";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { DailyActivity } from "@prisma/client";
import { SubjectWithRelations } from "@/lib/calculations/types";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { data: session } = useSession();
  const [userData, setUserData] = useState<{
    examDate: Date;
    dailyActivities: DailyActivity[];
    subjects: SubjectWithRelations[];
  } | null>(null);

  // Sidebar collapse state management
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

  // User data fetching
  useEffect(() => {
    async function fetchUserData() {
      if (!session?.user?.email) return;

      try {
        const response = await fetch('/api/user/dashboard');
        if (!response.ok) throw new Error('Failed to fetch user data');
        const data = await response.json();
        if (data.user) {
          setUserData({
            examDate: new Date(data.user.examDate),
            dailyActivities: data.user.dailyActivities || [],
            subjects: data.user.subjects || [],
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }

    fetchUserData();
  }, [session]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      {/* Grid Pattern Background */}
      <div
        className="fixed inset-0 -z-20 bg-[linear-gradient(to_right,#5557e917_1px,transparent_1px),linear-gradient(to_bottom,#5557e917_1px,transparent_1px)] bg-[size:32px_32px]"
        style={{
          maskImage: 'radial-gradient(circle at center, black, transparent)',
          WebkitMaskImage: 'radial-gradient(circle at center, black, transparent)',
        }}
      />

      <div className="flex flex-1 w-full">
        {/* Sidebar */}
        <aside
          className={cn(
            "hidden lg:flex h-screen flex-col border-r border-black/20 dark:border-white/20 bg-background transition-all duration-300 sticky top-0",
            isCollapsed ? "w-[80px]" : "w-[280px]"
          )}
        >
          <Sidebar
            isCollapsed={isCollapsed}
            examDate={userData?.examDate || new Date()}
            dailyActivities={userData?.dailyActivities || []}
            subjects={userData?.subjects || []}
          />
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-screen w-full">
          <Header />
          <main className="flex-1 p-4 sm:p-6 md:p-8 pb-20 md:pb-8 max-w-screen-2xl w-full mx-auto">
            {children}
          </main>
          <Footer />
          <MobileBottomNavbar />
        </div>
      </div>
    </div>
  );
}