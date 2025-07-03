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
  Settings,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  showAuthButtons?: boolean;
}

export function Header({ showAuthButtons = true }: HeaderProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');
  const [showUserMenu, setShowUserMenu] = useState(false);

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
            <div>
              <span className="hidden sm:inline text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
                AI Story Studio
              </span>
              <span className="inline sm:hidden">
                <Image
                  src="/favicon.png"
                  alt="AI Story Studio"
                  width={32}
                  height={32}
                  className="rounded"
                  priority
                />
              </span>
            </div>
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
      <div className="container mx-auto px-2 sm:px-4 lg:px-8 flex flex-col sm:flex-row h-auto sm:h-16 items-center justify-between gap-2 sm:gap-0">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-8 w-full sm:w-auto">
          <div className="flex items-center justify-center w-full sm:w-auto">
            <span className="hidden sm:inline text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
              AI Story Studio
            </span>
            <span className="inline sm:hidden">
              <Image
                src="/favicon.png"
                alt="AI Story Studio"
                width={52}
                height={42}
                className="rounded"
                priority
              />
            </span>
          </div>
          {isDashboard && (
            <nav className="flex flex-row sm:flex-row items-center gap-2 sm:gap-4 w-full sm:w-auto justify-center">
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
        <div className="flex items-center justify-center w-full sm:w-auto mt-2 sm:mt-0 space-x-2 sm:space-x-4">
          <nav className="flex items-center space-x-2 sm:space-x-4">
            {isDashboard ? (
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 hover:bg-[hsl(var(--accent))] rounded-lg px-3 py-2 transition-all"
                  >
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
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium truncate max-w-[100px]">{session?.user?.name}</span>
                      <span className="text-xs text-[hsl(var(--muted-foreground))] truncate max-w-[100px]">{session?.user?.email}</span>
                    </div>
                    <ChevronDown className={`h-4 w-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                  </button>
                  {/* User Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-lg shadow-lg z-50">
                      <div className="py-2">
                        <Link href="/dashboard/profile">
                          <button className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-[hsl(var(--accent))] transition-colors">
                            <User className="h-4 w-4" />
                            Profile Settings
                          </button>
                        </Link>
                        <Link href="/auth/signout">
                          <button className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-[hsl(var(--accent))] transition-colors text-red-500 hover:text-red-400">
                            <LogOut className="h-4 w-4" />
                            Sign Out
                          </button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
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
      
      {/* Click outside to close dropdown */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
} 