"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import AdminLayout from "../components/AdminLayout";
import { FunnelIcon } from "@heroicons/react/24/outline";
import { useAdminServices } from "../hooks/useAdminServices";
import { useNavigate } from "react-router-dom";
import ServiceStats from "../components/services/ServiceStats";
import ServiceFilters from "../components/services/ServiceFilters";
import ServiceTable from "../components/services/ServiceTable";
import ReasonModal from "../components/services/ReasonModal";

import { showError, showSuccess } from "../../../utils/toastUtils";

const soft = {
  btn: "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition active:scale-[0.98]",
  btnPrimary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
  btnGhost:
    "bg-white dark:bg-gray-800 hover:bg-slate-50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900",
};


// debounce hook
function useDebounced(value, delay = 350) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export default function ManageServicesPage() {
    const { t } = useTranslation();
    const { mode, setMode, items, loading, acting, load, act } = useAdminServices();

    /** == FILTER UI STATE == */
    const [filtersOpen, setFiltersOpen] = useState(true);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("ALL");
    const [activeFilter, setActiveFilter] = useState("ALL"); // ALL | ACTIVE | INACTIVE
    const [unlockFilter, setUnlockFilter] = useState("ALL"); // ALL | YES | NO

    /** == MODAL STATE == */
    const [reasonOpen, setReasonOpen] = useState(false);
    const [reasonMode, setReasonMode] = useState(null); // "REJECT" | "BLOCK"
    const [target, setTarget] = useState(null);

    /** == DEBOUNCE SEARCH == */
    const debouncedSearch = useDebounced(search, 350);

    /** == ANTI-DOUBLE/ANTI-RACE ==
     * - strictModeRef: tránh gọi 2 lần khi dev StrictMode mount/unmount
     * - reqSeqRef: đảm bảo request mới nhất thắng, request cũ về trễ bị bỏ
     */
    const strictModeRef = useRef(false);
    const reqSeqRef = useRef(0);

    const onOpenRow = (x) => {
        if (mode === "HOTEL") navigate(`/admin/services/hotels/${x.id}`);
        if (mode === "RESTAURANT") navigate(`/admin/services/restaurants/${x.id}`);
    };

    const navigate = useNavigate();
    /** == BUILD PARAMS (memo) == */
    const queryParams = useMemo(() => {
        const params = {};

        const q = (debouncedSearch || "").trim();
        if (q) params.q = q;

        if (status && status !== "ALL") params.status = status;

        if (activeFilter === "ACTIVE") params.active = true;
        if (activeFilter === "INACTIVE") params.active = false;

        if (unlockFilter === "YES") params.unlockRequested = true;
        if (unlockFilter === "NO") params.unlockRequested = false;

        return params;
    }, [debouncedSearch, status, activeFilter, unlockFilter]);

    /** == RELOAD (stable) == */
    const reload = async (nextMode = mode, nextParams = queryParams) => {
        // seq tăng mỗi lần gọi -> nếu response về trễ mà seq không còn là latest thì bỏ
        const mySeq = ++reqSeqRef.current;

        try {
        const data = await load({ mode: nextMode, params: nextParams });

        // nếu đây không phải request mới nhất thì không làm gì (tránh UI nhảy lung tung)
        if (mySeq !== reqSeqRef.current) return data;
        return data;
        } catch (e) {
        // chỉ show error cho request mới nhất
        if (mySeq === reqSeqRef.current) {
            showError(typeof e === "string" ? e : t("admin.services_load_failed"));
        }
        throw e;
        }
    };

    useEffect(() => {
        if (!strictModeRef.current) {
        strictModeRef.current = true;
        }
        reload(mode, queryParams);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode, queryParams]);

    /** == DERIVED == */
    const list = useMemo(() => items || [], [items]);

    const totalCount = list.length;

    const pendingCount = useMemo(
        () => list.filter((x) => x.moderationStatus === "PENDING_REVIEW").length,
        [list]
    );

    const hasAnyFilter =
        search.trim() ||
        status !== "ALL" ||
        activeFilter !== "ALL" ||
        unlockFilter !== "ALL";

    const resetFilters = () => {
        // chỉ reset state, effect sẽ tự reload theo queryParams mới
        setSearch("");
        setStatus("ALL");
        setActiveFilter("ALL");
        setUnlockFilter("ALL");
    };

    /** == ACTIONS == */
    const onApprove = async (x) => {
        try {
        await act({ mode, action: "APPROVE", id: x.id });
        showSuccess(t("admin.services_approve_success"));
        await reload(mode, queryParams);
        } catch (e) {
        showError(typeof e === "string" ? e : t("admin.services_approve_failed"));
        }
    };

    const openReason = (action, x) => {
        setReasonMode(action);
        setTarget(x);
        setReasonOpen(true);
    };

    const onConfirmReason = async (reason) => {
        if (!target?.id) return;
        try {
        await act({ mode, action: reasonMode, id: target.id, reason });
        showSuccess(reasonMode === "REJECT" ? t("admin.services_reject_success") : t("admin.services_block_success"));
        setReasonOpen(false);
        setTarget(null);
        await reload(mode, queryParams);
        } catch (e) {
        showError(typeof e === "string" ? e : t("admin.services_action_failed"));
        }
    };

    const onUnblock = async (x) => {
        try {
        await act({ mode, action: "UNBLOCK", id: x.id });
        showSuccess(t("admin.services_unblock_success"));
        await reload(mode, queryParams);
        } catch (e) {
        showError(typeof e === "string" ? e : t("admin.services_unblock_failed"));
        }
    };

    return (
        <AdminLayout>
        {/* Header */}
        <div className="mb-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {t("admin.services_title")}
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                {t("admin.services_subtitle")}
                </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                {/* mode switch */}
                <div className="inline-flex overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-800 dark:border-slate-800 dark:bg-slate-950">
                <button
                    type="button"
                    onClick={() => setMode("HOTEL")}
                    className={`px-4 py-2 text-sm font-semibold ${
                    mode === "HOTEL"
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-900"
                    }`}
                >
                    {t("admin.services_hotels")}
                </button>
                <button
                    type="button"
                    onClick={() => setMode("RESTAURANT")}
                    className={`px-4 py-2 text-sm font-semibold ${
                    mode === "RESTAURANT"
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-900"
                    }`}
                >
                    {t("admin.services_restaurants")}
                </button>
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
                onClick={() => reload(mode, queryParams)}
                className={`${soft.btn} ${soft.btnPrimary}`}
                type="button"
                disabled={loading}
                title={t("admin.services_reload_hint")}
                >
                {t("admin.services_reload")}
                </button>
            </div>
            </div>

            <ServiceStats
            totalCount={totalCount}
            pendingCount={pendingCount}
            visibleCount={list.length}
            />
        </div>

        {/* Filters */}
        <ServiceFilters
            open={filtersOpen}
            search={search}
            setSearch={setSearch}
            status={status}
            setStatus={setStatus}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            unlockFilter={unlockFilter}
            setUnlockFilter={setUnlockFilter}
            hasAnyFilter={!!hasAnyFilter}
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
        ) : list.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-300">
                {t("admin.services_empty")}
            </p>
            </div>
        ) : (
            <ServiceTable
            items={list}
            onApprove={onApprove}
            onOpen={onOpenRow}
            onReject={(x) => openReason("REJECT", x)}
            onBlock={(x) => openReason("BLOCK", x)}
            onUnblock={onUnblock}
            />
        )}

        {/* Reason modal */}
        <ReasonModal
            open={reasonOpen}
            title={reasonMode === "REJECT" ? t("admin.services_reject_title") : t("admin.services_block_title")}
            confirmText={reasonMode === "REJECT" ? "Reject" : "Block"}
            loading={acting}
            onClose={() => setReasonOpen(false)}
            onConfirm={onConfirmReason}
        />
        </AdminLayout>
    );
}
