import { useTranslation } from "react-i18next";
import RestaurantBookingCard from "./RestaurantBookingCard";

export default function GuestRestaurantBookingsList({
  loading,
  error,
  items,
  onRefresh,
  onClearDevice,
  onOpenRestaurant,
  rightActions,
  detailScope = "PUBLIC",

  title,
  description,
  emptyTitle,
  emptyDescription,
  showRefresh = true,
  showClearDevice = true,
}) {
  const { t } = useTranslation();
  const list = Array.isArray(items) ? items : [];

  const resolvedTitle = title ?? t("booking.guest_restaurant_list_title");
  const resolvedDescription = description ?? t("booking.guest_restaurant_list_description");
  const resolvedEmptyTitle = emptyTitle ?? t("booking.guest_restaurant_list_empty_title");
  const resolvedEmptyDescription = emptyDescription ?? t("booking.guest_restaurant_list_empty_description");

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 md:text-base">{resolvedTitle}</h2>
            {resolvedDescription ? <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 md:text-sm">{resolvedDescription}</p> : null}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            {rightActions}

            {showRefresh && typeof onRefresh === "function" && (
              <button
                type="button"
                onClick={onRefresh}
                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs font-semibold text-gray-800 dark:text-gray-200 shadow-sm transition hover:border-blue-400 hover:text-blue-700 md:text-sm"
              >
                {t("booking.refresh")}
              </button>
            )}

            {showClearDevice && typeof onClearDevice === "function" && (
              <button
                type="button"
                onClick={onClearDevice}
                className="rounded-xl bg-red-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700 md:text-sm"
              >
                {t("booking.clear_device_bookings")}
              </button>
            )}
          </div>
        </div>

        {error ? (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        ) : null}

        {loading ? <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">{t("booking.loading_bookings")}</p> : null}

        {!loading && !error && list.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{resolvedEmptyTitle}</p>
            {resolvedEmptyDescription ? <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{resolvedEmptyDescription}</p> : null}
          </div>
        ) : null}
      </div>

      {list.length > 0 ? (
        <div className="space-y-3">
          {list.map((b) => (
            <RestaurantBookingCard
              key={b.code}
              booking={b}
              onOpenRestaurant={onOpenRestaurant}
              detailScope={detailScope}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}