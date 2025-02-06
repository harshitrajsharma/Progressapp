'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from 'next/navigation';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { signOut } from 'next-auth/react';
import { Loader2, Download, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function AccountSettingsSection() {
  const router = useRouter();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    progressReminders: true,
    testReminders: true,
  });
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/user/settings');
        if (!response.ok) throw new Error('Failed to fetch settings');
        const data = await response.json();
        if (data) {
          setSettings({
            emailNotifications: data.emailNotifications,
            progressReminders: data.progressReminders,
            testReminders: data.testReminders,
          });
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast.error('Failed to load settings');
      }
    };

    fetchSettings();
  }, []);

  const handleToggleSetting = async (setting: keyof typeof settings) => {
    try {
      const newValue = !settings[setting];
      const response = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [setting]: newValue }),
      });

      if (!response.ok) throw new Error('Failed to update settings');

      setSettings(prev => ({ ...prev, [setting]: newValue }));
      toast.success('Settings updated successfully');
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch('/api/user/account', {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete account');

      await signOut({ callbackUrl: '/' });
      toast.success('Account deleted successfully');
    } catch (error) {
      toast.error('Failed to delete account');
    }
  };

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      const response = await fetch('/api/user/export');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to export data');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const date = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `progress-data-${date}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Your data has been exported successfully');
    } catch (error) {
      console.error('[EXPORT_ERROR]:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Account Settings</CardTitle>
        <CardDescription className="text-base">
          Manage your notification preferences and account settings.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Notification Settings */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Notifications</h3>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={handleExportData} 
                disabled={isExporting}
                className="h-8 px-3 lg:h-9 lg:px-4"
              >
                {isExporting ? (
                  <>
                    <span className="mr-2 hidden sm:inline">Exporting...</span>
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Export Data</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <Label htmlFor="email-notifications" className="text-base">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email notifications about your progress and updates.
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={settings.emailNotifications}
                onCheckedChange={() => handleToggleSetting('emailNotifications')}
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <Label htmlFor="progress-reminders" className="text-base">Progress Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Get reminders about your study progress and goals.
                </p>
              </div>
              <Switch
                id="progress-reminders"
                checked={settings.progressReminders}
                onCheckedChange={() => handleToggleSetting('progressReminders')}
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <Label htmlFor="test-reminders" className="text-base">Test Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Receive reminders about upcoming tests and assessments.
                </p>
              </div>
              <Switch
                id="test-reminders"
                checked={settings.testReminders}
                onCheckedChange={() => handleToggleSetting('testReminders')}
              />
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-destructive">Danger Zone</h3>
          </div>
          <div className="rounded-lg border border-destructive/20 p-4 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="font-medium">Delete Account</p>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all associated data.
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="shrink-0">
                    <Trash2 className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Delete Account</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="sm:max-w-[425px]">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account
                      and remove all your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDeleteAccount} 
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 