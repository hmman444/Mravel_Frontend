"use client";

// src/features/admin/pages/AdminDashboard.jsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import { fetchDashboard } from "../services/adminDashboardService";
import {
  ArrowPathIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  UsersIcon,
  BuildingStorefrontIcon,
  Squares2X2Icon,
  CreditCardIcon,
  ClockIcon,
  BoltIcon,
} from "@heroicons/react/24/outline";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

/* = UI TOKENS = */

const ui = {
  pageBg: "bg-slate-50 dark:bg-slate-950",
  card:
    "rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-800 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950",
  h1: "text-2xl font-bold text-slate-900 dark:text-white",
  sub: "text-sm text-slate-500 dark:text-slate-300",
  btn:
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
  btnGhost:
    "bg-white dark:bg-gray-800 hover:bg-slate-50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900",
  pill: "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
};

const formatInt = (n) => (Number(n) || 0).toLocaleString("vi-VN");

const formatMoneyM = (million) =>
  (Number(million) || 0).toLocaleString("vi-VN", { maximumFractionDigits: 0 });

const formatMoneyVnd = (vnd) =>
  (Number(vnd) || 0).toLocaleString("vi-VN", { maximumFractionDigits: 0 });

const formatPct = (n) =>
  (Number.isFinite(Number(n)) ? Number(n) : 0).toLocaleString("vi-VN", {
    maximumFractionDigits: 1,
  });

/* Mục đích đến khi click vào hàng đợi xử lý */
const ACTION_TARGET = {
  "svc-approve": "/admin/services",
  reports: "/admin/plans-analytics",
  "payment-failed": null,
};

