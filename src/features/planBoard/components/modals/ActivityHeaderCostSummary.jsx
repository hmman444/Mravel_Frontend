// src/features/planBoard/components/ActivityHeaderCostSummary.jsx
"use client";

import { useTranslation } from "react-i18next";

/**
 * Header bên phải của modal:
 * - Hiển thị tổng chi dùng để chia
 * - Ngân sách (nếu có)
 * Dùng chung cho 9 modal, chỉ cần truyền accentClass.
 */
export default function ActivityHeaderCostSummary({
  parsedActual,
  budgetAmount,
  accentClass = "text-sky-600 dark:text-sky-400",
  labelTotal,
  labelBudget,
}) {
  const { t } = useTranslation();
  const totalLabel = labelTotal ?? t("plan.cost.total_to_split");
  const budgetLabel = labelBudget ?? t("plan.cost.budget");
  const hasParsedActual = parsedActual && Number(parsedActual) > 0;
  const hasBudget = budgetAmount && Number(budgetAmount) > 0;

  if (!hasParsedActual && !hasBudget) return null;

  return (
    <div className="hidden sm:flex flex-col items-end text-xs">
      {hasParsedActual && (
        <>
          <span className="text-slate-500 dark:text-slate-400">
            {totalLabel}
          </span>
          <span className={`text-sm font-semibold ${accentClass}`}>
            {Number(parsedActual).toLocaleString("vi-VN")}đ
          </span>
        </>
      )}
      {hasBudget && (
        <span className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
          {budgetLabel}:{" "}
          <b className="text-slate-700 dark:text-slate-100">
            {Number(budgetAmount).toLocaleString("vi-VN")}đ
          </b>
        </span>
      )}
    </div>
  );
}
