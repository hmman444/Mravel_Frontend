import { CheckCircleIcon, ClockIcon, NoSymbolIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

export default function ServiceHealthChips({ health = {} }) {
  const { t } = useTranslation();
  const chips = [
    {
      key: "active",
      icon: CheckCircleIcon,
      label: t("partner.dashboard.health_active"),
      value: health.active ?? 0,
      cls: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900",
    },
    {
      key: "pending",
      icon: ClockIcon,
      label: t("partner.dashboard.health_pending"),
      value: health.pending ?? 0,
      cls: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900",
    },
    {
      key: "blocked",
      icon: NoSymbolIcon,
      label: t("partner.dashboard.health_blocked"),
      value: health.blocked ?? 0,
      cls: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-900",
    },
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {chips.map((c) => (
        <div
          key={c.key}
          className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium ring-1 ${c.cls}`}
        >
          <c.icon className="h-4 w-4" />
          <span>{c.label}</span>
          <span className="font-bold">{c.value}</span>
        </div>
      ))}
    </div>
  );
}
