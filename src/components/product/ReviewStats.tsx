"use client";
import React from "react";
import RatingStars from "@/components/ui/rating";
import { cn } from "@/lib/utils";

type Stats = {
  average: number;
  total: number;
  counts: { [rating: number]: number };
};

export default function ReviewStats({
  stats,
  className,
}: {
  stats: Stats;
  className?: string;
}) {
  const total = stats?.total || 0;
  const counts = stats?.counts || {};

  const percent = (n: number) => (total ? Math.round((n / total) * 100) : 0);

  return (
    <div className={cn("p-6 border rounded-lg bg-gray-50", className)}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="text-4xl font-bold">
            {(stats?.average || 0).toFixed(1)}
          </div>
          <RatingStars
            value={stats?.average || 0}
            size="lg"
            showValue={false}
          />
          <div className="text-sm text-gray-600">{total} đánh giá</div>
        </div>
        <div className="md:col-span-2 space-y-1">
          {[5, 4, 3, 2, 1].map((r) => (
            <div key={r} className="flex items-center gap-3 text-sm">
              <span className="w-12 text-gray-700">{r} sao</span>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full"
                  style={{ width: `${percent(counts[r] || 0)}%` }}
                />
              </div>
              <span className="w-10 text-gray-600 text-right">
                {counts[r] || 0}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
