"use client";

import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { FunnelIcon } from "@heroicons/react/24/outline";
import { useAdminServices } from "../hooks/useAdminServices";

import ServiceStats from "../components/services/ServiceStats";
import ServiceFilters from "../components/services/ServiceFilters";
import ServiceTable from "../components/services/ServiceTable";
import ReasonModal from "../components/services/ReasonModal";

import { showError, showSuccess } from "../../../utils/toastUtils";

const soft = {
  btn: "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition active:scale-[0.98]",
  btnPrimary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
  btnGhost:
    "bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900",
};

export default function ManageServicesPage() {
  const {
    mode,
    setMode,
    items,
    loading,
    acting,
    load,
    act,
  } = useAdminServices();

  // filters UI
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [activeFilter, setActiveFilter] = useState("ALL"); // ALL | ACTIVE | INACTIVE
  const [unlockFilter, setUnlockFilter] = useState("ALL"); // ALL | YES | NO

  // reason modal state
  const [reasonOpen, setReasonOpen] = useState(false);
  const [reasonMode, setReasonMode] = useState(null); // "REJECT" | "BLOCK"
  const [target, setTarget] = useState(null); // selected item

  const buildQueryParams = () => {
    const params = {};
    const q = search.trim();
    if (q) params.q = q;

    if (status !== "ALL") params.status = status;

    if (activeFilter === "ACTIVE") params.active = true;
    if (activeFilter === "INACTIVE") params.active = false;

    if (unlockFilter === "YES") params.unlockRequested = true;
    if (unlockFilter === "NO") params.unlockRequested = false;

    // paging nếu muốn:
    // params.page = 0; params.size = 20;

    return params;
  };

  const reload = async () => {
    await load({ mode, params: buildQueryParams() });
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const filtered = useMemo(() => {
    // Backend đã filter rồi, nhưng vẫn giữ fallback client-side nếu muốn
    return items || [];
  }, [items]);

  const totalCount = filtered.length;
  const pendingCount = useMemo(
    () => filtered.filter((x) => x.moderationStatus === "PENDING_REVIEW").length,
    [filtered]
  );

  const hasAnyFilter =
    search.trim() ||
    status !== "ALL" ||
    activeFilter !== "ALL" ||
    unlockFilter !== "ALL";

  const resetFilters = () => {
    setSearch("");
    setStatus("ALL");
    setActiveFilter("ALL");
    setUnlockFilter("ALL");
  };

  // ===== actions =====
  const onApprove = async (x) => {
    try {
      await act({ mode, action: "APPROVE", id: x.id });
      showSuccess("Đã approve");
      await reload();
    } catch (e) {
      showError(typeof e === "string" ? e : "Approve thất bại");
    }
  };

  const openReason = (action, x) => {
    setReasonMode(action); // REJECT | BLOCK
    setTarget(x);
    setReasonOpen(true);
  };

  const onConfirmReason = async (reason) => {
    if (!target?.id) return;
    try {
      await act({ mode, action: reasonMode, id: target.id, reason });
      showSuccess(reasonMode === "REJECT" ? "Đã reject" : "Đã block");
      setReasonOpen(false);
      setTarget(null);
      await reload();
    } catch (e) {
      showError(typeof e === "string" ? e : "Thao tác thất bại");
    }
  };

  const onUnblock = async (x) => {
    try {
      await act({ mode, action: "UNBLOCK", id: x.id });
      showSuccess("Đã unblock");
      await reload();
    } catch (e) {
      showError(typeof e === "string" ? e : "Unblock thất bại");
    }
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Quản lý dịch vụ (Moderation)
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Duyệt / từ chối / chặn dịch vụ do partner đăng.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* mode switch */}
            <div className="inline-flex overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
              <button
                type="button"
                onClick={() => setMode("HOTEL")}
                className={`px-4 py-2 text-sm font-semibold ${
                  mode === "HOTEL"
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-900"
                }`}
              >
                Hotels
              </button>
              <button
                type="button"
                onClick={() => setMode("RESTAURANT")}
                className={`px-4 py-2 text-sm font-semibold ${
                  mode === "RESTAURANT"
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-900"
                }`}
              >
                Restaurants
              </button>
            </div>

            <button
              onClick={() => setFiltersOpen((v) => !v)}
              className={`${soft.btn} ${soft.btnGhost} gap-2`}
              type="button"
            >
              <FunnelIcon className="h-5 w-5" />
              Bộ lọc
            </button>

            <button
              onClick={reload}
              className={`${soft.btn} ${soft.btnPrimary}`}
              type="button"
              disabled={loading}
            >
              Reload
            </button>
          </div>
        </div>

        <ServiceStats
          totalCount={totalCount}
          pendingCount={pendingCount}
          visibleCount={filtered.length}
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
        onReset={() => {
          resetFilters();
          setTimeout(() => reload(), 0);
        }}
      />

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Không có dữ liệu phù hợp với bộ lọc hiện tại.
          </p>
        </div>
      ) : (
        <ServiceTable
          items={filtered}
          onApprove={onApprove}
          onReject={(x) => openReason("REJECT", x)}
          onBlock={(x) => openReason("BLOCK", x)}
          onUnblock={onUnblock}
        />
      )}

      {/* Reason modal */}
      <ReasonModal
        open={reasonOpen}
        title={reasonMode === "REJECT" ? "Từ chối dịch vụ" : "Chặn dịch vụ"}
        confirmText={reasonMode === "REJECT" ? "Reject" : "Block"}
        loading={acting}
        onClose={() => setReasonOpen(false)}
        onConfirm={onConfirmReason}
      />
    </AdminLayout>
  );
}
