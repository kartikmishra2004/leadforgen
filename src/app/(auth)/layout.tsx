import React from "react";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background Grids & Glows */}
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      
      {/* Back Button */}
      <div className="absolute top-6 left-6 z-10">
        <Link href="/" className="inline-flex items-center gap-2 group text-muted-foreground hover:text-foreground text-sm font-medium transition-colors duration-200">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to home</span>
        </Link>
      </div>

      {/* Main Centered Card Container */}
      <div className="w-full max-w-[440px] relative z-10 space-y-6">
        <div className="premium-panel bg-card/50 backdrop-blur-xl p-8 sm:p-10 rounded-2xl shadow-soft">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Link href="/" className="inline-flex items-center gap-2">
              <img 
                src="/assets/logo.png" 
                alt="Lead For Gen" 
                width={48} 
                height={48} 
                className="h-12 w-12 object-contain" 
              />
            </Link>
          </div>
          
          {children}
        </div>

        {/* Footer badges */}
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Shield className="h-3.5 w-3.5 text-primary" />
            <span>Secure SSL encryption</span>
          </div>
          <span>&bull;</span>
          <span>14-day free trial</span>
        </div>
      </div>
    </div>
  );
}
