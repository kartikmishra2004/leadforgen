"use client";

import React from "react";
import { Search, ChevronDown, Settings } from "lucide-react";
import Link from "next/link";

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

  const orgMenuRef = React.useRef<HTMLDivElement>(null);
  const profileMenuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (orgMenuRef.current && !orgMenuRef.current.contains(event.target as Node)) {
        setShowOrgMenu(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }

    // Handle Escape key to close dropdowns
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setShowOrgMenu(false);
        setShowProfileMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <header className="h-16 border-b border-border bg-card/70 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-6 lg:pl-8">
      {/* Workspace Switcher / Org Filter */}
      <div className="flex items-center gap-4 pl-12 lg:pl-0">
        <div className="relative" ref={orgMenuRef}>
          <button
            onClick={() => setShowOrgMenu(!showOrgMenu)}
            className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-muted/50 hover:bg-muted border border-border rounded-lg transition-colors text-foreground"
          >
            <span className="truncate max-w-[120px]">{businessName}</span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>

          {showOrgMenu && orgsList.length > 0 && (
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
          )}
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

        {/* User Profile Info */}
        <div className="relative" ref={profileMenuRef}>
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
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card shadow-lg py-1.5 z-50 animate-reveal-up">
              <div className="px-4 py-2 border-b border-border">
                <p className="text-xs font-bold text-foreground">{userFullName}</p>
                <p className="text-[10px] text-muted-foreground truncate">{userEmail}</p>
              </div>
              <div className="py-1">
                <div className="px-4 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Settings
                </div>
                <Link 
                  href="/dashboard/profile"
                  onClick={() => setShowProfileMenu(false)}
                  className="px-4 py-1.5 text-xs text-foreground/80 flex items-center justify-between hover:bg-muted hover:text-foreground transition-colors rounded-lg mx-1 flex items-center justify-between font-medium"
                >
                  <span>Business Profile</span>
                  <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

