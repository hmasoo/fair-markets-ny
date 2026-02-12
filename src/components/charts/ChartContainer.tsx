"use client";

import { useRef, useState, useEffect, type ReactNode } from "react";

interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ChartDimensions {
  svgWidth: number;
  svgHeight: number;
  width: number;
  height: number;
  margin: Margin;
}

interface ChartContainerProps {
  height: number;
  margin?: Partial<Margin>;
  children: (dims: ChartDimensions) => ReactNode;
  className?: string;
}

const DEFAULT_MARGIN: Margin = { top: 10, right: 20, bottom: 30, left: 50 };

export function ChartContainer({
  height: totalHeight,
  margin: marginProp,
  children,
  className,
}: ChartContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const margin = { ...DEFAULT_MARGIN, ...marginProp };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    setContainerWidth(el.clientWidth);
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const innerWidth = Math.max(0, containerWidth - margin.left - margin.right);
  const innerHeight = Math.max(0, totalHeight - margin.top - margin.bottom);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: "relative", width: "100%" }}
    >
      {containerWidth > 0 &&
        children({
          svgWidth: containerWidth,
          svgHeight: totalHeight,
          width: innerWidth,
          height: innerHeight,
          margin,
        })}
    </div>
  );
}
