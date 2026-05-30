// src/features/partner/components/hotel/PolicySection.jsx
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
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
        className="w-full border rounded-xl px-3 py-2 bg-white dark:bg-gray-800"
      >
        <option value="" disabled>
          {t("partner.policy.select_time")}
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
          {t("partner.policy.invalid_time_value", { value: safeValue })}
        </div>
      ) : null}
    </label>
  );
}

export default function PolicySection({ form, setField }) {
  const { t } = useTranslation();
  return (
    <details className="group">
      <summary className="cursor-pointer select-none font-semibold">
        {t("partner.policy.section_title")}
      </summary>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
        <TimeSelect
          label={t("partner.policy.check_in_time")}
          value={form.defaultCheckInTime}
          onChange={(v) => setField("defaultCheckInTime", v)}
          step={30}
        />

        <TimeSelect
          label={t("partner.policy.check_out_time")}
          value={form.defaultCheckOutTime}
          onChange={(v) => setField("defaultCheckOutTime", v)}
          step={30}
        />

        <label className="text-sm md:col-span-2">
          <div className="font-medium mb-1">{t("partner.policy.policies_label")}</div>
          <textarea
            value={form.policies ?? ""}
            onChange={(e) => setField("policies", e.target.value)}
            className="w-full border rounded-xl px-3 py-2 min-h-[110px]"
            placeholder={t("partner.policy.policies_placeholder")}
          />
        </label>

        <label className="text-sm md:col-span-2">
          <div className="font-medium mb-1">{t("partner.policy.extra_info_label")}</div>
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