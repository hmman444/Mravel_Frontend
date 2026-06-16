// src/features/restaurants/components/restaurant/RestaurantPopularSection.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaMapMarkerAlt, FaStar } from "react-icons/fa";

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
  <div className="w-full rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
    <div className="flex h-[140px]">
      <div className="w-[130px] md:w-[140px] h-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
      <div className="flex-1 p-3 space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-4 animate-pulse" />
      </div>
    </div>
  </div>
);

const PAGE_SIZE = 9;

const TYPE_LABELS = {
  BUFFET: { vi: "Buffet", en: "Buffet" },
  GOI_MON: { vi: "Gọi món", en: "À la carte" },
  BUFFET_VA_GOI_MON: { vi: "Buffet & Gọi món", en: "Buffet & à la carte" },
  BBQ: { vi: "Nướng (BBQ)", en: "BBQ" },
  CAFE: { vi: "Cafe", en: "Café" },
  BAR: { vi: "Bar", en: "Bar" },
  LOUNGE: { vi: "Lounge", en: "Lounge" },
  OTHER: { vi: "Khác", en: "Other" },
};
const typeLabel = (code, lang) => TYPE_LABELS[code]?.[lang === "en" ? "en" : "vi"] || code;

function TypeChip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition",
        active
          ? "bg-[#ff5a00] border-[#ff5a00] text-white"
          : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function Pagination({ page, totalPages, onChange }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i);
  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        disabled={page <= 0}
        onClick={() => onChange(page - 1)}
        className="px-3 py-1.5 rounded-lg text-sm border border-gray-300 dark:border-gray-700 disabled:opacity-40"
      >
        ‹
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className={[
            "w-9 h-9 rounded-lg text-sm font-semibold border",
            p === page
              ? "bg-[#0064d2] border-[#0064d2] text-white"
              : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50",
          ].join(" ")}
        >
          {p + 1}
        </button>
      ))}
      <button
        type="button"
        disabled={page >= totalPages - 1}
        onClick={() => onChange(page + 1)}
        className="px-3 py-1.5 rounded-lg text-sm border border-gray-300 dark:border-gray-700 disabled:opacity-40"
      >
        ›
      </button>
    </div>
  );
}

