"use client";

// src/features/admin/pages/AdminDashboard.jsx
import { useMemo, useState } from "react";
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

/* ===================== MOCK DATA (CỨNG) ===================== */

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
      title: "Dịch vụ chờ phê duyệt",
      count: 132,
      severity: "high",
      hint: "Ưu tiên duyệt để tránh đối tác chờ lâu",
    },
    {
      id: "reports",
      title: "Báo cáo vi phạm mới",
      count: 18,
      severity: "high",
      hint: "Kiểm tra nội dung/ảnh mô tả không phù hợp",
    },
    {
      id: "payment-failed",
      title: "Đơn thanh toán thất bại",
      count: 44,
      severity: "medium",
      hint: "Theo dõi cổng thanh toán, rà soát retry",
    },
    {
      id: "partner-kyc",
      title: "Đối tác cần bổ sung hồ sơ",
      count: 27,
      severity: "medium",
      hint: "Nhắc đối tác hoàn thiện để được duyệt",
    },
    {
      id: "support-tickets",
      title: "Ticket hỗ trợ tồn",
      count: 9,
      severity: "low",
      hint: "Giảm backlog hỗ trợ",
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
    { key: "CONFIRMED", label: "Đã xác nhận", count: 6_430 },
    { key: "PAID", label: "Đã thanh toán", count: 4_980 },
    { key: "COMPLETED", label: "Hoàn tất", count: 3_210 },
    { key: "CANCELLED", label: "Đã hủy", count: 860 },
    { key: "REFUNDED", label: "Đã hoàn tiền", count: 170 },
    { key: "FAILED", label: "Thất bại", count: 120 },
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
      title: "Tỷ lệ hủy tăng",
      desc: "Cancel rate 7 ngày tăng +1.8% so với tuần trước",
    },
    {
      id: "payment-spike",
      level: "danger",
      title: "Thanh toán lỗi tăng",
      desc: "Payment failed tăng mạnh ở khung 20:00–22:00",
    },
    {
      id: "content-report",
      level: "warning",
      title: "Báo cáo nội dung",
      desc: "Có nhiều report liên quan ảnh mô tả dịch vụ",
    },
  ],
};

/* ===================== UI TOKENS ===================== */

