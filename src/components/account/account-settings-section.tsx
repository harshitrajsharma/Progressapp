'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from 'sonner';
import { signOut } from 'next-auth/react';
import {
  Bell,
  Mail,
  Moon,
  Sun,
  Monitor,
  Trash2,
  AlertTriangle,
  Loader2,
  Waves
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter } from 'next/navigation';

interface Settings {
  emailNotifications: boolean;
  pushNotifications: boolean;
}

// Theme Management Hook
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

export function AccountSettingsSection() {
  const { theme, applyTheme } = useTheme();
  const router = useRouter();
  const [settings, setSettings] = useState<Settings>({
    emailNotifications: true,
    pushNotifications: true,
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showGoodbye, setShowGoodbye] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch initial settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/user/settings');
        if (!response.ok) throw new Error('Failed to fetch settings');
        const data = await response.json();
        setSettings(prev => ({
          ...prev,
          emailNotifications: data.emailNotifications ?? prev.emailNotifications,
          pushNotifications: data.pushNotifications ?? prev.pushNotifications,
        }));
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };

    fetchSettings();
  }, []);

  const handleSettingChange = async (key: keyof Settings) => {
    setIsSaving(true);
    const newSettings = {
      ...settings,
      [key]: !settings[key],
    };

    try {
      const response = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: newSettings[key] }),
      });

      if (!response.ok) throw new Error('Failed to update settings');
      
      setSettings(newSettings);
      toast.success('Settings updated successfully');
    } catch (error) {
      console.error('Failed to update settings:', error);
      toast.error('Failed to update settings');
      // Revert the setting
      setSettings(settings);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation.toLowerCase() !== 'delete my account') {
      toast.error('Please type the confirmation text correctly');
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete account');
      }
      
      // Show goodbye screen
      setShowGoodbye(true);

      // Wait a moment to show the goodbye message
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Sign out and redirect to home page
      await signOut({ redirect: false });
      router.push('/');
    } catch (error) {
      console.error('Failed to delete account:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete account. Please try again.');
      setShowDeleteDialog(false);
    } finally {
      setIsDeleting(false);
      setDeleteConfirmation('');
    }
  };

  if (showGoodbye) {
    return (
      <div className="fixed inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center flex-col gap-6 animate-in fade-in zoom-in duration-1000">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
          <Waves className="h-16 w-16 text-primary animate-bounce relative z-10" />
        </div>
        <div className="space-y-2 text-center relative animate-in slide-in-from-bottom duration-700 delay-300">
          <h1 className="text-4xl font-bold tracking-tight">Goodbye!</h1>
          <p className="text-muted-foreground text-lg">Thank you for using Progress</p>
        </div>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-in fade-in duration-1000 delay-500" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-in fade-in duration-1000 delay-500" />
          <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent animate-in fade-in duration-1000 delay-500" />
          <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent animate-in fade-in duration-1000 delay-500" />
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold">Account Settings</h3>
            <p className="text-sm text-muted-foreground">
              Manage your account preferences and settings
            </p>
          </div>

          <div className="space-y-4">
            {/* Notifications Settings */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Notifications</h4>
              
              <div className="flex items-center justify-between space-x-2">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="email-notifications" className="text-sm">
                    Email Notifications
                  </Label>
                </div>
                <Switch
                  id="email-notifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={() => handleSettingChange('emailNotifications')}
                  disabled={isSaving}
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <div className="flex items-center space-x-2">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="push-notifications" className="text-sm">
                    Push Notifications
                  </Label>
                </div>
                <Switch
                  id="push-notifications"
                  checked={settings.pushNotifications}
                  onCheckedChange={() => handleSettingChange('pushNotifications')}
                  disabled={isSaving}
                />
              </div>
            </div>

            {/* Appearance Settings */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Appearance</h4>
              
              <div className="flex items-center justify-between space-x-2">
                <div className="flex items-center space-x-2">
                  <Moon className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm">Theme</Label>
                </div>
                <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-md">
                  <Button
                    variant={theme === 'system' ? "default" : "ghost"}
                    size="icon"
                    onClick={() => applyTheme('system')}
                    className="h-7 w-7"
                  >
                    <Monitor className="h-4 w-4" />
                    <span className="sr-only">System theme</span>
                  </Button>
                  <Button
                    variant={theme === 'light' ? "default" : "ghost"}
                    size="icon"
                    onClick={() => applyTheme('light')}
                    className="h-7 w-7"
                  >
                    <Sun className="h-4 w-4" />
                    <span className="sr-only">Light theme</span>
                  </Button>
                  <Button
                    variant={theme === 'dark' ? "default" : "ghost"}
                    size="icon"
                    onClick={() => applyTheme('dark')}
                    className="h-7 w-7"
                  >
                    <Moon className="h-4 w-4" />
                    <span className="sr-only">Dark theme</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="space-y-4">
              <div className="rounded-lg border-2 border-destructive/20 p-4">
                <h4 className="text-sm font-medium text-destructive mb-2">Danger Zone</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                
                <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full sm:w-auto">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        Delete Account
                      </AlertDialogTitle>
                      <AlertDialogDescription className="space-y-4">
                        <p>
                          This action <span className="font-semibold">cannot be undone</span>. 
                          This will permanently delete your account and remove all of your data 
                          from our servers, including:
                        </p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Your profile information</li>
                          <li>Your study progress and statistics</li>
                          <li>Your exam details and schedules</li>
                          <li>All saved preferences and settings</li>
                        </ul>
                        <div className="space-y-2 pt-2">
                          <Label htmlFor="delete-confirmation" className="text-sm font-medium">
                            Please type &quot;delete my account&quot; to confirm
                          </Label>
                          <Input
                            id="delete-confirmation"
                            value={deleteConfirmation}
                            onChange={(e) => setDeleteConfirmation(e.target.value)}
                            placeholder="delete my account"
                            className="w-full"
                          />
                        </div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => {
                        setDeleteConfirmation('');
                        setShowDeleteDialog(false);
                      }}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        disabled={isDeleting || deleteConfirmation.toLowerCase() !== 'delete my account'}
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          'Delete Account'
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 