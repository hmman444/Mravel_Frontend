import { CalendarDays, Users, Info, Hash } from "lucide-react";
import { useTranslation } from "react-i18next";

const FULL_VN_DATE = (d) =>
  d?.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export default function RestaurantBookingSelectedTableCard({
  restaurantName,
  restaurantSlug,
  adults = 2,
  children = 0,
  date,
  time,
  tableType,
  tablesCount = 1,

  remainingText,
  isEnough = true,
  isSeatEnough = true,
  seatErrorText = "",
}) {
  const { t } = useTranslation();
  const people = Number(adults || 0) + Number(children || 0);
  const dateLabel = date ? FULL_VN_DATE(date) : "--";
  const seats = tableType?.seats ?? null;

  return (
    <section className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center gap-2 rounded-t-2xl border-b border-amber-100 bg-gradient-to-r from-amber-50 via-amber-50 to-blue-50 px-4 py-2 text-[11px] font-semibold text-amber-800 dark:border-amber-900/50 dark:from-amber-950/40 dark:via-gray-900 dark:to-gray-800 dark:text-amber-200">
        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] text-white dark:bg-amber-400 dark:text-gray-900">
          !
        </span>
        <p>
          {remainingText || t("booking.checking_available_tables")}{" "}
          {!isEnough && (
            <span className="ml-1 font-bold text-red-700">
              {t("booking.not_enough_tables_selected")}
            </span>
          )}
        </p>
      </div>

      <div className="space-y-4 px-4 pb-4 pt-3 md:px-5 md:pb-5">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {restaurantName || t("booking.your_restaurant")}
          </p>

          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 md:text-base">
            ({tablesCount}x) {tableType?.name || t("booking.table_type")}{" "}
            {seats ? <span className="text-xs font-medium text-gray-600 dark:text-gray-400">• {t("booking.seats_per_table", { count: seats })}</span> : null}
          </p>

          {restaurantSlug ? (
            <p className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Hash className="h-3.5 w-3.5" />
              <span className="font-mono">{restaurantSlug}</span>
            </p>
          ) : null}
           {!isSeatEnough ? (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 border border-red-200">
              {seatErrorText || t("booking.not_enough_seats_for_tables")}
            </div>
          ) : null}
        </div>

        <div className="rounded-xl bg-white dark:bg-gray-800 p-3 text-xs text-gray-800 dark:text-gray-200 md:text-sm space-y-2">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <span>
              {dateLabel} • <span className="font-semibold">{time || "--:--"}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <span>
              {t("booking.guests_adults_children_tables", { people, adults, children, tables: tablesCount })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <span>{t("booking.deposit_to_hold_table")}</span>
          </div>
        </div>
      </div>
    </section>
  );
}