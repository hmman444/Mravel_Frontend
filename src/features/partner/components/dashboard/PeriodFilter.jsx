import { useTranslation } from "react-i18next";

const OPTIONS = [
  { key: "weekly", labelKey: "partner.dashboard.filter_week" },
  { key: "monthly", labelKey: "partner.dashboard.filter_month" },
  { key: "yearly", labelKey: "partner.dashboard.filter_year" },
];

export default function PeriodFilter({ value, onChange }) {
  const { t } = useTranslation();
  return (
    <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100/70 p-1 dark:border-slate-700 dark:bg-slate-800/70">
      {OPTIONS.map((o) => {
        const active = value === o.key;
        return (
          <button
            key={o.key}
            type="button"
            onClick={() => onChange(o.key)}
            className={
              "rounded-lg px-3.5 py-1.5 text-sm font-medium transition " +
              (active
                ? "bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-400"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200")
            }
          >
            {t(o.labelKey)}
          </button>
        );
      })}
    </div>
  );
}
