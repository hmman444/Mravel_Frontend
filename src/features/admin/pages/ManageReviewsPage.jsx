"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import AdminLayout from "../components/AdminLayout";
import {
  FunnelIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { useAdminReviews } from "../hooks/useAdminReviews";
import ReviewStats from "../components/reviews/ReviewStats";
import ReviewFilters from "../components/reviews/ReviewFilters";
import ReviewTable from "../components/reviews/ReviewTable";
import ConfirmModal from "../../../components/ConfirmModal";
import { showError, showSuccess } from "../../../utils/toastUtils";

const soft = {
  btn: "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
  btnPrimary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
  btnGhost:
    "bg-white dark:bg-gray-800 hover:bg-slate-50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900",
};

const MODES = [
  { v: "HOTEL", label: "Hotels" },
  { v: "RESTAURANT", label: "Restaurants" },
  { v: "PLACE", label: "Places" },
];

function useDebounced(value, delay = 350) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export default function ManageReviewsPage() {
  const { t } = useTranslation();
  const {
    mode,
    setMode,
    maxRating,
    setMaxRating,
    items,
    page,
    size,
    totalElements,
    totalPages,
    negativeCount,
    loading,
    acting,
    load,
    loadCount,
    remove,
  } = useAdminReviews();

  const [filtersOpen, setFiltersOpen] = useState(true);
  const [targetId, setTargetId] = useState("");
  const [pageIndex, setPageIndex] = useState(0);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [target, setTarget] = useState(null);

  const debouncedTargetId = useDebounced(targetId, 350);
  const reqSeqRef = useRef(0);

  const queryParams = useMemo(() => {
    const params = { targetType: mode, maxRating, page: pageIndex, size };
    const tid = (debouncedTargetId || "").trim();
    if (tid) params.targetId = tid;
    return params;
  }, [mode, maxRating, pageIndex, size, debouncedTargetId]);

  const reload = async () => {
    const mySeq = ++reqSeqRef.current;
    try {
      await load(queryParams);
      loadCount({ targetType: mode, maxRating }).catch(() => {});
    } catch (e) {
      if (mySeq === reqSeqRef.current) {
        showError(typeof e === "string" ? e : t("admin.review_load_failed"));
      }
    }
  };

  // reset to first page when the filter set changes
  useEffect(() => {
    setPageIndex(0);
  }, [mode, maxRating, debouncedTargetId]);

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams]);

  const hasAnyFilter = maxRating !== 2 || !!targetId.trim();

  const resetFilters = () => {
    setMaxRating(2);
    setTargetId("");
  };

  const requestDelete = (x) => {
    setTarget(x);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!target?.id) return;
    try {
      await remove(target.id);
      showSuccess(t("admin.review_delete_success"));
      setConfirmOpen(false);
      setTarget(null);
      await reload();
    } catch (e) {
      showError(typeof e === "string" ? e : t("admin.review_delete_failed"));
    }
  };

  const canPrev = pageIndex > 0;
  const canNext = pageIndex + 1 < totalPages;

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {t("admin.reviews_title")}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {t("admin.reviews_subtitle")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* mode switch */}
            <div className="inline-flex overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-800 dark:border-slate-800 dark:bg-slate-950">
              {MODES.map((m) => (
                <button
                  key={m.v}
                  type="button"
                  onClick={() => setMode(m.v)}
                  className={`px-4 py-2 text-sm font-semibold ${
                    mode === m.v
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-900"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setFiltersOpen((v) => !v)}
              className={`${soft.btn} ${soft.btnGhost} gap-2`}
              type="button"
            >
              <FunnelIcon className="h-5 w-5" />
              {t("admin.services_filters")}
            </button>

            <button
              onClick={reload}
              className={`${soft.btn} ${soft.btnPrimary} gap-2`}
              type="button"
              disabled={loading}
            >
              <ArrowPathIcon className="h-5 w-5" />
              {t("admin.reload")}
            </button>
          </div>
        </div>

        <ReviewStats
          negativeCount={negativeCount}
          visibleCount={items.length}
          maxRating={maxRating}
        />
      </div>

      {/* Filters */}
      <ReviewFilters
        open={filtersOpen}
        maxRating={maxRating}
        setMaxRating={setMaxRating}
        targetId={targetId}
        setTargetId={setTargetId}
        hasAnyFilter={hasAnyFilter}
        onReset={resetFilters}
      />

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-12 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {t("admin.review_empty")}
          </p>
        </div>
      ) : (
        <>
          <ReviewTable items={items} acting={acting} onDelete={requestDelete} />

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {t("admin.review_pagination_info", {
                from: totalElements === 0 ? 0 : page * size + 1,
                to: page * size + items.length,
                total: totalElements,
              })}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                disabled={!canPrev || loading}
                className={`${soft.btn} ${soft.btnGhost} gap-1 px-3`}
              >
                <ChevronLeftIcon className="h-4 w-4" />
                {t("admin.prev", "Prev")}
              </button>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {page + 1} / {Math.max(1, totalPages)}
              </span>
              <button
                type="button"
                onClick={() => setPageIndex((p) => p + 1)}
                disabled={!canNext || loading}
                className={`${soft.btn} ${soft.btnGhost} gap-1 px-3`}
              >
                {t("admin.next", "Next")}
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Delete confirm */}
      <ConfirmModal
        open={confirmOpen}
        title={t("admin.review_delete_title")}
        message={t("admin.review_delete_confirm", {
          name: target?.targetName || target?.targetId || "",
        })}
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
        onClose={() => {
          setConfirmOpen(false);
          setTarget(null);
        }}
        onConfirm={confirmDelete}
      />
    </AdminLayout>
  );
}
