// src/features/catalog/components/restaurant/RestaurantPolicySection.jsx
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import i18n from "../../../../i18n";

function formatVND(n) {
  if (n == null) return null;
  try {
    return new Intl.NumberFormat("vi-VN").format(Number(n));
  } catch {
    return `${n}`;
  }
}

function minuteText(m) {
  if (!m && m !== 0) return null;
  return i18n.t("restaurant.minutes_value", { m });
}

function groupBlackoutDays(blackoutRules = []) {
  const byMonth = new Map();
  blackoutRules.forEach((r) => {
    const m = r?.month;
    const d = r?.day;
    if (!m || !d) return;
    if (!byMonth.has(m)) byMonth.set(m, new Set());
    byMonth.get(m).add(d);
  });

  const entries = [...byMonth.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([month, daysSet]) => {
      const days = [...daysSet].sort((a, b) => a - b);
      const dayStr =
        days.length === 1
          ? i18n.t("restaurant.day_value", { days: days[0] })
          : i18n.t("restaurant.day_value", { days: days.join(", ") });
      return { month, dayStr };
    });

  return entries;
}

export default function RestaurantPolicySection({ restaurant }) {
  const { t } = useTranslation();
  const policy = restaurant?.policy;
  const blackoutByMonth = useMemo(
    () => groupBlackoutDays(policy?.blackoutRules ?? []),
    [policy?.blackoutRules]
  );

  if (!policy) return null;

  const depositLine =
    policy.depositRequired && policy.depositAmount
      ? t("restaurant.deposit_line", {
          guests: policy.depositMinGuests || 0,
          amount: formatVND(policy.depositAmount),
        })
      : null;

  const invoiceVat =
    policy.vatInvoiceAvailable === true
      ? t("restaurant.vat_invoice_available")
      : t("restaurant.vat_invoice_unavailable");

  const invoiceDirect =
    policy.directInvoiceAvailable === true
      ? t("restaurant.direct_invoice_available")
      : t("restaurant.direct_invoice_unavailable");

  const allowFood =
    policy.allowOutsideFood === true
      ? t("restaurant.outside_food_allowed")
      : t("restaurant.outside_food_not_allowed");

  const allowDrink =
    policy.allowOutsideDrink === true
      ? t("restaurant.outside_drink_allowed")
      : t("restaurant.outside_drink_not_allowed");

  return (
    <section className="px-5 md:px-6 pt-5 pb-6">
      <h2 className="text-2xl md:text-[26px] font-extrabold text-gray-900 dark:text-gray-100">
        {t("restaurant.policy_title")}
      </h2>

      <div className="mt-4 rounded-2xl bg-white dark:bg-gray-800 shadow-sm p-5 md:p-6 leading-relaxed text-gray-900 dark:text-gray-100">
        <div className="space-y-6">
          <div>
            <h3 className="font-bold text-lg">{t("restaurant.deposit_heading")}</h3>
            {depositLine && <p className="mt-2">- {depositLine}</p>}
          </div>

          <div>
            <h3 className="font-bold text-lg">
              {t("restaurant.promotion_heading")} <span className="font-bold">{t("restaurant.yes")}</span>{t("restaurant.specifically_as_follows")}
            </h3>
            <div className="mt-2 space-y-2">
              <p>
                {t("restaurant.promotion_not_applied_prefix")} <span className="font-bold">{t("restaurant.no_uppercase")}</span> {t("restaurant.promotion_not_applied_suffix")}{" "}
                {blackoutByMonth.length > 0 ? (
                  <span className="text-red-600 font-semibold">
                    {blackoutByMonth
                      .map((x) => t("restaurant.month_blackout", { month: x.month, days: x.dayStr }))
                      .join(", ")}
                  </span>
                ) : (
                  t("restaurant.no_blackout_data")
                )}
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg">{t("restaurant.pasgo_receive_heading")}</h3>
            <p className="mt-2">{t("restaurant.pasgo_always_receive")}</p>
          </div>

          <div>
            <h3 className="font-bold text-lg">
              {t("restaurant.lead_time_heading")} <span className="font-bold">{t("restaurant.yes")}</span>{t("restaurant.specifically_as_follows")}
            </h3>
            {policy.minBookingLeadTimeMinutes != null && (
              <p className="mt-2">
                {t("restaurant.min_lead_time_label")}{" "}
                <span className="font-semibold">{minuteText(policy.minBookingLeadTimeMinutes)}.</span>
              </p>
            )}
          </div>

          <div>
            <h3 className="font-bold text-lg">
              {t("restaurant.max_hold_time_heading")} <span className="font-bold">{t("restaurant.yes")}</span>{t("restaurant.specifically_as_follows")}
            </h3>
            {policy.maxHoldTimeMinutes != null && (
              <p className="mt-2">
                {t("restaurant.max_hold_time_label")}{" "}
                <span className="font-semibold">{minuteText(policy.maxHoldTimeMinutes)}.</span>
              </p>
            )}
          </div>

          <div>
            <h3 className="font-bold text-lg">{t("restaurant.min_guests_heading")}</h3>
            <p className="mt-2">
              {policy.minGuestsPerBooking ? t("restaurant.min_guests_value", { guests: policy.minGuestsPerBooking }) : t("restaurant.no_regulation")}
            </p>
          </div>

          <div>
            <h3 className="font-bold text-lg">
              {t("restaurant.invoice_heading")} <span className="font-bold">{t("restaurant.yes")}</span>{t("restaurant.specifically_as_follows")}
            </h3>
            <div className="mt-2 space-y-1">
              <p>{t("restaurant.vat_invoice_label")} {invoiceVat}</p>
              <p>{t("restaurant.direct_invoice_label")} {invoiceDirect}</p>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg">{t("restaurant.service_charge_heading")}</h3>
            <p className="mt-2">
              {policy.serviceChargePercent ? t("restaurant.service_charge_value", { percent: policy.serviceChargePercent }) : t("restaurant.no_regulation")}
            </p>
          </div>

          <div>
            <h3 className="font-bold text-lg">
              {t("restaurant.outside_item_fee_heading")}{" "}
              <span className="font-bold">
                {policy.allowOutsideFood || policy.allowOutsideDrink ? t("restaurant.yes_short") : t("restaurant.no_short")}
              </span>
              {t("restaurant.specifically_as_follows")}
            </h3>

            <div className="mt-2 space-y-2">
              <p>{t("restaurant.restaurant_regulates")} {allowFood}</p>

              <div>
                <p>{t("restaurant.for_drinks")} {allowDrink}</p>
                {policy.allowOutsideDrink &&
                  Array.isArray(policy.outsideDrinkFees) &&
                  policy.outsideDrinkFees.length > 0 && (
                    <ul className="mt-1 ml-5 list-disc">
                      {policy.outsideDrinkFees.map((f, i) => {
                        const label =
                          f?.drinkType === "SPIRITS"
                            ? t("restaurant.drink_spirits")
                            : f?.drinkType === "WINE"
                            ? t("restaurant.drink_wine")
                            : t("restaurant.drink_other");
                        return (
                          <li key={i}>
                            {label}: {t("restaurant.fee_per_bottle", { amount: formatVND(f?.feeAmount) })}
                          </li>
                        );
                      })}
                    </ul>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}