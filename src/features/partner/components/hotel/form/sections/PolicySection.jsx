// src/features/partner/components/hotel/PolicySection.jsx
import { useMemo } from "react";

function buildTimeOptions(stepMinutes = 30) {
  const opts = [];
  for (let m = 0; m < 24 * 60; m += stepMinutes) {
    const hh = String(Math.floor(m / 60)).padStart(2, "0");
    const mm = String(m % 60).padStart(2, "0");
    opts.push(`${hh}:${mm}`);
  }
  return opts;
}

function TimeSelect({ label, value, onChange, step = 30 }) {
  const options = useMemo(() => buildTimeOptions(step), [step]);

  // nếu form đang có value lạ (vd "14:15") thì vẫn hiển thị được
  const safeValueRaw = typeof value === "string" ? value : "";
  const safeValue = safeValueRaw ? safeValueRaw.slice(0, 5) : "";
  const inList = options.includes(safeValue);

  return (
    <label className="text-sm">
      <div className="font-medium mb-1">{label}</div>

      <select
        value={inList ? safeValue : ""}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full border rounded-xl px-3 py-2 bg-white"
      >
        <option value="" disabled>
          Chọn giờ...
        </option>
        {options.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      {/* nếu value hiện tại không nằm trong options thì báo nhẹ */}
      {!inList && safeValue ? (
        <div className="text-xs text-amber-600 mt-1">
          Giá trị hiện tại ({safeValue}) không hợp lệ — vui lòng chọn lại theo bước 30 phút.
        </div>
      ) : null}
    </label>
  );
}

export default function PolicySection({ form, setField }) {
  return (
    <details className="group">
      <summary className="cursor-pointer select-none font-semibold">
        Check-in / Check-out & Policy
      </summary>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
        <TimeSelect
          label="Giờ check-in"
          value={form.defaultCheckInTime}
          onChange={(v) => setField("defaultCheckInTime", v)}
          step={30}
        />

        <TimeSelect
          label="Giờ check-out"
          value={form.defaultCheckOutTime}
          onChange={(v) => setField("defaultCheckOutTime", v)}
          step={30}
        />

        <label className="text-sm md:col-span-2">
          <div className="font-medium mb-1">Chính sách</div>
          <textarea
            value={form.policies ?? ""}
            onChange={(e) => setField("policies", e.target.value)}
            className="w-full border rounded-xl px-3 py-2 min-h-[110px]"
            placeholder="Ví dụ: nhận phòng cần CCCD, không hút thuốc..."
          />
        </label>

        <label className="text-sm md:col-span-2">
          <div className="font-medium mb-1">Thông tin thêm</div>
          <textarea
            value={form.extraInfo ?? ""}
            onChange={(e) => setField("extraInfo", e.target.value)}
            className="w-full border rounded-xl px-3 py-2 min-h-[110px]"
          />
        </label>
      </div>
    </details>
  );
}