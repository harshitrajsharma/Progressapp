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
    <div className=" mx-auto space-y-8 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Account Settings</h1>
            <p className="text-sm text-muted-foreground">
              Manage your profile, preferences, and account settings
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-8">
        <ProfileSection user={session.user} />
        <ExamDetailsSection user={session.user} />
        <AccountSettingsSection />
      </div>
    </div>
  );
} 