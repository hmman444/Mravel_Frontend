import i18n from "../../../i18n";

export const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60) return i18n.t("feed.timeAgo.justNow");
  const m = Math.floor(diff / 60);
  if (m < 60) return i18n.t("feed.timeAgo.minutes", { n: m });
  const h = Math.floor(m / 60);
  if (h < 24) return i18n.t("feed.timeAgo.hours", { n: h });
  const d = Math.floor(h / 24);
  if (d < 7) return i18n.t("feed.timeAgo.days", { n: d });
  const w = Math.floor(d / 7);
  return i18n.t("feed.timeAgo.weeks", { n: w });
};

export const truncate = (text, n = 180) =>
  text.length > n ? { short: text.slice(0, n) + "…", truncated: true } : { short: text, truncated: false };
