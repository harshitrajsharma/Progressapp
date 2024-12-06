'use client'

import { Suspense } from 'react';
import SignInClient from './signin-client';

export default function SignInPage() {
  return (
    <Suspense 
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Loading...
              </h1>
            </div>
          </div>
        </div>
      }
    >
      <SignInClient />
    </Suspense>
  );
} 