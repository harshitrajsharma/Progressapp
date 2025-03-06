import Image from "next/image";
import { Copyright } from "lucide-react";
import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full border-t border-black/20 dark:border-white/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-center md:justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity" aria-label="xLabs Home">
            <Image
              src="/xMWLogo.svg"
              alt="xMW Logo"
              width={24}
              height={24}
              className="h-6 w-6"
              priority={false}
            />
            <span className="font-medium text-sm tracking-wide">Progress Tracking</span>
          </Link>
          
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground ml-4 md:ml-0">
            <Copyright className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{currentYear}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}