// Định dạng tiền VND cho dashboard partner.

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/** Đầy đủ: 1.250.000 ₫ */
export const formatVnd = (v) =>
  new Intl.NumberFormat("vi-VN").format(Math.round(num(v))) + " ₫";

/** Gọn cho trục biểu đồ / KPI: 1,2 tỷ · 12,5 tr · 250N · 0 */
export const formatCompactVnd = (v) => {
  const n = num(v);
  const abs = Math.abs(n);
  const fmt = (x) => x.toLocaleString("vi-VN", { maximumFractionDigits: 1 });
  if (abs >= 1_000_000_000) return fmt(n / 1_000_000_000) + " tỷ";
  if (abs >= 1_000_000) return fmt(n / 1_000_000) + " tr";
  if (abs >= 1_000) return fmt(n / 1_000) + "N";
  return fmt(n);
};
