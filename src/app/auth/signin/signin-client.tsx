'use client';

import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function SignInClient() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      {/* Animated background */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-green-500 via-indigo-600 to-orange-500"
        style={{
          animation: 'gradientShift 30s ease infinite',
          backgroundSize: '400% 400%',
        }}
      />

      {/* Dark overlay with 40% opacity */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Grain effect overlay */}
      <div className="absolute inset-0 opacity-30">
        <div className="pointer-events-none absolute inset-0" style={{ filter: 'contrast(170%) brightness(1000%)' }}>
          <div className="absolute inset-0 bg-noise opacity-20" />
        </div>
      </div>

      {/* Subtle overlay pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Content wrapper */}
      <div className="relative z-10 flex min-h-screen items-stretch">
        {/* Left side with logo - Desktop only */}
        <div className="hidden md:flex md:w-1/2 md:items-center md:justify-center md:border-r md:border-white/10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative px-8"
          >
            <div className="relative">
              <Image
                src="/xMWLogo.svg"
                alt="xMW Logo"
                width={380}
                height={380}
                className="drop-shadow-[0_0_50px_rgba(255,255,255,0.15)] transition-all duration-700 hover:drop-shadow-[0_0_70px_rgba(255,255,255,0.25)]"
                priority
              />
              <div className="absolute -inset-8 animate-pulse-slow rounded-full bg-white/5 backdrop-blur-sm" />
              <div className="absolute -inset-1 animate-pulse-slow rounded-full bg-gradient-to-r from-white/10 via-white/5 to-transparent" />
            </div>
          </motion.div>
        </div>

        {/* Right side with sign in */}
        <div className="flex w-full items-center justify-center px-4 py-8 md:w-1/2 md:px-12 lg:px-16">
          <div className="w-full max-w-[440px]">
            {/* Mobile logo */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative mb-10 md:hidden"
            >
              <div className="relative flex justify-center">
                <Image
                  src="/xMWLogo.svg"
                  alt="xMW Logo"
                  width={110}
                  height={110}
                  className="drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                  priority
                />
                <div className="absolute -inset-4 animate-pulse-slow rounded-full bg-white/5 backdrop-blur-sm" />
              </div>
            </motion.div>

            {/* Welcome content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-10 space-y-6"
            >
              <div className="space-y-2">
                <h1 className="bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-4xl font-bold tracking-tight text-transparent md:text-5xl">
                  Welcome Back
                </h1>
                <p className="text-base font-medium text-white/70 md:text-lg">
                  Sign in to continue your exam preparation journey
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                <div className="flex items-start space-x-4">
                  <div className="mt-1 rounded-full bg-white/10 p-2.5">
                    <svg className="h-5 w-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-medium text-white/90">Personalized Learning Journey</h3>
                    <p className="text-sm leading-relaxed text-white/70">
                      Track your progress, analyze performance, and achieve your target scores with AI-powered study plans tailored just for you.
                    </p>
                  </div>
                </div>
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
                className="group relative h-14 w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-white/20 hover:bg-white/10"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative flex items-center justify-center gap-3">
                  <div className="rounded-full bg-white/10 p-2.5 backdrop-blur-sm">
                    <Image
                      src="/google.svg"
                      width={20}
                      height={20}
                      alt="Google"
                      className="transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <span className="text-base font-medium text-white/90 transition-colors duration-300 group-hover:text-white">
                    Sign in with Google
                  </span>
                </div>
              </Button>

              <div className="space-y-4">

                <p className="text-center text-xs text-white/50">
                  By signing in, you agree to our{' '}
                  <span className="cursor-pointer text-white/70 underline decoration-white/20 underline-offset-2 transition-colors hover:text-white hover:decoration-white/40">
                    Terms of Service
                  </span>{' '}
                  and{' '}
                  <span className="cursor-pointer text-white/70 underline decoration-white/20 underline-offset-2 transition-colors hover:text-white hover:decoration-white/40">
                    Privacy Policy
                  </span>
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Optimized animations */}
      <style jsx global>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.2; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .bg-noise {
          background: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          animation: noise 1s steps(2) infinite;
        }
        @keyframes noise {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-5%, -5%); }
          20% { transform: translate(-10%, 5%); }
          30% { transform: translate(5%, -10%); }
          40% { transform: translate(-5%, 15%); }
          50% { transform: translate(-10%, 5%); }
          60% { transform: translate(15%, 0); }
          70% { transform: translate(0, 10%); }
          80% { transform: translate(3%, 35%); }
          90% { transform: translate(-10%, 10%); }
        }
      `}</style>
    </div>
  );
} 