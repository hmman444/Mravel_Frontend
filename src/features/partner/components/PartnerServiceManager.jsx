"use client";

import { useEffect, useMemo, useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { FunnelIcon } from "@heroicons/react/24/outline";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { usePartnerServices } from "../hooks/usePartnerServices";
import { getPartnerHotelById, getPartnerRestaurantById } from "../services/partnerService";
import PartnerServiceTypePickerModal from "./PartnerServiceTypePickerModal";
import PartnerHotelFormPage from "./hotel/form/PartnerHotelFormPage";
import PartnerRestaurantFormPage from "./restaurant/form/PartnerRestaurantFormPage";
import PartnerServiceStats from "./services/PartnerServiceStats";
import PartnerServiceFilters from "./services/PartnerServiceFilters";
import PartnerServiceTable from "./services/PartnerServiceTable";
import i18n from "../../../i18n";
import { showError } from "../../../utils/toastUtils";

// BE trả nội dung động dạng Map<string,string> ({ vi, en }) cho endpoint partner (chưa flatten).
// Helper lấy chuỗi theo ngôn ngữ hiện tại, fallback vi -> giá trị đầu tiên.
const pickLocalized = (val) => {
  if (val == null) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object") {
    const lang = i18n.language || "vi";
    return (
      val[lang] ||
      val.vi ||
      Object.values(val).find((v) => typeof v === "string") ||
      ""
    );
  }
  return String(val);
};

const soft = {
  btn: "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition active:scale-[0.98]",
  btnPrimary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
  btnGhost:
    "bg-white dark:bg-gray-800 hover:bg-slate-50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900",
};

const mapServiceStatus = (doc) => {
  const ms = doc?.moderation?.status;
  const active = !!doc?.active;
  if (ms === "PENDING_REVIEW") return "PENDING";
  if (ms === "REJECTED") return "REJECTED";
  if (ms === "BLOCKED") return "ADMIN_BLOCKED";
  if (ms === "APPROVED") return active ? "ACTIVE" : "PARTNER_PAUSED";
  return "PENDING";
};

const pickThumbnail = (doc) => {
  const imgs = doc?.images || [];
  const cover = imgs.find((x) => x?.cover);
  return cover?.url || imgs[0]?.url || "https://picsum.photos/seed/placeholder/800/480";
};

const pickShortDesc = (doc) =>
  pickLocalized(doc?.shortDescription) || pickLocalized(doc?.description) || "—";

function Pagination({ page, totalPages, onPageChange, disabled }) {
  const { t } = useTranslation();
  const canPrev = page > 0;
  const canNext = page + 1 < (totalPages || 0);
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="text-sm text-slate-600 dark:text-slate-400">
        {t("partner.pagination.page")} <b>{(totalPages ?? 0) === 0 ? 0 : page + 1}</b> / <b>{totalPages ?? 0}</b>
      </div>
      <div className="flex items-center gap-2">
        <button
          disabled={disabled || !canPrev}
          onClick={() => onPageChange(page - 1)}
          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          {t("partner.pagination.prev")}
        </button>
        <button
          disabled={disabled || !canNext}
          onClick={() => onPageChange(page + 1)}
          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          {t("partner.pagination.next")}
        </button>
      </div>
    </div>
  );
}

