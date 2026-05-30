//src/features/partner/components/hotel/form/sections/BookingConfigSection.jsx
import { useTranslation } from "react-i18next";
const asString = (v) => (v == null ? "" : String(v));
const toPercentStr = (v) => {
  const s = asString(v).replace(/[^\d.]/g, "");
  const n = Number(s);
  if (!Number.isFinite(n)) return "";
  return String(Math.min(100, Math.max(0, n)));
};
const toIntStr = (v) => {
  const s = asString(v).replace(/[^\d]/g, "");
  const n = Number(s);
  if (!Number.isFinite(n)) return "";
  return String(Math.max(0, Math.trunc(n)));
};

export default function BookingConfigSection({ form, setField, disabled }) {
  const { t } = useTranslation();
  const cfg = form.bookingConfig || {};

  return (
    <details className="group">
      <summary className="cursor-pointer select-none font-semibold">
        {t("partner.booking_config.title")}
      </summary>

      <div className="mt-3 rounded-2xl border p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <label className="md:col-span-4 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={cfg.allowFullPayment !== false}
              onChange={(e) =>
                setField("bookingConfig", { ...cfg, allowFullPayment: e.target.checked })
              }
              disabled={disabled}
            />
            <span className="font-medium">{t("partner.booking_config.allow_full_payment")}</span>
          </label>

          <label className="md:col-span-4 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={!!cfg.allowDeposit}
              onChange={(e) =>
                setField("bookingConfig", { ...cfg, allowDeposit: e.target.checked })
              }
              disabled={disabled}
            />
            <span className="font-medium">{t("partner.booking_config.allow_deposit")}</span>
          </label>

          <label className="md:col-span-4 text-sm">
            <div className="font-medium mb-1">{t("partner.booking_config.free_cancel_minutes")}</div>
            <input
              inputMode="numeric"
              value={asString(cfg.freeCancelMinutes)}
              onChange={(e) =>
                setField("bookingConfig", { ...cfg, freeCancelMinutes: toIntStr(e.target.value) })
              }
              className="w-full border rounded-xl px-3 py-2"
              placeholder="0 / 30 / 60..."
              disabled={disabled}
            />
          </label>
        </div>

        {cfg.allowDeposit ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <label className="md:col-span-4 text-sm">
              <div className="font-medium mb-1">{t("partner.booking_config.deposit_percent")}</div>
              <input
                inputMode="decimal"
                value={asString(cfg.depositPercent)}
                onChange={(e) =>
                  setField("bookingConfig", { ...cfg, depositPercent: toPercentStr(e.target.value) })
                }
                className="w-full border rounded-xl px-3 py-2"
                placeholder="10"
                disabled={disabled}
              />
            </label>
          </div>
        ) : null}
      </div>
    </details>
  );
}