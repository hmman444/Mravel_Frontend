// src/features/partner/utils/partnerBookingUtils.js
import i18n from "../../../i18n";

//  Helpers
export const fmtMoney = (v) => {
  if (v == null) return "--";
  try {
    return new Intl.NumberFormat("vi-VN").format(v) + "đ";
  } catch {
    return `${v}đ`;
  }
};

export const fmtDT = (iso) => {
  if (!iso) return "--";
  try {
    return new Date(iso).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return iso;
  }
};

export const fmtDate = (iso) => {
  if (!iso) return "--";
  try {
    return new Date(iso).toLocaleDateString("vi-VN");
  } catch {
    return iso;
  }
};

export const isFuture = (iso) => {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? t > Date.now() : false;
};

//  Status configs 
export const BOOKING_STATUS = {
  PENDING_PAYMENT: { get label() { return i18n.t("partner.booking_status.pending_payment"); }, cls: "bg-yellow-100 text-yellow-700" },
  PAID: { get label() { return i18n.t("partner.booking_status.paid"); }, cls: "bg-emerald-100 text-emerald-700" },
  CONFIRMED: { get label() { return i18n.t("partner.booking_status.confirmed"); }, cls: "bg-blue-100 text-blue-700" },
  COMPLETED: { get label() { return i18n.t("partner.booking_status.completed"); }, cls: "bg-green-100 text-green-700" },
  CANCELLED: { get label() { return i18n.t("partner.booking_status.cancelled"); }, cls: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400" },
  CANCELLED_BY_GUEST: { get label() { return i18n.t("partner.booking_status.cancelled_by_guest"); }, cls: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400" },
  CANCELLED_BY_PARTNER: { get label() { return i18n.t("partner.booking_status.cancelled_by_partner"); }, cls: "bg-red-100 text-red-700" },
  REFUNDED: { get label() { return i18n.t("partner.booking_status.refunded"); }, cls: "bg-purple-100 text-purple-700" },

  // fallback mapping cũ
  PENDING: { get label() { return i18n.t("partner.booking_status.pending"); }, cls: "bg-yellow-100 text-yellow-700" },
};

export const PAYMENT_STATUS = {
  PENDING: { get label() { return i18n.t("partner.payment_status.pending"); }, cls: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400" },
  SUCCESS: { get label() { return i18n.t("partner.payment_status.success"); }, cls: "bg-green-100 text-green-700" },
  FAILED: { get label() { return i18n.t("partner.payment_status.failed"); }, cls: "bg-red-100 text-red-700" },
  REFUNDED: { get label() { return i18n.t("partner.payment_status.refunded"); }, cls: "bg-purple-100 text-purple-700" },
  PARTIAL_REFUNDED: { get label() { return i18n.t("partner.payment_status.partial_refunded"); }, cls: "bg-purple-100 text-purple-700" },

  // fallback cũ
  UNPAID: { get label() { return i18n.t("partner.payment_status.unpaid"); }, cls: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400" },
  PAID: { get label() { return i18n.t("partner.payment_status.paid"); }, cls: "bg-green-100 text-green-700" },
};

export const SERVICE_STATUS = {
  ACTIVE: { get label() { return i18n.t("partner.service_status.active"); }, cls: "bg-green-100 text-green-700" },
  PENDING: { get label() { return i18n.t("partner.service_status.pending"); }, cls: "bg-yellow-100 text-yellow-700" },
  REJECTED: { get label() { return i18n.t("partner.service_status.rejected"); }, cls: "bg-red-100 text-red-700" },
  PARTNER_PAUSED: { get label() { return i18n.t("partner.service_status.partner_paused"); }, cls: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400" },
  ADMIN_BLOCKED: { get label() { return i18n.t("partner.service_status.admin_blocked"); }, cls: "bg-red-100 text-red-700" },
};

//  pick helpers 
export const pickCode = (b) => b?.code || b?.bookingCode || b?.booking_code || b?.id;
export const pickBookingStatus = (b) => b?.bookingStatus || b?.status || b?.booking_status;
export const pickPaymentStatus = (b) => b?.paymentStatus || b?.payment?.status || b?.payStatus || b?.payment_status;

/**
 *  FIX: cột "Số tiền" cần render "số tiền gốc" (totalAmount/amountPayable),
 * không ưu tiên amountPaid (vì đơn hủy thường amountPaid = 0).
 */
export const pickAmount = (b) =>
  b?.totalAmount ??
  b?.amountPayable ??
  b?.depositAmount ??
  b?.amountPaid ??
  b?.paidAmount ??
  b?.totalPaid ??
  b?.amount;

export const pickCreatedAt = (b) => b?.createdAt || b?.created_at || b?.createdDate;

/**
 *  FIX: cột "Dịch vụ" đang trống vì list trả hotelName/restaurantName ở root
 * mà fallback chỉ đọc serviceName/name.
 */
export const pickService = (b) =>
  b?.service ||
  b?.hotel ||
  b?.restaurant || {
    id: b?.serviceId || b?.service_id || b?.hotelId || b?.restaurantId,
    name: b?.serviceName || b?.name || b?.hotelName || b?.restaurantName,
    city: b?.city,
    serviceStatus: b?.serviceStatus,
    softDeleted: b?.softDeleted,
  };

export const pickCustomer = (b) =>
  b?.customer ||
  b?.guest || {
    name: b?.customerName || b?.guestName || b?.contactName,
    phone: b?.customerPhone || b?.guestPhone || b?.contactPhone,
    email: b?.customerEmail || b?.guestEmail || b?.contactEmail,
  };

export const pickUsedStart = (b, type) => {
  if (b?.usedAtStart) return b.usedAtStart;

  if (type === "HOTEL") return b?.checkInAt || b?.checkInDate || b?.startDate;

  //  BONUS FIX: nếu booking quán ăn trả reservationDate + reservationTime thì join lại
  if (b?.reservationDate && b?.reservationTime) {
    // reservationTime có thể là "19:00" hoặc "19:00:00"
    const t = String(b.reservationTime);
    const time = t.length === 5 ? `${t}:00` : t; // "HH:mm" -> "HH:mm:ss"
    return `${b.reservationDate}T${time}`;
  }

  return b?.reservationAt || b?.usedAt || b?.startTime || b?.time || b?.reservationDateTime;
};

export const pickUsedEnd = (b, type) => {
  if (b?.usedAtEnd) return b.usedAtEnd;
  if (type === "HOTEL") return b?.checkOutAt || b?.checkOutDate || b?.endDate;
  return null;
};

export const pickSnapshot = (b) => b?.snapshot || b?.meta || b?.details || null;

export const STATUS_TABS = [
  { key: "all", get label() { return i18n.t("common.all"); } },
  { key: "PENDING_PAYMENT", get label() { return i18n.t("partner.booking_status.pending_payment"); } },
  { key: "CONFIRMED", get label() { return i18n.t("partner.booking_status.confirmed"); } },
  { key: "COMPLETED", get label() { return i18n.t("partner.booking_status.completed"); } },
  { key: "CANCELLED", get label() { return i18n.t("partner.booking_status.cancelled"); } },
  { key: "CANCELLED_BY_PARTNER", get label() { return i18n.t("partner.booking_status.cancelled_by_partner"); } },
];

export const TYPE_OPTIONS = [
  { key: "ALL", get label() { return i18n.t("partner.type_option.all"); } },
  { key: "HOTEL", get label() { return i18n.t("partner.type_option.hotel"); } },
  { key: "RESTAURANT", get label() { return i18n.t("partner.type_option.restaurant"); } },
];

export const CANCELLED_SET = new Set([
  "CANCELLED",
  "CANCELLED_BY_GUEST",
  "CANCELLED_BY_PARTNER",
  "REFUNDED",
]);

//  time helpers (ADD) 
const isDateOnly = (v) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);

const parseLocalDateOnly = (yyyyMMdd) => {
  const m = String(yyyyMMdd || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const y = Number(m[1]), mo = Number(m[2]), d = Number(m[3]);
  return new Date(y, mo - 1, d); // local timezone
};

const toDateSafe = (v) => {
  if (!v) return null;
  if (isDateOnly(v)) return parseLocalDateOnly(v);
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};

// "đã qua thời gian sử dụng" (ADD)
export const isUsedTimePassed = (b) => {
  const type = b?.__type;

  if (type === "HOTEL") {
    const end = pickUsedEnd(b, type); // checkOutDate
    if (!end) return false;

    const d = toDateSafe(end);
    if (!d) return false;

    // Nếu là date-only => xét cuối ngày checkout (23:59:59)
    if (isDateOnly(end)) {
      const eod = new Date(d);
      eod.setHours(23, 59, 59, 999);
      return eod.getTime() < Date.now();
    }

    return d.getTime() < Date.now();
  }

  // RESTAURANT: usedStart là reservation datetime
  const start = pickUsedStart(b, type);
  const d = toDateSafe(start);
  return d ? d.getTime() < Date.now() : false;
};

// status "đã xác nhận" (ADD)
export const isConfirmedLike = (b) => {
  const s = String(pickBookingStatus(b) || "").toUpperCase();
  return s === "CONFIRMED" || s === "PAID";
};