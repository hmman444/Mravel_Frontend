import { useCallback, useEffect, useMemo, useState } from "react";
import i18n from "../../../i18n";
import {
  getPartnerRevenue,
  getPartnerStatsByStatus,
  listPartnerHotels,
  listPartnerRestaurants,
  listPartnerHotelBookings,
  listPartnerRestaurantBookings,
} from "../services/partnerService";
import { pickCreatedAt } from "../utils/partnerBookingUtils";

/* ---------- date helpers ---------- */
const pad2 = (n) => String(n).padStart(2, "0");
const toISO = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const addDays = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

const buildRange = (filter) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  let from;
  let title;
  if (filter === "today") {
    from = new Date(now);
    title = i18n.t("partner.dashboard.range_day");
  } else if (filter === "monthly") {
    from = new Date(now.getFullYear(), now.getMonth(), 1);
    title = i18n.t("partner.dashboard.range_month");
  } else if (filter === "yearly") {
    from = new Date(now.getFullYear(), 0, 1);
    title = i18n.t("partner.dashboard.range_year");
  } else {
    const day = (now.getDay() + 6) % 7; // Monday = 0
    from = addDays(now, -day);
    title = i18n.t("partner.dashboard.range_week");
  }
  from.setHours(0, 0, 0, 0);

  // Kỳ trước: cùng độ dài, kết thúc ngay trước `from`.
  const lenDays = Math.round((now - from) / 86400000) + 1;
  const prevTo = addDays(from, -1);
  const prevFrom = addDays(prevTo, -(lenDays - 1));

  return {
    from: toISO(from),
    to: toISO(now),
    prevFrom: toISO(prevFrom),
    prevTo: toISO(prevTo),
    title,
  };
};

/* ---------- status helpers ---------- */
const STATUS_COLORS = {
  PAID: "#10b981",
  COMPLETED: "#22c55e",
  CONFIRMED: "#3b82f6",
  PENDING_PAYMENT: "#f59e0b",
  PENDING: "#f59e0b",
  CANCELLED: "#9ca3af",
  CANCELLED_BY_GUEST: "#9ca3af",
  CANCELLED_BY_PARTNER: "#ef4444",
  REFUNDED: "#a855f7",
  FAILED: "#ef4444",
};
const PAID_STATUSES = new Set(["PAID", "COMPLETED"]);

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const stripPrefix = (rawKey) =>
  String(rawKey).replace(/^HOTEL_/, "").replace(/^RESTAURANT_/, "");

/** Gộp {HOTEL_X, RESTAURANT_X} -> {X: count}. */
const mergeStatusCounts = (raw) => {
  const out = {};
  Object.entries(raw || {}).forEach(([k, v]) => {
    const s = stripPrefix(k);
    out[s] = num(out[s]) + num(v);
  });
  return out;
};

const sumValues = (obj) => Object.values(obj || {}).reduce((a, b) => a + num(b), 0);

const deltaPct = (cur, prev) => {
  if (!prev) return cur > 0 ? 100 : 0;
  return Math.round(((cur - prev) / prev) * 100);
};

const revenueTotalOf = (data) => {
  // data từ /stats/revenue (no group): {HOTEL, RESTAURANT, TOTAL}
  if (!data) return 0;
  if (data.TOTAL != null) return num(data.TOTAL);
  return num(data.HOTEL) + num(data.RESTAURANT);
};

