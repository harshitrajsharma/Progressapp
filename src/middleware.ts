import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  async function middleware(req) {
    // If it's the landing page and user is authenticated, redirect to dashboard
    if (req.nextUrl.pathname === "/" && req.nextauth.token) {
      if (req.nextauth.token.needsOnboarding) {
        return NextResponse.redirect(new URL("/onboarding", req.url));
      }
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Check if user needs onboarding
    if (req.nextUrl.pathname !== "/onboarding" && req.nextauth.token?.needsOnboarding) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    // Prevent accessing onboarding if already completed
    if (req.nextUrl.pathname === "/onboarding" && req.nextauth.token && !req.nextauth.token.needsOnboarding) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow public access to landing page
        if (req.nextUrl.pathname === "/") {
          return true;
        }
        // Require authentication for protected routes
        return !!token;
      },
    },
    pages: {
      signIn: "/auth/signin",
    },
  }
);

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/subjects/:path*",
    "/mock-tests/:path*",
    "/tests/:path*",
    "/dashboard",
    "/subjects",
    "/mock-tests",
    "/tests",
    "/onboarding"
  ],
}; 
