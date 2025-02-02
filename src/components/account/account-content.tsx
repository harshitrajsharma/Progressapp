'use client';

import { useSession } from 'next-auth/react';
import { ProfileSection } from './profile-section';
import { ExamDetailsSection } from './exam-details-section';
import { AccountSettingsSection } from './account-settings-section';

export function AccountContent() {
  const { data: session } = useSession();

  if (!session?.user) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Account Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      {/* Profile Section */}
      <ProfileSection user={session.user} />

      {/* Exam Details Section */}
      <ExamDetailsSection />

      {/* Account Settings Section */}
      <AccountSettingsSection />
    </div>
  );
} 