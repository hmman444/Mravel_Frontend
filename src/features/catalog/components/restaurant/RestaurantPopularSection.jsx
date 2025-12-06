// src/features/restaurants/components/restaurant/RestaurantPopularSection.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { FaMapMarkerAlt, FaStar } from "react-icons/fa";
import { FiHeart } from "react-icons/fi";

import { useCatalogRestaurants } from "../../../catalog/hooks/useCatalogRestaurants";

// Helper format tiền VND
const formatCurrencyVND = (value) => {
  if (value === null || value === undefined) return null;
  const num = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(num)) return null;
  return num.toLocaleString("vi-VN");
};

// Skeleton khi loading – layout ngang giống card thật
const SkeletonCard = () => (
  <div className="flex-none w-[360px] md:w-[400px] rounded-2xl bg-white border border-gray-200 shadow-sm">
    <div className="flex h-[140px]">
      <div className="w-[130px] md:w-[140px] h-full bg-gray-200 animate-pulse" />
      <div className="flex-1 p-3 space-y-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse" />
        <div className="h-3 bg-gray-200 rounded animate-pulse" />
        <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-1/2 mt-4 animate-pulse" />
      </div>
    </div>
  </div>
);

export default function RestaurantPopularSection() {
  const navigate = useNavigate();
  const { items, loading, error, fetchRestaurants } = useCatalogRestaurants();
  const [activeKey, setActiveKey] = useState(null);
  const scrollRef = useRef(null);

  // gọi API lần đầu: lấy ~30 quán (backend sort theo avgRating,…)
  useEffect(() => {
    fetchRestaurants({
      page: 0,
      size: 30,
      sort: "avgRating,DESC",
    });
  }, [fetchRestaurants]);

  // group theo điểm đến / thành phố (destinationSlug / cityName)
  const groups = useMemo(() => {
    if (!items || !items.length) return [];

    const map = new Map();

    items.forEach((r) => {
      const key = r.destinationSlug || r.cityName || "other";
      const label =
        r.cityName || r.destinationName || r.destinationSlug || "Khác";

      if (!map.has(key)) {
        map.set(key, { key, label, restaurants: [] });
      }
      map.get(key).restaurants.push(r);
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

  // Không có data & không lỗi → ẩn block
  if (!loading && !error && (!groups.length || !activeGroup)) {
    return null;
  }

  return (
    <section className="max-w-7xl mx-auto px-6 pt-10 pb-10">
      {/* TITLE */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🍽️</span>
        <h2 className="text-2xl font-semibold">Quán ăn phổ biến</h2>
      </div>

      {/* TABS ĐIỂM ĐẾN */}
      {groups.length > 0 && (
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
                  : "bg-white border-gray-300 text-gray-800 hover:bg-gray-50",
              ].join(" ")}
            >
              {g.label}
            </button>
          ))}
        </div>
      )}

      {/* LIST CARD (SCROLL NGANG) */}
      <div className="relative mt-4">
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 -mx-1 px-1"
        >
          {loading && (!activeGroup || !activeGroup.restaurants?.length) && (
            <>
              {[...Array(4)].map((_, idx) => (
                <SkeletonCard key={idx} />
              ))}
            </>
          )}

          {!loading &&
            activeGroup?.restaurants?.map((restaurant) => (
              <RestaurantMiniCard
                key={restaurant.slug || restaurant.id}
                restaurant={restaurant}
                onClick={() =>
                  restaurant.slug &&
                  navigate(`/restaurants/${restaurant.slug}`)
                }
              />
            ))}
        </div>

        {/* NÚT MŨI TÊN BÊN PHẢI */}
        {activeGroup?.restaurants?.length > 3 && (
          <button
            type="button"
            onClick={handleScrollRight}
            className="hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-lg border border-gray-200 absolute top-1/2 -translate-y-1/2 right-2"
          >
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </button>
        )}
      </div>

      {/* lỗi */}
      {error && (
        <p className="mt-2 text-sm text-red-600">
          Không tải được danh sách quán ăn:{" "}
          {typeof error === "string" ? error : ""}
        </p>
      )}
    </section>
  );
}

/* ----------------------- CARD NHỎ KIỂU PASGO (KHÔNG KM, KHÔNG BUTTON ĐẶT, CHỈ "GIÁ CHỈ TỪ") ----------------------- */

