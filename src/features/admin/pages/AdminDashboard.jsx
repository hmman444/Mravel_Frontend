"use client";

// src/features/admin/pages/AdminDashboard.jsx
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import AdminLayout from "../components/AdminLayout";
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

/* = MOCK DATA (CỨNG) = */

const MOCK = {
  overview: {
    totalUsers: 128_430,
    activeUsers7d: 23_180,
    partners: 1_260,
    servicesActive: 4_820,
    servicesPendingApproval: 132,
    bookingsToday: 1_980,
    bookings7d: 12_540,
    revenueTodayVnd: 485_000_000,
    revenue7dVnd: 3_920_000_000,
    cancelRate7dPct: 6.4,
    refundRate7dPct: 1.3,
    paymentFail7dPct: 0.9,
  },

  actionQueue: [
    {
      id: "svc-approve",
      titleKey: "admin.action_queue.svc_approve_title",
      count: 132,
      severity: "high",
      hintKey: "admin.action_queue.svc_approve_hint",
    },
    {
      id: "reports",
      titleKey: "admin.action_queue.reports_title",
      count: 18,
      severity: "high",
      hintKey: "admin.action_queue.reports_hint",
    },
    {
      id: "payment-failed",
      titleKey: "admin.action_queue.payment_failed_title",
      count: 44,
      severity: "medium",
      hintKey: "admin.action_queue.payment_failed_hint",
    },
    {
      id: "partner-kyc",
      titleKey: "admin.action_queue.partner_kyc_title",
      count: 27,
      severity: "medium",
      hintKey: "admin.action_queue.partner_kyc_hint",
    },
    {
      id: "support-tickets",
      titleKey: "admin.action_queue.support_tickets_title",
      count: 9,
      severity: "low",
      hintKey: "admin.action_queue.support_tickets_hint",
    },
  ],

  revenueSeries: [
    { label: "T2", total: 420, hotel: 260, restaurant: 160 },
    { label: "T3", total: 510, hotel: 320, restaurant: 190 },
    { label: "T4", total: 480, hotel: 290, restaurant: 190 },
    { label: "T5", total: 640, hotel: 420, restaurant: 220 },
    { label: "T6", total: 590, hotel: 360, restaurant: 230 },
    { label: "T7", total: 720, hotel: 470, restaurant: 250 },
    { label: "CN", total: 560, hotel: 330, restaurant: 230 },
  ], // đơn vị: "triệu VND"

  bookingStatus: [
    { key: "CONFIRMED", labelKey: "enum.booking_status.confirmed", count: 6_430 },
    { key: "PAID", labelKey: "enum.booking_status.paid", count: 4_980 },
    { key: "COMPLETED", labelKey: "enum.booking_status.completed", count: 3_210 },
    { key: "CANCELLED", labelKey: "enum.booking_status.cancelled", count: 860 },
    { key: "REFUNDED", labelKey: "enum.booking_status.refunded", count: 170 },
    { key: "FAILED", labelKey: "enum.booking_status.failed", count: 120 },
  ],

  topServices: [
    { name: "Hoi An Reverie Villas", type: "HOTEL", orders: 820, revenueM: 540 },
    { name: "Da Nang Sea View Hotel", type: "HOTEL", orders: 610, revenueM: 490 },
    { name: "Bếp Nhà Hội An", type: "RESTAURANT", orders: 1_120, revenueM: 420 },
    { name: "Hải sản Cầu Rồng", type: "RESTAURANT", orders: 980, revenueM: 385 },
  ],

  topPartners: [
    { name: "Partner A", services: 46, revenueM: 820 },
    { name: "Partner B", services: 33, revenueM: 640 },
    { name: "Partner C", services: 28, revenueM: 520 },
    { name: "Partner D", services: 22, revenueM: 470 },
  ],

  systemHealth: {
    uptimePct: 99.96,
    apiP95ms: 320,
    errorRatePct: 0.42,
    kafkaLag: 38, // msg
    failedJobs: 2,
    lastIncident: "2025-12-21 10:14 (Payment gateway timeout)",
  },

  alerts: [
    {
      id: "cancel-spike",
      level: "warning",
      titleKey: "admin.alert.cancel_spike_title",
      descKey: "admin.alert.cancel_spike_desc",
    },
    {
      id: "payment-spike",
      level: "danger",
      titleKey: "admin.alert.payment_spike_title",
      descKey: "admin.alert.payment_spike_desc",
    },
    {
      id: "content-report",
      level: "warning",
      titleKey: "admin.alert.content_report_title",
      descKey: "admin.alert.content_report_desc",
    },
  ],
};

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
  const [range, setRange] = useState("weekly"); // today | weekly | monthly | yearly

  const ov = MOCK.overview;

  const totalBookingStatus = useMemo(
    () => MOCK.bookingStatus.reduce((acc, x) => acc + (Number(x.count) || 0), 0),
    []
  );

  const statusRows = useMemo(() => {
    return MOCK.bookingStatus
      .map((x) => {
        const pct =
          totalBookingStatus > 0
            ? Math.round(((Number(x.count) || 0) / totalBookingStatus) * 100)
            : 0;
        return { ...x, pct };
      })
      .sort((a, b) => b.count - a.count);
  }, [totalBookingStatus]);

  const revenueTotalM = useMemo(
    () => MOCK.revenueSeries.reduce((acc, p) => acc + (Number(p.total) || 0), 0),
    []
  );

  return (
    <AdminLayout>
      <div className={ui.pageBg}>
        <div className="mx-auto w-full max-w-8xl px-4 py-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className={ui.h1}>{t("admin.dashboard.title")}</h1>
                <p className={ui.sub}>
                  {t("admin.dashboard.subtitle")}
                </p>
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
                  onClick={() => {
                    // mock refresh
                    // sau này gọi api load overview/revenue/status
                  }}
                  title={t("admin.reload")}
                >
                  <ArrowPathIcon className="h-5 w-5" />
                  {t("admin.reload")}
                </button>
              </div>
            </div>
          </div>

          {/* Alerts */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 mb-6">
            {MOCK.alerts.slice(0, 3).map((a) => (
              <AlertBox key={a.id} level={a.level} title={t(a.titleKey)} desc={t(a.descKey)} />
            ))}
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 mb-6">
            <StatCard
              icon={UsersIcon}
              label={t("admin.stat.users")}
              value={formatInt(ov.totalUsers)}
              sub={t("admin.stat.active_7d", { n: formatInt(ov.activeUsers7d) })}
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
                      {t("admin.revenue.period_label", { v: range === "today" ? t("admin.range.today") : range === "weekly" ? t("admin.range.weekly") : range === "monthly" ? t("admin.range.monthly") : t("admin.range.yearly") })}
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
                    <LineChart data={MOCK.revenueSeries}>
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
                      {ov.cancelRate7dPct}%
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-sm dark:border-slate-800">
                    <div className="text-slate-500 dark:text-slate-300">{t("admin.metric.refund_rate_7d")}</div>
                    <div className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                      {ov.refundRate7dPct}%
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-sm dark:border-slate-800">
                    <div className="text-slate-500 dark:text-slate-300">{t("admin.metric.payment_fail_7d")}</div>
                    <div className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                      {ov.paymentFail7dPct}%
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
                      {t("admin.top_n", { n: 4 })}
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
                        {MOCK.topServices.map((x, idx) => (
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
                        ))}
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
                      {t("admin.top_n", { n: 4 })}
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
                        {MOCK.topPartners.map((x, idx) => (
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
                        ))}
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
                  {MOCK.actionQueue.map((x) => (
                    <div
                      key={x.id}
                      className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 dark:border-slate-800"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {t(x.titleKey)}
                          </div>
                          <div className="mt-1 text-xs text-slate-400">
                            {t(x.hintKey)}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <SeverityPill severity={x.severity} />
                          <div className="text-lg font-bold text-slate-900 dark:text-white">
                            {formatInt(x.count)}
                          </div>
                        </div>
                      </div>

                      {/* CTA placeholder - sau này link sang trang bạn đã làm */}
                      <div className="mt-3 flex justify-end">
                        <button
                          type="button"
                          className={`${ui.btn} ${ui.btnGhost}`}
                          onClick={() => {
                            // nav("/admin/services?status=PENDING") ... (sau)
                          }}
                        >
                          {t("admin.action_queue.open_list")}
                        </button>
                      </div>
                    </div>
                  ))}
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
                  {statusRows.map((x) => (
                    <div key={x.key} className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm text-slate-800 dark:text-slate-100 truncate">
                          {t(x.labelKey)}
                        </div>
                        <div className="text-xs text-slate-400">{t("admin.booking_status.orders_count", { n: formatInt(x.count) })}</div>
                      </div>
                      <div className="shrink-0 text-sm font-semibold text-slate-900 dark:text-white">
                        {x.pct}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* System health */}
              <div className={ui.card}>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheckIcon className="h-5 w-5 text-slate-500 dark:text-slate-300" />
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {t("admin.system_health.title")}
                    </h2>
                  </div>
                  <span className={`${ui.pill} bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-200`}>
                    {t("admin.system_health.uptime", { n: MOCK.systemHealth.uptimePct })}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 dark:border-slate-800">
                    <div className="text-slate-500 dark:text-slate-300">API p95</div>
                    <div className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                      {MOCK.systemHealth.apiP95ms}ms
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 dark:border-slate-800">
                    <div className="text-slate-500 dark:text-slate-300">Error rate</div>
                    <div className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                      {MOCK.systemHealth.errorRatePct}%
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 dark:border-slate-800">
                    <div className="text-slate-500 dark:text-slate-300">Kafka lag</div>
                    <div className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                      {MOCK.systemHealth.kafkaLag}
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 dark:border-slate-800">
                    <div className="text-slate-500 dark:text-slate-300">{t("admin.system_health.failed_jobs")}</div>
                    <div className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                      {MOCK.systemHealth.failedJobs}
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-sm dark:border-slate-800">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <ExclamationTriangleIcon className="h-4 w-4" />
                    <div className="font-semibold">{t("admin.system_health.last_incident")}</div>
                  </div>
                  <div className="mt-1 text-slate-500 dark:text-slate-400">
                    {MOCK.systemHealth.lastIncident}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-6 text-xs text-slate-400">
            {t("admin.dashboard.footer_note")}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
