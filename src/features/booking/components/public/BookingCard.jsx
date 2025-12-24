// src/features/booking/components/public/BookingCard.jsx
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, CreditCard, Hotel, Hash, X } from "lucide-react";
import api from "../../../../utils/axiosInstance";
import CancelBookingModal from "../public/BookingCancelModal";

const fmtDate = (d) => {
  if (!d) return "--";
  try {
    return new Date(d).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return String(d);
  }
};

const fmtRange = (checkInDate, checkOutDate) => {
  if (!checkInDate || !checkOutDate) return "--";
  try {
    const a = new Date(checkInDate).toLocaleDateString("vi-VN");
    const b = new Date(checkOutDate).toLocaleDateString("vi-VN");
    return `${a} → ${b}`;
  } catch {
    return `${checkInDate} → ${checkOutDate}`;
  }
};

const badgeClass = (status) => {
  const s = String(status || "").toUpperCase();
  if (s.includes("CONFIRMED") || s.includes("PAID"))
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (s.includes("PENDING"))
    return "bg-yellow-50 text-yellow-700 border-yellow-200";
  if (s.includes("CANCEL"))
    return "bg-red-50 text-red-700 border-red-200";
  return "bg-gray-50 text-gray-700 border-gray-200";
};

const CANCELLED_SET = new Set([
  "CANCELLED",
  "CANCELLED_BY_GUEST",
  "CANCELLED_BY_PARTNER",
  "REFUNDED",
  "PARTIAL_REFUNDED",
]);

const toDateSafe = (v) => {
  if (!v) return null;
  if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v)) {
    const [y, m, d] = v.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    return Number.isNaN(dt.getTime()) ? null : dt;
  }
  const dt = new Date(v);
  return Number.isNaN(dt.getTime()) ? null : dt;
};

const isUsedTimePassedHotel = (checkOutDate) => {
  const d = toDateSafe(checkOutDate);
  if (!d) return false;

  if (typeof checkOutDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(checkOutDate)) {
    const eod = new Date(d);
    eod.setHours(23, 59, 59, 999);
    return eod.getTime() < Date.now();
  }
  return d.getTime() < Date.now();
};

function DetailRow({ label, value, mono = false }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="grid grid-cols-[140px_1fr] gap-3 py-2">
      <div className="text-xs font-semibold text-gray-600 md:text-sm">{label}</div>
      <div
        className={[
          "min-w-0 text-gray-900",
          mono ? "font-mono text-xs md:text-sm" : "text-xs md:text-sm",
          "break-words",
        ].join(" ")}
      >
        {String(value)}
      </div>
    </div>
  );
}

