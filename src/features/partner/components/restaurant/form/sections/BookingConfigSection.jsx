// src/features/partner/components/restaurant/form/sections/BookingConfigSection.jsx
import { useTranslation } from "react-i18next";

const asString = (v) => (v == null ? "" : String(v));
const toIntStr = (v) => asString(v).replace(/[^\d]/g, "");

export default function BookingConfigSection({ form, setField, disabled }) {
  const { t } = useTranslation();
  const cfg = form.bookingConfig || {};

  const setCfg = (patch) => setField("bookingConfig", { ...cfg, ...(patch || {}) });

  return (
    <details className="group">
      <summary className="cursor-pointer select-none font-semibold">
        {t("partner.booking_config.title_restaurant")}
      </summary>

      <div className="mt-3 rounded-2xl border p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <label className="md:col-span-4 text-sm">
            <div className="font-medium mb-1">{t("partner.booking_config.slot_minutes_label")}</div>
            <input
              inputMode="numeric"
              value={asString(cfg.slotMinutes)}
              onChange={(e) => setCfg({ slotMinutes: toIntStr(e.target.value) })}
              className="w-full border rounded-xl px-3 py-2"
              placeholder="15"
              disabled={disabled}
            />
            <div className="text-[11px] text-gray-400 mt-1">
              {t("partner.booking_config.slot_minutes_hint")}
            </div>
          </label>

          <label className="md:col-span-8 text-sm">
            <div className="font-medium mb-1">{t("partner.booking_config.allowed_durations_label")}</div>
            <input
              value={Array.isArray(cfg.allowedDurationsMinutes) ? cfg.allowedDurationsMinutes.join(", ") : ""}
              onChange={(e) =>
                setCfg({
                  allowedDurationsMinutes: e.target.value
                    .split(/[,\s]+/g)
                    .map((x) => Number(x))
                    .filter((n) => Number.isFinite(n))
                    .map((n) => Math.trunc(n)),
                })
              }
              className="w-full border rounded-xl px-3 py-2"
              placeholder="60, 90, 120"
              disabled={disabled}
            />
            <div className="text-[11px] text-gray-400 mt-1">{t("partner.booking_config.allowed_durations_hint")}</div>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <label className="md:col-span-4 text-sm">
            <div className="font-medium mb-1">{t("partner.booking_config.default_duration_label")}</div>
            <input
              inputMode="numeric"
              value={asString(cfg.defaultDurationMinutes)}
              onChange={(e) => setCfg({ defaultDurationMinutes: toIntStr(e.target.value) })}
              className="w-full border rounded-xl px-3 py-2"
              placeholder="90"
              disabled={disabled}
            />
          </label>

          <label className="md:col-span-4 text-sm">
            <div className="font-medium mb-1">{t("partner.booking_config.min_lead_time_label")}</div>
            <input
              inputMode="numeric"
              value={asString(cfg.minBookingLeadTimeMinutes)}
              onChange={(e) => setCfg({ minBookingLeadTimeMinutes: toIntStr(e.target.value) })}
              className="w-full border rounded-xl px-3 py-2"
              placeholder="30"
              disabled={disabled}
            />
            <div className="text-[11px] text-gray-400 mt-1">
              {t("partner.booking_config.min_lead_time_hint")}
            </div>
          </label>

          <label className="md:col-span-4 text-sm">
            <div className="font-medium mb-1">{t("partner.booking_config.grace_arrival_label")}</div>
            <input
              inputMode="numeric"
              value={asString(cfg.graceArrivalMinutes)}
              onChange={(e) => setCfg({ graceArrivalMinutes: toIntStr(e.target.value) })}
              className="w-full border rounded-xl px-3 py-2"
              placeholder="10"
              disabled={disabled}
            />
            <div className="text-[11px] text-gray-400 mt-1">
              {t("partner.booking_config.grace_arrival_hint")}
            </div>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <label className="md:col-span-4 text-sm">
            <div className="font-medium mb-1">{t("partner.booking_config.free_cancel_label")}</div>
            <input
              inputMode="numeric"
              value={asString(cfg.freeCancelMinutes)}
              onChange={(e) => setCfg({ freeCancelMinutes: toIntStr(e.target.value) })}
              className="w-full border rounded-xl px-3 py-2"
              placeholder="60"
              disabled={disabled}
            />
            <div className="text-[11px] text-gray-400 mt-1">
              {t("partner.booking_config.free_cancel_hint")}
            </div>
          </label>

          <label className="md:col-span-4 text-sm">
            <div className="font-medium mb-1">{t("partner.booking_config.pending_payment_label")}</div>
            <input
              inputMode="numeric"
              value={asString(cfg.pendingPaymentExpireMinutes)}
              onChange={(e) => setCfg({ pendingPaymentExpireMinutes: toIntStr(e.target.value) })}
              className="w-full border rounded-xl px-3 py-2"
              placeholder="15"
              disabled={disabled}
            />
            <div className="text-[11px] text-gray-400 mt-1">
              {t("partner.booking_config.pending_payment_hint")}
            </div>
          </label>

          <label className="md:col-span-4 text-sm">
            <div className="font-medium mb-1">{t("partner.booking_config.max_tables_label")}</div>
            <input
              inputMode="numeric"
              value={asString(cfg.maxTablesPerBooking)}
              onChange={(e) => setCfg({ maxTablesPerBooking: toIntStr(e.target.value) })}
              className="w-full border rounded-xl px-3 py-2"
              placeholder="3"
              disabled={disabled}
            />
          </label>
        </div>
      </div>
    </details>
  );
}