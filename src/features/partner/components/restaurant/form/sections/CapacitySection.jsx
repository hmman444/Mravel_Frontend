// src/features/partner/components/restaurant/form/sections/CapacitySection.jsx
import { useTranslation } from "react-i18next";

const sanitizeIntStr = (v) => String(v ?? "").replace(/[^\d]/g, "");

export default function CapacitySection({ form, setField, disabled }) {
  const { t } = useTranslation();
  const cap = form.capacity || {};
  const update = (patch) => setField("capacity", { ...cap, ...patch });

  const groupExceedsTotal = (() => {
    const total = Number(cap.totalCapacity);
    const group = Number(cap.maxGroupSize);
    return Number.isFinite(total) && Number.isFinite(group) && total > 0 && group > total;
  })();

  return (
    <details className="group">
      <summary className="cursor-pointer select-none font-semibold">
        {t("partner.capacity.section_title")}
      </summary>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="text-sm">
          <div className="font-medium mb-1">{t("partner.capacity.total_capacity_label")}</div>
          <input
            inputMode="numeric"
            value={cap.totalCapacity ?? ""}
            onChange={(e) => update({ totalCapacity: sanitizeIntStr(e.target.value) })}
            className="w-full border rounded-xl px-3 py-2"
            placeholder={t("partner.capacity.total_capacity_placeholder")}
            disabled={disabled}
          />
        </label>

        <label className="text-sm">
          <div className="font-medium mb-1">{t("partner.capacity.max_group_size_label")}</div>
          <input
            inputMode="numeric"
            value={cap.maxGroupSize ?? ""}
            onChange={(e) => update({ maxGroupSize: sanitizeIntStr(e.target.value) })}
            className="w-full border rounded-xl px-3 py-2"
            placeholder={t("partner.capacity.max_group_size_placeholder")}
            disabled={disabled}
          />
          {groupExceedsTotal && (
            <div className="mt-1 text-xs text-red-600">
              {t("partner.capacity.group_exceeds_total")}
            </div>
          )}
        </label>

        <label className="text-sm flex items-center gap-2 mt-2">
          <input
            type="checkbox"
            checked={!!cap.hasPrivateRooms}
            onChange={(e) => update({ hasPrivateRooms: e.target.checked })}
            disabled={disabled}
          />
          <span className="font-medium">{t("partner.capacity.has_private_rooms")}</span>
        </label>

        <label className="text-sm flex items-center gap-2 mt-2">
          <input
            type="checkbox"
            checked={!!cap.hasOutdoorSeating}
            onChange={(e) => update({ hasOutdoorSeating: e.target.checked })}
            disabled={disabled}
          />
          <span className="font-medium">{t("partner.capacity.has_outdoor_seating")}</span>
        </label>

        {cap.hasPrivateRooms && (
          <>
            <label className="text-sm">
              <div className="font-medium mb-1">{t("partner.capacity.private_room_count_label")}</div>
              <input
                inputMode="numeric"
                value={cap.privateRoomCount ?? ""}
                onChange={(e) => update({ privateRoomCount: sanitizeIntStr(e.target.value) })}
                className="w-full border rounded-xl px-3 py-2"
                placeholder={t("partner.capacity.private_room_count_placeholder")}
                disabled={disabled}
              />
            </label>

            <label className="text-sm">
              <div className="font-medium mb-1">{t("partner.capacity.max_private_room_capacity_label")}</div>
              <input
                inputMode="numeric"
                value={cap.maxPrivateRoomCapacity ?? ""}
                onChange={(e) => update({ maxPrivateRoomCapacity: sanitizeIntStr(e.target.value) })}
                className="w-full border rounded-xl px-3 py-2"
                placeholder={t("partner.capacity.max_private_room_capacity_placeholder")}
                disabled={disabled}
              />
            </label>
          </>
        )}
      </div>
    </details>
  );
}
