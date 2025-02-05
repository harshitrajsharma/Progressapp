import "./globals.css";
import localFont from "next/font/local";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { RootLayout as ClientLayout } from "@/components/providers/root-layout";

// Font definitions
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Progress Tracking',
  description: 'Track your exam preparation progress in a smart way. A product from xLab.',
  manifest: '/manifest.json',
  themeColor: '#000000',
  icons: {
    icon: './xMWLogo.svg',
    shortcut: '/xMWLogo.svg',
    apple: '/xMWLogo.svg',
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background font-sans antialiased ${inter.className}`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}