"use client";

import React, { useState, useEffect } from "react";
import { useWorkspace } from "../layout";
import { supabase } from "@/lib/supbase/client";
import { Globe, Save, Sparkles, Check, Phone, Mail, MapPin, Eye, Plus, Trash2, Clock } from "lucide-react";

export default function WebsiteBuilderPage() {
  const { currentOrg, setRlsErrors } = useWorkspace();
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [services, setServices] = useState<any[]>([]);
  
  const [newServiceName, setNewServiceName] = useState("");
  const [newServicePrice, setNewServicePrice] = useState("");
  const [newServiceDesc, setNewServiceDesc] = useState("");
  const [showAddService, setShowAddService] = useState(false);

  // Form states matching website_settings structure
  const [bizName, setBizName] = useState("");
  const [tagline, setTagline] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#6366F1");
  const [secondaryColor, setSecondaryColor] = useState("#EC4899");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [address, setAddress] = useState("");
  const [heroTitle, setHeroTitle] = useState("");
  const [heroDesc, setHeroDesc] = useState("");

  const orgId = currentOrg?.id || "demo-org-id";

  useEffect(() => {
    if (!currentOrg) return;

    async function loadWebsiteDetails() {
      setLoading(true);
      try {
        // Fetch Settings
        const { data: wsData, error: wsErr } = await supabase
          .from("website_settings")
          .select("*")
          .eq("organization_id", currentOrg.id)
          .maybeSingle();

        if (wsErr) {
          setRlsErrors(prev => [...prev, `website_settings: ${wsErr.message}`]);
        } else if (wsData) {
          setBizName(wsData.business_name || "");
          setTagline(wsData.tagline || "");
          setPrimaryColor(wsData.primary_color || "#6366F1");
          setSecondaryColor(wsData.secondary_color || "#EC4899");
          setContactEmail(wsData.contact_email || "");
          setContactPhone(wsData.contact_phone || "");
          setAddress(wsData.address || "");
          setHeroTitle(wsData.hero_title || "");
          setHeroDesc(wsData.hero_description || "");
        } else {
          // Initialize defaults
          setBizName(currentOrg.name || "");
          setTagline("Quality Service Professional");
          setPrimaryColor("#6366F1");
          setSecondaryColor("#EC4899");
        }

        // Fetch Services
        const { data: srvs } = await supabase
          .from("services")
          .select("*")
          .eq("organization_id", currentOrg.id)
          .eq("active", true);
        setServices(srvs || []);

      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    }

    loadWebsiteDetails();
  }, [currentOrg]);

  const handleSaveSettings = async () => {
    setSaveStatus("saving");

    const updatedFields = {
      business_name: bizName,
      tagline: tagline,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      address: address,
      hero_title: heroTitle,
      hero_description: heroDesc,
      updated_at: new Date().toISOString()
    };

    try {
      // Check if website_settings record exists
      const { data: checkData } = await supabase
        .from("website_settings")
        .select("id")
        .eq("organization_id", orgId)
        .maybeSingle();

      let dbErr = null;
      if (checkData) {
        const { error } = await supabase
          .from("website_settings")
          .update(updatedFields)
          .eq("organization_id", orgId);
        dbErr = error;
      } else {
        const { error } = await supabase
          .from("website_settings")
          .insert([{ organization_id: orgId, ...updatedFields }]);
        dbErr = error;
      }
      
      if (dbErr) {
        alert(`Failed to save settings: ${dbErr.message}`);
      } else {
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2500);
      }
    } catch (err: any) {
      alert(`Save error: ${err.message}`);
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim()) return;

    const newServiceItem = {
      organization_id: orgId,
      name: newServiceName,
      description: newServiceDesc || null,
      starting_price: Number(newServicePrice) || 0,
      active: true
    };

    try {
      const { data, error } = await supabase
        .from("services")
        .insert([newServiceItem])
        .select();

      if (error) {
        alert(`Failed to create service: ${error.message}`);
      } else if (data && data[0]) {
        setServices(prev => [...prev, data[0]]);
        setNewServiceName("");
        setNewServicePrice("");
        setNewServiceDesc("");
        setShowAddService(false);
      }
    } catch (err: any) {
      alert(err.message || "Insert failed");
    }
  };

  const handleDeleteService = async (srvId: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    try {
      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", srvId);
      
      if (error) {
        alert(`Delete failed: ${error.message}`);
        return;
      }
    } catch (err) {
      console.error(err);
    }

    setServices(prev => prev.filter(s => s.id !== srvId));
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-pulse">
        {/* Left builder form skeletons */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-card/40 border border-border/50 rounded-2xl p-5 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-border/50">
              <div className="space-y-2">
                <div className="h-5 w-48 bg-slate-200 rounded" />
                <div className="h-3 w-64 bg-slate-200/50 rounded" />
              </div>
              <div className="h-8 w-24 bg-slate-200 rounded-xl" />
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="h-3 w-20 bg-slate-200/50 rounded" />
                  <div className="h-9 w-full bg-slate-100 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-20 bg-slate-200/50 rounded" />
                  <div className="h-9 w-full bg-slate-100 rounded-xl" />
                </div>
              </div>
              
              <div className="h-14 bg-slate-100/50 rounded-xl w-full" />
            </div>
          </div>
        </div>

        {/* Right Phone preview skeleton */}
        <div className="lg:col-span-5 space-y-4 flex flex-col items-center">
          <div className="h-3 w-32 bg-slate-200/50 rounded self-start ml-4" />
          <div className="border-[6px] border-slate-800 rounded-[36px] bg-slate-900 shadow-2xl overflow-hidden aspect-[9/18] w-[260px] h-[480px] p-4 flex flex-col justify-between">
            <div className="h-6 w-full bg-slate-800/80 rounded" />
            <div className="h-28 w-full bg-slate-800/50 rounded-xl" />
            <div className="h-20 w-full bg-slate-800/50 rounded-xl" />
            <div className="h-10 w-full bg-slate-800/80 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-reveal-up">
      {/* Settings Form Column (Left) */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-card border border-border rounded-2xl p-5 shadow-soft space-y-5">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Globe className="h-5 w-5 text-[#6366F1]" />
                White-Labeled Page Builder
              </h2>
              <p className="text-xs text-muted-foreground">Customize branding and configure service listings.</p>
            </div>
            <button
              onClick={handleSaveSettings}
              disabled={saveStatus === "saving"}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-xl shadow-md transition-all shrink-0 disabled:opacity-50"
            >
              {saveStatus === "saving" ? (
                "Saving..."
              ) : saveStatus === "saved" ? (
                <>
                  <Check className="h-4 w-4" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>

          {/* Form Fields */}
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-muted-foreground">Business Name</label>
                <input
                  type="text"
                  value={bizName}
                  onChange={(e) => setBizName(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-muted-foreground">Business Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                />
              </div>
            </div>

            {/* Colors picker */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground">Primary Accent Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-8 w-12 rounded border border-border cursor-pointer bg-transparent"
                  />
                  <span className="font-mono text-[10px] text-muted-foreground">{primaryColor}</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground">Secondary Brand Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="h-8 w-12 rounded border border-border cursor-pointer bg-transparent"
                  />
                  <span className="font-mono text-[10px] text-muted-foreground">{secondaryColor}</span>
                </div>
              </div>
            </div>

            {/* Hero Banner settings */}
            <div className="space-y-3.5 border-t border-border pt-4">
              <h3 className="text-xs font-bold text-foreground flex items-center gap-1">
                <Sparkles className="h-4 w-4 text-primary" />
                Landing Page Hero Banner
              </h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Hero Headline Title</label>
                  <input
                    type="text"
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Hero Sub-description</label>
                  <textarea
                    rows={2}
                    value={heroDesc}
                    onChange={(e) => setHeroDesc(e.target.value)}
                    className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  />
                </div>
              </div>
            </div>

            {/* Contact details */}
            <div className="space-y-3.5 border-t border-border pt-4">
              <h3 className="text-xs font-bold text-foreground">Contact & Address Channels</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Public Email Address</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Public Support Phone</label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="font-bold text-muted-foreground">Shop / Office Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Services listings manager */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-soft space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-xs font-bold text-foreground">Active Services Tiers</h3>
            <button
              onClick={() => setShowAddService(!showAddService)}
              className="text-[10px] font-bold text-[#6366F1] hover:underline flex items-center gap-0.5"
            >
              <Plus className="h-3.5 w-3.5" /> Add Tier
            </button>
          </div>

          {showAddService && (
            <form onSubmit={handleAddService} className="p-3.5 bg-muted/20 border border-border rounded-xl space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Service Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Standard Room Cleaning"
                    value={newServiceName}
                    onChange={(e) => setNewServiceName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-card border border-border rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Starting Price ($)</label>
                  <input
                    type="number"
                    placeholder="e.g. 120"
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-card border border-border rounded-lg"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="font-bold text-muted-foreground">Service Description</label>
                <input
                  type="text"
                  placeholder="Includes dusting, sweeping..."
                  value={newServiceDesc}
                  onChange={(e) => setNewServiceDesc(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-card border border-border rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddService(false)}
                  className="px-3 py-1 border border-border rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-primary text-white font-bold rounded-lg"
                >
                  Add Service
                </button>
              </div>
            </form>
          )}

          <div className="space-y-2">
            {services.length === 0 ? (
              <p className="text-[10px] text-muted-foreground italic text-center py-4">No active services defined yet.</p>
            ) : (
              services.map((srv) => (
                <div key={srv.id} className="flex items-center justify-between p-3 bg-muted/15 border border-border/50 rounded-xl">
                  <div>
                    <p className="text-xs font-bold text-foreground">{srv.name}</p>
                    <p className="text-[9px] text-muted-foreground mt-0.5">{srv.description || "No description provided."}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-extrabold text-[#6366F1]">${srv.starting_price}</span>
                    <button
                      onClick={() => handleDeleteService(srv.id)}
                      className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Live Phone Preview Column */}
      <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-20">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 pl-2">
          <Eye className="h-4 w-4" /> Live Mobile Webpage Preview
        </span>

        <div className="border-[6px] border-slate-800 rounded-[36px] bg-slate-900 shadow-2xl overflow-hidden aspect-[9/18] max-w-[280px] mx-auto relative flex flex-col">
          {/* Notch */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-900 rounded-full z-20 flex justify-center items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-800/80 mr-4" />
            <span className="w-8 h-1 bg-slate-800/80 rounded" />
          </div>

          <div className="flex-1 bg-white text-slate-800 text-[10px] overflow-y-auto pt-6 flex flex-col justify-between">
            {/* Header */}
            <header className="px-4 py-2 border-b border-slate-100 flex items-center justify-between bg-white/95 sticky top-0 z-10">
              <span className="font-bold text-slate-900 truncate max-w-[120px]">
                {bizName || "Service Pro"}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[7px] font-bold text-white shadow-sm" style={{ backgroundColor: primaryColor }}>
                Book
              </span>
            </header>

            {/* Hero */}
            <section className="px-4 py-6 text-center space-y-2 bg-slate-50 relative overflow-hidden">
              <div 
                className="absolute inset-0 opacity-10 pointer-events-none" 
                style={{ 
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` 
                }} 
              />
              <h2 className="text-sm font-extrabold text-slate-900 leading-tight">
                {heroTitle || `Quality Services for Your Home`}
              </h2>
              <p className="text-[9px] text-slate-500 leading-relaxed max-w-[180px] mx-auto">
                {heroDesc || tagline || `Professional service technicians available 24/7.`}
              </p>
              <button 
                className="px-3.5 py-1.5 rounded-lg text-white font-bold inline-flex items-center gap-1 shadow-sm mt-1 transform hover:scale-105 active:scale-95 transition-transform"
                style={{ backgroundColor: primaryColor }}
              >
                Schedule Online
              </button>
            </section>

            {/* Services List snippet */}
            <section className="px-4 py-4 space-y-2 bg-white">
              <h3 className="font-extrabold text-slate-900 border-b border-slate-100 pb-1 text-[9px]">Our Services</h3>
              <div className="space-y-1.5">
                {services.slice(0, 3).map((srv) => (
                  <div key={srv.id} className="p-2 border border-slate-100 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900 text-[8px]">{srv.name}</p>
                      <p className="text-[7px] text-slate-400 truncate max-w-[120px]">{srv.description}</p>
                    </div>
                    <span className="font-bold text-[8px]" style={{ color: primaryColor }}>
                      ${srv.starting_price}
                    </span>
                  </div>
                ))}
                {services.length === 0 && (
                  <p className="text-[8px] text-slate-400 italic text-center py-2">Consultation services available</p>
                )}
              </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-400 p-4 text-[7px] space-y-2 mt-auto">
              <p className="font-bold text-white text-[8px]">{bizName || "Service Pro"}</p>
              <p className="leading-tight">{tagline}</p>
              
              <div className="space-y-1 pt-1.5 text-slate-500 border-t border-slate-800">
                {contactPhone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-2.5 w-2.5 text-slate-600" />
                    <span>{contactPhone}</span>
                  </div>
                )}
                {contactEmail && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-2.5 w-2.5 text-slate-600" />
                    <span>{contactEmail}</span>
                  </div>
                )}
                {address && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-2.5 w-2.5 text-slate-600" />
                    <span className="truncate max-w-[180px]">{address}</span>
                  </div>
                )}
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
