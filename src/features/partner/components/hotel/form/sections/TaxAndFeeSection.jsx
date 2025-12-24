//src/features/partner/components/hotel/form/sections/TaxAndFeeSection.jsx
const asString = (v) => (v == null ? "" : String(v));
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

const toPercentStr = (v) => {
  const s = asString(v).replace(/[^\d.]/g, "");
  const n = Number(s);
  if (!Number.isFinite(n)) return "";
  return String(clamp(n, 0, 100));
};

export default function TaxAndFeeSection({ form, setField, disabled }) {
  const tax = form.taxConfig || {};

  return (
    <details className="group">
      <summary className="cursor-pointer select-none font-semibold">
        Thuế & Phí (taxConfig)
      </summary>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-12 gap-4">
        <label className="text-sm md:col-span-4">
          <div className="font-medium mb-1">Thuế VAT mặc định (%)</div>
          <input
            inputMode="decimal"
            value={asString(tax.defaultVatPercent)}
            onChange={(e) =>
              setField("taxConfig", {
                ...tax,
                defaultVatPercent: toPercentStr(e.target.value),
              })
            }
            className="w-full border rounded-xl px-3 py-2"
            placeholder="8"
            disabled={disabled}
          />
        </label>

        <label className="text-sm md:col-span-4">
          <div className="font-medium mb-1">Phí dịch vụ mặc định (%)</div>
          <input
            inputMode="decimal"
            value={asString(tax.defaultServiceFeePercent)}
            onChange={(e) =>
              setField("taxConfig", {
                ...tax,
                defaultServiceFeePercent: toPercentStr(e.target.value),
              })
            }
            className="w-full border rounded-xl px-3 py-2"
            placeholder="7"
            disabled={disabled}
          />
        </label>

        <label className="text-sm md:col-span-4 flex items-center gap-2 mt-6">
          <input
            type="checkbox"
            checked={!!tax.showPricePreTax}
            onChange={(e) =>
              setField("taxConfig", { ...tax, showPricePreTax: e.target.checked })
            }
            disabled={disabled}
          />
          <span className="font-medium">Hiển thị giá trước thuế</span>
        </label>
      </div>
    </details>
  );
}