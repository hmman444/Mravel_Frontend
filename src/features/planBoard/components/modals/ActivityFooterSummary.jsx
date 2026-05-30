// src/features/planBoard/components/ActivityFooterSummary.jsx
"use client";

import { useTranslation } from "react-i18next";

/**
 * Footer bên trái:
 * - Dòng 1: labelPrefix + name (vd: "Ăn uống: Bún bò Huế")
 * - Dòng 2: Địa điểm
 * - Dòng 3: Thời gian
 */
export default function ActivityFooterSummary({
  labelPrefix, // "Ăn uống", "Sự kiện", "Di chuyển"...
  name,
  emptyLabelText, // text fallback khi chưa có name
  locationText, // string đã format
  timeText, // string đã format (vd: "19:00 - 20:30 (90 phút)")
}) {
  const { t } = useTranslation();
  return (
    <div className="hidden sm:flex flex-col text-[11px] text-slate-500 dark:text-slate-400">
      <span>
        {name?.trim()
          ? `${labelPrefix}: ${name.trim()}`
          : emptyLabelText || ""}
      </span>

      {locationText?.trim() && (
        <span>
          {t("plan.activity.location_label")}: <b>{locationText.trim()}</b>
        </span>
      )}

      {timeText?.trim() && (
        <span>
          {t("plan.activity.time_label")}: <b>{timeText.trim()}</b>
        </span>
      )}
    </div>
  );
}
