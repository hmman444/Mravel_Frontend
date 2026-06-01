import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useTranslation } from "react-i18next";

const TONES = {
  emerald: "from-emerald-500/10 to-emerald-500/0 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20",
  blue: "from-blue-500/10 to-blue-500/0 text-blue-600 dark:text-blue-400 ring-blue-500/20",
  amber: "from-amber-500/10 to-amber-500/0 text-amber-600 dark:text-amber-400 ring-amber-500/20",
  violet: "from-violet-500/10 to-violet-500/0 text-violet-600 dark:text-violet-400 ring-violet-500/20",
};

export default function KpiCard({ icon: Icon, label, value, sub, deltaPct = null, tone = "blue" }) {
  const { t } = useTranslation();
  const toneCls = TONES[tone] || TONES.blue;
  const hasDelta = deltaPct !== null && deltaPct !== undefined;
  const up = (deltaPct ?? 0) > 0;
  const flat = (deltaPct ?? 0) === 0;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-900">
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${toneCls}`} />
      <div className="relative">
        <div className="flex items-center justify-between">
          <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white/70 ring-1 ${toneCls} dark:bg-slate-800/70`}>
            {Icon ? <Icon className="h-5 w-5" /> : null}
          </span>
          {hasDelta && (
            <span
              className={
                "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold " +
                (flat
                  ? "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                  : up
                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                  : "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400")
              }
            >
              {!flat && (up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />)}
              {up ? "+" : ""}
              {deltaPct}%
            </span>
          )}
        </div>

        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">{label}</p>
        <p className="mt-1 truncate text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
          {sub || (hasDelta ? t("partner.dashboard.vs_prev") : "")}
        </p>
      </div>
    </div>
  );
}
