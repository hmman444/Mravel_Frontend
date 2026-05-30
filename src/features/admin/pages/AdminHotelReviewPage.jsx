"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import ReasonModal from "../components/services/ReasonModal";
import { showError, showSuccess } from "../../../utils/toastUtils";
import { useAdminServices } from "../hooks/useAdminServices";

//  reuse y hệt partner sections
import BasicInfoSection from "../../partner/components/hotel/form/sections/BasicInfoSection";
import ContactLocationSection from "../../partner/components/hotel/form/sections/ContactLocationSection";
import DestinationLocationSection from "../../partner/components/hotel/form/sections/DestinationLocationSection";
import TaxAndFeeSection from "../../partner/components/hotel/form/sections/TaxAndFeeSection";
import BookingConfigSection from "../../partner/components/hotel/form/sections/BookingConfigSection";
import PolicySection from "../../partner/components/hotel/form/sections/PolicySection";
import ImagesSection from "../../partner/components/hotel/form/sections/ImagesSection";
import ContentBlocksSection from "../../partner/components/hotel/form/sections/ContentBlocksSection";
import FaqsSection from "../../partner/components/hotel/form/sections/FaqsSection";
import AmenityMultiSelect from "../../partner/components/hotel/form/controls/AmenityMultiSelect";
import RoomTypesEditor from "../../partner/components/hotel/form/controls/RoomTypesEditor";

import { usePartnerAmenities } from "../../partner/hooks/usePartnerAmenities";
import { mapHotelDocToForm } from "../../partner/utils/hotelFormUtils";

const soft = {
  btn: "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60",
  btnPrimary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
  btnGhost:
    "bg-white dark:bg-gray-800 hover:bg-slate-50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900",
  btnDanger: "bg-rose-600 text-white hover:bg-rose-700 shadow-sm",
  btnWarn: "bg-amber-600 text-white hover:bg-amber-700 shadow-sm",
};

