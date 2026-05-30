import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { DAYS } from "../../../../utils/restaurantFormUtils";

export default function OpeningHoursEditor({ value = [], onChange, disabled }) {
  const { t } = useTranslation();
  const dayLabel = {
    MONDAY: t("partner.opening_hours.day.monday"),
    TUESDAY: t("partner.opening_hours.day.tuesday"),
    WEDNESDAY: t("partner.opening_hours.day.wednesday"),
    THURSDAY: t("partner.opening_hours.day.thursday"),
    FRIDAY: t("partner.opening_hours.day.friday"),
    SATURDAY: t("partner.opening_hours.day.saturday"),
    SUNDAY: t("partner.opening_hours.day.sunday"),
  };

  const map = useMemo(() => {
    const m = new Map();
    (Array.isArray(value) ? value : []).forEach((x) => {
      if (x?.dayOfWeek) m.set(x.dayOfWeek, x);
    });
    return m;
  }, [value]);

  const rows = useMemo(() => {
    return DAYS.map((d) => {
      const x = map.get(d) || {};
      return { dayOfWeek: d, openTime: x.openTime || "", closeTime: x.closeTime || "" };
    });
  }, [map]);

  const emit = (nextRows) => {
    const cleaned = nextRows
      .filter((r) => r.openTime || r.closeTime)
      .map((r) => ({ dayOfWeek: r.dayOfWeek, openTime: r.openTime, closeTime: r.closeTime }));
    onChange?.(cleaned);
  };

  const patch = (dayOfWeek, p) => {
    const next = rows.map((r) => (r.dayOfWeek === dayOfWeek ? { ...r, ...(p || {}) } : r));
    emit(next);
  };

  const copyAll = (fromDay) => {
    const src = rows.find((r) => r.dayOfWeek === fromDay);
    if (!src) return;
    const next = rows.map((r) => ({ ...r, openTime: src.openTime, closeTime: src.closeTime }));
    emit(next);
  };

  return (
    <div className="rounded-2xl border bg-white dark:bg-gray-800 p-4 space-y-3">
      <div>
        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t("partner.opening_hours.title")}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t("partner.opening_hours.hint")}</div>
      </div>

      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.dayOfWeek} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
            <div className="md:col-span-3 text-sm font-medium">{dayLabel[r.dayOfWeek] || r.dayOfWeek}</div>

            <input
              value={r.openTime}
              onChange={(e) => patch(r.dayOfWeek, { openTime: e.target.value })}
              className="md:col-span-3 border rounded-xl px-3 py-2 text-sm"
              placeholder="11:00"
              disabled={disabled}
            />
            <input
              value={r.closeTime}
              onChange={(e) => patch(r.dayOfWeek, { closeTime: e.target.value })}
              className="md:col-span-3 border rounded-xl px-3 py-2 text-sm"
              placeholder="22:00"
              disabled={disabled}
            />

            <button
              type="button"
              onClick={() => copyAll(r.dayOfWeek)}
              disabled={disabled}
              className="md:col-span-3 px-3 py-2 rounded-xl border hover:bg-gray-50 text-sm disabled:opacity-50"
            >
              {t("partner.opening_hours.copy_week")}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}