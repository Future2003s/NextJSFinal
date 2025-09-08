"use client";
import React from "react";
import { Review } from "@/apiRequests/reviews";
import RatingStars from "@/components/ui/rating";
import { Button } from "@/components/ui/button";
import { CheckCircle, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ReviewItem({
  review,
  onHelpful,
  className,
}: {
  review: Review;
  onHelpful?: (id: string) => void;
  className?: string;
}) {
  const date = new Date(review.createdAt);
  return (
    <div className={cn("py-6 border-b last:border-b-0", className)}>
      <div className="flex items-start gap-4">
        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium flex-shrink-0">
          {review.userAvatar ? (
            <img
              src={review.userAvatar}
              alt={review.userName}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            review.userName?.slice(0, 1) || "U"
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium text-gray-900">
                {review.userName || "Người dùng"}
              </span>
              <div className="text-xs text-gray-500">
                {date.toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </div>
            </div>
            <RatingStars value={review.rating} showValue={false} />
          </div>
          {review.isVerified && (
            <div className="mt-1">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-1 rounded-full">
                <CheckCircle className="h-3.5 w-3.5" /> Đã mua hàng
              </span>
            </div>
          )}
          {review.title && (
            <h4 className="mt-3 font-semibold text-gray-800">{review.title}</h4>
          )}
          <p className="mt-1 text-sm text-gray-700 whitespace-pre-line">
            {review.comment}
          </p>
          {review.images && review.images.length > 0 && (
            <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {review.images.map((img, index) => (
                <div
                  key={index}
                  className="aspect-square rounded-md overflow-hidden border"
                >
                  <img
                    src={img.url}
                    alt={img.alt || `Review image ${index + 1}`}
                    className="w-full h-full object-contain bg-white p-0.5"
                  />
                </div>
              ))}
            </div>
          )}
          <div className="mt-3 flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onHelpful?.(review._id)}
              aria-label="Đánh dấu hữu ích"
              className="text-xs"
            >
              <ThumbsUp className="h-3.5 w-3.5 mr-1.5" /> Hữu ích (
              {review.helpfulCount || 0})
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
