"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Sparkles, 
  Calendar, 
  FileText, 
  Users, 
  Globe, 
  Bot, 
  LogOut, 
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface SidebarProps {
  onSignOut: () => void;
  businessName: string;
  activeTab?: string; // Preserve parameter signature for compatibility but ignored
  setActiveTab?: (tab: string) => void;
  isCollapsed?: boolean;
  setIsCollapsed?: (collapsed: boolean) => void;
}

export function Sidebar({ onSignOut, businessName, isCollapsed = false, setIsCollapsed }: SidebarProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const pathname = usePathname();

  const toggleCollapse = () => {
    if (setIsCollapsed) {
      const next = !isCollapsed;
      try {
        localStorage.setItem("sidebar-collapsed", String(next));
      } catch (e) {
        console.error(e);
      }
      setIsCollapsed(next);
    }
  };

  const menuItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard, href: "/dashboard" },
    { id: "leads", label: "Leads", icon: Sparkles, href: "/dashboard/leads" },
    { id: "appointments", label: "Appointments", icon: Calendar, href: "/dashboard/appointments" },
    { id: "quotes", label: "Quotes", icon: FileText, href: "/dashboard/quotes" },
    { id: "customers", label: "Customers", icon: Users, href: "/dashboard/customers" },
    { id: "website", label: "Website Builder", icon: Globe, href: "/dashboard/website" },
    { id: "ai", label: "Kai Assistant", icon: Bot, href: "/dashboard/ai" },
  ];

  return (
    <>
      {/* Mobile Toggle Button (only visible when sidebar is closed) */}
      {!isOpen && (
        <div className="lg:hidden fixed top-4 left-4 z-50">
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 rounded-lg bg-card border border-border shadow-soft text-foreground focus:outline-none"
            aria-label="Open Sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-[#0B0D19] text-[#E2E8F0] transform transition-all duration-300 ease-in-out flex flex-col border-r border-[#1E293B]/50 overflow-x-hidden group/sidebar
          ${isOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"}
          ${isCollapsed ? "lg:w-20" : "lg:w-64"}`}
      >
        {/* Brand Header */}
        <div className={`h-16 flex items-center border-b border-[#1E293B]/50 shrink-0 transition-all duration-300 overflow-hidden
          ${isCollapsed ? "justify-center px-2" : "justify-between px-6"}`}
        >
          {!isCollapsed ? (
            <>
              <Link href="/" className="flex items-center gap-3 min-w-0 hover:opacity-90 transition-opacity">
                <img src="/logo.png" alt="Lead For Gen Logo" className="h-8 w-8 object-contain shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="font-bold tracking-tight text-white text-base truncate">Lead For Gen</span>
                  <span className="text-[10px] text-[#94A3B8] font-medium tracking-wide truncate max-w-[130px]">
                    {businessName || "Workspace"}
                  </span>
                </div>
              </Link>
              
              {/* Desktop Menu toggle button */}
              <button
                onClick={toggleCollapse}
                className="hidden lg:flex p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#1E293B]/60 transition-colors focus:outline-none"
                title="Collapse Sidebar"
              >
                <Menu className="h-4 w-4" />
              </button>

              {/* Mobile Close Button (Cross icon X at the right) */}
              <button
                onClick={() => setIsOpen(false)}
                className="lg:hidden p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#1E293B]/60 transition-colors focus:outline-none"
                aria-label="Close Sidebar"
              >
                <X className="h-5 w-5" />
              </button>
            </>
          ) : (
            <button
              onClick={toggleCollapse}
              className="flex items-center justify-center p-2 rounded-xl text-[#94A3B8] hover:text-white hover:bg-[#1E293B]/60 transition-colors focus:outline-none relative w-12 h-12 group"
            >
              {/* Brand Logo - visible by default, fades when sidebar is hovered anywhere */}
              <img 
                src="/logo.png" 
                alt="Lead For Gen Logo" 
                className="h-8 w-8 object-contain shrink-0 transition-opacity duration-150 group-hover/sidebar:opacity-0" 
              />
              
              {/* Menu Icon - hidden by default, scales and fades in when sidebar is hovered anywhere */}
              <Menu 
                className="h-4.5 w-4.5 absolute opacity-0 scale-90 group-hover/sidebar:opacity-100 group-hover/sidebar:scale-100 transition-all duration-150 text-white" 
              />

              {/* Expand Tooltip */}
              <div className="absolute left-full ml-3 px-2.5 py-1 bg-[#1E293B] text-white border border-[#334155] text-xs font-semibold rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 shadow-lg whitespace-nowrap z-50">
                Expand Sidebar
              </div>
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className={`flex-1 overflow-y-auto overflow-x-hidden py-6 space-y-1 transition-all duration-300 ${isCollapsed ? "px-2" : "px-4"}`}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            // Check if current path equals the item's href
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`w-full flex items-center rounded-xl font-medium transition-all duration-200 group relative
                  ${isCollapsed ? "justify-center p-2.5" : "justify-start gap-2.5 px-3 py-2 text-[13px]"}
                  ${isActive 
                    ? "bg-[#6366F1]/10 text-white border-l-4 border-[#6366F1] shadow-[inset_0_0_12px_rgba(99,102,241,0.06)]" 
                    : "text-[#94A3B8] hover:bg-[#1E293B]/30 hover:text-white border-l-4 border-transparent"
                  }`}
              >
                <Icon className={`h-4 w-4 transition-colors duration-200 shrink-0
                  ${isActive ? "text-[#6366F1]" : "text-[#94A3B8] group-hover:text-white"}`} 
                />
                
                {!isCollapsed && <span className="truncate">{item.label}</span>}

                {/* Collapsed Tooltip */}
                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1 bg-[#1E293B] text-white border border-[#334155] text-xs font-semibold rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 shadow-lg whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}

                {isActive && !isCollapsed && (
                  <span className="absolute right-3 h-1.5 w-1.5 rounded-full bg-[#EC4899] animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Section */}
        <div className={`border-t border-[#1E293B]/50 shrink-0 bg-[#070913] transition-all duration-300 overflow-hidden ${isCollapsed ? "p-2" : "p-4"}`}>
          <button
            onClick={onSignOut}
            className={`w-full flex items-center rounded-xl font-medium text-[#94A3B8] hover:bg-destructive/10 hover:text-destructive-foreground transition-all duration-200 group relative
              ${isCollapsed ? "justify-center p-2.5" : "justify-start gap-2.5 px-3 py-2 text-[13px]"}`}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            
            {!isCollapsed && <span className="truncate">Sign Out</span>}

            {/* Collapsed Tooltip */}
            {isCollapsed && (
              <div className="absolute left-full ml-3 px-2.5 py-1 bg-destructive text-white border border-destructive/20 text-xs font-semibold rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 shadow-lg whitespace-nowrap z-50">
                Sign Out
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* Overlay for Mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-30 bg-black/55 backdrop-blur-sm lg:hidden"
        />
      )}
    </>
  );
}
