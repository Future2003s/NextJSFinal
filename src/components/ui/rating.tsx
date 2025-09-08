"use client";
import React from "react";
import { cn } from "@/lib/utils";

type RatingStarsProps = {
  value: number; // average rating 0..5
  count?: number; // number of reviews
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  className?: string;
  ariaLabel?: string;
};

const sizes = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

export function RatingStars({
  value,
  count,
  size = "md",
  showValue = true,
  className,
  ariaLabel,
}: RatingStarsProps) {
  const safeValue = typeof value === "number" ? value : 0;

  const stars = Array.from({ length: 5 }).map((_, i) => {
    const fill = Math.min(Math.max(safeValue - i, 0), 1);
    return (
      <svg
        key={i}
        className={cn(sizes[size], "flex-shrink-0")}
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`starGrad-${i}`} x1="0" x2="100%">
            <stop offset={`${fill * 100}%`} stopColor="#f59e0b" />
            <stop offset={`${fill * 100}%`} stopColor="#e5e7eb" />
          </linearGradient>
        </defs>
        <path
          d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
          fill={`url(#starGrad-${i})`}
        />
      </svg>
    );
  });

  return (
    <div
      className={cn("inline-flex items-center gap-2", className)}
      aria-label={ariaLabel || `Xếp hạng trung bình ${value.toFixed(1)} trên 5`}
      role="img"
    >
      <div className="flex items-center gap-1" aria-hidden>
        {stars}
      </div>
      {showValue && (
        <span className="text-sm text-gray-600">
          {value.toFixed(1)} {typeof count === "number" ? `(${count})` : ""}
        </span>
      )}
    </div>
  );
}

export default RatingStars;