const ui = {
  pageBg: "bg-slate-50 dark:bg-slate-950",
  card:
    "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950",
  h1: "text-2xl font-bold text-slate-900 dark:text-white",
  sub: "text-sm text-slate-500 dark:text-slate-300",
  btn:
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
  btnGhost:
    "bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900",
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
      "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-800",
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
  const map = {
    high: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-200 dark:border-rose-900",
    medium:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-200 dark:border-amber-900",
    low: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-800",
  };
  const label = severity === "high" ? "Ưu tiên cao" : severity === "medium" ? "Trung bình" : "Thấp";
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

/* ===================== PAGE ===================== */

export default function AdminDashboard() {
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
                <h1 className={ui.h1}>Dashboard quản trị</h1>
                <p className={ui.sub}>
                  Trang theo dõi tổng quan hệ thống: biết tình hình và biết việc cần xử lý.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <select
                  value={range}
                  onChange={(e) => setRange(e.target.value)}
                  className="w-full sm:w-auto rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                >
                  <option value="today">Hôm nay</option>
                  <option value="weekly">7 ngày</option>
                  <option value="monthly">Tháng</option>
                  <option value="yearly">Năm</option>
                </select>

                <button
                  type="button"
                  className={`${ui.btn} ${ui.btnGhost} gap-2`}
                  onClick={() => {
                    // mock refresh
                    // sau này gọi api load overview/revenue/status
                  }}
                  title="Tải lại"
                >
                  <ArrowPathIcon className="h-5 w-5" />
                  Tải lại
                </button>
              </div>
            </div>
          </div>

          {/* Alerts */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 mb-6">
            {MOCK.alerts.slice(0, 3).map((a) => (
              <AlertBox key={a.id} level={a.level} title={a.title} desc={a.desc} />
            ))}
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 mb-6">
            <StatCard
              icon={UsersIcon}
              label="Người dùng"
              value={formatInt(ov.totalUsers)}
              sub={`Hoạt động 7 ngày: ${formatInt(ov.activeUsers7d)}`}
              accent="blue"
            />
            <StatCard
              icon={BuildingStorefrontIcon}
              label="Đối tác"
              value={formatInt(ov.partners)}
              sub="Tổng số đối tác đã đăng ký"
              accent="violet"
            />
            <StatCard
              icon={Squares2X2Icon}
              label="Dịch vụ đang hoạt động"
              value={formatInt(ov.servicesActive)}
              sub={`Chờ duyệt: ${formatInt(ov.servicesPendingApproval)}`}
              accent="green"
            />
            <StatCard
              icon={CreditCardIcon}
              label="Booking hôm nay"
              value={formatInt(ov.bookingsToday)}
              sub={`7 ngày: ${formatInt(ov.bookings7d)}`}
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
                        Doanh thu theo thời gian
                      </h2>
                    </div>
                    <div className="mt-1 text-xs text-slate-400">
                      Tổng (kỳ đang xem): {formatMoneyM(revenueTotalM)} triệu VND
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className={`${ui.pill} bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200`}>
                      Kỳ: {range === "today" ? "Hôm nay" : range === "weekly" ? "7 ngày" : range === "monthly" ? "Tháng" : "Năm"}
                    </span>
                    <span className={`${ui.pill} bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-200`}>
                      Hôm nay: {formatMoneyVnd(ov.revenueTodayVnd)} VND
                    </span>
                    <span className={`${ui.pill} bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/30 dark:border-blue-900 dark:text-blue-200`}>
                      7 ngày: {formatMoneyVnd(ov.revenue7dVnd)} VND
                    </span>
                  </div>
                </div>

                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={MOCK.revenueSeries}>
                      <XAxis dataKey="label" />
                      <YAxis tickFormatter={(v) => `${formatMoneyM(v)}tr`} />
                      <Tooltip formatter={(v) => [`${formatMoneyM(v)} triệu`, ""]} />
                      <Legend />
                      <Line type="monotone" dataKey="total" name="Tổng" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="hotel" name="Khách sạn" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="restaurant" name="Nhà hàng" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-800">
                    <div className="text-slate-500 dark:text-slate-300">Tỷ lệ hủy (7 ngày)</div>
                    <div className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                      {ov.cancelRate7dPct}%
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-800">
                    <div className="text-slate-500 dark:text-slate-300">Tỷ lệ hoàn tiền (7 ngày)</div>
                    <div className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                      {ov.refundRate7dPct}%
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-800">
                    <div className="text-slate-500 dark:text-slate-300">Thanh toán thất bại (7 ngày)</div>
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
                        Dịch vụ nổi bật
                      </h3>
                    </div>
                    <span className={`${ui.pill} bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200`}>
                      Top 4
                    </span>
                  </div>

                  <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="min-w-full text-sm">
                      <thead className="bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                        <tr>
                          <th className="px-3 py-2 text-left font-semibold">Dịch vụ</th>
                          <th className="px-3 py-2 text-right font-semibold">Đơn</th>
                          <th className="px-3 py-2 text-right font-semibold">Doanh thu</th>
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
                        Đối tác đóng góp
                      </h3>
                    </div>
                    <span className={`${ui.pill} bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200`}>
                      Top 4
                    </span>
                  </div>

                  <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="min-w-full text-sm">
                      <thead className="bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                        <tr>
                          <th className="px-3 py-2 text-left font-semibold">Đối tác</th>
                          <th className="px-3 py-2 text-right font-semibold">Dịch vụ</th>
                          <th className="px-3 py-2 text-right font-semibold">Doanh thu</th>
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
                      Việc cần xử lý
                    </h2>
                  </div>
                  <span className={`${ui.pill} bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/30 dark:border-rose-900 dark:text-rose-200`}>
                    Ưu tiên hôm nay
                  </span>
                </div>

                <div className="space-y-3">
                  {MOCK.actionQueue.map((x) => (
                    <div
                      key={x.id}
                      className="rounded-xl border border-slate-200 p-3 dark:border-slate-800"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {x.title}
                          </div>
                          <div className="mt-1 text-xs text-slate-400">
                            {x.hint}
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
                          Mở danh sách
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
                      Trạng thái đơn
                    </h2>
                  </div>
                  <span className={`${ui.pill} bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200`}>
                    Tổng: {formatInt(totalBookingStatus)}
                  </span>
                </div>

                <div className="space-y-3">
                  {statusRows.map((x) => (
                    <div key={x.key} className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm text-slate-800 dark:text-slate-100 truncate">
                          {x.label}
                        </div>
                        <div className="text-xs text-slate-400">{formatInt(x.count)} đơn</div>
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
                      Sức khỏe hệ thống
                    </h2>
                  </div>
                  <span className={`${ui.pill} bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-200`}>
                    Uptime {MOCK.systemHealth.uptimePct}%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                    <div className="text-slate-500 dark:text-slate-300">API p95</div>
                    <div className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                      {MOCK.systemHealth.apiP95ms}ms
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                    <div className="text-slate-500 dark:text-slate-300">Error rate</div>
                    <div className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                      {MOCK.systemHealth.errorRatePct}%
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                    <div className="text-slate-500 dark:text-slate-300">Kafka lag</div>
                    <div className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                      {MOCK.systemHealth.kafkaLag}
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                    <div className="text-slate-500 dark:text-slate-300">Job lỗi</div>
                    <div className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                      {MOCK.systemHealth.failedJobs}
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-800">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <ExclamationTriangleIcon className="h-4 w-4" />
                    <div className="font-semibold">Sự cố gần nhất</div>
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
            Dashboard này chỉ hiển thị thống kê và hàng chờ. Các trang quản lý chi tiết (users/partners/services/bookings) nằm ở mục riêng.
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
