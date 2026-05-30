import { useTranslation } from "react-i18next";
import { ui } from "../uiTokens";
import { Label } from "../pills";

export default function BlockHeading({ idx, block, isLockedReadOnly, onPatch }) {
  const { t } = useTranslation();
  return (
    <div>
      <Label>Heading</Label>
      <input
        className={ui.input}
        disabled={isLockedReadOnly}
        value={block.text || ""}
        onChange={(e) => onPatch(idx, { text: e.target.value })}
        placeholder={t("admin.place_block_heading_placeholder")}
      />
    </div>
  );
}
