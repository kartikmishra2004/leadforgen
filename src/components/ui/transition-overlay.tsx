"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface TransitionOverlayProps {
  isVisible: boolean;
}

export function TransitionOverlay({ isVisible }: TransitionOverlayProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isVisible) return null;

  const cardElement = document.querySelector(".premium-panel");
  if (!cardElement) {
    // Fallback if card element is not found in the DOM
    return (
      <div className="absolute inset-0 bg-card z-50 rounded-2xl flex items-center justify-center p-8 transition-all duration-300 animate-fade-in select-none">
        <div className="relative flex items-center justify-center">
          <img
            src="/logo.png"
            alt="Loading"
            className="h-10 w-10 object-contain relative z-10 animate-pulse"
          />
        </div>
      </div>
    );
  }

  return createPortal(
    <>
      <style>{`
        .auth-logo {
          opacity: 0 !important;
          pointer-events: none !important;
          transition: opacity 0.3s ease !important;
        }
      `}</style>
      <div className="absolute inset-0 bg-card z-50 rounded-2xl flex items-center justify-center p-8 transition-all duration-300 animate-fade-in select-none">
        <div className="relative flex items-center justify-center">
          <img
            src="/logo.png"
            alt="Loading"
            className="h-10 w-10 object-contain relative z-10 animate-pulse"
          />
        </div>
      </div>
    </>,
    cardElement
  );
}
