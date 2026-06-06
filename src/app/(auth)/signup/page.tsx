"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supbase/client";
import { Eye, EyeOff, Lock, Mail, Loader2, ArrowRight } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Check if organization exists
          const { data: orgs } = await supabase
            .from("organizations")
            .select("id")
            .eq("owner_id", session.user.id)
            .limit(1);

          if (orgs && orgs.length > 0) {
            router.push("/dashboard");
          } else {
            router.push("/onboarding");
          }
        } else {
          setCheckingAuth(false);
        }
      } catch (err) {
        console.error("Auth check error:", err);
        setCheckingAuth(false);
      }
    }
    checkAuth();
  }, [router]);

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    if (!agreeTerms) {
      setErrorMsg("You must agree to the Terms of Service and Privacy Policy.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        setErrorMsg(error.message);
      } else if (data?.user) {
        setSuccessMsg("Account created! Redirecting to onboarding...");
        setTimeout(() => {
          router.push("/onboarding");
        }, 1200);
      }
    } catch (err: any) {
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignup = async (provider: "google" | "github") => {
    setErrorMsg("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) setErrorMsg(error.message);
    } catch (err: any) {
      setErrorMsg("Failed to initiate social signup.");
    }
  };

  if (checkingAuth) {
    return (
      <div className="space-y-5 animate-pulse py-2">
        {/* Title Skeleton */}
        <div className="text-center space-y-2">
          <div className="h-6 w-40 bg-muted rounded-md mx-auto" />
          <div className="h-3 w-56 bg-muted/60 rounded-md mx-auto" />
        </div>
        
        {/* Inputs Skeletons */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <div className="h-3 w-20 bg-muted rounded" />
            <div className="h-10 w-full bg-muted/60 rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <div className="h-3 w-16 bg-muted rounded" />
            <div className="h-10 w-full bg-muted/60 rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <div className="h-3 w-24 bg-muted rounded" />
            <div className="h-10 w-full bg-muted/60 rounded-xl" />
          </div>
        </div>

        {/* Terms Skeleton */}
        <div className="flex items-center gap-2 py-1">
          <div className="h-4 w-4 bg-muted/60 rounded" />
          <div className="h-3 w-44 bg-muted/60 rounded" />
        </div>

        {/* Button Skeleton */}
        <div className="h-11 w-full bg-muted rounded-xl mt-4" />

        {/* Divider Skeleton */}
        <div className="flex items-center justify-center gap-2 py-1">
          <div className="h-px flex-1 bg-muted" />
          <div className="h-3 w-24 bg-muted rounded" />
          <div className="h-px flex-1 bg-muted" />
        </div>

        {/* OAuth Skeletons */}
        <div className="grid grid-cols-2 gap-3">
          <div className="h-10 bg-muted/60 rounded-xl" />
          <div className="h-10 bg-muted/60 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 reveal-up">
      {/* Title */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
        <p className="text-xs text-muted-foreground">
          Start your 14-day free trial. No credit card required.
        </p>
      </div>

      {/* Auth Messages */}
      {errorMsg && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-xs font-medium text-destructive animate-fade-in">
          <p>{errorMsg}</p>
        </div>
      )}

      {successMsg && (
        <div className="rounded-xl border border-success/20 bg-success/5 p-3 text-xs font-medium text-success animate-fade-in">
          <p>{successMsg}</p>
        </div>
      )}

      {/* Signup Form */}
      <form onSubmit={handleEmailSignup} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="email" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
            <input
              id="email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-10 pr-10 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="confirmPassword" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full pl-10 pr-10 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
            />
          </div>
        </div>

        <div className="flex items-start gap-2.5 mt-2">
          <input
            id="agreeTerms"
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            required
            className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
          />
          <label htmlFor="agreeTerms" className="text-[11px] text-muted-foreground leading-normal">
            I agree to the{" "}
            <a href="#" className="font-semibold text-foreground hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="font-semibold text-foreground hover:underline">
              Privacy Policy
            </a>
            .
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-xl gradient-brand-bg text-primary-foreground font-semibold text-sm shadow-glow hover:opacity-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 group mt-4"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Sign Up
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative flex py-1 items-center">
        <div className="flex-grow border-t border-border"></div>
        <span className="flex-shrink mx-3 text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
          Or continue with
        </span>
        <div className="flex-grow border-t border-border"></div>
      </div>

      {/* Social Logins */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => handleOAuthSignup("google")}
          className="flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-card text-xs font-semibold hover:bg-muted transition-colors"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5.04c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 1.84 14.94 1 12 1 7.35 1 3.39 3.67 1.5 7.57l3.69 2.87C6.07 7.56 8.78 5.04 12 5.04z"
            />
            <path
              fill="#4285F4"
              d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.69 2.87c2.16-2 3.4-4.94 3.4-8.6z"
            />
            <path
              fill="#FBBC05"
              d="M5.19 14.56c-.24-.73-.38-1.5-.38-2.31s.14-1.58.38-2.31L1.5 7.07C.54 9.05 0 11.24 0 13.5s.54 4.45 1.5 6.43l3.69-2.87z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.69-2.87c-1.04.7-2.37 1.12-3.96 1.12-3.22 0-5.93-2.52-6.9-5.41L1.72 15.8C3.61 19.7 7.57 23 12 23z"
            />
          </svg>
          Google
        </button>
        <button
          type="button"
          onClick={() => handleOAuthSignup("github")}
          className="flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-card text-xs font-semibold hover:bg-muted transition-colors"
        >
          <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.167 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
          </svg>
          GitHub
        </button>
      </div>

      {/* Switch auth mode */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
