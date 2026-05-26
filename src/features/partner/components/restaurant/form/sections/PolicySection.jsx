// src/features/partner/components/restaurant/form/sections/PolicySection.jsx
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

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

const DRINK_TYPES = [
  { value: "", label: "-- Chọn loại --" },
  { value: "WINE", label: "Rượu vang" },
  { value: "SPIRITS", label: "Rượu mạnh" },
  { value: "BEER", label: "Bia" },
  { value: "OTHER", label: "Khác" },
];

export default function PolicySection({ form, setField, disabled }) {
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
        Quy định nhà hàng
      </summary>

      <div className="mt-3 space-y-5">
        {/* === 1. Đặt cọc === */}
        <div className="rounded-2xl border p-4 space-y-3">
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            1. Đặt cọc
          </div>

          <label className="text-sm flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!policy.depositRequired}
              onChange={(e) => update({ depositRequired: e.target.checked })}
              disabled={disabled}
            />
            <span className="font-medium">Yêu cầu đặt cọc</span>
          </label>

          {policy.depositRequired && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <label className="text-sm">
                <div className="font-medium mb-1">Áp dụng từ (số khách)</div>
                <input
                  inputMode="numeric"
                  value={policy.depositMinGuests ?? ""}
                  onChange={(e) => update({ depositMinGuests: sanitizeIntStr(e.target.value) })}
                  className="w-full border rounded-xl px-3 py-2"
                  placeholder="Ví dụ: 6"
                  disabled={disabled}
                />
              </label>

              <label className="text-sm">
                <div className="font-medium mb-1">Tiền cọc (VND)</div>
                <input
                  inputMode="decimal"
                  value={policy.depositAmount ?? ""}
                  onChange={(e) => update({ depositAmount: sanitizeNumberStr(e.target.value) })}
                  className="w-full border rounded-xl px-3 py-2"
                  placeholder="Ví dụ: 500000"
                  disabled={disabled}
                />
              </label>

              <label className="text-sm md:col-span-3">
                <div className="font-medium mb-1">Ghi chú đặt cọc</div>
                <textarea
                  value={policy.depositNotes ?? ""}
                  onChange={(e) => update({ depositNotes: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2 min-h-[70px]"
                  placeholder="Ví dụ: Cọc không hoàn lại trong 24h trước giờ đặt."
                  disabled={disabled}
                />
              </label>
            </div>
          )}
        </div>

        {/* === 2. Ưu đãi === */}
        <div className="rounded-2xl border p-4 space-y-3">
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            2. Ưu đãi
          </div>

          <label className="text-sm flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!policy.hasPromotion}
              onChange={(e) => update({ hasPromotion: e.target.checked })}
              disabled={disabled}
            />
            <span className="font-medium">Có chương trình ưu đãi</span>
          </label>

          {policy.hasPromotion && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <label className="text-sm md:col-span-2">
                <div className="font-medium mb-1">Tóm tắt ưu đãi</div>
                <input
                  value={policy.promotionSummary ?? ""}
                  onChange={(e) => update({ promotionSummary: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2"
                  placeholder="Ví dụ: Giảm 20% cho hóa đơn từ 1 triệu"
                  disabled={disabled}
                />
              </label>

              <label className="text-sm">
                <div className="font-medium mb-1">Giảm tối đa (%)</div>
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
                <div className="font-medium mb-1">Ghi chú ưu đãi</div>
                <textarea
                  value={policy.promotionNote ?? ""}
                  onChange={(e) => update({ promotionNote: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2 min-h-[70px]"
                  placeholder="Ví dụ: Không áp dụng cuối tuần / ngày lễ."
                  disabled={disabled}
                />
              </label>
            </div>
          )}

          {/* Blackout rules — luôn cho phép, kể cả khi không có promotion */}
          <div className="rounded-xl border p-3 space-y-2 bg-gray-50/50 dark:bg-gray-900/40">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Ngày ngoại lệ (không áp dụng ưu đãi)</div>
              <button
                type="button"
                onClick={addBlackout}
                disabled={disabled}
                className="text-xs px-3 py-1.5 rounded-lg border hover:bg-gray-100 disabled:opacity-60 flex items-center gap-1"
              >
                <PlusIcon className="h-4 w-4" /> Thêm ngày
              </button>
            </div>

            {blackoutRules.length === 0 ? (
              <div className="text-xs text-gray-500 dark:text-gray-400">Chưa có ngày ngoại lệ.</div>
            ) : (
              <div className="space-y-2">
                {blackoutRules.map((r, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
                    <label className="md:col-span-2 text-xs">
                      <div className="mb-1">Tháng</div>
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
                      <div className="mb-1">Ngày</div>
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
                      <div className="mb-1">Mô tả</div>
                      <input
                        value={r.description ?? ""}
                        onChange={(e) => updateBlackout(idx, { description: e.target.value })}
                        className="w-full border rounded-lg px-2 py-1.5 text-sm"
                        placeholder="Ví dụ: Mùng 1 Tết, ngày Valentine..."
                        disabled={disabled}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => removeBlackout(idx)}
                      disabled={disabled}
                      className="md:col-span-1 p-2 rounded-lg hover:bg-red-50 disabled:opacity-60 flex justify-center"
                      title="Xóa"
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
            3. Thời gian đặt & giữ chỗ
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="text-sm">
              <div className="font-medium mb-1">Đặt trước tối thiểu (phút)</div>
              <input
                inputMode="numeric"
                value={policy.minBookingLeadTimeMinutes ?? ""}
                onChange={(e) =>
                  update({ minBookingLeadTimeMinutes: sanitizeIntStr(e.target.value) })
                }
                className="w-full border rounded-xl px-3 py-2"
                placeholder="Ví dụ: 60"
                disabled={disabled}
              />
            </label>

            <label className="text-sm">
              <div className="font-medium mb-1">Giữ chỗ tối đa (phút)</div>
              <input
                inputMode="numeric"
                value={policy.maxHoldTimeMinutes ?? ""}
                onChange={(e) => update({ maxHoldTimeMinutes: sanitizeIntStr(e.target.value) })}
                className="w-full border rounded-xl px-3 py-2"
                placeholder="Ví dụ: 20"
                disabled={disabled}
              />
            </label>

            <label className="text-sm">
              <div className="font-medium mb-1">Số khách tối thiểu / lần đặt</div>
              <input
                inputMode="numeric"
                value={policy.minGuestsPerBooking ?? ""}
                onChange={(e) => update({ minGuestsPerBooking: sanitizeIntStr(e.target.value) })}
                className="w-full border rounded-xl px-3 py-2"
                placeholder="Bỏ trống = không giới hạn"
                disabled={disabled}
              />
            </label>
          </div>
        </div>

        {/* === 4. Hóa đơn === */}
        <div className="rounded-2xl border p-4 space-y-3">
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            4. Hóa đơn
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="text-sm flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!policy.vatInvoiceAvailable}
                onChange={(e) => update({ vatInvoiceAvailable: e.target.checked })}
                disabled={disabled}
              />
              <span className="font-medium">Xuất hóa đơn VAT</span>
            </label>

            <label className="text-sm flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!policy.directInvoiceAvailable}
                onChange={(e) => update({ directInvoiceAvailable: e.target.checked })}
                disabled={disabled}
              />
              <span className="font-medium">Xuất hóa đơn trực tiếp</span>
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
            <div className="font-medium mb-1">Ghi chú hóa đơn</div>
            <textarea
              value={policy.invoiceNotes ?? ""}
              onChange={(e) => update({ invoiceNotes: e.target.value })}
              className="w-full border rounded-xl px-3 py-2 min-h-[70px]"
              placeholder="Ví dụ: Yêu cầu hóa đơn cần báo trước khi gọi món."
              disabled={disabled}
            />
          </label>
        </div>

        {/* === 5. Phí phục vụ === */}
        <div className="rounded-2xl border p-4 space-y-3">
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            5. Phí phục vụ
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="text-sm">
              <div className="font-medium mb-1">Phí phục vụ (%)</div>
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
              <div className="font-medium mb-1">Ghi chú phí phục vụ</div>
              <input
                value={policy.serviceChargeNotes ?? ""}
                onChange={(e) => update({ serviceChargeNotes: e.target.value })}
                className="w-full border rounded-xl px-3 py-2"
                placeholder="Ví dụ: Không áp dụng với take-away"
                disabled={disabled}
              />
            </label>
          </div>
        </div>

        {/* === 6. Mang đồ từ ngoài === */}
        <div className="rounded-2xl border p-4 space-y-3">
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            6. Mang đồ từ ngoài
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="text-sm flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!policy.allowOutsideFood}
                onChange={(e) => update({ allowOutsideFood: e.target.checked })}
                disabled={disabled}
              />
              <span className="font-medium">Cho phép mang đồ ăn từ ngoài</span>
            </label>

            <label className="text-sm flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!policy.allowOutsideDrink}
                onChange={(e) => update({ allowOutsideDrink: e.target.checked })}
                disabled={disabled}
              />
              <span className="font-medium">Cho phép mang đồ uống từ ngoài</span>
            </label>
          </div>

          {policy.allowOutsideFood && (
            <label className="text-sm block">
              <div className="font-medium mb-1">Chính sách mang đồ ăn</div>
              <textarea
                value={policy.outsideFoodPolicy ?? ""}
                onChange={(e) => update({ outsideFoodPolicy: e.target.value })}
                className="w-full border rounded-xl px-3 py-2 min-h-[70px]"
                placeholder="Ví dụ: Cho phép bánh sinh nhật, phụ thu phí cắt bánh 50.000đ."
                disabled={disabled}
              />
            </label>
          )}

          {policy.allowOutsideDrink && (
            <>
              <label className="text-sm block">
                <div className="font-medium mb-1">Chính sách mang đồ uống</div>
                <textarea
                  value={policy.outsideDrinkPolicy ?? ""}
                  onChange={(e) => update({ outsideDrinkPolicy: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2 min-h-[70px]"
                  placeholder="Ví dụ: Cho phép mang rượu vang, phụ thu phí mở chai."
                  disabled={disabled}
                />
              </label>

              {/* OutsideDrinkFees editor */}
              <div className="rounded-xl border p-3 space-y-2 bg-gray-50/50 dark:bg-gray-900/40">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Phụ phí đồ uống mang ngoài</div>
                  <button
                    type="button"
                    onClick={addDrinkFee}
                    disabled={disabled}
                    className="text-xs px-3 py-1.5 rounded-lg border hover:bg-gray-100 disabled:opacity-60 flex items-center gap-1"
                  >
                    <PlusIcon className="h-4 w-4" /> Thêm phí
                  </button>
                </div>

                {outsideDrinkFees.length === 0 ? (
                  <div className="text-xs text-gray-500 dark:text-gray-400">Chưa có phụ phí.</div>
                ) : (
                  <div className="space-y-2">
                    {outsideDrinkFees.map((f, idx) => (
                      <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
                        <label className="md:col-span-3 text-xs">
                          <div className="mb-1">Loại đồ uống</div>
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
                          <div className="mb-1">Phụ phí (VND)</div>
                          <input
                            inputMode="decimal"
                            value={f.feeAmount ?? ""}
                            onChange={(e) =>
                              updateDrinkFee(idx, { feeAmount: sanitizeNumberStr(e.target.value) })
                            }
                            className="w-full border rounded-lg px-2 py-1.5 text-sm"
                            placeholder="Ví dụ: 200000"
                            disabled={disabled}
                          />
                        </label>
                        <label className="md:col-span-5 text-xs">
                          <div className="mb-1">Ghi chú</div>
                          <input
                            value={f.note ?? ""}
                            onChange={(e) => updateDrinkFee(idx, { note: e.target.value })}
                            className="w-full border rounded-lg px-2 py-1.5 text-sm"
                            placeholder="Ví dụ: Phí mở chai vang"
                            disabled={disabled}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => removeDrinkFee(idx)}
                          disabled={disabled}
                          className="md:col-span-1 p-2 rounded-lg hover:bg-red-50 disabled:opacity-60 flex justify-center"
                          title="Xóa"
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
