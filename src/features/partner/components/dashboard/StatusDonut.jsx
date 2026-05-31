import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { useTranslation } from "react-i18next";

export default function StatusDonut({ items = [] }) {
  const { t } = useTranslation();
  const total = items.reduce((a, b) => a + b.value, 0);

  if (!items.length) {
    return (
      <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
        {t("partner.dashboard.no_status_data")}
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row">
      <div className="relative h-40 w-40 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={items}
              dataKey="value"
              nameKey="label"
              innerRadius={52}
              outerRadius={72}
              paddingAngle={2}
              stroke="none"
            >
              {items.map((it) => (
                <Cell key={it.key} fill={it.color} />
              ))}
            </Pie>
            <Tooltip formatter={(v, n) => [v, n]} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{total}</span>
          <span className="text-[11px] text-slate-400">{t("partner.dashboard.orders_unit")}</span>
        </div>
      </div>

      <ul className="flex-1 space-y-2 self-stretch">
        {items.map((it) => (
          <li key={it.key} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: it.color }} />
              <span className="truncate text-slate-600 dark:text-slate-300">{it.label}</span>
            </span>
            <span className="shrink-0 font-semibold text-slate-900 dark:text-slate-100">
              {it.value}
              <span className="ml-1 text-xs font-normal text-slate-400">
                {total > 0 ? Math.round((it.value / total) * 100) : 0}%
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
