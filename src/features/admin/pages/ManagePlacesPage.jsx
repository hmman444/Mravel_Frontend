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
  PlusIcon
} from "@heroicons/react/24/outline";

const soft = {
  btn: "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition active:scale-[0.98]",
  btnPrimary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
  btnGhost:
    "bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900",
  badge:
    "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
};

function KindBadge({ kind }) {
  const cls =
    kind === "DESTINATION"
      ? "bg-sky-50 text-sky-700 border-sky-200"
      : kind === "POI"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-violet-50 text-violet-700 border-violet-200";

  const label =
    kind === "DESTINATION" ? "Điểm đến" : kind === "POI" ? "Địa điểm" : "Cơ sở";

  return <span className={`${soft.badge} ${cls}`}>{label}</span>;
}

export default function ManagePlacesPage() {
  const nav = useNavigate();
  const {
    destinations,
    children,
    loadDestinations,
    loadChildren,
    clearChildren,
    remove,
  } = useAdminPlaces();
  

  // view state
  const [mode, setMode] = useState("DESTINATION"); // DESTINATION | CHILDREN
  const [parent, setParent] = useState(null); // { slug, name }

  // ui
  const [q, setQ] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null); // { id, name }

  useEffect(() => {
    loadDestinations({ page: 0, size: 20, q: "" }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = mode === "DESTINATION" ? destinations : children;
  const loading = current.loading;
  const rawItems = current.items || [];

  const items = useMemo(() => {
    if (mode === "DESTINATION") {
      return rawItems.filter((x) => x.kind === "DESTINATION");
    }

    return rawItems.filter((x) => x.kind === "POI" || x.kind === "VENUE");
  }, [rawItems, mode]);


  const filtered = useMemo(() => {
    const keyword = q.trim().toLowerCase();
    if (!keyword) return items;
    return items.filter((x) => {
      const s =
        `${x.name || ""} ${x.slug || ""} ${x.provinceName || ""}`.toLowerCase();
      return s.includes(keyword);
    });
  }, [items, q]);

  const openChildren = async (row) => {
    try {
      setMode("CHILDREN");
      setParent({ slug: row.slug, name: row.name });
      // mặc định lấy POI (có thể đổi thành ALL nếu bạn support)
      await loadChildren(row.slug, { kind: "POI", page: 0, size: 50 });
    } catch (e) {
      showError(String(e));
    }
  };

  const goBack = () => {
    if (mode === "CHILDREN") {
      setMode("DESTINATION");
      setParent(null);
      clearChildren();
      return;
    }
  };

  const requestDelete = (row) => {
    setPendingDelete({ id: row.id, name: row.name || row.slug });
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    setConfirmOpen(false);
    setPendingDelete(null);
  };

  const confirmDelete = async () => {
    if (!pendingDelete?.id) return;
    try {
      await remove(pendingDelete.id);
      showSuccess("Đã xóa");

      if (mode === "DESTINATION") {
        await loadDestinations({ page: 0, size: 20, q: "" });
      } else if (mode === "CHILDREN" && parent?.slug) {
        await loadChildren(parent.slug, { kind: "POI", page: 0, size: 50 });
      }
    } catch (e) {
      showError(String(e));
    } finally {
      closeConfirm();
    }
  };

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

          <p className="mt-1 text-sm text-slate-500">
            {mode === "DESTINATION"
              ? "Chỉ hiển thị các điểm đến (DESTINATION)."
              : "Chỉ hiển thị cấp con (POI/VENUE)."}
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
            placeholder="Tìm theo tên / slug..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
          />
        </div>

        {/* Create button */}
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
                  <th className="px-4 py-3 text-left font-semibold">Slug</th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Vị trí
                  </th>
                  <th className="px-4 py-3 text-center font-semibold">
                    Thao tác
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((row) => (
                  <tr key={row.id || row.slug} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/40">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {row.name}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        {row.parentSlug ? `Parent: ${row.parentSlug}` : "—"}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <KindBadge kind={row.kind} />
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
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          className={`${soft.btn} ${soft.btnGhost} gap-2 px-3`}
                          onClick={() => nav(`/admin/places/${row.slug}`)}
                        >
                          <EyeIcon className="h-4 w-4" />
                          Xem chi tiết
                        </button>

                        {mode === "DESTINATION" && (
                          <button
                            type="button"
                            className={`${soft.btn} ${soft.btnPrimary} gap-2 px-3`}
                            onClick={() => openChildren(row)}
                          >
                            Xem địa điểm con
                          </button>
                        )}

                        <button
                          type="button"
                          className={`${soft.btn} ${soft.btnGhost} gap-2 px-3`}
                          onClick={() => requestDelete(row)}
                        >
                          <TrashIcon className="h-4 w-4" />
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirm soft delete */}
      <ConfirmModal
        open={confirmOpen}
        title="Xóa địa điểm"
        message={`Bạn có chắc muốn xóa "${pendingDelete?.name || ""}" không?`}
        confirmText="Xóa"
        cancelText="Hủy"
        onClose={closeConfirm}
        onConfirm={confirmDelete}
      />
    </AdminLayout>
  );
}
