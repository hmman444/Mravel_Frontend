import i18n from "../../../i18n";

/**
 * Maps a 1–5 numeric rating to a localized label.
 * Ratings outside 1–5 (null, undefined, NaN) return null.
 */
export function getRatingLabel(score) {
  const n = parseFloat(score);
  if (!score || isNaN(n)) return null;
  if (n >= 4.5) return i18n.t("review.rating_excellent");
  if (n >= 4.0) return i18n.t("review.rating_good");
  if (n >= 3.0) return i18n.t("review.rating_average");
  if (n >= 2.0) return i18n.t("review.rating_bad");
  return i18n.t("review.rating_terrible");
}
