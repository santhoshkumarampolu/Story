'use client';

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { SiteTitle } from "@/components/site-title";
import {
  LayoutDashboard,
  BookOpen,
  User,
  LogOut,
} from "lucide-react";

interface HeaderProps {
  showAuthButtons?: boolean;
}

export function Header({ showAuthButtons = true }: HeaderProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Projects",
      href: "/dashboard/projects",
      icon: BookOpen,
    },
  ];

  // Don't render user-specific content until session is loaded
  if (status === "loading") {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]/95 backdrop-blur supports-[backdrop-filter]:bg-[hsl(var(--background))]/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <SiteTitle />
            {isDashboard && (
              <nav className="flex items-center gap-4">
                {navItems.map((item) => (
                  <div
                    key={item.href}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.title}
                  </div>
                ))}
              </nav>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <nav className="flex items-center space-x-4">
              {isDashboard ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-[hsl(var(--accent))] animate-pulse" />
                    <div className="flex flex-col gap-1">
                      <div className="h-4 w-24 bg-[hsl(var(--accent))] rounded animate-pulse" />
                      <div className="h-3 w-32 bg-[hsl(var(--accent))] rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              ) : (
                showAuthButtons && (
                  <>
                    <div className="h-9 w-20 bg-[hsl(var(--accent))] rounded animate-pulse" />
                    <div className="h-9 w-24 bg-[hsl(var(--accent))] rounded animate-pulse" />
                  </>
                )
              )}
            </nav>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]/95 backdrop-blur supports-[backdrop-filter]:bg-[hsl(var(--background))]/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <SiteTitle />
          {isDashboard && (
            <nav className="flex items-center gap-4">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:bg-[hsl(var(--accent))] ${
                      isActive ? "bg-[hsl(var(--accent))]" : ""
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <nav className="flex items-center space-x-4">
            {isDashboard ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {session?.user?.image ? (
                    <div className="relative h-8 w-8 overflow-hidden rounded-full">
                      <Image
                        src={session.user.image}
                        alt={session.user.name || "User avatar"}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-[hsl(var(--accent))] flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{session?.user?.name}</span>
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">{session?.user?.email}</span>
                  </div>
                </div>
                <Link href="/auth/signout">
                  <Button variant="ghost" className="gap-2">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </Link>
              </div>
            ) : (
              showAuthButtons && (
                <>
                  <Link href="/auth/signin">
                    <Button variant="ghost" className="text-[hsl(var(--foreground))] hover:text-purple-400">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                      Get Started
                    </Button>
                  </Link>
                </>
              )
            )}
          </nav>
        </div>
      </div>
    </header>
  );
} 