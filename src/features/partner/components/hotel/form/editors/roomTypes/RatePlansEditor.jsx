import { TrashIcon } from "@heroicons/react/24/outline";
import { TEXT } from "./roomTypes.text";
import { asArray, asString, normalizeRatePlan, sanitizeNumberStr } from "./roomTypes.utils";

export default function RatePlansEditor({ ratePlans = [], onChange }) {
  const list = asArray(ratePlans).map(normalizeRatePlan);

  const emit = (next) => {
    try {
      onChange?.(next);
    } catch (e) {
      console.error("RatePlansEditor onChange error:", e);
    }
  };

  const addRatePlan = () => emit([...list, { name: "", code: "", refundable: true, pricePerNight: "" }]);

  const setRatePlan = (idx, patch) => {
    const next = list.map((rp, i) =>
      i === idx ? normalizeRatePlan({ ...rp, ...(patch || {}) }) : rp
    );
    emit(next);
  };

  const removeRatePlan = (idx) => emit(list.filter((_, i) => i !== idx));

  return (
    <div className="rounded-2xl border p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">{TEXT.RATE_PLANS_TITLE}</div>
        <button
          type="button"
          onClick={addRatePlan}
          className="text-xs px-3 py-1.5 rounded-xl border hover:bg-gray-50"
        >
          {TEXT.ADD_RATE_PLAN}
        </button>
      </div>

      {list.length === 0 ? (
        <div className="text-sm text-gray-500">{TEXT.NO_RATE_PLANS}</div>
      ) : (
        <div className="space-y-2">
          {list.map((rp, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
              <input
                value={asString(rp.name)}
                onChange={(e) => setRatePlan(idx, { name: e.target.value })}
                className="md:col-span-4 border rounded-xl px-3 py-2 text-sm"
                placeholder={TEXT.RP_NAME}
              />
              <input
                value={asString(rp.code)}
                onChange={(e) => setRatePlan(idx, { code: e.target.value })}
                className="md:col-span-2 border rounded-xl px-3 py-2 text-sm"
                placeholder={TEXT.RP_CODE}
              />

              <select
                value={asString(rp.boardType, "ROOM_ONLY")}
                onChange={(e) => setRatePlan(idx, { boardType: e.target.value })}
                className="md:col-span-3 border rounded-xl px-3 py-2 text-sm"
              >
                {Object.keys(TEXT.BOARD_OPTIONS).map((k) => (
                  <option key={k} value={k}>
                    {TEXT.BOARD_OPTIONS[k]}
                  </option>
                ))}
              </select>

              <select
                value={asString(rp.paymentType, "PREPAID")}
                onChange={(e) => setRatePlan(idx, { paymentType: e.target.value })}
                className="md:col-span-3 border rounded-xl px-3 py-2 text-sm"
              >
                {Object.keys(TEXT.PAYMENT_OPTIONS).map((k) => (
                  <option key={k} value={k}>
                    {TEXT.PAYMENT_OPTIONS[k]}
                  </option>
                ))}
              </select>

              <input
                inputMode="decimal"
                value={asString(rp.pricePerNight)}
                onChange={(e) => setRatePlan(idx, { pricePerNight: sanitizeNumberStr(e.target.value) })}
                className="md:col-span-3 border rounded-xl px-3 py-2 text-sm"
                placeholder={TEXT.RP_PRICE}
              />

              <input
                inputMode="decimal"
                value={asString(rp.referencePricePerNight)}
                onChange={(e) =>
                  setRatePlan(idx, { referencePricePerNight: sanitizeNumberStr(e.target.value) })
                }
                className="md:col-span-3 border rounded-xl px-3 py-2 text-sm"
                placeholder={TEXT.RP_REF_PRICE}
              />

              <label className="md:col-span-2 text-xs flex items-center gap-2 justify-center">
                <input
                  type="checkbox"
                  checked={!!rp.refundable}
                  onChange={(e) => setRatePlan(idx, { refundable: e.target.checked })}
                />
                {TEXT.RP_REFUNDABLE}
              </label>

              <label className="md:col-span-2 text-xs flex items-center gap-2 justify-center">
                <input
                  type="checkbox"
                  checked={rp.priceIncludesTax !== false}
                  onChange={(e) => setRatePlan(idx, { priceIncludesTax: e.target.checked })}
                />
                {TEXT.RP_INCLUDES_TAX}
              </label>

              <label className="md:col-span-2 text-xs flex items-center gap-2 justify-center">
                <input
                  type="checkbox"
                  checked={rp.priceIncludesServiceFee !== false}
                  onChange={(e) => setRatePlan(idx, { priceIncludesServiceFee: e.target.checked })}
                />
                {TEXT.RP_INCLUDES_FEE}
              </label>

              <label className="md:col-span-2 text-xs flex items-center gap-2 justify-center">
                <input
                  type="checkbox"
                  checked={!!rp.showLowAvailability}
                  onChange={(e) => setRatePlan(idx, { showLowAvailability: e.target.checked })}
                />
                {TEXT.RP_LOW_AVAIL}
              </label>

              <input
                value={asString(rp.promoLabel)}
                onChange={(e) => setRatePlan(idx, { promoLabel: e.target.value })}
                className="md:col-span-4 border rounded-xl px-3 py-2 text-sm"
                placeholder={TEXT.RP_PROMO}
              />

              <input
                value={asString(rp.cancellationPolicy)}
                onChange={(e) => setRatePlan(idx, { cancellationPolicy: e.target.value })}
                className="md:col-span-7 border rounded-xl px-3 py-2 text-sm"
                placeholder={TEXT.RP_CANCEL}
              />

              <button
                type="button"
                onClick={() => removeRatePlan(idx)}
                className="md:col-span-1 p-2 rounded-xl hover:bg-red-50 flex justify-center"
                title={TEXT.DELETE}
              >
                <TrashIcon className="h-5 w-5 text-red-600" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}