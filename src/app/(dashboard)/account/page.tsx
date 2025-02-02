'use client';

import { Suspense } from 'react';
import { Shell } from '@/components/shell';
import { AccountPageSkeleton } from '@/components/skeletons/account-skeleton';
import { AccountContent } from '@/components/account/account-content';

export default function AccountPage() {
  return (
    <Shell>
      <Suspense fallback={<AccountPageSkeleton />}>
        <AccountContent />
      </Suspense>
    </Shell>
  );
} 