import { useTranslation } from "react-i18next";
import { ui } from "../uiTokens";
import { Label } from "../pills";

export default function BlockMap({ idx, block, isLockedReadOnly, onPatch }) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <div>
        <Label>{t("admin.block_map_longitude")}</Label>
        <input
          type="number"
          inputMode="decimal"
          step="any"
          className={ui.input}
          disabled={isLockedReadOnly}
          value={block.mapLocation?.lon ?? ""}
          onChange={(e) =>
            onPatch(idx, {
              mapLocation: {
                ...(block.mapLocation || {}),
                lon: e.target.value,
              },
            })
          }
        />
      </div>

      <div>
        <Label>{t("admin.block_map_latitude")}</Label>
        <input
          type="number"
          inputMode="decimal"
          step="any"
          className={ui.input}
          disabled={isLockedReadOnly}
          value={block.mapLocation?.lat ?? ""}
          onChange={(e) =>
            onPatch(idx, {
              mapLocation: {
                ...(block.mapLocation || {}),
                lat: e.target.value,
              },
            })
          }
        />
      </div>
    </div>
  );
}
