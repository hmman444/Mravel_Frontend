"use client";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import ConfirmModal from "../../../components/ConfirmModal";
import { showError, showSuccess } from "../../../utils/toastUtils";
import { useAdminPlaces } from "../hooks/useAdminPlaces";

import {
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  TrashIcon,
  MapPinIcon,
  PlusIcon,
  LockClosedIcon,
  LockOpenIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

/* ===================== toast error from BE ===================== */
const toastErr = (e) => {
  const msg =
    typeof e === "string"
      ? e
      : e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "Có lỗi xảy ra";
  showError(msg);
};

const soft = {
  btn: "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
  btnPrimary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
  btnGhost:
    "bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900",
  btnDanger:
    "bg-rose-600 text-white hover:bg-rose-700 shadow-sm",
  badge: "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
  pill: "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
};

function KindBadge({ kind }) {
  const cls =
    kind === "DESTINATION"
      ? "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/30 dark:text-sky-200 dark:border-sky-900"
      : kind === "POI"
      ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-200 dark:border-amber-900"
      : "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/30 dark:text-violet-200 dark:border-violet-900";

  const label =
    kind === "DESTINATION" ? "Điểm đến" : kind === "POI" ? "Địa điểm" : "Cơ sở";

  return <span className={`${soft.badge} ${cls}`}>{label}</span>;
}

function StatusPill({ active }) {
  const cls = active
    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-200 dark:border-emerald-900"
    : "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-800";
  return (
    <span className={`${soft.pill} ${cls}`}>
      {active ? "Đang hoạt động" : "Đã khóa"}
    </span>
  );
}

export default function ManagePlacesPage() {
  const nav = useNavigate();

  const {
    destinations,
    children,
    loadDestinations,
    loadChildren,
    clearChildren,
    lock,
    unlock,
    remove, // hard delete
  } = useAdminPlaces();

  // mode
  const [mode, setMode] = useState("DESTINATION"); // DESTINATION | CHILDREN
  const [parent, setParent] = useState(null); // { slug, name }

  // ui
  const [q, setQ] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null); // { id, name }
  const [confirmMode, setConfirmMode] = useState("DELETE"); // DELETE | LOCK | UNLOCK
  const [pendingRow, setPendingRow] = useState(null); // { id, slug, name, active }
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    loadDestinations({ page: 0, size: 20, q: "" }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = mode === "DESTINATION" ? destinations : children;
  const loading = current.loading;
  const rawItems = current.items || [];

  const items = useMemo(() => {
    if (mode === "DESTINATION") {
      // list destinations (active + locked)
      return rawItems.filter((x) => x.kind === "DESTINATION");
    }
    // children list (POI)
    return rawItems.filter((x) => x.kind === "POI");
  }, [rawItems, mode]);

  const filtered = useMemo(() => {
    const keyword = q.trim().toLowerCase();
    if (!keyword) return items;
    return items.filter((x) => {
      const s =
        `${x.name || ""} ${x.slug || ""} ${x.provinceName || ""} ${x.addressLine || ""}`.toLowerCase();
      return s.includes(keyword);
    });
  }, [items, q]);

  const refresh = async () => {
    try {
      if (mode === "DESTINATION") {
        await loadDestinations({ page: 0, size: 20, q: "" });
      } else if (mode === "CHILDREN" && parent?.slug) {
        await loadChildren(parent.slug, { kind: "POI", page: 0, size: 50 });
      }
    } catch (e) {
      toastErr(e);
    }
  };

  const openChildren = async (row) => {
    try {
      setMode("CHILDREN");
      setParent({ slug: row.slug, name: row.name });
      await loadChildren(row.slug, { kind: "POI", page: 0, size: 50 });
    } catch (e) {
      toastErr(e);
    }
  };

  const goBack = () => {
    if (mode === "CHILDREN") {
      setMode("DESTINATION");
      setParent(null);
      clearChildren();
    }
  };

  /* ===================== confirm flows ===================== */
  const closeConfirm = () => {
    setConfirmOpen(false);
    setPendingDelete(null);
    setPendingRow(null);
    setConfirmMode("DELETE");
  };

  const requestDelete = (row) => {
    setPendingDelete({ id: row.id, name: row.name || row.slug });
    setConfirmMode("DELETE");
    setConfirmOpen(true);
  };

  const requestToggleLock = (row) => {
    setPendingRow({
      id: row.id,
      slug: row.slug,
      name: row.name || row.slug,
      active: !!row.active,
    });
    setConfirmMode(row.active ? "LOCK" : "UNLOCK");
    setConfirmOpen(true);
  };

  const confirmAction = async () => {
    try {
      if (confirmMode === "DELETE") {
        if (!pendingDelete?.id) return;
        setBusyId(pendingDelete.id);
        await remove(pendingDelete.id); // hard delete
        showSuccess("Đã xóa");
      }

      if (confirmMode === "LOCK") {
        if (!pendingRow?.id) return;
        setBusyId(pendingRow.id);
        await lock(pendingRow.id);
        showSuccess("Đã khóa");
      }

      if (confirmMode === "UNLOCK") {
        if (!pendingRow?.id) return;
        setBusyId(pendingRow.id);
        await unlock(pendingRow.id);
        showSuccess("Đã mở khóa");
      }

      // refresh list
      await refresh();
    } catch (e) {
      toastErr(e);
    } finally {
      setBusyId(null);
      closeConfirm();
    }
  };

  const confirmTitle =
    confirmMode === "DELETE"
      ? "Xóa địa điểm"
      : confirmMode === "LOCK"
      ? "Khóa địa điểm"
      : "Mở khóa địa điểm";

  const confirmMessage =
    confirmMode === "DELETE"
      ? `Xóa sẽ không thể khôi phục. Bạn có chắc muốn xóa "${pendingDelete?.name || ""}" không?`
      : confirmMode === "LOCK"
      ? `Bạn có chắc muốn khóa "${pendingRow?.name || ""}" không? (Trạng thái active=false)`
      : `Bạn có chắc muốn mở khóa "${pendingRow?.name || ""}" không? (Trạng thái active=true)`;

  const confirmText =
    confirmMode === "DELETE" ? "Xóa" : confirmMode === "LOCK" ? "Khóa" : "Mở khóa";

  /* ===================== render ===================== */
  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-3">
            {mode === "CHILDREN" && (
              <button
                type="button"
                onClick={goBack}
                className={`${soft.btn} ${soft.btnGhost} px-3`}
                title="Quay lại"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
            )}

            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {mode === "DESTINATION"
                  ? "Quản lý điểm đến"
                  : `Quản lý địa điểm ở: ${parent?.name || parent?.slug || ""}`}
              </h1>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                {mode === "DESTINATION"
                  ? "Hiển thị DESTINATION (bao gồm cả đang hoạt động và đã khóa)."
                  : "Hiển thị cấp con (POI) thuộc điểm đến."}
              </p>
            </div>
          </div>

          {/* Right tools */}
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
            {/* Search */}
            <div className="relative w-full sm:w-[420px]">
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm theo tên / slug / vị trí..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>

            {/* Refresh */}
            <button
              type="button"
              onClick={refresh}
              className={`${soft.btn} ${soft.btnGhost} gap-2`}
              disabled={loading}
              title="Tải lại"
            >
              <ArrowPathIcon className="h-5 w-5" />
              Tải lại
            </button>

            {/* Create */}
            <button
              type="button"
              onClick={() => nav("/admin/places/new")}
              className={`${soft.btn} ${soft.btnPrimary} gap-2`}
              title="Tạo địa điểm"
            >
              <PlusIcon className="h-5 w-5" />
              Tạo địa điểm
            </button>
          </div>
        </div>
      </div>

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
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Không có dữ liệu phù hợp.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Tên</th>
                  <th className="px-4 py-3 text-left font-semibold">Loại</th>
                  <th className="px-4 py-3 text-left font-semibold">Trạng thái</th>
                  <th className="px-4 py-3 text-left font-semibold">Slug</th>
                  <th className="px-4 py-3 text-left font-semibold">Vị trí</th>
                  <th className="px-4 py-3 text-center font-semibold">Thao tác</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((row) => {
                  const busy = busyId && row.id === busyId;
                  return (
                    <tr
                      key={row.id || row.slug}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-900/40"
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {row.name}
                        </div>
                        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {row.parentSlug ? `Parent: ${row.parentSlug}` : "—"}{" "}
                          {typeof row.childrenCount === "number"
                            ? `• Children: ${row.childrenCount}`
                            : ""}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <KindBadge kind={row.kind} />
                      </td>

                      <td className="px-4 py-3">
                        <StatusPill active={!!row.active} />
                      </td>

                      <td className="px-4 py-3 font-mono text-xs text-slate-700 dark:text-slate-200">
                        {row.slug}
                      </td>

                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        <span className="inline-flex items-center gap-1">
                          <MapPinIcon className="h-4 w-4" />
                          {row.provinceName || row.addressLine || "—"}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <button
                            type="button"
                            className={`${soft.btn} ${soft.btnGhost} gap-2 px-3`}
                            onClick={() => nav(`/admin/places/${row.slug}`)}
                          >
                            <EyeIcon className="h-4 w-4" />
                            Chi tiết
                          </button>

                          {mode === "DESTINATION" && (
                            <button
                              type="button"
                              className={`${soft.btn} ${soft.btnPrimary} gap-2 px-3`}
                              onClick={() => openChildren(row)}
                            >
                              <MapPinIcon className="h-4 w-4" />
                              Địa điểm con
                            </button>
                          )}

                          <button
                            type="button"
                            className={`${soft.btn} ${soft.btnGhost} gap-2 px-3`}
                            disabled={busy}
                            onClick={() => requestToggleLock(row)}
                            title={row.active ? "Khóa" : "Mở khóa"}
                          >
                            {row.active ? (
                              <>
                                <LockClosedIcon className="h-4 w-4" />
                                Khóa
                              </>
                            ) : (
                              <>
                                <LockOpenIcon className="h-4 w-4" />
                                Mở
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            className={`${soft.btn} ${soft.btnDanger} gap-2 px-3`}
                            disabled={busy}
                            onClick={() => requestDelete(row)}
                            title="Xóa"
                          >
                            <TrashIcon className="h-4 w-4" />
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirm modal (delete/lock/unlock) */}
      <ConfirmModal
        open={confirmOpen}
        title={confirmTitle}
        message={confirmMessage}
        confirmText={confirmText}
        cancelText="Hủy"
        onClose={closeConfirm}
        onConfirm={confirmAction}
      />
    </AdminLayout>
  );
}
