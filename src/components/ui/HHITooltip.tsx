"use client";

import { useState } from "react";

interface HHITooltipProps {
  children: React.ReactNode;
}

export function HHITooltip({ children }: HHITooltipProps) {
  const [show, setShow] = useState(false);

  return (
    <span
      className="relative inline-flex items-center"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <span className="border-b border-dotted border-fm-sage cursor-help">
        {children}
      </span>
      {show && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 rounded-lg bg-fm-patina text-white text-xs p-3 shadow-lg z-50 pointer-events-none">
          <strong>Herfindahl-Hirschman Index</strong> — measures market
          concentration on a 0–10,000 scale. Not to be confused with Household
          Income (MHI).
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-fm-patina" />
        </span>
      )}
    </span>
  );
}
