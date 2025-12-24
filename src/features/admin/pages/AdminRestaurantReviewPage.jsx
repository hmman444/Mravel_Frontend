"use client";

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import ReasonModal from "../components/services/ReasonModal";
import { showError, showSuccess } from "../../../utils/toastUtils";
import { useAdminServices } from "../hooks/useAdminServices";

/** === REUSE UI FROM PARTNER FORM === */
import TopBar from "../../partner/components/hotel/form/controls/TopBar"; // reuse
import ImagesSection from "../../partner/components/hotel/form/sections/ImagesSection"; // reuse
import DestinationLocationSection from "../../partner/components/hotel/form/sections/DestinationLocationSection"; // reuse
import AmenityMultiSelect from "../../partner/components/hotel/form/controls/AmenityMultiSelect"; // reuse

import BasicInfoSection from "../../partner/components/restaurant/form/sections/BasicInfoSection";
import ContactLocationSection from "../../partner/components/restaurant/form/sections/ContactLocationSection";
import BookingConfigSection from "../../partner/components/restaurant/form/sections/BookingConfigSection";
import TableTypesEditor from "../../partner/components/restaurant/form/controls/TableTypesEditor";
import RestaurantMetaSection from "../../partner/components/restaurant/form/sections/RestaurantMetaSection";
import CuisinesEditor from "../../partner/components/restaurant/form/controls/CuisinesEditor";
import OpeningHoursEditor from "../../partner/components/restaurant/form/controls/OpeningHoursEditor";
import CodeNameListEditor from "../../partner/components/restaurant/form/controls/CodeNameListEditor";
import SimpleListEditor from "../../partner/components/restaurant/form/controls/SimpleListEditor";

/** === map doc -> form === */
import { mapRestaurantDocToForm } from "../../partner/utils/restaurantFormUtils";

/** === partner amenities hook (reuse) === */
import { usePartnerAmenities } from "../../partner/hooks/usePartnerAmenities";

/** ===== helpers ===== */
const soft = {
  btn: "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60",
  btnPrimary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
  btnGhost:
    "bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900",
  btnDanger: "bg-rose-600 text-white hover:bg-rose-700 shadow-sm",
  btnWarn: "bg-amber-600 text-white hover:bg-amber-700 shadow-sm",
};

function Badge({ children, tone = "slate" }) {
  const map = {
    slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
    amber:
      "bg-amber-50 text-amber-800 ring-1 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:ring-amber-800",
    rose: "bg-rose-50 text-rose-800 ring-1 ring-rose-200 dark:bg-rose-950/40 dark:text-rose-200 dark:ring-rose-800",
    emerald:
      "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:ring-emerald-800",
  };
  return (
    <span className={`rounded-full px-3 py-1 text-xs ${map[tone] || map.slate}`}>
      {children}
    </span>
  );
}

