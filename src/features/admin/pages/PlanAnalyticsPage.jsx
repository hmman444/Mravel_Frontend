"use client";

// src/features/admin/pages/PlanAnalyticsPage.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import AdminLayout from "../components/AdminLayout";
import {
  ArrowPathIcon,
  ChartBarIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  EyeIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  NoSymbolIcon,
  FlagIcon,
} from "@heroicons/react/24/outline";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import {
  fetchPlanStats,
  fetchPlanReports,
  takedownPlan,
  resolveReport,
} from "../services/adminPlanService";
import PromptModal from "../../../components/PromptModal";
import { showError, showSuccess } from "../../../utils/toastUtils";

/* ===== UI tokens (đồng bộ với AdminDashboard) ===== */
const ui = {
  pageBg: "bg-slate-50 dark:bg-slate-950",
  card:
    "rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-800 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900",
  h1: "text-2xl font-bold text-slate-900 dark:text-white",
  sub: "text-sm text-slate-500 dark:text-slate-300",
  btn:
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed gap-2",
  btnGhost:
    "bg-white dark:bg-gray-800 hover:bg-slate-50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 dark:hover:bg-slate-800",
  pill: "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
};

const COLORS = ["#2563EB", "#F97316", "#10B981", "#A855F7", "#EF4444", "#64748B"];
const VIS_COLORS = { PUBLIC: "#2563EB", FRIENDS: "#A855F7", PRIVATE: "#64748B" };
const STATUS_COLORS = {
  DRAFT: "#64748B",
  ACTIVE: "#2563EB",
  COMPLETED: "#10B981",
  CANCELLED: "#EF4444",
};

const fmt = (n) => (Number(n) || 0).toLocaleString("vi-VN");

