'use client';

import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';

export default function SignInClient() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      {/* Animated background */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-green-600 via-indigo-500 to-orange-400"
        style={{
          animation: 'gradientShift 30s ease infinite',
          backgroundSize: '200% 200%',
        }}
      />

      {/* Subtle dark overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content wrapper */}
      <div className="relative z-10 flex min-h-screen items-stretch">
        {/* Left side with branding - Desktop only */}
        <div className="hidden md:flex md:w-1/2 md:flex-col md:items-center md:justify-center md:border-r md:border-white/10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-md px-8 text-center"
          >
            <div className="mb-8">
              <Image
                src="/xMWLogo.svg"
                alt="xMW Logo"
                width={300}
                height={300}
                className="mx-auto"
                priority
              />
            </div>
          </motion.div>
        </div>

        {/* Right side with sign in */}
        <div className="flex w-full items-center justify-center px-6 py-8 md:w-1/2 md:px-12 lg:px-16">
          <div className="w-full max-w-[400px] space-y-8">
            {/* Mobile logo */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="md:hidden"
            >
              <Image
                src="/xMWLogo.svg"
                alt="xMW Logo"
                width={80}
                height={80}
                className="mx-auto"
                priority
              />
            </motion.div>

            {/* Sign in content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className=" relative space-y-4 text-center md:text-start"
            >
              <h1 className="text-3xl font-bold text-white">Welcome</h1>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                <div className="flex flex-col md:flex-row items-start space-x-4">
                  <div className="space-y-1">
                    <h3 className="font-medium text-white/90">Smartly Track your Learning Journey</h3>
                    <p className="text-sm leading-relaxed text-white/70">
                      Track your progress, analyze performance, and achieve your target scores with personalized recommendations tailored just for you.
                    </p>
                  </div>
                </div>
              </div>

              <div className=" absolute top-0 -right-6 rotate-12 mt-1">
                    <svg className="h-16 w-16 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <GraduationCap className="h-7 w-7 text-blue-600 " />
                    </svg>
                  </div>
            </motion.div>

            

            {/* Sign in button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              <Button
                onClick={() => signIn('google', { callbackUrl })}
                variant="outline"
                className="group relative h-12 w-full rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/10"
              >
                <div className="relative flex items-center justify-center gap-3">
                  <Image
                    src="/google.svg"
                    width={20}
                    height={20}
                    alt="Google"
                    className="transition-transform duration-300 group-hover:scale-110"
                  />
                  <span className="text-sm font-medium text-white/90 transition-colors duration-300 group-hover:text-white">
                    Sign in with Google
                  </span>
                </div>
              </Button>

              <p className="text-center hidden md:text-start text-xs text-white/50">
                By signing in, you agree to our{' '}
                <span className="cursor-pointer text-white/70 underline decoration-white/20 underline-offset-2 transition-colors hover:text-white hover:decoration-white/40">
                  Terms
                </span>{' '}
                and{' '}
                <span className="cursor-pointer text-white/70 underline decoration-white/20 underline-offset-2 transition-colors hover:text-white hover:decoration-white/40">
                  Privacy Policy
                </span>
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}