function StatCard({ icon: Icon, label, value, sub, accent = "blue" }) {
  const accentMap = {
    blue: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-200 dark:border-blue-900",
    green:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-200 dark:border-emerald-900",
    amber:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-200 dark:border-amber-900",
    violet:
      "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/30 dark:text-violet-200 dark:border-violet-900",
    rose: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-200 dark:border-rose-900",
    slate:
      "bg-slate-50 dark:bg-gray-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-800",
  };

  return (
    <div className={ui.card}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm text-slate-500 dark:text-slate-300">
            {label}
          </div>
          <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-white truncate">
            {value}
          </div>
          {sub ? (
            <div className="mt-1 text-xs text-slate-400 dark:text-slate-400">
              {sub}
            </div>
          ) : null}
        </div>

        <div
          className={`shrink-0 rounded-2xl border p-2 ${accentMap[accent] || accentMap.blue}`}
          title={label}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function SeverityPill({ severity }) {
  const { t } = useTranslation();
  const map = {
    high: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-200 dark:border-rose-900",
    medium:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-200 dark:border-amber-900",
    low: "bg-slate-50 dark:bg-gray-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-800",
  };
  const label = severity === "high" ? t("admin.severity.high") : severity === "medium" ? t("admin.severity.medium") : t("admin.severity.low");
  return <span className={`${ui.pill} ${map[severity] || map.low}`}>{label}</span>;
}

function AlertBox({ level, title, desc }) {
  const map = {
    danger:
      "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200",
    warning:
      "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200",
    info:
      "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-200",
  };

  return (
    <div className={`rounded-2xl border p-4 ${map[level] || map.info}`}>
      <div className="flex items-start gap-3">
        <ExclamationTriangleIcon className="h-5 w-5 mt-0.5" />
        <div className="min-w-0">
          <div className="font-semibold">{title}</div>
          <div className="mt-1 text-sm opacity-90">{desc}</div>
        </div>
      </div>
    </div>
  );
}

/* = PAGE = */

export default function AdminDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [range, setRange] = useState("weekly"); // today | weekly | monthly | yearly

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const d = await fetchDashboard(range);
      setData(d);
    } catch (e) {
      setError(e?.message || t("admin.error_generic"));
    } finally {
      setLoading(false);
    }
  }, [range, t]);

  useEffect(() => {
    load();
  }, [load]);

  const ov = data?.overview || {};
  const alerts = data?.alerts || [];
  const actionQueue = data?.actionQueue || [];
  const revenueSeries = data?.revenueSeries || [];
  const bookingStatus = data?.bookingStatus || [];
  const topServices = data?.topServices || [];
  const topPartners = data?.topPartners || [];

  const statusLabel = useCallback(
    (key) => t(`partner.booking_status.${String(key || "").toLowerCase()}`, key),
    [t]
  );

  const totalBookingStatus = useMemo(
    () => bookingStatus.reduce((acc, x) => acc + (Number(x.count) || 0), 0),
    [bookingStatus]
  );

  const statusRows = useMemo(() => {
    return bookingStatus
      .map((x) => {
        const pct =
          totalBookingStatus > 0
            ? Math.round(((Number(x.count) || 0) / totalBookingStatus) * 100)
            : 0;
        return { ...x, pct };
      })
      .sort((a, b) => b.count - a.count);
  }, [bookingStatus, totalBookingStatus]);

  const revenueTotalM = useMemo(
    () => revenueSeries.reduce((acc, p) => acc + (Number(p.total) || 0), 0),
    [revenueSeries]
  );

  const rangeLabel =
    range === "today"
      ? t("admin.range.today")
      : range === "weekly"
        ? t("admin.range.weekly")
        : range === "monthly"
          ? t("admin.range.monthly")
          : t("admin.range.yearly");

  return (
    <AdminLayout>
      <div className={ui.pageBg}>
        <div className="mx-auto w-full max-w-8xl px-4 py-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className={ui.h1}>{t("admin.dashboard.title")}</h1>
                <p className={ui.sub}>{t("admin.dashboard.subtitle")}</p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <select
                  value={range}
                  onChange={(e) => setRange(e.target.value)}
                  className="w-full sm:w-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                >
                  <option value="today">{t("admin.range.today")}</option>
                  <option value="weekly">{t("admin.range.weekly")}</option>
                  <option value="monthly">{t("admin.range.monthly")}</option>
                  <option value="yearly">{t("admin.range.yearly")}</option>
                </select>

                <button
                  type="button"
                  className={`${ui.btn} ${ui.btnGhost} gap-2`}
                  onClick={load}
                  disabled={loading}
                  title={t("admin.reload")}
                >
                  <ArrowPathIcon className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
                  {t("admin.reload")}
                </button>
              </div>
            </div>
          </div>

          {/* Error banner */}
          {error ? (
            <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ExclamationTriangleIcon className="h-5 w-5" />
                  <span>{error}</span>
                </div>
                <button type="button" className={`${ui.btn} ${ui.btnGhost}`} onClick={load}>
                  {t("admin.reload")}
                </button>
              </div>
            </div>
          ) : null}

          {/* Loading (first load) */}
          {loading && !data ? (
            <div className="flex items-center justify-center py-24 text-slate-500 dark:text-slate-300">
              <ArrowPathIcon className="h-6 w-6 animate-spin" />
              <span className="ml-2 text-sm">{t("common.loading")}</span>
            </div>
          ) : (
            <>
              {/* Alerts */}
              {alerts.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 mb-6">
                  {alerts.slice(0, 3).map((a) => (
                    <AlertBox key={a.id} level={a.level} title={t(a.title)} desc={t(a.desc)} />
                  ))}
                </div>
              ) : null}

              {/* Overview Cards */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 mb-6">
                <StatCard
                  icon={UsersIcon}
                  label={t("admin.stat.users")}
                  value={formatInt(ov.totalUsers)}
                  sub={
                    ov.activeUsers7d != null
                      ? t("admin.stat.active_7d", { n: formatInt(ov.activeUsers7d) })
                      : null
                  }
                  accent="blue"
                />
                <StatCard
                  icon={BuildingStorefrontIcon}
                  label={t("admin.stat.partners")}
                  value={formatInt(ov.partners)}
                  sub={t("admin.stat.partners_sub")}
                  accent="violet"
                />
                <StatCard
                  icon={Squares2X2Icon}
                  label={t("admin.stat.services_active")}
                  value={formatInt(ov.servicesActive)}
                  sub={t("admin.stat.pending_approval", { n: formatInt(ov.servicesPendingApproval) })}
                  accent="green"
                />
                <StatCard
                  icon={CreditCardIcon}
                  label={t("admin.stat.bookings_today")}
                  value={formatInt(ov.bookingsToday)}
                  sub={t("admin.stat.bookings_7d", { n: formatInt(ov.bookings7d) })}
                  accent="amber"
                />
              </div>

              {/* Layout: left (2/3) + right (1/3) */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* LEFT */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Revenue chart */}
                  <div className={ui.card}>
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <ChartBarIcon className="h-5 w-5 text-slate-500 dark:text-slate-300" />
                          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                            {t("admin.revenue.title")}
                          </h2>
                        </div>
                        <div className="mt-1 text-xs text-slate-400">
                          {t("admin.revenue.period_total", { n: formatMoneyM(revenueTotalM) })}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span className={`${ui.pill} bg-slate-50 dark:bg-gray-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200`}>
                          {t("admin.revenue.period_label", { v: rangeLabel })}
                        </span>
                        <span className={`${ui.pill} bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-200`}>
                          {t("admin.revenue.today_vnd", { n: formatMoneyVnd(ov.revenueTodayVnd) })}
                        </span>
                        <span className={`${ui.pill} bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/30 dark:border-blue-900 dark:text-blue-200`}>
                          {t("admin.revenue.last_7d_vnd", { n: formatMoneyVnd(ov.revenue7dVnd) })}
                        </span>
                      </div>
                    </div>

                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={revenueSeries}>
                          <XAxis dataKey="label" />
                          <YAxis tickFormatter={(v) => `${formatMoneyM(v)}tr`} />
                          <Tooltip formatter={(v) => [t("admin.revenue.million", { n: formatMoneyM(v) }), ""]} />
                          <Legend />
                          <Line type="monotone" dataKey="total" name={t("admin.revenue.series_total")} strokeWidth={2} dot={{ r: 3 }} />
                          <Line type="monotone" dataKey="hotel" name={t("admin.revenue.series_hotel")} strokeWidth={2} dot={{ r: 3 }} />
                          <Line type="monotone" dataKey="restaurant" name={t("admin.revenue.series_restaurant")} strokeWidth={2} dot={{ r: 3 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-sm dark:border-slate-800">
                        <div className="text-slate-500 dark:text-slate-300">{t("admin.metric.cancel_rate_7d")}</div>
                        <div className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                          {formatPct(ov.cancelRate7dPct)}%
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-sm dark:border-slate-800">
                        <div className="text-slate-500 dark:text-slate-300">{t("admin.metric.refund_rate_7d")}</div>
                        <div className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                          {formatPct(ov.refundRate7dPct)}%
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-sm dark:border-slate-800">
                        <div className="text-slate-500 dark:text-slate-300">{t("admin.metric.payment_fail_7d")}</div>
                        <div className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                          {formatPct(ov.paymentFail7dPct)}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Top tables */}
                  <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    {/* Top services */}
                    <div className={ui.card}>
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-2">
                          <BoltIcon className="h-5 w-5 text-slate-500 dark:text-slate-300" />
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                            {t("admin.top_services.title")}
                          </h3>
                        </div>
                        <span className={`${ui.pill} bg-slate-50 dark:bg-gray-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200`}>
                          {t("admin.top_n", { n: topServices.length || 5 })}
                        </span>
                      </div>

                      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                        <table className="min-w-full text-sm">
                          <thead className="bg-slate-50 dark:bg-gray-900 text-slate-600 dark:text-slate-400 dark:bg-slate-900 dark:text-slate-300">
                            <tr>
                              <th className="px-3 py-2 text-left font-semibold">{t("admin.col.service")}</th>
                              <th className="px-3 py-2 text-right font-semibold">{t("admin.col.orders")}</th>
                              <th className="px-3 py-2 text-right font-semibold">{t("admin.col.revenue")}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {topServices.length === 0 ? (
                              <tr>
                                <td colSpan={3} className="px-3 py-6 text-center text-slate-400">
                                  {t("admin.plan_stat.empty")}
                                </td>
                              </tr>
                            ) : (
                              topServices.map((x, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/40">
                                  <td className="px-3 py-2">
                                    <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                                      {x.name}
                                    </div>
                                    <div className="text-xs text-slate-400">{x.type}</div>
                                  </td>
                                  <td className="px-3 py-2 text-right text-slate-700 dark:text-slate-200">
                                    {formatInt(x.orders)}
                                  </td>
                                  <td className="px-3 py-2 text-right font-semibold text-slate-900 dark:text-white">
                                    {formatMoneyM(x.revenueM)}tr
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Top partners */}
                    <div className={ui.card}>
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-2">
                          <ShieldCheckIcon className="h-5 w-5 text-slate-500 dark:text-slate-300" />
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                            {t("admin.top_partners.title")}
                          </h3>
                        </div>
                        <span className={`${ui.pill} bg-slate-50 dark:bg-gray-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200`}>
                          {t("admin.top_n", { n: topPartners.length || 5 })}
                        </span>
                      </div>

                      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                        <table className="min-w-full text-sm">
                          <thead className="bg-slate-50 dark:bg-gray-900 text-slate-600 dark:text-slate-400 dark:bg-slate-900 dark:text-slate-300">
                            <tr>
                              <th className="px-3 py-2 text-left font-semibold">{t("admin.col.partner")}</th>
                              <th className="px-3 py-2 text-right font-semibold">{t("admin.col.service")}</th>
                              <th className="px-3 py-2 text-right font-semibold">{t("admin.col.revenue")}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {topPartners.length === 0 ? (
                              <tr>
                                <td colSpan={3} className="px-3 py-6 text-center text-slate-400">
                                  {t("admin.plan_stat.empty")}
                                </td>
                              </tr>
                            ) : (
                              topPartners.map((x, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/40">
                                  <td className="px-3 py-2">
                                    <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                                      {x.name}
                                    </div>
                                  </td>
                                  <td className="px-3 py-2 text-right text-slate-700 dark:text-slate-200">
                                    {formatInt(x.services)}
                                  </td>
                                  <td className="px-3 py-2 text-right font-semibold text-slate-900 dark:text-white">
                                    {formatMoneyM(x.revenueM)}tr
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT */}
                <div className="space-y-6">
                  {/* Action Queue */}
                  <div className={ui.card}>
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <ClockIcon className="h-5 w-5 text-slate-500 dark:text-slate-300" />
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                          {t("admin.action_queue.title")}
                        </h2>
                      </div>
                      <span className={`${ui.pill} bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/30 dark:border-rose-900 dark:text-rose-200`}>
                        {t("admin.action_queue.priority_today")}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {actionQueue.map((x) => {
                        const target = ACTION_TARGET[x.id];
                        return (
                          <div
                            key={x.id}
                            className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 dark:border-slate-800"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                                  {t(x.title)}
                                </div>
                                <div className="mt-1 text-xs text-slate-400">
                                  {t(x.hint)}
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <SeverityPill severity={x.severity} />
                                <div className="text-lg font-bold text-slate-900 dark:text-white">
                                  {formatInt(x.count)}
                                </div>
                              </div>
                            </div>

                            {target ? (
                              <div className="mt-3 flex justify-end">
                                <button
                                  type="button"
                                  className={`${ui.btn} ${ui.btnGhost}`}
                                  onClick={() => navigate(target)}
                                >
                                  {t("admin.action_queue.open_list")}
                                </button>
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Booking status ratio */}
                  <div className={ui.card}>
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <ChartBarIcon className="h-5 w-5 text-slate-500 dark:text-slate-300" />
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                          {t("admin.booking_status.title")}
                        </h2>
                      </div>
                      <span className={`${ui.pill} bg-slate-50 dark:bg-gray-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200`}>
                        {t("admin.booking_status.total", { n: formatInt(totalBookingStatus) })}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {statusRows.length === 0 ? (
                        <div className="py-6 text-center text-sm text-slate-400">
                          {t("admin.plan_stat.empty")}
                        </div>
                      ) : (
                        statusRows.map((x) => (
                          <div key={x.key} className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <div className="text-sm text-slate-800 dark:text-slate-100 truncate">
                                {statusLabel(x.key)}
                              </div>
                              <div className="text-xs text-slate-400">{t("admin.booking_status.orders_count", { n: formatInt(x.count) })}</div>
                            </div>
                            <div className="shrink-0 text-sm font-semibold text-slate-900 dark:text-white">
                              {x.pct}%
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer note */}
              <div className="mt-6 text-xs text-slate-400">
                {t("admin.dashboard.footer_note")}
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
