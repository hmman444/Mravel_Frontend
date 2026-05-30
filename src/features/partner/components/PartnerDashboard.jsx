// src/features/partner/components/PartnerDashboard.jsx
import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
} from "recharts";

import { useTranslation } from "react-i18next";

import i18n from "../../../i18n";
import { usePartnerStats } from "../hooks/usePartnerStats";
import { listPartnerHotels, listPartnerRestaurants } from "../services/partnerService";

/* == UI == */

function StatCard({
  label,
  value,
  sub,
  badgeText,
  badgeClass = "bg-blue-50 text-blue-700",
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5 border border-gray-100 dark:border-gray-700">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1 truncate">
            {value}
          </p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        {badgeText ? (
          <span className={`px-2 py-1 text-xs rounded-full ${badgeClass}`}>
            {badgeText}
          </span>
        ) : null}
      </div>
    </div>
  );
}

/* == DATE HELPERS == */

const pad2 = (n) => String(n).padStart(2, "0");

const toISODate = (d) => {
  const yyyy = d.getFullYear();
  const mm = pad2(d.getMonth() + 1);
  const dd = pad2(d.getDate());
  return `${yyyy}-${mm}-${dd}`;
};

const startOfWeekMonday = (date) => {
  const d = new Date(date);
  const day = d.getDay(); // 0 CN, 1 T2, ...
  const diff = (day + 6) % 7; // Monday=0
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const startOfMonth = (date) => {
  const d = new Date(date.getFullYear(), date.getMonth(), 1);
  d.setHours(0, 0, 0, 0);
  return d;
};

const startOfYear = (date) => {
  const d = new Date(date.getFullYear(), 0, 1);
  d.setHours(0, 0, 0, 0);
  return d;
};

const buildRange = (filter) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  let from;
  let title;

  if (filter === "today") {
    from = new Date(now);
    title = i18n.t("partner.dashboard.range_day");
  } else if (filter === "weekly") {
    from = startOfWeekMonday(now);
    title = i18n.t("partner.dashboard.range_week");
  } else if (filter === "monthly") {
    from = startOfMonth(now);
    title = i18n.t("partner.dashboard.range_month");
  } else {
    from = startOfYear(now);
    title = i18n.t("partner.dashboard.range_year");
  }

  return {
    from: toISODate(from),
    to: toISODate(now),
    title,
  };
};

const STATUS_KEY = {
  PENDING_PAYMENT: "partner.booking_status.pending_payment",
  CONFIRMED: "partner.booking_status.confirmed",
  PAID: "partner.booking_status.paid",
  COMPLETED: "partner.booking_status.completed",
  CANCELLED: "partner.booking_status.cancelled",
  CANCELLED_BY_PARTNER: "partner.booking_status.cancelled_by_partner",
  REFUNDED: "partner.booking_status.refunded",
  FAILED: "partner.booking_status.failed",
};

const TYPE_KEY = {
  HOTEL: "partner.service_type.hotel",
  RESTAURANT: "partner.service_type.restaurant",
};

const toVietnameseStatusLabel = (rawKey) => {
  if (!rawKey) return "—";

  let type = null;
  let status = String(rawKey);

  if (status.startsWith("HOTEL_")) {
    type = "HOTEL";
    status = status.slice("HOTEL_".length);
  } else if (status.startsWith("RESTAURANT_")) {
    type = "RESTAURANT";
    status = status.slice("RESTAURANT_".length);
  }

  const typeLabel = type ? i18n.t(TYPE_KEY[type]) : null;
  const statusLabel = STATUS_KEY[status] ? i18n.t(STATUS_KEY[status]) : status;

  return typeLabel ? `${typeLabel}: ${statusLabel}` : statusLabel;
};

/* == PARSERS (robust) == */

