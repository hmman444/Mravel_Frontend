import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaMapMarkerAlt, FaStar } from "react-icons/fa";

import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import DynamicFacetPanel from "../components/hotel/DynamicFacetPanel";
import { searchHotelsFaceted } from "../slices/catalogSlice";

const PRICE_RANGE_TO_FILTER = {
  UNDER_500K: { minPrice: null, maxPrice: 500000 },
  "500K_1M":  { minPrice: 500000, maxPrice: 1000000 },
  "1M_2M":    { minPrice: 1000000, maxPrice: 2000000 },
  OVER_2M:    { minPrice: 2000000, maxPrice: null },
};

const EMPTY_FILTERS = { starRatings: [], hotelTypes: [], amenities: [], priceRange: null };

export default function HotelFacetedSearchPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [sp, setSearchParams] = useSearchParams();

  const location = (sp.get("location") || "").trim();
  const destOnly = sp.get("destOnly") === "1";
  const page = Math.max(0, parseInt(sp.get("page") || "0", 10) || 0);

  const [selectedFilters, setSelectedFilters] = useState(EMPTY_FILTERS);

  const { results, totalHits, totalPages, facets, loading, error } = useSelector(
    (s) => s.catalog.hotelFaceted
  );

  const buildParams = useCallback(() => {
    const priceFilter = selectedFilters.priceRange
      ? PRICE_RANGE_TO_FILTER[selectedFilters.priceRange] ?? {}
      : {};
    return {
      page,
      size: 10,
      ...(location ? { location } : {}),
      ...(destOnly ? { destOnly: true } : {}),
      ...(selectedFilters.starRatings.length
        ? { starRatings: selectedFilters.starRatings.map(Number) }
        : {}),
      ...(selectedFilters.hotelTypes.length ? { hotelTypes: selectedFilters.hotelTypes } : {}),
      ...(selectedFilters.amenities.length ? { amenities: selectedFilters.amenities } : {}),
      ...priceFilter,
    };
  }, [location, destOnly, page, selectedFilters]);

  useEffect(() => {
    if (!location) return;
    dispatch(searchHotelsFaceted(buildParams()));
  }, [dispatch, buildParams]);

  const handleFilterChange = (newFilters) => {
    setSelectedFilters(newFilters);
    const nx = new URLSearchParams(sp);
    nx.set("page", "0");
    setSearchParams(nx, { replace: true });
  };

  const setPage = (nextPage) => {
    const nx = new URLSearchParams(sp);
    nx.set("page", String(nextPage));
    setSearchParams(nx);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="h-[50px] md:h-[60px]" aria-hidden />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {location ? `Khách sạn tại "${location}"` : "Tìm kiếm khách sạn"}
            </h1>
            {totalHits > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {totalHits.toLocaleString("vi-VN")} kết quả
              </p>
            )}
          </div>
          <button
            type="button"
            className="text-sm text-blue-600 hover:underline"
            onClick={() => navigate("/hotels")}
          >
            Tìm kiếm mới
          </button>
        </div>

        <div className="flex gap-6 items-start">
          {/* Facet panel */}
          <aside className="hidden lg:block w-64 shrink-0 sticky top-[72px]">
            <DynamicFacetPanel
              facets={facets}
              selectedFilters={selectedFilters}
              onChange={handleFilterChange}
            />
          </aside>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {[...Array(9)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            )}

            {!loading && error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}

            {!loading && !error && results.length === 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Không có kết quả phù hợp. Thử điều chỉnh bộ lọc.
              </p>
            )}

            {!loading && !error && results.length > 0 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {results.map((hotel) => (
                    <HotelCard
                      key={hotel.slug ?? hotel.id}
                      hotel={hotel}
                      onClick={() => navigate(`/hotels/${hotel.slug}`)}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-3">
                    <button
                      className="px-4 py-2 rounded-full text-sm font-semibold border border-gray-300 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => setPage(page - 1)}
                      disabled={page <= 0}
                    >
                      Trước
                    </button>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Trang <b>{page + 1}</b> / {totalPages}
                    </span>
                    <button
                      className="px-4 py-2 rounded-full text-sm font-semibold border border-gray-300 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => setPage(page + 1)}
                      disabled={page + 1 >= totalPages}
                    >
                      Sau
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function HotelCard({ hotel, onClick }) {
  const {
    name, slug, cityName, districtName,
    avgRating, reviewsCount, ratingLabel,
    minNightlyPrice, currencyCode,
    referenceNightlyPrice, discountPercent,
    starRating,
  } = hotel || {};

  const locationLabel = districtName || cityName || "";
  const price = minNightlyPrice ?? 0;
  const oldPrice = referenceNightlyPrice ?? null;
  let promoPercent = discountPercent ?? null;
  if (!promoPercent && oldPrice && price && oldPrice > price) {
    promoPercent = Math.round(((oldPrice - price) / oldPrice) * 100);
  }

  const priceText = price > 0
    ? price.toLocaleString("vi-VN") + ` ${currencyCode || "VND"}`
    : "Giá đang cập nhật";

  const oldPriceText = oldPrice && oldPrice > 0
    ? oldPrice.toLocaleString("vi-VN") + ` ${currencyCode || "VND"}`
    : null;

  const score = typeof avgRating === "number" ? avgRating.toFixed(1) : "--";

  const imageUrl =
    hotel?.cover || hotel?.coverImageUrl || hotel?.mainImageUrl ||
    hotel?.thumbnailUrl || hotel?.thumbnail ||
    (hotel?.images?.[0]?.url) ||
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80&auto=format&fit=crop";

  return (
    <div
      className="rounded-2xl overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm cursor-pointer hover:shadow-md transition"
      onClick={onClick}
    >
      <div className="relative h-44">
        <img src={imageUrl} alt={name || slug} className="w-full h-full object-cover" loading="lazy" />

        {locationLabel && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full bg-black/70 text-white text-xs font-semibold">
            <FaMapMarkerAlt className="w-3 h-3" />
            <span className="line-clamp-1">{locationLabel}</span>
          </div>
        )}

        {promoPercent && (
          <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-[#ff5a00] text-white text-xs font-bold">
            -{promoPercent}%
          </div>
        )}
      </div>

      <div className="p-3">
        {starRating && (
          <div className="flex gap-0.5 mb-1">
            {Array.from({ length: starRating }).map((_, i) => (
              <FaStar key={i} className="w-3 h-3 text-yellow-400" />
            ))}
          </div>
        )}

        <h3 className="font-semibold text-[15px] leading-snug line-clamp-2">{name || slug}</h3>

        <div className="mt-1 flex items-center gap-1 text-xs">
          <div className="flex items-center gap-1">
            <FaStar className="w-3 h-3 text-[#fbbf24]" />
            <span className="font-semibold">{score}</span>
            <span className="text-gray-500 dark:text-gray-400">/10</span>
          </div>
          {ratingLabel && (
            <span className="ml-1 text-[11px] text-blue-600 font-semibold">{ratingLabel}</span>
          )}
          {reviewsCount != null && (
            <span className="ml-1 text-[11px] text-gray-500 dark:text-gray-400">({reviewsCount})</span>
          )}
        </div>

        {oldPriceText && (
          <div className="mt-2 text-xs text-gray-400 line-through">{oldPriceText}</div>
        )}
        <div className="text-[15px] font-bold text-[#ff5a00] mt-[2px]">{priceText}</div>
        <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">Chưa bao gồm thuế và phí</div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      <div className="h-44 bg-gray-200 dark:bg-gray-700 animate-pulse" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/3 mt-2" />
      </div>
    </div>
  );
}
