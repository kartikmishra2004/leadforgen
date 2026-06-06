"use client";

import React, { useState, useEffect } from "react";
import { useWorkspace } from "../layout";
import { supabase } from "@/lib/supbase/client";
import { 
  FileText, 
  Search, 
  Plus, 
  X, 
  AlertCircle, 
  Trash2, 
  CheckCircle, 
  Send, 
  Ban,
  Clock
} from "lucide-react";

export default function QuotesPage() {
  const { currentOrg, setRlsErrors } = useWorkspace();
  const [quotes, setQuotes] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [formCustomerId, setFormCustomerId] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formDesc, setFormDesc] = useState("");

  const orgId = currentOrg?.id || "demo-org-id";

  const fetchQuotesAndCustomers = async () => {
    if (!currentOrg) return;
    setLoading(true);
    try {
      const { data: qs, error: qErr } = await supabase
        .from("quotes")
        .select("*")
        .eq("organization_id", currentOrg.id)
        .order("created_at", { ascending: false });

      if (qErr) {
        setRlsErrors(prev => [...prev, `quotes: ${qErr.message}`]);
      } else {
        setQuotes(qs || []);
      }

      // Fetch Customers list
      const { data: custs } = await supabase
        .from("customers")
        .select("id, name, email")
        .eq("organization_id", currentOrg.id);
      setCustomers(custs || []);

    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQuotesAndCustomers();
  }, [currentOrg]);

  const handleCreateQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formCustomerId) {
      setErrorMsg("Please select a customer profile");
      return;
    }
    if (!formAmount || isNaN(Number(formAmount))) {
      setErrorMsg("Please enter a valid amount");
      return;
    }

    const nextQuoteNum = `QT-${Date.now().toString().slice(-6)}`;
    const newQuoteItem = {
      organization_id: orgId,
      customer_id: formCustomerId,
      quote_number: nextQuoteNum,
      amount: Number(formAmount),
      description: formDesc || null,
      status: "pending"
    };

    try {
      const { data, error } = await supabase
        .from("quotes")
        .insert([newQuoteItem])
        .select();

      if (error) {
        setErrorMsg(`Failed to draft quote: ${error.message}`);
      } else if (data && data[0]) {
        setQuotes(prev => [data[0], ...prev]);
        setFormCustomerId("");
        setFormAmount("");
        setFormDesc("");
        setShowAddModal(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Insert failed");
    }
  };

  const handleUpdateStatus = async (quoteId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("quotes")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", quoteId);
      
      if (error) {
        alert(`Failed to update status: ${error.message}`);
        return;
      }
    } catch (err) {
      console.error(err);
    }

    setQuotes(prev => prev.map(q => q.id === quoteId ? { ...q, status: newStatus } : q));
  };

  const handleDeleteQuote = async (quoteId: string) => {
    if (!confirm("Are you sure you want to delete this quote record?")) return;
    try {
      const { error } = await supabase
        .from("quotes")
        .delete()
        .eq("id", quoteId);
      
      if (error) {
        alert(`Failed to delete quote: ${error.message}`);
        return;
      }
    } catch (err) {
      console.error(err);
    }

    setQuotes(prev => prev.filter(q => q.id !== quoteId));
  };

  const filteredQuotes = quotes.filter(q => {
    const clientName = customers.find(c => c.id === q.customer_id)?.name || "Unassigned Customer";
    return (
      clientName.toLowerCase().includes(search.toLowerCase()) ||
      q.quote_number?.toLowerCase().includes(search.toLowerCase()) ||
      q.description?.toLowerCase().includes(search.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-6 w-48 bg-slate-200 rounded-md" />
            <div className="h-3 w-64 bg-slate-200/50 rounded-md" />
          </div>
          <div className="h-8 w-36 bg-slate-200 rounded-xl" />
        </div>
        
        {/* Filter search skeleton */}
        <div className="h-9 w-full bg-slate-100 rounded-xl" />

        {/* Grid of quotes cards skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-card/40 border border-border/50 rounded-2xl p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1.5 w-1/2">
                  <div className="h-3.5 bg-slate-200/60 rounded w-1/3" />
                  <div className="h-4 bg-slate-100/70 rounded w-full" />
                </div>
                <div className="h-4 w-12 bg-slate-200/50 rounded-full" />
              </div>
              <div className="h-10 bg-slate-100/50 rounded-xl w-full" />
              <div className="h-6 bg-slate-100/50 rounded w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#6366F1]" />
            Quotations & Estimates
          </h2>
          <p className="text-xs text-muted-foreground">Draft proposals, send estimates, and track customer responses.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-xl shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Create Quote Estimate
        </button>
      </div>

      {quotes.length === 0 ? (
        /* Minimal logo empty state */
        <div className="py-12 text-center max-w-sm mx-auto animate-reveal-up">
          <img src="/logo.png" alt="Lead For Gen Logo" className="h-10 w-10 mx-auto object-contain mb-3 opacity-60" />
          <h3 className="text-sm font-bold text-foreground mb-1">No Quote Estimates</h3>
          <p className="text-xs text-muted-foreground mb-4">
            You haven't sent any pricing proposals or estimates yet. Draft quotes to send to customers.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 text-xs font-bold bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-xl shadow-sm inline-flex items-center gap-1 transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            Create First Quote
          </button>
        </div>
      ) : (
        <>
          {/* Search Filter */}
          <div className="relative animate-fade-in">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search quotes by number, client, or details..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-card border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-foreground"
            />
          </div>

          {/* Quotes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
            {filteredQuotes.map((q) => {
              const clientName = customers.find(c => c.id === q.customer_id)?.name || "Unassigned Customer";
              
              return (
                <div 
                  key={q.id} 
                  className="bg-card border border-border rounded-2xl p-5 shadow-soft space-y-4 flex flex-col justify-between hover:border-primary/20 transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[9px] font-mono font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          {q.quote_number}
                        </span>
                        <h4 className="text-xs font-bold text-foreground mt-1.5">{clientName}</h4>
                      </div>
                      <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded-full capitalize border
                        ${q.status === "accepted" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : 
                          q.status === "sent" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" : 
                          q.status === "rejected" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                          "bg-amber-500/10 text-amber-500 border-amber-500/20"}`}
                      >
                        {q.status}
                      </span>
                    </div>

                    <div className="text-sm font-extrabold text-foreground bg-muted/20 border border-border/50 rounded-xl p-2.5 text-center">
                      ${Number(q.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>

                    {q.description && (
                      <p className="text-[10px] text-muted-foreground line-clamp-2 bg-muted/10 p-2 rounded-lg italic">
                        "{q.description}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 border-t border-border pt-4 mt-2">
                    {q.status === "pending" && (
                      <button
                        onClick={() => handleUpdateStatus(q.id, "sent")}
                        className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-[9px] font-bold shadow-soft transition-all"
                      >
                        <Send className="h-3 w-3" />
                        Send to Client
                      </button>
                    )}
                    {q.status === "sent" && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(q.id, "accepted")}
                          className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[9px] font-bold shadow-soft transition-all"
                        >
                          <CheckCircle className="h-3 w-3" />
                          Accept
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(q.id, "rejected")}
                          className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-[9px] font-bold transition-all"
                        >
                          <Ban className="h-3 w-3" />
                          Reject
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDeleteQuote(q.id)}
                      className="p-1.5 border border-destructive/20 hover:border-destructive/40 text-destructive bg-destructive/5 hover:bg-destructive/10 rounded-lg transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Create Quote Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl animate-reveal-up">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground">Create Quote Proposal</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 border border-destructive/20 bg-destructive/5 rounded-xl flex items-center gap-2 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateQuote} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-muted-foreground">Select Customer *</label>
                <select
                  value={formCustomerId}
                  onChange={(e) => setFormCustomerId(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-foreground appearance-none"
                >
                  <option value="">Choose customer profile...</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.email || "No email"})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-muted-foreground">Proposal Amount ($) *</label>
                <input
                  type="number"
                  placeholder="e.g. 1540.00"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-muted-foreground">Proposal Details / Items Description</label>
                <textarea
                  rows={3}
                  placeholder="Includes HVAC unit inspection and small leak patch estimate..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-border text-foreground font-bold hover:bg-muted/40 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white font-bold rounded-xl shadow-md"
                >
                  Draft Quote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
