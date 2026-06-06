"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Bot, Check, Menu, Sparkles, Star, X, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { supabase } from "@/lib/supbase/client";
import { cn } from "@/lib/utils";

const dashboardHero = "/assets/dashboard-hero.png";
const aiVisual = "/assets/ai-visual.jpg";
const logo = "/assets/logo.png";
const websiteBuilder = "/assets/website-builder.jpg";

const Container = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`mx-auto w-full max-w-7xl px-6 lg:px-8 ${className}`}>{children}</div>
);

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary backdrop-blur">
    <Sparkles className="h-3.5 w-3.5" />
    {children}
  </div>
);

const GradientButton = ({ children, className, ...props }: React.ComponentProps<"button">) => (
  <button
    {...props}
    className={cn("group inline-flex h-12 items-center justify-center gap-2 rounded-lg gradient-brand-bg px-7 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02] active:scale-[0.99]", className)}
  >
    {children}
    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
  </button>
);

const GhostButton = ({ children, className, ...props }: React.ComponentProps<"button">) => (
  <button
    {...props}
    className={cn("inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-border bg-card/70 px-7 text-sm font-semibold text-foreground backdrop-blur transition-colors hover:bg-card", className)}
  >
    {children}
  </button>
);

function Nav() {
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const links = ["Features", "Industries", "Pricing", "FAQ"];

  useEffect(() => {
    async function checkSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsLoggedIn(!!session?.user);
      } catch (err) {
        console.error("Failed to query session", err);
      }
    }
    checkSession();
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setIsLoggedIn(false);
    } catch (err) {
      console.error("Failed to sign out", err);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <Container className="flex h-16 items-center justify-between">
        <a href="#" className="flex items-center gap-2">
          <img src={logo} alt="Lead For Gen" width={40} height={40} className="h-10 w-10 object-contain" />
        </a>
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a key={link} href={`#${link.toLowerCase()}`} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              {link}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          {isLoggedIn ? (
            <Link href="/dashboard">
              <GradientButton className="h-10 px-5.5 text-xs">Dashboard</GradientButton>
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Sign in
              </Link>
              <Link href="/signup">
                <GradientButton className="h-10 px-5.5 text-xs">Start Free Trial</GradientButton>
              </Link>
            </>
          )}
        </div>
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
          <Menu className="h-6 w-6" />
        </button>
      </Container>
      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <Container className="flex flex-col gap-4 py-4">
            {links.map((link) => (
              <a key={link} href={`#${link.toLowerCase()}`} className="text-sm font-medium">{link}</a>
            ))}
            {isLoggedIn ? (
              <Link href="/dashboard" className="w-full">
                <GradientButton className="w-full h-10 text-xs">Dashboard</GradientButton>
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground py-1 text-center">
                  Sign in
                </Link>
                <Link href="/signup" className="w-full">
                  <GradientButton className="w-full h-10 text-xs">Start Free Trial</GradientButton>
                </Link>
              </>
            )}
          </Container>
        </div>
      )}
    </header>
  );
}

