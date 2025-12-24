// src/features/partner/components/PartnerBookingDetailModal.jsx
import { useEffect } from "react";
import Badge from "./Badge";
import {
  BOOKING_STATUS,
  PAYMENT_STATUS,
  SERVICE_STATUS,
  fmtMoney,
  fmtDT,
  fmtDate,
  pickCreatedAt,
  pickService,
  pickCustomer,
  pickBookingStatus,
  pickPaymentStatus,
  pickAmount,
  pickUsedStart,
  pickUsedEnd,
  pickSnapshot,
} from "../utils/partnerBookingUtils";

import { XMarkIcon } from "@heroicons/react/24/outline";

function DetailRow({ label, value, mono = false }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    //  thu label column lại chút
    <div className="grid grid-cols-[120px_1fr] gap-3 py-2">
      <div className="text-xs font-semibold text-gray-600 md:text-sm">{label}</div>
      <div
        className={[
          "min-w-0 break-words text-gray-900",
          mono ? "font-mono text-xs md:text-sm" : "text-xs md:text-sm",
        ].join(" ")}
      >
        {String(value)}
      </div>
    </div>
  );
}

export default function PartnerBookingDetailModal({
  open,
  code,
  data,
  type,
  loading,
  error,
  canCancel,
  actionLoading,
  onClose,
  onOpenCancelFromDetail,
}) {
  //  Hooks luôn gọi ở top-level (không đặt sau early return)
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const service = pickService(data) || {};
  const customer = pickCustomer(data) || {};
  const bookingStatus = pickBookingStatus(data);
  const paymentStatus = pickPaymentStatus(data);

  const createdAt = pickCreatedAt(data);
  const usedStart = pickUsedStart(data, type);
  const usedEnd = pickUsedEnd(data, type);

  const snapshot = pickSnapshot(data) || {};

  //  các field tổng/tuỳ chọn (nếu BE có trả)
  const totalAmount =
    data?.totalAmount ?? data?.amountTotal ?? snapshot?.totalAmount ?? snapshot?.amountTotal ?? null;

  const payOption =
    data?.payOption ?? data?.paymentOption ?? snapshot?.payOption ?? snapshot?.paymentOption ?? null;

  const paidAt =
    data?.paidAt ?? data?.paymentPaidAt ?? snapshot?.paidAt ?? snapshot?.paymentPaidAt ?? null;

  const updatedAt = data?.updatedAt ?? snapshot?.updatedAt ?? null;

  const cancelReason = data?.cancelReason ?? snapshot?.cancelReason ?? null;
  const cancelledAt = data?.cancelledAt ?? snapshot?.cancelledAt ?? null;

  //  IMPORTANT: amountPaid phải lấy đúng field amountPaid/amount_paid, KHÔNG fallback sang total
  const amountPaidRaw =
    data?.amountPaid ??
    data?.amount_paid ??
    snapshot?.amountPaid ??
    snapshot?.amount_paid ??
    // fallback cuối cùng mới dùng pickAmount (nếu util đã map đúng)
    pickAmount(data) ??
    null;

  const amountPaid =
    amountPaidRaw != null ? Number(amountPaidRaw) : null;

  const roomsCount =
    data?.roomsCount ??
    (Array.isArray(data?.rooms)
      ? data.rooms.reduce((s, r) => s + (Number(r?.quantity) || 0), 0)
      : null) ??
    snapshot?.rooms ??
    null;

  const guestsCount = data?.guests ?? snapshot?.guests ?? null;

  const st = BOOKING_STATUS[bookingStatus] || {
    label: bookingStatus || "--",
    cls: "bg-gray-100 text-gray-600",
  };
  const ps = PAYMENT_STATUS[paymentStatus] || {
    label: paymentStatus || "--",
    cls: "bg-gray-100 text-gray-600",
  };
  const sv = service?.serviceStatus
    ? SERVICE_STATUS[service.serviceStatus] || {
        label: service.serviceStatus,
        cls: "bg-gray-100 text-gray-600",
      }
    : null;

  const roomLines = Array.isArray(data?.rooms)
    ? data.rooms
    : Array.isArray(snapshot?.roomsDetail)
    ? snapshot.roomsDetail
    : [];

  return (
    <div
      className="fixed left-0 right-0 bottom-0 top-10 z-50 bg-black/40 p-4 flex items-center justify-center"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-3xl rounded-2xl bg-white shadow-xl max-h-[85vh] flex flex-col"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-4 py-3 md:px-5 shrink-0">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 md:text-base">Chi tiết đơn</h3>
            <p className="mt-0.5 text-xs text-gray-500">
              Mã: <span className="font-mono text-gray-800">{code}</span>
              {" • "}
              Tạo lúc: {fmtDT(createdAt)}
            </p>

            <div className="mt-2 flex flex-wrap gap-2">
              <Badge
                text={type === "HOTEL" ? "Khách sạn" : "Quán ăn"}
                className={type === "HOTEL" ? "bg-blue-50 text-blue-700" : "bg-emerald-50 text-emerald-700"}
              />
              <Badge text={st.label} className={st.cls} />
              <Badge text={ps.label} className={ps.cls} />
              {sv ? <Badge text={sv.label} className={sv.cls} /> : null}
              {service?.softDeleted ? <Badge text="Dịch vụ đã ẩn" className="bg-orange-50 text-orange-700" /> : null}
            </div>
          </div>

          <button
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
            aria-label="Đóng"
            title="Đóng"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 py-3 md:px-5 md:py-4 overflow-y-auto">
          {loading ? (
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-6 text-center text-sm text-gray-500">
              Đang tải chi tiết...
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {String(error)}
            </div>
          ) : (
            <>
              {/*  Thu cột “Thông tin đơn” lại chút: trái 0.9fr, phải 1.1fr */}
              <div className="grid grid-cols-1 gap-3 md:grid-cols-[0.9fr_1.1fr]">
                {/* Cột trái */}
                <div className="rounded-xl border border-gray-200 px-3">
                  <div className="py-3 text-sm font-semibold text-gray-900">Thông tin đơn</div>
                  <div className="h-px bg-gray-100" />

                  <DetailRow label="Mã booking" value={code} mono />
                  <div className="h-px bg-gray-100" />

                  <DetailRow label="Tạo lúc" value={fmtDT(createdAt)} />
                  <div className="h-px bg-gray-100" />

                  <DetailRow label="Cập nhật" value={updatedAt ? fmtDT(updatedAt) : null} />
                  <div className="h-px bg-gray-100" />

                  {type === "HOTEL" ? (
                    <>
                      <DetailRow label="Check-in" value={fmtDate(usedStart)} />
                      <div className="h-px bg-gray-100" />
                      <DetailRow label="Check-out" value={fmtDate(usedEnd)} />
                      <div className="h-px bg-gray-100" />
                      <DetailRow label="Số phòng" value={roomsCount} />
                      <div className="h-px bg-gray-100" />
                      <DetailRow label="Số khách" value={guestsCount} />
                    </>
                  ) : (
                    <>
                      <DetailRow label="Ngày/Giờ" value={fmtDT(usedStart)} />
                      <div className="h-px bg-gray-100" />
                      <DetailRow label="Số người" value={snapshot?.people ?? data?.people ?? null} />
                      <div className="h-px bg-gray-100" />
                      <DetailRow label="Số bàn" value={snapshot?.tables ?? data?.tables ?? null} />
                    </>
                  )}
                </div>

                {/* Cột phải */}
                <div className="space-y-3">
                  {/* Dịch vụ */}
                  <div className="rounded-xl border border-gray-200 px-3">
                    <div className="py-3 text-sm font-semibold text-gray-900">Dịch vụ</div>
                    <div className="h-px bg-gray-100" />
                    <DetailRow label="Tên" value={service?.name} />
                    <div className="h-px bg-gray-100" />
                    <DetailRow label="Thành phố" value={service?.city} />
                    <DetailRow label="Địa chỉ" value={service?.address ?? service?.fullAddress ?? null} />
                    <DetailRow label="Slug" value={service?.slug ?? null} mono />
                    {/*  bỏ Service ID theo yêu cầu */}
                  </div>

                  {/* Khách hàng */}
                  <div className="rounded-xl border border-gray-200 px-3">
                    <div className="py-3 text-sm font-semibold text-gray-900">Khách hàng</div>
                    <div className="h-px bg-gray-100" />
                    <DetailRow label="Tên" value={customer?.name} />
                    <div className="h-px bg-gray-100" />
                    <DetailRow label="SĐT" value={customer?.phone} mono />
                    <div className="h-px bg-gray-100" />
                    <DetailRow label="Email" value={customer?.email} />
                  </div>

                  {/* Thanh toán */}
                  <div className="rounded-xl border border-gray-200 px-3">
                    <div className="py-3 text-sm font-semibold text-gray-900">Thanh toán</div>
                    <div className="h-px bg-gray-100" />
                    <DetailRow label="Pay option" value={payOption} />
                    <div className="h-px bg-gray-100" />
                    <DetailRow label="Tổng tiền" value={totalAmount != null ? fmtMoney(totalAmount) : null} />
                    <div className="h-px bg-gray-100" />
                    <DetailRow
                      label="Đã trả"
                      value={amountPaid != null ? fmtMoney(amountPaid) : null}
                    />
                    <div className="h-px bg-gray-100" />
                    <DetailRow label="Thanh toán lúc" value={paidAt ? fmtDT(paidAt) : null} />

                    {cancelReason ? (
                      <>
                        <div className="h-px bg-gray-100" />
                        <DetailRow label="Lý do huỷ" value={cancelReason} />
                      </>
                    ) : null}

                    {cancelledAt ? (
                      <>
                        <div className="h-px bg-gray-100" />
                        <DetailRow label="Huỷ lúc" value={fmtDT(cancelledAt)} />
                      </>
                    ) : null}

                    {snapshot?.note ? (
                      <>
                        <div className="h-px bg-gray-100" />
                        <DetailRow label="Ghi chú" value={snapshot.note} />
                      </>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Chi tiết rooms */}
              {type === "HOTEL" && Array.isArray(roomLines) && roomLines.length > 0 ? (
                <div className="mt-4 rounded-xl border border-gray-200 p-3">
                  <div className="text-sm font-semibold text-gray-900">Chi tiết phòng</div>

                  <div className="mt-2 space-y-2 max-h-[260px] overflow-y-auto pr-1">
                    {roomLines.map((r, idx) => (
                      <div key={r?.id || `${idx}`} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                        <div className="text-sm font-semibold text-gray-900">
                          {r?.roomTypeName || r?.name || "Phòng"}
                          {r?.quantity != null ? (
                            <span className="ml-2 text-xs font-medium text-gray-600">× {r.quantity}</span>
                          ) : null}
                        </div>

                        <div className="mt-1 text-xs text-gray-700">
                          Rate: <span className="font-semibold">{r?.ratePlanName || r?.rateName || "--"}</span>
                        </div>

                        {(r?.pricePerNight != null || r?.totalAmount != null) ? (
                          <div className="mt-1 text-xs text-gray-700">
                            {r?.pricePerNight != null ? (
                              <>
                                Giá/đêm: <span className="font-semibold">{fmtMoney(r.pricePerNight)}</span>
                              </>
                            ) : null}
                            {r?.pricePerNight != null && r?.totalAmount != null ? " • " : null}
                            {r?.totalAmount != null ? (
                              <>
                                Tổng: <span className="font-semibold">{fmtMoney(r.totalAmount)}</span>
                              </>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-2 border-t border-gray-100 px-4 py-3 md:flex-row md:items-center md:justify-end md:px-5 shrink-0">
          <button
            type="button"
            onClick={() => code && navigator.clipboard?.writeText(code)}
            className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800"
          >
            Copy mã booking
          </button>

          {canCancel ? (
            <button
              disabled={actionLoading}
              onClick={onOpenCancelFromDetail}
              className={[
                "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition",
                actionLoading ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700",
              ].join(" ")}
              title="Hủy đơn (Partner)"
            >
              {actionLoading ? "Đang xử lý..." : "Hủy đơn (Partner)"}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}