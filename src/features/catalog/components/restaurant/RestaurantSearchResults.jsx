// src/features/catalog/components/restaurant/RestaurantSearchResults.jsx
import { useEffect, useMemo, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ChevronRight } from "lucide-react";
import { FaMapMarkerAlt, FaStar } from "react-icons/fa";
import { FiHeart } from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_URL;

// Helper format tiền VND
const formatCurrencyVND = (value) => {
  if (value === null || value === undefined) return null;
  const num = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(num)) return null;
  return num.toLocaleString("vi-VN");
};

// Skeleton ngang giống mini-card
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

/** Ẩn mặc định, chỉ hiện khi URL có query hợp lệ */
export default function RestaurantSearchResults() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const listRef = useRef(null);
  const scrollRef = useRef(null);

  // Có query -> bật mode hiển thị kết quả
  const isSearchMode = useMemo(() => {
    return (
      !!(params.get("location") && params.get("location").trim()) ||
      !!params.get("date") ||
      !!params.get("time") ||
      !!params.get("people") ||
      !!params.get("cuisine")
    );
  }, [params]);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState({ content: [], total: 0 });

  const page = Number(params.get("page") ?? 0);
  const size = Number(params.get("size") ?? 9);

  useEffect(() => {
    if (!isSearchMode) return;

    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true);

        // Lấy query từ URL
        const location = (params.get("location") || "").trim();
        const visitDate = params.get("date") || null; // yyyy-mm-dd
        const visitTime = params.get("time") || null; // HH:mm
        const peopleStr = params.get("people");
        const people = peopleStr ? Number(peopleStr) : null;
        const cuisine = (params.get("cuisine") || "").trim();

        // Body đúng với RestaurantSearchRequest
        const body = {
          ...(location ? { location } : {}),
          ...(visitDate ? { visitDate } : {}),
          ...(visitTime ? { visitTime } : {}),
          ...(Number.isFinite(people) && people > 0 ? { people } : {}),
          ...(cuisine ? { cuisineSlugs: [cuisine] } : {}),
        };

        // Backend yêu cầu POST, page/size để trên query string
        const url = `${API_URL}/catalog/restaurants/search`;
        const res = await axios.post(url, body, {
          params: { page, size },
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
        });

        // Unwrap ApiResponse<Page<RestaurantSummaryDTO>>
        const pageData = res?.data?.data;
        setResult({
          content: pageData?.content ?? [],
          total: pageData?.totalElements ?? pageData?.total ?? 0,
        });

        // kéo viewport đến list khi có kết quả
        requestAnimationFrame(() => {
          if (listRef.current) {
            const top = listRef.current.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top, behavior: "smooth" });
          }
        });
      } catch (e) {
        if (e.name !== "CanceledError") {
          console.error("Search restaurants error:", e);
          setResult({ content: [], total: 0 });
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [isSearchMode, params, page, size]);

  if (!isSearchMode) return null; // ⬅ ẨN khi chưa có query

  const handleScrollRight = () => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: 320, behavior: "smooth" });
  };

  return (
    <section ref={listRef} className="max-w-7xl mx-auto px-6 mt-6 md:mt-10">
      <div className="mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100">
          Kết quả tìm quán ăn
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {loading ? "Đang tải..." : `${result.total} kết quả phù hợp`}
        </p>
      </div>

      {/* LIST CARD (SCROLL NGANG) – giống RestaurantPopularSection */}
      <div className="relative mt-2">
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 -mx-1 px-1"
        >
          {loading && (
            <>
              {[...Array(3)].map((_, idx) => (
                <SkeletonCard key={idx} />
              ))}
            </>
          )}

          {!loading &&
            result.content.map((item, idx) => (
              <RestaurantMiniCard
                key={item.slug || item.id || idx}
                restaurant={item}
                onClick={() =>
                  item.slug && navigate(`/restaurants/${encodeURIComponent(item.slug)}`)
                }
              />
            ))}
        </div>

        {/* NÚT MŨI TÊN BÊN PHẢI (hiện khi có >3 item để gợi ý cuộn) */}
        {result.content.length > 3 && (
          <button
            type="button"
            onClick={handleScrollRight}
            className="hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-lg border border-gray-200 absolute top-1/2 -translate-y-1/2 right-2"
          >
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </button>
        )}
      </div>

      {!loading && result.total === 0 && (
        <div className="mt-6 border border-dashed rounded-xl p-6 text-center text-slate-500 dark:text-slate-400">
          Không tìm thấy kết quả. Hãy thử đổi khu vực hoặc loại ẩm thực.
        </div>
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
    // ⬇️ bỏ không dùng: cuisines, cuisineNames
    images,
    coverImageUrl,
    imageUrl,
    addressLine,
    destinationName,
    destinationSlug,
    priceLevel,
  } = restaurant;

  const locationLabel =
    wardName ||
    districtName ||
    cityName ||
    destinationName ||
    destinationSlug ||
    "";

  const addressText = addressLine || locationLabel || "";

  const basePrice = minPricePerPerson ?? avgPricePerPerson ?? null;
  const basePriceText = basePrice ? formatCurrencyVND(basePrice) : null;
  const priceText = basePriceText
    ? `Giá chỉ từ ${basePriceText} ${currencyCode || "VND"}/người`
    : "Giá tham khảo tại nhà hàng";

  const score =
    typeof avgRating === "number" ? avgRating.toFixed(1) : null;
  const reviews = reviewsCount ?? 0;

  // ⬇️ XÓA HOÀN TOÀN phần tính cuisinesText
  // const cuisinesText = ...

  let priceLevelText = null;
  if (typeof priceLevel === "string") {
    const map = { CHEAP: "$", MEDIUM: "$$", EXPENSIVE: "$$$", LUXURY: "$$$$" };
    priceLevelText = map[priceLevel] || null;
  }

  const cover =
    coverImageUrl ||
    imageUrl ||
    (Array.isArray(images) && images[0]?.url) ||
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80&auto=format&fit=crop";

  return (
    <div
      className="flex-none w-[360px] md:w-[400px] rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition"
      onClick={onClick}
    >
      <div className="flex h-[140px]">
        {/* ẢNH BÊN TRÁI */}
        <div className="relative w-[130px] md:w-[140px] h-full flex-shrink-0">
          <img
            src={cover}
            alt={name || slug}
            className="w-full h-full object-cover"
            loading="lazy"
          />

          {locationLabel && (
            <div className="absolute top-1 left-1 flex items-center gap-1 px-2 py-[2px] rounded-full bg-black/70 text-white text-[11px] font-semibold">
              <FaMapMarkerAlt className="w-3 h-3" />
              <span className="line-clamp-1 max-w-[80px]">{locationLabel}</span>
            </div>
          )}

          <button
            type="button"
            className="absolute top-1 right-1 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center text-white"
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            aria-label="Yêu thích"
            title="Yêu thích"
          >
            <FiHeart className="w-4 h-4" />
          </button>
        </div>

        {/* BODY BÊN PHẢI */}
        <div className="flex-1 flex flex-col p-3">
          {/* tên + địa chỉ */}
          <div>
            <h3 className="font-semibold text-[15px] leading-snug line-clamp-2">
              {name || slug || "Nhà hàng chưa đặt tên"}
            </h3>

            {addressText && (
              <p className="mt-1 text-xs text-gray-600 leading-snug">
                {addressText}
              </p>
            )}

            {/* ⬇️ BỎ HOÀN TOÀN phần hiển thị thể loại */}
            {/* {cuisinesText && (
              <p className="mt-1 text-xs text-gray-500">{cuisinesText}</p>
            )} */}
          </div>

          {/* giá + rating */}
          <div className="mt-auto pt-2">
            <div className="text-[13px] md:text-[14px] font-bold text-[#ff5a00]">
              {priceText}
            </div>

            <div className="mt-1 flex items-center gap-1 text-[11px] text-gray-700">
              {score ? (
                <>
                  <FaStar className="w-3 h-3 text-[#fbbf24]" />
                  <span className="font-semibold">{score}</span>
                  {ratingLabel && (
                    <span className="text-[11px] text-blue-600">{ratingLabel}</span>
                  )}
                  {reviews > 0 && (
                    <span className="text-[11px] text-gray-500">({reviews})</span>
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