export default function BookingCard({
  booking,
  onOpenHotel,
  detailScope = "PUBLIC", // PUBLIC | PRIVATE | LOOKUP
  lookupCreds,
  onRefresh,
}) {
  // detail state
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const PENDING_EXPIRE_MINUTES = 30;
  const [nowTick, setNowTick] = useState(Date.now());
  const [resuming, setResuming] = useState(false);
  const [resumeError, setResumeError] = useState(null);

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReasonInput, setCancelReasonInput] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState(null);

  const lookupPhoneLast4 = lookupCreds?.phoneLast4 || "";
  const lookupEmail = lookupCreds?.email || null;

  useEffect(() => setMounted(true), []);

  const isPendingPay = useMemo(() => {
    const s = String((detail || booking)?.status || "").trim().toUpperCase();
    const p = String((detail || booking)?.paymentStatus || "").trim().toUpperCase();
    return s === "PENDING_PAYMENT" && p === "PENDING";
  }, [detail, booking]);

  const isConfirmed = useMemo(() => {
    const s = String((detail || booking)?.status || "").trim().toUpperCase();
    return s === "CONFIRMED" || s === "PAID";
  }, [detail, booking]);

  const deadlineMs = useMemo(() => {
    const created = (detail || booking)?.createdAt;
    const t = Date.parse(created);
    if (!created || Number.isNaN(t)) return null;
    return t + PENDING_EXPIRE_MINUTES * 60 * 1000;
  }, [detail, booking]);

  const expiresInMs = deadlineMs ? deadlineMs - nowTick : 0;
  const canResume = isPendingPay && !!deadlineMs && expiresInMs > 0;

  useEffect(() => {
    if (!canResume) return;
    const id = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, [canResume]);

  const fmtCountdown = (ms) => {
    const s = Math.max(0, Math.floor(ms / 1000));
    const mm = String(Math.floor(s / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  };

  const stayRange = useMemo(() => {
    const ci = booking?.checkInDate;
    const co = booking?.checkOutDate;
    return fmtRange(ci, co);
  }, [booking?.checkInDate, booking?.checkOutDate]);

  const canCancel = useMemo(() => {
    const st = String((detail || booking)?.status || "").trim().toUpperCase();

    if (!isConfirmed) return false;
    if (CANCELLED_SET.has(st)) return false;

    const co = (detail || booking)?.checkOutDate;
    if (isUsedTimePassedHotel(co)) return false;

    const ci = (detail || booking)?.checkInDate;
    const d = toDateSafe(ci);
    return d ? d.getTime() > Date.now() : false;
  }, [detail, booking, isConfirmed]);

  const showCancelButton = !canResume && canCancel;

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // Lock scroll when modal open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // fetch detail when open
  useEffect(() => {
    if (!open) return;
    const code = booking?.code;
    if (!code) return;

    let cancelled = false;

    (async () => {
      try {
        setDetailError(null);
        setDetailLoading(true);

        let res;

        if (detailScope === "LOOKUP") {
          res = await api.post(`/booking/public/lookup/detail`, {
            bookingCode: code,
            phoneLast4: lookupPhoneLast4,
            email: lookupEmail,
          });
        } else {
          const url =
            detailScope === "PRIVATE"
              ? `/booking/bookings/${encodeURIComponent(code)}`
              : `/booking/public/my/${encodeURIComponent(code)}`;

          res = await api.get(url);
        }

        const data = res.data?.data ?? null;
        if (!cancelled) setDetail(data);
      } catch (e) {
        const msg = e?.response?.data?.message || e?.message || "Không tải được chi tiết đơn";
        if (!cancelled) setDetailError(msg);
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, booking?.code, detailScope, lookupPhoneLast4, lookupEmail]);

  if (!booking) return null;

  const b = detail || booking;

  const onResumePayment = async () => {
    const code = b?.code;
    if (!code) return;
    try {
      setResumeError(null);
      setResuming(true);

      let res;

      if (detailScope === "PRIVATE") {
        res = await api.post(`/booking/bookings/${encodeURIComponent(code)}/resume-payment`);
      } else if (detailScope === "LOOKUP") {
        res = await api.post(`/booking/public/lookup/resume`, {
          bookingCode: code,
          phoneLast4: lookupPhoneLast4,
          email: lookupEmail,
        });
      } else {
        res = await api.post(`/booking/public/my/${encodeURIComponent(code)}/resume-payment`);
      }

      const dto = res.data?.data;
      const payUrl = dto?.payUrl;
      if (!payUrl) throw new Error("Không nhận được payUrl");
      window.location.assign(payUrl);
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Không thể tiếp tục thanh toán";
      setResumeError(msg);
    } finally {
      setResuming(false);
    }
  };

  const callCancelApi = async ({ code, reason }) => {
    if (detailScope === "PRIVATE") {
      return api.post(`/booking/bookings/${encodeURIComponent(code)}/cancel`, { reason });
    }
    if (detailScope === "LOOKUP") {
      return api.post(`/booking/public/lookup/cancel`, {
        bookingCode: code,
        phoneLast4: lookupPhoneLast4,
        email: lookupEmail,
        reason,
      });
    }
    return api.post(`/booking/public/my/${encodeURIComponent(code)}/cancel`, { reason });
  };

  const onCancelSubmit = async () => {
    const code = b?.code;
    if (!code) return;
    try {
      setCancelError(null);
      setCancelLoading(true);

      await callCancelApi({ code, reason: (cancelReasonInput || "").trim() });
      onRefresh?.();

      setCancelOpen(false);
      setCancelReasonInput("");

      if (open) {
        // reload detail
        setDetail(null);
        setDetailLoading(true);

        let res;
        if (detailScope === "LOOKUP") {
          res = await api.post(`/booking/public/lookup/detail`, {
            bookingCode: code,
            phoneLast4: lookupPhoneLast4,
            email: lookupEmail,
          });
        } else {
          const url =
            detailScope === "PRIVATE"
              ? `/booking/bookings/${encodeURIComponent(code)}`
              : `/booking/public/my/${encodeURIComponent(code)}`;

          res = await api.get(url);
        }

        setDetail(res.data?.data ?? null);
        setDetailLoading(false);
      }
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Hủy đơn thất bại";
      setCancelError(msg);
    } finally {
      setCancelLoading(false);
    }
  };

  const {
    code,
    hotelName,
    hotelSlug,
    roomsCount,
    status,
    paymentStatus,
    createdAt,
    paidAt,

    guestSessionId,
    contactName,
    contactPhone,
    contactEmail,
    note,
    payOption,
    totalAmount,
    amountPaid,
    currencyCode,
    cancelReason: cancelReasonDb,
    cancelledAt: cancelledAtDb,

    checkInDate,
    checkOutDate,
    nights,
    updatedAt,
    rooms,
  } = b;

  const stayRange2 = fmtRange(checkInDate, checkOutDate);

  const modalNode =
    open && mounted
      ? createPortal(
          <div
            className="fixed inset-0 z-[99999] bg-black/55 backdrop-blur-[1px]"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setOpen(false);
            }}
            role="dialog"
            aria-modal="true"
          >
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <div
                className="w-full max-w-3xl rounded-2xl bg-white shadow-xl max-h-[85vh] flex flex-col"
                onMouseDown={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-4 py-3 md:px-5 shrink-0">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 md:text-base">
                      Chi tiết đơn đặt phòng
                    </h3>
                    <p className="mt-0.5 text-xs text-gray-500">
                      Mã: <span className="font-mono">{code}</span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                    aria-label="Đóng"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Body */}
                <div className="px-4 py-3 md:px-5 md:py-4 overflow-y-auto">
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={[
                          "inline-flex items-center rounded-lg border px-2 py-1 text-[11px] font-semibold",
                          badgeClass(status),
                        ].join(" ")}
                      >
                        {status}
                      </span>
                      <span
                        className={[
                          "inline-flex items-center rounded-lg border px-2 py-1 text-[11px] font-semibold",
                          badgeClass(paymentStatus),
                        ].join(" ")}
                      >
                        {paymentStatus}
                      </span>
                      {typeof roomsCount === "number" ? (
                        <span className="text-[11px] font-semibold text-gray-600">
                          · {roomsCount} phòng
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-2 text-xs text-gray-700">
                      <div>
                        Khách sạn:{" "}
                        <span className="font-semibold">{hotelName || "--"}</span>
                      </div>
                      <div className="mt-0.5">
                        Lưu trú: <span className="font-semibold">{stayRange2}</span>
                      </div>
                    </div>
                  </div>

                  {detailLoading ? (
                    <p className="mt-3 text-xs text-gray-500">Đang tải chi tiết...</p>
                  ) : null}

                  {detailError ? (
                    <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                      {detailError}
                    </div>
                  ) : null}

                  <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                    {/* Cột 1 */}
                    <div className="rounded-xl border border-gray-200 px-3">
                      <div className="py-3 text-sm font-semibold text-gray-900">Thông tin đơn</div>
                      <div className="h-px bg-gray-100" />

                      <DetailRow label="Mã booking" value={code} mono />
                      <div className="h-px bg-gray-100" />

                      <DetailRow
                        label="Check-in"
                        value={checkInDate ? new Date(checkInDate).toLocaleDateString("vi-VN") : "--"}
                      />
                      <div className="h-px bg-gray-100" />
                      <DetailRow
                        label="Check-out"
                        value={checkOutDate ? new Date(checkOutDate).toLocaleDateString("vi-VN") : "--"}
                      />
                      <div className="h-px bg-gray-100" />

                      <DetailRow label="Số đêm" value={nights} />
                      <div className="h-px bg-gray-100" />
                      <DetailRow label="Tạo lúc" value={fmtDate(createdAt)} />
                      <div className="h-px bg-gray-100" />
                      <DetailRow label="Cập nhật" value={fmtDate(updatedAt)} />
                      <div className="h-px bg-gray-100" />
                      <DetailRow label="Thanh toán" value={paidAt ? fmtDate(paidAt) : "Chưa thanh toán"} />
                    </div>

                    {/* Cột 2 */}
                    <div className="space-y-3">
                      <div className="rounded-xl border border-gray-200 px-3">
                        <div className="py-3 text-sm font-semibold text-gray-900">Thông tin liên hệ</div>
                        <div className="h-px bg-gray-100" />

                        {guestSessionId ? (
                          <>
                            <DetailRow label="Guest SID" value={guestSessionId} mono />
                            <div className="h-px bg-gray-100" />
                          </>
                        ) : null}

                        <DetailRow label="Tên" value={contactName} />
                        <div className="h-px bg-gray-100" />
                        <DetailRow label="SĐT" value={contactPhone} mono />
                        <div className="h-px bg-gray-100" />
                        <DetailRow label="Email" value={contactEmail} />
                        <div className="h-px bg-gray-100" />
                        <DetailRow label="Ghi chú" value={note} />
                      </div>

                      <div className="rounded-xl border border-gray-200 px-3">
                        <div className="py-3 text-sm font-semibold text-gray-900">Thanh toán</div>
                        <div className="h-px bg-gray-100" />

                        <DetailRow label="Pay option" value={payOption} />
                        <div className="h-px bg-gray-100" />
                        <DetailRow label="Total" value={totalAmount} />
                        <div className="h-px bg-gray-100" />
                        <DetailRow label="Paid" value={amountPaid} />
                        <div className="h-px bg-gray-100" />
                        <DetailRow label="Currency" value={currencyCode} />

                        {cancelReasonDb ? (
                          <>
                            <div className="h-px bg-gray-100" />
                            <DetailRow label="Lý do huỷ" value={cancelReasonDb} />
                          </>
                        ) : null}

                        {cancelledAtDb ? (
                          <>
                            <div className="h-px bg-gray-100" />
                            <DetailRow label="Huỷ lúc" value={fmtDate(cancelledAtDb)} />
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {Array.isArray(rooms) && rooms.length > 0 ? (
                    <div className="mt-4 rounded-xl border border-gray-200 p-3">
                      <div className="text-sm font-semibold text-gray-900">Chi tiết phòng</div>

                      <div className="mt-2 space-y-2 max-h-[260px] overflow-y-auto pr-1">
                        {rooms.map((r) => (
                          <div
                            key={r.id || `${r.roomTypeId}-${r.ratePlanId}-${r.quantity}`}
                            className="rounded-xl border border-gray-100 bg-gray-50 p-3"
                          >
                            <div className="text-sm font-semibold text-gray-900">
                              {r.roomTypeName}{" "}
                              <span className="text-xs font-medium text-gray-600">
                                × {r.quantity} · {r.nights} đêm
                              </span>
                            </div>

                            <div className="mt-1 text-xs text-gray-700">
                              Rate:{" "}
                              <span className="font-semibold">{r.ratePlanName || "--"}</span>
                            </div>

                            <div className="mt-1 text-xs text-gray-700">
                              Giá/đêm: <span className="font-semibold">{r.pricePerNight}</span> · Tổng:{" "}
                              <span className="font-semibold">{r.totalAmount}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
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

                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm transition hover:border-blue-400 hover:text-blue-700"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      {/* ====== CARD ====== */}
      <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-lg bg-gray-50 px-2 py-1 text-[11px] font-semibold text-gray-700">
                <Hash className="h-3.5 w-3.5" />
                {code}
              </span>

              <span
                className={[
                  "inline-flex items-center rounded-lg border px-2 py-1 text-[11px] font-semibold",
                  badgeClass(status),
                ].join(" ")}
              >
                {status}
              </span>

              <span
                className={[
                  "inline-flex items-center rounded-lg border px-2 py-1 text-[11px] font-semibold",
                  badgeClass(paymentStatus),
                ].join(" ")}
              >
                {paymentStatus}
              </span>
            </div>

            <div className="mt-2 flex items-start gap-2">
              <Hotel className="mt-0.5 h-4 w-4 shrink-0 text-gray-600" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900 md:text-base">
                  {hotelName || "Khách sạn"}
                </p>
                <p className="mt-0.5 text-xs text-gray-600">
                  Ngày lưu trú: <span className="font-semibold">{stayRange}</span>
                  {typeof roomsCount === "number" ? (
                    <>
                      {" "}
                      · <span className="font-semibold">{roomsCount}</span> phòng
                    </>
                  ) : null}
                </p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-gray-700 md:grid-cols-2 md:text-sm">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-gray-600" />
                <span>Tạo lúc: {fmtDate(createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-gray-600" />
                <span>Thanh toán: {paidAt ? fmtDate(paidAt) : "Chưa thanh toán"}</span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-2 md:items-stretch">
            <button
              type="button"
              onClick={() => onOpenHotel?.(hotelSlug)}
              className="w-full inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 shadow-sm transition hover:border-blue-400 hover:text-blue-700 md:text-sm"
            >
              Xem khách sạn
            </button>

            <button
              type="button"
              onClick={() => setOpen(true)}
              className="w-full inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 shadow-sm transition hover:border-blue-400 hover:text-blue-700 md:text-sm"
            >
              Xem chi tiết đơn
            </button>

            <button
              type="button"
              onClick={() => code && navigator.clipboard?.writeText(code)}
              className="w-full inline-flex items-center justify-center rounded-xl bg-gray-900 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-gray-800 md:text-sm"
            >
              Copy mã
            </button>

            {canResume ? (
              <>
                <button
                  type="button"
                  onClick={onResumePayment}
                  disabled={resuming}
                  className={[
                    "w-full inline-flex items-center justify-center rounded-xl px-3 py-2 text-xs font-semibold shadow-sm transition md:text-sm",
                    resuming
                      ? "bg-gray-400 cursor-not-allowed text-white"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white",
                  ].join(" ")}
                  title={`Còn ${fmtCountdown(expiresInMs)} để thanh toán`}
                >
                  {resuming ? (
                    "Đang mở MoMo..."
                  ) : (
                    <>
                      Tiếp tục thanh toán{" "}
                      <span className="inline-block w-[52px] text-center font-mono tabular-nums">
                        ({fmtCountdown(expiresInMs)})
                      </span>
                    </>
                  )}
                </button>

                {resumeError ? <p className="text-[11px] text-red-600">{resumeError}</p> : null}
              </>
            ) : null}

            {showCancelButton ? (
              <button
                type="button"
                onClick={() => setCancelOpen(true)}
                className={[
                  "w-full inline-flex items-center justify-center rounded-xl px-3 py-2 text-xs font-semibold shadow-sm transition md:text-sm",
                  "border border-red-600 text-red-600 hover:bg-red-50",
                ].join(" ")}
                title="Hủy đơn"
              >
                Hủy đơn
              </button>
            ) : null}
          </div>
        </div>

        {hotelSlug ? (
          <p className="mt-3 text-[11px] text-gray-500">
            Slug: <span className="font-mono">{hotelSlug}</span>
          </p>
        ) : null}
      </article>

      {/* ====== MODAL (PORTAL) ====== */}
      {modalNode}

      <CancelBookingModal
        open={cancelOpen}
        code={code}
        serviceName={hotelName || ""}
        reason={cancelReasonInput}
        setReason={setCancelReasonInput}
        loading={cancelLoading}
        error={cancelError}
        onClose={() => {
          setCancelOpen(false);
          setCancelError(null);
        }}
        onSubmit={onCancelSubmit}
      />
    </>
  );
}
