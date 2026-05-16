// src/features/hotels/components/hotel/WeekendNearbyHotels.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { FaMapMarkerAlt, FaStar } from "react-icons/fa";

import { useCatalogHotels } from "../../../catalog/hooks/useCatalogHotels";

export default function WeekendNearbyHotels() {
  const navigate = useNavigate();
  const { items, loading, error, fetchHotels } = useCatalogHotels();
  const [activeKey, setActiveKey] = useState(null);
  const scrollRef = useRef(null);

  // gọi API lần đầu: lấy 30 khách sạn bất kỳ (backend sẽ sort như bạn cấu hình)
  useEffect(() => {
    fetchHotels({ page: 0, size: 30 });
  }, [fetchHotels]);

  // group theo điểm đến (destinationSlug/cityName)
  const groups = useMemo(() => {
    if (!items || !items.length) return [];

    const map = new Map();

    items.forEach((h) => {
        const key = h.destinationSlug || h.cityName || "other";
        const label = h.cityName || h.destinationSlug || "Khác";

        if (!map.has(key)) {
        map.set(key, { key, label, hotels: [] });
        }
        map.get(key).hotels.push(h);
    });

    const arr = Array.from(map.values());
    arr.sort((a, b) => a.label.localeCompare(b.label, "vi"));
    return arr;
    }, [items]);

  // set tab đầu tiên
  useEffect(() => {
    if (groups.length && !activeKey) {
      setActiveKey(groups[0].key);
    }
  }, [groups, activeKey]);

  const activeGroup = useMemo(
    () => groups.find((g) => g.key === activeKey),
    [groups, activeKey]
  );

  const handleScrollRight = () => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: 320, behavior: "smooth" });
  };

  if (!loading && (!groups.length || !activeGroup)) {
    // không có data thì ẩn luôn block
    return null;
  }

  return (
    <section className="max-w-7xl mx-auto px-6 pt-10 pb-10">
      {/* TITLE */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🌴</span>
        <h2 className="text-2xl font-semibold">Chơi cuối tuần gần nhà</h2>
      </div>

      {/* TABS ĐIỂM ĐẾN */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {groups.map((g) => (
          <button
            key={g.key}
            type="button"
            onClick={() => setActiveKey(g.key)}
            className={[
              "px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap border",
              activeKey === g.key
                ? "bg-[#0064d2] border-[#0064d2] text-white"
                : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-50",
            ].join(" ")}
          >
            {g.label}
          </button>
        ))}
      </div>

      {/* LIST CARD (SCROLL NGANG) */}
      <div className="relative mt-4">
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 -mx-1 px-1"
        >
          {loading && (
            // skeleton đơn giản
            <>
              {[...Array(4)].map((_, idx) => (
                <div
                  key={idx}
                  className="flex-none w-[280px] rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm"
                >
                  <div className="h-44 bg-gray-200 dark:bg-gray-700 animate-pulse" />
                  <div className="p-3 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
                  </div>
                </div>
              ))}
            </>
          )}

          {!loading &&
            activeGroup?.hotels?.map((hotel) => (
              <HotelMiniCard
                key={hotel.slug}
                hotel={hotel}
                onClick={() => navigate(`/hotels/${hotel.slug}`)}
              />
            ))}
        </div>

        {/* NÚT MŨI TÊN BÊN PHẢI (GIỐNG TRAVELOKA) */}
        {activeGroup?.hotels?.length > 3 && (
          <button
            type="button"
            onClick={handleScrollRight}
            className="hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 absolute top-1/2 -translate-y-1/2 right-2"
          >
            <ChevronRight className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>
        )}
      </div>

      {/* lỗi */}
      {error && (
        <p className="mt-2 text-sm text-red-600">
          Không tải được danh sách khách sạn: {error}
        </p>
      )}
    </section>
  );
}

/* ----------------------- CARD NHỎ GIỐNG TRAVELOKA ----------------------- */

function HotelMiniCard({ hotel, onClick }) {
  // đoán các field từ HotelSummaryDTO – nếu tên khác bạn chỉ cần chỉnh lại ở đây
  const {
    name,
    slug,
    cityName,
    districtName,
    avgRating,
    reviewsCount,
    minNightlyPrice,
    currencyCode,
    ratingLabel,
    promoLabel,
    referenceNightlyPrice,
    discountPercent,
  } = hotel;

  const locationLabel = districtName || cityName || "";
  const price = minNightlyPrice ?? 0;
  const oldPrice = referenceNightlyPrice ?? null;
  let promoPercent = null;
  if (discountPercent != null) {
    promoPercent = discountPercent;
  } else if (oldPrice && price && oldPrice > price) {
    promoPercent = Math.round(((oldPrice - price) / oldPrice) * 100);
  }
  const priceText =
    price && price > 0
      ? price.toLocaleString("vi-VN") + ` ${currencyCode || "VND"}`
      : "Giá đang cập nhật";

  const oldPriceText =
    oldPrice && oldPrice > 0
      ? oldPrice.toLocaleString("vi-VN") + ` ${currencyCode || "VND"}`
      : null;

  const score = typeof avgRating === "number" ? avgRating.toFixed(1) : "8.8";
  const reviews = reviewsCount ?? 0;

  const imageUrl =
    hotel.cover || // <-- từ HotelSummaryDTO
    hotel.coverImageUrl ||
    hotel.mainImageUrl ||
    hotel.thumbnailUrl ||
    hotel.thumbnail ||
    (hotel.images && hotel.images[0]?.url) ||
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80&auto=format&fit=crop";

  const promo = promoLabel || (promoPercent ? `Tiết kiệm ${promoPercent}%` : null);

  return (
    <div
      className="flex-none w-[280px] rounded-2xl overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm cursor-pointer hover:shadow-md transition"
      onClick={onClick}
    >
      {/* ẢNH + BADGE KHU VỰC + PROMO */}
      <div className="relative h-44">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover"
          loading="lazy"
        />

        {/* badge khu vực */}
        {locationLabel && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full bg-black/70 text-white text-xs font-semibold">
            <FaMapMarkerAlt className="w-3 h-3" />
            <span>{locationLabel}</span>
          </div>
        )}

        {/* promo chip */}
        {promo && (
          <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-[#ff5a00] text-white text-xs font-bold">
            {promo}
          </div>
        )}
      </div>

      {/* BODY */}
      <div className="p-3">
        {/* tên KS */}
        <h3 className="font-semibold text-[15px] leading-snug line-clamp-2">
          {name || slug}
        </h3>

        {/* rating */}
        <div className="mt-1 flex items-center gap-1 text-xs">
          <div className="flex items-center gap-1">
            <FaStar className="w-3 h-3 text-[#fbbf24]" />
            <span className="font-semibold">{score}</span>
            <span className="text-gray-500 dark:text-gray-400">/10</span>
          </div>
          {ratingLabel && (
            <span className="ml-1 text-[11px] text-blue-600 font-semibold">
              {ratingLabel}
            </span>
          )}
          <span className="ml-1 text-[11px] text-gray-500 dark:text-gray-400">
            ({reviews})
          </span>
        </div>

        {/* giá */}
        {oldPriceText && (
          <div className="mt-2 text-xs text-gray-400 line-through">
            {oldPriceText}
          </div>
        )}
        <div className="text-[15px] font-bold text-[#ff5a00] mt-[2px]">
          {priceText}
        </div>
        <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
          Chưa bao gồm thuế và phí
        </div>
      </div>
    </div>
  );
}