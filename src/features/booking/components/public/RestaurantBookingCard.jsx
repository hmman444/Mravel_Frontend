import { useEffect, useMemo, useState } from "react";
import { CalendarDays, CreditCard, Hash, UtensilsCrossed, X } from "lucide-react";
import api from "../../../../utils/axiosInstance";
import CancelBookingModal from "../public/BookingCancelModal";

const fmtDateTime = (d) => {
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

const toReservationDateTime = (dateStr, timeStr) => {
  if (!dateStr) return null;
  const [y, m, d] = String(dateStr).split("-").map(Number);
  if (!y || !m || !d) return null;

  let hh = 0, mm = 0;
  if (timeStr && /^\d{2}:\d{2}/.test(timeStr)) {
    const parts = String(timeStr).split(":").map(Number);
    hh = parts[0] || 0;
    mm = parts[1] || 0;
  }
  const dt = new Date(y, m - 1, d, hh, mm, 0, 0);
  return Number.isNaN(dt.getTime()) ? null : dt;
};

const isUsedTimePassedRestaurant = (reservationDate, reservationTime) => {
  const dt = toReservationDateTime(reservationDate, reservationTime);
  if (!dt) return false;
  return dt.getTime() < Date.now();
};

function DetailRow({ label, value, mono = false }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="grid grid-cols-[140px_1fr] gap-3 py-2">
      <div className="text-xs font-semibold text-gray-600 md:text-sm">{label}</div>
      <div
        className={[
          "min-w-0 text-gray-900 break-words",
          mono ? "font-mono text-xs md:text-sm" : "text-xs md:text-sm",
        ].join(" ")}
      >
        {String(value)}
      </div>
    </div>
  );
}

