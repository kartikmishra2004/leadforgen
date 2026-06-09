"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supbase/client";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { Loader2, AlertTriangle, CheckCircle2, Info, XCircle, HelpCircle } from "lucide-react";

// Define the shape of our shared Workspace Context
interface WorkspaceContextType {
  user: any;
  orgs: any[];
  currentOrg: any;
  setCurrentOrg: (org: any) => void;
  rlsErrors: string[];
  setRlsErrors: React.Dispatch<React.SetStateAction<string[]>>;
  showAlert: (message: string, title?: string, type?: "info" | "success" | "error" | "warning") => Promise<void>;
  showConfirm: (message: string, title?: string, options?: { confirmText?: string; cancelText?: string; variant?: "default" | "destructive" }) => Promise<boolean>;
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [orgs, setOrgs] = useState<any[]>([]);
  const [currentOrg, setCurrentOrg] = useState<any>(null);
  const [rlsErrors, setRlsErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Dialog State
  const [dialog, setDialog] = useState<{
    type: "alert" | "confirm";
    title: string;
    message: string;
    alertType?: "info" | "success" | "error" | "warning";
    confirmText?: string;
    cancelText?: string;
    variant?: "default" | "destructive";
    resolve: (value?: any) => void;
  } | null>(null);

  // Load initial collapsed state on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("sidebar-collapsed");
      if (stored === "true") {
        setIsSidebarCollapsed(true);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Keyboard support for custom dialogs
  useEffect(() => {
    if (!dialog) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (dialog.type === "confirm") {
          dialog.resolve(false);
        } else {
          dialog.resolve();
        }
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (dialog.type === "confirm") {
          dialog.resolve(true);
        } else {
          dialog.resolve();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [dialog]);

  // Authenticate user and fetch owned organizations
  useEffect(() => {
    async function initWorkspace() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          router.push("/login");
          return;
        }
        setUser(session.user);

        // Query organizations
        const { data: orgList, error: orgError } = await supabase
          .from("organizations")
          .select("*")
          .eq("owner_id", session.user.id);

        if (orgError) {
          console.error("Error loading organizations:", orgError);
          setRlsErrors(prev => [...prev, `organizations: ${orgError.message}`]);
        }

        if (orgList && orgList.length > 0) {
          setOrgs(orgList);
          setCurrentOrg(orgList[0]);
        } else {
          // Redirect to onboarding if they don't own any organization
          router.push("/onboarding");
          return;
        }
      } catch (err) {
        console.error("Workspace init failed", err);
      }
      setLoading(false);
    }

    initWorkspace();
  }, [router]);

  const handleOrgChange = (orgId: string) => {
    const nextOrg = orgs.find(o => o.id === orgId);
    if (nextOrg) {
      setCurrentOrg(nextOrg);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    router.push("/login");
  };

  const showAlert = (
    message: string,
    title: string = "Notification",
    type: "info" | "success" | "error" | "warning" = "info"
  ) => {
    return new Promise<void>((resolve) => {
      setDialog({
        type: "alert",
        title,
        message,
        alertType: type,
        confirmText: "OK",
        resolve: () => {
          setDialog(null);
          resolve();
        },
      });
    });
  };

  const showConfirm = (
    message: string,
    title: string = "Confirm Action",
    options?: { confirmText?: string; cancelText?: string; variant?: "default" | "destructive" }
  ) => {
    return new Promise<boolean>((resolve) => {
      setDialog({
        type: "confirm",
        title,
        message,
        confirmText: options?.confirmText || "Confirm",
        cancelText: options?.cancelText || "Cancel",
        variant: options?.variant || "default",
        resolve: (value: boolean) => {
          setDialog(null);
          resolve(value);
        },
      });
    });
  };

  const renderDialogIcon = () => {
    if (!dialog) return null;
    if (dialog.type === "alert") {
      switch (dialog.alertType) {
        case "success":
          return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
        case "error":
          return <XCircle className="h-5 w-5 text-red-500" />;
        case "warning":
          return <AlertTriangle className="h-5 w-5 text-amber-500" />;
        case "info":
        default:
          return <Info className="h-5 w-5 text-[#6366F1]" />;
      }
    } else {
      if (dialog.variant === "destructive") {
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      }
      return <HelpCircle className="h-5 w-5 text-[#6366F1]" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070913] flex items-center justify-center relative overflow-hidden">
        {/* Background Grids & Glows */}
        <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
        <div className="absolute w-[300px] h-[300px] rounded-full bg-[#6366F1]/10 blur-[80px] pointer-events-none" />

        {/* Animated Brand Logo Loader */}
        <div className="relative flex items-center justify-center">
          <img
            src="/logo.png"
            alt="Loading"
            className="h-9 w-9 object-contain relative z-10 animate-pulse"
          />
        </div>
      </div>
    );
  }

  const userEmail = user?.email || "";
  const userFullName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Operator Pro";
  const businessName = currentOrg?.name || "Workspace";

  return (
    <WorkspaceContext.Provider value={{
      user,
      orgs,
      currentOrg,
      setCurrentOrg,
      rlsErrors,
      setRlsErrors,
      showAlert,
      showConfirm
    }}>
      <div className="min-h-screen bg-background text-foreground flex dashboard-root">
        {/* Shared Left Sidebar Navigation */}
        <Sidebar
          activeTab="" // Not used anymore, sidebar will read path
          setActiveTab={() => { }} // Not used
          onSignOut={handleSignOut}
          businessName={businessName}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
        />

        {/* Main Routed Area */}
        <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isSidebarCollapsed ? "lg:pl-20" : "lg:pl-64"}`}>
          <Header
            userEmail={userEmail}
            userFullName={userFullName}
            businessName={businessName}
            orgsList={orgs}
            currentOrg={currentOrg}
            onChangeOrg={handleOrgChange}
          />

          <main className="flex-1 px-3 py-6 md:p-8 max-w-7xl mx-auto w-full">
            {children}
          </main>
        </div>
      </div>

      {/* Custom Promise-Based Dashboard Dialog Overlay */}
      {dialog && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-card border border-border rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-xl bubble-pop">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-muted/40 rounded-xl shrink-0 mt-0.5">
                {renderDialogIcon()}
              </div>
              <div className="space-y-1 flex-1 min-w-0">
                <h3 className="text-sm font-bold text-foreground tracking-tight leading-normal">
                  {dialog.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {dialog.message}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2 justify-end pt-1">
              {dialog.type === "confirm" && (
                <button
                  type="button"
                  onClick={() => dialog.resolve(false)}
                  className="px-3.5 py-1.5 border border-border text-foreground font-bold hover:bg-muted/40 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  {dialog.cancelText}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  if (dialog.type === "confirm") {
                    dialog.resolve(true);
                  } else {
                    dialog.resolve();
                  }
                }}
                className={`px-4 py-1.5 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer ${
                  dialog.type === "confirm" && dialog.variant === "destructive"
                    ? "bg-red-500 hover:bg-red-600 active:scale-[0.98]"
                    : "bg-[#6366F1] hover:bg-[#4F46E5] active:scale-[0.98]"
                }`}
              >
                {dialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </WorkspaceContext.Provider>
  );
}