function StatCard({ icon: Icon, label, value, sub, accent = "blue" }) {
  const map = {
    blue: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-200 dark:border-blue-900",
    green: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-200 dark:border-emerald-900",
    amber: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-200 dark:border-amber-900",
    violet: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/30 dark:text-violet-200 dark:border-violet-900",
    rose: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-200 dark:border-rose-900",
    slate: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-800",
  };
  return (
    <div className={ui.card}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm text-slate-500 dark:text-slate-300">{label}</div>
          <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-white truncate">{value}</div>
          {sub ? <div className="mt-1 text-xs text-slate-400 dark:text-slate-400">{sub}</div> : null}
        </div>
        <div className={`shrink-0 rounded-2xl border p-2 ${map[accent] || map.blue}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function Donut({ title, items }) {
  const total = items.reduce((a, x) => a + (Number(x.value) || 0), 0);
  return (
    <div className={ui.card}>
      <h3 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
      <div className="flex flex-col items-center gap-5 sm:flex-row">
        <div className="relative h-40 w-40 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={items} dataKey="value" nameKey="label" innerRadius={52} outerRadius={72} paddingAngle={2}>
                {items.map((it, i) => (
                  <Cell key={i} fill={it.color || COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-xl font-bold text-slate-900 dark:text-white">{fmt(total)}</div>
            <div className="text-[10px] uppercase tracking-wide text-slate-400">Total</div>
          </div>
        </div>
        <div className="flex-1 space-y-2.5 w-full">
          {items.map((it, i) => {
            const pct = total > 0 ? Math.round((it.value / total) * 100) : 0;
            return (
              <div key={i} className="flex items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: it.color || COLORS[i % COLORS.length] }} />
                  <span className="truncate text-slate-700 dark:text-slate-200">{it.label}</span>
                </div>
                <span className="text-slate-500 dark:text-slate-400">{fmt(it.value)} • {pct}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function PlanAnalyticsPage() {
  const { t } = useTranslation();
  const [days, setDays] = useState(30);
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, r] = await Promise.all([
        fetchPlanStats(days),
        fetchPlanReports({ status: "PENDING", page: 1, size: 20 }),
      ]);
      setStats(s);
      setReports(r?.content || []);
    } catch (e) {
      setError(e?.message || "Error");
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    load();
  }, [load]);

  const ov = stats?.overview;

  const series = useMemo(
    () => (stats?.newPlansByDay || []).map((p) => ({ label: p.date, count: p.count })),
    [stats]
  );
  const visItems = useMemo(
    () =>
      (stats?.byVisibility || []).map((d) => ({
        label: t(`enum.visibility.${d.key.toLowerCase()}`, d.key),
        value: d.count,
        color: VIS_COLORS[d.key] || null,
      })),
    [stats, t]
  );
  const statusItems = useMemo(
    () =>
      (stats?.byStatus || []).map((d) => ({
        label: t(`enum.plan_status.${d.key.toLowerCase()}`, d.key),
        value: d.count,
        color: STATUS_COLORS[d.key] || null,
      })),
    [stats, t]
  );

  // modal gỡ bài: { kind: 'plan'|'report', id }
  const [takedownModal, setTakedownModal] = useState(null);

  const doTakedown = async ({ input }) => {
    const target = takedownModal;
    setTakedownModal(null);
    if (!target) return;
    setBusyId(target.kind === "plan" ? `p${target.id}` : `r${target.id}`);
    try {
      if (target.kind === "plan") {
        await takedownPlan(target.id, input);
      } else {
        await resolveReport(target.id, "TAKEDOWN", input);
      }
      showSuccess(t("admin.plan_stat.takedown_done", "Đã gỡ bài viết"));
      await load();
    } catch (e) {
      showError(e?.message || t("admin.error_generic", "Đã có lỗi xảy ra"));
    } finally {
      setBusyId(null);
    }
  };

  const onDismiss = async (reportId) => {
    setBusyId(`r${reportId}`);
    try {
      await resolveReport(reportId, "NONE", null);
      showSuccess(t("admin.plan_stat.report_dismissed", "Đã bỏ qua báo cáo"));
      await load();
    } catch (e) {
      showError(e?.message || t("admin.error_generic", "Đã có lỗi xảy ra"));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminLayout>
      <div className={ui.pageBg}>
        <div className="mx-auto w-full max-w-8xl px-4 py-6">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className={ui.h1}>{t("admin.plan_stat.title", "Thống kê Plan & Bài viết")}</h1>
              <p className={ui.sub}>
                {t("admin.plan_stat.subtitle", "Theo dõi nội dung, tương tác và kiểm duyệt bài viết")}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none dark:bg-slate-900 dark:text-slate-100"
              >
                <option value={7}>{t("admin.range.weekly", "7 ngày")}</option>
                <option value={30}>{t("admin.range.monthly", "30 ngày")}</option>
                <option value={90}>{t("admin.plan_stat.range_90", "90 ngày")}</option>
              </select>
              <button type="button" className={`${ui.btn} ${ui.btnGhost}`} onClick={load} disabled={loading}>
                <ArrowPathIcon className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
                {t("admin.reload", "Tải lại")}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
              {error}
            </div>
          )}

          {/* KPI */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={DocumentTextIcon} label={t("admin.plan_stat.total_plans", "Tổng số plan")} value={fmt(ov?.totalPlans)} sub={t("admin.plan_stat.public_n", { defaultValue: "{{n}} công khai", n: fmt(ov?.publicPlans) })} accent="blue" />
            <StatCard icon={GlobeAltIcon} label={t("admin.plan_stat.new_30d", "Plan mới (30 ngày)")} value={fmt(ov?.newPlans30d)} sub={t("admin.plan_stat.new_7d", { defaultValue: "{{n}} trong 7 ngày", n: fmt(ov?.newPlans7d) })} accent="green" />
            <StatCard icon={EyeIcon} label={t("admin.plan_stat.total_views", "Tổng lượt xem")} value={fmt(ov?.totalViews)} accent="amber" />
            <StatCard icon={HeartIcon} label={t("admin.plan_stat.engagement", "Tương tác")} value={fmt((ov?.totalReactions || 0) + (ov?.totalComments || 0))} sub={t("admin.plan_stat.react_comment", { defaultValue: "{{r}} reactions • {{c}} bình luận", r: fmt(ov?.totalReactions), c: fmt(ov?.totalComments) })} accent="violet" />
          </div>

          {/* moderation KPI */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StatCard icon={NoSymbolIcon} label={t("admin.plan_stat.taken_down", "Bài đã gỡ")} value={fmt(ov?.takenDownPlans)} accent="rose" />
            <StatCard icon={FlagIcon} label={t("admin.plan_stat.pending_reports", "Báo cáo chờ xử lý")} value={fmt(ov?.pendingReports)} accent="amber" />
          </div>

          {/* charts */}
          <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className={`${ui.card} lg:col-span-2`}>
              <div className="mb-3 flex items-center gap-2">
                <ChartBarIcon className="h-5 w-5 text-slate-500 dark:text-slate-300" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {t("admin.plan_stat.new_by_day", "Bài viết mới theo ngày")}
                </h3>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={series} margin={{ top: 10, right: 8, left: -8, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gPlans" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.4} />
                    <XAxis dataKey="label" fontSize={11} />
                    <YAxis fontSize={11} allowDecimals={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="count" stroke="#2563EB" strokeWidth={2} fill="url(#gPlans)" name={t("admin.plan_stat.new_plans", "Plan mới")} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <Donut title={t("admin.plan_stat.by_visibility", "Theo quyền hiển thị")} items={visItems} />
          </div>

          <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Donut title={t("admin.plan_stat.by_status", "Theo trạng thái")} items={statusItems} />
            {/* Top plans */}
            <div className={ui.card}>
              <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
                {t("admin.plan_stat.top_plans", "Top bài viết theo lượt xem")}
              </h3>
              <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold">{t("admin.plan_stat.col_title", "Tiêu đề")}</th>
                      <th className="px-3 py-2 text-right font-semibold">{t("admin.plan_stat.col_views", "Lượt xem")}</th>
                      <th className="px-3 py-2 text-right font-semibold"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {(stats?.topPlans || []).map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/40">
                        <td className="px-3 py-2 font-medium text-slate-900 dark:text-slate-100 truncate max-w-[260px]">{p.title}</td>
                        <td className="px-3 py-2 text-right text-slate-700 dark:text-slate-200">{fmt(p.views)}</td>
                        <td className="px-3 py-2 text-right">
                          <button
                            type="button"
                            disabled={busyId === `p${p.id}`}
                            onClick={() => setTakedownModal({ kind: "plan", id: p.id })}
                            className={`${ui.pill} border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/30 dark:text-rose-200 dark:border-rose-900`}
                          >
                            {t("admin.plan_stat.takedown", "Gỡ")}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {(stats?.topPlans || []).length === 0 && (
                      <tr><td colSpan={3} className="px-3 py-6 text-center text-slate-400">{t("admin.plan_stat.empty", "Chưa có dữ liệu")}</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Report queue */}
          <div className={ui.card}>
            <div className="mb-4 flex items-center gap-2">
              <FlagIcon className="h-5 w-5 text-slate-500 dark:text-slate-300" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {t("admin.plan_stat.report_queue", "Hàng đợi báo cáo (chờ xử lý)")}
              </h3>
            </div>
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold">Plan</th>
                    <th className="px-3 py-2 text-left font-semibold">{t("admin.plan_stat.col_reason", "Lý do")}</th>
                    <th className="px-3 py-2 text-left font-semibold">{t("admin.plan_stat.col_detail", "Chi tiết")}</th>
                    <th className="px-3 py-2 text-right font-semibold">{t("admin.plan_stat.col_actions", "Hành động")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {reports.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/40">
                      <td className="px-3 py-2 text-slate-700 dark:text-slate-200">#{r.planId}</td>
                      <td className="px-3 py-2">
                        <span className={`${ui.pill} border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-200 dark:border-amber-900`}>
                          {t(`enum.report_reason.${String(r.reason).toLowerCase()}`, r.reason)}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-slate-500 dark:text-slate-400 truncate max-w-[280px]">{r.detail || "—"}</td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            disabled={busyId === `r${r.id}`}
                            onClick={() => setTakedownModal({ kind: "report", id: r.id })}
                            className={`${ui.pill} border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/30 dark:text-rose-200 dark:border-rose-900`}
                          >
                            {t("admin.plan_stat.takedown", "Gỡ bài")}
                          </button>
                          <button
                            type="button"
                            disabled={busyId === `r${r.id}`}
                            onClick={() => onDismiss(r.id)}
                            className={`${ui.pill} border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-800`}
                          >
                            {t("admin.plan_stat.dismiss", "Bỏ qua")}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {reports.length === 0 && (
                    <tr><td colSpan={4} className="px-3 py-6 text-center text-slate-400">{t("admin.plan_stat.no_reports", "Không có báo cáo nào đang chờ")}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <PromptModal
        open={!!takedownModal}
        title={t("admin.plan_stat.takedown", "Gỡ bài")}
        description={t("admin.plan_stat.takedown_desc", "Bài sẽ bị ép về PRIVATE và khóa vĩnh viễn (không thể bật lại).")}
        inputLabel={t("admin.plan_stat.takedown_reason", "Lý do gỡ bài:")}
        inputPlaceholder={t("admin.plan_stat.takedown_reason_ph", "Nhập lý do...")}
        multiline
        confirmText={t("admin.plan_stat.takedown", "Gỡ bài")}
        tone="danger"
        onConfirm={doTakedown}
        onClose={() => setTakedownModal(null)}
      />
    </AdminLayout>
  );
}
