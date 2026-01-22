'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { useState, useCallback, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface ValidationError {
  field: string;
  message: string;
}

interface RegisterResponse {
  message?: string;
  error?: string;
  details?: ValidationError[];
  userId?: string;
  requiresVerification?: boolean;
}

export default function SignUpPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const redirectToDashboard = useCallback(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  useEffect(() => {
    redirectToDashboard();
  }, [redirectToDashboard]);

  // Client-side validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    } else if (name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    } else if (name.trim().length > 50) {
      newErrors.name = "Name must be less than 50 characters";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGeneralError("");
    setSuccess(false);

    // Validate client-side first
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data: RegisterResponse = await res.json();

      if (!res.ok) {
        // Handle validation errors from server
        if (data.details && Array.isArray(data.details)) {
          const fieldErrors: Record<string, string> = {};
          data.details.forEach((err: ValidationError) => {
            fieldErrors[err.field] = err.message;
          });
          setErrors(fieldErrors);
          setGeneralError("Please fix the errors below and try again.");
        } else if (data.error) {
          setGeneralError(data.error);
        } else {
          setGeneralError("Registration failed. Please try again.");
        }
        return;
      }

      // Success - show verification message
      setSuccess(true);
      setSuccessMessage(data.message || "Account created successfully!");
      setEmail("");
      setPassword("");
      setName("");
      setErrors({});

      // After 3 seconds, redirect to signin
      setTimeout(() => {
        router.push("/auth/signin");
      }, 3000);
    } catch (err: any) {
      console.error("[SignUp] Error:", err);
      setGeneralError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Show loading state while checking session
  if (status === "loading") {
    return (
      <div className="relative min-h-screen">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-900/20 to-black" />
        <div className="relative flex min-h-screen items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-900/20 to-black" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 left-1/2 h-[1000px] w-[1000px] -translate-x-1/2 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/4 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-pink-500/20 blur-3xl" />
      </div>

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
                <h1 className="font-space-grotesk text-4xl sm:text-5xl font-bold tracking-tight whitespace-nowrap">
                  Create an account
                </h1>
                <p className="text-lg text-white/70">
                  Sign up to get started with AI Story Studio
                </p>
              </div>

              <div className="space-y-6">
                {/* Success Alert */}
                {success && (
                  <div className="flex items-start gap-3 rounded-lg border border-green-500/50 bg-green-500/10 p-4">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-green-200">
                        {successMessage}
                      </p>
                      <p className="text-xs text-green-200/70 mt-1">
                        Redirecting to sign in page...
                      </p>
                    </div>
                  </div>
                )}

                {/* General Error Alert */}
                {generalError && !success && (
                  <div className="flex items-start gap-3 rounded-lg border border-red-500/50 bg-red-500/10 p-4">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-200">
                      {generalError}
                    </p>
                  </div>
                )}

                {!success && (
                  <>
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
                      {/* Name Field */}
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-white/80 mb-2">
                          Full Name
                        </label>
                        <input
                          id="name"
                          placeholder="Your Name"
                          type="text"
                          autoCapitalize="words"
                          autoComplete="name"
                          autoCorrect="off"
                          className={`flex h-12 w-full rounded-lg border bg-white/5 px-4 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-1 transition-colors ${
                            errors.name
                              ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                              : "border-white/10 focus:border-white/20 focus:ring-white/20"
                          }`}
                          value={name}
                          onChange={e => {
                            setName(e.target.value);
                            if (errors.name) {
                              setErrors({ ...errors, name: "" });
                            }
                          }}
                        />
                        {errors.name && (
                          <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.name}
                          </p>
                        )}
                      </div>

                      {/* Email Field */}
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                          Email Address
                        </label>
                        <input
                          id="email"
                          placeholder="name@example.com"
                          type="email"
                          autoCapitalize="none"
                          autoComplete="email"
                          autoCorrect="off"
                          className={`flex h-12 w-full rounded-lg border bg-white/5 px-4 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-1 transition-colors ${
                            errors.email
                              ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                              : "border-white/10 focus:border-white/20 focus:ring-white/20"
                          }`}
                          value={email}
                          onChange={e => {
                            setEmail(e.target.value);
                            if (errors.email) {
                              setErrors({ ...errors, email: "" });
                            }
                          }}
                        />
                        {errors.email && (
                          <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.email}
                          </p>
                        )}
                      </div>

                      {/* Password Field */}
                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">
                          Password
                        </label>
                        <input
                          id="password"
                          placeholder="Password (min. 6 characters)"
                          type="password"
                          autoCapitalize="none"
                          autoComplete="new-password"
                          autoCorrect="off"
                          className={`flex h-12 w-full rounded-lg border bg-white/5 px-4 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-1 transition-colors ${
                            errors.password
                              ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                              : "border-white/10 focus:border-white/20 focus:ring-white/20"
                          }`}
                          value={password}
                          onChange={e => {
                            setPassword(e.target.value);
                            if (errors.password) {
                              setErrors({ ...errors, password: "" });
                            }
                          }}
                        />
                        {errors.password && (
                          <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.password}
                          </p>
                        )}
                      </div>

                      <Button 
                        className="w-full h-12 bg-white text-black hover:bg-white/90" 
                        type="submit" 
                        disabled={loading}
                      >
                        {loading ? "Creating Account..." : "Sign Up with Email"}
                      </Button>
                    </form>
                  </>
                )}
              </div>

              <p className="text-center text-sm text-white/70">
                <Link href="/auth/signin" className="hover:text-white underline underline-offset-4">
                  Already have an account? Sign In
                </Link>
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 