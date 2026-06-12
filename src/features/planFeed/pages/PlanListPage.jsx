"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  Compass,
  Search,
  X,
  SlidersHorizontal,
  Clock,
  TrendingUp,
  Trash2,
  Plus,
  Settings,
  Plane,
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import PlanPostCard from "../components/PlanPostCard";
import PostSkeleton from "../components/PostSkeleton";
import NewPlanModal from "../components/NewPlanModal";
import PlanFilterSidebar from "../components/PlanFilterSidebar";
import PlanFilterChips from "../components/PlanFilterChips";
import { usePlans } from "../hooks/usePlans";
import FadeInSection from "../../../components/FadeInSection";
import { DEFAULT_FILTERS } from "../slices/planSlice";


const SEARCH_HISTORY_KEY = "mravel_plan_searches";

const TRENDING_KEYWORDS = [
  "Đà Lạt cuối tuần",
  "Sapa trekking 3 ngày",
  "Hội An phố cổ",
  "Phú Quốc lặn biển",
  "Hà Nội ẩm thực",
  "Đà Nẵng biển Mỹ Khê",
];

// Inline highlight component for suggestion dropdown
function HighlightText({ text, query }) {
  if (!query || !text) return <>{text}</>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = String(text).split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className="bg-sky-100 dark:bg-sky-800/50 text-sky-800 dark:text-sky-200 rounded-sm px-0.5 not-italic font-semibold"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

//  Main component 
export default function PlanListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [openNew, setOpenNew] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [draftFilters, setDraftFilters] = useState(DEFAULT_FILTERS);

  // Suggestion state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || "[]");
    } catch {
      return [];
    }
  });

  const searchWrapperRef = useRef(null);
  const userTypingRef = useRef(false);
  const prevDebRef = useRef("");

  const { user } = useSelector((s) => s.auth);
  const {
    items,
    loading,
    hasMore,
    fetchNext,
    reload,
    isSearching,
    searchQuery,
    searchLoading,
    searchPlans,
    searchUsers,
    searchMeta,
    doSearch,
    loadMoreSearch,
    resetSearch,
    activeFilters,
    activeFilterCount,
    filterSidebarOpen,
    updateFilters,
    clearFilters,
    openFilterSidebar,
    closeFilterSidebar,
  } = usePlans();

  const loadMoreRef = useRef(null);
  const searchLoadMoreRef = useRef(null);
  const ignoreNextUrlSyncRef = useRef(false);
  const prevModeRef = useRef(searchParams.get("mode") || "");

  const urlMode = searchParams.get("mode") || "";
  const urlQuery = (searchParams.get("query") || "").trim();


  //  Search history helpers 
  const saveSearchHistory = useCallback((q) => {
    if (!q.trim()) return;
    setRecentSearches((prev) => {
      const next = [q, ...prev.filter((s) => s !== q)].slice(0, 6);
      try {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(next));
      } catch {
        // Silently fail if localStorage is blocked
      }
      return next;
    });
  }, []);

  const clearSearchHistory = useCallback(() => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch {
      // Silently fail if localStorage is blocked
    }
  }, []);

  // Keep draftFilters in sync when sidebar opens
  useEffect(() => {
    if (filterSidebarOpen) setDraftFilters(activeFilters);
  }, [filterSidebarOpen, activeFilters]);

  //  Core search trigger ─
  const triggerSearch = useCallback(
    (q, filters) => {
      const resolvedFilters = filters || activeFilters;
      if (!q && activeFilterCount === 0 && !filters) return;
      setSearchParams({ mode: "search", query: q });
      doSearch(q, resolvedFilters);
      setShowSuggestions(false);
      userTypingRef.current = false;
    },
    [activeFilterCount, setSearchParams, doSearch, activeFilters]
  );

  const handleSearch = useCallback(() => {
    const q = (keyword || "").trim();
    saveSearchHistory(q);
    triggerSearch(q, activeFilters);
  }, [keyword, activeFilters, triggerSearch, saveSearchHistory]);


  //  Clear all ─
  const clear = useCallback(() => {
    ignoreNextUrlSyncRef.current = true;
    setSearchParams({});
    setKeyword("");
    userTypingRef.current = false;
    prevDebRef.current = "";
    resetSearch();
    clearFilters();
    setShowSuggestions(false);
  }, [setSearchParams, resetSearch, clearFilters]);

  //  Apply filters from sidebar 
  const handleApplyFilters = useCallback(
    (newFilters) => {
      updateFilters(newFilters);
      setDraftFilters(newFilters);
      const q = (keyword || "").trim();
      setSearchParams({ mode: "search", query: q });
      doSearch(q, newFilters);
    },
    [keyword, updateFilters, setSearchParams, doSearch]
  );

  //  Remove single filter chip ─
  const handleRemoveChip = useCallback(
    (key, value) => {
      let next = { ...activeFilters };
      if (key === "budget") {
        next.budgetMin = "";
        next.budgetMax = "";
      } else if (key === "days") {
        next.daysMin = "";
        next.daysMax = "";
      } else if (key === "dates") {
        next.startDateFrom = "";
        next.startDateTo = "";
      } else if (key === "destinations") {
        next.destinations = (next.destinations || []).filter((d) => d !== value);
      } else if (key === "sortBy") {
        next.sortBy = "RELEVANCE";
      }
      updateFilters(next);
      doSearch((keyword || "").trim(), next);
    },
    [activeFilters, keyword, updateFilters, doSearch]
  );

  //  Click outside closes suggestions ─
  useEffect(() => {
    const handler = (e) => {
      if (
        searchWrapperRef.current &&
        !searchWrapperRef.current.contains(e.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  //  URL sync 
  useEffect(() => {
    if (ignoreNextUrlSyncRef.current) {
      ignoreNextUrlSyncRef.current = false;
      return;
    }
    if (urlMode !== "search") {
      if (isSearching) resetSearch();
      return;
    }
    if (urlQuery) {
      if (!userTypingRef.current && (keyword || "").trim() !== urlQuery) {
        setKeyword(urlQuery);
      }
      if (((searchQuery || "").trim() || "") !== urlQuery) {
        doSearch(urlQuery, activeFilters);
      }
    } else {
      if (isSearching) resetSearch();
    }
  }, [urlMode, urlQuery, isSearching, searchQuery, doSearch, resetSearch, keyword, activeFilters]);

  // Reload feed when leaving search mode
  useEffect(() => {
    const prev = prevModeRef.current;
    if (prev === "search" && urlMode !== "search") reload();
    prevModeRef.current = urlMode;
  }, [urlMode, reload]);

  // Initial load - Reset on refresh
  useEffect(() => {
    if (!user?.id || initialLoaded) return;

    const mode = searchParams.get("mode");
    if (mode === "search") {
      // Clear URL and local state on refresh
      setSearchParams({}, { replace: true });
      setKeyword("");
      resetSearch();
      clearFilters();
      setShowSuggestions(false);
      userTypingRef.current = false;
    }

    reload();
    setInitialLoaded(true);
  }, [user?.id, initialLoaded, searchParams, reload, setSearchParams, resetSearch, clearFilters]);

  // Infinite scroll — regular feed
  useEffect(() => {
    if (isSearching || !hasMore) return;
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore) fetchNext();
      },
      { rootMargin: "260px 0px", threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, fetchNext, isSearching]);

  // Infinite scroll — search results (cursor-based)
  useEffect(() => {
    if (!isSearching || !searchMeta?.hasMore) return;
    const el = searchLoadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !searchLoading && searchMeta?.hasMore) {
          loadMoreSearch();
        }
      },
      { rootMargin: "260px 0px", threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isSearching, searchMeta?.hasMore, searchLoading, loadMoreSearch]);

  //  Suggestions data 
  const suggestions = useMemo(() => {
    const q = keyword.toLowerCase();
    if (!q) {
      return {
        recent: recentSearches.slice(0, 5),
        trending: TRENDING_KEYWORDS.slice(0, 4),
      };
    }
    return {
      recent: recentSearches
        .filter((s) => s.toLowerCase().includes(q))
        .slice(0, 4),
      trending: TRENDING_KEYWORDS.filter((s) =>
        s.toLowerCase().includes(q)
      ).slice(0, 3),
    };
  }, [keyword, recentSearches]);

  const hasSuggestions =
    suggestions.recent.length > 0 || suggestions.trending.length > 0;

  const selectSuggestion = useCallback(
    (s) => {
      setKeyword(s);
      userTypingRef.current = false;
      saveSearchHistory(s.trim());
      triggerSearch(s.trim(), activeFilters);
    },
    [activeFilters, triggerSearch, saveSearchHistory]
  );

  //  Display data 
  const displayPlans = useMemo(
    () => (isSearching ? searchPlans || [] : items || []),
    [isSearching, searchPlans, items]
  );

  const displayLoading = isSearching ? searchLoading : loading;

  const isEmpty = !displayLoading && displayPlans.length === 0 && !isSearching;

  const isSearchEmpty =
    isSearching &&
    !searchLoading &&
    (searchPlans?.length || 0) === 0 &&
    (searchUsers?.length || 0) === 0;

  //  Render 
  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] dark:bg-gray-950">
      <Navbar />

      <main className="flex-1 w-full mx-auto pt-24 pb-16 px-3 sm:px-4 max-w-5xl">

        {/*  Main layout (Sidebar + Content Column)  */}
        <div className="flex flex-col lg:flex-row items-start justify-center gap-0 lg:gap-0">
          
          <PlanFilterSidebar
            open={filterSidebarOpen}
            onClose={closeFilterSidebar}
            filters={draftFilters}
            onChange={setDraftFilters}
            onApply={handleApplyFilters}
            onReset={() => {
              clearFilters();
              setDraftFilters(DEFAULT_FILTERS);
              closeFilterSidebar();
              doSearch((keyword || "").trim(), DEFAULT_FILTERS);
            }}
            activeCount={activeFilterCount}
            loading={searchLoading}
          />

          {/*  Content column (Search + Feed)  */}
          <div
            className={`
              w-full min-w-0 max-w-2xl
              lg:mx-auto
              transition-transform duration-300 ease-out
              ${filterSidebarOpen ? "lg:translate-x-20" : "lg:translate-x-0"}
            `}
          >
            <FadeInSection delay={0} className="relative z-20">
              <section className="mb-6">

            {/* Title row */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-50 tracking-tight">
                  {t('feed.title')}
                </h1>
                <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400 max-w-lg">
                  {t('feed.subtitle')}
                </p>
              </div>

              {/* Desktop action buttons */}
              <div className="hidden sm:flex items-center gap-2 shrink-0 pt-1">
                <span className="px-3 py-1.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t('feed.planCount', { count: displayPlans.length })}
                </span>
                {user && (
                  <>
                    <button
                      onClick={() => setOpenNew(true)}
                      className="inline-flex items-center gap-1.5 text-sm px-4 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150"
                    >
                      <Plus className="w-4 h-4" />
                      {t('feed.createNew')}
                    </button>
                    <Link
                      to="/plans/my-plans"
                      className="inline-flex items-center gap-1.5 text-sm px-4 py-1.5 rounded-xl border-2 border-sky-400 text-sky-600 dark:text-sky-400 bg-white dark:bg-gray-900 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-all duration-150 font-semibold"
                    >
                      <Settings className="w-4 h-4" />
                      {t('feed.manage')}
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/*  Prominent search bar  */}
            <div className="mt-6 relative z-10" ref={searchWrapperRef}>
              <div className="relative">
                {/* Input row */}
                <div
                  className={`
                    flex items-center h-14 rounded-2xl
                    bg-white dark:bg-gray-900
                    border-2 transition-all duration-200
                    px-4 gap-3 shadow-sm
                    ${
                      showSuggestions && hasSuggestions
                        ? "border-sky-500 ring-4 ring-sky-500/10 rounded-b-none shadow-lg"
                        : "border-gray-200 dark:border-gray-700 hover:border-sky-300 dark:hover:border-sky-600 hover:shadow-md focus-within:border-sky-500 focus-within:ring-4 focus-within:ring-sky-500/10 focus-within:shadow-md"
                    }
                  `}
                >
                  <Search className="w-5 h-5 text-gray-400 shrink-0" />

                  <input
                    value={keyword}
                    onChange={(e) => {
                      userTypingRef.current = true;
                      setKeyword(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSearch();
                        setShowSuggestions(false);
                      }
                      if (e.key === "Escape") {
                        setShowSuggestions(false);
                        if (isSearching) clear();
                      }
                    }}
                    placeholder={t('feed.searchPlaceholder')}
                    autoComplete="off"
                    className="flex-1 h-full bg-transparent text-[15px] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none"
                  />

                  {/* Clear keyword button */}
                  {keyword && (
                    <button
                      type="button"
                      onClick={() => {
                        if (isSearching) clear();
                        else {
                          setKeyword("");
                          userTypingRef.current = false;
                          prevDebRef.current = "";
                        }
                      }}
                      className="shrink-0 w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
                    >
                      <X className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                  )}

                  {/* Search button */}
                  <button
                    type="button"
                    onClick={handleSearch}
                    disabled={searchLoading}
                    className="
                      shrink-0 h-10 px-5 rounded-xl
                      bg-gradient-to-r from-sky-500 to-blue-600
                      text-white text-sm font-semibold
                      shadow hover:shadow-lg hover:from-sky-600 hover:to-blue-700
                      hover:-translate-y-0.5 active:translate-y-0
                      transition-all duration-150
                      disabled:opacity-70 disabled:cursor-not-allowed
                      flex items-center gap-2 whitespace-nowrap
                    "
                  >
                    {searchLoading ? (
                      <svg
                        className="w-4 h-4 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline">{t('common.search')}</span>
                  </button>
                </div>

                {/*  Suggestion dropdown  */}
                {showSuggestions && hasSuggestions && (
                  <div className="absolute left-0 right-0 top-full z-50 bg-white dark:bg-gray-900 border-2 border-t-0 border-sky-500 rounded-b-2xl shadow-xl overflow-hidden">
                    {/* Recent searches */}
                    {suggestions.recent.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between px-4 pt-3 pb-1">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                            <Clock className="w-3 h-3" /> {t('feed.search.recent')}
                          </span>
                          <button
                            type="button"
                            onClick={clearSearchHistory}
                            className="text-[11px] text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" /> {t('common.delete')}
                          </button>
                        </div>
                        {suggestions.recent.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => selectSuggestion(s)}
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-sky-50 dark:hover:bg-sky-900/20 flex items-center gap-3 transition-colors group/item"
                          >
                            <Clock className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover/item:text-sky-400 shrink-0 transition-colors" />
                            <HighlightText text={s} query={keyword} />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Trending keywords */}
                    {suggestions.trending.length > 0 && (
                      <div
                        className={
                          suggestions.recent.length > 0
                            ? "border-t border-gray-100 dark:border-gray-800"
                            : ""
                        }
                      >
                        <div className="px-4 pt-3 pb-1">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                            <TrendingUp className="w-3 h-3" /> {t('feed.search.trending')}
                          </span>
                        </div>
                        {suggestions.trending.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => selectSuggestion(s)}
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-sky-50 dark:hover:bg-sky-900/20 flex items-center gap-3 transition-colors group/item"
                          >
                            <TrendingUp className="w-4 h-4 text-sky-300 dark:text-sky-700 group-hover/item:text-sky-500 shrink-0 transition-colors" />
                            <HighlightText text={s} query={keyword} />
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="h-2" />
                  </div>
                )}
              </div>
            </div>

            {/*  Filter toggle + search status bar  */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => filterSidebarOpen ? closeFilterSidebar() : openFilterSidebar()}
                className={`
                  inline-flex items-center gap-2 h-9 px-4 rounded-xl border-2 text-sm font-semibold transition-all duration-150
                  ${
                    activeFilterCount > 0
                      ? "border-sky-500 bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 shadow-sm"
                      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:border-sky-400 hover:text-sky-600"
                  }
                `}
              >
                <SlidersHorizontal className="w-4 h-4" />
                {t('feed.filter.title')}
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-sky-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {isSearching && (
                <>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {t('feed.search.resultsLabel')}{" "}
                    <strong className="text-gray-800 dark:text-gray-200">
                      &ldquo;{searchQuery}&rdquo;
                    </strong>
                  </span>
                </>
              )}
            </div>

            {/* Active filter chips */}
            <PlanFilterChips
              filters={activeFilters}
              activeCount={activeFilterCount}
              onRemove={handleRemoveChip}
              onOpenFilter={openFilterSidebar}
            />
          </section>
        </FadeInSection>

            {/*  Results feed  */}
            <div className="min-w-0">

            {/* Search users section */}
            {isSearching &&
              !searchLoading &&
              (searchUsers?.length || 0) > 0 && (
                <FadeInSection delay={80}>
                  <div className="mb-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/70 p-5">
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                      {t('feed.search.users')}
                      <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">
                        ({searchUsers.length})
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {searchUsers.map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => navigate(`/profile/${u.id}`)}
                          className="flex items-center gap-3 text-left p-3 rounded-xl border-2 border-gray-100 dark:border-gray-800 hover:border-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-all duration-150"
                        >
                          <img
                            src={
                              u.avatar ||
                              "https://static.vecteezy.com/system/resources/thumbnails/009/734/564/small/default-avatar-profile-icon-of-social-media-user-vector.jpg"
                            }
                            alt={u.fullname || "user"}
                            className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src =
                                "https://static.vecteezy.com/system/resources/thumbnails/009/734/564/small/default-avatar-profile-icon-of-social-media-user-vector.jpg";
                            }}
                          />
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                              {u.fullname || t('feed.search.unnamedUser')}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              @{u.username || u.email || `user-${u.id}`}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </FadeInSection>
              )}

            {/*  Empty feed state  */}
            {isEmpty && !displayLoading ? (
              <FadeInSection delay={200}>
                <div className="mt-16 flex flex-col items-center text-center py-12">
                  <div className="relative mb-6">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-sky-100 to-blue-100 dark:from-sky-900/40 dark:to-blue-900/40 flex items-center justify-center">
                      <Compass className="w-12 h-12 text-sky-500" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-sky-400 flex items-center justify-center shadow-md">
                      <Plane className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {t('feed.empty.title')}
                  </h2>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                    {t('feed.empty.subtitle')}
                  </p>
                  {user && (
                    <button
                      onClick={() => setOpenNew(true)}
                      className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-150"
                    >
                      <Plus className="w-4 h-4" />
                      {t('feed.empty.createFirst')}
                    </button>
                  )}
                </div>
              </FadeInSection>
            ) : isSearchEmpty ? (
              /*  Search empty state ─ */
              <FadeInSection delay={120}>
                <div className="mt-12 flex flex-col items-center text-center py-12">
                  <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-5">
                    <Search className="w-9 h-9 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {t('feed.searchEmpty.title')}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                    {t('feed.searchEmpty.hintBefore')}{" "}
                    <span className="font-semibold text-sky-600 dark:text-sky-400">
                      @username
                    </span>
                    {t('feed.searchEmpty.hintAfter')}
                  </p>

                  {/* Trending suggestions */}
                  <div className="mt-5 flex flex-wrap justify-center gap-2">
                    {TRENDING_KEYWORDS.slice(0, 4).map((kw) => (
                      <button
                        key={kw}
                        type="button"
                        onClick={() => selectSuggestion(kw)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-colors font-medium"
                      >
                        {kw}
                      </button>
                    ))}
                  </div>

                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        clearFilters();
                        doSearch((keyword || "").trim(), DEFAULT_FILTERS);
                      }}
                      className="mt-4 inline-flex items-center gap-2 text-sm text-rose-600 dark:text-rose-400 font-semibold hover:underline transition-colors"
                    >
                      <X className="w-4 h-4" />
                      {t('feed.filter.clearAll')}
                    </button>
                  )}
                </div>
              </FadeInSection>
            ) : (
              /*  Results feed (Facebook-style)  */
              <>
                <div className="flex flex-col gap-5">
                  {displayPlans.map((p, i) => (
                    <FadeInSection key={p.id} delay={Math.min(i * 60, 360)}>
                      <PlanPostCard
                        plan={p}
                        me={user}
                        onOpenDetail={() => navigate(`/plans/${p.id}`)}
                      />
                    </FadeInSection>
                  ))}

                  {/* Skeleton loading for initial search or load-more */}
                  {displayLoading &&
                    Array.from({ length: 3 }).map((_, i) => (
                      <PostSkeleton key={`sk-${i}`} />
                    ))}
                </div>

                {/* Infinite scroll sentinel — regular feed */}
                {!isSearching && hasMore && (
                  <div ref={loadMoreRef} className="h-8 w-full" />
                )}

                {!isSearching && !hasMore && items.length > 0 && (
                  <FadeInSection delay={200}>
                    <p className="py-8 text-center text-sm text-gray-400 dark:text-gray-500 font-medium">
                      {t('feed.endOfFeed')}
                    </p>
                  </FadeInSection>
                )}

                {/* Infinite scroll sentinel — search results */}
                {isSearching && searchMeta?.hasMore && (
                  <div ref={searchLoadMoreRef} className="h-8 w-full" />
                )}

                {isSearching && !searchMeta?.hasMore && searchPlans.length > 0 && (
                  <FadeInSection delay={200}>
                    <p className="py-8 text-center text-sm text-gray-400 dark:text-gray-500 font-medium">
                      {t('feed.endOfSearchResults')}
                    </p>
                  </FadeInSection>
                )}
              </>
            )}
            </div>
          </div>
        </div>
      </main>

      <NewPlanModal
        open={openNew}
        onClose={() => setOpenNew(false)}
        onCreated={() => reload()}
      />
      <Footer />
    </div>
  );
}
