import { withAuth } from "next-auth/middleware"

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token
  },
  pages: {
    signIn: "/auth/signin",
  },
})

export const config = {
  matcher: [
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
} 