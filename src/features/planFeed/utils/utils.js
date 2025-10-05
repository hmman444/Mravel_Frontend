export const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60) return "vừa xong";
  const m = Math.floor(diff / 60);
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} ngày trước`;
  const w = Math.floor(d / 7);
  return `${w} tuần trước`;
};

export const truncate = (text, n = 180) =>
  text.length > n ? { short: text.slice(0, n) + "…", truncated: true } : { short: text, truncated: false };
