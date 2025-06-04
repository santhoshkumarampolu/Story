'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

interface HeaderProps {
  showAuthButtons?: boolean;
}

export function Header({ showAuthButtons = true }: HeaderProps) {
  const { data: session, status } = useSession();

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-xl">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <Link href="/" className="font-space-grotesk text-3xl sm:text-4xl font-bold tracking-tight">
          AI Story Studio
        </Link>
        
        {showAuthButtons ? (
          <nav className="flex items-center space-x-8">
            <Link href="/auth/signin" className="text-sm text-white/70 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-white text-black hover:bg-white/90 font-medium">
                Get Started
              </Button>
            </Link>
          </nav>
        ) : (
          <nav className="flex items-center space-x-6">
            <Link href="/dashboard" className="text-sm text-white/70 hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link href="/dashboard/projects" className="text-sm text-white/70 hover:text-white transition-colors">
              Projects
            </Link>
            {status === "loading" ? (
              <div className="w-8 h-8 rounded-full bg-purple-500/20 animate-pulse" />
            ) : (
              <Link href="/dashboard/profile" className="flex items-center space-x-2">
                {session?.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || "Profile"}
                    className="w-8 h-8 rounded-full border-2 border-purple-500"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <span className="text-sm text-purple-500">
                      {session?.user?.name?.[0] || "U"}
                    </span>
                  </div>
                )}
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
} 