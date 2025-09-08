"use client";
import { useEffect, useMemo, useState, useRef } from "react";
import { productApiRequest, type Product } from "@/apiRequests/products";
import { useParams, useRouter } from "next/navigation";
import BuyNowModal from "@/components/ui/buy-now-modal";
import { useAppContextProvider } from "@/context/app-context";
import { useCart } from "@/context/cart-context";
import { useCartSidebar } from "@/context/cart-sidebar-context";
import { Loader } from "@/components/ui/loader";
import ImageMagnifier from "@/components/ui/image-magnifier";
import MediaGridModal from "@/components/ui/media-grid-modal";
import {
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  PlayCircle,
  ChevronLeft,
  ChevronRight,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import RatingStars from "@/components/ui/rating";
import ImageZoomModal from "@/components/ui/image-zoom-modal";
import ReviewStats from "@/components/product/ReviewStats";
import ReviewItem from "@/components/product/ReviewItem";
import type { Review } from "@/apiRequests/reviews";
import { reviewsApiRequest } from "@/apiRequests/reviews";
import Link from "next/link";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    amount
  );

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id as string;
  const { sessionToken } = useAppContextProvider();
  const { addItem } = useCart();
  const { openSidebar } = useCartSidebar();
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);
  const [item, setItem] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [buyOpen, setBuyOpen] = useState(false);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [isGridModalOpen, setGridModalOpen] = useState(false);
  const [isDescriptionExpanded, setDescriptionExpanded] = useState(false);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [isOrderModalOpen, setOrderModalOpen] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<any>(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [ratingFilter, setRatingFilter] = useState<number | "all">("all");
  const [sortKey, setSortKey] = useState<"date" | "helpful" | "rating">("date");

  // Review form state
  const [formRating, setFormRating] = useState(5);
  const [formTitle, setFormTitle] = useState("");
  const [formComment, setFormComment] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // Route via Next public API to avoid CORS and handle env mapping/normalization
        const res = await fetch(`/api/products/public/${id}`, {
          cache: "no-store",
        });
        if (!res.ok) {
          const t = await res.text();
          throw new Error(t || `HTTP ${res.status}`);
        }
        const data = await res.json();
        if (data?.data) {
          setItem(data.data as Product);
        } else {
          setError("Không thể tải thông tin sản phẩm");
        }
      } catch (err: any) {
        console.error("Error loading product:", err);
        setError(err?.message || "Có lỗi xảy ra khi tải sản phẩm");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const allMedia = useMemo(() => {
    if (!item?.images || item.images.length === 0) {
      return [
        {
          type: "image" as const,
          url: "https://placehold.co/800x600",
          alt: "Placeholder",
        },
      ];
    }
    return item.images.sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [item]);

  const selectedMedia = useMemo(() => {
    return allMedia[selectedMediaIndex];
  }, [allMedia, selectedMediaIndex]);

  // Helper to get a representative image URL for cart, etc.
  const getCoverImageUrl = () => {
    const firstImage = allMedia.find((m) => m.type === "image");
    return (
      firstImage?.url || allMedia[0]?.url || "https://placehold.co/800x600"
    );
  };

  const price = useMemo(() => {
    if (!item) return 0;
    return Number(item.price);
  }, [item]);

  // Derived values
  const discountPercent = useMemo(() => {
    if (!item?.compareAtPrice || !item?.price) return 0;
    if (item.compareAtPrice <= item.price) return 0;
    return Math.round(
      ((Number(item.compareAtPrice) - Number(item.price)) /
        Number(item.compareAtPrice)) *
        100
    );
  }, [item]);

  // Share handler
  const handleShare = async () => {
    try {
      const shareData = {
        title: item?.name || "Sản phẩm",
        text: item?.description?.slice(0, 120) || "",
        url: typeof window !== "undefined" ? window.location.href : "",
      };
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareData.url);
        toast.success("Đã sao chép liên kết sản phẩm");
      }
    } catch (_) {}
  };
  const allImageUrls = useMemo(() => {
    return allMedia.filter((m) => m.type === "image").map((m) => m.url);
  }, [allMedia]);

  const zoomInitialIndex = useMemo(() => {
    if (selectedMedia.type !== "image") return 0;
    const index = allImageUrls.findIndex((url) => url === selectedMedia.url);
    return Math.max(0, index); // Ensure it's not -1
  }, [selectedMedia, allImageUrls]);

  // Load reviews and stats
  useEffect(() => {
    const loadReviews = async () => {
      if (!id) return;
      setReviewsLoading(true);
      setReviewsError(null);
      try {
        const [list, stats] = await Promise.all([
          reviewsApiRequest.getProductReviews(id, 1, 50),
          reviewsApiRequest.getProductReviewStats(id),
        ]);
        setReviews(list?.data || []);
        setReviewStats(stats?.data || null);
      } catch (e: any) {
        setReviewsError(e?.message || "Không thể tải đánh giá");
      } finally {
        setReviewsLoading(false);
      }
    };
    loadReviews();
  }, [id]);

  // Related products
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  useEffect(() => {
    const loadRelated = async () => {
      if (!item) return;
      try {
        setRelatedLoading(true);
        const params = new URLSearchParams();
        const catId =
          typeof item.category === "object"
            ? item.category._id
            : (item.category as any);
        if (catId) params.set("categoryId", String(catId));
        params.set("size", "8");
        const res = await fetch(`/api/products/public?${params.toString()}`, {
          cache: "no-store",
        });
        const data = await res.json();
        const list = (data?.data || []).filter(
          (p: any) => (p._id || p.id) !== (item as any)._id
        );
        setRelatedProducts(list);
      } catch (e) {
        // ignore
      } finally {
        setRelatedLoading(false);
      }
    };
    loadRelated();
  }, [item]);

  // Reviews derived list
  const shownReviews = useMemo(() => {
    let list = [...reviews];
    if (ratingFilter !== "all") {
      list = list.filter((r) => r.rating === ratingFilter);
    }
    list.sort((a, b) => {
      if (sortKey === "date")
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      if (sortKey === "helpful")
        return (b.helpfulCount || 0) - (a.helpfulCount || 0);
      if (sortKey === "rating") return b.rating - a.rating;
      return 0;
    });
    return list;
  }, [reviews, ratingFilter, sortKey]);

  const REVIEWS_PER_PAGE = 10;

  const paginatedReviews = useMemo(() => {
    return shownReviews.slice(
      (reviewsPage - 1) * REVIEWS_PER_PAGE,
      reviewsPage * REVIEWS_PER_PAGE
    );
  }, [shownReviews, reviewsPage]);

  const totalReviewPages = useMemo(() => {
    return Math.ceil(shownReviews.length / REVIEWS_PER_PAGE);
  }, [shownReviews]);

  const submitReview = async () => {
    if (!sessionToken) {
      setLoginPromptOpen(true);
      return;
    }
    if (!id || !formComment.trim()) return;
    setFormSubmitting(true);
    try {
      await reviewsApiRequest.createReview(sessionToken, {
        productId: id,
        rating: formRating,
        title: formTitle.trim() || undefined,
        comment: formComment.trim(),
      });
      toast.success("Đã gửi đánh giá của bạn");
      setFormTitle("");
      setFormComment("");
      setFormRating(5);
      // Reload reviews and stats after submission
      const [list, stats] = await Promise.all([
        reviewsApiRequest.getProductReviews(id, 1, 50),
        reviewsApiRequest.getProductReviewStats(id),
      ]);
      setReviews(list?.data || []);
      setReviewStats(stats?.data || null);
    } catch (e: any) {
      toast.error(e?.message || "Gửi đánh giá thất bại");
    } finally {
      setFormSubmitting(false);
    }
  };

  const markHelpful = async (rid: string) => {
    if (!sessionToken) {
      setLoginPromptOpen(true);
      return;
    }
    try {
      await reviewsApiRequest.markHelpful(sessionToken, rid);
      setReviews((prev) =>
        prev.map((r) =>
          r._id === rid ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1 } : r
        )
      );
    } catch (e: any) {
      toast.error(e?.message || "Không thể ghi nhận hữu ích");
    }
  };

  // Helper function to get all image URLs
  const getAllImageUrls = () => {
    if (!item?.images || item.images.length === 0) {
      return [];
    }

    return item.images
      .map((img) => {
        if (typeof img === "string") {
          return img; // Fallback for old format
        }
        return (img as any)?.url || "";
      })
      .filter((url) => url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-25 flex items-center justify-center">
        <Loader
          isLoading={true}
          message="Đang tải thông tin sản phẩm..."
          size="lg"
          overlay={false}
        />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-25 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="text-xl font-semibold">Không tải được sản phẩm</div>
          <div className="text-sm text-gray-600">
            Vui lòng thử lại sau hoặc quay lại danh sách sản phẩm.
          </div>
          <Button onClick={() => router.back()} variant="outline">
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-25">
      <div className="container mx-auto px-4 py-8">
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link
                href="/"
                className="flex items-center gap-1 text-gray-500 hover:text-primary transition-colors"
              >
                <Home className="h-4 w-4" />
                <span>Trang chủ</span>
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRight className="h-4 w-4 text-gray-400" />
                <Link
                  href="/products"
                  className="ml-2 text-gray-500 hover:text-primary transition-colors"
                >
                  Sản phẩm
                </Link>
              </div>
            </li>
            {typeof item.category === "object" && (
              <li>
                <div className="flex items-center">
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                  <Link
                    href={`/category/${item.category.slug}`}
                    className="ml-2 text-gray-500 hover:text-primary transition-colors"
                  >
                    {item.category.name}
                  </Link>
                </div>
              </li>
            )}
            <li className="truncate max-w-xs">
              <div className="flex items-center">
                <ChevronRight className="h-4 w-4 text-gray-400" />
                <span
                  className="ml-2 font-medium text-gray-800"
                  aria-current="page"
                >
                  {item.name}
                </span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Media Gallery */}
          <div className="space-y-4 lg:sticky lg:top-24">
            {/* Main Media Display */}
            <div className="relative aspect-[4/3] bg-white border border-gray-200 rounded-lg overflow-hidden">
              {selectedMedia.type === "video" ? (
                <iframe
                  src={selectedMedia.url}
                  title={selectedMedia.alt || item.name}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              ) : (
                <>
                  <div className="hidden lg:block">
                    <ImageMagnifier
                      src={selectedMedia.url}
                      alt={selectedMedia.alt || item.name}
                      className="w-full h-full object-contain p-4"
                    />
                  </div>
                  <div className="lg:hidden" onClick={() => setZoomOpen(true)}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedMedia.url}
                      alt={selectedMedia.alt || item.name}
                      className="w-full h-full object-contain p-4 cursor-zoom-in"
                    />
                  </div>
                </>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-sm"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
              </Button>
              <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
                {selectedMediaIndex + 1} / {allMedia.length}
              </div>
            </div>

            {/* Thumbnails */}
            {(() => {
              const VISIBLE_THUMBNAILS = 6;
              const remainingMediaCount = allMedia.length - VISIBLE_THUMBNAILS;
              const visibleMedia =
                allMedia.length > VISIBLE_THUMBNAILS
                  ? allMedia.slice(0, VISIBLE_THUMBNAILS - 1)
                  : allMedia;

              return (
                allMedia.length > 1 && (
                  <div className="relative">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 flex-shrink-0"
                        onClick={() => {
                          thumbnailContainerRef.current?.scrollBy({
                            left: -100,
                            behavior: "smooth",
                          });
                        }}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <div
                        ref={thumbnailContainerRef}
                        className="flex gap-2 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 scrollbar-hide"
                      >
                        {visibleMedia.map((media, i) => (
                          <button
                            key={i}
                            onClick={() => setSelectedMediaIndex(i)}
                            className={`relative rounded-md overflow-hidden border transition-all flex-shrink-0 snap-start ${
                              i === selectedMediaIndex
                                ? "border-blue-500 ring-2 ring-blue-100"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                            aria-label={`Xem media ${i + 1}`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={
                                media.type === "video"
                                  ? `https://img.youtube.com/vi/${media.url
                                      .split("/")
                                      .pop()}/0.jpg`
                                  : media.url
                              }
                              alt={media.alt || `Media thumbnail ${i + 1}`}
                              className="w-20 h-20 object-contain bg-white"
                            />
                            {media.type === "video" && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <PlayCircle className="h-8 w-8 text-white" />
                              </div>
                            )}
                          </button>
                        ))}
                        {allMedia.length > VISIBLE_THUMBNAILS && (
                          <button
                            onClick={() => setGridModalOpen(true)}
                            className="relative rounded-md overflow-hidden border transition-all flex-shrink-0 snap-start w-20 h-20 bg-gray-100 flex flex-col items-center justify-center text-gray-600 hover:bg-gray-200"
                            aria-label="Xem tất cả media"
                          >
                            <span className="text-xl font-bold">
                              +{remainingMediaCount}
                            </span>
                            <span className="text-xs">Xem tất cả</span>
                          </button>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 flex-shrink-0"
                        onClick={() => {
                          thumbnailContainerRef.current?.scrollBy({
                            left: 100,
                            behavior: "smooth",
                          });
                        }}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              );
            })()}
          </div>
          {/* Product Info */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 space-y-6">
              {/* Header */}
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-4">
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight mb-2">
                      {item.name}
                    </h1>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      {item.brand && (
                        <span className="flex items-center gap-1">
                          <span className="font-medium">Thương hiệu:</span>
                          {typeof item.brand === "object"
                            ? item.brand.name
                            : item.brand}
                        </span>
                      )}
                      {item.category && (
                        <span className="flex items-center gap-1">
                          <span className="font-medium">Danh mục:</span>
                          {typeof item.category === "object"
                            ? item.category.name
                            : item.category}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-10 w-10 p-0 hover:bg-gray-100"
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-10 w-10 p-0 hover:bg-gray-100"
                      onClick={handleShare}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                  <RatingStars
                    value={item.rating || 0}
                    count={item.numReviews || 0}
                  />
                  {typeof item.quantity === "number" && (
                    <Badge
                      variant={item.quantity > 0 ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {item.quantity > 0
                        ? `Còn ${item.quantity} sản phẩm`
                        : "Hết hàng"}
                    </Badge>
                  )}
                </div>
              </div>

              <Separator />

              {/* Price Section */}
              <div className="space-y-3">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <div className="text-2xl lg:text-3xl font-bold text-blue-600">
                    {formatCurrency(price)}
                  </div>
                  {item.compareAtPrice && item.compareAtPrice > price && (
                    <div className="text-lg text-gray-500 line-through">
                      {formatCurrency(item.compareAtPrice)}
                    </div>
                  )}
                  {discountPercent > 0 && (
                    <Badge variant="destructive" className="text-sm">
                      -{discountPercent}%
                    </Badge>
                  )}
                </div>

                {item.variants?.find(
                  (v) => v._id === selectedVariant || v.id === selectedVariant
                ) && (
                  <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                    <span className="font-medium">Biến thể đã chọn:</span>{" "}
                    {
                      item.variants.find(
                        (v) =>
                          v._id === selectedVariant || v.id === selectedVariant
                      )?.name
                    }
                  </div>
                )}
              </div>

              {/* Variants */}
              {(item.variants?.length ?? 0) > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-700">
                      Chọn biến thể
                    </div>
                    <span className="text-xs text-gray-500">
                      {item.variants?.length ?? 0} lựa chọn
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {(item.variants ?? []).map((variant: any) => (
                      <Button
                        key={variant._id || variant.id}
                        variant={
                          selectedVariant === (variant._id || variant.id)
                            ? "default"
                            : "outline"
                        }
                        onClick={() =>
                          setSelectedVariant(variant._id || variant.id)
                        }
                        className="h-12 justify-start px-3"
                      >
                        <div className="text-left">
                          <div className="font-medium">{variant.name}</div>
                          <div className="text-xs text-gray-500">
                            {variant.options?.join(", ") || ""}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {item.tags?.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-700">
                      Thông tin sản phẩm
                    </div>
                    <span className="text-xs text-gray-500">
                      {item.tags.length} tags
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Quantity Selector */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-700">
                    Số lượng
                  </div>
                  <div className="text-xs text-gray-500">
                    Còn {item.quantity ?? 999} sản phẩm
                  </div>
                </div>
                <div className="flex items-center rounded-lg border border-gray-200 p-1 w-fit">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="h-8 w-8 p-0 text-lg text-gray-600 hover:bg-gray-100"
                    disabled={qty <= 1}
                  >
                    -
                  </Button>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={qty}
                    onChange={(e) => {
                      const value = e.target.value;
                      const numericValue = value.replace(/[^0-9]/g, "");
                      if (numericValue === "") {
                        setQty(1);
                      } else {
                        setQty(Math.max(1, parseInt(numericValue, 10)));
                      }
                    }}
                    className="w-12 text-center text-lg font-medium bg-transparent border-0 focus:ring-0"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQty((q) => q + 1)}
                    className="h-8 w-8 p-0 text-lg text-gray-600 hover:bg-gray-100"
                  >
                    +
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-6">
                <div className="flex gap-3">
                  <Button
                    size="lg"
                    variant="outline"
                    className="flex-1 h-14 text-base font-medium"
                    onClick={() => {
                      const variant =
                        item.variants?.find(
                          (x) =>
                            x._id === selectedVariant ||
                            x.id === selectedVariant
                        ) || null;
                      addItem({
                        id: (item as any)._id || (item as any).id,
                        productId: (item as any)._id || (item as any).id,
                        variantId: variant?._id || variant?.id || null,
                        variantName: variant?.name || null,
                        name: variant
                          ? `${item.name} - ${variant.name}`
                          : item.name,
                        price: Number(item.price) || 0,
                        quantity: qty,
                        imageUrl: getCoverImageUrl(),
                      });
                      toast.success("Đã thêm vào giỏ hàng!");
                    }}
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Thêm vào giỏ
                  </Button>
                  <Button
                    size="lg"
                    className="flex-1 h-14 text-base font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={() => {
                      if (!sessionToken) {
                        setLoginPromptOpen(true);
                        return;
                      }
                      setBuyOpen(true);
                    }}
                  >
                    Đặt hàng ngay
                  </Button>
                </div>

                {/* Features */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center space-y-2">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                        <Truck className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="text-xs text-gray-700 font-medium">
                        Miễn phí vận chuyển
                      </div>
                    </div>
                    <div className="text-center space-y-2">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <Shield className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="text-xs text-gray-700 font-medium">
                        Bảo hành chính hãng
                      </div>
                    </div>
                    <div className="text-center space-y-2">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                        <RotateCcw className="h-5 w-5 text-orange-600" />
                      </div>
                      <div className="text-xs text-gray-700 font-medium">
                        Đổi trả 30 ngày
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Product Details & Reviews Tabs */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="description">
          <TabsList className="border-b">
            <TabsTrigger value="description">Mô tả sản phẩm</TabsTrigger>
            <TabsTrigger value="reviews">
              Đánh giá & Nhận xét ({reviews.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="py-6">
            <div className="relative">
              <div
                className={cn(
                  "prose prose-sm sm:prose lg:prose-lg max-w-none transition-all duration-300",
                  !isDescriptionExpanded && "max-h-60 overflow-hidden relative"
                )}
                dangerouslySetInnerHTML={{ __html: item.description }}
              />
              {!isDescriptionExpanded && (
                <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none"></div>
              )}
            </div>
            <Button
              variant="link"
              onClick={() => setDescriptionExpanded(!isDescriptionExpanded)}
              className="mt-4 px-0"
            >
              {isDescriptionExpanded ? "Thu gọn" : "Xem thêm"}
            </Button>
          </TabsContent>
          <TabsContent value="reviews" className="py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left Column: Stats and Form */}
              <div className="md:col-span-1 space-y-8">
                {reviewStats && <ReviewStats stats={reviewStats} />}
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold">
                      Viết đánh giá của bạn
                    </h3>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Điểm đánh giá
                      </label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((r) => (
                          <button key={r} onClick={() => setFormRating(r)}>
                            <svg
                              className={`h-7 w-7 ${
                                r <= formRating
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }`}
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="review-title"
                        className="text-sm font-medium"
                      >
                        Tiêu đề
                      </label>
                      <input
                        id="review-title"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        className="w-full p-2 border rounded"
                        placeholder="Ví dụ: Một sản phẩm tuyệt vời!"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label
                          htmlFor="review-comment"
                          className="text-sm font-medium"
                        >
                          Bình luận của bạn
                        </label>
                        <span className="text-xs text-gray-500">
                          {formComment.length} / 1000
                        </span>
                      </div>
                      <textarea
                        id="review-comment"
                        value={formComment}
                        onChange={(e) => setFormComment(e.target.value)}
                        rows={4}
                        maxLength={1000}
                        className="w-full p-2 border rounded"
                        placeholder="Hãy chia sẻ những điều bạn thích hoặc không thích về sản phẩm này..."
                        required
                      />
                    </div>
                    <Button
                      onClick={submitReview}
                      disabled={formSubmitting || !formComment.trim()}
                    >
                      {formSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Filters and List */}
              <div className="md:col-span-2">
                <div className="flex flex-col md:flex-row justify-between items-baseline gap-4 mb-4">
                  <h3 className="text-xl font-semibold">
                    Tất cả đánh giá ({shownReviews.length})
                  </h3>
                  <div className="flex gap-4">
                    <Select
                      value={String(ratingFilter)}
                      onValueChange={(v) =>
                        setRatingFilter(v === "all" ? "all" : Number(v))
                      }
                    >
                      <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Lọc theo sao" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        {[5, 4, 3, 2, 1].map((r) => (
                          <SelectItem key={r} value={String(r)}>
                            {r} sao
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={sortKey}
                      onValueChange={(v: any) => setSortKey(v)}
                    >
                      <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Sắp xếp" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date">Mới nhất</SelectItem>
                        <SelectItem value="helpful">Hữu ích nhất</SelectItem>
                        <SelectItem value="rating">Đánh giá cao</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {reviewsLoading && (
                  <Loader isLoading message="Đang tải đánh giá..." />
                )}
                {reviewsError && (
                  <div className="text-red-500">{reviewsError}</div>
                )}
                {!reviewsLoading && !reviewsError && (
                  <div className="divide-y">
                    {paginatedReviews.length > 0 ? (
                      paginatedReviews.map((review) => (
                        <ReviewItem
                          key={review._id}
                          review={review}
                          onHelpful={markHelpful}
                        />
                      ))
                    ) : (
                      <div className="text-center py-16 text-gray-600">
                        Chưa có đánh giá nào phù hợp.
                      </div>
                    )}
                  </div>
                )}
                {totalReviewPages > 1 && (
                  <Pagination className="mt-8">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setReviewsPage((p) => Math.max(1, p - 1));
                          }}
                          disabled={reviewsPage === 1}
                        />
                      </PaginationItem>
                      {[...Array(totalReviewPages)].map((_, i) => (
                        <PaginationItem key={i}>
                          <PaginationLink
                            href="#"
                            isActive={reviewsPage === i + 1}
                            onClick={(e) => {
                              e.preventDefault();
                              setReviewsPage(i + 1);
                            }}
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setReviewsPage((p) =>
                              Math.min(totalReviewPages, p + 1)
                            );
                          }}
                          disabled={reviewsPage === totalReviewPages}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Related Products Section */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-4">Sản phẩm liên quan</h2>
        {relatedLoading && <Loader isLoading />}
        {relatedProducts.length > 0 && (
          <Carousel opts={{ align: "start", loop: true }}>
            <CarouselContent className="-ml-4">
              {relatedProducts.map((p) => (
                <CarouselItem
                  key={p._id}
                  className="md:basis-1/3 lg:basis-1/4 pl-4"
                >
                  <Link href={`/products/${p._id}`}>
                    <Card className="h-full hover:shadow-lg transition-shadow">
                      <CardContent className="p-4 flex flex-col items-center text-center">
                        <div className="aspect-square w-full mb-2">
                          <img
                            src={
                              p.images?.[0]?.url ||
                              "https://placehold.co/300x300"
                            }
                            alt={p.name}
                            className="w-full h-full object-contain bg-white p-1"
                          />
                        </div>
                        <h4 className="font-medium text-sm truncate w-full">
                          {p.name}
                        </h4>
                        <div className="text-blue-600 font-semibold">
                          {formatCurrency(p.price)}
                        </div>
                        <RatingStars
                          value={p.rating || 0}
                          size="sm"
                          showValue={false}
                        />
                      </CardContent>
                    </Card>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        )}
      </div>

      <BuyNowModal
        open={buyOpen}
        onClose={() => setBuyOpen(false)}
        items={[{ name: item.name, price, quantity: qty }]}
      />

      <ImageZoomModal
        open={zoomOpen}
        onClose={() => setZoomOpen(false)}
        images={allImageUrls}
        initialIndex={zoomInitialIndex}
        productName={item.name}
      />

      <MediaGridModal
        open={isGridModalOpen}
        onClose={() => setGridModalOpen(false)}
        media={allMedia}
        selectedIndex={selectedMediaIndex}
        onSelect={(index) => setSelectedMediaIndex(index)}
        productName={item.name}
      />

      {loginPromptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setLoginPromptOpen(false)}
          />
          <Card className="relative w-full max-w-md border-0 shadow-2xl">
            <CardContent className="p-0">
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Yêu cầu đăng nhập
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLoginPromptOpen(false)}
                  className="h-8 w-8 p-0"
                >
                  ✕
                </Button>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-gray-700">
                  Để tiếp tục mua hàng, vui lòng đăng nhập tài khoản của bạn.
                </p>
              </div>
              <div className="px-6 py-4 border-t flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setLoginPromptOpen(false)}
                >
                  Để sau
                </Button>
                <Button
                  onClick={() => router.push("/login")}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Đăng nhập
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
