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

  const pipelineStages = [
    { id: "new", label: "New Leads", bgLight: "bg-blue-500/10", text: "text-blue-500" },
    { id: "contacted", label: "Contacted", bgLight: "bg-amber-500/10", text: "text-amber-500" },
    { id: "qualified", label: "Qualified", bgLight: "bg-[#6366F1]/10", text: "text-[#6366F1]" },
    { id: "closed", label: "Closed Won", bgLight: "bg-emerald-500/10", text: "text-emerald-500" }
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
          <div className="bg-card border border-border rounded-2xl p-5 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">Interactive Pipeline</h3>
              <Link 
                href="/dashboard/leads"
                className="text-[11px] font-bold text-[#6366F1] hover:underline flex items-center gap-1"
              >
                Manage Pipeline <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {pipelineStages.map((stage) => {
                const stageLeads = leads.filter(l => l.status === stage.id);
                return (
                  <div key={stage.id} className="space-y-3 bg-muted/20 p-2.5 rounded-xl border border-border/60">
                    <div className="flex items-center justify-between pb-1 border-b border-border/50">
                      <span className="text-[10px] font-bold text-foreground truncate">{stage.label}</span>
                      <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${stage.bgLight} ${stage.text}`}>
                        {stageLeads.length}
                      </span>
                    </div>

                    <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                      {stageLeads.length === 0 ? (
                        <div className="text-[9px] text-muted-foreground text-center py-6 italic border border-dashed border-border rounded-lg bg-card/40">
                          Empty
                        </div>
                      ) : (
                        stageLeads.map((lead) => (
                          <Link 
                            key={lead.id} 
                            href="/dashboard/leads"
                            className="block p-2.5 bg-card border border-border hover:border-primary/45 rounded-lg shadow-soft transition-all hover:scale-[1.01] hover:-translate-y-0.5 group space-y-1.5"
                          >
                            <div className="flex items-start justify-between gap-1">
                              <span className="text-[10px] font-bold text-foreground leading-tight group-hover:text-primary transition-colors truncate">
                                {lead.name}
                              </span>
                              <ArrowUpRight className="h-3 w-3 text-muted-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="flex items-center justify-between text-[9px] text-muted-foreground">
                              <span className="truncate max-w-[65px]">{lead.email || "No email"}</span>
                            </div>
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Invoiced Quotes */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-soft space-y-4">
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

            <div className="space-y-2.5">
              {quotes.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground italic border border-dashed border-border rounded-xl bg-muted/10 flex items-center justify-center gap-2">
                  <AlertCircle className="h-4.5 w-4.5 text-muted-foreground/60" />
                  <span>No quotes drafted. Click 'View all quotes' to draft a proposal.</span>
                </div>
              ) : (
                quotes.slice(0, 3).map((quote) => (
                  <div key={quote.id} className="flex items-center justify-between p-3 bg-muted/20 border border-border/60 rounded-xl hover:bg-muted/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-primary/10 to-secondary/10 flex items-center justify-center font-bold text-xs text-primary">
                        Q
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">{quote.quote_number || "Estimate"}</p>
                        <p className="text-[9px] text-muted-foreground truncate max-w-[150px]">{quote.description || "Proposal Estimate"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-extrabold text-foreground">${Number(quote.amount).toFixed(2)}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full capitalize
                        ${quote.status === "accepted" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : 
                          quote.status === "sent" ? "bg-blue-500/10 text-blue-500 border border-blue-500/20" : 
                          "bg-amber-500/10 text-amber-500 border border-amber-500/20"}`}
                      >
                        {quote.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Appointments calendar + chart + promo widgets */}
        <div className="space-y-6">
          {/* Mini Calendar UI */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-soft space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">Appointments</h3>
              <Link 
                href="/dashboard/appointments"
                className="text-[10px] font-bold text-[#6366F1] hover:underline"
              >
                Calendar View
              </Link>
            </div>

            {/* Custom Interactive Mini Month Calendar */}
            <div className="border border-border/60 rounded-xl p-3 bg-muted/15 space-y-3">
              <div className="flex items-center justify-between border-b border-border/50 pb-1.5">
                <span className="text-[11px] font-bold text-foreground">June 2026</span>
                <span className="text-[9px] font-bold text-muted-foreground uppercase">Schedule</span>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                  <span key={i} className="text-[9px] font-bold text-muted-foreground">{d}</span>
                ))}
                
                {[1, 2, 3, 4, 5].map((d) => (
                  <span key={d} className="text-[10px] py-1 text-muted-foreground/60">{d}</span>
                ))}
                <span className="text-[10px] py-1 bg-[#6366F1] text-white font-bold rounded-lg shadow-md shadow-[#6366F1]/20">6</span>
                {[7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((d) => {
                  const hasAppt = appointments.some(appt => {
                    const date = new Date(appt.appointment_date);
                    return date.getMonth() === 5 && date.getDate() === d && appt.status !== "cancelled";
                  });
                  return (
                    <Link 
                      key={d} 
                      href="/dashboard/appointments"
                      className={`text-[10px] py-1 font-medium relative rounded-lg hover:bg-muted transition-colors cursor-pointer
                        ${hasAppt ? "text-primary font-bold" : "text-foreground"}`}
                    >
                      {d}
                      {hasAppt && (
                        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-[#EC4899]" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Upcoming Appointments snippet */}
            <div className="space-y-2 pt-1">
              {appointments.length === 0 ? (
                <p className="text-[10px] text-muted-foreground italic text-center py-2">No upcoming meetings scheduled.</p>
              ) : (
                appointments.slice(0, 2).map((appt) => (
                  <div key={appt.id} className="p-2 bg-muted/30 border border-border/50 rounded-xl flex items-center justify-between text-[10px] hover:bg-muted/50 transition-colors">
                    <div className="truncate pr-2">
                      <p className="font-bold text-foreground truncate">{appt.title}</p>
                      <p className="text-muted-foreground truncate">{new Date(appt.appointment_date).toLocaleDateString([], { month: "short", day: "numeric" })}</p>
                    </div>
                    <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wide shrink-0">
                      Confirmed
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Acquisition Growth Chart */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground">Acquisition Growth</h3>
                <p className="text-[10px] text-muted-foreground">Monthly leads generated</p>
              </div>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>

            {/* Premium styled SVG Bar Graph */}
            <div className="h-32 w-full pt-2 flex items-end justify-between gap-2">
              {[
                { label: "Jan", val: 30 },
                { label: "Feb", val: 45 },
                { label: "Mar", val: 62 },
                { label: "Apr", val: 55 },
                { label: "May", val: 78 },
                { label: "Jun", val: Math.min(100, Math.max(15, leads.length * 18)) }
              ].map((bar, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <div className="w-full relative rounded-t-lg bg-gradient-to-t from-[#6366F1] to-[#EC4899] group-hover:brightness-110 transition-all shadow-md shadow-[#6366F1]/10 flex justify-center items-start overflow-hidden min-h-[15px] cursor-pointer" style={{ height: `${bar.val}%` }}>
                    <div className="opacity-0 group-hover:opacity-100 absolute top-1 text-[8px] font-bold text-white transition-opacity bg-black/40 px-1 rounded">
                      {bar.val}
                    </div>
                  </div>
                  <span className="text-[9px] font-semibold text-muted-foreground">{bar.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Info / Dynamic Gradient Promo Cards */}
          <div className="grid grid-cols-2 gap-3">
            {latestQuote ? (
              <Link 
                href="/dashboard/quotes"
                className="p-4 rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#EC4899] text-white shadow-soft relative overflow-hidden group hover:scale-[1.02] transition-transform block"
              >
                <div className="absolute -right-4 -bottom-4 h-16 w-16 bg-white/10 rounded-full blur-xl group-hover:scale-125 transition-transform" />
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/80">Active Estimate</p>
                <p className="text-sm font-extrabold mt-1 truncate">{latestQuote.quote_number || "Estimate"}</p>
                <p className="text-[10px] text-white/90 mt-0.5">${Number(latestQuote.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              </Link>
            ) : (
              <Link 
                href="/dashboard/quotes"
                className="p-4 rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#EC4899] text-white shadow-soft relative overflow-hidden group hover:scale-[1.02] transition-transform block text-center flex flex-col justify-center"
              >
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/80">Draft Quote</p>
                <p className="text-xs font-bold mt-2">Create Quote</p>
              </Link>
            )}

            {latestChat ? (
              <Link 
                href="/dashboard/ai"
                className="p-4 rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] text-white shadow-soft relative overflow-hidden group hover:scale-[1.02] transition-transform block"
              >
                <div className="absolute -right-4 -bottom-4 h-16 w-16 bg-white/10 rounded-full blur-xl group-hover:scale-125 transition-transform" />
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/80">AI Receptionist</p>
                <p className="text-sm font-extrabold mt-1 truncate">{latestChat.customer_name || "Visitor"}</p>
                <p className="text-[10px] text-white/90 mt-0.5">{aiChatsCount} Live Chats</p>
              </Link>
            ) : (
              <Link 
                href="/dashboard/ai"
                className="p-4 rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] text-white shadow-soft relative overflow-hidden group hover:scale-[1.02] transition-transform block text-center flex flex-col justify-center"
              >
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/80">AI Chat Sandbox</p>
                <p className="text-xs font-bold mt-2">Test chatbot</p>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
