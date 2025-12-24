import { useMemo } from "react";
import { DAYS } from "../../../../utils/restaurantFormUtils";

const dayLabel = {
  MONDAY: "Thứ 2",
  TUESDAY: "Thứ 3",
  WEDNESDAY: "Thứ 4",
  THURSDAY: "Thứ 5",
  FRIDAY: "Thứ 6",
  SATURDAY: "Thứ 7",
  SUNDAY: "Chủ nhật",
};

export default function OpeningHoursEditor({ value = [], onChange, disabled }) {
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
    <div className="rounded-2xl border bg-white p-4 space-y-3">
      <div>
        <div className="text-sm font-semibold text-gray-900">Giờ mở cửa (openingHours)</div>
        <div className="text-xs text-gray-500 mt-0.5">Nhập dạng HH:mm (vd: 11:00 - 22:00).</div>
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
              Copy cho cả tuần
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}