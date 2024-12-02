'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import {
  BarChart,
  BookOpen,
  GraduationCap,
  Menu,
  Settings,
  Target,
  ChevronLeft,
  X,
} from "lucide-react"

interface SidebarProps {
  className?: string
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

const routes = [
  {
    label: "Dashboard",
    icon: BarChart,
    href: "/dashboard",
    color: "text-sky-500",
  },
  {
    label: "Subjects",
    icon: BookOpen,
    href: "/subjects",
    color: "text-violet-500",
  },
  {
    label: "Goals",
    icon: Target,
    href: "/goals",
    color: "text-pink-700",
  },
  {
    label: "Study Plan",
    icon: GraduationCap,
    color: "text-orange-700",
    href: "/study-plan",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
  },
]

export function Sidebar({ className, isOpen = true, onOpenChange }: SidebarProps) {
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (!isMounted) {
    return null
  }

  const SidebarRoutes = () => (
    <ScrollArea className="flex-1">
      <div className="space-y-1 p-4">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            onClick={() => isMobile && onOpenChange?.(false)}
            className={cn(
              "flex items-center gap-x-2 rounded-lg px-4 py-3 text-sm font-medium transition-all hover:text-primary",
              pathname === route.href
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-primary/5",
            )}
          >
            <route.icon className={cn("h-5 w-5", route.color)} />
            <span className={cn(
              "transition-all duration-200",
              !isOpen && "md:hidden"
            )}>
              {route.label}
            </span>
          </Link>
        ))}
      </div>
    </ScrollArea>
  )

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="p-0 w-72">
          <div className="h-full flex flex-col border-r bg-background">
            <div className="h-16 border-b px-6 flex items-center justify-between">
              <Link 
                href="/" 
                className="flex items-center gap-2 font-semibold"
                onClick={() => onOpenChange?.(false)}
              >
                <GraduationCap className="h-6 w-6 text-primary" />
                <span>GATE Progress</span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange?.(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <SidebarRoutes />
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div className={cn(
      "flex flex-col h-full border-r bg-background transition-all duration-300",
      !isOpen && "md:w-[80px]",
      className
    )}>
      <div className="h-16 border-b flex items-center justify-between">
        <div className="px-4 flex items-center gap-2 font-semibold min-w-0">
          <GraduationCap className="h-6 w-6 text-primary shrink-0" />
          <span className={cn(
            "transition-all duration-200 truncate",
            !isOpen && "md:hidden"
          )}>
            GATE Progress
          </span>
        </div>
        <div className="px-2 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex"
            onClick={() => onOpenChange?.(!isOpen)}
          >
            <ChevronLeft className={cn(
              "h-4 w-4 transition-all",
              !isOpen && "rotate-180"
            )} />
          </Button>
        </div>
      </div>
      <SidebarRoutes />
    </div>
  )
} 