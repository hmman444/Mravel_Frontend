// src/features/hotels/components/hotel/HotelSearchResultsSection.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getHotels } from "../../../catalog/services/catalogService";
import { addDaysLocal, formatLocalDate, parseLocalDate } from "../../utils/dateLocal";
import { FaMapMarkerAlt, FaStar } from "react-icons/fa";
import { FiHeart } from "react-icons/fi";

export default function HotelSearchResultsSection() {
  const navigate = useNavigate();
  const [sp] = useSearchParams();

  const location = (sp.get("location") || "").trim();
  const checkInStr = sp.get("checkIn") || "";
  const checkOutStrOnUrl = sp.get("checkOut") || "";
  const nights = Math.max(1, Math.min(30, parseInt(sp.get("nights") || "1", 10) || 1));
  const adults = Math.max(1, parseInt(sp.get("adults") || "1", 10) || 1);
  const children = Math.max(0, parseInt(sp.get("children") || "0", 10) || 0);
  const rooms = Math.max(1, parseInt(sp.get("rooms") || "1", 10) || 1);
  const page = Math.max(0, parseInt(sp.get("page") || "0", 10) || 0);
  const size = Math.max(1, Math.min(30, parseInt(sp.get("size") || "9", 10) || 9));

  // Ẩn hoàn toàn nếu chưa có search
  const shouldShow = Boolean(location);

  const computed = useMemo(() => {
    if (!shouldShow) return null;

    const checkInDate =
      parseLocalDate(checkInStr) ||
      (() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
      })();

    // ưu tiên checkOut trên URL, nếu thiếu thì tự tính từ nights
    const checkOutDate = parseLocalDate(checkOutStrOnUrl) || addDaysLocal(checkInDate, nights);

    return {
      location,
      checkIn: formatLocalDate(checkInDate),
      checkOut: formatLocalDate(checkOutDate),
      adults,
      children,
      rooms,
      page,
      size,
    };
  }, [
    shouldShow,
    location,
    checkInStr,
    checkOutStrOnUrl,
    nights,
    adults,
    children,
    rooms,
    page,
    size,
  ]);

  const [data, setData] = useState({ items: [], totalPages: 0, totalElements: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!computed) return;

    let alive = true;
    setLoading(true);
    setError(null);

    getHotels(computed)
      .then((res) => {
        if (!alive) return;
        if (!res?.success) {
          setError(res?.message || "Lỗi tìm kiếm khách sạn");
          setData({ items: [], totalPages: 0, totalElements: 0 });
          return;
        }
        setData(res.data || { items: [], totalPages: 0, totalElements: 0 });
      })
      .catch((e) => {
        if (!alive) return;
        setError(e?.message || "Lỗi tìm kiếm khách sạn");
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [computed]);

  const setPageOnUrl = (nextPage) => {
    const nx = new URLSearchParams(sp);
    nx.set("page", String(nextPage));
    navigate({ pathname: "/hotels/search", search: `?${nx.toString()}` });
  };

  const clearSearch = () => navigate("/hotels");

  if (!shouldShow) return null;

  return (
    <section className="max-w-7xl mx-auto px-6 pt-8 pb-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔎</span>
          <h2 className="text-2xl font-semibold">Kết quả tìm kiếm</h2>
        </div>

        <button
          type="button"
          onClick={clearSearch}
          className="px-4 py-2 rounded-full text-sm font-semibold border border-gray-300 hover:bg-gray-50"
        >
          Xóa tìm kiếm
        </button>
      </div>

      {/* trạng thái */}
      {loading && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 justify-items-center">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="w-full max-w-[280px] rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden"
            >
              <div className="relative h-40 bg-gray-200 animate-pulse" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                <div className="h-5 bg-gray-200 rounded animate-pulse w-1/3 mt-2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <p className="mt-4 text-sm text-red-600">Không tìm được khách sạn: {error}</p>
      )}

      {!loading && !error && (!data.items || data.items.length === 0) && (
        <p className="mt-4 text-sm text-gray-600">Không có kết quả phù hợp.</p>
      )}

      {/* list */}
      {!loading && !error && data.items?.length > 0 && (
        <>
          {/* ✅ grid nhỏ giống “🌴”: card max 280px và canh giữa */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 justify-items-center">
            {data.items.map((hotel) => (
              <HotelMiniCard
                key={hotel.slug}
                hotel={hotel}
                onClick={() => navigate(`/hotels/${hotel.slug}`)}
              />
            ))}
          </div>

          {/* pagination */}
          {data.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                className="px-4 py-2 rounded-full text-sm font-semibold border border-gray-300 disabled:opacity-50"
                onClick={() => setPageOnUrl(page - 1)}
                disabled={page <= 0}
              >
                Trước
              </button>
              <span className="text-sm text-gray-600">
                Trang <b>{page + 1}</b> / {data.totalPages}
              </span>
              <button
                className="px-4 py-2 rounded-full text-sm font-semibold border border-gray-300 disabled:opacity-50"
                onClick={() => setPageOnUrl(page + 1)}
                disabled={page + 1 >= data.totalPages}
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

/* ✅ Card giống WeekendNearbyHotels nhưng dùng cho grid (w-full max-w-[280px]) */
function HotelMiniCard({ hotel, onClick }) {
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
  } = hotel || {};

  const locationLabel = districtName || cityName || "";

  const price = minNightlyPrice ?? 0;
  const oldPrice = referenceNightlyPrice ?? null;

  let promoPercent = null;
  if (discountPercent != null) promoPercent = discountPercent;
  else if (oldPrice && price && oldPrice > price) {
    promoPercent = Math.round(((oldPrice - price) / oldPrice) * 100);
  }
  const promo = promoLabel || (promoPercent ? `Tiết kiệm ${promoPercent}%` : null);

  const priceText =
    price && price > 0
      ? price.toLocaleString("vi-VN") + ` ${currencyCode || "VND"}`
      : "Giá đang cập nhật";

  const oldPriceText =
    oldPrice && oldPrice > 0
      ? oldPrice.toLocaleString("vi-VN") + ` ${currencyCode || "VND"}`
      : null;

  const score = typeof avgRating === "number" ? avgRating.toFixed(1) : "--";
  const reviews = reviewsCount ?? 0;

  const imageUrl =
    hotel?.cover ||
    hotel?.coverImageUrl ||
    hotel?.mainImageUrl ||
    hotel?.thumbnailUrl ||
    hotel?.thumbnail ||
    (hotel?.images && hotel.images[0]?.url) ||
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80&auto=format&fit=crop";

  return (
    <div
      className="w-full max-w-[280px] rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition"
      onClick={onClick}
    >
      <div className="relative h-40">
        <img src={imageUrl} alt={name || slug} className="w-full h-full object-cover" loading="lazy" />

        {locationLabel && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full bg-black/70 text-white text-xs font-semibold">
            <FaMapMarkerAlt className="w-3 h-3" />
            <span className="line-clamp-1">{locationLabel}</span>
          </div>
        )}

        <button
          type="button"
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center text-white"
          onClick={(e) => e.stopPropagation()}
          aria-label="Yêu thích"
        >
          <FiHeart className="w-4 h-4" />
        </button>

        {promo && (
          <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-[#ff5a00] text-white text-xs font-bold">
            {promo}
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="font-semibold text-[15px] leading-snug line-clamp-2">{name || slug}</h3>

        <div className="mt-1 flex items-center gap-1 text-xs">
          <div className="flex items-center gap-1">
            <FaStar className="w-3 h-3 text-[#fbbf24]" />
            <span className="font-semibold">{score}</span>
            <span className="text-gray-500">/10</span>
          </div>

          {ratingLabel && (
            <span className="ml-1 text-[11px] text-blue-600 font-semibold">{ratingLabel}</span>
          )}

          <span className="ml-1 text-[11px] text-gray-500">({reviews})</span>
        </div>

        {oldPriceText && <div className="mt-2 text-xs text-gray-400 line-through">{oldPriceText}</div>}
        <div className="text-[15px] font-bold text-[#ff5a00] mt-[2px]">{priceText}</div>
        <div className="text-[11px] text-gray-500 mt-1">Chưa bao gồm thuế và phí</div>
      </div>
    </div>
  );
}