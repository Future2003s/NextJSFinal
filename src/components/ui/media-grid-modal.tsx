"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { X, PlayCircle } from "lucide-react";

type MediaItem = {
  type: "image" | "video";
  url: string;
  alt?: string;
};

type MediaGridModalProps = {
  open: boolean;
  onClose: () => void;
  media: MediaItem[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  productName?: string;
};

export default function MediaGridModal({
  open,
  onClose,
  media,
  selectedIndex,
  onSelect,
  productName,
}: MediaGridModalProps) {
  if (!open) return null;

  const handleSelect = (index: number) => {
    onSelect(index);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative z-10 w-full max-w-4xl h-[90vh] bg-white rounded-lg shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-semibold truncate">
            {productName ? `Tất cả media cho ${productName}` : "Tất cả Media"}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {media.map((item, i) => (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                className={cn(
                  "relative aspect-square rounded-md overflow-hidden border-2 transition-all",
                  i === selectedIndex
                    ? "border-blue-500 ring-2 ring-blue-200"
                    : "border-transparent hover:border-gray-300"
                )}
                aria-label={`Xem media ${i + 1}`}
              >
                <img
                  src={
                    item.type === "video"
                      ? `https://img.youtube.com/vi/${item.url
                          .split("/")
                          .pop()}/0.jpg`
                      : item.url
                  }
                  alt={item.alt || `Media thumbnail ${i + 1}`}
                  className="w-full h-full object-contain bg-white p-1"
                />
                {item.type === "video" && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <PlayCircle className="h-8 w-8 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
