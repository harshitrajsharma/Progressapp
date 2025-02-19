'use client';

import { useSession } from 'next-auth/react';
import { ProfileSection } from './profile-section';
import { ExamDetailsSection } from './exam-details-section';
import { AccountSettingsSection } from './account-settings-section';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';

export function AccountContent() {
  const { data: session } = useSession();

  if (!session?.user) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10 rounded-full">
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </Link>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Account Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>
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