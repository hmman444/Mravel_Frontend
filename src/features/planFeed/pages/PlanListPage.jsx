"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useSelector } from "react-redux";
import { Compass, Search, X } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import PlanPostCard from "../components/PlanPostCard";
import PostSkeleton from "../components/PostSkeleton";
import NewPlanModal from "../components/NewPlanModal";
import { usePlans } from "../hooks/usePlans";

import FadeInSection from "../../../components/FadeInSection";

export default function PlanListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [openNew, setOpenNew] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);

  const [keyword, setKeyword] = useState("");

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
    doSearch,
    resetSearch,
  } = usePlans();

  const loadMoreRef = useRef(null);
  
  const urlMode = searchParams.get("mode") || "";
  const urlQuery = (searchParams.get("query") || "").trim();

  useEffect(() => {
    if (urlMode !== "search") return;

    if (urlQuery) {
      setKeyword(urlQuery);

      if (!isSearching || (searchQuery || "").trim() !== urlQuery) {
        doSearch(urlQuery);
      }
      return;
    }

    if (isSearching) {
      resetSearch();
    }
  }, [urlMode, urlQuery, isSearching, searchQuery, doSearch, resetSearch]);

  // Load 1 lần khi có user
  useEffect(() => {
    if (!user?.id || initialLoaded) return;

    // Nếu đang ở mode search và có query thì đừng reload feed
    const mode = searchParams.get("mode");
    const q = (searchParams.get("query") || "").trim();

    if (mode === "search" && q) {
      setInitialLoaded(true);
      return;
    }

    reload();
    setInitialLoaded(true);
  }, [user?.id, initialLoaded, searchParams, reload]);

  useEffect(() => {
    if (isSearching) return;
    if (!hasMore) return;

    const el = loadMoreRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          fetchNext();
        }
      },
      { rootMargin: "260px 0px", threshold: 0 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, fetchNext, isSearching]);

  // data hiển thị
  const displayPlans = useMemo(() => {
    if (isSearching) return searchPlans || [];
    return items || [];
  }, [isSearching, searchPlans, items]);

  const displayLoading = isSearching ? searchLoading : loading;

  const isEmpty = !displayLoading && displayPlans.length === 0 && !isSearching;

  const isSearchEmpty =
    isSearching && !searchLoading && (searchPlans?.length || 0) === 0 && (searchUsers?.length || 0) === 0;

  const handleSearch = () => {
    const q = (keyword || "").trim();
    if (!q) return;

    setSearchParams({ mode: "search", query: q });
  };

  const clear = () => {
    setKeyword("");
    resetSearch();
    setSearchParams({});
    reload();
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-sky-50 via-slate-50 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto pt-24 pb-16 px-3 sm:px-4">
        <FadeInSection delay={0}>
          <section className="mb-6">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-gray-50">
                  Bảng tin lịch trình
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Nơi chia sẻ và khám phá những lịch trình thú vị từ cộng đồng Mravel.
                </p>

                <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-2">
                  <div
                    className="
                      flex-1 flex items-center gap-2
                      h-11 rounded-full
                      bg-white/80 dark:bg-gray-900/70
                      border border-sky-200/70 dark:border-gray-800
                      shadow-sm
                      px-2
                    "
                  >
                    <input
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSearch();
                        if (e.key === "Escape" && isSearching) clear();
                      }}
                      placeholder='Tìm lịch trình hoặc người dùng... (vd: "Đà Nẵng", "@luan")'
                      className="
                        flex-1 h-full bg-transparent
                        px-3 text-sm
                        text-gray-900 dark:text-gray-100
                        placeholder:text-gray-400
                        focus:outline-none
                      "
                    />

                    <button
                      type="button"
                      title="Tìm kiếm"
                      onClick={handleSearch}
                      className="
                        h-9 px-4 rounded-full
                        bg-gradient-to-r from-sky-500 to-blue-600
                        text-white text-sm font-medium
                        shadow-sm hover:shadow-md
                        hover:-translate-y-0.5 transition
                        inline-flex items-center justify-center gap-2
                      "
                    >
                      <Search className="w-4 h-4" />
                      <span className="hidden sm:inline">Tìm</span>
                    </button>
                  </div>

                  {isSearching && (
                    <button
                      type="button"
                      onClick={clear}
                      className="
                        h-11 px-4 rounded-full
                        border border-sky-200/70 dark:border-gray-800
                        bg-white/80 dark:bg-gray-900/70
                        text-sm text-gray-700 dark:text-gray-200
                        hover:bg-sky-50 dark:hover:bg-sky-900/20
                        transition inline-flex items-center gap-2
                      "
                    >
                      <X className="w-4 h-4" />
                      Huỷ
                    </button>
                  )}
                </div>

                {isSearching && (
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Kết quả cho: <span className="font-semibold text-gray-700 dark:text-gray-200">{searchQuery}</span>
                  </div>
                )}
              </div>

              <div className="hidden sm:flex flex-col items-end text-xs text-gray-500 dark:text-gray-400 gap-1">
                <span className="px-3 py-1 rounded-full bg-white/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-800">
                  {displayPlans.length || 0} lịch trình
                </span>

                {user && (
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={() => setOpenNew(true)}
                      className="text-[11px] px-3 py-1 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition"
                    >
                      + Tạo lịch trình mới
                    </button>

                    <Link
                      to="/plans/my-plans"
                      className="text-[11px] px-3 py-1 rounded-full border border-sky-300/70 text-sky-600 bg-white/80 dark:bg-gray-900/80 hover:bg-sky-50 dark:hover:bg-sky-900/40 transition"
                    >
                      Quản lý lịch trình của tôi
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </section>
        </FadeInSection>

        {/* Search results: USERS */}
        {isSearching && !searchLoading && (searchUsers?.length || 0) > 0 && (
          <FadeInSection delay={80}>
            <div className="mb-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/60 p-4">
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Người dùng
                <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">
                  ({searchUsers.length})
                </span>
              </div>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {searchUsers.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => navigate(`/profile/${u.id}`)}
                    className="
                      flex items-center gap-3 text-left
                      p-3 rounded-2xl
                      border border-gray-200 dark:border-gray-800
                      bg-white/80 dark:bg-gray-950/30
                      hover:bg-sky-50 dark:hover:bg-sky-900/20
                      transition
                    "
                  >
                    <img
                      src={u.avatar || "https://static.vecteezy.com/system/resources/thumbnails/009/734/564/small/default-avatar-profile-icon-of-social-media-user-vector.jpg"}
                      alt={u.fullname || "user"}
                      className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-800"
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {u.fullname || "Chưa đặt tên"}
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

        {/* EMPTY (feed) */}
        {isEmpty ? (
          <FadeInSection delay={200}>
            <div className="mt-10 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center mb-4">
                <Compass className="w-8 h-8 text-sky-500" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Chưa có lịch trình nào</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                Hãy là người đầu tiên chia sẻ một lịch trình thật thú vị.
              </p>
            </div>
          </FadeInSection>
        ) : (
          <div className="space-y-5">
            {/* empty for search */}
            {isSearchEmpty && (
              <FadeInSection delay={120}>
                <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/60 p-6 text-center">
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Không có kết quả phù hợp</div>
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Thử từ khoá khác, hoặc tìm theo <span className="font-semibold">@username</span>.
                  </div>
                </div>
              </FadeInSection>
            )}

            {displayPlans.map((p, i) => (
              <FadeInSection key={p.id} delay={i * 90}>
                <PlanPostCard plan={p} me={user} onOpenDetail={() => (window.location.href = `/plans/${p.id}`)} />
              </FadeInSection>
            ))}

            {displayLoading && (
              <FadeInSection delay={150}>
                <div className="space-y-4">
                  <PostSkeleton />
                  <PostSkeleton />
                </div>
              </FadeInSection>
            )}

            {/* Lazy load only for feed */}
            {!isSearching && hasMore && <div ref={loadMoreRef} className="h-8 w-full" />}

            {!isSearching && !hasMore && items.length > 0 && (
              <FadeInSection delay={200}>
                <p className="pt-4 text-center text-xs text-gray-400">Bạn đã xem hết các lịch trình hiện có.</p>
              </FadeInSection>
            )}
          </div>
        )}
      </main>

      <NewPlanModal open={openNew} onClose={() => setOpenNew(false)} onCreated={() => reload()} />

      <Footer />
    </div>
  );
}
