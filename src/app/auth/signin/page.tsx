"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { useState, useCallback, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const redirectToDashboard = useCallback(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  useEffect(() => {
    redirectToDashboard();
  }, [redirectToDashboard]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      router.replace("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Show loading state while checking session
  if (status === "loading") {
    return (
      <div className="relative min-h-screen bg-black text-white">
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black" />
        <div className="relative flex min-h-screen items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black text-white">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black" />

      <div className="relative">
        <Header showAuthButtons={true} />

        <main className="flex min-h-screen items-center justify-center px-4 pt-20">
          <div className="w-full max-w-[400px]">
            <div className="space-y-8">
              <div className="space-y-2 text-center">
                <Link href="/" className="inline-flex items-center text-sm text-white/70 hover:text-white transition-colors mb-8">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 h-4 w-4"
                  >
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                  Back to home
                </Link>
                <h1 className="font-outfit text-4xl sm:text-5xl font-bold tracking-tight">
                  Welcome back
                </h1>
                <p className="text-lg text-white/70">
                  Sign in to continue with AI Story Studio
                </p>
              </div>

              <div className="space-y-6">
                <Button
                  variant="outline"
                  className="w-full h-12 border-white/20 bg-white/5 text-white hover:bg-white/10 font-medium"
                  onClick={() => signIn("google", { 
                    redirect: true,
                    callbackUrl: "/dashboard"
                  })}
                  type="button"
                  disabled={loading}
                >
                  <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                    <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                  </svg>
                  Continue with Google
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-black px-2 text-white/50">
                      Or continue with
                    </span>
                  </div>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <input
                      id="email"
                      placeholder="name@example.com"
                      type="email"
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect="off"
                      className="flex h-12 w-full rounded-lg border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/50 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/20"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <input
                      id="password"
                      placeholder="Password"
                      type="password"
                      autoCapitalize="none"
                      autoComplete="current-password"
                      autoCorrect="off"
                      className="flex h-12 w-full rounded-lg border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/50 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/20"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button className="w-full h-12 bg-white text-black hover:bg-white/90" type="submit" disabled={loading}>
                    {loading ? "Signing In..." : "Sign In with Email"}
                  </Button>
                  {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
                </form>
              </div>

              <p className="text-center text-sm text-white/70">
                <Link href="/auth/signup" className="hover:text-white underline underline-offset-4">
                  Don't have an account? Sign Up
                </Link>
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}