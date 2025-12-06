// src/features/catalog/components/restaurant/RestaurantGallery.jsx
import { useState } from "react";
import { createPortal } from "react-dom";

export default function RestaurantGallery({ restaurant }) {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!restaurant) return null;

  /* ========== LẤY DANH SÁCH ẢNH ========== */
  const rawImages = Array.isArray(restaurant.images) ? restaurant.images : [];
  const galleryImages = rawImages
    .map((img) => img?.url || img?.imageUrl || img?.src)
    .filter(Boolean);

  const fallbackImage =
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80&auto=format&fit=crop";

  const mainImage = galleryImages[0] || fallbackImage;
  const totalImages = galleryImages.length;

  // 6 ô bên phải (từ ảnh thứ 2 trở đi)
  const SIDE_SLOTS = 6;
  const sideImages = galleryImages.slice(1, SIDE_SLOTS + 1);

  /* ========== HANDLER GALLERY FULLSCREEN ========== */
  const openGalleryAt = (idx) => {
    if (!totalImages) return;
    const safeIndex =
      idx < 0 ? 0 : idx >= totalImages ? totalImages - 1 : idx;
    setCurrentImageIndex(safeIndex);
    setIsGalleryOpen(true);
  };

  const goPrev = (e) => {
    e.stopPropagation();
    if (totalImages <= 1) return;
    setCurrentImageIndex((idx) => (idx - 1 + totalImages) % totalImages);
  };

  const goNext = (e) => {
    e.stopPropagation();
    if (totalImages <= 1) return;
    setCurrentImageIndex((idx) => (idx + 1) % totalImages);
  };

  if (!mainImage) return null;

  return (
    <>
      {/* ==== GALLERY CHÍNH (1 ảnh lớn + 6 ảnh nhỏ) ==== */}
      <section className="rounded-3xl overflow-hidden bg-gray-200">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-[4px] bg-white">
          {/* ẢNH LỚN BÊN TRÁI (≈ 2/3 width) */}
          <div className="lg:col-span-2 relative">
            <img
              src={mainImage}
              alt={restaurant.name || restaurant.slug}
              onClick={() => openGalleryAt(0)}
              className="w-full h-[260px] md:h-[360px] lg:h-[420px] object-cover cursor-pointer"
            />
          </div>

          {/* 6 ẢNH NHỎ BÊN PHẢI – CHIỀU CAO BẰNG ẢNH LỚN, CHIA 3 HÀNG */}
          <div
            className="
              hidden lg:grid
              grid-cols-2 grid-rows-3
              gap-[4px]
              h-[260px] md:h-[360px] lg:h-[420px]
            "
          >
            {Array.from({ length: SIDE_SLOTS }).map((_, slotIndex) => {
              const imgUrl =
                sideImages[slotIndex] ||
                sideImages[sideImages.length - 1] ||
                mainImage;

              const isLast = slotIndex === SIDE_SLOTS - 1;

              if (!imgUrl) return null;

              return (
                <div
                  key={slotIndex}
                  className="relative cursor-pointer"
                  onClick={() =>
                    isLast ? openGalleryAt(0) : openGalleryAt(slotIndex + 1)
                  }
                >
                  <img
                    src={imgUrl}
                    alt={restaurant.name || restaurant.slug}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />

                  {/* Ô cuối: overlay "Xem tất cả" */}
                  {isLast && (
                    <div className="absolute inset-0 bg-black/45 flex flex-col items-center justify-center text-white text-sm font-semibold">
                      <span>Xem tất cả</span>
                      {totalImages > 0 && (
                        <span className="mt-0.5 text-xs opacity-90">
                          {totalImages} hình ảnh
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==== OVERLAY XEM ẢNH FULLSCREEN ==== */}
      {isGalleryOpen &&
        totalImages > 0 &&
        createPortal(
          <div
            className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center"
            onClick={() => setIsGalleryOpen(false)}
          >
            <div
              className="relative max-w-5xl w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={galleryImages[currentImageIndex]}
                alt={restaurant.name || restaurant.slug}
                className="w-full max-h-[70vh] object-contain rounded-xl"
              />

              {totalImages > 1 && (
                <>
                  {/* Prev */}
                  <button
                    type="button"
                    onClick={goPrev}
                    className="absolute left-0 top-1/2 -translate-y-1/2 ml-2 rounded-full bg-black/60 w-8 h-8 flex items-center justify-center text-white text-lg"
                  >
                    &lt;
                  </button>
                  {/* Next */}
                  <button
                    type="button"
                    onClick={goNext}
                    className="absolute right-0 top-1/2 -translate-y-1/2 mr-2 rounded-full bg-black/60 w-8 h-8 flex items-center justify-center text-white text-lg"
                  >
                    &gt;
                  </button>
                </>
              )}

              {/* Nút đóng */}
              <button
                type="button"
                onClick={() => setIsGalleryOpen(false)}
                className="absolute -top-10 right-0 text-white text-sm font-semibold px-3 py-1 rounded-full bg-black/60"
              >
                Đóng
              </button>
            </div>

            {/* THUMBNAILS dưới */}
            <div
              className="mt-4 flex gap-2 overflow-x-auto px-4 pb-2 w-full max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              {galleryImages.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`flex-shrink-0 rounded-md overflow-hidden border-2 ${
                    idx === currentImageIndex
                      ? "border-white"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={url}
                    alt={restaurant.name || restaurant.slug}
                    className="w-24 h-16 object-cover"
                  />
                </button>
              ))}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}