'use client';

import { useState, useEffect } from "react";
import { Header } from "@/components/nav/header";
import { Sidebar } from "@/components/nav/sidebar";
import { MobileBottomNavbar } from "@/components/nav/mobile-bottom-navbar";
import { Footer } from "@/components/footer";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { DailyActivity } from "@prisma/client";
import { SubjectWithRelations } from "@/lib/calculations/types";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { data: session } = useSession();
  const [userData, setUserData] = useState<{
    examDate: Date;
    dailyActivities: DailyActivity[];
    subjects: SubjectWithRelations[];
  } | null>(null);

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

  useEffect(() => {
    async function fetchUserData() {
      if (session?.user?.email) {
        try {
          const response = await fetch('/api/user/dashboard');
          const data = await response.json();
          if (data.user) {
            setUserData({
              examDate: new Date(data.user.examDate),
              dailyActivities: data.user.dailyActivities || [],
              subjects: data.user.subjects || []
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    }

    fetchUserData();
  }, [session]);

  return (
    <div className="flex relative h-screen overflow-hidden">
      {/* Grid Pattern */}
      <div
          className="absolute -z-20 inset-0 bg-[linear-gradient(to_right,#5557e917_1px,transparent_1px),linear-gradient(to_bottom,#80808015_1px,transparent_1px)] bg-[size:32px_32px]"
          style={{
            maskImage: 'radial-gradient(circle at center, black, transparent)',
            WebkitMaskImage: 'radial-gradient(circle at center, black, transparent)'
          }}
        />
      <aside className={cn(
        "hidden md:flex h-screen flex-col border-r bg-background transition-all duration-300 sticky top-0",
        isCollapsed ? "w-[80px]" : "w-[280px]"
      )}>
        <Sidebar
          isCollapsed={isCollapsed}
          examDate={userData?.examDate || new Date()}
          dailyActivities={userData?.dailyActivities || []}
          subjects={userData?.subjects || []}
        />
      </aside>
      <div className="flex-1 flex flex-col h-screen overflow-auto">
        <Header />
        <main className="flex-1 p-8 pb-20 md:pb-8">
          {children}
        </main>
        <Footer />
        <MobileBottomNavbar />
      </div>
    </div>
  );
} 