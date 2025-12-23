// yyyy-MM-dd theo local timezone (an toàn cho LocalDate BE)
export const formatLocalDate = (d) => {
  if (!d) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

// parse yyyy-MM-dd về Date local (tránh new Date("yyyy-MM-dd") bị hiểu UTC)
export const parseLocalDate = (s) => {
  if (!s) return null;
  const [y, m, d] = s.split("-").map((x) => parseInt(x, 10));
  if (!y || !m || !d) return null;
  const dt = new Date(y, m - 1, d);
  dt.setHours(0, 0, 0, 0);
  return dt;
};

export const addDaysLocal = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};