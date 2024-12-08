'use client';

import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function SignInClient() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  return (
    <div className="relative flex min-h-screen overflow-hidden">
      {/* Animated gradient background */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 opacity-60 dark:opacity-50"
        style={{
          backgroundSize: '400% 400%',
          animation: 'gradient 15s ease infinite',
        }}
      />
      
      {/* Black filter overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative flex w-full items-center justify-center md:justify-start">
        {/* Left side with logo */}
        <div className="hidden md:flex md:w-1/2 md:items-center md:justify-center">
          <Image
            src="/xMWLogo.svg"
            alt="xMW Logo"
            width={300}
            height={300}
            className=""
            priority
          />
        </div>

        {/* Right side with sign in */}
        <div className="w-full max-w-sm p-8 md:w-1/2">
          <div className="mb-8 text-center md:text-left">
            <Image
              src="/xMWLogo.svg"
              alt="xMW Logo"
              width={80}
              height={80}
              className="mb-6 inline-block md:hidden"
            />
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Welcome to Progress Tracking
            </h1>
            <p className="mt-2 text-sm text-gray-200">
              Sign in to track your exam preparation progress
            </p>
          </div>

          <Button
            onClick={() => signIn('google', { callbackUrl })}
            variant="outline"
            className="w-full bg-white/10 backdrop-blur hover:bg-white/20"
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
    </div>
  );
} 