function Hero() {
  const trust = ["White-labeled websites", "AI-powered automation", "Appointment booking", "Lead management", "Customer CRM"];
  const heroAvatars = [
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&h=100&q=80",
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&h=100&q=80",
  ];

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 gradient-hero-bg" />
      <div className="absolute inset-0 grid-bg" />
      <Container className="relative pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto inline-flex items-center gap-3 rounded-full border border-border bg-card/70 px-4 py-1.5 text-xs font-medium text-foreground backdrop-blur-md shadow-soft">
            <div className="flex -space-x-1.5">
              {heroAvatars.map((url, i) => (
                <img 
                  key={i} 
                  src={url} 
                  alt={`User avatar ${i + 1}`} 
                  className="h-5 w-5 rounded-full border-2 border-background object-cover" 
                />
              ))}
            </div>
            <span className="text-muted-foreground">Trusted by</span>
            <span className="font-semibold">2,400+ service businesses</span>
            <div className="flex items-center gap-0.5" style={{ color: "oklch(0.78 0.16 75)" }}>
              {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-current" />)}
            </div>
          </div>

          <h1 className="mt-7 text-5xl leading-[1.02] tracking-[-0.04em] text-foreground sm:text-6xl lg:text-[5.25rem]">
            <span className="font-extrabold">Grow Smarter,</span>{" "}
            <span className="font-serif-display italic gradient-text">Book&nbsp;Faster</span>
            <br />
            <span className="font-extrabold">with </span>
            <span className="font-extrabold gradient-text">Lead For Gen</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Capture leads, book appointments, send quotes, manage customers, and automate with AI - all in one premium platform built for modern service businesses.
          </p>

          <form onSubmit={(e) => e.preventDefault()} className="mx-auto mt-9 flex w-full max-w-xl flex-col items-stretch gap-2 rounded-2xl border border-border bg-card/80 p-2 shadow-soft backdrop-blur-md sm:flex-row sm:items-center sm:rounded-full sm:p-1.5">
            <input
              type="email"
              placeholder="Enter your work email"
              className="min-w-0 flex-1 rounded-xl bg-transparent px-4 py-2.5 text-center text-sm text-foreground placeholder:text-muted-foreground focus:outline-none sm:rounded-full sm:px-5 sm:py-3 sm:text-left"
            />
            <button type="submit" className="group inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full gradient-brand-bg px-6 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02] sm:h-11">
              Request a Demo
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </form>

          <p className="mx-auto mt-3 max-w-xs text-balance text-xs leading-5 text-muted-foreground sm:max-w-none">14-day free trial - No credit card required - Cancel anytime</p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {trust.map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <Check className="h-4 w-4" style={{ color: "oklch(0.7 0.16 162)" }} />
                {item}
              </div>
            ))}
          </div>
        </div>

        <img src={dashboardHero} alt="Lead For Gen dashboard" width={1920} height={1080} className="mx-auto mt-16 w-full max-w-6xl rounded-3xl lg:rounded-[32px] border border-border/50 shadow-glow" />
      </Container>
    </section>
  );
}

