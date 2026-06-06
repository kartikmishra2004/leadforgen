"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supbase/client";
import { Building, Sparkles, Loader2, ArrowRight, Globe, Check } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [orgName, setOrgName] = useState("");
  const [orgSlug, setOrgSlug] = useState("");
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    async function checkSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          // Check if user already completed onboarding (has an organization)
          const { data: orgs } = await supabase
            .from("organizations")
            .select("id")
            .eq("owner_id", session.user.id)
            .limit(1);

          if (orgs && orgs.length > 0) {
            router.push("/dashboard");
            return;
          }
        } else {
          router.push("/login");
          return;
        }
      } catch (err) {
        console.error("Session check failed", err);
      }
      setLoadingUser(false);
    }
    checkSession();
  }, [router]);

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setOrgName(name);
    // Convert to URL-friendly slug
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove non-word characters
      .replace(/[\s_]+/g, "-") // Replace spaces/underscores with hyphens
      .replace(/^-+|-+$/g, ""); // Trim leading/trailing hyphens
    setOrgSlug(slug);
  };

  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName || !orgSlug) {
      setErrorMsg("Please provide all workspace details.");
      return;
    }

    setLoadingSubmit(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const userId = user?.id || (await supabase.auth.getUser()).data.user?.id;
      if (!userId) {
        setErrorMsg("Authentication session expired. Please sign in again.");
        router.push("/login");
        return;
      }

      // Insert organization data into Supabase organizations table
      const { error } = await supabase.from("organizations").insert({
        name: orgName,
        slug: orgSlug,
        owner_id: userId,
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccessMsg("Workspace configured! Opening dashboard...");
        setTimeout(() => {
          router.push("/dashboard");
        }, 1200);
      }
    } catch (err: any) {
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col justify-between relative overflow-hidden">
        {/* Background Grids & Glows */}
        <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

        {/* Navigation Header */}
        <header className="border-b border-border bg-card/40 backdrop-blur-md relative z-10 animate-pulse">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-muted" />
              <div className="h-4 w-24 bg-muted/60 rounded" />
            </div>
            <div className="h-4 w-40 bg-muted/40 rounded hidden sm:inline-block" />
          </div>
        </header>

        {/* Central Wizard Card Skeleton */}
        <main className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
          <div className="w-full max-w-[480px]">
            <div className="premium-panel bg-card/60 backdrop-blur-xl p-8 sm:p-10 rounded-2xl shadow-soft space-y-6 animate-pulse">
              <div className="flex justify-between items-center">
                <div className="h-5 w-24 bg-muted rounded-full" />
                <div className="h-4 w-32 bg-muted/60 rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-6 w-48 bg-muted rounded" />
                <div className="h-3 w-full bg-muted/60 rounded" />
                <div className="h-3 w-2/3 bg-muted/60 rounded" />
              </div>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <div className="h-3.5 w-32 bg-muted rounded" />
                  <div className="h-10 w-full bg-muted/60 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <div className="h-3.5 w-28 bg-muted rounded" />
                  <div className="h-10 w-full bg-muted/60 rounded-xl" />
                </div>
              </div>
              <div className="h-12 w-full bg-muted rounded-xl mt-4" />
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground relative z-10 bg-card/20 animate-pulse">
          <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="h-4 w-48 bg-muted/40 rounded mx-auto sm:mx-0" />
            <div className="h-4 w-52 bg-muted/40 rounded mx-auto sm:mx-0" />
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between relative overflow-hidden">
      {/* Background Grids & Glows */}
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      {/* Simple Onboarding Navigation Header */}
      <header className="border-b border-border bg-card/40 backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/assets/logo.png" alt="Lead For Gen" width={32} height={32} className="h-8 w-8 object-contain" />
            <span className="font-bold tracking-tight text-sm">Lead For Gen</span>
          </div>
          {user && (
            <span className="text-xs text-muted-foreground hidden sm:inline-block">
              Logged in as <span className="font-medium text-foreground">{user.email}</span>
            </span>
          )}
        </div>
      </header>

      {/* Central Wizard Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <div className="w-full max-w-[480px]">
          <div className="premium-panel bg-card/60 backdrop-blur-xl p-8 sm:p-10 rounded-2xl shadow-soft space-y-6">
            
            {/* Progress / Step Badge */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wider">
                <Sparkles className="h-3 w-3" /> Step 1 of 1
              </span>
              <span className="text-xs text-muted-foreground font-medium">Configure workspace</span>
            </div>

            {/* Header Text */}
            <div className="space-y-1.5">
              <h1 className="text-2xl font-extrabold tracking-tight">Create your workspace</h1>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Set up your brand identity profile to start capturing leads, dispatching appointments, and sending estimates.
              </p>
            </div>

            {/* Status alerts */}
            {errorMsg && (
              <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-xs font-medium text-destructive">
                <p>{errorMsg}</p>
              </div>
            )}

            {successMsg && (
              <div className="rounded-xl border border-success/20 bg-success/5 p-3 text-xs font-medium text-success">
                <p>{successMsg}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleOnboardingSubmit} className="space-y-5">
              {/* Org Name */}
              <div className="space-y-1.5">
                <label htmlFor="orgName" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Organization / Business Name
                </label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                  <input
                    id="orgName"
                    type="text"
                    placeholder="Acme Service Pro"
                    value={orgName}
                    onChange={handleNameChange}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                  />
                </div>
              </div>

              {/* Org Slug */}
              <div className="space-y-1.5">
                <label htmlFor="orgSlug" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Workspace URL Slug
                </label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                  <input
                    id="orgSlug"
                    type="text"
                    placeholder="acme-service-pro"
                    value={orgSlug}
                    onChange={(e) => setOrgSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                  />
                </div>
                {orgSlug && (
                  <p className="text-[10px] text-muted-foreground/80 pl-1">
                    Your portal will be live at: <span className="font-semibold text-foreground">leadforgen.in/{orgSlug}</span>
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loadingSubmit}
                className="w-full h-12 rounded-xl gradient-brand-bg text-primary-foreground font-semibold text-sm shadow-glow hover:opacity-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 group mt-6"
              >
                {loadingSubmit ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Initialize Workspace
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Simple Footer footer info */}
      <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground relative z-10 bg-card/20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p>&copy; {new Date().getFullYear()} Lead For Gen. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <Check className="h-3.5 w-3.5 text-success" />
            <span>Workspace builds automatically in seconds</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
