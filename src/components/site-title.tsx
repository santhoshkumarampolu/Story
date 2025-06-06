'use client';

import Link from "next/link";

interface SiteTitleProps {
  className?: string;
}

export function SiteTitle({ className = "" }: SiteTitleProps) {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <span className={`text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent ${className}`}>
        AI Story Studio
      </span>
    </Link>
  );
} 