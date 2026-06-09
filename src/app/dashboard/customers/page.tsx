"use client";

import React, { useState, useEffect } from "react";
import { useWorkspace } from "../layout";
import { supabase } from "@/lib/supbase/client";
import { Users, Search, Plus, X, AlertCircle, Phone, Mail, MapPin, Trash2, Clock } from "lucide-react";

export default function CustomersPage() {
  const { currentOrg, setRlsErrors, showAlert, showConfirm } = useWorkspace();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCust, setSelectedCust] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formAddress, setFormAddress] = useState("");

  const orgId = currentOrg?.id || "demo-org-id";

  const fetchCustomers = async () => {
    if (!currentOrg) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("organization_id", currentOrg.id)
        .order("created_at", { ascending: false });

      if (error) {
        setRlsErrors(prev => [...prev, `customers: ${error.message}`]);
      } else {
        setCustomers(data || []);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, [currentOrg]);

  const handleAddCust = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formName.trim()) {
      setErrorMsg("Name is required");
      return;
    }

    const newCustItem = {
      organization_id: orgId,
      name: formName,
      email: formEmail || null,
      phone: formPhone || null,
      address: formAddress || null
    };

    try {
      const { data, error } = await supabase
        .from("customers")
        .insert([newCustItem])
        .select();

      if (error) {
        setErrorMsg(`Failed to save customer: ${error.message}`);
      } else if (data && data[0]) {
        setCustomers(prev => [data[0], ...prev]);
        setFormName("");
        setFormEmail("");
        setFormPhone("");
        setFormAddress("");
        setShowAddModal(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create profile");
    }
  };

  const handleDeleteCust = async (custId: string) => {
    if (!await showConfirm("Are you sure you want to delete this customer profile?", "Delete Profile", { variant: "destructive" })) return;
    try {
      const { error } = await supabase
        .from("customers")
        .delete()
        .eq("id", custId);
      
      if (error) {
        await showAlert(`Failed to delete profile: ${error.message}`, "Error", "error");
        return;
      }
    } catch (err) {
      console.error(err);
    }

    setCustomers(prev => prev.filter(c => c.id !== custId));
    setSelectedCust(null);
  };

  const filteredCustomers = customers.filter(c => 
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.toLowerCase().includes(search.toLowerCase())
  );

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
        
        {/* Search row skeleton */}
        <div className="h-9 w-full bg-slate-100 rounded-xl" />

        {/* Content grid split view skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card/40 border border-border/50 rounded-2xl p-4 space-y-4">
            <div className="h-8 bg-slate-200/60 rounded-lg w-full" />
            <div className="h-10 bg-slate-100/70 rounded-xl w-full" />
            <div className="h-10 bg-slate-100/70 rounded-xl w-full" />
            <div className="h-10 bg-slate-100/70 rounded-xl w-full" />
            <div className="h-10 bg-slate-100/70 rounded-xl w-full" />
          </div>
          <div className="bg-card/40 border border-border/50 rounded-2xl p-5 space-y-4">
            <div className="h-8 bg-slate-200/60 rounded-lg w-1/3" />
            <div className="h-24 bg-slate-100/70 rounded-xl w-full" />
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
            <Users className="h-5 w-5 text-[#6366F1]" />
            Customer Profiles
          </h2>
          <p className="text-xs text-muted-foreground">Manage accounts, billing details, and service logs.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-xl shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Add Customer
        </button>
      </div>

      {customers.length === 0 ? (
        /* Minimal logo empty state */
        <div className="py-12 text-center max-w-sm mx-auto animate-reveal-up">
          <img src="/logo.png" alt="Lead For Gen Logo" className="h-10 w-10 mx-auto object-contain mb-3 opacity-60" />
          <h3 className="text-sm font-bold text-foreground mb-1">No Registered Customers</h3>
          <p className="text-xs text-muted-foreground mb-4">
            You haven't added any clients to your CRM platform yet. Register accounts to get started.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 text-xs font-bold bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-xl shadow-sm inline-flex items-center gap-1 transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            Register Customer
          </button>
        </div>
      ) : (
        <>
          {/* Search Filter */}
          <div className="relative animate-fade-in">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, email, or phone number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-card border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-foreground"
            />
          </div>

          {/* Main split display */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fade-in">
            {/* Table list */}
            <div className="lg:col-span-2 bg-card border border-border rounded-2xl overflow-hidden shadow-soft">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/20 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="px-5 py-3">Customer Name</th>
                      <th className="px-5 py-3">Email</th>
                      <th className="px-5 py-3">Phone</th>
                      <th className="px-5 py-3">Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-5 py-8 text-center text-xs text-muted-foreground italic bg-card">
                          No customer profiles registered.
                        </td>
                      </tr>
                    ) : (
                      filteredCustomers.map((cust) => (
                        <tr
                          key={cust.id}
                          onClick={() => setSelectedCust(cust)}
                          className={`hover:bg-muted/30 transition-colors cursor-pointer text-xs
                            ${selectedCust?.id === cust.id ? "bg-primary/5 hover:bg-primary/5" : ""}`}
                        >
                          <td className="px-5 py-3.5 font-bold text-foreground">{cust.name}</td>
                          <td className="px-5 py-3.5 text-muted-foreground">{cust.email || "—"}</td>
                          <td className="px-5 py-3.5 text-muted-foreground">{cust.phone || "—"}</td>
                          <td className="px-5 py-3.5 text-muted-foreground truncate max-w-[150px]">{cust.address || "—"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Side panel */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-soft space-y-4">
              {selectedCust ? (
                <>
                  <div className="flex items-start justify-between border-b border-border pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-foreground">{selectedCust.name}</h3>
                      <p className="text-[9px] text-muted-foreground mt-0.5">Customer Profile</p>
                    </div>
                    <button
                      onClick={() => setSelectedCust(null)}
                      className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-3.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-[#6366F1] shrink-0" />
                      <span className="text-foreground">{selectedCust.email || "No email assigned"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-[#6366F1] shrink-0" />
                      <span className="text-foreground">{selectedCust.phone || "No phone assigned"}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-[#6366F1] shrink-0 mt-0.5" />
                      <span className="text-foreground leading-relaxed">{selectedCust.address || "No address on file"}</span>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4">
                    <button
                      onClick={() => handleDeleteCust(selectedCust.id)}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 border border-destructive/20 hover:border-destructive/40 text-destructive bg-destructive/5 hover:bg-destructive/10 rounded-xl text-xs font-bold transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete Profile
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 space-y-2">
                  <Users className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                  <p className="text-xs font-bold text-foreground">Select a Customer</p>
                  <p className="text-[10px] text-muted-foreground max-w-[150px] mx-auto leading-normal">
                    Choose a customer from the table list to see contact channels and address routing.
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl animate-reveal-up">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground">Register Customer</h3>
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

            <form onSubmit={handleAddCust} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-muted-foreground">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. John Green"
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
                    placeholder="john@example.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Phone</label>
                  <input
                    type="text"
                    placeholder="+1 (555) 0122"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-muted-foreground">Service Address</label>
                <input
                  type="text"
                  placeholder="Street name, City, ZIP code"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
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
                  Create Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
