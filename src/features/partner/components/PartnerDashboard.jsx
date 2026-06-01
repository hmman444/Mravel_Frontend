import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Banknote, ShoppingBag, CheckCircle2, ReceiptText } from "lucide-react";

import { usePartnerDashboard } from "../hooks/usePartnerDashboard";
import { formatVnd } from "../utils/money";

import PeriodFilter from "./dashboard/PeriodFilter";
import KpiCard from "./dashboard/KpiCard";
import RevenueChart from "./dashboard/RevenueChart";
import StatusDonut from "./dashboard/StatusDonut";
import RevenueSplitDonut from "./dashboard/RevenueSplitDonut";
import RecentBookings from "./dashboard/RecentBookings";
import ServiceHealthChips from "./dashboard/ServiceHealthChips";

const Card = ({ title, subtitle, action, children, className = "" }) => (
  <section
    className={
      "rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-900 " +
      className
    }
  >
    {(title || action) && (
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          {title && (
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
          )}
          {subtitle && <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>}
        </div>
        {action}
      </div>
    )}
    {children}
  </section>
);

export default function PartnerDashboard() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState("weekly");

  const {
    loading,
    error,
    range,
    revenueSeries = [],
    kpis = {},
    split = {},
    statusList = [],
    recent = [],
    health = {},
  } = usePartnerDashboard(filter);

  const dash = loading ? "—" : null;
  const rangeText = t("partner.dashboard.time_range", { from: range.from, to: range.to });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {t("partner.dashboard.title")}
          </h1>
          <p className="mt-0.5 text-sm text-slate-400">{rangeText}</p>
        </div>
        <PeriodFilter value={filter} onChange={setFilter} />
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">
          {String(error)}
        </div>
      ) : null}

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={Banknote}
          tone="emerald"
          label={t("partner.dashboard.kpi_revenue")}
          value={dash ?? formatVnd(kpis.revenueTotal)}
          deltaPct={loading ? null : kpis.revenueDeltaPct}
        />
        <KpiCard
          icon={ShoppingBag}
          tone="blue"
          label={t("partner.dashboard.kpi_bookings")}
          value={dash ?? String(kpis.bookings ?? 0)}
          deltaPct={loading ? null : kpis.bookingsDeltaPct}
        />
        <KpiCard
          icon={CheckCircle2}
          tone="amber"
          label={t("partner.dashboard.kpi_completion")}
          value={dash ?? `${kpis.completionRate ?? 0}%`}
          sub={t("partner.dashboard.kpi_completion_sub", { count: kpis.paidBookings ?? 0 })}
        />
        <KpiCard
          icon={ReceiptText}
          tone="violet"
          label={t("partner.dashboard.kpi_aov")}
          value={dash ?? formatVnd(kpis.aov)}
          sub={t("partner.dashboard.kpi_aov_sub")}
        />
      </div>

      {/* Chart + status donut */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card
          className="lg:col-span-2"
          title={t("partner.dashboard.orders_revenue_by", { range: range.title })}
          subtitle={rangeText}
        >
          {!loading && revenueSeries.length === 0 ? (
            <p className="py-16 text-center text-sm text-slate-500 dark:text-slate-400">
              {t("partner.dashboard.no_revenue_data")}
            </p>
          ) : (
            <RevenueChart data={revenueSeries} />
          )}
        </Card>

        <Card title={t("partner.dashboard.status_ratio_title")} subtitle={rangeText}>
          {loading ? (
            <p className="py-8 text-center text-sm text-slate-400">{t("partner.dashboard.loading_stats")}</p>
          ) : (
            <StatusDonut items={statusList} />
          )}
        </Card>
      </div>

      {/* Revenue split + recent transactions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title={t("partner.dashboard.revenue_split_title")} subtitle={rangeText}>
          <RevenueSplitDonut hotel={split.hotel} restaurant={split.restaurant} />
        </Card>

        <Card title={t("partner.dashboard.recent_title")}>
          <RecentBookings items={recent} />
        </Card>
      </div>

      {/* Service health */}
      <Card title={t("partner.dashboard.health_title")}>
        <ServiceHealthChips health={health} />
      </Card>
    </div>
  );
}
