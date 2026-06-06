"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supbase/client";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { Loader2 } from "lucide-react";

// Define the shape of our shared Workspace Context
interface WorkspaceContextType {
  user: any;
  orgs: any[];
  currentOrg: any;
  setCurrentOrg: (org: any) => void;
  rlsErrors: string[];
  setRlsErrors: React.Dispatch<React.SetStateAction<string[]>>;
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
      setRlsErrors
    }}>
      <div className="min-h-screen bg-background text-foreground flex">
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

          <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
            {children}
          </main>
        </div>
      </div>
    </WorkspaceContext.Provider>
  );
}
