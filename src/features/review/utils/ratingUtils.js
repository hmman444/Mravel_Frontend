/**
 * Maps a 1–5 numeric rating to a Vietnamese label.
 * Ratings outside 1–5 (null, undefined, NaN) return null.
 */
export function getRatingLabel(score) {
  const n = parseFloat(score);
  if (!score || isNaN(n)) return null;
  if (n >= 4.5) return "Rất tốt";
  if (n >= 4.0) return "Tốt";
  if (n >= 3.0) return "Trung bình";
  if (n >= 2.0) return "Tệ";
  return "Rất tệ";
}
