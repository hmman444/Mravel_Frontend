import React, { useMemo, useState, useEffect } from "react";

/** ---- helpers ---- */
function pickMenuImages(restaurant) {
  const arr = Array.isArray(restaurant?.menuImages) ? restaurant.menuImages : [];
  return arr.map((img) => img?.url || img?.imageUrl || img?.src).filter(Boolean);
}

/** ---- Lightbox modal ---- */
function MenuLightbox({ images, startIndex = 0, onClose }) {
  const [index, setIndex] = useState(startIndex);

  useEffect(() => {
    // Ẩn navbar khi mở
    const navbar = document.querySelector("[data-navbar]");
    const prevOverflow = document.body.style.overflow;
    if (navbar) navbar.classList.add("hidden");
    document.body.style.overflow = "hidden";

    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % images.length);
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      // Khôi phục navbar + scroll
      if (navbar) navbar.classList.remove("hidden");
      document.body.style.overflow = prevOverflow;
    };
  }, [images.length, onClose]);

  const go = (i) => setIndex(((i % images.length) + images.length) % images.length);

  return (
    <div className="fixed inset-0 z-[100] bg-black/70" onClick={onClose} role="dialog" aria-modal="true">
      <div className="absolute inset-4 md:inset-8 bg-neutral-900 rounded-xl overflow-hidden flex" onClick={(e) => e.stopPropagation()}>
        {/* Left thumbnails: 2 cột */}
        <aside className="hidden md:block w-72 bg-neutral-950/40 overflow-y-auto">
          <div className="p-3 grid grid-cols-2 gap-3">
            {images.map((src, i) => (
              <button
                key={`${src}-${i}`}
                onClick={() => go(i)}
                className={`relative rounded-lg overflow-hidden border ${
                  i === index ? "border-white" : "border-transparent opacity-70 hover:opacity-100"
                }`}
                title={`Trang ${i + 1}`}
              >
                <img src={src} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover aspect-[4/3]" />
              </button>
            ))}
          </div>
        </aside>

        {/* Main viewer */}
        <div className="flex-1 relative flex items-center justify-center bg-neutral-900">
          <button
            onClick={() => go(index - 1)}
            className="absolute left-2 md:left-4 p-2 rounded-full bg-white/80 hover:bg-white transition"
            title="Trước"
          >
            ‹
          </button>
          <button
            onClick={() => go(index + 1)}
            className="absolute right-2 md:right-4 p-2 rounded-full bg-white/80 hover:bg-white transition"
            title="Sau"
          >
            ›
          </button>

          <img src={images[index]} alt={`Menu ${index + 1}`} className="max-h-full max-w-full object-contain" />

          <div className="absolute top-0 inset-x-0 p-3 flex items-center justify-between pointer-events-none">
            <span className="text-white/90 text-sm md:text-base pointer-events-none">
              {index + 1} / {images.length}
            </span>
            <button
              onClick={onClose}
              className="pointer-events-auto px-3 py-1 rounded-md bg-white/90 hover:bg-white text-black font-medium"
              title="Đóng"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** ---- Public component ---- */
export default function RestaurantMenuGallery({ restaurant }) {
  const allImages = useMemo(() => pickMenuImages(restaurant), [restaurant]);

  const limit = 9;
  const { previewImages, restCount } = useMemo(() => {
    const preview = allImages.slice(0, limit);
    const remaining = Math.max(allImages.length - limit, 0);
    return { previewImages: preview, restCount: remaining };
  }, [allImages]);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);

  const openAt = (i) => {
    setStartIndex(i);
    setLightboxOpen(true);
  };

  if (!restaurant || allImages.length === 0) return null;

  return (
    <section className="px-5 md:px-6 pt-5 pb-6">
      <h2 className="text-2xl md:text-[26px] font-extrabold text-gray-900">
        Bảng giá {restaurant?.name}
      </h2>

      {/* Grid 9 ảnh, ô cuối có overlay +n */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {previewImages.map((src, i) => {
          const isLastTile = i === limit - 1 && restCount > 0;
          return (
            <button
              type="button"
              key={`${src}-${i}`}
              onClick={() => openAt(i)}
              className="relative border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm group"
              title={`Xem ảnh ${i + 1}`}
            >
              <img
                src={src}
                alt={`Menu ${restaurant?.name || ""} - ${i + 1}`}
                loading="lazy"
                className="w-full h-full object-cover aspect-[4/3] group-hover:scale-[1.02] transition"
              />
              {isLastTile && (
                <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
                  <span className="px-4 py-2 rounded-full bg-white/90 text-black font-semibold text-lg">
                    +{restCount}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {lightboxOpen && (
        <MenuLightbox
          images={allImages}
          startIndex={startIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </section>
  );
}