export default function RestaurantBookingCard({
  booking,
  onOpenRestaurant,
  detailScope = "PUBLIC", // PUBLIC | PRIVATE | LOOKUP
  lookupCreds,            // { phoneLast4, email } - dùng khi detailScope="LOOKUP"
  onRefresh,
}) {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReasonInput, setCancelReasonInput] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState(null);

  const PENDING_EXPIRE_MINUTES = 30;

  const [nowTick, setNowTick] = useState(Date.now());
  const [resuming, setResuming] = useState(false);
  const [resumeError, setResumeError] = useState(null);

  const isPendingPay = useMemo(() => {
    const s = String((detail || booking)?.status || "").toUpperCase();
    const p = String((detail || booking)?.paymentStatus || "").toUpperCase();
    return s === "PENDING_PAYMENT" && p === "PENDING";
  }, [detail, booking]);

  const canCancel = useMemo(() => {
    const st = String((detail || booking)?.status || "").toUpperCase();
    if (CANCELLED_SET.has(st)) return false;

    const rd = (detail || booking)?.reservationDate;
    const rt = (detail || booking)?.reservationTime;

    if (isUsedTimePassedRestaurant(rd, rt)) return false;

    const dt = toReservationDateTime(rd, rt);
    return dt ? dt.getTime() > Date.now() : false;
  }, [detail, booking]);

  const showCancelButton = !isPendingPay && canCancel;

  const deadlineMs = useMemo(() => {
    const created = (detail || booking)?.createdAt;
    const t = Date.parse(created);
    if (!created || Number.isNaN(t)) return null;
    return t + PENDING_EXPIRE_MINUTES * 60 * 1000;
  }, [detail, booking]);

  const expiresInMs = deadlineMs ? (deadlineMs - nowTick) : 0;
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

  const onResumePayment = async () => {
    if (!code) return;
    try {
      setResumeError(null);
      setResuming(true);

      let res;

      if (detailScope === "PRIVATE") {
        res = await api.post(`/booking/restaurants/${encodeURIComponent(code)}/resume-payment`);
      } else if (detailScope === "LOOKUP") {
        res = await api.post(`/booking/public/restaurants/lookup/resume`, {
          bookingCode: code,
          phoneLast4: lookupCreds?.phoneLast4,
          email: lookupCreds?.email?.trim() || null,
        });
      } else {
        res = await api.post(`/booking/public/restaurants/my/${encodeURIComponent(code)}/resume-payment`);
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
      return api.post(`/booking/restaurants/${encodeURIComponent(code)}/cancel`, { reason });
    }
    if (detailScope === "LOOKUP") {
      return api.post(`/booking/public/restaurants/lookup/cancel`, {
        bookingCode: code,
        phoneLast4: lookupCreds?.phoneLast4,
        email: lookupCreds?.email?.trim() || null,
        reason,
      });
    }
    return api.post(`/booking/public/restaurants/my/${encodeURIComponent(code)}/cancel`, { reason });
  };

  const onCancelSubmit = async () => {
    if (!code) return;
    try {
      setCancelError(null);
      setCancelLoading(true);

      await callCancelApi({ code, reason: (cancelReasonInput || "").trim() });

      // refresh list ở page cha
      onRefresh?.();

      setCancelOpen(false);
      setCancelReasonInput("");

      // nếu modal detail đang mở => reload detail (giống hotel)
      if (open) {
        setDetail(null);
        setDetailLoading(true);
        const data = await fetchDetail(code);
        setDetail(data ?? null);
        setDetailLoading(false);
      }
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Hủy đơn thất bại";
      setCancelError(msg);
    } finally {
      setCancelLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  //  tách riêng hàm fetchDetail để xử lý LOOKUP/PUBLIC/PRIVATE rõ ràng
  const fetchDetail = async (code) => {
    if (detailScope === "PRIVATE") {
      const res = await api.get(`/booking/restaurants/${encodeURIComponent(code)}`);
      return res.data?.data ?? res.data;
    }

    if (detailScope === "LOOKUP") {
      const res = await api.post(`/booking/public/restaurants/lookup/detail`, {
        bookingCode: code,
        phoneLast4: lookupCreds?.phoneLast4,
        email: lookupCreds?.email?.trim() || null,
      });
      return res.data?.data ?? res.data;
    }

    // PUBLIC (device cookie)
    const res = await api.get(`/booking/public/restaurants/my/${encodeURIComponent(code)}`);
    return res.data?.data ?? res.data;
  };

  useEffect(() => {
    if (!open) return;
    const code = booking?.code;
    if (!code) return;

    let cancelled = false;

    (async () => {
      try {
        setDetailError(null);
        setDetailLoading(true);

        const data = await fetchDetail(code);

        if (!cancelled) setDetail(data ?? null);
      } catch (e) {
        const msg =
          e?.response?.data?.message || e?.message || "Không tải được chi tiết đơn";
        if (!cancelled) setDetailError(msg);
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, booking?.code, detailScope, lookupCreds?.phoneLast4, lookupCreds?.email]);

  const b = detail || booking;

  const {
    code,
    restaurantName,
    restaurantSlug,
    tableTypeName,
    tablesCount,

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

    reservationDate,
    reservationTime,
  } = b || {};

  const reservationLabel = useMemo(() => {
    if (!reservationDate) return "--";
    return `${reservationDate} • ${reservationTime || "--:--"}`;
  }, [reservationDate, reservationTime]);

  if (!booking) return null;

  return (
    <>
      <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
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
              <UtensilsCrossed className="mt-0.5 h-4 w-4 shrink-0 text-gray-600" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900 md:text-base">
                  {restaurantName || "Nhà hàng"}
                </p>
                <p className="mt-0.5 text-xs text-gray-600">
                  Giờ đặt: <span className="font-semibold">{reservationLabel}</span>
                  {typeof tablesCount === "number" ? (
                    <>
                      {" "}· <span className="font-semibold">{tablesCount}</span> bàn
                    </>
                  ) : null}
                  {tableTypeName ? (
                    <>
                      {" "}· <span className="font-semibold">{tableTypeName}</span>
                    </>
                  ) : null}
                </p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-gray-700 md:grid-cols-2 md:text-sm">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-gray-600" />
                <span>Tạo lúc: {fmtDateTime(createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-gray-600" />
                <span>Thanh toán: {paidAt ? fmtDateTime(paidAt) : "Chưa thanh toán"}</span>
              </div>
            </div>

            {restaurantSlug ? (
              <p className="mt-3 text-[11px] text-gray-500">
                Slug: <span className="font-mono">{restaurantSlug}</span>
              </p>
            ) : null}
          </div>

          <div className="flex shrink-0 flex-col gap-2 md:items-stretch">
            <button
              type="button"
              onClick={() => onOpenRestaurant?.(restaurantSlug)}
              className="w-full inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 shadow-sm transition hover:border-blue-400 hover:text-blue-700 md:text-sm"
            >
              Xem nhà hàng
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
                    resuming ? "bg-gray-400 cursor-not-allowed text-white" : "bg-emerald-600 hover:bg-emerald-700 text-white",
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

                {resumeError ? (
                  <p className="text-[11px] text-red-600">{resumeError}</p>
                ) : null}
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
      </article>

      {open ? (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-3xl rounded-2xl bg-white shadow-xl max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-4 py-3 md:px-5 shrink-0">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 md:text-base">
                  Chi tiết đơn đặt bàn
                </h3>
                <p className="mt-0.5 text-xs text-gray-500">
                  Mã: <span className="font-mono">{code}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-4 py-3 md:px-5 md:py-4 overflow-y-auto">
              {detailLoading ? (
                <p className="text-xs text-gray-500">Đang tải chi tiết...</p>
              ) : null}

              {detailError ? (
                <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {detailError}
                </div>
              ) : null}

              <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-gray-200 px-3">
                  <div className="py-3 text-sm font-semibold text-gray-900">Thông tin đơn</div>
                  <div className="h-px bg-gray-100" />
                  <DetailRow label="Mã booking" value={code} mono />
                  <div className="h-px bg-gray-100" />
                  <DetailRow label="Nhà hàng" value={restaurantName} />
                  <div className="h-px bg-gray-100" />
                  <DetailRow label="Giờ đặt" value={reservationLabel} />
                  <div className="h-px bg-gray-100" />
                  <DetailRow label="Loại bàn" value={tableTypeName} />
                  <div className="h-px bg-gray-100" />
                  <DetailRow label="Số bàn" value={tablesCount} />
                  <div className="h-px bg-gray-100" />
                  <DetailRow label="Tạo lúc" value={fmtDateTime(createdAt)} />
                  <div className="h-px bg-gray-100" />
                  <DetailRow label="Thanh toán" value={paidAt ? fmtDateTime(paidAt) : "Chưa thanh toán"} />
                </div>

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
                  </div>
                </div>
              </div>
            </div>

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
        </div>
      ) : null}

      <CancelBookingModal
        open={cancelOpen}
        code={code}
        serviceName={restaurantName || ""}
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