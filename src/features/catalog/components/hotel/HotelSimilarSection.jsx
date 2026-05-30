import { useEffect, useMemo, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FaMapMarkerAlt, FaStar } from "react-icons/fa";
import { FiHeart } from "react-icons/fi";
import FavoriteButton from "../../../../components/FavoriteButton";
import { useCatalogHotels } from "../../../catalog/hooks/useCatalogHotels";

/* = ảnh fallback: nên đổi về ảnh local của bạn (public/...) = */
const FALLBACK_IMG =
  "/images/placeholders/hotel.jpg"; // tạo file này trong public

function pickHotelImageUrl(hotel) {
  const url =
    hotel?.cover ||
    hotel?.coverImageUrl ||
    hotel?.mainImageUrl ||
    hotel?.thumbnailUrl ||
    hotel?.thumbnail ||
    (Array.isArray(hotel?.images) && (hotel.images.find((x) => x?.cover)?.url || hotel.images[0]?.url)) ||
    (Array.isArray(hotel?.images) && (hotel.images.find((x) => x?.cover)?.src || hotel.images[0]?.src)) ||
    null;

  return url || FALLBACK_IMG;
}

export default function HotelSimilarSection({ hotel }) {
  const { t } = useTranslation();
  const scrollRef = useRef(null);
  const navigate = useNavigate();
  const { items, loading, error, fetchHotels } = useCatalogHotels();

  const destinationSlug = hotel?.destinationSlug;
  const currentHotelId = hotel?.id;
  const currentHotelSlug = hotel?.slug;

  useEffect(() => {
    if (!destinationSlug) return;

    fetchHotels({
      location: destinationSlug,
      page: 0,
      size: 12,
    });
  }, [destinationSlug, fetchHotels]);

  const similarHotels = useMemo(() => {
    const arr = items || [];
    return arr.filter((h) => {
      if (!currentHotelId && !currentHotelSlug) return true;
      const sameId = currentHotelId && h.id === currentHotelId;
      const sameSlug = currentHotelSlug && h.slug === currentHotelSlug;
      return !sameId && !sameSlug;
    });
  }, [items, currentHotelId, currentHotelSlug]);

  const scroll = (direction) => {
    const node = scrollRef.current;
    if (!node) return;
    const delta = node.clientWidth * 0.85 * direction;
    node.scrollBy({ left: delta, behavior: "smooth" });
  };

  const goDetail = useCallback(
    (slug) => {
      if (!slug) return;
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
      navigate(`/hotels/${encodeURIComponent(slug)}`);
    },
    [navigate]
  );

  if (!hotel || !destinationSlug) return null;

  const noOtherHotels =
    !loading && !error && (!similarHotels || similarHotels.length === 0);

  return (
    <section className="mt-0 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      {/* HEADER */}
      <div className="flex items-baseline justify-between px-6 pt-5 pb-3">
        <div>
          <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('hotel.similar_section_title')}
          </h2>
          <p className="mt-1 max-w-2xl text-xs text-gray-600 dark:text-gray-400 md:text-sm">
            {t('hotel.similar_section_subtitle')}
          </p>
        </div>
      </div>

      {/* BODY */}
      <div className="relative px-6 pb-5">
        {loading && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('hotel.loading_suggestions')}</p>
        )}

        {error && !loading && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        {noOtherHotels && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('hotel.no_similar_hotels', {
              location: hotel.cityName || t('hotel.this_destination'),
            })}
          </p>
        )}

        {!loading && !error && similarHotels.length > 0 && (
          <>
            {/* overlay không chặn click list */}
            <div className="pointer-events-none absolute inset-y-0 left-0 right-0 z-10">
              <button
                type="button"
                onClick={() => scroll(-1)}
                className="pointer-events-auto absolute left-4 top-1/2 hidden -translate-y-1/2 rounded-full border border-gray-200 dark:border-gray-700 bg-white/90 p-2 shadow-sm hover:bg-gray-50 md:inline-flex"
              >
                <ChevronLeft className="h-4 w-4 text-gray-700 dark:text-gray-300" />
              </button>

              <button
                type="button"
                onClick={() => scroll(1)}
                className="pointer-events-auto absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-full border border-gray-200 dark:border-gray-700 bg-white/90 p-2 shadow-sm hover:bg-gray-50 md:inline-flex"
              >
                <ChevronRight className="h-4 w-4 text-gray-700 dark:text-gray-300" />
              </button>
            </div>

            {/* LIST */}
            <div
              ref={scrollRef}
              className="relative z-0 flex gap-4 overflow-x-auto scroll-smooth pb-2"
            >
              {similarHotels.map((h) => (
                <SimilarHotelCard
                  key={h.id || h.slug}
                  hotel={h}
                  onClick={() => goDetail(h.slug)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

/*  Card giống HotelMiniCard (grid) nhưng dùng cho slider  */
function SimilarHotelCard({ hotel, onClick }) {
  const { t } = useTranslation();
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
  const promo = promoLabel || (promoPercent ? t('hotel.save_percent', { percent: promoPercent }) : null);

  const priceText =
    price && price > 0
      ? price.toLocaleString("vi-VN") + ` ${currencyCode || "VND"}`
      : t('hotel.price_updating');

  const oldPriceText =
    oldPrice && oldPrice > 0
      ? oldPrice.toLocaleString("vi-VN") + ` ${currencyCode || "VND"}`
      : null;

  const score = typeof avgRating === "number" ? avgRating.toFixed(1) : "--";
  const reviews = reviewsCount ?? 0;

  const imageUrl = pickHotelImageUrl(hotel);

  return (
    <div
      className="w-[280px] flex-shrink-0 rounded-2xl overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm cursor-pointer hover:shadow-md transition"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") onClick?.();
      }}
    >
      <div className="relative h-40 bg-gray-200 dark:bg-gray-700">
        <img
          src={imageUrl}
          alt={name || slug}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = FALLBACK_IMG; //  fix ảnh lỗi triệt để
          }}
        />

        {locationLabel && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full bg-black/70 text-white text-xs font-semibold">
            <FaMapMarkerAlt className="w-3 h-3" />
            <span className="line-clamp-1">{locationLabel}</span>
          </div>
        )}

        <FavoriteButton
          targetType="HOTEL"
          targetId={hotel.id}
          className="absolute top-2 right-2 w-7 h-7"
        />

        {promo && (
          <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-[#ff5a00] text-white text-xs font-bold">
            {promo}
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="font-semibold text-[15px] leading-snug line-clamp-2">
          {name || slug}
        </h3>

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

          <span className="ml-1 text-[11px] text-gray-500 dark:text-gray-400">({reviews})</span>
        </div>

        {oldPriceText && (
          <div className="mt-2 text-xs text-gray-400 line-through">
            {oldPriceText}
          </div>
        )}
        <div className="text-[15px] font-bold text-[#ff5a00] mt-[2px]">
          {priceText}
        </div>
        <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
          {t('hotel.price_excludes_taxes_fees')}
        </div>
      </div>
    </div>
  );
}
