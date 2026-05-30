// src/features/partner/components/restaurant/form/sections/PolicySection.jsx
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

const sanitizeNumberStr = (v) => {
  const s = String(v ?? "").replace(/[^\d.]/g, "");
  const firstDot = s.indexOf(".");
  if (firstDot !== -1) return s.slice(0, firstDot + 1) + s.slice(firstDot + 1).replace(/\./g, "");
  return s;
};
const sanitizeIntStr = (v) => String(v ?? "").replace(/[^\d]/g, "");

/** Sanitize + clamp decimal vào [0..100] (cho field %). */
const clampPercentStr = (v) => {
  const s = sanitizeNumberStr(v);
  if (!s) return "";
  const n = parseFloat(s);
  if (!Number.isFinite(n)) return "";
  return String(Math.min(100, Math.max(0, n)));
};

/** Sanitize + clamp integer vào [min..max]. */
const clampIntStr = (v, min, max) => {
  const s = sanitizeIntStr(v);
  if (!s) return "";
  const n = parseInt(s, 10);
  if (!Number.isFinite(n)) return "";
  return String(Math.min(max, Math.max(min, n)));
};

export default function PolicySection({ form, setField, disabled }) {
  const { t } = useTranslation();
  const DRINK_TYPES = [
    { value: "", label: t("partner.policy.drink_type_select") },
    { value: "WINE", label: t("partner.policy.drink_type_wine") },
    { value: "SPIRITS", label: t("partner.policy.drink_type_spirits") },
    { value: "BEER", label: t("partner.policy.drink_type_beer") },
    { value: "OTHER", label: t("partner.policy.drink_type_other") },
  ];
  const policy = form.policy || {};
  const update = (patch) => setField("policy", { ...policy, ...patch });

  /* === BLACKOUT RULES === */
  const blackoutRules = Array.isArray(policy.blackoutRules) ? policy.blackoutRules : [];
  const addBlackout = () =>
    update({ blackoutRules: [...blackoutRules, { month: "", day: "", description: "" }] });
  const removeBlackout = (idx) =>
    update({ blackoutRules: blackoutRules.filter((_, i) => i !== idx) });
  const updateBlackout = (idx, patch) =>
    update({
      blackoutRules: blackoutRules.map((r, i) => (i === idx ? { ...r, ...patch } : r)),
    });

  /* === OUTSIDE DRINK FEES === */
  const outsideDrinkFees = Array.isArray(policy.outsideDrinkFees) ? policy.outsideDrinkFees : [];
  const addDrinkFee = () =>
    update({
      outsideDrinkFees: [
        ...outsideDrinkFees,
        { drinkType: "", feeAmount: "", currencyCode: "VND", note: "" },
      ],
    });
  const removeDrinkFee = (idx) =>
    update({ outsideDrinkFees: outsideDrinkFees.filter((_, i) => i !== idx) });
  const updateDrinkFee = (idx, patch) =>
    update({
      outsideDrinkFees: outsideDrinkFees.map((f, i) => (i === idx ? { ...f, ...patch } : f)),
    });

  return (
    <details className="group">
      <summary className="cursor-pointer select-none font-semibold">
        {t("partner.policy.title")}
      </summary>

      <div className="mt-3 space-y-5">
        {/* === 1. Đặt cọc === */}
        <div className="rounded-2xl border p-4 space-y-3">
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {t("partner.policy.deposit_section")}
          </div>

          <label className="text-sm flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!policy.depositRequired}
              onChange={(e) => update({ depositRequired: e.target.checked })}
              disabled={disabled}
            />
            <span className="font-medium">{t("partner.policy.deposit_required")}</span>
          </label>

          {policy.depositRequired && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <label className="text-sm">
                <div className="font-medium mb-1">{t("partner.policy.deposit_min_guests_label")}</div>
                <input
                  inputMode="numeric"
                  value={policy.depositMinGuests ?? ""}
                  onChange={(e) => update({ depositMinGuests: sanitizeIntStr(e.target.value) })}
                  className="w-full border rounded-xl px-3 py-2"
                  placeholder={t("partner.policy.deposit_min_guests_placeholder")}
                  disabled={disabled}
                />
              </label>

              <label className="text-sm">
                <div className="font-medium mb-1">{t("partner.policy.deposit_amount_label")}</div>
                <input
                  inputMode="decimal"
                  value={policy.depositAmount ?? ""}
                  onChange={(e) => update({ depositAmount: sanitizeNumberStr(e.target.value) })}
                  className="w-full border rounded-xl px-3 py-2"
                  placeholder={t("partner.policy.deposit_amount_placeholder")}
                  disabled={disabled}
                />
              </label>

              <label className="text-sm md:col-span-3">
                <div className="font-medium mb-1">{t("partner.policy.deposit_notes_label")}</div>
                <textarea
                  value={policy.depositNotes ?? ""}
                  onChange={(e) => update({ depositNotes: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2 min-h-[70px]"
                  placeholder={t("partner.policy.deposit_notes_placeholder")}
                  disabled={disabled}
                />
              </label>
            </div>
          )}
        </div>

        {/* === 2. Ưu đãi === */}
        <div className="rounded-2xl border p-4 space-y-3">
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {t("partner.policy.promotion_section")}
          </div>

          <label className="text-sm flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!policy.hasPromotion}
              onChange={(e) => update({ hasPromotion: e.target.checked })}
              disabled={disabled}
            />
            <span className="font-medium">{t("partner.policy.has_promotion")}</span>
          </label>

          {policy.hasPromotion && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <label className="text-sm md:col-span-2">
                <div className="font-medium mb-1">{t("partner.policy.promotion_summary_label")}</div>
                <input
                  value={policy.promotionSummary ?? ""}
                  onChange={(e) => update({ promotionSummary: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2"
                  placeholder={t("partner.policy.promotion_summary_placeholder")}
                  disabled={disabled}
                />
              </label>

              <label className="text-sm">
                <div className="font-medium mb-1">{t("partner.policy.promotion_max_discount_label")}</div>
                <input
                  inputMode="numeric"
                  value={policy.promotionMaxDiscountPercent ?? ""}
                  onChange={(e) =>
                    update({ promotionMaxDiscountPercent: clampIntStr(e.target.value, 0, 100) })
                  }
                  className="w-full border rounded-xl px-3 py-2"
                  placeholder="0-100"
                  disabled={disabled}
                />
              </label>

              <label className="text-sm md:col-span-3">
                <div className="font-medium mb-1">{t("partner.policy.promotion_note_label")}</div>
                <textarea
                  value={policy.promotionNote ?? ""}
                  onChange={(e) => update({ promotionNote: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2 min-h-[70px]"
                  placeholder={t("partner.policy.promotion_note_placeholder")}
                  disabled={disabled}
                />
              </label>
            </div>
          )}

          {/* Blackout rules — luôn cho phép, kể cả khi không có promotion */}
          <div className="rounded-xl border p-3 space-y-2 bg-gray-50/50 dark:bg-gray-900/40">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">{t("partner.policy.blackout_title")}</div>
              <button
                type="button"
                onClick={addBlackout}
                disabled={disabled}
                className="text-xs px-3 py-1.5 rounded-lg border hover:bg-gray-100 disabled:opacity-60 flex items-center gap-1"
              >
                <PlusIcon className="h-4 w-4" /> {t("partner.policy.blackout_add")}
              </button>
            </div>

            {blackoutRules.length === 0 ? (
              <div className="text-xs text-gray-500 dark:text-gray-400">{t("partner.policy.blackout_empty")}</div>
            ) : (
              <div className="space-y-2">
                {blackoutRules.map((r, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
                    <label className="md:col-span-2 text-xs">
                      <div className="mb-1">{t("partner.policy.month_label")}</div>
                      <input
                        inputMode="numeric"
                        value={r.month ?? ""}
                        onChange={(e) => updateBlackout(idx, { month: clampIntStr(e.target.value, 1, 12) })}
                        className="w-full border rounded-lg px-2 py-1.5 text-sm"
                        placeholder="1-12"
                        disabled={disabled}
                      />
                    </label>
                    <label className="md:col-span-2 text-xs">
                      <div className="mb-1">{t("partner.policy.day_label")}</div>
                      <input
                        inputMode="numeric"
                        value={r.day ?? ""}
                        onChange={(e) => updateBlackout(idx, { day: clampIntStr(e.target.value, 1, 31) })}
                        className="w-full border rounded-lg px-2 py-1.5 text-sm"
                        placeholder="1-31"
                        disabled={disabled}
                      />
                    </label>
                    <label className="md:col-span-7 text-xs">
                      <div className="mb-1">{t("partner.policy.blackout_desc_label")}</div>
                      <input
                        value={r.description ?? ""}
                        onChange={(e) => updateBlackout(idx, { description: e.target.value })}
                        className="w-full border rounded-lg px-2 py-1.5 text-sm"
                        placeholder={t("partner.policy.blackout_desc_placeholder")}
                        disabled={disabled}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => removeBlackout(idx)}
                      disabled={disabled}
                      className="md:col-span-1 p-2 rounded-lg hover:bg-red-50 disabled:opacity-60 flex justify-center"
                      title={t("common.delete")}
                    >
                      <TrashIcon className="h-5 w-5 text-red-600" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* === 3. Thời gian đặt & giữ chỗ === */}
        <div className="rounded-2xl border p-4 space-y-3">
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {t("partner.policy.timing_section")}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="text-sm">
              <div className="font-medium mb-1">{t("partner.policy.min_lead_time_label")}</div>
              <input
                inputMode="numeric"
                value={policy.minBookingLeadTimeMinutes ?? ""}
                onChange={(e) =>
                  update({ minBookingLeadTimeMinutes: sanitizeIntStr(e.target.value) })
                }
                className="w-full border rounded-xl px-3 py-2"
                placeholder={t("partner.policy.min_lead_time_placeholder")}
                disabled={disabled}
              />
            </label>

            <label className="text-sm">
              <div className="font-medium mb-1">{t("partner.policy.max_hold_time_label")}</div>
              <input
                inputMode="numeric"
                value={policy.maxHoldTimeMinutes ?? ""}
                onChange={(e) => update({ maxHoldTimeMinutes: sanitizeIntStr(e.target.value) })}
                className="w-full border rounded-xl px-3 py-2"
                placeholder={t("partner.policy.max_hold_time_placeholder")}
                disabled={disabled}
              />
            </label>

            <label className="text-sm">
              <div className="font-medium mb-1">{t("partner.policy.min_guests_label")}</div>
              <input
                inputMode="numeric"
                value={policy.minGuestsPerBooking ?? ""}
                onChange={(e) => update({ minGuestsPerBooking: sanitizeIntStr(e.target.value) })}
                className="w-full border rounded-xl px-3 py-2"
                placeholder={t("partner.policy.min_guests_placeholder")}
                disabled={disabled}
              />
            </label>
          </div>
        </div>

        {/* === 4. Hóa đơn === */}
        <div className="rounded-2xl border p-4 space-y-3">
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {t("partner.policy.invoice_section")}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="text-sm flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!policy.vatInvoiceAvailable}
                onChange={(e) => update({ vatInvoiceAvailable: e.target.checked })}
                disabled={disabled}
              />
              <span className="font-medium">{t("partner.policy.vat_invoice_available")}</span>
            </label>

            <label className="text-sm flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!policy.directInvoiceAvailable}
                onChange={(e) => update({ directInvoiceAvailable: e.target.checked })}
                disabled={disabled}
              />
              <span className="font-medium">{t("partner.policy.direct_invoice_available")}</span>
            </label>
          </div>

          {policy.vatInvoiceAvailable && (
            <label className="text-sm block">
              <div className="font-medium mb-1">VAT (%)</div>
              <input
                inputMode="decimal"
                value={policy.vatPercent ?? ""}
                onChange={(e) => update({ vatPercent: clampPercentStr(e.target.value) })}
                className="w-full md:w-1/3 border rounded-xl px-3 py-2"
                placeholder="0-100"
                disabled={disabled}
              />
            </label>
          )}

          <label className="text-sm block">
            <div className="font-medium mb-1">{t("partner.policy.invoice_notes_label")}</div>
            <textarea
              value={policy.invoiceNotes ?? ""}
              onChange={(e) => update({ invoiceNotes: e.target.value })}
              className="w-full border rounded-xl px-3 py-2 min-h-[70px]"
              placeholder={t("partner.policy.invoice_notes_placeholder")}
              disabled={disabled}
            />
          </label>
        </div>

        {/* === 5. Phí phục vụ === */}
        <div className="rounded-2xl border p-4 space-y-3">
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {t("partner.policy.service_charge_section")}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="text-sm">
              <div className="font-medium mb-1">{t("partner.policy.service_charge_percent_label")}</div>
              <input
                inputMode="decimal"
                value={policy.serviceChargePercent ?? ""}
                onChange={(e) =>
                  update({ serviceChargePercent: clampPercentStr(e.target.value) })
                }
                className="w-full border rounded-xl px-3 py-2"
                placeholder="0-100"
                disabled={disabled}
              />
            </label>

            <label className="text-sm">
              <div className="font-medium mb-1">{t("partner.policy.service_charge_notes_label")}</div>
              <input
                value={policy.serviceChargeNotes ?? ""}
                onChange={(e) => update({ serviceChargeNotes: e.target.value })}
                className="w-full border rounded-xl px-3 py-2"
                placeholder={t("partner.policy.service_charge_notes_placeholder")}
                disabled={disabled}
              />
            </label>
          </div>
        </div>

        {/* === 6. Mang đồ từ ngoài === */}
        <div className="rounded-2xl border p-4 space-y-3">
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {t("partner.policy.outside_section")}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="text-sm flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!policy.allowOutsideFood}
                onChange={(e) => update({ allowOutsideFood: e.target.checked })}
                disabled={disabled}
              />
              <span className="font-medium">{t("partner.policy.allow_outside_food")}</span>
            </label>

            <label className="text-sm flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!policy.allowOutsideDrink}
                onChange={(e) => update({ allowOutsideDrink: e.target.checked })}
                disabled={disabled}
              />
              <span className="font-medium">{t("partner.policy.allow_outside_drink")}</span>
            </label>
          </div>

          {policy.allowOutsideFood && (
            <label className="text-sm block">
              <div className="font-medium mb-1">{t("partner.policy.outside_food_policy_label")}</div>
              <textarea
                value={policy.outsideFoodPolicy ?? ""}
                onChange={(e) => update({ outsideFoodPolicy: e.target.value })}
                className="w-full border rounded-xl px-3 py-2 min-h-[70px]"
                placeholder={t("partner.policy.outside_food_policy_placeholder")}
                disabled={disabled}
              />
            </label>
          )}

          {policy.allowOutsideDrink && (
            <>
              <label className="text-sm block">
                <div className="font-medium mb-1">{t("partner.policy.outside_drink_policy_label")}</div>
                <textarea
                  value={policy.outsideDrinkPolicy ?? ""}
                  onChange={(e) => update({ outsideDrinkPolicy: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2 min-h-[70px]"
                  placeholder={t("partner.policy.outside_drink_policy_placeholder")}
                  disabled={disabled}
                />
              </label>

              {/* OutsideDrinkFees editor */}
              <div className="rounded-xl border p-3 space-y-2 bg-gray-50/50 dark:bg-gray-900/40">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">{t("partner.policy.drink_fee_title")}</div>
                  <button
                    type="button"
                    onClick={addDrinkFee}
                    disabled={disabled}
                    className="text-xs px-3 py-1.5 rounded-lg border hover:bg-gray-100 disabled:opacity-60 flex items-center gap-1"
                  >
                    <PlusIcon className="h-4 w-4" /> {t("partner.policy.drink_fee_add")}
                  </button>
                </div>

                {outsideDrinkFees.length === 0 ? (
                  <div className="text-xs text-gray-500 dark:text-gray-400">{t("partner.policy.drink_fee_empty")}</div>
                ) : (
                  <div className="space-y-2">
                    {outsideDrinkFees.map((f, idx) => (
                      <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
                        <label className="md:col-span-3 text-xs">
                          <div className="mb-1">{t("partner.policy.drink_type_label")}</div>
                          <select
                            value={f.drinkType ?? ""}
                            onChange={(e) => updateDrinkFee(idx, { drinkType: e.target.value })}
                            className="w-full border rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-gray-900"
                            disabled={disabled}
                          >
                            {DRINK_TYPES.map((d) => (
                              <option key={d.value} value={d.value}>{d.label}</option>
                            ))}
                          </select>
                        </label>
                        <label className="md:col-span-3 text-xs">
                          <div className="mb-1">{t("partner.policy.drink_fee_amount_label")}</div>
                          <input
                            inputMode="decimal"
                            value={f.feeAmount ?? ""}
                            onChange={(e) =>
                              updateDrinkFee(idx, { feeAmount: sanitizeNumberStr(e.target.value) })
                            }
                            className="w-full border rounded-lg px-2 py-1.5 text-sm"
                            placeholder={t("partner.policy.drink_fee_amount_placeholder")}
                            disabled={disabled}
                          />
                        </label>
                        <label className="md:col-span-5 text-xs">
                          <div className="mb-1">{t("partner.policy.drink_fee_note_label")}</div>
                          <input
                            value={f.note ?? ""}
                            onChange={(e) => updateDrinkFee(idx, { note: e.target.value })}
                            className="w-full border rounded-lg px-2 py-1.5 text-sm"
                            placeholder={t("partner.policy.drink_fee_note_placeholder")}
                            disabled={disabled}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => removeDrinkFee(idx)}
                          disabled={disabled}
                          className="md:col-span-1 p-2 rounded-lg hover:bg-red-50 disabled:opacity-60 flex justify-center"
                          title={t("common.delete")}
                        >
                          <TrashIcon className="h-5 w-5 text-red-600" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </details>
  );
}
