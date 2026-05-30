import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaMapMarkerAlt, FaStar } from "react-icons/fa";

import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import PlaceFacetPanel from "../components/place/PlaceFacetPanel";
import { searchPlacesFaceted } from "../slices/catalogSlice";
import i18n from "../../../i18n";

const PRICE_LEVEL_LABELS = {
  FREE: i18n.t("place.price_level_free"),
  CHEAP: i18n.t("place.price_level_cheap"),
  MODERATE: i18n.t("place.price_level_moderate"),
  EXPENSIVE: i18n.t("place.price_level_expensive"),
  LUXURY: i18n.t("place.price_level_luxury"),
};

const EMPTY_FILTERS = { categorySlugs: [], priceLevel: null, venueTypes: [] };

export default function PlaceFacetedSearchPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [sp, setSearchParams] = useSearchParams();

  const q = (sp.get("q") || "").trim();
  const page = Math.max(0, parseInt(sp.get("page") || "0", 10) || 0);

  const [inputQ, setInputQ] = useState(q);
  const [selectedFilters, setSelectedFilters] = useState(EMPTY_FILTERS);

  const { results, totalHits, totalPages, facets, loading, error } = useSelector(
    (s) => s.catalog.placeFaceted
  );

  const buildParams = useCallback(
    () => ({
      page,
      size: 10,
      ...(q ? { q } : {}),
      ...(selectedFilters.categorySlugs.length ? { categorySlugs: selectedFilters.categorySlugs } : {}),
      ...(selectedFilters.priceLevel ? { priceLevel: selectedFilters.priceLevel } : {}),
      ...(selectedFilters.venueTypes?.length ? { venueTypes: selectedFilters.venueTypes } : {}),
    }),
    [q, page, selectedFilters]
  );

  useEffect(() => {
    dispatch(searchPlacesFaceted(buildParams()));
  }, [dispatch, buildParams]);

  // Sync search input when URL changes (e.g., browser back/forward)
  useEffect(() => {
    setInputQ(q);
  }, [q]);

  const handleFilterChange = (newFilters) => {
    setSelectedFilters(newFilters);
    const nx = new URLSearchParams(sp);
    nx.set("page", "0");
    setSearchParams(nx, { replace: true });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = inputQ.trim();
    const nx = new URLSearchParams(sp);
    nx.set("q", trimmed);
    nx.set("page", "0");
    setSearchParams(nx, { replace: true });
    setSelectedFilters(EMPTY_FILTERS);
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
        {/* Search bar */}
        <form onSubmit={handleSearch} className="mb-6 flex gap-2">
          <input
            value={inputQ}
            onChange={(e) => setInputQ(e.target.value)}
            placeholder={t("place.search_placeholder")}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-orange-400"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition"
          >
            {t("common.search")}
          </button>
        </form>

        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {q ? t("place.results_for", { q }) : t("place.explore_places")}
            </h1>
            {!loading && totalHits > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {t("place.results_count", { count: totalHits.toLocaleString("vi-VN") })}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-6 items-start">
          {/* Facet panel */}
          <aside className="hidden lg:block w-64 shrink-0 sticky top-[72px]">
            <PlaceFacetPanel
              facets={facets}
              selectedFilters={selectedFilters}
              onChange={handleFilterChange}
            />
          </aside>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {[...Array(9)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            )}

            {!loading && error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}

            {!loading && !error && results.length === 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("place.no_results")}
              </p>
            )}

            {!loading && !error && results.length > 0 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {results.map((place) => (
                    <PlaceCard
                      key={place.slug ?? place.id}
                      place={place}
                      onClick={() => navigate(`/place/${place.slug}`)}
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
                      {t("common.prev_page")}
                    </button>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t("place.page_label")} <b>{page + 1}</b> / {totalPages}
                    </span>
                    <button
                      className="px-4 py-2 rounded-full text-sm font-semibold border border-gray-300 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => setPage(page + 1)}
                      disabled={page + 1 >= totalPages}
                    >
                      {t("common.next_page")}
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

function PlaceCard({ place, onClick }) {
  const {
    name, slug, addressLine, provinceName,
    avgRating, reviewsCount, priceLevel, coverImageUrl,
  } = place || {};

  const locationLabel = provinceName || addressLine || "";
  const score = typeof avgRating === "number" ? avgRating.toFixed(1) : "--";
  const imageUrl =
    coverImageUrl ||
    "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&q=80&auto=format&fit=crop";

  return (
    <div
      className="rounded-2xl overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm cursor-pointer hover:shadow-md transition"
      onClick={onClick}
    >
      <div className="relative h-44">
        <img
          src={imageUrl}
          alt={name || slug}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {locationLabel && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full bg-black/70 text-white text-xs font-semibold">
            <FaMapMarkerAlt className="w-3 h-3" />
            <span className="line-clamp-1">{locationLabel}</span>
          </div>
        )}
        {priceLevel && priceLevel !== "FREE" && (
          <div className="absolute top-2 right-2 px-2 py-1 rounded bg-black/60 text-white text-xs font-semibold">
            {PRICE_LEVEL_LABELS[priceLevel] ?? priceLevel}
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="font-semibold text-[15px] leading-snug line-clamp-2">{name || slug}</h3>
        {addressLine && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{addressLine}</p>
        )}
        <div className="mt-2 flex items-center gap-1 text-xs">
          <FaStar className="w-3 h-3 text-[#fbbf24]" />
          <span className="font-semibold">{score}</span>
          {reviewsCount != null && (
            <span className="text-gray-500 dark:text-gray-400 ml-0.5">({reviewsCount})</span>
          )}
        </div>
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
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/3 mt-2" />
      </div>
    </div>
  );
}
