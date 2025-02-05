'use client';

import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { RootProvider } from "@/components/providers/root-provider";

export function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <RootProvider>{children}</RootProvider>
      </ThemeProvider>
    </QueryProvider>
  );
} 