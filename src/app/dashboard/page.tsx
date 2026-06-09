"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useWorkspace } from "./layout";
import { supabase } from "@/lib/supbase/client";
import { 
  Sparkles, 
  Calendar, 
  FileText, 
  TrendingUp, 
  ArrowRight, 
  Clock, 
  ArrowUpRight,
  TrendingDown,
  Activity,
  AlertCircle
} from "lucide-react";

export default function DashboardOverview() {
  const { currentOrg, setRlsErrors } = useWorkspace();
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [aiConversations, setAiConversations] = useState<any[]>([]);

  useEffect(() => {
    if (!currentOrg) return;

    async function fetchStats() {
      setLoading(true);
      const orgId = currentOrg.id;

      try {
        // Fetch Leads
        const { data: leadData, error: leadErr } = await supabase
          .from("leads")
          .select("*")
          .eq("organization_id", orgId);
        if (leadErr) {
          setRlsErrors(prev => [...prev, `leads: ${leadErr.message}`]);
        } else {
          setLeads(leadData || []);
        }

        // Fetch Appointments
        const { data: apptData, error: apptErr } = await supabase
          .from("appointments")
          .select("*")
          .eq("organization_id", orgId);
        if (apptErr) {
          setRlsErrors(prev => [...prev, `appointments: ${apptErr.message}`]);
        } else {
          setAppointments(apptData || []);
        }

        // Fetch Quotes
        const { data: quoteData, error: qErr } = await supabase
          .from("quotes")
          .select("*")
          .eq("organization_id", orgId);
        if (qErr) {
          setRlsErrors(prev => [...prev, `quotes: ${qErr.message}`]);
        } else {
          setQuotes(quoteData || []);
        }

        // Fetch AI chats
        const { data: aiData, error: aiErr } = await supabase
          .from("ai_conversations")
          .select("*")
          .eq("organization_id", orgId);
        if (aiErr) {
          setRlsErrors(prev => [...prev, `ai_conversations: ${aiErr.message}`]);
        } else {
          setAiConversations(aiData || []);
        }
      } catch (err) {
        console.error("Failed to load overview data", err);
      }
      setLoading(false);
    }

    fetchStats();
  }, [currentOrg, setRlsErrors]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* 4 Metric cards skeletons */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card/40 border border-border/50 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-3 w-16 bg-slate-200 rounded" />
                <div className="h-7 w-7 bg-slate-200/50 rounded-lg" />
              </div>
              <div className="h-6 w-24 bg-slate-200 rounded-md" />
              <div className="h-3.5 w-32 bg-slate-100 rounded" />
            </div>
          ))}
        </div>

        {/* Main content grid skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card/40 border border-border/50 rounded-2xl p-5 space-y-4">
            <div className="h-4 w-32 bg-slate-200 rounded" />
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-slate-100 p-3 rounded-xl border border-border/50 space-y-3">
                  <div className="h-3.5 w-12 bg-slate-200 rounded" />
                  <div className="h-16 bg-slate-100/70 rounded-lg w-full" />
                  <div className="h-16 bg-slate-100/70 rounded-lg w-full" />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card/40 border border-border/50 rounded-2xl p-5 space-y-3">
              <div className="h-4 w-24 bg-slate-200 rounded" />
              <div className="h-28 bg-slate-100/70 rounded-xl w-full" />
            </div>
            <div className="bg-card/40 border border-border/50 rounded-2xl p-5 space-y-3">
              <div className="h-4 w-28 bg-slate-200 rounded" />
              <div className="h-24 bg-slate-100/70 rounded-xl w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Key metric computations
  const totalLeads = leads.length;
  const activeAppointments = appointments.filter(a => a.status === "scheduled").length;
  const openPipelineVal = quotes
    .filter(q => q.status === "pending" || q.status === "sent")
    .reduce((sum, q) => sum + Number(q.amount || 0), 0);
  const aiChatsCount = aiConversations.length;

  // Dynamic Mini Calendar Logic
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-indexed
  const todayDate = today.getDate();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const currentMonthName = monthNames[currentMonth];

  // First day of current month
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday
  // Align Monday as first column (index 0)
  const mondayFirstIndex = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const prevMonthDays = Array.from(
    { length: mondayFirstIndex },
    (_, i) => daysInPrevMonth - mondayFirstIndex + 1 + i
  );
  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const totalCells = mondayFirstIndex + daysInMonth;
  const nextMonthPaddingCount = totalCells > 35 ? 42 - totalCells : 35 - totalCells;
  const nextMonthDays = Array.from({ length: nextMonthPaddingCount }, (_, i) => i + 1);

  const pipelineStages = [
    { id: "new", label: "Leads Generated", bgLight: "bg-blue-500/10", text: "text-blue-500" },
    { id: "contacted", label: "Contacted", bgLight: "bg-amber-500/10", text: "text-amber-500" },
    { id: "interested", label: "Interested", bgLight: "bg-[#6366F1]/10", text: "text-[#6366F1]" },
    { id: "clients", label: "Clients", bgLight: "bg-emerald-500/10", text: "text-emerald-500" }
  ];

  // If completely empty dashboard
  if (totalLeads === 0 && activeAppointments === 0 && quotes.length === 0) {
    return (
      <div className="py-16 text-center max-w-md mx-auto animate-reveal-up">
        <img src="/logo.png" alt="Lead For Gen" className="h-12 w-12 mx-auto object-contain mb-4 opacity-60" />
        <h2 className="text-base font-bold text-foreground mb-1.5">Workspace Pipeline is Empty</h2>
        <p className="text-xs text-muted-foreground mb-5 leading-relaxed">
          Your pipeline has no active events. Add customer profiles or setup your landing website to start collecting leads.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/dashboard/leads"
            className="px-3.5 py-2 text-xs font-bold bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-xl shadow-sm inline-flex items-center gap-1 transition-all"
          >
            Create Manual Lead
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/dashboard/website"
            className="px-3.5 py-2 text-xs font-bold border border-border bg-card text-foreground hover:bg-muted/40 rounded-xl transition-all"
          >
            Configure Site
          </Link>
        </div>
      </div>
    );
  }

  // Pick latest records for widgets
  const latestQuote = quotes.find(q => q.status === "pending" || q.status === "sent") || quotes[0];
  const latestChat = aiConversations[0];

  return (
    <div className="space-y-6 animate-reveal-up">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-2xl p-4 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Leads</span>
            <div className="h-7 w-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-blue-500" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-2xl font-extrabold">{totalLeads}</span>
            <span className="text-[10px] font-bold text-emerald-500">Live</span>
          </div>
          <p className="text-[10px] text-muted-foreground">Captured from portal</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Appointments</span>
            <div className="h-7 w-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-amber-500" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-2xl font-extrabold">{activeAppointments}</span>
            <span className="text-[10px] font-bold text-[#6366F1]">Booked</span>
          </div>
          <p className="text-[10px] text-muted-foreground">Upcoming schedules</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Open Pipeline</span>
            <div className="h-7 w-7 rounded-lg bg-[#6366F1]/10 flex items-center justify-center">
              <FileText className="h-4 w-4 text-[#6366F1]" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-2xl font-extrabold">${openPipelineVal.toLocaleString()}</span>
            <span className="text-[10px] font-bold text-emerald-500">Quotes</span>
          </div>
          <p className="text-[10px] text-muted-foreground">Awaiting acceptance</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">AI Receptionist</span>
            <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Clock className="h-4 w-4 text-emerald-500" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-2xl font-extrabold">{aiChatsCount}</span>
            <span className="text-[10px] font-bold text-emerald-500">Chats</span>
          </div>
          <p className="text-[10px] text-muted-foreground">Conversations qualified</p>
        </div>
      </div>

      {/* Main Grid content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Pipeline & Recent Quotes */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Pipeline */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-soft h-[260px] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">Interactive Pipeline</h3>
              <Link 
                href="/dashboard/leads"
                className="text-[11px] font-bold text-[#6366F1] hover:underline flex items-center gap-1"
              >
                Manage Pipeline <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="grid grid-cols-4 gap-2 flex-grow mt-2.5">
              {pipelineStages.map((stage) => {
                const stageLeads = leads.filter(l => {
                  const normalized = l.status === "qualified" ? "interested" : (l.status === "closed" ? "clients" : (l.status || "new"));
                  return normalized === stage.id;
                });
                return (
                  <div key={stage.id} className="h-full flex flex-col justify-between bg-muted/20 p-2 rounded-xl border border-border/60">
                    <div className="flex items-center justify-between pb-1 border-b border-border/50 shrink-0">
                      <span className="text-[9px] font-bold text-foreground truncate">{stage.label}</span>
                      <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-full ${stage.bgLight} ${stage.text}`}>
                        {stageLeads.length}
                      </span>
                    </div>

                    <div className="space-y-1.5 flex-grow mt-2 overflow-hidden flex flex-col justify-start">
                      {stageLeads.length === 0 ? (
                        <div className="text-[8px] text-muted-foreground text-center py-4 italic border border-dashed border-border rounded-lg bg-card/40 flex-grow flex items-center justify-center">
                          Empty
                        </div>
                      ) : (
                        <div className="space-y-1.5 flex-grow">
                          {stageLeads.slice(0, 2).map((lead) => (
                            <Link 
                              key={lead.id} 
                              href="/dashboard/leads"
                              className="block p-2 bg-card border border-border rounded-lg shadow-soft space-y-1 cursor-default shrink-0"
                            >
                              <div className="flex items-start justify-between gap-1">
                                <span className="text-[9px] font-bold text-foreground leading-tight truncate">
                                  {lead.name}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[8px] text-muted-foreground">
                                <span className="truncate max-w-[55px]">{lead.email || "No email"}</span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Invoiced Quotes */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-soft h-[200px] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground">Recent Invoiced Quotes</h3>
                <p className="text-[10px] text-muted-foreground">List of current estimates sent to clients.</p>
              </div>
              <Link 
                href="/dashboard/quotes"
                className="text-[11px] font-bold text-[#6366F1] hover:underline"
              >
                View all quotes
              </Link>
            </div>

            <div className="space-y-2 flex-grow flex flex-col justify-end pt-2">
              {quotes.length === 0 ? (
                <div className="h-full flex-grow flex flex-col items-center justify-center gap-1.5 p-3 border border-dashed border-border rounded-xl bg-muted/5">
                  <AlertCircle className="h-4.5 w-4.5 text-muted-foreground/40" />
                  <span className="text-[10px] text-muted-foreground italic">No quotes drafted yet.</span>
                </div>
              ) : (
                <div className="space-y-2 flex-grow flex flex-col justify-between">
                  {(() => {
                    const displayQuotes = quotes.slice(0, 2);
                    const placeholders = Math.max(0, 2 - displayQuotes.length);
                    return (
                      <>
                        {displayQuotes.map((quote) => (
                          <div key={quote.id} className="flex items-center justify-between p-2 bg-muted/20 border border-border/60 rounded-xl hover:bg-muted/30 transition-colors">
                            <div className="flex items-center gap-3 truncate">
                              <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-primary/10 to-secondary/10 flex items-center justify-center font-bold text-[10px] text-primary shrink-0">
                                Q
                              </div>
                              <div className="truncate">
                                <p className="text-[11px] font-bold text-foreground truncate">{quote.quote_number || "Estimate"}</p>
                                <p className="text-[9px] text-muted-foreground truncate max-w-[130px]">{quote.description || "Proposal Estimate"}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <span className="text-[11px] font-extrabold text-foreground">${Number(quote.amount).toFixed(2)}</span>
                              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full capitalize
                                ${quote.status === "accepted" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : 
                                  quote.status === "sent" ? "bg-blue-500/10 text-blue-500 border border-blue-500/20" : 
                                  "bg-amber-500/10 text-amber-500 border border-amber-500/20"}`}
                              >
                                {quote.status}
                              </span>
                            </div>
                          </div>
                        ))}
                        {[...Array(placeholders)].map((_, idx) => (
                          <div key={`p-${idx}`} className="flex items-center justify-between p-2 border border-dashed border-border/60 rounded-xl bg-muted/5 opacity-40 select-none">
                            <div className="flex items-center gap-3">
                              <div className="h-7 w-7 rounded-lg border border-dashed border-border flex items-center justify-center font-bold text-[9px] text-muted-foreground/40">
                                -
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-muted-foreground/40">Empty Quote Slot</p>
                                <p className="text-[8px] text-muted-foreground/30">No active proposal</p>
                              </div>
                            </div>
                            <span className="text-[10px] font-extrabold text-muted-foreground/20">$0.00</span>
                          </div>
                        ))}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Appointments calendar */}
        <div className="space-y-6">
          {/* Mini Calendar UI */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-soft flex flex-col h-[484px] justify-between">
            <div className="flex items-center justify-between pb-2">
              <h3 className="text-sm font-bold text-foreground">Appointments</h3>
              <Link 
                href="/dashboard/appointments"
                className="text-[10px] font-bold text-[#6366F1] hover:underline"
              >
                Calendar View
              </Link>
            </div>

            {/* Custom Interactive Mini Month Calendar (approx 60% height) */}
            <div className="border border-border/60 rounded-xl p-3 bg-muted/15 h-[265px] flex flex-col justify-between shrink-0">
              <div className="flex items-center justify-between border-b border-border/50 pb-1.5 shrink-0">
                <span className="text-[11px] font-bold text-foreground">{currentMonthName} {currentYear}</span>
                <span className="text-[9px] font-bold text-muted-foreground uppercase">Schedule</span>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center flex-grow items-center">
                {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                  <span key={i} className="text-[9px] font-bold text-muted-foreground">{d}</span>
                ))}
                
                {prevMonthDays.map((d, idx) => (
                  <span key={`prev-${idx}`} className="text-[10px] py-1 text-muted-foreground/30 flex items-center justify-center font-medium select-none">{d}</span>
                ))}

                {currentMonthDays.map((d) => {
                  const isToday = d === todayDate;
                  const hasAppt = appointments.some(appt => {
                    const date = new Date(appt.appointment_date);
                    return date.getFullYear() === currentYear && 
                           date.getMonth() === currentMonth && 
                           date.getDate() === d && 
                           appt.status !== "cancelled";
                  });

                  if (isToday) {
                    return (
                      <Link
                        key={d}
                        href="/dashboard/appointments"
                        className="text-[10px] py-1 bg-[#6366F1] text-white font-bold rounded-lg shadow-md shadow-[#6366F1]/20 flex items-center justify-center relative cursor-pointer font-extrabold"
                      >
                        {d}
                        {hasAppt && (
                          <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-white" />
                        )}
                      </Link>
                    );
                  }

                  return (
                    <Link 
                      key={d} 
                      href="/dashboard/appointments"
                      className={`text-[10px] py-1 font-bold relative rounded-lg hover:bg-muted transition-colors cursor-pointer flex items-center justify-center
                        ${hasAppt ? "text-primary font-black" : "text-foreground"}`}
                    >
                      {d}
                      {hasAppt && (
                        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-[#EC4899]" />
                      )}
                    </Link>
                  );
                })}

                {nextMonthDays.map((d, idx) => (
                  <span key={`next-${idx}`} className="text-[10px] py-1 text-muted-foreground/30 flex items-center justify-center font-medium select-none">{d}</span>
                ))}
              </div>
            </div>

            {/* Upcoming Appointments snippet */}
            <div className="space-y-1.5 flex-grow flex flex-col justify-start mt-3 overflow-hidden">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block shrink-0">Upcoming Events</span>
              <div className="space-y-1.5 flex-grow flex flex-col justify-between">
                {(() => {
                  const activeAppts = appointments.filter(a => a.status !== "cancelled").slice(0, 2);
                  const calendarPlaceholders = Math.max(0, 2 - activeAppts.length);
                  return (
                    <>
                      {activeAppts.map((appt) => (
                        <div key={appt.id} className="p-2 bg-muted/30 border border-border/50 rounded-xl flex items-center justify-between text-[10px] hover:bg-muted/50 transition-colors">
                          <div className="truncate pr-2 space-y-0.5">
                            <p className="font-bold text-foreground truncate">{appt.title}</p>
                            <p className="text-muted-foreground text-[8px] truncate">
                              {new Date(appt.appointment_date).toLocaleDateString([], { month: "short", day: "numeric" })} at{" "}
                              {new Date(appt.appointment_date).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                            </p>
                          </div>
                          <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wide shrink-0">
                            Confirmed
                          </span>
                        </div>
                      ))}
                      {[...Array(calendarPlaceholders)].map((_, idx) => (
                        <div key={`p-${idx}`} className="p-2 border border-dashed border-border/60 rounded-xl flex items-center justify-between text-[10px] bg-muted/5 opacity-40 select-none">
                          <div className="truncate pr-2 space-y-0.5">
                            <p className="font-bold text-muted-foreground/40">Available Slot</p>
                            <p className="text-[8px] text-muted-foreground/30">No scheduled booking</p>
                          </div>
                          <span className="border border-dashed border-border/60 text-muted-foreground/20 px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wide shrink-0">
                            Open
                          </span>
                        </div>
                      ))}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Funnel Conversion Rates Section */}
      {(() => {
        const countClients = leads.filter(l => l.status === "clients" || l.status === "closed").length;
        const countInterested = leads.filter(l => l.status === "interested" || l.status === "qualified").length + countClients;
        const countContacted = leads.filter(l => l.status === "contacted").length + countInterested;
        const countGenerated = totalLeads;

        const contactRate = countGenerated > 0 ? (countContacted / countGenerated) * 100 : 0;
        const interestRate = countContacted > 0 ? (countInterested / countContacted) * 100 : 0;
        const clientRate = countInterested > 0 ? (countClients / countInterested) * 100 : 0;
        const overallRate = countGenerated > 0 ? (countClients / countGenerated) * 100 : 0;

        return (
          <div className="bg-card border border-border rounded-2xl p-5 shadow-soft space-y-5">
            <div>
              <h3 className="text-sm font-bold text-foreground">Funnel Conversion Analysis</h3>
              <p className="text-[10px] text-muted-foreground">Lead conversion rates across all funnel stages.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Simple Funnel Column Chart */}
              <div className="md:col-span-8 h-48 flex items-end justify-between gap-4 bg-muted/15 border border-border/50 rounded-xl p-6 relative">
                <div className="absolute top-3 left-4 text-[9px] font-extrabold text-muted-foreground tracking-wider uppercase">Lead Volume per Stage</div>
                {[
                  { label: "Generated", count: countGenerated, pct: 100, color: "from-blue-500/20 to-blue-500/50 text-blue-500 border-blue-500/30" },
                  { label: "Contacted", count: countContacted, pct: countGenerated > 0 ? (countContacted / countGenerated) * 100 : 0, color: "from-amber-500/20 to-amber-500/50 text-amber-500 border-amber-500/30" },
                  { label: "Interested", count: countInterested, pct: countGenerated > 0 ? (countInterested / countGenerated) * 100 : 0, color: "from-[#6366F1]/20 to-[#6366F1]/50 text-primary border-[#6366F1]/30" },
                  { label: "Clients", count: countClients, pct: countGenerated > 0 ? (countClients / countGenerated) * 100 : 0, color: "from-emerald-500/20 to-emerald-500/50 text-emerald-500 border-emerald-500/30" }
                ].map((col, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                    <span className="text-[10px] font-extrabold text-foreground mb-1 select-none">{col.count}</span>
                    <div className="w-full flex-grow flex items-end justify-center relative min-h-[60px] pb-1">
                      <div 
                        className={`w-full rounded-t-lg bg-gradient-to-t ${col.color} border-t border-x hover:brightness-105 transition-all shadow-sm`} 
                        style={{ height: `${Math.max(12, col.pct)}%` }}
                      >
                        {/* Light/Themed Tooltip */}
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-card border border-border text-foreground text-[9px] font-bold py-1 px-2.5 rounded-lg whitespace-nowrap pointer-events-none transition-all z-20 shadow-soft">
                          {col.pct.toFixed(2)}% of total
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground select-none text-center block w-full pt-1.5">{col.label}</span>
                  </div>
                ))}
              </div>

              {/* Conversion Rates Stats */}
              <div className="md:col-span-4 space-y-3">
                <div className="p-4 rounded-xl border border-border bg-muted/10 space-y-3">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Conversion Metrics</span>
                  
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground font-medium">Contact Rate</span>
                      <span className="font-extrabold text-foreground">{contactRate.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground font-medium">Interest Rate</span>
                      <span className="font-extrabold text-foreground">{interestRate.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground font-medium">Client Rate</span>
                      <span className="font-extrabold text-foreground">{clientRate.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between items-center pt-2.5 border-t border-border/60">
                      <span className="font-bold text-primary">Overall Lead-to-Client</span>
                      <span className="font-black text-primary text-sm">{overallRate.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