export default function AdminRestaurantReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { selected, detailLoading, acting, loadRestaurantDetail, act } =
    useAdminServices();

  const restaurantAmenity = usePartnerAmenities("RESTAURANT");

  const [reasonOpen, setReasonOpen] = useState(false);
  const [reasonMode, setReasonMode] = useState(null); // "REJECT" | "BLOCK"

  useEffect(() => {
    if (!id) return;
    loadRestaurantDetail(id).catch((e) =>
      showError(typeof e === "string" ? e : "Không tải được chi tiết restaurant")
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const restaurant = selected;
  const mod = restaurant?.moderation || null;
  const status = mod?.status || null;

  const canApprove = status === "PENDING_REVIEW";
  const canReject = status === "PENDING_REVIEW";
  const canBlock = status === "APPROVED";
  const canUnblock = status === "BLOCKED";

  const partnerLabel = useMemo(() => {
    const p = restaurant?.publisher;
    return p?.partnerEmail || p?.partnerName || p?.partnerId || "—";
  }, [restaurant]);

  /** ✅ map doc -> form, đúng như PartnerRestaurantFormPage */
  const form = useMemo(() => {
    return mapRestaurantDocToForm(restaurant || {});
  }, [restaurant]);

  const openReason = (m) => {
    setReasonMode(m);
    setReasonOpen(true);
  };

  const onApprove = async () => {
    try {
      await act({ mode: "RESTAURANT", action: "APPROVE", id });
      showSuccess("Đã approve");
      await loadRestaurantDetail(id);
    } catch (e) {
      showError(typeof e === "string" ? e : "Approve thất bại");
    }
  };

  const onConfirmReason = async (reason) => {
    try {
      await act({ mode: "RESTAURANT", action: reasonMode, id, reason });
      showSuccess(reasonMode === "REJECT" ? "Đã reject" : "Đã block");
      setReasonOpen(false);
      await loadRestaurantDetail(id);
    } catch (e) {
      showError(typeof e === "string" ? e : "Thao tác thất bại");
    }
  };

  const onUnblock = async () => {
    try {
      await act({ mode: "RESTAURANT", action: "UNBLOCK", id });
      showSuccess("Đã unblock");
      await loadRestaurantDetail(id);
    } catch (e) {
      showError(typeof e === "string" ? e : "Unblock thất bại");
    }
  };

  return (
    <AdminLayout>
      {/* ===== Moderation header ===== */}
      <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="text-xs text-slate-500">Restaurant ID: {id}</div>
            <h1 className="mt-1 truncate text-xl font-bold text-slate-900 dark:text-white">
              {restaurant?.name || (detailLoading ? "Đang tải..." : "—")}
            </h1>

            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <Badge
                tone={
                  status === "APPROVED"
                    ? "emerald"
                    : status === "PENDING_REVIEW"
                    ? "amber"
                    : status === "REJECTED"
                    ? "rose"
                    : "slate"
                }
              >
                Status: {status || "—"}
              </Badge>
              <Badge>Active: {String(!!restaurant?.active)}</Badge>
              <Badge>Partner: {partnerLabel}</Badge>
              {mod?.unlockRequestedAt ? (
                <Badge tone="amber">Unlock requested</Badge>
              ) : null}
            </div>

            {mod?.rejectionReason ? (
              <div className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                Lý do bị từ chối: {mod.rejectionReason}
              </div>
            ) : null}
            {mod?.blockedReason ? (
              <div className="mt-2 text-sm text-rose-700 dark:text-rose-300">
                Lý do bị chặn: {mod.blockedReason}
              </div>
            ) : null}
            {mod?.unlockRequestReason ? (
              <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Yêu cầu mở khoá: {mod.unlockRequestReason}
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
              Quay lại
            </button>

            <button
              type="button"
              className={`${soft.btn} ${soft.btnPrimary}`}
              onClick={onApprove}
              disabled={acting || !canApprove}
              title={!canApprove ? "Chỉ approve khi PENDING_REVIEW" : ""}
            >
              Approve
            </button>

            <button
              type="button"
              className={`${soft.btn} ${soft.btnWarn}`}
              onClick={() => openReason("REJECT")}
              disabled={acting || !canReject}
              title={!canReject ? "Chỉ reject khi PENDING_REVIEW" : ""}
            >
              Reject
            </button>

            <button
              type="button"
              className={`${soft.btn} ${soft.btnDanger}`}
              onClick={() => openReason("BLOCK")}
              disabled={acting || !canBlock}
              title={!canBlock ? "Chỉ block khi APPROVED" : ""}
            >
              Block
            </button>

            <button
              type="button"
              className={`${soft.btn} ${soft.btnGhost}`}
              onClick={onUnblock}
              disabled={acting || !canUnblock}
              title={!canUnblock ? "Chỉ unblock khi BLOCKED" : ""}
            >
              Unblock
            </button>
          </div>
        </div>
      </div>

      {/* ===== Form-like details (readonly) ===== */}
      {detailLoading && !restaurant ? (
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="h-12 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800"
            />
          ))}
        </div>
      ) : !restaurant ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Không tìm thấy restaurant.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* TopBar giống partner (nhưng readonly) */}
          <TopBar
            loading={detailLoading}
            onBack={() => navigate(-1)}
            onReset={() => {}}
            onSubmit={() => {}}
            canSubmit={false}
            title="Chi tiết nhà hàng"
            subtitle="Xem đầy đủ thông tin theo đúng layout form của partner."
            submitLabel="—"
            submittingLabel="—"
          />

          {/* Form body y như PartnerRestaurantFormPage */}
          <div className="bg-white rounded-2xl border p-4 space-y-4 dark:bg-slate-900 dark:border-slate-800">
            {/* Các section có prop disabled -> disable trực tiếp */}
            <BasicInfoSection
              form={form}
              setField={() => {}}
              disabled
            />

            <RestaurantMetaSection
              form={form}
              setField={() => {}}
              disabled
            />

            <DestinationLocationSection
              form={form}
              setField={() => {}}
              disabled
            />

            <ContactLocationSection
              form={form}
              setField={() => {}}
              disabled
            />

            {/* Các editor: nếu có disabled prop thì truyền,
                nếu component của bạn chưa hỗ trợ disabled -> bọc pointer-events-none */}
            <div className="pointer-events-none">
              <CuisinesEditor
                value={form.cuisines || []}
                onChange={() => {}}
                disabled
              />
            </div>

            <div className="pointer-events-none">
              <OpeningHoursEditor
                value={form.openingHours || []}
                onChange={() => {}}
                disabled
              />
            </div>

            <div className="pointer-events-none">
              <CodeNameListEditor
                title="Phù hợp (suitableFor)"
                hint="Nhập code + tên hiển thị."
                value={form.suitableFor || []}
                onChange={() => {}}
                disabled
              />
            </div>

            <div className="pointer-events-none">
              <CodeNameListEditor
                title="Không gian (ambience)"
                hint="Nhập code + tên hiển thị."
                value={form.ambience || []}
                onChange={() => {}}
                disabled
              />
            </div>

            <div className="pointer-events-none">
              <SimpleListEditor
                title="Món đặc sắc (signatureDishes)"
                hint="Chỉ cần nhập tên món."
                value={(form.signatureDishes || []).map((x) =>
                  typeof x === "string" ? x : x?.name || ""
                )}
                onChange={() => {}}
                disabled
                placeholder="Ví dụ: Cơm gà Hội An"
              />
            </div>

            <BookingConfigSection
              form={form}
              setField={() => {}}
              disabled
            />

            <AmenityMultiSelect
              title="Tiện ích quán ăn"
              hint={restaurantAmenity.loading ? "Đang tải tiện ích..." : "Tiện ích thuộc quán ăn."}
              items={restaurantAmenity.flat || []}
              value={form.amenityCodes || []}
              onChange={() => {}}
              disabled
            />

            <div className="pointer-events-none">
              <TableTypesEditor
                value={form.tableTypes || []}
                onChange={() => {}}
                disabled
              />
            </div>

            {/* ImagesSection: để readonly -> chặn tương tác */}
            <div className="pointer-events-none">
              <ImagesSection
                images={form.images || []}
                addImageByUrl={() => {}}
                onPickFiles={() => {}}
                setCover={() => {}}
                removeImageAt={() => {}}
                updateImageField={() => {}}
              />
            </div>
          </div>
        </div>
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
