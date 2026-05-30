import { useMemo } from "react";
import { Tag } from "lucide-react";
import { useTranslation } from "react-i18next";

const safeNum = (v) => (typeof v === "number" && !Number.isNaN(v) ? v : 0);

export default function RestaurantBookingPriceSummaryCard({
  tableTypeName = "Bàn 2",
  depositPerTable = 0,
  tablesCount = 1,
  currency = "VND",
  onPay,
  disabled = false,
  loading = false,

  holdMinutes, // optional
}) {
  const { t } = useTranslation();
  const total = useMemo(() => {
    const dep = safeNum(depositPerTable);
    const n = Math.max(1, Number(tablesCount || 1));
    return Math.round(dep * n);
  }, [depositPerTable, tablesCount]);

  const formattedDep = Math.round(safeNum(depositPerTable)).toLocaleString("vi-VN");
  const formattedTotal = total.toLocaleString("vi-VN");

  return (
    <section className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 px-4 py-3 md:px-5">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-gray-700 dark:text-gray-300" />
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 md:text-base">
            {t("booking.deposit_details_title")}
          </h2>
        </div>
        <span className="text-[11px] text-gray-500 dark:text-gray-400">{t("booking.payment_form_deposit")}</span>
      </div>

      <div className="space-y-3 px-4 pb-4 pt-3 md:px-5 md:pb-5">
        <div className="space-y-2 text-xs text-gray-800 dark:text-gray-200 md:text-sm">
          <div className="flex items-center justify-between">
            <span>{t("booking.deposit_amount")}</span>
            <span>{t("booking.deposit_per_table_currency", { amount: formattedDep, currency })}</span>
          </div>
          <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
            <span>
              ({tablesCount}x) {tableTypeName}
            </span>
            <span className="font-semibold">{formattedTotal} {currency}</span>
          </div>
        </div>

        <div className="mt-2 space-y-1 border-t border-dashed border-gray-200 dark:border-gray-700 pt-3">
          <p className="text-xs text-gray-600 dark:text-gray-400 md:text-sm">{t("booking.total_deposit_to_pay")}</p>
          <p className="text-lg font-bold text-emerald-600 md:text-xl">
            {formattedTotal} {currency}
          </p>

          {holdMinutes ? (
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              {t("booking.hold_table_minutes_prefix")} <span className="font-semibold">{holdMinutes}</span> {t("booking.hold_table_minutes_suffix")}
            </p>
          ) : (
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              {t("booking.deposit_hold_note")}
            </p>
          )}
        </div>

        <button
          type="button"
          disabled={disabled || loading}
          onClick={() => onPay?.()}
          className={[
            "mt-3 inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition",
            disabled || loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#007bff] hover:bg-[#ff6b1a]",
          ].join(" ")}
        >
          {loading ? t("booking.redirecting_to_momo") : t("booking.pay_deposit")}
        </button>

        <p className="mt-2 text-[11px] leading-snug text-gray-500 dark:text-gray-400">
          {t("booking.agree_terms_prefix")}{" "}
          <span className="cursor-pointer text-blue-600 hover:underline">
            {t("booking.terms_and_conditions")}
          </span>
          ,{" "}
          <span className="cursor-pointer text-blue-600 hover:underline">
            {t("booking.privacy_policy")}
          </span>{" "}
          {t("booking.agree_terms_suffix")}
        </p>
      </div>
    </section>
  );
}