'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  BookOpen,
  User,
  LogOut,
} from "lucide-react";

export function DashboardNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

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

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-[hsl(var(--accent))] ${
                isActive ? "bg-[hsl(var(--accent))]" : ""
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          );
        })}
      </div>
      <div className="mt-auto">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-[hsl(var(--accent))] flex items-center justify-center">
              <User className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{session?.user?.name}</span>
              <span className="text-xs text-[hsl(var(--muted-foreground))]">{session?.user?.email}</span>
            </div>
          </div>
        </div>
        <Link href="/api/auth/signout">
          <Button variant="ghost" className="w-full justify-start gap-3 mt-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </Link>
      </div>
    </div>
  );
} 