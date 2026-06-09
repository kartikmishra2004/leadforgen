"use client";

import React, { useState, useEffect } from "react";
import { useWorkspace } from "../layout";
import { supabase } from "@/lib/supbase/client";
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  X,
  AlertCircle,
  Trash2,
  User,
} from "lucide-react";

export default function AppointmentsPage() {
  const { currentOrg, setRlsErrors, showAlert, showConfirm } = useWorkspace();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [formCustomerId, setFormCustomerId] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formTime, setFormTime] = useState("");
  const [formNotes, setFormNotes] = useState("");

  const orgId = currentOrg?.id || "demo-org-id";

  const loadDependenciesAndAppointments = async () => {
    if (!currentOrg) return;
    setLoading(true);
    try {
      // Fetch Appointments
      const { data: appts, error: apptErr } = await supabase
        .from("appointments")
        .select("*")
        .eq("organization_id", currentOrg.id)
        .order("appointment_date", { ascending: true });

      if (apptErr) {
        setRlsErrors(prev => [...prev, `appointments: ${apptErr.message}`]);
      } else {
        setAppointments(appts || []);
      }

      // Fetch Customers (for booking selector)
      const { data: custs } = await supabase
        .from("customers")
        .select("id, name, email")
        .eq("organization_id", currentOrg.id);
      setCustomers(custs || []);

      // Fetch Services (for service selector)
      const { data: srvs } = await supabase
        .from("services")
        .select("id, name, starting_price")
        .eq("organization_id", currentOrg.id)
        .eq("active", true);
      setServices(srvs || []);

    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDependenciesAndAppointments();
  }, [currentOrg]);

  const handleCreateAppt = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formTitle.trim()) {
      setErrorMsg("Title/Subject is required");
      return;
    }
    if (!formDate || !formTime) {
      setErrorMsg("Date and Time are required");
      return;
    }

    const apptDateTime = new Date(`${formDate}T${formTime}`).toISOString();
    const newApptItem = {
      organization_id: orgId,
      customer_id: formCustomerId || null,
      title: formTitle,
      appointment_date: apptDateTime,
      status: "scheduled",
      notes: formNotes || null
    };

    try {
      const { data, error } = await supabase
        .from("appointments")
        .insert([newApptItem])
        .select();

      if (error) {
        setErrorMsg(`Schedule failed: ${error.message}`);
      } else if (data && data[0]) {
        setAppointments(prev => [...prev, data[0]]);
        setFormCustomerId("");
        setFormTitle("");
        setFormDate("");
        setFormTime("");
        setFormNotes("");
        setShowAddModal(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to schedule");
    }
  };

  const handleCancelAppt = async (apptId: string) => {
    if (!await showConfirm("Are you sure you want to cancel this appointment?", "Cancel Appointment", { variant: "destructive" })) return;
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status: "cancelled" })
        .eq("id", apptId);

      if (error) {
        await showAlert(`Cancel failed: ${error.message}`, "Error", "error");
        return;
      }
    } catch (err) {
      console.error(err);
    }

    setAppointments(prev => prev.map(a => a.id === apptId ? { ...a, status: "cancelled" } : a));
  };

  const handleDeleteAppt = async (apptId: string) => {
    if (!await showConfirm("Are you sure you want to delete this appointment?", "Delete Appointment", { variant: "destructive" })) return;
    try {
      const { error } = await supabase
        .from("appointments")
        .delete()
        .eq("id", apptId);

      if (error) {
        await showAlert(`Delete failed: ${error.message}`, "Error", "error");
        return;
      }
    } catch (err) {
      console.error(err);
    }

    setAppointments(prev => prev.filter(a => a.id !== apptId));
  };

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

        {/* Grid of appointment cards skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-card/40 border border-border/50 rounded-2xl p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1.5 w-2/3">
                  <div className="h-4 bg-slate-200/60 rounded w-full" />
                  <div className="h-3 bg-slate-100/70 rounded w-1/2" />
                </div>
                <div className="h-4 w-12 bg-slate-200/50 rounded-full" />
              </div>
              <div className="h-10 bg-slate-100/50 rounded-xl w-full" />
              <div className="h-4 bg-slate-100/50 rounded w-1/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-[#6366F1]" />
            Appointment Schedules
          </h2>
          <p className="text-xs text-muted-foreground">Schedule client onsite meetings and services.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-xl shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Schedule Appointment
        </button>
      </div>

      {appointments.length === 0 ? (
        /* Minimal logo empty state */
        <div className="py-12 text-center max-w-sm mx-auto animate-reveal-up">
          <img src="/logo.png" alt="Lead For Gen Logo" className="h-10 w-10 mx-auto object-contain mb-3 opacity-60" />
          <h3 className="text-sm font-bold text-foreground mb-1">No Booked Appointments</h3>
          <p className="text-xs text-muted-foreground mb-4">
            You don't have any customer bookings or jobs scheduled on your calendar. Create a slot to get started.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 text-xs font-bold bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-xl shadow-sm inline-flex items-center gap-1 transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            Schedule First Booking
          </button>
        </div>
      ) : (
        /* Grid of Appointments */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
          {appointments.map((appt) => {
            const client = customers.find(c => c.id === appt.customer_id) || { name: "General Customer", email: "" };
            const service = services.find(s => s.id === appt.service_id) || { name: "General Assessment" };
            const apptDateObj = new Date(appt.appointment_date);

            return (
              <div
                key={appt.id}
                className={`bg-card border border-border rounded-2xl p-5 shadow-soft space-y-4 flex flex-col justify-between relative overflow-hidden
                  ${appt.status === "cancelled" ? "opacity-60 bg-muted/10" : ""}`}
              >
                <div className={`absolute top-0 left-0 right-0 h-1 
                  ${appt.status === "cancelled" ? "bg-red-500/40" : "bg-gradient-to-r from-[#6366F1] to-[#EC4899]"}`}
                />

                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-foreground leading-tight line-clamp-1">{appt.title}</h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{service.name}</p>
                    </div>
                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full capitalize border
                      ${appt.status === "scheduled" ? "bg-blue-500/10 text-blue-500 border border-blue-500/10" :
                        appt.status === "completed" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/10" :
                          "bg-red-500/10 text-red-500 border border-red-500/10"}`}
                    >
                      {appt.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 bg-muted/40 border border-border/50 rounded-xl p-2.5 text-[10px] text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="h-3.5 w-3.5 text-primary" />
                      <span className="font-bold text-foreground">
                        {apptDateObj.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 border-l border-border pl-4">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      <span className="font-bold text-foreground">
                        {apptDateObj.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 pt-1">
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span className="font-bold text-foreground">{client.name}</span>
                    </div>
                    {appt.notes && (
                      <p className="text-[9px] text-muted-foreground bg-muted/20 p-2 rounded-lg border border-border/40 italic">
                        "{appt.notes}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 border-t border-border pt-4 mt-2">
                  {appt.status === "scheduled" && (
                    <button
                      onClick={() => handleCancelAppt(appt.id)}
                      className="flex-1 px-3 py-1.5 border border-border hover:bg-muted text-[10px] font-bold rounded-lg transition-colors"
                    >
                      Cancel Meeting
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteAppt(appt.id)}
                    className="p-1.5 border border-destructive/20 hover:border-destructive/40 text-destructive bg-destructive/5 hover:bg-destructive/10 rounded-lg transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Booking Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl animate-reveal-up">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground">Book Appointment</h3>
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

            <form onSubmit={handleCreateAppt} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-muted-foreground">Subject / Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Roof repair inspection"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-muted-foreground">Select Customer</label>
                <select
                  value={formCustomerId}
                  onChange={(e) => setFormCustomerId(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-foreground appearance-none"
                >
                  <option value="">Choose an existing profile...</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.email || "No email"})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Date *</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Time *</label>
                  <input
                    type="time"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-muted-foreground">Internal Notes</label>
                <textarea
                  rows={2}
                  placeholder="Need to carry testing kit..."
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
                  Create Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
