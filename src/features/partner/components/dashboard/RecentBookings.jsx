import { HomeModernIcon, BuildingOffice2Icon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import {
  fmtMoney,
  fmtDate,
  pickCode,
  pickAmount,
  pickService,
  pickCustomer,
  pickBookingStatus,
  pickCreatedAt,
  BOOKING_STATUS,
} from "../../utils/partnerBookingUtils";

export default function RecentBookings({ items = [] }) {
  const { t } = useTranslation();

  if (!items.length) {
    return (
      <p className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">
        {t("partner.dashboard.recent_empty")}
      </p>
    );
  }

  return (
    <ul className="divide-y divide-slate-100 dark:divide-slate-800">
      {items.map((b, idx) => {
        const type = b.__type;
        const service = pickService(b) || {};
        const customer = pickCustomer(b) || {};
        const status = pickBookingStatus(b);
        const st = BOOKING_STATUS[status] || {
          label: status || "--",
          cls: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
        };
        return (
          <li key={pickCode(b) || idx} className="flex items-center gap-3 py-3">
            <span
              className={
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg " +
                (type === "HOTEL"
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40"
                  : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40")
              }
            >
              {type === "HOTEL" ? (
                <HomeModernIcon className="h-5 w-5" />
              ) : (
                <BuildingOffice2Icon className="h-5 w-5" />
              )}
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                {service?.name || "--"}
              </p>
              <p className="truncate text-xs text-slate-400">
                {customer?.name || "--"} · {fmtDate(pickCreatedAt(b))}
              </p>
            </div>

            <div className="shrink-0 text-right">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {fmtMoney(pickAmount(b))}
              </p>
              <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${st.cls}`}>
                {st.label}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