const coerceNum = (v) => {
  if (v === null || v === undefined) return 0;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const parseStatusCounts = (raw) => {
  if (!raw) return {};

  if (Array.isArray(raw)) {
    return raw.reduce((acc, item) => {
      if (!item) return acc;
      const key =
        item.status ||
        item.bookingStatus ||
        item.name ||
        item.key ||
        item.code;
      const val =
        item.count ?? item.value ?? item.total ?? item.totalCount ?? 0;
      if (key) acc[String(key)] = coerceNum(val);
      return acc;
    }, {});
  }

  if (typeof raw === "object") {
    const out = {};
    Object.entries(raw).forEach(([k, v]) => {
      out[String(k)] = coerceNum(v);
    });
    return out;
  }

  return {};
};

const parseRevenueSeries = (raw) => {
  if (!raw) return [];

  const toPoint = (label, v) => {
    if (v && typeof v === "object") {
      const hotel = v.hotelRevenue ?? v.HOTEL ?? v.hotel ?? 0;
      const restaurant =
        v.restaurantRevenue ?? v.RESTAURANT ?? v.restaurant ?? 0;

      return {
        label: String(label ?? "--"),
        hotelRevenue: coerceNum(hotel),
        restaurantRevenue: coerceNum(restaurant),
      };
    }

    return {
      label: String(label ?? "--"),
      hotelRevenue: 0,
      restaurantRevenue: 0,
    };
  };

  if (Array.isArray(raw)) {
    return raw
      .map((item, idx) => {
        if (!item) return null;
        const label =
          item.label ??
          item.key ??
          item.day ??
          item.week ??
          item.month ??
          String(idx + 1);

        return {
          label: String(label ?? "--"),
          hotelRevenue: coerceNum(item.hotelRevenue ?? item.HOTEL ?? 0),
          restaurantRevenue: coerceNum(
            item.restaurantRevenue ?? item.RESTAURANT ?? 0
          ),
        };
      })
      .filter(Boolean);
  }

  if (typeof raw === "object") {
    return Object.entries(raw).map(([k, v]) => toPoint(k, v));
  }

  return [];
};

const formatMillion = (amountMaybeVnd) => {
  const n = coerceNum(amountMaybeVnd);
  const million = n >= 1_000_000 ? n / 1_000_000 : n;
  return million.toLocaleString("vi-VN", {
    maximumFractionDigits: 1,
    minimumFractionDigits: million > 0 && million < 10 ? 1 : 0,
  });
};

/* == COMPONENT == */

export default function PartnerDashboard() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState("weekly");
  const range = useMemo(() => buildRange(filter), [filter]);

  const { statsByStatus, revenue, loadStatus, loadRevenue } = usePartnerStats();

  const [svcLoading, setSvcLoading] = useState(false);
  const [svcCounts, setSvcCounts] = useState({
    active: 0,
    pending: 0,
    blocked: 0,
  });

  // Load stats (booking) — filter sẽ chỉ ảnh hưởng booking stats
  useEffect(() => {
    loadStatus({ from: range.from, to: range.to });
    loadRevenue({ from: range.from, to: range.to, group: filter });
  }, [loadStatus, loadRevenue, range.from, range.to, filter]);

  // Load service counts (ACTIVE / PENDING / ADMIN_BLOCKED) — chỉ load 1 lần
  useEffect(() => {
    let mounted = true;
    (async () => {
      setSvcLoading(true);
      try {
        const statuses = ["ACTIVE", "PENDING", "ADMIN_BLOCKED"];
        const tasks = statuses.map(async (st) => {
          const [h, r] = await Promise.all([
            listPartnerHotels({ status: st, page: 0, size: 1 }),
            listPartnerRestaurants({ status: st, page: 0, size: 1 }),
          ]);
          const total =
            (h?.success ? coerceNum(h.data?.totalElements) : 0) +
            (r?.success ? coerceNum(r.data?.totalElements) : 0);
          return [st, total];
        });

        const results = await Promise.all(tasks);
        if (!mounted) return;

        const map = Object.fromEntries(results);
        setSvcCounts({
          active: coerceNum(map.ACTIVE),
          pending: coerceNum(map.PENDING),
          blocked: coerceNum(map.ADMIN_BLOCKED),
        });
      } finally {
        if (mounted) setSvcLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Parse booking status counts
  const statusCounts = useMemo(
    () => parseStatusCounts(statsByStatus?.data),
    [statsByStatus?.data]
  );

  const statusTotal = useMemo(() => {
    return Object.values(statusCounts).reduce((a, b) => a + coerceNum(b), 0);
  }, [statusCounts]);

  const statusRatioList = useMemo(() => {
    const entries = Object.entries(statusCounts)
      .map(([rawKey, value]) => {
        const v = coerceNum(value);
        const pct = statusTotal > 0 ? Math.round((v / statusTotal) * 100) : 0;
        return {
          rawKey,
          name: toVietnameseStatusLabel(rawKey),
          value: v,
          percent: pct,
        };
      })
      .filter((x) => x.value > 0);

    entries.sort((a, b) => b.value - a.value);
    return entries;
  }, [statusCounts, statusTotal]);

  // Revenue series (chart)
  const revenueSeries = useMemo(
    () => parseRevenueSeries(revenue?.data),
    [revenue?.data]
  );

  const sumRevenue = useMemo(() => {
    return revenueSeries.reduce(
      (acc, p) => acc + coerceNum(p.hotelRevenue) + coerceNum(p.restaurantRevenue),
      0
    );
  }, [revenueSeries]);

  const bookingLoading = statsByStatus?.loading || revenue?.loading;
  const error = statsByStatus?.error || revenue?.error;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t("partner.dashboard.title")}</h1>

      {error ? (
        <div className="mb-6 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {String(error)}
        </div>
      ) : null}

      {/* Layout mới: cột trái (2/3) chứa 3 card + chart, cột phải (1/3) chứa tỷ lệ trạng thái */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: cards + chart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick stats (bề ngang đúng bằng chart) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              label={t("partner.dashboard.active_services")}
              value={svcLoading ? "—" : String(svcCounts.active)}
              sub={t("partner.dashboard.active_services_sub")}
              badgeText={t("partner.dashboard.badge_total")}
              badgeClass="bg-green-50 text-green-700"
            />
            <StatCard
              label={t("partner.dashboard.pending_services")}
              value={svcLoading ? "—" : String(svcCounts.pending)}
              sub={t("partner.dashboard.pending_services_sub")}
              badgeText={t("partner.dashboard.badge_total")}
              badgeClass="bg-yellow-50 text-yellow-700"
            />
            <StatCard
              label={t("partner.dashboard.revenue_million")}
              value={revenue?.loading ? "—" : formatMillion(sumRevenue)}
              sub={t("partner.dashboard.revenue_sub")}
              badgeText={filter === "today" ? t("partner.dashboard.badge_today") : t("partner.dashboard.badge_by_filter")}
              badgeClass="bg-purple-50 text-purple-700"
            />
          </div>

          {/* Chart */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow flex flex-col">
            <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
              <h2 className="text-lg font-semibold">
                {t("partner.dashboard.orders_revenue_by", { range: range.title })}
              </h2>

              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-1 border rounded text-sm"
              >
                <option value="today">{t("partner.dashboard.filter_today")}</option>
                <option value="weekly">{t("partner.dashboard.filter_week")}</option>
                <option value="monthly">{t("partner.dashboard.filter_month")}</option>
                <option value="yearly">{t("partner.dashboard.filter_year")}</option>
              </select>
            </div>

            <div className="text-xs text-gray-400 mb-3">
              {t("partner.dashboard.time_range", { from: range.from, to: range.to })}
            </div>

            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={revenueSeries}>
                <XAxis dataKey="label" />
                <YAxis tickFormatter={(v) => formatMillion(v)} />
                <Tooltip formatter={(v) => [t("partner.dashboard.value_million", { value: formatMillion(v) }), ""]} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="hotelRevenue"
                  name={t("partner.dashboard.hotel_revenue")}
                  stroke="#2563EB"          // xanh
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#2563EB" }}
                  activeDot={{ r: 5, fill: "#2563EB" }}
                />

                <Line
                  type="monotone"
                  dataKey="restaurantRevenue"
                  name={t("partner.dashboard.restaurant_revenue")}
                  stroke="#F97316"          // cam
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#F97316" }}
                  activeDot={{ r: 5, fill: "#F97316" }}
                />
              </LineChart>
            </ResponsiveContainer>

            {!revenue?.loading && revenueSeries.length === 0 ? (
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                {t("partner.dashboard.no_revenue_data")}
              </div>
            ) : null}
          </div>
        </div>

        {/* RIGHT: Tỷ lệ trạng thái đơn (thay cho panel cũ + bỏ “Xu hướng” + Pie) */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow flex flex-col">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-semibold">{t("partner.dashboard.status_ratio_title")}</h2>
              <div className="text-xs text-gray-400 mt-1">
                {t("partner.dashboard.by_time_range", { from: range.from, to: range.to })}
              </div>
            </div>
            <span className="text-xs rounded-full px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              {bookingLoading ? t("common.loading") : t("partner.dashboard.total_count", { count: statusTotal })}
            </span>
          </div>

          {bookingLoading ? (
            <div className="text-sm text-gray-500 dark:text-gray-400">{t("partner.dashboard.loading_stats")}</div>
          ) : statusRatioList.length === 0 ? (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {t("partner.dashboard.no_status_data")}
            </div>
          ) : (
            <div className="space-y-3">
              {statusRatioList.map((it) => (
                <div key={it.rawKey} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm text-gray-800 dark:text-gray-200 truncate">{it.name}</div>
                    <div className="text-xs text-gray-400">{t("partner.dashboard.order_count", { count: it.value })}</div>
                  </div>
                  <div className="shrink-0 text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {it.percent}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}