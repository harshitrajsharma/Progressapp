import Image from "next/image";
import { Copyright } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-center">
        <div className="flex items-center gap-6 text-sm">
          <Image
            src="/xMWLogo.svg"
            alt="xMW Logo"
            width={24}
            height={24}
            className=""
          />
          <p className="text-sm text-muted-foreground">
            A product from xLab. Developed by <a href="https://harshit.xcommunity.app" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-500 font-bold text-white">Harshit</a>
          </p>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Copyright className="h-4 w-4" />
            {new Date().getFullYear()}
          </span>
        </div>
      </div>
    </footer>
  );
} 