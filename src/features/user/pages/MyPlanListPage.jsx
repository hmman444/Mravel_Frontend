// src/features/plans/pages/MyPlanListPage.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Compass } from "lucide-react";

import PlanPostCard from "../../planFeed/components/PlanPostCard";
import PostSkeleton from "../../planFeed/components/PostSkeleton";
import NewPlanModal from "../../planFeed/components/NewPlanModal";
import FadeInSection from "../../../components/FadeInSection";

import { useMyPlans } from "../hooks/useMyPlans";

export default function MyPlanListPage() {
  const [openNew, setOpenNew] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);

  const { user } = useSelector((s) => s.auth);
  const { items, loading, hasMore, fetchNext, reload } = useMyPlans();

  const loadMoreRef = useRef(null);

  // Load 1 lần khi có user
  useEffect(() => {
    if (!user?.id || initialLoaded) return;
    reload();
    setInitialLoaded(true);
  }, [user?.id, initialLoaded, reload]);

  // Lazy load giống PlanListPage
  useEffect(() => {
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
  }, [hasMore, loading, fetchNext]);

  const isEmpty = !loading && items.length === 0;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b  dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">

      <main className="flex-1 max-w-3xl w-full mx-auto pb-16 px-3 sm:px-4">

        {/* HEADER giống style PlanListPage */}
        <FadeInSection delay={0}>
          <section className="mb-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-gray-50">
                  Lịch trình của tôi
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Tất cả lịch trình bạn đã tạo.
                </p>
              </div>

              <div className="hidden sm:flex flex-col items-end text-xs text-gray-500 dark:text-gray-400 gap-1">
                <span className="px-3 py-1 rounded-full bg-white/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-800">
                  {items.length || 0} lịch trình của bạn
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
                      to="/plans"
                      className="text-[11px] px-3 py-1 rounded-full border border-sky-300/70 text-sky-600 bg-white/80 dark:bg-gray-900/80 hover:bg-sky-50 dark:hover:bg-sky-900/40 transition"
                    >
                      Khám phá bảng tin lịch trình
                    </Link>
                    <Link
                      to="/plans/my-plans"
                      className="text-[11px] px-3 py-1 rounded-full border border-sky-300/70 text-sky-600 bg-white/80 dark:bg-gray-900/80 hover:bg-sky-50 dark:hover:bg-sky-900/40 transition"
                    >
                      Quản lý lịch trình
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </section>
        </FadeInSection>

        {/* EMPTY STATE */}
        {isEmpty ? (
          <FadeInSection delay={200}>
            <div className="mt-10 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center mb-4">
                <Compass className="w-8 h-8 text-sky-500" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Bạn chưa có lịch trình nào
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                Hãy tạo một lịch trình đầu tiên của riêng bạn để bắt đầu hành trình với Mravel.
              </p>

              {user && (
                <button
                  onClick={() => setOpenNew(true)}
                  className="mt-4 px-4 py-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white text-sm shadow-sm hover:shadow-md hover:-translate-y-0.5 transition"
                >
                  + Tạo lịch trình mới
                </button>
              )}
            </div>
          </FadeInSection>
        ) : (
          <div className="space-y-5 mt-2">
            {items.map((p, i) => (
              <FadeInSection key={p.id} delay={i * 90}>
                <PlanPostCard
                  plan={p}
                  me={user}
                  onOpenDetail={() => (window.location.href = `/plans/${p.id}`)}
                />
              </FadeInSection>
            ))}

            {loading && (
              <FadeInSection delay={150}>
                <div className="space-y-4">
                  <PostSkeleton />
                  <PostSkeleton />
                </div>
              </FadeInSection>
            )}

            {hasMore && <div ref={loadMoreRef} className="h-8 w-full" />}

            {!hasMore && items.length > 0 && (
              <FadeInSection delay={200}>
                <p className="pt-4 text-center text-xs text-gray-400">
                  Bạn đã xem hết tất cả lịch trình của mình.
                </p>
              </FadeInSection>
            )}
          </div>
        )}
      </main>

      <NewPlanModal
        open={openNew}
        onClose={() => setOpenNew(false)}
        onCreated={reload}
      />

    </div>
  );
}
