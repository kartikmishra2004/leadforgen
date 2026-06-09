"use client";

import React, { useState, useEffect } from "react";
import { useWorkspace } from "../layout";
import { supabase } from "@/lib/supbase/client";
import { 
  Search, 
  Filter, 
  Plus, 
  Sparkles, 
  Phone, 
  Mail, 
  FileText, 
  Trash2, 
  X,
  MessageSquare,
  AlertCircle,
  Clock,
  Briefcase
} from "lucide-react";

export default function LeadsPage() {
  const { currentOrg, setRlsErrors, showAlert, showConfirm } = useWorkspace();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // New Lead Form State
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formSource, setFormSource] = useState("website");
  const [formNotes, setFormNotes] = useState("");

  const orgId = currentOrg?.id || "demo-org-id";

  const fetchLeads = async () => {
    if (!currentOrg) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("organization_id", currentOrg.id)
        .order("created_at", { ascending: false });

      if (error) {
        setRlsErrors(prev => [...prev, `leads: ${error.message}`]);
      } else {
        setLeads(data || []);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLeads();
  }, [currentOrg]);

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formName.trim()) {
      setErrorMsg("Name is required");
      return;
    }

    const newLeadItem = {
      organization_id: orgId,
      name: formName,
      email: formEmail || null,
      phone: formPhone || null,
      source: formSource,
      status: "new",
      notes: formNotes || null
    };

    try {
      const { data, error } = await supabase
        .from("leads")
        .insert([newLeadItem])
        .select();

      if (error) {
        setErrorMsg(`Failed to save: ${error.message}`);
      } else if (data && data[0]) {
        setLeads(prev => [data[0], ...prev]);
        setFormName("");
        setFormEmail("");
        setFormPhone("");
        setFormSource("website");
        setFormNotes("");
        setShowAddModal(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Insert failed");
    }
  };

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("leads")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", leadId);

      if (error) {
        await showAlert(`Failed to update status: ${error.message}`, "Error", "error");
        return;
      }
    } catch (err) {
      console.error(err);
    }

    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead((prev: any) => ({ ...prev, status: newStatus }));
    }
  };

  const handleAddNote = async (leadId: string) => {
    if (!newNote.trim()) return;
    const existingNotes = selectedLead.notes || "";
    const notePrefix = existingNotes ? `${existingNotes}\n\n` : "";
    const updatedNotes = `${notePrefix}[${new Date().toLocaleDateString()}] ${newNote}`;

    try {
      const { error } = await supabase
        .from("leads")
        .update({ notes: updatedNotes, updated_at: new Date().toISOString() })
        .eq("id", leadId);

      if (error) {
        await showAlert(`Failed to add note: ${error.message}`, "Error", "error");
        return;
      }
    } catch (err) {
      console.error(err);
    }

    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, notes: updatedNotes } : l));
    setSelectedLead((prev: any) => ({ ...prev, notes: updatedNotes }));
    setNewNote("");
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!await showConfirm("Are you sure you want to delete this lead?", "Delete Lead", { variant: "destructive" })) return;
    try {
      const { error } = await supabase
        .from("leads")
        .delete()
        .eq("id", leadId);

      if (error) {
        await showAlert(`Failed to delete: ${error.message}`, "Error", "error");
        return;
      }
    } catch (err) {
      console.error(err);
    }

    setLeads(prev => prev.filter(l => l.id !== leadId));
    setSelectedLead(null);
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name?.toLowerCase().includes(search.toLowerCase()) ||
      lead.email?.toLowerCase().includes(search.toLowerCase()) ||
      lead.source?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
      lead.status === statusFilter || 
      (statusFilter === "interested" && lead.status === "qualified") ||
      (statusFilter === "clients" && lead.status === "closed");
    return matchesSearch && matchesStatus;
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
          <div className="h-8 w-32 bg-slate-200 rounded-xl" />
        </div>
        
        {/* Filter row skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="h-9 sm:col-span-2 bg-slate-100 rounded-xl" />
          <div className="h-9 bg-slate-100 rounded-xl" />
        </div>

        {/* Content table skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card/40 border border-border/50 rounded-2xl p-4 space-y-4">
            <div className="h-8 bg-slate-200/60 rounded-lg w-full" />
            <div className="h-12 bg-slate-100/70 rounded-xl w-full" />
            <div className="h-12 bg-slate-100/70 rounded-xl w-full" />
            <div className="h-12 bg-slate-100/70 rounded-xl w-full" />
            <div className="h-12 bg-slate-100/70 rounded-xl w-full" />
          </div>
          <div className="bg-card/40 border border-border/50 rounded-2xl p-5 space-y-4">
            <div className="h-8 bg-slate-200/60 rounded-lg w-1/3" />
            <div className="h-20 bg-slate-100/70 rounded-xl w-full" />
            <div className="h-10 bg-slate-100/70 rounded-xl w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#6366F1]" />
            Leads Management
          </h2>
          <p className="text-xs text-muted-foreground">Manage service requests and qualified leads.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-xl shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Add Manual Lead
        </button>
      </div>

      {leads.length === 0 ? (
        /* Minimal logo empty state */
        <div className="py-12 text-center max-w-sm mx-auto animate-reveal-up">
          <img src="/logo.png" alt="Lead For Gen Logo" className="h-10 w-10 mx-auto object-contain mb-3 opacity-60" />
          <h3 className="text-sm font-bold text-foreground mb-1">No Leads Captured</h3>
          <p className="text-xs text-muted-foreground mb-4">
            You don't have any leads in this workspace yet. Create a manual lead to get started.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 text-xs font-bold bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-xl shadow-sm inline-flex items-center gap-1 transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            Create First Lead
          </button>
        </div>
      ) : (
        <>
          {/* Filters & search row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-in">
            <div className="relative sm:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search leads by name, email, or source..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-card border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-foreground"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-card border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-foreground appearance-none"
              >
                <option value="all">All Statuses</option>
                <option value="new">Leads Generated</option>
                <option value="contacted">Contacted</option>
                <option value="interested">Interested</option>
                <option value="clients">Clients</option>
              </select>
            </div>
          </div>

          {/* Main split display: leads list + detail drawer */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fade-in">
            {/* Leads list table */}
            <div className="lg:col-span-2 bg-card border border-border rounded-2xl overflow-hidden shadow-soft">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/20 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="px-5 py-3">Lead Info</th>
                      <th className="px-5 py-3">Source</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredLeads.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-5 py-8 text-center text-xs text-muted-foreground italic bg-card">
                          No leads matching your current criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredLeads.map((lead) => (
                        <tr 
                          key={lead.id}
                          onClick={() => setSelectedLead(lead)}
                          className={`hover:bg-muted/30 transition-colors cursor-pointer text-xs
                            ${selectedLead?.id === lead.id ? "bg-primary/5 hover:bg-primary/5" : ""}`}
                        >
                          <td className="px-5 py-3.5">
                            <p className="font-bold text-foreground">{lead.name}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{lead.email || "No Email"}</p>
                          </td>
                          <td className="px-5 py-3.5 text-muted-foreground capitalize">
                            {lead.source}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold capitalize border
                              ${lead.status === "new" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" : 
                                lead.status === "contacted" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : 
                                (lead.status === "interested" || lead.status === "qualified") ? "bg-[#6366F1]/10 text-[#6366F1] border-[#6366F1]/20" : 
                                "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"}`}
                            >
                              {lead.status === "new" ? "Leads Generated" : 
                               lead.status === "contacted" ? "Contacted" : 
                               (lead.status === "interested" || lead.status === "qualified") ? "Interested" : 
                               "Clients"}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-muted-foreground">
                            {lead.created_at ? new Date(lead.created_at).toLocaleDateString() : "Just now"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Lead Details side drawer */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-soft space-y-5">
              {selectedLead ? (
                <>
                  {/* Header Info */}
                  <div className="flex items-start justify-between border-b border-border pb-3.5">
                    <div>
                      <h3 className="text-sm font-bold text-foreground">{selectedLead.name}</h3>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Source: <span className="capitalize">{selectedLead.source}</span></p>
                    </div>
                    <button
                      onClick={() => setSelectedLead(null)}
                      className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Quick Contacts */}
                  <div className="space-y-2 text-xs">
                    {selectedLead.email && (
                      <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                        <Mail className="h-3.5 w-3.5" />
                        <span>{selectedLead.email}</span>
                      </div>
                    )}
                    {selectedLead.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                        <Phone className="h-3.5 w-3.5" />
                        <span>{selectedLead.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Status Manager */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Set Stage</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {["new", "contacted", "interested", "clients"].map((st) => (
                        <button
                          key={st}
                          onClick={() => handleStatusChange(selectedLead.id, st)}
                          className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border capitalize transition-colors
                            ${(selectedLead.status === st || 
                               (st === "interested" && selectedLead.status === "qualified") || 
                               (st === "clients" && selectedLead.status === "closed"))
                              ? "bg-primary text-white border-primary shadow-soft"
                              : "bg-muted/20 border-border text-foreground hover:bg-muted/50"}`}
                        >
                          {st === "new" ? "Leads Generated" : st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes History */}
                  <div className="space-y-2 border-t border-border pt-4">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5" /> Notes History
                    </span>
                    <div className="max-h-36 overflow-y-auto bg-muted/20 border border-border/50 rounded-xl p-2.5 text-[10px] font-medium leading-relaxed whitespace-pre-line text-muted-foreground">
                      {selectedLead.notes || "No notes written yet."}
                    </div>

                    <div className="flex gap-1.5 pt-1">
                      <input
                        type="text"
                        placeholder="Type a quick note..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-[10px] bg-muted/40 focus:bg-card border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                        onKeyDown={(e) => e.key === "Enter" && handleAddNote(selectedLead.id)}
                      />
                      <button
                        onClick={() => handleAddNote(selectedLead.id)}
                        className="px-2.5 py-1 bg-primary hover:bg-primary-hover text-white rounded-lg text-[10px] font-bold"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="border-t border-border pt-4">
                    <button
                      onClick={() => handleDeleteLead(selectedLead.id)}
                      className="w-full inline-flex items-center justify-center gap-1 px-3 py-2 border border-destructive/20 hover:border-destructive/40 text-destructive bg-destructive/5 hover:bg-destructive/10 rounded-xl text-xs font-bold transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete Lead Account
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 space-y-2">
                  <MessageSquare className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                  <p className="text-xs font-bold text-foreground">Select a Lead</p>
                  <p className="text-[10px] text-muted-foreground leading-normal max-w-[150px] mx-auto">
                    Click any lead on the left list to review contact notes and update stages.
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl animate-reveal-up">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground">Add Manual Lead</h3>
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

            <form onSubmit={handleAddLead} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-muted-foreground">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Kart M."
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Email</label>
                  <input
                    type="email"
                    placeholder="name@email.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Phone</label>
                  <input
                    type="text"
                    placeholder="+1 (555) 0199"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-muted-foreground">Source</label>
                <select
                  value={formSource}
                  onChange={(e) => setFormSource(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-foreground appearance-none"
                >
                  <option value="website">Website Link</option>
                  <option value="call">Call Receptionist</option>
                  <option value="chat">AI Chat Bot</option>
                  <option value="referral">Referral</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-muted-foreground">Initial Notes / Requests</label>
                <textarea
                  rows={3}
                  placeholder="Need roofing quotation, urgent..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
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
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
