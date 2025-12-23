"use client";

// src/features/admin/pages/ManageUsersPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import { FunnelIcon } from "@heroicons/react/24/outline";
import ConfirmModal from "../../../components/ConfirmModal";
import { showError, showSuccess } from "../../../utils/toastUtils";
import { useAdminUsers } from "../hooks/useAdminUsers";

import UserStats from "../components/user/UserStats";
import UserFilters from "../components/user/UserFilters";
import UserTable from "../components/user/UserTable";

const soft = {
  btn: "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition active:scale-[0.98]",
  btnGhost:
    "bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900",
};

export default function ManageUsersPage() {
  const location = useLocation();
  const isPartners = location.pathname.startsWith("/admin/partners");
  const title = isPartners ? "Quản lý đối tác" : "Quản lý khách hàng";
  const roleParam = isPartners ? "PARTNER" : "USER";

  const { items, loading, toggling, error, load, lock, unlock } = useAdminUsers();

  const [filtersOpen, setFiltersOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL | ACTIVE | LOCKED

  const [toggleLoadingIds, setToggleLoadingIds] = useState(() => new Set());

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // { id, email, action: "LOCK"|"UNLOCK" }

  const setRowToggling = (id, on) => {
    setToggleLoadingIds((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const rowBusy = (id) => toggling || toggleLoadingIds.has(id);

  useEffect(() => {
    load({ role: roleParam });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleParam]);

  const totalCount = items?.length || 0;
  const activeCount = useMemo(() => (items || []).filter((x) => x.status === "ACTIVE").length, [items]);
  const lockedCount = useMemo(() => (items || []).filter((x) => x.status === "LOCKED").length, [items]);

  const filtered = useMemo(() => {
    let list = [...(items || [])];

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (u) =>
          u.email?.toLowerCase().includes(q) ||
          u.fullname?.toLowerCase().includes(q)
      );
    }

    if (statusFilter === "ACTIVE") list = list.filter((u) => u.status === "ACTIVE");
    if (statusFilter === "LOCKED") list = list.filter((u) => u.status === "LOCKED");

    // optional: sort by email
    list.sort((a, b) => (a.email || "").localeCompare(b.email || ""));
    return list;
  }, [items, search, statusFilter]);

  const hasAnyFilter = search.trim() || statusFilter !== "ALL";

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
  };

  const requestLock = (id) => {
    const u = (items || []).find((x) => String(x.id) === String(id));
    setPendingAction({ id, email: u?.email || id, action: "LOCK" });
    setConfirmOpen(true);
  };

  const requestUnlock = (id) => {
    const u = (items || []).find((x) => String(x.id) === String(id));
    setPendingAction({ id, email: u?.email || id, action: "UNLOCK" });
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    setConfirmOpen(false);
    setPendingAction(null);
  };

  const confirmToggle = async () => {
    if (!pendingAction?.id) return;
    const { id, action } = pendingAction;

    setRowToggling(id, true);
    try {
      if (action === "LOCK") {
        await lock(id);
        showSuccess("Đã khóa tài khoản");
      } else {
        await unlock(id);
        showSuccess("Đã mở khóa tài khoản");
      }
      // reload để sync đúng DB (tránh lệch nếu BE đổi field)
      await load({ role: roleParam });
    } catch (e) {
      showError(typeof e === "string" ? e : "Thao tác thất bại");
    } finally {
      setRowToggling(id, false);
      closeConfirm();
    }
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
            <p className="mt-1 text-sm text-slate-500">
              Danh sách tài khoản ({isPartners ? "PARTNER" : "USER"}). Có thể khóa / mở khóa.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFiltersOpen((v) => !v)}
              className={`${soft.btn} ${soft.btnGhost} gap-2`}
              type="button"
            >
              <FunnelIcon className="h-5 w-5" />
              Bộ lọc
            </button>
          </div>
        </div>

        <UserStats
          totalCount={totalCount}
          activeCount={activeCount}
          lockedCount={lockedCount}
          visibleCount={filtered.length}
        />
      </div>

      {/* Filters */}
      <UserFilters
        open={filtersOpen}
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        hasAnyFilter={hasAnyFilter}
        onReset={resetFilters}
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
            Không có tài khoản phù hợp với bộ lọc hiện tại
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <button type="button" className={`${soft.btn} ${soft.btnGhost}`} onClick={resetFilters}>
              Reset bộ lọc
            </button>
          </div>
        </div>
      ) : (
        <UserTable
          items={filtered}
          rowBusy={rowBusy}
          onLock={(id) => {
            if (rowBusy(id)) return;
            requestLock(id);
          }}
          onUnlock={(id) => {
            if (rowBusy(id)) return;
            requestUnlock(id);
          }}
        />
      )}

      {/* Confirm */}
      <ConfirmModal
        open={confirmOpen}
        title={pendingAction?.action === "LOCK" ? "Khóa tài khoản" : "Mở khóa tài khoản"}
        message={
          pendingAction?.action === "LOCK"
            ? `Bạn có chắc muốn khóa "${pendingAction?.email || ""}" không?`
            : `Bạn có chắc muốn mở khóa "${pendingAction?.email || ""}" không?`
        }
        confirmText={pendingAction?.action === "LOCK" ? "Khóa" : "Mở khóa"}
        cancelText="Hủy"
        onClose={closeConfirm}
        onConfirm={confirmToggle}
      />
    </AdminLayout>
  );
}
