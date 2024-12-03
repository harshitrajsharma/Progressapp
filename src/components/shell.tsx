'use client';

import * as React from "react";
import { cn } from "@/lib/utils";

interface ShellProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  layout?: "default" | "dashboard" | "auth";
}

export function Shell({
  children,
  layout = "default",
  className,
  ...props
}: ShellProps) {
  return (
    <div
      className={cn(
        "px-2 md:px-8",
        layout === "default" && "",
        layout === "auth" && "mx-auto w-full max-w-[400px]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
} 