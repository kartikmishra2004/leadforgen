"use client";

import React from "react";
import { Search, ChevronDown, Bell, Settings, User } from "lucide-react";

interface HeaderProps {
  userEmail: string;
  userFullName: string;
  businessName: string;
  orgsList: any[];
  currentOrg: any;
  onChangeOrg: (orgId: string) => void;
}

export function Header({ 
  userEmail, 
  userFullName, 
  businessName, 
  orgsList = [], 
  currentOrg, 
  onChangeOrg 
}: HeaderProps) {
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);
  const [showOrgMenu, setShowOrgMenu] = React.useState(false);

  return (
    <header className="h-16 border-b border-border bg-card/70 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-6 lg:pl-8">
      {/* Workspace Switcher / Org Filter */}
      <div className="flex items-center gap-4 pl-12 lg:pl-0">
        <div className="relative">
          <button
            onClick={() => setShowOrgMenu(!showOrgMenu)}
            className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-muted/50 hover:bg-muted border border-border rounded-lg transition-colors text-foreground"
          >
            <span className="truncate max-w-[120px]">{businessName}</span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>

          {showOrgMenu && orgsList.length > 0 && (
            <>
              <div className="absolute left-0 mt-1 w-56 rounded-xl border border-border bg-card shadow-lg py-1 z-50 animate-reveal-up">
                <div className="px-3 py-1.5 border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Select Organization
                </div>
                {orgsList.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => {
                      onChangeOrg(o.id);
                      setShowOrgMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-muted transition-colors flex items-center justify-between
                      ${currentOrg?.id === o.id ? "text-primary" : "text-foreground"}`}
                  >
                    <span>{o.name}</span>
                    {currentOrg?.id === o.id && (
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    )}
                  </button>
                ))}
              </div>
              <div onClick={() => setShowOrgMenu(false)} className="fixed inset-0 z-40" />
            </>
          )}
        </div>

        {/* Dummy quick filters as seen in mockup */}
        <div className="hidden sm:flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 bg-muted/30 border border-border rounded-lg text-muted-foreground font-medium">
            Active Workspace
          </span>
          <span className="px-3 py-1.5 bg-muted/30 border border-border rounded-lg text-muted-foreground font-medium hidden md:inline">
            Status: Live
          </span>
        </div>
      </div>

      {/* Right Side Tools */}
      <div className="flex items-center gap-4">
        {/* Search Input */}
        <div className="relative hidden md:block w-56 lg:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Quick search leads, quotes..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-muted/40 hover:bg-muted/70 focus:bg-card border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-foreground"
          />
        </div>

        {/* Action icons */}
        <button className="relative p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors">
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-[#EC4899]" />
        </button>

        {/* User Profile Info */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 p-1 hover:bg-muted/50 rounded-xl transition-all"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-[#0088FF] to-[#8B5CF6] flex items-center justify-center text-white text-xs font-bold shadow-soft">
              {userFullName.charAt(0).toUpperCase()}
            </div>
            <div className="text-left hidden lg:block pr-1.5">
              <p className="text-xs font-bold text-foreground leading-tight">{userFullName}</p>
              <p className="text-[10px] text-muted-foreground leading-none mt-0.5 max-w-[120px] truncate">{userEmail}</p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden lg:block" />
          </button>

          {showProfileMenu && (
            <>
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card shadow-lg py-1.5 z-50 animate-reveal-up">
                <div className="px-4 py-2 border-b border-border">
                  <p className="text-xs font-bold text-foreground">{userFullName}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{userEmail}</p>
                </div>
                <div className="py-1">
                  <div className="px-4 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Settings
                  </div>
                  <div className="px-4 py-1 text-xs text-foreground/80 flex items-center justify-between">
                    <span>Account Profile</span>
                    <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                </div>
              </div>
              <div onClick={() => setShowProfileMenu(false)} className="fixed inset-0 z-40" />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
