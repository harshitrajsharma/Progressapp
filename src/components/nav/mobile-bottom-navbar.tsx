'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, ChartNoAxesCombined } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileBottomNavbar() {
  const pathname = usePathname();

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Subjects",
      href: "/subjects",
      icon: BookOpen,
    },
    {
      title: "Analytics",
      href: "/analytics",
      icon: ChartNoAxesCombined,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-14 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-t-blue-100/20 lg:hidden">
      <div className="grid h-full max-w-lg grid-cols-3 mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "inline-flex flex-col items-center justify-center transition-all duration-200",
                "relative overflow-hidden",
                isActive
                  ? "text-blue-500"
                  : "text-muted-foreground hover:text-blue-500/80"
              )}
            >
              <div
                className={cn(
                  "absolute inset-0 opacity-0 transition-opacity duration-200",
                  isActive && "opacity-10 bg-gradient-to-t from-blue-500 to-blue-300"
                )}
              />
              <Icon className={cn(
                "w-4 h-4 mb-0.5 transition-transform duration-200",
                isActive && "scale-110"
              )} />
              <span className={cn(
                "text-[10px] font-medium transition-all duration-200",
                isActive && "scale-105"
              )}>
                {item.title}
              </span>
              {isActive && (
                <span className="absolute bottom-0 left-1/2 w-12 h-0.5 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-blue-700" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
} 