export default function PartnerServiceManager() {
  const {
    hotels,
    restaurants,
    action,
    fetchHotels,
    fetchRestaurants,
    remove,
    pause,
    resume,
    requestUnlock,
    updateHotel,
    createHotel,
    updateRestaurant,
    createRestaurant,
  } = usePartnerServices();

  const { t } = useTranslation();

  const me = useSelector((s) => s.partner?.me?.data);

  const [mode, setMode] = useState("HOTEL");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(true);

  const PAGE_SIZE = 9;
  const [pageBy, setPageBy] = useState({
    HOTEL: {},
    RESTAURANT: {},
  });
  const page = pageBy[mode]?.[status] ?? 0;

  const [modal, setModal] = useState({ open: false, kind: null, service: null, note: "" });
  const [edit, setEdit] = useState({ open: false, service: null });
  const isEditing = !!(edit.open && edit.service);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [create, setCreate] = useState({ open: false, type: null });
  const isCreating = !!(create.open && create.type);

  const statusParam = status === "all" ? undefined : status;

  const reload = () => {
    if (mode === "HOTEL") {
      return fetchHotels({ status: statusParam, page, size: PAGE_SIZE });
    }
    return fetchRestaurants({ status: statusParam, page, size: PAGE_SIZE });
  };

  useEffect(() => {
    if (isEditing || isCreating) return;
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, isCreating, mode, status, page]);

  const sourceList = mode === "HOTEL" ? hotels : restaurants;
  const loading = sourceList.loading;

  const uiItems = useMemo(() => {
    return (sourceList.items || []).map((doc) => ({
      id: doc?.id ?? doc?._id ?? doc?.code ?? doc?.slug ?? "(no-id)",
      name: pickLocalized(doc?.name) || pickLocalized(doc?.title) || "(no-name)",
      type: mode,
      subtype: mode === "HOTEL" ? doc?.hotelType : doc?.restaurantType,
      status: mapServiceStatus(doc),
      rejectReason: doc?.moderation?.rejectionReason || null,
      blockedReason: doc?.moderation?.blockedReason || null,
      thumbnail: pickThumbnail(doc),
      shortDesc: pickShortDesc(doc),
      ownerId:
        doc?.publisher?.partnerName ||
        doc?.publisher?.partnerEmail ||
        doc?.publisher?.partnerId ||
        doc?.partnerId ||
        doc?.ownerId ||
        doc?.createdBy ||
        me?.name ||
        me?.email ||
        me?.partnerId ||
        me?.id ||
        "—",
      raw: doc,
    }));
  }, [sourceList.items, mode, me]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return uiItems;
    return uiItems.filter(
      (s) => (s.name || "").toLowerCase().includes(q) || (s.id || "").toLowerCase().includes(q)
    );
  }, [uiItems, search]);

  const totalCount = sourceList.totalElements ?? uiItems.length;
  const pendingCount = useMemo(
    () => uiItems.filter((x) => x.status === "PENDING").length,
    [uiItems]
  );
  const blockedCount = useMemo(
    () => uiItems.filter((x) => x.status === "ADMIN_BLOCKED").length,
    [uiItems]
  );

  const hasAnyFilter = search.trim() || status !== "all";

  const resetFilters = () => {
    setSearch("");
    setStatus("all");
  };

  const setPage = (nextPage) => {
    setPageBy((prev) => ({
      ...prev,
      [mode]: { ...(prev[mode] || {}), [status]: Math.max(0, nextPage) },
    }));
  };

  const submitModal = async () => {
    const { kind, service, note } = modal;
    if (!service) return;
    if (kind === "UNLOCK" && !note.trim()) return;

    try {
      if (kind === "DELETE") await remove({ type: service.type, id: service.id });
      if (kind === "PAUSE") await pause({ type: service.type, id: service.id });
      if (kind === "RESUME") await resume({ type: service.type, id: service.id });
      if (kind === "UNLOCK")
        await requestUnlock({ type: service.type, id: service.id, reason: note.trim() });
    } catch {
      // Lý do thật đã hiện inline qua action.error (xem render ở trên), không toast lần 2.
      // Giữ modal mở để người dùng thấy lỗi / thử lại; không reload/reset.
      return;
    }

    await reload();
    setModal({ open: false, kind: null, service: null, note: "" });
  };

  // List dùng projection nhẹ (thiếu roomTypes/content...). Mở Sửa phải fetch FULL doc theo id
  // để form không lưu thiếu dữ liệu. Fallback về doc trong list nếu fetch lỗi.
  const [editOpening, setEditOpening] = useState(false);
  const openEdit = async (s) => {
    if (!s?.id) return;
    setEditOpening(true);
    try {
      const res =
        s.type === "HOTEL"
          ? await getPartnerHotelById(s.id)
          : await getPartnerRestaurantById(s.id);
      const fullRaw = res?.success && res.data ? res.data : s.raw;
      setEdit({ open: true, service: { ...s, raw: fullRaw } });
    } finally {
      setEditOpening(false);
    }
  };

  if (isEditing && edit.service?.type === "HOTEL") {
    return (
      <PartnerHotelFormPage
        mode="edit"
        initialRaw={edit.service.raw}
        loading={action.loading}
        onBack={() => setEdit({ open: false, service: null })}
        onSubmit={async (payload) => {
          try {
            await updateHotel({ id: edit.service.id, payload });
          } catch (e) {
            const msg = typeof e === "string" ? e : (e?.message || e?.error);
            showError(msg || t("partner.error.update_hotel"));
            return;
          }
          await reload();
          setEdit({ open: false, service: null });
        }}
      />
    );
  }

  if (isCreating && create.type === "HOTEL") {
    return (
      <PartnerHotelFormPage
        mode="create"
        loading={action.loading}
        onBack={() => setCreate({ open: false, type: null })}
        onSubmit={async (payload) => {
          try {
            await createHotel(payload);
          } catch (e) {
            const msg = typeof e === "string" ? e : (e?.message || e?.error);
            showError(msg || t("partner.error.create_hotel"));
            return;
          }
          await reload();
          setCreate({ open: false, type: null });
        }}
      />
    );
  }

  if (isEditing && edit.service?.type === "RESTAURANT") {
    return (
      <PartnerRestaurantFormPage
        mode="edit"
        initialRaw={edit.service.raw}
        loading={action.loading}
        onBack={() => setEdit({ open: false, service: null })}
        onSubmit={async (payload) => {
          try {
            await updateRestaurant({ id: edit.service.id, payload });
          } catch (e) {
            const msg = typeof e === "string" ? e : (e?.message || e?.error);
            showError(msg || t("partner.error.update_restaurant"));
            return;
          }
          await reload();
          setEdit({ open: false, service: null });
        }}
      />
    );
  }

  if (isCreating && create.type === "RESTAURANT") {
    return (
      <PartnerRestaurantFormPage
        mode="create"
        loading={action.loading}
        onBack={() => setCreate({ open: false, type: null })}
        onSubmit={async (payload) => {
          try {
            await createRestaurant(payload);
          } catch (e) {
            const msg = typeof e === "string" ? e : (e?.message || e?.error);
            showError(msg || t("partner.error.create_restaurant"));
            return;
          }
          await reload();
          setCreate({ open: false, type: null });
        }}
      />
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {t("partner.services.title")}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {t("partner.services.subtitle")}
            </p>
            {action.error && <div className="mt-1 text-sm text-rose-600">{action.error}</div>}
          </div>

          <div className="flex flex-wrap items-center gap-2">
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
                {t("partner.services.tab_hotel")}
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
                {t("partner.services.tab_restaurant")}
              </button>
            </div>

            <button
              onClick={() => setFiltersOpen((v) => !v)}
              className={`${soft.btn} ${soft.btnGhost} gap-2`}
              type="button"
            >
              <FunnelIcon className="h-5 w-5" />
              {t("partner.services.filters")}
            </button>

            <button
              onClick={() => setPickerOpen(true)}
              className={`${soft.btn} ${soft.btnPrimary} gap-2`}
              type="button"
            >
              <PlusIcon className="h-5 w-5" />
              {t("partner.services.add")}
            </button>
          </div>
        </div>

        <PartnerServiceStats
          totalCount={totalCount}
          pendingCount={pendingCount}
          blockedCount={blockedCount}
          visibleCount={filtered.length}
        />
      </div>

      <PartnerServiceFilters
        open={filtersOpen}
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        hasAnyFilter={!!hasAnyFilter}
        onReset={resetFilters}
      />

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {t("partner.services.empty")}
          </p>
        </div>
      ) : (
        <>
          <PartnerServiceTable
            items={filtered}
            acting={action.loading || editOpening}
            onEdit={openEdit}
            onPause={(s) => setModal({ open: true, kind: "PAUSE", service: s, note: "" })}
            onResume={(s) => setModal({ open: true, kind: "RESUME", service: s, note: "" })}
            onRequestUnlock={(s) => setModal({ open: true, kind: "UNLOCK", service: s, note: "" })}
            onDelete={(s) => setModal({ open: true, kind: "DELETE", service: s, note: "" })}
          />

          <Pagination
            page={sourceList.page ?? page}
            totalPages={sourceList.totalPages ?? 0}
            disabled={loading || action.loading}
            onPageChange={setPage}
          />
        </>
      )}

      {modal.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[200]">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">
              {modal.kind === "DELETE" && t("partner.modal.delete_title")}
              {modal.kind === "PAUSE" && t("partner.modal.pause_title")}
              {modal.kind === "RESUME" && t("partner.modal.resume_title")}
              {modal.kind === "UNLOCK" && t("partner.modal.unlock_title")}
            </h3>

            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              {t("partner.modal.service_label")}{" "}
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {modal.service?.name}
              </span>
            </p>

            {(modal.kind === "DELETE" || modal.kind === "UNLOCK") && (
              <>
                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                  {modal.kind === "DELETE"
                    ? t("partner.modal.note_label")
                    : t("partner.modal.unlock_reason_label")}
                </label>
                <textarea
                  value={modal.note}
                  onChange={(e) => setModal((m) => ({ ...m, note: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 h-24 text-sm outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400"
                  placeholder={
                    modal.kind === "DELETE"
                      ? t("partner.modal.note_placeholder")
                      : t("partner.modal.unlock_reason_placeholder")
                  }
                />
              </>
            )}

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setModal({ open: false, kind: null, service: null, note: "" })}
                className={`${soft.btn} ${soft.btnGhost}`}
                disabled={action.loading}
              >
                {t("common.cancel")}
              </button>

              <button
                onClick={submitModal}
                disabled={action.loading || (modal.kind === "UNLOCK" && !modal.note.trim())}
                className={`${soft.btn} text-white disabled:opacity-50 ${
                  modal.kind === "DELETE"
                    ? "bg-slate-800 hover:bg-slate-900"
                    : modal.kind === "PAUSE"
                    ? "bg-rose-600 hover:bg-rose-700"
                    : modal.kind === "RESUME"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {action.loading ? t("common.processing") : t("common.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}

      <PartnerServiceTypePickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={(type) => {
          setPickerOpen(false);
          if (type === "HOTEL") setCreate({ open: true, type: "HOTEL" });
          if (type === "RESTAURANT") setCreate({ open: true, type: "RESTAURANT" });
        }}
      />
    </div>
  );
}
