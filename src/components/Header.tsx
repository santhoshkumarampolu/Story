"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  showAuthButtons?: boolean;
}

export default function Header({ showAuthButtons = false }: HeaderProps) {
  const { data: session, status } = useSession();

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          Story Studio
        </Link>

        <nav className="flex items-center space-x-4">
          {status === "authenticated" ? (
            <>
              <Link href="/dashboard" className="text-sm hover:text-gray-600">
                Dashboard
              </Link>
              <Link href="/projects" className="text-sm hover:text-gray-600">
                Projects
              </Link>
              <Link href="/profile" className="text-sm hover:text-gray-600">
                Profile
              </Link>
              <Button
                variant="outline"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-sm"
              >
                Sign Out
              </Button>
            </>
          ) : showAuthButtons ? (
            <>
              <Link href="/auth/signin">
                <Button variant="ghost" className="text-sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="text-sm">Get Started</Button>
              </Link>
            </>
          ) : null}
        </nav>
      </div>
    </header>
  );
} 