export default function AdminHotelReviewPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const { selected, detailLoading, acting, loadHotelDetail, act } = useAdminServices();

  const hotelAmenity = usePartnerAmenities("HOTEL");
  const roomAmenity = usePartnerAmenities("ROOM");

  const [reasonOpen, setReasonOpen] = useState(false);
  const [reasonMode, setReasonMode] = useState(null); // "REJECT" | "BLOCK"

  useEffect(() => {
    if (!id) return;
    loadHotelDetail(id).catch((e) =>
      showError(typeof e === "string" ? e : t("admin.hotel_detail_load_failed"))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const hotel = selected;
  const mod = hotel?.moderation || null;
  const status = mod?.status || null;

  // rule BE hiện tại
  const canApprove = status === "PENDING_REVIEW";
  const canReject = status === "PENDING_REVIEW";
  const canBlock = status === "APPROVED";
  const canUnblock = status === "BLOCKED";

  const partnerLabel = useMemo(() => {
    const p = hotel?.publisher;
    return p?.partnerEmail || p?.partnerName || p?.partnerId || "—";
  }, [hotel]);

  const onApprove = async () => {
    try {
      await act({ mode: "HOTEL", action: "APPROVE", id });
      showSuccess(t("admin.hotel_approve_success"));
      await loadHotelDetail(id);
    } catch (e) {
      showError(typeof e === "string" ? e : t("admin.hotel_approve_failed"));
    }
  };

  const openReason = (m) => {
    setReasonMode(m);
    setReasonOpen(true);
  };

  const onConfirmReason = async (reason) => {
    try {
      await act({ mode: "HOTEL", action: reasonMode, id, reason });
      showSuccess(reasonMode === "REJECT" ? t("admin.hotel_reject_success") : t("admin.hotel_block_success"));
      setReasonOpen(false);
      await loadHotelDetail(id);
    } catch (e) {
      showError(typeof e === "string" ? e : t("admin.action_failed"));
    }
  };

  const onUnblock = async () => {
    try {
      await act({ mode: "HOTEL", action: "UNBLOCK", id });
      showSuccess(t("admin.hotel_unblock_success"));
      await loadHotelDetail(id);
    } catch (e) {
      showError(typeof e === "string" ? e : t("admin.hotel_unblock_failed"));
    }
  };

  //  map đúng “form structure partner”
  const form = useMemo(() => mapHotelDocToForm(hotel || {}), [hotel]);

  //  readonly: setField NO-OP
  const setField = () => {};

  return (
    <AdminLayout>
      {/*  Header + Moderation actions  */}
      <div className="mb-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-800 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="text-xs text-slate-500">Hotel ID: {id}</div>
            <h1 className="mt-1 truncate text-xl font-bold text-slate-900 dark:text-white">
              {form?.name || (detailLoading ? t("common.loading") : "—")}
            </h1>

            <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-200">
              <span className="rounded-full bg-slate-100 dark:bg-gray-800 px-3 py-1 dark:bg-slate-800">
                Status: {status || "—"}
              </span>
              <span className="rounded-full bg-slate-100 dark:bg-gray-800 px-3 py-1 dark:bg-slate-800">
                Active: {String(!!hotel?.active)}
              </span>
              <span className="rounded-full bg-slate-100 dark:bg-gray-800 px-3 py-1 dark:bg-slate-800">
                Partner: {partnerLabel}
              </span>
            </div>

            {mod?.rejectionReason ? (
              <div className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                {t("admin.rejection_reason_label")}: {mod.rejectionReason}
              </div>
            ) : null}
            {mod?.blockedReason ? (
              <div className="mt-2 text-sm text-rose-700 dark:text-rose-300">
                {t("admin.blocked_reason_label")}: {mod.blockedReason}
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={`${soft.btn} ${soft.btnGhost}`}
              onClick={() => navigate(-1)}
              disabled={acting}
            >
              {t("common.back")}
            </button>

            <button
              type="button"
              className={`${soft.btn} ${soft.btnPrimary}`}
              onClick={onApprove}
              disabled={acting || !canApprove}
            >
              Approve
            </button>

            <button
              type="button"
              className={`${soft.btn} ${soft.btnWarn}`}
              onClick={() => openReason("REJECT")}
              disabled={acting || !canReject}
            >
              Reject
            </button>

            <button
              type="button"
              className={`${soft.btn} ${soft.btnDanger}`}
              onClick={() => openReason("BLOCK")}
              disabled={acting || !canBlock}
            >
              Block
            </button>

            <button
              type="button"
              className={`${soft.btn} ${soft.btnGhost}`}
              onClick={onUnblock}
              disabled={acting || !canUnblock}
            >
              Unblock
            </button>
          </div>
        </div>
      </div>

      {/*  Partner-form structure (READONLY)  */}
      {detailLoading && !hotel ? (
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      ) : !hotel ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-300">{t("admin.hotel_not_found")}</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border p-4 space-y-4 dark:bg-slate-900 dark:border-slate-800">
          <BasicInfoSection form={form} setField={setField} disabled />
          <ContactLocationSection form={form} setField={setField} disabled />
          <DestinationLocationSection form={form} setField={setField} disabled />

          <TaxAndFeeSection form={form} setField={setField} disabled />
          <BookingConfigSection form={form} setField={setField} disabled />

          <PolicySection form={form} setField={setField} disabled />

          <AmenityMultiSelect
            title={t("admin.hotel_amenities_title")}
            hint={hotelAmenity.loading ? t("admin.amenities_loading") : t("admin.hotel_amenities_hint")}
            items={hotelAmenity.flat || []}
            value={form.amenities || []}
            onChange={() => {}}
          />

          <RoomTypesEditor
            roomAmenities={roomAmenity.flat || []}
            value={form.roomTypes || []}
            onChange={() => {}}
            disabled
          />

          <ImagesSection
            images={form.images || []}
            addImageByUrl={() => {}}
            onPickFiles={() => {}}
            setCover={() => {}}
            removeImageAt={() => {}}
            updateImageField={() => {}}
            disabled
          />

          <ContentBlocksSection
            content={form.content || []}
            addBlock={() => {}}
            removeBlockAt={() => {}}
            updateBlockField={() => {}}
            onPickBlockImage={() => {}}
            disabled
          />

          <FaqsSection form={form} setField={setField} disabled />
        </div>
      )}

      <ReasonModal
        open={reasonOpen}
        title={reasonMode === "REJECT" ? t("admin.reject_service_title") : t("admin.block_service_title")}
        confirmText={reasonMode === "REJECT" ? "Reject" : "Block"}
        loading={acting}
        onClose={() => setReasonOpen(false)}
        onConfirm={onConfirmReason}
      />
    </AdminLayout>
  );
}