export function usePartnerDashboard(filter) {
  const range = useMemo(() => buildRange(filter), [filter]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  // recent + health: không phụ thuộc filter -> load 1 lần
  const [recent, setRecent] = useState([]);
  const [health, setHealth] = useState({ active: 0, pending: 0, blocked: 0 });

  const loadFiltered = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [series, curRev, prevRev, curStatus, prevStatus] = await Promise.all([
        getPartnerRevenue({ from: range.from, to: range.to, group: filter }),
        getPartnerRevenue({ from: range.from, to: range.to }),
        getPartnerRevenue({ from: range.prevFrom, to: range.prevTo }),
        getPartnerStatsByStatus({ from: range.from, to: range.to }),
        getPartnerStatsByStatus({ from: range.prevFrom, to: range.prevTo }),
      ]);

      // Service trả envelope {success,message,data}: nếu fail thì data undefined ->
      // dashboard hiện rỗng/0 mà không báo lý do. Phát hiện và surface lỗi thật.
      const firstFail = [series, curRev, prevRev, curStatus, prevStatus].find(
        (r) => r && r.success === false
      );
      if (firstFail) {
        setError(firstFail.message || i18n.t("partner.error.load_data"));
        setData(null);
        return;
      }

      const revenueSeries = Array.isArray(series?.data)
        ? series.data.map((p) => ({
            label: String(p.label ?? "--"),
            hotelRevenue: num(p.hotelRevenue),
            restaurantRevenue: num(p.restaurantRevenue),
          }))
        : [];

      const revenueTotal = revenueTotalOf(curRev?.data);
      const revenuePrev = revenueTotalOf(prevRev?.data);
      const split = {
        hotel: num(curRev?.data?.HOTEL),
        restaurant: num(curRev?.data?.RESTAURANT),
      };

      const merged = mergeStatusCounts(curStatus?.data);
      const bookings = sumValues(merged);
      const bookingsPrev = sumValues(mergeStatusCounts(prevStatus?.data));
      const paidBookings = Object.entries(merged)
        .filter(([k]) => PAID_STATUSES.has(k))
        .reduce((a, [, v]) => a + num(v), 0);

      const statusList = Object.entries(merged)
        .filter(([, v]) => num(v) > 0)
        .map(([k, v]) => ({
          key: k,
          label: i18n.t(`partner.booking_status.${k.toLowerCase()}`, k),
          value: num(v),
          color: STATUS_COLORS[k] || "#94a3b8",
        }))
        .sort((a, b) => b.value - a.value);

      setData({
        revenueSeries,
        kpis: {
          revenueTotal,
          revenueDeltaPct: deltaPct(revenueTotal, revenuePrev),
          bookings,
          bookingsDeltaPct: deltaPct(bookings, bookingsPrev),
          completionRate: bookings > 0 ? Math.round((paidBookings / bookings) * 100) : 0,
          aov: paidBookings > 0 ? revenueTotal / paidBookings : 0,
          paidBookings,
        },
        split,
        statusList,
      });
    } catch (e) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }, [filter, range.from, range.to, range.prevFrom, range.prevTo]);

  useEffect(() => {
    loadFiltered();
  }, [loadFiltered]);

  // recent transactions + service health (1 lần)
  useEffect(() => {
    let mounted = true;
    (async () => {
      const [h, r] = await Promise.all([
        listPartnerHotelBookings({ page: 0, size: 6 }),
        listPartnerRestaurantBookings({ page: 0, size: 6 }),
      ]);
      if (!mounted) return;
      const merged = [
        ...((h?.success ? h.data?.items : []) || []).map((b) => ({ ...b, __type: "HOTEL" })),
        ...((r?.success ? r.data?.items : []) || []).map((b) => ({ ...b, __type: "RESTAURANT" })),
      ];
      merged.sort((a, b) => new Date(pickCreatedAt(b) || 0) - new Date(pickCreatedAt(a) || 0));
      setRecent(merged.slice(0, 6));
    })();

    (async () => {
      const statuses = ["ACTIVE", "PENDING", "ADMIN_BLOCKED"];
      const results = await Promise.all(
        statuses.map(async (st) => {
          const [h, r] = await Promise.all([
            listPartnerHotels({ status: st, page: 0, size: 1 }),
            listPartnerRestaurants({ status: st, page: 0, size: 1 }),
          ]);
          const total =
            (h?.success ? num(h.data?.totalElements) : 0) +
            (r?.success ? num(r.data?.totalElements) : 0);
          return [st, total];
        })
      );
      if (!mounted) return;
      const map = Object.fromEntries(results);
      setHealth({
        active: num(map.ACTIVE),
        pending: num(map.PENDING),
        blocked: num(map.ADMIN_BLOCKED),
      });
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return { loading, error, range, recent, health, ...(data || {}) };
}
