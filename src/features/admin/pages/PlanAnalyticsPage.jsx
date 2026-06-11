"use client";

// src/features/admin/pages/PlanAnalyticsPage.jsx
// Tab "Quản lý lịch trình": thống kê gọn + tìm kiếm/quản lý toàn bộ lịch trình
// (xem chi tiết & báo cáo, gỡ, bật lại) + hàng đợi báo cáo.
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
  SparklesIcon,
  MagnifyingGlassIcon,
  ArrowUturnLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
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
} from "recharts";
import {
  fetchPlanStats,
  fetchPlanReports,
  fetchAdminPlans,
  takedownPlan,
  resolveReport,
  restorePlan,
} from "../services/adminPlanService";
import PromptModal from "../../../components/PromptModal";
import ConfirmModal from "../../../components/ConfirmModal";
import PlanDetailModal from "../components/plan/PlanDetailModal";
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
  field:
    "rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none dark:bg-slate-900 dark:text-slate-100",
};

const COLORS = ["#2563EB", "#F97316", "#10B981", "#A855F7", "#EF4444", "#64748B"];
const VIS_COLORS = { PUBLIC: "#2563EB", FRIENDS: "#A855F7", PRIVATE: "#64748B" };
const STATUS_COLORS = {
  DRAFT: "#64748B",
  ACTIVE: "#2563EB",
  COMPLETED: "#10B981",
  CANCELLED: "#EF4444",
};
const VIS_BADGE = {
  PUBLIC: "border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-200 dark:border-blue-900",
  FRIENDS: "border-violet-200 bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-200 dark:border-violet-900",
  PRIVATE: "border-slate-200 bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
};
const STATUS_BADGE = {
  DRAFT: "border-slate-200 bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  ACTIVE: "border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-200 dark:border-blue-900",
  COMPLETED: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200 dark:border-emerald-900",
  CANCELLED: "border-rose-200 bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-200 dark:border-rose-900",
};

const fmt = (n) => (Number(n) || 0).toLocaleString("vi-VN");
const fmtDate = (v) => {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleDateString("vi-VN");
  } catch {
    return String(v);
  }
};

/* Dải KPI gọn: ô nhỏ icon + nhãn + số */
function MiniStat({ icon: Icon, label, value, accent = "slate" }) {
  const map = {
    blue: "text-blue-600 dark:text-blue-300",
    green: "text-emerald-600 dark:text-emerald-300",
    amber: "text-amber-600 dark:text-amber-300",
    violet: "text-violet-600 dark:text-violet-300",
    rose: "text-rose-600 dark:text-rose-300",
    slate: "text-slate-500 dark:text-slate-300",
  };
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 dark:border-slate-800 dark:bg-slate-900">
      <Icon className={`h-5 w-5 shrink-0 ${map[accent] || map.slate}`} />
      <div className="min-w-0">
        <div className="truncate text-[11px] leading-tight text-slate-400 dark:text-slate-400">{label}</div>
        <div className="text-lg font-bold leading-tight text-slate-900 dark:text-white">{value}</div>
      </div>
    </div>
  );
}

