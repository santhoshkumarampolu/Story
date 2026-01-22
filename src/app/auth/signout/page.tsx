'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { LogOut } from "lucide-react";

export default function SignOutPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    await signOut({ callbackUrl: '/' });
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="relative min-h-screen bg-black text-white">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black" />

      <div className="relative">
        <Header showAuthButtons={false} />
        
        <main className="container mx-auto px-4 pt-28 pb-8">
          <div className="mx-auto max-w-md">
            <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))]/50 p-8 backdrop-blur">
              <div className="flex flex-col items-center space-y-6 text-center">
                <div className="rounded-full bg-[hsl(var(--accent))] p-3">
                  <LogOut className="h-6 w-6" />
                </div>
                
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold tracking-tight">
                    Sign Out
                  </h1>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    Are you sure you want to sign out? You can always sign back in later.
                  </p>
                </div>

                <div className="flex w-full gap-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={handleSignOut}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Signing out...
                      </div>
                    ) : (
                      "Sign Out"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 