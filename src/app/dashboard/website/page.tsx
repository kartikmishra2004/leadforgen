"use client";

import React, { useState } from "react";
import { useWorkspace } from "../layout";
import { 
  Globe, 
  Sparkles, 
  ArrowRight, 
  Layers, 
  Smartphone, 
  Laptop, 
  Palette, 
  Calendar, 
  Zap,
  Mail,
  Check
} from "lucide-react";

export default function WebsiteBuilderPage() {
  const { currentOrg } = useWorkspace();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState<"desktop" | "mobile">("desktop");
  const [loadingInterest, setLoadingInterest] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    setLoadingInterest(true);
    setTimeout(() => {
      setLoadingInterest(false);
      setSubmitted(true);
      setEmail("");
    }, 800);
  };

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center py-4 px-2 animate-reveal-up relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[450px] h-[220px] bg-primary/10 rounded-full blur-[90px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-10 w-[250px] h-[250px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left Column: Coming Soon Copy & Interactive Early Access */}
        <div className="lg:col-span-6 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary animate-pulse w-fit">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Under Active Development</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]">
              White-Labeled <br />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Page Builder
              </span>
            </h1>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Launch high-converting, mobile-friendly landing pages tailored to{" "}
              <span className="font-semibold text-foreground">
                {currentOrg?.name || "your business"}
              </span>{" "}
              in minutes. Set up custom domains, showcase pricing plans, and capture bookings directly into your dashboard.
            </p>
          </div>

          {/* Feature Highlight Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {[
              { 
                icon: Palette, 
                title: "Brand Customization", 
                desc: "Configure brand colors, layouts, and custom logos." 
              },
              { 
                icon: Globe, 
                title: "Domain Mapping", 
                desc: "Connect your custom web domains instantly." 
              },
              { 
                icon: Calendar, 
                title: "Lead Capture & Booking", 
                desc: "Accept quotes and schedule appointments directly." 
              },
              { 
                icon: Zap, 
                title: "AI Layout Assistant", 
                desc: "Auto-generate engaging copy and pages with AI." 
              }
            ].map((feature, i) => (
              <div 
                key={i} 
                className="flex gap-3 p-3.5 rounded-xl border border-border bg-card/40 hover:bg-card hover:border-primary/30 transition-all duration-300 shadow-sm"
              >
                <div className="p-2 rounded-lg bg-primary/10 text-primary h-fit shrink-0">
                  <feature.icon className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-xs font-bold text-foreground">{feature.title}</h3>
                  <p className="text-[10px] text-muted-foreground leading-tight">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Interest Form */}
          <div className="pt-4 max-w-md">
            {!submitted ? (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">
                  Get notified when the Page Builder launches
                </label>
                <div className="flex gap-2 p-1.5 rounded-xl border border-border bg-card/60 backdrop-blur-md focus-within:ring-1 focus-within:ring-primary focus-within:border-primary/50 transition-all">
                  <div className="flex items-center pl-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 min-w-0 bg-transparent border-0 px-2 py-1 text-xs focus:ring-0 focus:outline-none text-foreground"
                  />
                  <button
                    type="submit"
                    disabled={loadingInterest}
                    className="px-4 py-1.5 bg-primary hover:bg-primary/95 disabled:opacity-50 text-primary-foreground rounded-lg text-xs font-bold transition-all flex items-center gap-1 shrink-0 shadow-md"
                  >
                    {loadingInterest ? "Registering..." : (
                      <>
                        Notify Me
                        <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center gap-3 p-4 rounded-xl border border-success/20 bg-success/5 text-success animate-reveal-up">
                <div className="p-2 bg-success/10 rounded-lg">
                  <Check className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold">Interest Registered!</h4>
                  <p className="text-[10px] opacity-80">We will notify you the moment this module goes live.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Premium Visual Glassmorphic Mockup */}
        <div className="lg:col-span-6 relative flex justify-center items-center">
          <div className="w-full max-w-md border border-border/80 rounded-2xl bg-card/30 backdrop-blur-xl shadow-soft overflow-hidden flex flex-col aspect-video sm:aspect-[4/3] transition-all hover:border-primary/30">
            {/* Mock Browser Header */}
            <div className="px-4 py-2 border-b border-border/60 flex items-center justify-between bg-card/50">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
              </div>
              <div className="flex items-center gap-1.5 px-3 py-0.5 bg-muted/60 rounded-lg border border-border/30 text-[9px] font-mono text-muted-foreground w-40 justify-center truncate">
                <Globe className="h-2.5 w-2.5 shrink-0" />
                <span>builder.leadforgen.com</span>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setActivePreviewTab("desktop")}
                  className={`p-1 rounded transition-colors ${activePreviewTab === "desktop" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}
                >
                  <Laptop className="h-3 w-3" />
                </button>
                <button 
                  onClick={() => setActivePreviewTab("mobile")}
                  className={`p-1 rounded transition-colors ${activePreviewTab === "mobile" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}
                >
                  <Smartphone className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Mock Editor Canvas Area */}
            <div className="flex-1 p-4 bg-muted/5 relative overflow-hidden flex flex-col justify-center items-center">
              {/* Blurred abstract builder mockup background */}
              <div className="absolute inset-0 p-4 space-y-4 filter blur-[3px] opacity-30 select-none pointer-events-none flex flex-col justify-between">
                <div className="flex justify-between items-center border-b border-border/30 pb-2">
                  <div className="h-3 w-16 bg-foreground/30 rounded" />
                  <div className="flex gap-1.5">
                    <div className="h-3 w-8 bg-foreground/20 rounded" />
                    <div className="h-3 w-8 bg-foreground/20 rounded" />
                  </div>
                </div>
                
                <div className="flex-1 flex gap-4 my-2">
                  <div className="w-1/3 border border-border/20 rounded p-2 space-y-2 bg-card/20">
                    <div className="h-2 w-full bg-foreground/20 rounded" />
                    <div className="h-1.5 w-2/3 bg-foreground/15 rounded" />
                    <div className="h-3 w-full bg-primary/20 rounded" />
                  </div>
                  <div className="flex-1 border border-border/20 rounded p-2 space-y-2 bg-card/20 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="h-3 w-1/2 bg-foreground/30 rounded" />
                      <div className="h-2 w-full bg-foreground/15 rounded" />
                    </div>
                    <div className="h-14 w-full bg-muted/30 rounded border border-dashed border-border/40 flex items-center justify-center animate-pulse">
                      <div className="h-3 w-12 bg-foreground/10 rounded" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Glass Coming Soon Panel */}
              <div className="z-10 p-5 rounded-2xl border border-border bg-card/70 backdrop-blur-md max-w-xs text-center space-y-3.5 shadow-soft animate-reveal-up">
                <div className="mx-auto w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-primary-foreground shadow-md">
                  <Layers className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold text-foreground">Interactive Builder</h3>
                  <p className="text-[10px] text-muted-foreground leading-normal">
                    Drag-and-drop landing page components to build customized sections for your services and schedules.
                  </p>
                </div>

                {/* Progress bar info */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[8px] font-bold text-muted-foreground">
                    <span>DEVELOPMENT</span>
                    <span className="text-primary font-black">85% COMPLETE</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden border border-border/20 p-[1px]">
                    <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full w-[85%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
