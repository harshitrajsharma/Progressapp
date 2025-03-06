'use client';

import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  LogOut, 
  Settings, 
  MoreVertical, 
  Monitor, 
  Sun, 
  Moon, 
  Palette, 
  User, 
  // CreditCard 
} from "lucide-react";
import { useRouter } from 'next/navigation';
import { cn } from "@/lib/utils";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Theme Management Hook (unchanged)
function useTheme() {
  const [theme, setTheme] = useState<'system' | 'light' | 'dark'>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  const applyTheme = useCallback((newTheme: 'system' | 'light' | 'dark') => {
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    localStorage.setItem('theme', newTheme);
    setTheme(newTheme);
    const effectiveTheme = newTheme === 'system' 
      ? (systemPrefersDark ? 'dark' : 'light') 
      : newTheme;
    setResolvedTheme(effectiveTheme);
    document.documentElement.classList.toggle('dark', effectiveTheme === 'dark');
  }, []);

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as 'system' | 'light' | 'dark' || 'system';
    applyTheme(storedTheme);
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = () => {
      if (theme === 'system') applyTheme('system');
    };
    mediaQuery.addEventListener('change', handleThemeChange);
    return () => mediaQuery.removeEventListener('change', handleThemeChange);
  }, [applyTheme, theme]);

  return { theme, resolvedTheme, applyTheme };
}

// Theme Toggle Component (unchanged)
function ThemeToggleButton() {
  const { theme, applyTheme } = useTheme();

  const themes = [
    { name: 'system', icon: Monitor, label: 'System' },
    { name: 'light', icon: Sun, label: 'Light' },
    { name: 'dark', icon: Moon, label: 'Dark' },
  ];

  return (
    <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-md">
      {themes.map(({ name, icon: Icon, label }) => (
        <Button
          key={name}
          variant={theme === name ? "default" : "ghost"}
          size="icon"
          onClick={() => applyTheme(name as 'system' | 'light' | 'dark')}
          className={cn(
            "h-7 w-7 relative",
            theme === name && "bg-primary text-primary-foreground"
          )}
          aria-label={`Switch to ${label} theme`}
        >
          <Icon className="h-4 w-4" />
          <span className="sr-only">{label}</span>
        </Button>
      ))}
    </div>
  );
}

export function UserNav({ isCollapsed }: { isCollapsed: boolean }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  if (!session?.user) return null;

  const initials = session.user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const menuItems = [
    {
      label: 'Profile',
      icon: User,
      onClick: () => router.push('/account'),
      description: 'View and edit your profile',
    },
    {
      label: 'Settings',
      icon: Settings,
      onClick: () => router.push('/account'),
      description: 'Manage account preferences',
    },
    // {
    //   label: 'Billing',
    //   icon: CreditCard,
    //   onClick: () => router.push('/billing'),
    //   description: 'View payment information',
    // },
  ];

  const menuVariants = {
    hidden: { opacity: 0, scale: 0.95, y: -10 },
    visible: { opacity: 1, scale: 1, y: 0 },
  };

  return (
    <div className={cn("flex items-center", isCollapsed ? "justify-center" : "gap-2")}>
      <DropdownMenu onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "group relative transition-all duration-200",
              isCollapsed ? "h-10 w-10 p-2" : "h-12 w-full justify-start gap-3 p-2"
            )}
            aria-label="User menu"
          >
            <Avatar className={cn(isCollapsed ? "h-10 w-10" : "h-11 w-11", "transition-all")}>
              <AvatarImage
                src={session.user.image || ""}
                alt={`${session.user.name}'s profile`}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-muted/50 to-muted/20 text-sm font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 text-left min-w-0"
              >
                <p className="text-sm font-medium truncate">{session.user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
              </motion.div>
            )}
            {!isCollapsed && (
              <MoreVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </Button>
        </DropdownMenuTrigger>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={menuVariants}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              <DropdownMenuContent
                className={cn(
                  "w-72 p-2 rounded-xl shadow-2xl ml-4", // Added ml-4 for left margin
                  "bg-background/80 backdrop-blur-md border border-black/20 dark:border-white/20", // Glassmorphic effect
                  "supports-[backdrop-filter]:bg-background/60 supports-[backdrop-filter]:backdrop-blur-md"
                )}
                align="end"
              >
                <DropdownMenuLabel className="p-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={session.user.image || ""} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{session.user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
                    </div>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator className="my-1 bg-black/20 dark:bg-white/20" />

                <DropdownMenuGroup className="space-y-1">
                  {menuItems.map(({ label, icon: Icon, onClick, description }) => (
                    <DropdownMenuItem
                      key={label}
                      onClick={onClick}
                      className={cn(
                        "p-2 rounded-lg cursor-pointer transition-all duration-150",
                        "hover:bg-white/10 focus:bg-white/10 focus:outline-none",
                        "flex items-start gap-3 group"
                      )}
                    >
                      <div className="p-1.5 bg-white/10 rounded-md group-hover:bg-white/20 transition-colors">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <span className="text-sm font-medium">{label}</span>
                        <p className="text-xs text-muted-foreground">{description}</p>
                      </div>
                    </DropdownMenuItem>
                  ))}

                  <DropdownMenuItem className="p-2 rounded-lg hover:bg-white/10 focus:bg-white/10">
                    <div className="flex items-center justify-between w-full gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-white/10 rounded-md">
                          <Palette className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <span className="text-sm font-medium">Theme</span>
                      </div>
                      <ThemeToggleButton />
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator className="my-1 bg-black/20 dark:bg-white/20" />

                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className={cn(
                    "p-2 rounded-lg text-red-600 hover:bg-red-500/20 focus:bg-red-500/20",
                    "transition-all duration-150 flex items-center gap-3"
                  )}
                >
                  <div className="p-1.5 bg-red-500/20 rounded-md">
                    <LogOut className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </motion.div>
          )}
        </AnimatePresence>
      </DropdownMenu>
    </div>
  );
}