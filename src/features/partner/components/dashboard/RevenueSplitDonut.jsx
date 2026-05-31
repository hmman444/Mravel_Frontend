import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { useTranslation } from "react-i18next";
import { formatCompactVnd, formatVnd } from "../../utils/money";

export default function RevenueSplitDonut({ hotel = 0, restaurant = 0 }) {
  const { t } = useTranslation();
  const total = hotel + restaurant;
  const data = [
    { key: "HOTEL", label: t("partner.dashboard.hotel_revenue"), value: hotel, color: "#2563EB" },
    { key: "RESTAURANT", label: t("partner.dashboard.restaurant_revenue"), value: restaurant, color: "#F97316" },
  ].filter((d) => d.value > 0);

  if (total <= 0) {
    return (
      <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
        {t("partner.dashboard.no_revenue_data")}
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row">
      <div className="relative h-40 w-40 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="label" innerRadius={52} outerRadius={72} paddingAngle={2} stroke="none">
              {data.map((d) => (
                <Cell key={d.key} fill={d.color} />
              ))}
            </Pie>
            <Tooltip formatter={(v, n) => [formatVnd(v), n]} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-base font-bold text-slate-900 dark:text-slate-100">{formatCompactVnd(total)}</span>
          <span className="text-[11px] text-slate-400">{t("partner.dashboard.total_word")}</span>
        </div>
      </div>

      <ul className="flex-1 space-y-3 self-stretch">
        {data.map((d) => (
          <li key={d.key} className="text-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                {d.label}
              </span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {total > 0 ? Math.round((d.value / total) * 100) : 0}%
              </span>
            </div>
            <div className="mt-0.5 pl-[18px] text-xs text-slate-400">{formatVnd(d.value)}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