function Donut({ title, items }) {
  const total = items.reduce((a, x) => a + (Number(x.value) || 0), 0);
  return (
    <div className={ui.card}>
      <h3 className="mb-3 text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
      <div className="flex flex-col items-center gap-5 sm:flex-row">
        <div className="relative h-32 w-32 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={items} dataKey="value" nameKey="label" innerRadius={42} outerRadius={60} paddingAngle={2}>
                {items.map((it, i) => (
                  <Cell key={i} fill={it.color || COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-lg font-bold text-slate-900 dark:text-white">{fmt(total)}</div>
            <div className="text-[10px] uppercase tracking-wide text-slate-400">Total</div>
          </div>
        </div>
        <div className="w-full flex-1 space-y-2">
          {items.map((it, i) => {
            const pct = total > 0 ? Math.round((it.value / total) * 100) : 0;
            return (
              <div key={i} className="flex items-center justify-between gap-3 text-sm">
                <div className="flex min-w-0 items-center gap-2">
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

function RowAvatar({ src, name }) {
  const [err, setErr] = useState(false);
  const initial = (name || "?").trim().charAt(0).toUpperCase();
  if (src && !err) {
    return <img src={src} alt={name || ""} onError={() => setErr(true)} className="h-7 w-7 rounded-full object-cover" />;
  }
  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-200">
      {initial}
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

  // ===== Bảng quản lý lịch trình =====
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [fVis, setFVis] = useState("");
  const [fStatus, setFStatus] = useState("");
  const [fLocked, setFLocked] = useState(""); // "", "false", "true"
  const [page, setPage] = useState(1);
  const size = 10;
  const [plans, setPlans] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [plansLoading, setPlansLoading] = useState(false);

  const [detailId, setDetailId] = useState(null);

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

  // debounce ô tìm kiếm
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQ(q.trim()), 400);
    return () => clearTimeout(id);
  }, [q]);

  // mọi thay đổi bộ lọc -> về trang 1
  useEffect(() => {
    setPage(1);
  }, [debouncedQ, fVis, fStatus, fLocked]);

  const loadPlans = useCallback(async () => {
    setPlansLoading(true);
    try {
      const data = await fetchAdminPlans({
        q: debouncedQ,
        visibility: fVis,
        status: fStatus,
        locked: fLocked,
        page,
        size,
        sort: "createdAt,desc",
      });
      setPlans(data?.content || []);
      setTotalPages(data?.totalPages || 0);
      setTotalElements(data?.totalElements || 0);
    } catch (e) {
      showError(e?.message || t("admin.error_generic"));
    } finally {
      setPlansLoading(false);
    }
  }, [debouncedQ, fVis, fStatus, fLocked, page, t]);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

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
  // modal bật lại: plan id
  const [restoreTarget, setRestoreTarget] = useState(null);

  const refreshAll = useCallback(async () => {
    await Promise.all([load(), loadPlans()]);
  }, [load, loadPlans]);

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
      showSuccess(t("admin.plan_stat.takedown_done"));
      setDetailId(null);
      await refreshAll();
    } catch (e) {
      showError(e?.message || t("admin.error_generic"));
    } finally {
      setBusyId(null);
    }
  };

  const doRestore = async () => {
    const id = restoreTarget;
    setRestoreTarget(null);
    if (!id) return;
    setBusyId(`p${id}`);
    try {
      await restorePlan(id);
      showSuccess(t("admin.plan_manage.restore_done"));
      setDetailId(null);
      await refreshAll();
    } catch (e) {
      showError(e?.message || t("admin.error_generic"));
    } finally {
      setBusyId(null);
    }
  };

  const onDismiss = async (reportId) => {
    setBusyId(`r${reportId}`);
    try {
      await resolveReport(reportId, "NONE", null);
      showSuccess(t("admin.plan_stat.report_dismissed"));
      await refreshAll();
    } catch (e) {
      showError(e?.message || t("admin.error_generic"));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminLayout>
      <div className={ui.pageBg}>
        <div className="mx-auto w-full max-w-8xl px-4 py-6">
          {/* Header */}
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className={ui.h1}>{t("admin.plan_manage.title")}</h1>
              <p className={ui.sub}>{t("admin.plan_manage.subtitle")}</p>
            </div>
            <div className="flex items-center gap-3">
              <select value={days} onChange={(e) => setDays(Number(e.target.value))} className={ui.field}>
                <option value={7}>{t("admin.range.weekly")}</option>
                <option value={30}>{t("admin.range.monthly")}</option>
                <option value={90}>{t("admin.plan_stat.range_90")}</option>
              </select>
              <button type="button" className={`${ui.btn} ${ui.btnGhost}`} onClick={refreshAll} disabled={loading || plansLoading}>
                <ArrowPathIcon className={`h-5 w-5 ${loading || plansLoading ? "animate-spin" : ""}`} />
                {t("admin.reload")}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
              {error}
            </div>
          )}

          {/* KPI dải gọn (8 chỉ số, 2 hàng) */}
          <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
            <MiniStat icon={DocumentTextIcon} label={t("admin.plan_manage.tile_total")} value={fmt(ov?.totalPlans)} accent="blue" />
            <MiniStat icon={GlobeAltIcon} label={t("admin.plan_manage.tile_public")} value={fmt(ov?.publicPlans)} accent="blue" />
            <MiniStat icon={SparklesIcon} label={t("admin.plan_manage.tile_new")} value={fmt(ov?.newPlans30d)} accent="green" />
            <MiniStat icon={EyeIcon} label={t("admin.plan_manage.tile_views")} value={fmt(ov?.totalViews)} accent="amber" />
            <MiniStat icon={HeartIcon} label={t("admin.plan_manage.tile_reactions")} value={fmt(ov?.totalReactions)} accent="violet" />
            <MiniStat icon={ChatBubbleLeftRightIcon} label={t("admin.plan_manage.tile_comments")} value={fmt(ov?.totalComments)} accent="violet" />
            <MiniStat icon={NoSymbolIcon} label={t("admin.plan_manage.tile_locked")} value={fmt(ov?.takenDownPlans)} accent="rose" />
            <MiniStat icon={FlagIcon} label={t("admin.plan_manage.tile_pending")} value={fmt(ov?.pendingReports)} accent="amber" />
          </div>

          {/* Charts (luôn hiển thị) */}
          <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
            <div className={`${ui.card} xl:col-span-2`}>
              <div className="mb-3 flex items-center gap-2">
                <ChartBarIcon className="h-5 w-5 text-slate-500 dark:text-slate-300" />
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">{t("admin.plan_stat.new_by_day")}</h3>
              </div>
              <div className="h-[220px]">
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
                    <Area type="monotone" dataKey="count" stroke="#2563EB" strokeWidth={2} fill="url(#gPlans)" name={t("admin.plan_stat.new_plans")} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <Donut title={t("admin.plan_stat.by_visibility")} items={visItems} />
            <Donut title={t("admin.plan_stat.by_status")} items={statusItems} />
          </div>

          {/* ===== Bảng quản lý lịch trình ===== */}
          <div className={`${ui.card} mb-6`}>
            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {t("admin.plan_manage.table_title")}
                <span className="ml-2 text-sm font-normal text-slate-400">
                  {t("admin.plan_manage.total_n", { n: fmt(totalElements) })}
                </span>
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder={t("admin.plan_manage.search_ph")}
                    className={`${ui.field} w-56 pl-9`}
                  />
                </div>
                <select value={fVis} onChange={(e) => setFVis(e.target.value)} className={ui.field}>
                  <option value="">{t("admin.plan_manage.filter_visibility")}</option>
                  <option value="PUBLIC">{t("enum.visibility.public")}</option>
                  <option value="FRIENDS">{t("enum.visibility.friends")}</option>
                  <option value="PRIVATE">{t("enum.visibility.private")}</option>
                </select>
                <select value={fStatus} onChange={(e) => setFStatus(e.target.value)} className={ui.field}>
                  <option value="">{t("admin.plan_manage.filter_status")}</option>
                  <option value="DRAFT">{t("enum.plan_status.draft")}</option>
                  <option value="ACTIVE">{t("enum.plan_status.active")}</option>
                  <option value="COMPLETED">{t("enum.plan_status.completed")}</option>
                  <option value="CANCELLED">{t("enum.plan_status.cancelled")}</option>
                </select>
                <select value={fLocked} onChange={(e) => setFLocked(e.target.value)} className={ui.field}>
                  <option value="">{t("admin.plan_manage.filter_moderation")}</option>
                  <option value="false">{t("admin.plan_manage.mod_visible")}</option>
                  <option value="true">{t("admin.plan_manage.mod_locked")}</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold">{t("admin.plan_manage.col_plan")}</th>
                    <th className="px-3 py-2 text-left font-semibold">{t("admin.plan_manage.col_author")}</th>
                    <th className="px-3 py-2 text-left font-semibold">{t("admin.plan_manage.col_visibility")}</th>
                    <th className="px-3 py-2 text-left font-semibold">{t("admin.plan_manage.col_status")}</th>
                    <th className="px-3 py-2 text-left font-semibold">{t("admin.plan_manage.col_created")}</th>
                    <th className="px-3 py-2 text-right font-semibold">{t("admin.plan_manage.col_views")}</th>
                    <th className="px-3 py-2 text-right font-semibold">{t("admin.plan_manage.col_engagement")}</th>
                    <th className="px-3 py-2 text-center font-semibold">{t("admin.plan_manage.col_reports")}</th>
                    <th className="px-3 py-2 text-center font-semibold">{t("admin.plan_manage.col_moderation")}</th>
                    <th className="px-3 py-2 text-right font-semibold">{t("admin.plan_manage.col_actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {plans.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/40">
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          onClick={() => setDetailId(p.id)}
                          className="block max-w-[220px] truncate text-left font-medium text-slate-900 hover:text-blue-600 dark:text-slate-100 dark:hover:text-blue-300"
                          title={p.title}
                        >
                          {p.title || `#${p.id}`}
                        </button>
                        <div className="text-[11px] text-slate-400">#{p.id}</div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <RowAvatar src={p.authorAvatar} name={p.authorName} />
                          <span className="max-w-[130px] truncate text-slate-700 dark:text-slate-200">
                            {p.authorName || `#${p.authorId}`}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`${ui.pill} ${VIS_BADGE[p.visibility] || VIS_BADGE.PRIVATE}`}>
                          {t(`enum.visibility.${String(p.visibility).toLowerCase()}`, p.visibility)}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`${ui.pill} ${STATUS_BADGE[p.status] || STATUS_BADGE.DRAFT}`}>
                          {t(`enum.plan_status.${String(p.status).toLowerCase()}`, p.status)}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-slate-500 dark:text-slate-400">{fmtDate(p.createdAt)}</td>
                      <td className="px-3 py-2 text-right text-slate-700 dark:text-slate-200">{fmt(p.views)}</td>
                      <td className="px-3 py-2 text-right text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        ♥ {fmt(p.reactions)} · 💬 {fmt(p.comments)}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {p.pendingReports > 0 ? (
                          <span className={`${ui.pill} border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-200 dark:border-amber-900`}>
                            {t("admin.plan_manage.pending_n", { n: fmt(p.pendingReports) })}
                          </span>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {p.adminLocked ? (
                          <span className={`${ui.pill} border-rose-200 bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-200 dark:border-rose-900`}>
                            {t("admin.plan_manage.locked_badge")}
                          </span>
                        ) : (
                          <span className={`${ui.pill} border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200 dark:border-emerald-900`}>
                            {t("admin.plan_manage.visible_badge")}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setDetailId(p.id)}
                            className={`${ui.pill} border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700`}
                          >
                            {t("admin.plan_manage.view")}
                          </button>
                          {p.adminLocked ? (
                            <button
                              type="button"
                              disabled={busyId === `p${p.id}`}
                              onClick={() => setRestoreTarget(p.id)}
                              className={`${ui.pill} border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-200 dark:border-emerald-900`}
                            >
                              <ArrowUturnLeftIcon className="mr-1 h-3.5 w-3.5" />
                              {t("admin.plan_manage.restore")}
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={busyId === `p${p.id}`}
                              onClick={() => setTakedownModal({ kind: "plan", id: p.id })}
                              className={`${ui.pill} border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/30 dark:text-rose-200 dark:border-rose-900`}
                            >
                              {t("admin.plan_manage.takedown")}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {plans.length === 0 && (
                    <tr>
                      <td colSpan={10} className="px-3 py-10 text-center text-slate-400">
                        {plansLoading ? t("admin.plan_manage.loading") : t("admin.plan_manage.no_plans")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-3 flex items-center justify-between">
                <div className="text-xs text-slate-400">
                  {t("admin.plan_manage.page_info", { page, total: totalPages })}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1 || plansLoading}
                    onClick={() => setPage((v) => Math.max(1, v - 1))}
                    className={`${ui.btn} ${ui.btnGhost} px-3 py-1.5`}
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                    {t("admin.plan_manage.prev")}
                  </button>
                  <button
                    type="button"
                    disabled={page >= totalPages || plansLoading}
                    onClick={() => setPage((v) => Math.min(totalPages, v + 1))}
                    className={`${ui.btn} ${ui.btnGhost} px-3 py-1.5`}
                  >
                    {t("admin.plan_manage.next")}
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Report queue */}
          <div className={ui.card}>
            <div className="mb-4 flex items-center gap-2">
              <FlagIcon className="h-5 w-5 text-slate-500 dark:text-slate-300" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{t("admin.plan_stat.report_queue")}</h3>
            </div>
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold">Plan</th>
                    <th className="px-3 py-2 text-left font-semibold">{t("admin.plan_stat.col_reason")}</th>
                    <th className="px-3 py-2 text-left font-semibold">{t("admin.plan_stat.col_detail")}</th>
                    <th className="px-3 py-2 text-right font-semibold">{t("admin.plan_stat.col_actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {reports.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/40">
                      <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                        <button
                          type="button"
                          onClick={() => setDetailId(r.planId)}
                          className="hover:text-blue-600 dark:hover:text-blue-300"
                        >
                          #{r.planId}
                        </button>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`${ui.pill} border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-200 dark:border-amber-900`}>
                          {t(`enum.report_reason.${String(r.reason).toLowerCase()}`, r.reason)}
                        </span>
                      </td>
                      <td className="px-3 py-2 max-w-[280px] truncate text-slate-500 dark:text-slate-400">{r.detail || "—"}</td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            disabled={busyId === `r${r.id}`}
                            onClick={() => setTakedownModal({ kind: "report", id: r.id })}
                            className={`${ui.pill} border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/30 dark:text-rose-200 dark:border-rose-900`}
                          >
                            {t("admin.plan_stat.takedown")}
                          </button>
                          <button
                            type="button"
                            disabled={busyId === `r${r.id}`}
                            onClick={() => onDismiss(r.id)}
                            className={`${ui.pill} border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-800`}
                          >
                            {t("admin.plan_stat.dismiss")}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {reports.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-3 py-6 text-center text-slate-400">{t("admin.plan_stat.no_reports")}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Chi tiết lịch trình */}
      <PlanDetailModal
        planId={detailId}
        open={!!detailId}
        busy={!!busyId}
        onClose={() => setDetailId(null)}
        onRequestTakedown={(p) => setTakedownModal({ kind: "plan", id: p.id })}
        onRequestRestore={(p) => setRestoreTarget(p.id)}
      />

      {/* Gỡ bài (nhập lý do) */}
      <PromptModal
        open={!!takedownModal}
        title={t("admin.plan_manage.takedown")}
        description={t("admin.plan_stat.takedown_desc")}
        inputLabel={t("admin.plan_stat.takedown_reason")}
        inputPlaceholder={t("admin.plan_stat.takedown_reason_ph")}
        multiline
        confirmText={t("admin.plan_manage.takedown")}
        tone="danger"
        onConfirm={doTakedown}
        onClose={() => setTakedownModal(null)}
      />

      {/* Bật lại (xác nhận) */}
      <ConfirmModal
        open={!!restoreTarget}
        title={t("admin.plan_manage.restore_confirm_title")}
        message={t("admin.plan_manage.restore_confirm_msg")}
        confirmText={t("admin.plan_manage.restore")}
        onConfirm={doRestore}
        onClose={() => setRestoreTarget(null)}
      />
    </AdminLayout>
  );
}
