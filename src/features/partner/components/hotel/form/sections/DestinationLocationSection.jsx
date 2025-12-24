// src/features/partner/components/hotel/form/sections/DestinationLocationSection.jsx
import { useEffect, useState } from "react";
import { MapPinIcon } from "@heroicons/react/24/outline";
import DestinationTypeahead from "../../../../../../components/DestinationTypeahead";

const asString = (v) => (v == null ? "" : String(v));

const TEXT = {
  SECTION_TITLE: "Điểm đến",
  DEST_LABEL: "Thuộc địa điểm",
  CLEAR: "Xóa",
  DEST_PLACEHOLDER: "Chọn điểm đến (Hội An, Đà Nẵng, Phú Quốc...)",
  DEST_HINT: "Bắt buộc chọn từ gợi ý để lấy đúng slug (không nhập tay).",
};

const pickSlug = (p) => p?.slug ?? p?.value ?? p?.id ?? "";
const pickText = (p) => p?.text ?? p?.label ?? p?.name ?? "";

export default function DestinationLocationSection({ form, setField, disabled }) {
  const [, setDestText] = useState(
    asString(form?.destinationName || form?.destinationSlug || "")
  );
  const [destSlug, setDestSlug] = useState(form?.destinationSlug || "");

  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    const nextText = asString(form?.destinationName || form?.destinationSlug || "");
    const nextSlug = asString(form?.destinationSlug || "");
    setDestText(nextText);
    setDestSlug(nextSlug);
  }, [form?.destinationName, form?.destinationSlug]);

  const onDestUpdate = (payload) => {
    const nextText = asString(pickText(payload)).trim();
    const nextSlug = asString(pickSlug(payload)).trim();

    console.log("Destination picked payload =", payload, { nextText, nextSlug });

    setDestText(nextText);
    setDestSlug(nextSlug);

    setField("destinationSlug", nextSlug);
    if ("destinationName" in (form || {})) setField("destinationName", nextText);
  };

  const clearDest = () => {
    setDestText("");
    setDestSlug("");
    setField("destinationSlug", "");
    if ("destinationName" in (form || {})) setField("destinationName", "");
    setResetKey((k) => k + 1);
  };

  return (
    <details open className="group">
      <summary className="cursor-pointer select-none font-semibold">
        {TEXT.SECTION_TITLE}
      </summary>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-12 rounded-2xl border p-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm font-semibold flex items-center gap-2">
              <MapPinIcon className="h-5 w-5 text-gray-500" />
              {TEXT.DEST_LABEL} <span className="text-red-600">*</span>
            </div>

            <button
              type="button"
              className="text-xs px-3 py-1.5 rounded-xl border hover:bg-gray-50"
              onClick={clearDest}
              disabled={disabled}
            >
              {TEXT.CLEAR}
            </button>
          </div>

          <DestinationTypeahead
            key={resetKey}
            value={form.destinationName || ""}
            defaultSlug={form.destinationSlug || null}
            onPick={onDestUpdate}
            label={null}
            placeholder={TEXT.DEST_PLACEHOLDER}
            className="w-full !max-w-none !mx-0"
            buttonSlot={null}
            onSubmit={onDestUpdate}
             onChangeText={(text) => {
                setField("destinationSlug", "");
                setField("destinationName", text);
            }}
            disabled={disabled}
          />

          <div className="text-xs text-gray-500">
            {!!destSlug && (
              <span className="ml-2 text-green-700">
                (Đã chọn: <b>{destSlug}</b>)
              </span>
            )}
          </div>
        </div>
      </div>
    </details>
  );
}