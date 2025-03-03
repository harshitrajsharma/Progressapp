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
import { LogOut, Settings, MoreVertical, Monitor, Sun, Moon } from "lucide-react";
import { useRouter } from 'next/navigation';
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

// Custom hook to manage theme (unchanged)
function useTheme() {
  const [theme, setTheme] = useState<string>('system');

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') || 'system';
    setTheme(storedTheme);
    document.documentElement.classList.toggle('dark', storedTheme === 'dark' || (storedTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches));
  }, []);

  const applyTheme = (newTheme: string) => {
    localStorage.setItem('theme', newTheme);
    setTheme(newTheme);
    if (newTheme === 'system') {
      document.documentElement.classList.toggle('dark', window.matchMedia('(prefers-color-scheme: dark)').matches);
    } else {
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
    }
  };

  return { theme, applyTheme };
}

// Theme Toggle Button Component (Improved)
function ThemeToggleButton() {
  const { theme, applyTheme } = useTheme();

  const themes = [
    { name: 'system', icon: Monitor, label: 'System' },
    { name: 'light', icon: Sun, label: 'Light' },
    { name: 'dark', icon: Moon, label: 'Dark' },
  ];

  const handleToggle = () => {
    const currentIndex = themes.findIndex(t => t.name === theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    applyTheme(themes[nextIndex].name);
  };

  return (
    <Button
      variant="outline"
      className="flex items-center gap-1.5 p-1.5 border rounded-full bg-background hover:bg-muted/50 transition-colors"
      onClick={handleToggle}
      title={`Current theme: ${theme}`}
    >
      {themes.map(({ name, icon: Icon }) => (
        <span
          key={name}
          className={cn(
            "p-1.5 rounded-full transition-colors",
            theme === name ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
      ))}
    </Button>
  );
}

export function UserNav({ isCollapsed }: { isCollapsed: boolean }) {
  const { data: session } = useSession();
  const router = useRouter();

  if (!session?.user) return null;

  const initials = session.user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const menuContent = (
    <DropdownMenuContent className="w-64 p-3 bg-background rounded-lg shadow-lg" align="end" forceMount>
      <DropdownMenuLabel className="font-normal py-2 px-3">
        <div className="flex flex-col gap-1.5">
          <p className="text-base font-semibold leading-tight truncate">{session.user.name}</p>
          <p className="text-sm text-muted-foreground truncate">{session.user.email}</p>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator className="my-2 bg-muted/20" />
      <DropdownMenuGroup className="space-y-1">
        <DropdownMenuItem
          onClick={() => router.push('/account')}
          className="py-2.5 px-3 rounded-lg hover:bg-muted focus:bg-muted cursor-pointer transition-colors flex items-center gap-3"
        >
          <Settings className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="py-2.5 px-3 rounded-lg hover:bg-muted focus:bg-muted cursor-pointer transition-colors flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Monitor className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Theme</span>
          </div>
          <ThemeToggleButton />
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator className="my-2 bg-muted/20" />
      <DropdownMenuItem
        className="py-2.5 px-3 rounded-lg text-red-600 hover:bg-red-50 focus:bg-red-50 focus:text-red-600 cursor-pointer transition-colors flex items-center gap-3"
        onClick={() => signOut()}
      >
        <LogOut className="h-4 w-4" />
        <span className="text-sm">Log out</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  );

  return (
    <div className={cn("flex items-center", isCollapsed ? "justify-center" : "justify-between")}>
      {isCollapsed ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 hover:bg-muted">
              <Avatar className="h-9 w-9">
                <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                <AvatarFallback className="text-sm">{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          {menuContent}
        </DropdownMenu>
      ) : (
        <>
          <div className="flex items-center gap-3 w-full">
            <Avatar className="h-10 w-10">
              <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
              <AvatarFallback className="text-sm">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-0.5 w-full">
              <p className="text-sm font-medium truncate max-w-[180px]">{session.user.name}</p>
              <p className="text-xs text-muted-foreground truncate max-w-[180px]">{session.user.email}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            {menuContent}
          </DropdownMenu>
        </>
      )}
    </div>
  );
}