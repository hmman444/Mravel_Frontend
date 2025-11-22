// src/features/catalog/components/hotel/HotelSimilarSection.jsx
import { useEffect, useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useCatalogHotels } from "../../../catalog/hooks/useCatalogHotels";

export default function HotelSimilarSection({ hotel }) {
  const scrollRef = useRef(null);
  const { items, loading, error, fetchHotels } = useCatalogHotels();

  const destinationSlug = hotel?.destinationSlug;
  const currentHotelId = hotel?.id;
  const currentHotelSlug = hotel?.slug;

  // gọi searchHotels theo destination hiện tại
  useEffect(() => {
    if (!destinationSlug) return;

    fetchHotels({
      // tuỳ backend bạn có thể đổi thành locationSlug / destinationId...
      location: destinationSlug,
      page: 0,
      size: 12,
    });
  }, [destinationSlug, fetchHotels]);

  // lọc bỏ chính nó ra khỏi danh sách (hook luôn được gọi, dù hotel null)
  const similarHotels = useMemo(
    () =>
      (items || []).filter((h) => {
        if (!currentHotelId && !currentHotelSlug) return true;
        const sameId = currentHotelId && h.id === currentHotelId;
        const sameSlug = currentHotelSlug && h.slug === currentHotelSlug;
        return !sameId && !sameSlug;
      }),
    [items, currentHotelId, currentHotelSlug]
  );

  const noOtherHotels =
    !loading && !error && (!similarHotels || similarHotels.length === 0);

  const title = "Các lựa chọn phổ biến khác";
  const subtitle =
    "Dưới đây là một số khách sạn tương tự với khoảng giá và khu vực giống như khách sạn bạn đang xem.";

  const scroll = (direction) => {
    const node = scrollRef.current;
    if (!node) return;
    const delta = node.clientWidth * 0.8 * direction;
    node.scrollBy({ left: delta, behavior: "smooth" });
  };

  // guard SAU khi đã gọi hết hooks → không còn lỗi rules-of-hooks
  if (!hotel || !destinationSlug) return null;

  return (
    <section className="mt-0 border border-gray-200 bg-white">
      {/* HEADER */}
      <div className="flex items-baseline justify-between px-6 pt-5 pb-3">
        <div>
          <h2 className="text-base md:text-lg font-semibold text-gray-900">
            {title}
          </h2>
          <p className="mt-1 max-w-2xl text-xs text-gray-600 md:text-sm">
            {subtitle}
          </p>
        </div>
      </div>

      {/* BODY */}
      <div className="relative px-6 pb-5">
        {loading && (
          <p className="text-sm text-gray-500">Đang tải các gợi ý khác...</p>
        )}

        {error && !loading && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        {noOtherHotels && (
          <p className="text-sm text-gray-600">
            Hiện tại Mravel chưa có thêm khách sạn tương tự tại{" "}
            {hotel.cityName || "điểm đến này"}.
          </p>
        )}

        {!loading && !error && similarHotels.length > 0 && (
          <>
            {/* Nút trái */}
            <button
              type="button"
              onClick={() => scroll(-1)}
              className="absolute left-4 top-1/2 hidden -translate-y-1/2 rounded-full border border-gray-200 bg-white/90 p-2 shadow-sm hover:bg-gray-50 md:inline-flex"
            >
              <ChevronLeft className="h-4 w-4 text-gray-700" />
            </button>

            {/* LIST CARD */}
            <div
              ref={scrollRef}
              className="flex gap-4 overflow-x-auto scroll-smooth pb-1 md:pb-2"
            >
              {similarHotels.map((h) => (
                <MiniHotelCard key={h.id || h.slug} hotel={h} />
              ))}
            </div>

            {/* Nút phải */}
            <button
              type="button"
              onClick={() => scroll(1)}
              className="absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-full border border-gray-200 bg-white/90 p-2 shadow-sm hover:bg-gray-50 md:inline-flex"
            >
              <ChevronRight className="h-4 w-4 text-gray-700" />
            </button>

            {/* Link xem tất cả – tuỳ bạn xử lý điều hướng */}
            <div className="mt-2">
              <button
                type="button"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#0064d2] hover:underline"
              >
                Xem cơ sở lưu trú khác tại{" "}
                {hotel.cityName || hotel.destinationSlug}
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

/* ------- Mini card giống style Traveloka ------- */

function MiniHotelCard({ hotel }) {
  const img =
    Array.isArray(hotel.images) && hotel.images.length > 0
      ? hotel.images[0].url || hotel.images[0].src
      : null;

  const name = hotel.name;
  const district = hotel.districtName || hotel.areaName;
  const city = hotel.cityName;
  const rating = hotel.avgRating;
  const reviews = hotel.reviewsCount;
  const price = hotel.minNightlyPrice;
  const hasBreakfast = hotel.filterFacets?.hasBreakfastIncluded;

  const formatPriceVND = (value) => {
    if (!value && value !== 0) return "";
    try {
      return new Intl.NumberFormat("vi-VN").format(value) + " VND";
    } catch {
      return `${value} VND`;
    }
  };

  return (
    <div className="w-60 flex-shrink-0 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_2px_6px_rgba(15,23,42,0.06)]">
      {/* Ảnh */}
      <div className="h-36 w-full overflow-hidden bg-gray-200">
        {img && (
          <img
            src={img}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
        )}
      </div>

      {/* Nội dung */}
      <div className="px-3.5 pt-3 pb-3.5 text-xs">
        <p className="line-clamp-2 text-[13px] font-semibold text-gray-900">
          {name}
        </p>

        <div className="mt-1 flex items-center gap-1.5">
          {typeof rating === "number" && (
            <span className="inline-flex items-center gap-0.5 rounded-md bg-[#0a4abf] px-1.5 py-0.5 text-[11px] font-semibold text-white">
              <Star className="h-3 w-3 fill-white text-white" />
              {rating.toFixed(1)}
            </span>
          )}
          {typeof reviews === "number" && (
            <span className="text-[11px] text-gray-500">
              ({reviews} đánh giá)
            </span>
          )}
        </div>

        {(district || city) && (
          <p className="mt-1 text-[11px] text-gray-600">
            {district && <span>{district}</span>}
            {district && city && <span>, </span>}
            {city && <span>{city}</span>}
          </p>
        )}

        {hasBreakfast && (
          <p className="mt-0.5 text-[11px] text-emerald-600">✓ Có bữa sáng</p>
        )}

        {price && (
          <div className="mt-2">
            <p className="text-[11px] text-gray-500">Giá từ</p>
            <p className="text-sm font-semibold text-[#f97316]">
              {formatPriceVND(price)}
            </p>
            <p className="text-[10px] text-gray-400">
              Mỗi phòng mỗi đêm (đã bao gồm thuế & phí)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}