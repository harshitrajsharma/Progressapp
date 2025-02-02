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

export function AccountSettingsSection() {
  const router = useRouter();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    progressReminders: true,
    testReminders: true,
  });

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
        <CardDescription>
          Manage your notification preferences and account settings.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Notification Settings */}
        <div className="space-y-4">
          <h3 className="font-medium">Notifications</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
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
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="progress-reminders">Progress Reminders</Label>
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
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="test-reminders">Test Reminders</Label>
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
          <h3 className="font-medium text-destructive">Danger Zone</h3>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete Account</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your account
                  and remove all your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground">
                  Delete Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
} 