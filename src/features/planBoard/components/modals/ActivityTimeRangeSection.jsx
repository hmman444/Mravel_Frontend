// src/features/planBoard/components/ActivityTimeRangeSection.jsx
"use client";

import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { FaClock } from "react-icons/fa";
import TimePicker from "../../../../components/TimePicker";
import { computeDurationMinutes } from "../../utils/costUtils";

/**
 * Dùng chung cho 9 modal:
 * - Bắt đầu / Kết thúc + TimePicker
 * - Tự tính durationMinutes
 * - Hiển thị lỗi + hint thời lượng
 */
export default function ActivityTimeRangeSection({
  // UI label
  sectionLabel,
  startLabel,
  endLabel,

  /**
   * color: dùng cho TimePicker (accent nội bộ)
   * iconClassName: class Tailwind dành cho icon (vd: "text-orange-500")
   * Như vậy mỗi modal có thể tuỳ chọn màu riêng.
   */
  color = "sky",
  iconClassName = "text-sky-500",

  // value & handler
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,

  // validate / error
  error, // string | undefined
  onErrorChange, // fn(message: string) | undefined

  // callback duration cho cha dùng
  onDurationChange, // fn(number|null) | undefined

  // text prefix cho dòng "Thời lượng ..."
  durationHintPrefix,
}) {
  const { t } = useTranslation();
  const sectionLabelText = sectionLabel ?? t("plan.time_range.section");
  const startLabelText = startLabel ?? t("plan.time_range.start");
  const endLabelText = endLabel ?? t("plan.time_range.end");
  const durationHintPrefixText =
    durationHintPrefix ?? t("plan.time_range.duration_hint");

  const durationMinutes = useMemo(
    () => computeDurationMinutes(startTime, endTime),
    [startTime, endTime]
  );

  useEffect(() => {
    if (onDurationChange) {
      onDurationChange(durationMinutes);
    }
  }, [durationMinutes, onDurationChange]);

  const errorActive = Boolean(error);

  const containerBase =
    "flex items-center gap-2 bg-white/90 dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-700 rounded-xl px-3 py-2.5 shadow-sm";

  const containerError =
    "border-rose-400 bg-rose-50/80 dark:border-rose-500/80 dark:bg-rose-950/40";

  const handleChangeStart = (val) => {
    onStartTimeChange?.(val);
    onErrorChange?.(""); // clear error khi user chọn lại
  };

  const handleChangeEnd = (val) => {
    onEndTimeChange?.(val);
    onErrorChange?.(""); // clear error khi user chọn lại
  };

  return (
    <div className="mt-3">
      {sectionLabelText && (
        <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
          {sectionLabelText}
        </label>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1.5">
        {/* START */}
        <div className={`${containerBase} ${errorActive ? containerError : ""}`}>
          <FaClock className={errorActive ? "text-rose-500" : iconClassName} />
          <span className="text-xs text-slate-600 dark:text-slate-300">
            {startLabelText}
          </span>
          <div className="flex-1 flex justify-end">
            <TimePicker
              value={startTime}
              onChange={handleChangeStart}
              error={errorActive}
              color={color}
            />
          </div>
        </div>

        {/* END */}
        <div className={`${containerBase} ${errorActive ? containerError : ""}`}>
          <FaClock className={errorActive ? "text-rose-500" : iconClassName} />
          <span className="text-xs text-slate-600 dark:text-slate-300">
            {endLabelText}
          </span>
          <div className="flex-1 flex justify-end">
            <TimePicker
              value={endTime}
              onChange={handleChangeEnd}
              error={errorActive}
              color={color}
            />
          </div>
        </div>
      </div>

      {errorActive && (
        <p className="mt-1.5 text-[11px] text-rose-500">{error}</p>
      )}

      {durationMinutes != null && !errorActive && (
        <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
          {durationHintPrefixText}:{" "}
          <span className="font-semibold">
            {t("plan.time_range.minutes", { n: durationMinutes })}
          </span>
        </p>
      )}
    </div>
  );
}