export default function RestaurantPopularSection() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { items, loading, error, fetchRestaurants } = useCatalogRestaurants();
  const [activeKey, setActiveKey] = useState(null);
  const [activeType, setActiveType] = useState("ALL");
  const [page, setPage] = useState(0);
  const sectionRef = useRef(null);

  // Đổi trang → cuộn lên đầu section (khỏi phải scroll tay)
  const goToPage = (p) => {
    setPage(p);
    requestAnimationFrame(() => {
      if (sectionRef.current) {
        const top = sectionRef.current.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: "smooth" });
      }
    });
  };

  // gọi API lần đầu (lấy nhiều để phân trang client-side)
  useEffect(() => {
    fetchRestaurants({
      page: 0,
      size: 60,
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
        r.cityName || r.destinationName || r.destinationSlug || t('restaurant.other_destination');

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

  // Lọc theo loại (restaurantType) trong tab điểm đến đang chọn
  const typesPresent = useMemo(() => {
    const set = new Set();
    (activeGroup?.restaurants || []).forEach((r) => r.restaurantType && set.add(r.restaurantType));
    return Array.from(set);
  }, [activeGroup]);

  const filtered = useMemo(() => {
    const list = activeGroup?.restaurants || [];
    return activeType === "ALL" ? list : list.filter((r) => r.restaurantType === activeType);
  }, [activeGroup, activeType]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages - 1);
  const pageItems = filtered.slice(pageSafe * PAGE_SIZE, pageSafe * PAGE_SIZE + PAGE_SIZE);

  // đổi điểm đến hoặc loại → về trang đầu
  useEffect(() => {
    setPage(0);
  }, [activeKey, activeType]);

  // Không có data & không lỗi → ẩn block
  if (!loading && !error && (!groups.length || !activeGroup)) {
    return null;
  }

  return (
    <section ref={sectionRef} className="max-w-7xl mx-auto px-6 pt-10 pb-10 scroll-mt-20">
      {/* TITLE */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🍽️</span>
        <h2 className="text-2xl font-semibold">{t('restaurant.popular_restaurants')}</h2>
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
                  : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-50",
              ].join(" ")}
            >
              {g.label}
            </button>
          ))}
        </div>
      )}

      {/* LỌC THEO LOẠI (restaurantType) */}
      {typesPresent.length > 0 && (
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          <TypeChip active={activeType === "ALL"} onClick={() => setActiveType("ALL")}>
            {t("restaurant.type_all")} ({activeGroup?.restaurants?.length || 0})
          </TypeChip>
          {typesPresent.map((code) => {
            const count = (activeGroup?.restaurants || []).filter((r) => r.restaurantType === code).length;
            return (
              <TypeChip key={code} active={activeType === code} onClick={() => setActiveType(code)}>
                {typeLabel(code, i18n.language)} ({count})
              </TypeChip>
            );
          })}
        </div>
      )}

      {/* LIST CARD – grid wrap thành hàng (9/trang) */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading && (!activeGroup || !activeGroup.restaurants?.length) && (
          <>
            {[...Array(6)].map((_, idx) => (
              <SkeletonCard key={idx} />
            ))}
          </>
        )}

        {!loading &&
          pageItems.map((restaurant) => (
            <RestaurantMiniCard
              key={restaurant.slug || restaurant.id}
              restaurant={restaurant}
              onClick={() =>
                restaurant.slug && navigate(`/restaurants/${restaurant.slug}`)
              }
            />
          ))}
      </div>

      {/* rỗng sau khi lọc */}
      {!loading && filtered.length === 0 && (
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">{t("restaurant.no_results")}</p>
      )}

      {/* PHÂN TRANG */}
      {!loading && totalPages > 1 && (
        <Pagination page={pageSafe} totalPages={totalPages} onChange={goToPage} />
      )}

      {/* lỗi */}
      {error && (
        <p className="mt-2 text-sm text-red-600">
          {t('restaurant.load_restaurants_failed')}{" "}
          {typeof error === "string" ? error : ""}
        </p>
      )}
    </section>
  );
}

/*  CARD NHỎ KIỂU PASGO (KHÔNG KM, KHÔNG BUTTON ĐẶT, CHỈ "GIÁ CHỈ TỪ")  */

function RestaurantMiniCard({ restaurant, onClick }) {
  const { t } = useTranslation();
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
    ? t('restaurant.price_from_per_person', { price: basePriceText, currency: currencyCode || "VND" })
    : t('restaurant.reference_price_at_restaurant');

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
      className="w-full rounded-2xl overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm cursor-pointer hover:shadow-md transition"
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
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src =
                "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'><rect width='100%' height='100%' fill='%23e5e7eb'/></svg>";
            }}
          />

          {/* badge khu vực */}
          {locationLabel && (
            <div className="absolute top-1 left-1 flex items-center gap-1 px-2 py-[2px] rounded-full bg-black/70 text-white text-[11px] font-semibold">
              <FaMapMarkerAlt className="w-3 h-3" />
              <span className="line-clamp-1 max-w-[80px]">
                {locationLabel}
              </span>
            </div>
          )}
        </div>

        {/* BODY BÊN PHẢI – GIÁ TRÁI, RATING BÊN DƯỚI */}
        <div className="flex-1 flex flex-col p-3">
          {/* phần trên: tên + địa chỉ + thể loại */}
          <div>
            <h3 className="font-semibold text-[15px] leading-snug line-clamp-2">
              {name || slug || t('restaurant.unnamed_restaurant')}
            </h3>

            {addressText && (
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 leading-snug">
                {addressText}
              </p>
            )}

            {cuisinesText && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
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
            <div className="mt-1 flex items-center gap-1 text-[11px] text-gray-700 dark:text-gray-300">
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
                    <span className="text-[11px] text-gray-500 dark:text-gray-400">
                      ({reviews})
                    </span>
                  )}
                </>
              ) : (
                <span className="text-[11px] text-gray-500 dark:text-gray-400">{t('restaurant.new')}</span>
              )}

              {priceLevelText && (
                <span className="ml-1 text-[11px] text-gray-500 dark:text-gray-400">
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