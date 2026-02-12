"use client";

import { type ReactNode } from "react";

interface ChartTooltipProps {
  x: number;
  y: number;
  children: ReactNode;
}

export function ChartTooltip({ x, y, children }: ChartTooltipProps) {
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: "translate(-50%, calc(-100% - 8px))",
        pointerEvents: "none",
        zIndex: 10,
      }}
      className="bg-white border border-gray-200 rounded-lg shadow-md p-3 text-sm whitespace-nowrap"
    >
      {children}
    </div>
  );
}
