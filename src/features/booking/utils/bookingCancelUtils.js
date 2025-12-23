export const CANCELLED_SET = new Set([
  "CANCELLED",
  "CANCELLED_BY_GUEST",
  "CANCELLED_BY_PARTNER",
  "REFUNDED",
]);

export const isFuture = (v) => {
  const d = new Date(v);
  return Number.isFinite(d.getTime()) ? d.getTime() > Date.now() : false;
};

export const isUsedTimePassedHotel = (checkOutDate) => {
  if (!checkOutDate) return false;
  // nếu dạng YYYY-MM-DD => tính đến cuối ngày
  if (/^\d{4}-\d{2}-\d{2}$/.test(checkOutDate)) {
    const [y, m, d] = checkOutDate.split("-").map(Number);
    const eod = new Date(y, m - 1, d, 23, 59, 59, 999);
    return eod.getTime() < Date.now();
  }
  const t = new Date(checkOutDate).getTime();
  return Number.isFinite(t) ? t < Date.now() : false;
};

export const isUsedTimePassedRestaurant = (reservationDate, reservationTime) => {
  if (!reservationDate) return false;
  const time = (reservationTime || "00:00").length === 5 ? `${reservationTime}:00` : (reservationTime || "00:00:00");
  const iso = `${reservationDate}T${time}`;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? t < Date.now() : false;
};

// USER canCancel (hotel)
export const canCancelHotel = (b) => {
  const st = String(b?.status || "").toUpperCase();
  if (CANCELLED_SET.has(st)) return false;

  // đã qua thời gian sử dụng => không cho hủy
  if (isUsedTimePassedHotel(b?.checkOutDate)) return false;

  // chỉ hủy khi chưa tới check-in
  return isFuture(b?.checkInDate);
};

// USER canCancel (restaurant)
export const canCancelRestaurant = (b) => {
  const st = String(b?.status || "").toUpperCase();
  if (CANCELLED_SET.has(st)) return false;

  // đã qua giờ đặt
  if (isUsedTimePassedRestaurant(b?.reservationDate, b?.reservationTime)) return false;

  // chưa tới giờ đặt
  const time = (b?.reservationTime || "00:00").length === 5 ? `${b.reservationTime}:00` : (b?.reservationTime || "00:00:00");
  return isFuture(`${b?.reservationDate}T${time}`);
};