function Problem() {
  const pains = [
    ["Website", "Built in one tool, tracked in another"],
    ["Booking", "Calendar gaps create missed revenue"],
    ["Quotes", "Manual follow-ups slow every deal"],
    ["CRM", "Customer history scattered across tabs"],
    ["AI", "Automation sits outside the workflow"],
    ["Reporting", "No single view of what is working"],
  ];

  return (
    <section className="relative overflow-hidden py-24">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
      <Container>
        <div className="grid items-start gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <SectionLabel>The problem</SectionLabel>
            <h2 className="mt-6 max-w-2xl text-4xl font-bold sm:text-5xl">
              Growth leaks through every disconnected handoff.
            </h2>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              Service teams do not lose leads because they lack tools. They lose them because the tools do not move together.
            </p>
            <div className="mt-10 grid max-w-xl grid-cols-3 overflow-hidden rounded-md border border-border bg-card shadow-card">
              {[
                ["10+", "apps stitched"],
                ["38%", "slower replies"],
                ["1", "source needed"],
              ].map(([value, label]) => (
                <div key={label} className="border-r border-border p-5 last:border-r-0">
                  <p className="text-3xl font-extrabold tracking-tight gradient-text">{value}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="premium-panel relative overflow-hidden p-3">
            <div className="absolute inset-0 grid-bg opacity-40" />
            <div className="relative rounded-md border border-border/80 bg-background/80 p-4 backdrop-blur">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted-foreground">Ops audit</p>
                  <h3 className="mt-1 text-xl font-bold">Disconnected revenue flow</h3>
                </div>
                <span className="rounded-md bg-destructive/10 px-3 py-1 text-xs font-bold text-destructive">Friction high</span>
              </div>
              <div className="divide-y divide-border">
                {pains.map(([label, detail], index) => (
                  <div key={label} className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 py-4">
                    <span className="font-mono text-xs text-muted-foreground">0{index + 1}</span>
                    <div>
                      <p className="text-sm font-bold">{label}</p>
                      <p className="text-sm text-muted-foreground">{detail}</p>
                    </div>
                    <X className="h-4 w-4 text-destructive/70 transition-transform group-hover:rotate-90" />
                  </div>
                ))}
              </div>
              <div className="rounded-md bg-muted/70 p-4">
                <p className="text-sm font-semibold">
                  Lead For Gen replaces the patchwork with a single conversion system from first visit to booked customer.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    ["Website visit", "High-intent visitors land on a branded service page."],
    ["Instant capture", "Booking and quote requests become structured leads."],
    ["AI triage", "Lead For Gen qualifies, routes, and drafts the next best action."],
    ["Revenue action", "Your team confirms, quotes, and wins from one workspace."],
  ];

  return (
    <section className="relative overflow-hidden py-24" style={{ background: "var(--gradient-brand-soft)" }}>
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <SectionLabel>How it works</SectionLabel>
            <h2 className="mt-6 text-4xl font-bold sm:text-5xl">A managed path from visitor to booked revenue.</h2>
            <p className="mt-5 text-lg text-muted-foreground">
              Every step is designed as a handoff, not a separate module. The result feels calm for teams and instant for customers.
            </p>
            <div className="mt-8">
              <GradientButton>See the workflow</GradientButton>
            </div>
          </div>
          <div className="premium-panel relative overflow-hidden p-6">
            <div className="absolute left-10 top-12 bottom-12 w-px bg-gradient-to-b from-primary/10 via-primary/40 to-primary/10" />
            <div className="space-y-5">
              {steps.map(([title, detail], index) => (
                <div key={title} className="reveal-up relative grid grid-cols-[3.5rem_1fr] gap-5" style={{ animationDelay: `${index * 90}ms` }}>
                  <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-md border border-primary/20 bg-background text-sm font-extrabold text-primary shadow-soft">
                    {index + 1}
                  </div>
                  <div className="rounded-md border border-border bg-card/80 p-5 shadow-card transition-transform hover:-translate-y-0.5">
                    <h3 className="text-lg font-bold">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-md border border-primary/15 bg-primary/5 p-4">
              <p className="text-sm font-semibold text-primary">Average first response drops from hours to minutes.</p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function Platform() {
  const items = [
    { t: "Lead pipeline", d: "Capture, qualify, assign, and follow up without spreadsheet drift.", span: "lg:col-span-2" },
    { t: "Booking engine", d: "Customer-ready scheduling tied to service availability.", span: "" },
    { t: "Quote desk", d: "Branded estimates with customer context already attached.", span: "" },
    { t: "AI operator", d: "Assistants for chat, intake, summaries, and FAQ coverage.", span: "" },
    { t: "Website studio", d: "Launch pages, galleries, testimonials, and service forms from one brand hub.", span: "lg:col-span-2" },
    { t: "Reporting layer", d: "Know which channel, page, and follow-up converted the job.", span: "" },
  ];

  return (
    <section id="features" className="py-24">
      <Container>
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <SectionLabel>Platform overview</SectionLabel>
            <h2 className="mt-6 text-4xl font-bold sm:text-5xl">One operating system for service-business growth.</h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-muted-foreground">
            Built as connected surfaces, not add-ons. Each area feeds the next with customer context intact.
          </p>
        </div>
        <div className="mt-14 grid auto-rows-[minmax(210px,auto)] gap-4 md:grid-cols-2 lg:grid-cols-4">
          {items.map((item, index) => (
            <div key={item.t} className={`bento-card group ${item.span}`}>
              <div className="flex h-full flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-muted-foreground">0{index + 1}</span>
                    <span className="h-2 w-2 rounded-full bg-primary/70" />
                  </div>
                  <h3 className="mt-8 text-2xl font-bold">{item.t}</h3>
                  <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">{item.d}</p>
                </div>
                <div className="mt-8 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-2/3 rounded-full gradient-brand-bg transition-all duration-500 group-hover:w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function WebsiteBuilder() {
  const features = ["Brand controls", "Service pages", "Quote forms", "Booking embeds", "Gallery blocks", "Testimonials"];

  return (
    <section className="py-24">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <SectionLabel>Website builder</SectionLabel>
            <h2 className="mt-6 text-4xl font-bold sm:text-5xl">A website studio tuned for booked jobs.</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Launch a polished service site that already knows how to capture quotes, book visits, and route leads.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-3 text-sm font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {feature}
                </div>
              ))}
            </div>
            <div className="mt-8"><GradientButton>Create Your Website</GradientButton></div>
          </div>
          <div className="premium-panel overflow-hidden p-3">
            <div className="rounded-md border border-border bg-card shadow-card">
              <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-accent" />
                <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                <span className="ml-3 rounded-md bg-muted px-3 py-1 text-xs text-muted-foreground">leadforgen.in/dashboard/website</span>
              </div>
              <div className="grid gap-0 lg:grid-cols-[0.72fr_0.28fr]">
                <img src={websiteBuilder} alt="Website builder" width={1400} height={1000} loading="lazy" className="h-full w-full object-cover" />
                <div className="border-t border-border bg-background p-5 lg:border-l lg:border-t-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Launch checklist</p>
                  <div className="mt-5 space-y-4">
                    {["Domain connected", "Quote flow active", "Booking calendar live"].map((item) => (
                      <div key={item} className="flex items-center gap-3 text-sm font-semibold">
                        <Check className="h-4 w-4 text-primary" />
                        {item}
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 rounded-md bg-primary/5 p-4">
                    <p className="text-3xl font-extrabold gradient-text">12m</p>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">average launch</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function Dashboard() {
  const modules = [
    ["Leads", "+214"],
    ["Appointments", "86%"],
    ["Quotes", "$42k"],
    ["AI handled", "1.8k"],
  ];

  return (
    <section className="relative overflow-hidden py-24" style={{ background: "oklch(0.21 0.04 265)" }}>
      <div className="absolute inset-0 opacity-30 grid-bg" />
      <Container className="relative">
        <div className="grid gap-10 lg:grid-cols-[0.72fr_0.28fr] lg:items-center">
          <div>
            <div className="max-w-3xl text-white">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                Unified dashboard
              </div>
              <h2 className="mt-6 text-4xl font-bold sm:text-5xl">A command center, not a collection of tabs.</h2>
              <p className="mt-5 text-lg text-white/65">
                Pipeline, calendar, quote desk, customer context, and AI work queues stay visible in one executive view.
              </p>
            </div>
            <img src={dashboardHero} alt="Dashboard" width={1920} height={1080} loading="lazy" className="mt-12 w-full rounded-3xl border border-white/10 shadow-2xl" />
          </div>
          <div className="space-y-4">
            {modules.map(([label, value], index) => (
              <div key={label} className="rounded-md border border-white/10 bg-white/[0.06] p-5 text-white backdrop-blur">
                <p className="font-mono text-xs text-white/45">0{index + 1}</p>
                <p className="mt-4 text-3xl font-extrabold">{value}</p>
                <p className="mt-1 text-sm text-white/60">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

function AIFeatures() {
  const feats = [
    ["Qualify", "Ask the right intake questions before your team steps in."],
    ["Summarize", "Turn calls and chats into usable customer context."],
    ["Route", "Send urgent, high-value jobs to the right person first."],
    ["Respond", "Answer common questions while preserving your brand voice."],
  ];

  return (
    <section className="py-24">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="premium-panel order-2 overflow-hidden p-3 lg:order-1">
            <div className="relative overflow-hidden rounded-md border border-border">
              <img src={aiVisual} alt="AI" width={1200} height={900} loading="lazy" className="w-full" />
              <div className="absolute inset-x-4 bottom-4 rounded-md border border-white/20 bg-background/85 p-4 shadow-soft backdrop-blur">
                <div className="flex items-center gap-3">
                  <Bot className="h-5 w-5 text-primary" />
                  <p className="text-sm font-bold">AI assistant prepared a quote follow-up</p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Uses lead source, service type, and availability to recommend the next action.</p>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <SectionLabel>AI features</SectionLabel>
            <h2 className="mt-6 text-4xl font-bold sm:text-5xl">AI that works inside the revenue workflow.</h2>
            <div className="mt-8 divide-y divide-border border-y border-border">
              {feats.map(([title, detail]) => (
                <div key={title} className="group grid grid-cols-[7rem_1fr] gap-5 py-5">
                  <p className="text-sm font-extrabold text-primary">{title}</p>
                  <div>
                    <p className="text-sm leading-6 text-muted-foreground">{detail}</p>
                    <div className="mt-3 h-px w-12 bg-primary/40 transition-all duration-300 group-hover:w-28" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function Industries() {
  const list = ["Cleaning services", "Landscaping", "Roofing", "HVAC", "Plumbing", "Dentists", "Consultants", "Law firms", "Fitness coaches"];

  return (
    <section id="industries" className="overflow-hidden py-24" style={{ background: "var(--gradient-brand-soft)" }}>
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <SectionLabel>Industries</SectionLabel>
          <h2 className="mt-6 text-4xl font-bold sm:text-5xl">Flexible enough for every appointment-led business.</h2>
          <p className="mt-5 text-lg text-muted-foreground">
            The workflow stays the same. The services, intake questions, quote templates, and customer journey adapt.
          </p>
        </div>
      </Container>
      <div className="marquee-mask mt-14">
        <div className="marquee-track">
          {[...list, ...list].map((item, index) => (
            <div key={`${item}-${index}`} className="marquee-item">{item}</div>
          ))}
        </div>
        <div className="marquee-track marquee-track-reverse mt-4">
          {[...list.slice().reverse(), ...list.slice().reverse()].map((item, index) => (
            <div key={`${item}-${index}`} className="marquee-item marquee-item-soft">{item}</div>
          ))}
        </div>
      </div>
      <Container>
        <div className="mx-auto mt-14 grid max-w-5xl gap-4 md:grid-cols-3">
          {["Custom intake", "Quote templates", "Booking rules"].map((item) => (
            <div key={item} className="border-t border-border pt-5">
              <p className="text-lg font-bold">{item}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Configured per industry without changing the core operating model.</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function Benefits() {
  const items = [
    ["+38%", "conversion lift", "Faster routing, cleaner forms, and fewer missed replies."],
    ["4.8x", "lead velocity", "New requests become assigned opportunities instantly."],
    ["71%", "less admin", "AI and templates remove repetitive sales coordination."],
  ];

  return (
    <section className="py-24">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <SectionLabel>Benefits</SectionLabel>
            <h2 className="mt-6 text-4xl font-bold sm:text-5xl">Outcomes leadership can actually track.</h2>
          </div>
          <p className="max-w-xl text-lg text-muted-foreground">
            Lead For Gen turns front-office activity into visible growth signals, from first response to booked revenue.
          </p>
        </div>
        <div className="mt-14 grid gap-4 lg:grid-cols-3">
          {items.map(([value, label, detail], index) => (
            <div key={label} className="premium-panel group p-7">
              <div className="flex items-start justify-between">
                <p className="text-5xl font-extrabold tracking-tight gradient-text">{value}</p>
                <span className="font-mono text-xs text-muted-foreground">0{index + 1}</span>
              </div>
              <h3 className="mt-8 text-xl font-bold capitalize">{label}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{detail}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function Comparison() {
  const rows = [
    ["Website + conversion forms", "Native", "Multiple tools"],
    ["CRM + customer timeline", "Built in", "Separate records"],
    ["Booking + quote flow", "Connected", "Manual handoff"],
    ["AI assistant", "Included", "Extra cost"],
    ["Reporting", "End-to-end", "Fragmented"],
    ["White labeling", "Plan-ready", "Limited"],
  ] as const;

  return (
    <section className="py-24">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <SectionLabel>Comparison</SectionLabel>
          <h2 className="mt-6 text-4xl font-bold sm:text-5xl">One premium platform instead of a fragile stack.</h2>
        </div>
        <div className="mx-auto mt-12 max-w-5xl overflow-hidden rounded-md border border-border bg-card shadow-card">
          <div className="grid grid-cols-[1.1fr_0.9fr_0.9fr] border-b border-border bg-muted/50">
            <div className="p-5 font-bold">Feature</div>
            <div className="p-5 text-center font-bold gradient-text">Lead For Gen</div>
            <div className="p-5 text-center font-bold text-muted-foreground">Traditional Setup</div>
          </div>
          {rows.map(([feature, ours, theirs]) => (
            <div key={feature} className="grid grid-cols-[1.1fr_0.9fr_0.9fr] border-b border-border last:border-0">
              <div className="p-5 font-medium">{feature}</div>
              <div className="flex items-center justify-center border-x border-border bg-primary/[0.04] p-5 text-center text-sm font-bold text-primary">
                {ours}
              </div>
              <div className="p-5 text-center text-sm text-muted-foreground">{theirs}</div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function Testimonials() {
  const items = [
    { 
      n: "Maria Lopez", 
      b: "Sparkle Cleaning Co.", 
      ind: "Cleaning", 
      q: "We tripled our bookings in 3 months. The AI assistant alone replaced a part-time hire.",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80"
    },
    { 
      n: "James Carter", 
      b: "Carter HVAC", 
      ind: "HVAC", 
      q: "Quotes go out in minutes, not days. Our close rate jumped by 42%.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80"
    },
    { 
      n: "Dr. Priya Shah", 
      b: "Bright Smile Dental", 
      ind: "Dentistry", 
      q: "Patient bookings, reminders, and intake finally feel like one calm system.",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80"
    },
    { 
      n: "Tom Reilly", 
      b: "Reilly Roofing", 
      ind: "Roofing", 
      q: "Best ROI tool we have adopted. The branded website paid for itself in week one.",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80"
    },
    { 
      n: "Alex Nguyen", 
      b: "GreenScape", 
      ind: "Landscaping", 
      q: "Leads stop falling through the cracks. Period.",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&h=150&q=80"
    },
    { 
      n: "Sarah Kim", 
      b: "Kim Legal Group", 
      ind: "Law", 
      q: "Consultation booking and intake in one place. Clients love it.",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80"
    },
  ];

  return (
    <section className="overflow-hidden py-24" style={{ background: "var(--gradient-brand-soft)" }}>
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <SectionLabel>Loved by service pros</SectionLabel>
          <h2 className="mt-6 text-4xl font-bold sm:text-5xl">Operators describe it as calmer growth.</h2>
        </div>
      </Container>
      <div className="marquee-mask mt-14">
        <div className="marquee-track marquee-track-slow">
          {[...items, ...items].map((item, index) => (
            <div key={`${item.n}-${index}`} className="w-[340px] shrink-0 rounded-md border border-border bg-card p-6 shadow-card">
              <div className="flex gap-1 text-primary">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <p className="mt-4 text-foreground">&quot;{item.q}&quot;</p>
              <div className="mt-6 flex items-center gap-3">
                {item.avatar ? (
                  <img 
                    src={item.avatar} 
                    alt={item.n} 
                    className="h-11 w-11 rounded-full object-cover border border-border/80" 
                  />
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-full gradient-brand-bg text-sm font-bold text-primary-foreground">
                    {item.n.split(" ").map((part) => part[0]).join("")}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold">{item.n}</p>
                  <p className="text-xs text-muted-foreground">{item.b} - {item.ind}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const plans = [
    {
      name: "Starter", price: 49, tag: "Small businesses", popular: false,
      f: ["1 Website", "500 Leads / month", "Unlimited Appointments", "500 AI Credits", "Custom Subdomain"],
    },
    {
      name: "Growth", price: 129, tag: "Growing teams", popular: true,
      f: ["3 Websites", "5,000 Leads / month", "Unlimited Appointments", "5,000 AI Credits", "Custom Domain"],
    },
    {
      name: "Pro", price: 299, tag: "Multi-location businesses", popular: false,
      f: ["Unlimited Websites", "Unlimited Leads", "Unlimited Appointments", "25,000 AI Credits", "Custom Domains + White Label"],
    },
  ];

  return (
    <section id="pricing" className="py-24">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <SectionLabel>Pricing</SectionLabel>
          <h2 className="mt-6 text-4xl font-bold sm:text-5xl">Simple <span className="gradient-text">Pricing</span></h2>
          <p className="mt-4 text-lg text-muted-foreground">Start free. Upgrade as you grow. Cancel anytime.</p>
        </div>
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-md border p-8 shadow-card transition-all hover:-translate-y-1 ${plan.popular ? "border-transparent bg-card shadow-glow ring-2 ring-primary" : "border-border bg-card"
                }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-brand-bg text-primary-foreground">Most Popular</Badge>
              )}
              <h3 className="text-xl font-bold">{plan.name}</h3>
              <p className="text-sm text-muted-foreground">{plan.tag}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-5xl font-extrabold tracking-tight">${plan.price}</span>
                <span className="text-muted-foreground">/mo</span>
              </div>
              <ul className="mt-6 space-y-3">
                {plan.f.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "oklch(0.7 0.16 162)" }} /> {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link href="/signup">
                  {plan.popular ? <GradientButton>Start Free Trial</GradientButton> : <GhostButton>Start Free Trial</GhostButton>}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function FAQ() {
  const qs = [
    ["What is Lead For Gen?", "An all-in-one platform that combines a website builder, CRM, appointment booking, quoting, customer management, and AI automation built for local service businesses."],
    ["Do I need technical skills?", "No. Everything is no-code. Launch your branded website and start capturing leads in minutes."],
    ["Can I use my own domain?", "Yes. Connect any custom domain on Growth and Pro plans."],
    ["Does it support appointment booking?", "Yes. Real-time calendar booking with confirmations, reminders, and rescheduling."],
    ["Can customers request quotes?", "Absolutely. Customers request quotes from your website and you send branded estimates in a few clicks."],
    ["Are AI features included?", "Yes. AI chat, lead qualification, call summaries, and FAQ assistant are included on every plan."],
    ["Can I manage multiple businesses?", "Yes. Growth and Pro support multiple websites and brand profiles."],
    ["Is there a free trial?", "Yes - 14 days, no credit card required."],
  ];

  return (
    <section id="faq" className="py-24">
      <Container className="max-w-3xl">
        <div className="text-center">
          <SectionLabel>FAQ</SectionLabel>
          <h2 className="mt-6 text-4xl font-bold sm:text-5xl">Frequently Asked <span className="gradient-text">Questions</span></h2>
        </div>
        <Accordion type="single" collapsible className="mt-12 w-full">
          {qs.map(([q, a], i) => (
            <AccordionItem key={i} value={`item-${i}`} className="rounded-lg border border-border bg-card mb-3 px-6">
              <AccordionTrigger className="text-left text-base font-semibold">{q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Container>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="py-24">
      <Container>
        <div className="relative overflow-hidden rounded-md border border-border bg-card p-8 shadow-card md:p-12">
          <div className="absolute inset-x-0 top-0 h-1 gradient-brand-bg" />
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.26em] text-primary">Start the revenue system</p>
              <h2 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">
                Ready to run leads, bookings, quotes, and AI from one place?
              </h2>
              <p className="mt-4 text-base text-muted-foreground">
                Launch a cleaner front office for your service business in minutes.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/signup">
                <GradientButton>Start Free Trial</GradientButton>
              </Link>
              <GhostButton>Schedule Demo</GhostButton>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function Footer() {
  const cols = [
    { h: "Product", l: ["Features", "Pricing", "AI Tools"] },
    { h: "Company", l: ["About", "Contact", "Support"] },
    { h: "Resources", l: ["Blog", "Help Center", "Documentation"] },
    { h: "Legal", l: ["Privacy Policy", "Terms of Service"] },
  ];

  return (
    <footer className="border-t border-border bg-card/40 py-16">
      <Container>
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2">
              <img src={logo} alt="Lead For Gen" width={36} height={36} className="h-9 w-9 object-contain" />
              <span className="text-lg font-bold">Lead For Gen</span>
            </div>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              One platform to generate leads, manage customers, book appointments, send quotes, and grow your service business with AI.
            </p>
          </div>
          {cols.map((col) => (
            <div key={col.h}>
              <h4 className="text-sm font-bold uppercase tracking-wider">{col.h}</h4>
              <ul className="mt-4 space-y-3">
                {col.l.map((link) => (
                  <li key={link}><a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">{link}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          (c) {new Date().getFullYear()} Lead For Gen. All rights reserved.
        </div>
      </Container>
    </footer>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <main>
        <Hero />
        <Problem />
        <HowItWorks />
        <Platform />
        <WebsiteBuilder />
        <Dashboard />
        <AIFeatures />
        <Industries />
        <Benefits />
        <Comparison />
        <Testimonials />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
