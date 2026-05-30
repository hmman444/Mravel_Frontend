import { useTranslation } from "react-i18next";

export default function BookingTypeTabs({ type, setType }) {
  const { t } = useTranslation();
  const itemClass = (active) =>
    [
      "pb-2 text-sm font-semibold transition",
      active
        ? "text-blue-700 border-b-2 border-blue-600"
        : "text-gray-600 dark:text-gray-400 border-b-2 border-transparent hover:text-gray-900",
    ].join(" ");

  return (
    <div className="flex items-center gap-6 border-b border-gray-200 dark:border-gray-700">
      <button type="button" className={itemClass(type === "HOTEL")} onClick={() => setType("HOTEL")}>
        {t("booking.tab_hotel")}
      </button>
      <button type="button" className={itemClass(type === "RESTAURANT")} onClick={() => setType("RESTAURANT")}>
        {t("booking.tab_restaurant")}
      </button>
    </div>
  );
}