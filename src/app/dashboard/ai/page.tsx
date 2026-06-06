"use client";

import React, { useState } from "react";
import { useWorkspace } from "../layout";
import { 
  Bot, 
  Sparkles, 
  ArrowRight, 
  MessageSquare, 
  Cpu, 
  Volume2, 
  Zap,
  Mail,
  Check,
  User
} from "lucide-react";

export default function AIAssistantPage() {
  const { currentOrg } = useWorkspace();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loadingInterest, setLoadingInterest] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "voice">("chat");

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
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 w-[450px] h-[220px] bg-primary/10 rounded-full blur-[95px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-10 w-[250px] h-[250px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left Column: Info & Early Access Form */}
        <div className="lg:col-span-6 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary animate-pulse w-fit">
            <Bot className="h-3.5 w-3.5" />
            <span>AI Receptionist System</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]">
              AI Receptionist <br />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Booking Agents
              </span>
            </h1>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Delegate customer scheduling, support requests, and instant quote queries to automated AI receptionist agents. Custom-trained on the business details of{" "}
              <span className="font-semibold text-foreground">
                {currentOrg?.name || "your organization"}
              </span>{" "}
              to capture bookings 24/7.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {[
              { 
                icon: Cpu, 
                title: "Context-Aware Memory", 
                desc: "Remembers company pricing tiers, service details, and availability rules." 
              },
              { 
                icon: MessageSquare, 
                title: "Multi-Channel Deploy", 
                desc: "Integrate chat widgets on your website, WhatsApp, or SMS numbers." 
              },
              { 
                icon: Volume2, 
                title: "AI Voice Concierge", 
                desc: "Accept inbound customer phone calls with ultra-low latency response." 
              },
              { 
                icon: Zap, 
                title: "Instant Sync CRM", 
                desc: "Qualified lead details are logged automatically under customer databases." 
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

          {/* Subscribe form */}
          <div className="pt-4 max-w-md">
            {!submitted ? (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">
                  Get notified when AI Receptionists launch
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
                        Request Beta Access
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
                  <h4 className="text-xs font-bold">Beta Request Received!</h4>
                  <p className="text-[10px] opacity-80">We will update you as soon as test seats become available.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Premium Mockup Conversation Preview */}
        <div className="lg:col-span-6 relative flex justify-center items-center">
          <div className="w-full max-w-md border border-border/80 rounded-2xl bg-card/30 backdrop-blur-xl shadow-soft overflow-hidden flex flex-col aspect-video sm:aspect-[4/3] transition-all hover:border-primary/30">
            {/* Mock Chat Header */}
            <div className="px-4 py-2 border-b border-border/60 flex items-center justify-between bg-card/50">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                <span className="text-[10px] font-bold text-foreground">AI receptionist playground</span>
              </div>
              <div className="flex bg-muted/60 rounded-lg p-0.5 border border-border/30 text-[9px] font-semibold text-muted-foreground">
                <button 
                  onClick={() => setActiveTab("chat")}
                  className={`px-2 py-0.5 rounded transition-colors ${activeTab === "chat" ? "bg-card text-foreground shadow-sm" : ""}`}
                >
                  Web Widget
                </button>
                <button 
                  onClick={() => setActiveTab("voice")}
                  className={`px-2 py-0.5 rounded transition-colors ${activeTab === "voice" ? "bg-card text-foreground shadow-sm" : ""}`}
                >
                  Phone Bot
                </button>
              </div>
            </div>

            {/* Mock Conversation View */}
            <div className="flex-1 p-4 bg-muted/5 relative overflow-hidden flex flex-col justify-center items-center">
              {/* Blurred chat list background */}
              <div className="absolute inset-0 p-4 space-y-3 filter blur-[3px] opacity-25 select-none pointer-events-none flex flex-col justify-end">
                <div className="flex items-start gap-2 max-w-[80%]">
                  <div className="h-6 w-6 rounded-full bg-primary/20" />
                  <div className="bg-card/40 p-2.5 rounded-xl space-y-1 w-full">
                    <div className="h-2 w-1/3 bg-foreground/20 rounded" />
                    <div className="h-2 w-full bg-foreground/15 rounded" />
                  </div>
                </div>
                <div className="flex items-start gap-2 max-w-[80%] ml-auto flex-row-reverse">
                  <div className="h-6 w-6 rounded-full bg-primary/20" />
                  <div className="bg-primary/10 p-2.5 rounded-xl space-y-1 w-full">
                    <div className="h-2 w-2/3 bg-foreground/15 rounded" />
                  </div>
                </div>
                <div className="flex items-start gap-2 max-w-[80%]">
                  <div className="h-6 w-6 rounded-full bg-primary/20" />
                  <div className="bg-card/40 p-2.5 rounded-xl space-y-1 w-full">
                    <div className="h-2.5 w-1/2 bg-primary/20 rounded" />
                    <div className="h-2 w-5/6 bg-foreground/15 rounded" />
                  </div>
                </div>
              </div>

              {/* Glass Coming Soon Card overlay */}
              <div className="z-10 p-5 rounded-2xl border border-border bg-card/75 backdrop-blur-md max-w-xs text-center space-y-3.5 shadow-soft animate-reveal-up">
                <div className="mx-auto w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-primary-foreground shadow-md">
                  <Sparkles className="h-5 w-5 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold text-foreground">Interactive Playground</h3>
                  <p className="text-[10px] text-muted-foreground leading-normal">
                    Finetuning scheduling pipelines and natural language understanding models. 
                  </p>
                </div>

                {/* Progress bar info */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[8px] font-bold text-muted-foreground">
                    <span>LAUNCH PROGRESS</span>
                    <span className="text-primary font-black">92% COMPLETE</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden border border-border/20 p-[1px]">
                    <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full w-[92%]" />
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
