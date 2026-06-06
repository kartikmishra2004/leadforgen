"use client";

import React, { useState, useEffect } from "react";
import { useWorkspace } from "../layout";
import { supabase } from "@/lib/supbase/client";
import { 
  Building, 
  Globe, 
  Save, 
  Check, 
  Mail, 
  Sparkles, 
  Lock, 
  Shield 
} from "lucide-react";

export default function BusinessProfilePage() {
  const { currentOrg, setCurrentOrg, user, setRlsErrors } = useWorkspace();
  const [orgName, setOrgName] = useState("");
  const [orgSlug, setOrgSlug] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync state with current workspace organization
  useEffect(() => {
    if (currentOrg) {
      setOrgName(currentOrg.name || "");
      setOrgSlug(currentOrg.slug || "");
    }
  }, [currentOrg]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim() || !orgSlug.trim()) {
      setErrorMsg("Business name and slug cannot be empty.");
      return;
    }

    setSaveStatus("saving");
    setErrorMsg(null);

    try {
      const { error } = await supabase
        .from("organizations")
        .update({
          name: orgName.trim(),
          slug: orgSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, ""),
          updated_at: new Date().toISOString()
        })
        .eq("id", currentOrg.id);

      if (error) {
        setErrorMsg(error.message);
        setSaveStatus("idle");
      } else {
        // Update context currentOrg state
        setCurrentOrg({
          ...currentOrg,
          name: orgName.trim(),
          slug: orgSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "")
        });
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2500);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
      setSaveStatus("idle");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-reveal-up relative py-4">
      {/* Background glow styling */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[350px] h-[180px] bg-primary/10 rounded-full blur-[80px] pointer-events-none -z-10" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            Business Profile Settings
          </h2>
          <p className="text-xs text-muted-foreground">Manage your workspace identity and brand configurations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Left column: Quick profile summary card */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-card border border-border rounded-2xl p-5 shadow-soft text-center space-y-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-secondary" />
            <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-tr from-primary/10 to-secondary/10 flex items-center justify-center font-bold text-xl text-primary shadow-soft">
              {orgName ? orgName.charAt(0).toUpperCase() : "O"}
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground truncate">{orgName || "Organization"}</h3>
              <p className="text-[10px] text-muted-foreground font-mono truncate mt-0.5">slug: {orgSlug || "pending"}</p>
            </div>
            <div className="pt-2 border-t border-border/60">
              <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary">
                <Shield className="h-3 w-3" />
                Workspace Owner
              </span>
            </div>
          </div>

          <div className="bg-muted/15 border border-border/50 rounded-2xl p-4 space-y-2.5 text-[10px] leading-relaxed text-muted-foreground">
            <div className="flex items-center gap-1.5 font-bold text-foreground mb-1">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>Workspace Info</span>
            </div>
            <p>Your URL slug defines where customers access your landing widgets, quoting pages, and direct bookings.</p>
            <p>Slug revisions update your workspace portal links instantly.</p>
          </div>
        </div>

        {/* Right column: Edit Form card */}
        <div className="md:col-span-2">
          <form onSubmit={handleSaveProfile} className="bg-card border border-border rounded-2xl p-6 shadow-soft space-y-5">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Identity Details</h3>

            {/* Error alerts */}
            {errorMsg && (
              <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-xs font-medium text-destructive">
                {errorMsg}
              </div>
            )}

            <div className="space-y-4 text-xs">
              {/* Business name input */}
              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground">Business / Organization Name</label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Service Pro"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground font-medium"
                  />
                </div>
              </div>

              {/* slug input */}
              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground">URL Slug</label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. acme-service-pro"
                    value={orgSlug}
                    onChange={(e) => setOrgSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    className="w-full pl-10 pr-4 py-2 bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground font-mono"
                  />
                </div>
                {orgSlug && (
                  <p className="text-[9px] text-muted-foreground pl-1">
                    Live Portal: <span className="font-semibold text-primary">leadforgen.in/{orgSlug}</span>
                  </p>
                )}
              </div>

              {/* Owner Email display */}
              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground flex items-center gap-1">
                  Owner Email Address <Lock className="h-3 w-3 text-muted-foreground/60" />
                </label>
                <div className="relative opacity-70">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                  <input
                    type="email"
                    disabled
                    value={user?.email || "owner@email.com"}
                    className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border/80 rounded-xl text-muted-foreground cursor-not-allowed font-medium"
                  />
                </div>
                <p className="text-[9px] text-muted-foreground pl-1">Account credentials cannot be modified here.</p>
              </div>
            </div>

            {/* Submit save button */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={saveStatus === "saving"}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-primary hover:bg-primary/95 text-primary-foreground rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                {saveStatus === "saving" ? (
                  "Saving Settings..."
                ) : saveStatus === "saved" ? (
                  <>
                    <Check className="h-4 w-4" />
                    Changes Saved!
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
