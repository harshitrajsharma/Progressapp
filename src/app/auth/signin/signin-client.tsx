'use client';

import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function SignInClient() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome to Progress Tracking App
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in to track your Exam preparation
          </p>
        </div>
        <Button
          onClick={() => signIn('google', { callbackUrl })}
          variant="outline"
          className="flex items-center justify-center space-x-2"
        >
          <Image
            src="/google.svg"
            width={20}
            height={20}
            alt="Google"
            className="mr-2"
          />
          Continue with Google
        </Button>
      </div>
    </div>
  );
} 