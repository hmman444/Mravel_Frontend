// src/features/planBoard/components/stats/PlanStatsTab.jsx
"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Wallet, CalendarDays, PieChart, TrendingUp, Users, ShieldAlert, Info } from "lucide-react";

import CollapsibleCard from "./CollapsibleCard";
import KpiRow from "./KpiRow";
import MiniMetric from "./MiniMetric";
import DeltaBox from "./DeltaBox";
import DayBar from "./DayBar";
import TypeRow from "./TypeRow";
import TopSpendTable from "./TopSpendTable";
import MembersPanel from "./MembersPanel";
import IssuesIconPanel from "./IssuesIconPanel";

import { usePlanStats } from "../../hooks/usePlanStats"
import { getAccuracyBadge, getHealthBadge } from "../../utils/planStatsUtils"

export default function PlanStatsTab({ board, planMembers }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState({
    health: true,
    budget: true,
    progress: true,
    byType: true,
    topSpend: true,
    members: true,
  });

  const [issuesOpen, setIssuesOpen] = useState(false);
  const [showAllIssues, setShowAllIssues] = useState(false);

  const stats = usePlanStats(board);

  const members = useMemo(() => {
    return (
      planMembers ||
      board?.memberCostSummary?.members ||
      board?.members ||
      []
    );
  }, [planMembers, board]);

  if (!board) {
    return (
      <div className="rounded-3xl border border-slate-200/70 bg-white dark:bg-gray-800 p-5 dark:border-slate-800/70 dark:bg-slate-900">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {t('plan.stats.no_data')}
        </p>
      </div>
    );
  }

  const accuracyBadge = getAccuracyBadge(stats.health.costAccuracy);
  const healthBadge = getHealthBadge(stats.health.score);

  return (
    <div className="space-y-4 ">
      {/* TOP KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Health */}
        <CollapsibleCard
          title={t('plan.stats.health.title')}
          subtitle={t('plan.stats.health.subtitle')}
          right={
            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${healthBadge.className}`}
              title={healthBadge.label}
            >
              {healthBadge.icon}
              {healthBadge.label}
            </span>
          }
          open={open.health}
          onToggle={() => setOpen((s) => ({ ...s, health: !s.health }))}
        >
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-end gap-2">
                <p className="text-4xl font-semibold text-slate-900 dark:text-slate-100">
                  {stats.health.score}
                </p>
                <p className="pb-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  /100
                </p>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {stats.health.summary}
              </p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${accuracyBadge.className}`}
                title={t('plan.stats.health.accuracy_hint')}
              >
                {accuracyBadge.icon}
                {t('plan.stats.health.cost_accuracy', { value: stats.health.costAccuracy })}
              </span>

              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                  stats.coverage.donePct >= 50
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200"
                    : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200"
                }`}
                title={t('plan.stats.health.done_hint')}
              >
                {t('plan.stats.health.done', { value: stats.coverage.donePct })}
              </span>
            </div>
          </div>

          <div className="my-4 h-px w-full bg-slate-200/70 dark:bg-slate-800/70" />

          <MiniMetric label={t('plan.stats.coverage.time')} value={stats.coverage.timePct} />
          <div className="mt-3" />
          <MiniMetric label={t('plan.stats.coverage.cost')} value={stats.coverage.costPct} />
          <div className="mt-3" />
          <MiniMetric label={t('plan.stats.coverage.participants')} value={stats.coverage.participantsPct} />
        </CollapsibleCard>

        {/* Budget vs Actual */}
        <CollapsibleCard
          title={t('plan.stats.budget.title')}
          subtitle={t('plan.stats.budget.subtitle', { currency: stats.currency })}
          right={<Wallet className="h-5 w-5 text-slate-400" />}
          open={open.budget}
          onToggle={() => setOpen((s) => ({ ...s, budget: !s.budget }))}
        >
          <div className="space-y-3">
            <KpiRow
              label={t('plan.stats.budget.budget')}
              value={stats.fmtMoney(stats.totals.budget)}
              hint={stats.totals.budget > 0 ? t('plan.stats.budget.budget_hint') : t('plan.stats.budget.budget_hint_empty')}
            />
            <KpiRow
              label={t('plan.stats.budget.estimated')}
              value={stats.fmtMoney(stats.totals.estimated)}
              hint={t('plan.stats.budget.estimated_hint', { count: stats.totals.activities })}
            />
            <KpiRow
              label={t('plan.stats.budget.actual')}
              value={stats.fmtMoney(stats.totals.actual)}
              hint={t('plan.stats.budget.actual_hint', { value: stats.fmtMoney(stats.totals.extraActual) })}
              strong
            />

            <div className="my-4 h-px w-full bg-slate-200/70 dark:bg-slate-800/70" />

            <DeltaBox
              label={t('plan.stats.budget.delta_estimated')}
              delta={stats.totals.actual - stats.totals.estimated}
              fmtSignedMoney={stats.fmtSignedMoney}
            />
            <div className="mt-3" />
            <DeltaBox
              label={t('plan.stats.budget.delta_budget')}
              delta={stats.totals.actual - stats.totals.budget}
              fmtSignedMoney={stats.fmtSignedMoney}
            />
          </div>
        </CollapsibleCard>

        {/* Progress & Days */}
        <CollapsibleCard
          title={t('plan.stats.progress.title')}
          subtitle={`${board?.startDate || "?"} → ${board?.endDate || "?"}`}
          right={<CalendarDays className="h-5 w-5 text-slate-400" />}
          open={open.progress}
          onToggle={() => setOpen((s) => ({ ...s, progress: !s.progress }))}
        >
          <div className="space-y-3">
            <KpiRow label={t('plan.stats.progress.days')} value={`${stats.days.length}`} hint={t('plan.stats.progress.days_hint')} />
            <KpiRow label={t('plan.stats.progress.activities')} value={`${stats.totals.activities}`} hint={t('plan.stats.progress.activities_hint')} />
            <KpiRow
              label={t('plan.stats.progress.issues')}
              value={`${stats.issues.length}`}
              hint={stats.issues.length === 0 ? t('plan.stats.progress.issues_hint_none') : t('plan.stats.progress.issues_hint_has')}
              strong={stats.issues.length > 0}
            />

            <div className="my-4 h-px w-full bg-slate-200/70 dark:bg-slate-800/70" />

            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              {t('plan.stats.progress.actual_by_day')}
            </p>

            <div className="space-y-2">
              {stats.days.slice(0, 6).map((d) => (
                <DayBar
                  key={d.date}
                  date={d.date}
                  estimated={d.estimated}
                  actual={d.actual}
                  fmtMoney={stats.fmtMoney}
                  max={stats.maxDayActual || 1}
                />
              ))}
              {stats.days.length > 6 && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t('plan.stats.progress.more_days', { count: stats.days.length - 6 })}
                </p>
              )}
            </div>
          </div>
        </CollapsibleCard>
      </div>

      {/* Breakdown: ActivityType + Top spends */}
      <div className="grid gap-4 lg:grid-cols-2">
        <CollapsibleCard
          title={t('plan.stats.by_type.title')}
          subtitle={t('plan.stats.by_type.subtitle')}
          right={<PieChart className="h-5 w-5 text-slate-400" />}
          open={open.byType}
          onToggle={() => setOpen((s) => ({ ...s, byType: !s.byType }))}
        >
          <div className="space-y-2">
            {stats.byType.map((t) => (
              <TypeRow
                key={t.activityType}
                type={t.activityType}
                estimated={t.estimated}
                actual={t.actual}
                fmtMoney={stats.fmtMoney}
                fmtSignedMoney={stats.fmtSignedMoney}
                labelActivityType={stats.labelActivityType}
                typeEmoji={stats.typeEmoji}
                max={stats.maxTypeActual || 1}
              />
            ))}
            {stats.byType.length === 0 && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t('plan.stats.by_type.empty')}
              </p>
            )}
          </div>
        </CollapsibleCard>

        <CollapsibleCard
          title={t('plan.stats.top_spend.title')}
          subtitle={t('plan.stats.top_spend.subtitle')}
          right={<TrendingUp className="h-5 w-5 text-slate-400" />}
          open={open.topSpend}
          onToggle={() => setOpen((s) => ({ ...s, topSpend: !s.topSpend }))}
        >
          <TopSpendTable
            items={stats.topSpends.slice(0, 6)}
            fmtMoney={stats.fmtMoney}
            labelActivityType={stats.labelActivityType}
            typeEmoji={stats.typeEmoji}
          />
        </CollapsibleCard>
      </div>

      {/* Members + Issues */}
      <div className="grid gap-4 lg:grid-cols-2">
        <CollapsibleCard
          title={t('plan.stats.members.title')}
          subtitle={t('plan.stats.members.subtitle')}
          right={<Users className="h-5 w-5 text-slate-400" />}
          open={open.members}
          onToggle={() => setOpen((s) => ({ ...s, members: !s.members }))}
        >
          <MembersPanel
            members={members}
            totalActivities={stats.totals.activities}
            fmtMoney={stats.fmtMoney}
            labelRole={stats.labelRole}
          />
        </CollapsibleCard>

        <IssuesIconPanel
          issues={stats.issues}
          open={issuesOpen}
          onToggle={() => setIssuesOpen((v) => !v)}
          showAll={showAllIssues}
          onToggleShowAll={() => setShowAllIssues((v) => !v)}
          labelActivityType={stats.labelActivityType}
          iconWhenEmpty={<Info className="h-5 w-5 text-slate-400" />}
          iconWhenHas={<ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-300" />}
        />
      </div>
    </div>
  );
}
