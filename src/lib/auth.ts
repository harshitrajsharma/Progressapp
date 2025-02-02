import { PrismaAdapter } from "@auth/prisma-adapter"
import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"

// Add type declaration
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      examName?: string | null
      needsOnboarding?: boolean
      examDate?: Date | null
    }
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt"
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.sub || '';
        session.user.examName = (token.examName as string) || null;
        session.user.examDate = token.examDate ? new Date(token.examDate as string) : null;
      }
      return session;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.sub = user.id;
        token.examName = user.examName || null;
        token.examDate = user.examDate || null;
      }
      // If you update the session
      if (trigger === "update" && session?.user) {
        token.examName = session.user.examName || null;
        token.examDate = session.user.examDate || null;
      }
      return token;
    },
    async redirect({ url, baseUrl, token }) {
      // Check if the URL is the dashboard and user needs onboarding
      if (url.includes('/dashboard') && url.startsWith(baseUrl)) {
        const session = await prisma.user.findFirst({
          where: { id: token?.sub },
          select: { examDate: true }
        });
        if (!session?.examDate) {
          return `${baseUrl}/onboarding`;
        }
      }
      
      if (url.startsWith("/")) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  },
  pages: {
    signIn: '/auth/signin',
  },
  events: {
    async signIn({ user }) {
      // Create default settings for new users
      await prisma.userSettings.upsert({
        where: {
          userEmail: user.email!,
        },
        update: {},
        create: {
          userEmail: user.email!,
          emailNotifications: true,
          progressReminders: true,
          testReminders: true,
        },
      });
    },
  },
}

// Middleware configuration for protected routes
export async function authConfig(req: Request) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const url = new URL(req.url);

  // Public routes that don't require authentication
  const publicRoutes = ['/auth/signin', '/', '/about'];
  if (publicRoutes.includes(url.pathname)) {
    return null;
  }

  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return Response.redirect(new URL('/auth/signin', baseUrl));
    }

    // Check if user needs onboarding
    if (url.includes('/dashboard') && url.startsWith(baseUrl)) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { examDate: true }
      });
      
      if (!user?.examDate) {
        return Response.redirect(new URL('/onboarding', baseUrl));
      }
    }

    // Prevent accessing onboarding if already completed
    if (url.pathname === '/onboarding') {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { examDate: true }
      });
      
      if (user?.examDate) {
        return Response.redirect(new URL('/dashboard', baseUrl));
      }
    }

    return null;
  } catch (error) {
    console.error('Auth error:', error);
    return Response.redirect(new URL('/auth/signin', baseUrl));
  }
} 