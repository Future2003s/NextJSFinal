"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { X, ZoomIn, ZoomOut, ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";

type ImageZoomModalProps = {
  open: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
  productName?: string;
};

export default function ImageZoomModal({ open, onClose, images, initialIndex = 0, productName }: ImageZoomModalProps) {
  const [index, setIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const start = useRef({ x: 0, y: 0 });
  const last = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!open) return;
    setIndex(initialIndex);
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, [open, initialIndex]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "+" || e.key === "=") zoomIn();
      if (e.key === "-" || e.key === "_") zoomOut();
      if (e.key.toLowerCase() === "r") reset();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const prev = () => {
    setIndex((i) => (i - 1 + images.length) % images.length);
    reset();
  };
  const next = () => {
    setIndex((i) => (i + 1) % images.length);
    reset();
  };
  const zoomIn = () => setScale((s) => Math.min(4, s + 0.25));
  const zoomOut = () => setScale((s) => Math.max(1, s - 0.25));
  const reset = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (scale === 1) return;
    dragging.current = true;
    start.current = { x: e.clientX, y: e.clientY };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    setOffset({ x: last.current.x + dx, y: last.current.y + dy });
  };
  const onPointerUp = (e: React.PointerEvent) => {
    dragging.current = false;
    last.current = { ...offset };
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="absolute inset-0 flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 text-white">
          <div className="text-sm truncate max-w-[60%]" aria-live="polite">
            {productName || "Hình ảnh sản phẩm"}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="icon" className="h-8 w-8" onClick={zoomOut} aria-label="Thu nhỏ">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="icon" className="h-8 w-8" onClick={zoomIn} aria-label="Phóng to">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="icon" className="h-8 w-8" onClick={reset} aria-label="Đặt lại">
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="icon" className="h-8 w-8" onClick={onClose} aria-label="Đóng">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="relative flex-1 select-none">
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full p-2"
            aria-label="Ảnh trước"
          >
            <ArrowLeft />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full p-2"
            aria-label="Ảnh sau"
          >
            <ArrowRight />
          </button>

          <div className="w-full h-full flex items-center justify-center overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[index]}
              alt={productName || "Product image"}
              className={cn("max-w-none", scale === 1 ? "max-h-full max-w-full" : "")}
              style={{ transform: `scale(${scale}) translate(${offset.x / scale}px, ${offset.y / scale}px)` }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            />
          </div>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-2 py-1 rounded">
            {index + 1} / {images.length}
          </div>
        </div>
      </div>
    </div>
  );
}