function RestaurantMiniCard({ restaurant, onClick }) {
  const {
    name,
    slug,
    cityName,
    districtName,
    wardName,
    avgRating,
    reviewsCount,
    minPricePerPerson,
    avgPricePerPerson,
    currencyCode,
    ratingLabel,
    cuisines,
    images,
    coverImageUrl,
    addressLine,
    priceLevel,
  } = restaurant;

  const locationLabel =
    wardName || districtName || cityName || restaurant.destinationName || "";

  // địa chỉ: ưu tiên addressLine, không line-clamp (cho phép xuống dòng)
  const addressText = addressLine || locationLabel || "";

  // chỉ cần "giá từ" cho gọn
  const basePrice =
    minPricePerPerson ??
    avgPricePerPerson ??
    null;

  const basePriceText = basePrice ? formatCurrencyVND(basePrice) : null;
  const priceText = basePriceText
    ? `Giá chỉ từ ${basePriceText} ${currencyCode || "VND"}/người`
    : "Giá tham khảo tại nhà hàng";

  const score =
    typeof avgRating === "number" ? avgRating.toFixed(1) : null;
  const reviews = reviewsCount ?? 0;

  const cuisinesText = Array.isArray(cuisines)
    ? cuisines
        .map((c) => c?.name || c?.label)
        .filter(Boolean)
        .join(" • ")
    : null;

  // map priceLevel -> $, $$, $$$,...
  let priceLevelText = null;
  if (typeof priceLevel === "string") {
    const map = {
      CHEAP: "$",
      MEDIUM: "$$",
      EXPENSIVE: "$$$",
      LUXURY: "$$$$",
    };
    priceLevelText = map[priceLevel] || null;
  }

  const imageUrl =
    coverImageUrl ||
    restaurant.imageUrl ||
    (Array.isArray(images) && images[0]?.url) ||
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80&auto=format&fit=crop";

  return (
    <div
      className="flex-none w-[360px] md:w-[400px] rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition"
      onClick={onClick}
    >
      <div className="flex h-[140px]">
        {/* ẢNH BÊN TRÁI – TO HƠN */}
        <div className="relative w-[130px] md:w-[140px] h-full flex-shrink-0">
          <img
            src={imageUrl}
            alt={name || slug}
            className="w-full h-full object-cover"
            loading="lazy"
          />

          {/* badge khu vực: đưa lên ngang icon tim */}
          {locationLabel && (
            <div className="absolute top-1 left-1 flex items-center gap-1 px-2 py-[2px] rounded-full bg-black/70 text-white text-[11px] font-semibold">
              <FaMapMarkerAlt className="w-3 h-3" />
              <span className="line-clamp-1 max-w-[80px]">
                {locationLabel}
              </span>
            </div>
          )}

          <button
            type="button"
            className="absolute top-1 right-1 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center text-white"
          >
            <FiHeart className="w-4 h-4" />
          </button>
        </div>

        {/* BODY BÊN PHẢI – GIÁ TRÁI, RATING BÊN DƯỚI */}
        <div className="flex-1 flex flex-col p-3">
          {/* phần trên: tên + địa chỉ + thể loại */}
          <div>
            <h3 className="font-semibold text-[15px] leading-snug line-clamp-2">
              {name || slug || "Nhà hàng chưa đặt tên"}
            </h3>

            {addressText && (
              <p className="mt-1 text-xs text-gray-600 leading-snug">
                {addressText}
              </p>
            )}

            {cuisinesText && (
              <p className="mt-1 text-xs text-gray-500">
                {cuisinesText}
              </p>
            )}
          </div>

          {/* phần dưới: GIÁ (trái) + RATING bên dưới */}
          <div className="mt-auto pt-2">
            {/* giá – sát mép trái */}
            <div className="text-[13px] md:text-[14px] font-bold text-[#ff5a00]">
              {priceText}
            </div>

            {/* rating tách riêng, nằm dưới giá */}
            <div className="mt-1 flex items-center gap-1 text-[11px] text-gray-700">
              {score ? (
                <>
                  <FaStar className="w-3 h-3 text-[#fbbf24]" />
                  <span className="font-semibold">{score}</span>
                  {ratingLabel && (
                    <span className="text-[11px] text-blue-600">
                      {ratingLabel}
                    </span>
                  )}
                  {reviews > 0 && (
                    <span className="text-[11px] text-gray-500">
                      ({reviews})
                    </span>
                  )}
                </>
              ) : (
                <span className="text-[11px] text-gray-500">Mới</span>
              )}

              {priceLevelText && (
                <span className="ml-1 text-[11px] text-gray-500">
                  {priceLevelText}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}